/**
 * Reusable Card — general content card
 */
export function Card({ children, className = '', style = {}, onClick }) {
  return (
    <div
      className={`card ${onClick ? 'card-hover' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * StatCard — used in dashboards for KPI display
 * @param {React.ElementType} icon - Lucide icon component
 * @param {string} label
 * @param {string|number} value
 * @param {string} sub
 * @param {string} color - hex or CSS color
 */
export function StatCard({ icon: Icon, label, value, sub, color = '#4f46e5' }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '1a' }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', lineHeight: 1 }}>
          {value ?? <div className="skeleton" style={{ height: 32, width: 64 }} />}
        </div>
        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginTop: '0.25rem' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.125rem' }}>{sub}</div>}
      </div>
    </div>
  );
}

export default Card;
