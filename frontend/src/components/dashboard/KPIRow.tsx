import React from 'react';
import { Truck, Play, Pause, AlertTriangle, Activity, ArrowRightLeft } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';

export const KPIRow: React.FC = () => {
  const { summary, assets } = useFleetStore();

  const totalAssets = assets.length > 0 ? assets.length : (summary?.total_rented_assets ?? 0);
  const activeCount = assets.length > 0 ? assets.filter((a) => a.status === 'ACTIVE').length : (summary?.active_assets ?? 0);
  const idleCount = assets.length > 0 ? assets.filter((a) => a.status === 'IDLE').length : (summary?.idle_assets ?? 0);
  const atRiskCount = assets.length > 0 ? assets.filter((a) => a.status === 'AT_RISK' || a.status === 'CRITICAL').length : (summary?.at_risk_assets ?? 0);
  const transitioningCount = assets.filter((a) => a.status === 'TRANSITIONING').length;

  const avgCapUtil =
    assets.length > 0
      ? (assets.reduce((acc, a) => acc + (a.capacity_utilization ?? 50), 0) / assets.length).toFixed(1)
      : (summary?.fleet_capacity_utilization ?? 64.2).toFixed(1);

  const kpis = [
    {
      label: 'TOTAL RENTED ASSETS',
      value: totalAssets,
      icon: Truck,
      color: 'text-cat-text',
      bgColor: 'bg-white/5 border-white/10',
      subtitle: 'Across Active Sites',
    },
    {
      label: 'ACTIVE ASSETS',
      value: activeCount,
      icon: Play,
      color: 'text-cat-success',
      bgColor: 'bg-cat-success/15 border-cat-success/30',
      subtitle: 'Operating smoothly',
    },
    {
      label: 'IDLE ASSETS',
      value: idleCount,
      icon: Pause,
      color: 'text-cat-warning',
      bgColor: 'bg-cat-warning/15 border-cat-warning/30',
      subtitle: 'Fuel & Idle Wastage',
    },
    {
      label: 'AT RISK ASSETS',
      value: atRiskCount,
      icon: AlertTriangle,
      color: 'text-cat-critical',
      bgColor: 'bg-cat-critical/15 border-cat-critical/30',
      subtitle: 'Overload / Overrun',
    },
    {
      label: 'FLEET CAPACITY UTIL',
      value: `${avgCapUtil}%`,
      icon: Activity,
      color: 'text-cat-yellow',
      bgColor: 'bg-cat-yellow/15 border-cat-yellow/30',
      subtitle: 'Target: >85%',
    },
    {
      label: 'IN-TRANSITION ASSETS',
      value: transitioningCount,
      icon: ArrowRightLeft,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      subtitle: 'Active Reassignments',
    },
  ];

  return (
    <div className="grid grid-cols-6 gap-3.5 mb-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="glass-card rounded-xl p-3.5 flex flex-col justify-between cursor-default"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cat-muted/90 uppercase tracking-widest font-semibold">{kpi.label}</span>
              <div className={`p-1.5 rounded-lg border ${kpi.bgColor} backdrop-blur-md`}>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <div className={`text-2xl font-extrabold ${kpi.color} font-mono tracking-tight`}>
                {kpi.value}
              </div>
              <div className="text-[10px] text-cat-muted font-medium mt-0.5">{kpi.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
