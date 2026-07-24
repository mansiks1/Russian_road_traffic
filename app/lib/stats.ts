export type Attempt = {
  id: string;
  date: string;
  questions: number;
  correct: number;
  title?: string;
  mode?: "exam" | "topic" | "mistakes" | "daily" | "signs";
  passed?: boolean;
};

export type TopicProgress = {
  questions: number;
  correct: number;
};

export type Stats = {
  totalQuestions: number;
  correctAnswers: number;
  completedTests: number;
  attempts: Attempt[];
  topicProgress: Record<string, TopicProgress>;
  wrongQuestionIds: string[];
};

export const emptyStats: Stats = {
  totalQuestions: 0,
  correctAnswers: 0,
  completedTests: 0,
  attempts: [],
  topicProgress: {},
  wrongQuestionIds: [],
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
      topicProgress:
        parsed.topicProgress && typeof parsed.topicProgress === "object"
          ? parsed.topicProgress
          : {},
      wrongQuestionIds: Array.isArray(parsed.wrongQuestionIds)
        ? parsed.wrongQuestionIds.filter(
            (questionId): questionId is string => typeof questionId === "string",
          )
        : [],
    };
  } catch {
    return emptyStats;
  }
}

export type AttemptResult = {
  questions: number;
  correct: number;
  title: string;
  mode: NonNullable<Attempt["mode"]>;
  passed: boolean;
  topicResults: Record<string, TopicProgress>;
  correctQuestionIds: string[];
  wrongQuestionIds: string[];
};

export function recordAttempt(
  resultOrQuestions: AttemptResult | number,
  legacyCorrect?: number,
): Stats {
  const current = readStats();
  const result: AttemptResult =
    typeof resultOrQuestions === "number"
      ? {
          questions: resultOrQuestions,
          correct: legacyCorrect ?? 0,
          title: "Тест по дорожным знакам",
          mode: "signs",
          passed:
            resultOrQuestions > 0 &&
            (legacyCorrect ?? 0) / resultOrQuestions >= 0.8,
          topicResults: {
            "Дорожные знаки": {
              questions: resultOrQuestions,
              correct: legacyCorrect ?? 0,
            },
          },
          correctQuestionIds: [],
          wrongQuestionIds: [],
        }
      : resultOrQuestions;

  const topicProgress = { ...current.topicProgress };
  Object.entries(result.topicResults).forEach(([topic, topicResult]) => {
    const previous = topicProgress[topic] ?? { questions: 0, correct: 0 };
    topicProgress[topic] = {
      questions: previous.questions + topicResult.questions,
      correct: previous.correct + topicResult.correct,
    };
  });

  const mistakes = new Set(current.wrongQuestionIds);
  result.correctQuestionIds.forEach((questionId) => mistakes.delete(questionId));
  result.wrongQuestionIds.forEach((questionId) => mistakes.add(questionId));

  const next: Stats = {
    totalQuestions: current.totalQuestions + result.questions,
    correctAnswers: current.correctAnswers + result.correct,
    completedTests: current.completedTests + 1,
    topicProgress,
    wrongQuestionIds: [...mistakes].slice(0, 80),
    attempts: [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        date: new Date().toISOString(),
        questions: result.questions,
        correct: result.correct,
        title: result.title,
        mode: result.mode,
        passed: result.passed,
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
