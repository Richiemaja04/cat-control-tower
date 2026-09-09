import React, { useState } from 'react';
import {
  BrainCircuit, TrendingUp, AlertTriangle, Cpu, ArrowUpRight,
  CheckCircle2, RefreshCw, Wrench, Package, Activity, Gauge,
  Zap, ShieldAlert, BarChart3, ChevronRight, Sliders, MapPin,
  Clock, Fuel, Flame, Radio, Sparkles, Filter, Eye, PhoneCall
} from 'lucide-react';
import { useFleetStore } from '../store/fleetStore';
import { AIInsights } from '../components/dashboard/AIInsights';

// ─── Site Forecast Data ───────────────────────────────────────────────────────
const SITE_FORECASTS = [
  {
    id: 'S001',
    name: 'Pune Ring Road Expressway',
    currentDemand: 1.0,
    forecastDemand: 1.1,
    assignedCapacity: 2.0,
    utilizationPct: 50,
    status: 'SURPLUS_CAPACITY',
    recommendedAsset: 'EQX1007 (1.0T)',
    recommendationMsg: 'Reassign EQX1001 (2.0T) to Site S002 & dispatch EQX1007 (1.0T) to save idle loss.',
    trend: '+10%',
  },
  {
    id: 'S002',
    name: 'Mumbai Metro Line 4 Underground Dig',
    currentDemand: 3.5,
    forecastDemand: 3.8,
    assignedCapacity: 3.0,
    utilizationPct: 126,
    status: 'HIGH_OVERLOAD_RISK',
    recommendedAsset: 'EQX1001 (2.0T)',
    recommendationMsg: 'Dispatch EQX1001 from S001 to absorb +0.8T demand spike and mitigate strain.',
    trend: '+8.5%',
  },
  {
    id: 'S003',
    name: 'Nashik Highway Expansion Site B',
    currentDemand: 2.0,
    forecastDemand: 2.0,
    assignedCapacity: 2.0,
    utilizationPct: 100,
    status: 'OPTIMAL_MATCH',
    recommendedAsset: 'EQX1004 (2.0T)',
    recommendationMsg: 'Site demand perfectly balanced. Schedule routine 500h preventive maintenance.',
    trend: '0%',
  },
  {
    id: 'S004',
    name: 'Lonavala Tunnel Bypass Corridor',
    currentDemand: 4.5,
    forecastDemand: 4.5,
    assignedCapacity: 5.0,
    utilizationPct: 90,
    status: 'STABLE_HIGH_UTIL',
    recommendedAsset: 'EQX1005 (5.0T)',
    recommendationMsg: 'Operating at peak 90% utilization. Zero overrun risk detected.',
    trend: '+2%',
  },
  {
    id: 'S005',
    name: 'Thane Industrial Logistics Hub',
    currentDemand: 1.8,
    forecastDemand: 2.2,
    assignedCapacity: 2.0,
    utilizationPct: 90,
    status: 'DEMAND_GROWTH',
    recommendedAsset: 'EQX1006 (2.0T)',
    recommendationMsg: 'Demand expected to reach 2.2T/day in 5 days. Keep EQX1006 active on site.',
    trend: '+22%',
  },
  {
    id: 'S006',
    name: 'Navi Mumbai Land Reclamation Site C',
    currentDemand: 1.0,
    forecastDemand: 1.0,
    assignedCapacity: 3.0,
    utilizationPct: 33,
    status: 'UNDERUTILIZED',
    recommendedAsset: 'EQX1010 (1.0T)',
    recommendationMsg: 'EQX1008 (3.0T) is running at 33% capacity. Replace with EQX1010 (1.0T).',
    trend: '0%',
  },
];

