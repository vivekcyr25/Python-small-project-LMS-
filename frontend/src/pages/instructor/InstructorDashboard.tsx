import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInstructorCourses } from '../../features/courses/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PlusCircle, BarChart3, Edit, Eye, Sparkles, Wrench } from 'lucide-react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Page,
  Sort,
  Filter,
} from '@syncfusion/ej2-react-grids';

const InstructorDashboard = () => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: getInstructorCourses,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-ios-accent/30 border-t-ios-accent animate-spin" />
      </div>
    );
  }

  const publishedCourses = courses?.filter((c: any) => c.is_published) || [];
  const draftCourses = courses?.filter((c: any) => !c.is_published) || [];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

  const gridData = (courses || []).map((c: any) => ({
    ...c,
    status: c.is_published ? 'Published' : 'Draft',
  }));

  const statusTemplate = (props: any) => (
    <Badge variant={props.is_published ? 'success' : 'warning'}>{props.status}</Badge>
  );

  const actionsTemplate = (props: any) => (
    <div className="flex gap-2">
      <Link to={`/instructor/courses/${props.id}/builder`}>
        <Button variant="ios" size="sm"><Wrench size={12} /></Button>
      </Link>
      <Link to={`/courses/${props.id}`}>
        <Button variant="secondary" size="sm"><Eye size={12} /></Button>
      </Link>
    </div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="glass-card p-7 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-ios-accent/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-ios-purple/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div>
            <h1 className="text-[28px] font-semibold text-ios-text tracking-tight flex items-center gap-2">
              Instructor Studio <Sparkles className="text-ios-purple" size={22} />
            </h1>
            <p className="text-ios-text-secondary mt-1.5 text-[15px]">
              Manage courses and track student performance.
            </p>
          </div>
          <Link to="/courses/new">
            <Button variant="ios" className="flex items-center gap-2">
              <PlusCircle size={16} /> Create Course
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-ios-accent/15 flex items-center justify-center text-ios-accent">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-[10px] text-ios-text-secondary font-medium uppercase tracking-wide">My Courses</p>
            <p className="text-2xl font-semibold text-ios-text">{courses?.length || 0}</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-ios-green/15 flex items-center justify-center text-ios-green">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-[10px] text-ios-text-secondary font-medium uppercase tracking-wide">Published</p>
            <p className="text-2xl font-semibold text-ios-text">{publishedCourses.length}</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-ios-orange/15 flex items-center justify-center text-ios-orange">
            <Edit size={20} />
          </div>
          <div>
            <p className="text-[10px] text-ios-text-secondary font-medium uppercase tracking-wide">Drafts</p>
            <p className="text-2xl font-semibold text-ios-text">{draftCourses.length}</p>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <h2 className="text-[17px] font-semibold text-ios-text mb-4">My Courses</h2>

        {courses?.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-ios-text-secondary">You haven't created any courses yet.</p>
            <Link to="/courses/new">
              <Button variant="ios" className="mt-4">Create Your First Course</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="hidden lg:block glass-card p-4 overflow-hidden">
              <GridComponent
                dataSource={gridData}
                allowPaging
                allowSorting
                allowFiltering
                pageSettings={{ pageSize: 6 }}
                filterSettings={{ type: 'Menu' }}
                height="auto"
              >
                <ColumnsDirective>
                  <ColumnDirective field="title" headerText="Course" width="200" />
                  <ColumnDirective field="level" headerText="Level" width="100" />
                  <ColumnDirective field="price" headerText="Price" width="80" format="C2" />
                  <ColumnDirective field="status" headerText="Status" width="110" template={statusTemplate} />
                  <ColumnDirective headerText="Actions" width="120" template={actionsTemplate} />
                </ColumnsDirective>
                <Inject services={[Page, Sort, Filter]} />
              </GridComponent>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
              {courses?.map((course: any) => (
                <Card key={course.id} className="overflow-hidden flex flex-col">
                  <div className="h-32 bg-gradient-to-br from-ios-accent/10 to-ios-purple/10 relative flex items-center justify-center">
                    <BookOpen size={36} className="text-white/25" />
                    <div className="absolute top-3 right-3">
                      <Badge variant={course.is_published ? 'success' : 'warning'}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-1">
                    <CardTitle className="text-[15px] line-clamp-1">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex flex-col gap-2">
                    <p className="text-[12px] text-ios-text-secondary line-clamp-2">{course.description}</p>
                    <Link to={`/instructor/courses/${course.id}/builder`}>
                      <Button variant="ios" size="sm" className="w-full gap-2">
                        <Wrench size={13} /> Open Builder
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default InstructorDashboard;
