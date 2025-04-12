import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
  FaClock,
  FaDollarSign,
  FaMapMarkerAlt,
  FaSearch,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import ErrorMsg from '../../components/ErrorMsg';
import Loader from '../../components/Loader';

import { trackEvent, trackPageView } from '../../utils/analytics';

import { useGetAllJobsQuery } from '../../features/job/jobApi';
import { setSelectedJob } from '../../features/job/jobSlice';

export default function JobsScreen() {
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const routeLocation = useLocation();

  const user = useSelector((state) => state.auth.userInfo);
  const selectedJob = useSelector((state) => state.job.selectedJob);

  const { data: jobsData, isLoading, error } = useGetAllJobsQuery();

  const handleJobClick = (job) => {
    if (!user) {
      navigate('/auth/login');
    } else {
      dispatch(setSelectedJob(job));
    }
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
      dispatch(setSelectedJob(null));
    }
  }, [user, dispatch]);

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
      <ul className="list-disc pl-5 space-y-1 text-light-text dark:text-dark-text">
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
      className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-lg border border-light-border dark:border-dark-border transition-all duration-500 hover:shadow-xl"
    >
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
            {job.title}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-medium text-light-secondary dark:text-dark-secondary">
              {job.company}
            </span>
            <span className="text-light-text dark:text-dark-text opacity-60">
              •
            </span>
            <span className="text-sm flex items-center gap-1 text-light-text dark:text-dark-text opacity-60">
              <FaMapMarkerAlt /> {job.location}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="bg-light-primary bg-opacity-10 text-light-primary dark:text-dark-primary text-xs font-medium px-3 py-1 rounded-full flex items-center">
            <FaDollarSign className="mr-1" /> {job.salaryRange}
          </span>
          <span className="bg-light-secondary bg-opacity-10 text-light-secondary dark:text-dark-secondary text-xs font-medium px-3 py-1 rounded-full flex items-center">
            <FaClock className="mr-1" /> {job.category}
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
            {job.description}
          </p>
        </div>

        <div className="p-4 bg-light-background dark:bg-dark-background rounded-lg transition-all duration-300 hover:shadow-md">
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-3 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-light-primary dark:text-dark-primary" />{' '}
            Requirements
          </h3>
          <div className="text-light-text dark:text-dark-text">
            {job.requirements
              ? renderBulletPoints(job.requirements)
              : 'No requirements listed'}
          </div>
        </div>

        <div className="p-4 bg-light-background dark:bg-dark-background rounded-lg transition-all duration-300 hover:shadow-md">
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-3 flex items-center">
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
          className="mt-6 w-full py-3 bg-light-primary dark:bg-dark-primary text-white rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-all duration-300 font-medium hover:shadow-lg transform hover:-translate-y-1"
          onClick={() => {
            navigate(`/apply/${job.id}`);
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
        <title>Job Listings [Candidate] - OptaHire</title>
        <meta
          name="description"
          content="Explore job opportunities tailored for you. Search by title, location, and more to find your perfect fit."
        />
        <meta
          name="keywords"
          content="job listings, job search, career opportunities, find jobs, job openings, employment, job vacancies"
        />
      </Helmet>
      <section className="min-h-screen flex flex-col items-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        <div className="max-w-7xl mx-auto text-center animate-slideUp">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-6">
            Discover Your Next{' '}
            <span className="text-light-primary dark:text-dark-primary">
              Career Opportunity
            </span>
          </h1>
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto mb-12">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light-primary dark:text-dark-primary" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none transition-all duration-300 hover:shadow-md"
              />
            </div>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light-primary dark:text-dark-primary" />
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none transition-all duration-300 hover:shadow-md"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full max-w-sm sm:max-w-md relative animate-fadeIn">
            <Loader />
          </div>
        ) : error ? (
          <ErrorMsg errorMsg={error.data.message} />
        ) : filteredJobs.length > 0 ? (
          isMobile ? (
            <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
              {filteredJobs.map((job, index) =>
                renderDetailedJobCard(job, index)
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
              <div className="hidden md:block space-y-4 md:pr-8 md:border-r md:border-light-border dark:md:border-dark-border animate-slideInLeft">
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4 flex items-center">
                  <FaBriefcase className="mr-2 text-light-primary dark:text-dark-primary" />
                  Available Positions ({filteredJobs.length})
                </h2>
                {filteredJobs.map((job, index) => (
                  <div
                    key={job.id}
                    onClick={() => handleJobClick(job)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 animate-slideUp hover:shadow-lg ${
                      selectedJob?.id === job.id
                        ? 'bg-light-primary bg-opacity-10 border-l-4 border-light-primary dark:border-dark-primary shadow-md'
                        : 'bg-light-surface dark:bg-dark-surface hover:bg-light-primary hover:bg-opacity-5 dark:hover:bg-dark-primary dark:hover:bg-opacity-5'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <h3 className="font-semibold text-light-text dark:text-dark-text">
                      {job.title}
                    </h3>
                    <p className="text-sm text-light-text dark:text-dark-text opacity-70 mt-1">
                      {job.company}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-light-text dark:text-dark-text opacity-60">
                      <FaMapMarkerAlt className="text-light-primary dark:text-dark-primary" />{' '}
                      {job.location}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="bg-light-primary bg-opacity-10 text-light-primary dark:text-dark-primary text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {job.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="md:col-span-2 animate-slideIn">
                {selectedJob ? (
                  <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-lg border border-light-border dark:border-dark-border transition-all duration-500 hover:shadow-xl">
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
                          <FaDollarSign className="mr-1" />{' '}
                          {selectedJob.salaryRange}
                        </span>
                        <span className="bg-light-secondary bg-opacity-10 text-light-secondary dark:text-dark-secondary text-xs font-medium px-3 py-1 rounded-full flex items-center">
                          <FaClock className="mr-1" /> {selectedJob.category}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-4 bg-light-background dark:bg-dark-background rounded-lg transition-all duration-300 hover:shadow-md">
                        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text flex items-center gap-2 mb-3">
                          <FaBriefcase className="text-light-primary dark:text-dark-primary" />
                          Description
                        </h3>
                        <p className="text-light-text dark:text-dark-text">
                          {selectedJob.description}
                        </p>
                      </div>

                      <div className="p-4 bg-light-background dark:bg-dark-background rounded-lg transition-all duration-300 hover:shadow-md">
                        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-3 flex items-center">
                          <FaMapMarkerAlt className="mr-2 text-light-primary dark:text-dark-primary" />
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
                        className="mt-6 w-full py-3 bg-light-primary dark:bg-dark-primary text-white rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-all duration-300 font-medium hover:shadow-lg transform hover:-translate-y-1"
                        onClick={() => navigate(`/apply/${selectedJob.id}`)}
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-light-text dark:text-dark-text opacity-50 bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border dark:border-dark-border animate-pulse">
                    <p className="text-lg">Select a job to view details</p>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="p-8 text-center bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border dark:border-dark-border shadow-md w-full max-w-lg mx-auto animate-slideUp">
            <p className="text-xl font-semibold text-light-primary dark:text-dark-primary">
              No jobs found
            </p>
            <p className="mt-2 text-light-text dark:text-dark-text opacity-70">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </section>
    </>
  );
}
