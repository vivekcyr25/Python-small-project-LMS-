import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, PlayCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { getCourseLearnData, type CourseLearnLesson } from '../../features/lessons/api';

interface EnrolledCourseCardProps {
  course: any;
  showHero?: boolean;
}

/** Derive last-watched and next-up lessons from the learn payload. */
const deriveLessons = (allLessons: CourseLearnLesson[]) => {
  if (!allLessons.length) return { last: null, next: null };
  // last = most recent in_progress; else last completed
  const inProgress = allLessons.filter((l) => l.progress?.status === 'in_progress');
  const completed = allLessons.filter((l) => l.progress?.status === 'completed');
  const last = inProgress[inProgress.length - 1] || completed[completed.length - 1] || null;
  // next = first not_completed in document order
  const next = allLessons.find((l) => l.progress?.status !== 'completed') || null;
  return { last, next };
};

const EnrolledCourseCard = ({ course, showHero = false }: EnrolledCourseCardProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['course-learn', course.id],
    queryFn: () => getCourseLearnData(course.id),
    enabled: !!course.id,
    staleTime: 30_000,
  });

  const allLessons = data ? data.sections.flatMap((s) => s.lessons) : [];
  const completed = allLessons.filter((l) => l.progress?.status === 'completed').length;
  const total = allLessons.length;
  const pct = total > 0 ? Math.floor((completed / total) * 100) : 0;
  const { last, next } = deriveLessons(allLessons);

  // ─────────────── Hero ("Continue Learning") variant ───────────────
  if (showHero) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-blue-600/10 to-indigo-600/10 p-6 md:p-8"
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="space-y-4 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="premium" className="capitalize">{course.level || 'Beginner'}</Badge>
              <span className="text-[11px] uppercase tracking-widest text-cyan-300/80">Continue learning</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white line-clamp-2">{course.title}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Last lesson</p>
                <p className="text-sm text-white line-clamp-1" data-testid={`hero-last-${course.id}`}>
                  {isLoading ? '…' : last ? last.title : 'Not started'}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-widest text-cyan-400/80 mb-1">Up next</p>
                <p className="text-sm text-white line-clamp-1" data-testid={`hero-next-${course.id}`}>
                  {isLoading ? '…' : next ? next.title : '🎉 Course complete!'}
                </p>
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{completed} / {total} lessons</span>
                <span className="font-semibold text-cyan-300" data-testid={`hero-pct-${course.id}`}>{pct}%</span>
              </div>
              <Progress value={pct} />
            </div>
          </div>

          <Link to={`/courses/${course.id}/learn`} className="shrink-0">
            <Button
              variant="gradient"
              data-testid={`hero-continue-${course.id}`}
              className="flex items-center gap-2 px-6 py-6 text-base"
            >
              <PlayCircle size={18} /> Continue Learning
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  // ─────────────── Compact card variant ───────────────
  return (
    <Card className="glass-card h-full flex flex-col overflow-hidden group">
      <div className="h-40 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <BookOpen size={48} className="text-white/50 group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-3 right-3">
          <Badge variant="premium" className="capitalize">{course.level || 'Beginner'}</Badge>
        </div>
        {pct === 100 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-emerald-300 bg-emerald-500/20 rounded-full px-2 py-1">
            <CheckCircle2 size={12} /> Complete
          </div>
        )}
      </div>
      <CardHeader className="p-5">
        <CardTitle className="text-lg font-bold text-white line-clamp-1">{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          <p className="text-sm text-slate-400 line-clamp-2">{course.description}</p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Progress</span>
              <span data-testid={`card-pct-${course.id}`}>{pct}%</span>
            </div>
            <Progress value={pct} />
          </div>

          {next && (
            <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <Clock size={12} className="text-cyan-400" />
              <span className="truncate">
                Next: <span className="text-slate-200">{next.title}</span>
              </span>
            </div>
          )}
        </div>
        <Link to={`/courses/${course.id}/learn`} className="mt-4">
          <Button
            className="w-full flex items-center justify-center gap-2"
            variant="glass"
            data-testid={`card-continue-${course.id}`}
          >
            {pct === 0 ? 'Start Learning' : pct === 100 ? 'Review Course' : 'Continue Learning'}
            <ArrowRight size={14} />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default EnrolledCourseCard;
