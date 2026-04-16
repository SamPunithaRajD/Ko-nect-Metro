import React, { useEffect, useState, useCallback } from 'react';
import {
  Train, Ship, CheckCircle, Clock, AlertTriangle, Bell, MapPin,
  Calendar, RefreshCw, Wrench, Star, BarChart2, History, Download
} from 'lucide-react';
import { supabase, Vehicle, OperationalPlan } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { openReportInWindow, ReportVehicle, ReportFeederRoute } from '../../lib/reportGenerator';
import { useLanguage } from '../../contexts/LanguageContext';
import { TodayDemandChart, TerminalLoadChart } from './EmployeeAnalytics';
import { generateTodayDemand, generateTerminalLoad } from '../../lib/analyticsData';
import { MetroEmployeeImpact, WaterMetroEmployeeImpact } from '../OperationalImpact';

const STATUS_COLORS: Record<string, string> = {
  service: 'bg-green-100 text-green-800 border border-green-200',
  maintenance: 'bg-red-100 text-red-800 border border-red-200',
  cleaning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  ready: 'bg-blue-100 text-blue-800 border border-blue-200',
  standby: 'bg-gray-100 text-gray-700 border border-gray-200',
};

const MOCK_MAINTENANCE_TASKS = [
  { id: 'MT-001', vehicle: 'KM-002', task: 'Bogie inspection & wheel flange measurement', due: 'Tonight', priority: 'high' },
  { id: 'MT-002', vehicle: 'KM-003', task: 'AC unit coolant top-up', due: 'Tonight', priority: 'medium' },
  { id: 'MT-003', vehicle: 'KM-005', task: 'Pantograph carbon strip replacement', due: 'Tomorrow', priority: 'medium' },
  { id: 'MT-004', vehicle: 'KM-006', task: 'Rolling stock fitness certificate renewal', due: 'Urgent', priority: 'critical' },
];

const MOCK_CLEANING_TASKS = [
  { id: 'CT-001', vehicle: 'KM-001', task: 'Interior deep clean — coach 1–4', status: 'assigned', staff: 3 },
  { id: 'CT-002', vehicle: 'KM-004', task: 'Exterior wash & pantograph area', status: 'in-progress', staff: 2 },
  { id: 'CT-003', vehicle: 'KM-007', task: 'Seat sanitisation & flooring', status: 'pending', staff: 2 },
  { id: 'CT-004', vehicle: 'KM-008', task: 'Window cleaning — branded wrap train', status: 'assigned', staff: 1 },
];

const MOCK_WATER_PLAN_HISTORY = [
  { date: '2026-02-18', boats: 18, trips: 42, passengers: 3800, status: 'approved' },
  { date: '2026-02-17', boats: 16, trips: 38, passengers: 3540, status: 'approved' },
  { date: '2026-02-16', boats: 17, trips: 40, passengers: 3720, status: 'approved' },
  { date: '2026-02-15', boats: 15, trips: 36, passengers: 3300, status: 'approved' },
  { date: '2026-02-14', boats: 19, trips: 44, passengers: 4100, status: 'approved' },
  { date: '2026-02-13', boats: 16, trips: 38, passengers: 3510, status: 'approved' },
  { date: '2026-02-12', boats: 14, trips: 33, passengers: 3050, status: 'approved' },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'text-red-700 bg-red-50 border-red-200',
  high: 'text-orange-700 bg-orange-50 border-orange-200',
  medium: 'text-amber-700 bg-amber-50 border-amber-200',
  low: 'text-gray-600 bg-gray-50 border-gray-200',
};

