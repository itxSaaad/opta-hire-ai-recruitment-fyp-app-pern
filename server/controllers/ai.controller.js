const axios = require('axios');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { User, Job, Application, Resume } = require('../models');

const {
  sendEmail,
  generateEmailTemplate,
} = require('../utils/nodemailer.utils');

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:5001';

/**
 * @desc Check AI server system health
 * @route GET /api/v1/ml/health/system
 * @access Private (Admin)
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */
const checkSystemHealth = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVER_URL}/api/v1/health/`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'AI server system health check completed successfully.',
      data: response.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      res.status(StatusCodes.SERVICE_UNAVAILABLE);
      throw new Error(
        'AI server is not responding. Please ensure the AI service is running.'
      );
    }

    res.status(StatusCodes.SERVICE_UNAVAILABLE);
    throw new Error(
      'AI server is currently unavailable. Please try again later.'
    );
  }
});

/**
 * @desc Check AI service specific health status
 * @route GET /api/v1/ml/health/ai-service
 * @access Private (Admin)
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */
const checkAiServiceStatus = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(
      `${AI_SERVER_URL}/api/v1/health/ai-service`
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'AI service status check completed successfully.',
      data: response.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.response?.status === StatusCodes.SERVICE_UNAVAILABLE) {
      res.status(StatusCodes.SERVICE_UNAVAILABLE);
      throw new Error(
        'AI model is not ready. Model may need training or is currently unavailable.'
      );
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Failed to check AI service status. Please try again later.'
    );
  }
});

/**
 * @desc Get model training status and metrics
 * @route GET /api/v1/ml/model/status
 * @access Private (Admin)
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */
const getModelStatus = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVER_URL}/api/v1/model/status`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Model status retrieved successfully.',
      data: response.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.response?.status === StatusCodes.NOT_FOUND) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error('No trained model found. Please train the model first.');
    }

    res.status(StatusCodes.SERVICE_UNAVAILABLE);
    throw new Error('Unable to retrieve model status. AI service may be down.');
  }
});

