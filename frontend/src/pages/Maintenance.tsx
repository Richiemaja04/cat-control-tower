import React, { useState } from 'react';
import { Wrench, CheckCircle, X } from 'lucide-react';
import { useFleetStore } from '../store/fleetStore';

export const MaintenancePage: React.FC = () => {
  const { assets, scheduledMaintenanceIds, scheduleMaintenance } = useFleetStore();
  const [showConfirmId, setShowConfirmId] = useState<string | null>(null);

  const staticItems = [
    {
      id: 'EQX1004',
      label: 'CAT 140 Motor Grader',
      badge: 'SERVICE DUE (492 hrs / 500 hrs)',
      recommendation: 'Schedule tomorrow 10:00–14:00 (Site S003 low-demand window).',
      window: 'Tomorrow 10:00–14:00',
    },
  ];

  const maintenanceAssets = assets.filter(
    (a) =>
      a.maintenance_status !== 'OK' ||
      a.status === 'MAINTENANCE' ||
      scheduledMaintenanceIds.includes(a.id) ||
      (a.engine_hours && a.engine_hours > 400)
  );

  const liveItems = maintenanceAssets
    .filter((a) => !staticItems.find((s) => s.id === a.id))
    .map((a) => ({
      id: a.id,
      label: a.name,
      badge:
        a.maintenance_status === 'SCHEDULED' || scheduledMaintenanceIds.includes(a.id)
          ? 'MAINTENANCE SCHEDULED'
          : a.maintenance_status === 'DUE_SOON'
          ? `SERVICE DUE (${Math.round(a.engine_hours ?? 450)} hrs)`
          : `HIGH ENGINE HOURS (${Math.round(a.engine_hours ?? 400)} hrs)`,
      recommendation: `Schedule during next available low-demand window at site ${a.current_site_id ?? 'YARD'}.`,
      window: 'Next available low-demand window',
    }));

  const allItems = [...staticItems, ...liveItems];

  const handleScheduleConfirm = (item: any) => {
    scheduleMaintenance(item.id, item.label, item.window);
    setShowConfirmId(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1920px] mx-auto overflow-y-auto h-full">
      <div>
        <h1 className="text-base font-extrabold text-cat-text tracking-wide flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cat-yellow/15 border border-cat-yellow/40">
            <Wrench className="w-4 h-4 text-cat-yellow" />
          </div>
          OPERATIONALLY-AWARE MAINTENANCE INTELLIGENCE
        </h1>
        <p className="text-xs text-cat-muted font-medium mt-0.5">
          Schedules maintenance during forecasted low-demand windows to eliminate site disruption.
        </p>
      </div>

      <div className="glass-card border border-white/10 rounded-xl p-4 space-y-3">
        <h2 className="text-xs font-extrabold text-cat-text uppercase tracking-wider font-mono flex items-center justify-between">
          <span>SCHEDULED MAINTENANCE & SERVICE INTERVALS ({allItems.length})</span>
          <span className="text-[10px] text-cat-muted font-normal">Auto-optimized low-demand windows</span>
        </h2>

        <div className="space-y-3">
          {allItems.map((item) => {
            const isScheduled =
              scheduledMaintenanceIds.includes(item.id) ||
              assets.find((a) => a.id === item.id)?.maintenance_status === 'SCHEDULED' ||
              assets.find((a) => a.id === item.id)?.status === 'MAINTENANCE';

            return (
              <div
                key={item.id}
                className={`glass-surface border p-3.5 rounded-xl flex items-center justify-between font-mono text-xs transition-all duration-300 ${
                  isScheduled
                    ? 'border-cat-success/40 bg-cat-success/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'border-cat-warning/40 hover:border-cat-yellow/60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-cat-text text-sm">
                      {item.id} ({item.label})
                    </span>
                    {isScheduled ? (
                      <span className="flex items-center gap-1 bg-cat-success/20 text-cat-success border border-cat-success/40 text-[9px] font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                        <CheckCircle className="w-3 h-3" />
                        SCHEDULED
                      </span>
                    ) : (
                      <span className="bg-cat-warning/20 text-cat-warning border border-cat-warning/40 text-[9px] font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-cat-muted mt-1 leading-snug">
                    {isScheduled
                      ? `Confirmed: ${item.window} — technician dispatched.`
                      : `Recommendation: ${item.recommendation}`}
                  </div>
                </div>

                {!isScheduled ? (
                  showConfirmId === item.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-cat-warning font-mono font-bold">Confirm?</span>
                      <button
                        onClick={() => handleScheduleConfirm(item)}
                        className="bg-cat-success text-black font-extrabold text-[10px] px-3.5 py-1.5 rounded-md hover:brightness-110 transition cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      >
                        YES
                      </button>
                      <button
                        onClick={() => setShowConfirmId(null)}
                        className="glass-pill border border-white/10 text-cat-muted font-bold text-[10px] px-2 py-1.5 rounded-md cursor-pointer hover:text-cat-text"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`schedule-service-${item.id}`}
                      onClick={() => setShowConfirmId(item.id)}
                      className="bg-cat-yellow hover:bg-yellow-400 text-black font-extrabold text-xs px-3.5 py-1.5 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(255,184,0,0.3)] cursor-pointer hover:scale-[1.02]"
                    >
                      SCHEDULE SERVICE
                    </button>
                  )
                ) : (
                  <span className="flex items-center gap-1.5 text-cat-success font-mono text-[11px] font-extrabold bg-cat-success/15 px-3 py-1 rounded-md border border-cat-success/30">
                    <CheckCircle className="w-3.5 h-3.5" />
                    CONFIRMED
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
