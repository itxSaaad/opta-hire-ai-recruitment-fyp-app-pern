require('dotenv').config();
const pg = require('pg');

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    database_url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      statement_timeout: 30000,
      idle_in_transaction_session_timeout: 30000,
    },
    dialectModule: pg,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
      evict: 1000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    database_url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      statement_timeout: 30000,
      idle_in_transaction_session_timeout: 30000,
    },
    dialectModule: pg,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
      evict: 1000,
    },
    logging: false,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    database_url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      statement_timeout: 30000,
      idle_in_transaction_session_timeout: 30000,
    },
    dialectModule: pg,
    pool: {
      max: 3, // Lower for production to avoid connection limits
      min: 0,
      acquire: 30000,
      idle: 10000,
      evict: 1000,
    },
    logging: false,
  },
};
