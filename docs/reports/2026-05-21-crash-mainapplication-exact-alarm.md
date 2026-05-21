# Падение при старте: SecurityException для setAlarmClock

## Что изменено

- **Причина:** на современном Android вызов `AlarmManager.setAlarmClock` без разрешений приводил к **`SecurityException`** уже в **`MainApplication.onCreate`** → приложение закрывалось сразу после запуска.
- В **`AndroidManifest.xml`** добавлено **`USE_EXACT_ALARM`** (ожидаемый способ для сценария «будильник / смена календарного дня для виджета»).
- В **`CalendarWidgetAlarmScheduler.scheduleNextMidnight`** добавлен **`try/catch (SecurityException)`** с запасным **`setWindow(RTC_WAKEUP, …, 60_000)`**, чтобы приложение **никогда не падало** из‑за отказа системы даже без разрешений или при нестандартной политике.

## Что проверено

- `:app:compileDebugKotlin`.

## Дальнейшие шаги

- Для **Google Play** при публикации уточнить политику для `USE_EXACT_ALARM` при необходимости.
- Переустановить приложение на эмуляторе/устройстве после смены манифеста и проверить запуск.
