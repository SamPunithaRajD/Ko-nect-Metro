export type DayCategory =
  | 'weekday'
  | 'weekend'
  | 'public_holiday'
  | 'festival_major'
  | 'festival_minor'
  | 'special_event';

export type DemandModifier = {
  category: DayCategory;
  label: string;
  description: string;
  passengerMultiplier: number;
  waterMetroBoost: number;    // extra % boost for water metro (leisure)
  maintenanceReduction: number; // reduce non-critical maintenance by this %
  metroDeployTarget: number;  // fraction of total metro fleet to deploy (0–1)
  waterDeployTarget: number;  // fraction of total water fleet to deploy (0–1)
  driverSurgeRequired: boolean;
  alertMessage: string | null;
  surgeLabel: string | null;
  color: string;
  bg: string;
  border: string;
  badge: string;
  badgeBg: string;
  icon: string;               // emoji/symbol used in UI labels
};

export type KeralaHoliday = {
  month: number;   // 1–12
  day: number;     // 1–31
  name: string;
  category: DayCategory;
  recurring: boolean; // true = fixed date each year; false = approximate (needs manual adjust)
};

export const KERALA_HOLIDAYS: KeralaHoliday[] = [
  // January
  { month: 1,  day: 1,  name: 'New Year\'s Day',             category: 'festival_major',  recurring: true },
  { month: 1,  day: 14, name: 'Makar Vilakku / Makaravilakku', category: 'festival_minor', recurring: true },
  { month: 1,  day: 26, name: 'Republic Day',                 category: 'public_holiday',  recurring: true },

  // February
  { month: 2,  day: 14, name: 'Valentine\'s Day (Event)',     category: 'special_event',   recurring: true },

  // March
  { month: 3,  day: 22, name: 'Holi',                         category: 'festival_minor',  recurring: true },

  // April
  { month: 4,  day: 14, name: 'Vishu',                        category: 'festival_major',  recurring: true },
  { month: 4,  day: 18, name: 'Good Friday',                  category: 'public_holiday',  recurring: true },

  // May
  { month: 5,  day: 1,  name: 'Kerala Labour Day',            category: 'public_holiday',  recurring: true },
  { month: 5,  day: 9,  name: 'Eid al-Fitr (approx.)',        category: 'festival_major',  recurring: false },

  // June
  { month: 6,  day: 17, name: 'Eid al-Adha (approx.)',        category: 'festival_major',  recurring: false },

  // August
  { month: 8,  day: 15, name: 'Independence Day',             category: 'public_holiday',  recurring: true },
  { month: 8,  day: 26, name: 'Onam – Thiruvonam',            category: 'festival_major',  recurring: true },
  { month: 8,  day: 22, name: 'Onam – Uthradom',              category: 'festival_minor',  recurring: true },
  { month: 8,  day: 23, name: 'Onam – Thiruvonam Eve',        category: 'festival_minor',  recurring: true },
  { month: 8,  day: 27, name: 'Onam – Avittam',               category: 'festival_minor',  recurring: true },

  // September
  { month: 9,  day: 5,  name: 'Milad-un-Nabi (approx.)',      category: 'festival_minor',  recurring: false },
  { month: 9,  day: 7,  name: 'Navaratri (first day)',         category: 'festival_minor',  recurring: true },
  { month: 9,  day: 12, name: 'Vijayadashami',                 category: 'festival_minor',  recurring: true },

  // October
  { month: 10, day: 2,  name: 'Gandhi Jayanti',               category: 'public_holiday',  recurring: true },
  { month: 10, day: 20, name: 'Diwali',                        category: 'festival_major',  recurring: true },

  // November
  { month: 11, day: 1,  name: 'Kerala Piravi (Kerala Day)',    category: 'public_holiday',  recurring: true },

  // December
  { month: 12, day: 24, name: 'Christmas Eve',                 category: 'festival_minor',  recurring: true },
  { month: 12, day: 25, name: 'Christmas Day',                 category: 'festival_major',  recurring: true },
  { month: 12, day: 26, name: 'Boxing Day / Holiday',          category: 'festival_minor',  recurring: true },
  { month: 12, day: 31, name: 'New Year\'s Eve',               category: 'festival_major',  recurring: true },
];

