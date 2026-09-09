import React, { useState } from 'react';
import {
  CheckSquare, ArrowRight, CheckCircle2, Truck, AlertTriangle,
  RefreshCw, Wrench, Package, X, ChevronDown, ChevronUp,
  MapPin, Activity, PhoneCall,
} from 'lucide-react';
import { useFleetStore } from '../store/fleetStore';

// ─── Action type options per alert ───────────────────────────────────────────
type ActionType = 'REASSIGN' | 'MAINTENANCE' | 'RETURN';

const ACTION_OPTS: { type: ActionType; label: string; icon: React.ReactNode; color: string }[] = [
  {
    type: 'REASSIGN',
    label: 'REASSIGN TO SITE',
    icon: <RefreshCw className="w-3.5 h-3.5" />,
    color: 'bg-cat-yellow hover:bg-yellow-400 text-black shadow-[0_0_12px_rgba(255,184,0,0.3)]',
  },
  {
    type: 'MAINTENANCE',
    label: 'BOOK MAINTENANCE',
    icon: <Wrench className="w-3.5 h-3.5" />,
    color: 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(147,51,234,0.3)]',
  },
  {
    type: 'RETURN',
    label: 'RETURN TO DEALER',
    icon: <Package className="w-3.5 h-3.5" />,
    color: 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]',
  },
];

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return <span className="bg-cat-critical/20 text-cat-critical border border-cat-critical/40 text-[9px] font-mono px-2 py-0.5 rounded-md font-extrabold uppercase">CRITICAL</span>;
    case 'HIGH':
      return <span className="bg-cat-warning/20 text-cat-warning border border-cat-warning/40 text-[9px] font-mono px-2 py-0.5 rounded-md font-extrabold uppercase">HIGH</span>;
    default:
      return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[9px] font-mono px-2 py-0.5 rounded-md font-extrabold uppercase">MEDIUM</span>;
  }
};

