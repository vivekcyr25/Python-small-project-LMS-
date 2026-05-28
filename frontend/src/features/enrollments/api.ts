import api from '../../lib/api';

export const enrollInCourse = async (courseId: number) => {
  const response = await api.post(`/enrollments/${courseId}`);
  return response.data;
};

export const unenrollFromCourse = async (courseId: number) => {
  const response = await api.delete(`/enrollments/${courseId}`);
  return response.data;
};

export const getMyEnrollments = async () => {
  const response = await api.get('/enrollments/me');
  return response.data;
};

export const getCourseEnrollments = async (courseId: number) => {
  const response = await api.get(`/enrollments/course/${courseId}`);
  return response.data;
};
