'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.ChatRoom, {
        foreignKey: 'chatRoomId',
        as: 'chatRoom',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      Message.belongsTo(models.User, {
        foreignKey: 'recruiterId',
        as: 'recruiter',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      Message.belongsTo(models.User, {
        foreignKey: 'interviewerId',
        as: 'interviewer',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }
  }

  Message.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: { msg: 'Message ID must be unique' },
      },
      chatRoomId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: { msg: 'Chat room ID is required' },
          notEmpty: { msg: 'Chat room ID cannot be empty' },
          isUUID: { args: 4, msg: 'Chat room ID must be a valid UUID' },
        },
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
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: { msg: 'Sender ID is required' },
          notEmpty: { msg: 'Sender ID cannot be empty' },
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Message content is required' },
          notEmpty: { msg: 'Message content cannot be empty' },
          len: {
            args: [1, 5000],
            msg: 'Message content must be between 1 and 5000 characters',
          },
        },
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        validate: {
          notNull: { msg: 'isRead status is required' },
          isBoolean(value) {
            if (typeof value !== 'boolean') {
              throw new Error('isRead must be a boolean value');
            }
          },
        },
        // messageType: {
        //   type: DataTypes.ENUM('text', 'contract', 'system'),
        //   allowNull: true,
        //   validate: {
        //     isIn: {
        //       args: [['text', 'contract', 'system']],
        //       msg: 'Message type must be one of the following: text, contract, system',
        //     },
        //   },
        //   defaultValue: 'text',
        // },
      },
    },
    {
      sequelize,
      modelName: 'Message',
      timestamps: true,
      paranoid: false,
    }
  );

  return Message;
};
