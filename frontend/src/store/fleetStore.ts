import { create } from 'zustand';
import { api } from '../api/client';

export interface NotificationItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  body: string;
  timestamp?: string;
}

interface FleetState {
  summary: any;
  assets: any[];
  sites: any[];
  recommendations: any[];
  priorityActions: any[];
  rentals: any[];
  actionsList: any[];
  scheduledMaintenanceIds: string[];
  notifications: NotificationItem[];
  fleetEfficiency: any;
  selectedAsset: any | null;
  activePage: string;
  is360DrawerOpen: boolean;
  activeToast: { message: string; type: 'info' | 'success' | 'warning' } | null;
  activeCallModal: {
    isOpen: boolean;
    data: {
      assetId: string;
      driverName: string;
      phoneNumber: string;
      siteId: string;
      targetSiteId: string;
      reason: string;
      recommendation: string;
    } | null;
  };
  openDriverCallModal: (callData?: Partial<{
    assetId: string;
    driverName: string;
    phoneNumber: string;
    siteId: string;
    targetSiteId: string;
    reason: string;
    recommendation: string;
  }>) => void;
  closeDriverCallModal: () => void;
  fetchDashboardData: () => Promise<void>;
  setSelectedAsset: (asset: any) => void;
  openAsset360: (assetId: string) => Promise<void>;
  closeAsset360: () => void;
  setActivePage: (page: string) => void;
  triggerDemoScenario: (scenario: string) => Promise<void>;
  approveRecommendation: (id: string) => Promise<void>;
  rejectRecommendation: (id: string, reason: string) => Promise<void>;
  scheduleMaintenance: (assetId: string, label?: string, windowStr?: string) => void;
  scheduleAssetAction: (assetId: string, actionType: 'REASSIGN' | 'MAINTENANCE' | 'RETURN', destSiteId?: string) => void;
  checkoutAssetFromDealer: (assetId: string, siteId: string, dueDate: string, operatorId?: string, operatorName?: string) => void;
  resolvePriorityAction: (alertId: string, assetId: string, actionType?: string) => void;
  addNotification: (notif: NotificationItem) => void;
  setToast: (toast: any) => void;
}

/** Predefined spread coordinates for assets across Bangalore industrial corridors */
const SPREAD_COORDS: Record<string, [number, number]> = {
  EQX1001: [12.9720, 77.5950], // Metro Line 3 Dig (MG Road Bangalore)
  EQX1002: [12.9355, 77.6250], // ORR Bellandur (AT_RISK - Overload 3.8T)
  EQX1003: [13.0400, 77.5600], // Dealer Yard Yeshwanthpur (AVAILABLE)
  EQX1004: [13.1990, 77.7070], // Airport Logistics Hub Devanahalli
  EQX1005: [13.0330, 77.5260], // Peenya Industrial Corridor
  EQX1006: [12.8410, 77.6780], // Electronic City Infra Expansion
  EQX1007: [12.9900, 77.7000], // Dealer Yard Marathahalli (AVAILABLE)
  EQX1008: [12.9700, 77.7510], // Whitefield Tech Site
  EQX1009: [12.9650, 77.6000], // Shanti Nagar Corridor
  EQX1010: [13.0800, 77.6400], // Dealer Yard Hebbal Hub (AVAILABLE)
  EQX1011: [12.9300, 77.6350], // Koramangala Infra Site S002
  EQX1012: [13.0050, 77.6900], // KR Puram Corridor Site S004
};

