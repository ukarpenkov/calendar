# Синхронизация иконок лаунчера и логотипа в приложении

## Что изменено

- Запущен `scripts/generate-launcher-pngs.ps1`: из каталога `icons/` скопированы `ic_launcher.png` и `ic_launcher_round.png` во все плотности `mipmap-*` в `android/app/src/main/res` (квадратная и круглая иконки для разных лаунчеров Android).
- Из `icons/play_store_512.png` пересобраны `drawable-*/ic_launcher_full.png` для адаптивной иконки (foreground) и системного splash (API 31+).
- Обновлён `assets/launcher-icon-source.png` — тот же источник, что использует `AppLogo` на экране загрузки и на главном экране года.

Код React Native менять не потребовалось: `AppLogo` уже тянет `launcher-icon-source.png`, синхронизируемый скриптом.

## Что проверено

- Скрипт завершился с кодом 0, без ошибок о недостающих файлах в `icons/`.
- В `AndroidManifest.xml` по-прежнему заданы `android:icon` и `android:roundIcon` на соответствующие mipmap-ресурсы.

## Дальнейшие шаги

- При смене дизайна иконки достаточно обновить PNG в `icons/` (все `mipmap-*` + `play_store_512.png`) и снова запустить скрипт.
- При сильном сдвиге фона уточнить `ic_launcher_background` в `android/app/src/main/res/values/colors.xml`, чтобы адаптивная иконка и сплэш визуально совпадали с макетом.
