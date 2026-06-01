import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInstructorCourses } from '../../features/courses/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PlusCircle, BarChart3, Edit, Eye, Sparkles, Wrench } from 'lucide-react';

const InstructorDashboard = () => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: getInstructorCourses,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const publishedCourses = courses?.filter((c: any) => c.is_published) || [];
  const draftCourses = courses?.filter((c: any) => !c.is_published) || [];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Hero */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-white/10 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -z-10" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                Instructor Studio <Sparkles className="text-violet-400" size={24} />
              </h1>
              <p className="text-slate-300 mt-2 text-lg">Manage your courses and track student performance.</p>
            </div>
            <Link to="/courses/new">
              <Button variant="gradient" className="flex items-center gap-2">
                <PlusCircle size={16} /> Create Course
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">My Courses</p>
            <p className="text-2xl font-bold text-white">{courses?.length || 0}</p>
          </div>
        </Card>
        <Card className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Published</p>
            <p className="text-2xl font-bold text-white">{publishedCourses.length}</p>
          </div>
        </Card>
        <Card className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Edit size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Drafts</p>
            <p className="text-2xl font-bold text-white">{draftCourses.length}</p>
          </div>
        </Card>
      </motion.div>

      {/* Course list */}
      <motion.div variants={item}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">My Courses</h2>
        </div>

        {courses?.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <p className="text-slate-400">You haven't created any courses yet.</p>
            <Link to="/courses/new">
              <Button variant="glass" className="mt-4">Create Your First Course</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((course: any) => (
              <motion.div key={course.id} variants={item}>
                <Card className="glass-card h-full flex flex-col overflow-hidden group">
                  <div className="h-40 bg-gradient-to-br from-violet-500/30 to-indigo-600/30 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <BookOpen size={48} className="text-white/50 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 right-3">
                      <Badge variant={course.is_published ? 'success' : 'warning'}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-5">
                    <CardTitle className="text-lg font-bold text-white line-clamp-1">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-4">{course.description}</p>
                    </div>
                    <div className="space-y-2 mt-auto">
                      <Link to={`/instructor/courses/${course.id}/builder`} className="block">
                        <Button
                          data-testid={`builder-link-${course.id}`}
                          className="w-full flex items-center justify-center gap-2"
                          variant="gradient"
                          size="sm"
                        >
                          <Wrench size={14} /> Open Course Builder
                        </Button>
                      </Link>
                      <div className="flex space-x-2">
                        <Link to={`/courses/${course.id}`} className="flex-1">
                          <Button className="w-full flex items-center justify-center gap-2" variant="glass" size="sm">
                            <Eye size={14} /> View
                          </Button>
                        </Link>
                        <Link to={`/courses/${course.id}/edit`} className="flex-1">
                          <Button className="w-full flex items-center justify-center gap-2" variant="outline" size="sm">
                            <Edit size={14} /> Metadata
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default InstructorDashboard;
