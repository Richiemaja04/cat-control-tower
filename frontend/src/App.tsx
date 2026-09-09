import React, { useEffect } from 'react';
import { TopNav } from './components/layout/TopNav';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { Dashboard } from './pages/Dashboard';
import { AssetsPage } from './pages/Assets';
import { IntelligencePage } from './pages/Intelligence';
import { ActionCenterPage } from './pages/ActionCenter';
import { RentalsPage } from './pages/Rentals';
import { MaintenancePage } from './pages/Maintenance';
import { DemoControlPage } from './pages/DemoControl';
import { EmployeesPage } from './pages/Employees';
import { FleetMap } from './components/dashboard/FleetMap';
import { Asset360Drawer } from './components/asset/Asset360Drawer';
import { LoginPage } from './pages/LoginPage';
import { EmployeePortal } from './pages/EmployeePortal';
import { useFleetStore } from './store/fleetStore';
import { useAuthStore } from './store/authStore';
import { useWebSocket } from './hooks/useWebSocket';

import { AnimatedBackground } from './components/common/AnimatedBackground';

import { DriverCallModal } from './components/telephony/DriverCallModal';

export const App: React.FC = () => {
  const { activePage, fetchDashboardData, activeToast, activeCallModal, closeDriverCallModal } = useFleetStore();
  const { isAuthenticated, currentUser } = useAuthStore();

  useWebSocket();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Not authenticated → show login ─────────────────────────────────────────
  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

  // ── Employee role → show mobile portal ────────────────────────────────────
  if (currentUser.role === 'employee') {
    return <EmployeePortal />;
  }

  // ── Fleet Manager → full desktop app ──────────────────────────────────────
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':   return <Dashboard />;
      case 'assets':      return <AssetsPage />;
      case 'map':         return <div className="p-4 h-full"><FleetMap /></div>;
      case 'intelligence':return <IntelligencePage />;
      case 'actions':     return <ActionCenterPage />;
      case 'rentals':     return <RentalsPage />;
      case 'maintenance': return <MaintenancePage />;
      case 'employees':   return <EmployeesPage />;
      case 'demo':        return <DemoControlPage />;
      default:            return <Dashboard />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col ambient-glow-bg text-cat-text overflow-hidden relative">
      <AnimatedBackground />
      {/* Top Header */}
      <TopNav />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 overflow-hidden relative">
          <div key={activePage} className="h-full w-full animate-fade-in">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Bottom Status Strip */}
      <StatusBar />

      {/* Asset 360 Drawer */}
      <Asset360Drawer />

      {/* Twilio Driver Call Session Modal */}
      {activeCallModal.isOpen && activeCallModal.data && (
        <DriverCallModal
          data={activeCallModal.data}
          onClose={closeDriverCallModal}
        />
      )}

      {/* Toast Notification Banner */}
      {activeToast && (
        <div className="fixed bottom-12 right-6 z-50 glass-card border border-cat-yellow/60 p-4 rounded-xl shadow-2xl max-w-md animate-slide-in-right">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-cat-yellow animate-ping"></div>
            <p className="text-xs text-cat-text font-mono font-medium leading-relaxed">{activeToast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
