import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set(
    "test",
    `${pathname}-${process.pid}-${Date.now()}-${Math.random()}`,
  );
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished public home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Дорожный кодекс/);
  assert.match(html, /ПДД, которые/);
  assert.match(html, /Экзамен и тренировки/);
  assert.match(html, /Подготовка к практике/);
  assert.doesNotMatch(html, /codex-preview|Building your site/i);
});

test("renders the training hub and practical preparation routes", async () => {
  const [trainingResponse, practiceResponse] = await Promise.all([
    render("/test"),
    render("/practice"),
  ]);

  assert.equal(trainingResponse.status, 200);
  assert.equal(practiceResponse.status, 200);

  const [trainingHtml, practiceHtml] = await Promise.all([
    trainingResponse.text(),
    practiceResponse.text(),
  ]);

  assert.match(trainingHtml, /Выберите режим/);
  assert.match(trainingHtml, /Работа над ошибками/);
  assert.match(trainingHtml, /Тематические тренировки/);
  assert.match(practiceHtml, /Навыки, которые должны стать привычкой/);
  assert.match(practiceHtml, /Самодиагностика/);
});

test("keeps the expanded learning content and metadata in source", async () => {
  const [questions, layout, stats] = await Promise.all([
    readFile(new URL("../app/data/questions.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/stats.ts", import.meta.url), "utf8"),
  ]);

  assert.match(questions, /Приоритет и перекрёстки/);
  assert.match(questions, /Первая помощь/);
  assert.match(layout, /og-v2\.png/);
  assert.match(stats, /wrongQuestionIds/);
  assert.match(stats, /topicProgress/);
});
