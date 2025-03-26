# OptaHire - Optimizing Your Recruitment Journey

> This project is part of our Final Year Project (FYP) for the Bachelor's in Computer Science program at the University of the Punjab Gujranwala Campus (PUGC). The project aims to develop a web application that leverages AI and Machine Learning technologies to optimize the recruitment process for businesses and professionals. The project is developed using the MERN stack (MongoDB, Express.js, React.js, Node.js) and various other technologies and tools. The project is open-source and welcomes contributions from the community.

<br/>
<div align="center">
  <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern">
    <img src="/client/src/assets/images/logo.png" alt="Logo" width="100" height="100">
  </a>

  <h3 align="center">OptaHire</h3>

  <p align="center">
    Optimizing Your Recruitment Journey
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
  - [Features](#features)
    - [1. User \& Authentication Management](#1-user--authentication-management)
    - [2. Job Posting \& Management](#2-job-posting--management)
    - [3. Application Processing](#3-application-processing)
    - [4. Resume Management](#4-resume-management)
    - [5. Interview Coordination](#5-interview-coordination)
    - [6. Communication System](#6-communication-system)
    - [7. Interviewer Marketplace](#7-interviewer-marketplace)
    - [8. Contract \& Payment Processing](#8-contract--payment-processing)
    - [9. System Security \& Performance](#9-system-security--performance)
  - [Built With](#built-with)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [Authors](#authors)
  - [License](#license)
  - [Support](#support)

## About The Project

OptaHire is an AI-powered recruitment platform that aims to optimize the recruitment process for businesses and professionals. The platform offers a range of features such as job posting, resume filtering, interviewer marketplace, video interviews, secure payment processing, and communication tools. The platform leverages AI and Machine Learning technologies to automate and streamline the recruitment process, making it faster, more efficient, and cost-effective. The platform is designed to be user-friendly, secure, and scalable, catering to the needs of recruiters, candidates, and interviewers.

### Production URLs

- **Client URL:** [https://opta-hire-fyp-app-client.vercel.app](https://opta-hire-fyp-app-client.vercel.app/)
- **Server URL:** [https://opta-hire-fyp-app-server-4ca9bd7992ab.herokuapp.com](https://opta-hire-fyp-app-server-4ca9bd7992ab.herokuapp.com)

### Development URLs

- **Client URL:** [https://opta-hire-develop-client.vercel.app](https://opta-hire-develop-client.vercel.app)
- **Server URL:** [https://opta-hire-develop-server.vercel.app](https://opta-hire-develop-server.vercel.app)

## Features

### 1. User & Authentication Management

- **User Profiles:** Create and manage user profiles with different roles (Candidate, Recruiter, Interviewer, Admin).
- **Authentication:** Secure login, logout, and token refresh with JWT authentication.
- **Security Features:** Rate limiting, protected routes, and role-based authorization.
- **Password Management:** Update passwords, reset forgotten passwords, and verify email addresses.
- **Profile Operations:** View, update, and delete user profiles with admin capabilities for user management.

### 2. Job Posting & Management

- **Job Listings:** Post job openings with comprehensive details via recruiter accounts.
- **Job Operations:** Create, view, update, and delete job postings with role-based permissions.
- **Job Accessibility:** Public job search and viewing with protected management functions.
- **Application Tracking:** View all job applications associated with specific job postings.

### 3. Application Processing

- **Application Submission:** Submit job applications as candidates with resume attachments.
- **Application Management:** View, update, and manage applications with role-based permissions.
- **Application Filtering:** Get applications by job ID for efficient management.
- **Status Tracking:** Update and monitor application status through the hiring process.

### 4. Resume Management

- **Resume Creation:** Upload and create professional resumes with detailed information.
- **Resume Operations:** View, update, and delete personal resumes.
- **Admin Controls:** Administrative capabilities for resume management across the platform.

### 5. Interview Coordination

- **Interview Management:** Schedule, update, and manage interviews between candidates and interviewers.
- **Job-Specific Interviews:** Associate interviews with specific job postings.
- **Role-Based Controls:** Different permissions for interviewers, recruiters, and admins.

### 6. Communication System

- **Chat Rooms:** Create and manage chat rooms for secure communication.
- **Message History:** Access complete history of communications within chat rooms.
- **Controlled Access:** Role-based permissions for chat room creation and access.

### 7. Interviewer Marketplace

- **Interviewer Ratings:** Rate and review interviewers based on performance.
- **Rating Management:** Create, view, update, and delete ratings with appropriate permissions.
- **Job & Contract Association:** Associate ratings with specific jobs and contracts.

### 8. Contract & Payment Processing

- **Contract Management:** Create and manage contracts between recruiters and interviewers.
- **Payment Processing:** Secure payment processing with Stripe integration.
- **Transaction Tracking:** Record and monitor all financial transactions within the platform.
- **Payment Workflow:** Structured checkout, capture, and completion process for payments.

### 9. System Security & Performance

- **Rate Limiting:** Prevent abuse with intelligent request rate limiting.
- **Role Authorization:** Comprehensive role-based access control for all system functions.
- **API Protection:** Secure API endpoints with authentication middleware.
- **Transaction Security:** Secure payment processing and financial transaction management.

## Built With

- **Frontend:** React.js (Vite.js), Tailwind CSS, React Router, Redux Toolkit Query, React Redux, React Helmet, React Icons, Axios, Socket.io Client
- **Backend:** Node.js, Express.js, bcryptjs, cors, dotenv, express-async-handler, jsonwebtoken, helmet, morgan, express-rate-limit, xss-clean, cookie-parser, Swagger UI
- **Database:** PostgreSQL, Sequelize ORM
- **Real-time Communication:** Socket.io, WebRTC
- **Documentation:** Swagger JSDoc
- **Authentication:** JSON Web Tokens (JWT)
- **Payment Processing:** Stripe
- **Version Control:** Git and GitHub
- **Deployment:** Vercel (Frontend), Heroku (Backend, PostrgeSQL)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) - JavaScript runtime built on Chrome's V8 JavaScript engine
- [NPM](https://www.npmjs.com/) - Node Package Manager

### Installation

1. Clone the repository

   ```sh
     git clone https://github.com/itxSaaad/opta-hire-ai-recruitment-fyp-app-pern.git
     cd opta-hire-ai-recruitment-fyp-app-pern
   ```

2. Install dependencies for both client and server

   ```sh
      # Install server dependencies
      cd server
      npm install

      # Install client dependencies
      cd ../client
      npm install
   ```

3. Configure environment variables

   **For the server (.env in server directory):**

   ```
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
      JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
      JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
      JWT_ACCESS_TOKEN_EXPIRY=15m
      JWT_REFRESH_TOKEN_EXPIRY=7d

      # Email Configuration
      NODEMAILER_SMTP_SERVICE=gmail
      NODEMAILER_SMTP_HOST=smtp.gmail.com
      NODEMAILER_SMTP_PORT=587
      NODEMAILER_SMTP_EMAIL=your-email@gmail.com
      NODEMAILER_SMTP_PASSWORD=your_app_password

      # Payments
      STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

   **For the client (.env in client directory):**

   ```
    VITE_SERVER_URL=http://localhost:5000
    VITE_CLIENT_URL=http://localhost:5173
   ```

4. Set up the database

   ```sh
     # Navigate to server directory
     cd ../server

     # Create database tables with Sequelize migrations
     npx sequelize-cli db:migrate

     # Populate database with initial data
     npx sequelize-cli db:seed:all
   ```

5. Start the development servers

   ```sh
      # Start the backend server (from server directory)
      npm run dev

      # In a new terminal, start the frontend
      cd ../client
      npm run dev
   ```

6. Access the application

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)
- API Documentation: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

> **Note:** For production deployment, ensure you set appropriate environment variables with secure values and proper production configurations.

## Roadmap

See the [open issues](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern) for a list of proposed features (and known issues).

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

- If you have suggestions for adding or removing projects, feel free to [open an issue](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/issues/new) to discuss it, or directly create a pull request after you edit the _README.md_ file with necessary changes.
- Please make sure you check your spelling and grammar.
- Create individual PR for each suggestion.
- Please also read through the [Code Of Conduct](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/blob/master/CODE_OF_CONDUCT.md) before posting your first idea as well.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the repo
2. Clone the project
3. Create your feature branch (`git checkout -b feature/AmazingFeature`)
4. Commit your changes (`git commit -m "Add some AmazingFeature"`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a pull request

## Authors

- **Muhammad Saad** - Full Stack Developer - [itxsaaad](https://github.com/itxsaaad) - _Project Lead_ - _Handling Frontend, Backend, and Deployment_
- **Mirza Moiz** - Full Stack Developer - [mirza-moiz](https://github.com/mirza-moiz) - _Handling Backend and Database_ - _Documentation_
- **Hassnain Raza** - Front End Developer - [hassnain512](https://github.com/hassnain512) - _Handling Frontend and Deployment_ - _Documentation_

See also the list of [contributors](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/graphs/contributors)

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
