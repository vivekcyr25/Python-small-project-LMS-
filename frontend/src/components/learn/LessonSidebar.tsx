import { useMemo } from 'react';
import { CheckCircle2, Circle, PlayCircle, FileText, FileType, HelpCircle, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CourseLearnSection, CourseLearnLesson } from '../../features/lessons/api';

interface LessonSidebarProps {
  sections: CourseLearnSection[];
  activeLessonId: number | null;
  onSelect: (lesson: CourseLearnLesson) => void;
}

const typeIcon = (type: string) => {
  switch (type) {
    case 'video': return PlayCircle;
    case 'pdf': return FileType;
    case 'quiz': return HelpCircle;
    default: return FileText;
  }
};

const LessonSidebar = ({ sections, activeLessonId, onSelect }: LessonSidebarProps) => {
  const stats = useMemo(() => {
    const all = sections.flatMap((s) => s.lessons);
    const done = all.filter((l) => l.progress?.status === 'completed').length;
    return { total: all.length, done };
  }, [sections]);

  return (
    <aside
      data-testid="lesson-sidebar"
      className="w-full md:w-80 shrink-0 border-r border-white/10 bg-black/30 backdrop-blur-md flex flex-col h-full overflow-hidden"
    >
      <div className="p-4 border-b border-white/10">
        <p className="text-xs uppercase tracking-widest text-cyan-400/80">Course Outline</p>
        <p className="text-sm text-slate-300 mt-1">
          {stats.done} / {stats.total} lessons complete
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {sections.length === 0 && (
          <p className="text-sm text-slate-500 px-3 py-6 text-center">No published sections yet.</p>
        )}

        {sections.map((section) => (
          <div key={section.id} className="space-y-1">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-slate-200">{section.title}</p>
              {section.description && (
                <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
              )}
            </div>

            <ul className="space-y-1">
              {section.lessons.map((lesson) => {
                const Icon = typeIcon(lesson.lesson_type);
                const isActive = lesson.id === activeLessonId;
                const isDone = lesson.progress?.status === 'completed';
                const isLocked = !lesson.is_published && !lesson.is_preview;

                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      data-testid={`lesson-item-${lesson.id}`}
                      onClick={() => !isLocked && onSelect(lesson)}
                      disabled={isLocked}
                      className={cn(
                        'group w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all',
                        isActive && 'bg-cyan-500/15 ring-1 ring-cyan-400/40 shadow-[0_0_20px_-5px_rgba(34,211,238,0.5)]',
                        !isActive && !isLocked && 'hover:bg-white/5',
                        isLocked && 'opacity-40 cursor-not-allowed',
                      )}
                    >
                      <span className="mt-0.5 shrink-0">
                        {isLocked ? (
                          <Lock size={14} className="text-slate-500" />
                        ) : isDone ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : isActive ? (
                          <Icon size={16} className="text-cyan-300" />
                        ) : (
                          <Circle size={14} className="text-slate-500" />
                        )}
                      </span>
                      <span className={cn('flex-1 line-clamp-2', isActive ? 'text-white' : 'text-slate-300')}>
                        {lesson.title}
                        {lesson.is_preview && !isDone && (
                          <span className="ml-2 text-[10px] uppercase tracking-wider text-cyan-400/80">Preview</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default LessonSidebar;
