<div align="center">

# 🚇 Metro Guide — AI-Powered 3D Metro Navigation

**A full-stack, AI-first metro navigation platform featuring a real-time 3D interactive map, Dijkstra-powered route planning, Gemini AI chatbot assistant, and multi-source geocoding — built for Pune Metro.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.139-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Three.js](https://img.shields.io/badge/Three.js-0.185-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org)
[![MapLibre](https://img.shields.io/badge/MapLibre_GL-5-396CB2?style=for-the-badge)](https://maplibre.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com)

</div>

---

## 📸 Overview

Metro Guide is a **production-grade, AI-powered metro navigation web application** that combines an interactive 3D city map, intelligent route planning algorithms, and a Gemini AI chatbot — all into a single cohesive experience. It currently targets the **Pune Metro** network across 3 lines (Purple, Aqua, Line 3) with a city-agnostic architecture ready for expansion.

### ✨ Key Highlights

- 🗺️ **Real 3D Metro Map** — MapLibre GL + Three.js custom WebGL layer renders elevated viaducts, support pillars, glowing station structures, and pulsing animated ground rings at 60 fps
- 🧠 **Dijkstra Route Planning** — Client-side graph traversal with Haversine distance + interchange penalty, giving optimal multi-line metro paths
- 🤖 **Gemini AI Chatbot** — Google Gemini-powered AI assistant with full conversation memory (PostgreSQL-backed), streaming SSE responses, and metro-domain system instructions
- 📍 **Smart Geocoding** — Multi-source location search combining local station fuzzy matching + Photon (Komoot) + Nominatim (OpenStreetMap), all in parallel
- 🏃 **Nearest Station Detection** — Haversine-based geospatial proximity search to snap user coordinates to the closest metro station
- 📱 **Fully Responsive** — Dedicated mobile layout with bottom-sheet navigation, tab switching, and compact controls

---

## 🏗️ Architecture

```
Metro Guide/
├── metro-guide/          ← React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── components/   ← UI components (Map, Journey, Chat, Stations…)
│   │   ├── data/         ← Station graph data & city configuration registry
│   │   └── utils/        ← Dijkstra pathfinding, Geocoding API client, Map styles
│   └── public/
│
└── backend/              ← Python FastAPI backend
    └── app/
        ├── api/          ← REST & SSE endpoints (chat, journey, health)
        ├── agents/       ← AI agent definitions (metro, navigation, map, voice)
        ├── services/     ← Business logic (Gemini, Journey planning, Geocoding)
        ├── db/           ← SQLAlchemy models + Supabase/PostgreSQL
        ├── memory/       ← Conversation memory persistence layer
        ├── rag/          ← Retrieval-Augmented Generation (embeddings, vector store)
        ├── schemas/      ← Pydantic request/response models
        └── core/         ← App config, system prompts
```

**Data Flow:**

```
User Input ──► React UI ──► [Client-side Dijkstra] ──► Metro Route Overlay on MapLibre
                    │
                    └──► FastAPI Backend ──► Gemini AI ──► SSE Stream ──► Chat Panel
                                      └──► Journey Service ──► Haversine + Dijkstra ──► Route JSON
                                      └──► PostgreSQL (Supabase) ──► Conversation Memory
```

---

## 🗺️ Core Map Library — MapLibre GL JS

> **Package:** `maplibre-gl@5.24`
> **Used in:** `metro-guide/src/components/MetroMap.tsx`

[MapLibre GL JS](https://maplibre.org/maplibre-gl-js/) is an open-source WebGL-based map rendering library (fork of Mapbox GL JS). It powers the entire base map experience in Metro Guide:

| Feature | How It's Used |
|---|---|
| **WebGL Map Rendering** | Renders the full interactive 2D/3D city map at 60 fps |
| **3D Terrain** | Optional DEM tile-based terrain extrusion for a realistic city elevation view |
| **Custom Layers API** (`CustomLayerInterface`) | Hooks Three.js directly into the MapLibre WebGL context for the 3D metro layer |
| **`MercatorCoordinate`** | Converts real-world lat/lng to MapLibre's Mercator coordinate system so Three.js objects are pixel-accurate on the map |
| **GeoJSON Line Layers** | Draws the 2D metro route lines on the map, highlighting active journey segments |
| **Circle / Symbol Layers** | Renders station markers with dynamic sizing and selection highlights |
| **`flyTo` / `easeTo`** | Smooth animated camera transitions when the user selects a station or views a route |
| **Map Styles** | Switchable between Dark, Light, Satellite, and Street tile styles |

---

## 🎮 3D Animation Library — Three.js

> **Package:** `three@0.185`
> **Used in:** `metro-guide/src/components/ThreeLayer.ts`

[Three.js](https://threejs.org) is a JavaScript 3D graphics library built on top of WebGL. Metro Guide uses it as a **custom render layer injected directly into MapLibre's WebGL context** to draw photorealistic 3D metro infrastructure on top of the base map — without a separate canvas.

### What Three.js Renders

#### 🏗️ Elevated Viaducts (Track Beams)

```
For each consecutive pair of route coordinates:
  → BoxGeometry concrete deck beam (~7m wide, ~2.5m thick)
  → Glowing colored strip on top of the beam (line color)
  → Support pillars every ~180 meters along the segment
  → All positioned at exactly 16 meters altitude using MercatorCoordinate
```

#### 🏢 3D Station Structures

- Translucent glass enclosures (`MeshPhongMaterial`, opacity 0.78) in the line's color
- Station alignment angle calculated from the nearest track segment direction
- Support pillars below each station box
- Roof edge accent panel on top

#### 💫 Animated Pulsing Ground Rings

- Each station gets a **stable inner ring** + an **expanding outer ring** that pulses outward and fades
- Rings animate in a staggered phase offset per station for a cascading visual effect
- `performance.now()` drives smooth 60 fps animation via `map.triggerRepaint()`

#### Lighting & Materials

- `AmbientLight` (1.8 intensity) + `DirectionalLight` (1.5 intensity) for professional 3D shading
- `WebGLRenderer` shares the canvas and WebGL context with MapLibre (no extra GPU overhead)
- `renderer.autoClear = false` preserves MapLibre's rendered frame under the Three.js scene

---

## 🧭 Pathfinding Algorithm — Dijkstra's Algorithm

> **File:** `metro-guide/src/utils/pathfinding.ts`
> **Also in:** `backend/app/services/journey_service.py`

The **client-side route planner** uses a custom implementation of [Dijkstra's Shortest Path Algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm), optimized for metro graph traversal.

### How It Works

```
1. Build a weighted graph where nodes = metro stations, edges = connected stations
2. Initialize all node distances to Infinity, except source = 0
3. Repeatedly pick the unvisited node with the smallest distance
4. For each neighbor, compute edge weight:
     weight = haversineDistance(current, neighbor)   ← real-world km
             + linePenalty (0.5 km if crossing to a different line)
5. Relax the neighbor's distance if a shorter path is found
6. Stop when the destination node is reached or all nodes are exhausted
7. Back-track via `previous` pointers to reconstruct the optimal path
```

### Features

- **Line Interchange Penalty** — adds a `0.5 km` virtual weight when switching lines, so the algorithm naturally prefers staying on the same line over unnecessary transfers
- **Interchange Detection** — scans the reconstructed path for line changes and marks those stations as interchange points
- **Line Segment Grouping** — groups consecutive same-line stations into segments for step-by-step direction display
- **Time Estimation** — `estimatedTime = (totalDistance / 33 km/h) × 60 + (interchanges × 5 min)`
- **City-Agnostic** — accepts any `Record<string, Station>` graph, not just Pune

The same Dijkstra logic is also implemented server-side in `journey_service.py`, with results enriched by AI-generated summaries.

---

## 📐 Distance Calculation — Haversine Formula

> **Used in:** `metro-guide/src/data/metroData.ts`, `backend/app/services/journey_service.py`

The **Haversine formula** calculates the great-circle distance between two GPS coordinates on the Earth's surface — essential for:

- **Edge weights in Dijkstra** (real-world km between connected stations)
- **Nearest station detection** (finding the closest station to a user's dropped pin or geocoded location)
- **Walking time estimation** (distance from user location to boarding/alighting station)
- **Total journey distance** (summing up all inter-station distances along the route)

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
distance = 2 × R × atan2(√a, √(1−a))     where R = 6371 km
```

---

## 📍 Geocoding — Nominatim + Photon

> **File:** `metro-guide/src/utils/journeyApi.ts`

The journey planner features a **Google Maps-style multi-source location autocomplete** that combines three data sources in parallel:

| Source | Library / API | Role |
|---|---|---|
| **Local Station Index** | In-memory TypeScript object | Instant fuzzy name matching for metro stations (highest priority, zero latency) |
| **Photon** | [Komoot Photon API](https://photon.komoot.io) | OpenStreetMap-backed geocoding, bias-centered on Pune |
| **Nominatim** | [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org) | Structured address search, bounded to Pune region |

**Deduplication** — results from all three sources are merged, with a `0.001°` coordinate threshold to eliminate near-duplicate locations.
**Fallback search** — if fewer than 3 results are found for a multi-word query, a single-keyword fallback search is attempted using the most recognizable locality token.
**Reverse Geocoding** — converts dropped-pin coordinates back to a human-readable address via Nominatim.

---

## 🤖 AI Integration — Google Gemini

> **Package:** `google-genai@2.11`
> **Files:** `backend/app/services/gemini_service.py`, `backend/app/api/chat.py`

Metro Guide integrates the **Google Gemini API** (`google-genai` SDK) for two distinct AI-powered features:

### 1. AI Metro Chatbot (Streaming)

- **Endpoint:** `POST /chat/stream` (Server-Sent Events)
- **Frontend:** `src/components/ChatPanel.tsx` reads SSE token events and renders them progressively
- The chatbot is initialized with a **metro-domain system instruction** (`METRO_AI_SYSTEM_INSTRUCTION`) defining its persona, knowledge scope (Pune Metro), and response format
- **Streaming pipeline:** `gemini_service.get_stream_response()` → `yield chunk.text` → `EventSourceResponse` (SSE) → `ChatPanel` token-by-token rendering
- **Temperature:** 0.7 | **Max tokens:** 8192

### 2. AI Journey Summary

- After Dijkstra computes the route, Gemini generates a **natural-language journey summary** describing the route in a friendly, step-by-step way
- Uses a dedicated `JOURNEY_SUMMARY_PROMPT` injected as a system instruction
- Returned as the `ai_summary` field in the `JourneyResult` schema

---

## 🧠 Conversation Memory — PostgreSQL-Backed

> **Files:** `backend/app/memory/conversion.py`, `backend/app/db/models/`

The AI chatbot maintains **multi-turn conversation context** across page reloads using a PostgreSQL database (Supabase):

| Model | Table | Purpose |
|---|---|---|
| `ConversationSession` | `conversation_sessions` | Groups messages by `session_id` |
| `ChatMessageLog` | `chat_messages` | Stores each `role` (user/model) + `content` pair |

**`ConversationMemory`** utility:

- `get_gemini_history(db, session_id)` — retrieves past messages and formats them as `google.genai.types.Content` objects for multi-turn input
- `add_message(db, session_id, role, content)` — persists each exchange after completion
- `delete_session(db, session_id)` — clears history (triggered by the "Clear Chat" button in the UI)

---

## 🚶 Journey Service — Server-Side Route Engine

> **File:** `backend/app/services/journey_service.py`

The backend journey service provides a complete, end-to-end trip computation:

```
POST /api/journey/plan  →  JourneyResult
```

**Pipeline:**

1. **Station Preloading** — on app startup, station data is loaded from PostgreSQL (Supabase) into an in-memory cache (`_station_cache`) for fast subsequent lookups
2. **Nearest Station Detection** — Haversine scan over all stations to find closest boarding and alighting points to the user's source/destination coordinates
3. **Dijkstra Graph Traversal** — server-side shortest path with interchange penalties (matches the client-side implementation for consistency)
4. **Walking Segment Estimation** — calculates walking distance and time from user location to metro station using Haversine + optional [OpenRouteService](https://openrouteservice.org) API for actual walking paths
5. **Travel Mode Options** — generates alternative mode suggestions (auto-rickshaw, cab, bus) with fare estimates for the first/last mile
6. **AI Summary** — Gemini generates a human-friendly narrative of the computed journey
7. **Route Coordinates** — extracts the GeoJSON line coordinate array for the map to highlight the active route

---

## 🌐 REST API — FastAPI

> **Package:** `fastapi@0.139`, `uvicorn@0.51`

The backend is a fully async **FastAPI** application with the following endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check — `"Metro AI Backend Running 🚇"` |
| `GET` | `/health` | Detailed service health status |
| `POST` | `/chat` | Single-turn Gemini AI response |
| `POST` | `/chat/stream` | Streaming SSE chat (Server-Sent Events) |
| `DELETE` | `/chat/history/{session_id}` | Clear conversation history |
| `POST` | `/api/journey/plan` | Full journey planning with AI summary |

**Middleware:** CORS fully open (`*`) for local development. Swap to origin-specific in production.

---

## 🎬 UI Animations — Framer Motion

> **Package:** `framer-motion@12.42`
> **Used in:** `metro-guide/src/App.tsx`, `LoadingScreen.tsx`, `ChatPanel.tsx`

[Framer Motion](https://www.framer.com/motion/) drives all UI state transitions:

- **Loading screen** — animated intro sequence with `AnimatePresence` that plays once and unmounts cleanly
- **Panel enter/exit** — slide-in / fade-out for station detail cards, chat panel, and route summary cards
- **Staggered list items** — station list and journey step items animate in with staggered delays

---

## 🧩 UI Icons — Lucide React

> **Package:** `lucide-react@1.24`

All iconography across the application comes from [Lucide React](https://lucide.dev) — a clean, consistent open-source icon library:

- Navigation icons: `Train`, `Navigation`, `ListFilter`, `MapPin`
- Action icons: `Search`, `X`, `ChevronDown`, `Settings`, `Maximize`
- Informational icons: `Clock`, `Zap`, `ArrowRight`, `AlertCircle`

---

## 🗄️ Database — SQLAlchemy + PostgreSQL (Supabase)

> **Packages:** `SQLAlchemy@2.0`, `psycopg2-binary@2.9`

- **ORM:** SQLAlchemy 2.0 with synchronous sessions via `engine.connect()`
- **Provider:** [Supabase](https://supabase.com) PostgreSQL instance (configured via `DATABASE_URL` env var)
- **Tables:**
  - `metro_stations` — station records (id, name, line, latitude, longitude, facilities, connected_stations, city)
  - `metro_connections` — adjacency list for the station graph
  - `conversation_sessions` — chat session metadata
  - `chat_messages` — individual chat message logs

---

## ⚡ Build & Dev Toolchain

| Tool | Role |
|---|---|
| **Vite 8** | Ultra-fast HMR dev server + ESM-native production build |
| **TypeScript 6** | Full static typing across the entire frontend codebase |
| **ESLint 10** | Code quality with React Hooks + Refresh plugins |
| **Tailwind CSS 4** | Utility-class styling with Vite plugin integration |
| **Docker / docker-compose** | Backend containerization for production deployment |
| **python-dotenv** | Environment variable management for local dev |
| **Pydantic v2** | Request/response schema validation in FastAPI |
| **Tenacity** | Retry logic for external API calls (Gemini, geocoding) |
| **SSE-Starlette** | Server-Sent Events support for streaming chat responses |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- Python 3.11+
- A Google Gemini API key
- A Supabase PostgreSQL database (or any PostgreSQL instance)

### Frontend Setup

```bash
cd metro-guide
npm install
# Create .env and set:
# VITE_API_URL=http://localhost:8000
npm run dev                   # → http://localhost:5173
```

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate         # Windows
# source venv/bin/activate    # macOS/Linux
pip install -r requirements.txt
# Create .env (see Environment Variables below)
uvicorn app.main:app --reload --port 8000
```

### Environment Variables

**`backend/.env`**

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
DATABASE_URL=postgresql://user:password@host:port/dbname
APP_NAME=Metro Guide AI
APP_VERSION=1.0.0
```

**`metro-guide/.env`**

```env
VITE_API_URL=http://localhost:8000
```

---

## 📁 Project Structure

```
Metro Guide/
│
├── metro-guide/                        ← Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── MetroMap.tsx            ← MapLibre GL map + Three.js layer integration
│   │   │   ├── ThreeLayer.ts           ← Three.js 3D metro infrastructure renderer
│   │   │   ├── JourneyPlanner.tsx      ← Route planner UI (source → dest → results)
│   │   │   ├── ChatPanel.tsx           ← Gemini AI streaming chat interface
│   │   │   ├── StationPanel.tsx        ← Searchable station list sidebar
│   │   │   ├── StationDetail.tsx       ← Station info card (facilities, connections)
│   │   │   ├── CitySelector.tsx        ← City switching dropdown
│   │   │   ├── MapStyleSwitcher.tsx    ← Dark / Light / Satellite / Street tile toggle
│   │   │   ├── SettingsPanel.tsx       ← 3D scene settings (viaducts, halos, neon)
│   │   │   ├── MapControls.tsx         ← Zoom, compass, fullscreen controls
│   │   │   ├── Header.tsx              ← App header with city branding
│   │   │   ├── LoadingScreen.tsx       ← Animated intro loading screen
│   │   │   └── FormattedMessage.tsx    ← Markdown-style chat message renderer
│   │   │
│   │   ├── data/
│   │   │   ├── metroData.ts            ← Pune station graph, line colors, route coords
│   │   │   └── cityData.ts             ← City config registry (city-agnostic interface)
│   │   │
│   │   └── utils/
│   │       ├── pathfinding.ts          ← Dijkstra's algorithm (client-side)
│   │       ├── journeyApi.ts           ← Geocoding (Photon + Nominatim) + Journey API
│   │       └── mapStyles.ts            ← Scene settings defaults + map style configs
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                            ← Backend (Python FastAPI)
    ├── app/
    │   ├── api/
    │   │   ├── chat.py                 ← /chat + /chat/stream SSE endpoint
    │   │   ├── journey.py              ← /api/journey/plan endpoint
    │   │   └── health.py               ← /health endpoint
    │   │
    │   ├── services/
    │   │   ├── gemini_service.py       ← Google Gemini SDK wrapper (stream + generate)
    │   │   └── journey_service.py      ← Dijkstra + Haversine + AI summary pipeline
    │   │
    │   ├── db/
    │   │   ├── database.py             ← SQLAlchemy engine + session factory
    │   │   └── models/                 ← ConversationSession, ChatMessageLog ORM models
    │   │
    │   ├── memory/
    │   │   └── conversion.py           ← ConversationMemory (persist/retrieve chat history)
    │   │
    │   ├── rag/
    │   │   ├── embeddings.py           ← Text embedding generation (for RAG pipeline)
    │   │   └── vector_store.py         ← Vector store interface for semantic retrieval
    │   │
    │   ├── agents/
    │   │   ├── metro_agent.py          ← Metro domain AI agent
    │   │   ├── navigation_agent.py     ← Navigation-specific agent
    │   │   ├── map_agent.py            ← Map context agent
    │   │   ├── voice_agent.py          ← Voice interaction agent
    │   │   └── orchestrator.py         ← Multi-agent orchestration layer
    │   │
    │   ├── schemas/                    ← Pydantic models (ChatRequest, JourneyResult…)
    │   └── core/
    │       ├── config.py               ← App settings (env vars via pydantic-settings)
    │       └── prompts.py              ← System prompts for Gemini AI
    │
    ├── requirements.txt
    ├── Dockerfile
    └── docker-compose.yml
```

---

## 🛣️ Roadmap

- [ ] 🏙️ Multi-city support (Mumbai, Bengaluru, Hyderabad, Delhi Metro networks)
- [ ] 🔊 Voice-based journey planning (Voice Agent integration)
- [ ] 📡 Real-time train tracking with live ETA
- [ ] 🗣️ RAG-powered chatbot with embedded metro handbook / FAQ corpus
- [ ] 🎟️ Smart Card / QR ticket integration
- [ ] 🌙 Offline-first PWA mode with cached station data

---

## 📄 License

This project is open for personal and educational use. Contact the maintainer for commercial licensing.

---

<div align="center">

**Built with ❤️ for Pune Metro commuters**

*MapLibre GL · Three.js · Dijkstra · Haversine · Google Gemini · FastAPI · React · TypeScript*

</div>
