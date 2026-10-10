require('dotenv').config();
const pg = require('pg');
const fs = require('fs');

const getDatabaseUrl = () => {
  const value =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;
  if (!value) return value;

  try {
    const url = new URL(value);
    // SSL options are provided below; remove URL SSL flags so they cannot
    // override the explicit Node TLS configuration.
    url.searchParams.delete('sslmode');
    return url.toString();
  } catch {
    return value;
  }
};

const databaseUrl = getDatabaseUrl();
const databaseCa = process.env.SUPABASE_DB_CA_FILE
  ? fs.readFileSync(process.env.SUPABASE_DB_CA_FILE, 'utf8')
  : process.env.SUPABASE_DB_CA?.replace(/\\n/g, '\n');
const databaseSsl = {
  require: true,
  rejectUnauthorized: Boolean(databaseCa),
  ...(databaseCa ? { ca: databaseCa } : {}),
};

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    database_url: databaseUrl,
    dialect: 'postgres',
    dialectOptions: {
      ssl: databaseSsl,
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
    database_url: databaseUrl,
    dialect: 'postgres',
    dialectOptions: {
      ssl: databaseSsl,
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
    database_url: databaseUrl,
    dialect: 'postgres',
    dialectOptions: {
      ssl: databaseSsl,
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
