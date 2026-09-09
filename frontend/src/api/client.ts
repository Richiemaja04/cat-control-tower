import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

// ─── normalizers: map backend field names → frontend field names ──────────────

/** Flat list shape — used by /assets (list) */
function normalizeAsset(a: any) {
  const idleH = a.idle_hours ?? 0;
  const engineH = a.engine_hours ?? 0;
  return {
    ...a,
    id: a.id ?? a.asset_id,
    name: a.name ?? a.asset_name,
    daily_rental_rate: a.daily_rental_rate ?? a.daily_cost ?? 0,
    current_load_tons: a.current_load_tons ?? a.average_actual_load ?? 0,
    engine_temperature: a.engine_temperature != null ? Number(a.engine_temperature) : (a.status === 'AVAILABLE' ? 35.0 : 85.5),
    hydraulic_pressure: a.hydraulic_pressure != null ? Number(a.hydraulic_pressure) : (a.status === 'AVAILABLE' ? 190.0 : 212.0),
    speed: a.speed != null ? Number(a.speed) : 0,
    idle_hours: idleH,
    operating_hours: a.operating_hours ?? Math.max(0, engineH - idleH),
    trips_completed: a.trips_completed ?? 0,
    latitude: a.latitude ?? 0,
    longitude: a.longitude ?? 0,
  };
}

/**
 * Nested 360 shape — used by /assets/{id}.
 * Backend returns: { identity, current_state, utilization, live_telemetry, health, recent_trips }
 * We flatten everything into a single object so all sections use the same field names.
 */
function normalizeAsset360(raw: any): any {
  // If the response is NOT nested (flat shape), fall back to normalizeAsset
  if (!raw.identity && !raw.current_state) {
    return normalizeAsset(raw);
  }

  const id = raw.identity ?? {};
  const cs = raw.current_state ?? {};
  const ut = raw.utilization ?? {};
  const lt = raw.live_telemetry ?? {};
  const h  = raw.health ?? {};

  return {
    // Identity
    id: id.asset_id,
    name: id.asset_name,
    equipment_type: id.equipment_type,
    capacity_tons: id.capacity_tons,
    daily_rental_rate: id.daily_cost ?? 0,
    terrain_capability: id.terrain_capability,

    // Current state
    status: cs.status,
    current_site_id: cs.site_id,
    current_site_name: cs.site,
    operator_name: cs.operator,
    rental_id: cs.rental_id,
    rental_end: cs.rental_end,

    // Utilization
    operational_utilization: ut.operational_utilization ?? 0,
    capacity_utilization: ut.capacity_utilization ?? 0,
    average_actual_load: ut.average_actual_load ?? 0,
    operating_hours: ut.operating_hours ?? 0,
    idle_hours: ut.idle_hours ?? 0,
    trips_completed: ut.trips_completed ?? 0,

    // Live telemetry
    fuel_level: lt.fuel_level ?? 0,
    engine_hours: lt.engine_hours ?? 0,
    speed: lt.speed ?? 0,
    current_load_tons: lt.current_load_tons ?? 0,
    engine_temperature: lt.engine_temperature ?? 0,
    hydraulic_pressure: lt.hydraulic_pressure ?? 0,
    latitude: lt.latitude ?? 0,
    longitude: lt.longitude ?? 0,

    // Health
    health_score: h.health_score ?? 0,
    maintenance_status: h.maintenance_status ?? 'OK',
    active_alerts: h.alerts ?? [],

    // Recent trips (already an array, keep as-is)
    recent_trips: raw.recent_trips ?? [],
  };
}

function normalizeRental(r: any) {
  return {
    ...r,
    id: r.id ?? r.rental_id,
    asset_name: r.asset_name ?? r.asset_id ?? 'Unknown',
    customer_name: r.customer_name ?? r.customer_id ?? 'N/A',
    site_name: r.site_name ?? r.site_id ?? 'N/A',
    end_date: r.end_date ?? r.rental_end,
    extension_risk_probability:
      r.extension_risk_probability != null
        ? r.extension_risk_probability
        : (r.extension_probability ?? 0) / 100,
    daily_rate: r.daily_rate ?? 0,
  };
}

