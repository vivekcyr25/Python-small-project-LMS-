import VideoLessonPlayer from './VideoLessonPlayer';
import MarkdownLessonViewer from './MarkdownLessonViewer';
import PdfLessonViewer from './PdfLessonViewer';
import QuizPlayer from './QuizPlayer';
import type { CourseLearnLesson } from '../../features/lessons/api';

interface LessonPlayerProps {
  lesson: CourseLearnLesson;
  onTimeUpdate?: (seconds: number, percent: number) => void;
  onEnded?: () => void;
  onQuizPassed?: () => void;
}

const LessonPlayer = ({ lesson, onTimeUpdate, onEnded, onQuizPassed }: LessonPlayerProps) => {
  return (
    <article data-testid={`lesson-player-${lesson.id}`} className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-slate-400 mt-2">{lesson.description}</p>
        )}
      </header>

      {lesson.lesson_type === 'video' && lesson.content_url && (
        <VideoLessonPlayer
          url={lesson.content_url}
          initialPositionSeconds={lesson.progress?.resume_position_seconds || 0}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
        />
      )}

      {lesson.lesson_type === 'markdown' && (
        <MarkdownLessonViewer content={lesson.content_text || ''} />
      )}

      {lesson.lesson_type === 'pdf' && lesson.content_url && (
        <PdfLessonViewer url={lesson.content_url} />
      )}

      {lesson.lesson_type === 'quiz' && (
        <QuizPlayer lessonId={lesson.id} onPassed={onQuizPassed} />
      )}
    </article>
  );
};

export default LessonPlayer;
