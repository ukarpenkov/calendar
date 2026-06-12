# Задачи реализации фичи «Отпуск»

> **Статус:** в процессе реализации

---

## Общие правила (дублируются в каждом пункте)

1. **Язык кода** — TypeScript, React Native (не Kotlin/Java, не Jetpack Compose).
2. **Архитектура** — feature-sliced: `src/entities/`, `src/features/`, `src/pages/`, `src/shared/`. Репозитории — фабричные функции, DI через замыкания (без Hilt/Koin).
3. **БД** — SQLite через `@op-engineering/op-sqlite`. Запросы — `db.execute()` / `db.executeBatch()`. Миграции через `PRAGMA user_version` в `src/shared/lib/db/database.ts`.
4. **UI** — `StyleSheet.create()`, никаких сторонних UI-библиотек. Навигация — дискриминированное union-состояние (`ReadyScreen` в `src/app/model/user-flow.ts`).
5. **i18n** — ключи в `src/shared/lib/i18n/messages/en.ts` (тип `TranslationKey`), переводы в `ru.ts`, `tr.ts`, `id.ts`, `ja.ts`. Интерполяция — `{{var}}`.
6. **Тесты** — Jest + `better-sqlite3` in-memory (`:memory:`). Тесты в `__tests__/`. После каждого шага запускай `npx jest --passWithNoTests` и убеждайся, что все тесты зелёные.
7. **Виджет** — React Native виджет через `react-native-android-widget` в `src/widgets/`. Kotlin-обёртка в `android/app/src/main/java/com/prodyk/calendar/`.
8. **Типы дней** — `DayType = 'workday' | 'weekend' | 'holiday' | 'shortened'`. Отпуск — **НЕ** новый тип дня, а оверлей из отдельной таблицы.
9. **Приоритет отображения**: праздник > сокращённый > выходной > рабочий. Отпуск показывается только для рабочих дней (не перекрывает праздники/выходные).
10. **Цветовая палитра** — `CalendarPalette` в `src/entities/calendar/lib/presentation.ts`. У отпуска свой цвет (бирюзовый), не пересекающийся с существующими типами.

---

## Шаг 1. Создать таблицу `vacation_periods` и миграцию БД v3 → v4

**Статус:** ✅ выполнено

**Промт:**

Добавь в проект таблицу `vacation_periods` в SQLite и миграцию схемы v3 → v4.

**Что сделать:**
1. В `src/shared/lib/db/schema.ts`:
   - Увеличь `DATABASE_SCHEMA_VERSION` до `4`.
   - Добавь в `SCHEMA_COMMANDS` создание таблицы:
     ```sql
     CREATE TABLE IF NOT EXISTS vacation_periods (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       start_date TEXT NOT NULL,
       end_date TEXT NOT NULL,
       color TEXT NOT NULL DEFAULT '#2DD4BF'
     ) STRICT
     ```
2. В `src/shared/lib/db/database.ts`:
   - Добавь функцию `migrateFromV3ToV4(db)`, которая создаёт таблицу `vacation_periods`.
   - В `applyMigrations` добавь вызов `if (currentVersion < 4) { await migrateFromV3ToV4(db); }`.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- БД: SQLite через `@op-engineering/op-sqlite`. Запросы — `db.execute()` / `db.executeBatch()`.
- Миграции через `PRAGMA user_version` в `src/shared/lib/db/database.ts`.
- Тесты: Jest + `better-sqlite3` in-memory (`:memory:`). После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.
- НЕ меняй `DayType`, НЕ трогай таблицу `calendar_days`.

---

## Шаг 2. Написать тесты для миграции БД и таблицы `vacation_periods`

**Статус:** ✅ выполнено

**Промт:**

Напиши тесты для новой таблицы `vacation_periods` и миграции v3 → v4.

**Что сделать:**
1. Создай файл `__tests__/vacationRepository.test.ts`.
2. Используй паттерн из `__tests__/calendarRepository.test.ts`: `open({ name: '...', location: ':memory:' })`, `initializeDatabase(db)`.
3. Напиши тесты:
   - Таблица `vacation_periods` создаётся после инициализации БД (попробуй вставить запись — не должно быть ошибки).
   - Можно вставить запись с `start_date`, `end_date`, `color`.
   - Можно прочитать записи обратно.
   - Можно удалить запись по `id`.
   - Можно обновить `color` по `id`.
   - `id` автоинкрементится.
4. Запусти `npx jest __tests__/vacationRepository.test.ts` — все тесты должны пройти.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- БД: SQLite через `@op-engineering/op-sqlite`. Запросы — `db.execute()` / `db.executeBatch()`.
- Миграции через `PRAGMA user_version` в `src/shared/lib/db/database.ts`.
- Тесты: Jest + `better-sqlite3` in-memory (`:memory:`). После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.
- НЕ меняй `DayType`, НЕ трогай таблицу `calendar_days`.

