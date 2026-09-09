from app.intelligence.rule_engine import haversine_distance

class SuitabilityScorer:
    @staticmethod
    def calculate_suitability(asset: any, target_site: any, target_demand_tons: float) -> dict:
        """
        Calculates 6-factor weighted suitability score (0-100) for assigning asset to target_site:
        1. Capacity fit (30%)
        2. Terrain fit (20%)
        3. Distance (15%)
        4. Current utilization (15%)
        5. Availability (10%)
        6. Future demand (10%)
        """
        # 1. Capacity fit (30%)
        # Perfect if capacity >= demand and not excessively oversized
        if asset.capacity_tons < target_demand_tons:
            capacity_score = 30.0  # Undersized
        else:
            ratio = target_demand_tons / asset.capacity_tons
            if ratio >= 0.8:
                capacity_score = 100.0
            elif ratio >= 0.5:
                capacity_score = 80.0
            else:
                capacity_score = 50.0  # Oversized

        # 2. Terrain fit (20%)
        site_terrain = target_site.terrain_type.lower() if target_site else "rough"
        asset_terrains = [t.strip().lower() for t in asset.terrain_capability.split(",")]
        terrain_score = 100.0 if site_terrain in asset_terrains else 0.0

        # 3. Distance (15%)
        dist_m = haversine_distance(asset.latitude, asset.longitude, target_site.latitude, target_site.longitude)
        dist_km = dist_m / 1000.0
        # 0 km -> 100 pts, 100 km -> 0 pts
        distance_score = max(0.0, 100.0 - dist_km)

        # 4. Current utilization (15%)
        # An available/idle machine is ready to be utilized
        utilization_score = 90.0 if asset.status in ["AVAILABLE", "IDLE"] else 40.0

        # 5. Availability (10%)
        if asset.status == "AVAILABLE":
            availability_score = 100.0
        elif asset.status == "IDLE":
            availability_score = 70.0
        elif asset.status == "ACTIVE":
            availability_score = 30.0
        else:
            availability_score = 0.0

        # 6. Future demand match (10%)
        future_score = 90.0 if asset.equipment_type == target_site.required_equipment_type else 50.0

        # Weighted Sum
        final_score = (
            capacity_score * 0.30 +
            terrain_score * 0.20 +
            distance_score * 0.15 +
            utilization_score * 0.15 +
            availability_score * 0.10 +
            future_score * 0.10
        )

        return {
            "final_score": round(final_score, 1),
            "breakdown": {
                "capacity_fit": round(capacity_score, 1),
                "terrain_fit": round(terrain_score, 1),
                "distance": round(distance_score, 1),
                "current_utilization": round(utilization_score, 1),
                "availability": round(availability_score, 1),
                "future_demand": round(future_score, 1)
            },
            "distance_km": round(dist_km, 1)
        }
