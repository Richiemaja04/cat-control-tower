import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  MapPin, 
  BrainCircuit, 
  CheckSquare, 
  Receipt, 
  Wrench, 
  Users,
  LogOut
} from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage } = useFleetStore();
  const { logout, currentUser } = useAuthStore();

  const navItems = [
    { id: 'dashboard', label: 'CONTROL TOWER', icon: LayoutDashboard },
    { id: 'assets', label: 'ASSETS', icon: Truck },
    { id: 'map', label: 'LIVE MAP', icon: MapPin },
    { id: 'intelligence', label: 'INTELLIGENCE', icon: BrainCircuit },
    { id: 'actions', label: 'ACTION CENTER', icon: CheckSquare },
    { id: 'rentals', label: 'RENTALS', icon: Receipt },
    { id: 'maintenance', label: 'MAINTENANCE', icon: Wrench },
    { id: 'employees', label: 'EMPLOYEES', icon: Users },
  ];

  return (
    <aside className="w-56 backdrop-blur-xl bg-cat-surface/50 border-r border-white/10 flex flex-col justify-between select-none z-10 shadow-2xl">
      <div className="py-4 flex-1 overflow-y-auto">
        <div className="px-4 mb-3 text-[10px] font-mono text-cat-muted/80 tracking-widest uppercase">
          NAVIGATION
        </div>
        <nav className="space-y-1.5 px-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-cat-yellow text-black shadow-[0_0_20px_rgba(255,184,0,0.35)] font-bold scale-[1.02]'
                    : 'text-cat-muted hover:text-cat-text hover:bg-white/5 hover:translate-x-0.5'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-black scale-110' : 'text-cat-muted'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sign Out */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-cat-muted hover:text-cat-critical hover:bg-white/5 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
