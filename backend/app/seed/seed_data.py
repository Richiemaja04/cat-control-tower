import os
import datetime
import random
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal, DATABASE_URL
from app.models.entities import (
    Customer, Site, Operator, Asset, Rental, Telemetry, Trip, Alert,
    DemandRequest, DemandForecast, Recommendation, Action, Maintenance, EventLog, Feedback
)

def seed_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        print("[SEED] Seeding database for Caterpillar Smart Rental Control Tower...")

        # Clear existing data in reverse foreign-key order
        for model in [Feedback, EventLog, Maintenance, Action, Recommendation, DemandForecast, DemandRequest, Alert, Trip, Telemetry, Rental, Asset, Operator, Site, Customer]:
            try:
                db.query(model).delete()
            except Exception:
                pass
        db.commit()

        # 1. Customers
        c1 = Customer(id="CUST001", name="InfraCorp Constructions", contact_email="ops@infracorp.in", health_score=92.0, active_rentals_count=3)
        c2 = Customer(id="CUST002", name="BuildMax Infrastructure", contact_email="fleet@buildmax.co.in", health_score=88.5, active_rentals_count=2)
        c3 = Customer(id="CUST003", name="Metro Projects Ltd", contact_email="site@metroprojects.org", health_score=79.0, active_rentals_count=2)
        db.add_all([c1, c2, c3])

        # 2. Sites (Pune / Mumbai corridor)
        now = datetime.datetime.utcnow()
        s1 = Site(
            id="S001", name="Pune Ring Road Expressway", customer_id="CUST001",
            latitude=18.5204, longitude=73.8567, geofence_radius_meters=600,
            terrain_type="Rough", material_type="Aggregate",
            current_demand_tons_per_day=1.0, forecast_demand_tons_per_day=1.1,
            operating_hours="08:00–16:00", project_start=now - datetime.timedelta(days=15),
            project_end=now + datetime.timedelta(days=30), required_equipment_type="Dumper"
        )
        s2 = Site(
            id="S002", name="Mumbai Metro Line 4 Underground Dig", customer_id="CUST003",
            latitude=19.0760, longitude=72.8777, geofence_radius_meters=500,
            terrain_type="Rock", material_type="Rock",
            current_demand_tons_per_day=3.5, forecast_demand_tons_per_day=3.8,
            operating_hours="06:00–18:00", project_start=now - datetime.timedelta(days=40),
            project_end=now + datetime.timedelta(days=10), required_equipment_type="Excavator"
        )
        s3 = Site(
            id="S003", name="Nashik Highway Expansion Site B", customer_id="CUST002",
            latitude=19.9975, longitude=73.7898, geofence_radius_meters=700,
            terrain_type="Soil", material_type="Soil",
            current_demand_tons_per_day=2.0, forecast_demand_tons_per_day=2.0,
            operating_hours="08:00–17:00", project_start=now - datetime.timedelta(days=10),
            project_end=now + datetime.timedelta(days=20), required_equipment_type="Grader"
        )
        s4 = Site(
            id="S004", name="Lonavala Tunnel Bypass Corridor", customer_id="CUST001",
            latitude=18.7557, longitude=73.4091, geofence_radius_meters=400,
            terrain_type="Rough", material_type="Rock",
            current_demand_tons_per_day=4.5, forecast_demand_tons_per_day=4.5,
            operating_hours="07:00–19:00", project_start=now - datetime.timedelta(days=5),
            project_end=now + datetime.timedelta(days=45), required_equipment_type="Crane"
        )
        s5 = Site(
            id="S005", name="Thane Industrial Logistics Hub", customer_id="CUST002",
            latitude=19.2183, longitude=72.9781, geofence_radius_meters=500,
            terrain_type="Flat", material_type="Aggregate",
            current_demand_tons_per_day=1.8, forecast_demand_tons_per_day=2.2,
            operating_hours="08:00–16:00", project_start=now - datetime.timedelta(days=25),
            project_end=now + datetime.timedelta(days=15), required_equipment_type="Bulldozer"
        )
        s6 = Site(
            id="S006", name="Navi Mumbai Land Reclamation Site C", customer_id="CUST003",
            latitude=18.9894, longitude=73.1175, geofence_radius_meters=800,
            terrain_type="Sand", material_type="Sand",
            current_demand_tons_per_day=1.0, forecast_demand_tons_per_day=1.0,
            operating_hours="08:00–16:00", project_start=now - datetime.timedelta(days=2),
            project_end=now + datetime.timedelta(days=60), required_equipment_type="Dumper"
        )
        db.add_all([s1, s2, s3, s4, s5, s6])

        # 3. Operators
        op1 = Operator(id="OP001", name="Rajesh Kumar", license_number="MH12-2021-9988", experience_years=7.5, rating=4.9)
        op2 = Operator(id="OP002", name="Vikram Singh", license_number="MH04-2019-4432", experience_years=5.0, rating=4.7)
        op3 = Operator(id="OP003", name="Amit Patel", license_number="MH14-2020-1122", experience_years=3.5, rating=4.6)
        op4 = Operator(id="OP004", name="Suresh Deshmukh", license_number="MH15-2018-7711", experience_years=9.0, rating=4.95)
        op5 = Operator(id="OP005", name="Ganesh Shinde", license_number="MH02-2022-3344", experience_years=2.0, rating=4.3)
        db.add_all([op1, op2, op3, op4, op5])

        # 4. Rentals
        r1 = Rental(id="RNT-1001", asset_id="EQX1001", site_id="S001", customer_id="CUST001", start_date=now - datetime.timedelta(days=10), end_date=now + datetime.timedelta(days=5), daily_rate=8000.0, status="ACTIVE", extension_risk_probability=0.15)
        r2 = Rental(id="RNT-1002", asset_id="EQX1002", site_id="S002", customer_id="CUST003", start_date=now - datetime.timedelta(days=20), end_date=now + datetime.timedelta(days=1), daily_rate=12000.0, status="ACTIVE", extension_risk_probability=0.87)
        r3 = Rental(id="RNT-1003", asset_id="EQX1004", site_id="S003", customer_id="CUST002", start_date=now - datetime.timedelta(days=7), end_date=now + datetime.timedelta(days=14), daily_rate=7500.0, status="ACTIVE", extension_risk_probability=0.25)
        r4 = Rental(id="RNT-1004", asset_id="EQX1005", site_id="S004", customer_id="CUST001", start_date=now - datetime.timedelta(days=4), end_date=now + datetime.timedelta(days=26), daily_rate=18000.0, status="ACTIVE", extension_risk_probability=0.05)
        r5 = Rental(id="RNT-1005", asset_id="EQX1006", site_id="S005", customer_id="CUST002", start_date=now - datetime.timedelta(days=12), end_date=now + datetime.timedelta(days=2), daily_rate=9500.0, status="ACTIVE", extension_risk_probability=0.62)
        r6 = Rental(id="RNT-1006", asset_id="EQX1011", site_id="S002", customer_id="CUST003", start_date=now - datetime.timedelta(days=8), end_date=now + datetime.timedelta(days=18), daily_rate=13500.0, status="ACTIVE", extension_risk_probability=0.10)
        r7 = Rental(id="RNT-1007", asset_id="EQX1012", site_id="S004", customer_id="CUST001", start_date=now - datetime.timedelta(days=5), end_date=now + datetime.timedelta(days=25), daily_rate=14000.0, status="ACTIVE", extension_risk_probability=0.08)
        db.add_all([r1, r2, r3, r4, r5, r6, r7])

        # 5. Assets
        a1 = Asset(
            id="EQX1001", name="CAT 725 Articulated Truck", equipment_type="Dumper", capacity_tons=2.0,
            current_site_id="S001", status="ACTIVE", operator_id="OP001", rental_id="RNT-1001",
            rental_start=now - datetime.timedelta(days=10), rental_end=now + datetime.timedelta(days=5),
            fuel_level=72.0, engine_hours=340.0, health_score=94.0, maintenance_status="OK",
            latitude=18.5204, longitude=73.8567, terrain_capability="Rough,Flat,Soil,Sand", daily_rental_rate=8000.0
        )
        a2 = Asset(
            id="EQX1002", name="CAT 336 Hydraulic Excavator", equipment_type="Excavator", capacity_tons=3.0,
            current_site_id="S002", status="AT_RISK", operator_id="OP002", rental_id="RNT-1002",
            rental_start=now - datetime.timedelta(days=20), rental_end=now + datetime.timedelta(days=1),
            fuel_level=45.0, engine_hours=890.0, health_score=82.0, maintenance_status="OK",
            latitude=19.0760, longitude=72.8777, terrain_capability="Rough,Rock,Soil", daily_rental_rate=12000.0
        )
        a3 = Asset(
            id="EQX1003", name="CAT 720 Mini Dumper", equipment_type="Dumper", capacity_tons=1.0,
            current_site_id=None, status="AVAILABLE", operator_id=None, rental_id=None,
            fuel_level=100.0, engine_hours=85.0, health_score=98.0, maintenance_status="OK",
            latitude=18.5300, longitude=73.8400, terrain_capability="Rough,Flat,Soil,Sand", daily_rental_rate=5150.0
        )
        a4 = Asset(
            id="EQX1004", name="CAT 140 Motor Grader", equipment_type="Grader", capacity_tons=2.0,
            current_site_id="S003", status="ACTIVE", operator_id="OP003", rental_id="RNT-1003",
            rental_start=now - datetime.timedelta(days=7), rental_end=now + datetime.timedelta(days=14),
            fuel_level=60.0, engine_hours=492.0, health_score=86.0, maintenance_status="DUE_SOON",
            latitude=19.9975, longitude=73.7898, terrain_capability="Flat,Soil", daily_rental_rate=7500.0
        )
        a5 = Asset(
            id="EQX1005", name="CAT 150T All-Terrain Crane", equipment_type="Crane", capacity_tons=5.0,
            current_site_id="S004", status="ACTIVE", operator_id="OP004", rental_id="RNT-1004",
            rental_start=now - datetime.timedelta(days=4), rental_end=now + datetime.timedelta(days=26),
            fuel_level=90.0, engine_hours=140.0, health_score=97.0, maintenance_status="OK",
            latitude=18.7557, longitude=73.4091, terrain_capability="Rough,Rock,Flat", daily_rental_rate=18000.0
        )
        a6 = Asset(
            id="EQX1006", name="CAT D6 Crawler Dozer", equipment_type="Bulldozer", capacity_tons=2.0,
            current_site_id="S005", status="IDLE", operator_id="OP005", rental_id="RNT-1005",
            rental_start=now - datetime.timedelta(days=12), rental_end=now + datetime.timedelta(days=2),
            fuel_level=35.0, engine_hours=610.0, health_score=89.0, maintenance_status="OK",
            latitude=19.2183, longitude=72.9781, terrain_capability="Rough,Flat,Soil,Sand", daily_rental_rate=9500.0
        )
        a7 = Asset(
            id="EQX1007", name="CAT 718 Compact Hauler", equipment_type="Dumper", capacity_tons=1.0,
            current_site_id=None, status="AVAILABLE", operator_id=None, rental_id=None,
            fuel_level=95.0, engine_hours=42.0, health_score=99.0, maintenance_status="OK",
            latitude=18.5400, longitude=73.8600, terrain_capability="Rough,Flat,Soil,Sand", daily_rental_rate=5150.0
        )
        a8 = Asset(
            id="EQX1008", name="CAT 320 Heavy Excavator", equipment_type="Excavator", capacity_tons=3.0,
            current_site_id="S006", status="ACTIVE", operator_id=None, rental_id=None,
            fuel_level=80.0, engine_hours=210.0, health_score=93.0, maintenance_status="OK",
            latitude=18.9894, longitude=73.1175, terrain_capability="Rough,Sand,Soil", daily_rental_rate=11000.0
        )
        a9 = Asset(
            id="EQX1009", name="CAT 725 Secondary Dumper", equipment_type="Dumper", capacity_tons=2.0,
            current_site_id="S001", status="IDLE", operator_id=None, rental_id=None,
            fuel_level=55.0, engine_hours=512.0, health_score=90.0, maintenance_status="OK",
            latitude=18.5210, longitude=73.8570, terrain_capability="Rough,Flat,Soil", daily_rental_rate=8000.0
        )
        a10 = Asset(
            id="EQX1010", name="CAT 120 Motor Grader Compact", equipment_type="Grader", capacity_tons=1.0,
            current_site_id=None, status="AVAILABLE", operator_id=None, rental_id=None,
            fuel_level=90.0, engine_hours=115.0, health_score=96.0, maintenance_status="OK",
            latitude=19.0000, longitude=72.8500, terrain_capability="Flat,Soil", daily_rental_rate=4800.0
        )
        a11 = Asset(
            id="EQX1011", name="CAT 330 NextGen Excavator", equipment_type="Excavator", capacity_tons=3.5,
            current_site_id="S002", status="ACTIVE", operator_id="OP003", rental_id="RNT-1006",
            rental_start=now - datetime.timedelta(days=8), rental_end=now + datetime.timedelta(days=18),
            fuel_level=82.0, engine_hours=195.0, health_score=95.0, maintenance_status="OK",
            latitude=19.0780, longitude=72.8790, terrain_capability="Rough,Rock,Soil", daily_rental_rate=13500.0
        )
        a12 = Asset(
            id="EQX1012", name="CAT 745 Articulated Hauler", equipment_type="Dumper", capacity_tons=4.0,
            current_site_id="S004", status="ACTIVE", operator_id="OP005", rental_id="RNT-1007",
            rental_start=now - datetime.timedelta(days=5), rental_end=now + datetime.timedelta(days=25),
            fuel_level=88.0, engine_hours=110.0, health_score=97.0, maintenance_status="OK",
            latitude=18.7560, longitude=73.4100, terrain_capability="Rough,Rock,Flat", daily_rental_rate=14000.0
        )
        db.add_all([a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12])
        db.commit()

        # 6. Historical Telemetry
        print("[SEED] Generating 30-day telemetry history...")
        for day in range(30, 0, -1):
            ts = now - datetime.timedelta(days=day)
            t1 = Telemetry(
                asset_id="EQX1001", timestamp=ts, latitude=18.5204 + random.uniform(-0.002, 0.002),
                longitude=73.8567 + random.uniform(-0.002, 0.002), engine_status="RUNNING",
                engine_hours=340.0 - day * 6.5, idle_hours=2.5, speed=18.5,
                current_load_tons=1.01 + random.uniform(-0.05, 0.05), trips_completed=10,
                fuel_level=max(10.0, 100.0 - (day % 5) * 15.0), engine_temperature=84.5,
                hydraulic_pressure=205.0, terrain="Rough", operator_id="OP001"
            )
            t2 = Telemetry(
                asset_id="EQX1002", timestamp=ts, latitude=19.0760 + random.uniform(-0.002, 0.002),
                longitude=72.8777 + random.uniform(-0.002, 0.002), engine_status="RUNNING",
                engine_hours=890.0 - day * 8.0, idle_hours=1.2, speed=12.0,
                current_load_tons=3.85 + random.uniform(-0.1, 0.1), trips_completed=14,
                fuel_level=max(15.0, 100.0 - (day % 4) * 20.0), engine_temperature=96.0,
                hydraulic_pressure=245.0, terrain="Rock", operator_id="OP002"
            )
            db.add_all([t1, t2])

            tr1 = Trip(
                id=f"TRIP-{day}-1001", asset_id="EQX1001", site_id="S001",
                start_time=ts - datetime.timedelta(hours=4), end_time=ts - datetime.timedelta(hours=3, minutes=45),
                material="Aggregate", load_tons=1.0, trip_duration_minutes=15.0, trip_status="COMPLETED"
            )
            tr2 = Trip(
                id=f"TRIP-{day}-1002", asset_id="EQX1002", site_id="S002",
                start_time=ts - datetime.timedelta(hours=3), end_time=ts - datetime.timedelta(hours=2, minutes=40),
                material="Rock", load_tons=3.8, trip_duration_minutes=20.0, trip_status="COMPLETED"
            )
            db.add_all([tr1, tr2])

        # 7. Initial Alerts
        al1 = Alert(
            id="ALT-1001", asset_id="EQX1002", type="OVERLOAD", severity="CRITICAL",
            observed_value="3.8T", threshold_value="3.0T",
            explanation="Asset carrying 3.8T load exceeding maximum certified capacity of 3.0T by 26%. Immediate safety risk.",
            timestamp=now - datetime.timedelta(minutes=15), status="ACTIVE"
        )
        al2 = Alert(
            id="ALT-1002", asset_id="EQX1002", type="OVERDUE", severity="HIGH",
            observed_value="Return date: Tomorrow", threshold_value="0 days",
            explanation="Rental period ending tomorrow with 87% overrun probability based on incomplete excavation demand.",
            timestamp=now - datetime.timedelta(minutes=45), status="ACTIVE"
        )
        al3 = Alert(
            id="ALT-1003", asset_id="EQX1001", type="UNDERUTILIZED", severity="MEDIUM",
            observed_value="50% Capacity Util", threshold_value="80%",
            explanation="Asset capacity is 2.0T but average daily load is 1.0T (50% utilization). Right-sizing opportunity detected.",
            timestamp=now - datetime.timedelta(hours=2), status="ACTIVE"
        )
        al4 = Alert(
            id="ALT-1004", asset_id="EQX1004", type="MAINTENANCE_DUE", severity="MEDIUM",
            observed_value="492 hrs", threshold_value="500 hrs",
            explanation="Engine hours approaching 500-hour service interval. Schedule maintenance during upcoming low-demand window.",
            timestamp=now - datetime.timedelta(hours=5), status="ACTIVE"
        )
        db.add_all([al1, al2, al3, al4])

        # 8. Hero Recommendation
        rec1 = Recommendation(
            id="REC-1001", asset_id="EQX1001", source_site_id="S001", destination_site_id="S001",
            recommended_asset_id="EQX1007", type="RIGHT_SIZING", suitability_score=94.0,
            potential_daily_saving=2850.0,
            what_changed="Site S001 demand is 1.0T/day. Current asset EQX1001 (2.0T capacity) is running at 50% capacity utilization with INR 8,000/day rental cost.",
            why_explanation="EQX1007 (1.0T capacity) perfectly matches 1.0T site requirement, eliminates 5.8 hrs/day idle loss, and costs INR 5,150/day.",
            expected_impact="Capacity utilization increases from 50% to 91%. Idle hours drop from 6.2h to 1.5h/day. Operational cost saved: INR 2,850/day.",
            status="PENDING", created_at=now - datetime.timedelta(minutes=30)
        )
        db.add(rec1)

        # 9. Maintenance Records
        m1 = Maintenance(
            id="MNT-1001", asset_id="EQX1004", title="500-Hour Hydraulic & Filter Inspection",
            scheduled_date=now + datetime.timedelta(days=1, hours=10), estimated_hours=4.0,
            status="SCHEDULED", notes="Recommended during low-demand window (10:00-14:00) to avoid site disruption."
        )
        db.add(m1)

        # 10. Initial Event Logs
        el1 = EventLog(
            event_type="RECOMMENDATION_CREATED", entity_type="RECOMMENDATION", entity_id="REC-1001",
            message="AI Control Tower generated Right-Sizing recommendation for Site S001 (EQX1001 -> EQX1007)",
            metadata_json={"potential_saving": 2850.0, "score": 94.0}
        )
        db.add(el1)

        db.commit()
        print("[SEED] Database successfully seeded!")
    except Exception as e:
        db.rollback()
        print(f"[SEED] Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
