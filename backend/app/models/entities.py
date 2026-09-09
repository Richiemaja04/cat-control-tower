import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    contact_email = Column(String)
    contact_phone = Column(String)
    health_score = Column(Float, default=90.0)  # 0-100
    active_rentals_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    sites = relationship("Site", back_populates="customer")
    rentals = relationship("Rental", back_populates="customer")


class Site(Base):
    __tablename__ = "sites"

    id = Column(String, primary_key=True)  # e.g., S001
    name = Column(String, nullable=False)
    customer_id = Column(String, ForeignKey("customers.id"))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geofence_radius_meters = Column(Float, default=500.0)
    terrain_type = Column(String, default="Rough")  # Rough, Flat, Rock, Soil, Sand
    material_type = Column(String, default="Aggregate")
    current_demand_tons_per_day = Column(Float, default=1.0)
    forecast_demand_tons_per_day = Column(Float, default=1.0)
    operating_hours = Column(String, default="08:00–16:00")
    project_start = Column(DateTime, default=datetime.datetime.utcnow)
    project_end = Column(DateTime)
    required_equipment_type = Column(String, default="Dumper")
    
    customer = relationship("Customer", back_populates="sites")
    assets = relationship("Asset", back_populates="current_site")
    rentals = relationship("Rental", back_populates="site")
    demand_requests = relationship("DemandRequest", back_populates="site")
    trips = relationship("Trip", back_populates="site")


class Operator(Base):
    __tablename__ = "operators"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    license_number = Column(String)
    experience_years = Column(Float, default=3.0)
    rating = Column(Float, default=4.8)
    status = Column(String, default="ASSIGNED")  # ASSIGNED, UNASSIGNED, ON_LEAVE

    assets = relationship("Asset", back_populates="operator")


class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True)  # e.g. EQX1001
    name = Column(String, nullable=False)
    equipment_type = Column(String, nullable=False)  # Dumper, Excavator, Bulldozer, Grader, Crane
    capacity_tons = Column(Float, nullable=False)
    current_site_id = Column(String, ForeignKey("sites.id"), nullable=True)
    status = Column(String, default="AVAILABLE")  # AVAILABLE, ACTIVE, IDLE, AT_RISK, MAINTENANCE, TRANSITIONING, OVERDUE, UNKNOWN
    operator_id = Column(String, ForeignKey("operators.id"), nullable=True)
    rental_id = Column(String, ForeignKey("rentals.id"), nullable=True)
    rental_start = Column(DateTime, nullable=True)
    rental_end = Column(DateTime, nullable=True)
    fuel_level = Column(Float, default=85.0)  # %
    engine_hours = Column(Float, default=120.0)
    health_score = Column(Float, default=95.0)  # 0-100
    maintenance_status = Column(String, default="OK")  # OK, DUE_SOON, OVERDUE, IN_MAINTENANCE
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    terrain_capability = Column(String, default="Rough,Flat,Soil,Sand")
    daily_rental_rate = Column(Float, default=6000.0)  # INR/day

    # Relationships
    current_site = relationship("Site", back_populates="assets")
    operator = relationship("Operator", back_populates="assets")
    rental = relationship("Rental", foreign_keys=[rental_id])
    telemetry_records = relationship("Telemetry", back_populates="asset")
    trips = relationship("Trip", back_populates="asset")
    alerts = relationship("Alert", back_populates="asset")
    maintenances = relationship("Maintenance", back_populates="asset")


