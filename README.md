# OptaHire - Optimizing Your Recruitment Journey

> This project is part of our Final Year Project (FYP) for the Bachelor's in Computer Science program at the University of the Punjab Gujranwala Campus (PUGC). The project aims to develop a comprehensive web application that leverages AI and Machine Learning technologies to optimize the recruitment process for businesses and professionals. The project is developed using the PERN stack (PostgreSQL, Express.js, React.js, Node.js) with Python-based AI services and various other modern technologies.

<br/>
<div align="center">
   <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern">
      <img src="./client/src/assets/images/logo.png" alt="Logo" width="100" height="100">
   </a>

   <h3 align="center">OptaHire</h3>

   <p align="center">
      AI-Powered Recruitment Platform with Intelligent Candidate Matching
      <br/>
      <br/>
      <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern"><strong>Explore the docs »</strong></a>
      <br/>
      <br/>
      <a href="https://opta-hire-fyp-app-client.vercel.app/">View Demo</a>
      .
      <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/issues">Report Bug</a>
      .
      <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/issues">Request Feature</a>
   </p>
</div>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

## Table Of Contents

- [OptaHire - Optimizing Your Recruitment Journey](#optahire---optimizing-your-recruitment-journey)
  - [Table Of Contents](#table-of-contents)
  - [About The Project](#about-the-project)
    - [Production URLs](#production-urls)
    - [Development URLs](#development-urls)
    - [Project Modules](#project-modules)
  - [Technology Stack](#technology-stack)
    - [Frontend (Client)](#frontend-client)
    - [Backend (Server)](#backend-server)
    - [AI/ML Services](#aiml-services)
    - [Infrastructure \& Deployment](#infrastructure--deployment)
  - [Key Features](#key-features)
    - [1. AI-Powered Candidate Matching](#1-ai-powered-candidate-matching)
    - [2. Comprehensive User Management](#2-comprehensive-user-management)
    - [3. Advanced Job \& Application Processing](#3-advanced-job--application-processing)
    - [4. Real-time Communication System](#4-real-time-communication-system)
    - [5. Integrated Video Interview Platform](#5-integrated-video-interview-platform)
    - [6. Recruiter \& Interviewer Management](#6-recruiter--interviewer-management)
    - [7. Secure Payment Processing](#7-secure-payment-processing)
    - [8. Modern React Frontend](#8-modern-react-frontend)
    - [9. Enterprise-Level Security](#9-enterprise-level-security)
  - [Project Structure](#project-structure)
  - [Module Documentation](#module-documentation)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Full Stack Installation](#full-stack-installation)
    - [Environment Configuration](#environment-configuration)
    - [Database Setup](#database-setup)
    - [AI Model Training](#ai-model-training)
    - [Running the Application](#running-the-application)
  - [API Documentation](#api-documentation)
  - [Deployment](#deployment)
    - [Production Environment](#production-environment)
    - [Deployment Platforms](#deployment-platforms)
  - [Performance \& Monitoring](#performance--monitoring)
  - [Security Features](#security-features)
  - [Contributing](#contributing)
    - [Contributing Guidelines](#contributing-guidelines)
  - [Authors](#authors)
  - [License](#license)
  - [Support](#support)

## About The Project

OptaHire is a cutting-edge, AI-powered recruitment platform designed to revolutionize the hiring process for modern businesses. Built as a comprehensive full-stack application, it combines the power of artificial intelligence with intuitive user interfaces to create an efficient, scalable, and intelligent recruitment ecosystem.

The platform addresses key challenges in traditional recruitment by leveraging machine learning algorithms for intelligent candidate-job matching, automated resume screening, and comprehensive application processing. With support for multiple user roles including candidates, recruiters, interviewers, and administrators, OptaHire provides tailored experiences that streamline the entire recruitment lifecycle.

### Production URLs

- **Client Application:** [https://opta-hire-fyp-app-client.vercel.app](https://opta-hire-fyp-app-client.vercel.app/)
- **Backend API Server:** [https://opta-hire-fyp-app-server-4ca9bd7992ab.herokuapp.com](https://opta-hire-fyp-app-server-4ca9bd7992ab.herokuapp.com)
- **AI/ML Services:** [https://opta-hire-fyp-app-ml-services.onrender.com](https://opta-hire-fyp-app-ml-services.onrender.com)

### Development URLs

- **Client Development:** [https://opta-hire-develop-client.vercel.app](https://opta-hire-develop-client.vercel.app)
- **Server Development:** [https://opta-hire-develop-server.vercel.app](https://opta-hire-develop-server.vercel.app)

### Project Modules

1. **[Client Application](/client)** - Modern React frontend with Redux state management
2. **[Server Backend](/server)** - RESTful API built with Node.js and Express.js
3. **[AI/ML Services](/ml-services)** - Python-based machine learning services for intelligent matching

## Technology Stack

### Frontend (Client)

- React 18 with Vite for modern development
- Redux Toolkit Query for state management
- Tailwind CSS for responsive design
- Socket.io Client for real-time communication
- WebRTC for video interviews

### Backend (Server)

- Node.js with Express.js framework
- PostgreSQL with Sequelize ORM
- JWT authentication with refresh tokens
- Socket.io for real-time features
- Stripe integration for payments

### AI/ML Services

- Python with Flask framework
- Scikit-learn for machine learning
- TF-IDF vectorization for text analysis
- Synthetic data generation for training
- RESTful API for model inference

### Infrastructure & Deployment

- Vercel for frontend hosting
- Heroku for backend and database
- Render for AI/ML services
- GitHub for version control

## Key Features

### 1. AI-Powered Candidate Matching

- **Intelligent Scoring Algorithm**: Multi-factor scoring system analyzing skills, experience, education, and industry fit
- **TF-IDF Vectorization**: Advanced text analysis for semantic matching between job requirements and candidate profiles
- **Automated Shortlisting**: AI automatically identifies top 5 candidates from application pools
- **Configurable Weights**: Customizable scoring parameters for different recruitment priorities
- **Match Explanations**: Detailed scoring breakdowns helping recruiters understand AI recommendations

### 2. Comprehensive User Management

- **Multi-Role Support**: Candidate, Recruiter, Interviewer, and Admin role management
- **Secure Authentication**: JWT-based authentication with refresh token capabilities
- **Profile Management**: Comprehensive user profiles with role-specific information
- **Email Verification**: Secure account activation and password reset functionality
- **Role-Based Authorization**: Granular permissions controlling feature access

### 3. Advanced Job & Application Processing

- **Dynamic Job Posting**: Rich job creation with detailed requirements and company information
- **Application Tracking**: Complete application lifecycle management with status updates
- **Resume Management**: Multiple resume support with version control
- **Bulk Operations**: Efficient handling of multiple applications and candidates
- **Search & Filtering**: Advanced search capabilities with multiple filter criteria

### 4. Real-time Communication System

- **Live Chat Rooms**: Secure messaging between recruiters, candidates, and interviewers
- **Instant Notifications**: Real-time updates for application status changes and system events
- **Socket.io Integration**: Bidirectional communication for immediate updates
- **Message History**: Persistent chat history with searchable archives
- **Typing Indicators**: Real-time typing notifications for better user experience

### 5. Integrated Video Interview Platform

- **WebRTC Video Calls**: Browser-based video interviews without additional software
- **Interview Scheduling**: Flexible scheduling system with calendar integration
- **Recording Capabilities**: Optional interview recording for review purposes
- **Screen Sharing**: Built-in screen sharing for technical assessments
- **Call Quality Monitoring**: Network quality indicators and adaptive bitrate

### 6. Recruiter & Interviewer Management

- **Rating & Review System**: Comprehensive feedback system for interviewer performance
- **Contract Management**: Formal agreements between recruiters and interviewers

### 7. Secure Payment Processing

- **Stripe Integration**: Secure payment processing for interviewer services
- **Automated Invoicing**: Automatic invoice generation and payment tracking
- **Transaction History**: Detailed financial records and reporting
- **Multiple Payment Methods**: Support for various payment options
- **Webhook Security**: Secure payment confirmation with signature verification

### 8. Modern React Frontend

- **Responsive Design**: Mobile-first design optimized for all devices
- **Redux State Management**: Efficient state management with RTK Query
- **Component Library**: Reusable UI components for consistent user experience
- **Dark/Light Themes**: User preference-based theme switching
- **Progressive Web App**: Offline capabilities and app-like experience

### 9. Enterprise-Level Security

- **Rate Limiting**: API protection against abuse and DDoS attacks
- **XSS Protection**: Input sanitization and cross-site scripting prevention
- **CORS Configuration**: Secure cross-origin resource sharing
- **SQL Injection Prevention**: Parameterized queries and ORM protection
- **Data Encryption**: Secure data transmission and storage

## Project Structure

```
opta-hire-ai-recruitment-fyp-app-pern/
├── client/                     # React frontend application
│   ├── src/
│   │   ├── api/               # API configuration and utilities
│   │   ├── components/        # Reusable UI components
│   │   ├── features/          # Feature-based modules with RTK Query
│   │   ├── pages/             # Page components
│   │   ├── layouts/           # Layout components
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   └── package.json           # Frontend dependencies
├── server/                     # Node.js backend application
│   ├── controllers/           # Request handlers and business logic
│   ├── models/                # Sequelize database models
│   ├── routes/                # API route definitions
│   ├── middlewares/           # Express middleware functions
│   ├── migrations/            # Database schema migrations
│   ├── seeders/               # Database seed data
│   ├── sockets/               # Real-time communication
│   ├── utils/                 # Utility functions
│   └── app.js                 # Main application entry point
├── ml-services/               # Python AI/ML services
│   ├── controllers/           # API endpoint controllers
│   ├── models/                # AI models and algorithms
│   ├── data_generation/       # Synthetic data generation
│   ├── utils/                 # Utility functions
│   ├── config/                # Configuration management
│   └── app.py                 # Flask application entry point
├── docs/                      # Project documentation
├── .github/                   # GitHub workflows and templates
├── README.md                  # Main project documentation
└── LICENSE                    # Project license
```

## Module Documentation

Each module contains comprehensive documentation:

- **[Client Documentation](/client/README.md)** - Frontend architecture, components, and development guidelines
- **[Server Documentation](/server/README.md)** - Backend API endpoints, database schema, and deployment
- **[AI/ML Services Documentation](/ml-services/README.md)** - Machine learning models, training pipeline, and AI endpoints

## Getting Started

### Prerequisites

- **Node.js** (v18.x or higher) - JavaScript runtime environment
- **npm** (v9.x or higher) - Node package manager
- **Python** (v3.8 or higher) - For AI/ML services
- **PostgreSQL** (v13.x or higher) - Database server
- **Git** - Version control system

### Full Stack Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/itxSaaad/opta-hire-ai-recruitment-fyp-app-pern.git

   cd opta-hire-ai-recruitment-fyp-app-pern
   ```

2. **Install backend dependencies**

   ```bash
   cd server

   npm install

   cd ..
   ```

3. **Install frontend dependencies**

   ```bash
   cd client

   npm install

   cd ..
   ```

4. **Setup AI/ML services**

   ```bash
   cd ml-services

   python -m venv venv # On Windows:
   venv\Scripts\activate # On macOS/Linux:

   source venv/bin/activate

   pip install -r requirements.txt

   cd ..
   ```

### Environment Configuration

Create `.env` files in each module directory:

**Server (.env in server directory):**

```env
# Environment Configuration
NODE_ENV=development
PORT=5000

# URLs Configuration
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
AI_SERVER_URL=http://localhost:5001

# CORS Configuration
CORS_ORIGIN=<your_client_url>

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/optahire
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=optahire
DB_HOST=localhost
DB_PORT=5432

# Authentication
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret_minimum_32_characters
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret_minimum_32_characters
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=30d

# Email Configuration
NODEMAILER_SMTP_SERVICE=gmail
NODEMAILER_SMTP_HOST=smtp.gmail.com
NODEMAILER_SMTP_PORT=465
NODEMAILER_SMTP_EMAIL=your-email@gmail.com
NODEMAILER_SMTP_PASSWORD=your_app_password

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

**Client (.env in client directory):**

```env
# URLs Configuration
VITE_CLIENT_URL=http://localhost:5173
VITE_SERVER_URL=http://localhost:5000

# Stripe Configuration
VITE_STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Analytics Configuration
VITE_GA_TRACKING_ID=your_google_analytics_tracking_id
```

**AI/ML Services (.env in ml-services directory):**

```env
# Environment Configuration
FLASK_ENV=development
DEBUG=true

# Server Configuration
HOST=127.0.0.1
PORT=5001

# External Services URLs
CLIENT_URL=http://localhost:5173
NODE_SERVER_URL=http://localhost:5000

# CORS Configuration
CORS_ORIGIN=<your_client_url>

# Production URLs (set in production environment)
PROD_CLIENT_URL=<your_production_client_url>
PROD_NODE_SERVER_URL=<your_production_node_server_url>

# AI Model Configuration
MODEL_VERSION=1.0.0
MAX_CANDIDATES=5
MIN_SIMILARITY=0.3
MODEL_STORAGE_PATH=data/models

# Scoring Weights (must sum to 1.0)
WEIGHT_SKILLS=0.40
WEIGHT_EXPERIENCE=0.30
WEIGHT_EDUCATION=0.15
WEIGHT_INDUSTRY=0.10
WEIGHT_TEXT=0.05

# Performance Settings
ENABLE_CACHING=false
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_STORAGE=memory://

# Logging Configuration
LOG_LEVEL=DEBUG
LOG_TO_FILE=false
ENABLE_COLOR_LOGS=true
```

### Database Setup

1. **Create PostgreSQL database**

   ```bash
   createdb optahire
   ```

2. **Run migrations and seeders**

   ```bash
   cd server
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   cd ..
   ```

### AI Model Training

```bash
cd ml-services

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Train the AI model with synthetic data
python train_model.py

# Or generate more training examples for better accuracy
python train_model.py --examples 500

cd ..
```

### Running the Application

Start all services in separate terminals:

1. **Start the backend server**

   ```bash
   cd server

   npm run dev # Server runs on http://localhost:5000
   ```

2. **Start the AI/ML services**

   ```bash
   cd ml-services

   source venv/bin/activate  # or venv\Scripts\activate on Windows

   python app.py # AI services run on http://localhost:5001
   ```

3. **Start the frontend client**

   ```bash
   cd client

   npm run dev # Client runs on http://localhost:5173
   ```

4. **Access the application**

   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)
   - **API Documentation:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
   - **AI Services:** [http://localhost:5001](http://localhost:5001)

## API Documentation

Comprehensive API documentation is available via Swagger UI:

- **Development:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Production:** [https://opta-hire-fyp-app-server-4ca9bd7992ab.herokuapp.com/api-docs](https://opta-hire-fyp-app-server-4ca9bd7992ab.herokuapp.com/api-docs)

The documentation includes:

- Complete endpoint descriptions and examples
- Authentication requirements and token management
- Request/response schemas with validation rules
- Interactive testing interface for all endpoints

## Deployment

### Production Environment

The application is deployed across multiple platforms for optimal performance:

- **Frontend**: Vercel for fast global CDN delivery
- **Backend**: Heroku with PostgreSQL database
- **AI Services**: Render for reliable Python hosting
- **Monitoring**: Integrated health checks and error tracking

### Deployment Platforms

1. **Vercel (Frontend)**

   - Automatic deployments from GitHub
   - Edge network optimization
   - Environment variable management

2. **Heroku (Backend & Database)**

   - Managed PostgreSQL database
   - Automatic SSL certificates
   - Horizontal scaling capabilities

3. **Render (AI/ML Services)**
   - Python runtime optimization
   - Persistent storage for trained models
   - Auto-scaling based on demand

## Performance & Monitoring

- **Performance Metrics**: Core Web Vitals tracking
- **Error Monitoring**: Sentry integration for error tracking
- **Analytics**: Google Analytics 4 for user behavior
- **Health Checks**: Comprehensive system health monitoring
- **Load Testing**: Performance testing with multiple user scenarios

## Security Features

- **Authentication Security**: JWT with refresh tokens and secure storage
- **Input Validation**: Comprehensive request validation and sanitization
- **SQL Injection Prevention**: Parameterized queries and ORM protection
- **XSS Protection**: Content Security Policy and input sanitization
- **Rate Limiting**: API endpoint protection against abuse
- **HTTPS Enforcement**: SSL/TLS encryption for all communications
- **CORS Configuration**: Secure cross-origin resource sharing
- **Environment Security**: Secure environment variable management

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

- If you have suggestions for adding or removing projects, feel free to [open an issue](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/issues/new) to discuss it, or directly create a pull request after you edit the _README.md_ file with necessary changes.
- Please make sure you check your spelling and grammar.
- Create individual PR for each suggestion.
- Please also read through the [Code Of Conduct](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/blob/master/CODE_OF_CONDUCT.md) before posting your first idea as well.

### Contributing Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow the code style guidelines for each module
4. Write tests for new functionality
5. Ensure all tests pass
6. Update documentation as needed
7. Commit your changes (`git commit -m "Add some AmazingFeature"`)
8. Push to the branch (`git push origin feature/AmazingFeature`)
9. Open a pull request

## Authors

- **Muhammad Saad** - Full Stack Developer & Project Lead - [itxsaaad](https://github.com/itxsaaad) - _Frontend, Backend, AI/ML, and Deployment_
- **Mirza Moiz** - Full Stack Developer - [mirza-moiz](https://github.com/mirza-moiz) - _Backend Development, Database Design, and Documentation_
- **Hassnain Raza** - Frontend Developer - [hassnain512](https://github.com/hassnain512) - _Frontend Development, Testing, and Documentation_

See also the list of [contributors](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/graphs/contributors) who participated in this project.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Support

Give ⭐️ if you like this project!

<a href="https://www.buymeacoffee.com/itxSaaad"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width="200" /></a>

<!-- MARKDOWN LINKS & IMAGES -->

[contributors-shield]: https://img.shields.io/github/contributors/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern.svg?style=for-the-badge
[contributors-url]: https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern.svg?style=for-the-badge
[forks-url]: https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/network/members
[stars-shield]: https://img.shields.io/github/stars/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern.svg?style=for-the-badge
[stars-url]: https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/stargazers
[issues-shield]: https://img.shields.io/github/issues/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern.svg?style=for-the-badge
[issues-url]: https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/issues
[license-shield]: https://img.shields.io/github/license/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern.svg?style=for-the-badge
[license-url]: https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/blob/main/LICENSE.md
