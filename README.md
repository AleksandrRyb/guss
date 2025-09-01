# The Last Of Guss — запуск и краткая документация

## Быстрый старт (Docker Compose)

Предпосылки: установлен Docker Desktop (или совместимый runtime).

1. Клонировать репозиторий и перейти в каталог проекта
2. Собрать и запустить все сервисы

```bash
docker compose up --build
```

После старта:
- Клиент: http://localhost:5173
- API: http://localhost:3000
- Postgres: localhost:5432 (внутреннее имя хоста в compose: `postgres`)

Остановить и очистить контейнеры/образы/тома (по необходимости):
```bash
docker compose down -v --rmi local
```

## Локальный запуск без Docker (для разработки)

В отдельных терминалах:
```bash
# API
cd server
npm i
npm run db:generate
npm run db:migrate
npm run start:dev

# Клиент
cd client
npm i
npm run dev
```

## Переменные окружения (ключевые)

- API
  - `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRATION_TIME`, `JWT_REFRESH_EXPIRATION_TIME`
  - `DATABASE_URL` — строка подключения Postgres
  - `ROUND_DURATION`, `COOLDOWN_DURATION` — длительность раунда и «прогрев» в секундах
- Клиент
  - `VITE_API_URL` — базовый URL API (в compose уже проброшен)

## Кратко об архитектуре

- Клиент: React + TypeScript + Vite
  - Состояние серверных данных — TanStack Query
  - Маршрутизация — React Router
  - Стили — Tailwind
  - Бизнес‑логика: страницы `home` (список раундов), `round/:id` (таймер, зона «тапов»), `login`
- Сервер: NestJS + TypeScript
  - Модули: `auth`, `users`, `rounds`, `common`
  - БД: Postgres + Drizzle ORM, миграции: `server/scripts/migrate.js`
  - Аутентификация: JWT (access/refresh)
  - Логирование: JSON (nestjs-pino), автологгирование HTTP
  - Планировщик (`@nestjs/schedule`): перевод статусов `cooldown → active → finished` по времени
  - Домены:
    - `auth`: `POST /auth/login`, `POST /auth/refresh`
    - `rounds`:
      - `POST /rounds` (admin) — создать раунд (с «прогревом» и длительностью из env)
      - `GET /rounds` — список по статусам
      - `GET /rounds/:id` — детали раунда, `secondsUntilStart/End`; при `finished` — агрегированная статистика
      - `POST /rounds/:id/tap` — «тап» игрока (атомарно увеличивает taps и score, каждый 10‑й тап даёт бонус)
  - Схемы БД (Drizzle):
    - `rounds` — раунды (`id`, `start_at`, `end_at`, `status`, индексы по статусам/датам)
    - `round_users` — статистика пользователя в раунде (PK `(round_id,user_id)`, `taps`, `score`)
    - `round_stats` — агрегаты раунда (`players_total`, `taps_total`, `score_total`, победитель)

## Бизнес‑правила

- 1 тап = 1 очко; каждый 10‑й тап = 10 очков
- Тапать можно только в статусе `active`
- Пользователь с ролью `nikita`: его тап/очки не учитываются
- Статусы раунда меняются планировщиком по времени
- При переводе в `finished` считаются агрегаты и сохраняются в `round_stats`

## Потоки данных и консистентность

- `POST /rounds/:id/tap` выполняется атомарным UPSERT’ом (инкремент `taps/score` в одной операции)
- На клиенте таймер рассчитывается от серверных меток времени (`startAt/endAt`), чтобы исключить дрейф
- После `finished` клиент опрашивает API до появления агрегатов (поллинг 1с) и показывает лоадер

## Полезные команды

- Сервер
  - `npm run start:dev` — запуск в режиме разработки
  - `npm run db:migrate` — применить миграции
- Клиент
  - `npm run dev` — dev‑сервер
