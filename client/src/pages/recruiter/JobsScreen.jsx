import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
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
          <div
            key={selectedJob.id}
            className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-lg border border-light-border dark:border-dark-border transition-all duration-500 hover:shadow-xl"
          >
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                  {selectedJob.title}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-medium text-light-secondary dark:text-dark-secondary">
                    {selectedJob.company}
                  </span>
                  <span className="text-light-text dark:text-dark-text opacity-60">
                    •
                  </span>
                  <span className="text-sm flex items-center gap-1 text-light-text dark:text-dark-text opacity-60">
                    <FaMapMarkerAlt /> {selectedJob.location}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-light-primary bg-opacity-10 text-light-primary dark:text-dark-primary text-xs font-medium px-3 py-1 rounded-full flex items-center">
                  <FaDollarSign className="mr-1" /> {selectedJob.salaryRange}
                </span>
                <span className="bg-light-secondary bg-opacity-10 text-light-secondary dark:text-dark-secondary text-xs font-medium px-3 py-1 rounded-full flex items-center">
                  <FaClock className="mr-1" /> {selectedJob.category}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-light-background dark:bg-dark-background rounded-lg transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text flex items-center gap-2 mb-3">
                  <FaBriefcase className="text-light-primary dark:text-dark-primary" />{' '}
                  Description
                </h3>
                <p className="text-light-text dark:text-dark-text">
                  {selectedJob.description}
                </p>
              </div>

              <div className="p-4 bg-light-background dark:bg-dark-background rounded-lg transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-3 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-light-primary dark:text-dark-primary" />{' '}
                  Requirements
                </h3>
                <div className="text-light-text dark:text-dark-text">
                  {selectedJob.requirements
                    ? renderBulletPoints(selectedJob.requirements)
                    : 'No requirements listed'}
                </div>
              </div>

              <div className="p-4 bg-light-background dark:bg-dark-background rounded-lg transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-3 flex items-center">
                  <FaDollarSign className="mr-2 text-light-primary dark:text-dark-primary" />{' '}
                  Benefits
                </h3>
                <div className="text-light-text dark:text-dark-text">
                  {selectedJob.benefits
                    ? renderBulletPoints(selectedJob.benefits)
                    : 'No benefits listed'}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
