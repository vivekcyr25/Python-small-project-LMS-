import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { Sparkles, UserPlus } from 'lucide-react';
import { cn } from '../../lib/utils';
import LiquidGlassShader from '../../components/effects/LiquidGlassShader';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', {
        full_name: fullName,
        email,
        password,
        role,
      });
      
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register');
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
            <CardTitle className="text-[28px] font-semibold tracking-tight">Create Account</CardTitle>
            <CardDescription className="text-ios-text-secondary text-[13px]">
              Join AIPS LMS today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Role</label>
                <select
                  className={cn(
                    "flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student" className="bg-[#030712] text-white">Student</option>
                  <option value="instructor" className="bg-[#030712] text-white">Instructor</option>
                  <option value="admin" className="bg-[#030712] text-white">Admin</option>
                </select>
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
              <Button type="submit" variant="ios" className="w-full flex items-center gap-2" disabled={loading}>
                <UserPlus size={16} />
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
