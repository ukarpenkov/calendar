# Vacation Form Improvements — 2026-06-14

## Изменения

### 1. Формат ввода дат (DD.MM вместо DD.MM.YYYY)

**Файл:** `src/pages/vacation/ui/VacationForm.tsx`

- Формат ввода изменён с `DD.MM.YYYY` на `DD.MM`
- Год автоматически берётся текущий (не вводится пользователем)
- Автоматическая вставка точки после двух цифр дня: `15` → `15.`
- Плейсхолдер обновлён на `DD.MM`
- `maxLength` уменьшен с 10 до 5

### 2. Дни отпуска тратятся на выходных

**Файлы:**
- `src/features/vacation/lib/vacation-utils.ts`
- `__tests__/vacationUtils.test.ts`

- Добавлено новое поле `vacationDays` — все дни кроме праздников (тратятся на выходных)
- `workDays` — только рабочие дни (workday + shortened) для отображения
- Выходные теперь считаются как потраченные дни отпуска
- Праздники НЕ считаются

### 3. Цвета текста в тёмной теме (VacationPeriodCard)

**Файлы:**
- `src/pages/vacation/ui/VacationPeriodCard.tsx`
- `src/pages/vacation/ui/VacationScreen.tsx`
- `__tests__/VacationPeriodCard.test.tsx`

- Добавлен проп `palette` в `VacationPeriodCard`
- Даты: `palette.title` (светлый текст)
- Строка "9 / 13": `palette.subtitle` (серый текст)
- Фон карточки: `palette.surface`
- Граница: `palette.border`

### 4. Убрана Legend со страницы списка отпусков

**Файл:** `src/pages/vacation/ui/VacationScreen.tsx`

- `VacationLegend` удалён из вкладки "List" (FlatList)
- На вкладке "Calendar" остался

### 5. Чип отпуска на годовом экране считает выходные

**Файл:** `src/pages/year/ui/YearHomeScreen.tsx`

- `vacationDaysCountByMonth` теперь считает все дни кроме праздников (а не только workday)
- Чип показывает полное количество дней отпуска, включая выходные

### 6. Полоска отпуска на ячейках дней для выходных

**Файлы:**
- `src/pages/year/ui/YearHomeScreen.tsx`
- `src/pages/month/ui/MonthDetailScreen.tsx`
- `__tests__/MonthDayVacationOverlay.test.tsx`

- Полоска отпуска (vacation bar) теперь отображается на выходных и сокращённых днях
- Раньше отображалась только на рабочих днях (`day.type === 'workday'`)
- Теперь отображается на всех днях кроме праздников (`day.type !== 'holiday'`)

### 7. Версия приложения 11.0

**Файлы:**
- `src/shared/config/appDisplayVersion.ts` — `10.0` → `11.0`
- `android/app/build.gradle` — уже `versionCode 11`, `versionName "11.0"`
- `package.json` — уже `11.0.0`

## Тесты

Все 177 тестов проходят. Обновлены:
- `__tests__/vacationUtils.test.ts` — новые кейсы для `vacationDays`
- `__tests__/VacationPeriodCard.test.tsx` — добавлен `palette` проп
- `__tests__/VacationForm.test.tsx` — обновлён формат дат в ожиданиях
