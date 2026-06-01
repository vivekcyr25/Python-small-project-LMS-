import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyEnrollments } from '../../features/enrollments/api';
import { getCourses } from '../../features/courses/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Award, Clock, ArrowRight, Sparkles } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import EnrolledCourseCard from '../../components/student/EnrolledCourseCard';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
      </div>
    );
  }

  const enrolledCourses: any[] =
    (enrollments
      ?.map((e: any) => courses?.find((c: any) => c.id === e.course_id))
      .filter(Boolean) as any[]) || [];

  // Pick the most recent enrollment as the "Continue Learning" hero candidate
  const heroCourse = enrolledCourses[0] || null;
  const restCourses = enrolledCourses.slice(1);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Welcome / Continue Learning hero */}
      {heroCourse ? (
        <motion.div variants={item}>
          <EnrolledCourseCard course={heroCourse} showHero />
        </motion.div>
      ) : (
        <motion.div variants={item}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-white/10 p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  Welcome, {user?.full_name || 'Student'} <Sparkles className="text-cyan-400" size={24} />
                </h1>
                <p className="text-slate-300 mt-2 text-lg">Enroll in your first course to start learning.</p>
              </div>
              <Link to="/courses">
                <Button variant="gradient" className="flex items-center gap-2">
                  Explore Courses <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Enrolled Courses</p>
            <p className="text-2xl font-bold text-white" data-testid="stat-enrolled">{enrolledCourses.length}</p>
          </div>
        </Card>
        <Card className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">In Progress</p>
            <p className="text-2xl font-bold text-white">{enrolledCourses.length}</p>
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

      {/* All enrolled courses grid (excludes the hero) */}
      {restCourses.length > 0 && (
        <motion.div variants={item}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">My Courses</h2>
            <Link to="/courses" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restCourses.map((course) => (
              <motion.div key={course.id} variants={item}>
                <EnrolledCourseCard course={course} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StudentDashboard;
