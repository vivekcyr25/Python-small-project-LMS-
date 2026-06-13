import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourse } from '../../features/courses/api';
import { getMyEnrollments, enrollInCourse } from '../../features/enrollments/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import useAuthStore from '../../stores/authStore';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, Globe, Award, ArrowRight, PlayCircle } from 'lucide-react';

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
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
        <div className="w-8 h-8 rounded-full border-2 border-ios-accent/30 border-t-ios-accent animate-spin" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-12 text-ios-text-secondary">Course not found</div>;
  }

  const isEnrolled = enrollments?.some((e: any) => e.course_id === Number(id));
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

  const learnItems = [
    'Master core concepts and principles',
    'Build real-world projects',
    'Best practices and industry standards',
    'Advanced techniques and optimization',
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <motion.div variants={item} className="glass-card overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-ios-accent/8 via-transparent to-ios-purple/8 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-ios-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-7 relative z-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex gap-2">
              <Badge variant={course.is_published ? 'success' : 'warning'}>
                {course.is_published ? 'Published' : 'Draft'}
              </Badge>
              <Badge variant="info" className="capitalize">{course.level || 'Beginner'}</Badge>
            </div>
            <h1 className="text-[32px] font-semibold text-ios-text tracking-tight leading-tight">{course.title}</h1>
            <p className="text-ios-text-secondary text-[15px] leading-relaxed line-clamp-3">{course.description}</p>
            <div className="flex flex-wrap gap-4 text-[13px] text-ios-text-secondary">
              <span className="flex items-center gap-1.5"><Clock size={15} /> 12 Hours</span>
              <span className="flex items-center gap-1.5"><Globe size={15} /> English</span>
              <span className="flex items-center gap-1.5"><Award size={15} /> Certificate</span>
            </div>
          </div>

          <Card className="p-5 flex flex-col justify-between bg-white/[0.03]">
            <div>
              <p className="text-[12px] text-ios-text-secondary mb-1">Course Price</p>
              <p className="text-[36px] font-semibold text-ios-text">${course.price}</p>
            </div>
            <div className="mt-5 space-y-2">
              {user?.role === 'student' && (
                isEnrolled ? (
                  <Link to={`/courses/${id}/learn`}>
                    <Button variant="ios" className="w-full gap-2">
                      <PlayCircle size={16} /> Start Learning
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending || !course.is_published}
                    variant="ios"
                    className="w-full gap-2"
                  >
                    {enrollMutation.isPending ? 'Enrolling...' : <>Enroll Now <ArrowRight size={16} /></>}
                  </Button>
                )
              )}
              {(user?.role === 'admin' || (user?.role === 'instructor' && course.instructor_id === user.id)) && (
                <>
                  <Link to={`/instructor/courses/${id}/builder`}>
                    <Button variant="ios" className="w-full gap-2"><PlayCircle size={16} /> Open Builder</Button>
                  </Link>
                  <Link to={`/courses/${id}/edit`}>
                    <Button variant="outline" className="w-full">Edit Metadata</Button>
                  </Link>
                </>
              )}
            </div>
          </Card>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <motion.div variants={item}>
            <Card className="p-6">
              <h2 className="text-[17px] font-semibold text-ios-text mb-4">What you'll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {learnItems.map((text, i) => (
                  <div key={i} className="flex items-start gap-2 text-[13px] text-ios-text-secondary">
                    <CheckCircle size={15} className="text-ios-accent mt-0.5 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="p-6">
              <h2 className="text-[17px] font-semibold text-ios-text mb-3">Course Description</h2>
              <p className="text-[14px] text-ios-text-secondary leading-relaxed">{course.description}</p>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <Card className="p-6">
            <h2 className="text-[15px] font-semibold text-ios-text mb-4">This course includes</h2>
            <div className="space-y-3 text-[13px] text-ios-text-secondary">
              <div className="flex items-center gap-2"><BookOpen size={15} className="text-ios-accent" /> 10 Modules</div>
              <div className="flex items-center gap-2"><Clock size={15} className="text-ios-accent" /> Lifetime access</div>
              <div className="flex items-center gap-2"><Award size={15} className="text-ios-accent" /> Certificate</div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CourseDetailPage;
