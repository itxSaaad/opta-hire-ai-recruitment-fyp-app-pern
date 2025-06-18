'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Resume extends Model {
    static associate(models) {
      Resume.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Resume.init(
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
        validate: {
          len: {
            args: [2, 100],
            msg: 'Title must be between 2 and 100 characters',
          },
        },
      },
      summary: {
        type: DataTypes.TEXT,
        validate: {
          len: {
            args: [50, 500],
            msg: 'Summary must be between 50 and 500 characters',
          },
        },
      },
      headline: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [10, 150],
            msg: 'Headline must be between 10 and 150 characters',
          },
        },
      },
      skills: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        validate: {
          isValidSkillsArray(value) {
            if (!Array.isArray(value)) {
              throw new Error('Skills must be an array');
            }
            if (value.length < 1) {
              throw new Error('At least one skill is required');
            }
            if (value.length > 20) {
              throw new Error('Maximum 20 skills allowed');
            }
          },
        },
      },
      experience: {
        type: DataTypes.TEXT,
        validate: {
          notEmpty: {
            msg: 'Experience details are required',
          },
        },
      },
      education: {
        type: DataTypes.TEXT,
        validate: {
          notEmpty: {
            msg: 'Education details are required',
          },
        },
      },
      industry: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [2, 50],
            msg: 'Industry must be between 2 and 50 characters',
          },
        },
      },
      availability: {
        type: DataTypes.STRING,
        validate: {
          isIn: {
            args: [
              ['Immediate', 'Two weeks', 'One month', 'More than a month'],
            ],
            msg: 'Invalid availability status',
          },
        },
      },
      company: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [2, 100],
            msg: 'Company name must be between 2 and 100 characters',
          },
        },
      },
      achievements: {
        type: DataTypes.TEXT,
        validate: {
          len: {
            args: [0, 1000],
            msg: 'Achievements must not exceed 1000 characters',
          },
        },
      },
      rating: {
        type: DataTypes.FLOAT,
        validate: {
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
      portfolio: {
        type: DataTypes.STRING,
        validate: {
          isUrl: {
            msg: 'Portfolio must be a valid URL',
          },
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Resume',
      timestamps: true,
      paranoid: true,
    }
  );

  return Resume;
};
