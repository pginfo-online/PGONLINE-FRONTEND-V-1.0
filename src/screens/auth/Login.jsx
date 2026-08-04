import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Eye, EyeOff, ArrowRight, Key, Mail, Phone, User, ShieldCheck } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import authService from '../../services/auth.service';

const RESEND_COOLDOWN = 60;

const normalizeIdentifier = (value) => {
  const trimmed = value.trim();
  if (/^\S+@\S+\.\S+$/.test(trimmed)) {
    return { type: 'email', value: trimmed.toLowerCase() };
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return { type: 'phone', value: digits };
  }
  return { type: null, value: trimmed };
};

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  // Mode state: 'otp' or 'password'
  const [authMode, setAuthMode] = useState('otp'); 

  // --- Password Flow State ---
  const [passForm, setPassForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // --- OTP Flow State ---
  const [otpStep, setOtpStep] = useState('identifier'); // 'identifier' | 'otp' | 'register'
  const [contactInput, setContactInput] = useState('');
  const [otpVal, setOtpVal] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  // --- Registration Onboarding State ---
  const [regForm, setRegForm] = useState({ name: '', phone: '', tempToken: '' });
  const [regLoading, setRegLoading] = useState(false);

  const { type: inputType, value: normalizedContact } = normalizeIdentifier(contactInput);

  // Resend Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passForm.email || !passForm.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setPassLoading(true);
    try {
      const { user, token } = await authService.login(passForm);
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      
      // Redirect by role
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'owner') navigate('/owner/dashboard');
      else navigate('/explore');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!inputType) {
      toast.error('Please enter a valid email address or 10-digit mobile number');
      return;
    }
    setOtpLoading(true);
    try {
      await authService.sendOtpUnified(normalizedContact, inputType);
      setOtpStep('otp');
      setResendTimer(RESEND_COOLDOWN);
      toast.success('Verification code sent successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to send verification code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpVal.length < 4) {
      toast.error('Please enter the complete 4-digit code');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await authService.verifyOtpUnified(normalizedContact, otpVal);
      if (res.isNewUser) {
        setRegForm({
          name: '',
          phone: inputType === 'phone' ? normalizedContact : '',
          tempToken: res.tempToken,
        });
        setOtpStep('register');
        toast.success('Onboarding: Please enter your details');
      } else {
        setAuth(res.user, res.token);
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate(res.user.role === 'admin' ? '/admin/dashboard' : res.user.role === 'owner' ? '/owner/dashboard' : '/explore');
      }
    } catch (err) {
      toast.error(err.message || 'OTP verification failed');
      setOtpVal('');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!regForm.name.trim() || regForm.name.trim().length < 2) {
      toast.error('Please enter your full name (minimum 2 characters)');
      return;
    }
    setRegLoading(true);
    try {
      const { user, token } = await authService.completeRegistration({
        tempToken: regForm.tempToken,
        name: regForm.name.trim(),
        phone: regForm.phone.trim() || undefined,
      });
      setAuth(user, token);
      toast.success(`Account created! Welcome, ${user.name}!`);
      navigate('/explore');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  const resetOtpFlow = () => {
    setOtpStep('identifier');
    setContactInput('');
    setOtpVal('');
    setResendTimer(0);
    clearTimeout(timerRef.current);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #021734 0%, #0a2540 50%, #000c1d 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'rgba(59,130,246,0.08)', top: -150, right: -100, pointerEvents: 'none', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(147,51,234,0.06)', bottom: -100, left: -50, pointerEvents: 'none', filter: 'blur(80px)' }} />

      <div style={{
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 24,
        padding: '2.5rem',
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Brand Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Building2 size={32} color="white" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">PGinfo.online</h1>
          <p className="text-sm text-brand-text-muted mt-1.5">Connecting PGs and tenants seamlessly</p>
        </div>

        {/* Tab Selector */}
        {otpStep !== 'register' && (
          <div className="flex bg-slate-100/80 p-1.5 rounded-xl mb-8">
            <button
              onClick={() => { setAuthMode('otp'); resetOtpFlow(); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                authMode === 'otp' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Passwordless OTP
            </button>
            <button
              onClick={() => setAuthMode('password')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                authMode === 'password' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Password Sign-in
            </button>
          </div>
        )}

        {authMode === 'otp' ? (
          /* OTP Flow */
          <div>
            {otpStep === 'identifier' && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address or Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="input w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border focus:border-brand-primary outline-none text-slate-950 font-medium"
                      placeholder="e.g. you@example.com or 9876543210"
                      value={contactInput}
                      onChange={(e) => setContactInput(e.target.value)}
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      {/^\d+$/.test(contactInput.trim()) ? <Phone size={18} /> : <Mail size={18} />}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full btn btn-primary justify-center py-3 text-base font-semibold shadow-lg shadow-blue-500/20"
                  style={{ borderRadius: 12 }}
                >
                  {otpLoading ? 'Sending OTP...' : (
                    <span className="flex items-center gap-1.5">Send OTP <ArrowRight size={18} /></span>
                  )}
                </button>
              </form>
            )}

            {otpStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Enter Verification Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={4}
                      className="input w-full text-center tracking-[1em] text-xl font-extrabold py-2.5 rounded-xl border border-brand-border outline-none text-slate-950"
                      placeholder="••••"
                      value={otpVal}
                      onChange={(e) => setOtpVal(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <p className="text-xs text-brand-text-muted mt-2">
                    Enter the 4-digit code sent to <strong className="text-slate-800">{contactInput}</strong>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otpVal.length < 4}
                  className="w-full btn btn-primary justify-center py-3 text-base font-semibold"
                  style={{ borderRadius: 12 }}
                >
                  {otpLoading ? 'Verifying...' : 'Verify & Log In'}
                </button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={resetOtpFlow}
                    className="text-brand-primary font-bold hover:underline"
                  >
                    Change Email/Phone
                  </button>

                  <button
                    type="button"
                    disabled={resendTimer > 0 || otpLoading}
                    onClick={handleSendOtp}
                    className={`font-bold ${resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-brand-primary hover:underline'}`}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}

            {otpStep === 'register' && (
              <form onSubmit={handleCompleteRegistration} className="space-y-4">
                <div className="text-center pb-2">
                  <span className="inline-flex p-2 bg-blue-50 text-brand-primary rounded-full mb-1">
                    <ShieldCheck size={24} />
                  </span>
                  <h3 className="font-bold text-slate-900">Finish Setting Up Profile</h3>
                  <p className="text-xs text-slate-500">Provide details to finalize registration</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="input w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border outline-none text-slate-950 font-semibold"
                      placeholder="e.g. Rahul Sharma"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      required
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={18} />
                    </div>
                  </div>
                </div>

                {inputType !== 'phone' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="input w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border outline-none text-slate-950 font-semibold"
                        placeholder="e.g. 9876543210"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value.replace(/\D/g, '') })}
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Phone size={18} />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full btn btn-primary justify-center py-3 text-base font-semibold"
                  style={{ borderRadius: 12 }}
                >
                  {regLoading ? 'Saving...' : 'Complete Profile & Log In'}
                </button>

                <button
                  type="button"
                  onClick={resetOtpFlow}
                  className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 mt-2"
                >
                  Cancel and start over
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Password Sign-in Flow */
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="input w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border focus:border-brand-primary outline-none text-slate-950 font-semibold"
                  placeholder="you@example.com"
                  value={passForm.email}
                  onChange={(e) => setPassForm({ ...passForm, email: e.target.value })}
                  required
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input w-full pl-10 pr-10 py-2.5 rounded-xl border border-brand-border focus:border-brand-primary outline-none text-slate-950 font-semibold"
                  placeholder="Your password"
                  value={passForm.password}
                  onChange={(e) => setPassForm({ ...passForm, password: e.target.value })}
                  required
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Key size={18} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full btn btn-primary justify-center py-3 text-base font-semibold shadow-lg shadow-blue-500/20"
              style={{ borderRadius: 12 }}
            >
              {passLoading ? 'Signing in...' : (
                <span className="flex items-center gap-1.5">Sign In <ArrowRight size={18} /></span>
              )}
            </button>
          </form>
        )}

        <div className="text-center border-t border-brand-border pt-5 mt-8">
          <p className="text-xs text-brand-text-muted leading-relaxed">
            By signing in, you agree to our <br/><a href="/terms" className="text-slate-800 font-bold hover:underline">Terms of Service</a> & <a href="/privacy" className="text-slate-800 font-bold hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
