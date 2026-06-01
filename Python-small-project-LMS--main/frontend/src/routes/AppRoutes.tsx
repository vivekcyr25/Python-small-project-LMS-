import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';
import AppLayout from '../components/layout/AppLayout';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import StudentDashboard from '../pages/student/StudentDashboard';
import InstructorDashboard from '../pages/instructor/InstructorDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import CourseListPage from '../pages/courses/CourseListPage';
import CourseDetailPage from '../pages/courses/CourseDetailPage';
import CourseLearnPage from '../pages/courses/CourseLearnPage';
import CourseFormPage from '../pages/courses/CourseFormPage';
import InstructorCourseBuilderPage from '../pages/instructor/InstructorCourseBuilderPage';
import ProfilePage from '../pages/auth/ProfilePage';

// Info Pages
import PrivacyPolicyPage from '../pages/info/PrivacyPolicyPage';
import SourcesPage from '../pages/info/SourcesPage';
import TermsPage from '../pages/info/TermsPage';

// Upgraded Info Placeholder Pages
import { 
  QuizzesPage, 
  CertificatesPage, 
  DiscussionsPage, 
  BookmarksPage 
} from '../pages/info/InfoPlaceholders';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route path="/courses" element={<CourseListPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/courses/:id/learn" element={<CourseLearnPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/terms" element={<TermsPage />} />
          
          {/* Restored profile and settings routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/discussions" element={<DiscussionsPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />

          {/* Student Routes */}
          <Route element={<RoleBasedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>

          {/* Instructor Routes */}
          <Route element={<RoleBasedRoute allowedRoles={['instructor', 'admin']} />}>
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/courses/:id/builder" element={<InstructorCourseBuilderPage />} />
            <Route path="/courses/new" element={<CourseFormPage />} />
            <Route path="/courses/:id/edit" element={<CourseFormPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
