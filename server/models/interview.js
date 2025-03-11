'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Interview extends Model {
    static associate(models) {
      Interview.belongsTo(models.Job, {
        foreignKey: 'jobId',
        as: 'job',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });

      Interview.belongsTo(models.Application, {
        foreignKey: 'applicationId',
        as: 'application',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });

      Interview.belongsTo(models.User, {
        foreignKey: 'interviewerId',
        as: 'interviewer',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });

      Interview.belongsTo(models.User, {
        foreignKey: 'candidateId',
        as: 'candidate',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });
    }
  }
  Interview.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: { msg: 'Interview ID must be unique' },
        validate: {
          notNull: { msg: 'Interview ID is required' },
        },
      },
      roomId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: { msg: 'Room ID must be unique' },
        validate: {
          notNull: { msg: 'Room ID is required' },
          notEmpty: { msg: 'Room ID cannot be empty' },
        },
      },
      scheduledTime: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: { msg: 'Scheduled time is required' },
          notEmpty: { msg: 'Scheduled time cannot be empty' },
          isDate: { msg: 'Invalid date format' },
          isAfterNow(value) {
            if (value && value <= new Date()) {
              throw new Error('Scheduled time must be in the future');
            }
          },
        },
      },
      callStartedAt: {
        type: DataTypes.DATE,
        validate: {
          isDate: { msg: 'Invalid date format' },
          isAfterScheduledTime(value) {
            if (value && value < this.scheduledTime) {
              throw new Error(
                'Call start time cannot be before scheduled time'
              );
            }
          },
        },
      },
      callEndedAt: {
        type: DataTypes.DATE,
        validate: {
          isDate: { msg: 'Invalid date format' },
          isAfterStartTime(value) {
            if (value && this.callStartedAt && value <= this.callStartedAt) {
              throw new Error('Call end time must be after call start time');
            }
          },
        },
      },
      interviewerId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: { msg: 'Interviewer ID is required' },
          notEmpty: { msg: 'Interviewer ID cannot be empty' },
        },
      },
      candidateId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: { msg: 'Candidate ID is required' },
          notEmpty: { msg: 'Candidate ID cannot be empty' },
        },
      },
      jobId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: { msg: 'Job ID is required' },
          notEmpty: { msg: 'Job ID cannot be empty' },
        },
      },
      applicationId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: { msg: 'Application ID is required' },
          notEmpty: { msg: 'Application ID cannot be empty' },
        },
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Status is required' },
          notEmpty: { msg: 'Status cannot be empty' },
          isIn: {
            args: [['scheduled', 'ongoing', 'completed', 'cancelled']],
            msg: 'Status must be one of: scheduled, ongoing, completed, cancelled',
          },
        },
      },
      remarks: {
        type: DataTypes.TEXT,
        validate: {
          len: {
            args: [0, 1000],
            msg: 'Remarks must not exceed 1000 characters',
          },
        },
      },
      summary: {
        type: DataTypes.TEXT,
        validate: {
          len: {
            args: [0, 2000],
            msg: 'Summary must not exceed 2000 characters',
          },
        },
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        validate: {
          isDecimal: { msg: 'Rating must be a decimal number' },
          min: {
            args: [0],
            msg: 'Rating must be at least 0',
          },
          max: {
            args: [5],
            msg: 'Rating must not exceed 5',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Interview',
      timestamps: true,
      paranoid: true,
    }
  );
  return Interview;
};
