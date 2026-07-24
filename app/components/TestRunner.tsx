"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  quizTopics,
  theoryQuestions,
  type QuizTopic,
} from "../data/questions";
import { quizSigns, signImage } from "../data/signs";
import {
  readStats,
  recordAttempt,
  type AttemptResult,
  type TopicProgress,
} from "../lib/stats";
import { SpotlightButton, SpotlightLink } from "./Spotlight";

type TrainingMode = "exam" | "topic" | "mistakes" | "daily" | "signs";

type TrainingQuestion = {
  id: string;
  topic: QuizTopic;
  prompt: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  visual:
    | {
        kind: "sign";
        code: string;
        file: string;
      }
    | {
        kind: "scene";
        label: string;
        main: string;
        note: string;
        tone: "lime" | "amber" | "blue" | "red";
      };
};

type AnswerRecord = {
  questionId: string;
  topic: QuizTopic;
  correct: boolean;
};

const modeCopy: Record<
  Exclude<TrainingMode, "topic">,
  { label: string; title: string; description: string; meta: string }
> = {
  exam: {
    label: "Главный режим",
    title: "Экзамен",
    description:
      "Учебная симуляция: 20 смешанных вопросов, таймер и дополнительные блоки при одной или двух ошибках.",
    meta: "20 минут",
  },
  daily: {
    label: "Каждый день",
    title: "Тренировка дня",
    description:
      "Короткая подборка, которая меняется раз в сутки и помогает сохранять ритм.",
    meta: "10 вопросов",
  },
  mistakes: {
    label: "Слабые места",
    title: "Работа над ошибками",
    description:
      "Повторите вопросы, в которых ошибались. Верный ответ удалит вопрос из списка.",
    meta: "Адаптивно",
  },
  signs: {
    label: "Быстрый старт",
    title: "Тест по знакам",
    description:
      "Знакомый режим распознавания знаков с близкими вариантами и разбором ответа.",
    meta: "10 вопросов",
  },
};

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function seededShuffle<T>(items: T[], seedText: string) {
  let seed = [...seedText].reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
    2166136261,
  );
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function buildQuestionBank(): TrainingQuestion[] {
  const signQuestions: TrainingQuestion[] = quizSigns.map((sign) => ({
    id: `sign:${sign.id}`,
    topic: "Дорожные знаки",
    prompt: "Как называется этот дорожный знак?",
    choices: sign.choices,
    correctAnswer: sign.choices[0],
    explanation: sign.details,
    visual: {
      kind: "sign",
      code: sign.code,
      file: sign.file,
    },
  }));

  const generalQuestions: TrainingQuestion[] = theoryQuestions.map((question) => ({
    id: `theory:${question.id}`,
    topic: question.topic,
    prompt: question.prompt,
    choices: question.choices,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    visual: {
      kind: "scene",
      ...question.scene,
    },
  }));

  return [...signQuestions, ...generalQuestions];
}

const questionBank = buildQuestionBank();

function mixedQuestions(count: number) {
  const signs = shuffle(
    questionBank.filter((question) => question.topic === "Дорожные знаки"),
  );
  const theory = shuffle(
    questionBank.filter((question) => question.topic !== "Дорожные знаки"),
  );
  const signCount = Math.min(Math.round(count * 0.3), signs.length);
  return shuffle([
    ...signs.slice(0, signCount),
    ...theory.slice(0, count - signCount),
  ]);
}

