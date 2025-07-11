import asyncio
import logging
import time
from typing import Dict, Set, Optional
from aiortc import RTCPeerConnection
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class ConnectionState(Enum):
    CONNECTING = "connecting"
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"

@dataclass
class ConnectionInfo:
    """Information about a WebRTC connection"""
    pc: RTCPeerConnection
    state: ConnectionState
    created_at: float
    last_activity: float
    user_agent: Optional[str] = None
    error_count: int = 0

class ConnectionManager:
    """
    Manages WebRTC peer connections with proper state tracking and cleanup
    """
    def __init__(self, max_connections: int = 10, connection_timeout: int = 300):
        self.max_connections = max_connections
        self.connection_timeout = connection_timeout  
        self.connections: Dict[str, ConnectionInfo] = {}
        self._lock = asyncio.Lock()
        self._cleanup_task: Optional[asyncio.Task] = None
        self._stopped = False
        
    async def start(self):
        """Start the connection manager"""
        if self._cleanup_task is None:
            self._cleanup_task = asyncio.create_task(self._cleanup_loop())
            logger.info("Connection manager started")
    
    async def stop(self):
        """Stop the connection manager and cleanup all connections"""
        self._stopped = True
        
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass
        
        async with self._lock:
            for conn_id, conn_info in list(self.connections.items()):
                await self._close_connection(conn_id, conn_info)
        
        logger.info("Connection manager stopped")
    
    async def add_connection(self, pc: RTCPeerConnection, user_agent: Optional[str] = None) -> str:
        """Add a new connection to the manager"""
        async with self._lock:
            if len(self.connections) >= self.max_connections:
                oldest_id = min(self.connections.keys(), 
                              key=lambda x: self.connections[x].created_at)
                await self._close_connection(oldest_id, self.connections[oldest_id])
                logger.warning(f"Max connections reached, closed oldest connection: {oldest_id}")
            
            conn_id = f"conn_{int(time.time() * 1000)}"
            conn_info = ConnectionInfo(
                pc=pc,
                state=ConnectionState.CONNECTING,
                created_at=time.time(),
                last_activity=time.time(),
                user_agent=user_agent
            )
            
            self.connections[conn_id] = conn_info
            
            pc.on("connectionstatechange")(lambda: self._on_connection_state_change(conn_id, pc))
            pc.on("iceconnectionstatechange")(lambda: self._on_ice_state_change(conn_id, pc))
            
            logger.info(f"Added new connection: {conn_id}")
            return conn_id
    
    async def update_connection_state(self, conn_id: str, state: ConnectionState):
        """Update connection state"""
        async with self._lock:
            if conn_id in self.connections:
                self.connections[conn_id].state = state
                self.connections[conn_id].last_activity = time.time()
                logger.info(f"Connection {conn_id} state changed to: {state.value}")
    
    async def remove_connection(self, conn_id: str):
        """Remove a connection from the manager"""
        async with self._lock:
            if conn_id in self.connections:
                await self._close_connection(conn_id, self.connections[conn_id])
                logger.info(f"Removed connection: {conn_id}")
    
    async def get_connection_info(self, conn_id: str) -> Optional[ConnectionInfo]:
        """Get connection information"""
        async with self._lock:
            return self.connections.get(conn_id)
    
    async def get_active_connections(self) -> Dict[str, ConnectionInfo]:
        """Get all active connections"""
        async with self._lock:
            return {k: v for k, v in self.connections.items() 
                   if v.state == ConnectionState.CONNECTED}
    
    async def _close_connection(self, conn_id: str, conn_info: ConnectionInfo):
        """Close a connection and cleanup resources"""
        try:
            await conn_info.pc.close()
            del self.connections[conn_id]
            logger.info(f"Closed connection: {conn_id}")
        except Exception as e:
            logger.error(f"Error closing connection {conn_id}: {e}")
    
    async def _on_connection_state_change(self, conn_id: str, pc: RTCPeerConnection):
        """Handle connection state changes"""
        state_map = {
            "new": ConnectionState.CONNECTING,
            "connecting": ConnectionState.CONNECTING,
            "connected": ConnectionState.CONNECTED,
            "disconnected": ConnectionState.DISCONNECTED,
            "failed": ConnectionState.ERROR,
            "closed": ConnectionState.DISCONNECTED
        }
        
        new_state = state_map.get(pc.connectionState, ConnectionState.ERROR)
        await self.update_connection_state(conn_id, new_state)
        
        if new_state in [ConnectionState.ERROR, ConnectionState.DISCONNECTED]:
            asyncio.create_task(self._delayed_remove_connection(conn_id))
    
    async def _on_ice_state_change(self, conn_id: str, pc: RTCPeerConnection):
        """Handle ICE connection state changes"""
        if pc.iceConnectionState == "failed":
            conn_info = await self.get_connection_info(conn_id)
            if conn_info:
                conn_info.error_count += 1
                if conn_info.error_count >= 3:
                    await self.remove_connection(conn_id)
                    logger.warning(f"Connection {conn_id} failed too many times, removed")
    
    async def _delayed_remove_connection(self, conn_id: str, delay: float = 5.0):
        """Remove connection after a delay"""
        await asyncio.sleep(delay)
        await self.remove_connection(conn_id)
    
    async def _cleanup_loop(self):
        """Periodic cleanup of stale connections"""
        while not self._stopped:
            try:
                current_time = time.time()
                async with self._lock:
                    stale_connections = [
                        conn_id for conn_id, conn_info in self.connections.items()
                        if current_time - conn_info.last_activity > self.connection_timeout
                    ]
                
                for conn_id in stale_connections:
                    await self.remove_connection(conn_id)
                    logger.info(f"Removed stale connection: {conn_id}")
                
                await asyncio.sleep(30)  
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in cleanup loop: {e}")
                await asyncio.sleep(30)
    
    @property
    def connection_count(self) -> int:
        """Get current connection count"""
        return len(self.connections)
    
    @property
    def active_connection_count(self) -> int:
        """Get count of active connections"""
        return len([c for c in self.connections.values() 
                   if c.state == ConnectionState.CONNECTED]) 