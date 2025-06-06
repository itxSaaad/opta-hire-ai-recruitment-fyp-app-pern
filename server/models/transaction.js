'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.Contract, {
        foreignKey: 'contractId',
        as: 'contract',
      });
    }
  }
  Transaction.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Amount is required' },
          isDecimal: { msg: 'Amount must be a valid decimal number' },
          min: {
            args: [0],
            msg: 'Amount must be greater than or equal to 0',
          },
          max: {
            args: [999999.99],
            msg: 'Amount cannot exceed $999,999.99',
          },
        },
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'completed',
          'failed',
          'cancelled',
          'refunded'
        ),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          notEmpty: { msg: 'Status is required' },
          isIn: {
            args: [['pending', 'completed', 'failed', 'cancelled', 'refunded']],
            msg: 'Status must be one of: pending, completed, failed, cancelled, refunded',
          },
        },
      },
      transactionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          notEmpty: { msg: 'Transaction date is required' },
          isDate: { msg: 'Please enter a valid date' },
        },
      },
      transactionType: {
        type: DataTypes.ENUM('payment', 'refund', 'payout', 'platform_fee'),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Transaction type is required' },
          isIn: {
            args: [['payment', 'refund', 'payout', 'platform_fee']],
            msg: 'Transaction type must be one of: payment, refund, payout, platform_fee',
          },
        },
      },
      contractId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Contract ID is required' },
        },
      },
      // Stripe-specific fields
      stripePaymentIntentId: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 255],
            msg: 'Stripe PaymentIntent ID must not exceed 255 characters',
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
      stripePayoutId: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 255],
            msg: 'Stripe Payout ID must not exceed 255 characters',
          },
        },
      },
      platformFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          isDecimal: { msg: 'Platform fee must be a valid decimal number' },
          min: {
            args: [0],
            msg: 'Platform fee cannot be negative',
          },
          max: {
            args: [99999.99],
            msg: 'Platform fee cannot exceed $99,999.99',
          },
        },
      },
      netAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          isDecimal: { msg: 'Net amount must be a valid decimal number' },
          min: {
            args: [0],
            msg: 'Net amount cannot be negative',
          },
          max: {
            args: [999999.99],
            msg: 'Net amount cannot exceed $999,999.99',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Transaction',
      timestamps: true,
    }
  );

  /**
   * Calculate platform fee based on amount
   * @param {number} amount - The transaction amount
   * @returns {number} The calculated platform fee (2.5%)
   */
  Transaction.calculatePlatformFee = function (amount) {
    const PLATFORM_FEE_PERCENTAGE = 0.025; // 2.5%
    return Math.round(amount * PLATFORM_FEE_PERCENTAGE * 100) / 100; // Round to 2 decimal places
  };

  /**
   * Calculate net amount after platform fee
   * @param {number} amount - The original amount
   * @returns {object} Object with netAmount and platformFee
   */
  Transaction.calculateNetAmount = function (amount) {
    const platformFee = this.calculatePlatformFee(amount);
    const netAmount = Math.round((amount - platformFee) * 100) / 100; // Round to 2 decimal places

    return {
      netAmount,
      platformFee,
    };
  };

  /**
   * Check if transaction is successful
   * @returns {boolean} Whether the transaction completed successfully
   */
  Transaction.prototype.isSuccessful = function () {
    return this.status === 'completed';
  };

  /**
   * Check if transaction failed
   * @returns {boolean} Whether the transaction failed
   */
  Transaction.prototype.isFailed = function () {
    return ['failed', 'cancelled'].includes(this.status);
  };

  /**
   * Check if transaction is still pending
   * @returns {boolean} Whether the transaction is pending
   */
  Transaction.prototype.isPending = function () {
    return this.status === 'pending';
  };

  /**
   * Get transaction display name based on type
   * @returns {string} Human-readable transaction type
   */
  Transaction.prototype.getDisplayType = function () {
    const typeMap = {
      payment: 'Contract Payment',
      refund: 'Payment Refund',
      payout: 'Interviewer Payout',
      platform_fee: 'Platform Fee',
    };

    return typeMap[this.transactionType] || this.transactionType;
  };

  return Transaction;
};
