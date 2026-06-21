import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import authService from '../../services/auth.service';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await authService.login(form);
      if (user.role === 'tenant') {
        toast.error('Tenant access is mobile only. Please use the app.');
        return;
      }
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/owner/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      {/* Background blur circles */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'rgba(129,140,248,0.08)', top: -150, right: -100, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(167,139,250,0.06)', bottom: -100, left: -50, pointerEvents: 'none' }} />

      <div style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 20,
        padding: '2.5rem',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 20px rgba(79,70,229,0.4)',
          }}>
            <Building2 size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>PGinfo.online</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Admin & Owner Portal
          </p>
        </div>

        {/* Demo credentials hint */}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: '2.5rem' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9375rem', borderRadius: 10 }}
          >
            {loading ? 'Signing in...' : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', marginTop: '1.5rem' }}>
          Tenant? Download the PGinfo.online mobile app
        </p>
      </div>
    </div>
  );
}
