<div align="center">

# 🏗️ Caterpillar Smart Rental Control Tower

### *Right Asset. Right Site. Right Time.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-caterpillar--fleet--manager.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://caterpillar-fleet-manager.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-blue?style=for-the-badge&logo=render)](https://cat-control-tower.onrender.com/docs)
[![GitHub](https://img.shields.io/badge/GitHub-Richiemaja04-black?style=for-the-badge&logo=github)](https://github.com/Richiemaja04/cat-control-tower)

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=flat&logo=python&logoColor=white)

</div>

---

## 📌 Overview

The **Caterpillar Smart Rental Control Tower** is an AI-powered fleet intelligence platform that transforms passive equipment telemetry into proactive, financially explainable field decisions.

Heavy construction equipment rental in India is a **₹15,000+ Cr industry** plagued by:
- Fleet utilization stuck between **58–65%**
- Equipment mismatches — heavy haulers running at 40–50% capacity
- **45–90 minute** reaction latency when breakdowns or geofence breaches occur
- Zero audit trail on field communications

This system solves all of that in real-time.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📡 **Live Telemetry** | Real-time WebSocket stream for 12 assets across 6 Bangalore sites |
| 🤖 **Dual-Layer AI** | Rule engine + Isolation Forest ML for anomaly detection |
| 📞 **Twilio Voice Calls** | 1-click PSTN outbound calls to operators with DTMF response capture |
| 💡 **Explainable Recommendations** | Every AI decision shows *What Changed*, *Why*, and *₹ Daily Savings* |
| 🗺️ **Fleet Map** | Live Leaflet map with geofence circles and asset positions |
| 📊 **KPI Dashboard** | Utilization %, idle costs, rental risk, fleet efficiency score |
| 🎮 **Demo Scenarios** | One-click hackathon scenarios (Overload, Right-Sizing, Geofence breach) |

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Backend API** | FastAPI (Python 3.11) | ASGI async, native WebSockets, OpenAPI docs |
| **ML Engine** | Scikit-Learn (Isolation Forest) | <1ms CPU inference, zero GPU needed |
| **Database** | SQLAlchemy 2.0 + SQLite | Zero-DevOps; swap to PostgreSQL with 1 line |
| **Frontend** | React 18 + TypeScript + Vite | Type-safe, HMR, fast builds |
| **State** | Zustand | 90% less boilerplate than Redux |
| **Maps** | Leaflet + React-Leaflet | Free, quota-free, custom SVG markers |
| **Telephony** | Twilio REST + TwiML | Indian PSTN calls, neural "Alice" voice |
| **Real-time** | Native WebSockets | <100ms telemetry push, no polling |
| **Deployment** | Docker + Render + Vercel | Containerized, CI/CD via GitHub |

---

## 🗂️ Project Structure

```
cat-control-tower/
├── 🐳 docker-compose.yml          # Local dev orchestration
├── backend/
│   ├── Dockerfile                 # Python 3.11-slim + uvicorn
│   ├── render.yaml                # Render deployment blueprint
│   ├── requirements.txt
│   └── app/
│       ├── main.py                # FastAPI entry, CORS, lifespan
│       ├── database.py            # SQLAlchemy engine & session
│       ├── api/
│       │   ├── dashboard.py       # KPI summaries & priority actions
│       │   ├── assets.py          # Asset 360, utilization, checkout
│       │   ├── telephony.py       # Twilio calls & DTMF webhook
│       │   ├── recommendations.py # AI recommendations
│       │   ├── demo.py            # Hackathon scenario triggers
│       │   └── websocket.py       # Live broadcast manager
│       ├── intelligence/
│       │   ├── anomaly_detector.py    # Isolation Forest ML
│       │   ├── rule_engine.py         # 6 deterministic safety rules
│       │   ├── recommendation_engine.py
│       │   ├── fleet_optimizer.py
│       │   └── demand_forecaster.py
│       ├── models/entities.py     # 13 SQLAlchemy ORM models
│       ├── seed/seed_data.py      # Auto-seed 12 assets, 6 sites
│       └── simulator/             # Background telemetry simulator
└── frontend/
    ├── Dockerfile                 # Multi-stage Node → nginx
    ├── nginx.conf                 # SPA routing + gzip
    ├── src/
    │   ├── api/client.ts          # Axios API layer
    │   ├── store/fleetStore.ts    # Zustand global state
    │   ├── hooks/useWebSocket.ts  # Live telemetry hook
    │   ├── pages/                 # Dashboard, Assets, Rentals...
    │   └── components/            # KPI cards, Fleet map, Drawer...
    └── .env.example
```

---

## 🚀 Getting Started

### Option 1 — Docker (Recommended)

```bash
git clone https://github.com/Richiemaja04/cat-control-tower.git
cd cat-control-tower

# Copy and fill in your Twilio credentials
cp backend/.env.example backend/.env

# Start both services
docker compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs

### Option 2 — Manual

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
cp .env.example .env        # set VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLAlchemy DB URL (default: SQLite) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_FROM_NUMBER` | Outbound caller ID |
| `DEFAULT_DRIVER_PHONE` | Default operator phone number |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

---

## ☁️ Deployment

### Backend → Render
1. Connect this GitHub repo on [render.com](https://render.com)
2. Set **Root Directory**: `backend` | **Runtime**: `Docker`
3. Add environment variables in Render dashboard
4. Deploy — auto-redeploys on every `git push`

### Frontend → Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Set **Root Directory**: `frontend`
3. Add `VITE_API_URL` = your Render backend URL
4. Deploy — auto-redeploys on every `git push`

---

## 🤖 AI Intelligence Architecture

```
Telemetry Input (5D)
    │
    ├─► Rule Engine (6 deterministic rules)
    │       ├── Structural Overload (load > capacity)
    │       ├── Critical Idle (idle_hours > 8)
    │       ├── Thermal Warning (temp > 105°C)
    │       ├── Hydraulic Alert (pressure > 280 bar)
    │       ├── Geofence Breach (GPS radius check)
    │       └── Utilization Mismatch (<25% for 48h)
    │
    └─► Isolation Forest ML Model
            └── Detects subtle behavioral anomalies
                outside normal operating distributions
                    │
                    ▼
            Recommendation Engine
            ├── Right-Sizing (match asset to workload)
            ├── Repositioning (move to high-demand site)
            └── Maintenance Alert (predictive servicing)
```

---

## 📄 License

MIT License — built for the Caterpillar Hackathon 2026.

---

<div align="center">
Built with ❤️ by <a href="https://github.com/Richiemaja04">Richiemaja04</a>
</div>
