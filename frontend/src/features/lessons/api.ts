import api from '../../lib/api';

export type LessonType = 'video' | 'markdown' | 'pdf' | 'quiz';

export interface Lesson {
  id: number;
  section_id: number;
  title: string;
  description: string | null;
  lesson_type: LessonType;
  content_text: string | null;
  content_url: string | null;
  duration_seconds: number | null;
  order_index: number;
  is_preview: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonPayload {
  title: string;
  description?: string | null;
  lesson_type?: LessonType;
  content_text?: string | null;
  content_url?: string | null;
  duration_seconds?: number | null;
  order_index?: number;
  is_preview?: boolean;
  is_published?: boolean;
}

export const listLessons = async (sectionId: number): Promise<Lesson[]> => {
  const { data } = await api.get(`/sections/${sectionId}/lessons`);
  return data;
};

export const getLesson = async (lessonId: number): Promise<Lesson> => {
  const { data } = await api.get(`/lessons/${lessonId}`);
  return data;
};

export const createLesson = async (
  sectionId: number,
  payload: LessonPayload,
): Promise<Lesson> => {
  const { data } = await api.post(`/sections/${sectionId}/lessons`, payload);
  return data;
};

export const updateLesson = async (
  lessonId: number,
  payload: Partial<LessonPayload>,
): Promise<Lesson> => {
  const { data } = await api.put(`/lessons/${lessonId}`, payload);
  return data;
};

export const deleteLesson = async (lessonId: number): Promise<void> => {
  await api.delete(`/lessons/${lessonId}`);
};

// Course-wide learn endpoint
export interface CourseLearnLesson extends Lesson {
  progress: {
    status: 'not_started' | 'in_progress' | 'completed';
    progress_percent: number;
    resume_position_seconds: number;
    completed_at: string | null;
  };
}

export interface CourseLearnSection {
  id: number;
  title: string;
  description: string | null;
  order_index: number;
  is_published: boolean;
  lessons: CourseLearnLesson[];
}

export interface CourseLearnData {
  course: {
    id: number;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
  };
  sections: CourseLearnSection[];
}

export const getCourseLearnData = async (courseId: number | string): Promise<CourseLearnData> => {
  const { data } = await api.get(`/courses/${courseId}/learn`);
  return data;
};
