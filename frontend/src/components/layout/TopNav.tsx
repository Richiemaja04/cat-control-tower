import React, { useState } from 'react';
import { Bell, Radio, RefreshCw, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';

export const TopNav: React.FC = () => {
  const { fetchDashboardData, notifications, setActivePage } = useFleetStore();
  const [syncing, setSyncing] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await fetchDashboardData();
    setTimeout(() => setSyncing(false), 800);
  };

  const iconMap = {
    critical: <AlertTriangle className="w-3.5 h-3.5 text-cat-critical flex-shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-3.5 h-3.5 text-cat-warning flex-shrink-0 mt-0.5" />,
    info: <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />,
  };

  return (
    <header className="h-16 backdrop-blur-xl bg-cat-surface/60 border-b border-white/10 flex items-center justify-between px-6 z-30 relative shadow-xl">
      {/* Brand */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <img src="/cat-logo.png" alt="Caterpillar CAT Logo" className="h-9 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,184,0,0.5)]" />
          <div>
            <h1 className="font-extrabold text-cat-text text-sm tracking-wide flex items-center gap-2">
              SMART RENTAL CONTROL TOWER
            </h1>
            <p className="text-[11px] text-cat-muted tracking-tight font-medium">Right Asset. Right Site. Right Time.</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        {/* Sync */}
        <button
          id="sync-btn"
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 glass-card hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-cat-text transition-all duration-200 disabled:opacity-60 cursor-pointer shadow-sm active:scale-95"
          title="Refresh all data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cat-yellow ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing…' : 'Sync'}</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="notification-bell"
            onClick={() => setShowNotifs((v) => !v)}
            className="p-2 glass-card hover:bg-white/10 border border-white/10 rounded-lg relative transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            title="View notifications"
          >
            <Bell className="w-4 h-4 text-cat-muted" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 bg-cat-critical text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-1 shadow-[0_0_10px_#EF4444]">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-84 backdrop-blur-2xl bg-cat-card/90 border border-white/15 rounded-xl shadow-2xl z-50 animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-white/5">
                <span className="text-xs font-extrabold text-cat-text uppercase tracking-wider">
                  Fleet Notifications
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cat-muted bg-white/5 px-2 py-0.5 rounded border border-white/10">{notifications.length} alerts</span>
                  <button onClick={() => setShowNotifs(false)} className="text-cat-muted hover:text-cat-text cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 flex items-start gap-2.5 hover:bg-white/5 transition-all duration-150 cursor-pointer"
                    onClick={() => {
                      setShowNotifs(false);
                      if (n.title.toLowerCase().includes('maintenance')) {
                        setActivePage('maintenance');
                      } else {
                        setActivePage('actions');
                      }
                    }}
                  >
                    {iconMap[n.type] || iconMap.info}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <div className="text-[11px] font-bold text-cat-text truncate">{n.title}</div>
                        {n.timestamp && <span className="text-[9px] text-cat-muted/80 ml-2 font-mono">{n.timestamp}</span>}
                      </div>
                      <div className="text-[10px] text-cat-muted leading-snug mt-0.5 line-clamp-2">{n.body}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-white/10 bg-white/5">
                <button
                  onClick={() => { setShowNotifs(false); setActivePage('actions'); }}
                  className="w-full text-[10px] font-extrabold text-cat-yellow hover:text-yellow-300 font-mono text-center py-1.5 transition-colors cursor-pointer"
                >
                  VIEW ALL IN ACTION CENTER →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Operator badge */}
        <div className="flex items-center space-x-3 border-l border-white/10 pl-4">
          <div className="w-8.5 h-8.5 rounded-full bg-cat-yellow/15 border border-cat-yellow/50 flex items-center justify-center text-cat-yellow font-extrabold text-xs shadow-[0_0_15px_rgba(255,184,0,0.2)]">
            OP
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-cat-text leading-tight">Fleet Manager</div>
            <div className="text-[10px] text-cat-muted font-medium">Control Tower Alpha</div>
          </div>
        </div>
      </div>
    </header>
  );
};
