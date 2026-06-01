import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft, BookOpen } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import SectionEditor from '../../components/builder/SectionEditor';
import { getCourse } from '../../features/courses/api';
import { listSections, createSection } from '../../features/sections/api';

const InstructorCourseBuilderPage = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const queryClient = useQueryClient();

  const [showNewSection, setShowNewSection] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourse(String(courseId)),
    enabled: !isNaN(courseId),
  });

  const { data: sections, isLoading: loadingSections } = useQuery({
    queryKey: ['sections', courseId],
    queryFn: () => listSections(courseId),
    enabled: !isNaN(courseId),
  });

  const addSection = useMutation({
    mutationFn: () => createSection(courseId, { title: newTitle, is_published: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', courseId] });
      setNewTitle('');
      setShowNewSection(false);
    },
  });

  if (loadingCourse || loadingSections) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div data-testid="course-builder-page" className="max-w-5xl mx-auto space-y-6">
      <Link
        to={`/courses/${courseId}`}
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft size={14} /> Back to course
      </Link>

      {/* Course header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card p-6 flex items-center gap-5 border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 flex items-center justify-center text-cyan-300">
            <BookOpen size={26} />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-cyan-400/80">Course Builder</p>
            <h1 className="text-2xl font-bold text-white mt-1">{course?.title || 'Course'}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={course?.is_published ? 'success' : 'warning'}>
                {course?.is_published ? 'Published' : 'Draft'}
              </Badge>
              <Badge variant="premium" className="capitalize">
                {course?.level || 'Beginner'}
              </Badge>
              <span className="text-xs text-slate-500">
                {sections?.length ?? 0} section{(sections?.length ?? 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <Link to={`/courses/${courseId}/edit`}>
            <Button variant="glass" size="sm">Edit metadata</Button>
          </Link>
        </Card>
      </motion.div>

      {/* Sections list */}
      <div className="space-y-3">
        {(sections || []).map((s) => (
          <motion.div
            key={s.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <SectionEditor section={s} courseId={courseId} />
          </motion.div>
        ))}

        {showNewSection ? (
          <form
            onSubmit={(e) => { e.preventDefault(); if (newTitle.trim()) addSection.mutate(); }}
            className="rounded-xl border border-cyan-400/40 bg-cyan-500/5 p-4 flex gap-2"
          >
            <input
              autoFocus
              placeholder="Section title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
            />
            <Button type="submit" variant="gradient" size="sm" disabled={addSection.isPending}>Add</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewSection(false)}>Cancel</Button>
          </form>
        ) : (
          <Button
            data-testid="add-section-btn"
            onClick={() => setShowNewSection(true)}
            variant="glass"
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Section
          </Button>
        )}
      </div>
    </div>
  );
};

export default InstructorCourseBuilderPage;
