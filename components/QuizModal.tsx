'use client';

import { X, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizModalProps {
  isOpen: boolean;
  quiz: {
    questions: QuizQuestion[];
    answers: Record<string, number>;
    resource: any;
  } | null;
  onClose: () => void;
  dark: boolean;
}

export default function QuizModal({ isOpen, quiz, onClose, dark }: QuizModalProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !quiz) return null;

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (!submitted) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: optionIndex
      }));
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const score = submitted ? calculateScore() : null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${dark ? 'dark' : ''}`}
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: dark ? '#1e293b' : '#ffffff',
          color: dark ? '#f8fafc' : '#0f172a'
        }}
      >
        {/* Header */}
        <div
          className="p-6 border-b flex justify-between items-center"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: dark ? '#0f172a' : '#f8fafc'
          }}
        >
          <div>
            <h3 className="text-lg font-bold">Interactive Quiz</h3>
            <p className="text-xs opacity-60">
              Topic: {quiz.resource.topic || 'General'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {submitted && score !== null && (
            <div className="mb-8 p-6 rounded-2xl" style={{
              backgroundColor: score >= 70 ? '#d1fae5' : '#fee2e2',
              color: score >= 70 ? '#065f46' : '#991b1b'
            }}>
              <div className="flex items-center gap-3 mb-2">
                {score >= 70 ? (
                  <CheckCircle size={24} />
                ) : (
                  <XCircle size={24} />
                )}
                <h4 className="text-xl font-bold">
                  {score >= 70 ? 'Great Job!' : 'Keep Practicing!'}
                </h4>
              </div>
              <p className="text-lg font-semibold">
                Your Score: {score}%
              </p>
            </div>
          )}

          <div className="space-y-8">
            {quiz.questions.map((question, qIndex) => (
              <div key={question.id} className="space-y-4">
                <h4 className="font-semibold text-lg">
                  <span style={{ color: 'var(--text-muted)' }}>
                    {qIndex + 1}.
                  </span>{' '}
                  {question.question}
                </h4>

                <div className="space-y-3">
                  {question.options.map((option, optIndex) => {
                    const isSelected = answers[question.id] === optIndex;
                    const isCorrect = optIndex === question.correctAnswer;
                    const showCorrect = submitted && isCorrect;
                    const showWrong = submitted && isSelected && !isCorrect;

                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleAnswerSelect(question.id, optIndex)}
                        disabled={submitted}
                        className={`quiz-option w-full p-4 rounded-xl text-left transition-all ${
                          showCorrect ? 'correct' : showWrong ? 'wrong' : isSelected ? 'selected' : ''
                        }`}
                        style={{
                          borderColor: isSelected ? 'var(--accent-blue)' : 'var(--border-color)',
                          backgroundColor: isSelected ? 'var(--active-bg)' : 'var(--bg-card)',
                          cursor: submitted ? 'not-allowed' : 'pointer',
                          opacity: submitted ? 0.9 : 1
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                            style={{
                              borderColor: isSelected ? 'var(--accent-blue)' : 'var(--border-color)',
                              backgroundColor: isSelected ? 'var(--accent-blue)' : 'transparent'
                            }}
                          >
                            {isSelected && (
                              <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-6 border-t flex justify-end gap-3"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              backgroundColor: 'var(--bg-pane)',
              color: 'var(--text-main)'
            }}
          >
            {submitted ? 'Close' : 'Cancel'}
          </button>
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== quiz.questions.length}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{
                backgroundColor: Object.keys(answers).length === quiz.questions.length ? '#334155' : '#cbd5e1',
                color: 'white',
                cursor: Object.keys(answers).length === quiz.questions.length ? 'pointer' : 'not-allowed'
              }}
            >
              Check Answers
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
