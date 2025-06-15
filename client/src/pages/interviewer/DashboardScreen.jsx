import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEnvelopeOpenText,
  FaFileContract,
  FaStar,
  FaUserTie,
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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';

import { trackPageView } from '../../utils/analytics';

import { useSelector } from 'react-redux';
import { useGetAllApplicationsQuery } from '../../features/application/applicationApi';
import { useGetAllContractsQuery } from '../../features/contract/contractApi';
import { useGetAllInterviewsQuery } from '../../features/interview/interviewApi';
import { useGetAllRatingsQuery } from '../../features/interviewerRating/interviewerRatingApi';

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
  const [interviewsByStatus, setInterviewsByStatus] = useState([]);
  const [interviewsByMonth, setInterviewsByMonth] = useState([]);
  const [interviewerRatings, setInterviewerRatings] = useState([]);
  const [applicationsByStatus, setApplicationsByStatus] = useState([]);
  const [contractStatus, setContractStatus] = useState([]);

  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const interviewerId = userInfo?.id;

  const {
    data: applications,
    isLoading: loadingApplications,
    error: errorApplications,
  } = useGetAllApplicationsQuery({ interviewerId });

  const {
    data: interviews,
    isLoading: loadingInterviews,
    error: errorInterviews,
  } = useGetAllInterviewsQuery({ interviewerId });

  const {
    data: contracts,
    isLoading: loadingContracts,
    error: errorContracts,
  } = useGetAllContractsQuery({ interviewerId });

  const {
    data: ratings,
    isLoading: loadingRatings,
    error: errorRatings,
  } = useGetAllRatingsQuery({ interviewerId });

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (interviews?.interviews) {
      // Process interviews by status
      const statusCounts = {
        Scheduled: 0,
        Completed: 0,
        Cancelled: 0,
        Pending: 0,
      };

      interviews.interviews.forEach((interview) => {
        const formattedStatus =
          interview.status.charAt(0).toUpperCase() + interview.status.slice(1);
        statusCounts[formattedStatus] =
          (statusCounts[formattedStatus] || 0) + 1;
      });

      const statusData = Object.keys(statusCounts).map((status) => ({
        name: status,
        value: statusCounts[status],
      }));
      setInterviewsByStatus(statusData);

      // Process interviews by month
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

    if (applications?.applications) {
      const statusCounts = {};
      applications.applications.forEach((app) => {
        const formattedStatus =
          app.status.charAt(0).toUpperCase() + app.status.slice(1);
        if (!statusCounts[formattedStatus]) statusCounts[formattedStatus] = 0;
        statusCounts[formattedStatus]++;
      });

      const statusData = Object.keys(statusCounts).map((status) => ({
        name: status,
        value: statusCounts[status],
      }));
      setApplicationsByStatus(statusData);
    }

    if (contracts?.contracts) {
      const statusCounts = {};
      contracts.contracts.forEach((contract) => {
        const formattedStatus =
          contract.status.charAt(0).toUpperCase() + contract.status.slice(1);
        if (!statusCounts[formattedStatus]) statusCounts[formattedStatus] = 0;
        statusCounts[formattedStatus]++;
      });

      const chartData = Object.keys(statusCounts).map((status) => ({
        name: status,
        value: statusCounts[status],
      }));
      setContractStatus(chartData);
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
          name: `${rating} ${rating === '1' ? 'Star' : 'Stars'}`,
          value: ratingGroups[rating],
        }))
        .reverse();

      setInterviewerRatings(chartData);
    }
  }, [applications, interviews, contracts, ratings]);

  const overallLoading =
    loadingApplications ||
    loadingInterviews ||
    loadingContracts ||
    loadingRatings;

  const averageRating =
    ratings?.interviewerRatings?.reduce(
      (total, rating) => total + Number(rating.rating),
      0
    ) / (ratings?.interviewerRatings?.length || 1);

  const completedInterviews =
    interviews?.interviews?.filter((i) => i.status === 'completed').length || 0;

  const scheduledInterviews =
    interviews?.interviews?.filter((i) => i.status === 'scheduled').length || 0;

  return (
    <>
      <Helmet>
        <title>
          Interviewer Dashboard - OptaHire | Manage Your Interview Business
        </title>
        <meta
          name="description"
          content="OptaHire Interviewer Dashboard - Manage your interview schedule, contracts, earnings, and grow your interviewing business."
        />
        <meta
          name="keywords"
          content="OptaHire Interviewer Dashboard, Interview Business, Freelance Interviewing, Interview Contracts, Earnings"
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
              Interviewer{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Dashboard
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Manage your interview business, track earnings, and build
              relationships with top recruiters.
            </p>

            {(errorApplications ||
              errorInterviews ||
              errorContracts ||
              errorRatings) && (
              <Alert
                message={
                  errorApplications?.data?.message ||
                  errorInterviews?.data?.message ||
                  errorContracts?.data?.message ||
                  errorRatings?.data?.message
                }
              />
            )}

            {/* Key Metrics Cards */}
            <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div className="animate-slideUp rounded-xl bg-light-surface p-5 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                      Total Interviews
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
                      {scheduledInterviews}
                    </span>{' '}
                    scheduled interviews
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
                      Completed Interviews
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {completedInterviews}
                    </h3>
                  </div>
                  <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                    <FaCheckCircle className="text-xl text-green-500 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-4 border-t border-light-border pt-4 dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-green-500">
                      {(
                        (completedInterviews /
                          (interviews?.interviews?.length || 1)) *
                        100
                      ).toFixed(0)}
                      %
                    </span>{' '}
                    completion rate
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
                      Your Rating
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

              <div
                className="animate-slideUp rounded-xl bg-light-surface p-5 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                      Applications Reviewed
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
                      {applications?.applications?.filter(
                        (app) => app.status === 'hired'
                      ).length || 0}
                    </span>{' '}
                    candidates hired
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Layout */}
            <div className="mb-8 grid grid-cols-1 gap-8">
              {/* Monthly Interviews Chart */}
              <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                  <FaCalendarAlt className="mr-2 text-purple-500" /> Your
                  Monthly Interview Schedule
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={interviewsByMonth}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorInterviews"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8884d8"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8884d8"
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
                        dataKey="interviews"
                        name="Interviews"
                        stroke="#8884d8"
                        fill="url(#colorInterviews)"
                        activeDot={{ r: 8 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Two column charts */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Interview Status Distribution */}
                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaClock className="mr-2 text-blue-500" /> Interview Status
                    Distribution
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={interviewsByStatus}
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
                          {interviewsByStatus.map((entry, index) => (
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

                {/* Rating Distribution */}
                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaStar className="mr-2 text-amber-500" /> Your Rating
                    Distribution
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
              </div>

              {/* Two column charts */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Applications by Status */}
                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaEnvelopeOpenText className="mr-2 text-yellow-500" />{' '}
                    Application Status Distribution
                  </h3>
                  {applicationsByStatus.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={applicationsByStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
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
                  ) : (
                    <div className="flex h-80 items-center justify-center">
                      <p className="text-light-text/70 dark:text-dark-text/70">
                        No application data available
                      </p>
                    </div>
                  )}
                </div>

                {/* Contract Status */}
                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaFileContract className="mr-2 text-red-500" /> Contract
                    Status Distribution
                  </h3>
                  {contractStatus.length > 0 ? (
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
                  ) : (
                    <div className="flex h-80 items-center justify-center">
                      <p className="text-light-text/70 dark:text-dark-text/70">
                        No contract data available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Performance Trend */}
              <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                  <FaUserTie className="mr-2 text-light-primary" /> Your
                  Performance History
                </h3>
                {ratings?.interviewerRatings?.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={ratings.interviewerRatings
                          .slice(-10) // Get last 10 ratings
                          .map((rating, index) => ({
                            id: index + 1,
                            rating: Number(rating.rating),
                            date: new Date(
                              rating.createdAt
                            ).toLocaleDateString(),
                          }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="id" name="Rating #" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="rating"
                          name="Rating"
                          stroke="#0EB0E3"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-80 items-center justify-center">
                    <p className="text-light-text/70 dark:text-dark-text/70">
                      No rating history available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
