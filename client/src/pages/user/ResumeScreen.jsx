import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaSave,
  FaTrash,
  FaUndo,
  FaEdit,
  FaEye,
  FaTimes,
  FaUser,
  FaToolbox,
  FaClipboardList,
  FaGraduationCap,
  FaIndustry,
  FaCalendarAlt,
  FaBuilding,
  FaRegAddressCard,
  FaHeading,
  FaAlignLeft,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import ErrorMsg from '../../components/ErrorMsg';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import InputField from '../../components/ui/mainLayout/InputField';

import {
  useGetResumeForUserQuery,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
} from '../../features/resume/resumeApi';
import IsAuth from '../../hoc/IsAuth';

function ResumeScreen() {
  const { userInfo: user, loading: authLoading } = useSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();

  // Query & mutation hooks
  const {
    data: resumeData,
    isLoading: resumeLoading,
    error: resumeError,
  } = useGetResumeForUserQuery(undefined, { skip: !user });
  const [updateResume, { isLoading: updatingResume, error: updateError }] =
    useUpdateResumeMutation();
  const [deleteResume, { isLoading: deletingResume, error: deleteError }] =
    useDeleteResumeMutation();

  // Local state for resume fields
  const [title, setTitle] = useState('');
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState([]); // array of strings
  const [newSkill, setNewSkill] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [industry, setIndustry] = useState('');
  const [availability, setAvailability] = useState('Immediate');
  const [company, setCompany] = useState('');
  const [achievements, setAchievements] = useState('');
  const [rating, setRating] = useState('');
  const [portfolio, setPortfolio] = useState('');

  // For undo functionality in Skills
  const [lastDeletedSkill, setLastDeletedSkill] = useState(null);

  // For delete resume modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Edit mode flags for individual sections
  const [editOverview, setEditOverview] = useState(false);
  const [editSkills, setEditSkills] = useState(false);
  const [editExpEdu, setEditExpEdu] = useState(false);
  const [editAdditional, setEditAdditional] = useState(false);

  // Load resume data into state when available
  useEffect(() => {
    if (resumeData && resumeData.profile) {
      const profile = resumeData.profile;
      setTitle(profile.title || '');
      setHeadline(profile.headline || '');
      setSummary(profile.summary || '');
      setSkills(profile.skills || []);
      setExperience(profile.experience || '');
      setEducation(profile.education || '');
      setIndustry(profile.industry || '');
      setAvailability(profile.availability || 'Immediate');
      setCompany(profile.company || '');
      setAchievements(profile.achievements || '');
      setRating(
        profile.rating !== null && profile.rating !== undefined
          ? profile.rating
          : ''
      );
      setPortfolio(profile.portfolio || '');
    }
  }, [resumeData]);

  // Save all changes (for each section, we use the same saveSection update)
  const saveSection = async () => {
    try {
      await updateResume({
        title,
        headline,
        summary,
        skills,
        experience,
        education,
        industry,
        availability,
        company,
        achievements,
        rating: parseFloat(rating),
        portfolio,
      }).unwrap();
      // Exit edit modes after saving
      setEditOverview(false);
      setEditSkills(false);
      setEditExpEdu(false);
      setEditAdditional(false);
    } catch (err) {
      console.error('Update resume failed:', err);
    }
  };

  // Reset functions for each section
  const resetOverview = () => {
    if (resumeData?.profile) {
      const { title, headline, summary } = resumeData.profile;
      setTitle(title || '');
      setHeadline(headline || '');
      setSummary(summary || '');
    }
    setEditOverview(false);
  };

  const resetSkills = () => {
    if (resumeData?.profile) {
      setSkills(resumeData.profile.skills || []);
    }
    setNewSkill('');
    setLastDeletedSkill(null);
    setEditSkills(false);
  };

  const resetExpEdu = () => {
    if (resumeData?.profile) {
      const { experience, education } = resumeData.profile;
      setExperience(experience || '');
      setEducation(education || '');
    }
    setEditExpEdu(false);
  };

  const resetAdditional = () => {
    if (resumeData?.profile) {
      const {
        industry,
        availability,
        company,
        achievements,
        rating,
        portfolio,
      } = resumeData.profile;
      setIndustry(industry || '');
      setAvailability(availability || 'Immediate');
      setCompany(company || '');
      setAchievements(achievements || '');
      setRating(rating !== null && rating !== undefined ? rating : '');
      setPortfolio(portfolio || '');
    }
    setEditAdditional(false);
  };

  // Skills handlers
  const handleAddNewSkill = () => {
    if (newSkill.trim() !== '') {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleDeleteSkill = (index) => {
    const deletedSkill = { index, value: skills[index] };
    setLastDeletedSkill(deletedSkill);
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleUndoSkill = () => {
    if (lastDeletedSkill !== null) {
      const newSkillsArray = [...skills];
      newSkillsArray.splice(lastDeletedSkill.index, 0, lastDeletedSkill.value);
      setSkills(newSkillsArray);
      setLastDeletedSkill(null);
    }
  };

  // Delete resume with modal confirmation
  const confirmDeleteResume = async () => {
    try {
      await deleteResume().unwrap();
      navigate('/resume/create');
    } catch (err) {
      console.error('Delete resume failed:', err);
    }
  };

  const overallLoading =
    useSelector((state) => state.auth.loading) ||
    authLoading ||
    resumeLoading ||
    updatingResume ||
    deletingResume;

  return (
    <>
      <Helmet>
        <title>Resume - OptaHire</title>
        <meta name="description" content="View and update your resume." />
      </Helmet>
      <section className="min-h-screen py-20 px-4 bg-light-background dark:bg-dark-background">
        <div className="max-w-7xl mx-auto relative animate-fadeIn">
          {overallLoading ? (
            <Loader />
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-light-primary dark:text-dark-primary mb-2">
                  Your Resume
                </h2>
                {resumeError || updateError || deleteError ? (
                  <ErrorMsg
                    message={
                      resumeError?.data?.message ||
                      updateError?.data?.message ||
                      deleteError?.data?.message
                    }
                  />
                ) : null}
                <p className="text-light-text dark:text-dark-text">
                  {editOverview || editSkills || editExpEdu || editAdditional
                    ? 'Editing your resume...'
                    : 'Review your resume details below.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Overview Card */}
                  <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                          Overview
                        </h3>
                      </div>
                      {editOverview ? (
                        <button
                          type="button"
                          onClick={resetOverview}
                          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white transition duration-300"
                        >
                          <FaTimes />
                          Cancel
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditOverview(true)}
                          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-light-primary dark:bg-dark-primary text-white hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-300"
                        >
                          <FaEdit />
                          Edit
                        </button>
                      )}
                    </div>
                    {editOverview ? (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-4">
                          <InputField
                            id="title"
                            type="text"
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            icon={<FaUser className="text-gray-400" />}
                          />
                          <InputField
                            id="headline"
                            type="text"
                            label="Headline"
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                            icon={<FaUser className="text-gray-400" />}
                          />
                        </div>
                        <InputField
                          id="summary"
                          type="textarea"
                          label="Summary"
                          value={summary}
                          onChange={(e) => setSummary(e.target.value)}
                          rows={4}
                          icon={<FaEye className="text-gray-400" />}
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={saveSection}
                            className="flex items-center gap-2 bg-light-primary dark:bg-dark-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-300"
                          >
                            <FaSave />
                            Save Overview
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Title */}
                        <div className="border-b border-light-border dark:border-dark-border pb-4">
                          <div className="flex items-start">
                            <FaRegAddressCard
                              className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                              size={20}
                            />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Title
                              </p>
                              <p className="text-lg font-medium text-light-text dark:text-dark-text">
                                {title || 'Not set'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Headline */}
                        <div className="border-b border-light-border dark:border-dark-border pb-4">
                          <div className="flex items-start">
                            <FaHeading
                              className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                              size={20}
                            />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Headline
                              </p>
                              <p className="text-lg font-medium text-light-text dark:text-dark-text">
                                {headline || 'Not set'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="pb-2">
                          <div className="flex items-start">
                            <FaAlignLeft
                              className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                              size={20}
                            />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Summary
                              </p>
                              <p className="text-lg font-medium text-light-text dark:text-dark-text">
                                {summary || 'Not set'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills Card */}
                  <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <FaToolbox
                          className="text-light-primary dark:text-dark-primary"
                          size={20}
                        />
                        <h3 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                          Skills
                        </h3>
                      </div>
                      {editSkills ? (
                        <button
                          type="button"
                          onClick={resetSkills}
                          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white transition duration-300"
                        >
                          <FaTimes />
                          Cancel
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditSkills(true)}
                          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-light-primary dark:bg-dark-primary text-white hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-300"
                        >
                          <FaEdit />
                          Edit
                        </button>
                      )}
                    </div>
                    {editSkills ? (
                      <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {skills.map((skill, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-light-text dark:text-dark-text"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleDeleteSkill(index)}
                                className="ml-1"
                              >
                                <FaTrash className="text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-start  gap-2">
                          <div className="flex-1">
                            <InputField
                              id="new-skill"
                              type="text"
                              label="Add a skill"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              validationMessage={null}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddNewSkill();
                                }
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleAddNewSkill}
                            className="mt-2 px-4 py-2 bg-light-primary dark:bg-dark-primary hover:bg-light-secondary dark:hover:bg-dark-secondary text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-1"
                          >
                            <FaSave />
                            Add
                          </button>
                          {lastDeletedSkill !== null && (
                            <button
                              type="button"
                              onClick={handleUndoSkill}
                              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-semibold transition-all duration-200 flex items-center gap-1"
                            >
                              <FaUndo />
                              Undo
                            </button>
                          )}
                        </div>
                        <div className="flex justify-end mt-4">
                          <button
                            type="button"
                            onClick={saveSection}
                            className="flex items-center gap-2 bg-light-primary dark:bg-dark-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-300"
                          >
                            <FaSave />
                            Save Skills
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 text-light-text dark:text-dark-text">
                        {skills.length > 0 ? (
                          skills.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p>No skills added.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Experience & Education Card */}
                  <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                          Experience & Education
                        </h3>
                      </div>
                      {editExpEdu ? (
                        <button
                          type="button"
                          onClick={resetExpEdu}
                          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white transition duration-300"
                        >
                          <FaTimes />
                          Cancel
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditExpEdu(true)}
                          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-light-primary dark:bg-dark-primary text-white hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-300"
                        >
                          <FaEdit />
                          Edit
                        </button>
                      )}
                    </div>
                    {editExpEdu ? (
                      <div className="flex flex-col gap-4">
                        <InputField
                          id="experience"
                          type="textarea"
                          label="Experience"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          rows={4}
                          icon={<FaClipboardList className="text-gray-400" />}
                        />
                        <InputField
                          id="education"
                          type="textarea"
                          label="Education"
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                          rows={4}
                          icon={<FaGraduationCap className="text-gray-400" />}
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={saveSection}
                            className="flex items-center gap-2 bg-light-primary dark:bg-dark-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-300"
                          >
                            <FaSave />
                            Save Exp & Edu
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Experience */}
                        <div className="border-b border-light-border dark:border-dark-border pb-4">
                          <div className="flex items-start">
                            <FaClipboardList
                              className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                              size={20}
                            />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Experience
                              </p>
                              <p className="text-lg font-medium text-light-text dark:text-dark-text">
                                {experience || 'Not set'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Education */}
                        <div className="pb-2">
                          <div className="flex items-start">
                            <FaGraduationCap
                              className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                              size={20}
                            />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Education
                              </p>
                              <p className="text-lg font-medium text-light-text dark:text-dark-text">
                                {education || 'Not set'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Additional Details Card */}
                <div>
                  <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                          Additional Details
                        </h3>
                      </div>
                      {editAdditional ? (
                        <button
                          type="button"
                          onClick={resetAdditional}
                          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white transition duration-300"
                        >
                          <FaTimes />
                          Cancel
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditAdditional(true)}
                          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-light-primary dark:bg-dark-primary text-white hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-300"
                        >
                          <FaEdit />
                          Edit
                        </button>
                      )}
                    </div>
                    {editAdditional ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <InputField
                            id="industry"
                            type="text"
                            label="Industry"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            icon={<FaIndustry className="text-gray-400" />}
                          />
                        </div>
                        <div className="flex flex-col">
                          <InputField
                            id="availability"
                            type="select"
                            label="Availability"
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                            options={[
                              { value: 'Immediate', label: 'Immediate' },
                              { value: 'Two weeks', label: 'Two weeks' },
                              { value: 'One month', label: 'One month' },
                              {
                                value: 'More than a month',
                                label: 'More than a month',
                              },
                              { value: 'Full-Time', label: 'Full-Time' },
                            ]}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <InputField
                            id="company"
                            type="text"
                            label="Company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            icon={<FaBuilding className="text-gray-400" />}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <InputField
                            id="achievements"
                            type="textarea"
                            label="Achievements"
                            value={achievements}
                            onChange={(e) => setAchievements(e.target.value)}
                            rows={3}
                            icon={<FaClipboardList className="text-gray-400" />}
                          />
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
                          <InputField
                            id="rating"
                            type="number"
                            label="Rating (0-5)"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            min="0"
                            max="5"
                            step="0.1"
                            icon={<FaCalendarAlt className="text-gray-400" />}
                          />
                          <InputField
                            id="portfolio"
                            type="text"
                            label="Portfolio URL"
                            value={portfolio}
                            onChange={(e) => setPortfolio(e.target.value)}
                            icon={<FaClipboardList className="text-gray-400" />}
                          />
                        </div>
                        <div className="flex justify-end mt-4">
                          <button
                            type="button"
                            onClick={saveSection}
                            className="flex items-center gap-2 bg-light-primary dark:bg-dark-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-300"
                          >
                            <FaSave />
                            Save Additional
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Industry */}
                        <div className="border-b border-light-border dark:border-dark-border pb-4">
                          <div className="flex items-start">
                            <FaIndustry
                              className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                              size={20}
                            />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Industry
                              </p>
                              <p className="text-lg font-medium text-light-text dark:text-dark-text">
                                {industry || 'Not set'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="border-b border-light-border dark:border-dark-border pb-4">
                          <div className="flex items-start">
                            <FaCalendarAlt
                              className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                              size={20}
                            />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Availability
                              </p>
                              <p className="text-lg font-medium text-light-text dark:text-dark-text">
                                {availability || 'Not set'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Company */}
                        <div className="border-b border-light-border dark:border-dark-border pb-4">
                          <div className="flex items-start">
                            <FaBuilding
                              className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                              size={20}
                            />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Company
                              </p>
                              <p className="text-lg font-medium text-light-text dark:text-dark-text">
                                {company || 'Not set'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Achievements */}
                        <div className="border-b border-light-border dark:border-dark-border pb-4">
                          <div className="flex items-start">
                            <FaClipboardList
                              className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                              size={20}
                            />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Achievements
                              </p>
                              <p className="text-lg font-medium text-light-text dark:text-dark-text">
                                {achievements || 'Not set'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="border-b border-light-border dark:border-dark-border pb-4">
                          <div className="flex items-start">
                            <FaCalendarAlt
                              className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                              size={20}
                            />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Rating
                              </p>
                              <p className="text-lg font-medium text-light-text dark:text-dark-text">
                                {rating || 'Not set'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Portfolio */}
                        <div className="pb-2">
                          <div className="flex items-start">
                            <FaClipboardList
                              className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                              size={20}
                            />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Portfolio
                              </p>
                              <p className="text-lg font-medium text-light-text dark:text-dark-text">
                                {portfolio || 'Not set'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delete Resume Section */}
              {!(
                editOverview ||
                editSkills ||
                editExpEdu ||
                editAdditional
              ) && (
                <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 my-6">
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-500 mb-4">
                    Delete Resume
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Once you delete your resume, it cannot be recovered.
                  </p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300"
                    >
                      <FaTrash className="mr-2" />
                      Delete Resume
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirm Resume Deletion"
        >
          <div>
            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete your resume? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all duration-200"
                onClick={() => {
                  confirmDeleteResume();
                  setShowDeleteModal(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </section>
    </>
  );
}

const ProtectedResumeScreen = IsAuth(ResumeScreen);

export default ProtectedResumeScreen;
