import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';

export const PriorityActions: React.FC = () => {
  const { priorityActions, openAsset360, setActivePage } = useFleetStore();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="bg-cat-critical/20 text-cat-critical border border-cat-critical/40 text-[9px] font-mono px-2 py-0.5 rounded-md font-extrabold uppercase shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="bg-cat-warning/20 text-cat-warning border border-cat-warning/40 text-[9px] font-mono px-2 py-0.5 rounded-md font-extrabold uppercase shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            HIGH
          </span>
        );
      default:
        return (
          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[9px] font-mono px-2 py-0.5 rounded-md font-extrabold uppercase">
            MEDIUM
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-xl flex flex-col h-full overflow-hidden border-t-2 border-t-cat-warning/50">
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-cat-warning/15 border border-cat-warning/40">
            <AlertTriangle className="w-3.5 h-3.5 text-cat-warning animate-pulse" />
          </div>
          <h2 className="text-xs font-extrabold tracking-wider text-cat-text uppercase">PRIORITY ACTIONS QUEUE</h2>
        </div>
        <span className="text-[10px] font-mono text-cat-muted bg-white/5 px-2 py-0.5 rounded border border-white/10">{priorityActions.length} PENDING ALERTS</span>
      </div>

      <div className="p-3 overflow-y-auto flex-1 max-h-[300px]">
        {priorityActions.length === 0 ? (
          <div className="text-center py-6 text-cat-muted text-xs font-mono">
            No pending priority alerts. Fleet operating normally.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {priorityActions.map((action, idx) => (
              <div
                key={action.alert_id || idx}
                className="glass-surface border border-white/10 hover:border-cat-yellow/60 rounded-xl p-3 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(action.severity)}
                      <span className="font-mono font-extrabold text-cat-text text-xs">{action.asset_id}</span>
                    </div>
                    <span className="text-[9px] font-mono text-cat-yellow font-bold">{action.type}</span>
                  </div>

                  <p className="text-[11px] text-cat-text leading-tight mb-2 font-medium">
                    {action.explanation}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-1">
                  <span className="text-[10px] font-mono text-cat-muted">
                    Observed: <strong className="text-cat-text">{action.observed_value}</strong>
                  </span>
                  <button
                    onClick={() => {
                      if (action.type === 'UNDERUTILIZED') {
                        setActivePage('intelligence');
                      } else {
                        openAsset360(action.asset_id);
                      }
                    }}
                    className="flex items-center gap-1 bg-cat-yellow text-black hover:bg-yellow-400 text-[10px] font-extrabold px-2.5 py-1 rounded-md transition-all duration-200 shadow-[0_0_10px_rgba(255,184,0,0.25)] hover:scale-[1.03] cursor-pointer"
                  >
                    <span>ACTION</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