// ─── Anomaly Detection Data ───────────────────────────────────────────────────
const ANOMALY_ALERTS = [
  {
    id: 'ANO-1002-OVR',
    assetId: 'EQX1002',
    assetName: 'CAT 336 Hydraulic Excavator',
    siteId: 'S002',
    siteName: 'Mumbai Metro Dig',
    type: 'OVERLOAD_ANOMALY',
    severity: 'CRITICAL',
    confidenceScore: 98,
    metricName: 'Current Load',
    observedValue: '3.85 Tons',
    thresholdValue: '3.00 Tons Capacity',
    deviationPct: '+28.3%',
    explanation: 'Payload continuously exceeding rated 3.0T hydraulic threshold. Risk of pump cavitation & boom stress.',
    icon: <AlertTriangle className="w-4 h-4 text-cat-critical" />,
    badgeCls: 'bg-cat-critical/20 text-cat-critical border-cat-critical/40',
  },
  {
    id: 'ANO-1006-IDL',
    assetId: 'EQX1006',
    assetName: 'CAT D6 Crawler Dozer',
    siteId: 'S005',
    siteName: 'Thane Logistics Hub',
    type: 'EXCESSIVE_IDLE_ANOMALY',
    severity: 'HIGH',
    confidenceScore: 94,
    metricName: 'Idle Hours Today',
    observedValue: '6.5 Hours',
    thresholdValue: 'Max 2.0 Hours/Day',
    deviationPct: '+225%',
    explanation: 'Engine running continuously with zero hydraulic movement. Accumulating engine wear with zero output.',
    icon: <Clock className="w-4 h-4 text-cat-warning" />,
    badgeCls: 'bg-cat-warning/20 text-cat-warning border-cat-warning/40',
  },
  {
    id: 'ANO-1002-TMP',
    assetId: 'EQX1002',
    assetName: 'CAT 336 Hydraulic Excavator',
    siteId: 'S002',
    siteName: 'Mumbai Metro Dig',
    type: 'HYDRAULIC_THERMAL_SPIKE',
    severity: 'HIGH',
    confidenceScore: 91,
    metricName: 'Hydraulic Temperature',
    observedValue: '96.5 °C',
    thresholdValue: 'Max 90.0 °C',
    deviationPct: '+7.2°C Spike',
    explanation: 'Hydraulic oil temperature spiking above operating limit due to heavy rock excavating under high load.',
    icon: <Flame className="w-4 h-4 text-cat-warning" />,
    badgeCls: 'bg-cat-warning/20 text-cat-warning border-cat-warning/40',
  },
  {
    id: 'ANO-1009-GEO',
    assetId: 'EQX1009',
    assetName: 'CAT 725 Secondary Dumper',
    siteId: 'S001',
    siteName: 'Pune Ring Road',
    type: 'GEOFENCE_BOUNDARY_DRIFT',
    severity: 'MEDIUM',
    confidenceScore: 89,
    metricName: 'Distance to Center',
    observedValue: '650 Meters',
    thresholdValue: 'Radius 600 Meters',
    deviationPct: '+50m Drift',
    explanation: 'Asset GPS location detected outside designated site geofence perimeter.',
    icon: <Radio className="w-4 h-4 text-blue-400" />,
    badgeCls: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  },
];

