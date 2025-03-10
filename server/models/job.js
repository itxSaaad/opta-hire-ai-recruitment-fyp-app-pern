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
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Job title is required' },
          len: {
            args: [2, 100],
            msg: 'Job title must be between 2 and 100 characters',
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Job description is required' },
          len: {
            args: [50, 5000],
            msg: 'Job description must be between 50 and 5000 characters',
          },
        },
      },
      company: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Company name is required' },
          len: {
            args: [2, 100],
            msg: 'Company name must be between 2 and 100 characters',
          },
        },
      },
      requirements: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Job requirements are required' },
          len: {
            args: [50, 2000],
            msg: 'Job requirements must be between 50 and 2000 characters',
          },
        },
      },
      benefits: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Job benefits are required' },
          len: {
            args: [50, 2000],
            msg: 'Job benefits must be between 50 and 2000 characters',
          },
        },
      },
      salaryRange: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Salary range is required' },
          isValidSalaryRange(value) {
            if (!value.match(/^\$\d+k?\s*-\s*\$\d+k?$/)) {
              throw new Error('Salary range must be in format "$XXk - $XXXk"');
            }
          },
        },
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Job category is required' },
          isIn: {
            args: [
              ['IT', 'Engineering', 'Sales', 'Marketing', 'Finance', 'Other'],
            ],
            msg: 'Invalid job category',
          },
        },
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Job location is required' },
          len: {
            args: [2, 100],
            msg: 'Location must be between 2 and 100 characters',
          },
        },
      },
      recruiterId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      isClosed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Job',
      timestamps: true,
    }
  );
  return Job;
};
