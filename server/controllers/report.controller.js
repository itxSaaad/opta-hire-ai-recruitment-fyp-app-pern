const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

const {
  User,
  Job,
  Application,
  Contract,
  Transaction,
  Interview,
  sequelize: sequelizeInstance,
} = require('../models');

/**
 * @desc Get user activity report
 *
 * @route GET /api/v1/reports/user-activity
 * @access Private (Admin)
 *
 * @params {startDate, endDate} - Optional date range for the report
 *
 * @returns {Object} - User activity report containing user statistics, trends, and top interviewers
 */
const getUserActivityReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Default to last 30 days if no dates provided
  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  try {
    // Total users by role
    const usersByRole = await User.findAll({
      attributes: [
        [
          sequelize.literal(
            "CASE WHEN \"isAdmin\" = true THEN 'Admin' WHEN \"isRecruiter\" = true THEN 'Recruiter' WHEN \"isInterviewer\" = true THEN 'Interviewer' ELSE 'Candidate' END"
          ),
          'role',
        ],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      group: [
        sequelize.literal(
          "CASE WHEN \"isAdmin\" = true THEN 'Admin' WHEN \"isRecruiter\" = true THEN 'Recruiter' WHEN \"isInterviewer\" = true THEN 'Interviewer' ELSE 'Candidate' END"
        ),
      ],
      raw: true,
    });

    // User registrations by day
    const registrationTrend = await User.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'registrations'],
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true,
    });

    // Verification status
    const verificationStats = await User.findAll({
      attributes: [
        [
          sequelize.literal(
            "CASE WHEN \"isVerified\" = true THEN 'Verified' ELSE 'Unverified' END"
          ),
          'status',
        ],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      group: [
        sequelize.literal(
          "CASE WHEN \"isVerified\" = true THEN 'Verified' ELSE 'Unverified' END"
        ),
      ],
      raw: true,
    });

    // Top rated interviewers
    const topInterviewersQuery = await sequelizeInstance.query(
      `SELECT u.id, u."firstName", u."lastName", u.email, u."isTopRated",
              AVG(ir.rating) as "averageRating",
              COUNT(ir.id) as "totalRatings"
       FROM "Users" u
       INNER JOIN "InterviewerRatings" ir ON u.id = ir."interviewerId"
       WHERE u."deletedAt" IS NULL 
         AND u."isInterviewer" = true
         AND ir."createdAt" BETWEEN :startDate AND :endDate
       GROUP BY u.id, u."firstName", u."lastName", u.email, u."isTopRated"
       HAVING COUNT(ir.id) > 0
       ORDER BY AVG(ir.rating) DESC
       LIMIT 10`,
      {
        replacements: { startDate: start, endDate: end },
        type: sequelizeInstance.QueryTypes.SELECT,
      }
    );

    const topInterviewers = topInterviewersQuery;

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User activity report generated successfully.',
      data: {
        reportType: 'User Activity Report',
        dateRange: { startDate: start, endDate: end },
        summary: {
          totalUsers: usersByRole.reduce(
            (sum, role) => sum + parseInt(role.count),
            0
          ),
          usersByRole,
          verificationStats,
          topInterviewers: topInterviewers.map((interviewer) => ({
            id: interviewer.id,
            name: `${interviewer.firstName} ${interviewer.lastName}`,
            email: interviewer.email,
            averageRating: parseFloat(interviewer.averageRating || 0).toFixed(
              2
            ),
            totalRatings: parseInt(interviewer.totalRatings || 0),
            isTopRated: interviewer.isTopRated,
          })),
        },
        trends: {
          registrationTrend,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('User activity report error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to generate user activity report');
  }
});

/**
 * @desc Get job performance report
 *
 * @route GET /api/v1/reports/job-performance
 * @access Private (Admin)
 *
 * @params {startDate, endDate} - Optional date range for the report
 *
 * @returns {Object} - Job performance report containing job statistics, trends, and popular jobs
 */
const getJobPerformanceReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  try {
    // Jobs by category
    const jobsByCategory = await Job.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'jobCount'],
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      group: ['category'],
      raw: true,
    });

    // Job posting trends
    const jobPostingTrend = await Job.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'jobsPosted'],
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true,
    });

    // Most popular jobs (by applications)
    const popularJobsQuery = await sequelizeInstance.query(
      `SELECT j.id, j.title, j.company, j.category, j.location,
              COUNT(a.id) as "applicationCount"
       FROM "Jobs" j
       INNER JOIN "Applications" a ON j.id = a."jobId"
       WHERE a."createdAt" BETWEEN :startDate AND :endDate
       GROUP BY j.id, j.title, j.company, j.category, j.location
       ORDER BY COUNT(a.id) DESC
       LIMIT 10`,
      {
        replacements: { startDate: start, endDate: end },
        type: sequelizeInstance.QueryTypes.SELECT,
      }
    );

    const popularJobs = popularJobsQuery;

    // Application success rates
    const applicationStats = await Application.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      group: ['status'],
      raw: true,
    });

    // Job closure stats
    const jobClosureStats = await Job.findAll({
      attributes: [
        [
          sequelize.literal(
            "CASE WHEN \"isClosed\" = true THEN 'Closed' ELSE 'Open' END"
          ),
          'status',
        ],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      group: [
        sequelize.literal(
          "CASE WHEN \"isClosed\" = true THEN 'Closed' ELSE 'Open' END"
        ),
      ],
      raw: true,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Job performance report generated successfully.',
      data: {
        reportType: 'Job Performance Report',
        dateRange: { startDate: start, endDate: end },
        summary: {
          totalJobs: jobsByCategory.reduce(
            (sum, cat) => sum + parseInt(cat.jobCount),
            0
          ),
          jobsByCategory,
          jobClosureStats,
          applicationStats,
          popularJobs: popularJobs.map((job) => ({
            id: job.id,
            title: job.title,
            company: job.company,
            category: job.category,
            location: job.location,
            applicationCount: parseInt(job.applicationCount || 0),
          })),
        },
        trends: {
          jobPostingTrend,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Job performance report error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to generate job performance report');
  }
});

/**
 * @desc Get financial report
 *
 * @route GET /api/v1/reports/financial
 * @access Private (Admin)
 *
 * @params {startDate, endDate} - Optional date range for the report
 *
 * @returns {Object} - Financial report containing revenue statistics, trends, and top recruiters
 */
const getFinancialReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  try {
    // Revenue by transaction type
    const revenueByType = await Transaction.findAll({
      attributes: [
        'transactionType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('SUM', sequelize.col('platformFee')), 'totalPlatformFee'],
      ],
      where: {
        transactionDate: {
          [Op.between]: [start, end],
        },
        status: 'completed',
      },
      group: ['transactionType'],
      raw: true,
    });

    // Daily revenue trend
    const revenueTrend = await Transaction.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('transactionDate')), 'date'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'dailyRevenue'],
        [sequelize.fn('SUM', sequelize.col('platformFee')), 'dailyPlatformFee'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount'],
      ],
      where: {
        transactionDate: {
          [Op.between]: [start, end],
        },
        status: 'completed',
      },
      group: [sequelize.fn('DATE', sequelize.col('transactionDate'))],
      order: [[sequelize.fn('DATE', sequelize.col('transactionDate')), 'ASC']],
      raw: true,
    });

    // Contract value statistics
    const contractStats = await Contract.findAll({
      attributes: [
        'paymentStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'contractCount'],
        [sequelize.fn('AVG', sequelize.col('agreedPrice')), 'avgContractValue'],
        [
          sequelize.fn('SUM', sequelize.col('agreedPrice')),
          'totalContractValue',
        ],
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      group: ['paymentStatus'],
      raw: true,
    });

    // Top revenue generating recruiters
    const topRecruitersQuery = await sequelizeInstance.query(
      `SELECT u.id, u."firstName", u."lastName", u.email,
              SUM(c."agreedPrice") as "totalSpent",
              COUNT(c.id) as "contractCount"
       FROM "Users" u
       INNER JOIN "Contracts" c ON u.id = c."recruiterId"
       WHERE u."deletedAt" IS NULL 
         AND u."isRecruiter" = true
         AND c."createdAt" BETWEEN :startDate AND :endDate
         AND c."paymentStatus" = 'paid'
       GROUP BY u.id, u."firstName", u."lastName", u.email
       ORDER BY SUM(c."agreedPrice") DESC
       LIMIT 10`,
      {
        replacements: { startDate: start, endDate: end },
        type: sequelizeInstance.QueryTypes.SELECT,
      }
    );

    const topRecruiters = topRecruitersQuery;

    const totalPlatformFee = revenueByType.reduce(
      (sum, type) => sum + parseFloat(type.totalPlatformFee || 0),
      0
    );
    const totalRevenue = revenueByType.reduce(
      (sum, type) => sum + parseFloat(type.totalAmount || 0),
      0
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Financial report generated successfully.',
      data: {
        reportType: 'Financial Report',
        dateRange: { startDate: start, endDate: end },
        summary: {
          totalRevenue: totalRevenue.toFixed(2),
          totalPlatformFee: totalPlatformFee.toFixed(2),
          platformFeePercentage:
            totalRevenue > 0
              ? ((totalPlatformFee / totalRevenue) * 100).toFixed(2)
              : 0,
          revenueByType: revenueByType.map((type) => ({
            ...type,
            totalAmount: parseFloat(type.totalAmount || 0).toFixed(2),
            totalPlatformFee: parseFloat(type.totalPlatformFee || 0).toFixed(2),
          })),
          contractStats: contractStats.map((stat) => ({
            ...stat,
            avgContractValue: parseFloat(stat.avgContractValue || 0).toFixed(2),
            totalContractValue: parseFloat(
              stat.totalContractValue || 0
            ).toFixed(2),
          })),
          topRecruiters: topRecruiters.map((recruiter) => ({
            id: recruiter.id,
            name: `${recruiter.firstName} ${recruiter.lastName}`,
            email: recruiter.email,
            totalSpent: parseFloat(recruiter.totalSpent || 0).toFixed(2),
            contractCount: parseInt(recruiter.contractCount || 0),
          })),
        },
        trends: {
          revenueTrend: revenueTrend.map((trend) => ({
            ...trend,
            dailyRevenue: parseFloat(trend.dailyRevenue || 0).toFixed(2),
            dailyPlatformFee: parseFloat(trend.dailyPlatformFee || 0).toFixed(
              2
            ),
          })),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Financial report error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to generate financial report');
  }
});

/**
 * @desc Get interview analytics report
 *
 * @route GET /api/v1/reports/interview-analytics
 * @access Private (Admin)
 *
 * @params {startDate, endDate} - Optional date range for the report
 *
 * @returns {Object} - Interview analytics report containing interview statistics, trends, and performance metrics
 */
const getInterviewAnalyticsReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  try {
    // Interview status distribution
    const interviewStatusStats = await Interview.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      group: ['status'],
      raw: true,
    });

    // Interview completion rate by interviewer
    const interviewerPerformanceQuery = await sequelizeInstance.query(
      `SELECT u.id, u."firstName", u."lastName", u.email,
              COUNT(i.id) as "totalInterviews",
              SUM(CASE WHEN i.status = 'completed' THEN 1 ELSE 0 END) as "completedInterviews",
              AVG(i.rating) as "avgRating"
       FROM "Users" u
       INNER JOIN "Interviews" i ON u.id = i."interviewerId"
       WHERE u."deletedAt" IS NULL 
         AND u."isInterviewer" = true
         AND i."createdAt" BETWEEN :startDate AND :endDate
       GROUP BY u.id, u."firstName", u."lastName", u.email
       ORDER BY COUNT(i.id) DESC`,
      {
        replacements: { startDate: start, endDate: end },
        type: sequelizeInstance.QueryTypes.SELECT,
      }
    );

    const interviewerPerformance = interviewerPerformanceQuery;

    // Interview scheduling trends
    const interviewTrends = await Interview.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('scheduledTime')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'scheduledCount'],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(
              "CASE WHEN status = 'completed' THEN 1 ELSE 0 END"
            )
          ),
          'completedCount',
        ],
      ],
      where: {
        scheduledTime: {
          [Op.between]: [start, end],
        },
      },
      group: [sequelize.fn('DATE', sequelize.col('scheduledTime'))],
      order: [[sequelize.fn('DATE', sequelize.col('scheduledTime')), 'ASC']],
      raw: true,
    });

    // Rating distribution
    const ratingDistribution = await Interview.findAll({
      attributes: [
        [sequelize.fn('FLOOR', sequelize.col('rating')), 'ratingRange'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
        rating: {
          [Op.not]: null,
        },
      },
      group: [sequelize.fn('FLOOR', sequelize.col('rating'))],
      order: [[sequelize.fn('FLOOR', sequelize.col('rating')), 'ASC']],
      raw: true,
    });

    // Average interview duration
    const avgDurationQuery = await sequelizeInstance.query(
      `SELECT AVG(EXTRACT(EPOCH FROM ("callEndedAt" - "callStartedAt")) / 60) as "avgDurationMinutes"
       FROM "Interviews"
       WHERE "createdAt" BETWEEN :startDate AND :endDate
         AND "callStartedAt" IS NOT NULL
         AND "callEndedAt" IS NOT NULL`,
      {
        replacements: { startDate: start, endDate: end },
        type: sequelizeInstance.QueryTypes.SELECT,
      }
    );

    const avgDuration = avgDurationQuery[0] || { avgDurationMinutes: 0 };

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Interview analytics report generated successfully.',
      data: {
        reportType: 'Interview Analytics Report',
        dateRange: { startDate: start, endDate: end },
        summary: {
          totalInterviews: interviewStatusStats.reduce(
            (sum, status) => sum + parseInt(status.count),
            0
          ),
          interviewStatusStats,
          avgDurationMinutes: parseFloat(
            avgDuration.avgDurationMinutes || 0
          ).toFixed(2),
          ratingDistribution,
          interviewerPerformance: interviewerPerformance.map((interviewer) => ({
            id: interviewer.id,
            name: `${interviewer.firstName} ${interviewer.lastName}`,
            email: interviewer.email,
            totalInterviews: parseInt(interviewer.totalInterviews || 0),
            completedInterviews: parseInt(interviewer.completedInterviews || 0),
            completionRate:
              interviewer.totalInterviews > 0
                ? (
                    (interviewer.completedInterviews /
                      interviewer.totalInterviews) *
                    100
                  ).toFixed(2)
                : 0,
            avgRating: parseFloat(interviewer.avgRating || 0).toFixed(2),
          })),
        },
        trends: {
          interviewTrends,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Interview analytics report error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to generate interview analytics report');
  }
});

