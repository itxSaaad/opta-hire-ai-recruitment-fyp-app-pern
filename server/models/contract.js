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
            args: [1.0],
            msg: 'Agreed price must be at least $1.00',
          },
          max: {
            args: [100000.0],
            msg: 'Agreed price cannot exceed $100,000.00',
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
      // Stripe Payment Fields
      paymentIntentId: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 255],
            msg: 'Payment Intent ID must not exceed 255 characters',
          },
        },
      },
      stripeApplicationFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          isDecimal: { msg: 'Stripe application fee must be a decimal number' },
          min: {
            args: [0],
            msg: 'Stripe application fee cannot be negative',
          },
        },
      },
      stripeTransferId: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 255],
            msg: 'Stripe Transfer ID must not exceed 255 characters',
          },
        },
      },
      // Foreign Keys
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

  /**
   * Calculate platform fee for the contract
   * @returns {number} The platform fee (2.5% of agreed price)
   */
  Contract.prototype.calculatePlatformFee = function () {
    const PLATFORM_FEE_PERCENTAGE = 0.025; // 2.5%
    return Math.round(this.agreedPrice * PLATFORM_FEE_PERCENTAGE * 100) / 100;
  };

  /**
   * Calculate net amount interviewer will receive
   * @returns {number} The net amount after platform fee
   */
  Contract.prototype.calculateNetAmount = function () {
    const platformFee = this.calculatePlatformFee();
    return Math.round((this.agreedPrice - platformFee) * 100) / 100;
  };

  /**
   * Check if contract can be paid
   * @returns {boolean} Whether the contract is eligible for payment
   */
  Contract.prototype.canBePaid = function () {
    return this.status === 'pending' && this.paymentStatus === 'pending';
  };

  /**
   * Check if contract can be completed
   * @returns {boolean} Whether the contract can be marked as completed
   */
  Contract.prototype.canBeCompleted = function () {
    return this.status === 'active' && this.paymentStatus === 'paid';
  };

  /**
   * Check if contract is active
   * @returns {boolean} Whether the contract is currently active
   */
  Contract.prototype.isActive = function () {
    return this.status === 'active' && this.paymentStatus === 'paid';
  };

  /**
   * Check if contract is completed
   * @returns {boolean} Whether the contract has been completed
   */
  Contract.prototype.isCompleted = function () {
    return this.status === 'completed';
  };

  /**
   * Check if contract payment failed
   * @returns {boolean} Whether the contract payment failed
   */
  Contract.prototype.hasPaymentFailed = function () {
    return this.paymentStatus === 'failed';
  };

  /**
   * Get contract status display text
   * @returns {string} Human-readable status
   */
  Contract.prototype.getStatusDisplay = function () {
    const statusMap = {
      pending: 'Pending Payment',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };

    return statusMap[this.status] || this.status;
  };

  /**
   * Get payment status display text
   * @returns {string} Human-readable payment status
   */
  Contract.prototype.getPaymentStatusDisplay = function () {
    const statusMap = {
      pending: 'Payment Pending',
      paid: 'Payment Completed',
      failed: 'Payment Failed',
      refunded: 'Payment Refunded',
    };

    return statusMap[this.paymentStatus] || this.paymentStatus;
  };

  /**
   * Calculate contract progress as percentage
   * @returns {number} Progress percentage (0-100)
   */
  Contract.prototype.getProgressPercentage = function () {
    switch (this.status) {
      case 'pending':
        return this.paymentStatus === 'paid' ? 50 : 25;
      case 'active':
        return 75;
      case 'completed':
        return 100;
      case 'cancelled':
      default:
        return 0;
    }
  };

  return Contract;
};
