"use client";

import { useEffect, useMemo, useState } from "react";
import { quizTopics } from "../data/questions";
import { clearStats, emptyStats, readStats, type Stats } from "../lib/stats";
import { SpotlightButton, SpotlightLink } from "./Spotlight";

const formatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function StatsDashboard() {
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const update = () => setStats(readStats());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("road-code-stats", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("road-code-stats", update);
    };
  }, []);

  const percent = stats.totalQuestions
    ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
    : 0;

  const best = useMemo(
    () =>
      stats.attempts.reduce(
        (maximum, attempt) =>
          Math.max(maximum, Math.round((attempt.correct / attempt.questions) * 100)),
        0,
      ),
    [stats.attempts],
  );

  const practicedTopics = quizTopics.filter(
    (topic) => (stats.topicProgress[topic]?.questions ?? 0) > 0,
  ).length;
  const readiness = stats.totalQuestions
    ? Math.min(
        100,
        Math.round(
          percent * 0.7 +
            (practicedTopics / quizTopics.length) * 20 +
            Math.min(stats.completedTests / 5, 1) * 10,
        ),
      )
    : 0;

  const streak = useMemo(() => {
    const days = new Set(
      stats.attempts.map((attempt) => attempt.date.slice(0, 10)),
    );
    let count = 0;
    const cursor = new Date();
    const today = cursor.toISOString().slice(0, 10);
    if (!days.has(today)) cursor.setDate(cursor.getDate() - 1);
    while (days.has(cursor.toISOString().slice(0, 10))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [stats.attempts]);

  const erase = () => {
    clearStats();
    setStats(emptyStats);
    setConfirming(false);
  };

  return (
    <section className="stats-page">
      <div className="stats-heading">
        <div>
          <div className="section-kicker">Личная статистика</div>
          <h1>Ваш прогресс за рулём знаний</h1>
          <p>
            Все результаты хранятся только в этом браузере и обновляются после
            каждого завершённого теста.
          </p>
        </div>
        <SpotlightLink href="/test" target="_blank" className="primary-cta">
          Новый тест <span aria-hidden="true">↗</span>
        </SpotlightLink>
      </div>

      <div className="stats-main-grid">
        <article className="stat-hero-card">
          <div className="stat-card-label">Общая точность</div>
          <div
            className="accuracy-ring"
            style={{ "--score": `${percent * 3.6}deg` } as React.CSSProperties}
          >
            <div>
              <strong>{percent}%</strong>
              <span>правильных ответов</span>
            </div>
          </div>
          <p>
            {stats.totalQuestions
              ? readiness >= 85
                ? "Хорошая форма: закрепите результат экзаменационной попыткой."
                : "Продолжайте тренировки и закрывайте слабые темы."
              : "Пройдите первый тест, чтобы увидеть точность."}
          </p>
        </article>

        <div className="stat-number-grid">
          <article>
            <span>01</span>
            <strong>{stats.totalQuestions}</strong>
            <h2>Задано вопросов</h2>
            <p>Общее количество вопросов во всех завершённых тестах.</p>
          </article>
          <article>
            <span>02</span>
            <strong>{stats.correctAnswers}</strong>
            <h2>Правильных ответов</h2>
            <p>Сколько раз вы точно узнали показанный дорожный знак.</p>
          </article>
          <article>
            <span>03</span>
            <strong>{stats.completedTests}</strong>
            <h2>Выполнено тестов</h2>
            <p>Засчитываются только тесты, пройденные до результата.</p>
          </article>
          <article>
            <span>04</span>
            <strong>{best}%</strong>
            <h2>Лучший результат</h2>
            <p>Самая высокая точность среди последних попыток.</p>
          </article>
        </div>
      </div>

      <section className="readiness-section">
        <article className="readiness-card">
          <div>
            <div className="section-kicker">Оценка готовности</div>
            <h2>{readiness}%</h2>
            <strong>
              {readiness >= 85
                ? "Можно пробовать экзамен"
                : readiness >= 60
                  ? "База уже есть"
                  : "Продолжайте подготовку"}
            </strong>
            <p>
              Оценка учитывает точность, количество изученных тем и регулярность
              завершённых тренировок.
            </p>
          </div>
          <div className="readiness-details">
            <div>
              <strong>{practicedTopics}/{quizTopics.length}</strong>
              <span>тем затронуто</span>
            </div>
            <div>
              <strong>{stats.wrongQuestionIds.length}</strong>
              <span>вопросов повторить</span>
            </div>
            <div>
              <strong>{streak}</strong>
              <span>дней подряд</span>
            </div>
          </div>
          <SpotlightLink href="/test" className="primary-cta">
            Продолжить подготовку <span aria-hidden="true">→</span>
          </SpotlightLink>
        </article>

        <div className="topic-progress-grid">
          {quizTopics.map((topic, topicIndex) => {
            const topicStats = stats.topicProgress[topic] ?? {
              questions: 0,
              correct: 0,
            };
            const topicPercent = topicStats.questions
              ? Math.round((topicStats.correct / topicStats.questions) * 100)
              : 0;
            return (
              <article key={topic}>
                <span>{String(topicIndex + 1).padStart(2, "0")}</span>
                <h3>{topic}</h3>
                <strong>{topicStats.questions ? `${topicPercent}%` : "—"}</strong>
                <div>
                  <i style={{ width: `${topicPercent}%` }} />
                </div>
                <p>
                  {topicStats.questions
                    ? `${topicStats.correct} из ${topicStats.questions} верно`
                    : "Тема ещё не изучалась"}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="attempts-section">
        <div className="attempts-title">
          <div>
            <div className="section-kicker">История</div>
            <h2>Последние попытки</h2>
          </div>
          {stats.completedTests > 0 && !confirming && (
            <button className="clear-link" onClick={() => setConfirming(true)}>
              Очистить статистику
            </button>
          )}
          {confirming && (
            <div className="clear-confirm">
              <span>Удалить все результаты?</span>
              <button onClick={erase}>Да, удалить</button>
              <button onClick={() => setConfirming(false)}>Отмена</button>
            </div>
          )}
        </div>

        {stats.attempts.length ? (
          <div className="attempts-list">
            {stats.attempts.map((attempt, attemptIndex) => {
              const score = Math.round((attempt.correct / attempt.questions) * 100);
              return (
                <article key={attempt.id}>
                  <span className="attempt-index">
                    {String(attemptIndex + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <strong>{attempt.title ?? "Тест по дорожным знакам"}</strong>
                    <span>{formatter.format(new Date(attempt.date))}</span>
                  </div>
                  <div className="attempt-score">
                    <strong>
                      {attempt.correct}/{attempt.questions}
                    </strong>
                    <span>{score}%</span>
                  </div>
                  <div className="attempt-bar">
                    <i style={{ width: `${score}%` }} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-stats">
            <div className="empty-icon" aria-hidden="true">
              ↗
            </div>
            <div>
              <strong>Здесь появится история ваших тестов</strong>
              <p>Завершите любую тренировку — результат сохранится автоматически.</p>
            </div>
            <SpotlightLink href="/test" target="_blank" className="secondary-cta">
              Пройти первый тест
            </SpotlightLink>
          </div>
        )}
      </section>
    </section>
  );
}
