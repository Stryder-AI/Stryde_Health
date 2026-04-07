import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { ROLE_HOME_ROUTES } from '@/lib/constants';
import { validateEmail } from '@/lib/validation';

const REMEMBER_EMAIL_KEY = 'stryde-remember-email';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Field-level errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Forgot password modal
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailError, setForgotEmailError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const passwordRef = useRef<HTMLInputElement>(null);

  // Restore remembered email on mount
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  // Validate email field on blur/change (only after first interaction)
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailError) setEmailError(validateEmail(val));
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (passwordError) {
      setPasswordError(val.length < 6 ? 'Password must be at least 6 characters' : null);
    }
  };

  const handlePasswordKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handlePasswordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const validateForm = (): boolean => {
    const eErr = validateEmail(email);
    const pErr = password.length < 6 ? 'Password must be at least 6 characters' : null;
    setEmailError(eErr);
    setPasswordError(pErr);
    return !eErr && !pErr;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(email, password);
      // Persist email if remember me checked
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      const user = useAuthStore.getState().user;
      const homePath = user?.role ? ROLE_HOME_ROUTES[user.role] : '/';
      toast.success(`Welcome back, ${user?.fullName}!`);
      navigate(homePath || '/');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Invalid email or password.';
      toast.error(message);
    }
  };

  // ---- Forgot password handlers ----
  const openForgot = () => {
    setForgotEmail('');
    setForgotEmailError(null);
    setForgotSuccess(false);
    setForgotLoading(false);
    setForgotOpen(true);
  };

  const handleForgotSend = () => {
    const err = validateEmail(forgotEmail);
    setForgotEmailError(err);
    if (err) return;

    setForgotLoading(true);
    // Simulate API call
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess(true);
    }, 1500);
  };

  return (
    <>
      <div className="w-full max-w-[420px] animate-fade-in-scale">
        <div className="glass-elevated p-8 rounded-[var(--radius-xl)] relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--primary)] opacity-10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[var(--accent)] opacity-10 rounded-full blur-3xl" />

          {/* Brand */}
          <div className="text-center mb-8 relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-teal-400 mb-5 shadow-lg shadow-[var(--primary-glow)] hover:scale-105 transition-transform duration-300">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Stryde Health</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5">Intelligent Hospital Management</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <Input
              label="Email address"
              type="email"
              placeholder="you@strydehealth.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={() => setEmailError(validateEmail(email))}
              icon={<Mail className="w-4 h-4" />}
              error={emailError ?? undefined}
              success={!emailError && email.length > 0}
              autoFocus
            />

            <div>
              <Input
                ref={passwordRef}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={() => setPasswordError(password.length < 6 ? 'Password must be at least 6 characters' : null)}
                onKeyUp={handlePasswordKeyUp}
                onKeyDown={handlePasswordKeyDown}
                icon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={passwordError ?? undefined}
              />
              {/* Caps Lock warning */}
              {capsLockOn && !passwordError && (
                <div className="flex items-center gap-1.5 mt-1.5 animate-fade-in">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-500">Caps Lock is on</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--surface-border)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0 transition-all"
                />
                <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors text-[13px]">Remember me</span>
              </label>
              <button
                type="button"
                onClick={openForgot}
                className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium text-[13px] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full group"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              Sign In
              {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-3 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
            <p className="text-[11px] text-[var(--text-tertiary)] mb-2 text-center">Demo Logins <span className="text-[var(--text-tertiary)]">(password: password123)</span></p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Admin', email: 'admin@strydehealth.com' },
                { label: 'Reception', email: 'ayesha@strydehealth.com' },
                { label: 'Doctor', email: 'tariq@strydehealth.com' },
                { label: 'Lab Tech', email: 'hamza@strydehealth.com' },
                { label: 'Pharmacist', email: 'bilal@strydehealth.com' },
              ].map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword('password123');
                    setEmailError(null);
                    setPasswordError(null);
                  }}
                  className="text-[11px] px-2 py-1.5 rounded-md bg-[var(--surface-hover)] hover:bg-[var(--primary-light)] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors text-left truncate"
                >
                  <span className="font-semibold">{cred.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Reset Password"
        description="Enter your work email and we'll send you a password reset link."
        size="sm"
        footer={
          forgotSuccess ? (
            <Button variant="secondary" onClick={() => setForgotOpen(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setForgotOpen(false)} disabled={forgotLoading}>
                Cancel
              </Button>
              <Button onClick={handleForgotSend} loading={forgotLoading}>
                Send Reset Link
              </Button>
            </>
          )
        }
      >
        {forgotSuccess ? (
          <div className="flex flex-col items-center text-center gap-3 py-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Reset link sent!</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Reset link sent to <span className="font-medium text-[var(--primary)]">{forgotEmail}</span>
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">Check your inbox and follow the instructions.</p>
            </div>
          </div>
        ) : (
          <div className="py-1">
            <Input
              label="Work Email"
              type="email"
              placeholder="you@strydehealth.com"
              value={forgotEmail}
              onChange={(e) => {
                setForgotEmail(e.target.value);
                if (forgotEmailError) setForgotEmailError(validateEmail(e.target.value));
              }}
              onBlur={() => setForgotEmailError(validateEmail(forgotEmail))}
              icon={<Mail className="w-4 h-4" />}
              error={forgotEmailError ?? undefined}
              success={!forgotEmailError && forgotEmail.length > 0}
              autoFocus
            />
          </div>
        )}
      </Modal>
    </>
  );
}
