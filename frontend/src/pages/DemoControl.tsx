import React from 'react';
import { Sliders, Play, AlertTriangle, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { useFleetStore } from '../store/fleetStore';

export const DemoControlPage: React.FC = () => {
  const { triggerDemoScenario, activePage, setActivePage } = useFleetStore();

  const scenarios = [
    {
      id: 'underutilization',
      title: 'HERO DEMO: SIMULATE UNDERUTILIZATION',
      description: 'Sets EQX1001 (2.0T dumper at S001) to carry ~1.0T load per trip (50% capacity utilization). Triggers AI Right-Sizing recommendation to swap with EQX1007 (1.0T dumper).',
      badge: 'HERO SCENARIO',
      badgeColor: 'bg-cat-yellow text-black'
    },
    {
      id: 'overload',
      title: 'SIMULATE CRITICAL OVERLOAD',
      description: 'Sets EQX1002 (3.0T excavator at S002) to carry 3.8T load. Generates CRITICAL safety alert for structural overload.',
      badge: 'SAFETY ALERT',
      badgeColor: 'bg-cat-critical text-white'
    },
    {
      id: 'location-anomaly',
      title: 'SIMULATE GEOFENCE LOCATION ANOMALY',
      description: 'Moves asset EQX1006 1.8km outside site geofence boundary. Generates HIGH severity location alert.',
      badge: 'GEOFENCE',
      badgeColor: 'bg-cat-warning text-black'
    },
    {
      id: 'rental-overrun',
      title: 'SIMULATE RENTAL OVERRUN RISK',
      description: 'Sets rental end date for EQX1002 to tomorrow with 87% overrun risk prediction.',
      badge: 'RENTAL RISK',
      badgeColor: 'bg-blue-500 text-white'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1920px] mx-auto overflow-y-auto h-full">
      <div>
        <h1 className="text-base font-extrabold text-cat-text tracking-wide flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cat-yellow" />
          HACKATHON DEMO CONTROL PANEL
        </h1>
        <p className="text-xs text-cat-muted">
          All scenario triggers modify <strong>backend state & database entities</strong>. Telemetry, intelligence calculations, alerts, and WebSockets update reactively.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {scenarios.map((sc) => (
          <div key={sc.id} className="bg-cat-card border border-cat-border hover:border-cat-yellow/60 p-4 rounded space-y-3 transition-colors flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${sc.badgeColor}`}>
                  {sc.badge}
                </span>
                <span className="text-[10px] font-mono text-cat-muted">POST /demo/{sc.id}</span>
              </div>
              <h2 className="font-extrabold text-sm text-cat-text">{sc.title}</h2>
              <p className="text-xs text-cat-muted leading-relaxed">{sc.description}</p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-cat-border">
              <button
                onClick={async () => {
                  await triggerDemoScenario(sc.id);
                  if (sc.id === 'underutilization') {
                    setActivePage('dashboard');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-cat-yellow hover:bg-yellow-400 text-black font-extrabold text-xs py-2 rounded shadow transition-colors"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>TRIGGER SCENARIO ON BACKEND</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
