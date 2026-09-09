import React, { useState } from 'react';
import {
  Users, Star, HardHat, Truck, MapPin, Award, Clock, QrCode,
  CheckCircle, Activity, Zap, ChevronRight, X, Calendar,
  AlertTriangle, Shield,
} from 'lucide-react';
import { useFleetStore } from '../store/fleetStore';
import { useAuthStore, ALL_OPERATORS, AppUser, PendingCheckout } from '../store/authStore';

// ─── Operator + asset data ────────────────────────────────────────────────────
const OPERATOR_ASSET_MAP: Record<string, string> = {
  OP001: 'EQX1001',
  OP002: 'EQX1002',
  OP003: 'EQX1004',
  OP004: 'EQX1005',
  OP005: 'EQX1006',
};

const SITE_NAMES: Record<string, string> = {
  S001: 'Metro Rail Corridor — Line 3',
  S002: 'ORR Bellandur Excavation',
  S003: 'Devanahalli Airport Hub',
  S004: 'Peenya Industrial Corridor',
  S005: 'Electronic City Expansion',
  S006: 'Whitefield Tech Corridor',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'text-cat-success bg-cat-success/15 border-cat-success/30',
  IDLE: 'text-cat-warning bg-cat-warning/15 border-cat-warning/30',
  AT_RISK: 'text-cat-critical bg-cat-critical/15 border-cat-critical/30',
  TRANSITIONING: 'text-blue-400 bg-blue-400/15 border-blue-400/30',
  AVAILABLE: 'text-green-400 bg-green-400/15 border-green-400/30',
  MAINTENANCE: 'text-purple-400 bg-purple-400/15 border-purple-400/30',
};

// ─── AI Operator Recommendation Logic ────────────────────────────────────────
function recommendOperator(asset: any, operators: AppUser[], assets: any[]): AppUser | null {
  const activeAssetIds = new Set(
    assets.filter((a) => ['ACTIVE', 'TRANSITIONING', 'AT_RISK'].includes(a.status)).map((a) => a.id || a.asset_id)
  );
  const busyOperatorIds = new Set(
    Object.entries(OPERATOR_ASSET_MAP)
      .filter(([, assetId]) => activeAssetIds.has(assetId))
      .map(([opId]) => opId)
  );

  const available = operators.filter((op) => !busyOperatorIds.has(op.operatorId!));
  if (available.length === 0) {
    // fallback: pick highest rated overall
    return [...operators].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  }

  // Sort by rating desc, then experience desc
  return available.sort((a, b) => {
    const rDiff = (b.rating || 0) - (a.rating || 0);
    if (Math.abs(rDiff) > 0.1) return rDiff;
    return (b.experience || 0) - (a.experience || 0);
  })[0];
}

