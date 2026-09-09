import React from 'react';
import { BarChart2 } from 'lucide-react';

export const UtilizationOverview: React.FC = () => {
  return (
    <div className="glass-card rounded-xl p-3.5 h-full flex flex-col justify-between border-t-2 border-t-cat-yellow/60">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-cat-yellow/15 border border-cat-yellow/40">
            <BarChart2 className="w-3.5 h-3.5 text-cat-yellow" />
          </div>
          <h3 className="text-xs font-extrabold text-cat-text uppercase tracking-wider">UTILIZATION DUAL METRICS</h3>
        </div>
        <span className="text-[10px] font-mono text-cat-yellow font-extrabold bg-cat-yellow/15 px-2 py-0.5 rounded border border-cat-yellow/40">
          DERIVED DATA
        </span>
      </div>

      <div className="space-y-3 my-1">
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-cat-muted font-medium">Operational Utilization (Engine Hours / Total)</span>
            <span className="text-cat-success font-extrabold">78.5%</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden p-[1px] border border-white/10">
            <div className="bg-cat-success h-full rounded-full shadow-[0_0_8px_#10B981]" style={{ width: '78.5%' }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-cat-muted font-medium">Capacity Utilization (Actual Load / Asset Capacity)</span>
            <span className="text-cat-warning font-extrabold">64.2%</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden p-[1px] border border-white/10">
            <div className="bg-cat-warning h-full rounded-full shadow-[0_0_8px_#F59E0B]" style={{ width: '64.2%' }}></div>
          </div>
        </div>
      </div>

      <div className="p-2 glass-surface border border-white/10 rounded-lg text-[10px] text-cat-muted leading-tight font-mono">
        💡 <strong className="text-cat-text">Key Distinction:</strong> High engine runtime (78.5%) masks underlying payload capacity underutilization (64.2%).
      </div>
    </div>
  );
};
