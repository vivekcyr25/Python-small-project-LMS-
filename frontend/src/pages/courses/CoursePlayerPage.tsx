import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourseModules, getModuleLessons } from '../../features/content/api';
import { getCourseProgress, updateProgress } from '../../features/assessment/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import useAuthStore from '../../stores/authStore';
import { BookOpen, CheckCircle, Video, PlayCircle } from 'lucide-react';

const LessonPlayer = ({ lessonId, onComplete }: { lessonId: number, onComplete: () => void }) => {
  // In a real app we'd fetch the lesson details. Here we'll just mock the player
  return (
    <div className="flex flex-col h-full bg-black/40 rounded-xl overflow-hidden border border-white/10">
      <div className="aspect-video bg-black flex items-center justify-center relative">
        <PlayCircle size={64} className="text-white/20 absolute z-0" />
        <p className="text-slate-500 z-10">Video Player Placeholder for Lesson {lessonId}</p>
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Lesson Details</h2>
        <p className="text-slate-300">Here would be the rich text content of the lesson, reading materials, etc.</p>
        
        <div className="mt-8 pt-6 border-t border-white/10">
          <Button onClick={onComplete} variant="gradient" className="flex items-center gap-2">
            <CheckCircle size={16} /> Mark as Complete
          </Button>
        </div>
      </div>
    </div>
  );
};

const CoursePlayerPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeLessonId, setActiveLessonId] = React.useState<number | null>(null);
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  const { data: modules, isLoading: loadingModules } = useQuery({
    queryKey: ['course-modules', id],
    queryFn: () => getCourseModules(id!),
  });

  const { data: progress } = useQuery({
    queryKey: ['course-progress', id],
    queryFn: () => getCourseProgress(id!),
    enabled: user?.role === 'student',
  });

  const progressMutation = useMutation({
    mutationFn: (lessonId: number) => updateProgress({ lesson_id: lessonId, completed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', id] });
    }
  });

  const handleComplete = () => {
    if (activeLessonId) {
      progressMutation.mutate(activeLessonId);
    }
  };

  const isCompleted = (lessonId: number) => {
    return progress?.some((p: any) => p.lesson_id === lessonId && p.completed);
  };

  if (loadingModules) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar - Course Outline */}
      <Card className="w-80 glass-card flex flex-col h-full overflow-hidden border-white/10">
        <div className="p-4 border-b border-white/10 bg-black/20">
          <Link to={`/courses/${id}`} className="text-cyan-400 hover:text-cyan-300 text-sm mb-2 inline-block">
            &larr; Back to Course
          </Link>
          <h2 className="text-lg font-bold text-white">Course Content</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {modules?.map((module: any) => (
            <div key={module.id} className="space-y-2">
              <h3 className="font-semibold text-slate-200 text-sm px-2">{module.title}</h3>
              <ModuleLessons 
                moduleId={module.id} 
                activeLessonId={activeLessonId}
                setActiveLessonId={setActiveLessonId}
                isCompleted={isCompleted}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="flex-1 h-full">
        {activeLessonId ? (
          <LessonPlayer lessonId={activeLessonId} onComplete={handleComplete} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-black/20 rounded-xl border border-white/5">
            <BookOpen size={48} className="text-cyan-500/50 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Welcome to the Course!</h2>
            <p className="text-slate-400 max-w-md">Select a lesson from the sidebar to begin learning. Your progress will be tracked automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ModuleLessons = ({ moduleId, activeLessonId, setActiveLessonId, isCompleted }: any) => {
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['module-lessons', moduleId],
    queryFn: () => getModuleLessons(moduleId),
  });

  if (isLoading) return <div className="text-xs text-slate-500 pl-4">Loading lessons...</div>;

  return (
    <div className="space-y-1">
      {lessons?.map((lesson: any) => {
        const completed = isCompleted(lesson.id);
        const isActive = activeLessonId === lesson.id;
        
        return (
          <button
            key={lesson.id}
            onClick={() => setActiveLessonId(lesson.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors ${
              isActive ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/5 text-slate-300'
            }`}
          >
            {completed ? (
              <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <Video size={16} className={isActive ? "text-cyan-400" : "text-slate-500"} flex-shrink-0 />
            )}
            <span className="truncate">{lesson.title}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CoursePlayerPage;
