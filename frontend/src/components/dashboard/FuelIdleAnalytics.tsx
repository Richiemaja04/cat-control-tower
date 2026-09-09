import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Flame, AlertTriangle } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';

export const FuelIdleAnalytics: React.FC = () => {
  const { assets } = useFleetStore();

  const fuelData = (assets.length > 0 ? assets : [
    { id: 'EQX1001', idle_hours: 6.5, operating_hours: 50.2, fuel_level: 43 },
    { id: 'EQX1002', idle_hours: 4.2, operating_hours: 45.0, fuel_level: 18 },
    { id: 'EQX1003', idle_hours: 1.5, operating_hours: 38.4, fuel_level: 75 },
    { id: 'EQX1004', idle_hours: 2.1, operating_hours: 48.0, fuel_level: 60 },
    { id: 'EQX1005', idle_hours: 3.8, operating_hours: 42.0, fuel_level: 82 },
  ]).slice(0, 5).map(a => ({
    assetId: a.id,
    idleHours: parseFloat((a.idle_hours ?? 2.5).toFixed(1)),
    opHours: parseFloat((a.operating_hours ?? 40.0).toFixed(1)),
    fuelLevel: Math.round(a.fuel_level ?? 50),
  }));

  const topIdleAsset = [...fuelData].sort((a, b) => b.idleHours - a.idleHours)[0];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="backdrop-blur-xl bg-cat-surface/90 border border-white/15 p-2 rounded-lg shadow-2xl font-mono text-[11px]">
          <div className="font-extrabold text-cat-yellow mb-0.5">{data.assetId} Telemetry</div>
          <div className="text-cat-warning">Idle Time: <strong>{data.idleHours} hrs</strong></div>
          <div className="text-cat-success">Operating Time: <strong>{data.opHours} hrs</strong></div>
          <div className="text-cat-text">Fuel Level: <strong className={data.fuelLevel < 20 ? 'text-cat-critical' : 'text-cat-success'}>{data.fuelLevel}%</strong></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-xl p-3.5 h-full flex flex-col justify-between border-t-2 border-t-cat-warning/60">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-cat-warning/15 border border-cat-warning/40">
            <Flame className="w-3.5 h-3.5 text-cat-warning animate-pulse" />
          </div>
          <h3 className="text-xs font-extrabold text-cat-text uppercase tracking-wider">IDLE WASTAGE & FUEL ANALYTICS</h3>
        </div>
        <span className="bg-cat-warning/20 text-cat-warning text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md border border-cat-warning/40">
          IDLE LOSS
        </span>
      </div>

      <div className="w-full h-[110px] my-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fuelData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <XAxis dataKey="assetId" stroke="#94A3B8" fontSize={9} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="idleHours" name="Idle Hours" radius={[4, 4, 0, 0]}>
              {fuelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.idleHours > 4.0 ? '#EF4444' : '#F59E0B'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {topIdleAsset && (
        <div className="glass-surface border border-white/10 p-2 rounded-lg flex items-center justify-between font-mono text-[10px]">
          <div className="flex items-center gap-1.5 text-cat-warning">
            <AlertTriangle className="w-3.5 h-3.5 text-cat-warning flex-shrink-0 animate-pulse" />
            <span>High Idle: <strong className="text-cat-text">{topIdleAsset.assetId}</strong> ({topIdleAsset.idleHours}h idle)</span>
          </div>
          <span className="text-cat-muted">Fuel {topIdleAsset.fuelLevel}%</span>
        </div>
      )}
    </div>
  );
};
