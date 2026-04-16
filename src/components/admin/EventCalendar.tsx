import React, { useState, useMemo } from 'react';
import {
  CalendarDays, Plus, X, Trash2, MapPin, Users, Train, Ship,
  Clock, AlertTriangle, CheckCircle, Star, ChevronDown, ChevronUp,
  Bell, Info, Activity
} from 'lucide-react';
import { getDemandModifier, formatDate } from '../../lib/keralaCalendar';
import { KeralaOperationalCalendar } from './KeralaCalendar';
import { useEventStore, OperationalEvent, EventImpact } from '../../contexts/EventStore';

const IMPACT_LABELS: Record<EventImpact, string> = { low: 'Low', medium: 'Medium', high: 'High' };

const IMPACT_COLORS: Record<EventImpact, { bg: string; text: string; border: string }> = {
  low:    { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-300' },
  medium: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-300' },
  high:   { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-300' },
};

const AddEventForm: React.FC<{ defaultDate: string; onClose: () => void }> = ({ defaultDate, onClose }) => {
  const { addEvent } = useEventStore();
  const [form, setForm] = useState({
    name: '',
    date: defaultDate,
    timeStart: '09:00',
    timeEnd: '18:00',
    location: '',
    expectedCrowd: 5000,
    metroImpact: 'medium' as EventImpact,
    waterImpact: 'low' as EventImpact,
  });

  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) return;
    addEvent(form);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50">
            <Plus className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-gray-900">Add Operational Event</span>
        </div>
        <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Event Name</label>
          <input
            type="text" value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. Kochi Marathon, Cochin Carnival"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Event Date</label>
            <input
              type="date" value={form.date} onChange={e => set('date', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Expected Crowd</label>
            <input
              type="number" value={form.expectedCrowd} onChange={e => set('expectedCrowd', Number(e.target.value))}
              min={100} step={500}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time</label>
            <input type="time" value={form.timeStart} onChange={e => set('timeStart', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">End Time</label>
            <input type="time" value={form.timeEnd} onChange={e => set('timeEnd', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
          <input
            type="text" value={form.location} onChange={e => set('location', e.target.value)}
            placeholder="e.g. Marine Drive, Ernakulam"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Metro Rail Impact</label>
            <div className="flex gap-1.5">
              {(['low', 'medium', 'high'] as EventImpact[]).map(level => (
                <button key={level} type="button" onClick={() => set('metroImpact', level)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    form.metroImpact === level
                      ? `${IMPACT_COLORS[level].bg} ${IMPACT_COLORS[level].text} ${IMPACT_COLORS[level].border}`
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}>
                  {IMPACT_LABELS[level]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Water Metro Impact</label>
            <div className="flex gap-1.5">
              {(['low', 'medium', 'high'] as EventImpact[]).map(level => (
                <button key={level} type="button" onClick={() => set('waterImpact', level)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    form.waterImpact === level
                      ? `${IMPACT_COLORS[level].bg} ${IMPACT_COLORS[level].text} ${IMPACT_COLORS[level].border}`
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}>
                  {IMPACT_LABELS[level]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
          Cancel
        </button>
        <button type="submit" className="flex-1 py-2 rounded-lg text-xs font-semibold text-white transition" style={{ backgroundColor: '#005DAA' }}>
          Add Event
        </button>
      </div>
    </form>
  );
};

const EventCard: React.FC<{ event: OperationalEvent }> = ({ event }) => {
  const { removeEvent } = useEventStore();
  const isExtended = (() => {
    const [sh] = event.timeStart.split(':').map(Number);
    const [eh] = event.timeEnd.split(':').map(Number);
    return sh < 6 || eh > 22;
  })();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${IMPACT_COLORS[event.metroImpact].bg} border ${IMPACT_COLORS[event.metroImpact].border}`}>
            <Activity className={`w-3.5 h-3.5 ${IMPACT_COLORS[event.metroImpact].text}`} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{event.name}</div>
            <div className="text-xs text-gray-500">{event.timeStart} – {event.timeEnd}</div>
          </div>
        </div>
        <button onClick={() => removeEvent(event.id)} className="p-1 rounded-lg hover:bg-red-50 transition">
          <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Users className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span>{event.expectedCrowd.toLocaleString()} expected</span>
        </div>
      </div>

      <div className="flex gap-2">
        <div className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg border ${IMPACT_COLORS[event.metroImpact].bg} ${IMPACT_COLORS[event.metroImpact].border}`}>
          <Train className={`w-3 h-3 ${IMPACT_COLORS[event.metroImpact].text}`} />
          <span className={`text-xs font-semibold ${IMPACT_COLORS[event.metroImpact].text}`}>Metro: {IMPACT_LABELS[event.metroImpact]}</span>
        </div>
        <div className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg border ${IMPACT_COLORS[event.waterImpact].bg} ${IMPACT_COLORS[event.waterImpact].border}`}>
          <Ship className={`w-3 h-3 ${IMPACT_COLORS[event.waterImpact].text}`} />
          <span className={`text-xs font-semibold ${IMPACT_COLORS[event.waterImpact].text}`}>Water: {IMPACT_LABELS[event.waterImpact]}</span>
        </div>
      </div>

      {isExtended && (
        <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-800">Extended Service Required</span>
        </div>
      )}
    </div>
  );
};

const DateSidePanel: React.FC<{ selectedDate: Date }> = ({ selectedDate }) => {
  const { getEventsForDate, getMetroExtraTrains, getWaterExtraBoats, getExtraDrivers, getRidershipBoost, requiresExtendedService } = useEventStore();
  const [showAddForm, setShowAddForm] = useState(false);

  const modifier = useMemo(() => getDemandModifier(selectedDate), [selectedDate]);
  const events = getEventsForDate(selectedDate);
  const extraTrains = getMetroExtraTrains(selectedDate);
  const extraBoats = getWaterExtraBoats(selectedDate);
  const extraDrivers = getExtraDrivers(selectedDate);
  const ridershipBoost = getRidershipBoost(selectedDate);
  const extendedService = requiresExtendedService(selectedDate);
  const dateKey = selectedDate.toISOString().split('T')[0];
  const dayType = modifier.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-4 ${modifier.bg} ${modifier.border}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{modifier.icon}</span>
          <div>
            <div className={`text-sm font-bold ${modifier.color}`}>{dayType}</div>
            <div className="text-xs text-gray-500">{formatDate(selectedDate)}</div>
          </div>
        </div>

        {modifier.holiday && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-3 h-3 text-amber-500" />
            <span className="text-sm font-semibold text-gray-800">{modifier.holiday.name}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/70 rounded-lg px-3 py-2 border border-white/50">
            <div className="text-xs text-gray-500">Day Type</div>
            <div className="text-sm font-bold text-gray-800">{dayType}</div>
          </div>
          <div className="bg-white/70 rounded-lg px-3 py-2 border border-white/50">
            <div className="text-xs text-gray-500">Calendar Demand</div>
            <div className="text-sm font-bold text-gray-800">+{Math.round((modifier.passengerMultiplier - 1) * 100)}%</div>
          </div>
        </div>

        {events.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Event-Adjusted Deployment</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-lg p-2 border border-blue-100 text-center">
                <div className="text-base font-bold text-blue-700">+{extraTrains}</div>
                <div className="text-xs text-gray-500">Metro Trains</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-cyan-100 text-center">
                <div className="text-base font-bold text-cyan-700">+{extraBoats}</div>
                <div className="text-xs text-gray-500">Boats</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-orange-100 text-center">
                <div className="text-base font-bold text-orange-700">+{extraDrivers}</div>
                <div className="text-xs text-gray-500">Drivers</div>
              </div>
            </div>
            {ridershipBoost > 0 && (
              <div className="bg-white/80 border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-gray-600">Ridership boost from events</span>
                <span className="text-xs font-bold text-green-700">+{Math.round(ridershipBoost * 100)}%</span>
              </div>
            )}
            {extendedService && (
              <div className="flex items-center gap-2 bg-amber-100 border border-amber-300 rounded-lg px-3 py-2">
                <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                <span className="text-xs font-semibold text-amber-800">Extended Service Required</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-800">
              Events on this date{events.length > 0 && <span className="text-xs font-normal text-gray-400 ml-1">({events.length})</span>}
            </span>
          </div>
          <button
            onClick={() => setShowAddForm(f => !f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition"
            style={{ backgroundColor: '#005DAA' }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Event
          </button>
        </div>

        {showAddForm && (
          <div className="mb-3">
            <AddEventForm defaultDate={dateKey} onClose={() => setShowAddForm(false)} />
          </div>
        )}

        {events.length === 0 && !showAddForm ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No events scheduled for this date</p>
            <p className="text-xs text-gray-400 mt-1">Add an event to see AI-adjusted fleet deployment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Events added here will automatically adjust fleet deployment, driver requirements, and ridership forecast when AI Planning runs for this date.
        </p>
      </div>
    </div>
  );
};

const UpcomingEventsList: React.FC<{ onSelectDate: (d: Date) => void }> = ({ onSelectDate }) => {
  const { events, removeEvent } = useEventStore();
  const [expanded, setExpanded] = useState(true);

  if (events.length === 0) return null;

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-800">All Operational Events</span>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">{events.length}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="divide-y divide-gray-50">
          {sorted.map(ev => {
            const impM = IMPACT_COLORS[ev.metroImpact];
            const impW = IMPACT_COLORS[ev.waterImpact];
            return (
              <div key={ev.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition">
                <button onClick={() => onSelectDate(new Date(ev.date + 'T12:00:00'))} className="flex-1 text-left min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate mb-0.5">{ev.name}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{new Date(ev.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span>{ev.timeStart}–{ev.timeEnd}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>
                  </div>
                </button>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${impM.bg} ${impM.text} ${impM.border}`}>M:{IMPACT_LABELS[ev.metroImpact][0]}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${impW.bg} ${impW.text} ${impW.border}`}>W:{IMPACT_LABELS[ev.waterImpact][0]}</span>
                </div>
                <button onClick={() => removeEvent(ev.id)} className="p-1 rounded-lg hover:bg-red-50 transition flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const EventAwareCalendar: React.FC<{
  selectedDate: Date;
  onDateChange: (d: Date) => void;
}> = ({ selectedDate, onDateChange }) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-1">
          <KeralaOperationalCalendar selectedDate={selectedDate} onDateChange={onDateChange} />
        </div>
        <div className="xl:col-span-2">
          <DateSidePanel selectedDate={selectedDate} />
        </div>
      </div>
      <UpcomingEventsList onSelectDate={onDateChange} />
    </div>
  );
};
