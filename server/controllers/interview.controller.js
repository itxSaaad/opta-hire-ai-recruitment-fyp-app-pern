const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { User, Job, Interview, ChatRoom, Message } = require('../models');

const sendEmail = require('../utils/nodemailer.utils');
const roomId = require('uuid').v4();

/**
 * @desc Creates a new interview.
 * @route POST /api/v1/interviews
 * @access Private
 * @param {Object} req - The request object containing interview details.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If required fields are missing or invalid.
 */
const createInterview = asyncHandler(async (req, res) => {
    const { scheduledTime, interviewerId, candidateId, jobId, applicationId } = req.body;

    const interview = await Interview.create({
        roomId,
        scheduledTime,
        interviewerId,
        candidateId,
        jobId,
        applicationId,
        status: 'scheduled'
    });

    const createdInterview = await Interview.findByPk(interview.id, {
        include: [
            { model: User, as: 'interviewer' },
            { model: User, as: 'candidate' },
            { model: Job, as: 'job' }
        ]
    });

    await ChatRoom.create({
        id: roomId,
        name: `Interview-${interview.id}`,
        type: 'interview'
    });

    const [interviewer, candidate] = await Promise.all([
        User.findByPk(interviewerId),
        User.findByPk(candidateId)
    ]);

    const isEmailSent = await Promise.all([
        sendEmail({
            from: process.env.SMTP_EMAIL,
            to: interviewer.email,
            subject: 'Interview Scheduled',
            html: `<p>Your interview with ${candidate.name} has been scheduled for ${new Date(scheduledTime).toLocaleString()}</p>`
        }),
        sendEmail({
            from: process.env.SMTP_EMAIL,
            to: candidate.email,
            subject: 'Interview Scheduled',
            html: `<p>Your interview with ${interviewer.name} has been scheduled for ${new Date(scheduledTime).toLocaleString()}</p>`
        })
    ]);

    if (!isEmailSent) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR);
        throw new Error('Email could not be sent.');
    }

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Interview created successfully',
        interview: createdInterview
    });
});

/**
 * @desc Fetches all interviews.
 * @route GET /api/v1/interviews
 * @access Private
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not an admin, recruiter or interviewer.
 * @throws {Error} If the interviews could not be found.
    */

const getInterviews = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status } = req.query;

    let whereClause = {};
    if (status) {
        whereClause.status = status;
    }

    let interviews;

    if (userRole === 'admin') {
        interviews = await Interview.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'interviewer' },
                { model: User, as: 'candidate' },
                { model: Job, as: 'job' }
            ],
            order: [['scheduledTime', 'DESC']]
        });
    } else if (userRole === 'recruiter') {
        interviews = await Interview.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'interviewer' },
                { model: User, as: 'candidate' },
                {
                    model: Job,
                    as: 'job',
                    where: { recruiterId: userId }
                }
            ],
            order: [['scheduledTime', 'DESC']]
        });
    } else {
        interviews = await Interview.findAll({
            where: {
                ...whereClause,
                [Op.or]: [
                    { interviewerId: userId },
                    { candidateId: userId }
                ]
            },
            include: [
                { model: User, as: 'interviewer' },
                { model: User, as: 'candidate' },
                { model: Job, as: 'job' }
            ],
            order: [['scheduledTime', 'DESC']]
        });
    }

    res.status(StatusCodes.OK).json({
        success: true,
        count: interviews.length,
        interviews
    });
});

/**
 * @desc Fetches an interview by ID.
 * 
 * @route GET /api/v1/interviews/:id
 * @access Private
 * 
 * @param {Object} req - The request object containing the interview ID.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the interview is not found.
 */


const getInterviewById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const interview = await Interview.findByPk(id, {
        include: [
            { model: User, as: 'interviewer' },
            { model: User, as: 'candidate' },
            { model: Job, as: 'job' }
        ]
    });

    if (!interview) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Interview not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        interview
    });
});

/**
 * @desc Updates an interview.
 * 
 * @route PUT /api/v1/interviews/:id
 * @access Private
 * 
 * @param {Object} req - The request object containing the interview ID and updates (status, remarks, summary, rating).
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the interview is not found.
 */

const updateInterview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, remarks, summary, rating } = req.body;

    const interview = await Interview.findByPk(id);

    if (!interview) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Interview not found');
    }

    const updates = {};

    if (status) updates.status = status;
    if (remarks) updates.remarks = remarks;
    if (summary) updates.summary = summary;
    if (rating !== undefined) updates.rating = rating;

    if (status === 'ongoing') {
        updates.callStartedAt = new Date();
    } else if (status === 'completed') {
        updates.callEndedAt = new Date();
    }

    const updatedInterview = await interview.update(updates);

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Interview updated successfully',
        interview: updatedInterview
    });
});

/**
 * @desc Deletes an interview.
 * 
 * @route DELETE /api/v1/interviews/:id
 * @access Private
 * 
 * @param {Object} req - The request object containing the interview ID.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the interview is not found.
 */

const deleteInterview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const interview = await Interview.findByPk(id);

    if (!interview) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Interview not found');
    }

    await interview.destroy();

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Interview deleted successfully'
    });
});


module.exports = {
    createInterview,
    getInterviews,
    getInterviewById,
    updateInterview,
    deleteInterview,
};
