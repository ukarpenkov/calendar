# Удалена сущность баланса отпуска

**Date:** 2026-06-16
**Session:** Vacation balance removal

## What was done
- Удалён компонент `VacationBalance` с прогресс-баром и расчётом оставшихся дней
- Убран расчёт `usedWorkDays` из `VacationScreen`
- Удалены i18n ключи `vacation.balance.*` из всех 5 языков (ru, en, tr, ja, id)
- Отпуск теперь без ограничений по количеству дней

## Files changed
- `src/pages/vacation/ui/VacationBalance.tsx` — удалён
- `src/pages/vacation/ui/VacationScreen.tsx` — убран импорт, вызов, расчёт, стиль
- `src/pages/vacation/ui/index.ts` — убран экспорт
- `src/shared/lib/i18n/messages/ru.ts` — удалены ключи баланса
- `src/shared/lib/i18n/messages/en.ts` — удалены ключи баланса
- `src/shared/lib/i18n/messages/tr.ts` — удалены ключи баланса
- `src/shared/lib/i18n/messages/ja.ts` — удалены ключи баланса
- `src/shared/lib/i18n/messages/id.ts` — удалены ключи баланса

## Notes
- `getVacationDaysInRange` оставлен — используется для отображения дней в `VacationPeriodCard`
- TypeScript check пройден без ошибок
