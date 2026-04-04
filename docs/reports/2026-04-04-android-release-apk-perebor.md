# Пересборка release APK

## Что изменено

Ничего в коде не менялось — выполнена только сборка.

## Что проверено

- Команда `gradlew clean :app:assembleRelease` завершилась ошибкой: после `clean` каталог prefab `@op-engineering/op-sqlite` (`…/prefab_package/release/prefab`) ещё отсутствовал, задача `:app:configureCMakeRelWithDebInfo[arm64-v8a]` падала.
- Успешная сборка: из `android/` выполнено  
  `.\gradlew :op-engineering_op-sqlite:assembleRelease :app:assembleRelease` — **BUILD SUCCESSFUL** (~11 мин).
- Сформирован файл: `android/app/build/outputs/apk/release/prod-calendar-release.apk` (дата изменения соответствует свежей сборке).

## Дальнейшие шаги

- Для «чистой» пересборки можно: сначала `.\gradlew clean`, затем снова двухшаговая команда выше (или один раз `assembleRelease` без `clean`, если prefab уже есть).
- При необходимости обновлять `versionCode` / `versionName` в `android/app/build.gradle` перед выкладкой.
