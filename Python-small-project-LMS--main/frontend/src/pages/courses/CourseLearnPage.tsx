import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Menu, X } from 'lucide-react';
import LessonSidebar from '../../components/learn/LessonSidebar';
import LessonPlayer from '../../components/learn/LessonPlayer';
import CourseProgressPanel from '../../components/learn/CourseProgressPanel';
import { getCourseLearnData, type CourseLearnLesson } from '../../features/lessons/api';
import { updateLessonProgress, completeLesson } from '../../features/progress/api';

const CourseLearnPage = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const queryClient = useQueryClient();
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['course-learn', courseId],
    queryFn: () => getCourseLearnData(courseId),
    enabled: !isNaN(courseId),
  });

  const allLessons = useMemo<CourseLearnLesson[]>(() => {
    if (!data) return [];
    return data.sections.flatMap((s) => s.lessons);
  }, [data]);

  // Auto-pick first lesson once data loads
  useEffect(() => {
    if (!activeLessonId && allLessons.length > 0) {
      // Prefer first not-completed lesson
      const next = allLessons.find((l) => l.progress?.status !== 'completed') ?? allLessons[0];
      setActiveLessonId(next.id);
    }
  }, [allLessons, activeLessonId]);

  const activeLesson = allLessons.find((l) => l.id === activeLessonId) || null;
  const completed = allLessons.filter((l) => l.progress?.status === 'completed').length;

  const nextLesson = useMemo(() => {
    if (!activeLesson) return null;
    const idx = allLessons.findIndex((l) => l.id === activeLesson.id);
    return idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
  }, [activeLesson, allLessons]);

  const trackProgress = useMutation({
    mutationFn: (vars: { lessonId: number; seconds: number; percent: number }) =>
      updateLessonProgress(vars.lessonId, {
        status: vars.percent >= 95 ? 'completed' : 'in_progress',
        progress_percent: vars.percent,
        resume_position_seconds: vars.seconds,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course-learn', courseId] }),
  });

  const markComplete = useMutation({
    mutationFn: (lessonId: number) => completeLesson(lessonId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course-learn', courseId] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-slate-400">
        Unable to load course content. Make sure you're enrolled and try again.
      </div>
    );
  }

  return (
    <div data-testid="course-learn-page" className="-mx-4 md:-mx-8 -my-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 md:px-8 py-3 border-b border-white/10 bg-black/30 backdrop-blur-md">
        <Link
          to={`/courses/${courseId}`}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={14} /> Course
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{data.course.title}</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/5"
        >
          {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Main 3-pane layout */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} md:block`}>
          <LessonSidebar
            sections={data.sections}
            activeLessonId={activeLessonId}
            onSelect={(l) => { setActiveLessonId(l.id); setMobileSidebarOpen(false); }}
          />
        </div>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {activeLesson ? (
            <motion.div
              key={activeLesson.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <LessonPlayer
                lesson={activeLesson}
                onTimeUpdate={(seconds, percent) => {
                  trackProgress.mutate({ lessonId: activeLesson.id, seconds, percent });
                }}
                onEnded={() => markComplete.mutate(activeLesson.id)}
                onQuizPassed={() => markComplete.mutate(activeLesson.id)}
              />
            </motion.div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              Pick a lesson from the sidebar to begin.
            </div>
          )}
        </main>

        <CourseProgressPanel
          totalLessons={allLessons.length}
          completedLessons={completed}
          nextLesson={nextLesson}
          onJumpNext={() => nextLesson && setActiveLessonId(nextLesson.id)}
          onMarkComplete={() => activeLesson && markComplete.mutate(activeLesson.id)}
          canMarkComplete={!!activeLesson && activeLesson.lesson_type !== 'quiz'}
          isCurrentDone={activeLesson?.progress?.status === 'completed'}
        />
      </div>
    </div>
  );
};

export default CourseLearnPage;
