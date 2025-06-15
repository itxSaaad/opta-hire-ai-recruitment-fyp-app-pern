import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
  FaCalendarAlt,
  FaChartLine,
  FaEnvelopeOpenText,
  FaFileContract,
  FaHandshake,
  FaStar,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';

import { trackPageView } from '../../utils/analytics';

import { useGetAllApplicationsQuery } from '../../features/application/applicationApi';
import { useGetAllInterviewsQuery } from '../../features/interview/interviewApi';
import { useGetAllRatingsQuery } from '../../features/interviewerRating/interviewerRatingApi';
import { useGetAllJobsQuery } from '../../features/job/jobApi';
import { useGetAllContractsQuery } from '../../features/contract/contractApi';

const COLORS = [
  '#0EB0E3', // light-primary/dark-primary
  '#3946AE', // light-secondary/dark-secondary
  '#FF8042', // orange accent
  '#00C49F', // teal accent
  '#FFBB28', // amber accent
  '#FF6B6B', // coral accent
  '#8884d8', // purple accent
];

// Custom tooltip component for consistency
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-light-border bg-light-surface p-3 shadow-lg dark:border-dark-border dark:bg-dark-surface">
        {label && (
          <p className="font-medium text-light-text dark:text-dark-text">
            {label}
          </p>
        )}
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{ color: entry.color }}
            className="text-sm text-light-text dark:text-dark-text"
          >
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
};

