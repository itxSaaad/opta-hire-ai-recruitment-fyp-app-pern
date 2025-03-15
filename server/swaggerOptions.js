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
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'phone', 'password'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the user.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          firstName: {
            type: 'string',
            description: "User's first name.",
            example: 'John',
          },
          lastName: {
            type: 'string',
            description: "User's last name.",
            example: 'Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            description: "User's email address.",
            example: 'john.doe@example.com',
          },
          phone: {
            type: 'string',
            description: "User's phone number in international format.",
            example: '+12345678901',
          },
          password: {
            type: 'string',
            description: 'Hashed user password.',
            example: '$2a$10$Vb9...',
          },
          otp: {
            type: 'string',
            description: 'One-time password for verification (if applicable).',
            example: '123456',
          },
          otpExpires: {
            type: 'string',
            format: 'date-time',
            description: 'Expiration timestamp for the OTP.',
            example: '2025-03-15T12:00:00Z',
          },
          isVerified: {
            type: 'boolean',
            description: 'Indicates if the user has been verified.',
            example: false,
          },
          isLinkedinVerified: {
            type: 'boolean',
            description:
              "Indicates if the user's LinkedIn account is verified.",
            example: false,
          },
          isAdmin: {
            type: 'boolean',
            description: 'Indicates if the user has admin privileges.',
            example: false,
          },
          isRecruiter: {
            type: 'boolean',
            description: 'Indicates if the user is a recruiter.',
            example: false,
          },
          isInterviewer: {
            type: 'boolean',
            description: 'Indicates if the user is an interviewer.',
            example: false,
          },
          isCandidate: {
            type: 'boolean',
            description: 'Indicates if the user is a candidate.',
            example: true,
          },
          isTopRated: {
            type: 'boolean',
            description: 'Indicates if the user is marked as top rated.',
            example: false,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the user was created.',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the user was last updated.',
          },
          deletedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Timestamp when the user was soft-deleted.',
          },
        },
      },
      Resume: {
        type: 'object',
        required: ['userId'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the resume.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          title: {
            type: 'string',
            description: 'Title of the resume.',
            example: 'Senior Software Developer Resume',
            minLength: 2,
            maxLength: 100,
          },
          summary: {
            type: 'string',
            description: 'Brief summary of professional background.',
            example:
              'Experienced software developer with 8+ years in full-stack development...',
            minLength: 50,
            maxLength: 500,
          },
          headline: {
            type: 'string',
            description: 'Professional headline.',
            example:
              'Full Stack JavaScript Developer specialized in MERN stack',
            minLength: 10,
            maxLength: 150,
          },
          skills: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'List of professional skills.',
            example: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
            minItems: 1,
            maxItems: 20,
          },
          experience: {
            type: 'string',
            description: 'Professional experience details.',
            example: 'Senior Developer at XYZ Corp (2019-Present)...',
          },
          education: {
            type: 'string',
            description: 'Education background details.',
            example:
              'MSc Computer Science, University of Technology (2015-2017)',
          },
          industry: {
            type: 'string',
            description: 'Industry sector.',
            example: 'Information Technology',
            minLength: 2,
            maxLength: 50,
          },
          availability: {
            type: 'string',
            description: 'Candidate availability status.',
            example: 'Two weeks',
            enum: ['Immediate', 'Two weeks', 'One month', 'More than a month'],
          },
          company: {
            type: 'string',
            description: 'Current or most recent company.',
            example: 'Tech Innovations Inc',
            minLength: 2,
            maxLength: 100,
          },
          achievements: {
            type: 'string',
            description: 'Notable professional achievements.',
            example: 'Led development of award-winning mobile application...',
            maxLength: 1000,
          },
          rating: {
            type: 'number',
            format: 'float',
            description: 'Resume rating score.',
            example: 4.5,
            minimum: 0,
            maximum: 5,
          },
          portfolio: {
            type: 'string',
            format: 'uri',
            description: 'Portfolio website URL.',
            example: 'https://portfolio.example.com',
          },
          userId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the user who owns this resume.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the resume was created.',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the resume was last updated.',
          },
          deletedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Timestamp when the resume was soft-deleted.',
          },
        },
      },
      Job: {
        type: 'object',
        required: [
          'title',
          'description',
          'company',
          'requirements',
          'benefits',
          'salaryRange',
          'category',
          'location',
          'recruiterId',
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the job.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          title: {
            type: 'string',
            description: 'Title of the job posting.',
            example: 'Senior Software Developer',
            minLength: 2,
            maxLength: 100,
          },
          description: {
            type: 'string',
            description: 'Detailed description of the job position.',
            example:
              'We are looking for an experienced software developer to join our team...',
            minLength: 50,
            maxLength: 5000,
          },
          company: {
            type: 'string',
            description: 'Name of the company offering the job.',
            example: 'Tech Innovations Inc',
            minLength: 2,
            maxLength: 100,
          },
          requirements: {
            type: 'string',
            description: 'Requirements for the job position.',
            example:
              '5+ years of experience with JavaScript, proficiency in React and Node.js...',
            minLength: 50,
            maxLength: 2000,
          },
          benefits: {
            type: 'string',
            description: 'Benefits offered with the position.',
            example:
              'Health insurance, remote work options, flexible hours, professional development budget...',
            minLength: 50,
            maxLength: 2000,
          },
          salaryRange: {
            type: 'string',
            description: 'Salary range for the position.',
            example: '$80k - $120k',
            pattern: '^\\$\\d+k?\\s*-\\s*\\$\\d+k?$',
          },
          category: {
            type: 'string',
            description: 'Category of the job.',
            example: 'IT',
            enum: [
              'IT',
              'Engineering',
              'Sales',
              'Marketing',
              'Finance',
              'Other',
            ],
          },
          location: {
            type: 'string',
            description: 'Location of the job.',
            example: 'San Francisco, CA',
            minLength: 2,
            maxLength: 100,
          },
          recruiterId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the recruiter who posted the job.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          isClosed: {
            type: 'boolean',
            description: 'Indicates if the job position is closed.',
            example: false,
            default: false,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the job was created.',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the job was last updated.',
          },
        },
      },

      Application: {
        type: 'object',
        required: ['jobId', 'candidateId'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the application.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          status: {
            type: 'string',
            description: 'Status of the application.',
            example: 'applied',
            enum: ['applied', 'shortlisted', 'rejected', 'hired'],
            default: 'pending',
          },
          applicationDate: {
            type: 'string',
            format: 'date-time',
            description: 'Date when the application was submitted.',
          },
          jobId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the job being applied for.',
            example: 'f490f1ee-8c54-4b01-90e6-d701748f0853',
          },
          candidateId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the candidate who submitted the application.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the application was created.',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the application was last updated.',
          },
        },
      },
      ChatRoom: {
        type: 'object',
        required: ['recruiterId', 'interviewerId', 'jobId'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the chat room.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          recruiterId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the recruiter in the chat room.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          interviewerId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the interviewer in the chat room.',
            example: 'e380f1ee-7c54-4b01-90e6-d701748f0852',
          },
          jobId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the job related to this chat room.',
            example: 'f490f1ee-8c54-4b01-90e6-d701748f0853',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the chat room was created.',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the chat room was last updated.',
          },
        },
      },
      Message: {
        type: 'object',
        required: [
          'content',
          'senderId',
          'chatRoomId',
          'recruiterId',
          'interviewerId',
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the message.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          content: {
            type: 'string',
            description: 'Content of the message.',
            example: 'Hello, when would you be available for an interview?',
            minLength: 1,
            maxLength: 5000,
          },
          senderId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the user who sent the message.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          chatRoomId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the chat room the message belongs to.',
            example: 'e380f1ee-7c54-4b01-90e6-d701748f0852',
          },
          recruiterId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the recruiter associated with this message.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          interviewerId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the interviewer associated with this message.',
            example: 'e380f1ee-7c54-4b01-90e6-d701748f0852',
          },
          isRead: {
            type: 'boolean',
            description: 'Indicates if the message has been read.',
            example: false,
            default: false,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the message was created.',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the message was last updated.',
          },
          deletedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Timestamp when the message was soft-deleted.',
          },
        },
      },
      Contract: {
        type: 'object',
        required: [
          'agreedPrice',
          'status',
          'paymentStatus',
          'recruiterId',
          'interviewerId',
          'jobId',
          'roomId',
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the contract.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          agreedPrice: {
            type: 'number',
            format: 'float',
            description: 'Agreed price for the contract.',
            example: 250.0,
            minimum: 0,
            maximum: 1000000,
          },
          status: {
            type: 'string',
            description: 'Status of the contract.',
            example: 'active',
            enum: ['pending', 'active', 'completed', 'cancelled'],
          },
          paymentStatus: {
            type: 'string',
            description: 'Payment status of the contract.',
            example: 'paid',
            enum: ['pending', 'paid', 'failed', 'refunded'],
          },
          recruiterId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the recruiter who created the contract.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          interviewerId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the interviewer involved in the contract.',
            example: 'e380f1ee-7c54-4b01-90e6-d701748f0852',
          },
          jobId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the job related to this contract.',
            example: 'f490f1ee-8c54-4b01-90e6-d701748f0853',
          },
          roomId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the chat room related to this contract.',
            example: 'g590f1ee-9c54-4b01-90e6-d701748f0854',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the contract was created.',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the contract was last updated.',
          },
        },
      },

      Interview: {
        type: 'object',
        required: [
          'roomId',
          'scheduledTime',
          'interviewerId',
          'candidateId',
          'jobId',
          'applicationId',
          'status',
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the interview.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          roomId: {
            type: 'string',
            description: 'Unique identifier for the interview room.',
            example: 'interview-room-123',
          },
          scheduledTime: {
            type: 'string',
            format: 'date-time',
            description: 'Scheduled time for the interview.',
            example: '2023-05-15T14:00:00Z',
          },
          callStartedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Time when the interview call started.',
            example: '2023-05-15T14:02:30Z',
          },
          callEndedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Time when the interview call ended.',
            example: '2023-05-15T14:45:20Z',
          },
          interviewerId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the interviewer conducting the interview.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          candidateId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the candidate being interviewed.',
            example: 'e380f1ee-7c54-4b01-90e6-d701748f0852',
          },
          jobId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the job the interview is for.',
            example: 'f490f1ee-8c54-4b01-90e6-d701748f0853',
          },
          applicationId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the job application related to this interview.',
            example: 'g590f1ee-9c54-4b01-90e6-d701748f0854',
          },
          status: {
            type: 'string',
            description: 'Status of the interview.',
            example: 'scheduled',
            enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
          },
          remarks: {
            type: 'string',
            description: 'Remarks about the interview.',
            example:
              'Candidate was very knowledgeable about the technologies required.',
            maxLength: 1000,
          },
          summary: {
            type: 'string',
            description: 'Summary of the interview.',
            example:
              'The candidate demonstrated strong problem-solving skills and technical knowledge...',
            maxLength: 2000,
          },
          rating: {
            type: 'number',
            format: 'float',
            description: 'Rating given to the candidate (0-5).',
            example: 4.5,
            minimum: 0,
            maximum: 5,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the interview was created.',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the interview was last updated.',
          },
        },
      },
      InterviewerRating: {
        type: 'object',
        required: [
          'rating',
          'feedback',
          'interviewerId',
          'recruiterId',
          'jobId',
          'contractId',
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the rating.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          rating: {
            type: 'number',
            format: 'float',
            description: 'Rating given to the interviewer (0-5).',
            example: 4.5,
            minimum: 0,
            maximum: 5,
          },
          feedback: {
            type: 'string',
            description: 'Feedback provided about the interviewer.',
            example:
              'The interviewer was well-prepared and asked relevant questions...',
            minLength: 10,
            maxLength: 1000,
          },
          interviewerId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the interviewer being rated.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          recruiterId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the recruiter who provided the rating.',
            example: 'e380f1ee-7c54-4b01-90e6-d701748f0852',
          },
          jobId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the job related to this rating.',
            example: 'f490f1ee-8c54-4b01-90e6-d701748f0853',
          },
          contractId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the contract related to this rating.',
            example: 'g590f1ee-9c54-4b01-90e6-d701748f0854',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the rating was created.',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the rating was last updated.',
          },
        },
      },

      Transaction: {
        type: 'object',
        required: ['amount', 'status', 'transactionDate', 'contractId'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the transaction.',
            example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          },
          amount: {
            type: 'number',
            format: 'float',
            description: 'Amount of the transaction.',
            example: 250.0,
            minimum: 0,
          },
          status: {
            type: 'string',
            description: 'Status of the transaction.',
            example: 'completed',
            enum: ['pending', 'completed', 'failed', 'cancelled'],
          },
          transactionDate: {
            type: 'string',
            format: 'date-time',
            description: 'Date when the transaction occurred.',
            example: '2023-05-16T10:30:00Z',
          },
          contractId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the contract related to this transaction.',
            example: 'g590f1ee-9c54-4b01-90e6-d701748f0854',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the transaction was created.',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the transaction was last updated.',
          },
        },
      },
    },
  },
  security: [],
  apis: ['./routes/*.js'],
};

module.exports = swaggerOptions;
