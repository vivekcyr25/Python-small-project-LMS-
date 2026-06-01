import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourse, createCourse, updateCourse } from '../../features/courses/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { motion } from 'framer-motion';
import { Sparkles, Save, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const CourseFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail_url: '',
    level: 'beginner',
    price: '0.00',
    is_published: false,
  });

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourse(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        slug: course.slug,
        description: course.description || '',
        thumbnail_url: course.thumbnail_url || '',
        level: course.level || 'beginner',
        price: course.price.toString(),
        is_published: course.is_published,
      });
    }
  }, [course]);

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? updateCourse(id!, data) : createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['course', id] });
      navigate('/courses');
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Failed to save course');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      price: parseFloat(formData.price),
    });
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const inputClasses = cn(
    "flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500",
    "disabled:cursor-not-allowed disabled:opacity-50"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <Card className="glass-card">
        <CardHeader className="border-b border-white/5 p-6">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-cyan-400" size={20} />
            {isEdit ? 'Edit Course' : 'Create New Course'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Title</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Course Title"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Slug</label>
              <Input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                disabled={isEdit}
                placeholder="course-slug"
              />
              <p className="text-xs text-slate-500">Used in the URL. Cannot be changed after creation.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Description</label>
              <textarea
                name="description"
                className={cn(inputClasses, "min-h-[120px] resize-none")}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what students will learn..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Thumbnail URL</label>
              <Input
                name="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Level</label>
                <select
                  name="level"
                  className={inputClasses}
                  value={formData.level}
                  onChange={handleChange}
                >
                  <option value="beginner" className="bg-[#030712] text-white">Beginner</option>
                  <option value="intermediate" className="bg-[#030712] text-white">Intermediate</option>
                  <option value="advanced" className="bg-[#030712] text-white">Advanced</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Price ($)</label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/5">
              <input
                type="checkbox"
                name="is_published"
                id="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="h-4 w-4 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0"
              />
              <label htmlFor="is_published" className="text-sm font-medium text-white cursor-pointer">
                Publish this course
              </label>
              <p className="text-xs text-slate-500 ml-auto">Make it visible to students immediately.</p>
            </div>

            <div className="flex space-x-4 mt-8">
              <Button type="submit" variant="gradient" className="flex-1 flex items-center justify-center gap-2" disabled={mutation.isPending}>
                <Save size={16} />
                {mutation.isPending ? 'Saving...' : 'Save Course'}
              </Button>
              <Button type="button" variant="glass" className="flex-1 flex items-center justify-center gap-2" onClick={() => navigate('/courses')}>
                <X size={16} />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseFormPage;
