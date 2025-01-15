const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

const { User } = require('../models');

const protect = asyncHandler(async (req, res, next) => {
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

const authorizeRoles = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (roles.includes(req.user.role)) {
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

module.exports = { protect, authorizeRoles };