/** Normalize assets to ensure spread coordinates in Bangalore & correct AT_RISK status */
function normalizeAssetsWithSpreadCoords(assetsList: any[]) {
  return assetsList.map((a, idx) => {
    const assetId = a.id || a.asset_id;

    let lat = a.latitude;
    let lng = a.longitude;

    if (SPREAD_COORDS[assetId]) {
      [lat, lng] = SPREAD_COORDS[assetId];
    } else if (!lat || !lng || lat > 15 || lng < 75) {
      const baseLat = 12.90 + (idx % 4) * 0.08;
      const baseLng = 77.55 + (idx % 3) * 0.09;
      lat = baseLat;
      lng = baseLng;
    }

    let status = a.status;
    if (assetId === 'EQX1002' && status !== 'TRANSITIONING') {
      status = 'AT_RISK';
    }

    return {
      ...a,
      id: assetId,
      status,
      latitude: lat,
      longitude: lng,
    };
  });
}

/** Normalize dashboard summary */
function normalizeSummary(raw: any, assetsList: any[]) {
  const activeCount = assetsList.filter(a => a.status === 'ACTIVE').length;
  const idleCount = assetsList.filter(a => a.status === 'IDLE').length;
  const atRiskCount = assetsList.filter(a => a.status === 'AT_RISK' || a.status === 'CRITICAL').length;
  const transCount = assetsList.filter(a => a.status === 'TRANSITIONING').length;

  return {
    total_rented_assets: assetsList.length || 10,
    active_assets: activeCount,
    idle_assets: idleCount,
    at_risk_assets: atRiskCount,
    unknown_assets: 0,
    transitioning_assets: transCount,
    fleet_operational_utilization:
      raw?.fleet_operational_utilization ?? raw?.fleet_utilization_pct ?? 78.5,
    fleet_capacity_utilization:
      raw?.fleet_capacity_utilization ?? raw?.fleet_efficiency?.utilization_score ?? 64.2,
    fleet_efficiency_score:
      raw?.fleet_efficiency_score ?? raw?.fleet_efficiency?.score ?? 82.0,
    total_potential_savings: 0,
    ...raw,
  };
}

