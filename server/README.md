# OptaHire - Server Backend

> This module is part of our Final Year Project (FYP) for the Bachelor's in Computer Science program at the University of the Punjab Gujranwala Campus (PUGC). The server backend provides a robust RESTful API built with Node.js and Express.js, featuring comprehensive user management, job posting capabilities, application processing, and real-time communication features for the OptaHire recruitment platform.

<br/>
<div align="center">
  <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern">
    <img src="../client/src/assets/images/logo.png" alt="Logo" width="100" height="100">
  </a>

  <h3 align="center">OptaHire Server Backend</h3>

  <p align="center">
    RESTful API for AI-Powered Recruitment Platform
    <br/>
    <br/>
    <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern"><strong>Explore the main project »</strong></a>
    <br/>
    <br/>
    <a href="https://opta-hire-fyp-app-server-4ca9bd7992ab.herokuapp.com/api-docs">API Documentation</a>
    .
    <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/issues">Report Bug</a>
    .
    <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/issues">Request Feature</a>
  </p>
</div>

## Table Of Contents

- [OptaHire - Server Backend](#optahire---server-backend))
  - [Table Of Contents](#table-of-contents)
  - [About The Server](#about-the-server)
  - [API Endpoints](#api-endpoints)
    - [Authentication Routes](#authentication-routes)
    - [User Management Routes](#user-management-routes)
    - [Job Management Routes](#job-management-routes)
    - [Application Routes](#application-routes)
    - [Resume Routes](#resume-routes)
    - [Interview Routes](#interview-routes)
    - [Chat Room Routes](#chat-room-routes)
    - [Contract Routes](#contract-routes)
    - [Payment Routes](#payment-routes)
    - [Transaction Routes](#transaction-routes)
    - [Interviewer Rating Routes](#interviewer-rating-routes)
  - [Database Schema](#database-schema)
    - [Core Tables](#core-tables)
    - [Relationship Overview](#relationship-overview)
  - [Architecture](#architecture)
    - [Project Structure](#project-structure)
    - [Core Components](#core-components)
  - [Real-time Communication](#real-time-communication)
    - [Socket.io Integration](#socketio-integration)
    - [WebRTC Support](#webrtc-support)
  - [Security Features](#security-features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Database Setup](#database-setup)
    - [Environment Configuration](#environment-configuration)
    - [Running the Server](#running-the-server)
  - [Dependencies](#dependencies)
  - [Deployment](#deployment)
    - [Production Environment](#production-environment)
    - [Heroku Deployment](#heroku-deployment)
    - [Vercel Deployment](#vercel-deployment)
  - [API Documentation](#api-documentation)
  - [Monitoring and Logging](#monitoring-and-logging)
  - [Development Tools](#development-tools)
    - [Debugging Tips](#debugging-tips)
  - [Contributing](#contributing)
  - [Authors](#authors)
  - [License](#license)
  - [Support](#support)

## About The Server

The OptaHire server backend is a comprehensive RESTful API built with Node.js and Express.js, designed to power the AI-driven recruitment platform. The server provides a robust foundation for managing users, job postings, applications, interviews, payments, and real-time communications. Built with scalability and security in mind, the backend features comprehensive authentication, role-based authorization, payment processing with Stripe, real-time chat functionality with Socket.io, and WebRTC support for video interviews.

The architecture follows modern backend development patterns with clear separation of concerns through controllers, models, routes, and middleware. The server utilizes PostgreSQL with Sequelize ORM for robust data management, implements JWT-based authentication with refresh token capabilities, and includes comprehensive API documentation with Swagger. Security features include rate limiting, XSS protection, CORS configuration, and input validation, while the modular design ensures maintainability and extensibility for future enhancements.

## API Endpoints

### Authentication Routes

- `POST /api/auth/register` - User registration with role selection
- `POST /api/auth/login` - User login with JWT token generation
- `POST /api/auth/logout` - Secure logout with token invalidation
- `POST /api/auth/refresh-token` - Refresh JWT access tokens
- `POST /api/auth/forgot-password` - Password reset email sending
- `POST /api/auth/reset-password` - Password reset with token verification

### User Management Routes

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile information
- `DELETE /api/users/profile` - Delete user account
- `PUT /api/users/change-password` - Change user password
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user by ID (Admin only)
- `DELETE /api/users/:id` - Delete user by ID (Admin only)

### Job Management Routes

- `GET /api/jobs` - Get all jobs with pagination and filtering
- `GET /api/jobs/:id` - Get job details by ID
- `POST /api/jobs` - Create new job posting (Recruiter only)
- `PUT /api/jobs/:id` - Update job posting (Recruiter/Admin)
- `DELETE /api/jobs/:id` - Delete job posting (Recruiter/Admin)
- `GET /api/jobs/:id/applications` - Get applications for specific job

### Application Routes

- `GET /api/applications` - Get user's applications
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications` - Submit job application (Candidate only)
- `PUT /api/applications/:id` - Update application status
- `DELETE /api/applications/:id` - Delete application
- `GET /api/applications/job/:jobId` - Get applications by job ID

### Resume Routes

- `GET /api/resumes` - Get user's resumes
- `GET /api/resumes/:id` - Get resume by ID
- `POST /api/resumes` - Create new resume (Candidate only)
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Interview Routes

- `GET /api/interviews` - Get user's interviews
- `GET /api/interviews/:id` - Get interview by ID
- `POST /api/interviews` - Schedule new interview
- `PUT /api/interviews/:id` - Update interview details
- `DELETE /api/interviews/:id` - Cancel interview

### Chat Room Routes

- `GET /api/chat-rooms` - Get user's chat rooms
- `GET /api/chat-rooms/:id` - Get chat room details
- `POST /api/chat-rooms` - Create new chat room
- `GET /api/chat-rooms/:id/messages` - Get chat room messages
- `POST /api/chat-rooms/:id/messages` - Send message to chat room

### Contract Routes

- `GET /api/contracts` - Get user's contracts
- `GET /api/contracts/:id` - Get contract by ID
- `POST /api/contracts` - Create new contract (Recruiter only)
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract

### Payment Routes

- `POST /api/payments/create-checkout-session` - Create Stripe checkout session
- `POST /api/payments/capture-payment` - Capture payment after checkout
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/success` - Payment success handler
- `GET /api/payments/cancel` - Payment cancellation handler

### Transaction Routes

- `GET /api/transactions` - Get user's transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction status

### Interviewer Rating Routes

- `GET /api/interviewer-ratings` - Get interviewer ratings
- `GET /api/interviewer-ratings/:id` - Get rating by ID
- `POST /api/interviewer-ratings` - Create interviewer rating
- `PUT /api/interviewer-ratings/:id` - Update rating
- `DELETE /api/interviewer-ratings/:id` - Delete rating

## Database Schema

### Core Tables

1. **Users** - User accounts with role-based access (Candidate, Recruiter, Interviewer, Admin)
2. **Jobs** - Job postings with comprehensive details and requirements
3. **Applications** - Job applications linking candidates to job postings
4. **Resumes** - Candidate resume information and professional profiles
5. **Interviews** - Interview scheduling and management
6. **ChatRooms** - Communication channels between users
7. **Messages** - Chat messages within chat rooms
8. **Contracts** - Service agreements between recruiters and interviewers
9. **Transactions** - Payment and financial transaction records
10. **InterviewerRatings** - Rating and review system for interviewers

### Relationship Overview

- **User → Jobs** (One-to-Many): Recruiters can create multiple job postings
- **User → Applications** (One-to-Many): Candidates can submit multiple applications
- **User → Resumes** (One-to-Many): Candidates can maintain multiple resumes
- **Job → Applications** (One-to-Many): Jobs can receive multiple applications
- **Contract → Interviews** (One-to-Many): Contracts can include multiple interviews
- **ChatRoom → Messages** (One-to-Many): Chat rooms contain multiple messages
- **User → Transactions** (One-to-Many): Users can have multiple payment transactions

## Architecture

### Project Structure

```
server/
├── app.js                      # Main application entry point with Express setup
├── package.json                # Node.js dependencies and scripts
├── Procfile                    # Heroku deployment configuration
├── vercel.json                 # Vercel deployment configuration
├── config/
│   └── database.js             # Database configuration and connection
├── controllers/                # Request handlers and business logic
│   ├── auth.controller.js      # Authentication operations
│   ├── user.controller.js      # User management operations
│   ├── job.controller.js       # Job posting operations
│   ├── application.controller.js # Application processing
│   ├── resume.controller.js    # Resume management
│   ├── interview.controller.js # Interview scheduling
│   ├── chatRoom.controller.js  # Chat room management
│   ├── contract.controller.js  # Contract operations
│   ├── payment.controller.js   # Payment processing
│   ├── transaction.controller.js # Transaction management
│   └── interviewerRating.controller.js # Rating system
├── models/                     # Sequelize database models
│   ├── index.js               # Model associations and exports
│   ├── user.js                # User model definition
│   ├── job.js                 # Job model definition
│   ├── application.js         # Application model definition
│   ├── resume.js              # Resume model definition
│   ├── interview.js           # Interview model definition
│   ├── chatroom.js            # Chat room model definition
│   ├── message.js             # Message model definition
│   ├── contract.js            # Contract model definition
│   ├── transaction.js         # Transaction model definition
│   └── interviewerrating.js   # Rating model definition
├── routes/                     # API route definitions
│   ├── auth.routes.js         # Authentication routes
│   ├── user.routes.js         # User management routes
│   ├── job.routes.js          # Job posting routes
│   ├── application.routes.js  # Application routes
│   ├── resume.routes.js       # Resume routes
│   ├── interview.routes.js    # Interview routes
│   ├── chatRoom.routes.js     # Chat room routes
│   ├── contract.routes.js     # Contract routes
│   ├── payment.routes.js      # Payment routes
│   ├── transaction.routes.js  # Transaction routes
│   └── interviewerRating.routes.js # Rating routes
├── middlewares/               # Express middleware functions
│   ├── auth.middleware.js     # JWT authentication middleware
│   └── error.middleware.js    # Global error handling middleware
├── migrations/                # Database schema migrations
├── seeders/                   # Database seed data
├── sockets/                   # Real-time communication
│   ├── chat.socket.js         # Chat functionality
│   └── webrtc.socket.js       # WebRTC signaling
├── utils/                     # Utility functions
│   ├── validation.utils.js    # Input validation helpers
│   ├── nodemailer.utils.js    # Email sending utilities
│   └── interview.utils.js     # Interview-related utilities
├── docs/                      # API documentation
│   ├── swagger.docs.js        # Swagger API definitions
│   └── swaggerOptions.js      # Swagger configuration
└── public/                    # Static files and assets
```

### Core Components

- **Express Application**: RESTful API server with comprehensive middleware stack
- **Sequelize ORM**: Database abstraction layer with PostgreSQL support
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Socket.io**: Real-time bidirectional communication for chat and notifications
- **Stripe Integration**: Secure payment processing and webhook handling
- **Swagger Documentation**: Comprehensive API documentation and testing interface
- **Role-based Authorization**: Multi-level access control (Admin, Recruiter, Candidate, Interviewer)
- **Rate Limiting**: Request throttling for API protection and abuse prevention

## Real-time Communication

### Socket.io Integration

The server implements comprehensive real-time communication features:

```javascript
// Chat functionality
socket.on('join_room', (roomId) => {
  socket.join(roomId);
  socket.to(roomId).emit('user_joined', { userId: socket.userId });
});

socket.on('send_message', (messageData) => {
  socket.to(messageData.roomId).emit('receive_message', messageData);
});

// Typing indicators
socket.on('typing', (data) => {
  socket.to(data.roomId).emit('user_typing', { userId: socket.userId });
});
```

### WebRTC Support

WebRTC signaling for video interviews:

```javascript
// WebRTC signaling
socket.on('video_call_offer', (data) => {
  socket.to(data.targetUserId).emit('video_call_offer', data);
});

socket.on('video_call_answer', (data) => {
  socket.to(data.targetUserId).emit('video_call_answer', data);
});

socket.on('ice_candidate', (data) => {
  socket.to(data.targetUserId).emit('ice_candidate', data);
});
```

## Security Features

- **JWT Authentication**: Secure token-based authentication with access and refresh tokens
- **Rate Limiting**: Express-rate-limit for API endpoint protection
- **CORS Configuration**: Cross-origin resource sharing with configurable origins
- **Helmet Security**: Security headers for protection against common vulnerabilities
- **XSS Protection**: Input sanitization and cross-site scripting prevention
- **Input Validation**: Comprehensive request validation and error handling
- **Role-based Authorization**: Multi-level access control with route protection
- **Password Hashing**: Bcrypt for secure password storage
- **Environment Variables**: Secure configuration management
- **Stripe Webhook Security**: Webhook signature verification for payment security

## Getting Started

### Prerequisites

- **Node.js** (v22.x or higher) - JavaScript runtime environment
- **npm** (v10.x or higher) - Node package manager
- **PostgreSQL** - Database server
- **Stripe Account** - For payment processing (optional for basic functionality)

### Installation

1. **Navigate to the server directory**

   ```bash
   cd server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

### Database Setup

1. **Install PostgreSQL and create database**

   ```bash
   # Create database
   createdb optahire
   ```

2. **Run database migrations**

   ```bash
   # Create database tables
   npx sequelize-cli db:migrate
   ```

3. **Seed the database with initial data**

   ```bash
   # Populate with demo data
   npx sequelize-cli db:seed:all
   ```

### Environment Configuration

Create a `.env` file in the server directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/optahire
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=optahire
DB_HOST=localhost
DB_PORT=5432

# Authentication
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret_minimum_32_characters
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret_minimum_32_characters
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Email Configuration (for password reset)
NODEMAILER_SMTP_SERVICE=gmail
NODEMAILER_SMTP_HOST=smtp.gmail.com
NODEMAILER_SMTP_PORT=587
NODEMAILER_SMTP_EMAIL=your-email@gmail.com
NODEMAILER_SMTP_PASSWORD=your_app_password

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# AI/ML Services Integration
AI_SERVER_URL=http://localhost:5001
```

### Running the Server

```bash
# Development mode with hot reloading
npm run dev

# Production mode
npm start
```

The server will start on:

- **API Server**: [http://localhost:5000](http://localhost:5000)
- **API Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

## Dependencies

- **express 4.21.1** - Fast, unopinionated web framework for Node.js
- **cors 2.8.5** - Cross-origin resource sharing middleware
- **helmet 8.0.0** - Security middleware for setting HTTP headers
- **morgan 1.10.0** - HTTP request logger middleware
- **express-async-handler 1.2.0** - Async error handling wrapper
- **express-rate-limit 7.4.1** - Rate limiting middleware
- **xss-clean 0.1.4** - XSS protection middleware
- **cookie-parser 1.4.7** - Cookie parsing middleware
- **body-parser 1.20.3** - Request body parsing middleware
- **sequelize 6.37.5** - Promise-based ORM for PostgreSQL
- **pg 8.13.1** - PostgreSQL client for Node.js
- **pg-hstore 2.3.4** - Serializing and deserializing JSON data
- **sequelize-cli 6.6.2** - Command line interface for Sequelize
- **jsonwebtoken 9.0.2** - JWT token generation and verification
- **bcryptjs 2.4.3** - Password hashing and verification
- **email-validator 2.0.4** - Email address validation
- **http-status-codes 2.3.0** - HTTP status code constants
- **stripe 17.7.0** - Stripe payment processing integration
- **socket.io 4.8.1** - Real-time bidirectional event-based communication
- **swagger-jsdoc 6.2.8** - Swagger API documentation generator
- **swagger-ui-express 5.0.1** - Swagger UI middleware for Express
- **nodemon 3.1.9** - Development server with auto-restart
- **colors 1.4.0** - Console output coloring
- **dotenv 16.4.5** - Environment variable management
- **nodemailer 6.9.16** - Email sending functionality
- **axios 1.9.0** - HTTP client for external API communication

## Deployment

### Production Environment

The server is configured for multiple deployment platforms:

### Heroku Deployment

1. **Heroku Configuration Files**

   - `Procfile` - Process definition for Heroku

2. **Environment Variables**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set DATABASE_URL=your_production_db_url
   heroku config:set JWT_ACCESS_TOKEN_SECRET=your_secret
   ```

### Vercel Deployment

1. **Vercel Configuration**

   - `vercel.json` - Vercel deployment configuration

2. **Environment Variables**
   Set production environment variables in Vercel dashboard

## API Documentation

Comprehensive API documentation is available via Swagger UI:

- **Development**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Production**: [https://opta-hire-fyp-app-server-4ca9bd7992ab.herokuapp.com/api-docs](https://opta-hire-fyp-app-server-4ca9bd7992ab.herokuapp.com/api-docs)

The documentation includes:

- Complete endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests and responses
- Interactive API testing interface

## Monitoring and Logging

- **Morgan Logging**: HTTP request logging with customizable formats
- **Console Logging**: Colored console output for development debugging
- **Error Tracking**: Comprehensive error handling and logging
- **Performance Monitoring**: Request timing and resource usage tracking
- **Health Checks**: API endpoint health monitoring
- **Database Monitoring**: Sequelize query logging and performance tracking

## Development Tools

- **Nodemon**: Automatic server restart during development
- **Sequelize CLI**: Database migration and seeding management
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting and consistency
- **Swagger**: Interactive API documentation and testing
- **Socket.io Admin UI**: Real-time connection monitoring (development)

### Debugging Tips

- Enable detailed logging with `NODE_ENV=development`
- Check database connections in `config/database.js`
- Verify environment variables are loaded correctly
- Use Swagger UI for API endpoint testing
- Monitor console output for detailed error messages
- Check Socket.io connections in browser developer tools

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

- If you have suggestions for adding or removing features, feel free to [open an issue](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/issues/new) to discuss it, or directly create a pull request.
- Please make sure you check your spelling and grammar.
- Create individual PR for each suggestion.
- Please also read through the [Code Of Conduct](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/blob/master/CODE_OF_CONDUCT.md) before posting your first idea.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the repo
2. Clone the project
3. Create your feature branch (`git checkout -b feature/AmazingFeature`)
4. Commit your changes (`git commit -m "Add some AmazingFeature"`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a pull request

## Authors

- **Muhammad Saad** - Full Stack Developer - [itxsaaad](https://github.com/itxsaaad) - _Project Lead & Backend Architecture_
- **Mirza Moiz** - Backend Developer - [mirza-moiz](https://github.com/mirza-moiz) - _Database Design & API Development_
- **Hassnain Raza** - Frontend Developer - [hassnain512](https://github.com/hassnain512) - _API Integration & Testing_

See also the list of [contributors](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/graphs/contributors)

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Support

Give ⭐️ if you like this project!

<a href="https://www.buymeacoffee.com/itxSaaad"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width="200" /></a>

---

Part of the [OptaHire Project](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern) | Licensed under MIT License
