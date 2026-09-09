import { useEffect } from 'react';
import { useFleetStore } from '../store/fleetStore';

export function useWebSocket() {
  const fetchDashboardData = useFleetStore(state => state.fetchDashboardData);
  const setToast = useFleetStore(state => state.setToast);

  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
    const wsBase = apiBase.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsBase}/ws/fleet`);

    ws.onopen = () => {
      console.log('⚡ Connected to Control Tower WebSocket stream');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log('📡 WebSocket Event Received:', msg);

        if (msg.type === 'TELEMETRY_UPDATE') {
          // Telemetry updates come from the simulator every few seconds.
          // We do NOT re-fetch all REST data here — that would spam 6 endpoints
          // per tick. The WebSocket stream itself carries the live data.
          // Only meaningful state-change events trigger a REST refresh below.
        } else if (msg.type === 'ALERT_CREATED') {
          setToast({
            message: `ALERT (${msg.alert.severity}): ${msg.alert.explanation}`,
            type: 'warning'
          });
          fetchDashboardData();
        } else if (msg.type === 'ASSET_ARRIVED') {
          setToast({
            message: `🎉 Asset ${msg.asset_id} reached destination site ${msg.site_id}! New assignment active.`,
            type: 'success'
          });
          fetchDashboardData();
        } else if (msg.type === 'DEMO_SCENARIO_TRIGGERED') {
          fetchDashboardData();
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    };

    ws.onerror = (err) => {
      console.warn('WebSocket connection error:', err);
    };

    return () => {
      ws.close();
    };
  }, [fetchDashboardData, setToast]);
}
