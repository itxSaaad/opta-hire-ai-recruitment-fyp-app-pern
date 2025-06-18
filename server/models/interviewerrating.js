'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InterviewerRating extends Model {
    static associate(models) {
      InterviewerRating.belongsTo(models.User, {
        foreignKey: 'interviewerId',
        as: 'interviewer',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      InterviewerRating.belongsTo(models.User, {
        foreignKey: 'recruiterId',
        as: 'recruiter',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      InterviewerRating.belongsTo(models.Job, {
        foreignKey: 'jobId',
        as: 'job',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      InterviewerRating.belongsTo(models.Contract, {
        foreignKey: 'contractId',
        as: 'contract',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }
  }

  InterviewerRating.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: { msg: 'Rating ID must be unique' },
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false,
        validate: {
          notNull: { msg: 'Rating cannot be null' },
          notEmpty: { msg: 'Rating is required' },
          isDecimal: { msg: 'Rating must be a decimal number' },
          min: {
            args: [0],
            msg: 'Rating cannot be less than 0',
          },
          max: {
            args: [5],
            msg: 'Rating cannot be more than 5',
          },
        },
      },
      feedback: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Feedback cannot be null' },
          notEmpty: { msg: 'Feedback is required' },
          len: {
            args: [10, 1000],
            msg: 'Feedback must be between 10 and 1000 characters',
          },
        },
      },
      interviewerId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: { msg: 'Interviewer ID cannot be null' },
          notEmpty: { msg: 'Interviewer ID is required' },
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
      jobId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: { msg: 'Job ID cannot be null' },
          notEmpty: { msg: 'Job ID is required' },
        },
      },
      contractId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: { msg: 'Contract ID cannot be null' },
          notEmpty: { msg: 'Contract ID is required' },
        },
      },
    },
    {
      sequelize,
      modelName: 'InterviewerRating',
      timestamps: true,
    }
  );

  return InterviewerRating;
};
