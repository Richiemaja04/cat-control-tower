import React from 'react';
import { Brain, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';

const DEFAULT_REC = {
  id: 'REC-HERO-S001',
  asset_id: 'EQX1001',
  source_site_id: 'S001',
  destination_site_id: 'S001',
  recommended_asset_id: 'EQX1007',
  type: 'RIGHT_SIZING',
  suitability_score: 94.0,
  what_changed:
    'Site S001 demand is 1.0T/day. Current asset EQX1001 (2.0T capacity) is running at 50% capacity utilization.',
  why_explanation:
    'EQX1007 (1.0T capacity) perfectly matches 1.0T site requirement and eliminates 5.8 hrs/day idle loss.',
  expected_impact:
    'Capacity utilization increases from 50% → 91%. Idle hours drop from 6.2h → 1.5h/day.',
  status: 'PENDING',
};

export const AIInsights: React.FC = () => {
  const { recommendations, approveRecommendation } = useFleetStore();

  const heroRec =
    recommendations.find((r) => r.type === 'RIGHT_SIZING' || r.status === 'PENDING') ||
    DEFAULT_REC;

  const isPending = heroRec.status === 'PENDING' || heroRec.status === 'pending';

  const sanitizeText = (txt?: string) => {
    if (!txt) return '';
    return txt.replace(/₹[\d,]+(\/day)?/g, '').replace(/INR [\d,]+/g, '').replace(/Potential daily saving:.*$/, '');
  };

  return (
    <div className="glass-card rounded-xl p-4 h-full flex flex-col justify-between relative overflow-hidden border-t-2 border-t-cat-yellow/60">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cat-yellow/15 border border-cat-yellow/40 backdrop-blur-md">
            <Brain className="w-4 h-4 text-cat-yellow animate-pulse" />
          </div>
          <h3 className="text-xs font-extrabold text-cat-text uppercase tracking-wider">
            EXPLAINABLE AI CONTROL TOWER INSIGHT
          </h3>
        </div>
        <span className="bg-cat-yellow/20 text-cat-yellow font-mono text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-cat-yellow/40 shadow-[0_0_15px_rgba(255,184,0,0.2)]">
          SUITABILITY {heroRec.suitability_score}/100
        </span>
      </div>

      <div className="space-y-2.5 text-[11px]">
        <div>
          <span className="font-mono text-cat-yellow font-bold uppercase text-[10px] tracking-wider block mb-0.5">
            1. WHAT CHANGED?
          </span>
          <p className="text-cat-text leading-tight">{sanitizeText(heroRec.what_changed) || DEFAULT_REC.what_changed}</p>
        </div>

        <div>
          <span className="font-mono text-cat-yellow font-bold uppercase text-[10px] tracking-wider block mb-0.5">
            2. WHY RECOMMENDATION?
          </span>
          <p className="text-cat-muted leading-tight">{sanitizeText(heroRec.why_explanation) || DEFAULT_REC.why_explanation}</p>
        </div>

        <div>
          <span className="font-mono text-cat-yellow font-bold uppercase text-[10px] tracking-wider block mb-0.5">
            3. EXPECTED IMPACT & PERFORMANCE
          </span>
          <p className="text-cat-success font-bold leading-tight">{sanitizeText(heroRec.expected_impact) || DEFAULT_REC.expected_impact}</p>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
        <span className="text-[10px] font-mono text-cat-muted">
          RECOMMENDATION: Reassign <strong className="text-cat-text">{heroRec.asset_id}</strong> → <strong className="text-cat-yellow">{heroRec.recommended_asset_id}</strong>
        </span>
        {isPending ? (
          <button
            id="approve-schedule-btn"
            onClick={() => approveRecommendation(heroRec.id)}
            className="flex items-center gap-1.5 bg-cat-yellow hover:bg-yellow-400 text-black font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(255,184,0,0.3)] hover:scale-[1.03] cursor-pointer"
          >
            <span>APPROVE & SCHEDULE</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-cat-success font-mono font-extrabold text-[10px] bg-cat-success/15 border border-cat-success/30 px-3 py-1 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>APPROVED & TRANSITIONING</span>
          </span>
        )}
      </div>
    </div>
  );
};
