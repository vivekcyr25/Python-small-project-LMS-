import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyEnrollments } from '../../features/enrollments/api';
import { getCourses } from '../../features/courses/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Award, Clock, ArrowRight, Sparkles } from 'lucide-react';
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

  if (loadingEnrollments || loadingCourses) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const enrolledCourses = enrollments?.map((enrollment: any) => {
    return courses?.find((course: any) => course.id === enrollment.course_id);
  }).filter(Boolean) || [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Hero Welcome Card */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-white/10 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                Welcome back, {user?.full_name || 'Student'}! <Sparkles className="text-cyan-400" size={24} />
              </h1>
              <p className="text-slate-300 mt-2 text-lg">Ready to continue your learning journey today?</p>
            </div>
            <Link to="/courses">
              <Button variant="gradient" className="flex items-center gap-2">
                Explore Courses <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Enrolled Courses</p>
            <p className="text-2xl font-bold text-white">{enrolledCourses.length}</p>
          </div>
        </Card>
        <Card className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">In Progress</p>
            <p className="text-2xl font-bold text-white">{enrolledCourses.length > 0 ? 1 : 0}</p>
          </div>
        </Card>
        <Card className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
        </Card>
      </motion.div>

      {/* Enrolled Courses */}
      <motion.div variants={item}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">My Courses</h2>
          <Link to="/courses" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
            View all
          </Link>
        </div>
        
        {enrolledCourses.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <p className="text-slate-400">You are not enrolled in any courses yet.</p>
            <Link to="/courses">
              <Button variant="glass" className="mt-4">Browse Courses</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course: any) => (
              <motion.div key={course.id} variants={item}>
                <Card className="glass-card h-full flex flex-col overflow-hidden group">
                  <div className="h-40 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <BookOpen size={48} className="text-white/50 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 right-3">
                      <Badge variant="premium" className="capitalize">
                        {course.level || 'Beginner'}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-5">
                    <CardTitle className="text-lg font-bold text-white line-clamp-1">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-4">{course.description}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Progress</span>
                          <span>35%</span>
                        </div>
                        <Progress value={35} />
                      </div>
                    </div>
                    <Link to={`/courses/${course.id}`}>
                      <Button className="w-full flex items-center justify-center gap-2" variant="glass">
                        Continue Learning <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default StudentDashboard;
