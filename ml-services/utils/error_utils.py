import logging
from datetime import datetime, timezone

class AIModelError(Exception):
  """Custom exception for AI model related errors"""
  def __init__(self, message, error_code=None, details=None):
    self.message = message
    self.error_code = error_code
    self.details = details
    super().__init__(self.message)

class ValidationError(Exception):
  """Custom exception for validation errors"""
  def __init__(self, message, field=None):
    self.message = message
    self.field = field
    super().__init__(self.message)

def log_error(error, context=None):
  """
  Log errors with consistent formatting (similar to Node.js error logging)
  
  Args:
    error: Exception object
    context: Additional context information
  """
  timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
  
  logging.error('=' * 86)
  logging.error('❌ AI SERVER ERROR')
  logging.error('=' * 86)
  logging.error(f'📌 Error Type: {type(error).__name__}')
  logging.error(f'💬 Message:    {str(error)}')
  logging.error(f'⏰ Timestamp:  {timestamp}')
  
  if context:
    logging.error(f'🔍 Context:    {context}')
  
  if hasattr(error, 'error_code') and error.error_code:
    logging.error(f'🔢 Error Code: {error.error_code}')
  
  logging.error('=' * 86)