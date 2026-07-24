import { HomeStats } from "./components/HomeStats";
import { SiteHeader } from "./components/SiteHeader";
import { SpotlightLink } from "./components/Spotlight";

const paths = [
  {
    number: "01",
    label: "Теория",
    title: "Экзамен и тренировки",
    text: "Пробный экзамен с таймером, короткая тренировка дня, темы и повторение ошибок.",
    href: "/test",
    action: "Выбрать режим",
    external: true,
    tone: "lime",
  },
  {
    number: "02",
    label: "Справочник",
    title: "Все дорожные знаки",
    text: "Карточки по категориям. Наведите на знак для пояснения или откройте подробную памятку.",
    href: "/signs",
    action: "Открыть каталог",
    tone: "amber",
  },
  {
    number: "03",
    label: "За рулём",
    title: "Подготовка к практике",
    text: "Чек-лист ключевых навыков, самодиагностика ошибок и план следующего занятия.",
    href: "/practice",
    action: "Открыть чек-лист",
    tone: "red",
  },
  {
    number: "04",
    label: "Прогресс",
    title: "Готовность к экзамену",
    text: "Точность по темам, серия занятий, вопросы на повторение и понятная оценка готовности.",
    href: "/stats",
    action: "Смотреть результаты",
    tone: "blue",
  },
] as const;

export default function Home() {
  return (
    <main className="site-shell">
      <SiteHeader active="home" />

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" />
            Интерактивный тренажёр ПДД
          </div>
          <h1>
            ПДД, которые
            <span> работают за рулём.</span>
          </h1>
          <p className="hero-lead">
            Готовьтесь к теории и практике в одном месте: решайте экзамен,
            разбирайте ошибки, повторяйте слабые темы и отмечайте навыки,
            отработанные с инструктором.
          </p>
          <div className="hero-actions">
            <SpotlightLink href="/test" target="_blank" className="primary-cta">
              Пробный экзамен
              <span aria-hidden="true">↗</span>
            </SpotlightLink>
            <a className="text-link" href="/practice">
              Подготовиться к практике <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="hero-road" aria-label="Пример дорожного знака">
          <div className="road-grid" />
          <div className="speed-sign" aria-hidden="true">
            <div>50</div>
          </div>
          <div className="road-caption">
            <span>3.24</span>
            Ограничение максимальной скорости
          </div>
          <div className="route-mark route-mark-one">ПРАКТИКА</div>
          <div className="route-mark route-mark-two">ЗНАНИЯ</div>
        </div>
      </section>

      <section className="quick-stats" aria-label="Краткая статистика">
        <div className="section-kicker">Ваш прогресс</div>
        <HomeStats />
      </section>

      <section className="learning-paths">
        <div className="section-heading">
          <div>
            <div className="section-kicker">Выберите маршрут</div>
            <h2>Четыре шага к уверенности</h2>
          </div>
          <p>
            Результаты тестов сохраняются на этом устройстве автоматически.
          </p>
        </div>

        <div className="path-grid">
          {paths.map((item) => (
            <article className={`path-card path-${item.tone}`} key={item.number}>
              <div className="path-topline">
                <span>{item.number}</span>
                <span>{item.label}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <SpotlightLink
                href={item.href}
                target={item.external ? "_blank" : undefined}
                className="path-action"
              >
                {item.action}
                <span aria-hidden="true">→</span>
              </SpotlightLink>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <div className="brand-lockup">
          <span className="brand-mark">ДК</span>
          <span>Дорожный кодекс</span>
        </div>
        <p>Учебный тренажёр. Не заменяет официальные Правила дорожного движения.</p>
      </footer>
    </main>
  );
}
