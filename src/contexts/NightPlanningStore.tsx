import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type PlanningWindowState =
  | 'inactive'          // before 21:00 or after 23:00 and no session active
  | 'window_open'       // 21:00 arrived, first notification
  | 'reminder'          // 21:30 / 22:00 / 22:30 — repeat reminder
  | 'approved'          // admin approved plan — notifications stop
  | 'window_closed';    // 23:00 passed without approval

export type NightPlanningNotification = {
  id: string;
  time: string;       // e.g. "21:00"
  message: string;
  isReminder: boolean;
};

type NightPlanningStoreContextType = {
  windowState: PlanningWindowState;
  notifications: NightPlanningNotification[];
  latestNotification: NightPlanningNotification | null;
  bannerDismissed: boolean;
  planApproved: boolean;
  approvedAt: string | null;
  approvedForDate: string | null;
  currentTime: Date;
  dismissBanner: () => void;
  markPlanApproved: (planningDate: Date) => void;
  resetApproval: () => void;
  // For demo: allow simulating times
  simulatedHour: number | null;
  simulatedMinute: number | null;
  setSimulatedTime: (hour: number | null, minute: number | null) => void;
};

// ─── Persistence helpers ──────────────────────────────────────────────────────
const TODAY_KEY = () => new Date().toISOString().split('T')[0]; // YYYY-MM-DD

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Keys are scoped to today's date to auto-reset each day
const storageKey = (suffix: string) => `konect_night_planning_${TODAY_KEY()}_${suffix}`;

// ─── Context ──────────────────────────────────────────────────────────────────
const NightPlanningStoreContext = createContext<NightPlanningStoreContextType | null>(null);

// The notification schedule: (hour, minute, message, isReminder)
const SCHEDULE: { hour: number; minute: number; message: string; isReminder: boolean }[] = [
  { hour: 21, minute: 0,  message: 'Night Operational Planning Window Started – Assign Fleet for Tomorrow', isReminder: false },
  { hour: 21, minute: 30, message: 'Planning Reminder – Operational Plan for Tomorrow Not Yet Approved',    isReminder: true  },
  { hour: 22, minute: 0,  message: 'Planning Reminder – Operational Plan for Tomorrow Not Yet Approved',    isReminder: true  },
  { hour: 22, minute: 30, message: 'Planning Reminder – Operational Plan for Tomorrow Not Yet Approved',    isReminder: true  },
  { hour: 23, minute: 0,  message: 'Planning Window Closed – Manual Assignment Required',                   isReminder: true  },
];

