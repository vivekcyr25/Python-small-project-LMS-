import api from '../../lib/api';

export const updateProgress = async (data: { lesson_id: number; completed: boolean }) => {
  const response = await api.post('/assessment/progress', data);
  return response.data;
};

export const getCourseProgress = async (courseId: string | number) => {
  const response = await api.get(`/assessment/progress/${courseId}`);
  return response.data;
};

export const createQuiz = async (data: any) => {
  const response = await api.post('/assessment/quizzes', data);
  return response.data;
};

export const getCourseQuizzes = async (courseId: string | number) => {
  const response = await api.get(`/assessment/courses/${courseId}/quizzes`);
  return response.data;
};

export const createQuestion = async (quizId: string | number, data: any) => {
  const response = await api.post(`/assessment/quizzes/${quizId}/questions`, data);
  return response.data;
};

export const getQuizQuestions = async (quizId: string | number) => {
  const response = await api.get(`/assessment/quizzes/${quizId}/questions`);
  return response.data;
};

export const issueCertificate = async (data: { course_id: number; certificate_url?: string }) => {
  const response = await api.post('/assessment/certificates', data);
  return response.data;
};

export const getMyCertificates = async () => {
  const response = await api.get('/assessment/certificates');
  return response.data;
};
