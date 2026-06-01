import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus, Eye, EyeOff, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import LessonEditor from './LessonEditor';
import { updateSection, deleteSection, type Section } from '../../features/sections/api';
import { listLessons, createLesson, type Lesson } from '../../features/lessons/api';
import { useQuery } from '@tanstack/react-query';

interface SectionEditorProps {
  section: Section;
  courseId: number;
}

const SectionEditor = ({ section, courseId }: SectionEditorProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [description, setDescription] = useState(section.description || '');
  const [showNewLesson, setShowNewLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['sections', courseId] });
    queryClient.invalidateQueries({ queryKey: ['lessons', section.id] });
  };

  const { data: lessons } = useQuery({
    queryKey: ['lessons', section.id],
    queryFn: () => listLessons(section.id),
    enabled: open,
  });

  const saveSection = useMutation({
    mutationFn: (payload: Partial<Section>) => updateSection(section.id, payload),
    onSuccess: () => {
      invalidate();
      setEditing(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteSection(section.id),
    onSuccess: invalidate,
  });

  const addLesson = useMutation({
    mutationFn: () =>
      createLesson(section.id, {
        title: newLessonTitle,
        lesson_type: 'markdown',
        is_published: false,
      }),
    onSuccess: () => {
      setNewLessonTitle('');
      setShowNewLesson(false);
      queryClient.invalidateQueries({ queryKey: ['lessons', section.id] });
    },
  });

  return (
    <div
      data-testid={`section-editor-${section.id}`}
      className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
    >
      <div className="flex items-center gap-3 p-4">
        <button type="button" onClick={() => setOpen(!open)} className="text-slate-400 hover:text-white">
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        {editing ? (
          <div className="flex-1 flex gap-2">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
            />
            <input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
            />
          </div>
        ) : (
          <div className="flex-1">
            <p className="text-white font-semibold">{section.title}</p>
            {section.description && <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>}
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            data-testid={`section-publish-toggle-${section.id}`}
            onClick={() => saveSection.mutate({ is_published: !section.is_published })}
            title={section.is_published ? 'Published — click to unpublish' : 'Draft — click to publish'}
            className={`p-2 rounded-lg ${section.is_published ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-white/5'}`}
          >
            {section.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          {editing ? (
            <>
              <button
                type="button"
                onClick={() => saveSection.mutate({ title, description })}
                className="p-2 rounded-lg text-cyan-300 hover:bg-cyan-500/10"
              >
                <Save size={16} />
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setTitle(section.title); setDescription(section.description || ''); }}
                className="p-2 rounded-lg text-slate-400 hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setEditing(true)} className="p-2 rounded-lg text-slate-400 hover:bg-white/5">
                <Edit2 size={16} />
              </button>
              <button
                type="button"
                data-testid={`section-delete-${section.id}`}
                onClick={() => { if (confirm('Delete this section and all its lessons?')) deleteMut.mutate(); }}
                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="p-4 space-y-2">
              {(lessons || []).map((l: Lesson) => (
                <LessonEditor key={l.id} lesson={l} sectionId={section.id} />
              ))}

              {showNewLesson ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); if (newLessonTitle.trim()) addLesson.mutate(); }}
                  className="flex gap-2 pt-2"
                >
                  <input
                    autoFocus
                    placeholder="Lesson title…"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                  <Button type="submit" variant="gradient" size="sm" disabled={addLesson.isPending}>
                    Add
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewLesson(false)}>
                    Cancel
                  </Button>
                </form>
              ) : (
                <Button
                  type="button"
                  data-testid={`add-lesson-btn-${section.id}`}
                  onClick={() => setShowNewLesson(true)}
                  variant="ghost"
                  size="sm"
                  className="text-xs flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Lesson
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SectionEditor;
