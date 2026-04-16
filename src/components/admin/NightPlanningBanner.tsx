import React, { useState } from 'react';
import {
  Moon, CheckCircle, AlertTriangle, Bell, BellOff, Clock,
  ChevronDown, ChevronUp, X, Cpu, Calendar, Play
} from 'lucide-react';
import { useNightPlanningStore } from '../../contexts/NightPlanningStore';

const DEMO_TIMES = [
  { label: 'Real Clock',  hour: null,  minute: null  },
  { label: '20:55',       hour: 20,    minute: 55   },
  { label: '21:00',       hour: 21,    minute: 0    },
  { label: '21:31',       hour: 21,    minute: 31   },
  { label: '22:01',       hour: 22,    minute: 1    },
  { label: '22:31',       hour: 22,    minute: 31   },
  { label: '23:00',       hour: 23,    minute: 0    },
  { label: '23:10',       hour: 23,    minute: 10   },
];

export const NightPlanningBanner: React.FC = () => {
  const {
    windowState,
    latestNotification,
    bannerDismissed,
    planApproved,
    approvedAt,
    approvedForDate,
    notifications,
    currentTime,
    dismissBanner,
    simulatedHour,
    simulatedMinute,
    setSimulatedTime,
  } = useNightPlanningStore();

  const [showHistory, setShowHistory] = useState(false);
  const [showDemo,    setShowDemo]    = useState(false);

  // Compute tomorrow's date (the default planning date)
  const tomorrowDateKey = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  // Only show approved banner if it's for tomorrow (default planning date)
  const isApprovedForTomorrow = windowState === 'approved' && approvedForDate === tomorrowDateKey;

  // Nothing to show
  if (bannerDismissed && !isApprovedForTomorrow) return null;
  if (windowState === 'inactive') return null;
  if (!latestNotification && !isApprovedForTomorrow) return null;

  const displayTime = simulatedHour !== null
    ? `${String(simulatedHour).padStart(2, '0')}:${String(simulatedMinute ?? 0).padStart(2, '0')} (simulated)`
    : currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

  // ── Approved confirmation ─────────────────────────────────────────────────
  if (isApprovedForTomorrow) {
    return (
      <div className="rounded-xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 overflow-hidden shadow-sm">
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-green-900 text-sm">Operational Plan Approved and Locked for Tomorrow</span>
              <span className="text-xs font-bold bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />Locked
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {approvedAt && (
                <span className="text-xs text-green-700 flex items-center gap-1">
                  <Clock className="w-3 h-3" />Approved at {approvedAt}
                </span>
              )}
              <span className="text-xs text-green-600">No further planning reminders will be sent tonight</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden sm:flex items-center gap-1 text-xs text-green-600 bg-green-100 border border-green-200 px-2.5 py-1 rounded-lg">
              <BellOff className="w-3.5 h-3.5" />Reminders stopped
            </span>
            <button
              onClick={dismissBanner}
              className="p-1.5 rounded-lg hover:bg-green-200 text-green-600 transition"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Window closed without approval ────────────────────────────────────────
  if (windowState === 'window_closed') {
    return (
      <div className="rounded-xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-rose-50 overflow-hidden shadow-sm">
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-red-900 text-sm block">Planning Window Closed – Manual Assignment Required</span>
            <span className="text-xs text-red-700 mt-0.5 block">The 21:00–23:00 planning window has ended without an approved operational plan. Supervisor manual assignment is required immediately.</span>
          </div>
          <button
            onClick={dismissBanner}
            className="p-1.5 rounded-lg hover:bg-red-200 text-red-600 transition flex-shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Active window / reminder ──────────────────────────────────────────────
  const reminderCount = notifications.filter(n => n.isReminder).length;
  const isFirstNotif  = !latestNotification?.isReminder;

  return (
    <div className={`rounded-xl border-2 overflow-hidden shadow-sm ${isFirstNotif ? 'border-blue-300 bg-gradient-to-r from-blue-950 to-blue-900' : 'border-amber-300 bg-gradient-to-r from-amber-950 to-amber-900'}`}>
      {/* Main row */}
      <div className="px-5 py-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow relative ${isFirstNotif ? 'bg-blue-500' : 'bg-amber-500'}`}>
          {isFirstNotif ? <Moon className="w-5 h-5 text-white" /> : <Bell className="w-5 h-5 text-white animate-bounce" />}
          {!isFirstNotif && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
              {reminderCount}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-sm ${isFirstNotif ? 'text-white' : 'text-amber-100'}`}>
              {latestNotification.message}
            </span>
            {!isFirstNotif && (
              <span className="text-xs font-bold bg-amber-500/30 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Bell className="w-3 h-3" />Reminder {reminderCount}
              </span>
            )}
          </div>
          <div className={`flex items-center gap-3 mt-0.5 flex-wrap ${isFirstNotif ? 'text-blue-300' : 'text-amber-300'}`}>
            <span className="text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />{latestNotification.time} · {displayTime} now
            </span>
            <span className="text-xs flex items-center gap-1">
              <Cpu className="w-3 h-3" />Go to AI Planning to approve the fleet plan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {notifications.length > 1 && (
            <button
              onClick={() => setShowHistory(v => !v)}
              className={`hidden sm:flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition ${isFirstNotif ? 'border-blue-500/30 text-blue-300 hover:bg-blue-800/40' : 'border-amber-500/30 text-amber-300 hover:bg-amber-800/40'}`}
            >
              {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              History ({notifications.length})
            </button>
          )}
          <button
            onClick={() => setShowDemo(v => !v)}
            className={`hidden sm:flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition ${isFirstNotif ? 'border-blue-500/30 text-blue-300 hover:bg-blue-800/40' : 'border-amber-500/30 text-amber-300 hover:bg-amber-800/40'}`}
            title="Demo controls"
          >
            <Play className="w-3 h-3" />Demo
          </button>
          <button
            onClick={dismissBanner}
            className={`p-1.5 rounded-lg transition ${isFirstNotif ? 'hover:bg-blue-800/40 text-blue-300' : 'hover:bg-amber-800/40 text-amber-300'}`}
            title="Dismiss until next reminder"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification history */}
      {showHistory && notifications.length > 0 && (
        <div className="border-t border-white/10 px-5 py-3 space-y-1.5">
          {[...notifications].reverse().map(n => (
            <div key={n.id} className="flex items-center gap-3">
              <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${n.isReminder ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>
                {n.time}
              </span>
              <span className="text-xs text-white/70">{n.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Demo time controls */}
      {showDemo && (
        <div className="border-t border-white/10 px-5 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs text-white/50 font-semibold uppercase tracking-wider">Simulate Planning Window Time</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DEMO_TIMES.map(t => {
              const isActive = t.hour === simulatedHour && t.minute === simulatedMinute;
              return (
                <button
                  key={t.label}
                  onClick={() => setSimulatedTime(t.hour, t.minute)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition ${isActive ? 'bg-white text-blue-900 border-white' : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'}`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-white/30 mt-2">Selecting a time simulates the clock for notification triggers. Real clock used when "Real Clock" selected.</p>
        </div>
      )}
    </div>
  );
};
