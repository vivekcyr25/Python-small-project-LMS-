import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourseModules, createModule, getModuleLessons, createLesson } from '../../features/content/api';
import useAuthStore from '../../stores/authStore';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ChevronDown, ChevronUp, Plus, Video, FileText } from 'lucide-react';

interface CourseContentProps {
  courseId: number;
  instructorId: number;
}

const ModuleItem = ({ module, isInstructor }: { module: any, isInstructor: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const queryClient = useQueryClient();

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['module-lessons', module.id],
    queryFn: () => getModuleLessons(module.id),
    enabled: isOpen,
  });

  const lessonMutation = useMutation({
    mutationFn: (data: any) => createLesson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-lessons', module.id] });
      setLessonTitle('');
      setShowLessonForm(false);
    },
  });

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle) return;
    lessonMutation.mutate({ title: lessonTitle, module_id: module.id });
  };

  return (
    <Card className="glass-card mb-4 overflow-hidden border-white/10">
      <div 
        className="p-4 bg-white/5 cursor-pointer flex justify-between items-center hover:bg-white/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-semibold text-white">{module.title}</h3>
        {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </div>
      
      {isOpen && (
        <CardContent className="p-4 pt-2 bg-black/20">
          {isLoading ? (
            <div className="text-slate-400 text-sm py-2">Loading lessons...</div>
          ) : (
            <div className="space-y-2 mt-2">
              {lessons?.length === 0 ? (
                <p className="text-slate-400 text-sm">No lessons in this module yet.</p>
              ) : (
                lessons?.map((lesson: any) => (
                  <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                    <Video size={16} className="text-cyan-400" />
                    <span className="text-slate-200 text-sm">{lesson.title}</span>
                  </div>
                ))
              )}
              
              {isInstructor && (
                <div className="mt-4 pt-2 border-t border-white/10">
                  {showLessonForm ? (
                    <form onSubmit={handleCreateLesson} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Lesson title..."
                        value={lessonTitle}
                        onChange={(e) => setLessonTitle(e.target.value)}
                        className="flex-1 bg-black/50 border border-white/10 rounded-md px-3 py-1 text-sm text-white"
                        autoFocus
                      />
                      <Button type="submit" size="sm" variant="gradient" disabled={lessonMutation.isPending}>
                        Save
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setShowLessonForm(false)}>
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <Button size="sm" variant="ghost" className="text-xs flex items-center gap-1" onClick={() => setShowLessonForm(true)}>
                      <Plus size={14} /> Add Lesson
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

const CourseContent = ({ courseId, instructorId }: CourseContentProps) => {
  const user = useAuthStore(state => state.user);
  const isInstructor = user?.role === 'instructor' && user.id === instructorId;
  const isAdmin = user?.role === 'admin';
  const canEdit = isInstructor || isAdmin;
  
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const queryClient = useQueryClient();

  const { data: modules, isLoading } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: () => getCourseModules(courseId),
  });

  const moduleMutation = useMutation({
    mutationFn: (data: any) => createModule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', courseId] });
      setModuleTitle('');
      setShowModuleForm(false);
    },
  });

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle) return;
    moduleMutation.mutate({ title: moduleTitle, course_id: courseId });
  };

  if (isLoading) {
    return <div className="text-slate-400 py-4">Loading course content...</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Course Content</h2>
        {canEdit && !showModuleForm && (
          <Button onClick={() => setShowModuleForm(true)} variant="outline" size="sm" className="flex items-center gap-2">
            <Plus size={16} /> Add Module
          </Button>
        )}
      </div>

      {canEdit && showModuleForm && (
        <Card className="glass-card mb-6 p-4 border-cyan-500/50">
          <form onSubmit={handleCreateModule} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-slate-300">Module Title</label>
              <input
                type="text"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-white"
                placeholder="e.g. Introduction to React"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowModuleForm(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={moduleMutation.isPending}>
                Create Module
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {modules?.length === 0 ? (
          <div className="text-center py-8 border border-white/10 rounded-xl bg-white/5">
            <p className="text-slate-400">No content available for this course yet.</p>
          </div>
        ) : (
          modules?.map((module: any) => (
            <ModuleItem key={module.id} module={module} isInstructor={canEdit} />
          ))
        )}
      </div>
    </div>
  );
};

export default CourseContent;
