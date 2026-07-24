"use client";

import { useEffect, useMemo, useState } from "react";
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
              ? percent >= 80
                ? "Вы уверенно распознаёте большинство знаков."
                : "Ещё немного практики — и результат заметно вырастет."
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
                    <strong>Тест по дорожным знакам</strong>
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
              <p>Ответьте на 10 вопросов — результат сохранится автоматически.</p>
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
