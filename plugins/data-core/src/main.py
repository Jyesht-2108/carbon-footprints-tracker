from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router
from src.utils.config import settings
from src.utils.logger import logger
import uvicorn


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Data Core service starting up...")
    logger.info(f"API running on {settings.api_host}:{settings.api_port}")
    yield
    # Shutdown
    logger.info("Data Core service shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Carbon Nexus - Data Core",
    description="Data ingestion, normalization, and quality management service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api/v1", tags=["data-core"])


if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )
