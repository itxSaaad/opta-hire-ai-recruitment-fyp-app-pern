import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
  FaCalendarAlt,
  FaChartLine,
  FaDollarSign,
  FaEnvelopeOpenText,
  FaFileContract,
  FaHandshake,
  FaStar,
  FaUsers,
} from 'react-icons/fa';
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
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';

import { trackPageView } from '../../utils/analytics';

import { useGetAllApplicationsQuery } from '../../features/application/applicationApi';
import { useGetAllContractsQuery } from '../../features/contract/contractApi';
import { useGetAllInterviewsQuery } from '../../features/interview/interviewApi';
import { useGetAllRatingsQuery } from '../../features/interviewerRating/interviewerRatingApi';
import { useGetAllJobsQuery } from '../../features/job/jobApi';
import { useGetAllTransactionsQuery } from '../../features/transaction/transactionApi';
import { useGetAllUsersQuery } from '../../features/user/userApi';

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
  const [userTypes, setUserTypes] = useState([]);
  const [interviewsByMonth, setInterviewsByMonth] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);
  const [contractStatus, setContractStatus] = useState([]);
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [interviewerRatings, setInterviewerRatings] = useState([]);
  const [applicationTrend, setApplicationTrend] = useState([]);
  const [selectedSection, setSelectedSection] = useState('overview');

  const location = useLocation();

  const {
    data: users,
    isLoading: loadingUsers,
    error: errorUsers,
  } = useGetAllUsersQuery({});

  const {
    data: jobs,
    isLoading: loadingJobs,
    error: errorJobs,
  } = useGetAllJobsQuery({});

  const {
    data: applications,
    isLoading: loadingApplications,
    error: errorApplications,
  } = useGetAllApplicationsQuery({});

  const {
    data: interviews,
    isLoading: loadingInterviews,
    error: errorInterviews,
  } = useGetAllInterviewsQuery({});

  const {
    data: contracts,
    isLoading: loadingContracts,
    error: errorContracts,
  } = useGetAllContractsQuery({});

  const {
    data: transactions,
    isLoading: loadingTransactions,
    error: errorTransactions,
  } = useGetAllTransactionsQuery({});

  const {
    data: ratings,
    isLoading: loadingRatings,
    error: errorRatings,
  } = useGetAllRatingsQuery({});

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (applications?.applications) {
      const statusCounts = {};
      const monthlyApplications = {};

      applications.applications.forEach((app) => {
        if (!statusCounts[app.status]) statusCounts[app.status] = 0;
        statusCounts[app.status]++;

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

      const trendData = Object.keys(monthlyApplications).map((month) => ({
        month,
        applications: monthlyApplications[month],
      }));
      setApplicationTrend(trendData);
    }

    if (users?.users) {
      const userTypeCounts = {
        admins: 0,
        recruiters: 0,
        interviewers: 0,
        candidates: 0,
      };

      users.users.forEach((user) => {
        if (user.isAdmin) userTypeCounts.admins++;
        if (user.isRecruiter) userTypeCounts.recruiters++;
        if (user.isInterviewer) userTypeCounts.interviewers++;
        if (user.isCandidate) userTypeCounts.candidates++;
      });

      const userData = [
        { name: 'Admins', value: userTypeCounts.admins },
        { name: 'Recruiters', value: userTypeCounts.recruiters },
        { name: 'Interviewers', value: userTypeCounts.interviewers },
        { name: 'Candidates', value: userTypeCounts.candidates },
      ];
      setUserTypes(userData);
    }

    if (interviews?.interviews) {
      const months = {};
      interviews.interviews.forEach((interview) => {
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

    if (contracts?.contracts) {
      const statusCounts = {};
      contracts.contracts.forEach((contract) => {
        if (!statusCounts[contract.status]) statusCounts[contract.status] = 0;
        statusCounts[contract.status]++;
      });

      const chartData = Object.keys(statusCounts).map((status) => ({
        name: status,
        value: statusCounts[status],
      }));
      setContractStatus(chartData);
    }

    if (transactions?.transactions) {
      const monthlyRevenue = {};
      transactions.transactions.forEach((transaction) => {
        if (transaction.status === 'completed') {
          const date = new Date(transaction.transactionDate);
          const month = date.toLocaleString('default', { month: 'short' });
          if (!monthlyRevenue[month]) monthlyRevenue[month] = 0;
          monthlyRevenue[month] += Number(transaction.amount);
        }
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
        revenue: monthlyRevenue[month] || 0,
      }));

      setRevenueByMonth(chartData);
    }

    if (ratings?.interviewerRatings) {
      const ratingGroups = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      ratings.interviewerRatings.forEach((rating) => {
        const ratingValue = Math.floor(Number(rating.rating));
        ratingGroups[ratingValue] = (ratingGroups[ratingValue] || 0) + 1;
      });

      const chartData = Object.keys(ratingGroups)
        .map((rating) => ({
          name: `${rating} Stars`,
          value: ratingGroups[rating],
        }))
        .reverse();

      setInterviewerRatings(chartData);
    }
  }, [applications, users, interviews, jobs, contracts, transactions, ratings]);

  const overallLoading =
    loadingUsers ||
    loadingJobs ||
    loadingApplications ||
    loadingInterviews ||
    loadingContracts ||
    loadingTransactions ||
    loadingRatings;

  const totalRevenue =
    transactions?.transactions?.reduce((total, transaction) => {
      if (transaction.status === 'completed') {
        return total + Number(transaction.amount);
      }
      return total;
    }, 0) || 0;

  const averageRating =
    ratings?.interviewerRatings?.reduce(
      (total, rating) => total + Number(rating.rating),
      0
    ) / (ratings?.interviewerRatings?.length || 1);

  const renderSection = () => {
    switch (selectedSection) {
      case 'users':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                User Types Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userTypes}
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
                      {userTypes.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} users`, 'Count']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                User Verification Status
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'Verified',
                        value:
                          users?.users?.filter((u) => u.isVerified).length || 0,
                      },
                      // {
                      //   name: 'LinkedIn Verified',
                      //   value:
                      //     users?.users?.filter((u) => u.isLinkedinVerified)
                      //       .length || 0,
                      // },
                      {
                        name: 'Unverified',
                        value:
                          users?.users?.filter((u) => !u.isVerified).length ||
                          0,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Users" fill="#0EB0E3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

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
                        `${name.charAt(0).toUpperCase() + name.slice(1)}: ${(percent * 100).toFixed(0)}%`
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
                Monthly Revenue
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueByMonth}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
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
                <div className="w-48 h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="100%"
                      data={[
                        { name: 'Rating', value: (averageRating / 5) * 100 },
                      ]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background
                        clockWise
                        dataKey="value"
                        cornerRadius={10}
                        fill="#FFBB28"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-light-text dark:text-dark-text">
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="text-light-text/70 dark:text-dark-text/70">
                        out of 5
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex mt-4 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < Math.round(averageRating)
                          ? 'text-amber-500'
                          : 'text-gray-300'
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
                Monthly Revenue
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueByMonth}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
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
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Admin Dashboard - Manage your recruitment process efficiently with our powerful tools and insights."
        />
        <meta
          name="keywords"
          content="OptaHire, Admin Dashboard, Recruitment, Management"
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
                Admin Dashboard
              </span>
            </h1>
            <p className="text-lg text-light-text/70 dark:text-dark-text/70 text-center mb-8">
              Overview and analytics of OptaHire
            </p>

            {(errorUsers ||
              errorJobs ||
              errorApplications ||
              errorInterviews ||
              errorContracts ||
              errorTransactions ||
              errorRatings) && (
              <Alert
                message={
                  errorUsers?.data?.message ||
                  errorJobs?.data?.message ||
                  errorApplications?.data?.message ||
                  errorInterviews?.data?.message ||
                  errorContracts?.data?.message ||
                  errorTransactions?.data?.message ||
                  errorRatings?.data?.message
                }
              />
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-light-surface dark:bg-dark-surface p-5 rounded-xl shadow-md transition-all hover:shadow-lg animate-slideUp">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-light-text/70 dark:text-dark-text/70 text-sm font-medium">
                      Total Users
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {users?.users?.length || 0}
                    </h3>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <FaUsers className="text-light-primary dark:text-dark-primary text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-green-500">
                      +{users?.users?.filter((u) => u.isVerified).length || 0}
                    </span>{' '}
                    verified users
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
                style={{ animationDelay: '0.2s' }}
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
                style={{ animationDelay: '0.3s' }}
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
                style={{ animationDelay: '0.4s' }}
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
                style={{ animationDelay: '0.5s' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-light-text/70 dark:text-dark-text/70 text-sm font-medium">
                      Total Revenue
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      ${totalRevenue.toLocaleString()}
                    </h3>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                    <FaDollarSign className="text-green-500 dark:text-green-400 text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-green-500">
                      {transactions?.transactions?.filter(
                        (t) => t.status === 'completed'
                      ).length || 0}
                    </span>{' '}
                    completed transactions
                  </p>
                </div>
              </div>

              <div
                className="bg-light-surface dark:bg-dark-surface p-5 rounded-xl shadow-md transition-all hover:shadow-lg animate-slideUp"
                style={{ animationDelay: '0.6s' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-light-text/70 dark:text-dark-text/70 text-sm font-medium">
                      Avg. Interviewer Rating
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
                  onClick={() => setSelectedSection('users')}
                  className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap ${
                    selectedSection === 'users'
                      ? 'bg-light-primary text-white dark:bg-dark-primary'
                      : 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text'
                  }`}
                >
                  <FaUsers className="inline mr-2" /> Users
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
