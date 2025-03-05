'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatRoom extends Model {
    static associate(models) {
      ChatRoom.belongsTo(models.User, {
        foreignKey: 'recruiterId',
        as: 'recruiter',
      });
      ChatRoom.belongsTo(models.User, {
        foreignKey: 'interviewerId',
        as: 'interviewer',
      });
      ChatRoom.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' });
      ChatRoom.hasMany(models.Message, {
        foreignKey: 'chatRoomId',
        as: 'messages',
      });
    }
  }
  ChatRoom.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      recruiterId: DataTypes.UUID,
      interviewerId: DataTypes.UUID,
      jobId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'ChatRoom',
      timestamps: true,
    }
  );
  return ChatRoom;
};