const getStatusBadge = (status: string) => {
  const s = (status || 'SCHEDULED').toUpperCase();
  const styles: Record<string, string> = {
    TRANSITIONING: 'bg-cat-yellow/20 text-cat-yellow border-cat-yellow/40',
    ACTIVE: 'bg-cat-success/20 text-cat-success border-cat-success/40',
    SCHEDULED: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    PENDING_APPROVAL: 'bg-cat-warning/20 text-cat-warning border-cat-warning/40',
    RESOLVED: 'bg-cat-success/20 text-cat-success border-cat-success/40',
  };
  const cls = styles[s] || 'bg-white/10 text-cat-muted border-white/20';
  return <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-md border ${cls}`}>{s}</span>;
};

// ─── Priority Action Card ─────────────────────────────────────────────────────
const PriorityActionCard: React.FC<{ pa: any }> = ({ pa }) => {
  const { resolvePriorityAction, scheduleAssetAction, scheduleMaintenance, openAsset360, openDriverCallModal } = useFleetStore();
  const [selectedAction, setSelectedAction] = useState<ActionType>('REASSIGN');
  const [expanded, setExpanded] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (resolved) return null;

  const handleExecute = () => {
    setConfirming(true);
    setTimeout(() => {
      if (selectedAction === 'REASSIGN') {
        resolvePriorityAction(pa.alert_id, pa.asset_id, 'REASSIGN');
        scheduleAssetAction(pa.asset_id, 'REASSIGN', pa.site_id || 'S001');
      } else if (selectedAction === 'MAINTENANCE') {
        scheduleMaintenance(pa.asset_id, pa.asset_id, 'Next available window');
      } else if (selectedAction === 'RETURN') {
        scheduleAssetAction(pa.asset_id, 'RETURN', 'DEALER_YARD');
        resolvePriorityAction(pa.alert_id, pa.asset_id, 'RETURN');
      }
      setResolved(true);
      setConfirming(false);
    }, 800);
  };

  return (
    <div className="glass-surface border border-white/10 hover:border-cat-yellow/40 rounded-xl overflow-hidden transition-all duration-200">
      {/* Main Row */}
      <div className="p-4 flex items-start gap-4">
        <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 flex-shrink-0 mt-0.5">
          <Truck className="w-4 h-4 text-cat-yellow" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {getSeverityBadge(pa.severity)}
            <span className="font-extrabold text-cat-text text-sm font-mono">{pa.asset_id}</span>
            <span className="text-cat-yellow text-[10px] font-bold bg-cat-yellow/10 border border-cat-yellow/30 px-1.5 py-0.5 rounded">{pa.type}</span>
          </div>
          <p className="text-[11px] text-cat-text leading-snug mb-1">{pa.explanation}</p>
          <div className="text-[10px] text-cat-muted font-mono">
            Observed: <strong className="text-cat-text">{pa.observed_value}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() =>
              openDriverCallModal({
                assetId: pa.asset_id,
                driverName: 'Rajesh Kumar',
                siteId: pa.site_id || 'S004',
                targetSiteId: 'S002',
                reason: pa.explanation || 'Equipment-Workload Mismatch',
                recommendation: `Relocate ${pa.asset_id} to Site S002`,
              })
            }
            className="flex items-center gap-1 text-[10px] font-extrabold bg-gradient-to-r from-cat-yellow to-yellow-500 hover:from-yellow-400 hover:to-cat-yellow text-black px-3 py-1.5 rounded-lg transition-all shadow-[0_0_12px_rgba(255,184,0,0.3)] cursor-pointer hover:scale-[1.02]"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>CALL DRIVER</span>
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] text-cat-muted hover:text-cat-text glass-pill border border-white/10 px-2.5 py-1.5 rounded-lg font-mono cursor-pointer transition-colors"
          >
            ACTIONS {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded Action Panel */}
      {expanded && (
        <div className="border-t border-white/10 p-4 bg-black/20 space-y-3 animate-fade-in">
          <p className="text-[11px] text-cat-muted font-mono uppercase tracking-wider">Select action type:</p>

          {/* Action Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            {ACTION_OPTS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setSelectedAction(opt.type)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                  selectedAction === opt.type
                    ? 'border-cat-yellow/60 bg-cat-yellow/15 text-cat-yellow shadow-[0_0_10px_rgba(255,184,0,0.15)]'
                    : 'border-white/10 glass-surface text-cat-muted hover:border-white/20 hover:text-cat-text'
                }`}
              >
                {opt.icon}
                <span className="text-[10px]">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Context for selected action */}
          <div className="glass-surface border border-white/10 rounded-lg p-3 text-[11px] text-cat-muted">
            {selectedAction === 'REASSIGN' && <><MapPin className="w-3.5 h-3.5 text-cat-yellow inline mr-1.5" />Asset will be marked TRANSITIONING and dispatched to the optimal available site based on demand matching.</>}
            {selectedAction === 'MAINTENANCE' && <><Wrench className="w-3.5 h-3.5 text-purple-400 inline mr-1.5" />Asset will be scheduled for preventive maintenance in the next available low-demand window. Technician notified.</>}
            {selectedAction === 'RETURN' && <><Package className="w-3.5 h-3.5 text-blue-400 inline mr-1.5" />Asset will be returned to the Dealer Yard. Rental contract closed and customer notification sent.</>}
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAsset360(pa.asset_id)}
              className="glass-pill border border-white/10 hover:border-white/20 text-cat-muted hover:text-cat-text text-[10px] font-extrabold px-3 py-2 rounded-lg cursor-pointer transition-all"
            >
              INSPECT 360°
            </button>
            <button
              onClick={handleExecute}
              disabled={confirming}
              className={`flex-1 flex items-center justify-center gap-2 font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer ${
                ACTION_OPTS.find((o) => o.type === selectedAction)?.color || ''
              } ${confirming ? 'opacity-60' : 'hover:scale-[1.01]'}`}
            >
              {confirming ? (
                <div className="w-3.5 h-3.5 border-2 border-current/40 border-t-current rounded-full animate-spin" />
              ) : (
                ACTION_OPTS.find((o) => o.type === selectedAction)?.icon
              )}
              {confirming ? 'EXECUTING...' : `EXECUTE: ${ACTION_OPTS.find((o) => o.type === selectedAction)?.label}`}
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="text-cat-muted hover:text-cat-text p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Action Center Page ──────────────────────────────────────────────────
export const ActionCenterPage: React.FC = () => {
  const { actionsList, priorityActions, openAsset360 } = useFleetStore();

  const getActionIcon = (type: string) => {
    if (!type) return <Truck className="w-4 h-4 text-cat-yellow" />;
    const t = type.toUpperCase();
    if (t.includes('MAINTENANCE')) return <Wrench className="w-4 h-4 text-purple-400" />;
    if (t.includes('RETURN')) return <Package className="w-4 h-4 text-blue-400" />;
    if (t.includes('CHECKOUT')) return <CheckCircle2 className="w-4 h-4 text-cat-success" />;
    return <RefreshCw className="w-4 h-4 text-cat-yellow" />;
  };

  return (
    <div className="p-6 space-y-6 max-w-[1920px] mx-auto overflow-y-auto h-full">
      {/* Header */}
      <div>
        <h1 className="text-base font-extrabold text-cat-text tracking-wide flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cat-yellow/15 border border-cat-yellow/40">
            <CheckSquare className="w-4 h-4 text-cat-yellow" />
          </div>
          ACTION CENTER & CLOSED-LOOP OUTCOMES
        </h1>
        <p className="text-xs text-cat-muted font-medium mt-0.5">
          Human-in-the-loop approvals with individual action selection: Reassign, Book Maintenance, or Return to Dealer.
        </p>
      </div>

      {/* Priority Action Queue */}
      {priorityActions.length > 0 && (
        <div className="glass-card border-t-2 border-t-cat-warning/60 border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-xs font-extrabold text-cat-yellow uppercase tracking-wider font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              PENDING PRIORITY ACTIONS ({priorityActions.length})
            </h2>
            <span className="text-[10px] font-mono text-cat-muted bg-white/5 px-2 py-0.5 rounded border border-white/10">
              Click ACTIONS on each card to resolve individually
            </span>
          </div>

          <div className="space-y-2">
            {priorityActions.map((pa: any, idx: number) => (
              <PriorityActionCard key={pa.alert_id || `pa-${idx}`} pa={pa} />
            ))}
          </div>
        </div>
      )}

      {priorityActions.length === 0 && (
        <div className="glass-card border border-cat-success/30 rounded-xl p-5 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-cat-success flex-shrink-0" />
          <div>
            <p className="text-xs font-extrabold text-cat-success">All Priority Actions Resolved</p>
            <p className="text-xs text-cat-muted">Fleet is operating normally. No pending critical alerts.</p>
          </div>
        </div>
      )}

      {/* Action Execution History */}
      <div className="glass-card border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-extrabold text-cat-text uppercase tracking-wider font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-cat-yellow" />
            ACTION EXECUTION LOG ({actionsList.length})
          </h2>
        </div>

        <div className="space-y-2">
          {actionsList.length === 0 ? (
            <div className="text-center py-8 text-cat-muted font-mono text-xs">
              No active or scheduled actions in queue.
            </div>
          ) : (
            actionsList.map((act: any, idx: number) => (
              <div
                key={act.id || `act-${idx}`}
                className="glass-surface border border-white/10 hover:border-white/20 p-3.5 rounded-xl transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Asset + Action Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-black/40 rounded-xl border border-white/10 flex-shrink-0">
                      {getActionIcon(act.action_type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-extrabold text-cat-text font-mono text-xs">{act.id}</span>
                        {getStatusBadge(act.status)}
                        <span className="text-[10px] text-cat-muted font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                          {act.action_type || 'REASSIGNMENT'}
                        </span>
                      </div>
                      <div className="text-[11px] text-cat-muted">
                        Asset <strong className="text-cat-text">{act.asset_id}</strong>
                        {act.destination_site_id && (
                          <> → <strong className="text-cat-text">{act.destination_site_id}</strong></>
                        )}
                        {act.explanation && (
                          <span className="ml-2 text-cat-muted/80">{act.explanation}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-cat-muted/60 font-mono mt-0.5">
                        {act.created_at ? new Date(act.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                      </div>
                    </div>
                  </div>

                  {/* Right: Utilization Impact */}
                  {(act.before_utilization != null && act.after_utilization != null) && (
                    <div className="flex items-center gap-3 text-[11px] flex-shrink-0">
                      <div className="text-center">
                        <span className="text-cat-muted block text-[9px] font-bold uppercase">Before</span>
                        <span className="text-cat-warning font-extrabold">{act.before_utilization}%</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-cat-yellow" />
                      <div className="text-center">
                        <span className="text-cat-muted block text-[9px] font-bold uppercase">After</span>
                        <span className="text-cat-success font-extrabold">{act.after_utilization}%</span>
                      </div>
                    </div>
                  )}

                  {/* View Asset */}
                  {act.asset_id && (
                    <button
                      onClick={() => openAsset360(act.asset_id)}
                      className="glass-pill border border-white/10 hover:border-cat-yellow/40 text-cat-muted hover:text-cat-yellow text-[9px] font-extrabold px-2.5 py-1 rounded-lg cursor-pointer transition-all flex-shrink-0"
                    >
                      360°
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
