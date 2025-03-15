const { StatusCodes } = require('http-status-codes');

const notFoundHandler = (req, res) => {
  const err = new Error(`The requested resource could not be found.`);

  console.error(`404 Error: ${req.method}: ${req.originalUrl}`);

  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: err.message,
    timestamp: new Date().toISOString(),
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message =
    err.message || 'Something went wrong. Please try again later.';

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
