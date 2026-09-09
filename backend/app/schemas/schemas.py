import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field

# Customer Schemas
class CustomerBase(BaseModel):
    id: str
    name: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    health_score: float = 90.0
    active_rentals_count: int = 0

class CustomerResponse(CustomerBase):
    class Config:
        from_attributes = True

# Site Schemas
class SiteBase(BaseModel):
    id: str
    name: str
    customer_id: Optional[str] = None
    latitude: float
    longitude: float
    geofence_radius_meters: float = 500.0
    terrain_type: str = "Rough"
    material_type: str = "Aggregate"
    current_demand_tons_per_day: float = 1.0
    forecast_demand_tons_per_day: float = 1.0
    operating_hours: str = "08:00–16:00"
    project_start: Optional[datetime.datetime] = None
    project_end: Optional[datetime.datetime] = None
    required_equipment_type: str = "Dumper"

class SiteResponse(SiteBase):
    class Config:
        from_attributes = True

# Operator Schemas
class OperatorBase(BaseModel):
    id: str
    name: str
    license_number: Optional[str] = None
    experience_years: float = 3.0
    rating: float = 4.8
    status: str = "ASSIGNED"

class OperatorResponse(OperatorBase):
    class Config:
        from_attributes = True

# Asset Schemas
class AssetBase(BaseModel):
    id: str
    name: str
    equipment_type: str
    capacity_tons: float
    current_site_id: Optional[str] = None
    status: str = "AVAILABLE"
    operator_id: Optional[str] = None
    rental_id: Optional[str] = None
    rental_start: Optional[datetime.datetime] = None
    rental_end: Optional[datetime.datetime] = None
    fuel_level: float = 85.0
    engine_hours: float = 120.0
    health_score: float = 95.0
    maintenance_status: str = "OK"
    latitude: float
    longitude: float
    terrain_capability: str = "Rough,Flat,Soil,Sand"
    daily_rental_rate: float = 6000.0

class AssetResponse(AssetBase):
    operational_utilization: Optional[float] = 0.0
    capacity_utilization: Optional[float] = 0.0
    current_load_tons: Optional[float] = 0.0
    engine_temperature: Optional[float] = 85.0
    hydraulic_pressure: Optional[float] = 210.0
    speed: Optional[float] = 0.0
    idle_hours: Optional[float] = 0.0
    operating_hours: Optional[float] = 0.0
    trips_completed: Optional[int] = 0
    class Config:
        from_attributes = True

# Telemetry Schemas
class TelemetryBase(BaseModel):
    asset_id: str
    latitude: float
    longitude: float
    engine_status: str = "RUNNING"
    engine_hours: float = 0.0
    idle_hours: float = 0.0
    speed: float = 0.0
    current_load_tons: float = 0.0
    trips_completed: int = 0
    fuel_level: float = 100.0
    engine_temperature: float = 85.0
    hydraulic_pressure: float = 210.0
    terrain: str = "Rough"
    operator_id: Optional[str] = None

class TelemetryResponse(TelemetryBase):
    id: int
    timestamp: datetime.datetime
    class Config:
        from_attributes = True

# Trip Schemas
class TripResponse(BaseModel):
    id: str
    asset_id: str
    site_id: str
    start_time: datetime.datetime
    end_time: Optional[datetime.datetime] = None
    material: str
    load_tons: float
    trip_duration_minutes: float
    trip_status: str
    class Config:
        from_attributes = True

# Alert Schemas
class AlertResponse(BaseModel):
    id: str
    asset_id: str
    type: str
    severity: str
    observed_value: Optional[str] = None
    threshold_value: Optional[str] = None
    explanation: Optional[str] = None
    timestamp: datetime.datetime
    status: str
    class Config:
        from_attributes = True

# Demand Request Schema
class DemandRequestCreate(BaseModel):
    site_id: str
    material: str = "Aggregate"
    required_quantity_tons_per_day: float = 1.0
    trips_per_day: int = 10
    terrain: str = "Rough"
    operating_hours: str = "08:00–16:00"
    duration_days: int = 1

class DemandRequestResponse(DemandRequestCreate):
    id: str
    status: str
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# Recommendation Schemas
class RecommendationResponse(BaseModel):
    id: str
    asset_id: str
    source_site_id: Optional[str] = None
    destination_site_id: str
    recommended_asset_id: Optional[str] = None
    type: str
    suitability_score: float
    potential_daily_saving: float
    what_changed: Optional[str] = None
    why_explanation: Optional[str] = None
    expected_impact: Optional[str] = None
    status: str
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class ActionApproveRequest(BaseModel):
    operator_notes: Optional[str] = None

class ActionRejectRequest(BaseModel):
    rejection_reason: str
    operator_notes: Optional[str] = None

# Action Schemas
class ActionResponse(BaseModel):
    id: str
    recommendation_id: Optional[str] = None
    asset_id: str
    source_site_id: Optional[str] = None
    destination_site_id: str
    action_type: str
    status: str
    scheduled_time: Optional[datetime.datetime] = None
    completed_time: Optional[datetime.datetime] = None
    before_utilization: Optional[float] = None
    after_utilization: Optional[float] = None
    before_cost: Optional[float] = None
    after_cost: Optional[float] = None
    outcome_status: Optional[str] = None
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# Dashboard Summary Schema
class DashboardSummary(BaseModel):
    total_rented_assets: int
    active_assets: int
    idle_assets: int
    at_risk_assets: int
    unknown_assets: int
    fleet_operational_utilization: float
    fleet_capacity_utilization: float
    fleet_efficiency_score: float
    total_potential_savings: float
