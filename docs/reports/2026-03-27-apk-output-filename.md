# Имя выходного APK (prod-calendar)

## Что изменено

В `android/app/build.gradle` добавлена настройка `applicationVariants`: имя собранного APK теперь `prod-calendar-<buildType>.apk` (например, `prod-calendar-release.apk`, `prod-calendar-debug.apk`).

## Что проверено

`gradlew :app:assembleRelease` — успешно; в `android/app/build/outputs/apk/release/` появляется `prod-calendar-release.apk`.

## Дальнейшие шаги

При необходимости добавить в имя `versionName` или код версии — расширить шаблон `outputFileName` полями `variant.versionName` / `variant.versionCode`.
