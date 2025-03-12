const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

const { User } = require('../models');

const protectServer = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED);
      throw new Error('Not Authorized, No Token!');
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET || 'your-secret-key'
      );

      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!req.user) {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error('Not Authorized, User Not Found!');
      }

      next();
    } catch (error) {
      res.status(StatusCodes.UNAUTHORIZED);
      throw new Error('Not Authorized, Token Failed!');
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('Not Authorized, No Token Provided');
  }
});

const protectSocket = async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Not Authorized, No Token!'));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET || 'your-secret-key'
    );

    socket.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!socket.user) {
      return next(new Error('Not Authorized, User Not Found!'));
    }

    next();
  } catch (error) {
    return next(new Error('Not Authorized, Token Failed!'));
  }
};

const authorizeServerRoles = (...flags) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;
    const hasRequiredFlag = flags.some((flag) => user[flag] === true);

    if (hasRequiredFlag) {
      next();
    } else {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Forbidden to access this route',
        timestamp: new Date().toISOString(),
      });
    }
  });
};

const authorizeSocketRoles = (...flags) => {
  return (socket, next) => {
    const user = socket.user;
    const hasRequiredFlag = flags.some((flag) => user[flag] === true);

    if (hasRequiredFlag) {
      next();
    } else {
      return next(new Error('Forbidden to access this route'));
    }
  };
};

module.exports = {
  protectServer,
  protectSocket,
  authorizeServerRoles,
  authorizeSocketRoles,
};
