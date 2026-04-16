import React, { useEffect, useRef, useState } from 'react';
import {
  TrendingDown, CheckCircle, Clock, Users, Cpu, ArrowDown, Train, Ship, Zap
} from 'lucide-react';

// ─── Hook: count-up animation ────────────────────────────────────────────────
function useCountUp(target: number, duration = 1600, start = false) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!start || startedRef.current) return;
    startedRef.current = true;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [start, target, duration]);

  return value;
}

// ─── Hook: intersection observer (trigger once) ───────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type KpiCard = {
  icon: React.ReactNode;
  label: string;
  value: string;         // display value e.g. "85%", "15 mins", "2"
  numericValue: number;  // the count-up target number
  suffix: string;        // e.g. "%", " mins", " staff"
  description: string;
  color: 'blue' | 'green' | 'amber' | 'red';
};

// ─── Single animated KPI card ─────────────────────────────────────────────────
const AnimatedKpiCard: React.FC<{ card: KpiCard; index: number; inView: boolean }> = ({
  card, index, inView
}) => {
  const count = useCountUp(card.numericValue, 1600, inView);

  const colorMap = {
    blue:  { bg: 'bg-blue-50',  border: 'border-blue-200',  icon: 'text-blue-600',  num: 'text-blue-700',  label: 'text-blue-900'  },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', num: 'text-green-700', label: 'text-green-900' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', num: 'text-amber-700', label: 'text-amber-900' },
    red:   { bg: 'bg-red-50',   border: 'border-red-200',   icon: 'text-red-600',   num: 'text-red-700',   label: 'text-red-900'   },
  };
  const c = colorMap[card.color];

  const style: React.CSSProperties = {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
  };

  return (
    <div
      className={`group ${c.bg} border ${c.border} rounded-xl p-5 cursor-default`}
      style={{
        ...style,
        transition: style.transition + ', box-shadow 0.25s ease, transform 0.25s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = inView ? 'translateY(0) scale(1.02)' : style.transform as string;
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = inView ? 'translateY(0) scale(1)' : style.transform as string;
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
      }}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${c.bg} border ${c.border}`}>
        <span className={c.icon}>{card.icon}</span>
      </div>
      <div className={`text-2xl font-bold ${c.num} leading-none mb-1`}>
        {count}{card.suffix}
      </div>
      <div className={`text-sm font-semibold ${c.label} mb-1`}>{card.label}</div>
      <div className="text-xs text-gray-500 leading-relaxed">{card.description}</div>
    </div>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const ImpactSection: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  cards: KpiCard[];
  columns?: 2 | 3;
}> = ({ title, subtitle, icon, accentColor, cards, columns = 3 }) => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}18` }}>
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        <div>
          <h4 className="text-base font-bold" style={{ color: accentColor }}>{title}</h4>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
        {cards.map((card, i) => (
          <AnimatedKpiCard key={card.label} card={card} index={i} inView={inView} />
        ))}
      </div>
    </div>
  );
};

// ─── Data definitions ─────────────────────────────────────────────────────────

const METRO_RAIL_CARDS: KpiCard[] = [
  {
    icon: <TrendingDown className="w-4 h-4" />,
    label: 'Night Planning Time',
    value: '15 mins',
    numericValue: 15,
    suffix: ' mins',
    description: 'Reduced from 120 mins to 15 mins. 87.5% time saving per planning cycle.',
    color: 'green',
  },
  {
    icon: <Users className="w-4 h-4" />,
    label: 'Planning Staff Required',
    value: '2 supervisors',
    numericValue: 2,
    suffix: ' supervisors',
    description: 'Down from 5–6 staff per night. Centralised AI-driven planning.',
    color: 'blue',
  },
  {
    icon: <Cpu className="w-4 h-4" />,
    label: 'Bogie Inspection Coordination',
    value: '85%',
    numericValue: 85,
    suffix: '%',
    description: 'Coordination overhead reduced via digital tracking and automated scheduling.',
    color: 'green',
  },
  {
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Pantograph Reconciliation',
    value: '100%',
    numericValue: 100,
    suffix: '%',
    description: 'Inspection reconciliation fully automated. Zero manual cross-checks required.',
    color: 'blue',
  },
  {
    icon: <Zap className="w-4 h-4" />,
    label: 'Rolling Stock Validation',
    value: '100%',
    numericValue: 100,
    suffix: '%',
    description: 'Automated certificate validation eliminates manual fitness checks.',
    color: 'green',
  },
  {
    icon: <Clock className="w-4 h-4" />,
    label: 'Driver Scheduling',
    value: '60%',
    numericValue: 60,
    suffix: '%',
    description: 'Scheduling effort reduced. Shift conflict detection is automated.',
    color: 'amber',
  },
];

