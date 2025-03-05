'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Interview extends Model {
    static associate(models) {
      Interview.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' });
      Interview.belongsTo(models.Application, {
        foreignKey: 'applicationId',
        as: 'application',
      });
      Interview.belongsTo(models.User, {
        foreignKey: 'interviewerId',
        as: 'interviewer',
      });
      Interview.belongsTo(models.User, {
        foreignKey: 'candidateId',
        as: 'candidate',
      });
    }
  }
  Interview.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      roomId: DataTypes.UUID,
      scheduledTime: DataTypes.DATE,
      callStartedAt: DataTypes.DATE,
      callEndedAt: DataTypes.DATE,
      interviewerId: DataTypes.UUID,
      candidateId: DataTypes.UUID,
      jobId: DataTypes.UUID,
      applicationId: DataTypes.UUID,
      status: DataTypes.STRING,
      remarks: DataTypes.TEXT,
      summary: DataTypes.TEXT,
      rating: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: 'Interview',
      timestamps: true,
    }
  );
  return Interview;
};