---

## Шаг 3. Создать VacationRepository (CRUD для `vacation_periods`)

**Статус:** ✅ выполнено

**Промт:**

Создай `VacationRepository` — слой доступа к данным для таблицы `vacation_periods`.

**Что сделать:**
1. Создай `src/features/vacation/model/types.ts`:
   ```typescript
   export interface VacationPeriod {
     id: number;
     startDate: string; // YYYY-MM-DD
     endDate: string;   // YYYY-MM-DD
     color: string;     // hex
   }
   ```
2. Создай `src/features/vacation/model/repository.ts`:
   - Экспортируй интерфейс `VacationRepository` с методами:
     - `getAll(): Promise<VacationPeriod[]>` — все периоды, отсортированные по `start_date DESC`.
     - `create(startDate: string, endDate: string, color?: string): Promise<VacationPeriod>` — вставляет запись, возвращает созданную.
     - `update(id: number, startDate: string, endDate: string, color: string): Promise<void>`.
     - `remove(id: number): Promise<void>`.
   - Экспортируй фабрику `createVacationRepository(db: DB): VacationRepository` (паттерн как в `src/entities/calendar/model/repository.ts`).
   - Все запросы через `db.execute()` с параметризованными `?`.
3. Создай `src/features/vacation/model/index.ts` — barrel export.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Архитектура: feature-sliced. Репозитории — фабричные функции, DI через замыкания.
- БД: SQLite через `@op-engineering/op-sqlite`. Запросы — `db.execute()` / `db.executeBatch()`.
- Тесты: Jest + `better-sqlite3` in-memory (`:memory:`). После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.
- НЕ меняй `DayType`, НЕ трогай таблицу `calendar_days`.

---

## Шаг 4. Написать тесты для VacationRepository

**Статус:** выполнено ✅

**Промт:**

Напиши unit-тесты для `VacationRepository`.

**Что сделать:**
1. Открой `__tests__/vacationRepository.test.ts` (создан на шаге 2).
2. Добавь `describe('VacationRepository', ...)` с тестами:
   - `create()` — создаёт период, возвращает объект с `id`, `startDate`, `endDate`, `color`.
   - `getAll()` — возвращает все периоды, отсортированные по `start_date DESC`.
   - `update()` — обновляет даты и цвет по `id`.
   - `remove()` — удаляет период по `id`.
   - `create()` с дефолтным цветом — если `color` не передан, используется `#2DD4BF`.
   - Пустая БД — `getAll()` возвращает `[]`.
3. Используй `createVacationRepository(db)` с in-memory SQLite.
4. Запусти `npx jest __tests__/vacationRepository.test.ts` — все тесты должны пройти.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Архитектура: feature-sliced. Репозитории — фабричные функции, DI через замыкания.
- БД: SQLite через `@op-engineering/op-sqlite`. Запросы — `db.execute()` / `db.executeBatch()`.
- Тесты: Jest + `better-sqlite3` in-memory (`:memory:`). После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.
- НЕ меняй `DayType`, НЕ трогай таблицу `calendar_days`.

---

## Шаг 5. Добавить i18n-ключи для экрана отпуска (все 5 языков)

**Статус:** выполнено ✅

**Промт:**

Добавь все i18n-ключи для фичи «Отпуск» во все 5 файлов локализации.

**Что сделать:**
1. В `src/shared/lib/i18n/messages/en.ts` добавь ключи (перед закрывающей `} as const`):
   ```typescript
   'vacation.title': 'Vacation',
   'vacation.addTitle': 'New vacation',
   'vacation.editTitle': 'Edit vacation',
   'vacation.startDate': 'Start date',
   'vacation.endDate': 'End date',
   'vacation.color': 'Color',
   'vacation.save': 'Save',
   'vacation.delete': 'Delete',
   'vacation.deleteConfirm': 'Delete this vacation?',
   'vacation.empty': 'No vacations yet. Tap + to add one.',
   'vacation.calendar': 'Calendar',
   'vacation.list': 'List',
   'vacation.workDays': 'Work days',
   'vacation.totalDays': 'Total days',
   'vacation.preHolidayWarning': 'Pre-holiday: workday shortened to 7h',
   'vacation.balance.title': 'Vacation balance',
   'vacation.balance.remaining': 'remaining',
   'vacation.balance.defaultTotal': '28',
   'vacation.legend.title': 'Legend',
   'vacation.legend.workday': 'Workday',
   'vacation.legend.weekend': 'Weekend',
   'vacation.legend.holiday': 'Holiday',
   'vacation.legend.shortened': 'Shortened',
   'vacation.legend.vacation': 'Vacation',
   ```
