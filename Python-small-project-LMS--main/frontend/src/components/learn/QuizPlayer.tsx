import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Send } from 'lucide-react';
import { Button } from '../ui/button';
import QuizResult from './QuizResult';
import {
  getQuizForLesson,
  submitQuiz,
  type Quiz,
  type QuizAnswerInput,
  type QuizAttempt,
} from '../../features/quizzes/api';

interface QuizPlayerProps {
  lessonId: number;
  onPassed?: () => void;
}

const QuizPlayer = ({ lessonId, onPassed }: QuizPlayerProps) => {
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<number, { ids: number[]; text: string }>>({});
  const [result, setResult] = useState<QuizAttempt | null>(null);

  const { data: quiz, isLoading, error } = useQuery<Quiz>({
    queryKey: ['quiz', lessonId],
    queryFn: () => getQuizForLesson(lessonId),
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      const payload: { answers: QuizAnswerInput[] } = {
        answers: (quiz?.questions || []).map((q) => ({
          question_id: q.id,
          selected_option_ids: answers[q.id]?.ids ?? [],
          answer_text: answers[q.id]?.text ?? undefined,
        })),
      };
      return submitQuiz(quiz!.id, payload);
    },
    onSuccess: (attempt) => {
      setResult(attempt);
      queryClient.invalidateQueries({ queryKey: ['course-learn'] });
      if (attempt.passed) onPassed?.();
    },
  });

  if (isLoading) return <div className="text-slate-400 text-sm py-6">Loading quiz…</div>;
  if (error || !quiz) {
    return <div className="text-amber-300 text-sm py-6">No quiz has been published for this lesson yet.</div>;
  }
  if (result) {
    return (
      <QuizResult
        attempt={result}
        quiz={quiz}
        onRetake={() => {
          setResult(null);
          setAnswers({});
        }}
      />
    );
  }

  const setSingle = (qid: number, oid: number) => {
    setAnswers((a) => ({ ...a, [qid]: { ids: [oid], text: a[qid]?.text ?? '' } }));
  };
  const toggleMulti = (qid: number, oid: number) => {
    setAnswers((a) => {
      const cur = a[qid]?.ids ?? [];
      const next = cur.includes(oid) ? cur.filter((x) => x !== oid) : [...cur, oid];
      return { ...a, [qid]: { ids: next, text: a[qid]?.text ?? '' } };
    });
  };
  const setText = (qid: number, text: string) => {
    setAnswers((a) => ({ ...a, [qid]: { ids: a[qid]?.ids ?? [], text } }));
  };

  return (
    <div data-testid="quiz-player" className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-white">{quiz.title}</h2>
        {quiz.description && <p className="text-slate-400 text-sm mt-1">{quiz.description}</p>}
        <p className="text-xs text-cyan-400 mt-2 uppercase tracking-widest">
          Passing score: {quiz.passing_score}%
        </p>
      </header>

      <ol className="space-y-5">
        {quiz.questions.map((q, idx) => (
          <motion.li
            key={q.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border border-white/10 bg-white/5 p-5"
          >
            <p className="text-white font-medium">
              <span className="text-cyan-400 mr-2">{idx + 1}.</span>
              {q.question_text}
              <span className="ml-2 text-xs text-slate-500">({q.points} pt{q.points > 1 ? 's' : ''})</span>
            </p>

            <div className="mt-4 space-y-2">
              {q.question_type === 'mcq_single' && q.options.map((o) => (
                <label key={o.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    className="accent-cyan-400"
                    checked={answers[q.id]?.ids?.[0] === o.id}
                    onChange={() => setSingle(q.id, o.id)}
                  />
                  <span className="text-slate-200 text-sm">{o.option_text}</span>
                </label>
              ))}

              {q.question_type === 'mcq_multiple' && q.options.map((o) => (
                <label key={o.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-cyan-400"
                    checked={!!answers[q.id]?.ids?.includes(o.id)}
                    onChange={() => toggleMulti(q.id, o.id)}
                  />
                  <span className="text-slate-200 text-sm">{o.option_text}</span>
                </label>
              ))}

              {q.question_type === 'short_answer' && (
                <input
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="Type your answer…"
                  value={answers[q.id]?.text ?? ''}
                  onChange={(e) => setText(q.id, e.target.value)}
                />
              )}
            </div>
          </motion.li>
        ))}
      </ol>

      <Button
        data-testid="submit-quiz-btn"
        onClick={() => submitMutation.mutate()}
        disabled={submitMutation.isPending || quiz.questions.length === 0}
        variant="gradient"
        className="flex items-center gap-2"
      >
        <Send size={16} />
        {submitMutation.isPending ? 'Submitting…' : 'Submit Quiz'}
      </Button>

      {submitMutation.isError && (
        <p className="text-sm text-red-400">Failed to submit. Please try again.</p>
      )}
    </div>
  );
};

export default QuizPlayer;
