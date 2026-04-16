import React, { useEffect, useState, useMemo } from 'react';
import {
  Train, Ship, AlertTriangle, TrendingUp, Users, CheckCircle, Clock,
  Activity, Cpu, ChevronRight, BarChart3, Zap, Navigation, Shield,
  ArrowUpRight, TrendingDown, Minus, CalendarDays, Star, Bus
} from 'lucide-react';
import { supabase, Vehicle, Certificate, RidershipData, OperationalPlan } from '../../lib/supabase';
import { KMRL_COLORS, getStatusColor } from '../../lib/colors';
import {
  ManpowerCleaningPanel,
  FitnessCertificatePanel,
  JobCardPanel,
  MileageBalancingPanel,
  BrandingPriorityPanel,
  DepotGeometryPanel,
} from './OperationalPanels';
import { DepotSimulationPanel } from './DepotSimulation';
import { KeralaOperationalCalendar } from './KeralaCalendar';
import { EventAwareCalendar } from './EventCalendar';
import { FeederBusModule } from './FeederBusModule';
import {
  getDemandModifier, getTomorrowModifier, DEMAND_MODIFIERS, CATEGORY_ORDER,
  DemandModifier, DayCategory
} from '../../lib/keralaCalendar';
import {
  RidershipTrendChart,
  FleetAvailabilityChart,
  DriverAvailabilityChart
} from './AnalyticsGraphs';
import {
  generateRidershipTrend,
  generateFleetAvailability,
  generateDriverAvailability
} from '../../lib/analyticsData';
import { AdminOperationalImpact } from '../OperationalImpact';

const now = new Date();
const planningHour = now.getHours();
const inPlanningWindow = planningHour >= 21 || planningHour < 23;

type DemandLevel = 'normal' | 'high' | 'overload';

type DemandPrediction = {
  predictedPassengers: number;
  demandLevel: DemandLevel;
  peakTime: string;
  recommendedMetroTrains: number;
  recommendedBoats: number;
  trendVsPrevDay: number;
  aiConfidence: number;
  updatedFromPlan: boolean;
  calendarModifier: DemandModifier & { holiday: any };
};

function computePrediction(
  ridership: RidershipData[],
  metroTotal: number,
  waterTotal: number,
  latestPlan: OperationalPlan | null,
  calMod: DemandModifier & { holiday: any }
): DemandPrediction {
  const mult = calMod.passengerMultiplier;

  if (latestPlan && latestPlan.plan_data) {
    const pd = latestPlan.plan_data;
    const metroService = pd.metro_trains?.service ?? Math.round(metroTotal * calMod.metroDeployTarget);
    const waterService = pd.water_boats?.service ?? Math.round(waterTotal * calMod.waterDeployTarget);
    const mockPassengers = Math.round((metroService * 4200 + waterService * 320) * mult);
    const level: DemandLevel = mockPassengers > 90000 ? 'overload' : mockPassengers > 65000 ? 'high' : 'normal';
    return {
      predictedPassengers: mockPassengers,
      demandLevel: level,
      peakTime: calMod.category === 'weekend' || calMod.category === 'festival_major' ? '10:00 – 12:00' : '08:00 – 10:00',
      recommendedMetroTrains: metroService,
      recommendedBoats: waterService,
      trendVsPrevDay: parseFloat(((mult - 1) * 100).toFixed(1)),
      aiConfidence: latestPlan.ai_confidence,
      updatedFromPlan: true,
      calendarModifier: calMod,
    };
  }

  if (ridership.length === 0) {
    const basePassengers = metroTotal > 0 ? metroTotal * 3800 + waterTotal * 280 : 72400;
    const predicted = Math.round(basePassengers * mult);
    const metroNeeded = Math.min(metroTotal, Math.max(1, Math.round(metroTotal * calMod.metroDeployTarget)));
    const waterNeeded = Math.min(waterTotal, Math.max(1, Math.round(waterTotal * calMod.waterDeployTarget)));
    return {
      predictedPassengers: predicted,
      demandLevel: predicted > 95000 ? 'overload' : predicted > 65000 ? 'high' : 'normal',
      peakTime: calMod.category === 'weekend' || calMod.category === 'festival_major' ? '10:00 – 12:00' : '08:00 – 10:00',
      recommendedMetroTrains: metroNeeded,
      recommendedBoats: waterNeeded,
      trendVsPrevDay: parseFloat(((mult - 1) * 100 + 1.4).toFixed(1)),
      aiConfidence: 81.5,
      updatedFromPlan: false,
      calendarModifier: calMod,
    };
  }

  const byDate: Record<string, number> = {};
  for (const r of ridership) {
    byDate[r.date] = (byDate[r.date] ?? 0) + r.total_passengers;
  }
  const sorted = Object.values(byDate).sort((a, b) => b - a);
  const avg = sorted.reduce((s, v) => s + v, 0) / sorted.length;
  const growthFactor = (1 + 0.02 + Math.random() * 0.03) * mult;
  const predicted = Math.round(avg * growthFactor);
  const prev = sorted[0] ?? avg;
  const trend = prev > 0 ? ((predicted - prev) / prev) * 100 : 0;
  const level: DemandLevel = predicted > 95000 ? 'overload' : predicted > 70000 ? 'high' : 'normal';
  const metroNeeded = Math.min(metroTotal, Math.max(1, Math.round(metroTotal * calMod.metroDeployTarget)));
  const waterNeeded = Math.min(waterTotal, Math.max(1, Math.round(waterTotal * calMod.waterDeployTarget)));
  const peakOptions = ['07:30 – 09:30', '08:00 – 10:00', '08:30 – 10:30'];
  const peakTime = calMod.category === 'weekend' || calMod.category === 'festival_major'
    ? '10:00 – 12:00'
    : peakOptions[Math.floor(predicted / 10000) % peakOptions.length];

  return {
    predictedPassengers: predicted,
    demandLevel: level,
    peakTime,
    recommendedMetroTrains: metroNeeded,
    recommendedBoats: waterNeeded,
    trendVsPrevDay: parseFloat(trend.toFixed(1)),
    aiConfidence: 78 + Math.round(Math.random() * 14),
    updatedFromPlan: false,
    calendarModifier: calMod,
  };
}

