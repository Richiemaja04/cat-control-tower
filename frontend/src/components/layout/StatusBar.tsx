import React from 'react';
import { Clock, AlertTriangle, Truck, Wrench, WifiOff, TrendingUp } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';

export const StatusBar: React.FC = () => {
  const { summary, rentals } = useFleetStore();

  const overdueCount = rentals.filter(r => r.status === 'OVERDUE' || r.extension_risk_probability > 0.7).length;
  const transitioningCount = useFleetStore(s => s.assets.filter(a => a.status === 'TRANSITIONING').length);

  return (
    <div className="h-9 backdrop-blur-md bg-cat-surface/60 border-t border-white/10 px-6 flex items-center justify-between text-xs text-cat-muted font-mono select-none z-20 shadow-lg">
      <div className="flex items-center space-x-6">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cat-yellow" />
          <span>Returns Tomorrow: <strong className="text-cat-text">2</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <AlertTriangle className={`w-3.5 h-3.5 ${overdueCount > 0 ? 'text-cat-critical animate-pulse' : 'text-cat-muted'}`} />
          <span>Overdue Risk: <strong className={overdueCount > 0 ? 'text-cat-critical font-bold' : 'text-cat-text'}>{overdueCount}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-blue-400" />
          <span>In Transit: <strong className="text-cat-text">{transitioningCount}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-cat-warning" />
          <span>Maintenance Due: <strong className="text-cat-text">1</strong></span>
        </div>
      </div>
    </div>
  );
};
