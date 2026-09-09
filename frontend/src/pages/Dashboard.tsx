import React from 'react';
import { KPIRow } from '../components/dashboard/KPIRow';
import { PriorityActions } from '../components/dashboard/PriorityActions';
import { FleetMap } from '../components/dashboard/FleetMap';
import { SiteDemandVsCapacity } from '../components/dashboard/SiteDemandVsCapacity';
import { UtilizationOverview } from '../components/dashboard/UtilizationOverview';
import { FuelIdleAnalytics } from '../components/dashboard/FuelIdleAnalytics';
import { AIInsights } from '../components/dashboard/AIInsights';
import { Activity, MapPin, AlertTriangle, Cpu } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div className="p-5 space-y-6 max-w-[1920px] mx-auto overflow-y-auto h-full">
      {/* ─── SECTION 1: OVERVIEW & FLEET METRICS ─────────────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-cat-muted uppercase tracking-wider font-extrabold px-1">
          <Activity className="w-4 h-4 text-cat-yellow" />
          <span>1. FLEET OPERATIONAL OVERVIEW & TELEMETRY KPIS</span>
        </div>
        <KPIRow />
      </section>

      {/* ─── SECTION 2: LIVE TELEMETRY MAP & REAL-TIME DEMAND MATCHING ──────── */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-cat-muted uppercase tracking-wider font-extrabold px-1">
          <MapPin className="w-4 h-4 text-cat-yellow" />
          <span>2. REAL-TIME SPATIAL FLEET MAP & SITE DEMAND MATCHING</span>
        </div>
        <div className="grid grid-cols-12 gap-4 h-[440px]">
          <div className="col-span-8 h-full">
            <FleetMap />
          </div>
          <div className="col-span-4 h-full">
            <SiteDemandVsCapacity />
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: PRIORITY ACTIONS & DISPATCH QUEUE ───────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-cat-muted uppercase tracking-wider font-extrabold px-1">
          <AlertTriangle className="w-4 h-4 text-cat-warning animate-pulse" />
          <span>3. PRIORITY ACTIONS & REASSIGNMENT DISPATCH QUEUE</span>
        </div>
        <PriorityActions />
      </section>

      {/* ─── SECTION 4: DEEP ANALYTICS & EXPLAINABLE AI INTELLIGENCE ────────── */}
      <section className="space-y-2 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cat-muted uppercase tracking-wider font-extrabold px-1">
          <Cpu className="w-4 h-4 text-cat-yellow" />
          <span>4. FLEET EFFICIENCY ANALYTICS & EXPLAINABLE AI DECISION SUPPORT</span>
        </div>
        <div className="grid grid-cols-12 gap-4 h-[240px]">
          <div className="col-span-4 h-full">
            <UtilizationOverview />
          </div>
          <div className="col-span-4 h-full">
            <FuelIdleAnalytics />
          </div>
          <div className="col-span-4 h-full">
            <AIInsights />
          </div>
        </div>
      </section>
    </div>
  );
};
