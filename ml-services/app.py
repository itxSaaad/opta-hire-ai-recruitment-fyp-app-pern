import sys
from datetime import datetime, timezone
from flask import Flask, jsonify, request, Blueprint
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import colorlog
from werkzeug.middleware.proxy_fix import ProxyFix
from dotenv import load_dotenv
import psutil
import signal
import atexit
from colorama import Fore, Style, init

from config.settings import AppConfig

from middlewares.error_middleware import setup_error_handlers

from controllers.health_controller import HealthController
from controllers.model_controller import ModelController
from controllers.shortlist_controller import ShortlistController

# Load environment variables
load_dotenv()


def setup_logging(config):
    """Enhanced logging configuration with colors"""

    # Clear existing handlers
    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)

    # Create formatter based on color settings
    if config.ENABLE_COLOR_LOGS:
        formatter = colorlog.ColoredFormatter(
            "%(log_color)s%(asctime)s [%(levelname)8s] %(name)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
            log_colors={
                "DEBUG": "cyan",
                "INFO": "green",
                "WARNING": "yellow",
                "ERROR": "red",
                "CRITICAL": "red,bg_white",
            },
        )
    else:
        formatter = logging.Formatter(
            "%(asctime)s [%(levelname)8s] %(name)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    handlers = [console_handler]

    # Add file handler if enabled
    if config.LOG_TO_FILE:
        file_handler = logging.FileHandler("app.log")
        file_handler.setFormatter(formatter)
        handlers.append(file_handler)

    # Configure root logger
    level = getattr(logging, config.LOG_LEVEL, logging.INFO)
    logging.basicConfig(
        level=level,
        handlers=handlers,
    )

    # Suppress verbose third-party logs in production
    if not config.DEBUG:
        logging.getLogger("werkzeug").setLevel(logging.WARNING)
        logging.getLogger("urllib3").setLevel(logging.WARNING)


def log_system_info():
    """Log system information for monitoring"""
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage("/")

        logging.info("System Information:")
        logging.info(f"  CPU Usage: {cpu_percent}%")
        logging.info(
            f"  Memory Usage: {memory.percent}% ({memory.used // (1024**2)}MB / {memory.total // (1024**2)}MB)"
        )
        logging.info(
            f"  Disk Usage: {disk.percent}% ({disk.used // (1024**3)}GB / {disk.total // (1024**3)}GB)"
        )
        logging.info(f"  Python Version: {sys.version}")

    except Exception as e:
        logging.warning(f"Could not retrieve system info: {e}")


def create_app():
    app = Flask(__name__)
    config = AppConfig()

    # Enhanced configuration
    app.config.update(
        {
            "DEBUG": config.DEBUG,
            "JSON_SORT_KEYS": False,
            "JSONIFY_PRETTYPRINT_REGULAR": config.DEBUG,
            "MAX_CONTENT_LENGTH": 16 * 1024 * 1024,  # 16MB max request size
        }
    )

    # Setup enhanced logging
    setup_logging(config)

    # Log startup information
    logging.info("Initializing OptaHire AI Service...")
    log_system_info()

    # Trust proxy for rate limiting
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

    # Enhanced rate limiting using config
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=[f"{config.RATE_LIMIT_PER_MINUTE} per minute"],
        storage_uri=config.RATE_LIMIT_STORAGE,
        headers_enabled=True,
        strategy="fixed-window",
    )

    # Enhanced CORS configuration
    CORS(
        app,
        origins=config.CORS_ORIGINS,
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "X-Requested-With"],
        expose_headers=[
            "X-RateLimit-Limit",
            "X-RateLimit-Remaining",
            "X-RateLimit-Reset",
        ],
        max_age=3600,  # Cache preflight requests for 1 hour
    )

    # Request logging middleware
    @app.before_request
    def log_request_info():
        if app.config["DEBUG"]:
            logging.debug(f"Request: {request.method} {request.url}")

    @app.after_request
    def log_response_info(response):
        if app.config["DEBUG"]:
            logging.debug(f"Response: {response.status_code}")
        return response

    # Initialize controllers
    health_controller = HealthController()
    shortlist_controller = ShortlistController()
    model_controller = ModelController()

    # ===== HEALTH CONTROLLER ROUTES =====
    health_bp = Blueprint("health", __name__, url_prefix="/api/v1/health")

    @health_bp.route("/", methods=["GET"])
    @limiter.limit("60 per minute")
    def system_health():
        """Check overall system health"""
        return health_controller.check_health()

    @health_bp.route("/ai-service", methods=["GET"])
    @limiter.limit("30 per minute")
    def ai_service_status():
        """Check AI service specific health status"""
        return health_controller.check_ai_status()

    # ===== SHORTLIST CONTROLLER ROUTES =====
    shortlist_bp = Blueprint("shortlist", __name__, url_prefix="/api/v1/shortlist")

    @shortlist_bp.route("/candidates", methods=["POST"])
    @limiter.limit("10 per minute")
    def shortlist_candidates():
        """Shortlist top candidates for a job position"""
        logging.info("Processing candidate shortlisting request")
        return shortlist_controller.shortlist_candidates(request.get_json())

    @shortlist_bp.route("/preview", methods=["POST"])
    @limiter.limit("20 per minute")
    def preview_shortlist():
        """Preview shortlisting results without database updates"""
        logging.info("Processing shortlist preview request")
        return shortlist_controller.preview_shortlist(request.get_json())

    # ===== MODEL CONTROLLER ROUTES =====
    model_bp = Blueprint("model", __name__, url_prefix="/api/v1/model")

    @model_bp.route("/train", methods=["POST"])
    @limiter.limit("2 per hour")
    def train_model():
        """Train the AI model with historical recruitment data"""
        logging.info("Starting AI model training process")
        return model_controller.train_model(request.get_json())

    @model_bp.route("/status", methods=["GET"])
    @limiter.limit("30 per minute")
    def model_status():
        """Get current model training status and performance metrics"""
        return model_controller.get_model_status()

    @model_bp.route("/metrics", methods=["GET"])
    @limiter.limit("30 per minute")
    def model_metrics():
        """Get detailed model performance metrics"""
        return model_controller.get_model_metrics()

    # Register blueprints with app
    app.register_blueprint(health_bp)
    app.register_blueprint(shortlist_bp)
    app.register_blueprint(model_bp)

    # Register error handlers
    setup_error_handlers(app)

    # Enhanced root endpoint
    @app.route("/")
    @limiter.limit("60 per minute")
    def index():
        return (
            jsonify(
                {
                    "success": True,
                    "message": "AI Recruitment Server is running",
                    "service": "OptaHire AI Service",
                    "version": config.MODEL_VERSION,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "endpoints": {
                        "health": {
                            "system_health": "/api/v1/health/",
                            "ai_service_status": "/api/v1/health/ai-service",
                        },
                        "shortlist": {
                            "shortlist_candidates": "/api/v1/shortlist/candidates",
                            "preview_shortlist": "/api/v1/shortlist/preview",
                        },
                        "model": {
                            "train_model": "/api/v1/model/train",
                            "model_status": "/api/v1/model/status",
                            "model_metrics": "/api/v1/model/metrics",
                        },
                    },
                    "config": {
                        "max_candidates": config.MAX_CANDIDATES,
                        "min_similarity": config.MIN_SIMILARITY,
                        "flask_env": config.FLASK_ENV,
                    },
                }
            ),
            200,
        )

    logging.info("OptaHire AI Service initialized successfully")
    return app


