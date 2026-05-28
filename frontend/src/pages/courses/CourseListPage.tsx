import * as React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCourses } from '../../features/courses/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { motion } from 'framer-motion';
import { BookOpen, Search, PlusCircle, ArrowRight, Sparkles } from 'lucide-react';

const CourseListPage = () => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const filteredCourses = courses?.filter((course: any) =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.description.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Hero Header */}
      <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-white/10 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              Explore Courses <Sparkles className="text-emerald-400" size={24} />
            </h1>
            <p className="text-slate-300 mt-2 text-lg">Discover new skills and knowledge.</p>
          </div>
          {(user?.role === 'instructor' || user?.role === 'admin') && (
            <Link to="/courses/new">
              <Button variant="gradient" className="flex items-center gap-2">
                <PlusCircle size={16} /> Create Course
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={item} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
        <Input
          type="text"
          placeholder="Search courses..."
          className="pl-10 bg-white/5 border-white/10 rounded-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {/* Course Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course: any) => (
          <motion.div key={course.id} variants={item}>
            <Card className="glass-card h-full flex flex-col overflow-hidden group">
              <div className="h-40 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <BookOpen size={48} className="text-white/50 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge variant={course.is_published ? 'success' : 'warning'}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <Badge variant="premium" className="capitalize">
                    {course.level || 'Beginner'}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-5">
                <CardTitle className="text-lg font-bold text-white line-clamp-1">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 flex-grow flex flex-col justify-between">
                <div>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">{course.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-cyan-400">${course.price}</span>
                    <span className="text-xs text-slate-500 capitalize">{course.level}</span>
                  </div>
                </div>
                <Link to={`/courses/${course.id}`}>
                  <Button className="w-full flex items-center justify-center gap-2" variant="glass">
                    View Course <ArrowRight size={14} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filteredCourses.length === 0 && (
          <p className="text-slate-500 col-span-full text-center py-12">No courses found.</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CourseListPage;
