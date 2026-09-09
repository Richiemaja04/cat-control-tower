class CostCalculator:
    # Baseline fuel price in INR / Liter
    FUEL_PRICE_PER_LITER = 95.0
    IDLE_COST_PER_HOUR = 350.0  # Fuel waste + idle wear per hour

    @classmethod
    def calculate_daily_operational_cost(cls, asset_daily_rate: float, idle_hours: float = 2.0, estimated_fuel_liters: float = 30.0) -> float:
        """
        Operational cost = rental_rate + fuel_cost + idle_cost
        """
        fuel_cost = estimated_fuel_liters * cls.FUEL_PRICE_PER_LITER
        idle_cost = idle_hours * cls.IDLE_COST_PER_HOUR
        return round(asset_daily_rate + fuel_cost + idle_cost, 2)

    @classmethod
    def calculate_potential_savings(cls, current_asset_rate: float, recommended_asset_rate: float, current_idle_h: float = 6.0, recommended_idle_h: float = 1.5) -> float:
        """
        Calculates exact potential daily savings from right-sizing or repositioning.
        """
        current_cost = cls.calculate_daily_operational_cost(current_asset_rate, idle_hours=current_idle_h)
        recommended_cost = cls.calculate_daily_operational_cost(recommended_asset_rate, idle_hours=recommended_idle_h)
        return max(0.0, round(current_cost - recommended_cost, 2))
