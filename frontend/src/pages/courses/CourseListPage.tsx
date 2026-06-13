import * as React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCourses } from '../../features/courses/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { motion } from 'framer-motion';
import { BookOpen, PlusCircle, ArrowRight, Sparkles } from 'lucide-react';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';

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
        <div className="w-8 h-8 rounded-full border-2 border-ios-accent/30 border-t-ios-accent animate-spin" />
      </div>
    );
  }

  const filteredCourses = courses?.filter((course: any) =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.description.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="glass-card p-7 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-ios-accent/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div>
            <h1 className="text-[28px] font-semibold text-ios-text tracking-tight flex items-center gap-2">
              Explore Courses
              <Sparkles className="text-ios-accent" size={22} />
            </h1>
            <p className="text-ios-text-secondary mt-1.5 text-[15px]">
              Discover skills crafted for the modern learner.
            </p>
          </div>
          {(user?.role === 'instructor' || user?.role === 'admin') && (
            <Link to="/courses/new">
              <Button variant="ios" className="flex items-center gap-2">
                <PlusCircle size={16} /> Create Course
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      <motion.div variants={item} className="max-w-md">
        <TextBoxComponent
          placeholder="Search courses..."
          value={search}
          change={(e: { value: string }) => setSearch(e.value)}
          cssClass="e-outline"
          showClearButton
          floatLabelType="Never"
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course: any) => (
          <motion.div key={course.id} variants={item}>
            <Card className="h-full flex flex-col overflow-hidden group">
              <div className="h-36 bg-gradient-to-br from-ios-accent/10 to-ios-purple/10 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                <BookOpen size={40} className="text-white/30 group-hover:scale-110 transition-transform duration-700 ease-ios" />
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <Badge variant={course.is_published ? 'success' : 'warning'}>
                    {course.is_published ? 'Live' : 'Draft'}
                  </Badge>
                  <Badge variant="info" className="capitalize">
                    {course.level || 'Beginner'}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-[17px] font-semibold line-clamp-1">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 flex-grow flex flex-col justify-between">
                <div>
                  <p className="text-[13px] text-ios-text-secondary line-clamp-2 mb-4 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[17px] font-semibold text-ios-accent">${course.price}</span>
                    <span className="text-[11px] text-ios-text-secondary capitalize">{course.level}</span>
                  </div>
                </div>
                <Link to={`/courses/${course.id}`}>
                  <Button className="w-full flex items-center justify-center gap-2" variant="secondary">
                    View Course <ArrowRight size={14} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filteredCourses.length === 0 && (
          <p className="text-ios-text-secondary col-span-full text-center py-16 text-[15px]">
            No courses found.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CourseListPage;
