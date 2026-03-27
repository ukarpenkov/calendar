# Отчёт: убрать голубой акцент при загрузке (белый фон)

## Что изменено

- В `android/app/src/main/res/values/colors.xml` цвет `ic_launcher_background` заменён с `#8CC9BA` на **`#FFFFFF`**. Он используется для слоя адаптивной иконки, нативного `splash_screen.xml` и системного splash на API 31+ (`windowSplashScreenBackground`, `windowSplashScreenIconBackgroundColor`).
- В `src/pages/splash/ui/SplashScreen.tsx` для **светлой** темы фон splash принудительно **`#FFFFFF`** (вместо `palette.background` `#F5F7FA`), чтобы совпадать с белой нативной плашкой. Индикатор загрузки больше не использует `palette.selectedBorder` (синий `#2563EB` / `#60A5FA`): в тёмной теме цвет спиннера **`#FFFFFF`**, в светлой — **`palette.subtitle`**, чтобы индикатор оставался видимым на белом фоне.

## Что проверено

- `npm test -- --testPathPattern=App.test` — все 11 тестов прошли.

## Дальнейшие шаги

- В коде не найдено литерала `#2596be`; если этот оттенок ещё виден (например, в растровом `play_store_512.png` / иконках), его нужно править в исходнике арта и перегенерировать `ic_launcher_full` скриптом `scripts/generate-launcher-pngs.ps1`.
- Синий `selectedBorder` в палитре календаря по-прежнему используется на основных экранах (выделение, ссылки); при необходимости заменить его на белый там придётся подобрать новые контрастные обводки/заливки для выбранных ячеек.
