import React, { useState } from 'react';
import {
  Home, ClipboardList, QrCode, LogOut, Star, ChevronRight,
  Truck, MapPin, Clock, Zap, Activity, CheckCircle, AlertTriangle,
  Fuel, Gauge, Calendar, Package, RefreshCw, HardHat,
} from 'lucide-react';
import { useAuthStore, PendingCheckout } from '../store/authStore';
import { useFleetStore } from '../store/fleetStore';
import { AnimatedBackground } from '../components/common/AnimatedBackground';

type TabId = 'home' | 'logs' | 'checkout';

// ─── Operator data map ────────────────────────────────────────────────────────
const OPERATOR_ASSET_MAP: Record<string, string> = {
  OP001: 'EQX1001',
  OP002: 'EQX1002',
  OP003: 'EQX1004',
  OP004: 'EQX1005',
  OP005: 'EQX1006',
};

const SITE_NAMES: Record<string, string> = {
  S001: 'Metro Rail Corridor — Line 3',
  S002: 'ORR Bellandur Excavation',
  S003: 'Devanahalli Logistics Hub',
  S004: 'Peenya Industrial Site',
  S005: 'Electronic City Expansion',
  S006: 'Whitefield Tech Corridor',
};

// ─── Status Color Helpers ─────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  ACTIVE: 'text-cat-success bg-cat-success/20 border-cat-success/40',
  IDLE: 'text-cat-warning bg-cat-warning/20 border-cat-warning/40',
  AT_RISK: 'text-cat-critical bg-cat-critical/20 border-cat-critical/40',
  TRANSITIONING: 'text-blue-400 bg-blue-400/20 border-blue-400/40',
  MAINTENANCE: 'text-purple-400 bg-purple-400/20 border-purple-400/40',
  AVAILABLE: 'text-green-400 bg-green-400/20 border-green-400/40',
};

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
const TabBar: React.FC<{ active: TabId; onChange: (t: TabId) => void; checkoutCount: number }> = ({
  active,
  onChange,
  checkoutCount,
}) => {
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'logs', label: 'Work Logs', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'checkout', label: 'QR Checkout', icon: <QrCode className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/15 px-2 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 relative ${
              active === t.id ? 'text-cat-yellow' : 'text-cat-muted hover:text-cat-text'
            }`}
          >
            {t.icon}
            <span className="text-[10px] font-bold">{t.label}</span>
            {t.id === 'checkout' && checkoutCount > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 bg-cat-critical text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {checkoutCount}
              </span>
            )}
            {active === t.id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-cat-yellow rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

// ─── Home Tab ─────────────────────────────────────────────────────────────────
const HomeTab: React.FC<{ user: any; asset: any; operatorId: string }> = ({ user, asset, operatorId }) => {
  const siteName = asset?.current_site_id ? SITE_NAMES[asset.current_site_id] || asset.current_site_id : 'Unassigned';
  const statusCls = asset ? (statusColor[asset.status] || 'text-cat-muted') : '';

  return (
    <div className="space-y-4">
      {/* Welcome Header */}
      <div className="glass-card rounded-2xl p-5 border border-white/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cat-yellow/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-cat-yellow flex items-center justify-center shadow-[0_0_20px_rgba(255,184,0,0.4)]">
            <span className="text-black font-black text-xl">{user.avatarInitials}</span>
          </div>
          <div>
            <p className="text-[11px] text-cat-muted font-mono">GOOD {new Date().getHours() < 12 ? 'MORNING' : new Date().getHours() < 17 ? 'AFTERNOON' : 'EVENING'}</p>
            <h2 className="text-lg font-black text-cat-text">{user.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <HardHat className="w-3 h-3 text-cat-yellow" />
              <span className="text-[11px] text-cat-muted font-mono">{operatorId}</span>
              <span className="text-cat-muted">•</span>
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-cat-yellow fill-cat-yellow" />
                <span className="text-[11px] text-cat-warning font-bold">{user.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Assignment */}
      <div>
        <h3 className="text-[10px] font-mono text-cat-muted uppercase tracking-wider mb-2 px-1">Current Assignment</h3>
        {asset ? (
          <div className="glass-card rounded-2xl p-4 border border-white/15">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-cat-yellow" />
                <span className="text-sm font-extrabold text-cat-text">{asset.id || asset.asset_id}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCls}`}>
                {asset.status}
              </span>
            </div>
            <p className="text-xs font-medium text-cat-text mb-1">{asset.name}</p>
            <div className="flex items-center gap-1.5 text-cat-muted text-[11px] mb-3">
              <MapPin className="w-3 h-3" />
              <span>{siteName}</span>
            </div>
            {/* Telemetry Row */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
              <div className="text-center">
                <Fuel className="w-4 h-4 text-cat-yellow mx-auto mb-1" />
                <div className="text-sm font-bold text-cat-text">{Math.round(asset.fuel_level || 0)}%</div>
                <div className="text-[9px] text-cat-muted">Fuel</div>
              </div>
              <div className="text-center">
                <Gauge className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-cat-text">{Math.round(asset.engine_hours || 0)}h</div>
                <div className="text-[9px] text-cat-muted">Engine Hrs</div>
              </div>
              <div className="text-center">
                <Activity className="w-4 h-4 text-cat-success mx-auto mb-1" />
                <div className="text-sm font-bold text-cat-text">{Math.round(asset.health_score || 0)}%</div>
                <div className="text-[9px] text-cat-muted">Health</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 border border-white/15 text-center">
            <Package className="w-8 h-8 text-cat-muted mx-auto mb-2" />
            <p className="text-cat-muted text-sm font-medium">No active assignment</p>
            <p className="text-cat-muted text-xs font-mono mt-1">Check QR Checkout for pending assignments</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div>
        <h3 className="text-[10px] font-mono text-cat-muted uppercase tracking-wider mb-2 px-1">Today's Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Zap className="w-4 h-4 text-cat-yellow" />, value: asset?.trips_today ?? 5, label: 'Trips Completed' },
            { icon: <Clock className="w-4 h-4 text-blue-400" />, value: `${user.experience}y`, label: 'Experience' },
            { icon: <Calendar className="w-4 h-4 text-cat-success" />, value: asset?.maintenance_status || 'OK', label: 'Maint. Status' },
            { icon: <CheckCircle className="w-4 h-4 text-purple-400" />, value: asset?.rental_end?.slice(0, 10) || 'N/A', label: 'Rental End' },
          ].map((stat, i) => (
            <div key={i} className="glass-surface border border-white/10 rounded-xl p-3">
              {stat.icon}
              <div className="text-sm font-extrabold text-cat-text mt-1">{stat.value}</div>
              <div className="text-[9px] text-cat-muted font-mono">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Work Logs Tab ────────────────────────────────────────────────────────────
const WorkLogsTab: React.FC<{ operatorId: string; asset: any }> = ({ operatorId, asset }) => {
  // Generate fake trip logs based on operator
  const tripLogs = Array.from({ length: 8 }, (_, i) => {
    const hoursAgo = (i + 1) * 1.2;
    const d = new Date(Date.now() - hoursAgo * 3600 * 1000);
    return {
      id: `TRIP-${Math.floor(100 + Math.random() * 900)}-${operatorId.slice(-3)}`,
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: i < 4 ? 'Today' : 'Yesterday',
      material: ['Aggregate', 'Rock', 'Soil', 'Sand', 'Gravel'][i % 5],
      load: (1.0 + Math.random()).toFixed(1),
      duration: Math.floor(15 + Math.random() * 20),
      status: i === 0 ? 'IN_PROGRESS' : 'COMPLETED',
    };
  });

  return (
    <div className="space-y-4">
      {/* Shift Summary */}
      <div className="glass-card rounded-2xl p-4 border border-white/15">
        <h3 className="text-xs font-extrabold text-cat-text mb-3 uppercase tracking-wider">Today's Shift Summary</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xl font-black text-cat-yellow">{asset?.trips_today ?? 5}</div>
            <div className="text-[10px] text-cat-muted">Trips</div>
          </div>
          <div>
            <div className="text-xl font-black text-blue-400">{Math.round((asset?.engine_hours || 400) % 24)}h</div>
            <div className="text-[10px] text-cat-muted">Hours Logged</div>
          </div>
          <div>
            <div className="text-xl font-black text-cat-success">{Math.round(asset?.operational_utilization || 78)}%</div>
            <div className="text-[10px] text-cat-muted">Utilization</div>
          </div>
        </div>
      </div>

      {/* Trip History */}
      <div>
        <h3 className="text-[10px] font-mono text-cat-muted uppercase tracking-wider mb-2 px-1">Trip History</h3>
        <div className="space-y-2">
          {tripLogs.map((trip) => (
            <div key={trip.id} className="glass-surface border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trip.status === 'IN_PROGRESS' ? 'bg-cat-yellow/20' : 'bg-green-500/15'}`}>
                  {trip.status === 'IN_PROGRESS' ? (
                    <RefreshCw className="w-3.5 h-3.5 text-cat-yellow animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-cat-success" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-cat-text">{trip.material} Haul</div>
                  <div className="text-[10px] text-cat-muted font-mono">{trip.date} · {trip.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-extrabold text-cat-text">{trip.load}T</div>
                <div className="text-[10px] text-cat-muted">{trip.duration} min</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── QR Checkout Tab ──────────────────────────────────────────────────────────
const QRCheckoutTab: React.FC<{ operatorId: string }> = ({ operatorId }) => {
  const { pendingCheckouts, completeCheckout } = useAuthStore();
  const { checkoutAssetFromDealer } = useFleetStore();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const myCheckouts = pendingCheckouts.filter(
    (c) => c.operatorId === operatorId && c.status === 'PENDING' && !completedIds.includes(c.checkoutId)
  );

  const handleConfirm = (checkout: PendingCheckout) => {
    setConfirmingId(checkout.checkoutId);
    setTimeout(() => {
      // Fire checkout into fleet store
      checkoutAssetFromDealer(checkout.assetId, checkout.siteId, checkout.dueDate, checkout.operatorId, checkout.operatorName);
      // Mark as completed
      completeCheckout(checkout.checkoutId);
      setCompletedIds((prev) => [...prev, checkout.checkoutId]);
      setConfirmingId(null);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-4 border border-white/15 text-center">
        <QrCode className="w-8 h-8 text-cat-yellow mx-auto mb-2" />
        <h3 className="text-sm font-extrabold text-cat-text">QR Asset Checkout</h3>
        <p className="text-[11px] text-cat-muted mt-1 font-mono">
          Pending checkout assignments generated by your Fleet Manager appear below.
        </p>
      </div>

      {myCheckouts.length === 0 ? (
        <div className="glass-surface border border-white/10 rounded-2xl p-8 text-center">
          <CheckCircle className="w-10 h-10 text-cat-success mx-auto mb-3 opacity-50" />
          <p className="text-cat-muted text-sm font-medium">No pending checkouts</p>
          <p className="text-cat-muted text-xs font-mono mt-1">
            Your fleet manager will generate a QR assignment for you.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {myCheckouts.map((checkout) => {
            const isConfirming = confirmingId === checkout.checkoutId;
            return (
              <div key={checkout.checkoutId} className="glass-card rounded-2xl p-4 border border-cat-yellow/30 shadow-[0_0_20px_rgba(255,184,0,0.08)]">
                {/* QR Code Mockup */}
                <div className="flex gap-4 mb-4">
                  <div className="w-20 h-20 flex-shrink-0 glass-surface border border-cat-yellow/40 rounded-xl flex items-center justify-center bg-white/5">
                    <div className="grid grid-cols-3 gap-[3px] w-14 h-14">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-[2px] ${
                            [0, 2, 4, 6, 8].includes(i)
                              ? 'bg-cat-yellow'
                              : [1, 3, 5, 7].includes(i)
                              ? 'bg-white/20'
                              : 'bg-cat-yellow/60'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono text-cat-yellow bg-cat-yellow/15 border border-cat-yellow/30 px-2 py-0.5 rounded-md font-bold">
                        CHECKOUT PENDING
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-cat-text">{checkout.assetId}</div>
                    <div className="text-xs text-cat-muted">{checkout.assetName}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-cat-muted" />
                      <span className="text-[11px] text-cat-muted">{checkout.siteName}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="glass-surface rounded-lg p-2 border border-white/10">
                    <div className="text-cat-muted text-[10px] font-mono mb-0.5">RETURN DUE</div>
                    <div className="font-bold text-cat-text">{checkout.dueDate}</div>
                  </div>
                  <div className="glass-surface rounded-lg p-2 border border-white/10">
                    <div className="text-cat-muted text-[10px] font-mono mb-0.5">GENERATED BY</div>
                    <div className="font-bold text-cat-text truncate">{checkout.generatedBy}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleConfirm(checkout)}
                  disabled={isConfirming}
                  className="w-full bg-cat-yellow hover:bg-yellow-400 disabled:opacity-60 text-black font-extrabold text-sm py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,184,0,0.3)]"
                >
                  {isConfirming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Confirming Checkout...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      SCAN & CONFIRM CHECKOUT
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Instructions */}
      <div className="glass-surface border border-white/10 rounded-xl p-4">
        <h4 className="text-xs font-bold text-cat-muted uppercase mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-cat-warning" />
          Checkout Instructions
        </h4>
        <ol className="space-y-1.5 text-[11px] text-cat-muted list-decimal list-inside">
          <li>Fleet Manager generates a QR assignment for you</li>
          <li>You'll see it appear in this tab instantly</li>
          <li>Physically verify the equipment at the dealer yard</li>
          <li>Tap "SCAN & CONFIRM CHECKOUT" to activate the asset</li>
          <li>Equipment will be marked ACTIVE on your site</li>
        </ol>
      </div>
    </div>
  );
};

// ─── Main Employee Portal ─────────────────────────────────────────────────────
export const EmployeePortal: React.FC = () => {
  const { currentUser, logout, pendingCheckouts } = useAuthStore();
  const { assets } = useFleetStore();
  const [activeTab, setActiveTab] = useState<TabId>('home');

  if (!currentUser) return null;

  const operatorId = currentUser.operatorId!;
  const assignedAssetId = OPERATOR_ASSET_MAP[operatorId];
  const asset = assets.find((a) => (a.id || a.asset_id) === assignedAssetId) || null;

  const pendingCount = pendingCheckouts.filter(
    (c) => c.operatorId === operatorId && c.status === 'PENDING'
  ).length;

  return (
    <div className="h-screen w-screen ambient-glow-bg flex flex-col overflow-hidden relative">
      <AnimatedBackground />
      {/* Mobile Top Bar */}
      <header className="glass-card border-b border-white/15 px-4 py-3 flex items-center justify-between z-40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src="/cat-logo.png" alt="Caterpillar CAT Logo" className="h-8 w-auto object-contain drop-shadow-[0_0_12px_rgba(255,184,0,0.4)]" />
          <div>
            <div className="text-xs font-extrabold text-cat-text">Employee Portal</div>
            <div className="text-[10px] text-cat-muted font-mono">{operatorId}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-cat-muted hover:text-cat-critical text-[11px] font-medium transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-md mx-auto px-4 py-4">
          {activeTab === 'home' && (
            <HomeTab user={currentUser} asset={asset} operatorId={operatorId} />
          )}
          {activeTab === 'logs' && (
            <WorkLogsTab operatorId={operatorId} asset={asset} />
          )}
          {activeTab === 'checkout' && (
            <QRCheckoutTab operatorId={operatorId} />
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <TabBar active={activeTab} onChange={setActiveTab} checkoutCount={pendingCount} />
    </div>
  );
};
