import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import useAuthStore from '../../stores/authStore';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { Sparkles, LogIn, GraduationCap, BookOpen, ShieldCheck } from 'lucide-react';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import LiquidGlassShader from '../../components/effects/LiquidGlassShader';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';

type LoginRole = 'student' | 'instructor' | 'admin';

const ROLE_TABS = [
  { value: 'student' as LoginRole, label: 'Student', icon: <GraduationCap size={14} /> },
  { value: 'instructor' as LoginRole, label: 'Instructor', icon: <BookOpen size={14} /> },
  { value: 'admin' as LoginRole, label: 'Admin', icon: <ShieldCheck size={14} /> },
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

      if (u.role !== role) {
        setError(`This account is a ${u.role}, not a ${role}. Please pick the right role tab.`);
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
    <div className="flex items-center justify-center min-h-screen text-ios-text overflow-hidden relative font-sf">
      <LiquidGlassShader />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-[400px] relative z-10 p-4"
      >
        <Card className="border-0 shadow-ios-glass">
          <CardHeader className="text-center space-y-2 pb-2">
            <div className="flex justify-center mb-1">
              <div className="w-14 h-14 rounded-[18px] bg-gradient-to-b from-ios-accent to-ios-accent-deep flex items-center justify-center">
                <Sparkles size={26} className="text-white" />
              </div>
            </div>
            <CardTitle className="text-[28px] font-semibold tracking-tight">AIPS LMS</CardTitle>
            <CardDescription className="text-ios-text-secondary text-[13px]">
              Learn. Track. Grow.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <SegmentedControl
              options={ROLE_TABS}
              value={role}
              onChange={setRole}
              testId="role-selector"
            />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ios-text-secondary">Email</label>
                <TextBoxComponent
                  placeholder="email@example.com"
                  type="email"
                  value={email}
                  change={(e: { value: string }) => setEmail(e.value)}
                  cssClass="e-outline w-full"
                  floatLabelType="Never"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ios-text-secondary">Password</label>
                <TextBoxComponent
                  placeholder="Enter password"
                  type="password"
                  value={password}
                  change={(e: { value: string }) => setPassword(e.value)}
                  cssClass="e-outline w-full"
                  floatLabelType="Never"
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[13px] text-ios-red"
                >
                  {error}
                </motion.p>
              )}
              <Button
                type="submit"
                variant="ios"
                className="w-full flex items-center gap-2"
                disabled={loading}
              >
                <LogIn size={15} />
                {loading ? 'Signing in...' : `Sign in as ${ROLE_TABS.find((r) => r.value === role)?.label}`}
              </Button>
            </form>

            {role === 'student' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[11px] text-ios-text-secondary">or</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                <GoogleLoginButton />
              </div>
            )}

            {role !== 'student' && (
              <p className="text-[11px] text-ios-text-secondary text-center">
                Google sign-in is for students only. Use email and password.
              </p>
            )}
          </CardContent>

          <CardFooter className="justify-center pb-6">
            <p className="text-[13px] text-ios-text-secondary">
              No account?{' '}
              <Link to="/register" className="text-ios-accent hover:text-ios-accent/80 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
