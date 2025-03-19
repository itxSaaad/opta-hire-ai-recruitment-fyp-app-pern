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
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Amount is required' },
          isDecimal: { msg: 'Amount must be a valid decimal number' },
          min: {
            args: [0],
            msg: 'Amount must be greater than or equal to 0',
          },
        },
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Status is required' },
          isIn: {
            args: [['pending', 'completed', 'failed', 'cancelled']],
            msg: 'Status must be either pending, completed, failed, or cancelled',
          },
        },
      },
      transactionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Transaction date is required' },
          isDate: { msg: 'Please enter a valid date' },
        },
      },
      transactionType: {
        type: DataTypes.ENUM('payment', 'refund', 'payout'),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Transaction type is required' },
          isIn: {
            args: [['payment', 'refund', 'payout']],
            msg: 'Transaction type must be either payment, refund, or payout',
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
    },
    {
      sequelize,
      modelName: 'Transaction',
      timestamps: true,
    }
  );
  return Transaction;
};
