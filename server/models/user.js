'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'First name is required' },
          len: {
            args: [2, 50],
            msg: 'First name must be between 2 and 50 characters',
          },
          isAlpha: { msg: 'First name must contain only letters' },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Last name is required' },
          len: {
            args: [2, 50],
            msg: 'Last name must be between 2 and 50 characters',
          },
          isAlpha: { msg: 'Last name must contain only letters' },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Email already exists' },
        validate: {
          isEmail: { msg: 'Please enter a valid email address' },
          notEmpty: { msg: 'Email is required' },
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Phone number already exists' },
        validate: {
          notEmpty: { msg: 'Phone number is required' },
          len: {
            args: [10, 15],
            msg: 'Phone number must be between 10 and 15 characters',
          },
          is: {
            args: /^\+(?:[0-9] ?){6,14}[0-9]$/,
            msg: 'Please enter a valid phone number',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Password is required' },
          len: {
            args: [6, 100],
            msg: 'Password must be at least 6 characters long',
          },
        },
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isLinkedinVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isRecruiter: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isInterviewer: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isCandidate: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isTopRated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeSave: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  User.prototype.generateAccessToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
  };

  User.prototype.generateRefreshToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    });
  };

  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.generateOTP = async function () {
    const OTP_LENGTH = 6;

    do {
      const otp = Array.from({ length: OTP_LENGTH }, () =>
        Math.floor(Math.random() * 10)
      ).join('');

      const existingUser = await User.findOne({ where: { otp } });

      if (!existingUser) {
        return otp;
      }
    } while (true);
  };

  return User;
};
