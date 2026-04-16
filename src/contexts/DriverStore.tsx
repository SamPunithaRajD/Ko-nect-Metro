import React, { createContext, useContext, useState, useCallback } from 'react';

export type ShiftId = 'morning' | 'afternoon' | 'night';

export type Shift = {
  id: ShiftId;
  label: string;
  hours: string;
  color: string;
  bg: string;
  border: string;
};

export const SHIFTS: Shift[] = [
  { id: 'morning',   label: 'Morning Shift',   hours: '05:00–13:00', color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  { id: 'afternoon', label: 'Afternoon Shift',  hours: '13:00–18:00', color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  { id: 'night',     label: 'Night Shift',      hours: '18:00–22:00', color: 'text-slate-700',  bg: 'bg-slate-50',  border: 'border-slate-200' },
];

export type DriverType = 'metro' | 'water';
export type DriverStatus = 'available' | 'assigned' | 'unavailable';

export type Driver = {
  id: string;
  name: string;
  employeeId: string;
  driverType: DriverType;
  shift: ShiftId;
  status: DriverStatus;
  assignedVehicleId?: string;
  assignedVehicleNumber?: string;
  assignedVehicleName?: string;
  experience: number;
  licenseExpiry: string;
  licenseExpired: boolean;
  licenseExpiringSoon: boolean;
};

export type AssignmentRecord = {
  driverId: string;
  driverName: string;
  employeeId: string;
  driverType: DriverType;
  vehicleId: string;
  vehicleNumber: string;
  vehicleName: string;
  shift: ShiftId;
  assignedAt: Date;
};

export type ShiftSummary = {
  shift: Shift;
  driverType: DriverType;
  total: number;
  available: number;
  assigned: number;
  unavailable: number;
  licensedAvailable: number;
  expiredCount: number;
  expiringSoonCount: number;
  vehiclesScheduled: number;
  driversRequired: number;
  shortage: boolean;
  shortageCount: number;
  surplusCount: number;
  insufficientLicensed: boolean;
};

export type LicenseAlert = {
  driverId: string;
  driverName: string;
  employeeId: string;
  driverType: DriverType;
  licenseExpiry: string;
  expired: boolean;
  daysLeft: number;
};

export type DriverRequirementSummary = {
  driverType: DriverType;
  serviceVehicleCount: number;
  driversRequiredPerShift: number;
  driversRequiredTotal: number;
  totalLicensedAvailable: number;
  totalAssigned: number;
  totalShortage: number;
  totalSurplus: number;
  canFullyOperate: boolean;
};

type DriverStoreContextType = {
  metroDrivers: Driver[];
  waterDrivers: Driver[];
  metroAssignments: AssignmentRecord[];
  waterAssignments: AssignmentRecord[];
  assignmentPublished: boolean;
  metroServiceCount: number;
  waterServiceCount: number;
  allocateAllDrivers: (
    serviceMetroTrains: { id: string; vehicle_number: string; vehicle_name: string }[],
    serviceWaterBoats: { id: string; vehicle_number: string; vehicle_name: string }[]
  ) => void;
  publishAssignments: () => void;
  resetAllocations: () => void;
  getMetroShiftSummaries: () => ShiftSummary[];
  getWaterShiftSummaries: () => ShiftSummary[];
  getLicenseAlerts: () => LicenseAlert[];
  getMetroRequirements: () => DriverRequirementSummary;
  getWaterRequirements: () => DriverRequirementSummary;
};

// ─── Name pools ──────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  'Arjun','Suresh','Ramesh','Vinod','Pradeep','Sajan','Anil','Deepak','Manoj','Rajesh',
  'Binu','Sreejith','Jayakumar','Rajan','Sunil','Bibin','Anoop','Biju','Dipin','George',
  'Harish','Jithin','Krishnan','Lalu','Manu','Nabin','Oman','Prajeesh','Quby','Reji',
  'Sabu','Thomas','Unni','Vibin','Wilson','Xavier','Yesudas','Zain','Aby','Blesson',
  'Ciby','Davis','Edwin','Felix','Gibin','Harikrishnan','Indu','Joshy','Kevin','Lenin',
  'Manoj','Nidhin','Oommen','Prijo','Rinto','Sajeev','Tijo','Ullas','Varkey','Winson',
  'Ashwin','Bobby','Christy','Denny','Emil','Firoz','Gokul','Hareesh','Ivan','Jenson',
  'Kishore','Linson','Mathew','Nelson','Obed','Paul','Robin','Sanil','Tomy','Uday',
];
const LAST_NAMES = [
  'Nair','Kumar','Pillai','Menon','George','Thomas','Krishnan','Varma','Babu','Chandran',
  'Jose','Mohan','PV','Mathew','Varghese','Antony','Raj','Rajan','Soman','Philip',
  'Kurian','Simon','John','Xavier','Paul','Francis','Thampi','Nambiar','Eapen','Jacob',
  'Mammen','Baby','Das','Cherian','Sebastian','Sunny','Abraham','Bose','Divakar','Rao',
];

function makeName(idx: number): string {
  return `${FIRST_NAMES[idx % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(idx / FIRST_NAMES.length) % LAST_NAMES.length]}`;
}

// Realistic expiry dates: most valid 1-3 years out, a few expiring soon, a few expired
function makeExpiry(idx: number, seed: number): string {
  const now = new Date();
  // ~4% expired (idx + seed) % 25 === 0
  // ~6% expiring within 30 days (idx + seed) % 17 === 1
  // rest valid 6 months – 3 years
  const r = (idx + seed) % 100;
  if (r < 4) {
    // already expired: 1–90 days ago
    const daysAgo = 15 + (idx % 75);
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  }
  if (r < 10) {
    // expiring within 30 days
    const daysLeft = 5 + (idx % 25);
    const d = new Date(now);
    d.setDate(d.getDate() + daysLeft);
    return d.toISOString().slice(0, 10);
  }
  // valid: 6 months – 36 months
  const daysAhead = 180 + (idx % 900);
  const d = new Date(now);
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

function makeShift(idx: number): ShiftId {
  return (['morning', 'afternoon', 'night'] as ShiftId[])[idx % 3];
}

function makeStatus(idx: number): DriverStatus {
  if (idx % 11 === 0) return 'unavailable';
  return 'available';
}

function computeLicenseFlags(expiry: string): { expired: boolean; expiringSoon: boolean } {
  const now = Date.now();
  const exp = new Date(expiry).getTime();
  const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  return { expired: daysLeft <= 0, expiringSoon: daysLeft > 0 && daysLeft <= 30 };
}

// 75 metro drivers (25 trains × 3 shifts)
const METRO_DRIVERS_BASE: Driver[] = Array.from({ length: 75 }, (_, i) => {
  const expiry = makeExpiry(i, 7);
  const { expired, expiringSoon } = computeLicenseFlags(expiry);
  return {
    id: `md${String(i + 1).padStart(3, '0')}`,
    name: makeName(i),
    employeeId: `MET-${2000 + i + 1}`,
    driverType: 'metro',
    shift: makeShift(i),
    status: makeStatus(i),
    experience: 1 + (i % 14),
    licenseExpiry: expiry,
    licenseExpired: expired,
    licenseExpiringSoon: expiringSoon,
  };
});

// 225 water drivers (75 boats × 3 shifts)
const WATER_DRIVERS_BASE: Driver[] = Array.from({ length: 225 }, (_, i) => {
  const expiry = makeExpiry(i, 13);
  const { expired, expiringSoon } = computeLicenseFlags(expiry);
  return {
    id: `wd${String(i + 1).padStart(3, '0')}`,
    name: makeName(i + 75),
    employeeId: `WAT-${3000 + i + 1}`,
    driverType: 'water',
    shift: makeShift(i),
    status: makeStatus(i + 3),
    experience: 1 + (i % 12),
    licenseExpiry: expiry,
    licenseExpired: expired,
    licenseExpiringSoon: expiringSoon,
  };
});

// ─── Allocation helper ────────────────────────────────────────────────────────
// Each vehicle runs ALL 3 shifts → 1 driver needed per shift per vehicle.
// For N vehicles: each shift needs N drivers → total per day = N × 3.
// We assign one driver per vehicle per shift from the matching shift pool.
// Only drivers with valid licenses (not expired) and status=available are eligible.
function allocatePool(
  pool: Driver[],
  vehicles: { id: string; vehicle_number: string; vehicle_name: string }[],
  driverType: DriverType
): { updatedPool: Driver[]; assignments: AssignmentRecord[] } {
  const assignments: AssignmentRecord[] = [];

  // Reset all to base state (un-assign previously assigned drivers)
  const updatedPool: Driver[] = pool.map(d => ({
    ...d,
    status: (d.status === 'assigned' ? 'available' : d.status) as DriverStatus,
    assignedVehicleId: undefined,
    assignedVehicleNumber: undefined,
    assignedVehicleName: undefined,
  }));

  // Build eligible pool per shift: available + valid license
  const eligibleByShift: Record<ShiftId, number[]> = {
    morning:   updatedPool.map((d, i) => i).filter(i => updatedPool[i].shift === 'morning'   && updatedPool[i].status === 'available' && !updatedPool[i].licenseExpired),
    afternoon: updatedPool.map((d, i) => i).filter(i => updatedPool[i].shift === 'afternoon' && updatedPool[i].status === 'available' && !updatedPool[i].licenseExpired),
    night:     updatedPool.map((d, i) => i).filter(i => updatedPool[i].shift === 'night'     && updatedPool[i].status === 'available' && !updatedPool[i].licenseExpired),
  };

  // For each shift, assign 1 driver per vehicle (vehicle index maps to driver index)
  (['morning', 'afternoon', 'night'] as ShiftId[]).forEach(shiftId => {
    const eligible = eligibleByShift[shiftId];
    vehicles.forEach((vehicle, vIdx) => {
      const driverIdx = eligible[vIdx];
      if (driverIdx === undefined) return; // shortage — no driver available for this vehicle this shift
      updatedPool[driverIdx] = {
        ...updatedPool[driverIdx],
        status: 'assigned',
        assignedVehicleId: vehicle.id,
        assignedVehicleNumber: vehicle.vehicle_number,
        assignedVehicleName: vehicle.vehicle_name,
      };
      assignments.push({
        driverId: updatedPool[driverIdx].id,
        driverName: updatedPool[driverIdx].name,
        employeeId: updatedPool[driverIdx].employeeId,
        driverType,
        vehicleId: vehicle.id,
        vehicleNumber: vehicle.vehicle_number,
        vehicleName: vehicle.vehicle_name,
        shift: shiftId,
        assignedAt: new Date(),
      });
    });
  });

  return { updatedPool, assignments };
}

function buildShiftSummaries(
  pool: Driver[],
  driverType: DriverType,
  serviceVehicleCount: number
): ShiftSummary[] {
  // Each shift requires exactly serviceVehicleCount drivers (1 per vehicle)
  const driversRequired = serviceVehicleCount;

  return SHIFTS.map(shift => {
    const shiftDrivers = pool.filter(d => d.shift === shift.id);
    const available    = shiftDrivers.filter(d => d.status === 'available').length;
    const assigned     = shiftDrivers.filter(d => d.status === 'assigned').length;
    const unavailable  = shiftDrivers.filter(d => d.status === 'unavailable').length;
    const expiredCount     = shiftDrivers.filter(d => d.licenseExpired).length;
    const expiringSoonCount = shiftDrivers.filter(d => d.licenseExpiringSoon).length;
    // Licensed available = available + not expired
    const licensedAvailable = shiftDrivers.filter(d => d.status === 'available' && !d.licenseExpired).length;
    const effective = licensedAvailable + assigned;
    const shortage = driversRequired > 0 && effective < driversRequired;
    const insufficientLicensed = expiredCount > 0 && licensedAvailable < driversRequired;
    return {
      shift,
      driverType,
      total: shiftDrivers.length,
      available,
      assigned,
      unavailable,
      licensedAvailable,
      expiredCount,
      expiringSoonCount,
      vehiclesScheduled: serviceVehicleCount,
      driversRequired,
      shortage,
      shortageCount: shortage ? driversRequired - effective : 0,
      surplusCount:  shortage ? 0 : effective - driversRequired,
      insufficientLicensed,
    };
  });
}

function buildRequirements(
  pool: Driver[],
  driverType: DriverType,
  serviceVehicleCount: number
): DriverRequirementSummary {
  const driversRequiredPerShift = serviceVehicleCount;
  const driversRequiredTotal    = serviceVehicleCount * 3;
  const totalLicensedAvailable  = pool.filter(d => d.status !== 'unavailable' && !d.licenseExpired).length;
  const totalAssigned           = pool.filter(d => d.status === 'assigned').length;
  const gap = driversRequiredTotal - totalLicensedAvailable;
  return {
    driverType,
    serviceVehicleCount,
    driversRequiredPerShift,
    driversRequiredTotal,
    totalLicensedAvailable,
    totalAssigned,
    totalShortage: gap > 0 ? gap : 0,
    totalSurplus:  gap < 0 ? -gap : 0,
    canFullyOperate: gap <= 0,
  };
}

function buildLicenseAlerts(pool: Driver[]): LicenseAlert[] {
  const now = Date.now();
  return pool
    .filter(d => d.licenseExpired || d.licenseExpiringSoon)
    .map(d => {
      const exp = new Date(d.licenseExpiry).getTime();
      const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      return {
        driverId: d.id,
        driverName: d.name,
        employeeId: d.employeeId,
        driverType: d.driverType,
        licenseExpiry: d.licenseExpiry,
        expired: d.licenseExpired,
        daysLeft,
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

// ─── Context ──────────────────────────────────────────────────────────────────
const DriverStoreContext = createContext<DriverStoreContextType | null>(null);

export const DriverStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metroDrivers,     setMetroDrivers]     = useState<Driver[]>(METRO_DRIVERS_BASE);
  const [waterDrivers,     setWaterDrivers]     = useState<Driver[]>(WATER_DRIVERS_BASE);
  const [metroAssignments, setMetroAssignments] = useState<AssignmentRecord[]>([]);
  const [waterAssignments, setWaterAssignments] = useState<AssignmentRecord[]>([]);
  const [assignmentPublished, setAssignmentPublished] = useState(false);
  const [metroServiceCount, setMetroServiceCount] = useState(0);
  const [waterServiceCount, setWaterServiceCount] = useState(0);

  const allocateAllDrivers = useCallback((
    serviceMetroTrains: { id: string; vehicle_number: string; vehicle_name: string }[],
    serviceWaterBoats:  { id: string; vehicle_number: string; vehicle_name: string }[]
  ) => {
    const { updatedPool: updatedMetro, assignments: ma } = allocatePool(METRO_DRIVERS_BASE, serviceMetroTrains, 'metro');
    const { updatedPool: updatedWater, assignments: wa } = allocatePool(WATER_DRIVERS_BASE, serviceWaterBoats, 'water');
    setMetroDrivers(updatedMetro);
    setWaterDrivers(updatedWater);
    setMetroAssignments(ma);
    setWaterAssignments(wa);
    setMetroServiceCount(serviceMetroTrains.length);
    setWaterServiceCount(serviceWaterBoats.length);
    setAssignmentPublished(false);
  }, []);

  const publishAssignments = useCallback(() => {
    setAssignmentPublished(true);
  }, []);

  const resetAllocations = useCallback(() => {
    setMetroDrivers(METRO_DRIVERS_BASE);
    setWaterDrivers(WATER_DRIVERS_BASE);
    setMetroAssignments([]);
    setWaterAssignments([]);
    setMetroServiceCount(0);
    setWaterServiceCount(0);
    setAssignmentPublished(false);
  }, []);

  const getMetroShiftSummaries = useCallback(() =>
    buildShiftSummaries(metroDrivers, 'metro', metroServiceCount),
  [metroDrivers, metroServiceCount]);

  const getWaterShiftSummaries = useCallback(() =>
    buildShiftSummaries(waterDrivers, 'water', waterServiceCount),
  [waterDrivers, waterServiceCount]);

  const getLicenseAlerts = useCallback(() =>
    buildLicenseAlerts([...metroDrivers, ...waterDrivers]),
  [metroDrivers, waterDrivers]);

  const getMetroRequirements = useCallback(() =>
    buildRequirements(metroDrivers, 'metro', metroServiceCount),
  [metroDrivers, metroServiceCount]);

  const getWaterRequirements = useCallback(() =>
    buildRequirements(waterDrivers, 'water', waterServiceCount),
  [waterDrivers, waterServiceCount]);

  return (
    <DriverStoreContext.Provider value={{
      metroDrivers, waterDrivers,
      metroAssignments, waterAssignments,
      assignmentPublished,
      metroServiceCount, waterServiceCount,
      allocateAllDrivers, publishAssignments, resetAllocations,
      getMetroShiftSummaries, getWaterShiftSummaries,
      getLicenseAlerts, getMetroRequirements, getWaterRequirements,
    }}>
      {children}
    </DriverStoreContext.Provider>
  );
};

export const useDriverStore = () => {
  const ctx = useContext(DriverStoreContext);
  if (!ctx) throw new Error('useDriverStore must be used within DriverStoreProvider');
  return ctx;
};
