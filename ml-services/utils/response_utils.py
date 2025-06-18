from datetime import datetime, timezone
from flask import jsonify

def format_response(success=True, message="", data=None, status_code=200):
  """
  Create standardized API responses matching Node.js server format
  
  Args:
    success (bool): Whether the operation was successful
    message (str): Human-readable message
    data (dict): Response data payload
    status_code (int): HTTP status code
  
  Returns:
    Flask Response object with consistent formatting
  """
  response_data = {
    "success": success,
    "message": message,
    "timestamp": datetime.now(timezone.utc).isoformat()  # ISO format like Node.js
  }
  
  # Add data if provided (matching Node.js pattern)
  if data is not None:
    response_data.update(data)
  
  response = jsonify(response_data)
  response.status_code = status_code
  
  return response

def format_error_response(message="An error occurred", status_code=500, error_code=None, details=None):
  """
  Create standardized error responses matching Node.js server format
  
  Args:
    message (str): Error message
    status_code (int): HTTP status code
    error_code (str): Custom error code for client handling
    details (dict): Additional error details
  
  Returns:
    Flask Response object with error formatting
  """
  error_data = {
    "success": False,
    "message": message,
    "timestamp": datetime.now(timezone.utc).isoformat()
  }
  
  # Add optional fields (similar to Node.js error responses)
  if error_code:
    error_data["errorCode"] = error_code
  if details:
    error_data["details"] = details
  
  response = jsonify(error_data)
  response.status_code = status_code
  
  return response