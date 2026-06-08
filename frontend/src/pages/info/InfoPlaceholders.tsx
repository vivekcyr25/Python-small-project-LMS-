import * as React from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { getCourses } from '../../features/courses/api';
import { getMyEnrollments } from '../../features/enrollments/api';
import { getCourseProgress, type CourseProgressSummary } from '../../features/progress/api';
import useAuthStore from '../../stores/authStore';
import { 
  Award, 
  HelpCircle, 
  MessageSquare, 
  Bookmark, 
  ChevronRight,
  BookOpen,
  Send,
  Lock,
  CheckCircle2,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

type Course = {
  id: number;
  title: string;
  description?: string | null;
  level?: string | null;
  instructor_id?: number;
};

// -------------------------------------------------------------
// 1. QUIZZES PAGE
// -------------------------------------------------------------
export const QuizzesPage = () => {
  const quizzes = [
    { id: 1, title: 'C Programming basics: Syntax check', course: 'Learning C Programming', score: '80%', status: 'Passed' },
    { id: 2, title: 'Pointers & Dynamic Buffers', course: 'Advanced C: Pointers & Algorithms', score: 'Pending', status: 'Incomplete' },
    { id: 3, title: 'Python Control Flow and Loops', course: 'Python Fundamentals & Automation', score: '95%', status: 'Passed' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 relative z-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-white/10 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10" />
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <HelpCircle className="text-amber-400" size={32} /> Quizzes Hub
        </h1>
        <p className="text-slate-300 mt-2 text-base">Validate your knowledge and track your test performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {quizzes.map((quiz) => (
          <motion.div key={quiz.id} initial="hidden" animate="show" variants={itemVariants}>
            <Card className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-amber-500/30">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  {quiz.course}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">{quiz.title}</h3>
              </div>
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                <div>
                  <p className="text-xs text-slate-500">Score Obtained</p>
                  <p className="text-base font-extrabold text-white">{quiz.score}</p>
                </div>
                <Button variant={quiz.status === 'Passed' ? 'glass' : 'gradient'} size="sm" className="btn-premium">
                  {quiz.status === 'Passed' ? 'Review Quiz' : 'Take Quiz'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. CERTIFICATES PAGE (WWDC WALLET STYLE)
// -------------------------------------------------------------
export const CertificatesPage = () => {
  const user = useAuthStore((state) => state.user);
  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: getMyEnrollments,
  });

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  const enrolledCourses: Course[] =
    (enrollments
      ?.map((enrollment: any) => courses?.find((course: Course) => course.id === enrollment.course_id))
      .filter(Boolean) as Course[]) || [];

  const progressQueries = useQueries({
    queries: enrolledCourses.map((course) => ({
      queryKey: ['course-progress', course.id],
      queryFn: () => getCourseProgress(course.id),
      enabled: Boolean(course.id),
    })),
  });

  const progressByCourseId = new Map<number, CourseProgressSummary>();
  enrolledCourses.forEach((course, index) => {
    progressByCourseId.set(
      course.id,
      progressQueries[index]?.data || { completed_lessons: 0, total_lessons: 0, progress_percent: 0 },
    );
  });

  const completedCourses = enrolledCourses.filter((course) => {
    const progress = progressByCourseId.get(course.id);
    return progress && progress.total_lessons > 0 && progress.progress_percent >= 100;
  });

  const lockedCourses = enrolledCourses.filter((course) => !completedCourses.some((completed) => completed.id === course.id));
  const isLoading = loadingEnrollments || loadingCourses || progressQueries.some((query) => query.isLoading);

  const certificateCode = (course: Course) => {
    const slug = course.title.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase() || 'COURSE';
    return `AIPS-${slug}-${String(course.id).padStart(4, '0')}`;
  };

  const downloadCertificate = (course: Course) => {
    const code = certificateCode(course);
    const learnerName = user?.full_name || user?.email || 'AIPS LMS Learner';
    const issuedOn = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${code}</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #080b18; font-family: Arial, sans-serif; color: white; }
    .certificate { width: 900px; max-width: calc(100vw - 48px); padding: 64px; border: 1px solid #8b5cf6; background: linear-gradient(135deg, #151936, #35145a 55%, #111827); box-shadow: 0 30px 100px rgba(0,0,0,.45); }
    .eyebrow { color: #c084fc; font-size: 13px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; }
    h1 { font-size: 48px; margin: 18px 0 10px; }
    h2 { font-size: 34px; margin: 14px 0; }
    p { color: #cbd5e1; font-size: 18px; line-height: 1.6; }
    .code { margin-top: 42px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,.18); display: flex; justify-content: space-between; font-size: 13px; color: #c4b5fd; }
  </style>
</head>
<body>
  <main class="certificate">
    <div class="eyebrow">AIPS LMS verified certificate</div>
    <h1>Certificate of Completion</h1>
    <p>This certifies that</p>
    <h2>${learnerName}</h2>
    <p>has completed every published lesson in <strong>${course.title}</strong>.</p>
    <div class="code">
      <span>${code}</span>
      <span>Issued ${issuedOn}</span>
    </div>
  </main>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${code}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 relative z-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-white/10 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Award className="text-purple-400" size={32} /> Certificates Wallet
        </h1>
        <p className="text-slate-300 mt-2 text-base">Certificates unlock only after every published lesson in a course is completed.</p>
      </div>

      {isLoading && (
        <Card className="glass-card p-6 border border-white/10">
          <p className="text-sm text-slate-400">Checking your course completion...</p>
        </Card>
      )}

      {!isLoading && enrolledCourses.length === 0 && (
        <Card className="glass-card p-8 border border-white/10 text-center">
          <BookOpen size={30} className="text-blue-400 mx-auto" />
          <h3 className="text-xl font-bold text-white mt-4">No enrolled courses yet</h3>
          <p className="text-sm text-slate-400 mt-2">Enroll in a course, complete every lesson, and your certificate will appear here.</p>
          <Link to="/courses" className="inline-flex mt-5">
            <Button variant="gradient" className="btn-premium">Browse Courses</Button>
          </Link>
        </Card>
      )}

      {!isLoading && completedCourses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Earned Certificates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedCourses.map((course) => (
              <motion.div key={course.id} initial="hidden" animate="show" variants={itemVariants}>
                <Card className="glass-card p-6 h-full border border-purple-400/20 bg-gradient-to-br from-purple-950/20 to-pink-950/10 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:scale-125 transition-all duration-500" />
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <CheckCircle2 size={28} className="text-emerald-400" />
                      <span className="text-[9px] font-mono tracking-widest text-slate-500">{certificateCode(course)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-snug">{course.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">Completion verified by AIPS LMS</p>
                    </div>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Progress: 100%</span>
                    <button
                      type="button"
                      onClick={() => downloadCertificate(course)}
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold"
                    >
                      Download <Download size={12} />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && lockedCourses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Locked Until Completion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lockedCourses.map((course) => {
              const progress = progressByCourseId.get(course.id) || { completed_lessons: 0, total_lessons: 0, progress_percent: 0 };
              const remaining = Math.max(progress.total_lessons - progress.completed_lessons, 0);

              return (
                <motion.div key={course.id} initial="hidden" animate="show" variants={itemVariants}>
                  <Card className="glass-card p-6 h-full border border-white/10 flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <Lock size={26} className="text-slate-500" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{progress.progress_percent}% complete</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white leading-snug">{course.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {progress.total_lessons > 0
                            ? `${remaining} lesson${remaining === 1 ? '' : 's'} remaining before certificate generation.`
                            : 'This course has no published lessons yet.'}
                        </p>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{ width: `${progress.progress_percent}%` }} />
                      </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Certificate unavailable</span>
                      <Link to={`/courses/${course.id}/learn`} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold">
                        Continue <ChevronRight size={12} />
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 3. DISCUSSIONS PAGE
// -------------------------------------------------------------
export const DiscussionsPage = () => {
  const threads = [
    { id: 1, title: 'How to implement custom malloc free in C?', author: 'Aman Patel', replies: 8, activity: '2h ago' },
    { id: 2, title: 'Trouble connecting Firebase token in local dev env', author: 'Vikram', replies: 15, activity: '5h ago' },
    { id: 3, title: 'Python requests.get headers configuration parameters', author: 'Neha Sen', replies: 3, activity: '1d ago' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 relative z-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-white/10 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <MessageSquare className="text-blue-400" size={32} /> Discussions Board
        </h1>
        <p className="text-slate-300 mt-2 text-base">Join the community, ask questions, and share solutions.</p>
      </div>

      <Card className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Start a New Thread</h3>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="Type your discussion topic..." 
            className="apple-input flex-grow"
          />
          <Button variant="gradient" className="btn-premium flex items-center gap-2">
            <Send size={14} /> Send
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {threads.map((thread) => (
          <motion.div key={thread.id} initial="hidden" animate="show" variants={itemVariants}>
            <Card className="glass-card p-5 flex justify-between items-center hover:border-blue-500/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{thread.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">By {thread.author} • {thread.activity}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">{thread.replies} replies</span>
                <ChevronRight size={16} className="text-slate-500" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. BOOKMARKS PAGE
// -------------------------------------------------------------
export const BookmarksPage = () => {
  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: getMyEnrollments,
  });

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  const enrolledCourses: Course[] =
    (enrollments
      ?.map((enrollment: any) => courses?.find((course: Course) => course.id === enrollment.course_id))
      .filter(Boolean) as Course[]) || [];

  const progressQueries = useQueries({
    queries: enrolledCourses.map((course) => ({
      queryKey: ['course-progress', course.id],
      queryFn: () => getCourseProgress(course.id),
      enabled: Boolean(course.id),
    })),
  });

  const progressByCourseId = new Map<number, CourseProgressSummary>();
  enrolledCourses.forEach((course, index) => {
    progressByCourseId.set(
      course.id,
      progressQueries[index]?.data || { completed_lessons: 0, total_lessons: 0, progress_percent: 0 },
    );
  });

  const isLoading = loadingEnrollments || loadingCourses || progressQueries.some((query) => query.isLoading);

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 relative z-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-white/10 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Bookmark className="text-emerald-400" size={32} /> Bookmarks
        </h1>
        <p className="text-slate-300 mt-2 text-base">Resume saved learning from your real enrolled courses.</p>
      </div>

      {isLoading && (
        <Card className="glass-card p-6 border border-white/10">
          <p className="text-sm text-slate-400">Loading your saved learning...</p>
        </Card>
      )}

      {!isLoading && enrolledCourses.length === 0 && (
        <Card className="glass-card p-8 border border-white/10 text-center">
          <Bookmark size={30} className="text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold text-white mt-4">No bookmarks yet</h3>
          <p className="text-sm text-slate-400 mt-2">Enroll in a course first. Your saved learning shortcuts will appear here.</p>
          <Link to="/courses" className="inline-flex mt-5">
            <Button variant="gradient" className="btn-premium">Browse Courses</Button>
          </Link>
        </Card>
      )}

      {!isLoading && enrolledCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolledCourses.map((course) => {
            const progress = progressByCourseId.get(course.id) || { completed_lessons: 0, total_lessons: 0, progress_percent: 0 };
            const label = progress.progress_percent >= 100 ? 'Completed' : 'Course';

            return (
              <motion.div key={course.id} initial="hidden" animate="show" variants={itemVariants}>
                <Card className="glass-card p-6 h-full border border-white/10 flex flex-col justify-between hover:border-emerald-500/30">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        {label}
                      </span>
                      <Bookmark size={16} className="text-emerald-400 fill-emerald-400/20" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{course.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {progress.total_lessons > 0
                          ? `${progress.completed_lessons} of ${progress.total_lessons} lessons completed`
                          : course.description || 'No published lessons yet'}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                        <span>Progress</span>
                        <span>{progress.progress_percent}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${progress.progress_percent}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                    <Link to={`/courses/${course.id}/learn`} className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
                      Resume <ChevronRight size={12} />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
