import PropTypes from 'prop-types';

export default function Table({ columns, data, actions }) {
  return (
    <div className="overflow-auto bg-light-background dark:bg-dark-background rounded-xl shadow-lg animate-fadeIn border border-light-border dark:border-dark-border">
      <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
        <thead className="bg-light-surface dark:bg-dark-surface">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4 text-left text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-4 text-left text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-light-background dark:bg-dark-background divide-y divide-light-border dark:divide-dark-border">
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="hover:bg-light-surface/50 hover:dark:bg-dark-surface/50 transition-colors duration-200 animate-slideUp"
                style={{ animationDelay: `${rowIndex * 0.05}s` }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-light-text dark:text-dark-text"
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {actions.map((action, index) => (
                        <span key={index} onClick={() => action.onClick(row)}>
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
                className="px-6 py-12 text-center text-light-text dark:text-dark-text"
                colSpan={columns.length + (actions ? 1 : 0)}
              >
                <div className="flex flex-col items-center justify-center">
                  <p className="text-lg font-medium">No records found</p>
                  <p className="text-sm text-light-text/60 dark:text-dark-text/60">
                    Try adjusting your search or filters
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
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
