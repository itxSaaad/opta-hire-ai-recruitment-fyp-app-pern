'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '/../config/config.js'))[env];

const db = {};

let sequelize;

const connectDB = async () => {
  try {
    if (config.use_env_variable) {
      sequelize = new Sequelize(
        `${[config.use_env_variable]}?sslmode=no-verify`,
        config
      );
    } else {
      sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
      );
    }

    await sequelize.authenticate();
    console.log(
      `\n🌐 Sequelize Connected to PostgreSQL: ${sequelize.config.host}`.green
        .bold,
      `\n\n📦 Database: ${sequelize.config.database}`.cyan,
      `\n📅 Connected at: ${new Date().toLocaleString()}`.magenta
    );

    fs.readdirSync(__dirname)
      .filter(
        (file) =>
          file.indexOf('.') !== 0 &&
          file !== basename &&
          file.slice(-3) === '.js' &&
          file.indexOf('.test.js') === -1
      )
      .forEach((file) => {
        const model = require(path.join(__dirname, file))(
          sequelize,
          Sequelize.DataTypes
        );
        db[model.name] = model;
      });

    Object.keys(db).forEach((modelName) => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    console.log(`\n🛠️  Ready to perform database operations!`.yellow.bold);
    console.log(
      `--------------------------------------------------------------------------------------`
    );
  } catch (error) {
    console.error(`❌ Database Error: ${error}`.red);
    process.exit(1);
  }
};

connectDB();

module.exports = db;
