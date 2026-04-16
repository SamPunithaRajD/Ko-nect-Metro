import { useState } from 'react';
import { Train, Ship, Globe } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { IssueStoreProvider } from './contexts/IssueStore';
import { DriverStoreProvider } from './contexts/DriverStore';
import { NightPlanningStoreProvider } from './contexts/NightPlanningStore';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Notification } from './components/Notification';
import { NightPlanningBanner } from './components/admin/NightPlanningBanner';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FleetManagement } from './components/admin/FleetManagement';
import { AIPlanning } from './components/admin/AIPlanning';
import { RouteMap } from './components/admin/RouteMap';
import { IssueInbox } from './components/admin/IssueInbox';
import { History } from './components/admin/History';
import { Reports } from './components/admin/Reports';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { UpdateStatus } from './components/employee/UpdateStatus';
import { EmployeeRouteMap } from './components/employee/EmployeeRouteMap';
import { ReportIssue } from './components/employee/ReportIssue';
import { EmployeeHistory } from './components/employee/EmployeeHistory';
import { DriverManagement } from './components/admin/DriverManagement';
import { DriverAssignment } from './components/employee/DriverAssignment';
import { WaterDriverAssignment } from './components/employee/WaterDriverAssignment';
import { EventStoreProvider } from './contexts/EventStore';

function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5 border border-white/20">
      <button
        onClick={() => setLang('en')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${lang === 'en' ? 'bg-white text-blue-900 shadow-sm' : 'text-white/70 hover:text-white'}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('ml')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${lang === 'ml' ? 'bg-white text-blue-900 shadow-sm' : 'text-white/70 hover:text-white'}`}
        style={{ fontFamily: lang === 'ml' ? 'serif' : undefined }}
      >
        മലയാളം
      </button>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #001f4d 0%, #003A8F 100%)' }}>
        <div className="flex items-center gap-3 mb-6">
          <Train className="w-8 h-8" style={{ color: '#E31E24' }} />
          <Ship className="w-8 h-8" style={{ color: '#0072CE' }} />
          <span className="text-2xl font-bold text-white tracking-wide">KO-NECT</span>
        </div>
        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
        <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.5)' }}>Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderContent = () => {
    if (user.role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'fleet':
          return <FleetManagement />;
        case 'ai-planning':
          return <AIPlanning onNotification={showNotification} />;
        case 'drivers':
          return <DriverManagement onNotification={showNotification} />;
        case 'routes':
          return <RouteMap />;
        case 'issues':
          return <IssueInbox onNotification={showNotification} />;
        case 'history':
          return <History onNotification={showNotification} />;
        case 'reports':
          return <Reports />;
        default:
          return <AdminDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return <EmployeeDashboard />;
        case 'fleet':
          return <EmployeeDashboard />;
        case 'updates':
          return <UpdateStatus onNotification={showNotification} />;
        case 'driver-assignment':
          return user.role === 'water_employee' ? <WaterDriverAssignment /> : <DriverAssignment />;
        case 'routes':
          return <EmployeeRouteMap />;
        case 'issues':
          return <ReportIssue onNotification={showNotification} />;
        case 'history':
          return <EmployeeHistory onNotification={showNotification} />;
        default:
          return <EmployeeDashboard />;
      }
    }
  };

  const roleLabel = user.role === 'admin'
    ? t('roleAdmin')
    : user.role === 'metro_employee'
    ? t('roleMetro')
    : t('roleWater');

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#F4F6F9' }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={user.role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header bar with language toggle */}
        <header className="flex-shrink-0 flex items-center justify-between px-8 py-2.5 border-b border-gray-200 bg-white shadow-sm z-10">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Train className="w-4 h-4" style={{ color: '#E31E24' }} />
              <Ship className="w-4 h-4" style={{ color: '#0072CE' }} />
            </div>
            <span className="text-sm font-bold text-gray-800 tracking-wide">KO-NECT</span>
            <span className="text-gray-300 text-xs mx-1">|</span>
            <span className="text-xs text-gray-500">{t('kochiMetroRailLtd')}</span>
            <span className="text-gray-200 text-xs mx-1">|</span>
            <span className="text-xs text-gray-400">{roleLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5">
              <LangToggleBtn />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8 space-y-5">
            {user.role === 'admin' && <NightPlanningBanner />}
            {renderContent()}
          </div>
        </main>
      </div>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={clearNotification}
        />
      )}
    </div>
  );
}

function LangToggleBtn() {
  const { lang, setLang } = useLanguage();
  return (
    <>
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${lang === 'en' ? 'bg-white text-slate-800 shadow-sm' : 'text-white/60 hover:text-white'}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('ml')}
        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${lang === 'ml' ? 'bg-white text-slate-800 shadow-sm' : 'text-white/60 hover:text-white'}`}
      >
        മലയാളം
      </button>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NightPlanningStoreProvider>
          <DriverStoreProvider>
            <IssueStoreProvider>
              <EventStoreProvider>
                <AppContent />
              </EventStoreProvider>
            </IssueStoreProvider>
          </DriverStoreProvider>
        </NightPlanningStoreProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
