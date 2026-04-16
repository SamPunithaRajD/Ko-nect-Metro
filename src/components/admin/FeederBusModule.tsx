import React, { useState, useMemo } from 'react';
import {
  Bus, Train, Ship, MapPin, AlertTriangle, CheckCircle, Clock,
  ArrowRight, TrendingUp, Users, Navigation, Zap, BarChart3,
  RefreshCw, Send, ChevronDown, ChevronUp, Info, Layers,
  Activity, Star
} from 'lucide-react';
import { DemandModifier } from '../../lib/keralaCalendar';

// ─── Types ──────────────────────────────────────────────────────────────────

export type FeederRoute = {
  id: string;
  routeNumber: string;
  name: string;
  origin: string;
  destination: string;
  connectsTo: 'metro_station' | 'water_terminal' | 'both';
  connectedNode: string;
  distanceKm: number;
  durationMin: number;
  baseBusCount: number;
  currentBusCount: number;
  assignedBusCount: number;
  status: 'active' | 'standby' | 'insufficient';
  avgDailyPassengers: number;
  peakFreqMin: number;
  offpeakFreqMin: number;
  operatorName: string;
};

export type FeederBus = {
  id: string;
  busNumber: string;
  model: string;
  capacity: number;
  status: 'available' | 'assigned' | 'maintenance' | 'standby';
  assignedRoute: string | null;
  type: 'ac' | 'non_ac' | 'electric';
  lastService: string;
};

export type FeederSummary = {
  totalBuses: number;
  availableBuses: number;
  assignedBuses: number;
  maintenanceBuses: number;
  routesCovered: number;
  totalCapacity: number;
  requiredBuses: number;
  surgeRequired: boolean;
  shortfall: number;
};

// ─── Mock Data ───────────────────────────────────────────────────────────────

