export function SiteHeader({
  active,
}: {
  active: "home" | "test" | "signs" | "practice" | "stats";
}) {
  const links = [
    { id: "home", href: "/", label: "Главная" },
    { id: "test", href: "/test", label: "Тренировки" },
    { id: "signs", href: "/signs", label: "Все знаки" },
    { id: "practice", href: "/practice", label: "Практика" },
    { id: "stats", href: "/stats", label: "Статистика" },
  ] as const;

  return (
    <header className="site-header">
      <a href="/" className="brand-lockup" aria-label="Дорожный кодекс — на главную">
        <span className="brand-mark">ДК</span>
        <span>
          Дорожный
          <br />
          кодекс
        </span>
      </a>
      <nav aria-label="Основная навигация">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            className={active === link.id ? "active" : undefined}
            aria-current={active === link.id ? "page" : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <a href="/test" className="header-test">
        Экзамен 20 минут <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
