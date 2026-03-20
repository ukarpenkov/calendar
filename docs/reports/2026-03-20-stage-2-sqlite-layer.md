# Отчет: Этап 2. SQLite layer

Дата: `2026-03-20`

Источник задачи: `docs/GLOBAL-DEVELOPMENT-PLAN.md`

## Что было сделано

Реализован второй этап плана: проект получил рабочий `SQLite`-слой как канонический источник активного календаря.

Принятое решение:

- SQLite-библиотека: `@op-engineering/op-sqlite`
- тестовая node-поддержка для repository-тестов: `better-sqlite3`
- структура хранения выровнена под FSD, без возврата к плоскому `src/storage`

## Реализованные изменения

### 1. База данных и схема

Добавлен FSD-совместимый слой БД:

- `src/shared/lib/db/schema.ts`
- `src/shared/lib/db/database.ts`
- `src/shared/lib/db/index.ts`

Реализовано:

- имя локальной БД `calendar.sqlite`
- схема версии `1`
- таблица `app_metadata`
- таблица `calendar_days`
- индексы по `year` и `(year, month)`
- `PRAGMA user_version` для версии схемы

### 2. Calendar repository

Добавлен repository-слой:

- `src/entities/calendar/model/mappers.ts`
- `src/entities/calendar/model/repository.ts`

Через него доступны операции:

- `seedBundledYearIfNeeded`
- `getActiveYear`
- `getYearCalendar`
- `getMonthCalendar`
- `replaceActiveYear`

### 3. Seed bundled 2026

Первый запуск теперь может заполнить БД через единую дорожку:

`calendar2026.json` -> `validate + normalize` -> транзакционная запись в `SQLite`

Это сохраняет единый контракт для:

- bundled seed
- будущего пользовательского импорта

### 4. App bootstrap

`src/app/App.tsx` больше не является только шаблонным экраном.

Сейчас приложение:

- при старте вызывает `seedBundledYearIfNeeded`
- инициализирует локальную БД
- показывает состояние загрузки
- после успеха подтверждает, что активный год загружен из локального storage

Полноценный `Splash` и экран года остаются следующим этапом по плану.

### 5. Документация

Обновлены плановые документы:

- `docs/GLOBAL-DEVELOPMENT-PLAN.md`
- `docs/development-plan.md`

В них зафиксированы:

- выбор `@op-engineering/op-sqlite`
- FSD-совместимое размещение storage-слоя
- точная схема и repository API

## Что проверено

Добавлены и/или обновлены тесты:

- `__tests__/App.test.tsx`
- `__tests__/calendarRepository.test.ts`

Фактически выполненная проверка:

- `npm test -- --runInBand`
- `npx tsc --noEmit`
- проверка встроенных диагностик по измененным файлам

## Результат этапа

После этого этапа проект уже умеет:

- открыть локальную `SQLite`-базу
- создать нужную схему
- засидить bundled `2026`, если БД пуста или неполна
- читать активный год и месяц из `SQLite`
- атомарно заменить активный год в БД

## Что еще не делалось

В этот этап не входили:

- полноценный `Splash` по дизайну
- экран года
- экран месяца
- settings UI
- file picker и пользовательский импорт через интерфейс

## Следующий шаг

Следующий этап по плану: bootstrap приложения и `Splash`, который скрывает инициализацию БД и открывает главный годовой экран после готовности данных.