function modeTitle(mode: TrainingMode, topic: QuizTopic | null) {
  if (mode === "topic" && topic) return topic;
  return modeCopy[mode as Exclude<TrainingMode, "topic">]?.title ?? "Тренировка";
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function TestRunner() {
  const [mode, setMode] = useState<TrainingMode | null>(null);
  const [topic, setTopic] = useState<QuizTopic | null>(null);
  const [questions, setQuestions] = useState<TrainingQuestion[]>([]);
  const [baseQuestionCount, setBaseQuestionCount] = useState(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const [extraPhase, setExtraPhase] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const saved = useRef(false);

  useEffect(() => {
    setMistakeCount(readStats().wrongQuestionIds.length);
  }, []);

  const start = (nextMode: TrainingMode, nextTopic: QuizTopic | null = null) => {
    let nextQuestions: TrainingQuestion[] = [];

    if (nextMode === "exam") {
      nextQuestions = mixedQuestions(20);
    } else if (nextMode === "daily") {
      const dayKey = new Date().toISOString().slice(0, 10);
      nextQuestions = seededShuffle(questionBank, dayKey).slice(0, 10);
    } else if (nextMode === "signs") {
      nextQuestions = shuffle(
        questionBank.filter((question) => question.topic === "Дорожные знаки"),
      ).slice(0, 10);
    } else if (nextMode === "mistakes") {
      const wrongIds = new Set(readStats().wrongQuestionIds);
      nextQuestions = shuffle(
        questionBank.filter((question) => wrongIds.has(question.id)),
      ).slice(0, 20);
    } else if (nextMode === "topic" && nextTopic) {
      nextQuestions = shuffle(
        questionBank.filter((question) => question.topic === nextTopic),
      ).slice(0, 10);
    }

    if (!nextQuestions.length) return;

    setMode(nextMode);
    setTopic(nextTopic);
    setQuestions(nextQuestions);
    setBaseQuestionCount(nextQuestions.length);
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setHighlighted(false);
    setExtraPhase(false);
    setTimedOut(false);
    setTimeLeft(nextMode === "exam" ? 20 * 60 : 0);
    saved.current = false;
  };

  const returnToHub = () => {
    setMode(null);
    setTopic(null);
    setQuestions([]);
    setFinished(false);
    setSelected(null);
    setAnswers([]);
    setMistakeCount(readStats().wrongQuestionIds.length);
  };

  useEffect(() => {
    if (!mode || finished || mode !== "exam") return;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setTimedOut(true);
          setFinished(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [mode, finished]);

  const correctCount = useMemo(
    () => answers.filter((answer) => answer.correct).length,
    [answers],
  );
  const baseErrors = answers
    .slice(0, baseQuestionCount)
    .filter((answer) => !answer.correct).length;
  const extraErrors = answers
    .slice(baseQuestionCount)
    .filter((answer) => !answer.correct).length;
  const resultPercent = answers.length
    ? Math.round((correctCount / answers.length) * 100)
    : 0;
  const passed =
    !timedOut &&
    (mode === "exam"
      ? baseErrors <= 2 && extraErrors === 0 && answers.length === questions.length
      : resultPercent >= 80);

  useEffect(() => {
    if (!finished || !mode || saved.current || answers.length === 0) return;

    const topicResults = answers.reduce<Record<string, TopicProgress>>(
      (result, answer) => {
        const current = result[answer.topic] ?? { questions: 0, correct: 0 };
        result[answer.topic] = {
          questions: current.questions + 1,
          correct: current.correct + (answer.correct ? 1 : 0),
        };
        return result;
      },
      {},
    );

    const attempt: AttemptResult = {
      questions: answers.length,
      correct: correctCount,
      title: modeTitle(mode, topic),
      mode,
      passed,
      topicResults,
      correctQuestionIds: answers
        .filter((answer) => answer.correct)
        .map((answer) => answer.questionId),
      wrongQuestionIds: answers
        .filter((answer) => !answer.correct)
        .map((answer) => answer.questionId),
    };

    recordAttempt(attempt);
    saved.current = true;
  }, [answers, correctCount, finished, mode, passed, topic]);

  const question = questions[index];
  const progress = questions.length
    ? ((index + (finished ? 1 : 0)) / questions.length) * 100
    : 0;

  const choose = (answer: string) => {
    if (!question || selected) return;
    setSelected(answer);
    setAnswers((current) => [
      ...current,
      {
        questionId: question.id,
        topic: question.topic,
        correct: answer === question.correctAnswer,
      },
    ]);
  };

  const next = () => {
    if (!selected || !question) return;

    if (index === questions.length - 1) {
      if (mode === "exam" && !extraPhase && baseErrors >= 1 && baseErrors <= 2) {
        const usedIds = new Set(questions.map((item) => item.id));
        const additional = shuffle(
          questionBank.filter((item) => !usedIds.has(item.id)),
        ).slice(0, baseErrors * 5);
        setQuestions((current) => [...current, ...additional]);
        setExtraPhase(true);
        setTimeLeft((current) => current + baseErrors * 5 * 60);
        setIndex((current) => current + 1);
        setSelected(null);
        setHighlighted(false);
        return;
      }
      setFinished(true);
      return;
    }

    setIndex((current) => current + 1);
    setSelected(null);
    setHighlighted(false);
  };

  if (!mode) {
    return (
      <section className="training-hub">
        <div className="training-heading">
          <div>
            <div className="section-kicker">Подготовка к экзамену</div>
            <h1>Выберите режим</h1>
            <p>
              От короткой разминки до экзамена с таймером. После каждого
              прохождения слабые темы и ошибки попадут в личную статистику.
            </p>
          </div>
          <div className="readiness-note">
            <strong>{questionBank.length}</strong>
            <span>учебных вопросов в базе</span>
          </div>
        </div>

        <div className="mode-grid">
          {(Object.keys(modeCopy) as Array<Exclude<TrainingMode, "topic">>).map(
            (modeId, modeIndex) => {
              const item = modeCopy[modeId];
              const disabled = modeId === "mistakes" && mistakeCount === 0;
              return (
                <article className={`mode-card mode-card-${modeId}`} key={modeId}>
                  <div className="mode-card-topline">
                    <span>{String(modeIndex + 1).padStart(2, "0")}</span>
                    <span>{item.label}</span>
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <div className="mode-card-footer">
                    <span>
                      {modeId === "mistakes" && mistakeCount
                        ? `${mistakeCount} на повторение`
                        : item.meta}
                    </span>
                    <SpotlightButton
                      className="mode-start"
                      onClick={() => start(modeId)}
                      disabled={disabled}
                    >
                      {disabled ? "Ошибок пока нет" : "Начать"}
                      <span aria-hidden="true">→</span>
                    </SpotlightButton>
                  </div>
                </article>
              );
            },
          )}
        </div>

        <section className="topic-training">
          <div>
            <div className="section-kicker">Тематические тренировки</div>
            <h2>Разберите одну тему без спешки</h2>
          </div>
          <div className="topic-buttons">
            {quizTopics.map((topicName, topicIndex) => {
              const count = questionBank.filter(
                (questionItem) => questionItem.topic === topicName,
              ).length;
              return (
                <SpotlightButton
                  key={topicName}
                  className="topic-button"
                  onClick={() => start("topic", topicName)}
                >
                  <span>{String(topicIndex + 1).padStart(2, "0")}</span>
                  <strong>{topicName}</strong>
                  <i>{count} вопр.</i>
                </SpotlightButton>
              );
            })}
          </div>
        </section>

        <div className="practice-banner">
          <div>
            <span>Не только теория</span>
            <strong>Подготовьтесь к практическому экзамену</strong>
            <p>
              Чек-лист навыков, типичные риски и план занятия с инструктором.
            </p>
          </div>
          <SpotlightLink href="/practice" className="secondary-cta">
            Открыть практику <span aria-hidden="true">→</span>
          </SpotlightLink>
        </div>
      </section>
    );
  }

  if (finished) {
    const verdict = passed
      ? mode === "exam"
        ? "Экзамен сдан"
        : "Тема освоена"
      : timedOut
        ? "Время закончилось"
        : "Нужна ещё попытка";

    return (
      <section className="test-result">
        <div className={`result-stamp ${passed ? "" : "failed"}`}>
          {passed ? "РЕЗУЛЬТАТ ЗАЧТЁН" : "ТРЕНИРОВКА ЗАВЕРШЕНА"}
        </div>
        <div className="result-number">
          {correctCount}
          <span>/ {answers.length || questions.length}</span>
        </div>
        <h1>{verdict}</h1>
        <p>
          Верно {resultPercent}% ответов
          {mode === "exam"
            ? `. Ошибок в основном блоке: ${baseErrors}, в дополнительном: ${extraErrors}.`
            : ". Результат и слабые темы уже добавлены в статистику."}
        </p>
        <div className="result-actions">
          <SpotlightButton
            className="primary-cta"
            onClick={() => start(mode, topic)}
          >
            Пройти ещё раз <span aria-hidden="true">↻</span>
          </SpotlightButton>
          <SpotlightButton className="secondary-cta" onClick={returnToHub}>
            Выбрать режим <span aria-hidden="true">←</span>
          </SpotlightButton>
          <SpotlightLink href="/stats" className="secondary-cta">
            Статистика <span aria-hidden="true">→</span>
          </SpotlightLink>
        </div>
      </section>
    );
  }

  if (!question) {
    return (
      <section className="test-loading" aria-live="polite">
        <div className="loading-line" />
        <p>Собираем вопросы…</p>
      </section>
    );
  }

  return (
    <section className="test-page">
      <div className="test-toolbar">
        <button className="back-to-modes" onClick={returnToHub}>
          ← Режимы
        </button>
        <span>{modeTitle(mode, topic)}</span>
        {mode === "exam" && (
          <strong className={timeLeft < 120 ? "timer-warning" : undefined}>
            {formatTime(timeLeft)}
          </strong>
        )}
      </div>

      <div className="test-intro">
        <div>
          <div className="section-kicker">
            {extraPhase ? "Дополнительный блок" : question.topic}
          </div>
          <h1>{question.prompt}</h1>
        </div>
        <div className="test-count">
          <strong>{String(index + 1).padStart(2, "0")}</strong>
          <span>/ {String(questions.length).padStart(2, "0")}</span>
        </div>
      </div>

      <div
        className="progress-track"
        aria-label={`Вопрос ${index + 1} из ${questions.length}`}
      >
        <div style={{ width: `${progress}%` }} />
      </div>

      <div className="test-layout">
        <div className="test-sign-panel">
          {question.visual.kind === "sign" ? (
            <>
              <button
                className={`test-sign-frame ${highlighted ? "highlighted" : ""}`}
                onClick={() => setHighlighted((value) => !value)}
                aria-pressed={highlighted}
                aria-label="Выделить знак красной рамкой"
              >
                <span className="sign-code">{question.visual.code}</span>
                <img
                  src={signImage(question.visual.file)}
                  alt={`Дорожный знак ${question.visual.code}`}
                  referrerPolicy="no-referrer"
                />
              </button>
              <p className="frame-hint">
                <span aria-hidden="true">↖</span> Нажмите на знак, чтобы выделить
                его красной рамкой
              </p>
            </>
          ) : (
            <div className={`question-scene scene-${question.visual.tone}`}>
              <span>{question.visual.label}</span>
              <strong>{question.visual.main}</strong>
              <p>{question.visual.note}</p>
            </div>
          )}
        </div>

        <div className="answers-panel">
          <div className="answers-label">Выберите один вариант</div>
          <div className="answers-list">
            {question.choices.map((answer, answerIndex) => {
              const isCorrect =
                Boolean(selected) && answer === question.correctAnswer;
              const isWrong =
                selected === answer && answer !== question.correctAnswer;
              return (
                <SpotlightButton
                  key={answer}
                  className={`answer-option ${isCorrect ? "correct" : ""} ${
                    isWrong ? "wrong" : ""
                  }`}
                  onClick={() => choose(answer)}
                  disabled={Boolean(selected)}
                >
                  <span>{String.fromCharCode(65 + answerIndex)}</span>
                  <strong>{answer}</strong>
                  <i aria-hidden="true">
                    {isCorrect ? "✓" : isWrong ? "×" : "→"}
                  </i>
                </SpotlightButton>
              );
            })}
          </div>

          {selected && (
            <div
              className={`answer-explanation ${
                selected === question.correctAnswer ? "success" : "error"
              }`}
              aria-live="polite"
            >
              <div>
                <strong>
                  {selected === question.correctAnswer
                    ? "Верно!"
                    : "Не совсем. Правильный ответ подсвечен зелёным."}
                </strong>
                <p>{question.explanation}</p>
              </div>
              <SpotlightButton className="next-button" onClick={next}>
                {index === questions.length - 1
                  ? mode === "exam" &&
                    !extraPhase &&
                    baseErrors >= 1 &&
                    baseErrors <= 2
                    ? "К дополнительным"
                    : "Узнать результат"
                  : "Дальше"}
                <span aria-hidden="true">→</span>
              </SpotlightButton>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
