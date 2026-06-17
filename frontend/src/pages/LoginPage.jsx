import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import { Compass, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect target after successful login
  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center space-x-2 mb-6 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 group-hover:scale-105 transition-transform">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            TripNest
          </span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold font-sans" style={{ color: 'rgb(var(--text-primary))' }}>
          {t('auth.loginTitle')}
        </h2>
        <p className="mt-2 text-center text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
            {t('auth.registerLink')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('auth.email')}
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`w-full px-4 py-2.5 rounded-xl border glass-input ${
                    errors.email ? 'border-rose-500/50 focus:border-rose-500/50' : ''
                  }`}
                  placeholder="name@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-450">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`w-full px-4 py-2.5 rounded-xl border glass-input pr-10 ${
                    errors.password ? 'border-rose-500/50 focus:border-rose-500/50' : ''
                  }`}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-450">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>{t('auth.loggingIn')}</span>
                  </>
                ) : (
                  <span>{t('auth.loginButton')}</span>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
