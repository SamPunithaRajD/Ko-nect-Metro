import React, { useState, useMemo } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, AlertTriangle, TrendingUp,
  Train, Ship, Users, Wrench, CheckCircle, Star, Bell, Info
} from 'lucide-react';
import {
  getDemandModifier, getUpcomingHolidays, KERALA_HOLIDAYS, DEMAND_MODIFIERS,
  formatDate, DayCategory, DemandModifier, KeralaHoliday
} from '../../lib/keralaCalendar';

const CATEGORY_LABELS: Record<DayCategory, string> = {
  weekday:       'Weekday',
  weekend:       'Weekend',
  public_holiday:'Public Holiday',
  festival_minor:'Festival Day',
  festival_major:'Major Festival',
  special_event: 'Special Event',
};

const DOT_COLORS: Record<DayCategory, string> = {
  weekday:       '',
  weekend:       'bg-blue-400',
  public_holiday:'bg-amber-500',
  festival_minor:'bg-orange-500',
  festival_major:'bg-red-500',
  special_event: 'bg-teal-500',
};

type Props = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
};

export const KeralaOperationalCalendar: React.FC<Props> = ({ selectedDate, onDateChange }) => {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [viewYear, setViewYear]   = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  const modifier = useMemo(() => getDemandModifier(selectedDate), [selectedDate]);
  const upcoming = useMemo(() => getUpcomingHolidays(21), []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow    = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const getHolidayForCell = (day: number): KeralaHoliday | null => {
    return KERALA_HOLIDAYS.find(h => h.month === viewMonth + 1 && h.day === day) ?? null;
  };

  const mod = modifier;
  const isHolidayOrFestival = mod.category !== 'weekday' && mod.category !== 'weekend';

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-800 text-sm">
              {new Date(viewYear, viewMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 border-b border-gray-50">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 p-2 gap-0.5">
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day  = i + 1;
            const date = new Date(viewYear, viewMonth, day);
            const holiday = getHolidayForCell(day);
            const dow  = date.getDay();
            const isWknd = dow === 0 || dow === 6;
            const isToday   = date.getTime() === today.getTime();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isTomorrow = date.getTime() === today.getTime() + 86400000;
            const cat: DayCategory = holiday ? holiday.category : isWknd ? 'weekend' : 'weekday';
            const dotColor = DOT_COLORS[cat];

            return (
              <button
                key={day}
                onClick={() => onDateChange(date)}
                className={`relative flex flex-col items-center justify-center rounded-lg py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : isToday
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : holiday
                    ? `${DEMAND_MODIFIERS[holiday.category].bg} ${DEMAND_MODIFIERS[holiday.category].color} border ${DEMAND_MODIFIERS[holiday.category].border}`
                    : isWknd
                    ? 'text-blue-600 hover:bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{day}</span>
                {dotColor && !isSelected && (
                  <span className={`w-1 h-1 rounded-full mt-0.5 ${dotColor}`} />
                )}
                {isTomorrow && !isSelected && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full border border-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="px-4 pb-3 pt-1 border-t border-gray-50 flex flex-wrap gap-3">
          {([
            ['bg-blue-400', 'Weekend'],
            ['bg-amber-500', 'Public Holiday'],
            ['bg-orange-500', 'Festival'],
            ['bg-red-500', 'Major Festival'],
            ['bg-teal-500', 'Special Event'],
          ] as [string, string][]).map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected date analysis */}
      <div className={`rounded-xl border p-5 ${mod.bg} ${mod.border}`}>
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{mod.icon}</span>
              <span className={`text-base font-bold ${mod.color}`}>{CATEGORY_LABELS[mod.category]}</span>
              {mod.surgeLabel && (
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${mod.badgeBg} ${mod.badge} border ${mod.border}`}>
                  {mod.surgeLabel}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 font-medium">{formatDate(selectedDate)}</div>
            {modifier.holiday && (
              <div className="mt-1 flex items-center gap-1.5">
                <Star className="w-3 h-3 text-amber-500" />
                <span className="text-sm font-semibold text-gray-800">{modifier.holiday.name}</span>
              </div>
            )}
          </div>
          <div className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${mod.badgeBg} ${mod.badge} ${mod.border}`}>
            +{Math.round((mod.passengerMultiplier - 1) * 100)}% demand vs normal
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">{mod.description}</p>

        {mod.alertMessage && (
          <div className={`flex items-start gap-2 p-3 rounded-lg border mb-4 ${
            mod.category === 'festival_major' ? 'bg-red-100 border-red-300 text-red-800' : 'bg-amber-100 border-amber-300 text-amber-800'
          }`}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-xs font-semibold">{mod.alertMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCell
            icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
            label="Passenger Demand"
            value={`×${mod.passengerMultiplier.toFixed(2)}`}
            sub="multiplier"
            highlight={mod.passengerMultiplier > 1.2}
          />
          <MetricCell
            icon={<Train className="w-4 h-4 text-blue-600" />}
            label="Metro Deploy Target"
            value={`${Math.round(mod.metroDeployTarget * 100)}%`}
            sub="of total fleet"
            highlight={mod.metroDeployTarget > 0.82}
          />
          <MetricCell
            icon={<Ship className="w-4 h-4 text-cyan-600" />}
            label="Water Metro Target"
            value={`${Math.round(mod.waterDeployTarget * 100)}%`}
            sub={`+${mod.waterMetroBoost}% leisure boost`}
            highlight={mod.waterMetroBoost > 20}
          />
          <MetricCell
            icon={<Wrench className="w-4 h-4 text-red-500" />}
            label="Maintenance Defer"
            value={mod.maintenanceReduction > 0 ? `−${mod.maintenanceReduction}%` : 'Normal'}
            sub="non-critical tasks"
            highlight={mod.maintenanceReduction > 30}
          />
          <MetricCell
            icon={<Users className="w-4 h-4 text-orange-600" />}
            label="Extra Drivers"
            value={mod.driverSurgeRequired ? 'Required' : 'Standard'}
            sub={mod.driverSurgeRequired ? 'Surge staffing' : 'Normal roster'}
            highlight={mod.driverSurgeRequired}
          />
          <MetricCell
            icon={<CheckCircle className="w-4 h-4 text-green-600" />}
            label="Day Type"
            value={CATEGORY_LABELS[mod.category]}
            sub="calendar classification"
            highlight={false}
          />
        </div>
      </div>

      {/* Upcoming holidays */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-gray-500" />
            <h4 className="text-sm font-semibold text-gray-800">Upcoming Kerala Holidays — Next 21 Days</h4>
          </div>
          <div className="space-y-2">
            {upcoming.slice(0, 8).map(({ date, holiday, daysUntil }) => {
              const cfg = DEMAND_MODIFIERS[holiday.category];
              return (
                <button
                  key={`${holiday.month}-${holiday.day}`}
                  onClick={() => onDateChange(date)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition hover:shadow-sm ${cfg.bg} ${cfg.border}`}
                >
                  <span className="text-base flex-shrink-0">{cfg.icon}</span>
                  <div className="flex-1 text-left min-w-0">
                    <div className={`text-xs font-bold truncate ${cfg.color}`}>{holiday.name}</div>
                    <div className="text-xs text-gray-500">
                      {date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badge}`}>
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                    </span>
                    <span className={`text-xs font-medium ${cfg.color}`}>
                      +{Math.round((cfg.passengerMultiplier - 1) * 100)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
            <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Click any date to preview AI demand adjustments. Selecting a date before running AI Planning will automatically apply the Kerala calendar demand multiplier to fleet deployment and driver calculations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCell: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight: boolean;
}> = ({ icon, label, value, sub, highlight }) => (
  <div className={`rounded-lg p-3 border ${highlight ? 'bg-white border-orange-200' : 'bg-white/60 border-gray-200'}`}>
    <div className="flex items-center gap-1.5 mb-1">
      {icon}
      <span className="text-xs text-gray-500 font-medium truncate">{label}</span>
    </div>
    <div className={`text-sm font-bold ${highlight ? 'text-orange-700' : 'text-gray-800'}`}>{value}</div>
    <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
  </div>
);
