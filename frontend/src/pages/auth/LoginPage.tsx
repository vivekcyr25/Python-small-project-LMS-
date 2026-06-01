import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import useAuthStore from '../../stores/authStore';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { Sparkles, LogIn, GraduationCap, BookOpen, ShieldCheck } from 'lucide-react';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import { isFirebaseMockMode } from '../../lib/firebase';
import { cn } from '../../lib/utils';

type LoginRole = 'student' | 'instructor' | 'admin';

const ROLE_TABS: { key: LoginRole; label: string; Icon: any }[] = [
  { key: 'student',    label: 'Student',    Icon: GraduationCap },
  { key: 'instructor', label: 'Instructor', Icon: BookOpen },
  { key: 'admin',      label: 'Admin',      Icon: ShieldCheck },
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<LoginRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const { access_token, user: u } = response.data;

      // Enforce that the account's actual role matches what was chosen.
      if (u.role !== role) {
        setError(
          `This account is a ${u.role}, not a ${role}. Please pick the right role tab.`
        );
        setLoading(false);
        return;
      }

      setToken(access_token);
      setUser(u);
      if (u.role === 'student') navigate('/student/dashboard');
      else if (u.role === 'instructor') navigate('/instructor/dashboard');
      else if (u.role === 'admin') navigate('/admin/dashboard');
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
            {/* ── Role selector ── */}
            <div data-testid="role-selector" className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/30 border border-white/10">
              {ROLE_TABS.map(({ key, label, Icon }) => {
                const active = role === key;
                return (
                  <button
                    key={key}
                    type="button"
                    data-testid={`role-${key}`}
                    onClick={() => setRole(key)}
                    className={cn(
                      'relative flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all',
                      active
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
                    )}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                );
              })}
            </div>

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
                {loading ? 'Logging in...' : `Login as ${ROLE_TABS.find(r => r.key === role)?.label}`}
              </Button>
            </form>

            {/* OAuth — Student only (Google for instructor/admin is disabled by policy) */}
            {role === 'student' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-slate-500 whitespace-nowrap">or continue with</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <GoogleLoginButton />
              </div>
            )}

            {role !== 'student' && (
              <p className="text-[11px] text-slate-500 text-center pt-1">
                Google sign-in is available for students only. {role === 'instructor' ? 'Instructors' : 'Admins'} use email + password.
              </p>
            )}
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