const FEEDER_ROUTES: FeederRoute[] = [
  {
    id: 'FR-01', routeNumber: 'F-101',
    name: 'Aluva – Kalamassery Metro',
    origin: 'Aluva Bus Stand', destination: 'Kalamassery Metro Station',
    connectsTo: 'metro_station', connectedNode: 'Kalamassery Metro',
    distanceKm: 6.2, durationMin: 18,
    baseBusCount: 4, currentBusCount: 4, assignedBusCount: 4,
    status: 'active', avgDailyPassengers: 3200,
    peakFreqMin: 8, offpeakFreqMin: 18,
    operatorName: 'KSRTC Division 3',
  },
  {
    id: 'FR-02', routeNumber: 'F-102',
    name: 'Kakkanad – Palarivattom Metro',
    origin: 'Kakkanad IT Hub', destination: 'Palarivattom Metro Station',
    connectsTo: 'metro_station', connectedNode: 'Palarivattom Metro',
    distanceKm: 8.5, durationMin: 22,
    baseBusCount: 6, currentBusCount: 5, assignedBusCount: 5,
    status: 'active', avgDailyPassengers: 4800,
    peakFreqMin: 6, offpeakFreqMin: 15,
    operatorName: 'City Private Consortium',
  },
  {
    id: 'FR-03', routeNumber: 'F-103',
    name: 'Cochin Airport – Aluva Metro',
    origin: 'CIAL Airport Terminal', destination: 'Aluva Metro Station',
    connectsTo: 'metro_station', connectedNode: 'Aluva Metro',
    distanceKm: 12.4, durationMin: 35,
    baseBusCount: 3, currentBusCount: 3, assignedBusCount: 3,
    status: 'active', avgDailyPassengers: 2100,
    peakFreqMin: 15, offpeakFreqMin: 30,
    operatorName: 'KSRTC Airport Express',
  },
  {
    id: 'FR-04', routeNumber: 'F-201',
    name: 'Vyttila Hub – Vyttila Water Terminal',
    origin: 'Vyttila Mobility Hub', destination: 'Vyttila Water Metro Terminal',
    connectsTo: 'water_terminal', connectedNode: 'Vyttila Water Terminal',
    distanceKm: 1.8, durationMin: 7,
    baseBusCount: 2, currentBusCount: 2, assignedBusCount: 2,
    status: 'active', avgDailyPassengers: 1600,
    peakFreqMin: 5, offpeakFreqMin: 12,
    operatorName: 'KMRL Feeder Services',
  },
  {
    id: 'FR-05', routeNumber: 'F-202',
    name: 'Fort Kochi – Vypeen Water Terminal',
    origin: 'Fort Kochi Bus Stand', destination: 'Vypeen Water Metro Terminal',
    connectsTo: 'water_terminal', connectedNode: 'Vypeen Water Terminal',
    distanceKm: 4.1, durationMin: 14,
    baseBusCount: 3, currentBusCount: 2, assignedBusCount: 2,
    status: 'insufficient', avgDailyPassengers: 1900,
    peakFreqMin: 10, offpeakFreqMin: 20,
    operatorName: 'City Private Consortium',
  },
  {
    id: 'FR-06', routeNumber: 'F-203',
    name: 'Mattancherry – Bolgatty Water Terminal',
    origin: 'Mattancherry Market', destination: 'Bolgatty Water Metro Terminal',
    connectsTo: 'water_terminal', connectedNode: 'Bolgatty Water Terminal',
    distanceKm: 3.6, durationMin: 12,
    baseBusCount: 2, currentBusCount: 2, assignedBusCount: 2,
    status: 'active', avgDailyPassengers: 1350,
    peakFreqMin: 12, offpeakFreqMin: 25,
    operatorName: 'KMRL Feeder Services',
  },
  {
    id: 'FR-07', routeNumber: 'F-301',
    name: 'Edapally – Lulu Mall Metro',
    origin: 'Edapally Junction', destination: 'Edapally Metro Station',
    connectsTo: 'both', connectedNode: 'Edapally Metro & Bus Hub',
    distanceKm: 2.4, durationMin: 8,
    baseBusCount: 5, currentBusCount: 5, assignedBusCount: 5,
    status: 'active', avgDailyPassengers: 5200,
    peakFreqMin: 5, offpeakFreqMin: 10,
    operatorName: 'City Private Consortium',
  },
  {
    id: 'FR-08', routeNumber: 'F-302',
    name: 'Thrippunithura – MG Road Metro',
    origin: 'Thrippunithura', destination: 'MG Road Metro Station',
    connectsTo: 'metro_station', connectedNode: 'MG Road Metro',
    distanceKm: 9.8, durationMin: 28,
    baseBusCount: 4, currentBusCount: 3, assignedBusCount: 3,
    status: 'active', avgDailyPassengers: 2800,
    peakFreqMin: 10, offpeakFreqMin: 22,
    operatorName: 'KSRTC Division 3',
  },
];

