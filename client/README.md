# OptaHire - Client Application

> This is the frontend client application for OptaHire, our Final Year Project (FYP) for the Bachelor's in Computer Science program at the University of the Punjab Gujranwala Campus (PUGC). The client application provides a modern, responsive interface for the AI-powered recruitment platform, enabling seamless interaction between recruiters, candidates, and interviewers.

<br/>
<div align="center">
  <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern">
    <img src="src/assets/images/logo.png" alt="Logo" width="100" height="100">
  </a>

  <h3 align="center">OptaHire Client</h3>

  <p align="center">
    Modern React Frontend for AI-Powered Recruitment
    <br/>
    <br/>
    <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern"><strong>Explore the main project »</strong></a>
    <br/>
    <br/>
    <a href="https://opta-hire-fyp-app-client.vercel.app/">View Live Demo</a>
    .
    <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/issues">Report Bug</a>
    .
    <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/issues">Request Feature</a>
  </p>
</div>

## Table Of Contents

- [OptaHire - Client Application](#optahire---client-application)
  - [Table Of Contents](#table-of-contents)
  - [About The Client](#about-the-client)
    - [Live URLs](#live-urls)
  - [Key Features](#key-features)
    - [1. User Interface \& Experience](#1-user-interface--experience)
    - [2. Authentication System](#2-authentication-system)
    - [3. Dashboard Management](#3-dashboard-management)
    - [4. Real-time Communication](#4-real-time-communication)
    - [5. Responsive Design](#5-responsive-design)
    - [6. Performance \& Analytics](#6-performance--analytics)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
    - [Source Code Organization](#source-code-organization)
    - [Feature-Based Architecture](#feature-based-architecture)
    - [Component Hierarchy](#component-hierarchy)
  - [API Integration](#api-integration)
    - [RTK Query Implementation](#rtk-query-implementation)
    - [Authentication Flow](#authentication-flow)
    - [Error Handling](#error-handling)
  - [State Management](#state-management)
    - [Redux Store Configuration](#redux-store-configuration)
    - [Feature Slices](#feature-slices)
    - [API Endpoints](#api-endpoints)
  - [Routing \& Navigation](#routing--navigation)
    - [Protected Routes](#protected-routes)
    - [Role-Based Access](#role-based-access)
    - [Layout System](#layout-system)
  - [Component Library](#component-library)
    - [Reusable UI Components](#reusable-ui-components)
    - [Layout Components](#layout-components)
    - [Feature-Specific Components](#feature-specific-components)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Setup](#environment-setup)
    - [Development Server](#development-server)
  - [Build \& Deployment](#build--deployment)
    - [Production Build](#production-build)
    - [Deployment Configuration](#deployment-configuration)
  - [Development Guidelines](#development-guidelines)
    - [Code Style](#code-style)
    - [Component Structure](#component-structure)
    - [State Management Best Practices](#state-management-best-practices)
  - [Performance Optimization](#performance-optimization)
    - [Bundle Optimization](#bundle-optimization)
    - [Code Splitting](#code-splitting)
    - [Caching Strategies](#caching-strategies)
  - [Contributing](#contributing)
  - [Authors](#authors)
  - [License](#license)
  - [Support](#support)

## About The Client

The OptaHire client application is a modern, responsive React-based frontend that provides an intuitive interface for our AI-powered recruitment platform. Built with React 18 and leveraging the latest web technologies, it offers seamless user experiences across different roles including candidates, recruiters, interviewers, and administrators.

The application features a sophisticated state management system using Redux Toolkit Query for efficient data fetching and caching, real-time communication capabilities through Socket.io, and a responsive design implemented with Tailwind CSS. The modular architecture ensures maintainability and scalability while providing optimal performance through advanced optimization techniques.

### Live URLs

- **Production:** [https://opta-hire-fyp-app-client.vercel.app](https://opta-hire-fyp-app-client.vercel.app/)
- **Development:** [https://opta-hire-develop-client.vercel.app](https://opta-hire-develop-client.vercel.app)

## Key Features

### 1. User Interface & Experience

- **Modern Design**: Clean, intuitive interface with consistent design patterns
- **Responsive Layout**: Fully responsive design optimized for desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes with persistent user preferences
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

### 2. Authentication System

- **Secure Login/Register**: JWT-based authentication with form validation
- **Password Management**: Reset password functionality with email verification
- **Profile Verification**: Email verification system for account activation
- **Role-Based Access**: Different interfaces for candidates, recruiters, interviewers, and admins

### 3. Dashboard Management

- **Role-Specific Dashboards**: Customized dashboards for each user type
- **Data Visualization**: Interactive charts and graphs using Recharts
- **Real-time Updates**: Live data updates without page refresh
- **Activity Tracking**: Comprehensive activity logs and notifications

### 4. Real-time Communication

- **Chat System**: Real-time messaging between users
- **Video Interviews**: WebRTC-based video calling for interviews
- **Notifications**: Instant notifications for important events
- **Status Updates**: Live status updates for applications and interviews

### 5. Responsive Design

- **Mobile-First Approach**: Optimized for mobile devices with progressive enhancement
- **Adaptive Layouts**: Layouts that adapt to different screen sizes and orientations
- **Touch-Friendly**: Optimized touch interactions for mobile users
- **Fast Loading**: Optimized for fast loading on all devices

### 6. Performance & Analytics

- **Google Analytics 4**: Comprehensive analytics integration
- **Performance Monitoring**: Real-time performance tracking
- **Error Tracking**: Automated error reporting and monitoring
- **User Experience Metrics**: Core Web Vitals and user interaction tracking

## Tech Stack

- **React 18.3.1** - Modern React with concurrent features and improved performance
- **Vite 5.4.10** - Fast build tool with hot module replacement
- **React Router DOM 6.28.0** - Declarative routing for React applications
- **Redux Toolkit 2.6.0** - Modern Redux with simplified setup and best practices
- **React Redux 9.2.0** - Official React bindings for Redux
- **RTK Query** - Powerful data fetching and caching solution built on Redux Toolkit
- **Tailwind CSS 3.4.14** - Utility-first CSS framework for rapid UI development
- **React Icons 5.3.0** - Popular icon library with consistent styling
- **PostCSS 8.4.47** - CSS post-processing for enhanced styling capabilities
- **Axios 1.8.1** - Promise-based HTTP client for API communication
- **Custom Base Query** - RTK Query integration with Axios for enhanced API handling
- **Socket.io Client 4.8.1** - Real-time bidirectional event-based communication
- **WebRTC Adapter 9.0.3** - Cross-browser WebRTC compatibility layer
- **ESLint 9.13.0** - Code linting for consistent code quality
- **Prettier 3.5.3** - Code formatting with Tailwind CSS plugin
- **React Helmet Async 2.0.5** - Document head management for SEO

## Project Structure

### Source Code Organization

```
src/
├── api/                    # API configuration and utilities
├── assets/                 # Static assets (images, icons)
├── components/            # Reusable UI components
├── features/              # Feature-based modules with RTK Query
├── guards/                # Route protection components
├── hooks/                 # Custom React hooks
├── layouts/               # Layout components for different user roles
├── pages/                 # Page components organized by feature
├── providers/             # Context providers and app-level providers
└── utils/                 # Utility functions and helpers
```

### Feature-Based Architecture

Each feature module contains:

- **API Slice**: RTK Query endpoints for data fetching
- **Components**: Feature-specific UI components
- **Types**: TypeScript interfaces and types
- **Utils**: Feature-specific utility functions

### Component Hierarchy

- **Layout Components**: MainLayout, DashboardLayout for different app sections
- **UI Components**: Reusable components like InputField, Modal, Table
- **Page Components**: Full page components for specific routes
- **Feature Components**: Components specific to business features

## API Integration

### RTK Query Implementation

The application uses RTK Query for efficient API state management:

```javascript
// Example API slice structure
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQueryWithReauth } from '../../api/axiosBaseQueryWithReauth';

export const jobApi = createApi({
  reducerPath: 'jobApi',
  baseQuery: axiosBaseQueryWithReauth,
  tagTypes: ['Job'],
  endpoints: (builder) => ({
    getJobs: builder.query({
      query: (params) => ({
        url: '/jobs',
        method: 'GET',
        params,
      }),
      providesTags: ['Job'],
    }),
    // More endpoints...
  }),
});
```

### Authentication Flow

- **Token Management**: Automatic token refresh with RTK Query
- **Request Interceptors**: Automatic token attachment to requests
- **Error Handling**: Automatic logout on authentication errors

### Error Handling

- **Global Error Boundary**: Catches and handles React errors
- **API Error Management**: Standardized error responses
- **User Feedback**: Toast notifications for user actions

## State Management

### Redux Store Configuration

```javascript
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './features/auth/authSlice';
import { jobApi } from './features/job/jobApi';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    jobApi: jobApi.reducer,
    // Other API slices...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      jobApi.middleware
      // Other API middlewares...
    ),
});
```

### Feature Slices

- **Auth Slice**: User authentication state and actions
- **Theme Slice**: Application theme and UI preferences
- **Notification Slice**: In-app notifications and alerts

### API Endpoints

- **Authentication**: Login, register, refresh token, logout
- **User Management**: Profile, resume, preferences
- **Job Management**: CRUD operations for jobs and applications
- **Communication**: Chat, interviews, notifications

## Routing & Navigation

### Protected Routes

```javascript
// Route protection based on authentication
<Route
  path="/dashboard"
  element={
    <RequireAuth>
      <RequireRole allowedRoles={['candidate', 'recruiter']}>
        <DashboardLayout />
      </RequireRole>
    </RequireAuth>
  }
/>
```

### Role-Based Access

- **Candidate Routes**: Job search, applications, interviews
- **Recruiter Routes**: Job posting, application management, hiring
- **Interviewer Routes**: Interview scheduling, ratings, contracts
- **Admin Routes**: System management, user administration

### Layout System

- **MainLayout**: Public pages with navigation and footer
- **DashboardLayout**: Authenticated pages with sidebar and top navigation
- **InterviewLayout**: Specialized layout for video interviews

## Component Library

### Reusable UI Components

- **InputField**: Customizable form input with validation
- **Modal**: Flexible modal component with various sizes
- **Table**: Data table with sorting, filtering, and pagination
- **Loader**: Loading states for different scenarios
- **Alert**: Notification component for user feedback

### Layout Components

- **Navbar**: Main navigation with user menu
- **Sidebar**: Dashboard navigation for different user roles
- **Footer**: Site footer with links and information
- **Breadcrumbs**: Navigation breadcrumbs for deep pages

### Feature-Specific Components

- **Job Cards**: Display job listings with application actions
- **Application Forms**: Multi-step application process
- **Interview Components**: Video call interface and controls
- **Chat Interface**: Real-time messaging components

## Getting Started

### Prerequisites

- **Node.js 18+** - JavaScript runtime
- **npm 9+** - Package manager

### Installation

1. **Navigate to client directory**

   ```bash
   cd client
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

### Environment Setup

Create a `.env` file in the client directory:

```env
# Server Configuration
VITE_SERVER_URL=http://localhost:5000
VITE_CLIENT_URL=http://localhost:5173

# Analytics (optional)
VITE_GA_MEASUREMENT_ID=your_ga_measurement_id

# Stripe
VITE_STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

```

### Development Server

```bash
# Start development server
npm run dev

# Access the application
# http://localhost:5173
```

## Build & Deployment

### Production Build

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### Deployment Configuration

The application is configured for deployment on Vercel with the following setup:

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Development Guidelines

### Code Style

- **ESLint Configuration**: Consistent code quality enforcement
- **Prettier Integration**: Automatic code formatting with Tailwind CSS support
- **Component Naming**: PascalCase for components, camelCase for functions
- **File Organization**: Feature-based folder structure

### Component Structure

```javascript
// Recommended component structure
import React from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2 }) => {
  // Component logic here

  return <div className="component-wrapper">{/* Component JSX */}</div>;
};

ComponentName.propTypes = {
  prop1: PropTypes.string.required,
  prop2: PropTypes.number,
};

ComponentName.defaultProps = {
  prop2: 0,
};

export default ComponentName;
```

### State Management Best Practices

- **Use RTK Query**: For all API data fetching and caching
- **Local State**: Use useState for component-specific state
- **Global State**: Use Redux for app-wide state management
- **Avoid Prop Drilling**: Use context or Redux for deep component trees

## Performance Optimization

### Bundle Optimization

- **Code Splitting**: Lazy loading of route components
- **Tree Shaking**: Eliminate dead code from bundles
- **Asset Optimization**: Optimized images and static assets

### Code Splitting

```javascript
// Lazy loading for better performance
const LazyComponent = lazy(() => import('./LazyComponent'));

// Usage with Suspense
<Suspense fallback={<Loader />}>
  <LazyComponent />
</Suspense>;
```

### Caching Strategies

- **RTK Query Caching**: Automatic caching of API responses
- **Browser Caching**: Optimized cache headers for static assets
- **Service Worker**: Offline functionality and asset caching

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

- **Muhammad Saad** - Frontend Lead - [itxsaaad](https://github.com/itxsaaad) - _React Development & State Management_
- **Mirza Moiz** - Frontend Developer - [mirza-moiz](https://github.com/mirza-moiz) - _UI/UX Implementation_
- **Hassnain Raza** - Frontend Developer - [hassnain512](https://github.com/hassnain512) - _Component Development & Testing_

See also the list of [contributors](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/graphs/contributors)

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Support

Give ⭐️ if you like this project!

<a href="https://www.buymeacoffee.com/itxSaaad"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width="200" /></a>

---

Part of the [OptaHire Project](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern) | Licensed under MIT License
