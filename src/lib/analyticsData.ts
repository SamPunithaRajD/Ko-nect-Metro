// Mock analytics data generators for KO-NECT operational dashboards

export type RidershipData = {
  date: string;
  metro: number;
  water: number;
  predicted?: boolean;
};

export type FleetAvailability = {
  category: string;
  running: number;
  maintenance: number;
  standby: number;
  total: number;
};

export type DriverAvailability = {
  shift: string;
  required: number;
  available: number;
  shortage: number;
};

export type DemandPeriod = {
  time: string;
  passengers: number;
  isPeak?: boolean;
};

export type TerminalLoad = {
  terminal: string;
  load: number;
  category: 'high' | 'medium' | 'low';
};

// Generate last 3 days + tomorrow prediction
export function generateRidershipTrend(): RidershipData[] {
  const today = new Date();
  const data: RidershipData[] = [];

  for (let i = -3; i <= 1; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    if (i === 1) {
      // Tomorrow prediction (slightly higher)
      data.push({
        date: `${dateStr} (Pred)`,
        metro: 42000 + Math.random() * 3000,
        water: 18000 + Math.random() * 2000,
        predicted: true
      });
    } else {
      // Historical data
      data.push({
        date: dateStr,
        metro: 38000 + Math.random() * 4000,
        water: 16000 + Math.random() * 3000,
        predicted: false
      });
    }
  }

  return data;
}

// Generate fleet availability snapshot
export function generateFleetAvailability(metroCount: number, waterCount: number, metroService: number, waterService: number): FleetAvailability[] {
  const metroMaintenance = Math.floor((metroCount - metroService) * 0.6);
  const metroStandby = metroCount - metroService - metroMaintenance;

  const waterMaintenance = Math.floor((waterCount - waterService) * 0.5);
  const waterStandby = waterCount - waterService - waterMaintenance;

  return [
    {
      category: 'Metro Trains',
      running: metroService,
      maintenance: metroMaintenance,
      standby: metroStandby,
      total: metroCount
    },
    {
      category: 'Water Boats',
      running: waterService,
      maintenance: waterMaintenance,
      standby: waterStandby,
      total: waterCount
    }
  ];
}

// Generate driver availability by shift
export function generateDriverAvailability(metroDrivers: number, waterDrivers: number, metroServiceCount: number, waterServiceCount: number): DriverAvailability[] {
  const totalDrivers = metroDrivers + waterDrivers;
  const totalRequired = metroServiceCount + waterServiceCount;

  const morningRequired = Math.ceil(totalRequired * 0.4);
  const afternoonRequired = Math.ceil(totalRequired * 0.35);
  const nightRequired = Math.ceil(totalRequired * 0.25);

  const morningAvailable = Math.ceil(totalDrivers * 0.38);
  const afternoonAvailable = Math.ceil(totalDrivers * 0.36);
  const nightAvailable = Math.ceil(totalDrivers * 0.26);

  return [
    {
      shift: 'Morning',
      required: morningRequired,
      available: morningAvailable,
      shortage: Math.max(0, morningRequired - morningAvailable)
    },
    {
      shift: 'Afternoon',
      required: afternoonRequired,
      available: afternoonAvailable,
      shortage: Math.max(0, afternoonRequired - afternoonAvailable)
    },
    {
      shift: 'Night',
      required: nightRequired,
      available: nightAvailable,
      shortage: Math.max(0, nightRequired - nightAvailable)
    }
  ];
}

// Generate today's demand curve (hourly)
export function generateTodayDemand(): DemandPeriod[] {
  const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

  return hours.map(time => {
    const hour = parseInt(time.split(':')[0]);
    let passengers = 2000;

    // Morning peak
    if (hour >= 8 && hour <= 9) {
      passengers = 5500 + Math.random() * 500;
    }
    // Evening peak
    else if (hour >= 17 && hour <= 19) {
      passengers = 5200 + Math.random() * 400;
    }
    // Normal hours
    else if (hour >= 10 && hour <= 16) {
      passengers = 3000 + Math.random() * 500;
    }

    return {
      time,
      passengers: Math.round(passengers),
      isPeak: (hour >= 8 && hour <= 9) || (hour >= 17 && hour <= 19)
    };
  });
}

// Generate terminal load distribution
export function generateTerminalLoad(): TerminalLoad[] {
  const terminals: TerminalLoad[] = [
    { terminal: 'Vyttila', load: 4500, category: 'high' },
    { terminal: 'Bolgatty', load: 3800, category: 'high' },
    { terminal: 'High Court', load: 3200, category: 'medium' },
    { terminal: 'Kakkanad', load: 2900, category: 'medium' },
    { terminal: 'Fort Kochi', load: 2400, category: 'medium' },
    { terminal: 'Eloor', load: 1800, category: 'low' },
    { terminal: 'Cheranalloor', load: 1500, category: 'low' }
  ];

  return terminals;
}
