import React, { useState, useMemo } from 'react';
import {
  Train, Ship, AlertTriangle, CheckCircle, XCircle,
  ArrowRight, Zap, Anchor
} from 'lucide-react';

const METRO_DEPOT = {
  iblBays: 6,
  cleaningBays: 4,
  stablingLines: 10,
};

const WATER_DEPOT = {
  serviceDocks: 8,
  maintenanceDocks: 3,
  chargingStations: 5,
};

const BASE_METRO_STATE = {
  iblOccupied: 3,
  cleaningOccupied: 2,
  stablingOccupied: 6,
  standby: 4,
};

const BASE_WATER_STATE = {
  serviceDocksOccupied: 5,
  maintenanceDocksOccupied: 2,
  chargingOccupied: 3,
  standby: 5,
};

type FleetType = 'metro' | 'water';

type SimResult = {
  serviceCoverage: 'covered' | 'no_standby' | 'depot_exceeded';
  standbyUsed: number;
  standbyAvailable: number;
  extraShunting: boolean;
  punctualityImpact: number;
  recoveryMinutes: number;
  details: string[];
};

function simulateMetroFailure(failCount: number): SimResult {
  const standbyAvailable = BASE_METRO_STATE.standby;
  const standbyUsed = Math.min(failCount, standbyAvailable);
  const uncovered = failCount - standbyUsed;
  const iblFree = METRO_DEPOT.iblBays - BASE_METRO_STATE.iblOccupied;
  const iblExceeded = BASE_METRO_STATE.iblOccupied + failCount > METRO_DEPOT.iblBays;

  let serviceCoverage: SimResult['serviceCoverage'];
  if (iblExceeded && uncovered > 0) serviceCoverage = 'depot_exceeded';
  else if (uncovered > 0) serviceCoverage = 'no_standby';
  else serviceCoverage = 'covered';

  const punctualityImpact = Math.min(uncovered * 2.4 + (iblExceeded ? 1.5 : 0), 18);
  const extraShunting = failCount > 2 || iblExceeded;
  const recoveryMinutes = serviceCoverage === 'covered' ? 10 : serviceCoverage === 'no_standby' ? 35 : 55;

  const details: string[] = [
    `${standbyAvailable} standby trains currently available`,
    `IBL Bays: ${BASE_METRO_STATE.iblOccupied}/${METRO_DEPOT.iblBays} occupied — ${iblFree} free`,
    `Stabling Lines: ${BASE_METRO_STATE.stablingOccupied}/${METRO_DEPOT.stablingLines} occupied`,
  ];
  if (uncovered > 0) details.push(`${uncovered} service route${uncovered > 1 ? 's' : ''} unable to be covered`);
  if (iblExceeded) details.push('IBL capacity exceeded — shunting to external stabling required');

  return { serviceCoverage, standbyUsed, standbyAvailable, extraShunting, punctualityImpact, recoveryMinutes, details };
}

function simulateWaterFailure(failCount: number): SimResult {
  const standbyAvailable = BASE_WATER_STATE.standby;
  const standbyUsed = Math.min(failCount, standbyAvailable);
  const uncovered = failCount - standbyUsed;
  const docksFree = WATER_DEPOT.serviceDocks - BASE_WATER_STATE.serviceDocksOccupied;
  const docksExceeded = BASE_WATER_STATE.maintenanceDocksOccupied + failCount > WATER_DEPOT.maintenanceDocks;

  let serviceCoverage: SimResult['serviceCoverage'];
  if (docksExceeded && uncovered > 0) serviceCoverage = 'depot_exceeded';
  else if (uncovered > 0) serviceCoverage = 'no_standby';
  else serviceCoverage = 'covered';

  const punctualityImpact = Math.min(uncovered * 3.1 + (docksExceeded ? 2 : 0), 22);
  const extraShunting = failCount > 1 || docksExceeded;
  const recoveryMinutes = serviceCoverage === 'covered' ? 15 : serviceCoverage === 'no_standby' ? 45 : 65;

  const details: string[] = [
    `${standbyAvailable} standby boats currently available`,
    `Service Docks: ${BASE_WATER_STATE.serviceDocksOccupied}/${WATER_DEPOT.serviceDocks} occupied — ${docksFree} free`,
    `Maintenance Docks: ${BASE_WATER_STATE.maintenanceDocksOccupied}/${WATER_DEPOT.maintenanceDocks} occupied`,
    `Charging Stations: ${BASE_WATER_STATE.chargingOccupied}/${WATER_DEPOT.chargingStations} occupied`,
  ];
  if (uncovered > 0) details.push(`${uncovered} terminal route${uncovered > 1 ? 's' : ''} unable to be covered`);
  if (docksExceeded) details.push('Maintenance dock capacity exceeded — emergency jetty mooring required');

  return { serviceCoverage, standbyUsed, standbyAvailable, extraShunting, punctualityImpact, recoveryMinutes, details };
}