def setup_signal_handlers():
    """Setup graceful shutdown handlers"""

    def signal_handler(signum, frame):
        logging.info(f"Received signal {signum}, shutting down gracefully...")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)


def cleanup():
    """Cleanup function called on exit"""
    logging.info("Application shutting down...")


# Initialize colorama for Windows compatibility
init(autoreset=True)


def start_server():
    app = create_app()
    config = AppConfig()

    # Setup graceful shutdown
    setup_signal_handlers()
    atexit.register(cleanup)

    try:
        print("\n" + Fore.YELLOW + "=" * 86)
        print(Fore.YELLOW + Style.BRIGHT + "🤖 AI SERVER STATUS")
        print(Fore.YELLOW + "=" * 86)
        print(
            Fore.GREEN
            + f"✅ Status:     AI Server is running and ready for ML operations."
        )
        print(Fore.CYAN + f"🔗 Port:       {config.PORT}")
        print(Fore.YELLOW + f"🌍 Flask ENV:  {config.FLASK_ENV}")
        print(
            Fore.MAGENTA
            + f'⏰ Timestamp:  {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}'
        )
        print(Fore.BLUE + f"💾 Memory:     {psutil.virtual_memory().percent}% used")
        print(Fore.BLUE + f"🖥️  CPU:       {psutil.cpu_percent(interval=1)}% used")
        print(Fore.YELLOW + f"📊 Model Ver:  {config.MODEL_VERSION}")
        print(Fore.YELLOW + f"🎯 Max Candidates: {config.MAX_CANDIDATES}")
        print(Fore.YELLOW + f"📈 Min Similarity: {config.MIN_SIMILARITY}")
        print(Fore.YELLOW + "-" * 86)
        print(Fore.CYAN + f"📍 Local URL:  http://{config.HOST}:{config.PORT}")
        print(Fore.MAGENTA + "🔗 API ENDPOINTS:")
        print(Fore.MAGENTA + f"   Health Check:      /api/v1/health/")
        print(Fore.MAGENTA + f"   AI Service Status: /api/v1/health/ai-service")
        print(Fore.MAGENTA + f"   Shortlist Candidates: /api/v1/shortlist/candidates")
        print(Fore.MAGENTA + f"   Preview Shortlist:    /api/v1/shortlist/preview")
        print(Fore.MAGENTA + f"   Train Model:       /api/v1/model/train")
        print(Fore.MAGENTA + f"   Model Status:      /api/v1/model/status")
        print(Fore.MAGENTA + f"   Model Metrics:     /api/v1/model/metrics")
        print(Fore.YELLOW + "=" * 86 + Style.RESET_ALL)

        app.run(
            host=config.HOST,
            port=config.PORT,
            debug=config.DEBUG,
            threaded=True,
            use_reloader=config.DEBUG,
        )

    except Exception as error:
        print("\n" + Fore.RED + "=" * 86)
        print(Fore.RED + Style.BRIGHT + "❌ AI SERVER STARTUP ERROR")
        print(Fore.RED + "=" * 86)
        print(Fore.RED + f"📌 Error Type: {type(error).__name__}")
        print(Fore.RED + f"💬 Message:    {str(error)}")
        print(
            Fore.RED + f'🕒 Time:       {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}'
        )
        print(Fore.RED + "=" * 86 + Style.RESET_ALL)
        logging.error(f"Server startup failed: {error}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    start_server()
