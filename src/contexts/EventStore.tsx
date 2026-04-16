import React, { createContext, useContext, useState, useCallback } from 'react';

export type EventImpact = 'low' | 'medium' | 'high';

export type OperationalEvent = {
  id: string;
  name: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  expectedCrowd: number;
  metroImpact: EventImpact;
  waterImpact: EventImpact;
  createdAt: string;
};

type EventStoreCtx = {
  events: OperationalEvent[];
  addEvent: (e: Omit<OperationalEvent, 'id' | 'createdAt'>) => void;
  removeEvent: (id: string) => void;
  getEventsForDate: (date: Date) => OperationalEvent[];
  getMetroExtraTrains: (date: Date) => number;
  getWaterExtraBoats: (date: Date) => number;
  getExtraDrivers: (date: Date) => number;
  getRidershipBoost: (date: Date) => number;
  requiresExtendedService: (date: Date) => boolean;
};

const EventStoreContext = createContext<EventStoreCtx | null>(null);

const IMPACT_MULTIPLIER: Record<EventImpact, number> = { low: 1, medium: 2, high: 3 };
const IMPACT_BOAT_MULT: Record<EventImpact, number> = { low: 1, medium: 3, high: 6 };
const IMPACT_RIDERSHIP: Record<EventImpact, number> = { low: 0.05, medium: 0.12, high: 0.22 };

export const EventStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<OperationalEvent[]>([
    {
      id: 'ev-demo-1',
      name: 'Kochi Marathon 2026',
      date: new Date().toISOString().split('T')[0],
      timeStart: '05:00',
      timeEnd: '12:00',
      location: 'Marine Drive, Ernakulam',
      expectedCrowd: 25000,
      metroImpact: 'high',
      waterImpact: 'medium',
      createdAt: new Date().toISOString(),
    },
  ]);

  const addEvent = useCallback((e: Omit<OperationalEvent, 'id' | 'createdAt'>) => {
    setEvents(prev => [...prev, {
      ...e,
      id: `ev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }]);
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const getEventsForDate = useCallback((date: Date) => {
    const key = date.toISOString().split('T')[0];
    return events.filter(e => e.date === key);
  }, [events]);

  const getMetroExtraTrains = useCallback((date: Date) => {
    return getEventsForDate(date).reduce((sum, e) => sum + IMPACT_MULTIPLIER[e.metroImpact], 0);
  }, [getEventsForDate]);

  const getWaterExtraBoats = useCallback((date: Date) => {
    return getEventsForDate(date).reduce((sum, e) => sum + IMPACT_BOAT_MULT[e.waterImpact], 0);
  }, [getEventsForDate]);

  const getExtraDrivers = useCallback((date: Date) => {
    return getEventsForDate(date).reduce((sum, e) => {
      return sum + IMPACT_MULTIPLIER[e.metroImpact] + IMPACT_MULTIPLIER[e.waterImpact];
    }, 0);
  }, [getEventsForDate]);

  const getRidershipBoost = useCallback((date: Date) => {
    return getEventsForDate(date).reduce((sum, e) => sum + IMPACT_RIDERSHIP[e.metroImpact], 0);
  }, [getEventsForDate]);

  const requiresExtendedService = useCallback((date: Date) => {
    return getEventsForDate(date).some(e => {
      const [sh, sm] = e.timeStart.split(':').map(Number);
      const [eh, em] = e.timeEnd.split(':').map(Number);
      const startMins = sh * 60 + sm;
      const endMins = eh * 60 + em;
      return startMins < 6 * 60 || endMins > 22 * 60;
    });
  }, [getEventsForDate]);

  return (
    <EventStoreContext.Provider value={{
      events, addEvent, removeEvent, getEventsForDate,
      getMetroExtraTrains, getWaterExtraBoats, getExtraDrivers,
      getRidershipBoost, requiresExtendedService,
    }}>
      {children}
    </EventStoreContext.Provider>
  );
};

export function useEventStore() {
  const ctx = useContext(EventStoreContext);
  if (!ctx) throw new Error('useEventStore must be used within EventStoreProvider');
  return ctx;
}