/**
 * @desc Get application funnel report
 *
 * @route GET /api/v1/reports/application-funnel
 * @access Private (Admin)
 *
 * @params {startDate, endDate} - Optional date range for the report
 *
 * @returns {Object} - Application funnel report containing application statistics, trends, and conversion rates
 */
const getApplicationFunnelReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  try {
    // Application funnel stages
    const funnelStats = await Application.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        applicationDate: {
          [Op.between]: [start, end],
        },
      },
      group: ['status'],
      raw: true,
    });

    // Conversion rates by job category
    const conversionByCategoryQuery = await sequelizeInstance.query(
      `SELECT j.category,
              COUNT(a.id) as "totalApplications",
              SUM(CASE WHEN a.status = 'hired' THEN 1 ELSE 0 END) as "hiredCount",
              SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) as "shortlistedCount"
       FROM "Jobs" j
       INNER JOIN "Applications" a ON j.id = a."jobId"
       WHERE a."applicationDate" BETWEEN :startDate AND :endDate
       GROUP BY j.category`,
      {
        replacements: { startDate: start, endDate: end },
        type: sequelizeInstance.QueryTypes.SELECT,
      }
    );

    const conversionByCategory = conversionByCategoryQuery;

    // Time to hire analytics
    const timeToHireQuery = await sequelizeInstance.query(
      `SELECT AVG(EXTRACT(EPOCH FROM ("updatedAt" - "applicationDate")) / (24 * 3600)) as "avgDaysToHire"
       FROM "Applications"
       WHERE "applicationDate" BETWEEN :startDate AND :endDate
         AND status = 'hired'`,
      {
        replacements: { startDate: start, endDate: end },
        type: sequelizeInstance.QueryTypes.SELECT,
      }
    );

    const timeToHire = timeToHireQuery[0] || { avgDaysToHire: 0 };

    // Application trends
    const applicationTrends = await Application.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('applicationDate')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'applications'],
        'status',
      ],
      where: {
        applicationDate: {
          [Op.between]: [start, end],
        },
      },
      group: [sequelize.fn('DATE', sequelize.col('applicationDate')), 'status'],
      order: [[sequelize.fn('DATE', sequelize.col('applicationDate')), 'ASC']],
      raw: true,
    });

    // Top performing companies (by hire rate)
    const companyPerformanceQuery = await sequelizeInstance.query(
      `SELECT j.company,
              COUNT(a.id) as "totalApplications",
              SUM(CASE WHEN a.status = 'hired' THEN 1 ELSE 0 END) as "hiredCount"
       FROM "Jobs" j
       INNER JOIN "Applications" a ON j.id = a."jobId"
       WHERE a."applicationDate" BETWEEN :startDate AND :endDate
       GROUP BY j.company
       HAVING COUNT(a.id) >= 5
       ORDER BY CAST(SUM(CASE WHEN a.status = 'hired' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(a.id) DESC
       LIMIT 10`,
      {
        replacements: { startDate: start, endDate: end },
        type: sequelizeInstance.QueryTypes.SELECT,
      }
    );

    const companyPerformance = companyPerformanceQuery;

    const totalApplications = funnelStats.reduce(
      (sum, stage) => sum + parseInt(stage.count),
      0
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Application funnel report generated successfully.',
      data: {
        reportType: 'Application Funnel Report',
        dateRange: { startDate: start, endDate: end },
        summary: {
          totalApplications,
          funnelStats: funnelStats.map((stage) => ({
            ...stage,
            percentage:
              totalApplications > 0
                ? ((stage.count / totalApplications) * 100).toFixed(2)
                : 0,
          })),
          avgDaysToHire: parseFloat(timeToHire.avgDaysToHire || 0).toFixed(2),
          conversionByCategory: conversionByCategory.map((category) => ({
            category: category.category,
            totalApplications: parseInt(category.totalApplications || 0),
            hiredCount: parseInt(category.hiredCount || 0),
            shortlistedCount: parseInt(category.shortlistedCount || 0),
            hireRate:
              category.totalApplications > 0
                ? (
                    (category.hiredCount / category.totalApplications) *
                    100
                  ).toFixed(2)
                : 0,
            shortlistRate:
              category.totalApplications > 0
                ? (
                    (category.shortlistedCount / category.totalApplications) *
                    100
                  ).toFixed(2)
                : 0,
          })),
          companyPerformance: companyPerformance.map((company) => ({
            company: company.company,
            totalApplications: parseInt(company.totalApplications || 0),
            hiredCount: parseInt(company.hiredCount || 0),
            hireRate:
              company.totalApplications > 0
                ? (
                    (company.hiredCount / company.totalApplications) *
                    100
                  ).toFixed(2)
                : 0,
          })),
        },
        trends: {
          applicationTrends,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Application funnel report error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to generate application funnel report');
  }
});

module.exports = {
  getUserActivityReport,
  getJobPerformanceReport,
  getFinancialReport,
  getInterviewAnalyticsReport,
  getApplicationFunnelReport,
};