2. В `ru.ts`, `tr.ts`, `id.ts`, `ja.ts` добавь те же ключи с переводами.
3. Убедись, что TypeScript компилируется без ошибок (ключи в `en.ts` и тип `TranslationKey` обновляются автоматически).

**Переводы:**
- **ru**: Отпуск, Новый отпуск, Редактировать отпуск, Дата начала, Дата окончания, Цвет, Сохранить, Удалить, Удалить этот отпуск?, Отпусков пока нет. Нажмите + чтобы добавить., Календарь, Список, Рабочих дней, Всего дней, Предпраздничный: сокращён до 7ч, Баланс отпуска, осталось, Легенда, Рабочий день, Выходной, Праздник, Сокращённый, Отпуск
- **tr**: Tatil, Yeni tatil, Tatili düzenle, Başlangıç tarihi, Bitiş tarihi, Renk, Kaydet, Sil, Bu tatil silinsin mi?, Henüz tatil yok. Eklemek için + düğmesine dokunun., Takvim, Liste, İş günü, Toplam gün, Tatil öncesi: 7 saate kısaltıldı, Tatil bakiyesi, kalan, 28, Gösterge, İş günü, Hafta sonu, Resmi tatil, Kısa gün, Tatil
- **id**: Liburan, Liburan baru, Edit liburan, Tanggal mulai, Tanggal akhir, Warna, Simpan, Hapus, Hapus liburan ini?, Belum ada liburan. Ketuk + untuk menambah., Kalender, Daftar, Hari kerja, Total hari, Sebelum libur: hari kerja dipotong 7 jam, Saldo liburan, sisa, Legenda, Hari kerja, Akhir pekan, Hari libur, Hari pendek, Liburan
- **ja**: 休暇, 新しい休暇, 休暇を編集, 開始日, 終了日, 色, 保存, 削除, この休暇を削除しますか？, 休暇はまだありません。+をタップして追加してください。, カレンダー, リスト, 勤務日数, 合計日数, 祝日前: 勤務時間7時間に短縮, 休暇残日数, 残り, 凡例, 平日, 週末, 祝日, 短縮勤務日, 休暇

**Общие правила:**
- Язык кода: TypeScript, React Native.
- i18n: ключи в `en.ts` (тип `TranslationKey`), переводы в `ru.ts`, `tr.ts`, `id.ts`, `ja.ts`. Интерполяция — `{{var}}`.
- Тесты: Jest + `better-sqlite3` in-memory (`:memory:`). После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 6. Написать тест на консистентность i18n-ключей отпуска

**Статус:** выполнено ✅

**Промт:**

Напиши тест, проверяющий что все vacation-ключи из `en.ts` присутствуют в `ru.ts`, `tr.ts`, `id.ts`, `ja.ts`.

**Что сделать:**
1. Открой `__tests__/localization.test.ts` (или создай `__tests__/vacationLocalization.test.ts`).
2. Напиши тест: для каждого ключа в `enTranslations`, начинающегося с `'vacation.'`, проверь что он есть в `ruTranslations`, `trTranslations`, `idTranslations`, `jaTranslations`.
3. Запусти `npx jest __tests__/vacationLocalization.test.ts` — тест должен пройти.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- i18n: ключи в `en.ts` (тип `TranslationKey`), переводы в `ru.ts`, `tr.ts`, `id.ts`, `ja.ts`.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 7. Добавить цвета отпуска в `CalendarPalette` и `getDayTypeColors`

**Статус:** выполнено ✅

**Промт:**

Добавь цвета отпуска (бирюзовый) в палитру календаря.

**Что сделать:**
1. В `src/entities/calendar/lib/presentation.ts`:
   - В `CalendarPalette` добавь поля: `vacationFill: string`, `vacationBorder: string`.
   - В `getCalendarPalette(true)` (dark): `vacationFill: '#134E4A'`, `vacationBorder: '#2DD4BF'`.
   - В `getCalendarPalette(false)` (light): `vacationFill: '#CCFBF1'`, `vacationBorder: '#14B8A6'`.
2. НЕ трогай `getDayTypeColors` — отпуск не является `DayType`, это оверлей.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- UI: `StyleSheet.create()`, никаких сторонних UI-библиотек.
- Цветовая палитра — `CalendarPalette` в `src/entities/calendar/lib/presentation.ts`.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.
- НЕ меняй `DayType`, НЕ трогай `getDayTypeColors`.

---

## Шаг 8. Написать тест для палитры отпуска

**Статус:** выполнено ✅

**Промт:**

Напиши тест, что палитра отпуска корректна в обеих темах.