const FEEDER_BUSES: FeederBus[] = [
  { id: 'FB-001', busNumber: 'KL-07-AC-001', model: 'Volvo 9400', capacity: 52, status: 'assigned', assignedRoute: 'F-101', type: 'ac', lastService: '2026-02-10' },
  { id: 'FB-002', busNumber: 'KL-07-AC-002', model: 'Volvo 9400', capacity: 52, status: 'assigned', assignedRoute: 'F-101', type: 'ac', lastService: '2026-02-12' },
  { id: 'FB-003', busNumber: 'KL-07-AC-003', model: 'Volvo 9400', capacity: 52, status: 'assigned', assignedRoute: 'F-102', type: 'ac', lastService: '2026-02-08' },
  { id: 'FB-004', busNumber: 'KL-07-AC-004', model: 'Volvo 9400', capacity: 52, status: 'assigned', assignedRoute: 'F-102', type: 'ac', lastService: '2026-02-11' },
  { id: 'FB-005', busNumber: 'KL-07-EV-001', model: 'Tata Starbus EV', capacity: 40, status: 'assigned', assignedRoute: 'F-201', type: 'electric', lastService: '2026-02-15' },
  { id: 'FB-006', busNumber: 'KL-07-EV-002', model: 'Tata Starbus EV', capacity: 40, status: 'assigned', assignedRoute: 'F-201', type: 'electric', lastService: '2026-02-14' },
  { id: 'FB-007', busNumber: 'KL-07-NA-001', model: 'Ashok Leyland Viking', capacity: 62, status: 'assigned', assignedRoute: 'F-103', type: 'non_ac', lastService: '2026-02-09' },
  { id: 'FB-008', busNumber: 'KL-07-NA-002', model: 'Ashok Leyland Viking', capacity: 62, status: 'assigned', assignedRoute: 'F-103', type: 'non_ac', lastService: '2026-02-07' },
  { id: 'FB-009', busNumber: 'KL-07-AC-005', model: 'Mercedes Citaro', capacity: 55, status: 'assigned', assignedRoute: 'F-301', type: 'ac', lastService: '2026-02-13' },
  { id: 'FB-010', busNumber: 'KL-07-AC-006', model: 'Mercedes Citaro', capacity: 55, status: 'assigned', assignedRoute: 'F-301', type: 'ac', lastService: '2026-02-10' },
  { id: 'FB-011', busNumber: 'KL-07-EV-003', model: 'Tata Starbus EV', capacity: 40, status: 'available', assignedRoute: null, type: 'electric', lastService: '2026-02-16' },
  { id: 'FB-012', busNumber: 'KL-07-EV-004', model: 'Tata Starbus EV', capacity: 40, status: 'available', assignedRoute: null, type: 'electric', lastService: '2026-02-17' },
  { id: 'FB-013', busNumber: 'KL-07-NA-003', model: 'KSRTC Super Fast', capacity: 54, status: 'available', assignedRoute: null, type: 'non_ac', lastService: '2026-02-05' },
  { id: 'FB-014', busNumber: 'KL-07-NA-004', model: 'KSRTC Super Fast', capacity: 54, status: 'standby', assignedRoute: null, type: 'non_ac', lastService: '2026-02-03' },
  { id: 'FB-015', busNumber: 'KL-07-AC-007', model: 'Volvo 8400', capacity: 48, status: 'maintenance', assignedRoute: null, type: 'ac', lastService: '2026-01-28' },
  { id: 'FB-016', busNumber: 'KL-07-AC-008', model: 'Volvo 8400', capacity: 48, status: 'assigned', assignedRoute: 'F-302', type: 'ac', lastService: '2026-02-11' },
  { id: 'FB-017', busNumber: 'KL-07-AC-009', model: 'Volvo 8400', capacity: 48, status: 'assigned', assignedRoute: 'F-202', type: 'ac', lastService: '2026-02-09' },
  { id: 'FB-018', busNumber: 'KL-07-EV-005', model: 'Olectra C9', capacity: 42, status: 'available', assignedRoute: null, type: 'electric', lastService: '2026-02-18' },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const BUS_STATUS_CONFIG: Record<FeederBus['status'], { label: string; color: string; bg: string; border: string; dot: string }> = {
  available:   { label: 'Available',   color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500' },
  assigned:    { label: 'Assigned',    color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  maintenance: { label: 'Maintenance', color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500' },
  standby:     { label: 'Standby',     color: 'text-gray-600',   bg: 'bg-gray-50',   border: 'border-gray-200',   dot: 'bg-gray-400' },
};

const ROUTE_STATUS_CONFIG: Record<FeederRoute['status'], { label: string; color: string; bg: string; border: string }> = {
  active:       { label: 'Active',       color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  standby:      { label: 'Standby',      color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  insufficient: { label: 'Insufficient', color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
};

const BUS_TYPE_CONFIG: Record<FeederBus['type'], { label: string; color: string; bg: string }> = {
  ac:      { label: 'AC',       color: 'text-blue-700',  bg: 'bg-blue-50' },
  non_ac:  { label: 'Non-AC',   color: 'text-gray-600',  bg: 'bg-gray-100' },
  electric:{ label: 'Electric', color: 'text-teal-700',  bg: 'bg-teal-50' },
};

const CONNECT_TYPE_CONFIG: Record<FeederRoute['connectsTo'], { label: string; icon: React.ElementType; color: string }> = {
  metro_station: { label: 'Metro Station',   icon: Train, color: 'text-blue-600' },
  water_terminal:{ label: 'Water Terminal',  icon: Ship,  color: 'text-cyan-600' },
  both:          { label: 'Metro + Water',   icon: Layers,color: 'text-orange-600' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

type Props = {
  metroServiceCount: number;
  metroTotalCount: number;
  waterServiceCount: number;
  waterTotalCount: number;
  calendarModifier: (DemandModifier & { holiday: any }) | null;
  planApproved?: boolean;
  predictedPassengers?: number;
};

export const FeederBusModule: React.FC<Props> = ({
  metroServiceCount,
  metroTotalCount,
  waterServiceCount,
  waterTotalCount,
  calendarModifier,
  planApproved = false,
  predictedPassengers = 72400,
}) => {
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'routes' | 'fleet' | 'summary'>('routes');
  const [filterType, setFilterType] = useState<'all' | 'metro_station' | 'water_terminal' | 'both'>('all');

  const isSurge = calendarModifier
    ? calendarModifier.category === 'festival_major' || calendarModifier.category === 'festival_minor'
    : false;
  const isHoliday = calendarModifier ? calendarModifier.category !== 'weekday' : false;
  const calMult = calendarModifier?.passengerMultiplier ?? 1;

  // Dynamic bus requirement based on metro availability, water availability, demand
  const summary: FeederSummary = useMemo(() => {
    const totalBuses = FEEDER_BUSES.length;
    const availableBuses = FEEDER_BUSES.filter(b => b.status === 'available').length;
    const assignedBuses  = FEEDER_BUSES.filter(b => b.status === 'assigned').length;
    const maintenanceBuses = FEEDER_BUSES.filter(b => b.status === 'maintenance').length;

    // Base requirement from passenger load
    let baseRequired = Math.ceil(predictedPassengers / 4800);

    // If metro coverage is low, feeder buses compensate
    const metroCoverage = metroTotalCount > 0 ? metroServiceCount / metroTotalCount : 0.75;
    if (metroCoverage < 0.6) baseRequired = Math.ceil(baseRequired * 1.3);
    else if (metroCoverage < 0.75) baseRequired = Math.ceil(baseRequired * 1.15);

    // Surge / holiday boost
    baseRequired = Math.ceil(baseRequired * calMult);

    // Cap to fleet size
    const requiredBuses = Math.min(baseRequired, totalBuses - maintenanceBuses);
    const shortfall = Math.max(0, requiredBuses - (availableBuses + assignedBuses));

    return {
      totalBuses,
      availableBuses,
      assignedBuses,
      maintenanceBuses,
      routesCovered: FEEDER_ROUTES.filter(r => r.status === 'active').length,
      totalCapacity: (availableBuses + assignedBuses) * 50,
      requiredBuses,
      surgeRequired: isSurge || shortfall > 0,
      shortfall,
    };
  }, [metroServiceCount, metroTotalCount, calMult, isSurge, predictedPassengers]);

  // Compute adjusted routes with surge bus needs
  const computedRoutes = useMemo(() => {
    return FEEDER_ROUTES.map(r => {
      let surge = 0;
      if (isSurge) surge = Math.ceil(r.baseBusCount * 0.5);
      else if (isHoliday) surge = Math.ceil(r.baseBusCount * 0.25);
      const metroLow = metroTotalCount > 0 && metroServiceCount / metroTotalCount < 0.65;
      if (metroLow && r.connectsTo !== 'water_terminal') surge += 1;
      return { ...r, requiredSurge: surge, totalRequired: r.baseBusCount + surge };
    });
  }, [isSurge, isHoliday, metroServiceCount, metroTotalCount]);

  const filteredRoutes = filterType === 'all'
    ? computedRoutes
    : computedRoutes.filter(r => r.connectsTo === filterType);

  const metroRoutes = computedRoutes.filter(r => r.connectsTo === 'metro_station' || r.connectsTo === 'both');
  const waterRoutes = computedRoutes.filter(r => r.connectsTo === 'water_terminal' || r.connectsTo === 'both');
  const totalDailyPax = computedRoutes.reduce((s, r) => s + r.avgDailyPassengers, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Feeder Bus Coordination</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Multimodal last-mile connectivity — Metro, Water Metro &amp; Feeder Bus integration
          </p>
        </div>
        {planApproved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 font-semibold">Plan Approved — Feeder Deployment Active</span>
          </div>
        )}
      </div>

      {/* Surge / alert banners */}
      {isSurge && calendarModifier && (
        <div className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' }}>
          <Bus className="w-6 h-6 text-white flex-shrink-0" />
          <div className="text-white flex-1 min-w-0">
            <div className="font-bold text-sm">Additional feeder buses required for peak distribution</div>
            <div className="text-orange-200 text-xs mt-0.5">
              {calendarModifier.holiday?.name ?? calendarModifier.label} — {Math.ceil(totalDailyPax * calMult).toLocaleString('en-IN')} predicted feeder passengers.
              {' '}Deploy {summary.requiredBuses} buses across {computedRoutes.length} routes.
            </div>
          </div>
          <span className="flex-shrink-0 text-xs font-bold bg-white/20 text-white px-3 py-1.5 rounded-full border border-white/30">
            Feeder Surge Mode
          </span>
        </div>
      )}

      {!isSurge && summary.shortfall > 0 && (
        <div className="rounded-xl p-3.5 flex items-center gap-3 bg-red-50 border border-red-200">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-red-700">Feeder Bus Shortfall Detected</div>
            <div className="text-xs text-red-600 mt-0.5">
              {summary.shortfall} additional bus{summary.shortfall > 1 ? 'es' : ''} required. Insufficient metro coverage detected — feeder allocation increased.
            </div>
          </div>
        </div>
      )}

      {!isSurge && isHoliday && !summary.shortfall && calendarModifier && (
        <div className={`rounded-xl p-3.5 flex items-center gap-3 border ${calendarModifier.bg} ${calendarModifier.border}`}>
          <Bus className={`w-4 h-4 flex-shrink-0 ${calendarModifier.color}`} />
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-bold ${calendarModifier.color}`}>
              Feeder capacity boosted — {calendarModifier.label}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              +{Math.round((calMult - 1) * 100)}% passenger demand. Additional buses pre-allocated on high-demand corridors.
            </div>
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={<Bus className="w-4 h-4 text-blue-600" />}
          label="Total Fleet"
          value={`${summary.assignedBuses + summary.availableBuses} / ${summary.totalBuses}`}
          sub={`${summary.maintenanceBuses} in maintenance`}
          highlight={false}
        />
        <KpiCard
          icon={<Navigation className="w-4 h-4 text-green-600" />}
          label="Routes Active"
          value={`${summary.routesCovered}`}
          sub={`of ${FEEDER_ROUTES.length} total routes`}
          highlight={false}
        />
        <KpiCard
          icon={<Users className="w-4 h-4 text-orange-600" />}
          label="Buses Required Tomorrow"
          value={`${summary.requiredBuses}`}
          sub={summary.shortfall > 0 ? `${summary.shortfall} bus shortfall` : 'Fully covered'}
          highlight={summary.shortfall > 0}
        />
        <KpiCard
          icon={<TrendingUp className="w-4 h-4 text-teal-600" />}
          label="Feeder Passengers / Day"
          value={Math.ceil(totalDailyPax * calMult).toLocaleString('en-IN')}
          sub={isHoliday ? `×${calMult.toFixed(2)} surge applied` : 'Avg. daily estimate'}
          highlight={isHoliday}
        />
      </div>

      {/* Connectivity overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ConnectivityCard
          icon={<Train className="w-5 h-5 text-blue-600" />}
          label="Metro Rail Connections"
          count={metroRoutes.length}
          buses={metroRoutes.reduce((s, r) => s + r.currentBusCount, 0)}
          color="blue"
          node="Kochi Metro Rail Network"
          status={metroServiceCount / Math.max(1, metroTotalCount) >= 0.7 ? 'good' : 'low'}
        />
        <ConnectivityCard
          icon={<Ship className="w-5 h-5 text-cyan-600" />}
          label="Water Metro Connections"
          count={waterRoutes.length}
          buses={waterRoutes.reduce((s, r) => s + r.currentBusCount, 0)}
          color="cyan"
          node="Kochi Water Metro Network"
          status={waterServiceCount / Math.max(1, waterTotalCount) >= 0.6 ? 'good' : 'low'}
        />
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-5 h-5 text-slate-300" />
            <span className="text-sm font-semibold">Integrated Passengers</span>
          </div>
          <div className="text-2xl font-bold mb-1">
            {Math.ceil(totalDailyPax * calMult).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400">Feeder passengers/day</div>
          <div className="mt-2 text-xs text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3 h-3" />
            {FEEDER_ROUTES.length} active feeder corridors
          </div>
        </div>
      </div>

      {/* Main panel tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex gap-1 p-3 border-b border-gray-100 bg-gray-50">
          {([
            { id: 'routes', label: 'Feeder Routes', icon: Navigation },
            { id: 'fleet',  label: 'Bus Fleet',     icon: Bus },
            { id: 'summary', label: 'Deployment Plan', icon: BarChart3 },
          ] as { id: 'routes' | 'fleet' | 'summary'; label: string; icon: React.ElementType }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${activeTab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {t.id === 'summary' && planApproved && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* ── ROUTES TAB ── */}
        {activeTab === 'routes' && (
          <div className="p-4">
            {/* Type filter */}
            <div className="flex gap-1 mb-4 flex-wrap">
              {([
                { id: 'all',            label: 'All Routes' },
                { id: 'metro_station',  label: 'Metro' },
                { id: 'water_terminal', label: 'Water Metro' },
                { id: 'both',           label: 'Both' },
              ] as { id: typeof filterType; label: string }[]).map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition border ${filterType === f.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredRoutes.map(route => {
                const rCfg = ROUTE_STATUS_CONFIG[route.status];
                const cCfg = CONNECT_TYPE_CONFIG[route.connectsTo];
                const ConnIcon = cCfg.icon;
                const isExpanded = expandedRoute === route.id;
                const hasSurge = route.requiredSurge > 0;

                return (
                  <div key={route.id} className={`rounded-xl border transition-all ${hasSurge ? 'border-orange-200' : 'border-gray-200'} overflow-hidden`}>
                    <button
                      className={`w-full flex items-center gap-3 p-3.5 text-left transition ${hasSurge ? 'bg-orange-50/40 hover:bg-orange-50' : 'bg-white hover:bg-gray-50'}`}
                      onClick={() => setExpandedRoute(isExpanded ? null : route.id)}
                    >
                      <div className={`p-2 rounded-lg flex-shrink-0 ${hasSurge ? 'bg-orange-100' : 'bg-gray-100'}`}>
                        <Bus className={`w-4 h-4 ${hasSurge ? 'text-orange-600' : 'text-gray-600'}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-gray-500">{route.routeNumber}</span>
                          <span className="text-sm font-semibold text-gray-900 truncate">{route.name}</span>
                          {hasSurge && (
                            <span className="text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full flex-shrink-0">
                              +{route.requiredSurge} surge buses
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 flex-wrap">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{route.origin}</span>
                          <ArrowRight className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{route.destination}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <ConnIcon className={`w-3.5 h-3.5 ${cCfg.color}`} />
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            {route.assignedBusCount}
                            {hasSurge && <span className="text-orange-600">+{route.requiredSurge}</span>}
                            <span className="text-xs text-gray-400"> buses</span>
                          </div>
                          <div className={`text-xs font-semibold ${rCfg.color}`}>{rCfg.label}</div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-white">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                          <div className="bg-gray-50 rounded-lg p-2.5">
                            <div className="text-xs text-gray-500 mb-0.5">Distance</div>
                            <div className="text-sm font-bold text-gray-800">{route.distanceKm} km</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2.5">
                            <div className="text-xs text-gray-500 mb-0.5">Journey</div>
                            <div className="text-sm font-bold text-gray-800">{route.durationMin} min</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2.5">
                            <div className="text-xs text-gray-500 mb-0.5">Peak Freq.</div>
                            <div className="text-sm font-bold text-gray-800">Every {route.peakFreqMin} min</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2.5">
                            <div className="text-xs text-gray-500 mb-0.5">Daily Pax</div>
                            <div className="text-sm font-bold text-gray-800">
                              {Math.ceil(route.avgDailyPassengers * calMult).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-semibold text-gray-700">Connects to:</span>
                            <ConnIcon className={`w-3.5 h-3.5 ${cCfg.color}`} />
                            <span>{route.connectedNode}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-semibold text-gray-700">Operator:</span>
                            <span>{route.operatorName}</span>
                          </div>
                        </div>

                        {hasSurge && (
                          <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                            <Zap className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-orange-700 font-semibold">
                              {route.requiredSurge} additional bus{route.requiredSurge > 1 ? 'es' : ''} required for this route during {calendarModifier?.holiday?.name ?? 'high demand period'}.
                              Frequency reduced to every {Math.max(3, route.peakFreqMin - 3)} min during peak hours.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FLEET TAB ── */}
        {activeTab === 'fleet' && (
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                {(['available', 'assigned', 'standby', 'maintenance'] as FeederBus['status'][]).map(s => {
                  const c = BUS_STATUS_CONFIG[s];
                  return (
                    <div key={s} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                      <span>{c.label}: {FEEDER_BUSES.filter(b => b.status === s).length}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[480px] overflow-y-auto pr-1">
              {FEEDER_BUSES.map(bus => {
                const sCfg = BUS_STATUS_CONFIG[bus.status];
                const tCfg = BUS_TYPE_CONFIG[bus.type];
                const route = bus.assignedRoute ? FEEDER_ROUTES.find(r => r.routeNumber === bus.assignedRoute) : null;

                return (
                  <div key={bus.id} className={`rounded-lg border p-3 ${sCfg.bg} ${sCfg.border}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Bus className={`w-4 h-4 flex-shrink-0 ${sCfg.color}`} />
                        <div>
                          <div className="text-xs font-bold text-gray-900">{bus.busNumber}</div>
                          <div className="text-xs text-gray-500">{bus.model}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tCfg.bg} ${tCfg.color} border-current`}>
                          {tCfg.label}
                        </span>
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${sCfg.bg} ${sCfg.color} ${sCfg.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                          {sCfg.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{bus.capacity} cap.</span>
                      {route && (
                        <span className="flex items-center gap-1 truncate">
                          <Navigation className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{route.name}</span>
                        </span>
                      )}
                      {!route && bus.status === 'available' && (
                        <span className="text-green-600 font-semibold">Ready for deployment</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SUMMARY / DEPLOYMENT PLAN TAB ── */}
        {activeTab === 'summary' && (
          <div className="p-5 space-y-5">
            {planApproved ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Feeder Bus Deployment Plan — Approved &amp; Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">Awaiting Operational Plan Approval — Feeder plan will activate on approval</span>
              </div>
            )}

            {/* Combined transport summary */}
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-5 h-5 text-slate-300" />
                  <h4 className="font-semibold">Integrated Transport Deployment Plan — Tomorrow</h4>
                  {isHoliday && calendarModifier && (
                    <span className="ml-auto text-xs font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">
                      {calendarModifier.icon} {calendarModifier.surgeLabel ?? calendarModifier.label}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <ModeCard icon={<Train className="w-4 h-4 text-blue-300" />} label="Kochi Metro Rail" count={metroServiceCount} total={metroTotalCount} color="blue" unit="trains" />
                  <ModeCard icon={<Ship className="w-4 h-4 text-cyan-300" />} label="Water Metro" count={waterServiceCount} total={waterTotalCount} color="cyan" unit="boats" />
                  <ModeCard icon={<Bus className="w-4 h-4 text-orange-300" />} label="Feeder Buses" count={summary.assignedBuses} total={summary.totalBuses - summary.maintenanceBuses} color="orange" unit="buses" />
                </div>
              </div>

              <div className="p-4 bg-white">
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Route Deployment Summary</h5>
                <div className="space-y-2">
                  {computedRoutes.map(route => {
                    const cCfg = CONNECT_TYPE_CONFIG[route.connectsTo];
                    const ConnIcon = cCfg.icon;
                    return (
                      <div key={route.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                        <ConnIcon className={`w-3.5 h-3.5 flex-shrink-0 ${cCfg.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-800 truncate">{route.name}</div>
                          <div className="text-xs text-gray-400">{route.origin} → {route.destination}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-gray-800">
                            {route.assignedBusCount + route.requiredSurge}
                            <span className="text-xs text-gray-400 font-normal"> buses</span>
                          </div>
                          <div className="text-xs text-gray-400">Every {Math.max(3, route.peakFreqMin - (route.requiredSurge > 0 ? 2 : 0))} min peak</div>
                        </div>
                        {route.requiredSurge > 0 && (
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full flex-shrink-0">
                            +{route.requiredSurge}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-blue-700">{metroServiceCount + waterServiceCount + summary.assignedBuses}</div>
                <div className="text-xs text-blue-600 mt-0.5">Total Vehicles Deployed</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-green-700">{summary.routesCovered}</div>
                <div className="text-xs text-green-600 mt-0.5">Feeder Routes Active</div>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-orange-700">
                  {computedRoutes.reduce((s, r) => s + r.requiredSurge, 0)}
                </div>
                <div className="text-xs text-orange-600 mt-0.5">Surge Buses Deployed</div>
              </div>
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-teal-700">
                  {Math.ceil(totalDailyPax * calMult).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-teal-600 mt-0.5">Est. Feeder Passengers</div>
              </div>
            </div>

            {/* Operator breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Operator Coordination</h5>
              <div className="space-y-2">
                {[
                  { name: 'KMRL Feeder Services',    routes: computedRoutes.filter(r => r.operatorName === 'KMRL Feeder Services') },
                  { name: 'KSRTC Division 3',        routes: computedRoutes.filter(r => r.operatorName === 'KSRTC Division 3') },
                  { name: 'KSRTC Airport Express',   routes: computedRoutes.filter(r => r.operatorName === 'KSRTC Airport Express') },
                  { name: 'City Private Consortium', routes: computedRoutes.filter(r => r.operatorName === 'City Private Consortium') },
                ].map(op => (
                  <div key={op.name} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <Bus className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-700 font-medium">{op.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                      <span>{op.routes.length} routes</span>
                      <span className="font-semibold text-gray-700">
                        {op.routes.reduce((s, r) => s + r.assignedBusCount + r.requiredSurge, 0)} buses
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${planApproved ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {planApproved ? 'Notified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const KpiCard: React.FC<{
  icon: React.ReactNode; label: string; value: string; sub: string; highlight: boolean;
}> = ({ icon, label, value, sub, highlight }) => (
  <div className={`rounded-xl border p-4 ${highlight ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'} shadow-sm`}>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs text-gray-500 font-medium truncate">{label}</span>
    </div>
    <div className={`text-2xl font-bold ${highlight ? 'text-red-700' : 'text-gray-900'}`}>{value}</div>
    <div className={`text-xs mt-0.5 ${highlight ? 'text-red-600' : 'text-gray-400'}`}>{sub}</div>
  </div>
);

const ConnectivityCard: React.FC<{
  icon: React.ReactNode; label: string; count: number; buses: number;
  color: string; node: string; status: 'good' | 'low';
}> = ({ icon, label, count, buses, color, node, status }) => {
  const colors: Record<string, { card: string; border: string; badge: string }> = {
    blue: { card: 'from-blue-50 to-blue-100/40', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
    cyan: { card: 'from-cyan-50 to-cyan-100/40', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-700' },
  };
  const c = colors[color] ?? colors.blue;
  return (
    <div className={`rounded-xl bg-gradient-to-br ${c.card} border ${c.border} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-sm font-semibold text-gray-800">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{buses} <span className="text-base text-gray-400 font-normal">feeder buses</span></div>
      <div className="text-xs text-gray-500 mb-2">{count} routes connected</div>
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${status === 'good' ? 'bg-green-500' : 'bg-amber-500'}`} />
        <span className="text-xs text-gray-500">{node}</span>
      </div>
    </div>
  );
};

const ModeCard: React.FC<{
  icon: React.ReactNode; label: string; count: number; total: number; color: string; unit: string;
}> = ({ icon, label, count, total, color, unit }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const barColors: Record<string, string> = { blue: '#3b82f6', cyan: '#06b6d4', orange: '#f97316' };
  return (
    <div className="bg-white/10 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold text-white/80">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{count}<span className="text-sm text-white/60">/{total}</span></div>
      <div className="text-xs text-white/50 mb-1.5">{unit}</div>
      <div className="h-1 bg-white/10 rounded-full">
        <div className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: barColors[color] ?? '#fff' }} />
      </div>
    </div>
  );
};
