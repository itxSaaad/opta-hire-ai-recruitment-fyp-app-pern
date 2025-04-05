import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaSave, FaTrash, FaUndo } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import ErrorMsg from '../components/ErrorMsg';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

import {
  useGetResumeForUserQuery,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
} from '../features/resume/resumeApi';
import InputField from '../components/ui/mainLayout/InputField';

function ResumeScreen() {
  const { userInfo: user, loading: authLoading } = useSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();

  const {
    data: resumeData,
    isLoading: resumeLoading,
    error: resumeError,
  } = useGetResumeForUserQuery(undefined, { skip: !user });
  const [updateResume, { isLoading: updatingResume, error: updateError }] =
    useUpdateResumeMutation();
  const [deleteResume, { isLoading: deletingResume, error: deleteError }] =
    useDeleteResumeMutation();

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

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      console.error('Update resume failed:', err);
    }
  };

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
      const newSkills = [...skills];
      newSkills.splice(lastDeletedSkill.index, 0, lastDeletedSkill.value);
      setSkills(newSkills);
      setLastDeletedSkill(null);
    }
  };

  const confirmDeleteResume = async () => {
    try {
      await deleteResume().unwrap();
      navigate('/resume/create');
    } catch (err) {
      console.error('Delete resume failed:', err);
    }
  };

  const isFormChanged =
    resumeData &&
    resumeData.profile &&
    (title !== (resumeData.profile.title || '') ||
      headline !== (resumeData.profile.headline || '') ||
      summary !== (resumeData.profile.summary || '') ||
      JSON.stringify(skills) !==
        JSON.stringify(resumeData.profile.skills || []) ||
      experience !== (resumeData.profile.experience || '') ||
      education !== (resumeData.profile.education || '') ||
      industry !== (resumeData.profile.industry || '') ||
      availability !== (resumeData.profile.availability || 'Immediate') ||
      company !== (resumeData.profile.company || '') ||
      achievements !== (resumeData.profile.achievements || '') ||
      parseFloat(rating) !== resumeData.profile.rating ||
      portfolio !== (resumeData.profile.portfolio || ''));

  const handleReset = () => {
    setTitle(resumeData.profile.title || '');
    setHeadline(resumeData.profile.headline || '');
    setSummary(resumeData.profile.summary || '');
    setSkills(resumeData.profile.skills || []);
    setExperience(resumeData.profile.experience || '');
    setEducation(resumeData.profile.education || '');
    setIndustry(resumeData.profile.industry || '');
    setAvailability(resumeData.profile.availability || 'Immediate');
    setCompany(resumeData.profile.company || '');
    setAchievements(resumeData.profile.achievements || '');
    setRating(
      resumeData.profile.rating !== null &&
        resumeData.profile.rating !== undefined
        ? resumeData.profile.rating
        : ''
    );
    setPortfolio(resumeData.profile.portfolio || '');
  };

  const overallLoading =
    authLoading || resumeLoading || updatingResume || deletingResume;

  return (
    <>
      <Helmet>
        <title>Resume - OptaHire</title>
        <meta name="description" content="View and update your resume." />
      </Helmet>
      <section className="min-h-screen flex items-center justify-center pt-20 pb-14 px-4 bg-light-background dark:bg-dark-background">
        {overallLoading ? (
          <Loader />
        ) : (
          <div className="w-full max-w-4xl relative animate-fadeIn rounded-xl p-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-light-primary dark:text-dark-primary mb-4">
                Your Resume
              </h2>
              <p className="text-light-text dark:text-dark-text mb-6">
                Update your resume details below.
              </p>
            </div>
            {resumeError && <ErrorMsg errorMsg={resumeError.data?.message} />}
            {updateError && <ErrorMsg errorMsg={updateError.data?.message} />}
            {deleteError && <ErrorMsg errorMsg={deleteError.data?.message} />}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4 sm:space-y-6"
            >
              {/* Title & Headline */}
              <div className="grid grid-cols-1 sm:gap-4 sm:grid-cols-2">
                <InputField
                  id="title"
                  type="text"
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <InputField
                  id="headline"
                  type="text"
                  label="Headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>

              {/* Summary */}
              <InputField
                id="summary"
                type="textarea"
                label="Summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
              />

              {/* Skills */}
              <div>
                <label className="block text-light-text dark:text-dark-text text-sm font-medium mb-1">
                  Skills
                </label>
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
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewSkill();
                      }
                    }}
                    className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewSkill}
                    className="px-4 py-2 bg-light-primary dark:bg-dark-primary hover:bg-light-secondary dark:hover:bg-dark-secondary text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-1"
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
              </div>

              {/* Experience & Education */}
              <div className="grid grid-cols-1 sm:gap-4 sm:grid-cols-2">
                <InputField
                  id="experience"
                  type="textarea"
                  label="Experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={4}
                />
                <InputField
                  id="education"
                  type="textarea"
                  label="Education"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Industry / Availability / Company */}
              <div className="grid grid-cols-1 sm:gap-4 sm:grid-cols-3">
                <InputField
                  id="industry"
                  type="text"
                  label="Industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
                <div>
                  <label className="block text-light-text dark:text-dark-text text-sm font-medium mb-1">
                    Availability
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Two weeks">Two weeks</option>
                    <option value="One month">One month</option>
                    <option value="More than a month">More than a month</option>
                    <option value="Full-Time">Full-Time</option>
                  </select>
                </div>
                <InputField
                  id="company"
                  type="text"
                  label="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              {/* Achievements */}
              <InputField
                id="achievements"
                type="textarea"
                label="Achievements"
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                rows={3}
              />

              {/* Rating & Portfolio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  id="rating"
                  type="number"
                  label="Rating (0-5)"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  min="0"
                  max="5"
                  step="0.1"
                />
                <InputField
                  id="portfolio"
                  type="text"
                  label="Portfolio URL"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className={`w-full flex items-center justify-center bg-light-primary dark:bg-dark-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-all duration-300 ${
                    updatingResume || !isFormChanged
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  disabled={updatingResume || !isFormChanged}
                >
                  <FaSave className="mr-2" />
                  Save Resume
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full flex items-center justify-center bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300"
                >
                  <FaUndo className="mr-2" />
                  Reset Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300"
                >
                  <FaTrash className="mr-2" />
                  Delete Resume
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
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
    </>
  );
}

export default ResumeScreen;
