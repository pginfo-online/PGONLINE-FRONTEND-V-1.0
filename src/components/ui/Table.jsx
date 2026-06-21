import { TableRowSkeleton } from './Skeleton';

/**
 * Reusable Table component
 * @param {string[]} columns - Column header labels
 * @param {string[]} keys - Matching data keys (optional, for simple cases)
 * @param {Array} data - Row data
 * @param {function} renderRow - Custom row renderer: (row, index) => <tr>
 * @param {boolean} loading
 * @param {number} skeletonRows
 * @param {string} emptyMessage
 */
export default function Table({
  columns = [],
  data = [],
  renderRow,
  loading = false,
  skeletonRows = 5,
  emptyMessage = 'No data found',
}) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={typeof col === 'string' ? col : col.key}>{typeof col === 'string' ? col : col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRowSkeleton key={i} cols={columns.length} />
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => renderRow(row, i))
          )}
        </tbody>
      </table>
    </div>
  );
}