const WATER_METRO_CARDS: KpiCard[] = [
  {
    icon: <TrendingDown className="w-4 h-4" />,
    label: 'Operational Coordination',
    value: '40%',
    numericValue: 40,
    suffix: '% less',
    description: 'Overall coordination load reduced by ~40% through digital role assignments.',
    color: 'green',
  },
  {
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Hull Inspection Reporting',
    value: '100%',
    numericValue: 100,
    suffix: '%',
    description: 'Centralised digital inspection logs replace scattered paper records.',
    color: 'blue',
  },
  {
    icon: <Cpu className="w-4 h-4" />,
    label: 'Jetty Readiness Automation',
    value: '100%',
    numericValue: 100,
    suffix: '%',
    description: 'Jetty readiness coordination automated via terminal demand balancing.',
    color: 'green',
  },
  {
    icon: <Users className="w-4 h-4" />,
    label: 'Crew Assignment Optimisation',
    value: '75%',
    numericValue: 75,
    suffix: '%',
    description: 'Crew rotation and assignment now AI-optimised, reducing scheduling effort.',
    color: 'blue',
  },
  {
    icon: <ArrowDown className="w-4 h-4" />,
    label: 'Manual Reconciliation',
    value: '90%',
    numericValue: 90,
    suffix: '%',
    description: 'Manual trip reconciliation almost fully eliminated via automated logging.',
    color: 'amber',
  },
  {
    icon: <Zap className="w-4 h-4" />,
    label: 'Terminal Demand Balancing',
    value: '100%',
    numericValue: 100,
    suffix: '%',
    description: 'Automated load balancing across all 7 terminals. Zero manual intervention.',
    color: 'green',
  },
];

const METRO_EMPLOYEE_CARDS: KpiCard[] = [
  {
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Bogie Scheduling Optimised',
    value: '85%',
    numericValue: 85,
    suffix: '%',
    description: 'Bogie inspection scheduling digitised. Automatic conflict-free slot allocation.',
    color: 'green',
  },
  {
    icon: <Cpu className="w-4 h-4" />,
    label: 'Pantograph Logging',
    value: '100%',
    numericValue: 100,
    suffix: '%',
    description: 'Pantograph wear logs now fully digital. Instant retrieval and audit trail.',
    color: 'blue',
  },
  {
    icon: <Zap className="w-4 h-4" />,
    label: 'HVAC & Brake Checks',
    value: '100%',
    numericValue: 100,
    suffix: '%',
    description: 'HVAC and brake check records centralised. No more scattered logbooks.',
    color: 'green',
  },
  {
    icon: <Users className="w-4 h-4" />,
    label: 'Driver Shift Validation',
    value: '100%',
    numericValue: 100,
    suffix: '%',
    description: 'Driver shift assignments auto-validated. Eliminates manual shift conflict checks.',
    color: 'blue',
  },
  {
    icon: <TrendingDown className="w-4 h-4" />,
    label: 'Excel Reconciliation Eliminated',
    value: '100%',
    numericValue: 100,
    suffix: '%',
    description: 'All Excel-based daily reconciliation replaced with real-time digital system.',
    color: 'amber',
  },
  {
    icon: <Clock className="w-4 h-4" />,
    label: 'Maintenance Planning Time',
    value: '60%',
    numericValue: 60,
    suffix: '% saved',
    description: 'Nightly maintenance planning streamlined from paper to integrated workflow.',
    color: 'green',
  },
];

