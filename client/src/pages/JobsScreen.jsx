import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiMapPin, FiSearch } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const dummyJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    description:
      'Join our dynamic team to build modern web applications using React, TailwindCSS, and more.',
    requirements:
      '5+ years experience in React; expertise in responsive design',
    salaryRange: '$90k - $120k',
    category: 'Engineering',
    company: 'DevHire',
    location: 'Remote',
  },
  {
    id: '2',
    title: 'Digital Marketing Specialist',
    description:
      'Drive our marketing efforts, strategize digital campaigns and improve brand presence.',
    requirements:
      'Proven experience in digital marketing and social media management',
    salaryRange: '$50k - $70k',
    category: 'Marketing',
    company: 'MarketPro',
    location: 'New York, NY',
  },
  {
    id: '3',
    title: 'Data Analyst',
    description:
      'Analyze complex data sets to derive actionable insights and support business decisions.',
    requirements: 'Expertise in SQL, Python, and data visualization tools',
    salaryRange: '$60k - $80k',
    category: 'Analytics',
    company: 'DataCo',
    location: 'San Francisco, CA',
  },
];

export default function JobsScreen() {
  const [jobs] = useState(dummyJobs);
  const [filteredJobs, setFilteredJobs] = useState(dummyJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.userInfo);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchTerm, jobs]);

  useEffect(() => {
    if (filteredJobs.length > 0) {
      setSelectedJob(filteredJobs[0]);
    } else {
      setSelectedJob(null);
    }
  }, [filteredJobs]);

  const handleJobClick = (job) => {
    if (!user) {
      navigate('/auth/login');
    } else {
      setSelectedJob(job);
    }
  };

  const handleViewMore = () => {
    if (user) {
      navigate('/candidate/dashboard');
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <>
      <Helmet>
        <title>Jobs - OptaHire</title>
        <meta
          name="description"
          content="Find your next career opportunity with OptaHire"
        />
      </Helmet>
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4 sm:px-10">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-light-primary/20 to-light-background dark:from-dark-primary/20 dark:to-dark-background" />
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-6">
            Discover Your Next{' '}
            <span className="text-light-secondary dark:text-dark-secondary">
              Career Opportunity
            </span>
          </h1>
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light-text/50 dark:text-dark-text/50" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none transition-all duration-300"
              />
            </div>
            <div className="relative">
              <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light-text/50 dark:text-dark-text/50" />
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-5xl mx-auto">
            {/* Sidebar: Job Listings */}
            <div className="space-y-4 pr-0 md:pr-8 md:border-r md:border-light-border dark:md:border-dark-border">
              {filteredJobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  onClick={() => handleJobClick(job)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedJob?.id === job.id
                      ? 'bg-light-primary/10 dark:bg-dark-primary/10 border-l-4 border-light-primary dark:border-dark-primary'
                      : 'bg-light-surface dark:bg-dark-surface hover:bg-light-primary/5 dark:hover:bg-dark-primary/5'
                  }`}
                >
                  <h3 className="font-semibold text-light-text dark:text-dark-text">
                    {job.title}
                  </h3>
                  <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                    {job.company}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-light-text/60 dark:text-dark-text/60">
                    <FiMapPin /> {job.location}
                  </div>
                </div>
              ))}
            </div>

            {/* Job Details */}
            <div className="md:col-span-2">
              {selectedJob ? (
                <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text mb-4">
                    {selectedJob.title}
                  </h2>
                  <div className="space-y-4">
                    <p className="text-light-text dark:text-dark-text">
                      {selectedJob.description}
                    </p>
                    <div className="border-t border-light-border dark:border-dark-border pt-4" />
                    <h3 className="font-semibold mb-2 text-light-text dark:text-dark-text">
                      Requirements
                    </h3>
                    <p className="text-light-text dark:text-dark-text">
                      {selectedJob.requirements}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm mt-4">
                      <span className="px-3 py-1 rounded-full bg-light-primary/10 dark:bg-dark-primary/10">
                        {selectedJob.salaryRange}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-light-primary/10 dark:bg-dark-primary/10">
                        {selectedJob.category}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-light-primary/10 dark:bg-dark-primary/10">
                        {selectedJob.location}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-light-text/50 dark:text-dark-text/50">
                  Select a job to view details
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-light-text/70 dark:text-dark-text/70">
            <p className="text-lg font-semibold">No jobs found</p>
            <p className="mt-2">Try adjusting your search criteria</p>
          </div>
        )}

        <div className="w-full flex justify-center">
          <button
            onClick={handleViewMore}
            className="my-8 w-full sm:w-1/2 md:w-1/4 text-lg bg-light-primary dark:bg-dark-primary text-light-background dark:text-dark-background px-12 py-4 rounded-lg shadow-lg transform transition-transform hover:scale-110 hover:shadow-2xl duration-300 ease-in-out"
          >
            View More
          </button>
        </div>
      </section>
    </>
  );
}
