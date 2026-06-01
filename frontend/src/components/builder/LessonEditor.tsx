import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Trash2, Eye, EyeOff, Save, X, ChevronDown, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizBuilder from './QuizBuilder';
import { updateLesson, deleteLesson, type Lesson, type LessonType } from '../../features/lessons/api';

interface LessonEditorProps {
  lesson: Lesson;
  sectionId: number;
}

const LessonEditor = ({ lesson, sectionId }: LessonEditorProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: lesson.title,
    description: lesson.description || '',
    lesson_type: lesson.lesson_type as LessonType,
    content_text: lesson.content_text || '',
    content_url: lesson.content_url || '',
    duration_seconds: lesson.duration_seconds || 0,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['lessons', sectionId] });

  const save = useMutation({
    mutationFn: (payload: any) => updateLesson(lesson.id, payload),
    onSuccess: () => { invalidate(); setEditing(false); },
  });

  const del = useMutation({
    mutationFn: () => deleteLesson(lesson.id),
    onSuccess: invalidate,
  });

  return (
    <div
      data-testid={`lesson-editor-${lesson.id}`}
      className="rounded-lg border border-white/10 bg-black/30 overflow-hidden"
    >
      <div className="flex items-center gap-3 p-3">
        <button type="button" onClick={() => setOpen(!open)} className="text-slate-500 hover:text-white">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className="flex-1">
          <p className="text-sm text-white">{lesson.title}</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">{lesson.lesson_type}</p>
        </div>

        <button
          type="button"
          data-testid={`lesson-preview-toggle-${lesson.id}`}
          onClick={() => save.mutate({ is_preview: !lesson.is_preview })}
          title={lesson.is_preview ? 'Preview enabled' : 'Make preview'}
          className={`p-1.5 rounded ${lesson.is_preview ? 'text-amber-300' : 'text-slate-500'} hover:bg-white/5`}
        >
          <Star size={14} fill={lesson.is_preview ? 'currentColor' : 'none'} />
        </button>

        <button
          type="button"
          data-testid={`lesson-publish-toggle-${lesson.id}`}
          onClick={() => save.mutate({ is_published: !lesson.is_published })}
          className={`p-1.5 rounded ${lesson.is_published ? 'text-emerald-400' : 'text-slate-500'} hover:bg-white/5`}
        >
          {lesson.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>

        <button type="button" onClick={() => { setEditing(true); setOpen(true); }} className="p-1.5 rounded text-slate-400 hover:bg-white/5">
          <Edit2 size={14} />
        </button>

        <button
          type="button"
          data-testid={`lesson-delete-${lesson.id}`}
          onClick={() => { if (confirm('Delete this lesson?')) del.mutate(); }}
          className="p-1.5 rounded text-red-400 hover:bg-red-500/10"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-black/40"
          >
            <div className="p-4 space-y-3">
              {editing ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Lesson title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                    />
                    <select
                      value={form.lesson_type}
                      onChange={(e) => setForm({ ...form, lesson_type: e.target.value as LessonType })}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                    >
                      <option value="video">Video</option>
                      <option value="markdown">Markdown</option>
                      <option value="pdf">PDF</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>

                  <textarea
                    placeholder="Description (optional)"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                  />

                  {form.lesson_type === 'markdown' && (
                    <textarea
                      placeholder="Markdown content…"
                      value={form.content_text}
                      onChange={(e) => setForm({ ...form, content_text: e.target.value })}
                      rows={6}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono"
                    />
                  )}

                  {(form.lesson_type === 'video' || form.lesson_type === 'pdf') && (
                    <input
                      placeholder={form.lesson_type === 'video' ? 'Video URL (mp4 or HLS)' : 'PDF URL'}
                      value={form.content_url}
                      onChange={(e) => setForm({ ...form, content_url: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                    />
                  )}

                  {form.lesson_type === 'video' && (
                    <input
                      type="number"
                      placeholder="Duration (seconds)"
                      value={form.duration_seconds}
                      onChange={(e) => setForm({ ...form, duration_seconds: Number(e.target.value) })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                    />
                  )}

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => { setEditing(false); setForm({ ...form, title: lesson.title }); }}
                      className="px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:bg-white/5"
                    >
                      <X size={14} className="inline mr-1" /> Cancel
                    </button>
                    <button
                      type="button"
                      data-testid={`lesson-save-${lesson.id}`}
                      onClick={() => save.mutate({
                        title: form.title,
                        description: form.description || null,
                        lesson_type: form.lesson_type,
                        content_text: form.content_text || null,
                        content_url: form.content_url || null,
                        duration_seconds: form.duration_seconds || null,
                      })}
                      className="px-3 py-1.5 rounded-lg text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30"
                    >
                      <Save size={14} className="inline mr-1" /> Save
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2 text-sm text-slate-400">
                  {lesson.description && <p>{lesson.description}</p>}
                  {lesson.lesson_type === 'markdown' && lesson.content_text && (
                    <pre className="whitespace-pre-wrap text-xs text-slate-500 bg-black/40 p-2 rounded max-h-40 overflow-y-auto">
                      {lesson.content_text}
                    </pre>
                  )}
                  {(lesson.lesson_type === 'video' || lesson.lesson_type === 'pdf') && lesson.content_url && (
                    <p className="text-xs text-cyan-400 truncate">{lesson.content_url}</p>
                  )}
                </div>
              )}

              {lesson.lesson_type === 'quiz' && !editing && (
                <div className="pt-3 border-t border-white/10">
                  <QuizBuilder lessonId={lesson.id} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonEditor;
