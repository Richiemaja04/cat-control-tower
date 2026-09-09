import asyncio
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.seed.seed_data import seed_db
from app.api import assets, sites, rentals, recommendations, actions, dashboard, demo, telephony
from app.api.websocket import manager as ws_manager
from app.simulator.telemetry_simulator import telemetry_simulator_instance

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[API] Initializing Caterpillar Smart Rental Control Tower Backend...")
    # Initialize DB & Seed
    seed_db()
    
    # Pass WS manager to simulator & launch simulator background task
    telemetry_simulator_instance.ws_manager = ws_manager
    sim_task = asyncio.create_task(telemetry_simulator_instance.start())

    yield

    print("[API] Shutting down backend...")
    telemetry_simulator_instance.stop()
    sim_task.cancel()

app = FastAPI(
    title="Caterpillar Smart Rental Control Tower API",
    description="Right Asset. Right Site. Right Time.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(dashboard.router)
app.include_router(assets.router)
app.include_router(sites.router)
app.include_router(rentals.router)
app.include_router(recommendations.router)
app.include_router(actions.router)
app.include_router(demo.router)
app.include_router(telephony.router)

# Control Tower Root Endpoint

@app.get("/")
def read_root():
    return {
        "system": "Caterpillar Smart Rental Control Tower API",
        "tagline": "Right Asset. Right Site. Right Time.",
        "status": "OPERATIONAL",
        "version": "1.0.0"
    }

@app.websocket("/ws/fleet")
async def websocket_fleet_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
