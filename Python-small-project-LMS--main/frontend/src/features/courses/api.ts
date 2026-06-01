import api from '../../lib/api';

export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const getInstructorCourses = async () => {
  const response = await api.get('/courses/instructor/me');
  return response.data;
};

export const getCourse = async (id: string) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const createCourse = async (data: any) => {
  const response = await api.post('/courses', data);
  return response.data;
};

export const updateCourse = async (id: string, data: any) => {
  const response = await api.put(`/courses/${id}`, data);
  return response.data;
};

export const deleteCourse = async (id: string) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

export const publishCourse = async (id: string) => {
  const response = await api.patch(`/courses/${id}/publish`);
  return response.data;
};

export const unpublishCourse = async (id: string) => {
  const response = await api.patch(`/courses/${id}/unpublish`);
  return response.data;
};
