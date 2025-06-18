'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    static associate(models) {
      Application.belongsTo(models.Job, {
        foreignKey: 'jobId',
        as: 'job',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
      Application.belongsTo(models.User, {
        foreignKey: 'candidateId',
        as: 'candidate',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }
  }
  Application.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Status is required' },
          isIn: {
            args: [['applied', 'shortlisted', 'rejected', 'hired']],
            msg: 'Invalid application status',
          },
        },
        defaultValue: 'pending',
      },
      applicationDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          notEmpty: { msg: 'Application date is required' },
          isDate: { msg: 'Invalid date format' },
        },
      },
      jobId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Job ID is required' },
        },
      },
      candidateId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Candidate ID is required' },
        },
      },
    },
    {
      sequelize,
      modelName: 'Application',
      timestamps: true,
    }
  );
  return Application;
};