export const IntelligencePage: React.FC = () => {
  const { scheduleAssetAction, scheduleMaintenance, openAsset360, resolvePriorityAction, openDriverCallModal } = useFleetStore();
  const [activeTab, setActiveTab] = useState<'FORECAST' | 'ANOMALIES' | 'SUITABILITY'>('FORECAST');
  const [selectedModel, setSelectedModel] = useState('RandomForestRegressor + Telemetry Ensemble');
  const [executedActionIds, setExecutedActionIds] = useState<string[]>([]);

  const handleAction = (id: string, actionType: 'REASSIGN' | 'MAINTENANCE' | 'RETURN', assetId: string, siteId: string) => {
    setExecutedActionIds((prev) => [...prev, id]);
    if (actionType === 'MAINTENANCE') {
      scheduleMaintenance(assetId, assetId, 'Preventive Window');
    } else {
      scheduleAssetAction(assetId, actionType, siteId);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1920px] mx-auto overflow-y-auto h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-base font-extrabold text-cat-text tracking-wide flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cat-yellow/15 border border-cat-yellow/40">
              <BrainCircuit className="w-4 h-4 text-cat-yellow" />
            </div>
            AI PREDICTIVE INTELLIGENCE & ANOMALY ENGINE
          </h1>
          <p className="text-xs text-cat-muted font-medium mt-0.5">
            Real-time demand forecasting, telemetry anomaly detection, suitability scoring & one-click action execution.
          </p>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5 text-cat-yellow" />
          <span className="text-cat-muted">AI MODEL:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-transparent text-cat-text font-bold focus:outline-none cursor-pointer"
          >
            <option value="RandomForestRegressor + Telemetry Ensemble" className="bg-gray-900">RandomForest Ensemble (Active)</option>
            <option value="XGBoost Capacity Forecasting v2.4" className="bg-gray-900">XGBoost Demand Forecaster</option>
            <option value="LSTM Deep Telemetry Anomaly Detector" className="bg-gray-900">LSTM Telemetry Anomaly</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            icon: <TrendingUp className="w-4 h-4 text-cat-yellow" />,
            title: 'FORECAST ACCURACY',
            value: '96.4%',
            sub: '7-Day Demand Model',
            border: 'border-cat-yellow/30',
          },
          {
            icon: <ShieldAlert className="w-4 h-4 text-cat-critical" />,
            title: 'ANOMALIES DETECTED',
            value: '4 Live',
            sub: '1 Critical · 2 High · 1 Med',
            border: 'border-cat-critical/30',
          },
          {
            icon: <Zap className="w-4 h-4 text-cat-success" />,
            title: 'RIGHT-SIZING CANDIDATES',
            value: '3 Sites',
            sub: '+28.5% Util Gain Potential',
            border: 'border-cat-success/30',
          },
          {
            icon: <Activity className="w-4 h-4 text-blue-400" />,
            title: 'FLEET EFFICIENCY INDEX',
            value: '88.5 / 100',
            sub: 'Optimal Operating Zone',
            border: 'border-blue-400/30',
          },
        ].map((kpi, idx) => (
          <div key={idx} className={`glass-card border rounded-2xl p-4 ${kpi.border}`}>
            <div className="flex items-center gap-2 mb-2">
              {kpi.icon}
              <span className="text-[10px] font-mono font-bold text-cat-muted uppercase tracking-wider">{kpi.title}</span>
            </div>
            <div className="text-2xl font-black text-cat-text">{kpi.value}</div>
            <div className="text-[10px] font-mono text-cat-muted mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveTab('FORECAST')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold transition-all cursor-pointer ${
            activeTab === 'FORECAST'
              ? 'bg-cat-yellow text-black shadow-[0_0_15px_rgba(255,184,0,0.3)]'
              : 'glass-surface text-cat-muted hover:text-cat-text border border-white/10'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>DEMAND & CAPACITY FORECASTING ({SITE_FORECASTS.length} SITES)</span>
        </button>

        <button
          onClick={() => setActiveTab('ANOMALIES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold transition-all cursor-pointer ${
            activeTab === 'ANOMALIES'
              ? 'bg-cat-warning text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'glass-surface text-cat-muted hover:text-cat-text border border-white/10'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>LIVE ANOMALY DETECTOR ({ANOMALY_ALERTS.length} ALERTS)</span>
        </button>

        <button
          onClick={() => setActiveTab('SUITABILITY')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold transition-all cursor-pointer ${
            activeTab === 'SUITABILITY'
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]'
              : 'glass-surface text-cat-muted hover:text-cat-text border border-white/10'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>SUITABILITY SCORING & EXPLAINABLE AI</span>
        </button>
      </div>

      {/* ─── TAB 1: DEMAND & CAPACITY FORECASTING ──────────────────────────── */}
      {activeTab === 'FORECAST' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-cat-text uppercase tracking-wider font-mono flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cat-yellow" />
              SITE DEMAND VS CAPACITY FORECAST VISUALIZER (7-DAY HORIZON)
            </h2>
            <span className="text-[10px] font-mono text-cat-muted bg-white/5 px-2.5 py-1 rounded border border-white/10">
              Updated Live from Site Telemetry Stream
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SITE_FORECASTS.map((site) => {
              const isOverload = site.utilizationPct > 100;
              const isUnderutilized = site.utilizationPct < 60;
              const isExecuted = executedActionIds.includes(`fc-${site.id}`);

              return (
                <div
                  key={site.id}
                  className={`glass-card border rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.01] ${
                    isOverload
                      ? 'border-cat-critical/40 shadow-[0_0_20px_rgba(239,68,68,0.08)]'
                      : isUnderutilized
                      ? 'border-cat-warning/40'
                      : 'border-white/15'
                  }`}
                >
                  {/* Site Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cat-yellow flex-shrink-0" />
                        <span className="text-xs font-extrabold text-cat-text">{site.name}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-cat-muted bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {site.id}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                          isOverload
                            ? 'bg-cat-critical/20 text-cat-critical border-cat-critical/40'
                            : isUnderutilized
                            ? 'bg-cat-warning/20 text-cat-warning border-cat-warning/40'
                            : 'bg-cat-success/20 text-cat-success border-cat-success/40'
                        }`}
                      >
                        {site.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-cat-yellow font-bold">Trend: {site.trend}</span>
                    </div>
                  </div>

                  {/* Meter Bar: Demand vs Capacity */}
                  <div className="space-y-2 glass-surface p-3 rounded-xl border border-white/10 font-mono text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-cat-muted">Site Demand:</span>
                      <span className="text-cat-text font-extrabold">{site.forecastDemand} Tons/day</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-cat-muted">Assigned Capacity:</span>
                      <span className="text-cat-yellow font-extrabold">{site.assignedCapacity} Tons</span>
                    </div>

                    {/* Visual Capacity Utilization Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-cat-muted mb-1">
                        <span>Utilization Fit</span>
                        <span className={`font-bold ${isOverload ? 'text-cat-critical' : isUnderutilized ? 'text-cat-warning' : 'text-cat-success'}`}>
                          {site.utilizationPct}%
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10 p-[1px]">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isOverload
                              ? 'bg-cat-critical shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                              : isUnderutilized
                              ? 'bg-cat-warning shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                              : 'bg-cat-success shadow-[0_0_8px_rgba(34,197,94,0.8)]'
                          }`}
                          style={{ width: `${Math.min(site.utilizationPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recommendation explanation */}
                  <div className="text-[11px] text-cat-muted leading-tight">
                    💡 <span className="text-cat-text">{site.recommendationMsg}</span>
                  </div>

                  {/* Schedule Action Button */}
                  <div className="pt-2 border-t border-white/10">
                    {isExecuted ? (
                      <div className="flex items-center gap-1.5 text-cat-success font-mono font-bold text-xs bg-cat-success/15 border border-cat-success/30 px-3 py-2 rounded-xl justify-center">
                        <CheckCircle2 className="w-4 h-4" /> ACTION SCHEDULED & DISPATCHED
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {isOverload && (
                          <button
                            onClick={() => handleAction(`fc-${site.id}`, 'REASSIGN', 'EQX1001', site.id)}
                            className="w-full flex items-center justify-center gap-1.5 bg-cat-yellow hover:bg-yellow-400 text-black font-extrabold text-xs py-2.5 rounded-xl shadow-[0_0_15px_rgba(255,184,0,0.3)] transition-all cursor-pointer hover:scale-[1.02]"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>SCHEDULE REASSIGNMENT</span>
                          </button>
                        )}
                        {isUnderutilized && (
                          <button
                            onClick={() => handleAction(`fc-${site.id}`, 'RETURN', 'EQX1006', 'DEALER_YARD')}
                            className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all cursor-pointer hover:scale-[1.02]"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>RETURN EXCESS TO DEALER</span>
                          </button>
                        )}
                        {!isOverload && !isUnderutilized && (
                          <button
                            onClick={() => handleAction(`fc-${site.id}`, 'MAINTENANCE', 'EQX1004', site.id)}
                            className="w-full flex items-center justify-center gap-1.5 glass-surface border border-white/10 hover:border-purple-400/50 text-cat-text hover:text-purple-400 font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>BOOK PREVENTIVE MAINTENANCE</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: LIVE TELEMETRY ANOMALY DETECTOR ───────────────────────── */}
      {activeTab === 'ANOMALIES' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-cat-text uppercase tracking-wider font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cat-critical" />
              LIVE TELEMETRY ANOMALY ALERTS & SCHEDULE ACTIONS ({ANOMALY_ALERTS.length})
            </h2>
            <span className="text-[10px] font-mono text-cat-muted bg-white/5 px-2.5 py-1 rounded border border-white/10">
              Evaluated every 5 seconds via WebSocket
            </span>
          </div>

          <div className="space-y-3">
            {ANOMALY_ALERTS.map((anom) => {
              const isExecuted = executedActionIds.includes(anom.id);

              return (
                <div
                  key={anom.id}
                  className={`glass-card border rounded-2xl p-5 flex items-start justify-between gap-5 transition-all duration-300 hover:border-cat-yellow/50 ${
                    anom.severity === 'CRITICAL' ? 'border-cat-critical/40 bg-cat-critical/5' : 'border-cat-warning/30 bg-cat-warning/5'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-xl border flex-shrink-0 mt-0.5 ${anom.badgeCls}`}>
                      {anom.icon}
                    </div>

                    <div className="space-y-2 flex-1 min-w-0 font-mono">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${anom.badgeCls}`}>
                          {anom.severity} · {anom.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-extrabold text-cat-text">{anom.assetId}</span>
                        <span className="text-xs text-cat-muted">({anom.assetName})</span>
                        <span className="text-[10px] bg-cat-yellow/15 text-cat-yellow border border-cat-yellow/30 px-2 py-0.5 rounded-md font-bold ml-auto">
                          ⚡ AI Confidence: {anom.confidenceScore}%
                        </span>
                      </div>

                      <p className="text-xs text-cat-text font-sans font-medium leading-relaxed">
                        {anom.explanation}
                      </p>

                      <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                        <div className="glass-surface p-2 rounded-lg border border-white/10">
                          <span className="text-[9px] text-cat-muted block font-semibold">METRIC</span>
                          <span className="font-bold text-cat-text">{anom.metricName}</span>
                        </div>
                        <div className="glass-surface p-2 rounded-lg border border-white/10">
                          <span className="text-[9px] text-cat-muted block font-semibold">OBSERVED TELEMETRY</span>
                          <span className="font-extrabold text-cat-critical">{anom.observedValue} ({anom.deviationPct})</span>
                        </div>
                        <div className="glass-surface p-2 rounded-lg border border-white/10">
                          <span className="text-[9px] text-cat-muted block font-semibold">SAFE THRESHOLD</span>
                          <span className="font-bold text-cat-success">{anom.thresholdValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Options */}
                  <div className="flex flex-col gap-2 flex-shrink-0 min-w-44 border-l border-white/10 pl-5">
                    <span className="text-[10px] font-mono text-cat-muted uppercase font-extrabold">SCHEDULE ACTION:</span>

                    {isExecuted ? (
                      <div className="glass-surface border border-cat-success/40 text-cat-success text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ACTION EXECUTED</span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            openDriverCallModal({
                              assetId: anom.assetId,
                              driverName: 'Rajesh Kumar',
                              siteId: anom.siteId,
                              targetSiteId: 'S002',
                              reason: `${anom.type.replace(/_/g, ' ')} (${anom.observedValue})`,
                              recommendation: `Relocate ${anom.assetId} to high demand site S002`,
                            })
                          }
                          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-cat-yellow to-yellow-500 hover:from-yellow-400 hover:to-cat-yellow text-black font-extrabold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(255,184,0,0.3)] hover:scale-[1.02]"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>CALL DRIVER</span>
                        </button>

                        <button
                          onClick={() => handleAction(anom.id, 'REASSIGN', anom.assetId, anom.siteId)}
                          className="flex items-center justify-center gap-1.5 glass-surface border border-white/10 hover:border-cat-yellow/40 text-cat-text font-extrabold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer hover:scale-[1.02]"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-cat-yellow" />
                          <span>REASSIGN ASSET</span>
                        </button>

                        <button
                          onClick={() => handleAction(anom.id, 'MAINTENANCE', anom.assetId, anom.siteId)}
                          className="flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(147,51,234,0.25)] hover:scale-[1.02]"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>BOOK MAINTENANCE</span>
                        </button>

                        <button
                          onClick={() => openAsset360(anom.assetId)}
                          className="flex items-center justify-center gap-1.5 glass-surface border border-white/10 hover:border-white/20 text-cat-muted hover:text-cat-text font-bold text-xs py-1.5 px-3 rounded-xl transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>INSPECT 360°</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: SUITABILITY SCORING & EXPLAINABLE AI ──────────────────── */}
      {activeTab === 'SUITABILITY' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Hero Explainable AI Insight */}
          <div className="h-[420px]">
            <AIInsights />
          </div>

          {/* 6-Factor Suitability Scoring Model */}
          <div className="glass-card border border-white/15 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-xs font-extrabold text-cat-text uppercase tracking-wider font-mono flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cat-yellow" />
                CANDIDATE ASSET SUITABILITY SCORING MODEL (6 WEIGHTED FACTORS)
              </h2>
              <span className="text-[10px] font-mono text-cat-yellow bg-cat-yellow/15 border border-cat-yellow/30 px-2.5 py-0.5 rounded-full font-bold">
                SCORE: 94.0 / 100
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {[
                { factor: '1. Capacity Fit', weight: '30% weight', score: 100, color: 'bg-cat-yellow', valText: '100/100 (1.0T matches 1.0T)' },
                { factor: '2. Terrain Fit', weight: '20% weight', score: 100, color: 'bg-cat-yellow', valText: '100/100 (Rough Terrain Qualified)' },
                { factor: '3. Distance & Transport', weight: '15% weight', score: 85, color: 'bg-cat-success', valText: '85/100 (15 km from Site S001)' },
                { factor: '4. Current Utilization', weight: '15% weight', score: 80, color: 'bg-cat-success', valText: '80/100 (Available from Yard)' },
                { factor: '5. Asset Availability', weight: '10% weight', score: 100, color: 'bg-cat-success', valText: '100/100 (No Active Lock)' },
                { factor: '6. Future Demand Match', weight: '10% weight', score: 90, color: 'bg-cat-yellow', valText: '90/100 (Matched for 30 days)' },
              ].map((item, idx) => (
                <div key={idx} className="glass-surface border border-white/10 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-cat-text font-bold">{item.factor} <span className="text-[10px] text-cat-muted">({item.weight})</span></span>
                    <span className="text-cat-yellow font-extrabold text-[11px]">{item.valText}</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10 p-[1px]">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
