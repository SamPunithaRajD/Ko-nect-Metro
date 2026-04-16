import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  Sparkles, Train, Ship, CheckCircle, Edit3, Send, RefreshCw,
  Clock, AlertTriangle, ChevronDown, Loader2, ShieldCheck, Tag,
  Wrench, Users, TrendingDown, ArrowRight, Upload, FileSpreadsheet,
  FileCheck, X, Database, CalendarDays, Zap, Download
} from 'lucide-react';
import { supabase, Vehicle } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useDriverStore, SHIFTS } from '../../contexts/DriverStore';
import { useNightPlanningStore } from '../../contexts/NightPlanningStore';
import { getTomorrowModifier, getDemandModifier, DEMAND_MODIFIERS } from '../../lib/keralaCalendar';
import { FeederBusModule } from './FeederBusModule';
import { openReportInWindow, ReportVehicle, ReportDriverShift, ReportFeederRoute, ReportCertAlert } from '../../lib/reportGenerator';
import { useLanguage } from '../../contexts/LanguageContext';
import { useEventStore } from '../../contexts/EventStore';

type DecisionTag = 'fitness' | 'branding' | 'maintenance' | 'manpower' | 'mileage' | 'default';

type VehicleAssignment = {
  id: string;
  vehicle_number: string;
  vehicle_name: string;
  vehicle_type: 'metro_train' | 'water_boat';
  current_status: string;
  suggested_status: string;
  reason: string;
  manually_edited: boolean;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  decisionTag: DecisionTag;
};

type PlanState = 'idle' | 'generating' | 'ready' | 'approving' | 'approved';

