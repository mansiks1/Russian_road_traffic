"use client";

import { useEffect, useMemo, useState } from "react";
import {
  categories,
  roadSigns,
  signImage,
  type RoadSign,
  type SignCategory,
} from "../data/signs";

export function SignsGallery() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SignCategory | "Все">("Все");
  const [selected, setSelected] = useState<RoadSign | null>(null);
  const [highlighted, setHighlighted] = useState(false);

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ru");
    return roadSigns.filter((sign) => {
      const matchesCategory = category === "Все" || sign.category === category;
      const matchesQuery =
        !normalized ||
        sign.name.toLocaleLowerCase("ru").includes(normalized) ||
        sign.code.includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openSign = (sign: RoadSign) => {
    setSelected(sign);
    setHighlighted(false);
  };

  return (
    <section className="catalog-page">
      <div className="catalog-heading">
        <div>
          <div className="section-kicker">Визуальный справочник</div>
          <h1>Все знаки — без сухих формулировок</h1>
          <p>
            Наведите на карточку для короткой подсказки. Нажмите, чтобы увидеть
            подробное объяснение и важные нюансы.
          </p>
        </div>
        <div className="catalog-count">
          <strong>{visible.length}</strong>
          <span>знаков в каталоге</span>
        </div>
      </div>

      <div className="catalog-tools">
        <label className="sign-search">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Поиск знака</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Название или номер знака"
          />
        </label>
        <div className="category-filter" aria-label="Категории знаков">
          {(["Все", ...categories] as const).map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {visible.length ? (
        <div className="sign-grid">
          {visible.map((sign) => (
            <button className="sign-card" key={sign.id} onClick={() => openSign(sign)}>
              <div className="sign-card-meta">
                <span>{sign.code}</span>
                <span>{sign.category}</span>
              </div>
              <div className="sign-card-image">
                <img
                  src={signImage(sign.file)}
                  alt={sign.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="sign-card-copy">
                <h2>{sign.name}</h2>
                <p>{sign.short}</p>
              </div>
              <span className="card-open" aria-hidden="true">
                Подробнее ↗
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-catalog">
          <strong>Ничего не нашлось</strong>
          <p>Попробуйте изменить запрос или выбрать другую категорию.</p>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <section
            className="sign-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
              aria-label="Закрыть подробное описание"
            >
              ×
            </button>
            <div className="modal-sign-side">
              <div className="modal-code">{selected.code}</div>
              <button
                className={`modal-sign-image ${highlighted ? "highlighted" : ""}`}
                onClick={() => setHighlighted((value) => !value)}
                aria-pressed={highlighted}
                aria-label="Выделить знак красной рамкой"
              >
                <img
                  src={signImage(selected.file)}
                  alt={selected.name}
                  referrerPolicy="no-referrer"
                />
              </button>
              <span>Нажмите на знак, чтобы выделить</span>
            </div>
            <div className="modal-copy">
              <div className="modal-category">{selected.category}</div>
              <h2 id="sign-modal-title">{selected.name}</h2>
              <p className="modal-short">{selected.short}</p>
              <div className="modal-rule">
                <span>Что важно помнить</span>
                <p>{selected.details}</p>
              </div>
              <a href="/test" target="_blank" rel="noreferrer">
                Проверить этот раздел в тесте <span aria-hidden="true">↗</span>
              </a>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
