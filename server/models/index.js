'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');

const basename = path.basename(__filename);
const config = require(path.join(__dirname, '/../config/database'))[
  process.env.NODE_ENV || 'development'
];
const db = {};

let sequelize;

try {
  const { database_url: databaseUrl, ...sequelizeOptions } = config;
  sequelize = databaseUrl
    ? new Sequelize(databaseUrl, sequelizeOptions)
    : new Sequelize(config.database, config.username, config.password, config);

  sequelize
    .authenticate()
    .then(() => {
      console.log('✅ PostgreSQL authentication succeeded.'.green);
    })
    .catch((error) => {
      console.error(
        `❌ PostgreSQL authentication failed: ${error.message}`.red
      );
    });

  fs.readdirSync(__dirname)
    .filter((file) => {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        file.slice(-3) === '.js' &&
        file.indexOf('.test.js') === -1
      );
    })
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

  console.log('\n' + '='.repeat(86).blue);
  console.log(`🌐 DATABASE CONNECTION STATUS`.bold.blue);
  console.log('='.repeat(86).blue);
  console.log(`🔗 Host:       ${sequelize.config.host || 'from connection URL'}`.cyan);
  console.log(`📦 Database:   ${sequelize.config.database || 'from connection URL'}`.cyan);
  console.log(`⏰ Timestamp:  ${new Date().toLocaleString()}`.magenta);
  console.log(`🌍 Node ENV:   ${process.env.NODE_ENV}`.yellow);
  console.log(`📚 Loaded Models: ${Object.keys(db).join(', ')}`.cyan);
  console.log('='.repeat(86).blue);
} catch (error) {
  console.error('\n' + '='.repeat(86).red);
  console.error(`❌ DATABASE CONNECTION ERROR`.red.bold);
  console.error('='.repeat(86).red);
  console.error(`📌 Error Type: ${error.name}`.red);
  console.error(`💬 Message: ${error.message}`.red);
  console.error('='.repeat(86).red);
  process.exit(1);
}

module.exports = db;
