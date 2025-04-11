import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaPencilAlt, FaSave, FaTimes, FaTrash } from 'react-icons/fa';

import ErrorMsg from '../../components/ErrorMsg';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import {
  useDeleteJobByIdMutation,
  useGetAllJobsQuery,
  useUpdateJobByIdMutation,
} from '../../features/job/jobApi';

export default function JobsScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const { data: jobs, isLoading, error, refetch } = useGetAllJobsQuery();
  const [deleteJob, { isLoading: isDeleting, error: deleteError }] =
    useDeleteJobByIdMutation();
  const [updateJob, { isLoading: isUpdating, error: updateError }] =
    useUpdateJobByIdMutation();

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
  };

  const handleDelete = (job) => {
    setSelectedJob(job);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteJob(selectedJob.id).unwrap();
      setShowDeleteModal(false);
      refetch();
    } catch (err) {
      console.error('Deletion failed:', err);
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

      setShowEditModal(false);
      refetch();
    } catch (err) {
      console.error('Update failed:', err);
    }
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
      onClick: handleEdit,
      render: () => (
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaPencilAlt />
          Edit
        </button>
      ),
    },
    {
      onClick: handleDelete,
      render: () => (
        <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaTrash /> Delete
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Jobs Management [Admin] - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Admin Jobs Management - Manage job listings efficiently with our powerful tools."
        />
        <meta
          name="keywords"
          content="OptaHire, Admin Jobs Management, Recruitment, Jobs"
        />
      </Helmet>

      <section className="min-h-screen flex flex-col items-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        {isLoading ? (
          <div className="w-full max-w-sm sm:max-w-md relative animate-fadeIn">
            <Loader />
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-light-text dark:text-dark-text">
              Jobs Management
            </h1>

            {error && <ErrorMsg errorMsg={error.data.message} />}

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
            {updateError && <ErrorMsg errorMsg={updateError.data.message} />}
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
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Job Deletion"
      >
        {isDeleting ? (
          <Loader />
        ) : (
          <div>
            {deleteError && <ErrorMsg errorMsg={deleteError.data.message} />}
            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete the job &quot;{selectedJob?.title}
              &quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all duration-200 flex items-center gap-2"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
