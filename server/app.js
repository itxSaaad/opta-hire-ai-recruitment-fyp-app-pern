import colors from 'colors';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimiter from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import xss from 'xss-clean';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;

const app = express();

const __dirname = path.resolve();

app.set('trust proxy', 1);

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(cors(corsOptions));

app.use(xss());

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
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
        url: 'https://optahire.com',
        email: 'support@optahire.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://optahire-main-server-expressjs.vercel.app',
        description: 'Vercel Production server',
      },
      {
        url: 'https://api.optahire.com',
        description: 'Production',
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
  res.send(
    `<section style="font-family: 'Hanken-Grotesk', sans-serif; text-align: center; padding: 40px; background-color: white;">
      <h1 style="color: #1d509a; font-size: 3em;">Welcome to <a href="https://optahire.com">OptaHire</a>!</h1>
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

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(
        `======================================================================================`
      );
      console.log(
        `🚀 Server running on Port ${PORT} in ${NODE_ENV} Mode!`.yellow.bold,
        `\n🔗 CTRL + Click on`,
        `http://localhost:${PORT}`.underline.cyan,
        `to open in your browser.`
      );
      console.log(
        `\n📘 API documentation available at`,
        `http://localhost:${PORT}/api-docs`.underline.magenta,
        `- explore the routes and dive deep!`
      );
      console.log(
        `\n💡 Remember: Clean code is the foundation of solid projects. Strive for clarity and simplicity!`
          .green
      );
      console.log(
        `\n👥 Need support? Feel free to reach out to the team or check the documentation!`
          .blue
      );
      console.log(
        `--------------------------------------------------------------------------------------`
      );
    });
  } catch (error) {
    console.error(`❌ Error starting the server: ${error.message}`.red);
    process.exit(1);
  }
};

startServer();
