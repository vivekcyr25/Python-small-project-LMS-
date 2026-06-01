/**
 * Backwards-compat shim. The legacy /assessment endpoints were
 * removed in Phase 2 and replaced with /progress and /quizzes
 * routes. This file re-exports the new APIs under the old names.
 */
import { completeLesson, getCourseProgress as _getCourseProgress } from '../progress/api';

export const updateProgress = async (data: { lesson_id: number; completed: boolean }) => {
  if (data.completed) {
    return await completeLesson(data.lesson_id);
  }
  // No-op for legacy callers that pass completed=false.
  return null;
};

export const getCourseProgress = async (courseId: string | number) => {
  return await _getCourseProgress(courseId);
};

export { createQuiz, getQuizForLesson as getCourseQuizzes, addQuestion as createQuestion } from '../quizzes/api';
