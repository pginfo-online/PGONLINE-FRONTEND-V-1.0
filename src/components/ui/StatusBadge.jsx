/**
 * Reusable StatusBadge — maps PG/user status to colored badges
 * @param {'pending'|'approved'|'rejected'|'verified'|'active'|'suspended'|'primary'} status
 * @param {string} label - Override label (defaults to status)
 * @param {'sm'|'md'} size
 */
export function StatusBadge({ status, label, size = 'sm' }) {
  const map = {
    pending:   { cls: 'badge-pending',  icon: '⏳' },
    approved:  { cls: 'badge-approved', icon: '✓' },
    rejected:  { cls: 'badge-rejected', icon: '✕' },
    verified:  { cls: 'badge-verified', icon: '🔵' },
    active:    { cls: 'badge-approved', icon: '●' },
    suspended: { cls: 'badge-rejected', icon: '●' },
    primary:   { cls: 'badge-primary',  icon: '' },
    owner:     { cls: 'badge-primary',  icon: '' },
    tenant:    { cls: 'badge-approved', icon: '' },
  };
  const cfg = map[status] || map.primary;
  const text = label || (status ? status.charAt(0).toUpperCase() + status.slice(1) : '');

  return (
    <span className={`badge ${cfg.cls}`} style={{ fontSize: size === 'sm' ? '0.6875rem' : '0.8125rem' }}>
      {text}
    </span>
  );
}

/**
 * VerifiedBadge — special badge for verified PGs
 */
export function VerifiedBadge() {
  return (
    <span className="badge badge-verified" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      Verified
    </span>
  );
}

export default StatusBadge;