const CapacityBar: React.FC<{ label: string; used: number; total: number; extra?: number }> = ({ label, used, total, extra = 0 }) => {
  const usedPct = Math.min((used / total) * 100, 100);
  const extraPct = Math.min(((used + extra) / total) * 100, 100);
  const overCapacity = used + extra > total;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className={`font-bold ${overCapacity ? 'text-red-600' : used + extra >= total * 0.85 ? 'text-amber-600' : 'text-gray-700'}`}>
          {used}{extra > 0 ? `+${extra}` : ''}/{total}
          {overCapacity && <span className="ml-1 text-red-500 text-xs font-bold"> EXCEEDED</span>}
        </span>
      </div>
      <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        {extra > 0 && (
          <div
            className="absolute inset-y-0 left-0 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(extraPct, 100)}%`, background: overCapacity ? '#ef4444' : '#f59e0b' }}
          />
        )}
        <div
          className="absolute inset-y-0 left-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${usedPct}%`,
            background: used / total > 0.85 ? '#dc2626' : used / total > 0.65 ? '#d97706' : '#16a34a',
          }}
        />
      </div>
    </div>
  );
};

const CoverageResult: React.FC<{ result: SimResult['serviceCoverage'] }> = ({ result }) => {
  if (result === 'covered') return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-lg px-4 py-3">
      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
      <div>
        <div className="text-sm font-bold text-green-800">Service Covered by Standby</div>
        <div className="text-xs text-green-700 mt-0.5">Standby vehicles will cover all failed routes</div>
      </div>
    </div>
  );
  if (result === 'no_standby') return (
    <div className="flex items-center gap-3 bg-amber-50 border border-amber-300 rounded-lg px-4 py-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
      <div>
        <div className="text-sm font-bold text-amber-800">No Standby Available</div>
        <div className="text-xs text-amber-700 mt-0.5">Some routes will experience a service gap</div>
      </div>
    </div>
  );
  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-300 rounded-lg px-4 py-3">
      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
      <div>
        <div className="text-sm font-bold text-red-800">Depot Capacity Exceeded</div>
        <div className="text-xs text-red-700 mt-0.5">Insufficient depot slots for failed vehicles</div>
      </div>
    </div>
  );
};