**Что сделать:**
1. Создай `__tests__/vacationPalette.test.ts`.
2. Тест: `getCalendarPalette(true)` содержит `vacationFill` и `vacationBorder` — непустые строки.
3. Тест: `getCalendarPalette(false)` содержит `vacationFill` и `vacationBorder` — непустые строки.
4. Запусти `npx jest __tests__/vacationPalette.test.ts` — тест должен пройти.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 9. Создать утилиту `getVacationDaysInRange`

**Статус:** не выполнено

**Промт:**

Создай чистую функцию для подсчёта рабочих дней отпуска в диапазоне.

**Что сделать:**
1. Создай `src/features/vacation/lib/vacation-utils.ts`.
2. Экспортируй функцию:
   ```typescript
   export function getVacationDaysInRange(
     startDate: string, // YYYY-MM-DD
     endDate: string,   // YYYY-MM-DD
     calendarDays: CalendarDay[],
   ): { totalDays: number; workDays: number; preHolidayDates: string[] }
   ```
   Логика:
   - `totalDays` — количество дней в диапазоне (включительно).
   - `workDays` — только дни с `type === 'workday'` (НЕ weekend, НЕ holiday, НЕ shortened).
   - `preHolidayDates` — массив ISO-дат дней перед праздником (`type === 'holiday'`) в этом диапазоне (т.е. день, у которого следующий день — праздник).
   - Если `endDate < startDate`, вернуть `{ totalDays: 0, workDays: 0, preHolidayDates: [] }`.
3. Создай `src/features/vacation/lib/index.ts` — barrel export.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Типы дней: `DayType = 'workday' | 'weekend' | 'holiday' | 'shortened'`. Отпуск — НЕ новый тип дня.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 10. Написать тесты для `getVacationDaysInRange`

**Статус:** не выполнено

**Промт:**

Напиши unit-тесты для `getVacationDaysInRange`.

**Что сделать:**
1. Создай `__tests__/vacationUtils.test.ts`.
2. Создай мок-данные `CalendarDay[]` для января 2026 (пн-пт = workday, сб-вс = weekend, 1 и 7 января = holiday, 8 января = shortened).
3. Тесты:
   - Диапазон 5 рабочих дней → `workDays: 5`.
   - Диапазон включает выходные → `workDays` не считает выходные.
   - Диапазон включает праздники → `workDays` не считает праздники.
   - Диапазон включает сокращённые → `workDays` не считает сокращённые.
   - `endDate < startDate` → `{ totalDays: 0, workDays: 0, preHolidayDates: [] }`.
   - День перед праздником попадает в `preHolidayDates`.
   - День перед выходным НЕ попадает в `preHolidayDates`.
4. Запусти `npx jest __tests__/vacationUtils.test.ts` — все тесты должны пройти.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Типы дней: `DayType = 'workday' | 'weekend' | 'holiday' | 'shortened'`.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 11. Создать компонент `VacationPeriodCard`

**Статус:** не выполнено

**Промт:**

Создай карточку одного периода отпуска для списка.

**Что сделать:**
1. Создай `src/pages/vacation/ui/VacationPeriodCard.tsx`.
2. Пропсы:
   ```typescript
   type VacationPeriodCardProps = {
     period: VacationPeriod;
     workDays: number;
     totalDays: number;
     onPress: (period: VacationPeriod) => void;
     language: AppLanguage;
   };
   ```
3. Визуал:
   - Карточка с `borderLeftWidth: 4`, `borderLeftColor: period.color`.
   - Сверху: даты `DD.MM.YYYY — DD.MM.YYYY` (форматировано для текущего языка).
   - Снизу: `${workDays} раб. / ${totalDays} всего`.
   - `Pressable` с `onPress`.
4. Стили через `StyleSheet.create()`.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- UI: `StyleSheet.create()`, никаких сторонних UI-библиотек.
- i18n: используй `TranslationKey` из `en.ts`.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 12. Написать тест для `VacationPeriodCard`

**Статус:** не выполнено

**Промт:**

Напиши snapshot-тест для `VacationPeriodCard`.

**Что сделать:**
1. Создай `__tests__/VacationPeriodCard.test.tsx`.
2. Используй `react-test-renderer` (как в существующих тестах).
3. Тест: рендер с дефолтными пропсами — snapshot не должен отличаться от сохранённого.
4. Тест: рендер с `language: 'ru'` — даты отображаются.
5. Запусти `npx jest __tests__/VacationPeriodCard.test.tsx -u` — тест должен пройти.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Тесты: Jest + `react-test-renderer`. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 13. Создать экран `VacationScreen` (каркас)

**Статус:** не выполнено

**Промт:**

Создай каркас экрана отпуска с двумя вкладками: «Календарь» и «Список».

