const { StatusCodes } = require('http-status-codes');

const notFoundHandler = (req, res) => {
  const err = new Error(`Route not found - ${req.method}: ${req.originalUrl}`);
  console.error(`404 Error: ${err.message}`);
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: err.message,
    timestamp: new Date().toISOString(),
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  console.error(`Error ${statusCode}: ${message}`);
  if (err.stack) console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.code && { errorCode: err.code }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
