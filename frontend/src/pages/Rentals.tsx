import React, { useState } from 'react';
import {
  Receipt, Truck, MapPin, Calendar, HardHat, AlertTriangle,
  CheckCircle2, Clock, Search, Filter, ArrowUpRight, Eye,
  Building2, TrendingUp, Activity,
} from 'lucide-react';
import { useFleetStore } from '../store/fleetStore';

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  ACTIVE: {
    label: 'ACTIVE',
    cls: 'text-cat-success bg-cat-success/15 border-cat-success/40',
    dot: 'bg-cat-success shadow-[0_0_6px_rgba(34,197,94,0.7)]',
  },
  SCHEDULED: {
    label: 'SCHEDULED',
    cls: 'text-blue-400 bg-blue-400/15 border-blue-400/40',
    dot: 'bg-blue-400',
  },
  EXPIRED: {
    label: 'EXPIRED',
    cls: 'text-cat-critical bg-cat-critical/15 border-cat-critical/40',
    dot: 'bg-cat-critical',
  },
  OVERRUN: {
    label: 'OVERRUN RISK',
    cls: 'text-cat-warning bg-cat-warning/15 border-cat-warning/40',
    dot: 'bg-cat-warning animate-pulse',
  },
};

// ─── Days Until Due ───────────────────────────────────────────────────────────
function daysUntil(dateStr: string): number {
  if (!dateStr) return 999;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const OPERATOR_MAP: Record<string, { id: string; name: string }> = {
  EQX1001: { id: 'OP001', name: 'Rajesh Kumar' },
  EQX1002: { id: 'OP002', name: 'Vikram Singh' },
  EQX1004: { id: 'OP003', name: 'Amit Patel' },
  EQX1005: { id: 'OP004', name: 'Suresh Deshmukh' },
  EQX1006: { id: 'OP005', name: 'Ganesh Shinde' },
  EQX1011: { id: 'OP003', name: 'Amit Patel' },
  EQX1012: { id: 'OP005', name: 'Ganesh Shinde' },
};

// ─── Rental Card ──────────────────────────────────────────────────────────────
const RentalCard: React.FC<{ rental: any; onView: () => void }> = ({ rental, onView }) => {
  const { assets } = useFleetStore();
  const assetObj = assets.find(a => (a.id || a.asset_id) === rental.asset_id);
  const staticOp = OPERATOR_MAP[rental.asset_id];

  const opName = rental.operator_name || assetObj?.operator_name || staticOp?.name || (assetObj?.operator_id ? `Operator (${assetObj.operator_id})` : null);
  const opId = rental.operator_id || assetObj?.operator_id || staticOp?.id || null;

  const endDate = rental.end_date ?? rental.rental_end ?? '';
  const startDate = rental.start_date ?? '';
  const riskProb = rental.extension_risk_probability != null
    ? rental.extension_risk_probability > 1
      ? rental.extension_risk_probability / 100
      : rental.extension_risk_probability
    : 0;

  const days = daysUntil(endDate);
  const isOverrunRisk = riskProb > 0.5 || days < 3;
  const statusKey = isOverrunRisk
    ? 'OVERRUN'
    : (rental.status?.toUpperCase() || 'ACTIVE');
  const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.ACTIVE;

  // Days bar progress
  const totalDays = startDate && endDate
    ? Math.max(1, (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 30;
  const elapsed = startDate
    ? (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  const progress = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));

  return (
    <div className={`glass-card border rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl ${
      isOverrunRisk ? 'border-cat-warning/50 shadow-[0_0_20px_rgba(245,158,11,0.08)]' : 'border-white/15'
    }`}>
      {/* Top Color Bar */}
      <div className={`h-1 w-full ${isOverrunRisk ? 'bg-gradient-to-r from-cat-warning to-cat-critical' : 'bg-gradient-to-r from-cat-yellow/60 to-cat-success/60'}`} />

      <div className="p-4 space-y-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border flex-shrink-0 ${isOverrunRisk ? 'bg-cat-warning/15 border-cat-warning/40' : 'bg-cat-yellow/15 border-cat-yellow/40'}`}>
              <Truck className={`w-4 h-4 ${isOverrunRisk ? 'text-cat-warning' : 'text-cat-yellow'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-cat-text font-mono">{rental.id ?? rental.rental_id}</span>
                {isOverrunRisk && (
                  <span className="flex items-center gap-1 bg-cat-warning/20 text-cat-warning border border-cat-warning/40 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    OVERRUN RISK
                  </span>
                )}
              </div>
              <div className="text-xs text-cat-muted font-medium">{rental.asset_name ?? rental.asset_id}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            <span className={`text-[9px] font-extrabold border px-2 py-0.5 rounded-full ${statusCfg.cls}`}>
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Site */}
          <div className="glass-surface border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-cat-muted text-[10px] font-mono mb-1">
              <MapPin className="w-3 h-3" /> SITE
            </div>
            <div className="text-xs font-bold text-cat-text leading-tight">
              {rental.site_name ?? rental.site_id ?? 'N/A'}
            </div>
            <div className="text-[10px] text-cat-muted font-mono mt-0.5">{rental.site_id}</div>
          </div>

          {/* Operator */}
          <div className={`glass-surface border rounded-xl p-3 ${opName ? 'border-blue-400/30 bg-blue-500/5' : 'border-white/10'}`}>
            <div className="flex items-center gap-1.5 text-cat-muted text-[10px] font-mono mb-1">
              <HardHat className="w-3 h-3" /> OPERATOR
            </div>
            {opName ? (
              <>
                <div className="text-xs font-bold text-cat-text">{opName}</div>
                <div className="text-[10px] text-cat-muted font-mono mt-0.5">{opId || 'Assigned'}</div>
              </>
            ) : (
              <div className="text-xs text-cat-muted italic">Not assigned</div>
            )}
          </div>

          {/* Start Date */}
          <div className="glass-surface border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-cat-muted text-[10px] font-mono mb-1">
              <Calendar className="w-3 h-3" /> START DATE
            </div>
            <div className="text-xs font-bold text-cat-text">
              {startDate ? new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : 'N/A'}
            </div>
          </div>

          {/* Due Date */}
          <div className={`glass-surface border rounded-xl p-3 ${days < 5 ? 'border-cat-critical/40 bg-cat-critical/5' : days < 10 ? 'border-cat-warning/40 bg-cat-warning/5' : 'border-white/10'}`}>
            <div className="flex items-center gap-1.5 text-cat-muted text-[10px] font-mono mb-1">
              <Clock className={`w-3 h-3 ${days < 5 ? 'text-cat-critical' : days < 10 ? 'text-cat-warning' : ''}`} /> RETURN DUE
            </div>
            <div className={`text-xs font-extrabold ${days < 5 ? 'text-cat-critical' : days < 10 ? 'text-cat-warning' : 'text-cat-text'}`}>
              {endDate ? new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : 'N/A'}
            </div>
            <div className={`text-[10px] font-bold mt-0.5 ${days < 5 ? 'text-cat-critical' : days < 10 ? 'text-cat-warning' : 'text-cat-muted'}`}>
              {days === 999 ? '—' : days < 0 ? `${Math.abs(days)}d OVERDUE` : days === 0 ? 'DUE TODAY' : `${days}d remaining`}
            </div>
          </div>
        </div>

        {/* Rental Duration Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-cat-muted font-mono">RENTAL PERIOD ELAPSED</span>
            <span className="text-[10px] font-bold text-cat-text">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/10 p-[1px]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                progress > 90 ? 'bg-cat-critical shadow-[0_0_6px_rgba(239,68,68,0.5)]' :
                progress > 70 ? 'bg-cat-warning shadow-[0_0_6px_rgba(245,158,11,0.4)]' :
                'bg-cat-success shadow-[0_0_6px_rgba(34,197,94,0.4)]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-cat-muted" />
            <span className="text-[10px] text-cat-muted">{rental.customer_name || 'InfraCorp Constructions'}</span>
          </div>
          <button
            onClick={onView}
            className="flex items-center gap-1.5 text-[10px] font-extrabold text-cat-yellow hover:text-yellow-300 glass-pill border border-cat-yellow/30 hover:border-cat-yellow/60 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            ASSET 360°
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Rentals Page ────────────────────────────────────────────────────────
export const RentalsPage: React.FC = () => {
  const { rentals, openAsset360 } = useFleetStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'OVERRUN'>('ALL');

  // Stats
  const activeCount = rentals.filter(r => r.status === 'ACTIVE' || !r.status).length;
  const overrunCount = rentals.filter(r => {
    const risk = r.extension_risk_probability != null
      ? r.extension_risk_probability > 1 ? r.extension_risk_probability / 100 : r.extension_risk_probability
      : 0;
    const days = daysUntil(r.end_date ?? r.rental_end ?? '');
    return risk > 0.5 || days < 3;
  }).length;
  const withOperatorCount = rentals.filter(r => !!r.operator_name).length;

  // Filter + Search
  const filtered = rentals.filter(r => {
    const searchLower = search.toLowerCase();
    const matchSearch = !search ||
      (r.id || '').toLowerCase().includes(searchLower) ||
      (r.asset_id || '').toLowerCase().includes(searchLower) ||
      (r.asset_name || '').toLowerCase().includes(searchLower) ||
      (r.site_name || '').toLowerCase().includes(searchLower) ||
      (r.operator_name || '').toLowerCase().includes(searchLower);

    const riskProb = r.extension_risk_probability != null
      ? r.extension_risk_probability > 1 ? r.extension_risk_probability / 100 : r.extension_risk_probability
      : 0;
    const days = daysUntil(r.end_date ?? r.rental_end ?? '');
    const isOverrun = riskProb > 0.5 || days < 3;

    const matchFilter =
      filter === 'ALL' ||
      (filter === 'ACTIVE' && !isOverrun) ||
      (filter === 'OVERRUN' && isOverrun);

    return matchSearch && matchFilter;
  });

  return (
    <div className="p-5 space-y-5 max-w-[1920px] mx-auto overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-base font-extrabold text-cat-text tracking-wide flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cat-yellow/15 border border-cat-yellow/40">
              <Receipt className="w-4 h-4 text-cat-yellow" />
            </div>
            ACTIVE RENTAL CONTRACTS
          </h1>
          <p className="text-xs text-cat-muted font-medium mt-0.5">
            All active rental agreements — synced with QR checkout, operator assignment, and site deployment.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            icon: <Activity className="w-4 h-4 text-cat-yellow" />,
            value: rentals.length,
            label: 'Total Contracts',
            sub: 'All time',
            color: 'border-cat-yellow/20',
          },
          {
            icon: <CheckCircle2 className="w-4 h-4 text-cat-success" />,
            value: activeCount,
            label: 'Active Rentals',
            sub: 'On-site now',
            color: 'border-cat-success/20',
          },
          {
            icon: <AlertTriangle className="w-4 h-4 text-cat-warning" />,
            value: overrunCount,
            label: 'Overrun Risk',
            sub: 'Need attention',
            color: 'border-cat-warning/20',
          },
          {
            icon: <HardHat className="w-4 h-4 text-blue-400" />,
            value: withOperatorCount,
            label: 'With Operator',
            sub: 'QR checkout',
            color: 'border-blue-400/20',
          },
        ].map((s, i) => (
          <div key={i} className={`glass-card border rounded-xl p-4 ${s.color}`}>
            <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-[10px] text-cat-muted font-mono uppercase">{s.label}</span></div>
            <div className="text-2xl font-black text-cat-text">{s.value}</div>
            <div className="text-[10px] text-cat-muted mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search Bar */}
      <div className="glass-card border border-white/10 rounded-xl p-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cat-muted" />
          <input
            type="text"
            placeholder="Search by asset, site, operator, ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="glass-input w-full pl-9 pr-4 py-2 rounded-lg text-xs text-cat-text placeholder:text-cat-muted/40 focus:outline-none focus:border-cat-yellow/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-cat-muted" />
          {(['ALL', 'ACTIVE', 'OVERRUN'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                filter === f
                  ? 'bg-cat-yellow text-black border-cat-yellow'
                  : 'glass-pill text-cat-muted border-white/10 hover:text-cat-text'
              }`}
            >
              {f === 'OVERRUN' ? '⚠ OVERRUN RISK' : f}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-mono text-cat-muted bg-white/5 px-2.5 py-1 rounded border border-white/10 ml-auto">
          {filtered.length} of {rentals.length} contracts
        </span>
      </div>

      {/* Rental Cards Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card border border-white/10 rounded-2xl p-12 text-center">
          <Receipt className="w-10 h-10 text-cat-muted mx-auto mb-3 opacity-30" />
          <p className="text-cat-muted font-medium text-sm">No rental contracts found</p>
          <p className="text-cat-muted text-xs font-mono mt-1">
            {rentals.length === 0
              ? 'Checkout an asset from the dealer yard to create a rental contract.'
              : 'Try adjusting your search or filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((r, idx) => (
            <RentalCard
              key={r.id ?? r.rental_id ?? idx}
              rental={r}
              onView={() => openAsset360(r.asset_id)}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="glass-surface border border-white/10 rounded-xl p-3 flex items-center gap-6 flex-wrap">
        <span className="text-[10px] font-mono text-cat-muted uppercase tracking-wider">Legend:</span>
        {[
          { dot: 'bg-cat-success', label: 'Active — on site & operational' },
          { dot: 'bg-cat-warning animate-pulse', label: 'Overrun risk — return due soon' },
          { dot: 'bg-cat-critical', label: 'Overdue / expired contract' },
          { dot: 'bg-blue-400', label: 'Operator assigned via QR checkout' },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${l.dot}`} />
            <span className="text-[10px] text-cat-muted">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
