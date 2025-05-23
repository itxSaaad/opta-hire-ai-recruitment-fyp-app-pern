const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const { StatusCodes } = require('http-status-codes');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const xss = require('xss-clean');

const db = require('./models');

const {
  errorHandler,
  notFoundHandler,
} = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;

const app = express();

app.set('trust proxy', 1);

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    handler: (req, res, next, options) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        timestamp: new Date().toISOString(),
      });
    },
    standardHeaders: true,
    legacyHeaders: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:5173',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(xss());

app.use(cookieParser());

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

if (NODE_ENV === 'production') {
  app.use(morgan('combined'));
}

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OptaHire API',
      version: '1.0.0',
      description:
        'The OptaHire API is a RESTful API that provides access to a wide range of services and resources tailored for optimizing talent acquisition. It is designed to be fast, reliable, and easy to use. Built using Node.js, Express.js, and MongoDB, the API is hosted on Vercel and fully documented using Swagger. It includes detailed information about each endpoint, such as request and response formats, authentication requirements, and example responses. The API aims to provide an intuitive interface, enabling developers to get started quickly. It is scalable, supporting high traffic levels and numerous users, and secure, featuring authentication and authorization mechanisms along with rate limiting and input validation to protect against common security threats. Additionally, the API ensures reliability through monitoring and logging, maintaining high availability and performance.',
      contact: {
        name: 'OptaHire Team',
        url: 'https://opta-hire-fyp-app-client.vercel.app',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development server',
      },
      {
        url: 'https://develop-opta-hire-fyp-app-server.vercel.app',
        description: 'Vercel Development Server',
      },
      {
        url: 'https://opta-hire-fyp-app-server-4ca9bd7992ab.herokuapp.com',
        description: 'Heroku Production Server',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

if (NODE_ENV === 'development') {
  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

app.get('/', (req, res) => {
  res.status(StatusCodes.OK).send(
    `<section style="font-family: 'Hanken-Grotesk', sans-serif; text-align: center; padding: 40px; background-color: white;">
      <h1 style="color: #1d509a; font-size: 3em;">Welcome to <a href="https://opta-hire-fyp-app-client.vercel.app">OptaHire</a>!</h1>
      <h3 style="color: #05baf0;">Optimizing Talent for a Brighter Future</h3>
      <p style="font-size: 1.2em; color: #1d509a;">Your API is up and running smoothly, ready to transform hiring and talent acquisition!</p>
      <div style="margin-top: 40px;">
        <p style="font-size: 1.7em; font-weight: bold; color: #05baf0;">Everything is running seamlessly!</p>
      </div>
      <footer style="margin-top: 50px; font-size: 0.9em; color: #1d509a;">
        <p>Need assistance? Dive into the code and unlock endless possibilities with OptaHire!</p>
        <p>Happy coding from the OptaHire Team! 🌐✨</p>
      </footer>
    </section>`
  );
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// app.all('*', (req, res) => {
//   res.status(StatusCodes.NOT_FOUND);
//   if (req.accepts('html')) {
//     res.send(`
//     <section style="font-family: 'Hanken-Grotesk', sans-serif; text-align: center; padding: 40px; background-color: white;">
//     <h1 style="color: #ff0000; font-size: 3em;">404 - Page Not Found</h1>
//     <h3 style="color: #ff6347;">Oops! The page you are looking for does not exist.</h3>
//     <p style="font-size: 1.2em; color: #333;">It seems we can't find what you're looking for. Try going back to the homepage or contact support if the problem persists.</p>
//     <div style="margin-top: 40px;">
//       <a href="/" style="font-size: 1.5em; font-weight: bold; color: #05baf0;">Go to Homepage</a>
//     </div>
//     <footer style="margin-top: 50px; font-size: 0.9em; color: #1d509a;">
//       <p>Need assistance? Reach out to our support team for help.</p>
//       <p>Happy coding from the OptaHire Team! 🌐✨</p>
//     </footer>
//     </section>
//   `);
//   } else if (req.accepts('json')) {
//     notFoundHandler(req, res);
//   } else {
//     notFoundHandler(req, res);
//   }
// });

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(86).yellow);
      console.log(`🚀 SERVER STATUS`.bold.yellow);
      console.log('='.repeat(86).yellow);
      console.log(`✅ Status:     Server is running`.green);
      console.log(`🔗 Port:       ${PORT}`.cyan);
      console.log(`🌍 Node ENV:   ${NODE_ENV}`.yellow);
      console.log(`⏰ Timestamp:  ${new Date().toLocaleString()}`.magenta);
      console.log(`📍 Local URL:  http://localhost:${PORT}`.cyan);
      console.log(`📘 API Docs:   http://localhost:${PORT}/api-docs`.magenta);
      console.log('-'.repeat(86).yellow);
      console.log(
        `💡 Tips:       Clean code is the foundation of solid projects`.green
      );
      console.log(
        `👥 Support:    Reach out to the team or check documentation`.cyan
      );
      console.log('='.repeat(86).yellow);
    });
  } catch (error) {
    console.error('\n' + '='.repeat(86).red);
    console.error(`❌ SERVER STARTUP ERROR`.red.bold);
    console.error('='.repeat(86).red);
    console.error(`📌 Error Type: ${error.name}`.red);
    console.error(`💬 Message:    ${error.message}`.red);
    console.error('='.repeat(86).red);
    db.close();
    process.exit(1);
  }
};

startServer();