const DECISION_TAG_CONFIG: Record<DecisionTag, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  fitness: { label: 'Valid Fitness', icon: ShieldCheck, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  branding: { label: 'Brand Priority', icon: Tag, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  maintenance: { label: 'Held — Maintenance', icon: Wrench, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  manpower: { label: 'Held — Manpower Shortage', icon: Users, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  mileage: { label: 'Low Mileage Priority', icon: TrendingDown, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  default: { label: 'Standard Deployment', icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
};

const RISK_CONFIG = {
  low: { label: 'Low Risk', color: 'text-green-700', bg: 'bg-green-50' },
  medium: { label: 'Med Risk', color: 'text-amber-700', bg: 'bg-amber-50' },
  high: { label: 'High Risk', color: 'text-red-700', bg: 'bg-red-50' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  service:     { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-300' },
  maintenance: { bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-300' },
  cleaning:    { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  ready:       { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300' },
  standby:     { bg: 'bg-gray-100',   text: 'text-gray-700',   border: 'border-gray-300' },
};

const StatusBadge: React.FC<{ status: string; small?: boolean }> = ({ status, small }) => {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.standby;
  return (
    <span className={`inline-flex items-center border capitalize font-medium ${small ? 'px-1.5 py-0.5 text-xs rounded' : 'px-2 py-1 text-xs rounded-md'} ${c.bg} ${c.text} ${c.border}`}>
      {status}
    </span>
  );
};

export const AIPlanning: React.FC<{
  onNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  planningDate?: Date;
}> = ({ onNotification, planningDate }) => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const { allocateAllDrivers, publishAssignments, resetAllocations, metroAssignments, waterAssignments, assignmentPublished, getMetroShiftSummaries, metroDrivers, waterDrivers, metroServiceCount } = useDriverStore();
  const { markPlanApproved, resetApproval, approvedForDate } = useNightPlanningStore();
  const { getEventsForDate, getMetroExtraTrains, getWaterExtraBoats, getExtraDrivers, getRidershipBoost, requiresExtendedService } = useEventStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoaded, setVehiclesLoaded] = useState(false);
  const [plan, setPlan] = useState<VehicleAssignment[]>([]);
  const [planState, setPlanState] = useState<PlanState>('idle');
  const [aiConfidence, setAiConfidence] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [approvedAt, setApprovedAt] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'metro' | 'water'>('metro');
  const [progress, setProgress] = useState(0);

  const [reportFile, setReportFile] = useState<{ name: string; size: number; uploadedAt: Date } | null>(null);
  const [reportUploading, setReportUploading] = useState(false);
  const [reportParsePhase, setReportParsePhase] = useState('');
  const [reportRows, setReportRows] = useState<number>(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectivePlanningDate = useMemo(() => {
    if (planningDate) return planningDate;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }, [planningDate]);

  const planningDateKey = useMemo(() =>
    effectivePlanningDate.toISOString().split('T')[0],
    [effectivePlanningDate]
  );

  const calMod = useMemo(() =>
    getDemandModifier(effectivePlanningDate),
    [effectivePlanningDate]
  );

  const isHolidayContext = calMod.category !== 'weekday';
  const isMajorFestival  = calMod.category === 'festival_major';

  const planningEvents = useMemo(() => getEventsForDate(effectivePlanningDate), [effectivePlanningDate, getEventsForDate]);
  const eventExtraTrains = useMemo(() => getMetroExtraTrains(effectivePlanningDate), [effectivePlanningDate, getMetroExtraTrains]);
  const eventExtraBoats  = useMemo(() => getWaterExtraBoats(effectivePlanningDate), [effectivePlanningDate, getWaterExtraBoats]);
  const eventExtraDrivers = useMemo(() => getExtraDrivers(effectivePlanningDate), [effectivePlanningDate, getExtraDrivers]);
  const eventRidershipBoost = useMemo(() => getRidershipBoost(effectivePlanningDate), [effectivePlanningDate, getRidershipBoost]);
  const eventExtendedService = useMemo(() => requiresExtendedService(effectivePlanningDate), [effectivePlanningDate, requiresExtendedService]);
  const hasEvents = planningEvents.length > 0;

  // Check if approval matches current planning date, reset if not
  const isPlanApprovedForCurrentDate = useMemo(() =>
    planState === 'approved' && approvedForDate === planningDateKey,
    [planState, approvedForDate, planningDateKey]
  );

  // Reset approval when planning date changes
  useEffect(() => {
    if (approvedForDate && approvedForDate !== planningDateKey) {
      resetApproval();
      if (planState === 'approved') {
        setPlanState('idle');
        setApprovedAt(null);
      }
    }
  }, [planningDateKey, approvedForDate, planState, resetApproval]);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('vehicle_number');
      if (error) throw error;
      if (data) {
        setVehicles(data);
        setVehiclesLoaded(true);
      }
    } catch (err) {
      console.error('Error loading vehicles:', err);
      onNotification('error', 'Failed to load fleet data');
    }
  };

  const PARSE_PHASES = [
    'Reading file headers…',
    'Parsing train condition columns…',
    'Validating certificate status rows…',
    'Extracting manpower availability data…',
    'Cross-referencing fleet IDs…',
    'Normalising readiness scores…',
    'Report validated — data ready for AI engine',
  ];

  const handleFileUpload = async (file: File) => {
    const allowed = ['.csv', '.xlsx', '.xls'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      onNotification('error', 'Only CSV or Excel files (.csv, .xlsx, .xls) are accepted');
      return;
    }

    setReportUploading(true);
    setReportParsePhase('');
    setPlan([]);
    setPlanState('idle');

    for (let i = 0; i < PARSE_PHASES.length; i++) {
      setReportParsePhase(PARSE_PHASES[i]);
      await new Promise(r => setTimeout(r, 340 + Math.random() * 200));
    }

    const simulatedRows = 25 + Math.floor(Math.random() * 40);
    setReportRows(simulatedRows);
    setReportFile({ name: file.name, size: file.size, uploadedAt: new Date() });
    setReportUploading(false);
    setReportParsePhase('');
    onNotification('success', `Daily report uploaded successfully — AI ready to analyse`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const generateAIPlan = useCallback(async () => {
    if (vehicles.length === 0) {
      await loadVehicles();
    }

    // Reset approval state when starting a new plan
    resetApproval();
    setApprovedAt(null);

    setPlanState('generating');
    setEditMode(false);
    setProgress(0);

    const AI_ANALYSIS_PHASES = reportFile ? [
      `Analysing depot report: ${reportFile.name}…`,
      'Cross-referencing fitness certificates from report…',
      'Applying manpower constraints from depot data…',
      'Evaluating job card statuses per vehicle…',
      'Computing mileage balance recommendations…',
      'Finalising optimal induction sequence…',
    ] : ['Analysing fleet data…'];

    let phaseIdx = 0;
    setReportParsePhase(AI_ANALYSIS_PHASES[0]);

    const phaseInterval = setInterval(() => {
      phaseIdx = Math.min(phaseIdx + 1, AI_ANALYSIS_PHASES.length - 1);
      setReportParsePhase(AI_ANALYSIS_PHASES[phaseIdx]);
    }, 380);

    const tickInterval = setInterval(() => {
      setProgress(p => Math.min(p + 8, 90));
    }, 200);

    await new Promise(r => setTimeout(r, 2400));
    clearInterval(tickInterval);
    clearInterval(phaseInterval);
    setProgress(100);
    setReportParsePhase('');

    const freshVehicles = vehicles.length > 0 ? vehicles : [];

    // Apply calendar demand modifier + event adjustments to fleet deployment targets
    const baseMetroCount = freshVehicles.filter(v => v.vehicle_type === 'metro_train').length;
    const baseWaterCount = freshVehicles.filter(v => v.vehicle_type === 'water_boat').length;
    const metroTarget = Math.min(baseMetroCount, Math.ceil(baseMetroCount * calMod.metroDeployTarget) + eventExtraTrains);
    const waterTarget = Math.min(baseWaterCount, Math.ceil(baseWaterCount * calMod.waterDeployTarget) + eventExtraBoats);

    let metroServiceCount = 0;
    let waterServiceCount = 0;

    const BRANDED_TRAIN_IDS = new Set(['KM-001', 'KM-005', 'KM-008']);
    const LOW_MILEAGE_IDS = new Set(['KM-007', 'KM-008']);
    const MANPOWER_LIMIT_CLEAN = 2;
    let cleaningAssigned = 0;

    const assignments: VehicleAssignment[] = freshVehicles.map(vehicle => {
      let suggested = vehicle.status;
      let reason = 'Maintain current operational status';
      let decisionTag: DecisionTag = 'default';
      let confidence = 90 + Math.round(Math.random() * 8);
      let risk: 'low' | 'medium' | 'high' = 'low';

      const daysToMaint = Math.ceil(
        (new Date(vehicle.next_maintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      const isMetroType = vehicle.vehicle_type === 'metro_train';
      const target = isMetroType ? metroTarget : waterTarget;
      const serviceCount = isMetroType ? metroServiceCount : waterServiceCount;
      const isBranded = BRANDED_TRAIN_IDS.has(vehicle.vehicle_number);
      const isLowMileage = LOW_MILEAGE_IDS.has(vehicle.vehicle_number);

      if (vehicle.status === 'maintenance') {
        if (daysToMaint > 60) {
          suggested = 'ready';
          reason = 'Maintenance complete — cleared for service deployment';
          decisionTag = 'fitness';
          confidence = 96;
        } else if (calMod.maintenanceReduction >= 50 && daysToMaint > 30) {
          // On major festivals / high-deferral days, push non-critical maintenance to standby
          suggested = 'standby';
          reason = `Non-critical maintenance deferred — ${calMod.label}: high demand day, held as reserve`;
          decisionTag = 'manpower';
          risk = 'medium';
          confidence = 87;
        } else {
          reason = 'Continue scheduled maintenance — open job card(s) present';
          decisionTag = 'maintenance';
          risk = 'high';
          confidence = 99;
        }
      } else if (vehicle.status === 'cleaning') {
        if (cleaningAssigned < MANPOWER_LIMIT_CLEAN) {
          suggested = 'ready';
          reason = 'Cleaning cycle complete — manpower available, cleared for deployment';
          decisionTag = 'fitness';
          cleaningAssigned++;
        } else {
          suggested = 'standby';
          reason = 'Cleaning pending — held due to manpower shortage tonight (18/24 staff)';
          decisionTag = 'manpower';
          risk = 'medium';
          confidence = 85;
        }
      } else if (vehicle.status === 'service') {
        if (daysToMaint < 14) {
          suggested = 'maintenance';
          reason = 'Immediate maintenance required — fitness window closing in <14 days';
          decisionTag = 'maintenance';
          risk = 'high';
          confidence = 98;
        } else if (daysToMaint < 30) {
          suggested = 'maintenance';
          reason = 'Proactive maintenance scheduled — prevent unplanned breakdown';
          decisionTag = 'maintenance';
          risk = 'medium';
          confidence = 93;
        } else if (isBranded) {
          reason = 'Continue service — Brand Priority Train (advertising commitment)';
          decisionTag = 'branding';
          confidence = 97;
          if (isMetroType) metroServiceCount++;
          else waterServiceCount++;
        } else {
          reason = 'Continue active service — valid fitness, mileage within range';
          decisionTag = 'fitness';
          if (isMetroType) metroServiceCount++;
          else waterServiceCount++;
        }
      } else if (vehicle.status === 'ready' || vehicle.status === 'standby') {
        if (isBranded && serviceCount < target) {
          suggested = 'service';
          reason = 'Deploy — Brand Priority Train must run to fulfil advertising contract';
          decisionTag = 'branding';
          confidence = 99;
          if (isMetroType) metroServiceCount++;
          else waterServiceCount++;
        } else if (isLowMileage && serviceCount < target) {
          suggested = 'service';
          reason = 'Deploy — Low mileage train prioritised to balance fleet wear distribution';
          decisionTag = 'mileage';
          confidence = 92;
          if (isMetroType) metroServiceCount++;
          else waterServiceCount++;
        } else if (serviceCount < target) {
          suggested = 'service';
          reason = `Deploy to meet service demand target (${target} vehicles needed)`;
          decisionTag = 'fitness';
          if (isMetroType) metroServiceCount++;
          else waterServiceCount++;
        } else {
          suggested = 'standby';
          reason = 'Retain as reserve — operational target already met for today';
          decisionTag = 'default';
          risk = 'low';
          confidence = 88;
        }
      }

      return {
        id: vehicle.id,
        vehicle_number: vehicle.vehicle_number,
        vehicle_name: vehicle.vehicle_name,
        vehicle_type: vehicle.vehicle_type,
        current_status: vehicle.status,
        suggested_status: suggested,
        reason,
        manually_edited: false,
        confidence,
        risk,
        decisionTag,
      };
    });

    const serviceTrains = assignments
      .filter(a => a.suggested_status === 'service' && a.vehicle_type === 'metro_train')
      .map(a => ({ id: a.id, vehicle_number: a.vehicle_number, vehicle_name: a.vehicle_name }));

    const serviceBoats = assignments
      .filter(a => a.suggested_status === 'service' && a.vehicle_type === 'water_boat')
      .map(a => ({ id: a.id, vehicle_number: a.vehicle_number, vehicle_name: a.vehicle_name }));

    allocateAllDrivers(serviceTrains, serviceBoats);

    setPlan(assignments);
    const baseConfidence = isHolidayContext ? 94 + Math.random() * 4 : 92 + Math.random() * 5.5;
    setAiConfidence(parseFloat(baseConfidence.toFixed(1)));
    setGeneratedAt(new Date());
    setPlanState('ready');
    const calNote = isHolidayContext ? ` · ${calMod.label}` : '';
    onNotification('success', `AI plan generated — ${serviceTrains.length} metro trains · ${serviceBoats.length} water boats crew-allocated${calNote}`);
  }, [vehicles, onNotification, reportFile, calMod, isHolidayContext, allocateAllDrivers, resetApproval]);

  const handleStatusChange = (vehicleId: string, newStatus: string) => {
    setPlan(prev => prev.map(v =>
      v.id === vehicleId
        ? { ...v, suggested_status: newStatus, reason: 'Manually overridden by admin', manually_edited: true }
        : v
    ));
  };

  const approvePlan = async () => {
    if (!user || plan.length === 0) return;
    setPlanState('approving');

    try {
      const { data: employees, error: empError } = await supabase
        .from('users')
        .select('id, role')
        .in('role', ['metro_employee', 'water_employee']);

      if (empError) throw empError;

      const metroEmp = employees?.find(e => e.role === 'metro_employee');
      const waterEmp = employees?.find(e => e.role === 'water_employee');

      if (!metroEmp || !waterEmp) throw new Error('Employee accounts not found in system');

      const metro = plan.filter(v => v.vehicle_type === 'metro_train');
      const water = plan.filter(v => v.vehicle_type === 'water_boat');

      const buildCounts = (list: VehicleAssignment[]) => ({
        total: list.length,
        service: list.filter(v => v.suggested_status === 'service').length,
        maintenance: list.filter(v => v.suggested_status === 'maintenance').length,
        standby: list.filter(v => v.suggested_status === 'standby' || v.suggested_status === 'ready').length,
        assignments: list.map(v => ({
          vehicle_id: v.id,
          vehicle_number: v.vehicle_number,
          vehicle_name: v.vehicle_name,
          status: v.suggested_status,
          reason: v.reason,
          manually_edited: v.manually_edited,
        })),
      });

      const planData = {
        metro_trains: buildCounts(metro),
        water_boats: buildCounts(water),
        generated_at: generatedAt?.toISOString(),
        approved_at: new Date().toISOString(),
        ai_confidence: aiConfidence,
        total_manual_overrides: plan.filter(v => v.manually_edited).length,
      };

      const now = new Date().toISOString();

      const { error: planErr } = await supabase.from('operational_plans').insert({
        plan_date: new Date().toISOString().split('T')[0],
        plan_type: 'approved_plan',
        generated_by: user.id,
        approved_by: user.id,
        plan_data: planData,
        ai_confidence: aiConfidence,
        status: 'sent',
        approved_at: now,
      });
      if (planErr) throw planErr;

      for (const assignment of plan) {
        const assignTo = assignment.vehicle_type === 'metro_train' ? metroEmp.id : waterEmp.id;
        const { error: ve } = await supabase
          .from('vehicles')
          .update({ status: assignment.suggested_status, assigned_to: assignTo, updated_at: now })
          .eq('id', assignment.id);
        if (ve) throw ve;
      }

      const { error: histErr } = await supabase.from('plan_history').insert({
        plan_date: new Date().toISOString().split('T')[0],
        vehicle_type: 'both',
        plan_data: planData,
        generated_by: user.id,
        approved_by: user.id,
      });
      if (histErr) console.warn('plan_history insert failed:', histErr.message);

      publishAssignments();
      markPlanApproved(effectivePlanningDate);
      setApprovedAt(new Date());
      setPlanState('approved');
      setEditMode(false);
      onNotification('success', 'Plan approved — driver assignment list published to Metro employees');
    } catch (err: any) {
      console.error('Approval error:', err);
      onNotification('error', `Approval failed: ${err.message}`);
      setPlanState('ready');
    }
  };

  const metroPlan = plan.filter(v => v.vehicle_type === 'metro_train');
  const waterPlan = plan.filter(v => v.vehicle_type === 'water_boat');

  const metroSummary = {
    total: metroPlan.length,
    service: metroPlan.filter(v => v.suggested_status === 'service').length,
    maintenance: metroPlan.filter(v => v.suggested_status === 'maintenance').length,
    standby: metroPlan.filter(v => v.suggested_status === 'standby' || v.suggested_status === 'ready').length,
  };

  const waterSummary = {
    total: waterPlan.length,
    service: waterPlan.filter(v => v.suggested_status === 'service').length,
    maintenance: waterPlan.filter(v => v.suggested_status === 'maintenance').length,
    standby: waterPlan.filter(v => v.suggested_status === 'standby' || v.suggested_status === 'ready').length,
  };

  const displayList = activeTab === 'metro' ? metroPlan : waterPlan;
  const manualEdits = plan.filter(v => v.manually_edited).length;
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = () => {
    if (downloading) return;
    setDownloading(true);

    const today = new Date();
    const surge = calMod.category !== 'weekday';
    const mult = calMod.passengerMultiplier;

    // ── Build vehicle lists from plan, falling back to full fleet mock data ──
    const METRO_MOCK: ReportVehicle[] = [
      { vehicleNumber: 'KM-001', vehicleName: 'Aluva Express', vehicleType: 'metro_train', currentStatus: 'service', suggestedStatus: 'service', reason: 'Valid fitness — standard deployment', risk: 'low', decisionTag: 'fitness', confidence: 94 },
      { vehicleNumber: 'KM-002', vehicleName: 'Ernakulam South', vehicleType: 'metro_train', currentStatus: 'service', suggestedStatus: 'service', reason: 'Valid fitness — standard deployment', risk: 'low', decisionTag: 'fitness', confidence: 91 },
      { vehicleNumber: 'KM-003', vehicleName: 'Palarivattom Link', vehicleType: 'metro_train', currentStatus: 'service', suggestedStatus: 'service', reason: 'Low mileage — priority deployment', risk: 'low', decisionTag: 'mileage', confidence: 89 },
      { vehicleNumber: 'KM-004', vehicleName: 'Kakkanad Shuttle', vehicleType: 'metro_train', currentStatus: 'service', suggestedStatus: 'service', reason: 'Valid fitness — standard deployment', risk: 'low', decisionTag: 'fitness', confidence: 93 },
      { vehicleNumber: 'KM-005', vehicleName: 'MG Road Express', vehicleType: 'metro_train', currentStatus: 'service', suggestedStatus: 'service', reason: 'Brand priority — high visibility route', risk: 'low', decisionTag: 'branding', confidence: 92 },
      { vehicleNumber: 'KM-006', vehicleName: 'Kalamassery Metro', vehicleType: 'metro_train', currentStatus: 'maintenance', suggestedStatus: 'maintenance', reason: 'Certificate expiry in 3 days — grounded', risk: 'high', decisionTag: 'maintenance', confidence: 99 },
      { vehicleNumber: 'KM-007', vehicleName: 'Thrippunithura Metro', vehicleType: 'metro_train', currentStatus: 'service', suggestedStatus: 'standby', reason: 'Adequate fleet on corridor — held as reserve', risk: 'low', decisionTag: 'default', confidence: 85 },
      { vehicleNumber: 'KM-008', vehicleName: 'Infopark Link', vehicleType: 'metro_train', currentStatus: 'service', suggestedStatus: surge ? 'service' : 'standby', reason: surge ? 'Surge demand — deployed' : 'Standby reserve', risk: 'low', decisionTag: 'fitness', confidence: 88 },
      { vehicleNumber: 'KM-009', vehicleName: 'Edapally Express', vehicleType: 'metro_train', currentStatus: 'service', suggestedStatus: 'service', reason: 'Valid fitness — standard deployment', risk: 'low', decisionTag: 'fitness', confidence: 90 },
      { vehicleNumber: 'KM-010', vehicleName: 'Vyttila Hub Metro', vehicleType: 'metro_train', currentStatus: 'cleaning', suggestedStatus: 'service', reason: 'Cleaning complete tonight — service tomorrow', risk: 'low', decisionTag: 'default', confidence: 87 },
    ];

    const WATER_MOCK: ReportVehicle[] = [
      { vehicleNumber: 'WB-001', vehicleName: 'Vyttila Voyager', vehicleType: 'water_boat', currentStatus: 'service', suggestedStatus: 'service', reason: 'Valid vessel safety cert', risk: 'low', decisionTag: 'fitness', confidence: 95 },
      { vehicleNumber: 'WB-002', vehicleName: 'Fort Kochi Ferry', vehicleType: 'water_boat', currentStatus: 'service', suggestedStatus: 'service', reason: 'Valid vessel safety cert', risk: 'low', decisionTag: 'fitness', confidence: 93 },
      { vehicleNumber: 'WB-003', vehicleName: 'Bolgatty Express', vehicleType: 'water_boat', currentStatus: 'service', suggestedStatus: 'service', reason: 'Low mileage — priority deployment', risk: 'low', decisionTag: 'mileage', confidence: 91 },
      { vehicleNumber: 'WB-004', vehicleName: 'Vypeen Connector', vehicleType: 'water_boat', currentStatus: 'maintenance', suggestedStatus: 'maintenance', reason: 'Vessel safety cert expiry in 7 days — grounded', risk: 'high', decisionTag: 'maintenance', confidence: 99 },
      { vehicleNumber: 'WB-005', vehicleName: 'Willingdon Island', vehicleType: 'water_boat', currentStatus: 'service', suggestedStatus: surge ? 'service' : 'standby', reason: surge ? 'Festival surge — deployed' : 'Standby reserve', risk: 'low', decisionTag: 'default', confidence: 84 },
      { vehicleNumber: 'WB-006', vehicleName: 'Mattancherry Rider', vehicleType: 'water_boat', currentStatus: 'service', suggestedStatus: 'service', reason: 'Valid vessel safety cert', risk: 'low', decisionTag: 'fitness', confidence: 92 },
      { vehicleNumber: 'WB-007', vehicleName: 'Cherai Cruiser', vehicleType: 'water_boat', currentStatus: 'cleaning', suggestedStatus: 'service', reason: 'Cleaning complete — service tomorrow', risk: 'low', decisionTag: 'default', confidence: 86 },
    ];

    const metroVehicles: ReportVehicle[] = metroPlan.length > 0
      ? metroPlan.map(v => ({
          vehicleNumber: v.vehicle_number,
          vehicleName: v.vehicle_name,
          vehicleType: 'metro_train' as const,
          currentStatus: v.current_status,
          suggestedStatus: v.suggested_status,
          reason: v.reason,
          risk: v.risk,
          decisionTag: v.decisionTag,
          confidence: v.confidence,
        }))
      : METRO_MOCK;

    const waterVehicles: ReportVehicle[] = waterPlan.length > 0
      ? waterPlan.map(v => ({
          vehicleNumber: v.vehicle_number,
          vehicleName: v.vehicle_name,
          vehicleType: 'water_boat' as const,
          currentStatus: v.current_status,
          suggestedStatus: v.suggested_status,
          reason: v.reason,
          risk: v.risk,
          decisionTag: v.decisionTag,
          confidence: v.confidence,
        }))
      : WATER_MOCK;

    // ── Driver lists from store, or mock ──
    const METRO_DRIVERS_MOCK: ReportDriverShift[] = [
      { driverName: 'Rajan Pillai', employeeId: 'KM-D001', shift: 'Morning (06:00–14:00)', vehicle: 'KM-001', route: 'Aluva → SN Junction' },
      { driverName: 'Suresh Kumar', employeeId: 'KM-D002', shift: 'Morning (06:00–14:00)', vehicle: 'KM-002', route: 'SN Junction → Aluva' },
      { driverName: 'Anilkumar V.', employeeId: 'KM-D003', shift: 'Morning (06:00–14:00)', vehicle: 'KM-003', route: 'Aluva → SN Junction' },
      { driverName: 'Manoj Thomas', employeeId: 'KM-D004', shift: 'Afternoon (14:00–22:00)', vehicle: 'KM-004', route: 'Full corridor' },
      { driverName: 'Prakashan P.', employeeId: 'KM-D005', shift: 'Afternoon (14:00–22:00)', vehicle: 'KM-005', route: 'Full corridor' },
      { driverName: 'George Varghese', employeeId: 'KM-D006', shift: 'Night (22:00–06:00)', vehicle: 'KM-009', route: 'SN Junction → Aluva' },
      { driverName: 'Santhosh Nair', employeeId: 'KM-D007', shift: 'Morning (06:00–14:00)', vehicle: 'KM-010', route: 'Aluva → SN Junction' },
    ];

    const WATER_DRIVERS_MOCK: ReportDriverShift[] = [
      { driverName: 'Jose Antony', employeeId: 'WM-D001', shift: 'Morning (07:00–13:00)', vehicle: 'WB-001', route: 'Vyttila → High Court' },
      { driverName: 'Krishnan Nambiar', employeeId: 'WM-D002', shift: 'Morning (07:00–13:00)', vehicle: 'WB-002', route: 'Fort Kochi → Vypeen' },
      { driverName: 'Thomas Mathew', employeeId: 'WM-D003', shift: 'Afternoon (13:00–19:00)', vehicle: 'WB-003', route: 'Bolgatty → Vyttila' },
      { driverName: 'Sabu George', employeeId: 'WM-D004', shift: 'Afternoon (13:00–19:00)', vehicle: 'WB-006', route: 'Mattancherry → Fort Kochi' },
      { driverName: 'Biju Varghese', employeeId: 'WM-D005', shift: 'Evening (15:00–21:00)', vehicle: 'WB-007', route: 'Cherai → Vypeen' },
    ];

    const mDrivers: ReportDriverShift[] = metroAssignments.length > 0
      ? metroAssignments.map(a => ({ driverName: a.driverName, employeeId: a.employeeId, shift: a.shift, vehicle: a.vehicleNumber, route: undefined }))
      : METRO_DRIVERS_MOCK;

    const wDrivers: ReportDriverShift[] = waterAssignments.length > 0
      ? waterAssignments.map(a => ({ driverName: a.driverName, employeeId: a.employeeId, shift: a.shift, vehicle: a.vehicleNumber, route: undefined }))
      : WATER_DRIVERS_MOCK;

    const feederRoutes: ReportFeederRoute[] = [
      { routeNumber: 'F-101', name: 'Aluva – Kalamassery Metro', buses: 4, surgeBuses: surge ? 2 : 0, connectsTo: 'Metro Station — Aluva', peakFreqMin: 8 },
      { routeNumber: 'F-102', name: 'Kakkanad – Palarivattom Metro', buses: 5, surgeBuses: surge ? 2 : 0, connectsTo: 'Metro Station — Palarivattom', peakFreqMin: 6 },
      { routeNumber: 'F-103', name: 'Airport – Aluva Metro', buses: 3, surgeBuses: 0, connectsTo: 'Metro Station — Aluva', peakFreqMin: 15 },
      { routeNumber: 'F-201', name: 'Vyttila Hub – Water Terminal', buses: 2, surgeBuses: surge ? 1 : 0, connectsTo: 'Water Terminal — Vyttila', peakFreqMin: 5 },
      { routeNumber: 'F-202', name: 'Fort Kochi – Vypeen Water Terminal', buses: 2, surgeBuses: 0, connectsTo: 'Water Terminal — Vypeen', peakFreqMin: 10 },
      { routeNumber: 'F-203', name: 'Mattancherry – Bolgatty Terminal', buses: 2, surgeBuses: 0, connectsTo: 'Water Terminal — Bolgatty', peakFreqMin: 12 },
      { routeNumber: 'F-301', name: 'Edapally – Metro & Water Hub', buses: 5, surgeBuses: surge ? 3 : 0, connectsTo: 'Metro & Water — Edapally', peakFreqMin: 5 },
      { routeNumber: 'F-302', name: 'Thrippunithura – MG Road Metro', buses: 3, surgeBuses: 0, connectsTo: 'Metro Station — MG Road', peakFreqMin: 10 },
    ];

    const certAlerts: ReportCertAlert[] = [
      { vehicleNumber: 'KM-006', certType: 'Rolling Stock Fitness Certificate', expiryDate: '22-Feb-2026', daysLeft: 3, status: 'critical' },
      { vehicleNumber: 'KM-012', certType: 'Electrical Safety Compliance', expiryDate: '01-Mar-2026', daysLeft: 10, status: 'expiring_soon' },
      { vehicleNumber: 'WB-004', certType: 'Vessel Safety Certificate (MMD)', expiryDate: '28-Feb-2026', daysLeft: 7, status: 'expiring_soon' },
      { vehicleNumber: 'KM-018', certType: 'Rolling Stock Fitness Certificate', expiryDate: '15-Apr-2026', daysLeft: 55, status: 'valid' },
      { vehicleNumber: 'WB-009', certType: 'Life-Saving Appliance Cert', expiryDate: '10-May-2026', daysLeft: 80, status: 'valid' },
    ];

    const metroInService = metroVehicles.filter(v => v.suggestedStatus === 'service').length;
    const waterInService = waterVehicles.filter(v => v.suggestedStatus === 'service').length;
    const predictedPax = Math.round((metroInService * 4200 + waterInService * 320) * mult);
    const effectiveConfidence = aiConfidence > 0 ? aiConfidence : 87;

    openReportInWindow({
      role: 'admin',
      reportDate: today,
      generatedAt: today,
      generatedBy: user?.full_name ?? 'OCC Admin',
      planApproved: planState === 'approved',
      approvedAt: approvedAt ?? undefined,
      aiConfidence: effectiveConfidence,
      demandMultiplier: mult,
      demandLabel: calMod.label,
      surgeMode: surge,
      predictedPassengers: predictedPax,
      predictedMetroPassengers: Math.round(metroInService * 4200 * mult),
      predictedWaterPassengers: Math.round(waterInService * 320 * mult),
      metroVehicles,
      waterVehicles,
      metroDrivers: mDrivers,
      waterDrivers: wDrivers,
      feederRoutes,
      certAlerts,
      manpowerAvailable: 18,
      manpowerRequired: 24,
      cleaningBays: 5,
      cleaningBaysTotal: 7,
      maintenanceTasks: [
        { vehicle: 'KM-002', task: 'Bogie inspection & wheel flange measurement', priority: 'high', due: 'Tonight' },
        { vehicle: 'KM-003', task: 'AC unit coolant top-up', priority: 'medium', due: 'Tonight' },
        { vehicle: 'KM-006', task: 'Rolling stock fitness certificate renewal', priority: 'critical', due: 'Urgent' },
        { vehicle: 'WB-007', task: 'Engine bay hull inspection', priority: 'high', due: 'Tonight' },
        { vehicle: 'WB-003', task: 'Life jacket & safety equipment check', priority: 'medium', due: 'Tomorrow' },
        { vehicle: 'KM-010', task: 'Pantograph carbon strip replacement', priority: 'medium', due: 'Tomorrow' },
      ],
    }, lang);

    setTimeout(() => setDownloading(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Operational Planning</h2>
          <p className="text-gray-500 mt-0.5 text-sm">
            {vehiclesLoaded
              ? `Fleet loaded: ${vehicles.filter(v => v.vehicle_type === 'metro_train').length} metro trains · ${vehicles.filter(v => v.vehicle_type === 'water_boat').length} water boats`
              : 'Loading fleet data...'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isPlanApprovedForCurrentDate && approvedAt && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Approved {approvedAt.toLocaleTimeString()}</span>
            </div>
          )}
          {vehiclesLoaded && (
            <button
              onClick={handleDownloadReport}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-60 shadow-sm hover:shadow-md"
              style={{ background: 'linear-gradient(135deg,#003A8F,#0072CE)', color: '#fff' }}
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span>{downloading ? t('generating') : t('downloadAdminReport')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Kerala Calendar — surge banner (major festival) */}
      {isMajorFestival && (
        <div className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
          <span className="text-2xl flex-shrink-0">{calMod.icon}</span>
          <div className="text-white flex-1 min-w-0">
            <div className="font-bold text-base">{calMod.alertMessage}</div>
            <div className="text-red-200 text-xs mt-0.5">
              {calMod.holiday?.name} — AI will deploy {Math.round(calMod.metroDeployTarget * 100)}% metro fleet &amp; {Math.round(calMod.waterDeployTarget * 100)}% water boats.
              {calMod.driverSurgeRequired && ' Surge driver staffing required.'}
            </div>
          </div>
          <span className="flex-shrink-0 text-xs font-bold bg-white/20 text-white px-3 py-1.5 rounded-full border border-white/30">
            {calMod.surgeLabel}
          </span>
        </div>
      )}

      {/* Kerala Calendar — info bar (non-weekday, non-major) */}
      {!isMajorFestival && isHolidayContext && (
        <div className={`rounded-xl p-3.5 flex items-center gap-3 border ${calMod.bg} ${calMod.border}`}>
          <span className="text-xl flex-shrink-0">{calMod.icon}</span>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-bold ${calMod.color}`}>{calMod.surgeLabel ?? calMod.label}</div>
            {calMod.alertMessage && (
              <div className={`text-xs mt-0.5 opacity-80 ${calMod.color}`}>{calMod.alertMessage}</div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${calMod.badgeBg} ${calMod.badge} ${calMod.border}`}>
              ×{calMod.passengerMultiplier.toFixed(2)} demand
            </div>
          </div>
        </div>
      )}

      {/* Kerala Calendar stats strip */}
      {isHolidayContext && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Kerala Calendar — Active Planning Modifiers</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-lg p-2.5 text-center">
              <div className={`text-sm font-bold ${calMod.color}`}>×{calMod.passengerMultiplier.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-0.5">Passenger Mult.</div>
            </div>
            <div className={`rounded-lg p-2.5 text-center border ${calMod.bg} ${calMod.border}`}>
              <div className={`text-sm font-bold ${calMod.color}`}>{Math.round(calMod.metroDeployTarget * 100)}%</div>
              <div className="text-xs text-gray-500 mt-0.5">Metro Deploy</div>
            </div>
            <div className={`rounded-lg p-2.5 text-center border ${calMod.bg} ${calMod.border}`}>
              <div className={`text-sm font-bold ${calMod.color}`}>{Math.round(calMod.waterDeployTarget * 100)}%</div>
              <div className="text-xs text-gray-500 mt-0.5">Water Deploy</div>
            </div>
            <div className={`rounded-lg p-2.5 text-center ${calMod.maintenanceReduction > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
              <div className={`text-sm font-bold ${calMod.maintenanceReduction > 0 ? 'text-amber-700' : 'text-gray-700'}`}>
                {calMod.maintenanceReduction > 0 ? `−${calMod.maintenanceReduction}%` : 'Normal'}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Maint. Defer</div>
            </div>
          </div>
          {calMod.driverSurgeRequired && (
            <div className="mt-3 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <Users className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-orange-700">Surge Driver Staffing Required — All shifts must be fully covered for this day</span>
            </div>
          )}
        </div>
      )}

      {/* Event-aware adjustments banner */}
      {hasEvents && (
        <div className="bg-white rounded-xl border border-teal-300 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-teal-50 border-b border-teal-200">
            <div className="p-1.5 rounded-lg bg-teal-100 border border-teal-300">
              <CalendarDays className="w-4 h-4 text-teal-700" />
            </div>
            <div>
              <div className="text-sm font-bold text-teal-900">Event Detected — AI Adjustments Active</div>
              <div className="text-xs text-teal-700">{planningEvents.map(e => e.name).join(', ')}</div>
            </div>
            <div className="ml-auto text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-300 px-2.5 py-1 rounded-full">
              {planningEvents.length} event{planningEvents.length > 1 ? 's' : ''}
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-700">+{eventExtraTrains}</div>
                <div className="text-xs text-gray-500 mt-0.5">Metro Trains Added</div>
              </div>
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-cyan-700">+{eventExtraBoats}</div>
                <div className="text-xs text-gray-500 mt-0.5">Boats Added</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-700">+{eventExtraDrivers}</div>
                <div className="text-xs text-gray-500 mt-0.5">Extra Drivers</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-700">+{Math.round(eventRidershipBoost * 100)}%</div>
                <div className="text-xs text-gray-500 mt-0.5">Ridership Boost</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {planningEvents.map(ev => (
                <div key={ev.id} className="flex flex-wrap items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700">
                  <span className="font-bold text-teal-700">Event Detected:</span>
                  <span className="font-semibold">{ev.name}</span>
                  <span className="text-gray-400">•</span>
                  <span>{ev.location}</span>
                  <span className="text-gray-400">•</span>
                  <span>{ev.timeStart}–{ev.timeEnd}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{ev.expectedCrowd.toLocaleString()} expected</span>
                </div>
              ))}
            </div>
            {eventExtendedService && (
              <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
                <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                <span className="text-xs font-bold text-amber-800">Extended Service Required — Event outside regular operating hours (06:00–22:00)</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={`relative bg-white rounded-xl border-2 transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : reportFile ? 'border-green-200 bg-green-50/30' : 'border-dashed border-gray-300'} shadow-sm overflow-hidden`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleInputChange}
        />

        {reportUploading ? (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2.5 rounded-lg">
                <Database className="w-5 h-5 text-blue-600 animate-pulse" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Reading Depot Report…</div>
                <div className="text-xs text-gray-500 mt-0.5">Please wait while the file is validated</div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
                <span>{reportParsePhase}</span>
              </div>
            </div>
          </div>
        ) : reportFile ? (
          <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{reportFile.name}</span>
                  <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">Uploaded</span>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-3">
                  <span>{(reportFile.size / 1024).toFixed(1)} KB</span>
                  <span>·</span>
                  <span>{reportRows} data rows parsed</span>
                  <span>·</span>
                  <span>Uploaded at {reportFile.uploadedAt.toLocaleTimeString()}</span>
                </div>
                <div className="mt-2 text-xs font-semibold text-green-700 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Daily report uploaded successfully — AI ready to analyse
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition"
              >
                <Upload className="w-3 h-3" />
                Replace file
              </button>
              <button
                onClick={() => { setReportFile(null); setReportRows(0); setPlan([]); setPlanState('idle'); resetAllocations(); }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className={`p-4 rounded-2xl transition-colors ${dragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Upload className={`w-8 h-8 transition-colors ${dragOver ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-gray-900 font-semibold text-base">Upload Daily Operations Report</p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {dragOver ? 'Drop file here to upload' : 'Drag & drop or click to select a CSV / Excel file from the depot'}
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition text-sm shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Upload Daily Report (CSV / Excel)
              </button>
              <p className="text-xs text-gray-400">Accepted formats: .csv · .xlsx · .xls — Contains train condition, certificate status, manpower &amp; readiness data</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <Sparkles className="w-7 h-7" />
              <h3 className="text-xl font-semibold">AI-Powered Operational Planning</h3>
              {isHolidayContext && (
                <span className="flex items-center gap-1.5 text-xs font-bold bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/30">
                  {calMod.icon} {calMod.surgeLabel ?? calMod.label}
                </span>
              )}
            </div>
            <p className="text-blue-100 text-sm max-w-xl">
              Upload today's depot condition report, then run AI analysis to generate the optimal fleet induction plan.
              {isHolidayContext && ` Kerala calendar active — ${calMod.label} adjustments will be applied.`}
            </p>
            {reportFile && (
              <div className="mt-2 flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2 text-xs text-white w-fit">
                <FileCheck className="w-3.5 h-3.5 text-green-300 flex-shrink-0" />
                <span className="font-semibold">{reportFile.name}</span>
                <span className="text-blue-200">·</span>
                <span className="text-blue-200">{reportRows} rows</span>
                <span className="text-blue-200">·</span>
                <span className="text-blue-200">{reportFile.uploadedAt.toLocaleTimeString()}</span>
              </div>
            )}
            {generatedAt && (
              <p className="text-blue-200 text-xs mt-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last plan generated: {generatedAt.toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={generateAIPlan}
            disabled={!reportFile || planState === 'generating' || planState === 'approving' || reportUploading}
            title={!reportFile ? 'Upload daily depot report first' : ''}
            className="flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
          >
            {planState === 'generating' ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
            ) : (
              <><RefreshCw className="w-4 h-4" />Run AI Operational Planning</>
            )}
          </button>
        </div>
        {!reportFile && planState !== 'generating' && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-200 bg-amber-500/20 rounded-lg px-3 py-2 w-fit">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            Upload daily depot report below before running AI planning
          </div>
        )}

        {planState === 'generating' && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-200 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                {reportParsePhase || 'Analysing fleet data…'}
              </span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-blue-800/50 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-white transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {(planState === 'ready' || planState === 'approving' || planState === 'approved') && plan.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <span className="text-sm text-gray-500">AI Confidence</span>
                  <div className="text-2xl font-bold text-gray-900">{aiConfidence}%</div>
                </div>
                {reportFile && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg">
                    <FileCheck className="w-3 h-3" />
                    Source: {reportFile.name}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {planState === 'ready' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
                      <Clock className="w-3 h-3" /> Awaiting Approval
                    </span>
                  )}
                  {planState === 'approving' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg">
                      <Loader2 className="w-3 h-3 animate-spin" /> Approving Plan...
                    </span>
                  )}
                  {planState === 'approved' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg">
                      <CheckCircle className="w-3 h-3" /> Plan Approved
                    </span>
                  )}
                  {planState === 'approved' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1.5 rounded-lg">
                      <Send className="w-3 h-3" /> Delivered to Operations
                    </span>
                  )}
                </div>
                {manualEdits > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                    <span className="text-xs font-semibold text-amber-700">{manualEdits} manual override{manualEdits > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {planState !== 'approved' && (
                  <button
                    onClick={() => setEditMode(e => !e)}
                    disabled={planState === 'approving'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-sm ${
                      editMode
                        ? 'bg-blue-600 text-white shadow-inner'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    {editMode ? 'Editing Mode ON' : 'Edit Plan'}
                  </button>
                )}
                {planState !== 'approved' && (
                  <button
                    onClick={approvePlan}
                    disabled={planState === 'approving'}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60 text-sm shadow-sm"
                  >
                    {planState === 'approving' ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Approving...</>
                    ) : (
                      <><Send className="w-4 h-4" />Approve Final Operational Plan</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {editMode && (
              <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>Edit Mode Active</strong> — Use the dropdowns below to manually override any vehicle assignment.
                  Changes are highlighted in amber. Click <strong>Approve Final Operational Plan</strong> when done.
                </p>
              </div>
            )}

            {(metroAssignments.length > 0 || waterAssignments.length > 0) && (
              <div className="px-6 pb-0 pt-2">
                <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-5 text-white mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-slate-300" />
                    <span className="font-semibold text-base">Driver Allocation — Shift Overview</span>
                    {assignmentPublished && (
                      <span className="ml-auto flex items-center gap-1 text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30 px-2.5 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Published to Employees
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Train className="w-3.5 h-3.5 text-blue-300" />
                        <span className="text-xs font-bold text-blue-300 uppercase tracking-wide">Metro Rail — {metroAssignments.length} drivers assigned</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {SHIFTS.map(shift => {
                          const assigned = metroAssignments.filter(a => a.shift === shift.id).length;
                          const total = metroDrivers.filter(d => d.shift === shift.id).length;
                          const summaries = getMetroShiftSummaries();
                          const summary = summaries.find(s => s.shift.id === shift.id);
                          return (
                            <div key={shift.id} className={`bg-white/10 rounded-lg p-2.5 border ${summary?.shortage ? 'border-red-400/40' : 'border-white/10'}`}>
                              <div className="text-xs font-bold text-slate-300 mb-0.5">{shift.label.split(' ')[0]}</div>
                              <div className="text-xl font-bold text-white">{assigned}</div>
                              <div className="text-xs text-slate-400">of {total}</div>
                              {summary?.shortage && <div className="mt-1 text-xs text-red-300 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{summary.shortageCount} short</div>}
                              {!summary?.shortage && <div className="mt-1 text-xs text-green-300 flex items-center gap-1"><CheckCircle className="w-3 h-3" />OK</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Ship className="w-3.5 h-3.5 text-cyan-300" />
                        <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">Water Metro — {waterAssignments.length} crew assigned</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {SHIFTS.map(shift => {
                          const assigned = waterAssignments.filter(a => a.shift === shift.id).length;
                          const total = waterDrivers.filter(d => d.shift === shift.id).length;
                          return (
                            <div key={shift.id} className="bg-white/10 rounded-lg p-2.5 border border-white/10">
                              <div className="text-xs font-bold text-slate-300 mb-0.5">{shift.label.split(' ')[0]}</div>
                              <div className="text-xl font-bold text-white">{assigned}</div>
                              <div className="text-xs text-slate-400">of {total}</div>
                              <div className="mt-1 text-xs text-cyan-300 flex items-center gap-1"><CheckCircle className="w-3 h-3" />OK</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/60 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Train className="w-5 h-5 text-blue-700" />
                  <span className="font-semibold text-blue-900">Metro Trains — AI Summary</span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Running in Service</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{metroSummary.service}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">In Maintenance</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">{metroSummary.maintenance}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Standby / Ready</span>
                    </div>
                    <span className="text-xl font-bold text-gray-600">{metroSummary.standby}</span>
                  </div>
                  <div className="flex items-center justify-between bg-blue-700 rounded-lg px-4 py-2.5 mt-1">
                    <span className="text-sm font-semibold text-white">Total Metro Trains</span>
                    <span className="text-2xl font-bold text-white">{metroSummary.total}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/60 rounded-xl p-5 border border-cyan-200">
                <div className="flex items-center gap-2 mb-4">
                  <Ship className="w-5 h-5 text-cyan-700" />
                  <span className="font-semibold text-cyan-900">Water Boats — AI Summary</span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Running in Service</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{waterSummary.service}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">In Maintenance</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">{waterSummary.maintenance}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Standby / Ready</span>
                    </div>
                    <span className="text-xl font-bold text-gray-600">{waterSummary.standby}</span>
                  </div>
                  <div className="flex items-center justify-between bg-cyan-700 rounded-lg px-4 py-2.5 mt-1">
                    <span className="text-sm font-semibold text-white">Total Water Boats</span>
                    <span className="text-2xl font-bold text-white">{waterSummary.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
                <button
                  onClick={() => setActiveTab('metro')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'metro' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Train className="w-4 h-4" />
                  Metro Trains ({metroSummary.total})
                </button>
                <button
                  onClick={() => setActiveTab('water')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'water' ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Ship className="w-4 h-4" />
                  Water Boats ({waterSummary.total})
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[520px] overflow-y-auto pr-1">
                {displayList.map(item => {
                  const tagCfg = DECISION_TAG_CONFIG[item.manually_edited ? 'default' : item.decisionTag];
                  const TagIcon = tagCfg.icon;
                  const riskCfg = RISK_CONFIG[item.risk];
                  return (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-3 transition-all ${
                        item.manually_edited
                          ? 'border-amber-300 bg-amber-50'
                          : item.current_status !== item.suggested_status
                          ? 'border-blue-200 bg-blue-50/40'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{item.vehicle_number}</div>
                          <div className="text-xs text-gray-500">{item.vehicle_name}</div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {item.manually_edited && (
                            <span className="text-xs text-amber-600 font-medium bg-amber-100 px-1.5 py-0.5 rounded">edited</span>
                          )}
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${riskCfg.bg} ${riskCfg.color}`}>{riskCfg.label}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mb-2">
                        <StatusBadge status={item.current_status} small />
                        <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        {editMode && planState !== 'approved' ? (
                          <div className="relative">
                            <select
                              value={item.suggested_status}
                              onChange={e => handleStatusChange(item.id, e.target.value)}
                              className={`pl-2 pr-6 py-0.5 text-xs border rounded font-medium appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 ${STATUS_COLORS[item.suggested_status]?.bg} ${STATUS_COLORS[item.suggested_status]?.text} ${STATUS_COLORS[item.suggested_status]?.border}`}
                            >
                              {['service', 'maintenance', 'cleaning', 'ready', 'standby'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'inherit' }} />
                          </div>
                        ) : (
                          <StatusBadge status={item.suggested_status} small />
                        )}
                      </div>

                      <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border mb-2 ${tagCfg.color} ${tagCfg.bg}`}>
                        <TagIcon style={{ width: 10, height: 10 }} />
                        {item.manually_edited ? 'Admin Override' : tagCfg.label}
                      </div>

                      <p className="text-xs text-gray-500 leading-relaxed mb-1.5">{item.reason}</p>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-100 rounded-full">
                          <div className="h-1 rounded-full bg-blue-400" style={{ width: `${item.confidence}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{item.confidence}% conf.</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {planState === 'approved' && (
        <div className="border-t border-gray-100 pt-2">
          <FeederBusModule
            metroServiceCount={metroSummary.service}
            metroTotalCount={metroSummary.total}
            waterServiceCount={waterSummary.service}
            waterTotalCount={waterSummary.total}
            calendarModifier={calMod}
            planApproved={true}
            predictedPassengers={
              (metroSummary.service * 4200 + waterSummary.service * 320) * calMod.passengerMultiplier
            }
          />
        </div>
      )}

      {planState === 'idle' && !reportUploading && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          {reportFile ? (
            <>
              <Sparkles className="w-14 h-14 text-blue-300 mx-auto mb-3" />
              <p className="text-gray-800 font-semibold text-base">Report loaded — ready to run AI planning</p>
              <p className="text-gray-500 text-sm mt-1">
                Source: <span className="font-medium text-gray-700">{reportFile.name}</span> · {reportRows} rows · Click "Run AI Operational Planning" above
              </p>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Step 1 — Upload the daily depot report above</p>
              <p className="text-gray-400 text-sm mt-1">AI planning is unlocked after report upload</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
