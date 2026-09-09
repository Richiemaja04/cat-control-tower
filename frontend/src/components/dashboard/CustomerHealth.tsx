import React from 'react';
import { Users, Heart } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';

export const CustomerHealth: React.FC = () => {
  const { rentals, assets } = useFleetStore();

  const baseCustomers = [
    { id: 'CUST001', name: 'InfraCorp Constructions', defaultScore: 92, defaultStatus: 'EXCELLENT' },
    { id: 'CUST002', name: 'BuildMax Infrastructure', defaultScore: 88, defaultStatus: 'GOOD' },
    { id: 'CUST003', name: 'Metro Projects Ltd', defaultScore: 79, defaultStatus: 'MODERATE' },
  ];

  const customers = baseCustomers.map((c) => {
    const customerRentals = rentals.filter((r) => {
      const cName = (r.customer_name || r.customer_id || '').toLowerCase();
      return cName.includes(c.id.toLowerCase()) || cName.includes(c.name.toLowerCase().split(' ')[0]);
    });

    const activeRentalsCount = customerRentals.length > 0
      ? customerRentals.length
      : (c.id === 'CUST001' ? Math.ceil(assets.length * 0.4) : c.id === 'CUST002' ? Math.floor(assets.length * 0.3) : Math.floor(assets.length * 0.3));

    return {
      name: c.name,
      rentalsCount: activeRentalsCount,
      score: c.defaultScore,
      status: c.defaultStatus,
    };
  });

  return (
    <div className="glass-card rounded-xl flex flex-col h-full overflow-hidden border-t-2 border-t-cat-success/50">
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-cat-success/15 border border-cat-success/40">
            <Users className="w-3.5 h-3.5 text-cat-success" />
          </div>
          <h2 className="text-xs font-extrabold tracking-wider text-cat-text uppercase">CUSTOMER HEALTH</h2>
        </div>
        <span className="text-[10px] font-mono text-cat-muted bg-white/5 px-2 py-0.5 rounded border border-white/10">{customers.length} ACCOUNTS</span>
      </div>

      <div className="p-3 space-y-2.5 flex-1">
        {customers.map((c, idx) => (
          <div key={idx} className="glass-surface border border-white/10 p-2.5 rounded-lg flex items-center justify-between hover:border-cat-success/40 transition-all duration-200">
            <div>
              <div className="text-xs font-extrabold text-cat-text">{c.name}</div>
              <div className="text-[10px] text-cat-muted font-mono mt-0.5">{c.rentalsCount} Rented Assets</div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Heart className="w-3.5 h-3.5 text-cat-success fill-cat-success/30 animate-pulse" />
                <span className="text-xs font-mono font-extrabold text-cat-success">{c.score}/100</span>
              </div>
              <span className="text-[9px] font-mono text-cat-muted uppercase font-bold">{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