**Что сделать:**
1. Создай `src/pages/vacation/ui/VacationScreen.tsx`.
2. Пропсы:
   ```typescript
   type VacationScreenProps = {
     year: number;
     calendarDays: CalendarDay[];
     vacationPeriods: VacationPeriod[];
     palette: CalendarPalette;
     language: AppLanguage;
     onBack: () => void;
     onAdd: () => void;
     onEdit: (period: VacationPeriod) => void;
   };
   ```
3. Состояние: `activeTab: 'calendar' | 'list'` (useState).
4. Верхний бар:
   - Кнопка «Назад» (иконка стрелки).
   - Заголовок «Отпуск» (из i18n).
   - Кнопка «+» (добавить).
5. Табы: две кнопки «Календарь» / «Список» (из i18n).
6. Если `activeTab === 'calendar'` — placeholder `<Text>Calendar view (TODO)</Text>`.
7. Если `activeTab === 'list'` — `FlatList` с `VacationPeriodCard` или `<Text>No vacations yet...</Text>` если пусто.
8. Создай `src/pages/vacation/ui/index.ts` — barrel export.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- UI: `StyleSheet.create()`, никаких сторонних UI-библиотек.
- Навигация — дискриминированное union-состояние (`ReadyScreen`).
- i18n: ключи из `en.ts`.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 14. Подключить `VacationScreen` в `App.tsx` (заменить placeholder)

**Статус:** не выполнено

**Промт:**

Замени placeholder `<Text>Vacation (TODO)</Text>` в `App.tsx` на реальный `VacationScreen`.

**Что сделать:**
1. В `src/app/App.tsx`:
   - Импортируй `VacationScreen` из `src/pages/vacation/ui`.
   - Создай `VacationRepository` через `createVacationRepository(db)` (после инициализации БД).
   - Добавь состояние `vacationPeriods: VacationPeriod[]` (useState, загружается при mount через `vacationRepository.getAll()`).
   - Замени блок `if (status.screen.name === 'vacation')` на:
     ```tsx
     <VacationScreen
       year={status.calendar.year}
       calendarDays={status.calendar.days}
       vacationPeriods={vacationPeriods}
       palette={palette}
       language={language}
       onBack={closeVacation}
       onAdd={...}
       onEdit={...}
     />
     ```
   - `onAdd` — показывает модалку/форму создания (пока placeholder).
   - `onEdit` — показывает модалку/форму редактирования (пока placeholder).

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Архитектура: feature-sliced. Репозитории — фабричные функции.
- Навигация — дискриминированное union-состояние (`ReadyScreen`).
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 15. Создать форму добавления/редактирования отпуска (`VacationForm`)

**Статус:** не выполнено

**Промт:**

Создай форму для создания и редактирования периода отпуска.

**Что сделать:**
1. Создай `src/pages/vacation/ui/VacationForm.tsx`.
2. Пропсы:
   ```typescript
   type VacationFormProps = {
     initialPeriod?: VacationPeriod; // undefined = создание, задано = редактирование
     calendarDays: CalendarDay[];
     palette: CalendarPalette;
     language: AppLanguage;
     onSave: (startDate: string, endDate: string, color: string) => void;
     onDelete?: () => void; // только для редактирования
     onCancel: () => void;
   };
   ```
3. Состояние:
   - `startDate: string` (ISO).
   - `endDate: string` (ISO).
   - `color: string` (hex, дефолт `#2DD4BF`).
4. UI:
   - Заголовок: «Новый отпуск» или «Редактировать отпуск».
   - Два поля даты (простой TextInput в формате `DD.MM.YYYY` или `YYYY-MM-DD`).
   - Выбор цвета: 5-6 пресетов (бирюзовый, синий, фиолетовый, оранжевый, розовый, зелёный) — круги с обводкой выбранного.
   - Превью: количество рабочих дней и общее количество дней (используй `getVacationDaysInRange`).
   - Кнопки: «Сохранить» и «Отмена».
   - Если редактирование: кнопка «Удалить» с подтверждением.
5. Валидация: `endDate >= startDate`, оба поля заполнены.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- UI: `StyleSheet.create()`, никаких сторонних UI-библиотек.
- i18n: ключи из `en.ts`.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 16. Написать тест для `VacationForm`

**Статус:** не выполнено

**Промт:**

Напиши тест для `VacationForm`.

**Что сделать:**
1. Создай `__tests__/VacationForm.test.tsx`.
2. Тесты:
   - Рендер в режиме создания — заголовок «Новый отпуск».
   - Рендер в режиме редактирования — заголовок «Редактировать отпуск».
   - Кнопка «Удалить» видна только в режиме редактирования.
   - Snapshot для обоих режимов.
