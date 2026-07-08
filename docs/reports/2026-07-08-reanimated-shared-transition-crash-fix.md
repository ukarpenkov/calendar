# Исправление падения release APK после Reanimated

## Что изменено

- Найден нативный крэш release APK: `SIGSEGV` в `libreanimated.so` на потоке `mqt_v_js` при Fabric mounting transaction.
- Убрано использование экспериментальных `sharedTransitionTag` / `sharedTransitionStyle` на годовом и месячном экранах.
- Reanimated `FadeIn` / `FadeOut` на месячном overlay заменены на обычные `View`, чтобы не инициализировать проблемный путь Reanimated при старте.
- Из `package.json` удалён static feature flag `ENABLE_SHARED_ELEMENT_TRANSITIONS`, который включал экспериментальные shared element transitions.

## Что проверено

- `npm run lint` завершился без ошибок; остались только существующие предупреждения по inline styles и nested component.
- До правки падение воспроизводилось через `adb logcat -b crash`: `Fatal signal 11 (SIGSEGV)` в `libreanimated.so`.
- Обычная `assembleRelease` до clean проходила успешно, но clean-сборка упёрлась в отдельную Prefab/CMake проблему чтения prefab-каталога `@op-engineering/op-sqlite`.

## Дальнейшие шаги

- Пересобрать release APK локально и установить на телефон.
- Если после clean снова появится ошибка Prefab для `op-sqlite`, сначала собрать `:op-engineering_op-sqlite:assembleRelease`, затем повторить `assembleRelease`.
- После установки проверить запуск приложения и открытие месячного экрана.
