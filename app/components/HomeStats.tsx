"use client";

import { useEffect, useState } from "react";
import { emptyStats, readStats, type Stats } from "../lib/stats";

export function HomeStats() {
  const [stats, setStats] = useState<Stats>(emptyStats);

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

  return (
    <div className="quick-stats-row">
      <div>
        <strong>{stats.completedTests}</strong>
        <span>тестов завершено</span>
      </div>
      <div>
        <strong>{stats.correctAnswers}</strong>
        <span>верных ответов</span>
      </div>
      <div>
        <strong>{percent}%</strong>
        <span>общая точность</span>
      </div>
      <a href="/stats">
        Подробная статистика <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
