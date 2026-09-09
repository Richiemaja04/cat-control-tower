import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useFleetStore } from '../../store/fleetStore';
import { MapPin } from 'lucide-react';

const createIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background-color: ${color};
        color: #000;
        font-weight: 800;
        font-family: monospace;
        font-size: 10px;
        padding: 3px 6px;
        border-radius: 4px;
        border: 2px solid #FFF;
        box-shadow: 0 4px 14px rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
      ">
        <span>${label}</span>
      </div>
    `,
    iconSize: [60, 24],
    iconAnchor: [30, 12]
  });
};

const siteIcon = (label: string) => L.divIcon({
  className: 'site-map-icon',
  html: `
    <div style="
      background-color: rgba(18, 22, 31, 0.90);
      color: #FFB800;
      font-weight: 700;
      font-family: sans-serif;
      font-size: 10px;
      padding: 3px 7px;
      border-radius: 4px;
      border: 1px solid #FFB800;
      box-shadow: 0 2px 10px rgba(255,184,0,0.4);
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    ">
      <span>🏗️</span>
      <span>${label}</span>
    </div>
  `,
  iconSize: [75, 22],
  iconAnchor: [37, 11]
});

const AutoFitBounds: React.FC<{ assets: any[]; sites: any[] }> = ({ assets, sites }) => {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    const points: [number, number][] = [];
    assets.forEach(a => {
      if (a.latitude && a.longitude) points.push([a.latitude, a.longitude]);
    });
    sites.forEach(s => {
      if (s.latitude && s.longitude) points.push([s.latitude, s.longitude]);
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
      fitted.current = true;
    }
  }, [assets, sites, map]);

  return null;
};

export const FleetMap: React.FC = () => {
  const { assets, sites, openAsset360 } = useFleetStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10B981';
      case 'IDLE': return '#F59E0B';
      case 'AT_RISK': return '#EF4444';
      case 'TRANSITIONING': return '#3B82F6';
      case 'MAINTENANCE': return '#F59E0B';
      case 'AVAILABLE': return '#94A3B8';
      default: return '#94A3B8';
    }
  };

  const centerLat = 12.9716;
  const centerLng = 77.5946;

  const positionCounts: Record<string, number> = {};

  const getSpreadPosition = (lat: number, lng: number): [number, number] => {
    const key = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
    const count = positionCounts[key] || 0;
    positionCounts[key] = count + 1;

    if (count === 0) return [lat, lng];

    const angle = count * 1.25;
    const distance = 0.012 * count;
    const offsetLat = lat + Math.sin(angle) * distance;
    const offsetLng = lng + Math.cos(angle) * distance;
    return [offsetLat, offsetLng];
  };

  return (
    <div className="glass-card rounded-xl h-full flex flex-col overflow-hidden relative border-t-2 border-t-cat-yellow/60">
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-cat-yellow/15 border border-cat-yellow/40">
            <MapPin className="w-3.5 h-3.5 text-cat-yellow" />
          </div>
          <h2 className="text-xs font-extrabold tracking-wider text-cat-text uppercase">LIVE FLEET TELEMETRY MAP</h2>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cat-success shadow-[0_0_8px_#10B981]"></span> ACTIVE</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cat-warning shadow-[0_0_8px_#F59E0B]"></span> IDLE</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cat-critical shadow-[0_0_8px_#EF4444]"></span> AT RISK</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3B82F6]"></span> TRANSITIONING</span>
        </div>
      </div>

      <div className="flex-1 w-full h-[400px] z-0">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={10}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="dark-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <AutoFitBounds assets={assets} sites={sites} />

          {/* Render Sites & Geofences */}
          {sites.map((site) => (
            site.latitude && site.longitude ? (
              <React.Fragment key={site.id}>
                <Circle
                  center={[site.latitude, site.longitude]}
                  radius={site.geofence_radius_meters || 3000}
                  pathOptions={{
                    color: '#FFB800',
                    fillColor: '#FFB800',
                    fillOpacity: 0.08,
                    weight: 1.5,
                    dashArray: '4, 4'
                  }}
                />
                <Marker position={[site.latitude, site.longitude]} icon={siteIcon(site.id)}>
                  <Popup className="cat-map-popup">
                    <div className="p-2 text-cat-text font-sans">
                      <div className="font-extrabold text-xs text-cat-yellow">{site.id}: {site.name}</div>
                      <div className="text-[11px] text-gray-300 mt-1">Terrain: <strong>{site.terrain_type}</strong></div>
                      <div className="text-[11px] text-gray-300">Daily Demand: <strong>{site.current_demand_tons_per_day} Tons/day</strong></div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ) : null
          ))}

          {/* Render Assets */}
          {assets.map((asset) => {
            if (!asset.latitude || !asset.longitude) return null;
            const color = getStatusColor(asset.status);
            const spreadPos = getSpreadPosition(asset.latitude, asset.longitude);

            return (
              <Marker
                key={asset.id}
                position={spreadPos}
                icon={createIcon(color, asset.id)}
                eventHandlers={{
                  click: () => openAsset360(asset.id)
                }}
              >
                <Popup>
                  <div className="p-2 text-cat-text font-sans space-y-1">
                    <div className="font-extrabold text-xs text-cat-yellow">{asset.id} - {asset.name}</div>
                    <div className="text-[11px] text-gray-300">Status: <strong style={{ color }}>{asset.status}</strong></div>
                    <div className="text-[11px] text-gray-300">Capacity: <strong>{asset.capacity_tons}T</strong></div>
                    <div className="text-[11px] text-gray-300">Current Load: <strong>{asset.current_load_tons || 0}T</strong></div>
                    <button
                      onClick={() => openAsset360(asset.id)}
                      className="mt-2 w-full bg-cat-yellow text-black text-[10px] font-extrabold py-1 rounded-md shadow-md cursor-pointer hover:bg-yellow-400"
                    >
                      OPEN ASSET 360
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
