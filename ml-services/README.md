# OptaHire - AI/ML Services

> This module is part of our Final Year Project (FYP) for the Bachelor's in Computer Science program at the University of the Punjab Gujranwala Campus (PUGC). The AI/ML services component leverages Machine Learning technologies to provide intelligent candidate-job matching and automated resume screening capabilities.

<br/>
<div align="center">
  <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern">
    <img src="../client/src/assets/images/logo.png" alt="Logo" width="100" height="100">
  </a>

  <h3 align="center">OptaHire AI/ML Services</h3>

  <p align="center">
    Intelligent Candidate Matching & Resume Analysis
    <br/>
    <br/>
    <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern"><strong>Explore the main project »</strong></a>
    <br/>
    <br/>
    <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/tree/main/ml-services">View ML Docs</a>
    .
    <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/issues">Report Bug</a>
    .
    <a href="https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/issues">Request Feature</a>
  </p>
</div>

## Table Of Contents

- [OptaHire - AI/ML Services](#optahire---aiml-services)
  - [Table Of Contents](#table-of-contents)
  - [About The ML Services](#about-the-ml-services)
  - [API Endpoints](#api-endpoints)
    - [Health Check Endpoints](#health-check-endpoints)
    - [Model Management Endpoints](#model-management-endpoints)
    - [Candidate Processing Endpoints](#candidate-processing-endpoints)
  - [AI Model Training](#ai-model-training)
    - [Training Pipeline](#training-pipeline)
    - [Training Commands](#training-commands)
    - [Training Data Format](#training-data-format)
    - [Synthetic Data Generation](#synthetic-data-generation)
  - [Configuration](#configuration)
    - [Environment Variables](#environment-variables)
    - [Scoring Weights](#scoring-weights)
  - [Architecture](#architecture)
    - [Project Structure](#project-structure)
    - [Core Components](#core-components)
  - [Integration](#integration)
    - [Node.js Backend Integration](#nodejs-backend-integration)
    - [API Communication](#api-communication)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Initial Setup](#initial-setup)
    - [Training the Model](#training-the-model)
    - [Running the Service](#running-the-service)
  - [Dependencies](#dependencies)
    - [Core Flask Dependencies](#core-flask-dependencies)
    - [Machine Learning \& Data Processing](#machine-learning--data-processing)
    - [System Monitoring \& Utilities](#system-monitoring--utilities)
    - [HTTP \& Configuration](#http--configuration)
    - [Data Generation \& Testing](#data-generation--testing)
  - [AI Model Details](#ai-model-details)
    - [Candidate Matching Algorithm](#candidate-matching-algorithm)
    - [Scoring Components](#scoring-components)
    - [Training Process](#training-process)
  - [Monitoring and Security](#monitoring-and-security)
  - [Development Tools](#development-tools)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
    - [Debugging Tips](#debugging-tips)
  - [Contributing](#contributing)
  - [Authors](#authors)
  - [License](#license)
  - [Support](#support)

## About The ML Services

The OptaHire AI/ML Services module represents the intelligent core of our recruitment platform, delivering cutting-edge machine learning capabilities that transform the hiring process. At its heart lies an advanced candidate matching system that employs sophisticated AI algorithms to achieve precise candidate-job alignment through comprehensive multi-factor scoring mechanisms. The service evaluates candidates across multiple dimensions including skills compatibility, experience relevance, education alignment, and industry fit, providing recruiters with detailed insights into each candidate's suitability for specific roles.

Built with scalability and production readiness in mind, the service features a modular Flask-based architecture that supports multiple ML services and controllers, enabling seamless integration with existing systems. The platform includes a built-in synthetic data generation system that creates realistic training scenarios across various industries and job levels, ensuring robust model performance. Real-time processing capabilities deliver fast candidate shortlisting with detailed score breakdowns and comprehensive match explanations, allowing recruiters to make informed decisions quickly.

The service incorporates enterprise-grade features including comprehensive health monitoring, structured logging with colored console output, sophisticated error handling, and configurable request rate limiting. Security is paramount with input validation, CORS configuration, and proxy support ensuring safe operation in production environments. The AI engine leverages TF-IDF vectorization and cosine similarity algorithms for intelligent text matching, while persistent training capabilities save model state and vectorizers to disk, maintaining consistency across service restarts and deployments.

## API Endpoints

### Health Check Endpoints

- `GET /api/v1/health/` - System health check with resource monitoring and service status
- `GET /api/v1/health/ai-service` - Detailed AI service health with model status and capabilities

### Model Management Endpoints

- `GET /api/v1/model/status` - Current model training status and configuration details
- `GET /api/v1/model/metrics` - Comprehensive model performance metrics and component health
- `POST /api/v1/model/train` - Train the AI model with historical recruitment data

### Candidate Processing Endpoints

- `POST /api/v1/shortlist/candidates` - Shortlist top 5 candidates for a job with detailed scoring
- `POST /api/v1/shortlist/preview` - Preview candidate shortlisting without database updates

## AI Model Training

### Training Pipeline

The service includes a comprehensive, interactive training pipeline with colored output and progress tracking:

```bash
# Full training pipeline (generate data + train model + test)
python train_model.py

# Generate training data only
python train_model.py --data-only --examples 500

# Train model with existing data
python train_model.py --train-only

# Test existing trained model
python train_model.py --test-only
```

### Training Commands

| Command                 | Description                             | Example                                            |
| ----------------------- | --------------------------------------- | -------------------------------------------------- |
| `python train_model.py` | Complete training pipeline              | Generates data, trains model, runs tests           |
| `--data-only`           | Only generate synthetic training data   | `python train_model.py --data-only --examples 300` |
| `--train-only`          | Only train model with existing data     | `python train_model.py --train-only`               |
| `--test-only`           | Only test existing trained model        | `python train_model.py --test-only`                |
| `--examples N`          | Number of training examples to generate | `python train_model.py --data-only --examples 500` |

### Training Data Format

The AI model expects training data in the following comprehensive format:

```json
{
  "job": {
    "id": "job-123",
    "title": "Software Engineer",
    "description": "Full-stack development position...",
    "requirements": "3+ years experience with React, Node.js...",
    "category": "IT",
    "company": "Tech Corp",
    "level": "mid"
  },
  "candidate": {
    "id": "candidate-456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  },
  "resume": {
    "userId": "candidate-456",
    "title": "Senior Developer",
    "summary": "Experienced full-stack developer...",
    "headline": "Full Stack Developer | 5 Years Experience",
    "skills": ["JavaScript", "React", "Node.js", "Python"],
    "experience": "5 years of development experience...",
    "education": "BS Computer Science",
    "industry": "Technology",
    "company": "Previous Company",
    "achievements": "Led team of 5 developers; Reduced load time by 40%"
  },
  "outcome": "hired"
}
```

### Synthetic Data Generation

The system includes a sophisticated synthetic data generator that creates realistic training scenarios:

- **60% Good Matches** - Hired candidates with aligned skills and experience
- **25% Poor Matches** - Rejected due to skills/industry mismatch
- **10% Overqualified** - Senior candidates for junior positions
- **5% Underqualified** - Junior candidates for senior positions

## Configuration

### Environment Variables

Create a `.env` file in the `ml-services` directory:

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
CORS_ORIGIN=http://localhost:5173,http://localhost:5000

# AI Model Configuration
MODEL_VERSION=1.0.0
MAX_CANDIDATES=5
MIN_SIMILARITY=0.3
MODEL_STORAGE_PATH=./data/models

# Scoring Weights (must sum to 1.0)
WEIGHT_SKILLS=0.40
WEIGHT_EXPERIENCE=0.30
WEIGHT_EDUCATION=0.15
WEIGHT_INDUSTRY=0.10
WEIGHT_TEXT=0.05

# Performance Settings
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_STORAGE=memory://
ENABLE_CACHING=false

# Logging Configuration
LOG_LEVEL=DEBUG
LOG_TO_FILE=false
ENABLE_COLOR_LOGS=true
```

### Scoring Weights

The AI model uses configurable weights for different matching components:

| Component            | Default Weight | Description                                         |
| -------------------- | -------------- | --------------------------------------------------- |
| Skills Match         | 40%            | Technical skills alignment with job requirements    |
| Experience Relevance | 30%            | Relevance of work experience to the role            |
| Education Alignment  | 15%            | Educational background compatibility                |
| Industry Experience  | 10%            | Industry-specific knowledge and context             |
| Text Similarity      | 5%             | Overall semantic similarity between job and profile |

## Architecture

### Project Structure

```
ml-services/
├── app.py                      # Main Flask application with enhanced features
├── train_model.py              # Interactive training pipeline with progress tracking
├── requirements.txt            # Python dependencies
├── .env                        # Environment configuration
├── config/
│   └── settings.py             # Centralized configuration management
├── controllers/                # API endpoint controllers (MVC pattern)
│   ├── health_controller.py    # System and AI health monitoring
│   ├── model_controller.py     # Model training and management
│   └── shortlist_controller.py # Candidate processing and shortlisting
├── models/                     # AI models and algorithms
│   └── candidate_matcher.py    # Core matching algorithm with TF-IDF
├── utils/                      # Utility functions
│   ├── response_utils.py       # Standardized API responses
│   ├── validation_utils.py     # Input validation helpers
│   └── error_utils.py          # Error handling and logging
├── middlewares/                # Request/response middleware
│   └── error_middleware.py     # Global error handling
├── data_generation/            # Synthetic data generation
│   └── synthetic_data_generator.py # Comprehensive training data generator
└── data/                       # Model storage and training data
    ├── models/                 # Trained model files and vectorizers
    │   ├── text_vectorizer.pkl
    │   ├── skills_vectorizer.pkl
    │   └── training_state.json
    └── optahire_training_data.json # Generated training data
```

### Core Components

- **CandidateMatcher**: Main AI model using TF-IDF vectorization and cosine similarity
- **Controllers**: RESTful API endpoints following MVC architecture
- **Synthetic Data Generator**: Creates realistic training scenarios across multiple industries
- **Configuration System**: Environment-based configuration with validation
- **Training Pipeline**: Interactive command-line interface with progress tracking

## Integration

### Node.js Backend Integration

The AI service integrates seamlessly with your Node.js backend through RESTful APIs:

```javascript
// Shortlist candidates when job is closed
const shortlistCandidates = async (jobId, applications) => {
  try {
    const response = await axios.post(`${AI_SERVER_URL}/api/v1/shortlist/candidates`, {
      job: jobData,
      applications: candidateApplications,
    });

    const { shortlisted_candidates, total_applications } = response.data.data;

    // Update application statuses in database
    for (const candidate of shortlisted_candidates) {
      await Application.findByIdAndUpdate(candidate.application_id, {
        status: 'shortlisted',
        aiScore: candidate.total_score,
        matchExplanation: candidate.match_explanation,
      });
    }

    return shortlisted_candidates;
  } catch (error) {
    console.error('AI shortlisting failed:', error.message);
    throw error;
  }
};

// Preview shortlisting before applying changes
const previewShortlist = async (jobData, applications) => {
  const response = await axios.post(`${AI_SERVER_URL}/api/v1/shortlist/preview`, {
    job: jobData,
    applications: applications,
  });

  return response.data.data.shortlisted_candidates;
};
```

### API Communication

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Successfully shortlisted 5 candidates from 23 applications",
  "data": {
    "shortlisted_candidates": [...],
    "total_applications": 23,
    "shortlisted_count": 5,
    "job_id": "job-123",
    "processing_timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)
- Node.js backend server (for full integration)

### Installation

1. **Navigate to the ml-services directory**

   ```bash
   cd ml-services
   ```

2. **Create and activate virtual environment**

   ```bash
   # Create virtual environment
   python -m venv venv

   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

### Initial Setup

1. **Configure environment variables**

   ```bash
   # Copy example configuration
   cp .env.example .env

   # Edit .env with your specific configuration
   nano .env
   ```

2. **Download NLTK data (required for text processing)**

   ```python
   python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
   ```

### Training the Model

1. **Generate training data and train the model**

   ```bash
   # Full training pipeline with default 200 examples
   python train_model.py

   # Generate more training examples for better accuracy
   python train_model.py --examples 500
   ```

2. **Monitor training progress**

   The training pipeline provides colored output showing:

   - System resource usage
   - Data generation progress
   - Model training status
   - Validation results

### Running the Service

```bash
# Start the AI service
python app.py
```

The service will display:

- Server status and configuration
- Available API endpoints
- System resource usage
- Health check URLs

## Dependencies

### Core Flask Dependencies

- **Flask 3.0.0** - Modern web framework with latest features
- **Flask-CORS 4.0.0** - Cross-origin resource sharing support
- **Flask-Limiter** - Request rate limiting and throttling

### Machine Learning & Data Processing

- **scikit-learn 1.3.2** - Machine learning algorithms and TF-IDF vectorization
- **numpy 1.26.2** - Numerical computing and array operations
- **joblib 1.3.2** - Efficient model serialization and persistence
- **nltk 3.8.1** - Natural language processing and text tokenization

### System Monitoring & Utilities

- **psutil 5.9.6** - System and process monitoring
- **colorlog 6.8.0** - Colored logging output for better debugging
- **colorama** - Cross-platform colored terminal text support

### HTTP & Configuration

- **requests 2.31.0** - HTTP client library for API communication
- **python-dotenv 1.0.0** - Environment variable management
- **werkzeug 3.0.1** - WSGI utilities and security features

### Data Generation & Testing

- **Faker 20.1.0** - Realistic synthetic data generation
- **pytest 7.4.3** - Testing framework for unit and integration tests
- **pytest-flask 1.3.0** - Flask-specific testing utilities

## AI Model Details

### Candidate Matching Algorithm

The AI model uses a sophisticated multi-factor scoring approach:

1. **Text Preprocessing**: Job descriptions and resumes are cleaned and tokenized
2. **TF-IDF Vectorization**: Converts text to numerical vectors for similarity calculation
3. **Skills Vectorization**: Specialized processing for technical skills and keywords
4. **Cosine Similarity**: Measures semantic similarity between job and candidate profiles
5. **Weighted Scoring**: Combines multiple factors using configurable weights

### Scoring Components

- **Skills Match (40%)**: Direct skills alignment using keyword matching and semantic similarity
- **Experience Relevance (30%)**: Work experience relevance using text similarity algorithms
- **Education Alignment (15%)**: Educational background compatibility and level assessment
- **Industry Experience (10%)**: Industry-specific knowledge and company background
- **Text Similarity (5%)**: Overall semantic compatibility between job and profile

### Training Process

1. **Data Validation**: Ensures training data quality and completeness
2. **Text Vectorization**: Trains TF-IDF vectorizers on job descriptions and resumes
3. **Model Persistence**: Saves trained vectorizers and metadata to disk
4. **Validation Testing**: Verifies model functionality with test predictions

## Monitoring and Security

- **Health Endpoints**: Comprehensive system and AI model health monitoring
- **Enhanced Logging**: Structured logging with colored output and configurable levels
- **Error Tracking**: Detailed error handling with categorized error codes
- **Performance Metrics**: Request timing, memory usage, and CPU monitoring
- **Input Validation**: Thorough request validation and data sanitization
- **CORS Configuration**: Secure cross-origin resource sharing setup
- **Rate Limiting**: Configurable request rate limiting per endpoint
- **Security Headers**: Enhanced security headers and proxy support
- **Graceful Shutdown**: Clean application shutdown with signal handling

## Development Tools

- **Interactive Training Pipeline**: Command-line interface with progress tracking and colored output
- **System Resource Monitoring**: Real-time CPU, memory, and disk usage display
- **Model Testing Framework**: Automated model validation and performance testing
- **Synthetic Data Generator**: Comprehensive training data generation across multiple scenarios
- **Environment Configuration**: Flexible configuration via environment variables
- **Development Mode**: Enhanced debugging with detailed request/response logging
- **Hot Reloading**: Automatic service restart during development

## Troubleshooting

### Common Issues

1. **Model Not Trained Error**

   ```bash
   # Solution: Train the model first
   python train_model.py
   ```

2. **Port Already in Use**

   ```bash
   # Change port in .env file
   PORT=5002
   ```

3. **Memory Issues During Training**

   ```bash
   # Reduce training examples
   python train_model.py --examples 100
   ```

4. **NLTK Data Missing**
   ```python
   # Download required NLTK data
   python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
   ```

### Debugging Tips

- Enable debug mode in `.env` for detailed logging
- Check system health at `/api/v1/health/`
- Monitor AI service status at `/api/v1/health/ai-service`
- Review training logs for data quality issues
- Verify model files exist in `data/models/` directory

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

- **Muhammad Saad** - AI/ML Lead - [itxsaaad](https://github.com/itxsaaad)
- **Mirza Moiz** - ML Engineering - [mirza-moiz](https://github.com/mirza-moiz)
- **Hassnain Raza** - Data Processing - [hassnain512](https://github.com/hassnain512)

See also the list of [contributors](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern/graphs/contributors)

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Support

Give ⭐️ if you like this project!

<a href="https://www.buymeacoffee.com/itxSaaad"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width="200" /></a>

---

Part of the [OptaHire Project](https://github.com/itxsaaad/opta-hire-ai-recruitment-fyp-app-pern) | Licensed under MIT License