const SITE_SPREAD_COORDS: Record<string, [number, number]> = {
  S001: [12.9716, 77.5946], // Metro Rail Corridor - MG Road Bangalore
  S002: [12.9352, 77.6245], // ORR Highway Expansion - Bellandur Bangalore
  S003: [13.1986, 77.7066], // Airport Logistics Hub - Devanahalli Bangalore
  S004: [13.0324, 77.5256], // Peenya Industrial Park - Bangalore
  S005: [12.8399, 77.6770], // Electronic City Hub - Bangalore
  S006: [12.9698, 77.7500], // Whitefield Tech Corridor - Bangalore
};

function normalizeSite(s: any) {
  const siteId = s.id ?? s.site_id;
  const spread = SITE_SPREAD_COORDS[siteId];
  const lat = spread ? spread[0] : (s.latitude > 11 && s.latitude < 14 ? s.latitude : 12.95 + (parseInt(siteId?.replace('S', '') || '1') * 0.04));
  const lng = spread ? spread[1] : (s.longitude > 76 && s.longitude < 78 ? s.longitude : 77.55 + (parseInt(siteId?.replace('S', '') || '1') * 0.04));

  return {
    ...s,
    id: siteId,
    name: s.name ?? s.site_name,
    latitude: lat,
    longitude: lng,
    geofence_radius_meters: s.geofence_radius_meters ?? s.geofence_radius_m ?? 3000,
    terrain_type: s.terrain_type ?? 'Rough',
    material_type: s.material_type ?? 'Aggregate',
    current_demand_tons_per_day: s.current_demand_tons_per_day ?? s.current_demand ?? 0,
    forecast_demand_tons_per_day: s.forecast_demand_tons_per_day ?? s.forecast_demand ?? 0,
    required_equipment_type: s.required_equipment_type ?? s.required_equipment ?? '',
  };
}

function normalizeRecommendation(r: any) {
  return {
    ...r,
    id: r.id ?? r.recommendation_id,
    asset_id: r.asset_id,
    source_site_id: r.source_site_id ?? r.target_site_id,
    destination_site_id: r.destination_site_id ?? r.target_site_id,
    recommended_asset_id: r.recommended_asset_id ?? r.suggested_asset_id,
    type: r.type,
    suitability_score: r.suitability_score ?? 0,
    potential_daily_saving: r.potential_daily_saving ?? r.potential_savings_daily ?? 0,
    what_changed: r.what_changed,
    why_explanation: r.why_explanation ?? r.why,
    expected_impact: r.expected_impact,
    status: r.status ?? 'PENDING',
    created_at: r.created_at,
  };
}

// ─── detect correct route prefix for recommendations ─────────────────────────

let _recPrefix: string | null = null;

async function getRecPrefix(): Promise<string> {
  if (_recPrefix) return _recPrefix;
  // Try /intelligence/recommendations first (newer backend), fall back to /recommendations
  try {
    await axios.get(`${API_BASE}/intelligence/recommendations`);
    _recPrefix = '/intelligence/recommendations';
  } catch {
    _recPrefix = '/recommendations';
  }
  return _recPrefix;
}

async function getApprovePrefix(): Promise<string> {
  // Try /actions/recommendations/{id}/approve vs /recommendations/{id}/approve
  try {
    await axios.get(`${API_BASE}/intelligence/recommendations`);
    return '/actions/recommendations';
  } catch {
    return '/recommendations';
  }
}

// ─── API surface ──────────────────────────────────────────────────────────────

