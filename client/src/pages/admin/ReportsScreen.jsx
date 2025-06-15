import {
  Document,
  Image,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
  FaCalendarAlt,
  FaChartBar,
  FaChartLine,
  FaClipboardList,
  FaDollarSign,
  FaDownload,
  FaFileAlt,
  FaFilter,
  FaUsers,
  FaVideo,
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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import Alert from '../../components/Alert';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import Loader from '../../components/Loader';

import { trackEvent, trackPageView } from '../../utils/analytics';

import Logo from '../../assets/images/logo.png';

import {
  useLazyGetApplicationFunnelReportQuery,
  useLazyGetFinancialReportQuery,
  useLazyGetInterviewAnalyticsReportQuery,
  useLazyGetJobPerformanceReportQuery,
  useLazyGetUserActivityReportQuery,
} from '../../features/report/reportApi';

// Custom tooltip component matching Dashboard
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

/// Utility functions remain the same
const formatDate = (date, format = 'MMM dd, yyyy') => {
  // Your existing formatDate function
  const d = new Date(date);
  const months = [
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

  switch (format) {
    case 'yyyy-MM-dd':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    case 'full': {
      const fullMonths = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      return `${fullMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    default:
      return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

// Enhanced PDF styles with professional OptaHire branding
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.6,
    color: '#2D3748',
    backgroundColor: '#FFFFFF',
  },
  letterhead: {
    backgroundColor: 'transparent',
    padding: '20 30',
    marginBottom: 0,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0EB0E3',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  logoSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 55,
    height: 55,
    marginRight: 15,
  },
  brandInfo: {
    justifyContent: 'center',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0EB0E3',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 10,
    color: '#3946AE',
    fontStyle: 'italic',
  },
  contactSection: {
    alignItems: 'flex-end',
  },
  contactInfo: {
    color: '#0EB0E3',
    fontSize: 8,
    textAlign: 'right',
    marginBottom: 2,
  },
  reportHeader: {
    backgroundColor: '#3946AE',
    padding: '18 30',
    marginBottom: 20,
    borderRadius: 6,
    marginTop: 15,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportMetaText: {
    fontSize: 9,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  reportDate: {
    fontSize: 9,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 16,
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0EB0E3',
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3946AE',
    marginBottom: 8,
    marginTop: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#F7FAFC',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#0EB0E3',
    width: '48%',
    minHeight: 55,
    justifyContent: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  metricTitle: {
    fontSize: 8,
    color: '#718096',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 'medium',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0EB0E3',
  },
  table: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    minHeight: 28,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#0EB0E3',
    paddingVertical: 8,
  },
  tableCell: {
    padding: '7 10',
    flex: 1,
    fontSize: 8,
    color: '#4A5568',
    borderRightWidth: 1,
    borderRightColor: '#EDF2F7',
    justifyContent: 'center',
  },
  tableCellHeader: {
    padding: '7 10',
    flex: 1,
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  footer: {
    position: 'absolute',
    bottom: 35,
    left: 50,
    right: 50,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  footerText: {
    fontSize: 8,
    color: '#718096',
  },
  footerBrand: {
    fontSize: 8,
    color: '#0EB0E3',
    fontWeight: 'bold',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 25,
    right: 50,
    fontSize: 8,
    color: '#718096',
  },
  disclaimer: {
    backgroundColor: '#F7FAFC',
    padding: 12,
    marginTop: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#3946AE',
    borderRadius: 4,
  },
  disclaimerText: {
    fontSize: 7,
    color: '#4A5568',
    fontStyle: 'italic',
    lineHeight: 1.5,
  },
  noDataText: {
    fontSize: 10,
    color: '#718096',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 25,
    backgroundColor: '#F7FAFC',
    borderRadius: 4,
    border: '1px solid #EDF2F7',
  },
  statusPill: {
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 7,
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusPositive: {
    backgroundColor: '#C6F6D5', // More vibrant green
    color: '#22543D', // Darker green text
  },
  statusNeutral: {
    backgroundColor: '#E2E8F0', // More refined gray
    color: '#2D3748', // Darker gray text
  },
  statusAccent: {
    backgroundColor: '#BEE3F8', // More vibrant blue
    color: '#2A4365', // Darker blue text
  },
  statusWarning: {
    backgroundColor: '#FEEBC8', // More vibrant yellow
    color: '#744210', // Darker yellow text
  },
  statusNegative: {
    backgroundColor: '#FED7D7', // More vibrant red
    color: '#822727', // Darker red text
  },
});

// Enhanced PDF Document Component
const ReportPDF = ({ reportData, startDate, endDate }) => {
  const renderTable = (title, data, columns) => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>{title}</Text>
          <Text style={styles.noDataText}>
            No data available for this section.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>{title}</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            {columns.map((col, index) => (
              <Text
                key={index}
                style={[
                  styles.tableCellHeader,
                  index === columns.length - 1 && styles.tableCellLast,
                ]}
              >
                {col.label}
              </Text>
            ))}
          </View>
          {data.map((item, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {columns.map((col, colIndex) => {
                // Special handling for status-like fields
                if (col.key === 'isTopRated') {
                  return (
                    <View
                      key={colIndex}
                      style={[
                        styles.tableCell,
                        colIndex === columns.length - 1 && styles.tableCellLast,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPill,
                          item.isTopRated
                            ? styles.statusPositive
                            : styles.statusNeutral,
                        ]}
                      >
                        {item.isTopRated ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  );
                } else if (col.key === 'status') {
                  let statusStyle;
                  if (item.status === 'applied')
                    statusStyle = styles.statusAccent;
                  else if (
                    item.status === 'shortlisted' ||
                    item.status === 'hired'
                  )
                    // Combined shortlisted and hired for positive
                    statusStyle = styles.statusPositive;
                  else if (item.status === 'rejected')
                    statusStyle = styles.statusNegative;
                  else statusStyle = styles.statusNeutral;

                  return (
                    <View
                      key={colIndex}
                      style={[
                        styles.tableCell,
                        colIndex === columns.length - 1 && styles.tableCellLast,
                      ]}
                    >
                      <Text style={[styles.statusPill, statusStyle]}>
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1).toLowerCase()}
                      </Text>
                    </View>
                  );
                } else if (
                  col.key === 'hireRate' ||
                  col.key === 'completionRate'
                ) {
                  let rateValue = item[col.key] || 0;
                  let statusStyle;

                  if (rateValue >= 70)
                    statusStyle = styles.statusPositive; // Adjusted thresholds
                  else if (rateValue >= 40) statusStyle = styles.statusAccent;
                  else if (rateValue >= 20) statusStyle = styles.statusWarning;
                  else statusStyle = styles.statusNegative; // Changed to negative for very low rates

                  return (
                    <View
                      key={colIndex}
                      style={[
                        styles.tableCell,
                        colIndex === columns.length - 1 && styles.tableCellLast,
                      ]}
                    >
                      <Text style={[styles.statusPill, statusStyle]}>
                        {rateValue}%
                      </Text>
                    </View>
                  );
                } else if (col.key === 'transactionType') {
                  let statusStyle;
                  if (item.transactionType === 'Subscription')
                    statusStyle = styles.statusAccent;
                  else if (item.transactionType === 'Interview Fee')
                    statusStyle = styles.statusPositive;
                  else statusStyle = styles.statusNeutral;

                  return (
                    <View
                      key={colIndex}
                      style={[
                        styles.tableCell,
                        colIndex === columns.length - 1 && styles.tableCellLast,
                      ]}
                    >
                      <Text style={[styles.statusPill, statusStyle]}>
                        {item.transactionType}
                      </Text>
                    </View>
                  );
                } else {
                  // Default rendering for other columns
                  return (
                    <Text
                      key={colIndex}
                      style={[
                        styles.tableCell,
                        colIndex === columns.length - 1 && styles.tableCellLast,
                      ]}
                    >
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : String(item[col.key] || 'N/A')}
                    </Text>
                  );
                }
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const getMetrics = () => {
    const { summary } = reportData;

    switch (reportData.reportType) {
      case 'User Activity Report': {
        return [
          {
            title: 'Total Users',
            value: (summary.totalUsers || 0).toLocaleString(),
          },
          {
            title: 'Verified Users',
            value: (
              summary.verificationStats?.find((s) => s.status === 'Verified')
                ?.count || 0
            ).toLocaleString(),
          },
          {
            title: 'Active Roles',
            value: (summary.usersByRole?.length || 0).toLocaleString(),
          },
          {
            title: 'Top Interviewers',
            value: (summary.topInterviewers?.length || 0).toLocaleString(),
          },
        ];
      }
      case 'Job Performance Report':
        return [
          {
            title: 'Total Jobs',
            value: (summary.totalJobs || 0).toLocaleString(),
          },
          {
            title: 'Active Categories',
            value: (summary.jobsByCategory?.length || 0).toLocaleString(),
          },
          {
            title: 'Popular Jobs',
            value: (summary.popularJobs?.length || 0).toLocaleString(),
          },
          {
            title: 'Avg Applications',
            value: Math.round(
              summary.avgApplicationsPerJob || 0
            ).toLocaleString(),
          },
        ];
      case 'Financial Report':
        return [
          {
            title: 'Total Revenue',
            value: formatCurrency(summary.totalRevenue),
          },
          {
            title: 'Platform Fee',
            value: formatCurrency(summary.totalPlatformFee),
          },
          {
            title: 'Fee Rate',
            value: `${summary.platformFeePercentage || 0}%`,
          },
          {
            title: 'Transactions',
            value: (summary.totalTransactions || 0).toLocaleString(),
          },
        ];
      case 'Interview Analytics Report':
        return [
          {
            title: 'Total Interviews',
            value: (summary.totalInterviews || 0).toLocaleString(),
          },
          {
            title: 'Completed',
            value: (summary.completedInterviews || 0).toLocaleString(),
          },
          {
            title: 'Avg Duration',
            value: `${summary.avgDurationMinutes || 0} min`,
          },
          { title: 'Success Rate', value: `${summary.completionRate || 0}%` },
        ];
      case 'Application Funnel Report':
        return [
          {
            title: 'Total Applications',
            value: (summary.totalApplications || 0).toLocaleString(),
          },
          {
            title: 'Shortlisted',
            value: (summary.shortlistedApplications || 0).toLocaleString(),
          },
          {
            title: 'Hired',
            value: (summary.hiredApplications || 0).toLocaleString(),
          },
          {
            title: 'Avg Time to Hire',
            value: `${summary.avgDaysToHire || 0} days`,
          },
        ];
      default:
        return [];
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* OptaHire Letterhead */}
        <View style={styles.letterhead}>
          <View style={styles.headerContainer}>
            <View style={styles.logoSection}>
              <Image src={Logo} style={styles.logo} />
              <View style={styles.brandInfo}>
                <Text style={styles.companyName}>OptaHire</Text>
                <Text style={styles.tagline}>
                  Optimizing Your Recruitment Journey
                </Text>
              </View>
            </View>
            <View style={styles.contactSection}>
              <Text style={styles.contactInfo}>contact@optahire.com</Text>
              <Text style={styles.contactInfo}>www.optahire.com</Text>
              <Text style={styles.contactInfo}>+1 (555) 123-4567</Text>
            </View>
          </View>
        </View>

        {/* Report Header */}
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>{reportData.reportType}</Text>
          <View style={styles.reportMeta}>
            <Text style={styles.reportMetaText}>
              Period: {formatDate(startDate, 'full')} -{' '}
              {formatDate(endDate, 'full')}
            </Text>
            <Text style={styles.reportDate}>
              Generated: {formatDate(new Date(), 'full')}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Executive Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <View style={styles.metricsGrid}>
              {getMetrics().map((metric, index) => (
                <View key={index} style={styles.metricCard}>
                  <Text style={styles.metricTitle}>{metric.title}</Text>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Report-specific tables */}
          {/* Note: The sectionTitle "Detailed Analytics" was moved inside individual renderTable calls in the original,
              but for a cleaner structure, it's often better to have a single "Detailed Analytics" section
              and then render subsections within it. However, keeping it as per your original logic
              for now. */}

          {reportData.reportType === 'User Activity Report' && (
            <>
              {renderTable(
                'User Distribution by Role',
                reportData.summary.usersByRole,
                [
                  { key: 'role', label: 'User Role' },
                  { key: 'count', label: 'Total Count' },
                ]
              )}
              {renderTable(
                'Top Rated Interviewers',
                reportData.summary.topInterviewers,
                [
                  { key: 'name', label: 'Interviewer Name' },
                  { key: 'averageRating', label: 'Avg Rating' },
                  { key: 'totalRatings', label: 'Total Ratings' },
                  { key: 'isTopRated', label: 'Top Rated' }, // Rendered via special handling in renderTable
                ]
              )}
            </>
          )}

          {reportData.reportType === 'Job Performance Report' && (
            <>
              {renderTable(
                'Job Distribution by Category',
                reportData.summary.jobsByCategory,
                [
                  { key: 'category', label: 'Job Category' },
                  { key: 'jobCount', label: 'Total Jobs' },
                ]
              )}
              {renderTable(
                'Most Popular Job Postings',
                reportData.summary.popularJobs,
                [
                  { key: 'title', label: 'Job Title' },
                  { key: 'company', label: 'Company' },
                  { key: 'applicationCount', label: 'Applications' },
                ]
              )}
            </>
          )}

          {reportData.reportType === 'Financial Report' && (
            <>
              {renderTable(
                'Revenue by Transaction Type',
                reportData.summary.revenueByType,
                [
                  { key: 'transactionType', label: 'Transaction Type' },
                  { key: 'transactionCount', label: 'Count' },
                  {
                    key: 'totalAmount',
                    label: 'Total Amount ($)',
                    accessor: (item) => formatCurrency(item.totalAmount),
                  },
                  {
                    key: 'totalPlatformFee',
                    label: 'Platform Fee ($)',
                    accessor: (item) => formatCurrency(item.totalPlatformFee),
                  },
                ]
              )}
              {renderTable(
                'Top Revenue Generating Clients',
                reportData.summary.topRecruiters,
                [
                  { key: 'name', label: 'Client Name' },
                  {
                    key: 'totalSpent',
                    label: 'Total Spent',
                    accessor: (item) => formatCurrency(item.totalSpent),
                  },
                  { key: 'contractCount', label: 'Contracts' },
                ]
              )}
            </>
          )}

          {reportData.reportType === 'Interview Analytics Report' && (
            <>
              {renderTable(
                'Interview Status Overview',
                reportData.summary.interviewStatusStats,
                [
                  { key: 'status', label: 'Interview Status' },
                  { key: 'count', label: 'Total Count' },
                ]
              )}
              {renderTable(
                'Interviewer Performance Metrics',
                reportData.summary.interviewerPerformance,
                [
                  { key: 'name', label: 'Interviewer' },
                  { key: 'totalInterviews', label: 'Total' },
                  { key: 'completedInterviews', label: 'Completed' },
                  { key: 'completionRate', label: 'Success Rate' }, // Rendered via special handling
                  {
                    key: 'avgRating',
                    label: 'Avg Rating',
                    render: (item) => Number(item.avgRating || 0).toFixed(1),
                  },
                ]
              )}
            </>
          )}

          {reportData.reportType === 'Application Funnel Report' && (
            <>
              {renderTable(
                'Application Pipeline Analysis',
                reportData.summary.funnelStats,
                [
                  { key: 'status', label: 'Pipeline Stage' },
                  { key: 'count', label: 'Applications' },
                  {
                    key: 'percentage',
                    label: 'Percentage (%)',
                    accessor: (item) => `${item.percentage || 0}%`,
                  },
                ]
              )}
              {renderTable(
                'Hiring Success by Category',
                reportData.summary.conversionByCategory,
                [
                  { key: 'category', label: 'Job Category' },
                  { key: 'totalApplications', label: 'Total Applications' },
                  {
                    key: 'hireRate',
                    label: 'Hire Rate (%)',
                    accessor: (item) => `${item.hireRate || 0}%`,
                  },
                ]
              )}
            </>
          )}

          {/* Professional Disclaimer */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              Report Disclaimer: This automated report is generated by
              OptaHire&apos;s advanced analytics engine based on platform data
              for the specified date range. All metrics are calculated using
              verified platform data and industry-standard methodologies. For
              detailed analysis, custom reports, or questions about this data,
              please contact our analytics team at analytics@optahire.com. Data
              is subject to privacy policies and platform terms of service.
            </Text>
          </View>
        </View>

        {/* Professional Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerBrand}>
              OptaHire - Optimizing Your Recruitment Journey &copy;{' '}
              {new Date().getFullYear()}
            </Text>
            <Text style={styles.footerText}>
              Generated: {formatDate(new Date(), 'MMM dd, yyyy')}
            </Text>
          </View>
        </View>

        {/* Dynamic Page Numbers */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
};

ReportPDF.propTypes = {
  reportData: PropTypes.object.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
};

// Main Component
export default function ReportsScreen() {
  const routeLocation = useLocation();

  // State management
  const [reportType, setReportType] = useState('user-activity');
  const [startDate, setStartDate] = useState(
    formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'));
  const [reportData, setReportData] = useState(null);
  const [apiError, setApiError] = useState(null);

  // API hooks
  const [
    getUserActivityReport,
    { isLoading: isLoadingUserActivity, error: userActivityError },
  ] = useLazyGetUserActivityReportQuery();
  const [
    getJobPerformanceReport,
    { isLoading: isLoadingJobPerformance, error: jobPerformanceError },
  ] = useLazyGetJobPerformanceReportQuery();
  const [
    getFinancialReport,
    { isLoading: isLoadingFinancial, error: financialError },
  ] = useLazyGetFinancialReportQuery();
  const [
    getInterviewAnalyticsReport,
    { isLoading: isLoadingInterviewAnalytics, error: interviewAnalyticsError },
  ] = useLazyGetInterviewAnalyticsReportQuery();
  const [
    getApplicationFunnelReport,
    { isLoading: isLoadingApplicationFunnel, error: applicationFunnelError },
  ] = useLazyGetApplicationFunnelReportQuery();

  const isLoading =
    isLoadingUserActivity ||
    isLoadingJobPerformance ||
    isLoadingFinancial ||
    isLoadingInterviewAnalytics ||
    isLoadingApplicationFunnel;
  const error =
    userActivityError ||
    jobPerformanceError ||
    financialError ||
    interviewAnalyticsError ||
    applicationFunnelError ||
    apiError;

  // Track page view
  useEffect(() => {
    trackPageView(routeLocation.pathname);
  }, [routeLocation.pathname]);

  // Report options with icons
  const reportOptions = [
    { value: 'user-activity', label: 'User Activity Report', icon: FaUsers },
    {
      value: 'job-performance',
      label: 'Job Performance Report',
      icon: FaBriefcase,
    },
    { value: 'financial', label: 'Financial Report', icon: FaDollarSign },
    {
      value: 'interview-analytics',
      label: 'Interview Analytics Report',
      icon: FaVideo,
    },
    {
      value: 'application-funnel',
      label: 'Application Funnel Report',
      icon: FaClipboardList,
    },
  ];

  // Generate report function
  const generateReport = async () => {
    setApiError(null);
    setReportData(null);

    try {
      let result;
      const params = { startDate, endDate };

      trackEvent(
        'Generate Report Initiated',
        'Admin Action',
        `Generating ${reportType} report`
      );

      switch (reportType) {
        case 'user-activity':
          result = await getUserActivityReport(params);
          break;
        case 'job-performance':
          result = await getJobPerformanceReport(params);
          break;
        case 'financial':
          result = await getFinancialReport(params);
          break;
        case 'interview-analytics':
          result = await getInterviewAnalyticsReport(params);
          break;
        case 'application-funnel':
          result = await getApplicationFunnelReport(params);
          break;
        default:
          setApiError({ data: { message: 'Invalid report type selected' } });
          return;
      }

      if (result.error) {
        setApiError(result.error);
        trackEvent(
          'Generate Report Failed',
          'Admin Action',
          `Failed to generate ${reportType} report`
        );
        return;
      }

      if (result.data?.data) {
        setReportData(result.data.data);
        trackEvent(
          'Generate Report Success',
          'Admin Action',
          `Successfully generated ${reportType} report`
        );
      } else {
        setApiError({
          data: { message: 'No data returned from the report API' },
        });
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setApiError({
        data: { message: 'Failed to generate report. Please try again.' },
      });
      trackEvent(
        'Generate Report Error',
        'Admin Action',
        `Error generating ${reportType} report`
      );
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!reportData?.trends) return null;

    const { trends } = reportData;

    switch (reportType) {
      case 'user-activity':
        return (
          trends.registrationTrend?.map((trend) => ({
            date: formatDate(new Date(trend.date)),
            registrations: parseInt(trend.registrations || 0),
          })) || []
        );
      case 'job-performance':
        return (
          trends.jobPostingTrend?.map((trend) => ({
            date: formatDate(new Date(trend.date)),
            jobsPosted: parseInt(trend.jobsPosted || 0),
          })) || []
        );
      case 'financial':
        return (
          trends.revenueTrend?.map((trend) => ({
            date: formatDate(new Date(trend.date)),
            revenue: parseFloat(trend.dailyRevenue || 0),
            platformFee: parseFloat(trend.dailyPlatformFee || 0),
          })) || []
        );
      case 'interview-analytics':
        return (
          trends.interviewTrends?.map((trend) => ({
            date: formatDate(new Date(trend.date)),
            scheduled: parseInt(trend.scheduledCount || 0),
            completed: parseInt(trend.completedCount || 0),
          })) || []
        );
      case 'application-funnel':
        return (
          trends.applicationTrends?.map((trend) => ({
            date: formatDate(new Date(trend.date)),
            applications: parseInt(trend.count || 0),
          })) || []
        );
      default:
        return null;
    }
  };

  // Render metric cards - styled to match admin dashboard
  const renderMetricCards = () => {
    if (!reportData?.summary) return null;

    const { summary } = reportData;

    // These card styles match your Admin Dashboard metrics
    const cardStyles = [
      {
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-500 dark:text-blue-400',
      },
      {
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-500 dark:text-green-400',
      },
      {
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-500 dark:text-purple-400',
      },
      {
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        iconColor: 'text-amber-500 dark:text-amber-400',
      },
    ];

    let metrics = [];

    switch (reportData.reportType) {
      case 'User Activity Report':
        metrics = [
          {
            title: 'Total Users',
            value: (summary.totalUsers || 0).toLocaleString(),
            icon: FaUsers,
          },
          {
            title: 'Verified Users',
            value: (
              summary.verificationStats?.find((s) => s.status === 'Verified')
                ?.count || 0
            ).toLocaleString(),
            icon: FaUsers,
          },
          {
            title: 'User Roles',
            value: (summary.usersByRole?.length || 0).toLocaleString(),
            icon: FaUsers,
          },
          {
            title: 'Top Interviewers',
            value: (summary.topInterviewers?.length || 0).toLocaleString(),
            icon: FaUsers,
          },
        ];
        break;
      case 'Job Performance Report':
        metrics = [
          {
            title: 'Total Jobs',
            value: (summary.totalJobs || 0).toLocaleString(),
            icon: FaBriefcase,
          },
          {
            title: 'Job Categories',
            value: (summary.jobsByCategory?.length || 0).toLocaleString(),
            icon: FaBriefcase,
          },
          {
            title: 'Popular Jobs',
            value: (summary.popularJobs?.length || 0).toLocaleString(),
            icon: FaBriefcase,
          },
          {
            title: 'Avg Applications',
            value: Math.round(
              summary.avgApplicationsPerJob || 0
            ).toLocaleString(),
            icon: FaBriefcase,
          },
        ];
        break;
      case 'Financial Report':
        metrics = [
          {
            title: 'Total Revenue',
            value: formatCurrency(summary.totalRevenue),
            icon: FaDollarSign,
          },
          {
            title: 'Platform Fee',
            value: formatCurrency(summary.totalPlatformFee),
            icon: FaDollarSign,
          },
          {
            title: 'Fee Rate',
            value: `${summary.platformFeePercentage || 0}%`,
            icon: FaDollarSign,
          },
          {
            title: 'Transactions',
            value: (summary.totalTransactions || 0).toLocaleString(),
            icon: FaDollarSign,
          },
        ];
        break;
      case 'Interview Analytics Report':
        metrics = [
          {
            title: 'Total Interviews',
            value: (summary.totalInterviews || 0).toLocaleString(),
            icon: FaVideo,
          },
          {
            title: 'Completed',
            value: (summary.completedInterviews || 0).toLocaleString(),
            icon: FaVideo,
          },
          {
            title: 'Avg Duration',
            value: `${summary.avgDurationMinutes || 0} min`,
            icon: FaVideo,
          },
          {
            title: 'Success Rate',
            value: `${summary.completionRate || 0}%`,
            icon: FaVideo,
          },
        ];
        break;
      case 'Application Funnel Report':
        metrics = [
          {
            title: 'Total Applications',
            value: (summary.totalApplications || 0).toLocaleString(),
            icon: FaClipboardList,
          },
          {
            title: 'Shortlisted',
            value: (summary.shortlistedApplications || 0).toLocaleString(),
            icon: FaClipboardList,
          },
          {
            title: 'Hired',
            value: (summary.hiredApplications || 0).toLocaleString(),
            icon: FaClipboardList,
          },
          {
            title: 'Avg Time to Hire',
            value: `${summary.avgDaysToHire || 0} days`,
            icon: FaClipboardList,
          },
        ];
        break;
      default:
        return null;
    }

    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const style = cardStyles[index % cardStyles.length];

          return (
            <div
              key={index}
              className="animate-slideUp rounded-xl bg-light-surface p-5 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                    {metric.title}
                  </p>
                  <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                    {metric.value}
                  </h3>
                </div>
                <div className={`${style.bgColor} rounded-lg p-3`}>
                  <IconComponent className={`${style.iconColor} text-xl`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render data tables
  const renderDataTables = () => {
    if (!reportData?.summary) return null;

    const { summary } = reportData;
    const tables = [];

    switch (reportData.reportType) {
      case 'User Activity Report':
        if (summary.usersByRole?.length > 0) {
          tables.push({
            title: 'User Distribution by Role',
            columns: [
              { key: 'role', label: 'Role' },
              { key: 'count', label: 'Count' },
            ],
            data: summary.usersByRole,
          });
        }
        if (summary.topInterviewers?.length > 0) {
          tables.push({
            title: 'Top Rated Interviewers',
            columns: [
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'averageRating', label: 'Avg Rating' },
              { key: 'totalRatings', label: 'Total Ratings' },
              {
                key: 'isTopRated',
                label: 'Top Rated',
                render: (item) => (
                  <span
                    className={`rounded px-2.5 py-0.5 text-xs font-medium ${
                      item.isTopRated
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
                    }`}
                  >
                    {item.isTopRated ? 'Yes' : 'No'}
                  </span>
                ),
              },
            ],
            data: summary.topInterviewers,
          });
        }
        break;

      case 'Job Performance Report':
        // Similar tables for job performance
        if (summary.jobsByCategory?.length > 0) {
          tables.push({
            title: 'Jobs by Category',
            columns: [
              { key: 'category', label: 'Category' },
              { key: 'jobCount', label: 'Job Count' },
            ],
            data: summary.jobsByCategory,
          });
        }
        if (summary.popularJobs?.length > 0) {
          tables.push({
            title: 'Most Popular Jobs',
            columns: [
              { key: 'title', label: 'Job Title' },
              { key: 'company', label: 'Company' },
              { key: 'category', label: 'Category' },
              { key: 'applicationCount', label: 'Applications' },
            ],
            data: summary.popularJobs,
          });
        }
        break;

      case 'Financial Report':
        // Financial report tables
        if (summary.revenueByType?.length > 0) {
          tables.push({
            title: 'Revenue by Transaction Type',
            columns: [
              { key: 'transactionType', label: 'Transaction Type' },
              { key: 'transactionCount', label: 'Count' },
              {
                key: 'totalAmount',
                label: 'Total Amount',
                render: (item) => formatCurrency(item.totalAmount),
              },
              {
                key: 'totalPlatformFee',
                label: 'Platform Fee',
                render: (item) => formatCurrency(item.totalPlatformFee),
              },
            ],
            data: summary.revenueByType,
          });
        }
        if (summary.topRecruiters?.length > 0) {
          tables.push({
            title: 'Top Revenue Generating Clients',
            columns: [
              { key: 'name', label: 'Client Name' },
              { key: 'email', label: 'Email' },
              {
                key: 'totalSpent',
                label: 'Total Spent',
                render: (item) => formatCurrency(item.totalSpent),
              },
              { key: 'contractCount', label: 'Contracts' },
            ],
            data: summary.topRecruiters,
          });
        }
        break;

      case 'Interview Analytics Report':
        // Interview analytics tables
        if (summary.interviewStatusStats?.length > 0) {
          tables.push({
            title: 'Interview Status Distribution',
            columns: [
              { key: 'status', label: 'Status' },
              { key: 'count', label: 'Count' },
            ],
            data: summary.interviewStatusStats,
          });
        }
        if (summary.interviewerPerformance?.length > 0) {
          tables.push({
            title: 'Interviewer Performance',
            columns: [
              { key: 'name', label: 'Interviewer' },
              { key: 'totalInterviews', label: 'Total' },
              { key: 'completedInterviews', label: 'Completed' },
              {
                key: 'completionRate',
                label: 'Success Rate',
                render: (item) => `${item.completionRate || 0}%`,
              },
              {
                key: 'avgRating',
                label: 'Avg Rating',
                render: (item) => Number(item.avgRating || 0).toFixed(1),
              },
            ],
            data: summary.interviewerPerformance,
          });
        }
        break;

      case 'Application Funnel Report':
        // Application funnel tables
        if (summary.funnelStats?.length > 0) {
          tables.push({
            title: 'Application Funnel Stages',
            columns: [
              { key: 'status', label: 'Stage' },
              { key: 'count', label: 'Count' },
              {
                key: 'percentage',
                label: 'Percentage',
                render: (item) => `${item.percentage || 0}%`,
              },
            ],
            data: summary.funnelStats,
          });
        }
        if (summary.conversionByCategory?.length > 0) {
          tables.push({
            title: 'Conversion Rates by Category',
            columns: [
              { key: 'category', label: 'Category' },
              { key: 'totalApplications', label: 'Total Applications' },
              { key: 'shortlistedCount', label: 'Shortlisted' },
              { key: 'hiredCount', label: 'Hired' },
              {
                key: 'hireRate',
                label: 'Hire Rate',
                render: (item) => `${item.hireRate || 0}%`,
              },
            ],
            data: summary.conversionByCategory,
          });
        }
        break;
    }

    if (tables.length === 0) {
      return (
        <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-dark-surface">
          <FaFileAlt className="mx-auto mb-4 text-4xl text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            No detailed data available for this report
          </p>
        </div>
      );
    }

    return tables.map((table, index) => (
      <div key={index} className="mb-8">
        <h3 className="mb-4 flex items-center text-lg font-semibold text-light-text dark:text-dark-text">
          {index === 0 ? (
            <FaChartBar className="mr-2 text-light-primary dark:text-dark-primary" />
          ) : (
            <FaChartLine className="mr-2 text-light-primary dark:text-dark-primary" />
          )}
          {table.title}
        </h3>
        <div className="overflow-hidden rounded-lg bg-light-surface shadow dark:bg-dark-surface">
          <Table columns={table.columns} data={table.data} />
        </div>
      </div>
    ));
  };

  // Render different chart types based on report
  const renderCharts = () => {
    const chartData = prepareChartData();
    if (!chartData || chartData.length === 0) return null;

    switch (reportType) {
      case 'financial':
        return (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EB0E3" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0EB0E3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  tick={{ fill: '#888' }}
                  tickLine={{ stroke: '#888' }}
                />
                <YAxis
                  stroke="#888"
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fill: '#888' }}
                  tickLine={{ stroke: '#888' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#0EB0E3"
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="platformFee"
                  name="Platform Fee"
                  stroke="#3946AE"
                  fill="#3946AE"
                  fillOpacity={0.3}
                  activeDot={{ r: 8 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case 'interview-analytics':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="scheduled"
                  stroke="#0EB0E3"
                  strokeWidth={2}
                  name="Scheduled"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#3946AE"
                  strokeWidth={2}
                  name="Completed"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'application-funnel':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
                <XAxis
                  dataKey="date"
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
                <Line
                  type="monotone"
                  dataKey="applications"
                  name="Applications"
                  stroke="#FF8042"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'user-activity':
      case 'job-performance':
      default: {
        const dataKey =
          reportType === 'user-activity' ? 'registrations' : 'jobsPosted';
        const name =
          reportType === 'user-activity' ? 'Registrations' : 'Jobs Posted';

        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
                <XAxis
                  dataKey="date"
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
                  dataKey={dataKey}
                  name={name}
                  fill="#0EB0E3"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`#0EB0E3${index % 2 ? 'cc' : 'ff'}`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>
          Analytics & Reports [Admin] - OptaHire | Platform Insights
        </title>
        <meta
          name="description"
          content="OptaHire Analytics & Reports - Generate comprehensive reports and insights on platform performance, user activity, and recruitment metrics."
        />
        <meta
          name="keywords"
          content="OptaHire Reports, Recruitment Analytics, Platform Insights, Performance Reports, Admin Analytics"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn flex-col items-center bg-light-background px-4 py-24 dark:bg-dark-background">
        <div className="mx-auto w-full max-w-7xl">
          <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
            Analytics &{' '}
            <span className="text-light-primary dark:text-dark-primary">
              Reports
            </span>
          </h1>
          <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
            Generate comprehensive insights and reports on platform performance,
            user engagement, and recruitment success.
          </p>

          {/* Error Handling */}
          {error && (
            <Alert
              message={
                error?.data?.message ||
                error?.message ||
                'An error occurred while generating the report'
              }
              isSuccess={false}
            />
          )}

          {/* Report Configuration */}
          <div className="mb-8 overflow-hidden rounded-xl bg-light-surface shadow-md dark:bg-dark-surface">
            <div className="border-b border-light-border px-6 py-4 dark:border-dark-border">
              <div className="flex items-center gap-3">
                <FaFilter className="text-light-primary dark:text-dark-primary" />
                <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
                  Report Configuration
                </h2>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-6 p-6 md:flex-row">
              {/* Report Type */}
              <InputField
                id="reportType"
                type="select"
                label="Report Type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                options={reportOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
              />

              {/* Start Date */}
              <InputField
                id="startDate"
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
                icon={FaCalendarAlt}
              />

              {/* End Date */}
              <InputField
                id="endDate"
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                disabled={isLoading}
                icon={FaCalendarAlt}
              />

              {/* Generate Button */}
              <button
                onClick={generateReport}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-light-primary px-4 py-2 font-medium text-white transition-all hover:bg-light-primary/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-primary dark:hover:bg-dark-primary/90"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FaChartBar />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="mx-auto w-full max-w-sm animate-fadeIn sm:max-w-md">
              <Loader />
            </div>
          )}

          {/* Report Results */}
          {reportData && !isLoading && (
            <div className="animate-fadeIn space-y-8">
              {/* Report Header with Download */}
              <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-light-surface p-6 shadow-md dark:bg-dark-surface sm:flex-row">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                    {reportData.reportType}
                  </h2>
                  <p className="mt-1 text-light-text/70 dark:text-dark-text/70">
                    Period:{' '}
                    {formatDate(new Date(reportData.dateRange.startDate))} -{' '}
                    {formatDate(new Date(reportData.dateRange.endDate))}
                  </p>
                  <p className="text-sm text-light-text/60 dark:text-dark-text/60">
                    Generated: {formatDate(new Date())}
                  </p>
                </div>
                <div>
                  <PDFDownloadLink
                    document={
                      <ReportPDF
                        reportData={reportData}
                        startDate={startDate}
                        endDate={endDate}
                      />
                    }
                    fileName={`OptaHire_${reportData.reportType.replace(/\s+/g, '_')}_${startDate}_${endDate}.pdf`}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-all hover:bg-green-700"
                    onClick={() =>
                      trackEvent(
                        'Download PDF Report',
                        'Admin Action',
                        `Downloaded ${reportType} report as PDF`
                      )
                    }
                  >
                    {({ loading }) => (
                      <>
                        {loading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <FaDownload />
                        )}
                        {loading ? 'Preparing PDF...' : 'Download PDF'}
                      </>
                    )}
                  </PDFDownloadLink>
                </div>
              </div>

              {/* Key Metrics Cards */}
              <div className="mb-8">{renderMetricCards()}</div>

              {/* Trends Chart */}
              <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                <h3 className="mb-4 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                  <FaChartLine className="mr-2 text-light-primary dark:text-dark-primary" />
                  {reportType === 'financial'
                    ? 'Monthly Revenue Trend'
                    : reportType === 'interview-analytics'
                      ? 'Monthly Interview Volume'
                      : reportType === 'application-funnel'
                        ? 'Application Monthly Trends'
                        : reportType === 'user-activity'
                          ? 'User Registration Trends'
                          : 'Job Posting Trends'}
                </h3>
                {renderCharts()}
              </div>

              {/* Detailed Analytics Tables */}
              <div className="rounded-xl bg-light-surface p-6 shadow-md transition-all hover:shadow-lg dark:bg-dark-surface">
                <h3 className="mb-6 flex items-center text-xl font-bold text-light-text dark:text-dark-text">
                  <FaChartBar className="mr-2 text-light-primary dark:text-dark-primary" />
                  Detailed Analytics
                </h3>
                {renderDataTables()}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!reportData && !isLoading && (
            <div className="rounded-xl bg-light-surface p-12 text-center shadow-md dark:bg-dark-surface">
              <FaFileAlt className="mx-auto mb-4 text-6xl text-light-text/20 dark:text-dark-text/20" />
              <h3 className="mb-2 text-xl font-semibold text-light-text dark:text-dark-text">
                No Report Generated
              </h3>
              <p className="text-light-text/70 dark:text-dark-text/70">
                Select your report type and date range above, then click
                &quot;Generate Report&quot; to view comprehensive analytics
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
