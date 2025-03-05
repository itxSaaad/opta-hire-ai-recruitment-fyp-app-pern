'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    static associate(models) {
      Application.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' });
      Application.belongsTo(models.User, {
        foreignKey: 'candidateId',
        as: 'candidate',
      });
      Application.hasOne(models.Interview, {
        foreignKey: 'applicationId',
        as: 'interview',
      });
    }
  }
  Application.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      status: DataTypes.STRING,
      applicationDate: DataTypes.DATE,
      jobId: DataTypes.UUID,
      candidateId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'Application',
      timestamps: true,
    }
  );
  return Application;
};
