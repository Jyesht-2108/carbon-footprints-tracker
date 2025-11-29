"""Main FastAPI application for Orchestration Engine."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
from .utils.config import settings
from .utils.logger import logger
from .api import routes_dashboard, routes_hotspots, routes_recommendations, routes_simulation, routes_alerts, routes_data_quality
from .services.scheduler import scheduler
from .services.websocket_manager import sio
from .services.hotspot_engine import hotspot_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    # Startup
    logger.info("Starting Orchestration Engine...")
    logger.info(f"ML Engine URL: {settings.ml_engine_url}")
    logger.info(f"Data Core URL: {settings.data_core_url}")
    logger.info(f"RAG Service URL: {settings.rag_service_url}")
    
    # Start scheduler
    scheduler.start()
    logger.info("Scheduler started")
    logger.info("WebSocket server ready")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Orchestration Engine...")
    scheduler.shutdown()
    logger.info("Scheduler stopped")


# Create FastAPI app
app = FastAPI(
    title="Carbon Nexus Orchestration Engine",
    description="Central orchestration hub for Carbon Nexus platform",
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

# Include routers
app.include_router(routes_dashboard.router)
app.include_router(routes_hotspots.router)
app.include_router(routes_recommendations.router)
app.include_router(routes_simulation.router)
app.include_router(routes_alerts.router)
app.include_router(routes_data_quality.router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "orchestration-engine",
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Carbon Nexus Orchestration Engine",
        "version": "1.0.0",
        "websocket": "Socket.IO enabled at /socket.io",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "emissions": "/emissions/*",
            "hotspots": "/hotspots/*",
            "recommendations": "/recommendations/*",
            "simulate": "/simulate",
            "alerts": "/alerts/*",
            "trigger-analysis": "/trigger-analysis"
        }
    }


@app.post("/trigger-analysis")
async def trigger_immediate_analysis():
    """
    Trigger immediate hotspot detection and prediction.
    Called automatically after CSV upload.
    Processes up to 200 recent events.
    """
    try:
        logger.info("🚀 Immediate analysis triggered by CSV upload")
        
        # Run hotspot detection immediately with higher limit
        hotspots = await hotspot_engine.scan_for_hotspots(limit=200)
        
        logger.info(f"✅ Immediate analysis complete. Found {len(hotspots)} hotspots")
        
        # Emit WebSocket event to notify frontend to refresh dashboard
        try:
            from .services.websocket_manager import ws_manager
            await ws_manager.emit_emissions_update({
                "status": "analysis_complete",
                "hotspots_detected": len(hotspots),
                "timestamp": datetime.utcnow().isoformat()
            })
            logger.info("📡 Emitted emissions_update WebSocket event")
        except Exception as e:
            logger.error(f"Error emitting WebSocket event: {e}")
        
        return {
            "status": "success",
            "message": "Immediate analysis completed",
            "hotspots_detected": len(hotspots),
            "predictions_generated": len(hotspots),  # Each hotspot has a prediction
            "hotspots": hotspots[:10]  # Return first 10 for response size
        }
    
    except Exception as e:
        logger.error(f"❌ Error in immediate analysis: {e}")
        return {
            "status": "error",
            "message": str(e),
            "hotspots_detected": 0
        }


# Create combined ASGI app with Socket.IO
import socketio as socketio_module
final_app = socketio_module.ASGIApp(
    socketio_server=sio,
    other_asgi_app=app,
    socketio_path='socket.io'
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:final_app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
        log_level=settings.log_level.lower()
    )
