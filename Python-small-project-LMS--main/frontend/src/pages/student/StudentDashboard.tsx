import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyEnrollments } from '../../features/enrollments/api';
import { getCourses } from '../../features/courses/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Award, 
  Clock, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  Play,
  ClipboardList,
  Users,
  Compass,
  Rocket
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const StudentDashboard = () => {
  const user = useAuthStore((state) => state.user);
  
  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: getMyEnrollments,
  });

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  const enrolledCourses: any[] =
    (enrollments
      ?.map((e: any) => courses?.find((c: any) => c.id === e.course_id))
      .filter(Boolean) as any[]) || [];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const getFirstName = (name: string) => {
    return name ? name.split(' ')[0] : 'Learner';
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 relative z-20">
      
      {/* 1. Header Welcome & Title */}
      <motion.div variants={item} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{getFirstName(user?.full_name || 'Vivek')}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1.5 text-sm">Continue your learning journey with AIPS LMS.</p>
        </div>
      </motion.div>

      {/* 2. Apple iOS 26 Stat Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat 1 */}
        <Card className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{enrolledCourses.length || 8}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Courses Enrolled</p>
          </div>
        </Card>

        {/* Stat 2 */}
        <Card className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-white">64%</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Overall Progress</p>
          </div>
        </Card>

        {/* Stat 3 */}
        <Card className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/10">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-white">15</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Lessons Completed</p>
          </div>
        </Card>

        {/* Stat 4 */}
        <Card className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/10">
            <Award size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-white">4</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Certificates Earned</p>
          </div>
        </Card>

      </motion.div>

      {/* 3. Middle Section: Continue Learning & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Continue Learning widget */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="glass-card p-6 h-full flex flex-col justify-between border border-white/5 relative overflow-hidden group">
            {/* Visual background elements */}
            <div className="absolute right-0 top-0 w-44 h-44 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:scale-125 transition-transform duration-500" />
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                  Continue Learning
                </span>
                <h3 className="text-xl font-bold text-white mt-3">Python for Beginners</h3>
                <p className="text-xs text-slate-400 mt-1">Lesson 7: Loops & Iterations</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" 
                  alt="Python" 
                  className="w-6 h-6 object-contain"
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Course Progress</span>
                <span className="text-blue-400 font-bold">68%</span>
              </div>
              {/* iOS style progress bar */}
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{ width: '68%' }} />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link to="/courses" className="flex-1">
                  <Button variant="gradient" className="w-full btn-premium py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
                    <Play size={12} fill="white" /> Resume Learning
                  </Button>
                </Link>
                <Link to="/courses">
                  <button className="p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all">
                    <ArrowRight size={14} className="text-white" />
                  </button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions Panel */}
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="glass-card p-6 h-full flex flex-col justify-between border border-white/5">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-5">Quick Actions</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Link to="/courses" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/15 transition-all text-center gap-2 group">
                  <BookOpen size={18} className="text-blue-400 group-hover:scale-115 transition-transform" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Browse Courses</span>
                </Link>
                <Link to="/certificates" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/15 transition-all text-center gap-2 group">
                  <Award size={18} className="text-purple-400 group-hover:scale-115 transition-transform" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">My Certificates</span>
                </Link>
                <Link to="/quizzes" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/15 transition-all text-center gap-2 group">
                  <ClipboardList size={18} className="text-emerald-400 group-hover:scale-115 transition-transform" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Take Quiz</span>
                </Link>
                <Link to="/discussions" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/15 transition-all text-center gap-2 group">
                  <Users size={18} className="text-amber-400 group-hover:scale-115 transition-transform" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Community</span>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>

      {/* 4. Bottom Row: Keep Learning, Recently Viewed, Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Promotonal / Motivation Card */}
        <motion.div variants={item} className="md:col-span-1">
          <Card className="glass-card p-6 h-full border border-white/5 bg-gradient-to-br from-indigo-500/15 to-purple-500/5 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                <Rocket size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Keep learning. Keep growing.</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">AIPS LMS uses AI to help you learn smarter and achieve more.</p>
              </div>
            </div>
            <div className="pt-6">
              <Link to="/courses">
                <Button variant="glass" size="sm" className="w-full flex items-center justify-center gap-2 text-xs font-semibold">
                  Explore Now <ArrowRight size={12} />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Recently Viewed */}
        <motion.div variants={item} className="md:col-span-1">
          <Card className="glass-card p-6 h-full border border-white/5 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Recently Viewed</h3>
              <Link to="/courses" className="text-[10px] text-blue-400 font-bold hover:underline">View all</Link>
            </div>
            
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
                  <Compass size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Data Structures in C++</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Last viewed 2h ago</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                  <span>Progress</span>
                  <span>45% Completed</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Learning Streak */}
        <motion.div variants={item} className="md:col-span-1">
          <Card className="glass-card p-6 h-full border border-white/5 flex flex-col justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Your Streak</h3>
            
            <div className="flex items-center justify-between gap-4 mt-3">
              <div>
                <p className="text-3xl font-black text-white">7</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Days in a row! 🔥</p>
              </div>
              
              {/* iOS Circle Progress indicator */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/5"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-gradient-to-r from-amber-500 to-orange-500"
                    strokeDasharray="75, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="url(#gradient)"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-[10px] font-black text-white">75%</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>

    </motion.div>
  );
};

export default StudentDashboard;
