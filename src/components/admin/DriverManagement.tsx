import React, { useState } from 'react';
import {
  Users, Clock, Train, Ship, AlertTriangle, CheckCircle,
  TrendingDown, ChevronRight, Lightbulb, ChevronDown, ChevronUp,
  AlertCircle, ShieldAlert, BadgeAlert, Calculator, Gauge
} from 'lucide-react';
import {
  useDriverStore, SHIFTS, ShiftId, Driver, ShiftSummary,
  LicenseAlert, DriverRequirementSummary
} from '../../contexts/DriverStore';

const STATUS_CFG = {
  available:   { label: 'Available',   color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  assigned:    { label: 'On Duty',     color: 'text-blue-700',  bg: 'bg-blue-100',  dot: 'bg-blue-500' },
  unavailable: { label: 'Unavailable', color: 'text-gray-500',  bg: 'bg-gray-100',  dot: 'bg-gray-400' },
};

const ShiftPill: React.FC<{ shiftId: ShiftId }> = ({ shiftId }) => {
  const s = SHIFTS.find(x => x.id === shiftId)!;
  return (
    <span className={`inline-flex items-center gap-1 font-semibold border rounded-full px-2 py-0.5 text-xs ${s.color} ${s.bg} ${s.border}`}>
      <Clock className="w-3 h-3" />{s.label}
    </span>
  );
};

// ── Requirement panel ─────────────────────────────────────────────────────────
const RequirementPanel: React.FC<{
  req: DriverRequirementSummary;
  icon: React.ElementType;
  label: string;
  accentClass: string;
}> = ({ req, icon: Icon, label, accentClass }) => {
  if (req.serviceVehicleCount === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-4 h-4 ${accentClass}`} />
          <span className="font-semibold text-gray-700 text-sm">{label} — Driver Requirements</span>
        </div>
        <p className="text-xs text-gray-400 italic">Run AI Planning to calculate driver requirements based on scheduled vehicles.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border-2 p-5 ${req.canFullyOperate ? 'border-green-200' : 'border-red-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${accentClass}`} />
          <span className="font-semibold text-gray-900 text-sm">{label} — Driver Requirements</span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${req.canFullyOperate ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {req.canFullyOperate ? 'Fully Staffed' : 'Understaffed'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{req.driversRequiredPerShift}</div>
          <div className="text-xs text-gray-500 mt-0.5">Drivers Required / Shift</div>
          <div className="text-xs text-gray-400 mt-0.5">1 per {label === 'Metro Rail' ? 'train' : 'boat'} × {req.serviceVehicleCount} vehicles</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{req.driversRequiredTotal}</div>
          <div className="text-xs text-gray-500 mt-0.5">Required Today (All Shifts)</div>
          <div className="text-xs text-gray-400 mt-0.5">{req.driversRequiredPerShift} × 3 shifts</div>
        </div>
        <div className={`rounded-lg p-3 text-center ${req.totalLicensedAvailable >= req.driversRequiredTotal ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-2xl font-bold ${req.totalLicensedAvailable >= req.driversRequiredTotal ? 'text-green-700' : 'text-red-700'}`}>
            {req.totalLicensedAvailable}
          </div>
          <div className={`text-xs mt-0.5 ${req.totalLicensedAvailable >= req.driversRequiredTotal ? 'text-green-600' : 'text-red-600'}`}>Licensed & Available</div>
          <div className="text-xs text-gray-400 mt-0.5">valid license only</div>
        </div>
        <div className={`rounded-lg p-3 text-center ${req.canFullyOperate ? 'bg-blue-50' : 'bg-red-50'}`}>
          <div className={`text-2xl font-bold ${req.canFullyOperate ? 'text-blue-700' : 'text-red-700'}`}>
            {req.canFullyOperate ? `+${req.totalSurplus}` : `-${req.totalShortage}`}
          </div>
          <div className={`text-xs mt-0.5 ${req.canFullyOperate ? 'text-blue-600' : 'text-red-600'}`}>
            {req.canFullyOperate ? 'Surplus Reserve' : 'Shortage'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">drivers</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
        <div className="flex items-center gap-1.5 font-semibold text-gray-700 mb-1">
          <Calculator className="w-3.5 h-3.5" />
          Calculation
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between"><span>{req.serviceVehicleCount} {label === 'Metro Rail' ? 'trains' : 'boats'} in service</span></div>
          <div className="flex justify-between"><span>× 1 driver per vehicle per shift</span></div>
          <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-1 mt-1"><span>= {req.driversRequiredPerShift} per shift</span></div>
          <div className="flex justify-between font-semibold text-gray-900"><span>= {req.driversRequiredTotal} total (3 shifts)</span></div>
        </div>
      </div>
    </div>
  );
};

// ── Shift summary card ────────────────────────────────────────────────────────
const ShiftCard: React.FC<{ summary: ShiftSummary; vehicleLabel: string; icon: React.ElementType }> = ({ summary, vehicleLabel, icon: Icon }) => {
  const coverPct = summary.driversRequired > 0
    ? Math.min(100, Math.round(((summary.licensedAvailable + summary.assigned) / summary.driversRequired) * 100))
    : 100;
  return (
    <div className={`bg-white rounded-xl border-2 p-4 ${summary.shortage ? 'border-red-300' : summary.insufficientLicensed ? 'border-amber-300' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${summary.shift.color}`}>{summary.shift.label}</div>
          <div className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{summary.shift.hours}</div>
        </div>
        {summary.shortage
          ? <span className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" />Shortage</span>
          : summary.insufficientLicensed
            ? <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full"><BadgeAlert className="w-3 h-3" />License Issue</span>
            : <span className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" />Adequate</span>
        }
      </div>

      <div className="space-y-1.5 mb-3">
        {[
          { label: 'Licensed & Available', val: summary.licensedAvailable, dot: 'bg-green-500', color: 'text-green-700' },
          { label: 'On Duty',              val: summary.assigned,           dot: 'bg-blue-500',  color: 'text-blue-700'  },
          { label: 'Off / Leave',          val: summary.unavailable,        dot: 'bg-gray-300',  color: 'text-gray-500'  },
          { label: 'Expired License',      val: summary.expiredCount,       dot: 'bg-red-400',   color: 'text-red-600'   },
          { label: 'Expiring ≤30 days',    val: summary.expiringSoonCount,  dot: 'bg-amber-400', color: 'text-amber-600' },
        ].filter(r => r.val > 0 || r.label === 'Licensed & Available' || r.label === 'On Duty').map(r => (
          <div key={r.label} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${r.dot}`} />
              <span className="text-xs text-gray-600">{r.label}</span>
            </div>
            <span className={`text-xs font-bold ${r.color}`}>{r.val}</span>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="flex items-center gap-1 text-gray-500"><Icon className="w-3 h-3" />{vehicleLabel} needing 1 driver</span>
          <span className="font-bold text-gray-800">{summary.driversRequired}</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all ${summary.shortage ? 'bg-red-400' : summary.insufficientLicensed ? 'bg-amber-400' : 'bg-green-400'}`}
            style={{ width: `${coverPct}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{coverPct}% staffing coverage</div>
      </div>

      {summary.shortage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
          <p className="text-xs font-bold text-red-700 mb-1">
            {summary.shortageCount} driver{summary.shortageCount !== 1 ? 's' : ''} short for this shift
          </p>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-xs text-red-600"><TrendingDown className="w-3 h-3 flex-shrink-0" />Reduce {vehicleLabel.toLowerCase()} in this shift</div>
            <div className="flex items-center gap-1 text-xs text-red-600"><Ship className="w-3 h-3 flex-shrink-0" />Increase alternate service trips</div>
          </div>
        </div>
      )}
      {!summary.shortage && summary.surplusCount > 0 && (
        <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5">
          +{summary.surplusCount} surplus drivers available as standby
        </div>
      )}
    </div>
  );
};

// ── License alert panel ───────────────────────────────────────────────────────
const LicenseAlertPanel: React.FC<{ alerts: LicenseAlert[] }> = ({ alerts }) => {
  const [showAll, setShowAll] = useState(false);
  const expired      = alerts.filter(a => a.expired);
  const expiringSoon = alerts.filter(a => !a.expired);
  const displayed    = showAll ? alerts : alerts.slice(0, 6);

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${expired.length > 0 ? 'border-red-300' : 'border-amber-300'}`}>
      <div className={`px-5 py-3 flex items-center gap-3 ${expired.length > 0 ? 'bg-red-50' : 'bg-amber-50'}`}>
        <ShieldAlert className={`w-5 h-5 flex-shrink-0 ${expired.length > 0 ? 'text-red-600' : 'text-amber-600'}`} />
        <div className="flex-1">
          <p className={`font-bold text-sm ${expired.length > 0 ? 'text-red-900' : 'text-amber-900'}`}>
            Driver License Compliance Alerts
          </p>
          <p className={`text-xs mt-0.5 ${expired.length > 0 ? 'text-red-700' : 'text-amber-700'}`}>
            {expired.length > 0 && <span className="font-semibold">{expired.length} expired</span>}
            {expired.length > 0 && expiringSoon.length > 0 && ' · '}
            {expiringSoon.length > 0 && <span>{expiringSoon.length} expiring within 30 days</span>}
            {expired.length > 0 && ' — these drivers are excluded from AI assignment'}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {expired.length > 0 && (
            <span className="text-xs font-bold bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">{expired.length} Expired</span>
          )}
          {expiringSoon.length > 0 && (
            <span className="text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">{expiringSoon.length} Expiring Soon</span>
          )}
        </div>
      </div>

      <div className="bg-white divide-y divide-gray-50">
        {displayed.map(alert => (
          <div key={alert.driverId} className={`px-5 py-2.5 flex items-center gap-3 ${alert.expired ? 'bg-red-50/40' : 'bg-amber-50/30'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${alert.expired ? 'bg-red-500' : 'bg-amber-500'}`}>
              {alert.driverName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">{alert.driverName}</span>
                <span className="text-xs text-gray-400 font-mono">{alert.employeeId}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${alert.driverType === 'metro' ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-cyan-700 bg-cyan-50 border-cyan-200'}`}>
                  {alert.driverType === 'metro' ? 'Metro' : 'Water Metro'}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              {alert.expired ? (
                <div className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  EXPIRED {Math.abs(alert.daysLeft)}d ago
                </div>
              ) : (
                <div className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Expires in {alert.daysLeft}d
                </div>
              )}
              <div className="text-xs text-gray-400 mt-0.5">{new Date(alert.licenseExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length > 6 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-center">
          <button
            onClick={() => setShowAll(v => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800 transition"
          >
            {showAll ? <><ChevronUp className="w-3.5 h-3.5" />Show fewer alerts</> : <><ChevronDown className="w-3.5 h-3.5" />Show all {alerts.length} license alerts</>}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Driver table ──────────────────────────────────────────────────────────────
const DriverTable: React.FC<{ drivers: Driver[]; vehicleIcon: React.ElementType; vehicleLabel: string }> = ({ drivers, vehicleIcon: VIcon, vehicleLabel }) => {
  const [activeShift, setActiveShift] = useState<ShiftId | 'all'>('all');
  const [showAll, setShowAll] = useState(false);

  const filtered  = activeShift === 'all' ? drivers : drivers.filter(d => d.shift === activeShift);
  const displayed = showAll ? filtered : filtered.slice(0, 20);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <VIcon className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-gray-900 text-sm">{vehicleLabel} Driver Pool</span>
          <span className="text-xs text-gray-400">{drivers.length} total</span>
          <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">{drivers.filter(d => d.licenseExpired).length} expired</span>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">{drivers.filter(d => d.licenseExpiringSoon).length} expiring soon</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {[{ id: 'all', label: `All (${drivers.length})` }, ...SHIFTS.map(s => ({ id: s.id, label: `${s.label.split(' ')[0]} (${drivers.filter(d => d.shift === s.id).length})` }))].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveShift(tab.id as ShiftId | 'all'); setShowAll(false); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${activeShift === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {displayed.map(driver => {
          const sc = STATUS_CFG[driver.status];
          return (
            <div key={driver.id} className={`px-4 py-2.5 flex items-center gap-3 ${driver.licenseExpired ? 'bg-red-50/30' : driver.licenseExpiringSoon ? 'bg-amber-50/20' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${driver.licenseExpired ? 'bg-red-400' : 'bg-gradient-to-br from-blue-700 to-blue-900'}`}>
                {driver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{driver.name}</span>
                  <span className="text-xs text-gray-400 font-mono">{driver.employeeId}</span>
                  {driver.licenseExpired && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <ShieldAlert className="w-2.5 h-2.5" />License Expired
                    </span>
                  )}
                  {!driver.licenseExpired && driver.licenseExpiringSoon && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Expiring Soon</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <ShiftPill shiftId={driver.shift} />
                  {driver.status === 'assigned' && driver.assignedVehicleNumber && (
                    <span className="flex items-center gap-1 text-xs text-blue-700 font-medium">
                      <VIcon className="w-3 h-3" />{driver.assignedVehicleNumber}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">Lic: {new Date(driver.licenseExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {driver.licenseExpired ? (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Blocked
                  </span>
                ) : (
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                  </span>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-gray-200" />
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length > 20 && (
        <div className="px-5 py-3 border-t border-gray-100 flex justify-center">
          <button
            onClick={() => setShowAll(v => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            {showAll ? <><ChevronUp className="w-3.5 h-3.5" />Show less</> : <><ChevronDown className="w-3.5 h-3.5" />Show all {filtered.length} drivers</>}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const DriverManagement: React.FC<{
  onNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}> = ({ onNotification: _ }) => {
  const {
    metroDrivers, waterDrivers,
    metroAssignments, waterAssignments,
    assignmentPublished,
    metroServiceCount, waterServiceCount,
    getMetroShiftSummaries, getWaterShiftSummaries,
    getLicenseAlerts, getMetroRequirements, getWaterRequirements,
  } = useDriverStore();

  const [activePool, setActivePool] = useState<'metro' | 'water'>('metro');

  const metroSummaries    = getMetroShiftSummaries();
  const waterSummaries    = getWaterShiftSummaries();
  const metroReq          = getMetroRequirements();
  const waterReq          = getWaterRequirements();
  const licenseAlerts     = getLicenseAlerts();

  const metroShortages    = metroSummaries.filter(s => s.shortage);
  const waterShortages    = waterSummaries.filter(s => s.shortage);
  const licenseBlocked    = [...metroDrivers, ...waterDrivers].filter(d => d.licenseExpired);

  const metroAvail        = metroDrivers.filter(d => d.status === 'available' && !d.licenseExpired).length;
  const metroOnDuty       = metroDrivers.filter(d => d.status === 'assigned').length;
  const metroUnavail      = metroDrivers.filter(d => d.status === 'unavailable').length;

  const waterAvail        = waterDrivers.filter(d => d.status === 'available' && !d.licenseExpired).length;
  const waterOnDuty       = waterDrivers.filter(d => d.status === 'assigned').length;
  const waterUnavail      = waterDrivers.filter(d => d.status === 'unavailable').length;

  const currentAssignments = activePool === 'metro' ? metroAssignments : waterAssignments;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Driver Management</h2>
          <p className="text-gray-500 mt-0.5 text-sm">Metro Rail and Water Metro crew availability, shift allocation, driver assignment and license compliance</p>
        </div>
        {assignmentPublished && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">Assignments Published to All Employees</span>
          </div>
        )}
      </div>

      {(metroShortages.length > 0 || waterShortages.length > 0 || licenseBlocked.length > 0) && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="font-bold text-red-900">Operational Alert</span>
          </div>
          {licenseBlocked.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-red-800">
              <ShieldAlert className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span><strong>{licenseBlocked.length} drivers</strong> have expired licenses and have been excluded from AI driver assignment. Insufficient licensed drivers for full operations.</span>
            </div>
          )}
          {metroShortages.map(s => (
            <div key={`ms-${s.shift.id}`} className="flex items-start gap-2 text-sm text-red-800">
              <Train className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Metro Rail — Insufficient drivers for <strong>{s.shift.label.toLowerCase()}</strong>: need {s.driversRequired}, only {s.licensedAvailable + s.assigned} licensed available. <strong>Reduce trains or increase standby vehicles.</strong></span>
            </div>
          ))}
          {waterShortages.map(s => (
            <div key={`ws-${s.shift.id}`} className="flex items-start gap-2 text-sm text-red-800">
              <Ship className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Water Metro — Insufficient crew for <strong>{s.shift.label.toLowerCase()}</strong>: need {s.driversRequired}, only {s.licensedAvailable + s.assigned} licensed available. <strong>Reduce boat deployments.</strong></span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RequirementPanel req={metroReq} icon={Train} label="Metro Rail" accentClass="text-blue-700" />
        <RequirementPanel req={waterReq} icon={Ship}  label="Water Metro" accentClass="text-cyan-700" />
      </div>

      {licenseAlerts.length > 0 && <LicenseAlertPanel alerts={licenseAlerts} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Train className="w-5 h-5 text-blue-700" />
            <span className="font-bold text-blue-900">Metro Rail Driver Pool</span>
            <span className="ml-auto text-xs font-bold text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-full">75 drivers</span>
          </div>
          <div className="text-xs text-blue-600 mb-3">25 trains × 3 drivers/train — 1 driver per train per shift</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Licensed Available', val: metroAvail,   color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'On Duty',            val: metroOnDuty,  color: 'text-blue-700',  bg: 'bg-blue-50'  },
              { label: 'Off / Leave',        val: metroUnavail, color: 'text-gray-500',  bg: 'bg-gray-50'  },
            ].map(s => (
              <div key={s.label} className={`rounded-lg p-2.5 text-center ${s.bg}`}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                <div className={`text-xs font-medium mt-0.5 ${s.color}`}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl border border-cyan-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Ship className="w-5 h-5 text-cyan-700" />
            <span className="font-bold text-cyan-900">Water Metro Crew Pool</span>
            <span className="ml-auto text-xs font-bold text-cyan-700 bg-white border border-cyan-200 px-2 py-0.5 rounded-full">225 drivers</span>
          </div>
          <div className="text-xs text-cyan-600 mb-3">75 boats × 3 crew/vessel — 1 crew per boat per shift</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Licensed Available', val: waterAvail,   color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'On Duty',            val: waterOnDuty,  color: 'text-cyan-700',  bg: 'bg-cyan-50'  },
              { label: 'Off / Leave',        val: waterUnavail, color: 'text-gray-500',  bg: 'bg-gray-50'  },
            ].map(s => (
              <div key={s.label} className={`rounded-lg p-2.5 text-center ${s.bg}`}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                <div className={`text-xs font-medium mt-0.5 ${s.color}`}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActivePool('metro')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition ${activePool === 'metro' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
        >
          <Train className="w-4 h-4" />Metro Rail
          {metroServiceCount > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{metroServiceCount} trains</span>}
        </button>
        <button
          onClick={() => setActivePool('water')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition ${activePool === 'water' ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
        >
          <Ship className="w-4 h-4" />Water Metro
          {waterServiceCount > 0 && <span className="text-xs bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded-full">{waterServiceCount} boats</span>}
        </button>
      </div>

      {activePool === 'metro' && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-4 h-4 text-blue-700" />
              <h3 className="font-semibold text-gray-900">Metro Rail — Shift Staffing Status</h3>
            </div>
            {metroServiceCount > 0
              ? <p className="text-xs text-gray-500 mb-4">Each shift requires <strong>{metroServiceCount} drivers</strong> (1 per running train). Total for the day: <strong>{metroServiceCount * 3} drivers</strong>.</p>
              : <p className="text-xs text-gray-400 mb-4 italic">Run AI Planning to calculate real requirements based on scheduled trains.</p>
            }
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metroSummaries.map(s => <ShiftCard key={s.shift.id} summary={s} vehicleLabel="Trains" icon={Train} />)}
            </div>
          </div>
          <DriverTable drivers={metroDrivers} vehicleIcon={Train} vehicleLabel="Metro Rail" />
        </>
      )}

      {activePool === 'water' && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-4 h-4 text-cyan-700" />
              <h3 className="font-semibold text-gray-900">Water Metro — Shift Staffing Status</h3>
            </div>
            {waterServiceCount > 0
              ? <p className="text-xs text-gray-500 mb-4">Each shift requires <strong>{waterServiceCount} crew members</strong> (1 per running vessel). Total for the day: <strong>{waterServiceCount * 3} crew</strong>.</p>
              : <p className="text-xs text-gray-400 mb-4 italic">Run AI Planning to calculate real requirements based on scheduled boats.</p>
            }
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {waterSummaries.map(s => <ShiftCard key={s.shift.id} summary={s} vehicleLabel="Boats" icon={Ship} />)}
            </div>
          </div>
          <DriverTable drivers={waterDrivers} vehicleIcon={Ship} vehicleLabel="Water Metro" />
        </>
      )}

      {(metroShortages.length > 0 || waterShortages.length > 0 || licenseAlerts.filter(a => a.expired).length > 0) && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm mb-1">Operational Recommendations</p>
            <ul className="text-xs text-amber-800 space-y-1">
              {licenseAlerts.filter(a => a.expired).length > 0 && (
                <li>• <strong>Renew {licenseAlerts.filter(a => a.expired).length} expired licenses</strong> immediately — these drivers cannot legally operate and are excluded from all assignments</li>
              )}
              {licenseAlerts.filter(a => !a.expired).length > 0 && (
                <li>• <strong>Schedule renewal</strong> for {licenseAlerts.filter(a => !a.expired).length} licenses expiring within 30 days to avoid disruption</li>
              )}
              {(metroShortages.length > 0 || waterShortages.length > 0) && (
                <>
                  <li>• <strong>Reduce fleet size</strong> in shortage shifts to match available licensed crew</li>
                  <li>• <strong>Activate standby reserve</strong> — contact off-duty drivers for emergency deployment with overtime authorisation</li>
                  <li>• <strong>Cross-shift cover</strong> — drivers from adjacent shifts may cover subject to fatigue policy limits</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}

      {currentAssignments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {activePool === 'metro' ? <Train className="w-5 h-5 text-blue-700" /> : <Ship className="w-5 h-5 text-cyan-700" />}
              <h3 className="font-semibold text-gray-900">
                {activePool === 'metro' ? 'Metro Rail' : 'Water Metro'} Driver Assignment List
              </h3>
              {assignmentPublished && (
                <span className="text-xs font-bold bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />Published
                </span>
              )}
            </div>
            <span className="ml-auto text-xs text-gray-500">{currentAssignments.length} assignments · 1 driver per {activePool === 'metro' ? 'train' : 'boat'} per shift</span>
          </div>
          <div className="divide-y divide-gray-50">
            {SHIFTS.map(shift => {
              const rows = currentAssignments.filter(a => a.shift === shift.id);
              if (rows.length === 0) return null;
              const VIcon = activePool === 'metro' ? Train : Ship;
              const required = activePool === 'metro' ? metroServiceCount : waterServiceCount;
              const shortage = rows.length < required;
              return (
                <div key={shift.id}>
                  <div className={`px-5 py-2 flex items-center gap-2 ${shift.bg}`}>
                    <Clock className={`w-3.5 h-3.5 ${shift.color}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${shift.color}`}>{shift.label}</span>
                    <span className={`text-xs ${shift.color} opacity-70`}>{shift.hours}</span>
                    <span className={`ml-auto text-xs font-semibold ${shift.color}`}>{rows.length} / {required} assigned</span>
                    {shortage && <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{required - rows.length} short</span>}
                  </div>
                  {rows.slice(0, 8).map(a => (
                    <div key={`${a.driverId}-${a.shift}`} className="px-5 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {a.driverName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{a.driverName}</p>
                        <p className="text-xs text-gray-400">{a.employeeId}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-blue-700 flex-shrink-0">
                        <VIcon className="w-3.5 h-3.5" />{a.vehicleNumber}
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block truncate max-w-[140px]">{a.vehicleName}</div>
                    </div>
                  ))}
                  {rows.length > 8 && (
                    <div className={`px-5 py-2 text-xs text-gray-400 italic ${shift.bg}`}>+ {rows.length - 8} more in this shift…</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {currentAssignments.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium text-sm">No assignments yet</p>
          <p className="text-gray-400 text-xs mt-1">Run AI Operational Planning to auto-allocate licensed drivers to scheduled vehicles</p>
        </div>
      )}
    </div>
  );
};
