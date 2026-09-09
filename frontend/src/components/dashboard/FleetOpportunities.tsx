import React from 'react';
import { Sparkles } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';

export const FleetOpportunities: React.FC = () => {
  const { recommendations, approveRecommendation } = useFleetStore();
  const rightSizeRec = recommendations.find(r => r.type === 'RIGHT_SIZING' && r.status === 'PENDING');

  return (
    <div className="glass-card rounded-xl p-3.5 h-full flex flex-col justify-between border-t-2 border-t-cat-yellow/60">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-cat-yellow/15 border border-cat-yellow/40">
            <Sparkles className="w-3.5 h-3.5 text-cat-yellow animate-pulse" />
          </div>
          <h3 className="text-xs font-extrabold text-cat-text uppercase tracking-wider">RIGHT-SIZING OPPORTUNITY</h3>
        </div>
        <span className="bg-cat-yellow text-black text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(255,184,0,0.3)]">
          {rightSizeRec?.suitability_score ? `${rightSizeRec.suitability_score}/100 SUITABILITY` : 'HIGH OPTIMIZATION FIT'}
        </span>
      </div>

      {rightSizeRec ? (
        <div className="glass-surface border border-white/10 p-2.5 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono font-extrabold text-cat-text">{rightSizeRec.asset_id} → {rightSizeRec.recommended_asset_id}</span>
            <span className="text-cat-success font-mono font-extrabold text-[10px]">{rightSizeRec.suitability_score}/100 SCORE</span>
          </div>

          <p className="text-[11px] text-cat-muted leading-tight">
            {rightSizeRec.what_changed?.replace(/with ₹.*$/, '') ?? rightSizeRec.what_changed}
          </p>

          <div className="pt-1 flex items-center justify-between">
            <span className="text-[10px] text-cat-yellow font-mono font-semibold">Impact: Utilization 50% → 91%</span>
            <button
              onClick={() => approveRecommendation(rightSizeRec.id)}
              className="bg-cat-yellow hover:bg-yellow-400 text-black font-extrabold text-[10px] px-3 py-1 rounded-md transition-all duration-200 shadow-[0_0_10px_rgba(255,184,0,0.3)] hover:scale-[1.03] cursor-pointer"
            >
              APPROVE & SCHEDULE
            </button>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-cat-muted font-mono text-center py-4">No active right-sizing opportunities pending.</div>
      )}
    </div>
  );
};