export const useFleetStore = create<FleetState>((set, get) => ({
  summary: null,
  assets: [],
  sites: [],
  recommendations: [],
  priorityActions: [],
  rentals: [],
  actionsList: [],
  scheduledMaintenanceIds: [],
  notifications: [
    {
      id: 'notif-init-1',
      type: 'critical',
      title: 'CRITICAL ALERT — EQX1002 Overload Risk',
      body: 'CAT 336 Excavator at Site S002 carrying 3.8T load exceeding 3.0T capacity limit.',
      timestamp: '10 mins ago',
    },
    {
      id: 'notif-init-2',
      type: 'warning',
      title: 'RENTAL OVERRUN — EQX1003 Overrun Risk',
      body: 'CAT D6 Bulldozer at Site S004 rental expires in 2 days with 92% extension risk.',
      timestamp: '30 mins ago',
    },
    {
      id: 'notif-init-3',
      type: 'info',
      title: 'SYSTEM OPERATIONAL — Control Tower Active',
      body: 'Real-time telemetry stream connected across Bangalore active rental sites.',
      timestamp: '1 hour ago',
    },
  ],
  fleetEfficiency: null,
  selectedAsset: null,
  activePage: 'dashboard',
  is360DrawerOpen: false,
  activeToast: null,
  activeCallModal: {
    isOpen: false,
    data: null,
  },

  openDriverCallModal: (callData) => {
    set({
      activeCallModal: {
        isOpen: true,
        data: {
          assetId: callData?.assetId || 'EQX1004',
          driverName: callData?.driverName || 'Rajesh Kumar',
          phoneNumber: callData?.phoneNumber || '+919360857805',
          siteId: callData?.siteId || 'S004',
          targetSiteId: callData?.targetSiteId || 'S002',
          reason: callData?.reason || 'Equipment-Workload Mismatch (18% utilization)',
          recommendation: callData?.recommendation || 'Relocate EQX1004 to high demand Site S002',
        },
      },
    });
  },

  closeDriverCallModal: () => {
    set({ activeCallModal: { isOpen: false, data: null } });
  },

  fetchDashboardData: async () => {
    try {
      const [sum, asts, sts, recs, rnts, actsData] = await Promise.all([
        api.getSummary().catch(() => null),
        api.getAssets().catch(() => []),
        api.getSites().catch(() => []),
        api.getRecommendations().catch(() => []),
        api.getRentals().catch(() => []),
        api.getActions().catch(() => []),
      ]);

      const acts = await api.getPriorityActions().catch(() => []);
      const eff = await api.getFleetEfficiency().catch(() => null);

      const parsedPriorityActs = Array.isArray(acts) ? acts : (acts?.value ?? []);
      const normalizedAsts = normalizeAssetsWithSpreadCoords(asts);

      // Synchronize priority queue alerts into action center queue if not already present
      const initialActions = Array.isArray(actsData) ? actsData : (actsData?.value ?? []);
      const existingActionAssetIds = new Set(initialActions.map((a: any) => a.asset_id));

      const priorityActionRecords = parsedPriorityActs
        .filter((pa: any) => !existingActionAssetIds.has(pa.asset_id))
        .map((pa: any) => ({
          id: `ACT-PRIO-${pa.alert_id || pa.asset_id}`,
          alert_id: pa.alert_id,
          asset_id: pa.asset_id,
          destination_site_id: pa.site_id || 'S001',
          action_type: pa.type || 'PRIORITY_ALERT_RESOLVE',
          severity: pa.severity || 'HIGH',
          status: 'PENDING_APPROVAL',
          explanation: pa.explanation,
          observed_value: pa.observed_value,
          before_utilization: 50,
          after_utilization: 91,
          created_at: new Date().toISOString(),
        }));

      set({
        summary: normalizeSummary(sum, normalizedAsts),
        assets: normalizedAsts,
        sites: sts,
        recommendations: recs,
        priorityActions: parsedPriorityActs,
        rentals: rnts,
        actionsList: [...priorityActionRecords, ...initialActions],
        fleetEfficiency: eff,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  },

  setSelectedAsset: (asset) => set({ selectedAsset: asset }),

  openAsset360: async (assetId) => {
    try {
      const asset = await api.getAsset(assetId);
      const localAsset = get().assets.find(a => a.id === assetId || a.asset_id === assetId);
      const isAvailable = (asset.status || localAsset?.status) === 'AVAILABLE';
      const mergedAsset = {
        ...localAsset,
        ...asset,
        engine_temperature: asset.engine_temperature != null ? Number(asset.engine_temperature) : (localAsset?.engine_temperature ?? (isAvailable ? 35.0 : 85.5)),
        hydraulic_pressure: asset.hydraulic_pressure != null ? Number(asset.hydraulic_pressure) : (localAsset?.hydraulic_pressure ?? (isAvailable ? 190.0 : 212.0)),
        speed: asset.speed != null ? Number(asset.speed) : (localAsset?.speed ?? 0),
        idle_hours: asset.idle_hours != null ? Number(asset.idle_hours) : (localAsset?.idle_hours ?? 0),
        trips_completed: asset.trips_completed != null ? Number(asset.trips_completed) : (localAsset?.trips_completed ?? 0),
        operating_hours: asset.operating_hours ?? localAsset?.operating_hours ?? Math.max(0, (asset.engine_hours ?? 0) - (asset.idle_hours ?? 0)),
        latitude: localAsset?.latitude ?? asset.latitude,
        longitude: localAsset?.longitude ?? asset.longitude
      };
      set({ selectedAsset: mergedAsset, is360DrawerOpen: true });
    } catch (err) {
      const fallbackAsset = get().assets.find(a => a.id === assetId || a.asset_id === assetId);
      if (fallbackAsset) {
        set({ selectedAsset: fallbackAsset, is360DrawerOpen: true });
      }
    }
  },

  closeAsset360: () => set({ is360DrawerOpen: false, selectedAsset: null }),

  setActivePage: (page) => set({ activePage: page }),

  addNotification: (notif) => {
    const newNotif = { ...notif, timestamp: notif.timestamp || 'Just now' };
    set({ notifications: [newNotif, ...get().notifications] });
  },

  triggerDemoScenario: async (scenario) => {
    try {
      await api.triggerDemo(scenario);
      get().setToast({
        message: `Scenario '${scenario.toUpperCase()}' triggered! Recalculating fleet intelligence...`,
        type: 'warning',
      });
      await get().fetchDashboardData();
    } catch (err) {
      console.error('Demo trigger failed:', err);
    }
  },

  resolvePriorityAction: (alertId, assetId, actionType = 'REASSIGN') => {
    // Remove from priorityActions
    const updatedPriorityActions = get().priorityActions.filter(
      (p) => p.alert_id !== alertId && p.asset_id !== assetId
    );

    // Update asset status
    const updatedAssets = get().assets.map((a) => {
      if (a.id === assetId || a.asset_id === assetId) {
        return { ...a, status: 'TRANSITIONING' };
      }
      return a;
    });

    // Update actionsList record
    const updatedActionsList = get().actionsList.map((act) => {
      if (act.asset_id === assetId || act.alert_id === alertId) {
        return {
          ...act,
          status: 'TRANSITIONING',
          outcome: 'RESOLVED',
        };
      }
      return act;
    });

    const notifItem: NotificationItem = {
      id: `notif-resolve-${assetId}-${Date.now()}`,
      type: 'info',
      title: `⚡ Action Executed — ${assetId}`,
      body: `Priority alert resolved for ${assetId}. Asset marked TRANSITIONING to target site.`,
      timestamp: 'Just now',
    };

    set({
      priorityActions: updatedPriorityActions,
      assets: updatedAssets,
      actionsList: updatedActionsList,
      notifications: [notifItem, ...get().notifications],
      summary: normalizeSummary(get().summary, updatedAssets),
    });

    get().setToast({
      message: `⚡ Priority Action executed for ${assetId}! Queue & Action Center updated.`,
      type: 'success',
    });
  },

  scheduleMaintenance: (assetId, label, windowStr) => {
    const currentScheduled = get().scheduledMaintenanceIds;
    if (currentScheduled.includes(assetId)) return;

    const newScheduled = [...currentScheduled, assetId];

    const updatedAssets = get().assets.map(a => {
      if (a.id === assetId || a.asset_id === assetId) {
        return { ...a, maintenance_status: 'SCHEDULED' };
      }
      return a;
    });

    const updatedPriorityActions = get().priorityActions.filter(
      p => p.asset_id !== assetId || (p.type !== 'MAINTENANCE_DUE' && !p.explanation?.toLowerCase().includes('maintenance'))
    );

    const newActionRecord = {
      id: `ACT-MNT-${assetId}`,
      asset_id: assetId,
      destination_site_id: 'MAINTENANCE BAY',
      action_type: 'PREVENTIVE_MAINTENANCE',
      status: 'SCHEDULED',
      before_utilization: 50,
      after_utilization: 95,
      created_at: new Date().toISOString(),
    };

    const notifItem: NotificationItem = {
      id: `notif-mnt-${assetId}-${Date.now()}`,
      type: 'info',
      title: `🔧 Maintenance Scheduled — ${assetId}`,
      body: `Preventive maintenance confirmed for ${label || assetId} (${windowStr || 'Upcoming Window'}). Technician dispatched.`,
      timestamp: 'Just now',
    };

    set({
      scheduledMaintenanceIds: newScheduled,
      assets: updatedAssets,
      priorityActions: updatedPriorityActions,
      actionsList: [newActionRecord, ...get().actionsList],
      notifications: [notifItem, ...get().notifications],
      summary: normalizeSummary(get().summary, updatedAssets),
    });

    get().setToast({
      message: `✅ Maintenance scheduled for ${assetId} ${windowStr ? 'on ' + windowStr : ''}. Maintenance tab & notifications updated.`,
      type: 'success',
    });
  },

  scheduleAssetAction: (assetId, actionType, destSiteId = 'S001') => {
    const updatedAssets = get().assets.map(a => {
      if (a.id === assetId || a.asset_id === assetId) {
        return {
          ...a,
          status: actionType === 'MAINTENANCE' ? 'MAINTENANCE' : 'TRANSITIONING',
          current_site_id: destSiteId,
        };
      }
      return a;
    });

    const currentSelected = get().selectedAsset;
    let newSelected = currentSelected;
    if (currentSelected && (currentSelected.id === assetId || currentSelected.asset_id === assetId)) {
      newSelected = {
        ...currentSelected,
        status: actionType === 'MAINTENANCE' ? 'MAINTENANCE' : 'TRANSITIONING',
        current_site_id: destSiteId,
      };
    }

    const updatedPriorityActions = get().priorityActions.filter(p => p.asset_id !== assetId);

    const actionId = `ACT-EXEC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newActionRecord = {
      id: actionId,
      asset_id: assetId,
      destination_site_id: destSiteId,
      action_type: actionType,
      status: 'TRANSITIONING',
      before_utilization: 50,
      after_utilization: 91,
      created_at: new Date().toISOString(),
    };

    const notifItem: NotificationItem = {
      id: `notif-action-${assetId}-${Date.now()}`,
      type: actionType === 'MAINTENANCE' ? 'warning' : 'info',
      title: `⚡ ${actionType} Scheduled — ${assetId}`,
      body: `Asset ${assetId} scheduled for ${actionType} at Site ${destSiteId}. Telemetry tracking initiated.`,
      timestamp: 'Just now',
    };

    set({
      assets: updatedAssets,
      selectedAsset: newSelected,
      priorityActions: updatedPriorityActions,
      actionsList: [newActionRecord, ...get().actionsList],
      notifications: [notifItem, ...get().notifications],
      summary: normalizeSummary(get().summary, updatedAssets),
    });

    const typeMsg =
      actionType === 'REASSIGN'
        ? `🔄 Reassignment scheduled for ${assetId}. Asset marked TRANSITIONING.`
        : actionType === 'MAINTENANCE'
        ? `🔧 Maintenance window booked for ${assetId}. Asset marked MAINTENANCE.`
        : `📦 Return initiated for ${assetId}. Customer notified.`;

    get().setToast({
      message: typeMsg,
      type: 'success',
    });
  },

  checkoutAssetFromDealer: (assetId, siteId, dueDate, operatorId?, operatorName?) => {
    const targetAsset = get().assets.find(a => a.id === assetId || a.asset_id === assetId);
    const siteObj = get().sites.find(s => s.id === siteId || s.site_id === siteId);
    const siteName = siteObj?.name || `Site ${siteId}`;
    const assetName = targetAsset?.name || assetId;

    const updatedAssets = get().assets.map(a => {
      if (a.id === assetId || a.asset_id === assetId) {
        return {
          ...a,
          status: 'ACTIVE',
          current_site_id: siteId,
          current_site_name: siteName,
          rental_end: dueDate,
          operator_id: operatorId,
          operator_name: operatorName,
          capacity_utilization: 85,
          operational_utilization: 88,
        };
      }
      return a;
    });

    const newRental = {
      id: `RNT-DL-${Math.floor(1000 + Math.random() * 9000)}`,
      asset_id: assetId,
      asset_name: assetName,
      site_id: siteId,
      site_name: siteName,
      customer_id: (siteObj as any)?.customer_id || 'CUST001',
      customer_name: (siteObj as any)?.customer || 'InfraCorp Constructions',
      operator_id: operatorId || null,
      operator_name: operatorName || null,
      start_date: new Date().toISOString().split('T')[0],
      end_date: dueDate,
      status: 'ACTIVE',
      extension_risk_probability: 0.1,
    };

    const newActionRecord = {
      id: `ACT-CHK-${assetId}`,
      asset_id: assetId,
      destination_site_id: siteId,
      action_type: 'DEALER_CHECKOUT',
      status: 'ACTIVE',
      before_utilization: 0,
      after_utilization: 88,
      created_at: new Date().toISOString(),
    };

    const notifItem: NotificationItem = {
      id: `notif-chk-${assetId}-${Date.now()}`,
      type: 'info',
      title: `🚜 QR Checkout Confirmed — ${assetId}`,
      body: `${assetName} checked out from Dealer Yard to ${siteName}${operatorName ? ` by ${operatorName}` : ''}. Return due: ${dueDate}.`,
      timestamp: 'Just now',
    };

    set({
      assets: updatedAssets,
      rentals: [newRental, ...get().rentals],
      actionsList: [newActionRecord, ...get().actionsList],
      notifications: [notifItem, ...get().notifications],
      summary: normalizeSummary(get().summary, updatedAssets),
    });

    get().setToast({
      message: `🎉 ${assetId} checked out to ${siteName}${operatorName ? ' · Operator: ' + operatorName : ''}! Rental tab updated.`,
      type: 'success',
    });
  },

  approveRecommendation: async (id) => {
    try {
      await api.approveRecommendation(id).catch(() => null);

      const updatedRecs = get().recommendations.map(r => {
        if (r.id === id || r.recommendation_id === id) {
          return { ...r, status: 'APPROVED' };
        }
        return r;
      });

      const recObj = get().recommendations.find(r => r.id === id || r.recommendation_id === id);
      const targetAssetId = recObj?.asset_id || 'EQX1001';

      const updatedAssets = get().assets.map(a => {
        if (a.id === targetAssetId || a.asset_id === targetAssetId) {
          return { ...a, status: 'TRANSITIONING' };
        }
        return a;
      });

      const updatedPriorityActions = get().priorityActions.filter(p => p.asset_id !== targetAssetId);

      const newActionRecord = {
        id: `ACT-REC-${id}`,
        asset_id: targetAssetId,
        destination_site_id: recObj?.destination_site_id || 'S001',
        action_type: 'RIGHT_SIZING',
        status: 'TRANSITIONING',
        before_utilization: 50,
        after_utilization: 91,
        created_at: new Date().toISOString(),
      };

      const notifItem: NotificationItem = {
        id: `notif-rec-${id}-${Date.now()}`,
        type: 'info',
        title: `✅ Recommendation Approved — ${targetAssetId}`,
        body: `AI Right-Sizing recommendation approved. Asset ${targetAssetId} transition started.`,
        timestamp: 'Just now',
      };

      set({
        recommendations: updatedRecs,
        assets: updatedAssets,
        priorityActions: updatedPriorityActions,
        actionsList: [newActionRecord, ...get().actionsList],
        notifications: [notifItem, ...get().notifications],
        summary: normalizeSummary(get().summary, updatedAssets),
      });

      get().setToast({
        message: `✅ Recommendation APPROVED! Asset ${targetAssetId} transition started. Priority Actions & Dashboard updated.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Approve failed:', err);
      get().setToast({
        message: `Failed to approve recommendation. Please retry.`,
        type: 'warning',
      });
    }
  },

  rejectRecommendation: async (id, reason) => {
    try {
      await api.rejectRecommendation(id, reason).catch(() => null);

      const updatedRecs = get().recommendations.map(r => {
        if (r.id === id || r.recommendation_id === id) {
          return { ...r, status: 'REJECTED' };
        }
        return r;
      });

      set({ recommendations: updatedRecs });

      get().setToast({
        message: `Recommendation REJECTED. Feedback stored for learning.`,
        type: 'info',
      });
    } catch (err) {
      console.error('Reject failed:', err);
    }
  },

  setToast: (toast) => {
    set({ activeToast: toast });
    setTimeout(() => set({ activeToast: null }), 5000);
  },
}));
