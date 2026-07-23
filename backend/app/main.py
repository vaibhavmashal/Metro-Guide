from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.api.health import router as health_router
from app.api.chat import router as chat_router
from app.api.journey import router as journey_router
from app.db.database import engine, Base
import app.db.models  # Register models

logger = logging.getLogger(__name__)


from app.services.journey_service import preload_stations


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
        # Preload stations and route graph from Supabase DB on startup
        preload_stations("pune")
    except Exception as e:
        logger.warning(f"Could not connect to PostgreSQL or initialize tables: {e}")
    yield



app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(chat_router, prefix="/api")
app.include_router(journey_router)
app.include_router(journey_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "Metro AI Backend Running 🚇"
    }