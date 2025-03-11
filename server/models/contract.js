'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contract extends Model {
    static associate(models) {
      Contract.belongsTo(models.User, {
        foreignKey: 'recruiterId',
        as: 'recruiter',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });

      Contract.belongsTo(models.User, {
        foreignKey: 'interviewerId',
        as: 'interviewer',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });

      Contract.belongsTo(models.Job, {
        foreignKey: 'jobId',
        as: 'job',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });

      Contract.belongsTo(models.ChatRoom, {
        foreignKey: 'roomId',
        as: 'chatRoom',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });

      Contract.hasMany(models.InterviewerRating, {
        foreignKey: 'contractId',
        as: 'interviewerRatings',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      Contract.hasMany(models.Transaction, {
        foreignKey: 'contractId',
        as: 'transactions',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }
  }
  Contract.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: { msg: 'Contract ID must be unique' },
      },
      agreedPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notNull: { msg: 'Agreed price is required' },
          isDecimal: { msg: 'Agreed price must be a decimal number' },
          min: {
            args: [0],
            msg: 'Agreed price cannot be negative',
          },
          max: {
            args: [1000000],
            msg: 'Agreed price cannot exceed 1,000,000',
          },
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          notEmpty: { msg: 'Status is required' },
          isIn: {
            args: [['pending', 'active', 'completed', 'cancelled']],
            msg: 'Invalid status value',
          },
        },
      },
      paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          notEmpty: { msg: 'Payment status is required' },
          isIn: {
            args: [['pending', 'paid', 'failed', 'refunded']],
            msg: 'Invalid payment status value',
          },
        },
      },
      recruiterId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        validate: {
          notNull: { msg: 'Recruiter ID is required' },
        },
      },
      interviewerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        validate: {
          notNull: { msg: 'Interviewer ID is required' },
        },
      },
      jobId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Jobs',
          key: 'id',
        },
        validate: {
          notNull: { msg: 'Job ID is required' },
        },
      },
      roomId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'ChatRooms',
          key: 'id',
        },
        validate: {
          notNull: { msg: 'Room ID is required' },
        },
      },
    },
    {
      sequelize,
      modelName: 'Contract',
      timestamps: true,
    }
  );
  return Contract;
};
