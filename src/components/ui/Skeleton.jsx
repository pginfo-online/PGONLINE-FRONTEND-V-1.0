/**
 * Reusable Skeleton components for web loading states
 */

/** Inline skeleton block */
export function Skeleton({ width, height = 16, borderRadius = 6, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width: width || '100%', height, borderRadius, ...style }}
    />
  );
}

/** Skeleton for a table row */
export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '0.875rem 1rem' }}>
          <Skeleton height={15} width={i === 0 ? '60%' : '80%'} />
        </td>
      ))}
    </tr>
  );
}

/** Skeleton for a PG card */
export function PGCardSkeleton() {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <Skeleton height={160} borderRadius={0} />
      <div style={{ padding: '1rem' }}>
        <Skeleton width="55%" height={18} style={{ marginBottom: 8 }} />
        <Skeleton width="75%" height={14} style={{ marginBottom: 12 }} />
        <Skeleton width="40%" height={20} />
      </div>
    </div>
  );
}

/** Skeleton for a stat card */
export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <Skeleton width={48} height={48} borderRadius={12} />
      <div style={{ flex: 1 }}>
        <Skeleton width="50%" height={32} style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height={16} />
      </div>
    </div>
  );
}

export default Skeleton;
