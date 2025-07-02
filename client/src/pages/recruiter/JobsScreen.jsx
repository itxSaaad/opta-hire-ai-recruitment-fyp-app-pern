import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaAlignLeft,
  FaBriefcase,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaDollarSign,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaPencilAlt,
  FaPlus,
  FaSave,
  FaTimes,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useCheckAiServiceStatusQuery,
  useShortlistCandidatesMutation,
} from '../../features/ai/aiApi';
import {
  useCreateJobMutation,
  useGetAllJobsQuery,
  useUpdateJobByIdMutation,
} from '../../features/job/jobApi';

export default function JobsScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [isClosed, setIsClosed] = useState(false);

  const routeLocation = useLocation();

  const {
    data: jobs,
    isLoading: isJobsLoading,
    error,
    refetch,
  } = useGetAllJobsQuery({
    recruiterId: useSelector((state) => state.auth.userInfo?.id),
  });

  const {
    data: aiServiceStatus,
    isLoading: isAiServiceLoading,
    error: aiServiceError,
    refetch: refetchAiServiceStatus,
  } = useCheckAiServiceStatusQuery();

  const [
    createJob,
    {
      isLoading: isCreating,
      error: createError,
      isSuccess: createSuccess,
      data: createData,
    },
  ] = useCreateJobMutation();

  const [
    updateJob,
    {
      isLoading: isUpdating,
      error: updateError,
      isSuccess: updateSuccess,
      data: updateData,
    },
  ] = useUpdateJobByIdMutation();

  const [
    shortlistCandidates,
    {
      isLoading: isShortlisting,
      error: shortlistError,
      isSuccess: shortlistSuccess,
      data: shortlistData,
    },
  ] = useShortlistCandidatesMutation();

  useEffect(() => {
    trackPageView(routeLocation.pathname);
  }, [routeLocation.pathname]);

  useEffect(() => {
    if (selectedJob) {
      setTitle(selectedJob.title || '');
      setDescription(selectedJob.description || '');
      setCompany(selectedJob.company || '');
      setRequirements(selectedJob.requirements || '');
      setBenefits(selectedJob.benefits || '');
      setSalaryRange(selectedJob.salaryRange || '');
      setCategory(selectedJob.category || '');
      setLocation(selectedJob.location || '');
      setIsClosed(selectedJob.isClosed || false);
    }
  }, [selectedJob]);

  const handleEdit = (job) => {
    setSelectedJob(job);
    setShowEditModal(true);
    trackEvent('Edit Job', 'User Action', 'User clicked on edit job button');
  };

  const handleCreateJob = () => {
    setShowCreateModal(true);
    setSelectedJob(null);
    setTitle('');
    setDescription('');
    setCompany('');
    setRequirements('');
    setBenefits('');
    setSalaryRange('');
    setCategory('');
    setLocation('');
    setIsClosed(false);
    trackEvent(
      'Create Job',
      'User Action',
      'User clicked on create job button'
    );
  };

  const createNewJob = async () => {
    try {
      await createJob({
        title,
        description,
        company,
        requirements,
        benefits,
        salaryRange,
        category,
        location,
        isClosed,
      }).unwrap();
      setShowCreateModal(false);
      refetch();
      refetchAiServiceStatus();
      trackEvent('Create Job', 'User Action', `User created job ${title}`);
    } catch (err) {
      console.error('Create failed:', err);
      trackEvent(
        'Create Job Failed',
        'User Action',
        `User failed to create job ${title}`
      );
    }
  };

  const saveJobChanges = async () => {
    try {
      await updateJob({
        id: selectedJob.id,
        jobData: {
          title,
          description,
          company,
          requirements,
          benefits,
          salaryRange,
          category,
          location,
          isClosed,
        },
      }).unwrap();

      if (isClosed) {
        await shortlistCandidates(selectedJob.id).unwrap();
        trackEvent(
          'Shortlist Candidates',
          'User Action',
          `User shortlisted candidates for job ${selectedJob.title}`
        );
      }

      setShowEditModal(false);
      refetch();
      refetchAiServiceStatus();
      trackEvent(
        'Update Job',
        'User Action',
        `User updated job ${selectedJob.title}`
      );
    } catch (err) {
      console.error('Update failed:', err);
      trackEvent(
        'Update Job Failed',
        'User Action',
        `User failed to update job ${selectedJob.title}`
      );
    }
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
    trackEvent(
      'View Job',
      'User Action',
      `User clicked on view job details for ${job.title}`
    );
  };

  const handleShortlistCandidates = async (job) => {
    if (!aiServiceStatus?.data?.model_trained) {
      trackEvent(
        'Shortlist Candidates Failed',
        'User Action',
        `User attempted to shortlist candidates for ${job.title} but AI service not ready`
      );
      return;
    }

    try {
      await shortlistCandidates(job.id).unwrap();
      trackEvent(
        'Shortlist Candidates',
        'User Action',
        `User shortlisted candidates for job ${job.title}`
      );
      refetch();
      refetchAiServiceStatus();
    } catch (err) {
      console.error('Shortlisting failed:', err);
      trackEvent(
        'Shortlist Candidates Failed',
        'User Action',
        `User failed to shortlist candidates for job ${job.title}`
      );
    }
  };

  const renderBulletPoints = (text) => {
    if (!text) return null;
    return (
      <ul className="list-disc space-y-1 pl-5 text-light-text dark:text-dark-text">
        {text.split(',').map((item, index) => (
          <li key={index} className="text-light-text dark:text-dark-text">
            {item.trim()}
          </li>
        ))}
      </ul>
    );
  };

  const columns = [
    {
      key: 'title',
      label: 'Job Title',
    },
    {
      key: 'company',
      label: 'Company',
    },
    {
      key: 'category',
      label: 'Category',
    },
    {
      key: 'location',
      label: 'Location',
    },
    {
      key: 'salaryRange',
      label: 'Salary Range',
    },
    {
      key: 'status',
      label: 'Status',
      render: (job) => (
        <span
          className={`${job.isClosed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} rounded px-2.5 py-0.5 text-xs font-medium`}
        >
          {job.isClosed ? 'Closed' : 'Open'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (job) => new Date(job.createdAt).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      onClick: handleViewJob,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-indigo-500 px-3 py-1 text-white hover:bg-indigo-600">
          <FaBriefcase />
          View Job
        </button>
      ),
    },
    {
      onClick: handleShortlistCandidates,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600">
          <FaCheckCircle />
          Shortlist Candidates
        </button>
      ),
    },
    {
      onClick: handleEdit,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
          <FaPencilAlt />
          Edit
        </button>
      ),
    },
  ];

  const isLoading =
    isJobsLoading || isAiServiceLoading || isUpdating || isShortlisting;

  return (
    <>
      <Helmet>
        <title>Manage Jobs - OptaHire | Post & Track Job Openings</title>
        <meta
          name="description"
          content="Manage your job postings on OptaHire. Create compelling job descriptions and attract top talent with AI-powered visibility."
        />
        <meta
          name="keywords"
          content="OptaHire Manage Jobs, Job Postings, Recruiter Jobs, Hiring Positions, Job Creation"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn flex-col items-center bg-light-background px-4 py-24 dark:bg-dark-background">
        {isLoading ? (
          <div className="relative w-full max-w-sm animate-fadeIn sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-7xl animate-slideUp">
            <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
              Manage{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Job Postings
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Create and manage your job postings to attract the best talent
              with AI-enhanced visibility.
            </p>

            {/* Simplified AI Service Status Card */}
            {aiServiceStatus && (
              <div className="mb-8 overflow-hidden rounded-lg border border-light-border bg-white shadow-md dark:border-dark-border dark:bg-dark-surface">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full p-2 ${aiServiceStatus?.data?.model_trained ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}
                    >
                      {aiServiceStatus?.data?.model_trained ? (
                        <FaCheckCircle className="h-6 w-6" />
                      ) : (
                        <FaExclamationTriangle className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-light-text dark:text-dark-text">
                        AI Shortlisting Service
                      </h2>
                      <p className="text-light-text/70 dark:text-dark-text/70">
                        {aiServiceStatus?.data?.model_trained
                          ? 'Ready to shortlist candidates when you close jobs'
                          : 'Not ready - cannot perform automatic shortlisting'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                      aiServiceStatus?.data?.model_trained
                        ? 'bg-light-primary/10 text-light-primary dark:bg-dark-primary/20 dark:text-dark-primary'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                    }`}
                  >
                    {aiServiceStatus?.data?.model_trained
                      ? 'Active'
                      : 'Inactive'}
                  </span>
                </div>

                {!aiServiceStatus?.data?.model_trained && (
                  <div className="border-t border-light-border bg-yellow-50 p-4 dark:border-dark-border dark:bg-yellow-900/20">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Action Required
                        </h3>
                        <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                          <p>
                            The AI shortlisting service is currently
                            unavailable. If you close jobs now, candidates will
                            not be automatically shortlisted. Please contact
                            your system administrator to resolve this issue.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(error ||
              aiServiceError ||
              updateError ||
              shortlistError ||
              createError) && (
              <Alert
                message={
                  error?.data?.message ||
                  aiServiceError?.data?.message ||
                  updateError?.data?.message ||
                  shortlistError?.data?.message ||
                  createError?.data?.message
                }
              />
            )}

            {createSuccess && createData?.data?.message && (
              <Alert message={createData?.data?.message} isSuccess={true} />
            )}

            {updateSuccess && updateData?.data?.message && (
              <Alert message={updateData?.data?.message} isSuccess={true} />
            )}

            {shortlistSuccess && shortlistData?.data?.message && (
              <Alert message={shortlistData?.data?.message} isSuccess={true} />
            )}

            <button
              onClick={handleCreateJob}
              className="mb-4 flex items-center gap-2 rounded bg-light-primary px-4 py-2 text-white transition hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
              disabled={isCreating}
            >
              <FaPlus /> Create Job
            </button>

            <Table
              columns={columns}
              data={jobs?.jobs || []}
              actions={actions}
            />
          </div>
        )}
      </section>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Job"
      >
        {isCreating ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {createError && <Alert message={createError.data.message} />}
            {!aiServiceStatus?.data?.model_trained && (
              <Alert message="Warning: The AI service is not ready. Closing a job now will not automatically shortlist candidates." />
            )}
            <InputField
              id="title"
              type="text"
              label="Job Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <InputField
              id="company"
              type="text"
              label="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <InputField
              id="description"
              type="textarea"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <InputField
              id="requirements"
              type="textarea"
              label="Requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
            <InputField
              id="benefits"
              type="textarea"
              label="Benefits"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
            />
            <InputField
              id="salaryRange"
              type="text"
              label="Salary Range"
              placeholder="$30k - $50k"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
            />
            <InputField
              id="category"
              type="select"
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'IT', label: 'IT' },
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Sales', label: 'Sales' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <InputField
              id="location"
              type="text"
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <button
                className="flex items-center gap-2 rounded bg-gray-300 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                <FaTimes />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded bg-light-primary px-4 py-2 text-white transition-all duration-200 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
                onClick={createNewJob}
                disabled={isCreating}
              >
                <FaPlus />
                Create Job
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Job"
      >
        {isUpdating ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {updateError && <Alert message={updateError.data.message} />}
            {!aiServiceStatus?.data?.model_trained && !isClosed && (
              <Alert message="Warning: The AI service is not ready. Closing a job now will not automatically shortlist candidates." />
            )}
            <InputField
              id="title"
              type="text"
              label="Job Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <InputField
              id="company"
              type="text"
              label="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <InputField
              id="description"
              type="textarea"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <InputField
              id="requirements"
              type="textarea"
              label="Requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
            <InputField
              id="benefits"
              type="textarea"
              label="Benefits"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
            />
            <InputField
              id="salaryRange"
              type="text"
              label="Salary Range"
              placeholder="$30k - $50k"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
            />
            <InputField
              id="category"
              type="select"
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'IT', label: 'IT' },
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Sales', label: 'Sales' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <InputField
              id="location"
              type="text"
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <InputField
              id="isClosed"
              type="checkbox"
              label="Closed"
              checked={isClosed}
              value={isClosed}
              onChange={(e) => setIsClosed(e.target.checked)}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <button
                className="flex items-center gap-2 rounded bg-gray-300 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                <FaTimes />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded bg-light-primary px-4 py-2 text-white transition-all duration-200 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
                onClick={saveJobChanges}
                disabled={isUpdating}
              >
                <FaSave />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Job Details"
      >
        {selectedJob && (
          <div className="space-y-4 text-left">
            <div className="border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaBriefcase
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Title
                  </p>
                  <p className="break-words text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedJob.title}
                  </p>
                  <p className="mt-1 text-sm text-light-secondary dark:text-dark-secondary">
                    {selectedJob.company}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaMapMarkerAlt
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Location
                  </p>
                  <p className="break-words text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedJob.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaDollarSign
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Salary
                  </p>
                  <p className="text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedJob.salaryRange}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaClock
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Category
                  </p>
                  <p className="text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedJob.category}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaAlignLeft
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Description
                  </p>
                  <p className="whitespace-pre-wrap break-words text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedJob.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaClipboardList
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Requirements
                  </p>
                  {selectedJob.requirements ? (
                    <div className="mt-1 text-light-text dark:text-dark-text">
                      {renderBulletPoints(selectedJob.requirements)}
                    </div>
                  ) : (
                    <p className="text-lg font-medium text-light-text dark:text-dark-text">
                      No requirements listed.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaDollarSign
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Benefits
                  </p>
                  {selectedJob.benefits ? (
                    <div className="mt-1 text-light-text dark:text-dark-text">
                      {renderBulletPoints(selectedJob.benefits)}
                    </div>
                  ) : (
                    <p className="text-lg font-medium text-light-text dark:text-dark-text">
                      No benefits listed.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => setShowDetailsModal(false)}
              >
                <FaTimes />
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