const WATER_EMPLOYEE_CARDS: KpiCard[] = [
  {
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Hull Inspection Digitalised',
    value: '100%',
    numericValue: 100,
    suffix: '%',
    description: 'Boat hull inspection records now fully digital with photo and timestamp logs.',
    color: 'blue',
  },
  {
    icon: <Cpu className="w-4 h-4" />,
    label: 'Engine Health Tracking',
    value: '100%',
    numericValue: 100,
    suffix: '%',
    description: 'Engine health structured into KO-NECT. Automated alerts on anomalies.',
    color: 'green',
  },
  {
    icon: <Users className="w-4 h-4" />,
    label: 'Crew Rotation Automated',
    value: '75%',
    numericValue: 75,
    suffix: '%',
    description: 'Crew rotation scheduling automated. Reduces manual planning effort significantly.',
    color: 'blue',
  },
  {
    icon: <Zap className="w-4 h-4" />,
    label: 'Terminal Load Visibility',
    value: '100%',
    numericValue: 100,
    suffix: '%',
    description: 'Real-time terminal load visibility across all 7 Water Metro terminals.',
    color: 'green',
  },
  {
    icon: <TrendingDown className="w-4 h-4" />,
    label: 'Jetty Conflict Reduction',
    value: '80%',
    numericValue: 80,
    suffix: '%',
    description: 'Jetty scheduling conflicts reduced via AI-driven terminal allocation logic.',
    color: 'amber',
  },
  {
    icon: <ArrowDown className="w-4 h-4" />,
    label: 'Coordination Load',
    value: '40%',
    numericValue: 40,
    suffix: '% less',
    description: 'Daily coordination overhead reduced. Fewer phone calls, more digital workflows.',
    color: 'green',
  },
];

// ─── Public export: Admin ─────────────────────────────────────────────────────
export const AdminOperationalImpact: React.FC = () => {
  const { ref, inView } = useInView(0.1);

  return (
    <div
      ref={ref}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
          <TrendingDown className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">System-Wide Operational Impact</h3>
          <p className="text-sm text-gray-500">Measurable efficiency gains delivered by KO-NECT</p>
        </div>
        <span className="ml-auto text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full">
          Live Metrics
        </span>
      </div>

      <div className="space-y-8">
        <ImpactSection
          title="Metro Rail Impact"
          subtitle="Kochi Metro Rail Ltd — Train Operations"
          icon={<Train className="w-4 h-4" />}
          accentColor="#005DAA"
          cards={METRO_RAIL_CARDS}
          columns={3}
        />

        <div className="h-px bg-gray-100" />

        <ImpactSection
          title="Water Metro Impact"
          subtitle="KMRL Water Metro — Boat & Terminal Operations"
          icon={<Ship className="w-4 h-4" />}
          accentColor="#0891b2"
          cards={WATER_METRO_CARDS}
          columns={3}
        />
      </div>
    </div>
  );
};

// ─── Public export: Metro Employee ────────────────────────────────────────────
export const MetroEmployeeImpact: React.FC = () => {
  const { ref, inView } = useInView(0.1);

  return (
    <div
      ref={ref}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
          <Train className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: '#005DAA' }}>Metro Operational Improvements</h3>
          <p className="text-sm text-gray-500">Role-level efficiency gains for Metro employees</p>
        </div>
      </div>
      <ImpactSection
        title=""
        subtitle=""
        icon={null}
        accentColor="#005DAA"
        cards={METRO_EMPLOYEE_CARDS}
        columns={3}
      />
    </div>
  );
};

// ─── Public export: Water Metro Employee ──────────────────────────────────────
export const WaterMetroEmployeeImpact: React.FC = () => {
  const { ref, inView } = useInView(0.1);

  return (
    <div
      ref={ref}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200">
          <Ship className="w-5 h-5 text-cyan-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: '#0891b2' }}>Water Metro Operational Improvements</h3>
          <p className="text-sm text-gray-500">Role-level efficiency gains for Water Metro crew</p>
        </div>
      </div>
      <ImpactSection
        title=""
        subtitle=""
        icon={null}
        accentColor="#0891b2"
        cards={WATER_EMPLOYEE_CARDS}
        columns={3}
      />
    </div>
  );
};
