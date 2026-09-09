import asyncio
import datetime
import random
import math
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.entities import Asset, Site, Telemetry, Trip, Alert, Action
from app.intelligence.rule_engine import RuleEngine

class TelemetrySimulator:
    def __init__(self, ws_manager=None):
        self.ws_manager = ws_manager
        self.is_running = False
        self.trip_states = {}  # asset_id -> {"state": "EMPTY", "load": 0.0, "start_time": ts}

    async def start(self):
        self.is_running = True
        print("[SIM] Live Telemetry Simulator started...")
        while self.is_running:
            try:
                await self.tick()
            except Exception as e:
                print(f"[SIM] Simulator tick error: {e}")
            await asyncio.sleep(5)  # Tick every 5 seconds

    def stop(self):
        self.is_running = False

    async def tick(self):
        db: Session = SessionLocal()
        try:
            assets = db.query(Asset).all()
            sites = {s.id: s for s in db.query(Site).all()}
            now = datetime.datetime.utcnow()

            for asset in assets:
                # Process active transitioning assets
                active_action = db.query(Action).filter(
                    Action.asset_id == asset.id,
                    Action.status == "TRANSITIONING"
                ).first()

                if active_action and active_action.destination_site_id in sites:
                    dest_site = sites[active_action.destination_site_id]
                    # Simulate movement towards destination site
                    d_lat = dest_site.latitude - asset.latitude
                    d_lon = dest_site.longitude - asset.longitude
                    dist_remaining = math.sqrt(d_lat**2 + d_lon**2)

                    if dist_remaining < 0.005:  # Arrived!
                        asset.latitude = dest_site.latitude
                        asset.longitude = dest_site.longitude
                        asset.status = "ACTIVE"
                        asset.current_site_id = dest_site.id
                        active_action.status = "COMPLETED"
                        active_action.completed_time = now
                        active_action.outcome_status = "SUCCESSFUL"
                        
                        # Recalculate utilization after reassignment
                        active_action.after_utilization = 91.0
                        active_action.after_cost = asset.daily_rental_rate

                        print(f"[SIM] Asset {asset.id} reached destination {dest_site.name}!")
                        if self.ws_manager:
                            await self.ws_manager.broadcast({
                                "type": "ASSET_ARRIVED",
                                "asset_id": asset.id,
                                "site_id": dest_site.id,
                                "action_id": active_action.id
                            })
                    else:
                        # Move 20% closer per tick
                        asset.latitude += d_lat * 0.25
                        asset.longitude += d_lon * 0.25
                        asset.status = "TRANSITIONING"

                # Update live telemetry for active assets
                if asset.status in ["ACTIVE", "AT_RISK", "IDLE"]:
                    site = sites.get(asset.current_site_id)
                    
                    # Simulating realistic parameters based on Hero scenario:
                    # If asset is EQX1001 (2.0T dumper at S001), it carries ~1.0T load
                    if asset.id == "EQX1001":
                        current_load = round(1.0 + random.uniform(-0.05, 0.05), 2)
                        speed = round(18.0 + random.uniform(-2, 2), 1)
                        idle_h = asset.engine_hours * 0.2
                    elif asset.id == "EQX1002":
                        # Overloaded excavator
                        current_load = round(3.8 + random.uniform(-0.1, 0.1), 2)
                        speed = round(12.0 + random.uniform(-1, 1), 1)
                        idle_h = asset.engine_hours * 0.1
                    else:
                        target_demand = site.current_demand_tons_per_day if site else 1.0
                        current_load = round(min(asset.capacity_tons, target_demand) + random.uniform(-0.1, 0.1), 2)
                        speed = round(15.0 + random.uniform(-3, 3), 1)
                        idle_h = asset.engine_hours * 0.15

                    tel = Telemetry(
                        asset_id=asset.id,
                        timestamp=now,
                        latitude=asset.latitude + random.uniform(-0.0001, 0.0001),
                        longitude=asset.longitude + random.uniform(-0.0001, 0.0001),
                        engine_status="RUNNING" if speed > 2.0 else "IDLE",
                        engine_hours=asset.engine_hours + 0.01,
                        idle_hours=idle_h,
                        speed=speed,
                        current_load_tons=current_load,
                        trips_completed=int(asset.engine_hours * 2),
                        fuel_level=max(5.0, asset.fuel_level - 0.02),
                        engine_temperature=round(85.0 + random.uniform(-2, 3), 1),
                        hydraulic_pressure=round(210.0 + random.uniform(-5, 5), 1),
                        terrain=site.terrain_type if site else "Rough",
                        operator_id=asset.operator_id
                    )
                    db.add(tel)
                elif asset.status == "AVAILABLE":
                    latest_avail = db.query(Telemetry).filter(Telemetry.asset_id == asset.id).first()
                    if not latest_avail:
                        tel = Telemetry(
                            asset_id=asset.id,
                            timestamp=now,
                            latitude=asset.latitude,
                            longitude=asset.longitude,
                            engine_status="OFF",
                            engine_hours=asset.engine_hours,
                            idle_hours=0.0,
                            speed=0.0,
                            current_load_tons=0.0,
                            trips_completed=int(asset.engine_hours * 1.5),
                            fuel_level=asset.fuel_level,
                            engine_temperature=35.0,
                            hydraulic_pressure=190.0,
                            terrain="Rough",
                            operator_id=None
                        )
                        db.add(tel)

                    # Check rules & generate alerts
                    rule_alerts = RuleEngine.evaluate_asset(asset, tel, site, asset.rental)
                    for ra in rule_alerts:
                        existing = db.query(Alert).filter(
                            Alert.asset_id == asset.id,
                            Alert.type == ra["type"],
                            Alert.status == "ACTIVE"
                        ).first()
                        if not existing:
                            alert_obj = Alert(
                                id=f"ALT-{random.randint(1000, 9999)}",
                                asset_id=asset.id,
                                type=ra["type"],
                                severity=ra["severity"],
                                observed_value=ra["observed_value"],
                                threshold_value=ra["threshold_value"],
                                explanation=ra["explanation"],
                                timestamp=ra["timestamp"],
                                status="ACTIVE"
                            )
                            db.add(alert_obj)
                            if self.ws_manager:
                                await self.ws_manager.broadcast({
                                    "type": "ALERT_CREATED",
                                    "alert": {
                                        "id": alert_obj.id,
                                        "asset_id": asset.id,
                                        "type": alert_obj.type,
                                        "severity": alert_obj.severity,
                                        "explanation": alert_obj.explanation
                                    }
                                })

                    # Broadcast WS telemetry update
                    if self.ws_manager:
                        await self.ws_manager.broadcast({
                            "type": "TELEMETRY_UPDATE",
                            "asset_id": asset.id,
                            "data": {
                                "latitude": asset.latitude,
                                "longitude": asset.longitude,
                                "load_tons": current_load,
                                "speed": speed,
                                "fuel_level": asset.fuel_level,
                                "status": asset.status
                            }
                        })

            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Error in simulator tick: {e}")
        finally:
            db.close()

telemetry_simulator_instance = TelemetrySimulator()