export const DEMAND_MODIFIERS: Record<DayCategory, DemandModifier> = {
  weekday: {
    category: 'weekday',
    label: 'Standard Weekday',
    description: 'Regular office commute pattern with morning and evening peak hours.',
    passengerMultiplier: 1.0,
    waterMetroBoost: 0,
    maintenanceReduction: 0,
    metroDeployTarget: 0.72,
    waterDeployTarget: 0.60,
    driverSurgeRequired: false,
    alertMessage: null,
    surgeLabel: null,
    color: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    badge: 'text-gray-600',
    badgeBg: 'bg-gray-100',
    icon: '🏢',
  },
  weekend: {
    category: 'weekend',
    label: 'Weekend / Leisure Day',
    description: 'Increased leisure travel, higher water metro usage, shifted peak to mid-morning.',
    passengerMultiplier: 1.12,
    waterMetroBoost: 25,
    maintenanceReduction: 0,
    metroDeployTarget: 0.68,
    waterDeployTarget: 0.78,
    driverSurgeRequired: false,
    alertMessage: null,
    surgeLabel: 'Weekend Leisure Mode',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'text-blue-700',
    badgeBg: 'bg-blue-100',
    icon: '🌊',
  },
  public_holiday: {
    category: 'public_holiday',
    label: 'Kerala Public Holiday',
    description: 'Government holiday — increased leisure travel, reduced maintenance scheduling recommended.',
    passengerMultiplier: 1.22,
    waterMetroBoost: 30,
    maintenanceReduction: 40,
    metroDeployTarget: 0.78,
    waterDeployTarget: 0.82,
    driverSurgeRequired: false,
    alertMessage: 'Public Holiday — Reduced Maintenance Recommended. Increase Service Capacity.',
    surgeLabel: 'Kerala Holiday Surge Mode Active',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'text-amber-700',
    badgeBg: 'bg-amber-100',
    icon: '🏛️',
  },
  festival_minor: {
    category: 'festival_minor',
    label: 'Kerala Festival Day',
    description: 'Regional festival — elevated demand across both metro and water metro networks.',
    passengerMultiplier: 1.28,
    waterMetroBoost: 35,
    maintenanceReduction: 50,
    metroDeployTarget: 0.82,
    waterDeployTarget: 0.86,
    driverSurgeRequired: true,
    alertMessage: 'Festival Day — Increase Service Capacity. Water Metro demand elevated.',
    surgeLabel: 'Kerala Holiday Surge Mode Active',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'text-orange-700',
    badgeBg: 'bg-orange-100',
    icon: '🎊',
  },
  festival_major: {
    category: 'festival_major',
    label: 'Major Festival — High Surge',
    description: 'Major Kerala festival (Onam, Christmas, New Year, Eid). Near-full fleet deployment recommended.',
    passengerMultiplier: 1.42,
    waterMetroBoost: 55,
    maintenanceReduction: 70,
    metroDeployTarget: 0.92,
    waterDeployTarget: 0.95,
    driverSurgeRequired: true,
    alertMessage: 'Festival Rush Expected – Increase Service Capacity. Near-full fleet deployment recommended.',
    surgeLabel: 'Kerala Festival Rush — Full Surge Mode',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'text-red-700',
    badgeBg: 'bg-red-100',
    icon: '🎆',
  },
  special_event: {
    category: 'special_event',
    label: 'Special Event Day',
    description: 'Citywide event or gathering — elevated demand, review service frequency.',
    passengerMultiplier: 1.18,
    waterMetroBoost: 20,
    maintenanceReduction: 30,
    metroDeployTarget: 0.76,
    waterDeployTarget: 0.80,
    driverSurgeRequired: false,
    alertMessage: 'Special Event — Elevated Passenger Demand Expected.',
    surgeLabel: 'Special Event Mode Active',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    badge: 'text-teal-700',
    badgeBg: 'bg-teal-100',
    icon: '📍',
  },
};

export function getHolidayForDate(date: Date): KeralaHoliday | null {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return KERALA_HOLIDAYS.find(h => h.month === m && h.day === d) ?? null;
}

export function getDayCategory(date: Date): DayCategory {
  const holiday = getHolidayForDate(date);
  if (holiday) return holiday.category;
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return 'weekend';
  return 'weekday';
}

export function getDemandModifier(date: Date): DemandModifier & { holiday: KeralaHoliday | null } {
  const holiday = getHolidayForDate(date);
  const category = holiday ? holiday.category : (date.getDay() === 0 || date.getDay() === 6 ? 'weekend' : 'weekday');
  return { ...DEMAND_MODIFIERS[category], holiday };
}

export function getTomorrowModifier(): DemandModifier & { holiday: KeralaHoliday | null } {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getDemandModifier(tomorrow);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function getUpcomingHolidays(daysAhead = 14): Array<{ date: Date; holiday: KeralaHoliday; daysUntil: number }> {
  const result: Array<{ date: Date; holiday: KeralaHoliday; daysUntil: number }> = [];
  const today = new Date();
  const year = today.getFullYear();

  for (const h of KERALA_HOLIDAYS) {
    for (const y of [year, year + 1]) {
      const d = new Date(y, h.month - 1, h.day);
      const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff <= daysAhead) {
        result.push({ date: d, holiday: h, daysUntil: diff });
      }
    }
  }

  return result.sort((a, b) => a.daysUntil - b.daysUntil);
}

export const CATEGORY_ORDER: DayCategory[] = ['weekday', 'weekend', 'public_holiday', 'festival_minor', 'festival_major', 'special_event'];
