import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaAlignLeft,
  FaBuilding,
  FaCalendarAlt,
  FaClipboardList,
  FaEdit,
  FaGraduationCap,
  FaHeading,
  FaIndustry,
  FaRegAddressCard,
  FaSave,
  FaTimes,
  FaToolbox,
  FaTrash,
  FaUndo,
  FaUser,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import ErrorMsg from '../../components/ErrorMsg';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useDeleteResumeMutation,
  useGetResumeForUserQuery,
  useUpdateResumeMutation,
} from '../../features/resume/resumeApi';

import {
  validateAchievements,
  validateAvailability,
  validateCompany,
  validateEducation,
  validateExperience,
  validateHeadline,
  validateIndustry,
  validatePortfolio,
  validateRating,
  validateSummary,
  validateTitle,
} from '../../utils/validations';

import IsAuth from '../../hoc/IsAuth';

function ResumeScreen() {
  const { userInfo: user, loading: authLoading } = useSelector(
    (state) => state.auth
  );

  const [title, setTitle] = useState('');
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [industry, setIndustry] = useState('');
  const [availability, setAvailability] = useState('Immediate');
  const [company, setCompany] = useState('');
  const [achievements, setAchievements] = useState('');
  const [rating, setRating] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [lastDeletedSkill, setLastDeletedSkill] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editOverview, setEditOverview] = useState(false);
  const [editSkills, setEditSkills] = useState(false);
  const [editExpEdu, setEditExpEdu] = useState(false);
  const [editAdditional, setEditAdditional] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
    headline: '',
    summary: '',
    skills: '',
    experience: '',
    education: '',
    industry: '',
    availability: '',
    company: '',
    achievements: '',
    rating: '',
    portfolio: '',
  });

  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: resumeData,
    isLoading: resumeLoading,
    error: resumeError,
  } = useGetResumeForUserQuery(undefined, { skip: !user });
  const [updateResume, { isLoading: updatingResume, error: updateError }] =
    useUpdateResumeMutation();
  const [deleteResume, { isLoading: deletingResume, error: deleteError }] =
    useDeleteResumeMutation();

  const handleInputChange = (field, value) => {
    let errorMessage = '';

    switch (field) {
      case 'title':
        setTitle(value);
        errorMessage = validateTitle(value);
        break;
      case 'headline':
        setHeadline(value);
        errorMessage = validateHeadline(value);
        break;
      case 'summary':
        setSummary(value);
        errorMessage = validateSummary(value);
        break;
      case 'experience':
        setExperience(value);
        errorMessage = validateExperience(value);
        break;
      case 'education':
        setEducation(value);
        errorMessage = validateEducation(value);
        break;
      case 'industry':
        setIndustry(value);
        errorMessage = validateIndustry(value);
        break;
      case 'availability':
        setAvailability(value);
        errorMessage = validateAvailability(value);
        break;
      case 'company':
        setCompany(value);
        errorMessage = validateCompany(value);
        break;
      case 'achievements':
        setAchievements(value);
        errorMessage = validateAchievements(value);
        break;
      case 'rating':
        setRating(value);
        errorMessage = validateRating(value);
        break;
      case 'portfolio':
        setPortfolio(value);
        errorMessage = validatePortfolio(value);
        break;
      case 'newSkill':
        setNewSkill(value);
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
  };

  const validateSection = (section) => {
    let sectionErrors = {};

    if (section === 'overview' || section === 'all') {
      sectionErrors.title = validateTitle(title);
      sectionErrors.headline = validateHeadline(headline);
      sectionErrors.summary = validateSummary(summary);
    }

    if (section === 'skills' || section === 'all') {
      sectionErrors.skills =
        skills.length === 0 ? 'Add at least one skill' : '';
    }

    if (section === 'expEdu' || section === 'all') {
      sectionErrors.experience = validateExperience(experience);
      sectionErrors.education = validateEducation(education);
    }

    if (section === 'additional' || section === 'all') {
      sectionErrors.industry = validateIndustry(industry);
      sectionErrors.availability = validateAvailability(availability);
      sectionErrors.company = validateCompany(company);
      sectionErrors.achievements = validateAchievements(achievements);
      sectionErrors.rating = validateRating(rating);
      sectionErrors.portfolio = validatePortfolio(portfolio);
    }

    setErrors((prev) => ({ ...prev, ...sectionErrors }));

    return !Object.values(sectionErrors).some((error) => error);
  };

  const saveSection = async () => {
    let isValid = false;

    if (editOverview) {
      isValid = validateSection('overview');
    } else if (editSkills) {
      isValid = validateSection('skills');
    } else if (editExpEdu) {
      isValid = validateSection('expEdu');
    } else if (editAdditional) {
      isValid = validateSection('additional');
    }

    if (!isValid) return;

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
      setEditOverview(false);
      setEditSkills(false);
      setEditExpEdu(false);
      setEditAdditional(false);
      trackEvent('Resume', 'User Action', `Resume Updated`);
    } catch (err) {
      console.error('Update resume failed:', err);
      trackEvent(
        'Resume',
        'User Action',
        `Failed - ${err.data?.message || 'Server Error'}`
      );
    }
  };

  const resetOverview = () => {
    if (resumeData?.profile) {
      const { title, headline, summary } = resumeData.profile;
      setTitle(title || '');
      setHeadline(headline || '');
      setSummary(summary || '');
    }
    setEditOverview(false);
    trackEvent('Resume', 'User Action', `Overview Reset`);
  };

  const resetSkills = () => {
    if (resumeData?.profile) {
      setSkills(resumeData.profile.skills || []);
    }
    setNewSkill('');
    setLastDeletedSkill(null);
    setEditSkills(false);
    trackEvent('Resume', 'User Action', `Skills Reset`);
  };

  const resetExpEdu = () => {
    if (resumeData?.profile) {
      const { experience, education } = resumeData.profile;
      setExperience(experience || '');
      setEducation(education || '');
    }
    setEditExpEdu(false);
    trackEvent('Resume', 'User Action', `Experience & Education Reset`);
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
    trackEvent('Resume', 'User Action', `Additional Details Reset`);
  };

  const handleAddNewSkill = () => {
    if (newSkill.trim() !== '') {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
    trackEvent('Resume', 'User Action', `Skill Added`);
  };

  const handleDeleteSkill = (index) => {
    const deletedSkill = { index, value: skills[index] };
    setLastDeletedSkill(deletedSkill);
    setSkills(skills.filter((_, i) => i !== index));
    trackEvent('Resume', 'User Action', `Skill Deleted`);
  };

  const handleUndoSkill = () => {
    if (lastDeletedSkill !== null) {
      const newSkillsArray = [...skills];
      newSkillsArray.splice(lastDeletedSkill.index, 0, lastDeletedSkill.value);
      setSkills(newSkillsArray);
      setLastDeletedSkill(null);
    }
    trackEvent('Resume', 'User Action', `Skill Undone`);
  };

  const confirmDeleteResume = async () => {
    try {
      await deleteResume().unwrap();
      navigate('/resume/create');
      trackEvent('Resume', 'User Action', `Resume Deleted`);
    } catch (err) {
      console.error('Delete resume failed:', err);
      trackEvent(
        'Resume',
        'User Action',
        `Failed - ${err.data?.message || 'Server Error'}`
      );
    }
  };

  const overallLoading =
    authLoading || resumeLoading || updatingResume || deletingResume;

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

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Resume - OptaHire</title>
        <meta
          name="description"
          content="View and manage your resume details."
        />
      </Helmet>
      <section className="min-h-screen flex items-center justify-center py-24 px-4 bg-light-background dark:bg-dark-background">
        {overallLoading ? (
          <div className="w-full max-w-sm sm:max-w-md relative animate-fadeIn">
            <Loader />
          </div>
        ) : (
          <div className="w-full max-w-7xl relative animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-light-primary dark:text-dark-primary mb-2">
                Your Resume
              </h2>
              {resumeError || updateError || deleteError ? (
                <ErrorMsg
                  errorMsg={
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6 animate-slideInLeft">
                <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                      Overview
                    </h3>
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
                    <div className="space-y-6">
                      <div className="flex flex-col gap-4">
                        <InputField
                          id="title"
                          type="text"
                          label="Title"
                          value={title}
                          onChange={(e) =>
                            handleInputChange('title', e.target.value)
                          }
                          icon={<FaUser className="text-gray-400" />}
                          validationMessage={errors.title}
                        />
                        <InputField
                          id="headline"
                          type="text"
                          label="Headline"
                          value={headline}
                          onChange={(e) =>
                            handleInputChange('headline', e.target.value)
                          }
                          icon={<FaHeading className="text-gray-400" />}
                          validationMessage={errors.headline}
                        />
                      </div>
                      <InputField
                        id="summary"
                        type="textarea"
                        label="Summary"
                        value={summary}
                        onChange={(e) =>
                          handleInputChange('summary', e.target.value)
                        }
                        rows={4}
                        icon={<FaAlignLeft className="text-gray-400" />}
                        validationMessage={errors.summary}
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

                <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
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
                      <div className="flex flex-wrap gap-2 mb-4">
                        {skills.map((skill, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-light-text dark:text-dark-text"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(index)}
                              className="ml-2"
                            >
                              <FaTimes className="text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <InputField
                            id="new-skill"
                            type="text"
                            label="Add a skill"
                            value={newSkill}
                            onChange={(e) =>
                              handleInputChange('newSkill', e.target.value)
                            }
                            validationMessage={errors.skills}
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
                            className="mt-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-1"
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

                <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                      Experience & Education
                    </h3>
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
                    <div className="flex flex-col gap-6">
                      <InputField
                        id="experience"
                        type="textarea"
                        label="Experience"
                        value={experience}
                        onChange={(e) =>
                          handleInputChange('experience', e.target.value)
                        }
                        validationMessage={errors.experience}
                        rows={4}
                        icon={<FaClipboardList className="text-gray-400" />}
                      />
                      <InputField
                        id="education"
                        type="textarea"
                        label="Education"
                        value={education}
                        onChange={(e) =>
                          handleInputChange('education', e.target.value)
                        }
                        validationMessage={errors.education}
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

              <div className="space-y-6 animate-slideIn">
                <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                      Additional Details
                    </h3>
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
                    <div className="flex flex-col gap-6">
                      <InputField
                        id="industry"
                        type="text"
                        label="Industry"
                        value={industry}
                        onChange={(e) =>
                          handleInputChange('industry', e.target.value)
                        }
                        validationMessage={errors.industry}
                        icon={<FaIndustry className="text-gray-400" />}
                      />
                      <InputField
                        id="availability"
                        type="select"
                        label="Availability"
                        value={availability}
                        onChange={(e) =>
                          handleInputChange('availability', e.target.value)
                        }
                        validationMessage={errors.availability}
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
                      <InputField
                        id="company"
                        type="text"
                        label="Company"
                        value={company}
                        onChange={(e) =>
                          handleInputChange('company', e.target.value)
                        }
                        validationMessage={errors.company}
                        icon={<FaBuilding className="text-gray-400" />}
                      />
                      <InputField
                        id="achievements"
                        type="textarea"
                        label="Achievements"
                        value={achievements}
                        onChange={(e) =>
                          handleInputChange('achievements', e.target.value)
                        }
                        validationMessage={errors.achievements}
                        rows={3}
                        icon={<FaClipboardList className="text-gray-400" />}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                          id="rating"
                          type="number"
                          label="Rating (0-5)"
                          value={rating}
                          onChange={(e) =>
                            handleInputChange('rating', e.target.value)
                          }
                          validationMessage={errors.rating}
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
                          onChange={(e) =>
                            handleInputChange('portfolio', e.target.value)
                          }
                          validationMessage={errors.portfolio}
                          icon={<FaClipboardList className="text-gray-400" />}
                        />
                      </div>
                      <div className="flex justify-end">
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
            <div className="animate-slideIn bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6 mt-6">
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-500 mb-4">
                Delete Resume
              </h3>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Once you delete your resume, it cannot be recovered.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg font-semibold text-md transition-all duration-300 shadow-md hover:shadow-lg ml-auto sm:ml-0"
                  disabled={deletingResume}
                >
                  <FaTrash className="mr-2" />
                  Delete Resume
                </button>
              </div>
            </div>
            \{' '}
          </div>
        )}

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
