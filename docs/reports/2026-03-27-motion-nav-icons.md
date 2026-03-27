# Навигация месяца и «назад»: SVG и микровзаимодействие

## Что изменено

- Добавлена зависимость `react-native-svg` для векторных иконок на Android.
- В `src/shared/ui/icons/NavigationIcons.tsx` добавлены обводные SVG: стрелка «назад» (`ArrowBackIcon`), шевроны влево/вправо для переключения месяца.
- Добавлен переиспользуемый `IconCircleButton`: круглая кнопка с `Animated.spring` при нажатии (масштаб ~0.92), на Android — `android_ripple`.
- Экран месяца (`MonthDetailScreen`): «назад» и перелистывание месяцев переведены на SVG и новую кнопку; для кнопок заданы подписи доступности (`common.backToYear`, `month.nav.previousMonth`, `month.nav.nextMonth`).
- Для единообразия те же иконка и кнопка использованы на экранах настроек и импорта (`common.navigateBack`).
- В `src/shared/lib/i18n/index.ts` добавлены строки `common.navigateBack`, `month.nav.previousMonth`, `month.nav.nextMonth` (en/ru).

## Что проверено

- `npm test` — все 9 suites / 30 тестов проходят.
- `read_lints` по затронутым TSX — замечаний нет.

## Дальнейшие шаги

- После установки нативного модуля нужна пересборка Android (`npm run android` или сборка из Android Studio), чтобы подтянуть `react-native-svg`.
- При желании можно распространить тот же паттерн на другие `Pressable` в приложении или слегка подстроить толщину линий/размер иконок под визуальный гайд.
