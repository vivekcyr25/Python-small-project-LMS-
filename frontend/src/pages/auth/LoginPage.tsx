import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import useAuthStore from '../../stores/authStore';
import api from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LogIn, Phone, ChevronDown } from 'lucide-react';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import PhoneOtpLogin from '../../components/auth/PhoneOtpLogin';
import { isFirebaseMockMode } from '../../lib/firebase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);

  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (!token || !user) return;
    if (user.role === 'student') navigate('/student/dashboard', { replace: true });
    else if (user.role === 'instructor') navigate('/instructor/dashboard', { replace: true });
    else if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
    else navigate('/courses', { replace: true });
  }, [token, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      setToken(access_token);
      setUser(user);
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'instructor') navigate('/instructor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#030712] text-white overflow-hidden relative aurora-bg">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 p-4"
      >
        <Card className="glass-card border border-white/10 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Sparkles size={24} className="text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white">Welcome back</CardTitle>
            <CardDescription className="text-slate-400">Continue your learning journey</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* ── Email / Password form ── */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-400"
                >
                  {error}
                </motion.p>
              )}
              <Button
                type="submit"
                variant="gradient"
                className="w-full flex items-center gap-2"
                disabled={loading}
              >
                <LogIn size={16} />
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            {/* OAuth outside form — prevents accidental form submit / page reload */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-500 whitespace-nowrap">or continue with</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {isFirebaseMockMode() && (
                <p className="text-xs text-amber-400/90 text-center bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  Dev mode: Google and Phone OTP use mock auth. See docs/FIREBASE_SETUP.md for real Firebase.
                </p>
              )}

              <GoogleLoginButton />

              <div>
                <button
                  type="button"
                  onClick={() => setShowPhoneOtp((v) => !v)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors py-1"
                >
                  <Phone size={14} />
                  Login with Phone OTP
                  <motion.span
                    animate={{ rotate: showPhoneOtp ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={14} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {showPhoneOtp && (
                    <motion.div
                      key="phone-otp"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4">
                        <PhoneOtpLogin />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
