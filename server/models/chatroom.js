'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChatRoom extends Model {
    static associate(models) {
      ChatRoom.belongsTo(models.User, {
        foreignKey: 'recruiterId',
        as: 'recruiter',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      ChatRoom.belongsTo(models.User, {
        foreignKey: 'interviewerId',
        as: 'interviewer',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      ChatRoom.belongsTo(models.Job, {
        foreignKey: 'jobId',
        as: 'job',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      ChatRoom.hasMany(models.Message, {
        foreignKey: 'chatRoomId',
        as: 'messages',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }
  }
  ChatRoom.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      recruiterId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: { msg: 'Recruiter ID is required' },
          notEmpty: { msg: 'Recruiter ID cannot be empty' },
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
      jobId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: { msg: 'Job ID is required' },
          notEmpty: { msg: 'Job ID cannot be empty' },
        },
      },
    },
    {
      sequelize,
      modelName: 'ChatRoom',
      timestamps: true,
    }
  );
  return ChatRoom;
};
