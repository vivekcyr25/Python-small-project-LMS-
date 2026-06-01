import api from '../../lib/api';

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface LessonProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  status: LessonStatus;
  progress_percent: number;
  resume_position_seconds: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgressUpdatePayload {
  status?: LessonStatus;
  progress_percent?: number;
  resume_position_seconds?: number;
}

export const updateLessonProgress = async (
  lessonId: number,
  payload: ProgressUpdatePayload,
): Promise<LessonProgress> => {
  const { data } = await api.post(`/lessons/${lessonId}/progress`, payload);
  return data;
};

export const completeLesson = async (lessonId: number): Promise<LessonProgress> => {
  const { data } = await api.patch(`/lessons/${lessonId}/complete`);
  return data;
};

export interface CourseProgressSummary {
  completed_lessons: number;
  total_lessons: number;
  progress_percent: number;
}

export const getCourseProgress = async (
  courseId: number | string,
): Promise<CourseProgressSummary> => {
  const { data } = await api.get(`/courses/${courseId}/progress`);
  return data;
};
