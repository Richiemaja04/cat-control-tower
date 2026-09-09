from typing import List, Dict, Any

class FleetOptimizer:
    @staticmethod
    def calculate_fleet_efficiency(assets: List[Any], sites: List[Any], alerts: List[Any]) -> Dict[str, Any]:
        """
        Calculates Fleet Efficiency Score (0-100) with transparent weights:
        - Utilization: 30%
        - Allocation: 25%
        - Demand Coverage: 20%
        - Availability: 15%
        - Health: 10%
        """
        if not assets:
            return {"overall_score": 80.0, "breakdown": {}}

        total_assets = len(assets)
        active_assets = [a for a in assets if a.status == "ACTIVE"]
        idle_assets = [a for a in assets if a.status == "IDLE"]
        at_risk_assets = [a for a in assets if a.status == "AT_RISK"]
        available_assets = [a for a in assets if a.status == "AVAILABLE"]

        # 1. Utilization Score (30%)
        # Ratio of active machines and avg health
        utilization_score = (len(active_assets) / total_assets) * 100.0 if total_assets > 0 else 70.0

        # 2. Allocation Score (25%)
        # Penalized by active alerts and unassigned/oversized assets
        overload_or_mismatch_alerts = [al for al in alerts if al.status == "ACTIVE" and al.type in ["OVERLOAD", "TERRAIN_MISMATCH", "UNDERUTILIZED"]]
        allocation_penalty = len(overload_or_mismatch_alerts) * 12.0
        allocation_score = max(0.0, 100.0 - allocation_penalty)

        # 3. Demand Coverage Score (20%)
        # Percentage of active sites that have assigned equipment
        sites_with_assets = set([a.current_site_id for a in active_assets if a.current_site_id])
        demand_coverage_score = (len(sites_with_assets) / len(sites)) * 100.0 if sites else 85.0

        # 4. Availability Score (15%)
        # Reserve ratio of available equipment to buffer demand spikes
        availability_ratio = len(available_assets) / total_assets if total_assets > 0 else 0.2
        availability_score = min(100.0, availability_ratio * 300.0)  # Ideal reserve ~30%

        # 5. Health Score (10%)
        avg_health = sum([a.health_score for a in assets]) / total_assets if total_assets > 0 else 90.0
        health_score = avg_health

        # Weighted score
        overall_score = (
            utilization_score * 0.30 +
            allocation_score * 0.25 +
            demand_coverage_score * 0.20 +
            availability_score * 0.15 +
            health_score * 0.10
        )

        return {
            "overall_score": round(overall_score, 1),
            "breakdown": {
                "utilization": {"score": round(utilization_score, 1), "weight": 30},
                "allocation": {"score": round(allocation_score, 1), "weight": 25},
                "demand_coverage": {"score": round(demand_coverage_score, 1), "weight": 20},
                "availability": {"score": round(availability_score, 1), "weight": 15},
                "health": {"score": round(health_score, 1), "weight": 10}
            }
        }
