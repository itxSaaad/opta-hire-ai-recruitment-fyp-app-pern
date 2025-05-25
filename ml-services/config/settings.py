import os
from pathlib import Path
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


class AppConfig:
    """Centralized configuration management with production optimizations"""

    def __init__(self):
        # Environment Configuration
        self.FLASK_ENV = os.getenv("FLASK_ENV", "production")
        self.DEBUG = os.getenv("DEBUG", "false").lower() == "true"

        # Server Configuration - Important for Render
        self.HOST = os.getenv("HOST", "0.0.0.0")  # Must be 0.0.0.0 for Render
        self.PORT = self._validate_port()

        # External Services URLs with fallbacks
        if self.FLASK_ENV == "production":
            self.CLIENT_URL = os.getenv(
                "PROD_CLIENT_URL", "https://opta-hire-fyp-app-client.vercel.app"
            )
            self.NODE_SERVER_URL = os.getenv(
                "PROD_NODE_SERVER_URL",
                "https://opta-hire-fyp-app-server-4ca9bd7992ab.herokuapp.com",
            )
        else:
            self.CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:5173")
            self.NODE_SERVER_URL = os.getenv("NODE_SERVER_URL", "http://localhost:5000")

        # CORS Configuration
        self.CORS_ORIGINS = self._parse_cors_origins()

        # AI Model Configuration
        self.MODEL_VERSION = os.getenv("MODEL_VERSION", "1.0.0")
        self.MAX_CANDIDATES = int(os.getenv("MAX_CANDIDATES", 5))
        self.MIN_SIMILARITY = float(os.getenv("MIN_SIMILARITY", 0.3))
        self.MODEL_STORAGE_PATH = os.getenv("MODEL_STORAGE_PATH", "data/models")

        # Scoring Weights
        self.WEIGHT_SKILLS = float(os.getenv("WEIGHT_SKILLS", 0.40))
        self.WEIGHT_EXPERIENCE = float(os.getenv("WEIGHT_EXPERIENCE", 0.30))
        self.WEIGHT_EDUCATION = float(os.getenv("WEIGHT_EDUCATION", 0.15))
        self.WEIGHT_INDUSTRY = float(os.getenv("WEIGHT_INDUSTRY", 0.10))
        self.WEIGHT_TEXT = float(os.getenv("WEIGHT_TEXT", 0.05))

        # Performance Settings - Optimized for free tier
        self.ENABLE_CACHING = os.getenv("ENABLE_CACHING", "false").lower() == "true"
        self.RATE_LIMIT_PER_MINUTE = int(
            os.getenv("RATE_LIMIT_PER_MINUTE", 60)
        )  # Reduced for free tier
        self.RATE_LIMIT_STORAGE = os.getenv("RATE_LIMIT_STORAGE", "memory://")

        # Logging Configuration - Production optimized
        self.LOG_LEVEL = os.getenv(
            "LOG_LEVEL", "INFO" if self.FLASK_ENV == "production" else "DEBUG"
        )
        self.LOG_TO_FILE = os.getenv("LOG_TO_FILE", "false").lower() == "true"
        self.ENABLE_COLOR_LOGS = (
            os.getenv(
                "ENABLE_COLOR_LOGS",
                "false" if self.FLASK_ENV == "production" else "true",
            ).lower()
            == "true"
        )

        # Memory optimization for free tier
        self.MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max request size

        # Validate configuration after initialization
        self._validate_weights()

    def _validate_port(self):
        try:
            port = int(os.getenv("PORT", 10000))  # Render uses PORT env var
            if 1024 <= port <= 65535:
                return port
            else:
                logging.warning(f"Invalid port {port}, using default 10000")
                return 10000
        except ValueError:
            logging.warning("Invalid port value, using default 10000")
            return 10000

    def _parse_cors_origins(self):
        cors_env = os.getenv("CORS_ORIGIN", "")
        if cors_env:
            return cors_env.split(",")
        else:
            return [
                "https://opta-hire-fyp-app-client.vercel.app",
                "https://opta-hire-develop-client.vercel.app",
                "http://localhost:5173",
                "http://localhost:5000",
            ]

    def _validate_weights(self):
        """Validate that scoring weights sum to 1.0"""
        total_weight = (
            self.WEIGHT_SKILLS
            + self.WEIGHT_EXPERIENCE
            + self.WEIGHT_EDUCATION
            + self.WEIGHT_INDUSTRY
            + self.WEIGHT_TEXT
        )
        if abs(total_weight - 1.0) > 0.01:  # Allow small floating point errors
            raise ValueError(
                f"Scoring weights must sum to 1.0, current sum: {total_weight}"
            )
