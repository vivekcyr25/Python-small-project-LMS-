import * as React from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { getMyEnrollments } from '../../features/enrollments/api';
import { getCourses } from '../../features/courses/api';
import { getCourseProgress, type CourseProgressSummary } from '../../features/progress/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  ColumnSeries,
  Category,
  Inject,
  Tooltip,
} from '@syncfusion/ej2-react-charts';
import { 
  BookOpen, 
  Award, 
  Clock, 
  ArrowRight, 
  TrendingUp,
  Play,
  ClipboardList,
  Users,
  Compass,
  Rocket,
  Lock
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';

type Course = {
  id: number;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  level?: string | null;
};

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

  const progressQueries = useQueries({
    queries: enrolledCourses.map((course: Course) => ({
      queryKey: ['course-progress', course.id],
      queryFn: () => getCourseProgress(course.id),
      enabled: Boolean(course.id),
    })),
  });

  const progressByCourseId = new Map<number, CourseProgressSummary>();
  enrolledCourses.forEach((course: Course, index: number) => {
    progressByCourseId.set(
      course.id,
      progressQueries[index]?.data || { completed_lessons: 0, total_lessons: 0, progress_percent: 0 },
    );
  });

  const totalLessons = enrolledCourses.reduce((sum: number, course: Course) => {
    return sum + (progressByCourseId.get(course.id)?.total_lessons || 0);
  }, 0);

  const completedLessons = enrolledCourses.reduce((sum: number, course: Course) => {
    return sum + (progressByCourseId.get(course.id)?.completed_lessons || 0);
  }, 0);

  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const certificatesEarned = enrolledCourses.filter((course: Course) => {
    const progress = progressByCourseId.get(course.id);
    return progress && progress.total_lessons > 0 && progress.progress_percent >= 100;
  }).length;
  const progressLoading = progressQueries.some((query) => query.isLoading);
  const dashboardLoading = loadingEnrollments || loadingCourses || progressLoading;

  const sortedEnrolledCourses = [...enrolledCourses].sort((a: Course, b: Course) => {
    const aProgress = progressByCourseId.get(a.id)?.progress_percent || 0;
    const bProgress = progressByCourseId.get(b.id)?.progress_percent || 0;
    if (aProgress === bProgress) return a.title.localeCompare(b.title);
    return bProgress - aProgress;
  });
  const continueCourse = sortedEnrolledCourses.find((course: Course) => {
    const progress = progressByCourseId.get(course.id);
    return progress && progress.progress_percent < 100;
  }) || sortedEnrolledCourses[0];
  const continueProgress = continueCourse
    ? progressByCourseId.get(continueCourse.id) || { completed_lessons: 0, total_lessons: 0, progress_percent: 0 }
    : null;
  const continuePercent = continueProgress?.progress_percent || 0;
  const nextLessonText = continueProgress && continueProgress.total_lessons > 0
    ? `${continueProgress.completed_lessons} of ${continueProgress.total_lessons} lessons completed`
    : 'No lesson progress yet';

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
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{getFirstName(user?.full_name || '')}</span>
          </h1>
          <p className="text-slate-400 mt-1.5 text-sm">Continue your learning journey with AIPS LMS.</p>
        </div>
      </motion.div>

      {/* 2. iOS Stat Grid + Chart */}
      <motion.div variants={item} className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 grid grid-cols-2 gap-4">
        {/* Stat 1 */}
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-ios-accent/15 flex items-center justify-center text-ios-accent">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-ios-text">{dashboardLoading ? '...' : enrolledCourses.length}</p>
            <p className="text-[10px] text-ios-text-secondary font-medium uppercase tracking-wide">Enrolled</p>
          </div>
        </Card>

        {/* Stat 2 */}
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-ios-green/15 flex items-center justify-center text-ios-green">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-ios-text">{dashboardLoading ? '...' : `${overallProgress}%`}</p>
            <p className="text-[10px] text-ios-text-secondary font-medium uppercase tracking-wide">Progress</p>
          </div>
        </Card>

        {/* Stat 3 */}
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-ios-orange/15 flex items-center justify-center text-ios-orange">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-ios-text">{dashboardLoading ? '...' : completedLessons}</p>
            <p className="text-[10px] text-ios-text-secondary font-medium uppercase tracking-wide">Lessons Done</p>
          </div>
        </Card>

        {/* Stat 4 */}
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-ios-purple/15 flex items-center justify-center text-ios-purple">
            <Award size={20} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-ios-text">{dashboardLoading ? '...' : certificatesEarned}</p>
            <p className="text-[10px] text-ios-text-secondary font-medium uppercase tracking-wide">Certificates</p>
          </div>
        </Card>
        </div>

        <Card className="p-5">
          <h3 className="text-[13px] font-semibold text-ios-text-secondary mb-4">Learning Overview</h3>
          <ChartComponent
            primaryXAxis={{ valueType: 'Category', labelStyle: { color: 'rgba(255,255,255,0.5)', size: '11px' }, majorGridLines: { width: 0 } }}
            primaryYAxis={{ labelStyle: { color: 'rgba(255,255,255,0.5)', size: '11px' }, majorGridLines: { color: 'rgba(255,255,255,0.06)' }, maximum: 100 }}
            height="180px"
            background="transparent"
            tooltip={{ enable: true }}
          >
            <Inject services={[ColumnSeries, Category, Tooltip]} />
            <SeriesCollectionDirective>
              <SeriesDirective
                dataSource={[
                  { x: 'Progress', y: overallProgress },
                  { x: 'Lessons', y: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0 },
                  { x: 'Certs', y: enrolledCourses.length > 0 ? Math.round((certificatesEarned / enrolledCourses.length) * 100) : 0 },
                ]}
                xName="x"
                yName="y"
                type="Column"
                cornerRadius={{ topLeft: 8, topRight: 8 }}
                fill="#6b9fd4"
                columnWidth={0.5}
              />
            </SeriesCollectionDirective>
          </ChartComponent>
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
                <h3 className="text-xl font-bold text-white mt-3">
                  {continueCourse ? continueCourse.title : 'No active course yet'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {continueCourse ? nextLessonText : 'Enroll in a course to start learning.'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <BookOpen size={22} className="text-blue-300" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Course Progress</span>
                <span className="text-blue-400 font-bold">{continuePercent}%</span>
              </div>
              {/* iOS progress bar */}
              <Progress value={continuePercent} label="Course Progress" />

              <div className="flex items-center gap-3 pt-2">
                <Link to={continueCourse ? `/courses/${continueCourse.id}/learn` : '/courses'} className="flex-1">
                  <Button variant="gradient" className="w-full btn-premium py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
                    <Play size={12} fill="white" /> {continueCourse ? 'Resume Learning' : 'Browse Courses'}
                  </Button>
                </Link>
                <Link to={continueCourse ? `/courses/${continueCourse.id}` : '/courses'}>
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
                  <h4 className="text-sm font-bold text-white">
                    {continueCourse ? continueCourse.title : 'No recent course'}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {continueCourse ? 'Based on your enrolled courses' : 'Start a course to fill this in'}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                  <span>Progress</span>
                  <span>{continuePercent}% Completed</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${continuePercent}%` }} />
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
                <p className="text-3xl font-black text-white">{certificatesEarned}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Completed courses</p>
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
                    strokeDasharray={`${overallProgress}, 100`}
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
                  <span className="text-[10px] font-black text-white">{overallProgress}%</span>
                </div>
              </div>
              {certificatesEarned === 0 && (
                <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
                  <Lock size={12} />
                  Certificates unlock only at 100% course completion.
                </div>
              )}
            </div>
          </Card>
        </motion.div>

      </div>

    </motion.div>
  );
};

export default StudentDashboard;
