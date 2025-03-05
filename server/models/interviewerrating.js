'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InterviewerRating extends Model {
    static associate(models) {
      InterviewerRating.belongsTo(models.User, {
        foreignKey: 'interviewerId',
        as: 'interviewer',
      });
      InterviewerRating.belongsTo(models.User, {
        foreignKey: 'recruiterId',
        as: 'recruiter',
      });
      InterviewerRating.belongsTo(models.Job, {
        foreignKey: 'jobId',
        as: 'job',
      });
      InterviewerRating.belongsTo(models.Contract, {
        foreignKey: 'contractId',
        as: 'contract',
      });
    }
  }
  InterviewerRating.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      rating: DataTypes.DECIMAL,
      feedback: DataTypes.TEXT,
      interviewerId: DataTypes.UUID,
      recruiterId: DataTypes.UUID,
      jobId: DataTypes.UUID,
      contractId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'InterviewerRating',
      timestamps: true,
    }
  );
  return InterviewerRating;
};
