'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contract extends Model {
    static associate(models) {
      Contract.belongsTo(models.User, {
        foreignKey: 'recruiterId',
        as: 'recruiter',
      });
      Contract.belongsTo(models.User, {
        foreignKey: 'interviewerId',
        as: 'interviewer',
      });
      Contract.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' });
      Contract.belongsTo(models.ChatRoom, {
        foreignKey: 'roomId',
        as: 'chatRoom',
      });
      Contract.hasMany(models.InterviewerRating, {
        foreignKey: 'contractId',
        as: 'interviewerRatings',
      });
      Contract.hasMany(models.Transaction, {
        foreignKey: 'contractId',
        as: 'transactions',
      });
    }
  }
  Contract.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      agreedPrice: DataTypes.DECIMAL,
      status: DataTypes.STRING,
      paymentStatus: DataTypes.STRING,
      recruiterId: DataTypes.UUID,
      interviewerId: DataTypes.UUID,
      jobId: DataTypes.UUID,
      roomId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'Contract',
      timestamps: true,
    }
  );
  return Contract;
};