export const api = {
  getSummary: () =>
    axios.get(`${API_BASE}/dashboard/summary`).then(res => res.data),

  getPriorityActions: () =>
    axios
      .get(`${API_BASE}/dashboard/priority-actions`)
      .catch(() => axios.get(`${API_BASE}/dashboard/actions`))
      .then(res => res.data),

  getOpportunities: () =>
    axios.get(`${API_BASE}/dashboard/opportunities`).then(res => res.data).catch(() => []),

  getFleetEfficiency: () =>
    axios.get(`${API_BASE}/dashboard/fleet-efficiency`).then(res => res.data).catch(() => null),

  getAssets: () =>
    axios
      .get(`${API_BASE}/assets`)
      .then(res => (Array.isArray(res.data) ? res.data : res.data.value ?? []))
      .then(list => list.map(normalizeAsset)),

  getAsset: (id: string) =>
    axios
      .get(`${API_BASE}/assets/${id}`)
      .then(res => normalizeAsset360(res.data)),

  getAssetTelemetry: (id: string) =>
    axios.get(`${API_BASE}/assets/${id}/telemetry`).then(res => res.data).catch(() => []),

  getAssetTrips: (id: string) =>
    axios.get(`${API_BASE}/assets/${id}/trips`).then(res => res.data).catch(() => []),

  checkoutAsset: (assetId: string, siteId: string, operatorId?: string) =>
    axios
      .post(`${API_BASE}/assets/${assetId}/checkout?site_id=${siteId}&operator_id=${operatorId || ''}`)
      .then(res => res.data),

  getSites: () =>
    axios
      .get(`${API_BASE}/sites`)
      .then(res => (Array.isArray(res.data) ? res.data : res.data.value ?? []))
      .then(list => list.map(normalizeSite)),

  createDemandRequest: (data: any) =>
    axios
      .post(`${API_BASE}/demand-requests`, data)
      .catch(() => axios.post(`${API_BASE}/sites/demand-requests`, data))
      .then(res => res.data),

  getRentals: () =>
    axios
      .get(`${API_BASE}/rentals`)
      .then(res => (Array.isArray(res.data) ? res.data : res.data.value ?? []))
      .then(list => list.map(normalizeRental)),

  getRentalRisk: () =>
    axios.get(`${API_BASE}/rentals/risk`).then(res => res.data).catch(() => []),

  getRecommendations: async () => {
    const prefix = await getRecPrefix();
    return axios
      .get(`${API_BASE}${prefix}`)
      .then(res => (Array.isArray(res.data) ? res.data : res.data.value ?? []))
      .then(list => list.map(normalizeRecommendation));
  },

  approveRecommendation: async (id: string, notes?: string) => {
    // Try the newer route first, fall back to old route
    const newRoute = `${API_BASE}/actions/recommendations/${id}/approve`;
    const oldRoute = `${API_BASE}/recommendations/${id}/approve`;
    return axios
      .post(newRoute, { notes })
      .catch(() => axios.post(oldRoute, { operator_notes: notes }))
      .then(res => res.data);
  },

  rejectRecommendation: async (id: string, reason: string, notes?: string) => {
    const newRoute = `${API_BASE}/actions/recommendations/${id}/reject`;
    const oldRoute = `${API_BASE}/recommendations/${id}/reject`;
    return axios
      .post(newRoute, { rejection_reason: reason, notes })
      .catch(() => axios.post(oldRoute, { rejection_reason: reason, operator_notes: notes }))
      .then(res => res.data);
  },

  getActions: () =>
    axios.get(`${API_BASE}/actions`).then(res => res.data).catch(() => []),

  triggerDemo: (scenario: string) =>
    axios.post(`${API_BASE}/demo/${scenario}`).then(res => res.data),

  initiateDriverCall: (data: {
    asset_id: string;
    driver_name?: string;
    phone_number?: string;
    site_id?: string;
    target_site_id?: string;
    reason?: string;
    recommendation?: string;
    account_sid?: string;
    api_key_sid?: string;
    api_secret?: string;
    from_number?: string;
  }) =>
    axios.post(`${API_BASE}/telephony/call-driver`, data).then(res => res.data),

  getCallStatus: (callSid: string) =>
    axios.get(`${API_BASE}/telephony/call-status/${callSid}`).then(res => res.data).catch(() => ({ status: 'ringing', duration: 0 })),

  submitDriverResponse: (data: {
    call_id: string;
    asset_id: string;
    response_code: number;
    driver_feedback?: string;
  }) =>
    axios.post(`${API_BASE}/telephony/driver-response`, data).then(res => res.data),
};