export default function DashboardScreen() {
  const [applicationsByStatus, setApplicationsByStatus] = useState([]);
  const [interviewsByMonth, setInterviewsByMonth] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);
  const [interviewerRatings, setInterviewerRatings] = useState([]);
  const [applicationTrend, setApplicationTrend] = useState([]);
  const [contractStatus, setContractStatus] = useState([]);
  const [contractsByMonth, setContractsByMonth] = useState([]);

  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const recruiterId = userInfo?.id;

  const {
    data: jobs,
    isLoading: loadingJobs,
    error: errorJobs,
  } = useGetAllJobsQuery({
    recruiterId,
  });

  const {
    data: applications,
    isLoading: loadingApplications,
    error: errorApplications,
  } = useGetAllApplicationsQuery({
    recruiterId,
  });

  const {
    data: interviews,
    isLoading: loadingInterviews,
    error: errorInterviews,
  } = useGetAllInterviewsQuery({
    role: 'recruiter',
  });

  const {
    data: ratings,
    isLoading: loadingRatings,
    error: errorRatings,
  } = useGetAllRatingsQuery({
    recruiterId,
  });

  const {
    data: contracts,
    isLoading: loadingContracts,
    error: errorContracts,
  } = useGetAllContractsQuery({
    recruiterId,
  });

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (applications?.applications && jobs?.jobs) {
      // Filter applications for jobs posted by this recruiter
      const recruiterJobIds = jobs.jobs.map((job) => job._id || job.id);
      const recruiterApplications = applications.applications.filter((app) =>
        recruiterJobIds.includes(app.jobId)
      );

      // Process application status data
      const statusCounts = {};
      const monthlyApplications = {};

      recruiterApplications.forEach((app) => {
        // Status chart data
        const formattedStatus =
          app.status.charAt(0).toUpperCase() + app.status.slice(1);
        if (!statusCounts[formattedStatus]) statusCounts[formattedStatus] = 0;
        statusCounts[formattedStatus]++;

        // Monthly trends data
        const date = new Date(app.applicationDate);
        const month = date.toLocaleString('default', { month: 'short' });
        if (!monthlyApplications[month]) monthlyApplications[month] = 0;
        monthlyApplications[month]++;
      });

      const statusData = Object.keys(statusCounts).map((status) => ({
        name: status,
        value: statusCounts[status],
      }));
      setApplicationsByStatus(statusData);

      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const trendData = monthNames.map((month) => ({
        month,
        applications: monthlyApplications[month] || 0,
      }));
      setApplicationTrend(trendData);
    }
  }, [applications, jobs]);

  useEffect(() => {
    if (interviews?.interviews && jobs?.jobs) {
      // Filter interviews for jobs posted by this recruiter
      const recruiterJobIds = jobs.jobs.map((job) => job._id || job.id);
      const recruiterInterviews = interviews.interviews.filter((interview) =>
        recruiterJobIds.includes(interview.jobId)
      );

      const months = {};
      recruiterInterviews.forEach((interview) => {
        const date = new Date(interview.scheduledTime);
        const month = date.toLocaleString('default', { month: 'short' });
        if (!months[month]) months[month] = 0;
        months[month]++;
      });

      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const chartData = monthNames.map((month) => ({
        month,
        interviews: months[month] || 0,
      }));

      setInterviewsByMonth(chartData);
    }
  }, [interviews, jobs]);

  useEffect(() => {
    if (jobs?.jobs) {
      const categories = {};
      jobs.jobs.forEach((job) => {
        const formattedCategory =
          job.category.charAt(0).toUpperCase() + job.category.slice(1);
        if (!categories[formattedCategory]) categories[formattedCategory] = 0;
        categories[formattedCategory]++;
      });

      const chartData = Object.keys(categories)
        .map((category) => ({
          name: category,
          jobs: categories[category],
        }))
        .sort((a, b) => b.jobs - a.jobs); // Sort by count descending
      setJobCategories(chartData);
    }
  }, [jobs]);

  useEffect(() => {
    if (ratings?.interviewerRatings && jobs?.jobs) {
      // Filter ratings related to interviews for this recruiter's jobs
      const recruiterJobIds = jobs.jobs.map((job) => job._id || job.id);
      const relevantRatings = ratings.interviewerRatings.filter((rating) =>
        recruiterJobIds.includes(rating.jobId)
      );

      const ratingGroups = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      relevantRatings.forEach((rating) => {
        const ratingValue = Math.floor(Number(rating.rating));
        if (ratingValue >= 1 && ratingValue <= 5) {
          ratingGroups[ratingValue] = (ratingGroups[ratingValue] || 0) + 1;
        }
      });

      const chartData = Object.keys(ratingGroups)
        .map((rating) => ({
          name: `${rating} ${rating === '1' ? 'Star' : 'Stars'}`,
          value: ratingGroups[rating],
        }))
        .reverse();

      setInterviewerRatings(chartData);
    }
  }, [ratings, jobs]);

  useEffect(() => {
    if (contracts?.contracts && jobs?.jobs) {
      // Filter contracts related to this recruiter's jobs
      const recruiterJobIds = jobs.jobs.map((job) => job._id || job.id);
      const recruiterContracts = contracts.contracts.filter((contract) =>
        recruiterJobIds.includes(contract.jobId)
      );

      // Process contract status
      const statusCounts = {};
      const monthlyContracts = {};

      recruiterContracts.forEach((contract) => {
        // Status chart data
        const formattedStatus =
          contract.status.charAt(0).toUpperCase() + contract.status.slice(1);
        if (!statusCounts[formattedStatus]) statusCounts[formattedStatus] = 0;
        statusCounts[formattedStatus]++;

        // Monthly trends data
        const date = new Date(contract.startDate);
        const month = date.toLocaleString('default', { month: 'short' });
        if (!monthlyContracts[month]) monthlyContracts[month] = 0;
        monthlyContracts[month]++;
      });

      const statusData = Object.keys(statusCounts).map((status) => ({
        name: status,
        value: statusCounts[status],
      }));
      setContractStatus(statusData);

      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const contractsData = monthNames.map((month) => ({
        month,
        contracts: monthlyContracts[month] || 0,
      }));
      setContractsByMonth(contractsData);
    }
  }, [contracts, jobs]);

  const overallLoading =
    loadingJobs ||
    loadingApplications ||
    loadingInterviews ||
    loadingRatings ||
    loadingContracts;

  const averageRating =
    ratings?.interviewerRatings?.reduce(
      (total, rating) => total + Number(rating.rating),
      0
    ) / (ratings?.interviewerRatings?.length || 1);

  const acceptedApplicationsCount =
    applications?.applications?.filter((app) => app.status === 'accepted')
      .length || 0;

  return (
    <>
      <Helmet>
        <title>
          Recruiter Dashboard - OptaHire | AI-Powered Recruitment Hub
        </title>
        <meta
          name="description"
          content="OptaHire Recruiter Dashboard - Manage your hiring pipeline with AI-powered candidate matching and professional interview services."
        />
        <meta
          name="keywords"
          content="OptaHire Recruiter Dashboard, AI Recruitment, Hiring Pipeline, Candidate Matching, Professional Interviews"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn flex-col items-center bg-light-background px-4 py-24 dark:bg-dark-background">
        {overallLoading ? (
          <div className="relative w-full max-w-sm animate-fadeIn sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-7xl">
            <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
              Recruitment{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Dashboard
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Optimize your hiring process with AI-powered candidate matching
              and access to professional interviewers.
            </p>

            {(errorJobs ||
              errorApplications ||
              errorInterviews ||
              errorRatings ||
              errorContracts) && (
              <Alert
                message={
                  errorJobs?.data?.message ||
                  errorApplications?.data?.message ||
                  errorInterviews?.data?.message ||
                  errorRatings?.data?.message ||
                  errorContracts?.data?.message
                }
              />
            )}

            {/* Key Metrics Cards */}
            <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              <div className="animate-slideUp rounded-xl bg-light-surface p-5 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                      Active Jobs
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {jobs?.jobs?.filter((j) => !j.isClosed).length || 0}
                    </h3>
                  </div>
                  <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                    <FaBriefcase className="text-xl text-green-500 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-4 border-t border-light-border pt-4 dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-red-500">
                      {jobs?.jobs?.filter((j) => j.isClosed).length || 0}
                    </span>{' '}
                    closed jobs
                  </p>
                </div>
              </div>

              <div
                className="animate-slideUp rounded-xl bg-light-surface p-5 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                      Applications
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {applications?.applications?.length || 0}
                    </h3>
                  </div>
                  <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/30">
                    <FaEnvelopeOpenText className="text-xl text-yellow-500 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="mt-4 border-t border-light-border pt-4 dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-green-500">
                      {acceptedApplicationsCount}
                    </span>{' '}
                    accepted applications
                  </p>
                </div>
              </div>

              <div
                className="animate-slideUp rounded-xl bg-light-surface p-5 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                      Interviews
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {interviews?.interviews?.length || 0}
                    </h3>
                  </div>
                  <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                    <FaCalendarAlt className="text-xl text-purple-500 dark:text-purple-400" />
                  </div>
                </div>
                <div className="mt-4 border-t border-light-border pt-4 dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-blue-500">
                      {interviews?.interviews?.filter(
                        (i) => i.status === 'scheduled'
                      ).length || 0}
                    </span>{' '}
                    scheduled interviews
                  </p>
                </div>
              </div>

              <div
                className="animate-slideUp rounded-xl bg-light-surface p-5 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                      Contracts
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {contracts?.contracts?.length || 0}
                    </h3>
                  </div>
                  <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/30">
                    <FaFileContract className="text-xl text-red-500 dark:text-red-400" />
                  </div>
                </div>
                <div className="mt-4 border-t border-light-border pt-4 dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-green-500">
                      {contracts?.contracts?.filter(
                        (c) => c.status === 'active'
                      ).length || 0}
                    </span>{' '}
                    active contracts
                  </p>
                </div>
              </div>

              <div
                className="animate-slideUp rounded-xl bg-light-surface p-5 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface"
                style={{ animationDelay: '0.4s' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                      Avg. Rating
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {averageRating.toFixed(1)}/5.0
                    </h3>
                  </div>
                  <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30">
                    <FaStar className="text-xl text-amber-500 dark:text-amber-400" />
                  </div>
                </div>
                <div className="mt-4 border-t border-light-border pt-4 dark:border-dark-border">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < Math.round(averageRating)
                            ? 'text-xs text-amber-500'
                            : 'text-xs text-gray-300'
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Updated Charts Layout */}
            <div className="mb-8 grid grid-cols-1 gap-8">
              {/* First row - Full width application trend */}
              <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                  <FaChartLine className="mr-2 text-light-primary" />{' '}
                  Application Trends
                </h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={applicationTrend}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorApplications"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#0EB0E3"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#0EB0E3"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
                      <XAxis
                        dataKey="month"
                        stroke="#888"
                        tick={{ fill: '#888' }}
                        tickLine={{ stroke: '#888' }}
                      />
                      <YAxis
                        stroke="#888"
                        tick={{ fill: '#888' }}
                        tickLine={{ stroke: '#888' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="applications"
                        name="Applications"
                        stroke="#0EB0E3"
                        fill="url(#colorApplications)"
                        activeDot={{ r: 8 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Second row - Two columns */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Applications by Status */}
                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaEnvelopeOpenText className="mr-2 text-yellow-500" />{' '}
                    Applications by Status
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={applicationsByStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                          labelLine={true}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {applicationsByStatus.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Jobs by Category */}
                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaBriefcase className="mr-2 text-green-500" /> Top Job
                    Categories
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={jobCategories.slice(0, 5)} // Show top 5 for clarity
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
                        <XAxis type="number" stroke="#888" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={100}
                          stroke="#888"
                          tick={{ fill: '#888' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="jobs"
                          name="Number of Jobs"
                          fill="#3946AE"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Third row - Two columns */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Interviews by Month */}
                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaCalendarAlt className="mr-2 text-purple-500" /> Monthly
                    Interview Volume
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={interviewsByMonth}
                        margin={{ top: 5, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
                        <XAxis
                          dataKey="month"
                          stroke="#888"
                          tick={{ fill: '#888' }}
                          tickLine={{ stroke: '#888' }}
                        />
                        <YAxis
                          stroke="#888"
                          tick={{ fill: '#888' }}
                          tickLine={{ stroke: '#888' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="interviews"
                          name="Interviews"
                          fill="#8884d8"
                          radius={[4, 4, 0, 0]}
                        >
                          {interviewsByMonth.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`#8884d8${index % 2 ? 'cc' : 'ff'}`}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Interview Status */}
                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaCalendarAlt className="mr-2 text-purple-500" /> Interview
                    Status
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: 'Scheduled',
                              value:
                                interviews?.interviews?.filter(
                                  (i) => i.status === 'scheduled'
                                ).length || 0,
                            },
                            {
                              name: 'Completed',
                              value:
                                interviews?.interviews?.filter(
                                  (i) => i.status === 'completed'
                                ).length || 0,
                            },
                            {
                              name: 'Cancelled',
                              value:
                                interviews?.interviews?.filter(
                                  (i) => i.status === 'cancelled'
                                ).length || 0,
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          <Cell fill="#FFBB28" />
                          <Cell fill="#00C49F" />
                          <Cell fill="#FF8042" />
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Fourth row - Two columns */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Contract Status */}
                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaHandshake className="mr-2 text-blue-500" /> Contract
                    Status Distribution
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={contractStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {contractStatus.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Contracts by Month */}
                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaFileContract className="mr-2 text-red-500" /> Contracts
                    by Month
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={contractsByMonth}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
                        <XAxis
                          dataKey="month"
                          stroke="#888"
                          tick={{ fill: '#888' }}
                          tickLine={{ stroke: '#888' }}
                        />
                        <YAxis
                          stroke="#888"
                          tick={{ fill: '#888' }}
                          tickLine={{ stroke: '#888' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="contracts"
                          name="Contracts"
                          stroke="#FF8042"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Fifth row - Two columns */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Interviewer Rating Distribution */}
                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaStar className="mr-2 text-amber-500" /> Interviewer
                    Rating Distribution
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={interviewerRatings}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
                        <XAxis
                          type="number"
                          stroke="#888"
                          tick={{ fill: '#888' }}
                          tickLine={{ stroke: '#888' }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="#888"
                          tick={{ fill: '#888' }}
                          tickLine={{ stroke: '#888' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="value"
                          name="Number of Ratings"
                          fill="#FFBB28"
                          radius={[0, 4, 4, 0]}
                        >
                          {interviewerRatings.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`rgba(255, 187, 40, ${0.5 + index * 0.1})`}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Job Status */}
                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaBriefcase className="mr-2 text-green-500" /> Job Status
                    Distribution
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: 'Active Jobs',
                              value:
                                jobs?.jobs?.filter((j) => !j.isClosed).length ||
                                0,
                            },
                            {
                              name: 'Closed Jobs',
                              value:
                                jobs?.jobs?.filter((j) => j.isClosed).length ||
                                0,
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          <Cell fill="#00C49F" />
                          <Cell fill="#FF8042" />
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
