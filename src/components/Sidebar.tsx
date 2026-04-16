import React, { useState } from 'react';
import {
  LayoutDashboard,
  Train,
  Ship,
  FileText,
  AlertCircle,
  Map,
  History,
  LogOut,
  TrendingUp,
  Shield,
  User,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

type SidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'admin' | 'metro_employee' | 'water_employee';
};

const roleConfig = {
  admin: {
    label: 'System Administrator',
    badge: 'ADMIN',
    badgeBg: '#E31E24',
    icon: Shield,
    accentColor: '#E31E24',
  },
  metro_employee: {
    label: 'Metro Operations',
    badge: 'METRO',
    badgeBg: '#0072CE',
    icon: Train,
    accentColor: '#0072CE',
  },
  water_employee: {
    label: 'Water Metro Operations',
    badge: 'WATER',
    badgeBg: '#00897B',
    icon: Ship,
    accentColor: '#00897B',
  },
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, userRole }) => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [signingOut, setSigningOut] = useState(false);

  const config = roleConfig[userRole];

  const adminTabs = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'fleet', label: t('fleetManagement'), icon: Train },
    { id: 'ai-planning', label: t('aiPlanning'), icon: TrendingUp },
    { id: 'drivers', label: t('driverManagement'), icon: User },
    { id: 'routes', label: t('routeMaps'), icon: Map },
    { id: 'issues', label: t('issueInbox'), icon: AlertCircle },
    { id: 'history', label: t('history'), icon: History },
    { id: 'reports', label: t('reports'), icon: FileText },
  ];

  const metroTabs = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'fleet', label: t('myFleet'), icon: Train },
    { id: 'updates', label: t('updateStatus'), icon: FileText },
    { id: 'driver-assignment', label: t('driverAssignment'), icon: User },
    { id: 'routes', label: t('routeMap'), icon: Map },
    { id: 'issues', label: t('reportIssue'), icon: AlertCircle },
    { id: 'history', label: t('plansHistory'), icon: History },
  ];

  const waterTabs = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'fleet', label: t('myFleet'), icon: Ship },
    { id: 'updates', label: t('updateStatus'), icon: FileText },
    { id: 'driver-assignment', label: t('crewAssignment'), icon: User },
    { id: 'routes', label: t('routeMap'), icon: Map },
    { id: 'issues', label: t('reportIssue'), icon: AlertCircle },
    { id: 'history', label: t('plansHistory'), icon: History },
  ];

  const tabs = userRole === 'admin' ? adminTabs : userRole === 'metro_employee' ? metroTabs : waterTabs;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setSigningOut(false);
    }
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <div className="w-64 text-white flex flex-col h-screen flex-shrink-0" style={{ backgroundColor: '#003A8F' }}>
      <div className="p-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex items-center gap-1.5">
            <Train className="w-6 h-6" style={{ color: '#E31E24' }} />
            <Ship className="w-6 h-6" style={{ color: '#0072CE' }} />
          </div>
          <h1 className="text-xl font-bold tracking-wide">KO-NECT</h1>
        </div>
        <p className="text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {t('kochiMetroRailLtd')}
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left group"
              style={
                isActive
                  ? { backgroundColor: config.accentColor, color: '#fff' }
                  : { color: 'rgba(255,255,255,0.72)' }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.72)';
                }
              }}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
              <span className="text-sm font-medium">{tab.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
        <div className="rounded-xl p-3 mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: config.accentColor }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.full_name ?? 'Unknown'}</div>
              <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>{user?.email}</div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: config.badgeBg, color: '#fff', letterSpacing: '0.05em' }}
            >
              {config.badge}
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{config.label}</span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 disabled:opacity-60"
          style={{ color: 'rgba(255,255,255,0.7)' }}
          onMouseEnter={(e) => {
            if (!signingOut) {
              e.currentTarget.style.backgroundColor = 'rgba(227,30,36,0.25)';
              e.currentTarget.style.color = '#ff6b6b';
            }
          }}
          onMouseLeave={(e) => {
            if (!signingOut) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }
          }}
        >
          <LogOut className="flex-shrink-0" style={{ width: 16, height: 16 }} />
          <span className="text-sm font-medium">{signingOut ? t('signingOut') : t('signOut')}</span>
        </button>
      </div>
    </div>
  );
};
