import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaSort,
  FaSortDown,
  FaSortUp,
  FaTimes,
} from 'react-icons/fa';

export default function Table({ columns, data, actions }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const PAGE_SIZE = 10;

  // Auto-detect if column should be sortable (avoid sorting complex renders with buttons/links)
  const enhancedColumns = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      sortable:
        column.sortable !== false &&
        !column.render?.toString().includes('button') &&
        !column.render?.toString().includes('onClick'),
    }));
  }, [columns]);

  // Search functionality - searches across all columns
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) =>
      enhancedColumns.some((column) => {
        try {
          const value = column.render ? column.render(row) : row[column.key];
          // Handle React elements and complex renders
          const searchableValue =
            typeof value === 'object' && value?.props?.children
              ? String(value.props.children)
              : String(value);
          return searchableValue
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        } catch {
          return false;
        }
      })
    );
  }, [data, searchTerm, enhancedColumns]);

  // Sorting functionality with intelligent type detection
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const column = enhancedColumns.find((col) => col.key === sortConfig.key);

      let aValue = column.render ? column.render(a) : a[sortConfig.key];
      let bValue = column.render ? column.render(b) : b[sortConfig.key];

      // Handle React elements by extracting text content
      if (typeof aValue === 'object' && aValue?.props?.children) {
        aValue = String(aValue.props.children);
      }
      if (typeof bValue === 'object' && bValue?.props?.children) {
        bValue = String(bValue.props.children);
      }

      // Convert to strings for comparison
      aValue = String(aValue);
      bValue = String(bValue);

      // Auto-detect dates
      const isDate = /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/.test(aValue);
      if (isDate) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      // Auto-detect numbers
      else if (
        !isNaN(aValue) &&
        !isNaN(bValue) &&
        aValue !== '' &&
        bValue !== ''
      ) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      // Handle strings (case-insensitive)
      else {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, enhancedColumns]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Pagination helpers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Sorting handler
  const handleSort = (columnKey) => {
    const column = enhancedColumns.find((col) => col.key === columnKey);
    if (!column.sortable) return;

    setSortConfig((prevConfig) => {
      if (prevConfig.key === columnKey) {
        if (prevConfig.direction === 'asc')
          return { key: columnKey, direction: 'desc' };
        if (prevConfig.direction === 'desc')
          return { key: null, direction: null };
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  // Get sort icon for column
  const getSortIcon = (columnKey) => {
    const column = enhancedColumns.find((col) => col.key === columnKey);
    if (!column.sortable) return null;

    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'asc' ? (
        <FaSortUp className="text-light-primary dark:text-dark-primary" />
      ) : (
        <FaSortDown className="text-light-primary dark:text-dark-primary" />
      );
    }
    return <FaSort className="opacity-50 group-hover:opacity-75" />;
  };

  // Reset pagination when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Generate smart page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    // Show fewer pages on small screens
    const showPages = window.innerWidth < 640 ? 3 : 5;

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= Math.ceil(showPages / 2)) {
        for (let i = 1; i <= showPages; i++) {
          pages.push(i);
        }
      } else if (currentPage > totalPages - Math.floor(showPages / 2)) {
        for (let i = totalPages - showPages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const offset = Math.floor(showPages / 2);
        for (let i = currentPage - offset; i <= currentPage + offset; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  // Render mobile card view for each row
  const renderMobileCard = (row, rowIndex) => (
    <div
      key={row.id || `row-${startIndex + rowIndex}`}
      className="mb-4 animate-slideUp rounded-lg border border-light-border bg-light-background p-4 shadow-sm dark:border-dark-border dark:bg-dark-background"
      style={{ animationDelay: `${rowIndex * 0.05}s` }}
    >
      {enhancedColumns.map((col) => (
        <div key={col.key} className="mb-2 flex flex-col py-1">
          <span className="text-xs font-semibold uppercase text-light-text/70 dark:text-dark-text/70">
            {col.label}
          </span>
          <span className="text-sm text-light-text dark:text-dark-text">
            {col.render ? col.render(row) : row[col.key]}
          </span>
        </div>
      ))}
      {actions && (
        <div className="mt-3 flex items-center justify-end space-x-2 border-t border-light-border pt-3 dark:border-dark-border">
          {actions.map((action, index) => (
            <span key={index} onClick={() => action.onClick(row)}>
              {action.render ? action.render(row) : null}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-fadeIn rounded-xl border border-light-border bg-light-background shadow-lg dark:border-dark-border dark:bg-dark-background">
      <div className="rounded-t-xl border-b border-light-border bg-light-surface/30 p-4 dark:border-dark-border dark:bg-dark-surface/30">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <FaSearch className="h-4 w-4 text-light-text/50 dark:text-dark-text/50" />
          </div>
          <input
            type="text"
            placeholder="Search across all fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-light-border bg-light-background py-2.5 pl-10 pr-3 text-sm text-light-text placeholder-light-text/50 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-light-primary dark:border-dark-border dark:bg-dark-background dark:text-dark-text dark:placeholder-dark-text/50 dark:focus:ring-dark-primary"
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                onClick={() => setSearchTerm('')}
                className="text-light-text/50 hover:text-light-text dark:text-dark-text/50 dark:hover:text-dark-text"
              >
                <FaTimes className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-xs text-light-text/70 dark:text-dark-text/70">
            Found {filteredData.length} result
            {filteredData.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block">
        <div className="max-h-[600px] overflow-auto">
          <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
            <thead className="sticky top-0 z-10 bg-light-surface dark:bg-dark-surface">
              <tr>
                {enhancedColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`group px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light-text transition-all duration-200 dark:text-dark-text ${col.sortable ? 'cursor-pointer select-none hover:bg-light-border/20 dark:hover:bg-dark-border/20' : ''}`}
                    onClick={() => handleSort(col.key)}
                    title={col.sortable ? 'Click to sort' : ''}
                  >
                    <div className="flex items-center justify-between">
                      <span className="transition-colors group-hover:text-light-primary dark:group-hover:text-dark-primary">
                        {col.label}
                      </span>
                      <div className="ml-2">{getSortIcon(col.key)}</div>
                    </div>
                  </th>
                ))}
                {actions && (
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light-text dark:text-dark-text">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border bg-light-background dark:divide-dark-border dark:bg-dark-background">
              {paginatedData && paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={row.id || `row-${startIndex + rowIndex}`}
                    className="animate-slideUp transition-colors duration-200 hover:bg-light-surface/50 hover:dark:bg-dark-surface/50"
                    style={{ animationDelay: `${rowIndex * 0.05}s` }}
                  >
                    {enhancedColumns.map((col) => (
                      <td
                        key={col.key}
                        className="px-6 py-4 text-sm text-light-text dark:text-dark-text"
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-start space-x-2">
                          {actions.map((action, index) => (
                            <span
                              key={index}
                              onClick={() => action.onClick(row)}
                            >
                              {action.render ? action.render(row) : null}
                            </span>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-6 py-16 text-center text-light-text dark:text-dark-text"
                    colSpan={enhancedColumns.length + (actions ? 1 : 0)}
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface">
                        <FaSearch className="h-6 w-6 text-light-text/30 dark:text-dark-text/30" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">
                          {searchTerm
                            ? 'No matching results'
                            : 'No records found'}
                        </p>
                        <p className="mt-1 text-sm text-light-text/60 dark:text-dark-text/60">
                          {searchTerm
                            ? `Try adjusting your search for "${searchTerm}"`
                            : 'No data available to display'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - Shown only on mobile */}
      <div className="md:hidden">
        <div className="p-4">
          {paginatedData && paginatedData.length > 0 ? (
            paginatedData.map((row, rowIndex) =>
              renderMobileCard(row, rowIndex)
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface">
                <FaSearch className="h-6 w-6 text-light-text/30 dark:text-dark-text/30" />
              </div>
              <p className="mt-4 text-lg font-medium text-light-text dark:text-dark-text">
                {searchTerm ? 'No matching results' : 'No records found'}
              </p>
              <p className="mt-1 text-sm text-light-text/60 dark:text-dark-text/60">
                {searchTerm
                  ? `Try adjusting your search for "${searchTerm}"`
                  : 'No data available to display'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination - Always Enabled for datasets > PAGE_SIZE */}
      {totalPages > 1 ? (
        <div className="rounded-b-xl border-t border-light-border bg-light-surface/30 px-4 py-3 dark:border-dark-border dark:bg-dark-surface/30">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {/* Page Info */}
            <div className="text-sm text-light-text/70 dark:text-dark-text/70">
              <span className="hidden sm:inline">Showing </span>
              <span className="font-medium text-light-text dark:text-dark-text">
                {startIndex + 1}
              </span>
              <span className="hidden sm:inline"> to </span>
              <span className="sm:hidden">-</span>
              <span className="font-medium text-light-text dark:text-dark-text">
                {Math.min(endIndex, sortedData.length)}
              </span>
              <span className="hidden sm:inline"> of </span>
              <span className="sm:hidden">/</span>
              <span className="font-medium text-light-text dark:text-dark-text">
                {sortedData.length}
              </span>
              {searchTerm && (
                <span className="ml-2 text-xs font-medium text-light-primary dark:text-dark-primary">
                  (Filtered from {data.length})
                </span>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center space-x-1">
              {/* First Page - Hidden on small screens */}
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="hidden rounded-lg border border-light-border p-2 text-light-text transition-all duration-200 hover:border-light-primary hover:bg-light-surface disabled:cursor-not-allowed disabled:opacity-30 dark:border-dark-border dark:text-dark-text dark:hover:border-dark-primary dark:hover:bg-dark-surface sm:block"
                title="First page"
              >
                <FaAngleDoubleLeft className="h-3 w-3" />
              </button>

              {/* Previous Page */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="rounded-lg border border-light-border p-2 text-light-text transition-all duration-200 hover:border-light-primary hover:bg-light-surface disabled:cursor-not-allowed disabled:opacity-30 dark:border-dark-border dark:text-dark-text dark:hover:border-dark-primary dark:hover:bg-dark-surface"
                title="Previous page"
              >
                <FaChevronLeft className="h-3 w-3" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'border-light-primary bg-light-primary text-white shadow-sm dark:border-dark-primary dark:bg-dark-primary'
                        : 'border-light-border text-light-text hover:border-light-primary hover:bg-light-surface dark:border-dark-border dark:text-dark-text dark:hover:border-dark-primary dark:hover:bg-dark-surface'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              {/* Next Page */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-light-border p-2 text-light-text transition-all duration-200 hover:border-light-primary hover:bg-light-surface disabled:cursor-not-allowed disabled:opacity-30 dark:border-dark-border dark:text-dark-text dark:hover:border-dark-primary dark:hover:bg-dark-surface"
                title="Next page"
              >
                <FaChevronRight className="h-3 w-3" />
              </button>

              {/* Last Page - Hidden on small screens */}
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="hidden rounded-lg border border-light-border p-2 text-light-text transition-all duration-200 hover:border-light-primary hover:bg-light-surface disabled:cursor-not-allowed disabled:opacity-30 dark:border-dark-border dark:text-dark-text dark:hover:border-dark-primary dark:hover:bg-dark-surface sm:block"
                title="Last page"
              >
                <FaAngleDoubleRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-b-xl border-t border-light-border bg-light-surface/30 px-4 py-3 dark:border-dark-border dark:bg-dark-surface/30">
          <div className="text-sm text-light-text/70 dark:text-dark-text/70">
            {searchTerm
              ? `Showing ${filteredData.length} result${filteredData.length !== 1 ? 's' : ''}`
              : 'No pagination available for single page of results'}
          </div>
        </div>
      )}
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
      sortable: PropTypes.bool,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      onClick: PropTypes.func.isRequired,
      render: PropTypes.func.isRequired,
    })
  ),
};
