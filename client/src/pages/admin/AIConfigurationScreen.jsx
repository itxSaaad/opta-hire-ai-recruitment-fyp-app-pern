import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBrain,
  FaChartLine,
  FaCheckCircle,
  FaCog,
  FaGraduationCap,
  FaMemory,
  FaMicrochip,
  FaPlayCircle,
  FaRobot,
  FaServer,
  FaSyncAlt,
  FaTachometerAlt,
  FaTimesCircle,
} from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import {
  useCheckAiServiceStatusQuery,
  useCheckSystemHealthQuery,
  useGetModelMetricsQuery,
  useGetModelStatusQuery,
  useTrainModelMutation,
} from '../../features/ai/aiApi';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

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

export default function AIManagementScreen() {
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [trainingParams, setTrainingParams] = useState({
    useHistoricalData: true,
    trainingSize: 200,
  });

  const routeLocation = useLocation();

  // API Queries with polling for real-time updates
  const {
    data: systemHealth,
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth,
  } = useCheckSystemHealthQuery(undefined, {
    pollingInterval: refreshInterval,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: aiServiceStatus,
    isLoading: serviceLoading,
    error: serviceError,
    refetch: refetchService,
  } = useCheckAiServiceStatusQuery(undefined, {
    pollingInterval: refreshInterval,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: modelStatus,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useGetModelStatusQuery(undefined, {
    pollingInterval: refreshInterval,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: modelMetrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useGetModelMetricsQuery(undefined, {
    pollingInterval: refreshInterval,
    refetchOnMountOrArgChange: true,
  });

  const [
    trainModel,
    {
      isLoading: trainingLoading,
      error: trainingError,
      isSuccess: trainingSuccess,
      data: trainingData,
    },
  ] = useTrainModelMutation();

  useEffect(() => {
    trackPageView(routeLocation.pathname);
  }, [routeLocation.pathname]);

  // Manual refresh all data
  const handleRefreshAll = () => {
    refetchHealth();
    refetchService();
    refetchStatus();
    refetchMetrics();
    trackEvent(
      'AI Management Refresh',
      'User Action',
      'User manually refreshed AI system data'
    );
  };

  // Handle model training
  const handleTrainModel = async () => {
    try {
      await trainModel(trainingParams).unwrap();
      trackEvent(
        'AI Model Training',
        'Admin Action',
        `Started model training with ${trainingParams.trainingSize} samples`
      );
    } catch (error) {
      console.error('Training failed:', error);
      trackEvent(
        'AI Model Training Failed',
        'Admin Error',
        `Model training failed: ${error?.data?.message}`
      );
    }
  };

  const overallLoading =
    healthLoading || serviceLoading || statusLoading || metricsLoading;

  const totalTrainingSamples =
    modelStatus?.data?.training_info?.training_samples || 0;

  // Calculate model health score based on actual metrics
  const modelHealthScore = modelMetrics?.data?.model_health
    ? (((modelMetrics.data.model_health.storage_accessible ? 1 : 0) +
        (modelMetrics.data.model_health.vectorizers_functional ? 1 : 0)) /
        2) *
      100
    : 0;

  // Prepare scoring weights data for chart if available
  const scoringWeightsData = aiServiceStatus?.data?.scoring_weights
    ? Object.entries(aiServiceStatus.data.scoring_weights).map(
        ([key, value]) => ({
          name: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          value: value * 100,
        })
      )
    : [];

  return (
    <>
      <Helmet>
        <title>
          AI Configuration [Admin] - OptaHire | Manage AI Recruitment Models
        </title>
        <meta
          name="description"
          content="OptaHire AI Configuration - Configure and manage AI recruitment models, train algorithms, and optimize candidate matching systems."
        />
        <meta
          name="keywords"
          content="OptaHire AI Configuration, AI Recruitment, Machine Learning, Candidate Matching, AI Training"
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
              Configure{' '}
              <span className="text-light-primary dark:text-dark-primary">
                AI Systems
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Manage and train AI recruitment models to optimize candidate
              matching and enhance platform intelligence.
            </p>

            {/* Error Display */}
            {(healthError ||
              serviceError ||
              statusError ||
              metricsError ||
              trainingError) && (
              <Alert
                message={
                  healthError?.data?.message ||
                  serviceError?.data?.message ||
                  statusError?.data?.message ||
                  metricsError?.data?.message ||
                  trainingError?.data?.message
                }
                isSuccess={false}
              />
            )}

            {/* Success Messages */}
            {trainingSuccess && trainingData?.message && (
              <Alert message={trainingData.message} isSuccess={true} />
            )}

            {/* Control Panel */}
            <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center space-x-4">
                <InputField
                  id="refreshInterval"
                  type="select"
                  label=""
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  options={[
                    { value: 10000, label: 'Auto-refresh: 10s' },
                    { value: 30000, label: 'Auto-refresh: 30s' },
                    { value: 60000, label: 'Auto-refresh: 1m' },
                    { value: 0, label: 'Manual only' },
                  ]}
                />
              </div>
              <button
                onClick={handleRefreshAll}
                className="flex items-center gap-2 rounded bg-light-primary px-4 py-2 text-white transition-all duration-200 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
              >
                <FaSyncAlt />
                Refresh All
              </button>
            </div>

            {/* Key Metrics Cards */}
            <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              <div className="animate-slideUp rounded-xl bg-light-surface p-5 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                      System Health
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {systemHealth?.data?.status === 'healthy'
                        ? 'Healthy'
                        : 'Issues'}
                    </h3>
                  </div>
                  <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                    <FaServer className="text-xl text-green-500 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-4 border-t border-light-border pt-4 dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-green-500">
                      {systemHealth?.data?.uptime || 'Unknown'}
                    </span>{' '}
                    uptime
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
                      CPU Usage
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {systemHealth?.data?.system?.cpu_usage_percent?.toFixed(
                        1
                      ) || 0}
                      %
                    </h3>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                    <FaMicrochip className="text-xl text-light-primary dark:text-dark-primary" />
                  </div>
                </div>
                <div className="mt-4 border-t border-light-border pt-4 dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-blue-500">
                      {systemHealth?.data?.system?.available_memory_gb?.toFixed(
                        1
                      ) || 0}
                      GB
                    </span>{' '}
                    memory available
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
                      Model Status
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {modelStatus?.data?.is_trained ? 'Trained' : 'Untrained'}
                    </h3>
                  </div>
                  <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                    <FaBrain className="text-xl text-purple-500 dark:text-purple-400" />
                  </div>
                </div>
                <div className="mt-4 border-t border-light-border pt-4 dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-purple-500">
                      v{modelStatus?.data?.model_version || '1.0.0'}
                    </span>{' '}
                    current version
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
                      Training Samples
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {totalTrainingSamples.toLocaleString()}
                    </h3>
                  </div>
                  <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/30">
                    <FaGraduationCap className="text-xl text-yellow-500 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="mt-4 border-t border-light-border pt-4 dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-yellow-500">
                      {modelStatus?.data?.training_info?.valid_samples || 'N/A'}
                    </span>{' '}
                    valid samples
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
                      Model Health
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {modelHealthScore}%
                    </h3>
                  </div>
                  <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/30">
                    <FaTachometerAlt className="text-xl text-red-500 dark:text-red-400" />
                  </div>
                </div>
                <div className="mt-4 border-t border-light-border pt-4 dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-red-500">
                      {modelMetrics?.data?.model_health
                        ? `${(modelMetrics.data.model_health.storage_accessible ? 1 : 0) + (modelMetrics.data.model_health.vectorizers_functional ? 1 : 0)}/2`
                        : '0/2'}
                    </span>{' '}
                    components healthy
                  </p>
                </div>
              </div>

              <div
                className="animate-slideUp rounded-xl bg-light-surface p-5 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                      Memory Usage
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {systemHealth?.data?.system?.memory_usage_percent?.toFixed(
                        1
                      ) || 0}
                      %
                    </h3>
                  </div>
                  <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30">
                    <FaMemory className="text-xl text-amber-500 dark:text-amber-400" />
                  </div>
                </div>
                <div className="mt-4 border-t border-light-border pt-4 dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-amber-500">
                      {(
                        systemHealth?.data?.system?.available_memory_gb || 0
                      ).toFixed(1)}
                      GB
                    </span>{' '}
                    available
                  </p>
                </div>
              </div>

              <div
                className="animate-slideUp rounded-xl bg-light-surface p-5 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface"
                style={{ animationDelay: '0.6s' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                      AI Service
                    </p>
                    <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {aiServiceStatus?.data?.model_trained
                        ? 'Ready'
                        : 'Training'}
                    </h3>
                  </div>
                  <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                    <FaRobot className="text-xl text-green-500 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-4 border-t border-light-border pt-4 dark:border-dark-border">
                  <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                    <span className="font-medium text-green-500">
                      {
                        Object.values(
                          aiServiceStatus?.data?.capabilities || {}
                        ).filter(Boolean).length
                      }
                    </span>{' '}
                    capabilities active
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Layout */}
            <div className="mb-8 grid grid-cols-1 gap-8">
              {/* Two columns - AI Service Status and Scoring Weights Chart */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* AI Service Status */}
                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                      <FaCog className="mr-2 text-light-primary dark:text-dark-primary" />
                      AI Service Status
                    </h3>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`rounded-full p-1 ${aiServiceStatus?.data?.model_trained ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
                        >
                          {aiServiceStatus?.data?.model_trained ? (
                            <FaCheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <FaTimesCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-light-text dark:text-dark-text">
                          {aiServiceStatus?.data?.model_trained
                            ? 'Model Trained'
                            : 'Model Needs Training'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <h4 className="mb-4 text-lg font-medium text-light-text dark:text-dark-text">
                        Capabilities
                      </h4>
                      <div className="space-y-2">
                        {aiServiceStatus?.data?.capabilities &&
                          Object.entries(aiServiceStatus.data.capabilities).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex items-center justify-between rounded border border-light-border bg-light-background px-3 py-2 dark:border-dark-border dark:bg-dark-background"
                              >
                                <span className="text-sm capitalize text-light-text dark:text-dark-text">
                                  {key.replace(/_/g, ' ')}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`rounded-full p-1 ${value ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
                                  >
                                    {value ? (
                                      <FaCheckCircle className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <FaTimesCircle className="h-3 w-3 text-red-500" />
                                    )}
                                  </div>
                                  <span className="text-xs font-medium text-light-text dark:text-dark-text">
                                    {value ? 'Enabled' : 'Disabled'}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-4 text-lg font-medium text-light-text dark:text-dark-text">
                        Performance Settings
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-light-text/70 dark:text-dark-text/70">
                            Max Candidates per Request
                          </span>
                          <span className="text-sm font-medium text-light-text dark:text-dark-text">
                            {aiServiceStatus?.data?.performance
                              ?.max_candidates_per_request || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-light-text/70 dark:text-dark-text/70">
                            Min Similarity Threshold
                          </span>
                          <span className="text-sm font-medium text-light-text dark:text-dark-text">
                            {aiServiceStatus?.data?.performance
                              ?.min_similarity_threshold || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-light-text/70 dark:text-dark-text/70">
                            Rate Limit (per minute)
                          </span>
                          <span className="text-sm font-medium text-light-text dark:text-dark-text">
                            {aiServiceStatus?.data?.performance
                              ?.rate_limit_per_minute || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaChartLine className="mr-2 text-purple-500" /> Scoring
                    Weights Distribution
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={scoringWeightsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) =>
                            `${name}: ${value.toFixed(0)}%`
                          }
                        >
                          {scoringWeightsData.map((entry, index) => (
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
              </div>

              {/* Two columns - Model Health Info and Training Controls */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaTachometerAlt className="mr-2 text-red-500" /> Model
                    Health & Metrics
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-3 text-lg font-medium text-light-text dark:text-dark-text">
                        Health Status
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-light-text/70 dark:text-dark-text/70">
                            Storage Accessible
                          </span>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`rounded-full p-1 ${modelMetrics?.data?.model_health?.storage_accessible ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
                            >
                              {modelMetrics?.data?.model_health
                                ?.storage_accessible ? (
                                <FaCheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <FaTimesCircle className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                            <span className="text-xs font-medium text-light-text dark:text-dark-text">
                              {modelMetrics?.data?.model_health
                                ?.storage_accessible
                                ? 'Yes'
                                : 'No'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-light-text/70 dark:text-dark-text/70">
                            Vectorizers Functional
                          </span>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`rounded-full p-1 ${modelMetrics?.data?.model_health?.vectorizers_functional ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
                            >
                              {modelMetrics?.data?.model_health
                                ?.vectorizers_functional ? (
                                <FaCheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <FaTimesCircle className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                            <span className="text-xs font-medium text-light-text dark:text-dark-text">
                              {modelMetrics?.data?.model_health
                                ?.vectorizers_functional
                                ? 'Yes'
                                : 'No'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-light-text/70 dark:text-dark-text/70">
                            Last Health Check
                          </span>
                          <span className="text-sm font-medium text-light-text dark:text-dark-text">
                            {modelMetrics?.data?.model_health?.last_health_check
                              ? new Date(
                                  modelMetrics.data.model_health.last_health_check
                                ).toLocaleTimeString()
                              : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 text-lg font-medium text-light-text dark:text-dark-text">
                        Performance Stats
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-light-text/70 dark:text-dark-text/70">
                            Model Version
                          </span>
                          <span className="text-sm font-medium text-light-text dark:text-dark-text">
                            {modelMetrics?.data?.model_performance
                              ?.model_version || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-light-text/70 dark:text-dark-text/70">
                            Training Samples Used
                          </span>
                          <span className="text-sm font-medium text-light-text dark:text-dark-text">
                            {modelMetrics?.data?.model_performance
                              ?.training_samples || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-light-text/70 dark:text-dark-text/70">
                            Max Candidates Returned
                          </span>
                          <span className="text-sm font-medium text-light-text dark:text-dark-text">
                            {modelMetrics?.data?.scoring_configuration
                              ?.max_candidates_returned || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                    <FaPlayCircle className="mr-2 text-blue-500" /> Model
                    Training
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={trainingParams.useHistoricalData}
                          onChange={(e) =>
                            setTrainingParams((prev) => ({
                              ...prev,
                              useHistoricalData: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-light-border text-light-primary dark:border-dark-border"
                        />
                        <span className="text-sm text-light-text dark:text-dark-text">
                          Use Historical Data
                        </span>
                      </label>
                    </div>

                    <InputField
                      id="trainingSize"
                      type="number"
                      label="Training Sample Size"
                      value={trainingParams.trainingSize}
                      onChange={(e) =>
                        setTrainingParams((prev) => ({
                          ...prev,
                          trainingSize: parseInt(e.target.value),
                        }))
                      }
                      placeholder="Number of samples"
                      min="50"
                      max="1000"
                    />

                    <button
                      onClick={handleTrainModel}
                      disabled={trainingLoading}
                      className="flex w-full items-center justify-center gap-2 rounded bg-green-600 px-4 py-2 text-white transition-all duration-200 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {trainingLoading ? (
                        <>
                          <FaSyncAlt className="animate-spin" />
                          Training...
                        </>
                      ) : (
                        <>
                          <FaPlayCircle />
                          Start Training
                        </>
                      )}
                    </button>

                    <div className="mt-4 space-y-2 text-sm text-light-text/70 dark:text-dark-text/70">
                      <div className="flex justify-between">
                        <span>Last Training:</span>
                        <span>
                          {modelStatus?.data?.training_info?.training_timestamp
                            ? new Date(
                                modelStatus.data.training_info.training_timestamp
                              ).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="capitalize">
                          {modelStatus?.data?.training_info?.status ||
                            'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valid Samples:</span>
                        <span>
                          {modelStatus?.data?.training_info?.valid_samples ||
                            'N/A'}
                        </span>
                      </div>
                    </div>
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
