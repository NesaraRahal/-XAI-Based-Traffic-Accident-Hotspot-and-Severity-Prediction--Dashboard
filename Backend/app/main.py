from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.connection import connect_to_mongo, close_mongo_connection
from app.routes import cells, hotspots, severity, xai


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="Colombo Accident Hotspot Prediction API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,  # localhost by default; CORS_ORIGINS when deployed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cells.router)
app.include_router(hotspots.router)
app.include_router(severity.router)
app.include_router(xai.router)


@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok"}