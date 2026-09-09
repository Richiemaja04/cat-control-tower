import React, { useState } from 'react';
import { Truck, QrCode, Search, ArrowUpRight, Gauge, Zap, AlertTriangle, CheckCircle2, Star, Users } from 'lucide-react';
import { useFleetStore } from '../store/fleetStore';
import { useAuthStore, ALL_OPERATORS } from '../store/authStore';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-cat-success/15 text-cat-success border-cat-success/40',
  IDLE: 'bg-cat-warning/15 text-cat-warning border-cat-warning/40',
  AT_RISK: 'bg-cat-critical/15 text-cat-critical border-cat-critical/40',
  TRANSITIONING: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
  AVAILABLE: 'bg-white/10 text-cat-muted border-white/20',
};

const utilBar = (val: number) => {
  const color =
    val >= 70 ? 'bg-cat-success shadow-[0_0_8px_#10B981]' :
    val >= 40 ? 'bg-cat-warning shadow-[0_0_8px_#F59E0B]' :
    'bg-cat-critical shadow-[0_0_8px_#EF4444]';
  return (
    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-0.5 border border-white/10 p-[1px]">
      <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.min(val, 100)}%` }} />
    </div>
  );
};

export const AssetsPage: React.FC = () => {
  const { assets, sites, openAsset360, checkoutAssetFromDealer } = useFleetStore();
  const { addPendingCheckout, currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showQRModal, setShowQRModal] = useState(false);

  const availableDealerAssets = assets.filter(a => a.status === 'AVAILABLE' || a.status === 'IDLE' || !a.current_site_id);
  const dealerAssetsList = availableDealerAssets.length > 0 ? availableDealerAssets : assets;

  const [selectedAssetId, setSelectedAssetId] = useState(dealerAssetsList[0]?.id || 'EQX1003');
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || 'S001');
  const [returnDueDate, setReturnDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [qrStep, setQrStep] = useState<'FORM' | 'SCANNING' | 'SUCCESS'>('FORM');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(ALL_OPERATORS[0]?.operatorId || 'OP005');
  const [aiRecommended, setAiRecommended] = useState(false);

  // AI Operator Recommendation
  const handleAIRecommend = () => {
    const assetObj = assets.find(a => (a.id || a.asset_id) === selectedAssetId);
    const busyOps = new Set(
      assets
        .filter(a => ['ACTIVE', 'AT_RISK', 'TRANSITIONING'].includes(a.status) && a.operator_id)
        .map(a => a.operator_id)
    );
    const available = ALL_OPERATORS.filter(op => !busyOps.has(op.operatorId));
    const pick = (available.length > 0 ? available : ALL_OPERATORS)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
    if (pick) {
      setSelectedOperatorId(pick.operatorId!);
      setAiRecommended(true);
    }
  };

  const filtered = assets.filter(a => {
    const matchSearch =
      (a.id ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.name ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStartCheckout = () => {
    setQrStep('SCANNING');
  };

  const handleConfirmCheckout = () => {
    setQrStep('SUCCESS');
    const selectedOp = ALL_OPERATORS.find(op => op.operatorId === selectedOperatorId);
    const siteObj = sites.find((s: any) => (s.id || s.site_id) === selectedSiteId);
    const assetObj = assets.find(a => (a.id || a.asset_id) === selectedAssetId);
    setTimeout(() => {
      checkoutAssetFromDealer(selectedAssetId, selectedSiteId, returnDueDate, selectedOp?.operatorId, selectedOp?.name);
      // Also push to Employee Portal pending checkouts
      if (selectedOp) {
        addPendingCheckout({
          checkoutId: `CHK-${Math.floor(10000 + Math.random() * 90000)}`,
          assetId: selectedAssetId,
          assetName: assetObj?.name || selectedAssetId,
          siteId: selectedSiteId,
          siteName: siteObj?.name || selectedSiteId,
          dueDate: returnDueDate,
          operatorId: selectedOp.operatorId!,
          operatorName: selectedOp.name,
          generatedAt: new Date().toISOString(),
          generatedBy: currentUser?.name || 'Fleet Manager',
          status: 'PENDING',
        });
      }
      setShowQRModal(false);
      setQrStep('FORM');
    }, 1200);
  };

  return (
    <div className="p-6 space-y-4 max-w-[1920px] mx-auto overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-cat-text tracking-wide flex items-center gap-2">
            <div className="p-1 rounded-md bg-cat-yellow/15 border border-cat-yellow/40">
              <Truck className="w-4 h-4 text-cat-yellow" />
            </div>
            FLEET ASSET INVENTORY & TELEMETRY
          </h1>
          <p className="text-xs text-cat-muted font-medium">
            Continuous visibility into heavy machinery across all rental sites & dealer yards.
          </p>
        </div>

        <button
          onClick={() => {
            const firstAvail = dealerAssetsList[0]?.id || 'EQX1003';
            setSelectedAssetId(firstAvail);
            setQrStep('FORM');
            setShowQRModal(true);
          }}
          className="flex items-center gap-2 bg-cat-yellow hover:bg-yellow-400 text-black font-extrabold text-xs px-4 py-2.5 rounded-lg shadow-[0_0_20px_rgba(255,184,0,0.3)] hover:scale-[1.02] transition-all cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          <span>CHECKOUT FROM DEALER YARD (SCAN QR)</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-3 rounded-xl flex items-center gap-4 border border-white/10">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-cat-muted" />
          <input
            type="text"
            placeholder="Filter by asset ID or name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full glass-input rounded-lg pl-9 pr-4 py-1.5 text-xs text-cat-text"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-cat-muted font-semibold">STATUS:</span>
          {['ALL', 'ACTIVE', 'IDLE', 'AT_RISK', 'AVAILABLE', 'TRANSITIONING'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md border text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                statusFilter === st
                  ? 'bg-cat-yellow text-black border-cat-yellow shadow-[0_0_10px_rgba(255,184,0,0.3)]'
                  : 'glass-pill text-cat-muted border-white/10 hover:text-cat-text'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-mono text-cat-muted ml-auto bg-white/5 px-2.5 py-1 rounded-md border border-white/10">{filtered.length} of {assets.length} assets</span>
      </div>

      {/* Assets Grid */}
      {filtered.length === 0 ? (
        <div className="text-center text-cat-muted text-xs font-mono py-16">
          No assets match current filters.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(asset => {
            const capUtil = Math.round(asset.capacity_utilization ?? 0);
            const opUtil  = Math.round(asset.operational_utilization ?? 0);
            const fuelLow = (asset.fuel_level ?? 0) < 20;
            const siteObj = sites.find(s => s.id === asset.current_site_id);

            return (
              <div
                key={asset.id}
                className="glass-card border border-white/10 hover:border-cat-yellow/60 p-4 rounded-xl space-y-3 transition-all duration-300 cursor-pointer"
                onClick={() => openAsset360(asset.id)}
              >
                {/* Header row */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-extrabold text-sm text-cat-text">{asset.id}</span>
                    <div className="text-xs text-cat-muted font-medium">{asset.name}</div>
                    <div className="text-[10px] text-cat-muted font-mono mt-0.5">
                      {siteObj ? siteObj.name : asset.current_site_id ? `Site ${asset.current_site_id}` : 'DEALER YARD (AVAILABLE)'}
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-md border ${STATUS_STYLE[asset.status] ?? STATUS_STYLE.AVAILABLE}`}>
                    {asset.status}
                  </span>
                </div>

                {/* Telemetry grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono glass-surface p-2.5 rounded-lg border border-white/10">
                  <div>
                    <span className="text-[10px] text-cat-muted block font-semibold">CAPACITY</span>
                    <span className="font-extrabold text-cat-text">{asset.capacity_tons} T</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-cat-muted block font-semibold">CURRENT LOAD</span>
                    <span className="font-extrabold text-cat-yellow">{(asset.current_load_tons ?? 0).toFixed(1)} T</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-cat-muted block font-semibold">HEALTH</span>
                    <span className={`font-extrabold ${(asset.health_score ?? 0) >= 90 ? 'text-cat-success' : (asset.health_score ?? 0) >= 75 ? 'text-cat-warning' : 'text-cat-critical'}`}>
                      {asset.health_score}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-cat-muted block font-semibold flex items-center gap-1">
                      FUEL {fuelLow && <AlertTriangle className="w-2.5 h-2.5 text-cat-warning inline" />}
                    </span>
                    <span className={`font-extrabold ${fuelLow ? 'text-cat-warning' : 'text-cat-success'}`}>
                      {Math.round(asset.fuel_level ?? 0)}%
                    </span>
                  </div>
                </div>

                {/* Utilization bars */}
                <div className="space-y-2 text-[10px] font-mono">
                  <div>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-cat-muted flex items-center gap-1 font-semibold"><Gauge className="w-3 h-3 text-cat-yellow" />Capacity Util</span>
                      <span className="text-cat-text font-extrabold">{capUtil}%</span>
                    </div>
                    {utilBar(capUtil)}
                  </div>
                  <div>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-cat-muted flex items-center gap-1 font-semibold"><Zap className="w-3 h-3 text-cat-yellow" />Operational Util</span>
                      <span className="text-cat-text font-extrabold">{opUtil}%</span>
                    </div>
                    {utilBar(opUtil)}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-[10px] font-mono text-cat-muted font-semibold">
                    Health Score: {asset.health_score}/100
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); openAsset360(asset.id); }}
                    className="flex items-center gap-1 glass-pill hover:bg-white/10 text-cat-yellow text-[10px] font-extrabold px-2.5 py-1 rounded-md transition-all cursor-pointer"
                  >
                    <span>OPEN 360°</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Dealer Yard Checkout Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full text-left space-y-4 shadow-2xl border border-cat-yellow/60">
            <div className="p-3 bg-cat-yellow text-black font-extrabold text-xs rounded-lg uppercase tracking-wider flex items-center justify-between shadow-[0_0_15px_rgba(255,184,0,0.4)]">
              <span>DEALER YARD ASSET CHECKOUT</span>
              <button onClick={() => setShowQRModal(false)} className="text-black hover:opacity-75 cursor-pointer font-extrabold text-sm">✕</button>
            </div>

            {qrStep === 'FORM' && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-cat-muted text-[10px] block mb-1 font-extrabold uppercase">1. SELECT ASSET NUMBER (DEALER YARD)</label>
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full glass-input p-2.5 rounded-lg"
                  >
                    {dealerAssetsList.map((a) => (
                      <option key={a.id} value={a.id} className="bg-cat-card text-cat-text">
                        {a.id} — {a.name} ({a.capacity_tons}T, Status: {a.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-cat-muted text-[10px] block mb-1 font-extrabold uppercase">2. SELECT DESTINATION PLANT / SITE NUMBER</label>
                  <select
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    className="w-full glass-input p-2.5 rounded-lg"
                  >
                    {sites.map((s: any) => (
                      <option key={s.id} value={s.id} className="bg-cat-card text-cat-text">
                        {s.id} — {s.name} ({s.terrain_type} Terrain)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-cat-muted text-[10px] block mb-1 font-extrabold uppercase">3. SELECT RENTAL RETURN DUE DATE</label>
                  <input
                    type="date"
                    value={returnDueDate}
                    onChange={(e) => setReturnDueDate(e.target.value)}
                    className="w-full glass-input p-2.5 rounded-lg"
                  />
                </div>

                {/* Operator Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-cat-muted text-[10px] font-extrabold uppercase">4. ASSIGN OPERATOR</label>
                    <button
                      onClick={handleAIRecommend}
                      className="flex items-center gap-1 text-[9px] bg-cat-yellow/15 text-cat-yellow border border-cat-yellow/40 px-2 py-0.5 rounded-md font-extrabold hover:bg-cat-yellow/25 transition-all cursor-pointer"
                    >
                      <Zap className="w-2.5 h-2.5" />
                      AI RECOMMEND
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {ALL_OPERATORS.map((op) => {
                      const isSelected = selectedOperatorId === op.operatorId;
                      const isAIPick = aiRecommended && selectedOperatorId === op.operatorId;
                      return (
                        <button
                          key={op.operatorId}
                          onClick={() => { setSelectedOperatorId(op.operatorId!); setAiRecommended(false); }}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'border-cat-yellow/60 bg-cat-yellow/10 shadow-[0_0_10px_rgba(255,184,0,0.1)]'
                              : 'border-white/10 glass-surface hover:border-white/20'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] flex-shrink-0 ${
                            isSelected ? 'bg-cat-yellow text-black' : 'bg-white/10 text-cat-text'
                          }`}>
                            {op.avatarInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-cat-text">{op.name}</span>
                              {isAIPick && <span className="text-[8px] bg-cat-yellow text-black font-black px-1.5 py-0.5 rounded">AI PICK</span>}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Star className="w-2.5 h-2.5 text-cat-yellow fill-cat-yellow" />
                              <span className="text-[10px] text-cat-warning font-bold">{op.rating}</span>
                              <span className="text-cat-muted text-[10px]">· {op.experience}y exp · {op.operatorId}</span>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cat-yellow flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 glass-surface rounded-lg border border-white/10 text-[11px] text-cat-muted leading-tight font-sans">
                  Scanning the QR code validates the digital contract with Caterpillar Dealer API and initiates site telemetry tracking.
                </div>

                <button
                  onClick={handleStartCheckout}
                  className="w-full bg-cat-yellow hover:bg-yellow-400 text-black font-extrabold text-xs py-3 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(255,184,0,0.35)] cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <QrCode className="w-4 h-4" />
                  <span>GENERATE & SCAN ASSET QR CODE</span>
                </button>
              </div>
            )}

            {qrStep === 'SCANNING' && (
              <div className="text-center space-y-4 py-2 font-mono">
                <div className="text-xs text-cat-muted">Scan QR Code on Asset chassis to authorize checkout:</div>
                <div className="bg-white p-4 inline-block rounded-xl border-4 border-cat-yellow shadow-[0_0_25px_rgba(255,184,0,0.5)]">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=CAT-CHECKOUT:${selectedAssetId}:${selectedSiteId}:${returnDueDate}`}
                    alt="QR Code"
                    className="w-40 h-40"
                  />
                </div>
                <div className="text-xs text-cat-text font-bold">
                  Asset: <strong className="text-cat-yellow">{selectedAssetId}</strong> → Site: <strong className="text-cat-yellow">{selectedSiteId}</strong><br />
                  Return Due: <strong>{returnDueDate}</strong>
                </div>

                <button
                  onClick={handleConfirmCheckout}
                  className="w-full bg-cat-success hover:brightness-110 text-black font-extrabold text-xs py-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CONFIRM QR SCAN & CHECK-OUT ASSET</span>
                </button>
              </div>
            )}

            {qrStep === 'SUCCESS' && (
              <div className="text-center py-6 space-y-3 font-mono animate-fade-in">
                <CheckCircle2 className="w-12 h-12 text-cat-success mx-auto animate-bounce" />
                <h3 className="text-sm font-extrabold text-cat-text">ASSET CHECKOUT CONFIRMED!</h3>
                <p className="text-xs text-cat-muted">
                  Asset {selectedAssetId} checked out from Dealer Yard to Site {selectedSiteId}. Active rental contract created.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