function slotKey(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function isSlotInWindow(hour: number, minute: number) {
  const totalMinutes = hour * 60 + minute;
  return totalMinutes >= 21 * 60 && totalMinutes <= 23 * 60;
}

export const NightPlanningStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Simulated time for demo purposes (null = use real clock)
  const [simulatedHour,   setSimHour]   = useState<number | null>(null);
  const [simulatedMinute, setSimMinute] = useState<number | null>(null);

  const [currentTime,      setCurrentTime]      = useState(new Date());
  const [notifications,    setNotifications]    = useState<NightPlanningNotification[]>(() =>
    readStorage<NightPlanningNotification[]>(storageKey('notifications'), [])
  );
  const [planApproved,     setPlanApproved]     = useState<boolean>(() =>
    readStorage<boolean>(storageKey('approved'), false)
  );
  const [approvedAt,       setApprovedAt]       = useState<string | null>(() =>
    readStorage<string | null>(storageKey('approved_at'), null)
  );
  const [approvedForDate,  setApprovedForDate]  = useState<string | null>(() =>
    readStorage<string | null>(storageKey('approved_for_date'), null)
  );
  const [bannerDismissed,  setBannerDismissed]  = useState(false);

  const firedSlotsRef = useRef<Set<string>>(new Set(
    readStorage<string[]>(storageKey('fired_slots'), [])
  ));

  // Effective hour/minute: use simulated if set, else real clock
  const effectiveHour   = simulatedHour   !== null ? simulatedHour   : currentTime.getHours();
  const effectiveMinute = simulatedMinute !== null ? simulatedMinute : currentTime.getMinutes();

  // Tick the real clock every 10 seconds (slots checked by minute)
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);

  // Check schedule every time effective time changes
  useEffect(() => {
    if (planApproved) return; // approved — no more notifications

    const H = effectiveHour;
    const M = effectiveMinute;
    const totalMin = H * 60 + M;

    // Only fire within or at the edges of the planning window
    if (totalMin < 21 * 60 || totalMin > 23 * 60) return;

    for (const slot of SCHEDULE) {
      const key = slotKey(slot.hour, slot.minute);
      if (firedSlotsRef.current.has(key)) continue;
      // Fire if current time has passed or reached this slot
      const slotMin = slot.hour * 60 + slot.minute;
      if (totalMin >= slotMin) {
        const notif: NightPlanningNotification = {
          id: `notif_${key}`,
          time: key,
          message: slot.message,
          isReminder: slot.isReminder,
        };
        firedSlotsRef.current.add(key);
        // Persist fired slots
        writeStorage(storageKey('fired_slots'), Array.from(firedSlotsRef.current));
        setNotifications(prev => {
          const next = [...prev.filter(n => n.id !== notif.id), notif];
          writeStorage(storageKey('notifications'), next);
          return next;
        });
        // Undismiss banner to surface the new notification
        setBannerDismissed(false);
      }
    }
  }, [effectiveHour, effectiveMinute, planApproved]);

  // Derive window state
  const totalMin = effectiveHour * 60 + effectiveMinute;
  let windowState: PlanningWindowState = 'inactive';
  if (planApproved) {
    windowState = 'approved';
  } else if (firedSlotsRef.current.has('23:00')) {
    windowState = 'window_closed';
  } else if (notifications.length > 0) {
    const last = notifications[notifications.length - 1];
    windowState = last.isReminder ? 'reminder' : 'window_open';
  } else if (totalMin >= 21 * 60 && totalMin < 23 * 60) {
    windowState = 'inactive'; // window active but first notification not yet computed
  }

  const latestNotification = notifications.length > 0 ? notifications[notifications.length - 1] : null;

  const dismissBanner = useCallback(() => setBannerDismissed(true), []);

  const markPlanApproved = useCallback((planningDate: Date) => {
    const at = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateKey = planningDate.toISOString().split('T')[0]; // YYYY-MM-DD
    setPlanApproved(true);
    setApprovedAt(at);
    setApprovedForDate(dateKey);
    setBannerDismissed(false); // show approval confirmation banner
    writeStorage(storageKey('approved'), true);
    writeStorage(storageKey('approved_at'), at);
    writeStorage(storageKey('approved_for_date'), dateKey);
  }, []);

  const resetApproval = useCallback(() => {
    setPlanApproved(false);
    setApprovedAt(null);
    setApprovedForDate(null);
    setBannerDismissed(false);
    writeStorage(storageKey('approved'), false);
    writeStorage(storageKey('approved_at'), null);
    writeStorage(storageKey('approved_for_date'), null);
  }, []);

  const setSimulatedTime = useCallback((hour: number | null, minute: number | null) => {
    setSimHour(hour);
    setSimMinute(minute);
    // Reset fired slots so we can re-trigger for the new time
    if (hour !== null) {
      firedSlotsRef.current = new Set();
      writeStorage(storageKey('fired_slots'), []);
      setNotifications([]);
      writeStorage(storageKey('notifications'), []);
      setBannerDismissed(false);
    }
  }, []);

  return (
    <NightPlanningStoreContext.Provider value={{
      windowState,
      notifications,
      latestNotification,
      bannerDismissed,
      planApproved,
      approvedAt,
      approvedForDate,
      currentTime,
      dismissBanner,
      markPlanApproved,
      resetApproval,
      simulatedHour,
      simulatedMinute,
      setSimulatedTime,
    }}>
      {children}
    </NightPlanningStoreContext.Provider>
  );
};

export const useNightPlanningStore = () => {
  const ctx = useContext(NightPlanningStoreContext);
  if (!ctx) throw new Error('useNightPlanningStore must be used within NightPlanningStoreProvider');
  return ctx;
};