// ─── Generate QR Modal ────────────────────────────────────────────────────────
const GenerateQRModal: React.FC<{
  preSelectedOperator?: AppUser;
  onClose: () => void;
}> = ({ preSelectedOperator, onClose }) => {
  const { assets, sites } = useFleetStore();
  const { addPendingCheckout, currentUser } = useAuthStore();

  const availableAssets = assets.filter((a) => a.status === 'AVAILABLE' || !a.current_site_id);
  const [selectedAsset, setSelectedAsset] = useState(availableAssets[0]?.id || availableAssets[0]?.asset_id || '');
  const [selectedOperator, setSelectedOperator] = useState<AppUser | null>(preSelectedOperator || null);
  const [selectedSite, setSelectedSite] = useState(sites[0]?.id || sites[0]?.site_id || 'S001');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [generated, setGenerated] = useState(false);
  const [aiRecommended, setAiRecommended] = useState(false);

  const assetObj = assets.find((a) => (a.id || a.asset_id) === selectedAsset);
  const siteObj = sites.find((s: any) => (s.id || s.site_id) === selectedSite);

  const handleAIRecommend = () => {
    const rec = recommendOperator(assetObj, ALL_OPERATORS, assets);
    if (rec) {
      setSelectedOperator(rec);
      setAiRecommended(true);
    }
  };

  const handleGenerate = () => {
    if (!selectedAsset || !selectedOperator || !selectedSite || !dueDate) return;
    const checkout: PendingCheckout = {
      checkoutId: `CHK-${Math.floor(10000 + Math.random() * 90000)}`,
      assetId: selectedAsset,
      assetName: assetObj?.name || selectedAsset,
      siteId: selectedSite,
      siteName: (siteObj as any)?.name || SITE_NAMES[selectedSite] || selectedSite,
      dueDate,
      operatorId: selectedOperator.operatorId!,
      operatorName: selectedOperator.name,
      generatedAt: new Date().toISOString(),
      generatedBy: currentUser?.name || 'Fleet Manager',
      status: 'PENDING',
    };
    addPendingCheckout(checkout);
    setGenerated(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-card rounded-2xl border border-cat-yellow/30 shadow-2xl w-full max-w-xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cat-yellow/15 border border-cat-yellow/40 rounded-lg">
              <QrCode className="w-4 h-4 text-cat-yellow" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-cat-text">Generate QR Checkout Assignment</h3>
              <p className="text-[10px] text-cat-muted font-mono">Assign asset to operator via QR code</p>
            </div>
          </div>
          <button onClick={onClose} className="text-cat-muted hover:text-cat-text transition-colors cursor-pointer p-1.5 hover:bg-white/5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!generated ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Step 1: Asset + Site in 2-column */}
            <div>
              <p className="text-[10px] font-bold text-cat-muted uppercase tracking-wider mb-2">Step 1 — Select Asset & Destination</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cat-muted uppercase">Asset</label>
                  <select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-xl text-xs text-cat-text focus:outline-none focus:border-cat-yellow/60 cursor-pointer"
                  >
                    {availableAssets.length === 0 && (
                      <option value="" className="bg-gray-900">No available assets</option>
                    )}
                    {availableAssets.map((a) => (
                      <option key={a.id || a.asset_id} value={a.id || a.asset_id} className="bg-gray-900">
                        {a.id || a.asset_id} — {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cat-muted uppercase">Destination Site</label>
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-xl text-xs text-cat-text focus:outline-none focus:border-cat-yellow/60 cursor-pointer"
                  >
                    {sites.map((s: any) => (
                      <option key={s.id || s.site_id} value={s.id || s.site_id} className="bg-gray-900">
                        {s.id || s.site_id} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Due Date */}
            <div>
              <p className="text-[10px] font-bold text-cat-muted uppercase tracking-wider mb-2">Step 2 — Return Due Date</p>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="glass-input w-full px-3 py-2.5 rounded-xl text-xs text-cat-text focus:outline-none focus:border-cat-yellow/60"
              />
            </div>

            {/* Step 3: Operator */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-cat-muted uppercase tracking-wider">Step 3 — Assign Operator</p>
                <button
                  onClick={handleAIRecommend}
                  className="flex items-center gap-1.5 text-[10px] bg-cat-yellow/15 text-cat-yellow border border-cat-yellow/40 px-3 py-1.5 rounded-lg font-extrabold hover:bg-cat-yellow/25 transition-all cursor-pointer"
                >
                  <Zap className="w-3 h-3" />
                  AI RECOMMEND
                </button>
              </div>
              <div className="space-y-1.5">
                {ALL_OPERATORS.map((op) => {
                  const isSelected = selectedOperator?.operatorId === op.operatorId;
                  const isAIPick = aiRecommended && selectedOperator?.operatorId === op.operatorId;
                  const opAssetId = OPERATOR_ASSET_MAP[op.operatorId!];
                  const opAsset = assets.find((a) => (a.id || a.asset_id) === opAssetId);
                  const isBusy = opAsset && ['ACTIVE', 'AT_RISK', 'TRANSITIONING'].includes(opAsset.status);

                  return (
                    <button
                      key={op.operatorId}
                      onClick={() => { setSelectedOperator(op); setAiRecommended(false); }}
                      className={`w-full glass-surface border rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-cat-yellow/60 bg-cat-yellow/8 shadow-[0_0_12px_rgba(255,184,0,0.1)]'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${isSelected ? 'bg-cat-yellow text-black' : 'bg-white/10 text-cat-text'}`}>
                        {op.avatarInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-cat-text">{op.name}</span>
                          {isAIPick && <span className="text-[9px] bg-cat-yellow text-black font-black px-1.5 py-0.5 rounded-md">⚡ AI PICK</span>}
                          {isBusy && <span className="text-[9px] bg-cat-warning/20 text-cat-warning border border-cat-warning/30 font-bold px-1.5 py-0.5 rounded-md">BUSY</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Star className="w-3 h-3 text-cat-yellow fill-cat-yellow" />
                          <span className="text-[10px] text-cat-warning font-bold">{op.rating}</span>
                          <span className="text-cat-muted text-[10px]">· {op.experience}y exp · {op.operatorId}</span>
                        </div>
                      </div>
                      {isSelected && <CheckCircle className="w-4 h-4 text-cat-yellow flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ── Success Screen ── */
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-cat-success/20 border border-cat-success/40 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <CheckCircle className="w-8 h-8 text-cat-success" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-cat-text">QR Assignment Sent!</h4>
              <p className="text-cat-muted text-xs font-mono mt-1">
                {selectedOperator?.name} will see this in their Employee Portal.
              </p>
            </div>
            {/* QR Mock */}
            <div className="w-32 h-32 glass-surface border border-cat-yellow/40 rounded-2xl flex items-center justify-center mx-auto">
              <div className="grid grid-cols-5 gap-[2px] w-24 h-24">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-cat-yellow' : 'bg-white/10'}`}
                  />
                ))}
              </div>
            </div>
            <div className="glass-surface border border-white/10 rounded-xl p-3 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-cat-muted">Asset</span>
                <span className="text-cat-text font-bold">{selectedAsset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cat-muted">Operator</span>
                <span className="text-cat-text font-bold">{selectedOperator?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cat-muted">Site</span>
                <span className="text-cat-text font-bold">{selectedSite}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cat-muted">Return By</span>
                <span className="text-cat-text font-bold">{dueDate}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full glass-surface border border-white/20 hover:border-cat-yellow/40 text-cat-text font-bold text-sm py-3 rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Employees Page ───────────────────────────────────────────────────────────
export const EmployeesPage: React.FC = () => {
  const { assets } = useFleetStore();
  const [showQRModal, setShowQRModal] = useState(false);
  const [preSelectedOp, setPreSelectedOp] = useState<AppUser | undefined>(undefined);
  const [selectedOpId, setSelectedOpId] = useState<string | null>(null);
  const { pendingCheckouts } = useAuthStore();

  const selectedOp = ALL_OPERATORS.find((op) => op.operatorId === selectedOpId) || null;
  const selectedOpAssetId = selectedOp ? OPERATOR_ASSET_MAP[selectedOp.operatorId!] : null;
  const selectedOpAsset = selectedOpAssetId
    ? assets.find((a) => (a.id || a.asset_id) === selectedOpAssetId)
    : null;

  const openQRFor = (op: AppUser) => {
    setPreSelectedOp(op);
    setShowQRModal(true);
  };

  return (
    <div className="p-5 space-y-5 max-w-[1200px] mx-auto overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cat-muted uppercase tracking-wider font-extrabold mb-1">
            <Users className="w-4 h-4 text-cat-yellow" />
            <span>FIELD OPERATORS & EMPLOYEES</span>
          </div>
          <h1 className="text-xl font-black text-cat-text">Operator Management</h1>
        </div>
        <button
          onClick={() => { setPreSelectedOp(undefined); setShowQRModal(true); }}
          className="flex items-center gap-2 bg-cat-yellow hover:bg-yellow-400 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(255,184,0,0.3)] cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          GENERATE QR CHECKOUT
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Operator List */}
        <div className="col-span-5 space-y-2">
          {ALL_OPERATORS.map((op) => {
            const opAssetId = OPERATOR_ASSET_MAP[op.operatorId!];
            const opAsset = assets.find((a) => (a.id || a.asset_id) === opAssetId);
            const isSelected = selectedOpId === op.operatorId;
            const pendingCount = pendingCheckouts.filter(
              (c) => c.operatorId === op.operatorId && c.status === 'PENDING'
            ).length;

            return (
              <button
                key={op.operatorId}
                onClick={() => setSelectedOpId(isSelected ? null : op.operatorId!)}
                className={`w-full glass-card border rounded-xl p-4 flex items-center gap-4 transition-all cursor-pointer text-left hover:border-cat-yellow/40 ${
                  isSelected ? 'border-cat-yellow/60 shadow-[0_0_20px_rgba(255,184,0,0.1)]' : 'border-white/15'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                  isSelected ? 'bg-cat-yellow text-black' : 'bg-white/10 text-cat-text'
                }`}>
                  {op.avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-cat-text">{op.name}</span>
                    {pendingCount > 0 && (
                      <span className="text-[9px] bg-cat-yellow text-black font-black px-1.5 py-0.5 rounded-full">{pendingCount} PENDING</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-cat-yellow fill-cat-yellow" />
                      <span className="text-[11px] text-cat-warning font-bold">{op.rating}</span>
                    </div>
                    <span className="text-[10px] text-cat-muted">{op.experience}y exp</span>
                    {opAsset && (
                      <span className={`text-[9px] border px-1.5 py-0.5 rounded-full font-bold ${STATUS_COLORS[opAsset.status] || 'text-cat-muted'}`}>
                        {opAsset.status}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isSelected ? 'rotate-90 text-cat-yellow' : 'text-cat-muted'}`} />
              </button>
            );
          })}
        </div>

        {/* Operator Detail Panel */}
        <div className="col-span-7">
          {selectedOp ? (
            <div className="glass-card rounded-2xl border border-white/15 overflow-hidden">
              {/* Header */}
              <div className="p-5 bg-cat-yellow/5 border-b border-white/10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cat-yellow flex items-center justify-center font-black text-xl text-black shadow-[0_0_20px_rgba(255,184,0,0.4)]">
                  {selectedOp.avatarInitials}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-extrabold text-cat-text">{selectedOp.name}</h3>
                  <p className="text-xs text-cat-muted font-mono">{selectedOp.operatorId} · License: {selectedOp.license}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(selectedOp.rating || 0) ? 'text-cat-yellow fill-cat-yellow' : 'text-cat-muted'}`} />
                    ))}
                    <span className="text-sm font-bold text-cat-yellow ml-1">{selectedOp.rating}</span>
                  </div>
                </div>
                <button
                  onClick={() => openQRFor(selectedOp)}
                  className="flex items-center gap-1.5 bg-cat-yellow hover:bg-yellow-400 text-black font-extrabold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer shadow-[0_0_10px_rgba(255,184,0,0.3)]"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  ASSIGN QR
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10">
                {[
                  { icon: <Clock className="w-4 h-4 text-blue-400" />, value: `${selectedOp.experience}y`, label: 'Experience' },
                  { icon: <Award className="w-4 h-4 text-cat-yellow" />, value: selectedOp.rating?.toString(), label: 'Rating' },
                  { icon: <HardHat className="w-4 h-4 text-cat-muted" />, value: selectedOp.operatorId, label: 'Operator ID' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 text-center">
                    <div className="flex items-center justify-center mb-1">{stat.icon}</div>
                    <div className="text-base font-extrabold text-cat-text">{stat.value}</div>
                    <div className="text-[10px] text-cat-muted">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Current Assignment */}
              <div className="p-5 space-y-4">
                <h4 className="text-xs font-bold text-cat-muted uppercase tracking-wider">Current Assignment</h4>
                {selectedOpAsset ? (
                  <div className="glass-surface border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-cat-yellow" />
                        <span className="text-sm font-extrabold text-cat-text">{selectedOpAsset.id || selectedOpAsset.asset_id}</span>
                      </div>
                      <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[selectedOpAsset.status] || ''}`}>
                        {selectedOpAsset.status}
                      </span>
                    </div>
                    <p className="text-xs text-cat-muted mb-2">{selectedOpAsset.name}</p>
                    {selectedOpAsset.current_site_id && (
                      <div className="flex items-center gap-1.5 text-cat-muted text-xs">
                        <MapPin className="w-3 h-3" />
                        <span>{SITE_NAMES[selectedOpAsset.current_site_id] || selectedOpAsset.current_site_id}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center text-xs">
                      <div>
                        <div className="font-extrabold text-cat-text">{Math.round(selectedOpAsset.fuel_level || 0)}%</div>
                        <div className="text-[10px] text-cat-muted">Fuel</div>
                      </div>
                      <div>
                        <div className="font-extrabold text-cat-text">{Math.round(selectedOpAsset.engine_hours || 0)}h</div>
                        <div className="text-[10px] text-cat-muted">Engine Hrs</div>
                      </div>
                      <div>
                        <div className="font-extrabold text-cat-text">{Math.round(selectedOpAsset.health_score || 0)}%</div>
                        <div className="text-[10px] text-cat-muted">Health</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-surface border border-white/10 rounded-xl p-6 text-center">
                    <Activity className="w-8 h-8 text-cat-muted mx-auto mb-2 opacity-50" />
                    <p className="text-cat-muted text-sm">No active asset assignment</p>
                    <button
                      onClick={() => openQRFor(selectedOp)}
                      className="mt-3 text-[11px] text-cat-yellow font-bold flex items-center gap-1 mx-auto hover:underline cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Generate checkout QR
                    </button>
                  </div>
                )}

                {/* Pending Checkouts */}
                {pendingCheckouts.filter((c) => c.operatorId === selectedOp.operatorId).length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-cat-muted uppercase tracking-wider mb-2">Pending QR Checkouts</h4>
                    <div className="space-y-2">
                      {pendingCheckouts
                        .filter((c) => c.operatorId === selectedOp.operatorId)
                        .map((c) => (
                          <div key={c.checkoutId} className={`glass-surface border rounded-xl p-3 flex items-center justify-between ${c.status === 'COMPLETED' ? 'border-cat-success/30' : 'border-cat-yellow/30'}`}>
                            <div>
                              <div className="text-xs font-bold text-cat-text">{c.assetId} → {c.siteId}</div>
                              <div className="text-[10px] text-cat-muted font-mono">Due: {c.dueDate}</div>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${c.status === 'COMPLETED' ? 'text-cat-success border-cat-success/40 bg-cat-success/15' : 'text-cat-yellow border-cat-yellow/40 bg-cat-yellow/15'}`}>
                              {c.status}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-white/15 h-64 flex flex-col items-center justify-center text-center">
              <Users className="w-10 h-10 text-cat-muted opacity-40 mb-3" />
              <p className="text-cat-muted font-medium text-sm">Select an operator to view details</p>
              <p className="text-cat-muted text-xs font-mono mt-1">Click any operator from the list</p>
            </div>
          )}
        </div>
      </div>

      {showQRModal && (
        <GenerateQRModal preSelectedOperator={preSelectedOp} onClose={() => setShowQRModal(false)} />
      )}
    </div>
  );
};
