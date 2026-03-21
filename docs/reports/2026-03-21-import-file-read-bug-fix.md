# Отчет: Import File Read Bug Fix

## Что изменено

- Исправлен `bug fix` в `src/features/calendar-import/model/device-import.ts`: Android `content://` URI больше не читается напрямую через `fetch`.
- После выбора файла import flow теперь сначала создает локальную копию через `keepLocalCopy()` из `@react-native-documents/picker`, а затем читает уже доступный `file://` путь из sandbox приложения.
- Добавлена нормализация локального URI, чтобы чтение было стабильным даже если picker возвращает путь без префикса `file://`.
- Обновлены Jest mocks и тест `__tests__/calendarDeviceImport.test.ts`, чтобы покрыть новый Android-safe путь чтения выбранного JSON.

## Что проверено

- Выполнен `npm run lint`: без ошибок.
- Выполнен `npm test -- --runInBand`: `9/9` test suites passed, `30/30` tests passed.
- Повторно проверен сценарий ошибки чтения: текущий fix закрывает отказ на выборе `calendar2025.json`, который возникал из-за прямого чтения Android `content://` URI.

## Контекст и follow-up

- Исправление продолжает stage `8` по JSON-импорту: теперь import flow лучше соответствует Android Storage Access Framework и не зависит от того, умеет ли `fetch` читать `content://` URI напрямую.
- После commit стоит повторно вручную выбрать `calendar2025.json` на эмуляторе и убедиться, что flow доходит до подтверждения замены года без карточки ошибки чтения файла.
