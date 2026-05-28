import * as React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourse } from '../../features/courses/api';
import { getMyEnrollments, enrollInCourse } from '../../features/enrollments/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import useAuthStore from '../../stores/authStore';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, Globe, Award, Sparkles, ArrowRight, Lock, PlayCircle } from 'lucide-react';
import CourseContent from '../../components/course/CourseContent';

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourse(id!),
    enabled: !!id,
  });

  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: getMyEnrollments,
    enabled: user?.role === 'student',
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollInCourse(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      alert('Enrolled successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Failed to enroll');
    },
  });

  if (loadingCourse || (user?.role === 'student' && loadingEnrollments)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Course not found</p>
      </div>
    );
  }

  const isEnrolled = enrollments?.some((e: any) => e.course_id === Number(id));

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
      className="space-y-8 max-w-5xl mx-auto"
    >
      {/* Hero Section */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex gap-2">
                <Badge variant={course.is_published ? 'success' : 'warning'}>
                  {course.is_published ? 'Published' : 'Draft'}
                </Badge>
                <Badge variant="premium" className="capitalize">
                  {course.level || 'Beginner'}
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold text-white">{course.title}</h1>
              <p className="text-slate-300 text-lg line-clamp-3">{course.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock size={16} /> <span>12 Hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe size={16} /> <span>English</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award size={16} /> <span>Certificate of Completion</span>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <Card className="glass-card p-6 flex flex-col justify-between h-full bg-black/20 border-white/5">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Course Price</p>
                  <p className="text-4xl font-bold text-white">${course.price}</p>
                </div>
                
                <div className="mt-6">
                  {user?.role === 'student' && (
                    isEnrolled ? (
                      <Link to={`/courses/${id}/learn`} className="w-full">
                        <Button variant="gradient" className="w-full flex items-center justify-center gap-2">
                          <PlayCircle size={16} /> Start Learning
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => enrollMutation.mutate()}
                        disabled={enrollMutation.isPending || !course.is_published}
                        variant="gradient"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        {enrollMutation.isPending ? 'Enrolling...' : (
                          <>Enroll Now <ArrowRight size={16} /></>
                        )}
                      </Button>
                    )
                  )}

                  {(user?.role === 'admin' || (user?.role === 'instructor' && course.instructor_id === user.id)) && (
                    <Link to={`/courses/${id}/edit`} className="w-full">
                      <Button variant="outline" className="w-full">Edit Course</Button>
                    </Link>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <motion.div variants={item}>
            <Card className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">What you'll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Master core concepts and principles',
                  'Build real-world projects',
                  'Best practices and industry standards',
                  'Advanced techniques and optimization',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Course Description</h2>
              <p className="text-slate-300 text-sm leading-relaxed">{course.description}</p>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <CourseContent courseId={Number(id)} instructorId={course.instructor_id} />
          </motion.div>
        </div>

        {/* Sidebar Info */}
        <div className="md:col-span-1 space-y-6">
          <motion.div variants={item}>
            <Card className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-4">This course includes:</h2>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-cyan-400" />
                  <span>10 Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-cyan-400" />
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-cyan-400" />
                  <span>Certificate of completion</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetailPage;
