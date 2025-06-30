import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
  FaClock,
  FaDollarSign,
  FaMapMarkerAlt,
  FaSearch,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';

import { trackEvent, trackPageView } from '../../utils/analytics';

import { useGetAllJobsQuery } from '../../features/job/jobApi';

export default function JobsScreen() {
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedJob, setSelectedJob] = useState(null);

  const navigate = useNavigate();
  const routeLocation = useLocation();

  const user = useSelector((state) => state.auth.userInfo);

  const {
    data: jobsData,
    isLoading,
    error,
  } = useGetAllJobsQuery({ isClosed: false });

  const handleJobClick = (job) => {
    setSelectedJob(job);

    trackEvent(
      'Job Selection',
      'User Action',
      `User selected job: ${job.title}`
    );
  };

  useEffect(() => {
    if (jobsData) {
      const filtered = jobsData.jobs.filter((job) => {
        const jobTitle = job.title.toLowerCase();
        const jobLocation = job.location.toLowerCase();
        const search = searchTerm.toLowerCase();
        const loc = location.toLowerCase();

        return (
          (jobTitle.includes(search) || jobLocation.includes(search)) &&
          (jobLocation.includes(loc) || jobTitle.includes(loc))
        );
      });
      setFilteredJobs(filtered);
    }
  }, [jobsData, searchTerm, location]);

  useEffect(() => {
    if (!user) {
      setSelectedJob(null);
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    trackPageView(routeLocation.pathname);
  }, [routeLocation.pathname]);

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

  const renderDetailedJobCard = (job) => (
    <div
      key={job.id}
      className="rounded-lg border border-light-border bg-light-surface p-6 shadow-lg transition-all duration-500 hover:shadow-xl dark:border-dark-border dark:bg-dark-surface"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
            {job.title}
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-medium text-light-secondary dark:text-dark-secondary">
              {job.company}
            </span>
            <span className="text-light-text opacity-60 dark:text-dark-text">
              •
            </span>
            <span className="flex items-center gap-1 text-sm text-light-text opacity-60 dark:text-dark-text">
              <FaMapMarkerAlt /> {job.location}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center rounded-full bg-light-primary bg-opacity-10 px-3 py-1 text-xs font-medium text-light-primary dark:text-dark-primary">
            <FaDollarSign className="mr-1" /> {job.salaryRange}
          </span>
          <span className="flex items-center rounded-full bg-light-secondary bg-opacity-10 px-3 py-1 text-xs font-medium text-light-secondary dark:text-dark-secondary">
            <FaClock className="mr-1" /> {job.category}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg bg-light-background p-4 transition-all duration-300 hover:shadow-md dark:bg-dark-background">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-light-text dark:text-dark-text">
            <FaBriefcase className="text-light-primary dark:text-dark-primary" />{' '}
            Description
          </h3>
          <p className="text-light-text dark:text-dark-text">
            {job.description}
          </p>
        </div>

        <div className="rounded-lg bg-light-background p-4 transition-all duration-300 hover:shadow-md dark:bg-dark-background">
          <h3 className="mb-3 flex items-center text-lg font-semibold text-light-text dark:text-dark-text">
            <FaMapMarkerAlt className="mr-2 text-light-primary dark:text-dark-primary" />{' '}
            Requirements
          </h3>
          <div className="text-light-text dark:text-dark-text">
            {job.requirements
              ? renderBulletPoints(job.requirements)
              : 'No requirements listed'}
          </div>
        </div>

        <div className="rounded-lg bg-light-background p-4 transition-all duration-300 hover:shadow-md dark:bg-dark-background">
          <h3 className="mb-3 flex items-center text-lg font-semibold text-light-text dark:text-dark-text">
            <FaDollarSign className="mr-2 text-light-primary dark:text-dark-primary" />{' '}
            Benefits
          </h3>
          <div className="text-light-text dark:text-dark-text">
            {job.benefits
              ? renderBulletPoints(job.benefits)
              : 'No benefits listed'}
          </div>
        </div>
      </div>

      {user && (
        <button
          className="mt-6 w-full transform rounded-lg bg-light-primary py-3 font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-light-secondary hover:shadow-lg dark:bg-dark-primary dark:hover:bg-dark-secondary"
          onClick={() => {
            navigate(`/candidate/apply/${job.id}`);
            trackEvent(
              'Job Application',
              'User Action',
              `User applied for job: ${job.title}`
            );
          }}
        >
          Apply Now
        </button>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Browse Jobs - OptaHire | AI-Matched Career Opportunities</title>
        <meta
          name="description"
          content="Discover AI-matched job opportunities on OptaHire. Find the perfect career fit with intelligent job recommendations and easy applications."
        />
        <meta
          name="keywords"
          content="OptaHire Jobs, Job Search, AI Job Matching, Career Opportunities, Job Applications"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn flex-col items-center bg-light-background px-4 py-24 dark:bg-dark-background">
        <div className="mx-auto max-w-7xl animate-slideUp text-center">
          <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
            Discover{' '}
            <span className="text-light-primary dark:text-dark-primary">
              Opportunities
            </span>
          </h1>
          <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
            Explore job opportunities designed to advance your career and match
            your unique skills.
          </p>

          <div className="mx-auto mb-12 flex max-w-4xl flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 transform text-light-primary dark:text-dark-primary" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-light-border bg-light-surface py-4 pl-12 pr-4 text-light-text transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-light-primary dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:focus:ring-dark-primary"
              />
            </div>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 transform text-light-primary dark:text-dark-primary" />
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-light-border bg-light-surface py-4 pl-12 pr-4 text-light-text transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-light-primary dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:focus:ring-dark-primary"
              />
            </div>
          </div>
        </div>

        {error && <Alert message={error?.data?.message} />}

        {isLoading ? (
          <div className="relative w-full max-w-sm animate-fadeIn sm:max-w-md">
            <Loader />
          </div>
        ) : filteredJobs.length > 0 ? (
          isMobile ? (
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
              {filteredJobs.map((job, index) =>
                renderDetailedJobCard(job, index)
              )}
            </div>
          ) : (
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
              <div className="hidden animate-slideInLeft space-y-4 md:block md:border-r md:border-light-border md:pr-8 dark:md:border-dark-border">
                <h2 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                  <FaBriefcase className="mr-2 text-light-primary dark:text-dark-primary" />
                  Available Positions ({filteredJobs.length})
                </h2>
                {filteredJobs.map((job, index) => (
                  <div
                    key={job.id}
                    onClick={() => handleJobClick(job)}
                    className={`animate-slideUp cursor-pointer rounded-lg p-4 transition-all duration-300 hover:shadow-lg ${
                      selectedJob?.id === job.id
                        ? 'border-l-4 border-light-primary bg-light-primary bg-opacity-10 shadow-md dark:border-dark-primary'
                        : 'bg-light-surface hover:bg-light-primary hover:bg-opacity-5 dark:bg-dark-surface dark:hover:bg-dark-primary dark:hover:bg-opacity-5'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <h3 className="font-semibold text-light-text dark:text-dark-text">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm text-light-text opacity-70 dark:text-dark-text">
                      {job.company}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-light-text opacity-60 dark:text-dark-text">
                      <FaMapMarkerAlt className="text-light-primary dark:text-dark-primary" />{' '}
                      {job.location}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-light-primary bg-opacity-10 px-2.5 py-0.5 text-xs font-medium text-light-primary dark:text-dark-primary">
                        {job.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="animate-slideIn md:col-span-2">
                {selectedJob ? (
                  <div className="rounded-lg border border-light-border bg-light-surface p-6 shadow-lg transition-all duration-500 hover:shadow-xl dark:border-dark-border dark:bg-dark-surface">
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                          {selectedJob.title}
                        </h2>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="font-medium text-light-secondary dark:text-dark-secondary">
                            {selectedJob.company}
                          </span>
                          <span className="text-light-text opacity-60 dark:text-dark-text">
                            •
                          </span>
                          <span className="flex items-center gap-1 text-sm text-light-text opacity-60 dark:text-dark-text">
                            <FaMapMarkerAlt /> {selectedJob.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center rounded-full bg-light-primary bg-opacity-10 px-3 py-1 text-xs font-medium text-light-primary dark:text-dark-primary">
                          <FaDollarSign className="mr-1" />{' '}
                          {selectedJob.salaryRange}
                        </span>
                        <span className="flex items-center rounded-full bg-light-secondary bg-opacity-10 px-3 py-1 text-xs font-medium text-light-secondary dark:text-dark-secondary">
                          <FaClock className="mr-1" /> {selectedJob.category}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-lg bg-light-background p-4 transition-all duration-300 hover:shadow-md dark:bg-dark-background">
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-light-text dark:text-dark-text">
                          <FaBriefcase className="text-light-primary dark:text-dark-primary" />
                          Description
                        </h3>
                        <p className="text-light-text dark:text-dark-text">
                          {selectedJob.description}
                        </p>
                      </div>

                      <div className="rounded-lg bg-light-background p-4 transition-all duration-300 hover:shadow-md dark:bg-dark-background">
                        <h3 className="mb-3 flex items-center text-lg font-semibold text-light-text dark:text-dark-text">
                          <FaMapMarkerAlt className="mr-2 text-light-primary dark:text-dark-primary" />
                          Requirements
                        </h3>
                        <div className="text-light-text dark:text-dark-text">
                          {selectedJob.requirements
                            ? renderBulletPoints(selectedJob.requirements)
                            : 'No requirements listed'}
                        </div>
                      </div>

                      <div className="rounded-lg bg-light-background p-4 transition-all duration-300 hover:shadow-md dark:bg-dark-background">
                        <h3 className="mb-3 flex items-center text-lg font-semibold text-light-text dark:text-dark-text">
                          <FaDollarSign className="mr-2 text-light-primary dark:text-dark-primary" />
                          Benefits
                        </h3>
                        <div className="text-light-text dark:text-dark-text">
                          {selectedJob.benefits
                            ? renderBulletPoints(selectedJob.benefits)
                            : 'No benefits listed'}
                        </div>
                      </div>
                    </div>

                    {user && (
                      <button
                        className="mt-6 w-full transform rounded-lg bg-light-primary py-3 font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-light-secondary hover:shadow-lg dark:bg-dark-primary dark:hover:bg-dark-secondary"
                        onClick={() =>
                          navigate(`/candidate/apply/${selectedJob.id}`)
                        }
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex h-64 animate-pulse items-center justify-center rounded-lg border border-light-border bg-light-surface text-light-text opacity-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                    <p className="text-lg">Select a job to view details</p>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="mx-auto w-full max-w-lg animate-slideUp rounded-lg border border-light-border bg-light-surface p-8 text-center shadow-md dark:border-dark-border dark:bg-dark-surface">
            <p className="text-xl font-semibold text-light-primary dark:text-dark-primary">
              No jobs found
            </p>
            <p className="mt-2 text-light-text opacity-70 dark:text-dark-text">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </section>
    </>
  );
}
