import React, { useState } from 'react';
import {
  Users, Wrench, ShieldCheck, BarChart2, Tag, LayoutGrid,
  AlertTriangle, CheckCircle, XCircle, Clock, Zap, Info,
  TrendingUp, ChevronRight, Anchor
} from 'lucide-react';

const MOCK_TRAINS = [
  { id: 'KM-001', name: 'Aluva Express', mileage: 142800, lastMileage: 140200, fitnessRS: 'valid', fitnessST: 'valid', fitnessExpiry: '2026-08-12', jobCards: 0, isBranded: true, brand: 'Kerala Tourism', bay: 'Inspection Bay A', stabling: 'Line 1', canRun: true },
  { id: 'KM-002', name: 'Palarivattom Flyer', mileage: 138400, lastMileage: 134900, fitnessRS: 'expiring_soon', fitnessST: 'valid', fitnessExpiry: '2026-03-02', jobCards: 1, isBranded: false, brand: null, bay: 'Stabling Line', stabling: 'Line 2', canRun: false },
  { id: 'KM-003', name: 'Lulu City Link', mileage: 119600, lastMileage: 118200, fitnessRS: 'valid', fitnessST: 'expired', fitnessExpiry: '2026-01-15', jobCards: 2, isBranded: true, brand: 'LuLu Mall', bay: 'Ready Line', stabling: 'Line 3', canRun: false },
  { id: 'KM-004', name: 'Edapally Metro', mileage: 156200, lastMileage: 154000, fitnessRS: 'valid', fitnessST: 'valid', fitnessExpiry: '2026-09-20', jobCards: 0, isBranded: false, brand: null, bay: 'Stabling Line', stabling: 'Line 1', canRun: true },
  { id: 'KM-005', name: 'JLN Stadium Liner', mileage: 102400, lastMileage: 101800, fitnessRS: 'valid', fitnessST: 'valid', fitnessExpiry: '2026-07-05', jobCards: 1, isBranded: true, brand: 'KSRTC', bay: 'Inspection Bay B', stabling: 'Line 4', canRun: false },
  { id: 'KM-006', name: 'MG Road Express', mileage: 164500, lastMileage: 162000, fitnessRS: 'expired', fitnessST: 'valid', fitnessExpiry: '2026-01-28', jobCards: 0, isBranded: false, brand: null, bay: 'Ready Line', stabling: 'Line 2', canRun: false },
  { id: 'KM-007', name: 'Kaloor Commuter', mileage: 97200, lastMileage: 95800, fitnessRS: 'valid', fitnessST: 'valid', fitnessExpiry: '2026-11-14', jobCards: 0, isBranded: false, brand: null, bay: 'Ready Line', stabling: 'Line 3', canRun: true },
  { id: 'KM-008', name: 'Thrippunithura Link', mileage: 88100, lastMileage: 87400, fitnessRS: 'valid', fitnessST: 'valid', fitnessExpiry: '2026-10-30', jobCards: 0, isBranded: true, brand: 'Cochin Shipyard', bay: 'Ready Line', stabling: 'Line 5', canRun: true },
];

const JOB_CARDS = [
  { id: 'JC-2024-0441', trainId: 'KM-002', type: 'Bogie Inspection', urgency: 'high', status: 'open', raised: '2026-02-15' },
  { id: 'JC-2024-0438', trainId: 'KM-003', type: 'Door Sensor Fault', urgency: 'critical', status: 'open', raised: '2026-02-14' },
  { id: 'JC-2024-0437', trainId: 'KM-003', type: 'AC Unit Leak', urgency: 'medium', status: 'open', raised: '2026-02-13' },
  { id: 'JC-2024-0435', trainId: 'KM-005', type: 'Pantograph Wear Check', urgency: 'medium', status: 'open', raised: '2026-02-12' },
  { id: 'JC-2024-0430', trainId: 'KM-001', type: 'Brake Pad Replacement', urgency: 'low', status: 'closed', raised: '2026-02-10' },
];

const FITNESS_STATUS: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  valid: { label: 'Valid', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
  expiring_soon: { label: 'Expiring Soon', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
  expired: { label: 'Expired', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
};

const URGENCY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-amber-100 text-amber-800 border-amber-300',
  low: 'bg-gray-100 text-gray-700 border-gray-300',
};

const FitnessBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = FITNESS_STATUS[status] ?? FITNESS_STATUS.valid;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <Icon style={{ width: 10, height: 10 }} />
      {cfg.label}
    </span>
  );
};

