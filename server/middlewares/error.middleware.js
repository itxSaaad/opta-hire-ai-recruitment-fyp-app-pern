const colors = require('colors');
const { StatusCodes } = require('http-status-codes');

const safeStringify = (obj) => {
  if (obj === undefined) return 'undefined';
  if (obj === null) return 'null';

  try {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular Reference]';
          }
          seen.add(value);

          if (value instanceof Error) {
            const errorObj = {};
            Object.getOwnPropertyNames(value).forEach((prop) => {
              errorObj[prop] = value[prop];
            });
            return errorObj;
          }

          if (value instanceof Date) {
            return value.toISOString();
          }
        }

        if (typeof value === 'function') {
          return `[Function: ${value.name || 'anonymous'}]`;
        }

        return value;
      },
      2
    );
  } catch (error) {
    return '[Complex Object: Could not stringify]';
  }
};

const notFoundHandler = (req, res) => {
  const err = new Error(`The requested resource could not be found.`);

  console.error('\n' + '='.repeat(86).red);
  console.error(`❌ 404 NOT FOUND`.bold.red);
  console.error('='.repeat(86).red);
  console.error(`🔍 Method:     ${req.method}`.cyan);
  console.error(`🌐 URL:        ${req.originalUrl}`.red);
  console.error(`⏰ Timestamp:  ${new Date().toLocaleString()}`.magenta);
  console.error('='.repeat(86).red);

  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: err.message,
    timestamp: new Date().toISOString(),
  });
};

const errorHandler = (err, req, res, next) => {
  const message =
    err.message || 'Something went wrong. Please try again later.';

  console.error('\n' + '='.repeat(86).red);
  console.error(`❌ SERVER ERROR`.bold.red);
  console.error('='.repeat(86).red);
  console.error(`📌 Error Type: ${err.name || 'Unknown Error'}`.red);
  console.error(`💬 Message:    ${message}`.red);
  console.error(`🔍 Method:     ${req.method}`.cyan);
  console.error(`🌐 Path:       ${req.originalUrl}`.cyan);
  console.error(`⏰ Timestamp:  ${new Date().toLocaleString()}`.magenta);

  if (process.env.NODE_ENV === 'development') {
    console.error('-'.repeat(86).red);
    console.error(`❓ Query:      ${safeStringify(req.query)}`.cyan);
    console.error(`🔢 Params:     ${safeStringify(req.params)}`.cyan);
    console.error(`📦 Body:       ${safeStringify(req.body)}`.cyan);
    console.error(`🍪 Cookies:    ${safeStringify(req.cookies)}`.cyan);
    console.error(`👤 User:       ${safeStringify(req.user)}`.cyan);
  }

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error('-'.repeat(86).red);
    console.error(`🔍 Stack Trace:`.red);
    console.error(err.stack.red);
  }

  console.error('='.repeat(86).red);

  res.json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.code && { errorCode: err.code }),
    ...(err.errors && { errors: err.errors }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