3. Запусти `npx jest __tests__/VacationForm.test.tsx -u` — тест должен пройти.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Тесты: Jest + `react-test-renderer`. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 17. Реализовать CRUD-логику отпуска в `App.tsx` (создание, редактирование, удаление)

**Статус:** не выполнено

**Промт:**

Подключи реальные CRUD-операции для отпуска в `App.tsx`.

**Что сделать:**
1. В `src/app/App.tsx`:
   - Добавь состояние `editingPeriod: VacationPeriod | null` (null = форма создания, не-null = форма редактирования).
   - Добавь состояние `showVacationForm: boolean`.
   - `onAdd` → `setEditingPeriod(null); setShowVacationForm(true)`.
   - `onEdit(period)` → `setEditingPeriod(period); setShowVacationForm(true)`.
   - `onSave(startDate, endDate, color)`:
     - Если `editingPeriod === null`: вызови `vacationRepository.create(startDate, endDate, color)`.
     - Если `editingPeriod !== null`: вызови `vacationRepository.update(editingPeriod.id, startDate, endDate, color)`.
     - Обнови `vacationPeriods` через `vacationRepository.getAll()`.
     - Закрой форму.
   - `onDelete()`:
     - Если `editingPeriod !== null`: вызови `vacationRepository.remove(editingPeriod.id)`.
     - Обнови `vacationPeriods`.
     - Закрой форму.
   - Рендер: если `showVacationForm`, поверх `VacationScreen` показывай `VacationForm` (модалка или overlay).

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Архитектура: feature-sliced. Репозитории — фабричные функции.
- Навигация — дискриминированное union-состояние (`ReadyScreen`).
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 18. Добавить баланс отпуска на экран

**Статус:** не выполнено

**Промт:**

Добавь блок «Баланс отпуска» на экран отпуска.

**Что сделать:**
1. Создай `src/pages/vacation/ui/VacationBalance.tsx`.
2. Пропсы:
   ```typescript
   type VacationBalanceProps = {
     usedWorkDays: number;
     totalAllowed: number; // дефолт 28
     palette: CalendarPalette;
     language: AppLanguage;
   };
   ```
3. UI:
   - Заголовок: «Баланс отпуска» (из i18n).
   - Прогресс-бар: `usedWorkDays / totalAllowed` — заполненная часть цветом `vacationBorder`.
   - Текст: `${totalAllowed - usedWorkDays} осталось` (из i18n).
4. В `VacationScreen`:
   - Посчитай `usedWorkDays` как сумму `workDays` всех периодов отпуска.
   - Рендер `VacationBalance` над списком/календарём.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- UI: `StyleSheet.create()`, никаких сторонних UI-библиотек.
- i18n: ключи из `en.ts`.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 19. Создать `VacationYearCalendar` (мини-календарь на год с оверлеем отпуска)

**Статус:** не выполнено

**Промт:**

Создай компонент мини-календаря на год, показывающий дни отпуска цветным оверлеем.

**Что сделать:**
1. Создай `src/pages/vacation/ui/VacationYearCalendar.tsx`.
2. Пропсы:
   ```typescript
   type VacationYearCalendarProps = {
     year: number;
     calendarDays: CalendarDay[];
     vacationPeriods: VacationPeriod[];
     palette: CalendarPalette;
     language: AppLanguage;
     onDayPress?: (date: string) => void;
   };
   ```
3. UI:
   - 12 месяцев в 4 колонки (3 строки). Каждый месяц — мини-сетка дней (7 колонок: пн-вс).
   - Каждая ячейка дня:
     - Если день входит в какой-то `vacationPeriod` И его `type === 'workday'` → цвет фона = `period.color` (с прозрачностью 30%).
     - Если `type === 'holiday'` → красный (по палитре).
     - Если `type === 'weekend'` → синий (по палитре).
     - Если `type === 'shortened'` → жёлтый (по палитре).
     - Иначе → дефолтный фон.
   - Номер дня в ячейке (шрифт 10-11).
   - Над каждым месяцем — название месяца (сокращённое).
4. Для попадания дня в период: проверяй `date >= period.startDate && date <= period.endDate`.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- UI: `StyleSheet.create()`, никаких сторонних UI-библиотек.
- Приоритет отображения: праздник > сокращённый > выходной > рабочий. Отпуск — оверлей только для рабочих дней.
- i18n: используй `getMonthShortLabel` из `src/shared/lib/i18n`.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 20. Написать тест для `VacationYearCalendar`

**Статус:** не выполнено

**Промт:**

Напиши snapshot-тест для `VacationYearCalendar`.

**Что сделать:**
1. Создай `__tests__/VacationYearCalendar.test.tsx`.
2. Тест: рендер с одним vacation period (1-15 июня) — snapshot.
3. Тест: рендер без vacation periods — snapshot.
4. Запусти `npx jest __tests__/VacationYearCalendar.test.tsx -u` — тест должен пройти.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Тесты: Jest + `react-test-renderer`. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 21. Подключить `VacationYearCalendar` в `VacationScreen`

