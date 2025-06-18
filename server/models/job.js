'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    static associate(models) {
      Job.belongsTo(models.User, {
        foreignKey: 'recruiterId',
        as: 'recruiter',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      Job.hasMany(models.Application, {
        foreignKey: 'jobId',
        as: 'applications',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      Job.hasMany(models.Interview, {
        foreignKey: 'jobId',
        as: 'interviews',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      Job.hasMany(models.ChatRoom, {
        foreignKey: 'jobId',
        as: 'chatRooms',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      Job.hasMany(models.Contract, {
        foreignKey: 'jobId',
        as: 'contracts',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      Job.hasMany(models.InterviewerRating, {
        foreignKey: 'jobId',
        as: 'interviewerRatings',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
        unique: { msg: 'Job ID must be unique' },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Job title cannot be null' },
          notEmpty: { msg: 'Job title is required' },
          len: {
            args: [2, 100],
            msg: 'Job title must be between 2 and 100 characters',
          },
          is: {
            args: /^[a-zA-Z0-9\s\-&(),.]+$/,
            msg: 'Job title can only contain letters, numbers, spaces, and basic punctuation',
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Job description cannot be null' },
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
          notNull: { msg: 'Company name cannot be null' },
          notEmpty: { msg: 'Company name is required' },
          len: {
            args: [2, 100],
            msg: 'Company name must be between 2 and 100 characters',
          },
          is: {
            args: /^[a-zA-Z0-9\s\-&(),.]+$/,
            msg: 'Company name can only contain letters, numbers, spaces, and basic punctuation',
          },
        },
      },
      requirements: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Job requirements cannot be null' },
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
          notNull: { msg: 'Job benefits cannot be null' },
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
          notNull: { msg: 'Salary range cannot be null' },
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
          notNull: { msg: 'Job category cannot be null' },
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
          notNull: { msg: 'Job location cannot be null' },
          notEmpty: { msg: 'Job location is required' },
          len: {
            args: [2, 100],
            msg: 'Location must be between 2 and 100 characters',
          },
          is: {
            args: /^[a-zA-Z0-9\s\-,]+$/,
            msg: 'Location can only contain letters, numbers, spaces, hyphens, and commas',
          },
        },
      },
      recruiterId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: { msg: 'Recruiter ID cannot be null' },
          notEmpty: { msg: 'Recruiter ID is required' },
        },
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
