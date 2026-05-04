# Сплэш: та же SVG-марка, что в шапке года

## Что изменено

### React Native

- В `src/pages/splash/ui/SplashScreen.tsx` вместо растрового `AppLogo` используется `YearScreenCalendarMark` с `size={112}` (константа `SPLASH_MARK_SIZE`): та же SVG-сетка, что слева в шапке `YearHomeScreen` (по умолчанию 32 px), только крупнее.
- В тёмной теме для `backgroundColor` марки передаётся фон сплэша (`palette.background`), чтобы скруглённая «плашка» SVG совпадала с экраном, по аналогии с главным экраном года.

### Android (до загрузки JS)

- Файл `android/app/src/main/res/drawable/year_screen_calendar_mark.xml` — **Vector Drawable**, та же разметка, что у `YearScreenCalendarMark`; пути в `<group>` с `scaleX/scaleY="0.56"` и `pivotX/Y="100"` — запас под круглую маску сплэша и аналогичные обрезки (ранее 0.70 всё ещё клипался).
- В `splash_screen.xml` вместо PNG `ic_launcher_full` — этот вектор с центрированием и размером **112 dp**, как у `SPLASH_MARK_SIZE`.
- В `values-v31/styles.xml` атрибут `windowSplashScreenAnimatedIcon` тоже ссылается на этот вектор (системный splash API 31+).
- Адаптивная иконка в лаунчере по-прежнему на PNG (`ic_launcher_foreground`).

## Что проверено

- Линтер по `SplashScreen.tsx` без замечаний.
- `npm test`: часть suites проходит; падения связаны с несовпадением скомпилированного `better-sqlite3` и версии Node в окружении (NODE_MODULE_VERSION), не с изменением UI.
- `./gradlew :app:assembleDebug` — сборка успешна.

## Дальнейшие шаги

- При необходимости подправить размер — менять `scaleX`/`scaleY` в `year_screen_calendar_mark.xml` (сейчас `0.56`).
- Компонент `AppLogo` сейчас не импортируется в `src/`; при необходимости можно использовать для других экранов или удалить как мёртвый код отдельной задачей.
