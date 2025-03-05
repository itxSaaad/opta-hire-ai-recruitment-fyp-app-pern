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
      },
      amount: DataTypes.DECIMAL,
      status: DataTypes.STRING,
      transactionDate: DataTypes.DATE,
      contractId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'Transaction',
      timestamps: true,
    }
  );
  return Transaction;
};
