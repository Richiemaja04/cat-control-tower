import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';

export const RentalRisk: React.FC = () => {
  const { rentals, openAsset360 } = useFleetStore();
  const highRiskRentals = rentals.filter(r => r.extension_risk_probability > 0.4);

  return (
    <div className="glass-card rounded-xl p-3.5 h-full flex flex-col justify-between border-t-2 border-t-cat-critical/60">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-cat-critical/15 border border-cat-critical/40">
            <Clock className="w-3.5 h-3.5 text-cat-critical" />
          </div>
          <h3 className="text-xs font-extrabold text-cat-text uppercase tracking-wider">PREDICTIVE RENTAL OVERRUN RISK</h3>
        </div>
        <span className="text-[10px] font-mono text-cat-critical font-extrabold bg-cat-critical/15 px-2 py-0.5 rounded border border-cat-critical/40">
          ML PREDICTION
        </span>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto max-h-[120px]">
        {highRiskRentals.length === 0 ? (
          <div className="text-[11px] text-cat-muted font-mono text-center py-4">No active rental overrun risks detected.</div>
        ) : (
          highRiskRentals.map((r, idx) => (
            <div key={idx} className="glass-surface border border-white/10 p-2 rounded-lg flex items-center justify-between hover:border-cat-critical/40 transition-all">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-xs text-cat-text">{r.asset_id}</span>
                  <span className="bg-cat-critical/20 text-cat-critical font-mono text-[9px] px-1.5 py-0.5 rounded font-extrabold flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5 animate-pulse" />
                    {Math.round(r.extension_risk_probability * 100)}% RISK
                  </span>
                </div>
                <div className="text-[10px] text-cat-muted font-mono mt-0.5">{r.site_name}</div>
              </div>
              <button
                onClick={() => openAsset360(r.asset_id)}
                className="glass-pill hover:bg-white/10 text-cat-yellow border border-white/10 text-[10px] font-extrabold px-2.5 py-1 rounded-md cursor-pointer hover:scale-105 transition-all"
              >
                REVIEW
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
