import psutil
import os
from datetime import datetime
from utils.response_utils import format_response, format_error_response
from models.candidate_matcher import CandidateMatcher
from config.settings import AppConfig


class HealthController:
    """
    Controller for health monitoring endpoints
    Similar to your Node.js controllers but focused on AI service health
    """

    def __init__(self):
        self.matcher = CandidateMatcher()
        self.config = AppConfig()

    def check_health(self):
        """
        Basic health check - returns service status
        This is like a heartbeat to confirm the AI server is responding
        """
        try:
            # Get system information for monitoring
            memory_usage = psutil.virtual_memory().percent
            cpu_usage = psutil.cpu_percent(interval=1)

            health_data = {
                "status": "healthy",
                "service": "OptaHire AI Server",
                "version": self.config.MODEL_VERSION,
                "uptime": self._get_uptime(),
                "environment": self.config.FLASK_ENV,
                "debug_mode": self.config.DEBUG,
                "system": {
                    "memory_usage_percent": memory_usage,
                    "cpu_usage_percent": cpu_usage,
                    "available_memory_gb": round(
                        psutil.virtual_memory().available / (1024**3), 2
                    ),
                },
            }

            return format_response(
                success=True,
                message="AI service is healthy and operational",
                data=health_data,
            )

        except Exception as e:
            return format_error_response(
                message=f"Health check failed: {str(e)}",
                status_code=503,
                error_code="HEALTH_CHECK_FAILED",
            )

    def check_ai_status(self):
        """
        Detailed AI model status check
        This provides information about whether the AI model is trained and ready
        """
        try:
            ai_status = {
                "model_trained": self.matcher.is_trained,
                "model_version": self.config.MODEL_VERSION,
                "last_training": self._get_last_training_time(),
                "capabilities": {
                    "skills_matching": True,
                    "experience_analysis": True,
                    "education_scoring": True,
                    "industry_matching": True,
                    "text_similarity": True,
                },
                "performance": {
                    "max_candidates_per_request": self.config.MAX_CANDIDATES,
                    "min_similarity_threshold": self.config.MIN_SIMILARITY,
                    "rate_limit_per_minute": self.config.RATE_LIMIT_PER_MINUTE,
                    "caching_enabled": self.config.ENABLE_CACHING,
                },
                "scoring_weights": {
                    "skills": self.config.WEIGHT_SKILLS,
                    "experience": self.config.WEIGHT_EXPERIENCE,
                    "education": self.config.WEIGHT_EDUCATION,
                    "industry": self.config.WEIGHT_INDUSTRY,
                    "text_similarity": self.config.WEIGHT_TEXT,
                },
            }

            if self.matcher.is_trained:
                message = "AI model is trained and ready for candidate shortlisting"
                status_code = 200
            else:
                message = "AI model needs training before it can shortlist candidates"
                status_code = 200  # Still healthy, just needs training

            return format_response(success=True, message=message, data=ai_status)

        except Exception as e:
            return format_error_response(
                message=f"AI status check failed: {str(e)}",
                status_code=500,
                error_code="AI_STATUS_CHECK_FAILED",
            )

    def _get_uptime(self):
        """Calculate service uptime for monitoring"""
        try:
            # Simple uptime calculation based on process start time
            return (
                "Service operational"  # You can implement more detailed uptime tracking
            )
        except:
            return "Unknown"

    def _get_last_training_time(self):
        """Get timestamp of last model training"""
        try:
            model_path = os.path.join(
                self.config.MODEL_STORAGE_PATH, "text_vectorizer.pkl"
            )
            if os.path.exists(model_path):
                timestamp = os.path.getmtime(model_path)
                return datetime.fromtimestamp(timestamp).isoformat()
            return None
        except:
            return None