**Статус:** не выполнено

**Промт:**

Замени placeholder календаря в `VacationScreen` на реальный `VacationYearCalendar`.

**Что сделать:**
1. В `src/pages/vacation/ui/VacationScreen.tsx`:
   - Импортируй `VacationYearCalendar`.
   - Замени `<Text>Calendar view (TODO)</Text>` на:
     ```tsx
     <VacationYearCalendar
       year={year}
       calendarDays={calendarDays}
       vacationPeriods={vacationPeriods}
       palette={palette}
       language={language}
     />
     ```
2. Оберни в `ScrollView` если нужно.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- UI: `StyleSheet.create()`, никаких сторонних UI-библиотек.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 22. Добавить предупреждение о предпраздничном дне в `VacationForm`

**Статус:** не выполнено

**Промт:**

Добавь предупреждение в форму отпуска, если выбранный диапазон содержит предпраздничные дни.

**Что сделать:**
1. В `src/pages/vacation/ui/VacationForm.tsx`:
   - При изменении `startDate` или `endDate` вызывай `getVacationDaysInRange(startDate, endDate, calendarDays)`.
   - Если `preHolidayDates.length > 0` — покажи блок-предупреждение:
     - Иконка ⚠️ (можно emoji или SVG).
     - Текст: «Предпраздничный: рабочий день сокращён до 7ч» (из i18n `vacation.preHolidayWarning`).
     - Количество таких дней.
2. Предупреждениеинформационное, не блокирует сохранение.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- UI: `StyleSheet.create()`, никаких сторонних UI-библиотек.
- i18n: ключи из `en.ts`.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 23. Добавить отображение отпуска в месячной сетке (`MonthDetailScreen`)

**Статус:** не выполнено

**Промт:**

Добавь визуальный оверлей отпуска в `MonthDetailScreen` — цветную полоску на ячейках дней.

**Что сделать:**
1. В `src/pages/month/ui/MonthDayCell.tsx` (или компоненте, рендерящем день в месячной сетке):
   - Добавь проп `vacationColor?: string`.
   - Если `vacationColor` задан и `day.type === 'workday'` — добавь тонкую горизонтальную полоску (2-3px) внизу ячейки, цветом `vacationColor`.
   - Полоска не должна перекрывать существующие стили ячейки.
2. В `src/pages/month/ui/MonthDetailScreen.tsx`:
   - Добавь проп `vacationPeriods: VacationPeriod[]`.
   - Для каждого дня определи, входит ли он в какой-то период отпуска.
   - Передай `vacationColor` в `MonthDayCell`.
3. В `src/app/App.tsx`:
   - Передай `vacationPeriods` в `MonthDetailScreen`.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- UI: `StyleSheet.create()`, никаких сторонних UI-библиотек.
- Приоритет отображения: праздник > сокращённый > выходной > рабочий. Отпуск — оверлей только для рабочих дней.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 24. Написать тест для оверлея отпуска в месячной сетке

**Статус:** не выполнено

**Промт:**

Напиши тест, что `MonthDayCell` корректно отображает vacation overlay.

**Что сделать:**
1. Создай `__tests__/MonthDayVacationOverlay.test.tsx`.
2. Тесты:
   - Рендер `MonthDayCell` с `vacationColor="#2DD4BF"` — snapshot содержит полоску.
   - Рендер без `vacationColor` — snapshot без полоски.
   - Рендер с `vacationColor` но `type === 'holiday'` — полоска НЕ показывается.
3. Запусти `npx jest __tests__/MonthDayVacationOverlay.test.tsx -u` — тест должен пройти.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Тесты: Jest + `react-test-renderer`. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 25. Добавить отображение отпуска в годовой сетке (`YearHomeScreen`)

**Статус:** не выполнено

**Промт:**

Добавь индикатор отпуска в месячные карточки годового обзора.

**Что сделать:**
1. В `src/pages/year/ui/MonthCard.tsx` (или компоненте месяца в годовом обзоре):
   - Добавь проп `vacationDaysCount: number` — количество дней отпуска в этом месяце.
   - Если `vacationDaysCount > 0` — покажи маленький бирюзовый бейдж/чип в углу карточки с числом.
2. В `src/pages/year/ui/YearHomeScreen.tsx`:
   - Добавь проп `vacationPeriods: VacationPeriod[]`.
   - Для каждого месяца посчитай, сколько дней отпуска в нём попадают на `type === 'workday'`.
   - Передай `vacationDaysCount` в `MonthCard`.
