import api from '../../lib/api';

export const createModule = async (data: any) => {
  const response = await api.post('/content/modules', data);
  return response.data;
};

export const getCourseModules = async (courseId: string | number) => {
  const response = await api.get(`/content/courses/${courseId}/modules`);
  return response.data;
};

export const createLesson = async (data: any) => {
  const response = await api.post('/content/lessons', data);
  return response.data;
};

export const getModuleLessons = async (moduleId: string | number) => {
  const response = await api.get(`/content/modules/${moduleId}/lessons`);
  return response.data;
};
