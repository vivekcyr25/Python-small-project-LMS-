import { CheckCircle2, ArrowRight, Trophy } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import type { CourseLearnLesson } from '../../features/lessons/api';

interface CourseProgressPanelProps {
  totalLessons: number;
  completedLessons: number;
  nextLesson: CourseLearnLesson | null;
  onJumpNext: () => void;
  onMarkComplete: () => void;
  canMarkComplete: boolean;
  isCurrentDone: boolean;
}

const CourseProgressPanel = ({
  totalLessons,
  completedLessons,
  nextLesson,
  onJumpNext,
  onMarkComplete,
  canMarkComplete,
  isCurrentDone,
}: CourseProgressPanelProps) => {
  const pct = totalLessons > 0 ? Math.floor((completedLessons / totalLessons) * 100) : 0;
  const isFinished = totalLessons > 0 && completedLessons === totalLessons;

  return (
    <aside
      data-testid="course-progress-panel"
      className="w-full lg:w-72 shrink-0 border-l border-white/10 bg-black/20 backdrop-blur-md p-5 space-y-6 hidden lg:block"
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-cyan-400/80 mb-2">Your progress</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">{pct}%</span>
          <span className="text-xs text-slate-400">
            {completedLessons}/{totalLessons} lessons
          </span>
        </div>
        <Progress value={pct} className="mt-3" />
      </div>

      {isFinished ? (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 flex items-start gap-3">
          <Trophy className="text-emerald-300 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-semibold text-emerald-200">Course complete!</p>
            <p className="text-xs text-emerald-100/70 mt-1">You've finished every lesson. Nice work.</p>
          </div>
        </div>
      ) : (
        <>
          {canMarkComplete && !isCurrentDone && (
            <Button
              data-testid="mark-complete-btn"
              onClick={onMarkComplete}
              variant="gradient"
              className="w-full flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              Mark Lesson Complete
            </Button>
          )}

          {nextLesson && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Up next</p>
              <p className="text-sm text-white line-clamp-2">{nextLesson.title}</p>
              <Button
                data-testid="next-lesson-btn"
                onClick={onJumpNext}
                variant="glass"
                size="sm"
                className="mt-3 w-full flex items-center justify-center gap-2"
              >
                Next lesson <ArrowRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}
    </aside>
  );
};

export default CourseProgressPanel;
