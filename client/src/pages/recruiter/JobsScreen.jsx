import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaAlignLeft,
  FaBriefcase,
  FaClipboardList,
  FaClock,
  FaDollarSign,
  FaMapMarkerAlt,
  FaPencilAlt,
  FaSave,
  FaTimes,
} from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useGetAllJobsQuery,
  useUpdateJobByIdMutation,
} from '../../features/job/jobApi';

export default function JobsScreen() {
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

  const { data: jobs, isLoading, error, refetch } = useGetAllJobsQuery();

  const [
    updateJob,
    {
      isLoading: isUpdating,
      error: updateError,
      isSuccess: updateSuccess,
      data: updateData,
    },
  ] = useUpdateJobByIdMutation();

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

      setShowEditModal(false);
      refetch();
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

  useEffect(() => {
    trackPageView(routeLocation.pathname);
  }, [routeLocation.pathname]);

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
          className={`${job.isClosed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} text-xs font-medium px-2.5 py-0.5 rounded`}
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
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaBriefcase />
          View Job Details
        </button>
      ),
    },
    {
      onClick: handleEdit,
      render: () => (
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaPencilAlt />
          Edit
        </button>
      ),
    },
  ];

  const renderBulletPoints = (text) => {
    if (!text) return null;
    return (
      <ul className="list-disc pl-5 space-y-1 text-light-text dark:text-dark-text">
        {text.split(',').map((item, index) => (
          <li key={index} className="text-light-text dark:text-dark-text">
            {item.trim()}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <Helmet>
        <title>Job Listings [Recruiter] - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Recruiter Job Listings - Manage and edit job listings."
        />
        <meta
          name="keywords"
          content="job listings, job search, career opportunities, find jobs, job openings, employment, job vacancies"
        />
      </Helmet>
      <section className="min-h-screen flex flex-col items-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        {isLoading ? (
          <div className="w-full max-w-sm sm:max-w-md relative animate-fadeIn">
            <Loader />
          </div>
        ) : (
          <div className="max-w-7xl w-full mx-auto animate-slideUp">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-light-text dark:text-dark-text mb-6">
              Manage Your{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Job Listings
              </span>
            </h1>
            <p className="text-lg text-light-text/70 dark:text-dark-text/70 text-center mb-8">
              View, edit, and manage all your job listings in one place.
            </p>
            {error && <Alert message={error.data.message} />}

            {updateSuccess && updateData?.data?.message && (
              <Alert
                message={updateData?.data?.message}
                isSuccess={updateSuccess}
              />
            )}

            <Table
              columns={columns}
              data={jobs?.jobs || []}
              actions={actions}
            />
          </div>
        )}
      </section>

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
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                <FaTimes />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-light-primary dark:bg-dark-primary hover:bg-light-secondary dark:hover:bg-dark-secondary text-white rounded transition-all duration-200"
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

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Job Details"
      >
        {selectedJob && (
          <div className="space-y-4 text-left">
            <div className="border-b border-light-border dark:border-dark-border pb-4">
              <div className="flex items-start">
                <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
                  <FaBriefcase
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Title
                  </p>
                  <p className="text-lg font-medium text-light-text dark:text-dark-text break-words">
                    {selectedJob.title}
                  </p>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1">
                    {selectedJob.company}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border dark:border-dark-border pb-4">
              <div className="flex items-start">
                <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
                  <FaMapMarkerAlt
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Location
                  </p>
                  <p className="text-lg font-medium text-light-text dark:text-dark-text break-words">
                    {selectedJob.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border dark:border-dark-border pb-4">
              <div className="flex items-start">
                <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
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

            <div className="border-b border-light-border dark:border-dark-border pb-4">
              <div className="flex items-start">
                <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
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

            <div className="border-b border-light-border dark:border-dark-border pb-4">
              <div className="flex items-start">
                <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
                  <FaAlignLeft
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Description
                  </p>
                  <p className="text-lg font-medium text-light-text dark:text-dark-text whitespace-pre-wrap break-words">
                    {selectedJob.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border dark:border-dark-border pb-4">
              <div className="flex items-start">
                <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
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
                    <div className="text-light-text dark:text-dark-text mt-1">
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

            <div className="border-b border-light-border dark:border-dark-border pb-4">
              <div className="flex items-start">
                <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
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
                    <div className="text-light-text dark:text-dark-text mt-1">
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
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
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
