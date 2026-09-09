import math
import datetime
from typing import List, Dict, Any

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance between two points on earth in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class RuleEngine:
    @staticmethod
    def evaluate_asset(asset: Any, telemetry: Any, site: Any, rental: Any) -> List[Dict[str, Any]]:
        alerts = []
        now = datetime.datetime.utcnow()

        if not telemetry:
            return alerts

        # 1. OVERLOAD RULE
        if telemetry.current_load_tons > asset.capacity_tons:
            overload_pct = int(((telemetry.current_load_tons - asset.capacity_tons) / asset.capacity_tons) * 100)
            alerts.append({
                "type": "OVERLOAD",
                "severity": "CRITICAL",
                "observed_value": f"{telemetry.current_load_tons:.1f}T",
                "threshold_value": f"{asset.capacity_tons:.1f}T",
                "explanation": f"Asset {asset.name} ({asset.id}) load of {telemetry.current_load_tons:.1f}T exceeds maximum certified capacity of {asset.capacity_tons:.1f}T by {overload_pct}%. Severe structural and safety risk.",
                "timestamp": now
            })

        # 2. GEOFENCE VIOLATION RULE
        if site:
            dist = haversine_distance(telemetry.latitude, telemetry.longitude, site.latitude, site.longitude)
            if dist > site.geofence_radius_meters:
                alerts.append({
                    "type": "GEOFENCE_VIOLATION",
                    "severity": "HIGH",
                    "observed_value": f"{int(dist)}m from site",
                    "threshold_value": f"{int(site.geofence_radius_meters)}m radius",
                    "explanation": f"Asset {asset.id} is {int(dist)}m away from assigned site {site.name}, violating geofence threshold of {int(site.geofence_radius_meters)}m.",
                    "timestamp": now
                })

        # 3. OVERDUE RENTAL RULE
        if rental and rental.end_date:
            if rental.end_date < now and rental.status != "COMPLETED":
                overdue_days = (now - rental.end_date).days
                alerts.append({
                    "type": "OVERDUE",
                    "severity": "HIGH",
                    "observed_value": f"Expired {overdue_days} days ago",
                    "threshold_value": rental.end_date.strftime("%Y-%m-%d"),
                    "explanation": f"Rental {rental.id} for asset {asset.id} expired on {rental.end_date.strftime('%Y-%m-%d')} ({overdue_days} days overdue). Risk of unbilled operation.",
                    "timestamp": now
                })

        # 4. UNASSIGNED OPERATOR RULE
        if asset.status == "ACTIVE" and not asset.operator_id:
            alerts.append({
                "type": "UNASSIGNED",
                "severity": "MEDIUM",
                "observed_value": "No operator assigned",
                "threshold_value": "Assigned Operator",
                "explanation": f"Asset {asset.id} is marked ACTIVE at site {site.name if site else 'Unknown'} but has no assigned certified operator.",
                "timestamp": now
            })

        # 5. TERRAIN MISMATCH RULE
        if site and site.terrain_type:
            allowed_terrains = [t.strip().lower() for t in asset.terrain_capability.split(",")]
            if site.terrain_type.lower() not in allowed_terrains:
                alerts.append({
                    "type": "TERRAIN_MISMATCH",
                    "severity": "HIGH",
                    "observed_value": f"Site terrain: {site.terrain_type}",
                    "threshold_value": f"Supported: {asset.terrain_capability}",
                    "explanation": f"Site {site.name} requires {site.terrain_type} capability, which is unsupported by asset {asset.name}.",
                    "timestamp": now
                })

        # 6. HIGH IDLE RULE
        if telemetry.idle_hours > 4.0:
            alerts.append({
                "type": "HIGH_IDLE",
                "severity": "MEDIUM",
                "observed_value": f"{telemetry.idle_hours:.1f}h idle today",
                "threshold_value": "4.0h",
                "explanation": f"Asset {asset.id} has accumulated {telemetry.idle_hours:.1f} hours of idle time today, causing excess fuel consumption and wear.",
                "timestamp": now
            })

        return alerts
