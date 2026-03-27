# Отчёт: иконка лаунчера из растрового изображения

## Что изменено

- В `assets/launcher-icon-source.png` добавлен исходный квадратный арт (мятный фон, календарь, шестерёнка).
- Сгенерированы плотности для адаптивной иконки: `ic_launcher_full.png` в `drawable-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}` (108–432 px по гайду foreground 108 dp).
- Обновлён `drawable/ic_launcher_foreground.xml`: вместо вектора используется `layer-list` с `bitmap` на `@drawable/ic_launcher_full`.
- Цвет `ic_launcher_background` в `values/colors.xml` сменён на `#8CC9BA`, чтобы совпадать с фоном на картинке и уменьшить ореол при масках лаунчера.
- Перегенерированы legacy `mipmap-*/ic_launcher.png` и `ic_launcher_round.png` (48–192 px) из того же источника.
- Скрипт `scripts/generate-launcher-pngs.ps1` пересобирает все PNG из `assets/launcher-icon-source.png` (Windows, `System.Drawing`).

Монохромный слой (`ic_launcher_monochrome.xml`) оставлен векторным — для themed icon на API 33+.

## Что проверено

- Сборка `:app:assembleDebug` проходит успешно после смены ресурсов.

## Дальнейшие шаги

- При смене макета иконки заменить `assets/launcher-icon-source.png` и снова запустить `generate-launcher-pngs.ps1`; при сильном сдвиге цвета фона подправить `ic_launcher_background` в `colors.xml`.
- При желании полностью совпасть с растром в monochrome-режиме можно заменить `ic_launcher_monochrome` на упрощённый вектор или отдельный силуэт под новый арт.
