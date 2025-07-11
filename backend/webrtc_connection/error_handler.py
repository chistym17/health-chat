import asyncio
import logging
import time
from typing import Optional, Callable, Any
from functools import wraps
from enum import Enum

logger = logging.getLogger(__name__)

class ErrorSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class WebRTCError(Exception):
    """Base exception for WebRTC errors"""
    def __init__(self, message: str, severity: ErrorSeverity = ErrorSeverity.MEDIUM):
        super().__init__(message)
        self.severity = severity
        self.timestamp = time.time()

class AudioProcessingError(WebRTCError):
    """Error during audio processing"""
    pass

class ConnectionError(WebRTCError):
    """Error during connection handling"""
    pass

class PipelineError(WebRTCError):
    """Error during AI pipeline processing"""
    pass

class ErrorHandler:
    """
    Comprehensive error handling for WebRTC connections
    """
    def __init__(self, max_retries: int = 3, retry_delay: float = 1.0):
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.error_counts = {}
        self._lock = asyncio.Lock()
        
    async def handle_audio_error(self, error: Exception, context: str = "") -> bool:
        """Handle audio processing errors"""
        error_key = f"audio_{context}"
        
        async with self._lock:
            self.error_counts[error_key] = self.error_counts.get(error_key, 0) + 1
            count = self.error_counts[error_key]
        
        if count <= self.max_retries:
            logger.warning(f"Audio error in {context} (attempt {count}/{self.max_retries}): {error}")
            await asyncio.sleep(self.retry_delay * count)  # Exponential backoff
            return True  # Retry
        else:
            logger.error(f"Audio error in {context} exceeded max retries: {error}")
            return False  # Give up
    
    async def handle_connection_error(self, error: Exception, conn_id: str) -> bool:
        """Handle connection-related errors"""
        error_key = f"connection_{conn_id}"
        
        async with self._lock:
            self.error_counts[error_key] = self.error_counts.get(error_key, 0) + 1
            count = self.error_counts[error_key]
        
        if count <= self.max_retries:
            logger.warning(f"Connection error for {conn_id} (attempt {count}/{self.max_retries}): {error}")
            await asyncio.sleep(self.retry_delay * count)
            return True
        else:
            logger.error(f"Connection error for {conn_id} exceeded max retries: {error}")
            return False
    
    async def handle_pipeline_error(self, error: Exception, context: str = "") -> bool:
        """Handle AI pipeline errors"""
        error_key = f"pipeline_{context}"
        
        async with self._lock:
            self.error_counts[error_key] = self.error_counts.get(error_key, 0) + 1
            count = self.error_counts[error_key]
        
        if count <= self.max_retries:
            logger.warning(f"Pipeline error in {context} (attempt {count}/{self.max_retries}): {error}")
            await asyncio.sleep(self.retry_delay * count)
            return True
        else:
            logger.error(f"Pipeline error in {context} exceeded max retries: {error}")
            return False
    
    async def reset_error_count(self, error_key: str):
        """Reset error count for a specific error type"""
        async with self._lock:
            self.error_counts[error_key] = 0
    
    async def get_error_stats(self) -> dict:
        """Get error statistics"""
        async with self._lock:
            return self.error_counts.copy()

def with_error_handling(error_handler: ErrorHandler, error_type: str = "general"):
    """
    Decorator for adding error handling to async functions
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                if error_type == "audio":
                    should_retry = await error_handler.handle_audio_error(e, func.__name__)
                elif error_type == "connection":
                    should_retry = await error_handler.handle_connection_error(e, str(args[0]) if args else "")
                elif error_type == "pipeline":
                    should_retry = await error_handler.handle_pipeline_error(e, func.__name__)
                else:
                    logger.error(f"Unhandled error in {func.__name__}: {e}")
                    should_retry = False
                
                if should_retry:
                    # Retry the function
                    return await wrapper(*args, **kwargs)
                else:
                    # Re-raise the error
                    raise
        return wrapper
    return decorator

class GracefulDegradation:
    """
    Handles graceful degradation when services are unavailable
    """
    def __init__(self):
        self.fallback_mode = False
        self.service_status = {
            "audio_processing": True,
            "ai_pipeline": True,
            "tts": True
        }
    
    async def check_service_health(self, service: str) -> bool:
        """Check if a service is healthy"""
        return self.service_status.get(service, True)
    
    async def set_service_status(self, service: str, status: bool):
        """Set service status"""
        self.service_status[service] = status
        if not status:
            logger.warning(f"Service {service} marked as unavailable")
    
    async def should_use_fallback(self) -> bool:
        """Determine if fallback mode should be used"""
        return not all(self.service_status.values())
    
    async def get_fallback_response(self, user_input: str) -> str:
        """Get a fallback response when AI pipeline is unavailable"""
        return "I'm experiencing some technical difficulties right now. Please try again in a moment or use the text chat option for now."

class CircuitBreaker:
    """
    Circuit breaker pattern for preventing cascading failures
    """
    def __init__(self, failure_threshold: int = 5, recovery_timeout: float = 60.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = 0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
        
    async def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker protection"""
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF_OPEN"
                logger.info("Circuit breaker transitioning to HALF_OPEN")
            else:
                raise WebRTCError("Circuit breaker is OPEN", ErrorSeverity.HIGH)
        
        try:
            result = await func(*args, **kwargs)
            if self.state == "HALF_OPEN":
                self.state = "CLOSED"
                self.failure_count = 0
                logger.info("Circuit breaker reset to CLOSED")
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            if self.failure_count >= self.failure_threshold:
                self.state = "OPEN"
                logger.error(f"Circuit breaker opened after {self.failure_count} failures")
            
            raise e
    
    @property
    def is_open(self) -> bool:
        return self.state == "OPEN"
    
    @property
    def is_closed(self) -> bool:
        return self.state == "CLOSED" 