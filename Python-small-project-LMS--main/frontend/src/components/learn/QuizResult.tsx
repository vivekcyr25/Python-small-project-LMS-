import { motion } from 'framer-motion';
import { Trophy, RotateCw, XCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import type { Quiz, QuizAttempt } from '../../features/quizzes/api';

interface QuizResultProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onRetake: () => void;
}

const QuizResult = ({ quiz, attempt, onRetake }: QuizResultProps) => {
  const Icon = attempt.passed ? Trophy : XCircle;
  const tone = attempt.passed ? 'emerald' : 'red';

  return (
    <motion.div
      data-testid="quiz-result"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div
        className={`rounded-2xl border p-6 flex items-start gap-4 ${
          attempt.passed
            ? 'border-emerald-400/30 bg-emerald-500/10'
            : 'border-red-400/30 bg-red-500/10'
        }`}
      >
        <Icon size={32} className={attempt.passed ? 'text-emerald-300' : 'text-red-300'} />
        <div className="flex-1">
          <h3 className={`text-xl font-bold text-${tone}-200`}>
            {attempt.passed ? 'You passed!' : 'Not quite there yet'}
          </h3>
          <p className="text-sm text-slate-300 mt-1">
            Score: <span className="font-semibold text-white">{attempt.score}</span> /{' '}
            {attempt.max_score} ({attempt.percentage}%) — passing is {quiz.passing_score}%
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {quiz.questions.map((q, idx) => {
          const ans = attempt.answers.find((a) => a.question_id === q.id);
          const correct = ans?.is_correct;
          return (
            <div
              key={q.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-start gap-3"
            >
              {correct ? (
                <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm text-slate-200">
                  <span className="text-cyan-400 mr-1">{idx + 1}.</span>
                  {q.question_text}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {ans?.points_awarded ?? 0} / {q.points} point{q.points > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        data-testid="retake-quiz-btn"
        onClick={onRetake}
        variant="glass"
        className="flex items-center gap-2"
      >
        <RotateCw size={14} /> Retake quiz
      </Button>
    </motion.div>
  );
};

export default QuizResult;
