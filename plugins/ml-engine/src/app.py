from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys

from .api.routes import router
from .api.batch_routes import router as batch_router
from .api.insights_routes import router as insights_router

# Configure logger
logger.remove()
logger.add(sys.stdout, level="INFO")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("ML Engine starting up...")
    logger.info("All models initialized")
    yield
    # Shutdown
    logger.info("ML Engine shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Carbon Nexus ML Engine",
    description="ML inference service for CO2 emission predictions and forecasting",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api/v1")
app.include_router(batch_router, prefix="/api/v1")
app.include_router(insights_router, prefix="/api/v1/insights", tags=["insights"])

@app.get("/")
async def root():
    return {
        "service": "Carbon Nexus ML Engine",
        "version": "1.0.0",
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