export const ManpowerCleaningPanel: React.FC = () => {
  const available = 18;
  const required = 24;
  const deepCleanRequired = 8;
  const baysOccupied = 5;
  const baysTotal = 7;

  const ratio = available / required;
  const statusLabel = ratio >= 1 ? 'Sufficient Manpower' : ratio >= 0.8 ? 'Limited Manpower' : 'Insufficient for All Trains';
  const statusColor = ratio >= 1 ? 'text-green-700 bg-green-50 border-green-200' : ratio >= 0.8 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200';
  const StatusIcon = ratio >= 1 ? CheckCircle : AlertTriangle;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-blue-50">
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">Manpower & Cleaning Availability</h3>
      </div>

      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-4 ${statusColor}`}>
        <StatusIcon style={{ width: 14, height: 14 }} />
        <span className="text-xs font-bold">{statusLabel}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900">{available}</div>
          <div className="text-xs text-gray-500 mt-0.5">Staff Available Tonight</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900">{required}</div>
          <div className="text-xs text-gray-500 mt-0.5">Staff Required (Full Coverage)</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-amber-700">{deepCleanRequired}</div>
          <div className="text-xs text-amber-600 mt-0.5">Trains Needing Deep Clean</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-700">{baysOccupied}/{baysTotal}</div>
          <div className="text-xs text-blue-600 mt-0.5">Cleaning Bays Occupied</div>
        </div>
      </div>

      <div className="mb-1 flex justify-between text-xs text-gray-500">
        <span>Manpower coverage</span>
        <span>{Math.round(ratio * 100)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${Math.min(ratio * 100, 100)}%`, backgroundColor: ratio >= 1 ? '#16a34a' : ratio >= 0.8 ? '#d97706' : '#dc2626' }}
        />
      </div>
      {ratio < 1 && (
        <p className="text-xs text-red-600 mt-2 font-medium">
          Warning: {required - available} additional cleaning staff needed before 05:00 morning service.
        </p>
      )}
    </div>
  );
};

export const FitnessCertificatePanel: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const displayTrains = expanded ? MOCK_TRAINS : MOCK_TRAINS.slice(0, 5);
  const cannotRunCount = MOCK_TRAINS.filter(t => !t.canRun).length;
  const expiringSoonCount = MOCK_TRAINS.filter(t => t.fitnessRS === 'expiring_soon' || t.fitnessST === 'expiring_soon').length;
  const expiredCount = MOCK_TRAINS.filter(t => t.fitnessRS === 'expired' || t.fitnessST === 'expired').length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-green-50">
          <ShieldCheck className="w-4 h-4 text-green-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">Fitness Certificate & Clearance</h3>
        <div className="ml-auto flex gap-2">
          {expiredCount > 0 && <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{expiredCount} Expired</span>}
          {expiringSoonCount > 0 && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{expiringSoonCount} Expiring</span>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-green-50 rounded-lg p-2">
          <div className="text-lg font-bold text-green-700">{MOCK_TRAINS.filter(t => t.canRun).length}</div>
          <div className="text-xs text-green-600">Clear to Run</div>
        </div>
        <div className="bg-red-50 rounded-lg p-2">
          <div className="text-lg font-bold text-red-700">{cannotRunCount}</div>
          <div className="text-xs text-red-600">Cannot Run</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-lg font-bold text-gray-700">{MOCK_TRAINS.length}</div>
          <div className="text-xs text-gray-500">Total Assessed</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-2 text-gray-400 font-semibold uppercase tracking-wide">Train</th>
              <th className="text-left py-2 px-2 text-gray-400 font-semibold uppercase tracking-wide">RS Fitness</th>
              <th className="text-left py-2 px-2 text-gray-400 font-semibold uppercase tracking-wide">ST Fitness</th>
              <th className="text-left py-2 px-2 text-gray-400 font-semibold uppercase tracking-wide">Expiry</th>
              <th className="text-left py-2 px-2 text-gray-400 font-semibold uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {displayTrains.map(t => (
              <tr key={t.id} className={`border-b border-gray-50 hover:bg-gray-50 ${!t.canRun ? 'bg-red-50/30' : ''}`}>
                <td className="py-2 px-2 font-medium text-gray-800">{t.id}</td>
                <td className="py-2 px-2"><FitnessBadge status={t.fitnessRS} /></td>
                <td className="py-2 px-2"><FitnessBadge status={t.fitnessST} /></td>
                <td className="py-2 px-2 text-gray-500">{t.fitnessExpiry}</td>
                <td className="py-2 px-2">
                  {t.canRun
                    ? <span className="inline-flex items-center gap-1 text-green-700 font-semibold"><CheckCircle style={{ width: 10, height: 10 }} /> Cleared</span>
                    : <span className="inline-flex items-center gap-1 text-red-700 font-semibold"><XCircle style={{ width: 10, height: 10 }} /> Blocked</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {MOCK_TRAINS.length > 5 && (
        <button onClick={() => setExpanded(e => !e)} className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
          {expanded ? 'Show less' : `Show all ${MOCK_TRAINS.length} trains`}
          <ChevronRight style={{ width: 12, height: 12, transform: expanded ? 'rotate(90deg)' : 'none' }} />
        </button>
      )}
    </div>
  );
};

export const JobCardPanel: React.FC = () => {
  const open = JOB_CARDS.filter(j => j.status === 'open');
  const closed = JOB_CARDS.filter(j => j.status === 'closed');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-orange-50">
          <Wrench className="w-4 h-4 text-orange-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">Job Card / Maintenance Status</h3>
        <span className="ml-auto text-xs text-gray-400">Maximo Export</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
          <div className="text-2xl font-bold text-red-700">{open.length}</div>
          <div className="text-xs text-red-600 mt-0.5">Open Job Cards</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
          <div className="text-2xl font-bold text-green-700">{closed.length}</div>
          <div className="text-xs text-green-600 mt-0.5">Closed (Resolved)</div>
        </div>
      </div>

      <div className="space-y-2">
        {JOB_CARDS.map(jc => (
          <div key={jc.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${jc.status === 'open' ? 'bg-red-50/40 border-red-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-800">{jc.trainId}</span>
                <span className="text-xs text-gray-500">#{jc.id}</span>
              </div>
              <div className="text-xs text-gray-600 truncate">{jc.type}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${URGENCY_COLORS[jc.urgency]}`}>{jc.urgency}</span>
              {jc.status === 'open'
                ? <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Blocked</span>
                : <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Done</span>
              }
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
        <Info style={{ width: 10, height: 10 }} />
        Trains with open job cards cannot be inducted into service.
      </p>
    </div>
  );
};

export const MileageBalancingPanel: React.FC = () => {
  const avg = Math.round(MOCK_TRAINS.reduce((s, t) => s + t.mileage, 0) / MOCK_TRAINS.length);
  const sorted = [...MOCK_TRAINS].sort((a, b) => a.mileage - b.mileage);
  const low = sorted.slice(0, 3);
  const high = sorted.slice(-3).reverse();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-teal-50">
          <BarChart2 className="w-4 h-4 text-teal-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">Mileage Balancing</h3>
        <span className="ml-auto text-xs text-gray-400">Fleet avg: {avg.toLocaleString()} km</span>
      </div>

      <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 mb-4 flex items-start gap-2">
        <TrendingUp className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-teal-800 font-medium">
          AI Suggestion: Prioritise low-mileage trains for service tomorrow to balance wear distribution across the fleet.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Low Mileage (Prioritise)</div>
          {low.map(t => (
            <div key={t.id} className="flex items-center justify-between text-xs mb-1.5 bg-green-50 rounded px-2 py-1.5 border border-green-100">
              <span className="font-semibold text-gray-800">{t.id}</span>
              <span className="text-green-700 font-bold">{(t.mileage / 1000).toFixed(0)}k km</span>
            </div>
          ))}
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">High Mileage (Rest)</div>
          {high.map(t => (
            <div key={t.id} className="flex items-center justify-between text-xs mb-1.5 bg-red-50 rounded px-2 py-1.5 border border-red-100">
              <span className="font-semibold text-gray-800">{t.id}</span>
              <span className="text-red-700 font-bold">{(t.mileage / 1000).toFixed(0)}k km</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const BrandingPriorityPanel: React.FC = () => {
  const branded = MOCK_TRAINS.filter(t => t.isBranded);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-yellow-50">
          <Tag className="w-4 h-4 text-yellow-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">Branding Priority</h3>
        <span className="ml-auto text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">{branded.length} Branded Trains</span>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-800 font-medium">
          Branded trains must run daily to fulfil advertising contracts. These are included in the AI service selection with highest priority.
        </p>
      </div>

      <div className="space-y-2">
        {branded.map(t => (
          <div key={t.id} className={`flex items-center justify-between p-2.5 rounded-lg border ${t.canRun ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div>
              <div className="text-xs font-bold text-gray-800">{t.id} — {t.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">Sponsor: {t.brand}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-300">Brand Priority</span>
              {t.canRun
                ? <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">In Plan</span>
                : <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Cert Issue</span>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DepotGeometryPanel: React.FC = () => {
  const inspectionBay = MOCK_TRAINS.filter(t => t.bay.startsWith('Inspection'));
  const stablingLine = MOCK_TRAINS.filter(t => t.bay === 'Stabling Line');
  const readyLine = MOCK_TRAINS.filter(t => t.bay === 'Ready Line');

  const bays: { label: string; capacity: number; trains: typeof MOCK_TRAINS; color: string; bg: string }[] = [
    { label: 'Inspection Bay', capacity: 4, trains: inspectionBay, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
    { label: 'Stabling Lines', capacity: 12, trains: stablingLine, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Ready Lines', capacity: 8, trains: readyLine, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-slate-50">
          <LayoutGrid className="w-4 h-4 text-slate-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">Stabling & Depot Geometry</h3>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 flex items-start gap-2">
        <Anchor className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-700 font-medium">
          AI Optimal Arrangement: Place high-priority service trains on Ready Lines. Move maintenance trains to Inspection Bay first. <span className="font-bold">Minimise shunting movements.</span>
        </p>
      </div>

      <div className="space-y-3">
        {bays.map(bay => {
          const pct = (bay.trains.length / bay.capacity) * 100;
          return (
            <div key={bay.label} className={`rounded-lg border p-3 ${bay.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${bay.color}`}>{bay.label}</span>
                <span className={`text-xs font-bold ${bay.color}`}>{bay.trains.length}/{bay.capacity}</span>
              </div>
              <div className="w-full h-1.5 bg-white/70 rounded-full mb-2">
                <div className="h-1.5 rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pct > 90 ? '#dc2626' : pct > 70 ? '#d97706' : '#16a34a' }} />
              </div>
              <div className="flex flex-wrap gap-1">
                {bay.trains.map(t => (
                  <span key={t.id} className="text-xs font-medium bg-white/80 px-1.5 py-0.5 rounded border text-gray-700 border-gray-200">{t.id}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DisruptionSimulationPanel: React.FC = () => {
  const [failCount, setFailCount] = useState(2);

  const extraBoatsNeeded = Math.ceil(failCount * 1.5);
  const affectedPassengers = failCount * 1800;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-red-50">
          <Zap className="w-4 h-4 text-red-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">Disruption & What-If Simulation</h3>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">UI Simulation</span>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-red-800">Scenario: Metro Train Failures Tomorrow</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-red-700 font-medium">Trains Failed:</span>
          <input
            type="range" min={1} max={6} value={failCount}
            onChange={e => setFailCount(Number(e.target.value))}
            className="flex-1 accent-red-600"
          />
          <span className="text-sm font-bold text-red-700 w-4 text-center">{failCount}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="text-xs text-amber-700 font-semibold mb-1">System Response:</div>
          <p className="text-xs text-amber-800">
            If <strong>{failCount} metro train{failCount > 1 ? 's' : ''} fail</strong> tomorrow → system suggests increasing Water Metro boats by <strong>{extraBoatsNeeded}</strong> extra trips to absorb demand.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs text-blue-700 font-semibold mb-1">Alternate Operation:</div>
          <p className="text-xs text-blue-800">
            Deploy <strong>{extraBoatsNeeded} additional boats</strong> on Vyttila–High Court route. Estimated passenger impact: <strong>~{affectedPassengers.toLocaleString()} passengers</strong>. Activate standby drivers immediately.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-xs text-green-700 font-semibold mb-1">Contingency Capacity:</div>
          <p className="text-xs text-green-800">
            Current water fleet has <strong>7 standby boats</strong> available. Coverage: <strong>{Math.min(Math.round((7 / extraBoatsNeeded) * 100), 100)}%</strong> of disruption capacity.
          </p>
        </div>
      </div>
    </div>
  );
};
