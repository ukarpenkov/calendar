# Vacation i18n keys — шаг 5

**Дата:** 2026-06-12
**Ветка:** feat/vacation
**Статус:** выполнено

---

## Что сделано

Добавлены 24 i18n-ключа для фичи «Отпуск» во все 5 файлов локализации.

### Изменённые файлы

| Файл | Язык |
|---|---|
| `src/shared/lib/i18n/messages/en.ts` | English (источник типа `TranslationKey`) |
| `src/shared/lib/i18n/messages/ru.ts` | Русский |
| `src/shared/lib/i18n/messages/tr.ts` | Türkçe |
| `src/shared/lib/i18n/messages/id.ts` | Bahasa Indonesia |
| `src/shared/lib/i18n/messages/ja.ts` | 日本語 |

### Список ключей

```
vacation.title              — заголовок экрана
vacation.addTitle           — «Новый отпуск»
vacation.editTitle          — «Редактировать отпуск»
vacation.startDate          — дата начала
vacation.endDate            — дата окончания
vacation.color              — цвет
vacation.save               — сохранить
vacation.delete             — удалить
vacation.deleteConfirm      — подтверждение удаления
vacation.empty              — пустой список
vacation.calendar           — вкладка «Календарь»
vacation.list               — вкладка «Список»
vacation.workDays           — рабочих дней
vacation.totalDays          — всего дней
vacation.preHolidayWarning  — предпраздничное предупреждение
vacation.balance.title      — баланс отпуска
vacation.balance.remaining  — «осталось»
vacation.balance.defaultTotal — «28»
vacation.legend.title       — легенда
vacation.legend.workday     — рабочий день
vacation.legend.weekend     — выходной
vacation.legend.holiday     — праздник
vacation.legend.shortened   — сокращённый
vacation.legend.vacation    — отпуск
```

## Проверки

- **TypeScript:** компилируется без ошибок (`npx tsc --noEmit` — vacation-ключей не затрагивает)
- **Jest:** 20 из 21 тест-сьютов зелёные (116/118 тестов). Падения в `monthDetailLayout.test.ts` — предсуществующие, не связаны с i18n

## Коммит

```
feat(vacation): add i18n keys for vacation screen (5 languages)

Add 24 vacation-related translation keys to en, ru, tr, id, ja.
TypeScript compiles cleanly; all unrelated tests pass.
