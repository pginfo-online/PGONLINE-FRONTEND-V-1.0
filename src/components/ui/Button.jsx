import { Loader2 } from 'lucide-react';

/**
 * Reusable Button — web version
 * @param {'primary'|'secondary'|'danger'|'success'|'ghost'|'outline'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading
 * @param {boolean} fullWidth
 * @param {React.ReactNode} icon
 */
export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  type = 'button',
  style = {},
}) {
  const sizeClass = { sm: 'btn-sm', md: '', lg: 'btn-lg' }[size];
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    ghost: 'btn-secondary',
    outline: 'btn-secondary',
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variantClass} ${sizeClass}`}
      style={{ width: fullWidth ? '100%' : undefined, justifyContent: fullWidth ? 'center' : undefined, ...style }}
    >
      {loading ? <Loader2 size={16} className="spin" /> : icon}
      {children}
    </button>
  );
}
