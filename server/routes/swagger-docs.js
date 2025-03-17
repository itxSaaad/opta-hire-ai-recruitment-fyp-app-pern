/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Endpoints for user authentication and session management.
 *   - name: Users
 *     description: Endpoints for managing user profiles.
 *   - name: Resumes
 *     description: Endpoints for managing resumes.
 *   - name: Jobs
 *     description: Endpoints for managing job listings.
 *   - name: Applications
 *     description: Endpoints for managing job applications.
 *   - name: Chat Rooms
 *     description: Endpoints for managing chat rooms.
 *   - name: Contracts
 *     description: Endpoints for managing contracts.
 *   - name: Transactions
 *     description: Endpoints for managing transactions.
 *   - name: Interviews
 *     description: Endpoints for managing interviews.
 *   - name: Interviewer Ratings
 *     description: Endpoints for managing interviewer ratings.
 *   - name: Payments
 *     description: Endpoints for managing payments.
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: 'http'
 *       scheme: 'bearer'
 *       bearerFormat: 'JWT'
 *   schemas:
 *     User:
 *       type: 'object'
 *       required: ['firstName', 'lastName', 'email', 'phone', 'password']
 *       properties:
 *         id:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'Unique identifier for the user.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         firstName:
 *           type: 'string'
 *           description: "User's first name."
 *           example: 'John'
 *         lastName:
 *           type: 'string'
 *           description: "User's last name."
 *           example: 'Doe'
 *         email:
 *           type: 'string'
 *           format: 'email'
 *           description: "User's email address."
 *           example: 'john.doe@example.com'
 *         phone:
 *           type: 'string'
 *           description: "User's phone number in international format."
 *           example: '+12345678901'
 *         password:
 *           type: 'string'
 *           description: 'Hashed user password.'
 *           example: '$2a$10$Vb9...'
 *         otp:
 *           type: 'string'
 *           description: 'One-time password for verification (if applicable).'
 *           example: '123456'
 *         otpExpires:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Expiration timestamp for the OTP.'
 *           example: '2025-03-15T12:00:00Z'
 *         isVerified:
 *           type: 'boolean'
 *           description: 'Indicates if the user has been verified.'
 *           example: false
 *         isLinkedinVerified:
 *           type: 'boolean'
 *           description: "Indicates if the user's LinkedIn account is verified."
 *           example: false
 *         isAdmin:
 *           type: 'boolean'
 *           description: 'Indicates if the user has admin privileges.'
 *           example: false
 *         isRecruiter:
 *           type: 'boolean'
 *           description: 'Indicates if the user is a recruiter.'
 *           example: false
 *         isInterviewer:
 *           type: 'boolean'
 *           description: 'Indicates if the user is an interviewer.'
 *           example: false
 *         isCandidate:
 *           type: 'boolean'
 *           description: 'Indicates if the user is a candidate.'
 *           example: true
 *         isTopRated:
 *           type: 'boolean'
 *           description: 'Indicates if the user is marked as top rated.'
 *           example: false
 *         createdAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the user was created.'
 *         updatedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the user was last updated.'
 *         deletedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           nullable: true
 *           description: 'Timestamp when the user was soft-deleted.'
 *     Resume:
 *       type: 'object'
 *       required: ['userId']
 *       properties:
 *         id:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'Unique identifier for the resume.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         title:
 *           type: 'string'
 *           description: 'Title of the resume.'
 *           example: 'Senior Software Developer Resume'
 *           minLength: 2
 *           maxLength: 100
 *         summary:
 *           type: 'string'
 *           description: 'Brief summary of professional background.'
 *           example: 'Experienced software developer with 8+ years in full-stack development...'
 *           minLength: 50
 *           maxLength: 500
 *         headline:
 *           type: 'string'
 *           description: 'Professional headline.'
 *           example: 'Full Stack JavaScript Developer specialized in MERN stack'
 *           minLength: 10
 *           maxLength: 150
 *         skills:
 *           type: 'array'
 *           items:
 *             type: 'string'
 *           description: 'List of professional skills.'
 *           example: ['JavaScript', 'React', 'Node.js', 'PostgreSQL']
 *           minItems: 1
 *           maxItems: 20
 *         experience:
 *           type: 'string'
 *           description: 'Professional experience details.'
 *           example: 'Senior Developer at XYZ Corp (2019-Present)...'
 *         education:
 *           type: 'string'
 *           description: 'Education background details.'
 *           example: 'MSc Computer Science, University of Technology (2015-2017)'
 *         industry:
 *           type: 'string'
 *           description: 'Industry sector.'
 *           example: 'Information Technology'
 *           minLength: 2
 *           maxLength: 50
 *         availability:
 *           type: 'string'
 *           description: 'Candidate availability status.'
 *           example: 'Two weeks'
 *           enum: ['Immediate', 'Two weeks', 'One month', 'More than a month']
 *         company:
 *           type: 'string'
 *           description: 'Current or most recent company.'
 *           example: 'Tech Innovations Inc'
 *           minLength: 2
 *           maxLength: 100
 *         achievements:
 *           type: 'string'
 *           description: 'Notable professional achievements.'
 *           example: 'Led development of award-winning mobile application...'
 *           maxLength: 1000
 *         rating:
 *           type: 'number'
 *           format: 'float'
 *           description: 'Resume rating score.'
 *           example: 4.5
 *           minimum: 0
 *           maximum: 5
 *         portfolio:
 *           type: 'string'
 *           format: 'uri'
 *           description: 'Portfolio website URL.'
 *           example: 'https://portfolio.example.com'
 *         userId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the user who owns this resume.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         createdAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the resume was created.'
 *         updatedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the resume was last updated.'
 *         deletedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           nullable: true
 *           description: 'Timestamp when the resume was soft-deleted.'
 *     Job:
 *       type: 'object'
 *       required:
 *         - 'title'
 *         - 'description'
 *         - 'company'
 *         - 'requirements'
 *         - 'benefits'
 *         - 'salaryRange'
 *         - 'category'
 *         - 'location'
 *         - 'recruiterId'
 *       properties:
 *         id:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'Unique identifier for the job.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         title:
 *           type: 'string'
 *           description: 'Title of the job posting.'
 *           example: 'Senior Software Developer'
 *           minLength: 2
 *           maxLength: 100
 *         description:
 *           type: 'string'
 *           description: 'Detailed description of the job position.'
 *           example: 'We are looking for an experienced software developer to join our team...'
 *           minLength: 50
 *           maxLength: 5000
 *         company:
 *           type: 'string'
 *           description: 'Name of the company offering the job.'
 *           example: 'Tech Innovations Inc'
 *           minLength: 2
 *           maxLength: 100
 *         requirements:
 *           type: 'string'
 *           description: 'Requirements for the job position.'
 *           example: '5+ years of experience with JavaScript, proficiency in React and Node.js...'
 *           minLength: 50
 *           maxLength: 2000
 *         benefits:
 *           type: 'string'
 *           description: 'Benefits offered with the position.'
 *           example: 'Health insurance, remote work options, flexible hours, professional development budget...'
 *           minLength: 50
 *           maxLength: 2000
 *         salaryRange:
 *           type: 'string'
 *           description: 'Salary range for the position.'
 *           example: '$80k - $120k'
 *           pattern: '^\\$\\d+k?\\s*-\\s*\\$\\d+k?$'
 *         category:
 *           type: 'string'
 *           description: 'Category of the job.'
 *           example: 'IT'
 *           enum: ['IT', 'Engineering', 'Sales', 'Marketing', 'Finance', 'Other']
 *         location:
 *           type: 'string'
 *           description: 'Location of the job.'
 *           example: 'San Francisco, CA'
 *           minLength: 2
 *           maxLength: 100
 *         recruiterId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the recruiter who posted the job.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         isClosed:
 *           type: 'boolean'
 *           description: 'Indicates if the job position is closed.'
 *           example: false
 *           default: false
 *         createdAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the job was created.'
 *         updatedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the job was last updated.'
 *     Application:
 *       type: 'object'
 *       required: ['jobId', 'candidateId']
 *       properties:
 *         id:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'Unique identifier for the application.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         status:
 *           type: 'string'
 *           description: 'Status of the application.'
 *           example: 'applied'
 *           enum: ['applied', 'shortlisted', 'rejected', 'hired']
 *           default: 'pending'
 *         applicationDate:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Date when the application was submitted.'
 *         jobId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the job being applied for.'
 *           example: 'f490f1ee-8c54-4b01-90e6-d701748f0853'
 *         candidateId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the candidate who submitted the application.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         createdAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the application was created.'
 *         updatedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the application was last updated.'
 *     ChatRoom:
 *       type: 'object'
 *       required: ['recruiterId', 'interviewerId', 'jobId']
 *       properties:
 *         id:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'Unique identifier for the chat room.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         recruiterId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the recruiter in the chat room.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         interviewerId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the interviewer in the chat room.'
 *           example: 'e380f1ee-7c54-4b01-90e6-d701748f0852'
 *         jobId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the job related to this chat room.'
 *           example: 'f490f1ee-8c54-4b01-90e6-d701748f0853'
 *         createdAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the chat room was created.'
 *         updatedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the chat room was last updated.'
 *     Message:
 *       type: 'object'
 *       required: ['content', 'senderId', 'chatRoomId', 'recruiterId', 'interviewerId']
 *       properties:
 *         id:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'Unique identifier for the message.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         content:
 *           type: 'string'
 *           description: 'Content of the message.'
 *           example: 'Hello, when would you be available for an interview?'
 *           minLength: 1
 *           maxLength: 5000
 *         senderId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the user who sent the message.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         chatRoomId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the chat room the message belongs to.'
 *           example: 'e380f1ee-7c54-4b01-90e6-d701748f0852'
 *         recruiterId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the recruiter associated with this message.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         interviewerId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the interviewer associated with this message.'
 *           example: 'e380f1ee-7c54-4b01-90e6-d701748f0852'
 *         isRead:
 *           type: 'boolean'
 *           description: 'Indicates if the message has been read.'
 *           example: false
 *           default: false
 *         createdAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the message was created.'
 *         updatedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the message was last updated.'
 *         deletedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           nullable: true
 *           description: 'Timestamp when the message was soft-deleted.'
 *     Contract:
 *       type: 'object'
 *       required: ['agreedPrice', 'status', 'paymentStatus', 'recruiterId', 'interviewerId', 'jobId', 'roomId']
 *       properties:
 *         id:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'Unique identifier for the contract.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         agreedPrice:
 *           type: 'number'
 *           format: 'float'
 *           description: 'Agreed price for the contract.'
 *           example: 250.0
 *           minimum: 0
 *           maximum: 1000000
 *         status:
 *           type: 'string'
 *           description: 'Status of the contract.'
 *           example: 'active'
 *           enum: ['pending', 'active', 'completed', 'cancelled']
 *         paymentStatus:
 *           type: 'string'
 *           description: 'Payment status of the contract.'
 *           example: 'paid'
 *           enum: ['pending', 'paid', 'failed', 'refunded']
 *         recruiterId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the recruiter who created the contract.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         interviewerId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the interviewer involved in the contract.'
 *           example: 'e380f1ee-7c54-4b01-90e6-d701748f0852'
 *         jobId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the job related to this contract.'
 *           example: 'f490f1ee-8c54-4b01-90e6-d701748f0853'
 *         roomId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the chat room related to this contract.'
 *           example: 'g590f1ee-9c54-4b01-90e6-d701748f0854'
 *         createdAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the contract was created.'
 *         updatedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the contract was last updated.'
 *     Interview:
 *       type: 'object'
 *       required: ['roomId', 'scheduledTime', 'interviewerId', 'candidateId', 'jobId', 'applicationId', 'status']
 *       properties:
 *         id:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'Unique identifier for the interview.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         roomId:
 *           type: 'string'
 *           description: 'Unique identifier for the interview room.'
 *           example: 'interview-room-123'
 *         scheduledTime:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Scheduled time for the interview.'
 *           example: '2023-05-15T14:00:00Z'
 *         callStartedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Time when the interview call started.'
 *           example: '2023-05-15T14:02:30Z'
 *         callEndedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Time when the interview call ended.'
 *           example: '2023-05-15T14:45:20Z'
 *         interviewerId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the interviewer conducting the interview.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         candidateId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the candidate being interviewed.'
 *           example: 'e380f1ee-7c54-4b01-90e6-d701748f0852'
 *         jobId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the job the interview is for.'
 *           example: 'f490f1ee-8c54-4b01-90e6-d701748f0853'
 *         applicationId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the job application related to this interview.'
 *           example: 'g590f1ee-9c54-4b01-90e6-d701748f0854'
 *         status:
 *           type: 'string'
 *           description: 'Status of the interview.'
 *           example: 'scheduled'
 *           enum: ['scheduled', 'ongoing', 'completed', 'cancelled']
 *         remarks:
 *           type: 'string'
 *           description: 'Remarks about the interview.'
 *           example: 'Candidate was very knowledgeable about the technologies required.'
 *           maxLength: 1000
 *         summary:
 *           type: 'string'
 *           description: 'Summary of the interview.'
 *           example: 'The candidate demonstrated strong problem-solving skills and technical knowledge...'
 *           maxLength: 2000
 *         rating:
 *           type: 'number'
 *           format: 'float'
 *           description: 'Rating given to the candidate (0-5).'
 *           example: 4.5
 *           minimum: 0
 *           maximum: 5
 *         createdAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the interview was created.'
 *         updatedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the interview was last updated.'
 *     InterviewerRating:
 *       type: 'object'
 *       required: ['rating', 'feedback', 'interviewerId', 'recruiterId', 'jobId', 'contractId']
 *       properties:
 *         id:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'Unique identifier for the rating.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         rating:
 *           type: 'number'
 *           format: 'float'
 *           description: 'Rating given to the interviewer (0-5).'
 *           example: 4.5
 *           minimum: 0
 *           maximum: 5
 *         feedback:
 *           type: 'string'
 *           description: 'Feedback provided about the interviewer.'
 *           example: 'The interviewer was well-prepared and asked relevant questions...'
 *           minLength: 10
 *           maxLength: 1000
 *         interviewerId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the interviewer being rated.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         recruiterId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the recruiter who provided the rating.'
 *           example: 'e380f1ee-7c54-4b01-90e6-d701748f0852'
 *         jobId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the job related to this rating.'
 *           example: 'f490f1ee-8c54-4b01-90e6-d701748f0853'
 *         contractId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the contract related to this rating.'
 *           example: 'g590f1ee-9c54-4b01-90e6-d701748f0854'
 *         createdAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the rating was created.'
 *         updatedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the rating was last updated.'
 *     Transaction:
 *       type: 'object'
 *       required: ['amount', 'status', 'transactionDate', 'contractId']
 *       properties:
 *         id:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'Unique identifier for the transaction.'
 *           example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
 *         amount:
 *           type: 'number'
 *           format: 'float'
 *           description: 'Amount of the transaction.'
 *           example: 250.0
 *           minimum: 0
 *         status:
 *           type: 'string'
 *           description: 'Status of the transaction.'
 *           example: 'completed'
 *           enum: ['pending', 'completed', 'failed', 'cancelled']
 *         transactionDate:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Date when the transaction occurred.'
 *           example: '2023-05-16T10:30:00Z'
 *         contractId:
 *           type: 'string'
 *           format: 'uuid'
 *           description: 'ID of the contract related to this transaction.'
 *           example: 'g590f1ee-9c54-4b01-90e6-d701748f0854'
 *         createdAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the transaction was created.'
 *         updatedAt:
 *           type: 'string'
 *           format: 'date-time'
 *           description: 'Timestamp when the transaction was last updated.'
 * 
 * paths:
 *   /api/v1/auth/login:
 *     post:
 *       summary: Logs in a user.
 *       description: Authenticates a user using email and password and returns an access token. Sets a refresh token cookie.
 *       tags: [Auth]
 *       requestBody:
 *         required: true
 *         description: User login credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *                 - password
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "john.doe@example.com"
 *                 password:
 *                   type: string
 *                   format: password
 *                   example: "password123"
 *       responses:
 *         200:
 *           description: Successful login.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Welcome back! You have successfully signed in."
 *                   accessToken:
 *                     type: string
 *                     example: "eyJhbGciOiJIUzI1NiIsInR..."
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-03-15T14:00:00Z"
 *         400:
 *           description: Missing email or password.
 *         401:
 *           description: Unauthorized - credentials do not match.
 *         429:
 *           description: Too many requests.
 *         500:
 *           description: Internal server error.
 *
 *   /api/v1/auth/logout:
 *     post:
 *       summary: Logs out the current user.
 *       description: Clears the refresh token cookie to log out the user.
 *       tags: [Auth]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Successful logout.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "You have been successfully signed out."
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         400:
 *           description: Refresh token missing.
 *         500:
 *           description: Internal server error.
 *
 *   /api/v1/auth/refresh-token:
 *     post:
 *       summary: Refreshes the access token.
 *       description: Validates the refresh token from cookies and issues a new access token.
 *       tags: [Auth]
 *       responses:
 *         200:
 *           description: Session refreshed successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Session refreshed successfully."
 *                   accessToken:
 *                     type: string
 *                     example: "eyJhbGciOiJIUzI1NiIsInR..."
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         400:
 *           description: Missing refresh token.
 *         401:
 *           description: Invalid refresh token.
 *         404:
 *           description: User not found.
 *         500:
 *           description: Internal server error.
 *
 *   /api/v1/auth/register:
 *     post:
 *       summary: Registers a new user.
 *       description: Creates a new user account, sends a verification OTP via email, and returns tokens.
 *       tags: [Auth]
 *       requestBody:
 *         required: true
 *         description: User registration details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - firstName
 *                 - lastName
 *                 - email
 *                 - phone
 *                 - password
 *                 - role
 *               properties:
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "john.doe@example.com"
 *                 phone:
 *                   type: string
 *                   example: "+12345678901"
 *                 password:
 *                   type: string
 *                   format: password
 *                   example: "password123"
 *                 role:
 *                   type: string
 *                   enum: [admin, recruiter, interviewer, candidate]
 *                   example: "candidate"
 *       responses:
 *         201:
 *           description: Account created successfully and verification email sent.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Account created successfully. Please check your email to verify."
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *                   accessToken:
 *                     type: string
 *                     example: "eyJhbGciOiJIUzI1NiIsInR..."
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         400:
 *           description: Missing or invalid input.
 *         409:
 *           description: Conflict - account already exists.
 *         429:
 *           description: Too many requests.
 *         500:
 *           description: Internal server error.
 *
 *   /api/v1/auth/forgot-password:
 *     post:
 *       summary: Sends OTP for password reset.
 *       description: Sends a one-time password (OTP) to the user's email for password reset.
 *       tags: [Auth]
 *       requestBody:
 *         required: true
 *         description: Email address for password reset.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "john.doe@example.com"
 *       responses:
 *         200:
 *           description: OTP sent successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Password reset OTP sent to your email."
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         400:
 *           description: Missing or invalid email.
 *         404:
 *           description: User not found.
 *         429:
 *           description: Too many requests.
 *         500:
 *           description: Internal server error.
 *
 *   /api/v1/auth/reset-password:
 *     patch:
 *       summary: Resets the user's password.
 *       description: Validates the provided OTP and updates the user's password.
 *       tags: [Auth]
 *       requestBody:
 *         required: true
 *         description: Email, OTP, and new password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *                 - otp
 *                 - password
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "john.doe@example.com"
 *                 otp:
 *                   type: string
 *                   example: "123456"
 *                 password:
 *                   type: string
 *                   format: password
 *                   example: "newStrongPassword123"
 *       responses:
 *         200:
 *           description: Password reset successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Your password has been reset successfully."
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         400:
 *           description: Missing fields or invalid OTP.
 *         401:
 *           description: Unauthorized - invalid OTP.
 *         429:
 *           description: Too many requests.
 *         500:
 *           description: Internal server error.
 *
 *   /api/v1/auth/regenerate-otp:
 *     post:
 *       summary: Regenerates a new OTP for a user.
 *       description: Generates a new OTP and sends it to the user's email.
 *       tags: [Auth]
 *       requestBody:
 *         required: true
 *         description: Email address for which to regenerate the OTP.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "john.doe@example.com"
 *       responses:
 *         200:
 *           description: New OTP generated and sent.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "New verification code sent to your email."
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         400:
 *           description: Missing or invalid email.
 *         404:
 *           description: User not found.
 *         429:
 *           description: Too many requests.
 *         500:
 *           description: Internal server error.
 *
 *   /api/v1/users/profile:
 *     get:
 *       summary: Retrieves the authenticated user's profile.
 *       description: Returns the profile of the currently authenticated user.
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: User profile retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         401:
 *           description: Unauthorized.
 *         500:
 *           description: Internal server error.
 *     put:
 *       summary: Updates the authenticated user's profile.
 *       description: Allows the current user to update profile information.
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         description: User profile fields to update.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 phone:
 *                   type: string
 *                   example: "+12345678901"
 *       responses:
 *         200:
 *           description: Profile updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Profile updated successfully."
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         400:
 *           description: Bad request.
 *         401:
 *           description: Unauthorized.
 *         500:
 *           description: Internal server error.
 *     delete:
 *       summary: Soft deletes the authenticated user's profile.
 *       description: Soft deletes the profile of the current user.
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Profile deleted successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Profile deleted successfully."
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         401:
 *           description: Unauthorized.
 *         500:
 *           description: Internal server error.
 *
 *   /api/v1/users/{id}:
 *     get:
 *       summary: Retrieves a user profile by ID.
 *       description: Accessible only by admin users.
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *           description: The unique user ID.
 *       responses:
 *         200:
 *           description: User profile retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         401:
 *           description: Unauthorized.
 *         403:
 *           description: Forbidden.
 *         404:
 *           description: User not found.
 *         500:
 *           description: Internal server error.
 *     put:
 *       summary: Updates a user profile by ID.
 *       description: Allows an admin to update a user's profile.
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *           description: The unique user ID.
 *       requestBody:
 *         required: true
 *         description: Fields to update in the user's profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 phone:
 *                   type: string
 *                   example: "+12345678901"
 *       responses:
 *         200:
 *           description: User profile updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "User profile updated successfully."
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         400:
 *           description: Bad request.
 *         401:
 *           description: Unauthorized.
 *         403:
 *           description: Forbidden.
 *         404:
 *           description: User not found.
 *         500:
 *           description: Internal server error.
 *     delete:
 *       summary: Soft deletes a user profile by ID.
 *       description: Accessible only by admin users.
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *           description: The unique user ID.
 *       responses:
 *         200:
 *           description: User profile deleted successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "User profile deleted successfully."
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         401:
 *           description: Unauthorized.
 *         403:
 *           description: Forbidden.
 *         404:
 *           description: User not found.
 *         500:
 *           description: Internal server error.
 *
 *   /api/v1/users/{id}/permanent:
 *     delete:
 *       summary: Permanently deletes a user profile by ID.
 *       description: Accessible only by admin users.
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *           description: The unique user ID.
 *       responses:
 *         200:
 *           description: User permanently deleted successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "User permanently deleted successfully."
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         401:
 *           description: Unauthorized.
 *         403:
 *           description: Forbidden.
 *         404:
 *           description: User not found.
 *         500:
 *           description: Internal server error.

 *   /api/v1/resumes:
 *     post:
 *       summary: Creates a new resume.
 *       description: Creates a resume for the authenticated candidate.
 *       tags: [Resumes]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         description: Resume details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - title
 *                 - summary
 *                 - skills
 *                 - experience
 *                 - education
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Senior Software Engineer"
 *                 summary:
 *                   type: string
 *                   example: "Experienced software engineer with 5+ years in web development."
 *                 headline:
 *                   type: string
 *                   example: "Full Stack Developer | React | Node.js | AWS"
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["JavaScript", "React", "Node.js", "AWS"]
 *                 experience:
 *                   type: string
 *                   example: "5+ years experience in web development..."
 *                 education:
 *                   type: string
 *                   example: "Bachelor of Science in Computer Science, XYZ University"
 *                 industry:
 *                   type: string
 *                   example: "Information Technology"
 *                 availability:
 *                   type: string
 *                   example: "Full-time"
 *                 company:
 *                   type: string
 *                   example: "ABC Tech Ltd."
 *                 achievements:
 *                   type: string
 *                   example: "Led development of a critical system that increased revenue by 20%"
 *                 portfolio:
 *                   type: string
 *                   example: "https://myportfolio.com"
 *       responses:
 *         201:
 *           description: Resume created successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Resume created successfully! You can now start applying for jobs."
 *                   profile:
 *                     $ref: '#/components/schemas/Resume'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         400:
 *           description: Missing required fields.
 *         401:
 *           description: Unauthorized.
 *         409:
 *           description: Resume already exists.
 *         500:
 *           description: Internal server error.
 *
 *     get:
 *       summary: Retrieves all resumes.
 *       description: Admin endpoint to retrieve all resumes with optional filtering.
 *       tags: [Resumes]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: industry
 *           schema:
 *             type: string
 *           description: Filter by industry.
 *         - in: query
 *           name: availability
 *           schema:
 *             type: string
 *           description: Filter by availability status.
 *         - in: query
 *           name: skills
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *           style: form
 *           explode: true
 *           description: Filter by skills.
 *         - in: query
 *           name: minRating
 *           schema:
 *             type: number
 *           description: Filter by minimum rating.
 *       responses:
 *         200:
 *           description: Successfully retrieved all resumes.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Successfully retrieved all candidate resumes"
 *                   count:
 *                     type: integer
 *                     example: 10
 *                   profiles:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Resume'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         401:
 *           description: Unauthorized.
 *         403:
 *           description: Forbidden - Admin access required.
 *         404:
 *           description: No resumes found.
 *         500:
 *           description: Internal server error.
 *
 *   /api/v1/resumes/user:
 *     get:
 *       summary: Retrieves the authenticated user's resume.
 *       description: Gets the resume of the currently authenticated candidate.
 *       tags: [Resumes]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Resume retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Resume loaded successfully."
 *                   profile:
 *                     $ref: '#/components/schemas/Resume'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         401:
 *           description: Unauthorized.
 *         404:
 *           description: Resume not found.
 *         500:
 *           description: Internal server error.
 *
 *     put:
 *       summary: Updates the authenticated user's resume.
 *       description: Updates the resume of the currently authenticated candidate.
 *       tags: [Resumes]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         description: Resume details to update.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - title
 *                 - summary
 *                 - skills
 *                 - experience
 *                 - education
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Senior Software Engineer"
 *                 summary:
 *                   type: string
 *                   example: "Experienced software engineer with 5+ years in web development."
 *                 headline:
 *                   type: string
 *                   example: "Full Stack Developer | React | Node.js | AWS"
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["JavaScript", "React", "Node.js", "AWS"]
 *                 experience:
 *                   type: string
 *                   example: "5+ years experience in web development..."
 *                 education:
 *                   type: string
 *                   example: "Bachelor of Science in Computer Science, XYZ University"
 *                 industry:
 *                   type: string
 *                   example: "Information Technology"
 *                 availability:
 *                   type: string
 *                   example: "Full-time"
 *                 company:
 *                   type: string
 *                   example: "ABC Tech Ltd."
 *                 achievements:
 *                   type: string
 *                   example: "Led development of a critical system that increased revenue by 20%"
 *                 portfolio:
 *                   type: string
 *                   example: "https://myportfolio.com"
 *       responses:
 *         200:
 *           description: Resume updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Your resume has been successfully updated"
 *                   profile:
 *                     $ref: '#/components/schemas/Resume'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         400:
 *           description: Missing required fields.
 *         401:
 *           description: Unauthorized.
 *         404:
 *           description: Resume not found.
 *         500:
 *           description: Internal server error.
 *
 *     delete:
 *       summary: Deletes the authenticated user's resume.
 *       description: Removes the resume of the currently authenticated candidate.
 *       tags: [Resumes]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Resume deleted successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Your resume has been successfully deleted from our system."
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         401:
 *           description: Unauthorized.
 *         404:
 *           description: Resume not found.
 *         500:
 *           description: Internal server error.
 *
 *   /api/v1/resumes/{id}:
 *     put:
 *       summary: Updates a resume by ID.
 *       description: Admin endpoint to update a candidate's resume by ID.
 *       tags: [Resumes]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *           description: The unique resume ID.
 *       requestBody:
 *         required: true
 *         description: Resume details to update.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Senior Software Engineer"
 *                 summary:
 *                   type: string
 *                   example: "Experienced software engineer with 5+ years in web development."
 *                 headline:
 *                   type: string
 *                   example: "Full Stack Developer | React | Node.js | AWS"
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["JavaScript", "React", "Node.js", "AWS"]
 *                 experience:
 *                   type: string
 *                   example: "5+ years experience in web development..."
 *                 education:
 *                   type: string
 *                   example: "Bachelor of Science in Computer Science, XYZ University"
 *                 industry:
 *                   type: string
 *                   example: "Information Technology"
 *                 availability:
 *                   type: string
 *                   example: "Full-time"
 *                 company:
 *                   type: string
 *                   example: "ABC Tech Ltd."
 *                 achievements:
 *                   type: string
 *                   example: "Led development of a critical system that increased revenue by 20%"
 *                 portfolio:
 *                   type: string
 *                   example: "https://myportfolio.com"
 *       responses:
 *         200:
 *           description: Resume updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Resume has been successfully updated"
 *                   updatedProfile:
 *                     $ref: '#/components/schemas/Resume'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         400:
 *           description: Bad request.
 *         401:
 *           description: Unauthorized.
 *         403:
 *           description: Forbidden - Admin access required.
 *         404:
 *           description: Resume not found.
 *         500:
 *           description: Internal server error.
 *
 *     delete:
 *       summary: Deletes a resume by ID.
 *       description: Admin endpoint to delete a candidate's resume by ID.
 *       tags: [Resumes]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *           description: The unique resume ID.
 *       responses:
 *         200:
 *           description: Resume deleted successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Resume has been successfully deleted"
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         401:
 *           description: Unauthorized.
 *         403:
 *           description: Forbidden - Admin access required.
 *         404:
 *           description: Resume not found.
 *         500:
 *           description: Internal server error.
 * 
 *   /api/v1/jobs:
 *     post:
 *       summary: Create a new job posting.
 *       description: Creates a new job posting. Only authenticated recruiters can create a job.
 *       tags: [Jobs]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         description: Job details required for creation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - title
 *                 - description
 *                 - requirements
 *                 - salaryRange
 *                 - category
 *                 - location
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Senior Software Engineer"
 *                 description:
 *                   type: string
 *                   example: "We are looking for a Senior Software Engineer with expertise in Node.js."
 *                 requirements:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["5+ years experience", "Proficient in Node.js"]
 *                 benefits:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Health insurance", "Flexible work hours"]
 *                 company:
 *                   type: string
 *                   example: "Tech Solutions Inc."
 *                 salaryRange:
 *                   type: string
 *                   example: "$80k - $120k"
 *                 category:
 *                   type: string
 *                   example: "IT"
 *                 location:
 *                   type: string
 *                   example: "New York, NY"
 *       responses:
 *         201:
 *           description: Job posting created successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Job posting created successfully"
 *                   job:
 *                     $ref: '#/components/schemas/Job'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         400:
 *           description: Missing required fields or validation error.
 *         404:
 *           description: Recruiter account not found.
 *         429:
 *           description: Too many requests.
 *         500:
 *           description: Internal server error.
 *
 *     get:
 *       summary: Retrieve all job postings.
 *       description: Returns a list of jobs. Filters such as search, category, location, company, and salaryRange can be applied.
 *       tags: [Jobs]
 *       parameters:
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *           description: Keyword to search for in title, description, or requirements.
 *         - in: query
 *           name: category
 *           schema:
 *             type: string
 *           description: Filter by job category.
 *         - in: query
 *           name: location
 *           schema:
 *             type: string
 *           description: Filter by job location.
 *         - in: query
 *           name: company
 *           schema:
 *             type: string
 *           description: Filter by company name.
 *         - in: query
 *           name: salaryRange
 *           schema:
 *             type: string
 *           description: Filter by salary range.
 *         - in: query
 *           name: isClosed
 *           schema:
 *             type: boolean
 *           description: Filter by closed status.
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *           description: Maximum number of jobs to retrieve.
 *       responses:
 *         200:
 *           description: Jobs retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Found 5 opportunities matching your search"
 *                   count:
 *                     type: integer
 *                     example: 5
 *                   jobs:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Job'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         404:
 *           description: No jobs match the search criteria.
 *         500:
 *           description: Internal server error.
 *
 *   /api/v1/jobs/{id}:
 *     get:
 *       summary: Get a job posting by ID.
 *       description: Retrieves the details of a specific job posting.
 *       tags: [Jobs]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *           description: The job ID.
 *       responses:
 *         200:
 *           description: Job details retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   job:
 *                     $ref: '#/components/schemas/Job'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         404:
 *           description: Job not found.
 *         500:
 *           description: Internal server error.
 *
 *     patch:
 *       summary: Update a job posting by ID.
 *       description: Allows a recruiter or admin to update the details of a specific job posting.
 *       tags: [Jobs]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *           description: The job ID.
 *       requestBody:
 *         required: true
 *         description: Fields for updating the job posting. At least one field is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Updated Job Title"
 *                 description:
 *                   type: string
 *                   example: "Updated job description..."
 *                 requirements:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Updated requirement 1", "Updated requirement 2"]
 *                 benefits:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Updated benefit 1", "Updated benefit 2"]
 *                 company:
 *                   type: string
 *                   example: "Updated Company"
 *                 salaryRange:
 *                   type: string
 *                   example: "$90k - $130k"
 *                 category:
 *                   type: string
 *                   example: "IT"
 *                 location:
 *                   type: string
 *                   example: "Updated Location"
 *                 isClosed:
 *                   type: boolean
 *                   example: false
 *       responses:
 *         200:
 *           description: Job posting updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Job posting updated successfully"
 *                   job:
 *                     $ref: '#/components/schemas/Job'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         400:
 *           description: Bad request – no fields provided to update.
 *         404:
 *           description: Job not found.
 *         500:
 *           description: Internal server error.
 *
 *     delete:
 *       summary: Delete a job posting by ID.
 *       description: Deletes the job posting identified by its ID. Accessible only to admin users.
 *       tags: [Jobs]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *           description: The job ID.
 *       responses:
 *         200:
 *           description: Job posting deleted successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Job posting deleted successfully"
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         404:
 *           description: Job not found.
 *         500:
 *           description: Internal server error.
 * 
  *   /api/v1/applications:
 *     post:
 *       summary: Create a new application
 *       description: Creates a new application for a job posting by the authenticated candidate and sends a notification email to the recruiter.
 *       tags: [Applications]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         description: Job ID required to submit an application.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - jobId
 *               properties:
 *                 jobId:
 *                   type: string
 *                   format: uuid
 *                   example: "a290f1ee-6c54-4b01-90e6-d701748f0851"
 *       responses:
 *         201:
 *           description: Application submitted successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Your application has been successfully submitted."
 *                   application:
 *                     $ref: '#/components/schemas/Application'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         404:
 *           description: Candidate or job not found.
 *         409:
 *           description: Application already exists.
 *         500:
 *           description: Internal server error or email delivery failure.
 *
 *     get:
 *       summary: Retrieve all applications
 *       description: Retrieves a list of applications. Optional filters include role, status, applicationDate, jobId, and candidateId.
 *       tags: [Applications]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: role
 *           schema:
 *             type: string
 *           description: Filter by role (candidate, recruiter, interviewer).
 *         - in: query
 *           name: status
 *           schema:
 *             type: string
 *           description: Filter by application status.
 *         - in: query
 *           name: applicationDate
 *           schema:
 *             type: string
 *             format: date
 *           description: Filter by application date (greater than or equal).
 *         - in: query
 *           name: jobId
 *           schema:
 *             type: string
 *             format: uuid
 *           description: Filter by job ID.
 *         - in: query
 *           name: candidateId
 *           schema:
 *             type: string
 *             format: uuid
 *           description: Filter by candidate ID.
 *       responses:
 *         200:
 *           description: Applications retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Applications retrieved successfully."
 *                   count:
 *                     type: integer
 *                     example: 5
 *                   applications:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Application'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         404:
 *           description: No applications found matching the criteria.
 *         500:
 *           description: Internal server error.
 *
 *   /api/v1/applications/{id}:
 *     get:
 *       summary: Get application by ID
 *       description: Retrieves the details of a specific application by its ID. Accessible to recruiters and admins.
 *       tags: [Applications]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *           description: The unique application ID.
 *       responses:
 *         200:
 *           description: Application details retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   application:
 *                     $ref: '#/components/schemas/Application'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         404:
 *           description: Application not found.
 *         500:
 *           description: Internal server error.
 *
 *     put:
 *       summary: Update application
 *       description: Updates the status of an application. Accessible to recruiters and admins.
 *       tags: [Applications]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *           description: The application ID.
 *       requestBody:
 *         required: true
 *         description: New status for the application.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [applied, shortlisted, rejected, hired]
 *                   example: "shortlisted"
 *       responses:
 *         200:
 *           description: Application status updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Application status updated successfully."
 *                   application:
 *                     $ref: '#/components/schemas/Application'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         400:
 *           description: Bad request – invalid status provided.
 *         404:
 *           description: Application not found.
 *         500:
 *           description: Internal server error.
 *
 *     delete:
 *       summary: Delete application
 *       description: Permanently deletes an application. Accessible only to admins.
 *       tags: [Applications]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *           description: The unique application ID.
 *       responses:
 *         200:
 *           description: Application deleted successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Application record has been successfully deleted."
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         404:
 *           description: Application not found.
 *         500:
 *           description: Internal server error.
 *
 *   /api/v1/applications/job/{jobId}:
 *     get:
 *       summary: Get applications for a specific job
 *       description: Retrieves all applications submitted for a given job posting.
 *       tags: [Applications]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: jobId
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *           description: The unique job ID.
 *       responses:
 *         200:
 *           description: Applications for the job retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Job applications retrieved successfully."
 *                   count:
 *                     type: integer
 *                     example: 3
 *                   applications:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Application'
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *         404:
 *           description: Job or applications not found.
 *         500:
 *           description: Internal server error.
 */
