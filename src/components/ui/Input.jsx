/**
 * Reusable Input — web version
 * @param {string} label
 * @param {string} error
 * @param {React.ReactNode} icon - Left icon
 * @param {'text'|'email'|'password'|'number'|'tel'} type
 * @param {'sm'|'md'} size
 * @param {boolean} fullWidth
 */
export default function Input({
  label,
  error,
  icon,
  type = 'text',
  hint,
  fullWidth = true,
  style = {},
  ...rest
}) {
  return (
    <div className="form-group" style={style}>
      {label && <label className="label">{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '0.75rem', top: '50%',
            transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none',
          }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          className={`input ${error ? 'error' : ''}`}
          style={{
            paddingLeft: icon ? '2.25rem' : undefined,
            width: fullWidth ? '100%' : undefined,
          }}
          {...rest}
        />
      </div>
      {error && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>{hint}</p>}
    </div>
  );
}
