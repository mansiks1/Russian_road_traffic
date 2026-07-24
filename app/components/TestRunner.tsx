"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { quizSigns, signImage, type RoadSign } from "../data/signs";
import { recordAttempt } from "../lib/stats";
import { SpotlightButton, SpotlightLink } from "./Spotlight";

type Question = RoadSign & {
  choices: string[];
  options: string[];
  correctAnswer: string;
};

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function buildQuestions(): Question[] {
  return shuffle(quizSigns)
    .slice(0, 10)
    .map((sign) => ({
      ...sign,
      correctAnswer: sign.choices[0],
      options: shuffle(sign.choices),
    }));
}

export function TestRunner() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const saved = useRef(false);

  const begin = () => {
    setQuestions(buildQuestions());
    setIndex(0);
    setSelected(null);
    setCorrect(0);
    setFinished(false);
    setHighlighted(false);
    saved.current = false;
  };

  useEffect(() => {
    begin();
  }, []);

  const question = questions[index];
  const progress = questions.length
    ? ((index + (finished ? 1 : 0)) / questions.length) * 100
    : 0;

  const resultPercent = useMemo(
    () => (questions.length ? Math.round((correct / questions.length) * 100) : 0),
    [correct, questions.length],
  );

  const choose = (answer: string) => {
    if (selected) return;
    setSelected(answer);
    if (answer === question.correctAnswer) setCorrect((value) => value + 1);
  };

  const next = () => {
    if (!selected) return;
    if (index === questions.length - 1) {
      const finalCorrect = correct;
      if (!saved.current) {
        recordAttempt(questions.length, finalCorrect);
        saved.current = true;
      }
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setHighlighted(false);
  };

  if (!question) {
    return (
      <section className="test-loading" aria-live="polite">
        <div className="loading-line" />
        <p>Собираем вопросы…</p>
      </section>
    );
  }

  if (finished) {
    const verdict =
      resultPercent >= 90
        ? "Отличная форма"
        : resultPercent >= 70
          ? "Хороший результат"
          : "Стоит повторить знаки";

    return (
      <section className="test-result">
        <div className="result-stamp">ТЕСТ ЗАВЕРШЁН</div>
        <div className="result-number">
          {correct}
          <span>/ {questions.length}</span>
        </div>
        <h1>{verdict}</h1>
        <p>
          Вы ответили верно на {resultPercent}% вопросов. Результат уже добавлен
          в вашу статистику.
        </p>
        <div className="result-actions">
          <SpotlightButton className="primary-cta" onClick={begin}>
            Пройти ещё раз <span aria-hidden="true">↻</span>
          </SpotlightButton>
          <SpotlightLink href="/stats" className="secondary-cta">
            Открыть статистику <span aria-hidden="true">→</span>
          </SpotlightLink>
        </div>
      </section>
    );
  }

  return (
    <section className="test-page">
      <div className="test-intro">
        <div>
          <div className="section-kicker">Проверка знаний</div>
          <h1>Как называется этот знак?</h1>
        </div>
        <div className="test-count">
          <strong>{String(index + 1).padStart(2, "0")}</strong>
          <span>/ {String(questions.length).padStart(2, "0")}</span>
        </div>
      </div>

      <div className="progress-track" aria-label={`Вопрос ${index + 1} из ${questions.length}`}>
        <div style={{ width: `${progress}%` }} />
      </div>

      <div className="test-layout">
        <div className="test-sign-panel">
          <button
            className={`test-sign-frame ${highlighted ? "highlighted" : ""}`}
            onClick={() => setHighlighted((value) => !value)}
            aria-pressed={highlighted}
            aria-label="Выделить знак красной рамкой"
          >
            <span className="sign-code">{question.code}</span>
            <img
              src={signImage(question.file)}
              alt={`Дорожный знак ${question.code}`}
              referrerPolicy="no-referrer"
            />
          </button>
          <p className="frame-hint">
            <span aria-hidden="true">↖</span> Нажмите на знак, чтобы выделить его
            красной рамкой
          </p>
        </div>

        <div className="answers-panel">
          <div className="answers-label">Выберите один вариант</div>
          <div className="answers-list">
            {question.options.map((answer, answerIndex) => {
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
                    : "Не совсем."}
                </strong>
                <p>{question.details}</p>
              </div>
              <SpotlightButton className="next-button" onClick={next}>
                {index === questions.length - 1 ? "Узнать результат" : "Дальше"}
                <span aria-hidden="true">→</span>
              </SpotlightButton>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
