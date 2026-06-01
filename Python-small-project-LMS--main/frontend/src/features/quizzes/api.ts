import api from '../../lib/api';

export type QuestionType = 'mcq_single' | 'mcq_multiple' | 'short_answer';

export interface AnswerOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: QuestionType;
  points: number;
  order_index: number;
  options: AnswerOption[];
}

export interface Quiz {
  id: number;
  lesson_id: number;
  title: string;
  description: string | null;
  passing_score: number;
  questions: Question[];
}

export interface QuizCreatePayload {
  title: string;
  description?: string | null;
  passing_score?: number;
}

export interface QuestionCreatePayload {
  question_text: string;
  question_type: QuestionType;
  points?: number;
  order_index?: number;
}

export interface OptionCreatePayload {
  option_text: string;
  is_correct?: boolean;
  order_index?: number;
}

export interface QuizAnswerInput {
  question_id: number;
  selected_option_ids?: number[];
  answer_text?: string;
}

export interface QuizSubmitPayload {
  answers: QuizAnswerInput[];
}

export interface QuizAttemptAnswer {
  id: number;
  question_id: number;
  selected_option_ids: number[] | null;
  answer_text: string | null;
  is_correct: boolean | null;
  points_awarded: number;
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  user_id: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  submitted_at: string;
  answers: QuizAttemptAnswer[];
}

export const createQuiz = async (lessonId: number, payload: QuizCreatePayload): Promise<Quiz> => {
  const { data } = await api.post(`/lessons/${lessonId}/quiz`, payload);
  return data;
};

export const getQuizForLesson = async (lessonId: number): Promise<Quiz> => {
  const { data } = await api.get(`/lessons/${lessonId}/quiz`);
  return data;
};

export const addQuestion = async (quizId: number, payload: QuestionCreatePayload): Promise<Question> => {
  const { data } = await api.post(`/quizzes/${quizId}/questions`, payload);
  return data;
};

export const addOption = async (questionId: number, payload: OptionCreatePayload): Promise<AnswerOption> => {
  const { data } = await api.post(`/questions/${questionId}/options`, payload);
  return data;
};

export const submitQuiz = async (quizId: number, payload: QuizSubmitPayload): Promise<QuizAttempt> => {
  const { data } = await api.post(`/quizzes/${quizId}/submit`, payload);
  return data;
};

export const getMyAttempts = async (quizId: number): Promise<QuizAttempt[]> => {
  const { data } = await api.get(`/quizzes/${quizId}/attempts/me`);
  return data;
};
