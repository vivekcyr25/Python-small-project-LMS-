import api from '../../lib/api';

export interface Section {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SectionPayload {
  title: string;
  description?: string | null;
  order_index?: number;
  is_published?: boolean;
}

export const listSections = async (courseId: number | string): Promise<Section[]> => {
  const { data } = await api.get(`/courses/${courseId}/sections`);
  return data;
};

export const createSection = async (
  courseId: number | string,
  payload: SectionPayload,
): Promise<Section> => {
  const { data } = await api.post(`/courses/${courseId}/sections`, payload);
  return data;
};

export const updateSection = async (
  sectionId: number,
  payload: Partial<SectionPayload>,
): Promise<Section> => {
  const { data } = await api.put(`/sections/${sectionId}`, payload);
  return data;
};

export const deleteSection = async (sectionId: number): Promise<void> => {
  await api.delete(`/sections/${sectionId}`);
};
