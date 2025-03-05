'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    static associate(models) {
      Job.belongsTo(models.User, {
        foreignKey: 'recruiterId',
        as: 'recruiter',
      });
      Job.hasMany(models.Application, {
        foreignKey: 'jobId',
        as: 'applications',
      });
      Job.hasMany(models.Interview, { foreignKey: 'jobId', as: 'interviews' });
      Job.hasMany(models.ChatRoom, { foreignKey: 'jobId', as: 'chatRooms' });
      Job.hasMany(models.Contract, { foreignKey: 'jobId', as: 'contracts' });
      Job.hasMany(models.InterviewerRating, {
        foreignKey: 'jobId',
        as: 'interviewerRatings',
      });
    }
  }
  Job.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      requirements: DataTypes.TEXT,
      salaryRange: DataTypes.STRING,
      category: DataTypes.STRING,
      location: DataTypes.STRING,
      recruiterId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'Job',
      timestamps: true,
    }
  );
  return Job;
};