class Rental(Base):
    __tablename__ = "rentals"

    id = Column(String, primary_key=True)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    daily_rate = Column(Float, nullable=False)
    status = Column(String, default="ACTIVE")  # ACTIVE, UPCOMING, OVERDUE, EXTENDED, COMPLETED
    extension_risk_probability = Column(Float, default=0.1)  # 0.0 - 1.0

    asset = relationship("Asset", foreign_keys=[asset_id])
    site = relationship("Site", back_populates="rentals")
    customer = relationship("Customer", back_populates="rentals")


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    engine_status = Column(String, default="RUNNING")  # RUNNING, IDLE, OFF
    engine_hours = Column(Float, default=0.0)
    idle_hours = Column(Float, default=0.0)
    speed = Column(Float, default=0.0)  # km/h
    current_load_tons = Column(Float, default=0.0)
    trips_completed = Column(Integer, default=0)
    fuel_level = Column(Float, default=100.0)  # %
    engine_temperature = Column(Float, default=85.0)  # °C
    hydraulic_pressure = Column(Float, default=210.0)  # bar
    terrain = Column(String, default="Rough")
    operator_id = Column(String, nullable=True)

    asset = relationship("Asset", back_populates="telemetry_records")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(String, primary_key=True)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    material = Column(String, default="Aggregate")
    load_tons = Column(Float, default=0.0)
    trip_duration_minutes = Column(Float, default=0.0)
    trip_status = Column(String, default="COMPLETED")  # COMPLETED, IN_PROGRESS, CANCELLED

    asset = relationship("Asset", back_populates="trips")
    site = relationship("Site", back_populates="trips")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    type = Column(String, nullable=False)  # OVERLOAD, GEOFENCE_VIOLATION, OVERDUE, UNASSIGNED, TERRAIN_MISMATCH, HIGH_IDLE, BEHAVIORAL_ANOMALY
    severity = Column(String, nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    observed_value = Column(String)
    threshold_value = Column(String)
    explanation = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="ACTIVE")  # ACTIVE, RESOLVED, ACKNOWLEDGED

    asset = relationship("Asset", back_populates="alerts")


class DemandRequest(Base):
    __tablename__ = "demand_requests"

    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    material = Column(String, nullable=False)
    required_quantity_tons_per_day = Column(Float, nullable=False)
    trips_per_day = Column(Integer, nullable=False)
    terrain = Column(String, nullable=False)
    operating_hours = Column(String, default="08:00–16:00")
    duration_days = Column(Integer, default=1)
    status = Column(String, default="PENDING")  # PENDING, MATCHED, FULFILLED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    site = relationship("Site", back_populates="demand_requests")


class DemandForecast(Base):
    __tablename__ = "demand_forecasts"

    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    predicted_demand_tons = Column(Float, nullable=False)
    confidence_score = Column(Float, default=85.0)
    explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    source_site_id = Column(String, ForeignKey("sites.id"), nullable=True)
    destination_site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    recommended_asset_id = Column(String, ForeignKey("assets.id"), nullable=True)  # Replacement asset if right-sizing
    type = Column(String, default="RIGHT_SIZING")  # RIGHT_SIZING, REPOSITIONING, REPLACEMENT, MAINTENANCE, EXTENSION
    suitability_score = Column(Float, default=90.0)  # 0-100
    potential_daily_saving = Column(Float, default=0.0)  # INR
    what_changed = Column(Text)
    why_explanation = Column(Text)
    expected_impact = Column(Text)
    status = Column(String, default="PENDING")  # PENDING, APPROVED, REJECTED, EXECUTED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    actions = relationship("Action", back_populates="recommendation")


class Action(Base):
    __tablename__ = "actions"

    id = Column(String, primary_key=True)
    recommendation_id = Column(String, ForeignKey("recommendations.id"), nullable=True)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    source_site_id = Column(String, ForeignKey("sites.id"), nullable=True)
    destination_site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    action_type = Column(String, default="REASSIGNMENT")  # REASSIGNMENT, RETURN, EXTENSION, MAINTENANCE, REPOSITIONING
    status = Column(String, default="PENDING")  # PENDING, APPROVED, SCHEDULED, TRANSITIONING, COMPLETED, REJECTED
    scheduled_time = Column(DateTime, nullable=True)
    completed_time = Column(DateTime, nullable=True)
    before_utilization = Column(Float, nullable=True)
    after_utilization = Column(Float, nullable=True)
    before_cost = Column(Float, nullable=True)
    after_cost = Column(Float, nullable=True)
    outcome_status = Column(String, nullable=True)  # SUCCESSFUL, PARTIAL, FAILED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    recommendation = relationship("Recommendation", back_populates="actions")


class Maintenance(Base):
    __tablename__ = "maintenances"

    id = Column(String, primary_key=True)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    title = Column(String, nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    estimated_hours = Column(Float, default=4.0)
    status = Column(String, default="SCHEDULED")  # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    notes = Column(Text)

    asset = relationship("Asset", back_populates="maintenances")


class EventLog(Base):
    __tablename__ = "event_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)  # ASSET, SITE, RENTAL, RECOMMENDATION, ACTION
    entity_id = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String, primary_key=True)
    recommendation_id = Column(String, ForeignKey("recommendations.id"), nullable=False)
    decision = Column(String, nullable=False)  # APPROVED, REJECTED
    rejection_reason = Column(String, nullable=True)
    operator_notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