/**
 * @desc Get detailed model performance metrics
 * @route GET /api/v1/ml/model/metrics
 * @access Private (Admin)
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */
const getModelMetrics = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVER_URL}/api/v1/model/metrics`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Model metrics retrieved successfully.',
      data: response.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.response?.status === StatusCodes.NOT_FOUND) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error(
        'No model metrics available. Please train the model first.'
      );
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Failed to retrieve model metrics. Please try again later.'
    );
  }
});

/**
 * @desc Train the AI model with historical data
 * @route POST /api/v1/ml/model/train
 * @access Private (Admin)
 *
 * @param {Object} req - The request object containing training parameters.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */
const trainModel = asyncHandler(async (req, res) => {
  const { useHistoricalData = true, trainingSize = 200 } = req.body;

  try {
    // Optionally gather historical data from database
    let trainingData = null;

    if (useHistoricalData) {
      // Fetch successful applications for training
      const historicalApplications = await Application.findAll({
        where: {
          status: {
            [Op.in]: ['hired', 'shortlisted', 'interviewed'],
          },
        },
        include: [
          {
            model: Job,
            as: 'job',
            attributes: [
              'id',
              'title',
              'description',
              'requirements',
              'category',
              'company',
            ],
          },
          {
            model: User,
            as: 'candidate',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            include: {
              model: Resume,
              as: 'resume',
            },
          },
        ],
        limit: trainingSize,
      });

      if (!historicalApplications || historicalApplications.length === 0) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(
          'No historical training data found. Please ensure there are successful applications in the system.'
        );
      }

      // Format data for AI training
      trainingData = historicalApplications.map((app) => ({
        job: {
          id: app.job.id,
          title: app.job.title,
          description: app.job.description,
          requirements: app.job.requirements,
          category: app.job.category,
          company: app.job.company,
        },
        candidate: {
          id: app.candidate.id,
          firstName: app.candidate.firstName,
          lastName: app.candidate.lastName,
          email: app.candidate.email,
        },
        resume: {
          userId: app.candidate.resume?.userId,
          title: app.candidate.resume?.title,
          summary: app.candidate.resume?.summary,
          headline: app.candidate.resume?.headline,
          skills: app.candidate.resume?.skills || [],
          experience: app.candidate.resume?.experience,
          education: app.candidate.resume?.education,
          industry: app.candidate.resume?.industry,
          company: app.candidate.resume?.company,
          achievements: app.candidate.resume?.achievements,
        },
        outcome: app.status === 'hired' ? 'hired' : 'shortlisted',
      }));
    }

    const requestBody = trainingData
      ? { training_data: trainingData }
      : { trainingSize };

    const response = await axios.post(
      `${AI_SERVER_URL}/api/v1/model/train`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Model training initiated successfully.',
      data: {
        ...response.data,
        historicalDataUsed: useHistoricalData,
        trainingExamples: trainingData?.length || trainingSize,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.response?.status === StatusCodes.BAD_REQUEST) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error(
        'Invalid training data or parameters. Please check your request.'
      );
    }

    if (error.code === 'ECONNABORTED') {
      res.status(StatusCodes.REQUEST_TIMEOUT);
      throw new Error(
        'Model training request timed out. Training may still be in progress.'
      );
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Model training failed. Please try again later.');
  }
});

/**
 * @desc Shortlist candidates for a job using AI
 * @route POST /api/v1/ml/shortlist/:jobId
 * @access Private (Admin, Recruiter)
 *
 * @param {Object} req - The request object containing the job ID.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */
const shortlistCandidates = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Job ID is required for candidate shortlisting.');
  }

  // Verify job exists and user has permission
  const job = await Job.findByPk(jobId, {
    include: { model: User, as: 'recruiter' },
  });

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('The specified job posting could not be found.');
  }

  if (req.user.isRecruiter && job.recruiterId !== req.user.id) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error(
      'You do not have permission to shortlist candidates for this job.'
    );
  }

  // Get applications with complete candidate and resume data
  const applications = await Application.findAll({
    where: {
      jobId,
      status: 'applied',
    },
    include: [
      {
        model: User,
        as: 'candidate',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        include: {
          model: Resume,
          as: 'resume',
          required: true, // Only include applications with resumes
        },
      },
    ],
  });

  if (!applications || applications.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No applications with resumes found for this job posting.');
  }

  try {
    // Prepare data for AI service
    const aiRequestData = {
      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        category: job.category,
        company: job.company,
        salaryRange: job.salaryRange,
      },
      applications: applications.map((app) => ({
        id: app.id,
        candidateId: app.candidateId,
        status: app.status,
        candidate: {
          id: app.candidate.id,
          firstName: app.candidate.firstName,
          lastName: app.candidate.lastName,
          email: app.candidate.email,
          phone: app.candidate.phone,
        },
        resume: {
          userId: app.candidate.resume.userId,
          title: app.candidate.resume.title,
          summary: app.candidate.resume.summary,
          headline: app.candidate.resume.headline,
          skills: app.candidate.resume.skills || [],
          experience: app.candidate.resume.experience,
          education: app.candidate.resume.education,
          industry: app.candidate.resume.industry,
          company: app.candidate.resume.company,
          achievements: app.candidate.resume.achievements,
        },
      })),
    };

    // Call AI service for shortlisting
    const response = await axios.post(
      `${AI_SERVER_URL}/api/v1/shortlist/candidates`,
      aiRequestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    let shortlistedCandidates = response.data.shortlisted_candidates || [];

    // Get IDs of all applications for this job to identify the rejected ones
    const allAppIds = applications.map((app) => app.id);

    // Get IDs of shortlisted applications
    const shortlistedAppIds = shortlistedCandidates.map(
      (candidate) => candidate.application_id
    );

    // Find rejected application IDs (all applications minus shortlisted ones)
    const rejectedAppIds = allAppIds.filter(
      (id) => !shortlistedAppIds.includes(id)
    );

    // Update shortlisted applications status
    if (shortlistedAppIds.length > 0) {
      await Application.update(
        { status: 'shortlisted' },
        {
          where: {
            id: {
              [Op.in]: shortlistedAppIds,
            },
          },
        }
      );
    }

    // Update rejected applications status
    if (rejectedAppIds.length > 0) {
      await Application.update(
        { status: 'rejected' },
        {
          where: {
            id: {
              [Op.in]: rejectedAppIds,
            },
          },
        }
      );
    }

    // Send notification emails to shortlisted candidates
    const shortlistedEmailPromises = shortlistedCandidates.map(
      async (candidate) => {
        const application = applications.find(
          (app) => app.id === candidate.application_id
        );

        if (application) {
          return sendEmail({
            from: process.env.NODEMAILER_SMTP_EMAIL,
            to: application.candidate.email,
            subject: 'OptaHire - Application Shortlisted',
            html: generateEmailTemplate({
              firstName: application.candidate.firstName,
              subject: 'Congratulations! You have been shortlisted',
              content: [
                {
                  type: 'heading',
                  value: 'Application Shortlisted!',
                },
                {
                  type: 'text',
                  value: `Congratulations! Your application for the position of <strong>${job.title}</strong> at ${job.company} has been shortlisted by our AI system.`,
                },
                {
                  type: 'heading',
                  value: 'Application Details',
                },
                {
                  type: 'list',
                  value: [
                    `Job Title: ${job.title}`,
                    `Company: ${job.company}`,
                    `Location: ${job.location || 'Not specified'}`,
                    `AI Match Score: ${candidate.total_score ? candidate.total_score.toFixed(2) : 'N/A'}`,
                    `Recommendation: ${candidate.recommendation_strength || 'Positive'}`,
                  ],
                },
                {
                  type: 'text',
                  value:
                    candidate.match_explanation ||
                    'You have been identified as a strong match for this position based on your skills and experience.',
                },
                {
                  type: 'text',
                  value:
                    'You can expect to hear from the recruiting team soon regarding next steps.',
                },
              ],
            }),
          });
        }
      }
    );

    // Send rejection emails to rejected candidates
    const rejectedEmailPromises = rejectedAppIds.map(async (appId) => {
      const application = applications.find((app) => app.id === appId);

      if (application) {
        return sendEmail({
          from: process.env.NODEMAILER_SMTP_EMAIL,
          to: application.candidate.email,
          subject: 'OptaHire - Application Update',
          html: generateEmailTemplate({
            firstName: application.candidate.firstName,
            subject: 'Update on your job application',
            content: [
              {
                type: 'heading',
                value: 'Application Status Update',
              },
              {
                type: 'text',
                value: `Thank you for applying for the position of <strong>${job.title}</strong> at ${job.company}.`,
              },
              {
                type: 'text',
                value:
                  'After careful consideration, we regret to inform you that your application has not been selected to move forward at this time.',
              },
              {
                type: 'text',
                value:
                  'We appreciate your interest in this position and encourage you to apply for future opportunities that align with your skills and experience.',
              },
            ],
          }),
        });
      }
    });

    // Wait for all emails to send
    const emailResults = await Promise.allSettled([
      ...shortlistedEmailPromises,
      ...rejectedEmailPromises,
    ]);

    const failedEmails = emailResults.filter(
      (result) => result.status === 'rejected'
    ).length;

    if (failedEmails > 0) {
      console.warn(
        `${failedEmails} notification emails failed to send during shortlisting.`
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message:
        response.data.message ||
        'AI-powered candidate shortlisting completed successfully.',
      data: {
        totalApplications:
          response.data.total_applications || applications.length,
        shortlistedCount:
          response.data.shortlisted_count || shortlistedCandidates.length,
        rejectedCount: rejectedAppIds.length,
        shortlistedCandidates: shortlistedCandidates,
        aiMetrics: response.data.shortlisting_metadata,
        job: {
          id: job.id,
          title: job.title,
          company: job.company,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.response?.status === StatusCodes.BAD_REQUEST) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Invalid job or application data for AI processing.');
    }

    if (error.response?.status === StatusCodes.SERVICE_UNAVAILABLE) {
      res.status(StatusCodes.SERVICE_UNAVAILABLE);
      throw new Error(
        'AI model is not trained or available. Please train the model first.'
      );
    }

    if (error.code === 'ECONNABORTED') {
      res.status(StatusCodes.REQUEST_TIMEOUT);
      throw new Error('AI shortlisting request timed out. Please try again.');
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'AI-powered candidate shortlisting failed. Please try again later.'
    );
  }
});

/**
 * @desc Preview candidate shortlisting without updating database
 * @route POST /api/v1/ml/shortlist/preview
 * @access Private (Admin, Recruiter)
 *
 * @param {Object} req - The request object containing the job ID.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */
const previewCandidateShortlist = asyncHandler(async (req, res) => {
  const { jobId } = req.body;

  if (!jobId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Job ID is required for candidate preview.');
  }

  // Verify job exists and user has permission
  const job = await Job.findByPk(jobId, {
    include: { model: User, as: 'recruiter' },
  });

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('The specified job posting could not be found.');
  }

  if (req.user.isRecruiter && job.recruiterId !== req.user.id) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error(
      'You do not have permission to preview candidates for this job.'
    );
  }

  // Get applications for preview
  const applications = await Application.findAll({
    where: { jobId, status: 'applied' },
    include: [
      {
        model: User,
        as: 'candidate',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        include: {
          model: Resume,
          as: 'resume',
          required: true,
        },
      },
    ],
  });

  if (!applications || applications.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No applications with resumes found for this job posting.');
  }

  try {
    // Prepare data for AI preview
    const previewData = {
      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        category: job.category,
        company: job.company,
        salaryRange: job.salaryRange,
      },
      applications: applications.map((app) => ({
        id: app.id,
        candidateId: app.candidateId,
        candidate: {
          id: app.candidate.id,
          firstName: app.candidate.firstName,
          lastName: app.candidate.lastName,
          email: app.candidate.email,
        },
        resume: {
          userId: app.candidate.resume.userId,
          title: app.candidate.resume.title,
          summary: app.candidate.resume.summary,
          headline: app.candidate.resume.headline,
          skills: app.candidate.resume.skills || [],
          experience: app.candidate.resume.experience,
          education: app.candidate.resume.education,
          industry: app.candidate.resume.industry,
          company: app.candidate.resume.company,
          achievements: app.candidate.resume.achievements,
        },
      })),
    };

    // Call AI service for preview
    const response = await axios.post(
      `${AI_SERVER_URL}/api/v1/shortlist/preview`,
      previewData,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'AI candidate preview completed successfully.',
      data: {
        totalApplications: applications.length,
        candidateScores: response.data.data?.candidate_scores,
        modelMetrics: response.data.data?.model_metrics,
        previewMode: true,
        job: {
          id: job.id,
          title: job.title,
          company: job.company,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.response?.status === StatusCodes.SERVICE_UNAVAILABLE) {
      res.status(StatusCodes.SERVICE_UNAVAILABLE);
      throw new Error(
        'AI model is not available for preview. Please ensure the model is trained.'
      );
    }

    if (error.code === 'ECONNABORTED') {
      res.status(StatusCodes.REQUEST_TIMEOUT);
      throw new Error('AI preview request timed out. Please try again.');
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('AI candidate preview failed. Please try again later.');
  }
});

module.exports = {
  checkSystemHealth,
  checkAiServiceStatus,
  getModelStatus,
  getModelMetrics,
  trainModel,
  shortlistCandidates,
  previewCandidateShortlist,
};
