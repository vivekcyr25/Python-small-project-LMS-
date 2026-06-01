import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '../ui/button';
import {
  getQuizForLesson,
  createQuiz,
  addQuestion,
  addOption,
  type Quiz,
  type QuestionType,
} from '../../features/quizzes/api';

interface QuizBuilderProps {
  lessonId: number;
}

const QuizBuilder = ({ lessonId }: QuizBuilderProps) => {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', passing_score: 60 });

  // Question form state
  const [questionForms, setQuestionForms] = useState<Record<number, { text: string; isCorrect: boolean }>>({});
  const [newQuestion, setNewQuestion] = useState({ question_text: '', question_type: 'mcq_single' as QuestionType, points: 1 });

  const { data: quiz, isLoading, error } = useQuery<Quiz>({
    queryKey: ['quiz-builder', lessonId],
    queryFn: () => getQuizForLesson(lessonId),
    retry: false,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['quiz-builder', lessonId] });

  const createQuizMut = useMutation({
    mutationFn: () => createQuiz(lessonId, newQuiz),
    onSuccess: () => { invalidate(); setCreating(false); },
  });

  const addQuestionMut = useMutation({
    mutationFn: () => addQuestion(quiz!.id, newQuestion),
    onSuccess: () => { invalidate(); setNewQuestion({ question_text: '', question_type: 'mcq_single', points: 1 }); },
  });

  const addOptionMut = useMutation({
    mutationFn: (vars: { questionId: number; text: string; isCorrect: boolean }) =>
      addOption(vars.questionId, { option_text: vars.text, is_correct: vars.isCorrect }),
    onSuccess: invalidate,
  });

  if (isLoading) return <p className="text-xs text-slate-500">Loading quiz…</p>;

  if (error || !quiz) {
    return creating ? (
      <div className="space-y-2" data-testid="quiz-builder-new">
        <input
          autoFocus
          placeholder="Quiz title"
          value={newQuiz.title}
          onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
        />
        <textarea
          placeholder="Description (optional)"
          value={newQuiz.description}
          onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
          rows={2}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Passing score (%):</label>
          <input
            type="number"
            min={0} max={100}
            value={newQuiz.passing_score}
            onChange={(e) => setNewQuiz({ ...newQuiz, passing_score: Number(e.target.value) })}
            className="w-20 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => createQuizMut.mutate()} variant="gradient" size="sm" disabled={!newQuiz.title || createQuizMut.isPending}>
            Create Quiz
          </Button>
          <Button onClick={() => setCreating(false)} variant="ghost" size="sm">Cancel</Button>
        </div>
      </div>
    ) : (
      <Button
        data-testid="create-quiz-btn"
        onClick={() => setCreating(true)}
        variant="glass"
        size="sm"
        className="flex items-center gap-1.5"
      >
        <Plus size={14} /> Create Quiz
      </Button>
    );
  }

  return (
    <div data-testid={`quiz-builder-${quiz.id}`} className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-white">{quiz.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">Passing: {quiz.passing_score}% · {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}</p>
      </div>

      <ol className="space-y-3">
        {quiz.questions.map((q, idx) => (
          <li key={q.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-sm text-white">
              <span className="text-cyan-400 mr-1">{idx + 1}.</span>
              {q.question_text}
              <span className="text-xs text-slate-500 ml-2">({q.question_type}, {q.points}pt)</span>
            </p>
            <ul className="mt-2 space-y-1">
              {q.options.map((o) => (
                <li key={o.id} className="flex items-center gap-2 text-xs text-slate-300">
                  {o.is_correct ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Circle size={12} className="text-slate-600" />}
                  {o.option_text}
                </li>
              ))}
            </ul>

            {q.question_type !== 'short_answer' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = questionForms[q.id];
                  if (!f?.text) return;
                  addOptionMut.mutate({ questionId: q.id, text: f.text, isCorrect: f.isCorrect });
                  setQuestionForms({ ...questionForms, [q.id]: { text: '', isCorrect: false } });
                }}
                className="flex items-center gap-2 mt-2"
              >
                <input
                  type="checkbox"
                  className="accent-emerald-400"
                  title="Correct?"
                  checked={questionForms[q.id]?.isCorrect ?? false}
                  onChange={(e) => setQuestionForms({ ...questionForms, [q.id]: { text: questionForms[q.id]?.text || '', isCorrect: e.target.checked } })}
                />
                <input
                  placeholder="Add option…"
                  value={questionForms[q.id]?.text ?? ''}
                  onChange={(e) => setQuestionForms({ ...questionForms, [q.id]: { text: e.target.value, isCorrect: questionForms[q.id]?.isCorrect ?? false } })}
                  className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white"
                />
                <button type="submit" className="text-xs text-cyan-300 hover:text-cyan-200">Add</button>
              </form>
            )}

            {q.question_type === 'short_answer' && q.options.length === 0 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = questionForms[q.id];
                  if (!f?.text) return;
                  addOptionMut.mutate({ questionId: q.id, text: f.text, isCorrect: true });
                  setQuestionForms({ ...questionForms, [q.id]: { text: '', isCorrect: true } });
                }}
                className="flex items-center gap-2 mt-2"
              >
                <input
                  placeholder="Correct answer text…"
                  value={questionForms[q.id]?.text ?? ''}
                  onChange={(e) => setQuestionForms({ ...questionForms, [q.id]: { text: e.target.value, isCorrect: true } })}
                  className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white"
                />
                <button type="submit" className="text-xs text-cyan-300 hover:text-cyan-200">Set</button>
              </form>
            )}
          </li>
        ))}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newQuestion.question_text.trim()) return;
          addQuestionMut.mutate();
        }}
        className="space-y-2 pt-3 border-t border-white/10"
      >
        <p className="text-xs uppercase tracking-widest text-cyan-400/80">Add question</p>
        <input
          placeholder="Question text"
          value={newQuestion.question_text}
          onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
        />
        <div className="flex gap-2">
          <select
            value={newQuestion.question_type}
            onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value as QuestionType })}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value="mcq_single">Single choice</option>
            <option value="mcq_multiple">Multiple choice</option>
            <option value="short_answer">Short answer</option>
          </select>
          <input
            type="number"
            min={1}
            value={newQuestion.points}
            onChange={(e) => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })}
            className="w-20 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
            title="Points"
          />
          <Button type="submit" variant="glass" size="sm" disabled={addQuestionMut.isPending}>Add</Button>
        </div>
      </form>
    </div>
  );
};

export default QuizBuilder;
