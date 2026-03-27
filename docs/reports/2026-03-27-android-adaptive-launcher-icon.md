# Adaptive launcher icon (Android)

## Что изменено

- Добавлен **adaptive icon** (API 26+): `mipmap-anydpi-v26/ic_launcher.xml` и `ic_launcher_round.xml` с фоном `@color/ic_launcher_background` и векторным `@drawable/ic_launcher_foreground`.
- Векторный foreground повторяет пропорции компонента `AppLogo` (карточка, полоска месяца, сетка, коралловый акцент, шестерёнка). Цвет шестерёнки на иконке — `#2A3D35`, чтобы читалась на светло-голубом фоне слоя (в приложении шестерёнка остаётся белой на другом контексте).
- Цвет фона слоя `#D4E2E8` — в одной линии с «плашкой» логотипа в UI; при необходимости правится в `android/app/src/main/res/values/colors.xml`.
- На устройствах **ниже API 26** по-прежнему используются существующие PNG в `mipmap-*dpi`.

## Что проверено

- Сборка `gradlew assembleDebug` проходит успешно.

## Дальнейшие шаги

- При желании единообразия на старых API — перерисовать `ic_launcher.png` / `ic_launcher_round.png` под тот же образ (экспорт из Figma/скрипта или вручную по плотностям).
- Опционально: слой `monochrome` для themed icons на Android 13+.
