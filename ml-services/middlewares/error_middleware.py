import logging
from flask import request, current_app
from werkzeug.exceptions import HTTPException

from utils.response_utils import format_error_response
from utils.error_utils import log_error, AIModelError, ValidationError

def setup_error_handlers(app):
  """
  Setup global error handlers for the Flask app
  This provides consistent error responses matching your Node.js server
  """
  
  @app.errorhandler(ValidationError)
  def handle_validation_error(error):
    """Handle custom validation errors"""
    log_error(error, f"Validation failed for {request.path}")
    return format_error_response(
      message=error.message,
      status_code=400,
      error_code="VALIDATION_ERROR",
      details={"field": getattr(error, 'field', None)}
    )
  
  @app.errorhandler(AIModelError)
  def handle_ai_model_error(error):
    """Handle AI model specific errors"""
    log_error(error, f"AI model error in {request.path}")
    return format_error_response(
      message=error.message,
      status_code=500,
      error_code=error.error_code or "AI_MODEL_ERROR",
      details=error.details
    )
  
  @app.errorhandler(404)
  def handle_not_found(error):
    """Handle 404 errors (similar to your notFoundHandler)"""
    logging.warning(f"404 - Resource not found: {request.method} {request.path}")
    return format_error_response(
      message="The requested AI service endpoint could not be found",
      status_code=404,
      error_code="ENDPOINT_NOT_FOUND"
    )
  
  @app.errorhandler(405)
  def handle_method_not_allowed(error):
    """Handle method not allowed errors"""
    logging.warning(f"405 - Method not allowed: {request.method} {request.path}")
    return format_error_response(
      message=f"Method {request.method} not allowed for this endpoint",
      status_code=405,
      error_code="METHOD_NOT_ALLOWED"
    )
  
  @app.errorhandler(500)
  def handle_internal_error(error):
    """Handle internal server errors (similar to your errorHandler)"""
    log_error(error, f"Internal server error in {request.path}")
    return format_error_response(
      message="Internal AI server error. Please try again later.",
      status_code=500,
      error_code="INTERNAL_SERVER_ERROR"
    )
  
  @app.errorhandler(Exception)
  def handle_generic_exception(error):
    """
    Handle any unhandled exceptions (similar to your global error handler)
    This ensures no error goes unhandled and always returns consistent format
    """
    log_error(error, f"Unhandled exception in {request.path}")
    
    if current_app.config.get('FLASK_ENV') == 'development':
      details = {
        "path": request.path,
        "method": request.method,
        "error_type": type(error).__name__
      }
    else:
      details = None
    
    return format_error_response(
      message="An unexpected error occurred in the AI service",
      status_code=500,
      error_code="UNEXPECTED_ERROR",
      details=details
    )