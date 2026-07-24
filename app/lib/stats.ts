export type Attempt = {
  id: string;
  date: string;
  questions: number;
  correct: number;
};

export type Stats = {
  totalQuestions: number;
  correctAnswers: number;
  completedTests: number;
  attempts: Attempt[];
};

export const emptyStats: Stats = {
  totalQuestions: 0,
  correctAnswers: 0,
  completedTests: 0,
  attempts: [],
};

const STORAGE_KEY = "road-code-stats-v1";

export function readStats(): Stats {
  if (typeof window === "undefined") return emptyStats;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return emptyStats;
    const parsed = JSON.parse(saved) as Partial<Stats>;
    return {
      totalQuestions: Number(parsed.totalQuestions) || 0,
      correctAnswers: Number(parsed.correctAnswers) || 0,
      completedTests: Number(parsed.completedTests) || 0,
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts.slice(0, 8) : [],
    };
  } catch {
    return emptyStats;
  }
}

export function recordAttempt(questions: number, correct: number): Stats {
  const current = readStats();
  const next: Stats = {
    totalQuestions: current.totalQuestions + questions,
    correctAnswers: current.correctAnswers + correct,
    completedTests: current.completedTests + 1,
    attempts: [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        date: new Date().toISOString(),
        questions,
        correct,
      },
      ...current.attempts,
    ].slice(0, 8),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("road-code-stats"));
  return next;
}

export function clearStats() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("road-code-stats"));
}