const DEMAND_CONFIG: Record<DemandLevel, { label: string; color: string; bg: string; border: string; dot: string }> = {
  normal:  { label: 'Normal',  color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200', dot: 'bg-green-500'  },
  high:    { label: 'High',    color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200', dot: 'bg-amber-500'  },
  overload:{ label: 'Overload',color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',   dot: 'bg-red-500'    },
};

export const AdminDashboard: React.FC = () => {
  const [vehicles,    setVehicles]    = useState<Vehicle[]>([]);
  const [certificates,setCertificates]= useState<Certificate[]>([]);
  const [ridership,   setRidership]   = useState<RidershipData[]>([]);
  const [latestPlan,  setLatestPlan]  = useState<OperationalPlan | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Analytics data (regenerated on data changes)
  const [ridershipTrendData, setRidershipTrendData] = useState(() => generateRidershipTrend());
  const [fleetAvailabilityData, setFleetAvailabilityData] = useState(() => generateFleetAvailability(25, 75, 18, 60));
  const [driverAvailabilityData, setDriverAvailabilityData] = useState(() => generateDriverAvailability(40, 90, 18, 60));

  // Calendar planning date — defaults to tomorrow for prediction accuracy
  const [calendarDate, setCalendarDate] = useState<Date>(() => {
    const t = new Date(); t.setDate(t.getDate() + 1); t.setHours(0,0,0,0); return t;
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [vehiclesRes, certsRes, ridershipRes, planRes] = await Promise.all([
        supabase.from('vehicles').select('*').order('vehicle_number'),
        supabase.from('certificates').select('*').eq('status', 'expiring_soon'),
        supabase.from('ridership_data').select('*').gte('date', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
        supabase.from('operational_plans').select('*').eq('status', 'sent').order('created_at', { ascending: false }).limit(1)
      ]);
      if (vehiclesRes.data)  setVehicles(vehiclesRes.data);
      if (certsRes.data)     setCertificates(certsRes.data);
      if (ridershipRes.data) setRidership(ridershipRes.data);
      if (planRes.data && planRes.data.length > 0) setLatestPlan(planRes.data[0]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const metroTrains   = vehicles.filter(v => v.vehicle_type === 'metro_train');
  const waterBoats    = vehicles.filter(v => v.vehicle_type === 'water_boat');
  const metroInService    = metroTrains.filter(v => v.status === 'service').length;
  const metroMaintenance  = metroTrains.filter(v => v.status === 'maintenance').length;
  const metroStandby      = metroTrains.filter(v => v.status === 'standby' || v.status === 'ready').length;
  const waterInService    = waterBoats.filter(v => v.status === 'service').length;
  const waterMaintenance  = waterBoats.filter(v => v.status === 'maintenance').length;
  const waterStandby      = waterBoats.filter(v => v.status === 'standby' || v.status === 'ready').length;
  const planStatus = latestPlan ? 'delivered' : 'awaiting';

  // Update analytics data when vehicles or plan changes
  useEffect(() => {
    if (vehicles.length > 0) {
      setRidershipTrendData(generateRidershipTrend());
      setFleetAvailabilityData(generateFleetAvailability(
        metroTrains.length,
        waterBoats.length,
        metroInService,
        waterInService
      ));
      setDriverAvailabilityData(generateDriverAvailability(
        40, // mock metro drivers
        90, // mock water drivers
        metroInService,
        waterInService
      ));
    }
  }, [vehicles, metroTrains.length, waterBoats.length, metroInService, waterInService, latestPlan]);

  const calMod = useMemo(() => getDemandModifier(calendarDate), [calendarDate]);
  const prediction = useMemo(
    () => computePrediction(ridership, metroTrains.length, waterBoats.length, latestPlan, calMod),
    [ridership, metroTrains.length, waterBoats.length, latestPlan, calMod]
  );
  const demandCfg = DEMAND_CONFIG[prediction.demandLevel];

  const totalActive  = metroInService + waterInService;
  const totalFleet   = vehicles.length;
  const utilizationPct = totalFleet > 0 ? Math.round((totalActive / totalFleet) * 100) : 0;
  const criticalCerts = certificates.length;
  const systemHealthScore = Math.max(0, 100 - criticalCerts * 3 - (totalFleet > 0 ? Math.max(0, 30 - utilizationPct) * 0.5 : 0));

  const sections = [
    { id: 'overview',    label: 'Overview' },
    { id: 'calendar',    label: 'Kerala Calendar' },
    { id: 'feeder',      label: 'Feeder Bus' },
    { id: 'fitness',     label: 'Fitness & Certs' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'analytics',   label: 'Analytics' },
    { id: 'depot',       label: 'Depot & Simulation' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const isHolidayContext = calMod.category !== 'weekday';
  const isMajorFestival  = calMod.category === 'festival_major';

  return (
    <div className="space-y-5">
      {/* Status bar */}
      <div className="rounded-xl p-4 text-white text-sm flex flex-wrap items-center gap-4" style={{ background: 'linear-gradient(135deg, #0d1b3e 0%, #003A8F 100%)' }}>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 opacity-70" />
          <span className="opacity-70">Planning Window:</span>
          <span className="font-bold">21:00 – 23:00</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ml-1 ${inPlanningWindow ? 'bg-green-400/30 text-green-200' : 'bg-white/10 text-white/50'}`}>
            {inPlanningWindow ? 'ACTIVE NOW' : 'INACTIVE'}
          </span>
        </div>
        <div className="h-4 w-px bg-white/20" />
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 opacity-70" />
          <span className="opacity-70">AI Engine:</span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Active
          </span>
        </div>
        <div className="h-4 w-px bg-white/20" />
        <div className="flex items-center gap-2">
          <Train className="w-4 h-4 opacity-70" />
          <span className="opacity-70">Fleet:</span>
          <span className="font-bold">{metroTrains.length} trains + {waterBoats.length} boats</span>
        </div>
        <div className="h-4 w-px bg-white/20" />
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 opacity-70" />
          <span className="opacity-70">Planning Date:</span>
          <span className="font-bold flex items-center gap-1.5">
            {calMod.icon}
            {calendarDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            {calMod.surgeLabel && (
              <span className="text-xs bg-red-400/30 text-red-200 px-2 py-0.5 rounded-full font-semibold">
                {calMod.surgeLabel}
              </span>
            )}
          </span>
        </div>
        <div className="h-4 w-px bg-white/20" />
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 opacity-70" />
          <span className="opacity-70">Plan:</span>
          {planStatus === 'delivered'
            ? <span className="font-bold text-green-300 flex items-center gap-1"><CheckCircle style={{ width: 12, height: 12 }} /> Delivered to Operations</span>
            : <span className="font-bold text-amber-300 flex items-center gap-1"><Clock style={{ width: 12, height: 12 }} /> Awaiting Approval</span>
          }
        </div>
      </div>

      {/* Festival surge banner */}
      {isMajorFestival && (
        <div className="rounded-xl p-4 flex items-center gap-3 animate-pulse-once"
          style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
          <span className="text-2xl flex-shrink-0">{calMod.icon}</span>
          <div className="text-white flex-1 min-w-0">
            <div className="font-bold text-base">{calMod.alertMessage}</div>
            <div className="text-red-200 text-xs mt-0.5">
              {calMod.holiday?.name} — {calendarDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' · '}Deploy {Math.round(calMod.metroDeployTarget * 100)}% metro · {Math.round(calMod.waterDeployTarget * 100)}% water metro
            </div>
          </div>
          <span className="flex-shrink-0 text-xs font-bold bg-white/20 text-white px-3 py-1.5 rounded-full border border-white/30">
            {calMod.surgeLabel}
          </span>
        </div>
      )}

      {!isMajorFestival && isHolidayContext && calMod.alertMessage && (
        <div className={`rounded-xl p-4 flex items-center gap-3 border ${calMod.bg} ${calMod.border}`}>
          <span className="text-xl flex-shrink-0">{calMod.icon}</span>
          <div className={`flex-1 min-w-0 ${calMod.color}`}>
            <div className="font-semibold text-sm">{calMod.alertMessage}</div>
            {calMod.holiday && (
              <div className="text-xs opacity-80 mt-0.5">
                {calMod.holiday.name} — {calendarDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            )}
          </div>
          {calMod.surgeLabel && (
            <span className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border ${calMod.badgeBg} ${calMod.badge} ${calMod.border}`}>
              {calMod.surgeLabel}
            </span>
          )}
        </div>
      )}

      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: KMRL_COLORS.metroBlue }}>Admin Control Center</h2>
          <p className="mt-0.5 text-gray-500 text-sm">KO-NECT Metro Operations — Nightly Induction Planning</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Fleet Size</div>
          <div className="text-2xl font-bold text-gray-800">{vehicles.length} vehicles</div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-1.5 ${activeSection === s.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            {s.id === 'calendar' && <CalendarDays className="w-3.5 h-3.5" />}
            {s.id === 'feeder' && <Bus className="w-3.5 h-3.5" />}
            {s.label}
            {s.id === 'calendar' && isHolidayContext && (
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            )}
            {s.id === 'feeder' && isMajorFestival && (
              <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {activeSection === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metro Trains */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2.5 rounded-lg"><Train className="w-5 h-5 text-blue-600" /></div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">LIVE</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{metroInService}<span className="text-lg text-gray-400">/{metroTrains.length}</span></div>
              <div className="text-sm text-gray-500 mt-1">Metro Trains in Service</div>
              <div className="mt-2 text-xs text-gray-400">{metroMaintenance} maint · {metroStandby} standby</div>
            </div>

            {/* Water Boats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-cyan-100 p-2.5 rounded-lg"><Ship className="w-5 h-5 text-cyan-600" /></div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">LIVE</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{waterInService}<span className="text-lg text-gray-400">/{waterBoats.length}</span></div>
              <div className="text-sm text-gray-500 mt-1">Water Boats in Service</div>
              <div className="mt-2 text-xs text-gray-400">{waterMaintenance} maint · {waterStandby} standby</div>
            </div>

            {/* Tomorrow Passenger Demand Prediction */}
            <div className={`rounded-xl shadow-sm border p-5 col-span-2 ${prediction.updatedFromPlan ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' : isHolidayContext ? `${calMod.border} ${calMod.bg}` : 'border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50'}`}>
              <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className={`p-2.5 rounded-lg ${prediction.updatedFromPlan ? 'bg-green-100' : isHolidayContext ? 'bg-white/60' : 'bg-blue-100'}`}>
                    <BarChart3 className={`w-5 h-5 ${prediction.updatedFromPlan ? 'text-green-600' : isHolidayContext ? calMod.color : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tomorrow Passenger Demand Prediction</div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {prediction.updatedFromPlan && (
                        <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                          <CheckCircle className="w-3 h-3" />Updated from approved plan
                        </span>
                      )}
                      {isHolidayContext && (
                        <span className={`text-xs font-bold flex items-center gap-1 ${calMod.color}`}>
                          {calMod.icon} {calMod.surgeLabel ?? calMod.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${demandCfg.bg} ${demandCfg.color} ${demandCfg.border}`}>
                  <span className={`w-2 h-2 rounded-full ${demandCfg.dot}`} />
                  {demandCfg.label}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {prediction.predictedPassengers.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Predicted Passengers</div>
                  <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${prediction.trendVsPrevDay >= 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    {prediction.trendVsPrevDay > 0 ? <ArrowUpRight className="w-3 h-3" /> : prediction.trendVsPrevDay < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {Math.abs(prediction.trendVsPrevDay)}% vs yesterday
                  </div>
                  {isHolidayContext && (
                    <div className={`text-xs font-semibold mt-1 ${calMod.color}`}>
                      ×{calMod.passengerMultiplier.toFixed(2)} calendar multiplier
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Peak Hour</span>
                  </div>
                  <div className="text-sm font-bold text-gray-800">{prediction.peakTime}</div>
                  <div className={`inline-flex items-center gap-1 mt-1 text-xs font-bold px-2 py-0.5 rounded-full border ${demandCfg.bg} ${demandCfg.color} ${demandCfg.border}`}>
                    {prediction.demandLevel === 'normal' ? 'Low / Normal' : prediction.demandLevel === 'high' ? 'Medium / High' : 'High / Overload'}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Navigation className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recommended Fleet</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Train className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-bold text-gray-800">{prediction.recommendedMetroTrains}</span>
                      <span className="text-xs text-gray-400">metro trains</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ship className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                      <span className="text-sm font-bold text-gray-800">{prediction.recommendedBoats}</span>
                      <span className="text-xs text-gray-400">water boats</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/60 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">AI Confidence</span>
                </div>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden min-w-16">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${prediction.aiConfidence}%`, backgroundColor: prediction.aiConfidence > 85 ? '#16a34a' : prediction.aiConfidence > 70 ? '#d97706' : '#dc2626' }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700">{prediction.aiConfidence.toFixed(1)}%</span>
                <span className="text-xs text-gray-400">
                  {isHolidayContext ? `Kerala calendar · ${calMod.label}` : 'Last 3 days + AI simulation'}
                </span>
              </div>
            </div>
          </div>

          {/* Analytics Graphs Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <RidershipTrendChart data={ridershipTrendData} />
            <FleetAvailabilityChart data={fleetAvailabilityData} />
          </div>

          <DriverAvailabilityChart data={driverAvailabilityData} />

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-slate-100 p-2.5 rounded-lg"><Shield className="w-5 h-5 text-slate-600" /></div>
              <h3 className="font-semibold text-gray-900">System Status</h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ml-auto ${systemHealthScore >= 90 ? 'bg-green-50 text-green-700 border border-green-200' : systemHealthScore >= 70 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                Health Score {Math.round(systemHealthScore)}%
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-gray-900">{utilizationPct}%</div>
                <div className="text-xs text-gray-500 mt-0.5">Fleet Utilisation</div>
              </div>
              <div className={`rounded-lg p-3 text-center ${criticalCerts > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
                <div className={`text-xl font-bold ${criticalCerts > 0 ? 'text-amber-700' : 'text-green-700'}`}>{criticalCerts}</div>
                <div className={`text-xs mt-0.5 ${criticalCerts > 0 ? 'text-amber-600' : 'text-green-600'}`}>Cert. Alerts</div>
              </div>
              <div className={`rounded-lg p-3 text-center ${planStatus === 'delivered' ? 'bg-green-50' : 'bg-amber-50'}`}>
                <div className={`text-xl font-bold ${planStatus === 'delivered' ? 'text-green-700' : 'text-amber-700'}`}>
                  {planStatus === 'delivered' ? 'LIVE' : 'PENDING'}
                </div>
                <div className={`text-xs mt-0.5 ${planStatus === 'delivered' ? 'text-green-600' : 'text-amber-600'}`}>Ops Plan</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-700">{metroTrains.filter(v => v.status === 'maintenance').length + waterBoats.filter(v => v.status === 'maintenance').length}</div>
                <div className="text-xs text-blue-600 mt-0.5">In Maintenance</div>
              </div>
            </div>
          </div>

          {latestPlan ? (
            <div className="bg-white rounded-xl shadow-sm border border-green-200 p-5">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Latest Approved Operational Plan</h3>
                <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Delivered to Operations</span>
                <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(latestPlan.approved_at || latestPlan.created_at).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-blue-700">{latestPlan.plan_data?.metro_trains?.total ?? 0}</div><div className="text-xs text-blue-600 mt-0.5">Total Trains</div></div>
                <div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-green-700">{latestPlan.plan_data?.metro_trains?.service ?? 0}</div><div className="text-xs text-green-600 mt-0.5">Running</div></div>
                <div className="bg-red-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-red-700">{latestPlan.plan_data?.metro_trains?.maintenance ?? 0}</div><div className="text-xs text-red-600 mt-0.5">Maintenance</div></div>
                <div className="bg-cyan-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-cyan-700">{latestPlan.plan_data?.water_boats?.total ?? 0}</div><div className="text-xs text-cyan-600 mt-0.5">Total Boats</div></div>
                <div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-green-700">{latestPlan.plan_data?.water_boats?.service ?? 0}</div><div className="text-xs text-green-600 mt-0.5">Running</div></div>
                <div className="bg-red-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-red-700">{latestPlan.plan_data?.water_boats?.maintenance ?? 0}</div><div className="text-xs text-red-600 mt-0.5">Maintenance</div></div>
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">AI Confidence:</span>
                <span className="text-sm font-semibold text-gray-700">{latestPlan.ai_confidence.toFixed(1)}%</span>
                {(latestPlan.plan_data?.total_manual_overrides ?? 0) > 0 && (
                  <span className="text-xs text-amber-600 ml-1">{latestPlan.plan_data.total_manual_overrides} manual overrides applied</span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-semibold text-amber-900">Awaiting Approval</span>
                <p className="text-amber-700 text-sm mt-0.5">No operational plan approved yet. Go to AI Planning to generate and approve one.</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg">
                AI Planning <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          )}

          {certificates.length > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900">Certificate Expiry Alerts</h3>
                <p className="text-amber-800 text-sm mt-0.5">{certificates.length} certificate{certificates.length > 1 ? 's' : ''} expiring soon. Check "Fitness & Certs" tab.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Train className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-900">Metro Fleet — {metroTrains.length} Trains</h3>
              </div>
              <div className="space-y-3">
                {[
                  { status: 'service',     label: 'In Service',  count: metroInService },
                  { status: 'maintenance', label: 'Maintenance', count: metroMaintenance },
                  { status: 'standby',     label: 'Standby',     count: metroTrains.filter(v => v.status === 'standby').length },
                  { status: 'ready',       label: 'Ready',       count: metroTrains.filter(v => v.status === 'ready').length },
                  { status: 'cleaning',    label: 'Cleaning',    count: metroTrains.filter(v => v.status === 'cleaning').length },
                ].map(({ status, label, count }) => {
                  const pct = metroTrains.length > 0 ? (count / metroTrains.length) * 100 : 0;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-gray-700">{label}</span>
                        <span className="font-bold text-gray-900">{count} <span className="font-normal text-gray-400">trains</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: getStatusColor(status) }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Ship className="w-5 h-5 text-cyan-600" />
                <h3 className="text-base font-semibold text-gray-900">Water Fleet — {waterBoats.length} Boats</h3>
              </div>
              <div className="space-y-3">
                {[
                  { status: 'service',     label: 'In Service',  count: waterInService },
                  { status: 'maintenance', label: 'Maintenance', count: waterMaintenance },
                  { status: 'standby',     label: 'Standby',     count: waterBoats.filter(v => v.status === 'standby').length },
                  { status: 'ready',       label: 'Ready',       count: waterBoats.filter(v => v.status === 'ready').length },
                  { status: 'cleaning',    label: 'Cleaning',    count: waterBoats.filter(v => v.status === 'cleaning').length },
                ].map(({ status, label, count }) => {
                  const pct = waterBoats.length > 0 ? (count / waterBoats.length) * 100 : 0;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-gray-700">{label}</span>
                        <span className="font-bold text-gray-900">{count} <span className="font-normal text-gray-400">boats</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: getStatusColor(status) }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${KMRL_COLORS.metroBlue} 0%, ${KMRL_COLORS.lightBlue} 100%)` }}>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6" />
              <h3 className="text-lg font-semibold">System Performance</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: '97.2%', label: 'On-Time Performance' },
                { value: '94.5%', label: 'Operational Efficiency' },
                { value: '4.6/5', label: 'Passenger Satisfaction' },
                { value: '100%',  label: 'Safety Compliance' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <AdminOperationalImpact />
        </>
      )}

      {activeSection === 'calendar' && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Kerala Operational Calendar & Event Management</h3>
            <p className="text-sm text-gray-500">
              Select any date to preview AI demand adjustments. Add operational events to see their impact on fleet deployment, driver requirements, and ridership predictions.
            </p>
          </div>

          <EventAwareCalendar selectedDate={calendarDate} onDateChange={setCalendarDate} />

          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-4">
              {/* AI impact summary for selected date */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${calMod.bg} border ${calMod.border}`}>
                    <BarChart3 className={`w-4 h-4 ${calMod.color}`} />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">AI Planning Impact for Selected Date</h4>
                  {calMod.surgeLabel && (
                    <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full border ${calMod.badgeBg} ${calMod.badge} ${calMod.border}`}>
                      {calMod.surgeLabel}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <ImpactCell
                    title="Predicted Passengers"
                    value={Math.round(
                      (ridership.length > 0
                        ? ridership.reduce((s, r) => s + r.total_passengers, 0) / Math.max(1, Object.keys(Object.fromEntries(ridership.map(r => [r.date, 1]))).length)
                        : metroTrains.length * 3800 + waterBoats.length * 280
                      ) * calMod.passengerMultiplier
                    ).toLocaleString('en-IN')}
                    sub={`×${calMod.passengerMultiplier.toFixed(2)} multiplier`}
                    highlight={calMod.passengerMultiplier > 1.2}
                    color={calMod.color}
                  />
                  <ImpactCell
                    title="Metro Trains Required"
                    value={`${Math.round(metroTrains.length * calMod.metroDeployTarget)} / ${metroTrains.length}`}
                    sub={`${Math.round(calMod.metroDeployTarget * 100)}% fleet target`}
                    highlight={calMod.metroDeployTarget > 0.82}
                    color={calMod.color}
                  />
                  <ImpactCell
                    title="Water Boats Required"
                    value={`${Math.round(waterBoats.length * calMod.waterDeployTarget)} / ${waterBoats.length}`}
                    sub={`+${calMod.waterMetroBoost}% leisure boost`}
                    highlight={calMod.waterMetroBoost > 20}
                    color={calMod.color}
                  />
                  <ImpactCell
                    title="Maintenance Deferral"
                    value={calMod.maintenanceReduction > 0 ? `−${calMod.maintenanceReduction}%` : 'None'}
                    sub="non-critical tasks deferred"
                    highlight={calMod.maintenanceReduction > 30}
                    color={calMod.color}
                  />
                  <ImpactCell
                    title="Driver Surge Staffing"
                    value={calMod.driverSurgeRequired ? 'Required' : 'Standard'}
                    sub={calMod.driverSurgeRequired ? 'All shifts fully covered' : 'Normal roster applies'}
                    highlight={calMod.driverSurgeRequired}
                    color={calMod.color}
                  />
                  <ImpactCell
                    title="Peak Hour Window"
                    value={calMod.category === 'weekend' || calMod.category === 'festival_major' ? '10:00 – 12:00' : '08:00 – 10:00'}
                    sub={calMod.category === 'weekend' || calMod.category === 'festival_major' ? 'Leisure / event peak' : 'Office commute peak'}
                    highlight={false}
                    color={calMod.color}
                  />
                </div>

                {calMod.alertMessage && (
                  <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border ${
                    isMajorFestival ? 'bg-red-50 border-red-300' : `${calMod.bg} ${calMod.border}`
                  }`}>
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${calMod.color}`} />
                    <div>
                      <div className={`text-sm font-bold ${calMod.color}`}>{calMod.alertMessage}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        AI will automatically apply these settings when you run Operational Planning on this date.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Demand multiplier comparison table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h4 className="font-semibold text-gray-900 text-sm mb-3">Demand Multiplier Reference — All Day Types</h4>
                <div className="space-y-2">
                  {CATEGORY_ORDER.map(cat => {
                    const cfg = DEMAND_MODIFIERS[cat];
                    const isActive = cat === calMod.category;
                    return (
                      <div key={cat} className={`flex items-center gap-3 p-2.5 rounded-lg border transition ${isActive ? `${cfg.bg} ${cfg.border} shadow-sm` : 'border-gray-100 hover:bg-gray-50'}`}>
                        <span className="text-base flex-shrink-0">{cfg.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-bold truncate ${isActive ? cfg.color : 'text-gray-700'}`}>{cfg.label}</div>
                          <div className="text-xs text-gray-400 truncate">{cfg.description.slice(0, 60)}…</div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 text-right">
                          <div>
                            <div className={`text-sm font-bold ${isActive ? cfg.color : 'text-gray-700'}`}>×{cfg.passengerMultiplier.toFixed(2)}</div>
                            <div className="text-xs text-gray-400">demand</div>
                          </div>
                          <div>
                            <div className={`text-sm font-bold ${isActive ? cfg.color : 'text-gray-700'}`}>{Math.round(cfg.metroDeployTarget * 100)}%</div>
                            <div className="text-xs text-gray-400">metro</div>
                          </div>
                          <div>
                            <div className={`text-sm font-bold ${isActive ? cfg.color : 'text-gray-700'}`}>{Math.round(cfg.waterDeployTarget * 100)}%</div>
                            <div className="text-xs text-gray-400">water</div>
                          </div>
                          {isActive && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badge} border ${cfg.border}`}>Active</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'feeder' && (
        <FeederBusModule
          metroServiceCount={metroInService}
          metroTotalCount={metroTrains.length}
          waterServiceCount={waterInService}
          waterTotalCount={waterBoats.length}
          calendarModifier={calMod}
          planApproved={!!latestPlan}
          predictedPassengers={prediction.predictedPassengers}
        />
      )}

      {activeSection === 'fitness' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <FitnessCertificatePanel />
          <BrandingPriorityPanel />
        </div>
      )}

      {activeSection === 'maintenance' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <JobCardPanel />
          <ManpowerCleaningPanel />
        </div>
      )}

      {activeSection === 'analytics' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <MileageBalancingPanel />
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-50">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Operational KPIs — Last 7 Days</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Fleet Utilisation',          value: 82, color: '#0072CE', note: '82% of fleet deployed' },
                { label: 'On-Time Departure',           value: 97, color: '#16a34a', note: '97.2% trains on time' },
                { label: 'Maintenance Compliance',      value: 91, color: '#d97706', note: '91% tasks on schedule' },
                { label: 'Cleaning Completion Rate',    value: 75, color: '#0891b2', note: '75% — limited manpower' },
                { label: 'Fitness Certificate Validity',value: 88, color: '#0369a1', note: '88% trains fully certified' },
              ].map(kpi => (
                <div key={kpi.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium">{kpi.label}</span>
                    <span className="text-gray-500">{kpi.note}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full">
                      <div className="h-2 rounded-full" style={{ width: `${kpi.value}%`, backgroundColor: kpi.color }} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-8 text-right">{kpi.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'depot' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <DepotGeometryPanel />
          <DepotSimulationPanel />
        </div>
      )}
    </div>
  );
};

const ImpactCell: React.FC<{
  title: string;
  value: string;
  sub: string;
  highlight: boolean;
  color: string;
}> = ({ title, value, sub, highlight, color }) => (
  <div className={`rounded-lg p-3 border ${highlight ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
    <div className="text-xs text-gray-500 font-medium mb-1 truncate">{title}</div>
    <div className={`text-sm font-bold ${highlight ? color : 'text-gray-800'}`}>{value}</div>
    <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
  </div>
);
