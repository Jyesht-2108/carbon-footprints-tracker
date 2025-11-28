"""WebSocket manager for real-time updates."""
import socketio
from typing import Dict, Any
from ..utils.logger import logger

# Create Socket.IO server with permissive settings
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=False,
    engineio_logger=False,
    ping_timeout=60,
    ping_interval=25,
    always_connect=True,
    allow_upgrades=True,
    http_compression=True,
    compression_threshold=1024
)


# Setup event handlers immediately
@sio.event
async def connect(sid, environ, auth=None):
    """Handle client connection."""
    logger.info(f"WebSocket client connected: {sid}")
    # Auto-subscribe to all channels
    await sio.enter_room(sid, 'hotspots')
    await sio.enter_room(sid, 'alerts')
    await sio.enter_room(sid, 'recommendations')
    await sio.enter_room(sid, 'emissions')
    logger.info(f"Client {sid} subscribed to all channels")
    return True  # Accept connection


@sio.event
async def disconnect(sid):
    """Handle client disconnection."""
    logger.info(f"WebSocket client disconnected: {sid}")


@sio.event
async def subscribe(sid, channel):
    """Subscribe to a channel."""
    await sio.enter_room(sid, channel)
    logger.info(f"Client {sid} subscribed to {channel}")


class WebSocketManager:
    """Manager for WebSocket connections and broadcasts."""
    
    def __init__(self):
        """Initialize WebSocket manager."""
        self.sio = sio
    
    async def emit_hotspot(self, hotspot: Dict[str, Any]):
        """Emit hotspot event."""
        try:
            # Emit both 'hotspot' (for backward compatibility) and 'new_hotspot' (for notifications)
            await self.sio.emit('hotspot', hotspot, room='hotspots')
            await self.sio.emit('new_hotspot', hotspot, room='hotspots')
            logger.info(f"Emitted hotspot notification: {hotspot.get('entity')} - {hotspot.get('severity')}")
        except Exception as e:
            logger.error(f"Error emitting hotspot: {e}")
    
    async def emit_alert(self, alert: Dict[str, Any]):
        """Emit alert event."""
        try:
            # Emit both 'alert' (for backward compatibility) and 'new_alert' (for notifications)
            await self.sio.emit('alert', alert, room='alerts')
            await self.sio.emit('new_alert', alert, room='alerts')
            logger.info(f"Emitted alert notification: {alert.get('level')} - {alert.get('message')}")
        except Exception as e:
            logger.error(f"Error emitting alert: {e}")
    
    async def emit_recommendation(self, recommendation: Dict[str, Any]):
        """Emit recommendation event."""
        try:
            await self.sio.emit('recommendation', recommendation, room='recommendations')
            logger.debug(f"Emitted recommendation: {recommendation.get('id')}")
        except Exception as e:
            logger.error(f"Error emitting recommendation: {e}")
    
    async def emit_emissions_update(self, data: Dict[str, Any]):
        """Emit emissions update."""
        try:
            await self.sio.emit('emissions', data, room='emissions')
            logger.debug("Emitted emissions update")
        except Exception as e:
            logger.error(f"Error emitting emissions: {e}")


# Singleton instance
ws_manager = WebSocketManager()
