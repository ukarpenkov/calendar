# Отчет: Import Android RNFS Bug Fix

## Что изменено

- Зафиксирована реальная причина ошибки импорта на эмуляторе Android: `keepLocalCopy()` успешно создавал локальную копию выбранного `JSON`, но дальнейшее чтение через `fetch(file://...)` оставалось ненадежным и приводило к ошибке `Could not read the selected file`.
- В `src/features/calendar-import/model/device-import.ts` чтение импортируемого файла переведено с `fetch()` на нативное `readFile()` из `@dr.pogodin/react-native-fs`.
- Добавлена зависимость `@dr.pogodin/react-native-fs` как поддерживаемый файловый слой для `React Native 0.84` и Android.
- После `keepLocalCopy()` путь локальной копии нормализуется до формата, который ожидает `readFile()`, чтобы import flow стабильно читал локальный `JSON` из sandbox приложения.
- Обновлены Jest mocks и тест `__tests__/calendarDeviceImport.test.ts`, чтобы покрыть новый путь чтения через RNFS вместо `fetch`.

## Что проверено

- Выполнен `npm run lint`: без ошибок.
- Выполнен `npm test -- --runInBand`: `9/9` test suites passed, `30/30` tests passed.
- Выполнена Android-пересборка и повторная установка приложения через `npx react-native run-android --port 8083 --no-packager`: сборка завершилась успешно с новой нативной зависимостью.

## Контекст и follow-up

- Этот bug fix продолжает предыдущую правку с `keepLocalCopy()`: одной локальной копии оказалось недостаточно, потому что проблема была не только в доступе к `content://`, но и в самом способе чтения локального файла на Android.
- Следующий практический шаг после коммита — повторно вручную выбрать `calendar2025.json` в эмуляторе и убедиться, что flow доходит до предпросмотра и подтверждения замены года без карточки ошибки чтения файла.
