"use client";

import { useEffect, useMemo, useState } from "react";
import { SpotlightButton, SpotlightLink } from "./Spotlight";

const skills = [
  {
    id: "setup",
    number: "01",
    title: "Посадка и подготовка",
    description:
      "Отрегулировать сиденье, зеркала, рулевую колонку; пристегнуться и проверить пассажиров.",
    drill: "Повторите полный порядок действий три раза без подсказок.",
  },
  {
    id: "start",
    number: "02",
    title: "Начало движения",
    description:
      "Оценить обстановку, включить указатель поворота, проверить слепую зону и плавно начать движение.",
    drill: "Сделайте пять стартов от края проезжей части в разных условиях.",
  },
  {
    id: "lanes",
    number: "03",
    title: "Полосы и перестроение",
    description:
      "Заранее занимать нужную полосу, соблюдать интервал и перестраиваться без помех.",
    drill: "Проговорите цикл: зеркало — сигнал — слепая зона — манёвр.",
  },
  {
    id: "intersections",
    number: "04",
    title: "Перекрёстки",
    description:
      "Вовремя определить приоритет, снизить скорость и контролировать пешеходов при повороте.",
    drill: "На каждом перекрёстке вслух называйте, кому вы уступаете.",
  },
  {
    id: "pedestrians",
    number: "05",
    title: "Пешеходные переходы",
    description:
      "Заранее видеть переход, оценивать людей у края дороги и не закрывать обзор другим.",
    drill: "Тренируйте раннее обнаружение перехода и плавное снижение скорости.",
  },
  {
    id: "speed",
    number: "06",
    title: "Скорость и дистанция",
    description:
      "Выбирать скорость по условиям, замечать ограничения и сохранять запас для остановки.",
    drill: "Попросите инструктора внезапно назвать точку безопасной остановки.",
  },
  {
    id: "parking",
    number: "07",
    title: "Параллельная парковка",
    description:
      "Контролировать габариты, двигаться медленно и постоянно проверять обстановку вокруг.",
    drill: "Повторите парковку с разных стартовых положений, а не по одной метке.",
  },
  {
    id: "reverse",
    number: "08",
    title: "Движение задним ходом",
    description:
      "Убедиться в безопасности, контролировать обе стороны и при необходимости остановиться.",
    drill: "Тренируйте движение с минимальной скоростью и остановкой по команде.",
  },
  {
    id: "turn",
    number: "09",
    title: "Разворот и повороты",
    description:
      "Занять правильное положение, уступить участникам движения и завершить манёвр в своей полосе.",
    drill: "Отработайте несколько вариантов разворота на разрешённых участках.",
  },
  {
    id: "stop",
    number: "10",
    title: "Остановка и завершение",
    description:
      "Выбрать разрешённое место, безопасно прижаться к краю и зафиксировать автомобиль.",
    drill: "Пусть инструктор выбирает точку остановки неожиданно, но заблаговременно.",
  },
];

const risks = [
  {
    id: "mirrors",
    title: "Смотрю только вперёд",
    text: "Не хватает регулярного контроля зеркал и слепых зон.",
  },
  {
    id: "late-signals",
    title: "Поздно включаю поворотник",
    text: "Другие участники не успевают понять ваше намерение.",
  },
  {
    id: "rush",
    title: "Тороплюсь после команды",
    text: "Команда экзаменатора не отменяет проверку безопасности и знаков.",
  },
  {
    id: "priority",
    title: "Теряюсь в приоритете",
    text: "Нужно раньше распознавать тип перекрёстка и главную дорогу.",
  },
  {
    id: "pedestrian",
    title: "Поздно вижу пешеходов",
    text: "Сканируйте не только переход, но и подходы к нему.",
  },
  {
    id: "speed-control",
    title: "Не замечаю ограничения",
    text: "После каждого поворота и перекрёстка проверяйте текущий режим скорости.",
  },
];

const STORAGE_KEY = "road-code-practice-v1";

type PracticeState = {
  completed: string[];
  risks: string[];
};

const emptyPractice: PracticeState = { completed: [], risks: [] };

function readPractice(): PracticeState {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "{}",
    ) as Partial<PracticeState>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
    };
  } catch {
    return emptyPractice;
  }
}

