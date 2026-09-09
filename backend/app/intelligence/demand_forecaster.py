import datetime
import numpy as np
from typing import Dict, Any, List

class DemandForecaster:
    @staticmethod
    def forecast_site_demand(site: Any, trips: List[Any], historical_telemetry: List[Any]) -> Dict[str, Any]:
        """
        Calculates demand forecast for site.
        Uses 7-day weighted moving average of trip loads + trend multiplier.
        Returns explainable prediction.
        """
        base_demand = site.current_demand_tons_per_day
        
        if not trips:
            return {
                "predicted_demand_tons": round(base_demand, 2),
                "confidence_score": 80.0,
                "explanation": f"Baseline forecast of {base_demand:.1f}T/day based on site initial contract specifications."
            }

        # Calculate daily material delivered over past 7 days
        now = datetime.datetime.utcnow()
        daily_loads = [0.0] * 7
        for t in trips:
            if t.start_time:
                days_ago = (now - t.start_time).days
                if 0 <= days_ago < 7:
                    daily_loads[days_ago] += t.load_tons

        avg_last_3_days = np.mean(daily_loads[:3]) if any(daily_loads[:3]) else base_demand
        avg_7_days = np.mean(daily_loads) if any(daily_loads) else base_demand

        # Trend multiplier
        trend_factor = 1.0
        if avg_last_3_days > avg_7_days * 1.05:
            trend_factor = 1.10  # 10% upward trend
        elif avg_last_3_days < avg_7_days * 0.95:
            trend_factor = 0.92  # 8% downward trend

        predicted_demand = round(float(avg_last_3_days * 0.6 + avg_7_days * 0.4) * trend_factor, 2)
        if predicted_demand < 0.5:
            predicted_demand = 0.5

        explanation = (
            f"Tomorrow's demand is predicted at {predicted_demand:.1f}T based on the site's recent 7-day material movement trend "
            f"({avg_last_3_days:.1f}T/day 3-day average vs {avg_7_days:.1f}T/day 7-day average, trend factor {trend_factor:.2f})."
        )

        return {
            "predicted_demand_tons": predicted_demand,
            "confidence_score": round(min(95.0, 75.0 + len(trips) * 0.5), 1),
            "explanation": explanation
        }