export const DepotSimulationPanel: React.FC = () => {
  const [fleetType, setFleetType] = useState<FleetType>('metro');
  const [failCount, setFailCount] = useState(1);
  const maxFail = fleetType === 'metro' ? 8 : 6;

  const result = useMemo(() =>
    fleetType === 'metro' ? simulateMetroFailure(failCount) : simulateWaterFailure(failCount),
    [fleetType, failCount]
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
          <Zap className="w-4 h-4 text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Depot Capacity Simulation</h3>
          <p className="text-xs text-gray-500">Live capacity validator based on approved plan</p>
        </div>
        <span className="ml-auto text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Dynamic</span>
      </div>

      {/* Toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-5">
        {(['metro', 'water'] as FleetType[]).map(type => (
          <button
            key={type}
            onClick={() => { setFleetType(type); setFailCount(1); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all ${
              fleetType === type
                ? type === 'metro'
                  ? 'bg-white shadow-sm text-blue-700 border border-blue-100'
                  : 'bg-white shadow-sm text-cyan-700 border border-cyan-100'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {type === 'metro' ? <Train className="w-3.5 h-3.5" /> : <Ship className="w-3.5 h-3.5" />}
            {type === 'metro' ? 'Metro Rail' : 'Water Metro'}
          </button>
        ))}
      </div>

      {/* Current occupancy */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Anchor className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            {fleetType === 'metro' ? 'Muttom Depot — Current Occupancy' : 'Water Metro Terminals — Current Occupancy'}
          </span>
        </div>
        {fleetType === 'metro' ? (
          <>
            <CapacityBar label="IBL Bays" used={BASE_METRO_STATE.iblOccupied} total={METRO_DEPOT.iblBays} extra={failCount} />
            <CapacityBar label="Cleaning Bays" used={BASE_METRO_STATE.cleaningOccupied} total={METRO_DEPOT.cleaningBays} />
            <CapacityBar label="Stabling Lines" used={BASE_METRO_STATE.stablingOccupied} total={METRO_DEPOT.stablingLines} />
          </>
        ) : (
          <>
            <CapacityBar label="Service Docks" used={BASE_WATER_STATE.serviceDocksOccupied} total={WATER_DEPOT.serviceDocks} />
            <CapacityBar label="Maintenance Docks" used={BASE_WATER_STATE.maintenanceDocksOccupied} total={WATER_DEPOT.maintenanceDocks} extra={failCount} />
            <CapacityBar label="Charging Stations" used={BASE_WATER_STATE.chargingOccupied} total={WATER_DEPOT.chargingStations} />
          </>
        )}
      </div>

      {/* Failure slider */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-red-800">
            Scenario: {fleetType === 'metro' ? 'Metro Train' : 'Water Boat'} Failures Tomorrow
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-red-700 font-medium whitespace-nowrap">
            {fleetType === 'metro' ? 'Trains Failed:' : 'Boats Failed:'}
          </span>
          <input
            type="range" min={1} max={maxFail} value={failCount}
            onChange={e => setFailCount(Number(e.target.value))}
            className="flex-1 accent-red-600 h-1.5"
          />
          <span className="text-lg font-bold text-red-700 w-6 text-center">{failCount}</span>
        </div>
        <div className="flex justify-between text-xs text-red-400 mt-1 px-0.5">
          <span>1</span><span>{maxFail}</span>
        </div>
      </div>

      <CoverageResult result={result.serviceCoverage} />

      {/* KPI metrics */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <div className={`text-xl font-bold ${result.punctualityImpact > 8 ? 'text-red-600' : result.punctualityImpact > 3 ? 'text-amber-600' : 'text-green-600'}`}>
            -{result.punctualityImpact.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-0.5 leading-tight">Punctuality Impact</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <div className={`text-sm font-bold mt-1 ${result.extraShunting ? 'text-amber-600' : 'text-green-600'}`}>
            {result.extraShunting ? 'Yes' : 'No'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5 leading-tight">Extra Shunting Required</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <div className={`text-xl font-bold ${result.recoveryMinutes > 40 ? 'text-red-600' : result.recoveryMinutes > 20 ? 'text-amber-600' : 'text-green-600'}`}>
            {result.recoveryMinutes}
          </div>
          <div className="text-xs text-gray-500 mt-0.5 leading-tight">Recovery Time (mins)</div>
        </div>
      </div>

      {/* Standby summary */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className={`rounded-lg p-3 border ${result.serviceCoverage === 'covered' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="text-xs text-gray-500 mb-1">Standby Available</div>
          <div className={`text-xl font-bold ${result.serviceCoverage === 'covered' ? 'text-green-700' : 'text-amber-700'}`}>{result.standbyAvailable}</div>
          <div className="text-xs text-gray-500">{fleetType === 'metro' ? 'trains' : 'boats'} on standby</div>
        </div>
        <div className={`rounded-lg p-3 border ${result.standbyUsed < failCount ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="text-xs text-gray-500 mb-1">Standby Deployed</div>
          <div className={`text-xl font-bold ${result.standbyUsed < failCount ? 'text-red-700' : 'text-blue-700'}`}>{result.standbyUsed}/{failCount}</div>
          <div className="text-xs text-gray-500">coverage ratio</div>
        </div>
      </div>

      {/* Simulation log */}
      <div className="mt-4 space-y-1.5">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Simulation Log</div>
        {result.details.map((d, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
            <ArrowRight className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