export function PracticeCoach() {
  const [practice, setPractice] = useState<PracticeState>(emptyPractice);

  useEffect(() => {
    setPractice(readPractice());
  }, []);

  const update = (next: PracticeState) => {
    setPractice(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const toggleSkill = (skillId: string) => {
    const completed = new Set(practice.completed);
    if (completed.has(skillId)) completed.delete(skillId);
    else completed.add(skillId);
    update({ ...practice, completed: [...completed] });
  };

  const toggleRisk = (riskId: string) => {
    const selectedRisks = new Set(practice.risks);
    if (selectedRisks.has(riskId)) selectedRisks.delete(riskId);
    else selectedRisks.add(riskId);
    update({ ...practice, risks: [...selectedRisks] });
  };

  const progress = Math.round((practice.completed.length / skills.length) * 100);
  const selectedRisks = useMemo(
    () => risks.filter((risk) => practice.risks.includes(risk.id)),
    [practice.risks],
  );

  return (
    <section className="practice-page">
      <div className="practice-heading">
        <div>
          <div className="section-kicker">Практический экзамен</div>
          <h1>Навыки, которые должны стать привычкой</h1>
          <p>
            Отмечайте только то, что стабильно выполняете без подсказки
            инструктора. Чек-лист сохраняется на этом устройстве.
          </p>
        </div>
        <div className="practice-progress">
          <strong>{progress}%</strong>
          <span>навыков отработано</span>
          <div>
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="skill-list">
        {skills.map((skill) => {
          const completed = practice.completed.includes(skill.id);
          return (
            <article className={completed ? "completed" : undefined} key={skill.id}>
              <button
                className="skill-check"
                onClick={() => toggleSkill(skill.id)}
                aria-pressed={completed}
                aria-label={`${completed ? "Убрать" : "Отметить"} навык «${skill.title}»`}
              >
                {completed ? "✓" : skill.number}
              </button>
              <div>
                <h2>{skill.title}</h2>
                <p>{skill.description}</p>
              </div>
              <div className="skill-drill">
                <span>Упражнение</span>
                <p>{skill.drill}</p>
              </div>
            </article>
          );
        })}
      </div>

      <section className="risk-section">
        <div className="risk-heading">
          <div>
            <div className="section-kicker">Самодиагностика</div>
            <h2>Что происходит на занятиях?</h2>
          </div>
          <p>
            Выберите повторяющиеся проблемы — ниже появится план следующей
            тренировки. Это учебная самооценка, а не официальный экзаменационный
            лист.
          </p>
        </div>
        <div className="risk-grid">
          {risks.map((risk) => {
            const selected = practice.risks.includes(risk.id);
            return (
              <SpotlightButton
                className={`risk-card ${selected ? "selected" : ""}`}
                key={risk.id}
                onClick={() => toggleRisk(risk.id)}
                aria-pressed={selected}
              >
                <span>{selected ? "×" : "+"}</span>
                <strong>{risk.title}</strong>
                <p>{risk.text}</p>
              </SpotlightButton>
            );
          })}
        </div>
      </section>

      <section className="lesson-plan">
        <div>
          <div className="section-kicker">План следующего занятия</div>
          <h2>
            {selectedRisks.length
              ? `${selectedRisks.length} зоны внимания`
              : "Выберите слабые места выше"}
          </h2>
        </div>
        {selectedRisks.length ? (
          <ol>
            {selectedRisks.map((risk) => (
              <li key={risk.id}>
                <strong>{risk.title}</strong>
                <span>{risk.text}</span>
              </li>
            ))}
            <li>
              <strong>Контрольный маршрут</strong>
              <span>
                Завершите занятие двадцатиминутным маршрутом без подсказок и
                разберите только повторяющиеся ошибки.
              </span>
            </li>
          </ol>
        ) : (
          <p className="lesson-empty">
            После выбора проблем здесь сформируется короткий список задач,
            который можно показать инструктору перед поездкой.
          </p>
        )}
      </section>

      <section className="exam-day">
        <div>
          <span>Перед экзаменом</span>
          <h2>Спокойный порядок действий</h2>
        </div>
        <ol>
          <li>Настройте посадку и зеркала до начала движения.</li>
          <li>Слушайте команду до конца и выбирайте только разрешённый манёвр.</li>
          <li>Не спешите: зеркало, сигнал, слепая зона, затем действие.</li>
          <li>Если команда противоречит ПДД, продолжайте движение безопасно.</li>
        </ol>
        <SpotlightLink href="/test" className="primary-cta">
          Проверить теорию <span aria-hidden="true">→</span>
        </SpotlightLink>
      </section>
    </section>
  );
}
