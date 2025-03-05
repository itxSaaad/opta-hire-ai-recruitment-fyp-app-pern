'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.ChatRoom, {
        foreignKey: 'chatRoomId',
        as: 'chatRoom',
      });
      Message.belongsTo(models.User, {
        foreignKey: 'recruiterId',
        as: 'recruiter',
      });
      Message.belongsTo(models.User, {
        foreignKey: 'interviewerId',
        as: 'interviewer',
      });
    }
  }
  Message.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      chatRoomId: DataTypes.UUID,
      recruiterId: DataTypes.UUID,
      interviewerId: DataTypes.UUID,
      content: DataTypes.TEXT,
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Message',
      timestamps: true,
    }
  );
  return Message;
};