3. В `src/app/App.tsx`:
   - Передай `vacationPeriods` в `YearHomeScreen`.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- UI: `StyleSheet.create()`, никаких сторонних UI-библиотек.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 26. Обновить виджет для показа статуса отпуска

**Статус:** не выполнено

**Промт:**

Обнови виджет приложения, чтобы он показывал статус отпуска для текущего дня.

**Что сделать:**
1. В `src/widgets/widgetData.ts`:
   - Добавь запрос к таблице `vacation_periods`: проверь, входит ли сегодняшняя дата в какой-то период.
   - Верни `isOnVacation: boolean` и `vacationColor: string | null`.
2. В `src/widgets/CalendarWidgetLayout.tsx`:
   - Если `isOnVacation === true` — добавь строку «🏖 Vacation» (или иконку) под основной информацией о дне.
   - Цвет текста/фона = `vacationColor`.
3. Обнови `updateCalendarWidget()` если нужно.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Виджет: React Native виджет через `react-native-android-widget`.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 27. Написать тест для данных виджета с отпуском

**Статус:** не выполнено

**Промт:**

Напиши тест для `widgetData` — проверка что `isOnVacation` определяется корректно.

**Что сделать:**
1. Создай `__tests__/widgetVacationData.test.ts`.
2. Тесты:
   - Сегодняшний день входит в vacation period → `isOnVacation: true`.
   - Сегодняшний день НЕ входит ни в один период → `isOnVacation: false`.
   - Сегодняшний день — граница периода (startDate или endDate) → `isOnVacation: true`.
3. Используй in-memory SQLite с мок-данными.
4. Запусти `npx jest __tests__/widgetVacationData.test.ts` — тест должен пройти.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Тесты: Jest + `better-sqlite3` in-memory (`:memory:`). После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 28. Добавить легенду цветов на экран отпуска

**Статус:** не выполнено

**Промт:**

Добавь блок «Легенда» на экран отпуска с пояснением цветов.

**Что сделать:**
1. Создай `src/pages/vacation/ui/VacationLegend.tsx`.
2. UI:
   - Заголовок: «Легенда» (из i18n `vacation.legend.title`).
   - Список цветных квадратиков с подписями:
     - Рабочий день (серый)
     - Выходной (синий)
     - Праздник (красный)
     - Сокращённый (жёлтый)
     - Отпуск (бирюзовый)
   - Квадратики 16x16 с закруглением 4px.
3. В `VacationScreen`:
   - Рендер `VacationLegend` под календарём/списком.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- UI: `StyleSheet.create()`, никаких сторонних UI-библиотек.
- i18n: ключи из `en.ts`.
- Тесты: Jest. После шага запусти `npx jest --passWithNoTests` и убедись, что все тесты зелёные.

---

## Шаг 29. Запустить все тесты и исправить проблемы

**Статус:** не выполнено

**Промт:**

Запусти полный набор тестов проекта и исправь все падения.

**Что сделать:**
1. Запусти `npx jest --verbose`.
2. Если какие-то тесты падают — исправь их.
3. Особое внимание:
   - Тесты, использующие `DayType` — не должны сломаться (отпуск не меняет `DayType`).
   - Тесты `calendarRepository.test.ts` — миграция v3→v4 не должна ломать существующие тесты.
   - Snapshot-тесты — обнови если нужно (`npx jest -u`).
4. Убедись, что все тесты зелёные.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Тесты: Jest + `better-sqlite3` in-memory (`:memory:`).
- НЕ меняй `DayType`, НЕ трогай существующую логику календаря.

---

## Шаг 30. Финальная проверка интеграции

**Статус:** не выполнено

**Промт:**

Проведи финальную проверку всей фичи «Отпуск» — от БД до UI.

**Что сделать:**
1. Проверь файловую структуру:
   - `src/features/vacation/model/` — types, repository, index.
   - `src/features/vacation/lib/` — vacation-utils, index.
   - `src/pages/vacation/ui/` — VacationScreen, VacationForm, VacationPeriodCard, VacationYearCalendar, VacationBalance, VacationLegend, index.
   - `__tests__/vacation*.test.ts(x)` — все тест-файлы.
2. Проверь что все barrel exports работают.
3. Проверь что `VacationRepository` подключён в `App.tsx`.
4. Проверь что vacationPeriods передаётся во все экраны (YearHomeScreen, MonthDetailScreen, VacationScreen).
5. Проверь что i18n-ключи есть во всех 5 языках.
6. Запусти `npx jest --verbose` — все зелёные.
7. Если что-то не так — исправь.

**Общие правила:**
- Язык кода: TypeScript, React Native.
- Архитектура: feature-sliced.
- Тесты: Jest. Все должны быть зелёные.
- НЕ меняй `DayType`.
