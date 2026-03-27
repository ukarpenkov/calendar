# Имя выходного APK (prod-calendar)

## Что изменено

В `android/app/build.gradle` добавлена настройка `applicationVariants`: имя собранного APK теперь `prod-calendar-<buildType>.apk` (например, `prod-calendar-release.apk`, `prod-calendar-debug.apk`).

## Что проверено

Логику Gradle не запускали в этой сессии; после `assembleRelease` ожидается файл `prod-calendar-release.apk` в каталоге вывода модуля `app`.

## Дальнейшие шаги

При необходимости добавить в имя `versionName` или код версии — расширить шаблон `outputFileName` полями `variant.versionName` / `variant.versionCode`.
