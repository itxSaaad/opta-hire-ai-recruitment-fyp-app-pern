const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const http = require('http');
const morgan = require('morgan');
const { StatusCodes } = require('http-status-codes');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { Server } = require('socket.io');
const xss = require('xss-clean');

const db = require('./models');

const {
  errorHandler,
  notFoundHandler,
} = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const resumeRoutes = require('./routes/resume.routes');
const jobRoutes = require('./routes/job.routes');
const applicationRoutes = require('./routes/application.routes');
const chatRoomRoutes = require('./routes/chatRoom.routes');
const interviewRoutes = require('./routes/interview.routes');
// const videoRoutes = require('./routes/video.routes');
// const contractRoutes = require('./routes/contract.routes');
// const ratingRoutes = require('./routes/rating.routes');
// const transactionRoutes = require('./routes/transaction.routes');
// const paymentRoutes = require('./routes/payment.routes');

const setupChatSocket = require('./sockets/chat.socket');

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

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

const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:5173',
  'http://localhost:5000',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
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
        'OptaHire API is a RESTful API for the OptaHire application, a talent acquisition and hiring platform.',
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
        url: 'https://opta-hire-develop-server.vercel.app',
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

app.get('/api/v1/test', (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'API is working perfectly!',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/chatrooms', chatRoomRoutes);
app.use('/api/v1/interviews', interviewRoutes);
// app.use('/api/v1/videos', videoRoutes);
// app.use('/api/v1/contracts', contractRoutes);
// app.use('/api/v1/ratings', ratingRoutes);
// app.use('/api/v1/transactions', transactionRoutes);
// app.use('/api/v1/payments', paymentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupChatSocket(io);

const startServer = async () => {
  try {
    server.listen(PORT, () => {
      console.log('\n' + '='.repeat(86).yellow);
      console.log(`🚀 SERVER STATUS`.bold.yellow);
      console.log('='.repeat(86).yellow);
      console.log(`✅ Status:     Server is running`.green);
      console.log(`🔗 Port:       ${PORT}`.cyan);
      console.log(`🌍 Node ENV:   ${NODE_ENV}`.yellow);
      console.log(`⏰ Timestamp:  ${new Date().toLocaleString()}`.magenta);
      console.log(`📍 Local URL:  ${SERVER_URL}`.cyan);
      console.log(`📘 API Docs:   ${SERVER_URL}/api-docs`.magenta);
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
    io.close();
    process.exit(1);
  }
};

startServer();
