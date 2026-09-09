import React, { useEffect, useState } from 'react';
import {
  X, Truck, Activity, CheckCircle, AlertTriangle,
  Clock, Gauge, User, MapPin, Zap, PhoneCall
} from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';

type ActionType = 'REASSIGN' | 'MAINTENANCE' | 'RETURN' | null;

const statusColor: Record<string, string> = {
  ACTIVE: 'text-cat-success',
  IDLE: 'text-cat-warning',
  AT_RISK: 'text-cat-critical',
  TRANSITIONING: 'text-blue-400',
  MAINTENANCE: 'text-cat-warning',
  AVAILABLE: 'text-cat-muted',
};

const statusBg: Record<string, string> = {
  ACTIVE: 'bg-cat-success/15 border-cat-success/40',
  IDLE: 'bg-cat-warning/15 border-cat-warning/40',
  AT_RISK: 'bg-cat-critical/15 border-cat-critical/40',
  TRANSITIONING: 'bg-blue-500/15 border-blue-500/40',
  MAINTENANCE: 'bg-cat-warning/15 border-cat-warning/40',
  AVAILABLE: 'bg-white/10 border-white/20',
};

export const Asset360Drawer: React.FC = () => {
  const { is360DrawerOpen, closeAsset360, selectedAsset, scheduleAssetAction, openDriverCallModal } = useFleetStore();
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionDone, setActionDone] = useState<ActionType>(null);

  useEffect(() => {
    if (is360DrawerOpen) {
      setShowActionMenu(false);
      setActionDone(null);
    }
  }, [selectedAsset?.id, is360DrawerOpen]);

  if (!is360DrawerOpen || !selectedAsset) return null;

  const a = selectedAsset;

  const handleAction = (type: ActionType) => {
    if (!type) return;
    setShowActionMenu(false);
    setActionDone(type);
    scheduleAssetAction(a.id, type, a.current_site_id || 'S001');
  };

  const fuelColor = a.fuel_level < 15 ? 'text-cat-critical' : a.fuel_level < 30 ? 'text-cat-warning' : 'text-cat-success';
  const healthColor = a.health_score >= 90 ? 'text-cat-success' : a.health_score >= 75 ? 'text-cat-warning' : 'text-cat-critical';
  const utilColor = (v: number) => (v >= 70 ? 'bg-cat-success' : v >= 40 ? 'bg-cat-warning' : 'bg-cat-critical');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-[560px] backdrop-blur-2xl bg-cat-surface/90 border-l border-white/15 h-full flex flex-col shadow-2xl overflow-y-auto animate-slide-in-right">

        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cat-yellow/15 border border-cat-yellow/40 rounded-xl shadow-[0_0_15px_rgba(255,184,0,0.2)]">
              <Truck className="w-5 h-5 text-cat-yellow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-sm text-cat-text tracking-wide">{a.id}</h2>
                <span className="glass-pill text-cat-yellow text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-md">
                  {a.equipment_type}
                </span>
                <span
                  className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-md border ${
                    statusBg[a.status] ?? 'bg-white/10 border-white/20'
                  } ${statusColor[a.status] ?? 'text-cat-muted'}`}
                >
                  {a.status}
                </span>
              </div>
              <p className="text-xs text-cat-muted font-medium mt-0.5">{a.name}</p>
            </div>
          </div>
          <button onClick={closeAsset360} className="p-2 hover:bg-white/10 text-cat-muted hover:text-cat-text rounded-lg transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 flex-1">

          {/* Active Alerts */}
          {a.active_alerts?.length > 0 && (
            <div className="space-y-2">
              {a.active_alerts.map((alert: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5 bg-cat-critical/15 border border-cat-critical/40 p-3 rounded-lg text-[11px] font-mono text-cat-critical backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 animate-pulse" />
                  <span className="font-semibold leading-relaxed">{alert}</span>
                </div>
              ))}
            </div>
          )}

          {/* Site & Operator */}
          <div className="glass-card border border-white/10 p-3.5 rounded-xl grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-cat-muted block uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cat-yellow" /> ASSIGNED SITE
              </span>
              <span className="font-extrabold text-cat-text mt-0.5 block">
                {a.current_site_name ?? (a.current_site_id ? `Site ${a.current_site_id}` : 'AVAILABLE IN YARD')}
              </span>
              {a.current_site_id && (
                <span className="text-[10px] text-cat-muted block">{a.current_site_id}</span>
              )}
            </div>
            <div>
              <span className="text-[10px] text-cat-muted block uppercase font-bold flex items-center justify-between">
                <span className="flex items-center gap-1"><User className="w-3 h-3 text-cat-yellow" /> OPERATOR</span>
              </span>
              <span className="font-extrabold text-cat-text mt-0.5 block">{a.operator_name ?? 'Rajesh Kumar'}</span>
              <button
                onClick={() =>
                  openDriverCallModal({
                    assetId: a.id || a.asset_id,
                    driverName: a.operator_name || 'Rajesh Kumar',
                    siteId: a.current_site_id || 'S004',
                    targetSiteId: 'S002',
                    reason: `Capacity fit anomaly (${a.capacity_utilization || 18}% utilization)`,
                    recommendation: `Relocate ${a.id || 'asset'} to high demand site S002`,
                  })
                }
                className="mt-1 flex items-center gap-1 text-[9px] font-extrabold bg-cat-yellow/15 text-cat-yellow border border-cat-yellow/40 hover:bg-cat-yellow/25 px-2 py-1 rounded-md transition-all cursor-pointer shadow-sm"
              >
                <PhoneCall className="w-2.5 h-2.5" />
                <span>CALL DRIVER</span>
              </button>
            </div>
            <div>
              <span className="text-[10px] text-cat-muted block uppercase font-bold">HEALTH SCORE</span>
              <span className={`font-extrabold text-sm ${healthColor}`}>{a.health_score}/100</span>
              <span className="text-[10px] text-cat-muted block">{a.maintenance_status}</span>
            </div>
            <div>
              <span className="text-[10px] text-cat-muted block uppercase font-bold flex items-center gap-1">
                <Gauge className="w-3 h-3 text-cat-yellow" /> LIVE SPEED
              </span>
              <span className="font-extrabold text-cat-text">{a.speed?.toFixed(1) ?? 0} km/h</span>
              <span className="text-[10px] text-cat-muted block">Terrain: {a.terrain_capability}</span>
            </div>
          </div>

          {/* Live Telemetry */}
          <div className="glass-card border border-white/10 p-3.5 rounded-xl">
            <h3 className="text-xs font-extrabold text-cat-text uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
              <Activity className="w-4 h-4 text-cat-yellow animate-pulse" />
              LIVE TELEMETRY STREAM
            </h3>
            <div className="grid grid-cols-3 gap-2.5 font-mono text-xs">
              {[
                {
                  label: 'CURRENT LOAD',
                  value: `${a.current_load_tons?.toFixed(1) ?? 0} T`,
                  sub: `Capacity: ${a.capacity_tons} T`,
                  color: 'text-cat-yellow',
                },
                {
                  label: 'ENGINE HOURS',
                  value: `${Math.round(a.engine_hours ?? 0)} hrs`,
                  sub: 'Service at 500h',
                  color: a.engine_hours > 450 ? 'text-cat-warning' : 'text-cat-text',
                },
                {
                  label: 'FUEL LEVEL',
                  value: `${Math.round(a.fuel_level ?? 0)}%`,
                  sub: a.fuel_level < 15 ? '⚠ Refuel required' : 'Diesel',
                  color: fuelColor,
                },
                {
                  label: 'ENGINE TEMP',
                  value: `${a.engine_temperature?.toFixed(1) ?? '—'} °C`,
                  sub: a.engine_temperature > 95 ? '⚠ Overheating' : 'Normal',
                  color: a.engine_temperature > 95 ? 'text-cat-critical' : 'text-cat-text',
                },
                {
                  label: 'HYDRAULIC',
                  value: `${a.hydraulic_pressure?.toFixed(0) ?? '—'} bar`,
                  sub: 'Pressure',
                  color: 'text-cat-text',
                },
                {
                  label: 'IDLE TIME',
                  value: `${a.idle_hours?.toFixed(1) ?? 0} hrs`,
                  sub: 'Idle Duration',
                  color: 'text-cat-warning',
                },
              ].map((item) => (
                <div key={item.label} className="glass-surface p-2.5 rounded-lg border border-white/10">
                  <span className="text-[10px] text-cat-muted block font-semibold">{item.label}</span>
                  <span className={`font-extrabold text-sm ${item.color}`}>{item.value}</span>
                  <span className="text-[9px] text-cat-muted block mt-0.5">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Utilization Breakdown */}
          <div className="glass-card border border-white/10 p-3.5 rounded-xl">
            <h3 className="text-xs font-extrabold text-cat-text uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
              <Zap className="w-4 h-4 text-cat-yellow" />
              UTILIZATION BREAKDOWN
            </h3>

            <div className="grid grid-cols-3 gap-2 font-mono text-xs mb-3">
              {[
                { label: 'OPERATING HRS', value: `${a.operating_hours?.toFixed(1) ?? 0}h`, color: 'text-cat-success' },
                { label: 'IDLE HRS', value: `${a.idle_hours?.toFixed(1) ?? 0}h`, color: 'text-cat-warning' },
                { label: 'TRIPS TODAY', value: a.trips_completed ?? 0, color: 'text-cat-yellow' },
              ].map((m) => (
                <div key={m.label} className="glass-surface p-2.5 rounded-lg border border-white/10 text-center">
                  <span className="text-[10px] text-cat-muted block font-semibold">{m.label}</span>
                  <span className={`font-extrabold text-sm ${m.color}`}>{m.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Capacity Utilization', value: Math.round(a.capacity_utilization ?? 0) },
                { label: 'Operational Utilization', value: Math.round(a.operational_utilization ?? 0) },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-[11px] mb-1 font-mono">
                    <span className="text-cat-muted font-medium">{m.label}:</span>
                    <span className="font-bold text-cat-text">{m.value}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden p-[1px] border border-white/10">
                    <div
                      className={`${utilColor(m.value)} h-full rounded-full transition-all duration-700`}
                      style={{ width: `${Math.min(m.value, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trips */}
          <div className="glass-card border border-white/10 p-3.5 rounded-xl">
            <h3 className="text-xs font-extrabold text-cat-text uppercase tracking-wider mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cat-yellow" />
              RECENT TRIP LOG ({(a.recent_trips ?? []).length})
            </h3>
            <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono text-[11px]">
              {(a.recent_trips ?? []).length === 0 ? (
                <div className="text-cat-muted text-[10px] py-2 text-center">No recent trips logged.</div>
              ) : (
                (a.recent_trips ?? []).map((trip: any, idx: number) => (
                  <div key={idx} className="glass-surface p-2 rounded-lg border border-white/10 grid grid-cols-4 gap-2 items-center">
                    <span className="text-cat-text font-bold truncate">{trip.trip_id ?? trip.id}</span>
                    <span className="text-cat-yellow font-bold">{trip.load_tons} T</span>
                    <span className="text-cat-muted">{trip.material}</span>
                    <span className="text-cat-muted text-right font-medium">{trip.duration_min ?? trip.trip_duration_minutes}m</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between gap-3 sticky bottom-0">
          <button
            onClick={closeAsset360}
            className="w-1/2 glass-card hover:bg-white/10 text-cat-text border border-white/10 text-xs font-bold py-2.5 rounded-lg transition-all cursor-pointer active:scale-95"
          >
            CLOSE
          </button>

          {actionDone ? (
            <span className="w-1/2 flex items-center justify-center gap-1.5 text-cat-success font-mono font-extrabold text-xs border border-cat-success/40 rounded-lg py-2.5 bg-cat-success/15 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-4 h-4" />
              {actionDone} CONFIRMED
            </span>
          ) : showActionMenu ? (
            <div className="w-1/2 flex flex-col gap-1.5">
              {[
                { type: 'REASSIGN' as ActionType, label: '🔄 Reassign to New Site', cls: 'bg-cat-yellow text-black shadow-[0_0_10px_rgba(255,184,0,0.3)]' },
                { type: 'MAINTENANCE' as ActionType, label: '🔧 Book Maintenance Window', cls: 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' },
                { type: 'RETURN' as ActionType, label: '📦 Initiate Return', cls: 'bg-cat-critical text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]' },
              ].map((opt) => (
                <button
                  key={opt.type}
                  id={`action-${opt.type?.toLowerCase()}-${a.id}`}
                  onClick={() => handleAction(opt.type)}
                  className={`${opt.cls} font-extrabold text-[10px] px-3 py-1.5 rounded-md hover:brightness-110 transition-all text-left cursor-pointer hover:scale-[1.02]`}
                >
                  {opt.label}
                </button>
              ))}
              <button onClick={() => setShowActionMenu(false)} className="text-cat-muted text-[10px] font-mono text-center mt-0.5 cursor-pointer hover:text-cat-text">
                Cancel
              </button>
            </div>
          ) : (
            <button
              id={`schedule-action-${a.id}`}
              onClick={() => setShowActionMenu(true)}
              className="w-1/2 bg-cat-yellow hover:bg-yellow-400 text-black text-xs font-extrabold py-2.5 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(255,184,0,0.3)] hover:scale-[1.02] cursor-pointer"
            >
              SCHEDULE ACTION ▾
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