const CLEAN_STATUS_COLORS: Record<string, string> = {
  'assigned': 'text-blue-700 bg-blue-50',
  'in-progress': 'text-amber-700 bg-amber-50',
  'pending': 'text-gray-600 bg-gray-50',
  'done': 'text-green-700 bg-green-50',
};

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [latestPlan, setLatestPlan] = useState<OperationalPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'fleet' | 'maintenance' | 'cleaning' | 'history'>('fleet');
  const [downloading, setDownloading] = useState(false);

  // Analytics data
  const todayDemandData = generateTodayDemand();
  const terminalLoadData = generateTerminalLoad();

  const vehicleType = user?.role === 'metro_employee' ? 'metro_train' : 'water_boat';
  const isMetro = vehicleType === 'metro_train';
  const Icon = isMetro ? Train : Ship;
  const accentColor = isMetro ? 'blue' : 'cyan';

  const loadData = useCallback(async () => {
    try {
      const [vehiclesRes, plansRes] = await Promise.all([
        supabase
          .from('vehicles')
          .select('*')
          .eq('vehicle_type', vehicleType)
          .eq('assigned_to', user?.id)
          .order('vehicle_number'),
        supabase
          .from('operational_plans')
          .select('*')
          .eq('status', 'sent')
          .order('created_at', { ascending: false })
          .limit(1),
      ]);
      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      if (plansRes.data && plansRes.data.length > 0) setLatestPlan(plansRes.data[0]);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading employee data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, vehicleType]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  const planSection = isMetro ? latestPlan?.plan_data?.metro_trains : latestPlan?.plan_data?.water_boats;

  const statusCounts = {
    service: vehicles.filter(v => v.status === 'service').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    ready: vehicles.filter(v => v.status === 'ready').length,
    standby: vehicles.filter(v => v.status === 'standby').length,
    cleaning: vehicles.filter(v => v.status === 'cleaning').length,
  };

  const assignedTomorrow = planSection?.assignments?.slice(0, 8) ?? [];

  const handleDownloadReport = () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const today = new Date();
      const role = user?.role as 'metro_employee' | 'water_employee' ?? 'metro_employee';

      const metroVehicleList: ReportVehicle[] = isMetro
        ? vehicles.map(v => ({
            vehicleNumber: v.vehicle_number,
            vehicleName: v.vehicle_name,
            vehicleType: 'metro_train' as const,
            currentStatus: v.status,
            suggestedStatus: planSection?.assignments?.find((a: any) => a.vehicle_number === v.vehicle_number)?.suggested_status ?? v.status,
            reason: 'Assigned per operational plan',
            risk: 'low' as const,
          }))
        : [];
      const waterVehicleList: ReportVehicle[] = !isMetro
        ? vehicles.map(v => ({
            vehicleNumber: v.vehicle_number,
            vehicleName: v.vehicle_name,
            vehicleType: 'water_boat' as const,
            currentStatus: v.status,
            suggestedStatus: planSection?.assignments?.find((a: any) => a.vehicle_number === v.vehicle_number)?.suggested_status ?? v.status,
            reason: 'Assigned per operational plan',
            risk: 'low' as const,
          }))
        : [];

      const metroFeederRoutes: ReportFeederRoute[] = [
        { routeNumber: 'F-101', name: 'Aluva – Kalamassery Metro', buses: 4, surgeBuses: 0, connectsTo: 'Metro Station', peakFreqMin: 8 },
        { routeNumber: 'F-102', name: 'Kakkanad – Palarivattom Metro', buses: 5, surgeBuses: 0, connectsTo: 'Metro Station', peakFreqMin: 6 },
        { routeNumber: 'F-103', name: 'Airport – Aluva Metro', buses: 3, surgeBuses: 0, connectsTo: 'Metro Station', peakFreqMin: 15 },
        { routeNumber: 'F-301', name: 'Edapally – Metro Hub', buses: 5, surgeBuses: 0, connectsTo: 'Metro Station', peakFreqMin: 5 },
        { routeNumber: 'F-302', name: 'Thrippunithura – MG Road Metro', buses: 3, surgeBuses: 0, connectsTo: 'Metro Station', peakFreqMin: 10 },
      ];
      const waterFeederRoutes: ReportFeederRoute[] = [
        { routeNumber: 'F-201', name: 'Vyttila Hub – Water Terminal', buses: 2, surgeBuses: 0, connectsTo: 'Water Terminal', peakFreqMin: 5 },
        { routeNumber: 'F-202', name: 'Fort Kochi – Vypeen Water Terminal', buses: 2, surgeBuses: 0, connectsTo: 'Water Terminal', peakFreqMin: 10 },
        { routeNumber: 'F-203', name: 'Mattancherry – Bolgatty Terminal', buses: 2, surgeBuses: 0, connectsTo: 'Water Terminal', peakFreqMin: 12 },
      ];

      const metroMaintTasks = MOCK_MAINTENANCE_TASKS.filter(t => t.vehicle.startsWith('KM'));
      const waterMaintTasks = MOCK_MAINTENANCE_TASKS.filter(t => t.vehicle.startsWith('WB') || !t.vehicle.startsWith('KM'));

      openReportInWindow({
        role,
        reportDate: today,
        generatedAt: today,
        generatedBy: user?.full_name ?? 'Employee',
        planApproved: !!latestPlan,
        approvedAt: latestPlan ? new Date(latestPlan.approved_at ?? latestPlan.created_at) : undefined,
        aiConfidence: latestPlan?.ai_confidence ?? 0,
        demandMultiplier: 1.0,
        demandLabel: 'Normal Day',
        surgeMode: false,
        predictedPassengers: isMetro ? (statusCounts.service * 4200) : (statusCounts.service * 320),
        predictedMetroPassengers: isMetro ? statusCounts.service * 4200 : 0,
        predictedWaterPassengers: !isMetro ? statusCounts.service * 320 : 0,
        metroVehicles: metroVehicleList,
        waterVehicles: waterVehicleList,
        metroDrivers: [],
        waterDrivers: [],
        feederRoutes: isMetro ? metroFeederRoutes : waterFeederRoutes,
        certAlerts: [],
        manpowerAvailable: 18,
        manpowerRequired: 24,
        cleaningBays: 5,
        cleaningBaysTotal: 7,
        maintenanceTasks: isMetro
          ? metroMaintTasks.map(m => ({ vehicle: m.vehicle, task: m.task, priority: m.priority, due: m.due }))
          : waterMaintTasks.map(m => ({ vehicle: m.vehicle, task: m.task, priority: m.priority, due: m.due })),
      }, lang);
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isMetro ? 'Metro Operations' : 'Water Metro Operations'} Dashboard
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Welcome, {user?.full_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-xs">{lastRefresh.toLocaleTimeString()}</span>
          </button>
          <button
            onClick={handleDownloadReport}
            disabled={downloading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-60 border"
            style={{
              background: isMetro ? 'linear-gradient(135deg,#003A8F,#0072CE)' : 'linear-gradient(135deg,#0e7490,#0891b2)',
              color: '#fff',
              borderColor: 'transparent',
            }}
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? t('generating') : isMetro ? t('downloadMetroReport') : t('downloadWaterReport')}
          </button>
        </div>
      </div>

      {latestPlan ? (
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl p-5 text-white shadow-md">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">New Operational Plan Approved</h3>
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">DELIVERED</span>
                </div>
                <p className="text-green-100 text-sm">
                  Approved: {new Date(latestPlan.approved_at || latestPlan.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
              <div className="text-xs font-medium text-green-100">AI Score</div>
              <div className="text-xl font-bold">{latestPlan.ai_confidence.toFixed(1)}%</div>
            </div>
          </div>

          {planSection && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold">{planSection.service ?? 0}</div>
                <div className="text-xs font-medium mt-0.5 text-green-100">In Service Tomorrow</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold">{planSection.maintenance ?? 0}</div>
                <div className="text-xs font-medium mt-0.5 text-green-100">Maintenance</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold">{planSection.standby ?? 0}</div>
                <div className="text-xs font-medium mt-0.5 text-green-100">Standby Reserve</div>
              </div>
            </div>
          )}

          {!isMetro && (
            <div className="mt-3 bg-white/10 rounded-lg px-4 py-2 text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-300 flex-shrink-0" />
              <span className="text-green-100">
                Metro disruption contingency: <strong className="text-white">3 extra boat trips</strong> on Vyttila–High Court corridor pre-authorised.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-900 font-medium">Awaiting Operational Plan</p>
            <p className="text-amber-700 text-sm mt-0.5">Admin has not yet approved tomorrow's plan. Check back after 21:00.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className={`bg-${accentColor}-100 p-2.5 rounded-lg w-fit mb-3`}>
            <Icon className={`w-5 h-5 text-${accentColor}-600`} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{vehicles.length}</div>
          <div className="text-sm text-gray-500 mt-1">Total Assigned</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="bg-green-100 p-2.5 rounded-lg w-fit mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{statusCounts.service}</div>
          <div className="text-sm text-gray-500 mt-1">In Service</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="bg-red-100 p-2.5 rounded-lg w-fit mb-3">
            <Wrench className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{statusCounts.maintenance}</div>
          <div className="text-sm text-gray-500 mt-1">Maintenance</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="bg-gray-100 p-2.5 rounded-lg w-fit mb-3">
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{statusCounts.ready + statusCounts.standby}</div>
          <div className="text-sm text-gray-500 mt-1">Ready / Standby</div>
        </div>
      </div>

      {/* Analytics Graph */}
      {isMetro ? (
        <TodayDemandChart data={todayDemandData} />
      ) : (
        <TerminalLoadChart data={terminalLoadData} />
      )}

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
        {(isMetro ? [
          { id: 'fleet' as const, label: 'Fleet Overview', icon: Icon },
          { id: 'maintenance' as const, label: 'Maintenance Tasks', icon: Wrench },
          { id: 'cleaning' as const, label: 'Cleaning Tasks', icon: CheckCircle },
        ] : [
          { id: 'fleet' as const, label: 'Fleet Overview', icon: Icon },
          { id: 'history' as const, label: 'Plan History (7 Days)', icon: History },
        ]).map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'fleet' && (
        <>
          {latestPlan && assignedTomorrow.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/50 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Assigned {isMetro ? 'Trains' : 'Boats'} for Tomorrow</h3>
                <span className="ml-auto text-xs text-blue-600 font-medium">{assignedTomorrow.length} vehicles</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vehicle</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tomorrow's Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">AI Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {assignedTomorrow.map((a: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <div className="font-semibold text-gray-900 text-sm">{a.vehicle_number}</div>
                          <div className="text-xs text-gray-500">{a.vehicle_name}</div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[a.status] ?? 'bg-gray-100 text-gray-700'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500 max-w-xs truncate">{a.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {vehicles.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
              <Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No vehicles assigned yet</p>
              <p className="text-gray-400 text-sm mt-1">Vehicles appear after admin approves an operational plan.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Current Fleet — {vehicles.length} {isMetro ? 'Metro Trains' : 'Water Boats'}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {Object.entries(statusCounts).filter(([, c]) => c > 0).map(([s, c]) => (
                    <span key={s}><span className="font-semibold text-gray-600">{c}</span> {s}</span>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vehicle</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                      {!isMetro && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Capacity</th>}
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Next Maintenance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vehicles.map(vehicle => {
                      const daysLeft = Math.ceil((new Date(vehicle.next_maintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      return (
                        <tr key={vehicle.id} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <Icon className={`w-4 h-4 text-${accentColor}-500 flex-shrink-0`} />
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">{vehicle.vehicle_number}</div>
                                <div className="text-xs text-gray-500">{vehicle.vehicle_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[vehicle.status]}`}>
                              {vehicle.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {vehicle.current_location}
                            </div>
                          </td>
                          {!isMetro && <td className="px-5 py-3.5 text-sm text-gray-600">{vehicle.capacity} pax</td>}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>{new Date(vehicle.next_maintenance).toLocaleDateString()}</span>
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${daysLeft < 30 ? 'bg-red-50 text-red-600' : daysLeft < 60 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'}`}>
                                {daysLeft}d
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'maintenance' && isMetro && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <Wrench className="w-4 h-4 text-red-600" />
            <h3 className="font-semibold text-gray-900">Maintenance Tasks — Tonight</h3>
            <span className="ml-auto text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              {MOCK_MAINTENANCE_TASKS.filter(t => t.priority === 'critical').length} Critical
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {MOCK_MAINTENANCE_TASKS.map(task => (
              <div key={task.id} className="px-6 py-4 flex items-start gap-4">
                <div className={`mt-0.5 px-2 py-0.5 text-xs font-bold rounded border capitalize flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                  {task.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{task.vehicle}</span>
                    <span className="text-xs text-gray-400">#{task.id}</span>
                  </div>
                  <p className="text-sm text-gray-600">{task.task}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${task.due === 'Urgent' ? 'bg-red-100 text-red-700' : task.due === 'Tonight' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                    {task.due}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'cleaning' && isMetro && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Cleaning Tasks — Tonight</h3>
            <span className="ml-auto text-xs text-gray-400">Manpower: 18/24 staff available</span>
          </div>
          <div className="divide-y divide-gray-100">
            {MOCK_CLEANING_TASKS.map(task => (
              <div key={task.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{task.vehicle}</span>
                  </div>
                  <p className="text-sm text-gray-600">{task.task}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{task.staff} staff assigned</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${CLEAN_STATUS_COLORS[task.status]}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              Manpower shortage: 6 additional staff needed to complete all trains before 05:00 morning service.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'history' && !isMetro && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <BarChart2 className="w-4 h-4 text-cyan-600" />
            <h3 className="font-semibold text-gray-900">Water Metro — Last 7 Days Plan History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Boats Deployed</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total Trips</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Passengers</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Plan Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_WATER_PLAN_HISTORY.map((row, i) => (
                  <tr key={i} className={`hover:bg-gray-50 ${i === 0 ? 'bg-cyan-50/30' : ''}`}>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">
                      {row.date}
                      {i === 0 && <span className="ml-2 text-xs bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded-full font-bold">Today</span>}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700 font-semibold">{row.boats}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{row.trips}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{row.passengers.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full capitalize">{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isMetro ? <MetroEmployeeImpact /> : <WaterMetroEmployeeImpact />}
    </div>
  );
};
