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
  '#0EB0E3',
  '#3946AE',
  '#FF8042',
  '#00C49F',
  '#FFBB28',
  '#FF6B6B',
  '#8884d8',
];

export default function DashboardScreen() {
  const [applicationsByStatus, setApplicationsByStatus] = useState([]);
  const [interviewsByMonth, setInterviewsByMonth] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);
  const [interviewerRatings, setInterviewerRatings] = useState([]);
  const [applicationTrend, setApplicationTrend] = useState([]);
  const [contractStatus, setContractStatus] = useState([]);
  const [contractsByMonth, setContractsByMonth] = useState([]);
  const [selectedSection, setSelectedSection] = useState('overview');

  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: jobs,
    isLoading: loadingJobs,
    error: errorJobs,
  } = useGetAllJobsQuery({
    recruiterId: userInfo.id,
  });

  const {
    data: applications,
    isLoading: loadingApplications,
    error: errorApplications,
  } = useGetAllApplicationsQuery({
    recruiterId: userInfo.id,
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
    recruiterId: userInfo.id,
  });

  const {
    data: contracts,
    isLoading: loadingContracts,
    error: errorContracts,
  } = useGetAllContractsQuery({
    recruiterId: userInfo.id,
  });

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // First, let's update the useEffects to properly handle API responses based on controller structure

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
        if (!statusCounts[app.status]) statusCounts[app.status] = 0;
        statusCounts[app.status]++;

        // Monthly trends data
        const date = new Date(app.applicationDate);
        const month = date.toLocaleString('default', { month: 'short' });
        if (!monthlyApplications[month]) monthlyApplications[month] = 0;
        monthlyApplications[month]++;
      });

      const statusData = Object.keys(statusCounts).map((status) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize status
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
        if (!categories[job.category]) categories[job.category] = 0;
        categories[job.category]++;
      });

      const chartData = Object.keys(categories).map((category) => ({
        name: category,
        jobs: categories[category],
      }));
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
        if (!statusCounts[contract.status]) statusCounts[contract.status] = 0;
        statusCounts[contract.status]++;

        // Monthly trends data
        const date = new Date(contract.startDate);
        const month = date.toLocaleString('default', { month: 'short' });
        if (!monthlyContracts[month]) monthlyContracts[month] = 0;
        monthlyContracts[month]++;
      });

      const statusData = Object.keys(statusCounts).map((status) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
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

  const renderSection = () => {
    switch (selectedSection) {
      case 'jobs':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                Jobs by Category
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={jobCategories}
                    margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="jobs" name="Number of Jobs" fill="#3946AE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                Jobs Status
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: 'Active',
                          value:
                            jobs?.jobs?.filter((j) => !j.isClosed).length || 0,
                        },
                        {
                          name: 'Closed',
                          value:
                            jobs?.jobs?.filter((j) => j.isClosed).length || 0,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name.charAt(0).toUpperCase() + name.slice(1)}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#00C49F" />
                      <Cell fill="#FF8042" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'applications':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                Applications by Status
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={applicationsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) =>
                        `${name.charAt(0).toUpperCase() + name.slice(1)}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {applicationsByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} applications`, 'Count']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                Application Trends
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={applicationTrend}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} applications`, 'Count']}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      name="Applications"
                      stroke="#0EB0E3"
                      fill="#0EB0E3"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'interviews':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                Interviews by Month
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={interviewsByMonth}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="interviews"
                      stroke="#3946AE"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      name="Interviews"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                Interview Status
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
                      labelLine={true}
                      label={({ name, percent }) =>
                        `${name.charAt(0).toUpperCase() + name.slice(1)}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#FFBB28" />
                      <Cell fill="#00C49F" />
                      <Cell fill="#FF8042" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'contracts':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                Contract Status
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contractStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {contractStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                Contracts by Month
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={contractsByMonth}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="contracts"
                      stroke="#FF8042"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      name="Contracts"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'ratings':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                Interviewer Ratings
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={interviewerRatings}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Number of Ratings"
                      fill="#FFBB28"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                Average Interviewer Rating
              </h3>
              <div className="h-80 flex flex-col items-center justify-center">
                <div className="text-6xl font-bold text-amber-500">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex mt-4 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < Math.round(averageRating)
                          ? 'text-amber-500 text-2xl'
                          : 'text-gray-300 text-2xl'
                      }
                    />
                  ))}
                </div>
                <p className="mt-2 text-light-text/70 dark:text-dark-text/70">
                  From {ratings?.interviewerRatings?.length || 0} ratings
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                Applications by Status
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={applicationsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) =>
                        `${name.charAt(0).toUpperCase() + name.slice(1)}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {applicationsByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                Jobs by Category
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={jobCategories}
                    margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="jobs" name="Number of Jobs" fill="#3946AE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>Recruiter Dashboard - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Recruiter Dashboard - Manage your recruitment process efficiently with our powerful tools and insights."
        />
        <meta
          name="keywords"
          content="OptaHire, Recruiter Dashboard, Recruitment, Management"
        />
      </Helmet>

      <section className="min-h-screen flex flex-col items-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        {overallLoading ? (
          <div className="w-full max-w-sm sm:max-w-md relative animate-fadeIn">
            <Loader />
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-light-text dark:text-dark-text mb-6">
              Welcome to the{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Recruiter Dashboard
              </span>
            </h1>
            <p className="text-lg text-light-text/70 dark:text-dark-text/70 text-center mb-8">
              Manage your recruitment process efficiently with our powerful
              tools and insights.
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-light-surface dark:bg-dark-surface p-5 rounded-xl shadow-md transition-all hover:shadow-lg animate-slideUp">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-light-text/70 dark:text-dark-text/70 text-sm font-medium">
                      Active Jobs
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {jobs?.jobs?.filter((j) => !j.isClosed).length || 0}
                    </h3>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                    <FaBriefcase className="text-green-500 dark:text-green-400 text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-red-500">
                      {jobs?.jobs?.filter((j) => j.isClosed).length || 0}
                    </span>{' '}
                    closed jobs
                  </p>
                </div>
              </div>

              <div
                className="bg-light-surface dark:bg-dark-surface p-5 rounded-xl shadow-md transition-all hover:shadow-lg animate-slideUp"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-light-text/70 dark:text-dark-text/70 text-sm font-medium">
                      Applications
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {applications?.applications?.length || 0}
                    </h3>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                    <FaEnvelopeOpenText className="text-yellow-500 dark:text-yellow-400 text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-green-500">
                      {applications?.applications?.filter(
                        (a) => a.status === 'accepted'
                      ).length || 0}
                    </span>{' '}
                    accepted applications
                  </p>
                </div>
              </div>

              <div
                className="bg-light-surface dark:bg-dark-surface p-5 rounded-xl shadow-md transition-all hover:shadow-lg animate-slideUp"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-light-text/70 dark:text-dark-text/70 text-sm font-medium">
                      Interviews
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {interviews?.interviews?.length || 0}
                    </h3>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                    <FaCalendarAlt className="text-purple-500 dark:text-purple-400 text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
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
                className="bg-light-surface dark:bg-dark-surface p-5 rounded-xl shadow-md transition-all hover:shadow-lg animate-slideUp"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-light-text/70 dark:text-dark-text/70 text-sm font-medium">
                      Contracts
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {contracts?.contracts?.length || 0}
                    </h3>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                    <FaFileContract className="text-red-500 dark:text-red-400 text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
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
                className="bg-light-surface dark:bg-dark-surface p-5 rounded-xl shadow-md transition-all hover:shadow-lg animate-slideUp"
                style={{ animationDelay: '0.4s' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-light-text/70 dark:text-dark-text/70 text-sm font-medium">
                      Avg. Rating
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {averageRating.toFixed(1)}/5.0
                    </h3>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg">
                    <FaStar className="text-amber-500 dark:text-amber-400 text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < Math.round(averageRating)
                            ? 'text-amber-500 text-xs'
                            : 'text-gray-300 text-xs'
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedSection('overview')}
                  className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap ${
                    selectedSection === 'overview'
                      ? 'bg-light-primary text-white dark:bg-dark-primary'
                      : 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text'
                  }`}
                >
                  <FaChartLine className="inline mr-2" /> Overview
                </button>
                <button
                  onClick={() => setSelectedSection('jobs')}
                  className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap ${
                    selectedSection === 'jobs'
                      ? 'bg-light-primary text-white dark:bg-dark-primary'
                      : 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text'
                  }`}
                >
                  <FaBriefcase className="inline mr-2" /> Jobs
                </button>
                <button
                  onClick={() => setSelectedSection('applications')}
                  className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap ${
                    selectedSection === 'applications'
                      ? 'bg-light-primary text-white dark:bg-dark-primary'
                      : 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text'
                  }`}
                >
                  <FaEnvelopeOpenText className="inline mr-2" /> Applications
                </button>
                <button
                  onClick={() => setSelectedSection('interviews')}
                  className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap ${
                    selectedSection === 'interviews'
                      ? 'bg-light-primary text-white dark:bg-dark-primary'
                      : 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text'
                  }`}
                >
                  <FaCalendarAlt className="inline mr-2" /> Interviews
                </button>
                <button
                  onClick={() => setSelectedSection('contracts')}
                  className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap ${
                    selectedSection === 'contracts'
                      ? 'bg-light-primary text-white dark:bg-dark-primary'
                      : 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text'
                  }`}
                >
                  <FaHandshake className="inline mr-2" /> Contracts
                </button>
                <button
                  onClick={() => setSelectedSection('ratings')}
                  className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap ${
                    selectedSection === 'ratings'
                      ? 'bg-light-primary text-white dark:bg-dark-primary'
                      : 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text'
                  }`}
                >
                  <FaStar className="inline mr-2" /> Ratings
                </button>
              </div>
            </div>

            {renderSection()}
          </div>
        )}
      </section>
    </>
  );
}
