# Новая иконка приложения и splash

## Что изменено

- Иконка в хедере и на экране загрузки переведена на новый прозрачный календарный знак из `icons/svg_05_26_design/rgb_svg_icon.html`: сохранены прежние размеры в UI, добавлена шестерёнка.
- Android adaptive icon и system splash теперь используют прозрачный foreground без внутренней подложки, чтобы знак не обрезался в круглых и квадратных масках.
- Для Android 13 themed icons добавлен монохромный drawable: система задаёт цветовой фон, а знак остаётся полностью чёрным по образцу `mh_svg_icon.html`.
- Пересобраны PNG-ассеты launcher/play store и синхронизированы в `android/app/src/main/res`.

## Что проверено

- `npx eslint "src/shared/ui/icons/YearScreenCalendarMark.tsx" "src/pages/year/ui/YearHomeScreen.tsx" "src/pages/splash/ui/SplashScreen.tsx"`
- `./gradlew.bat :app:processDebugResources`
- `npm test -- App.test.tsx --runInBand` был остановлен после зависания без вывода результатов.

## Дальнейшие шаги

- Проверить внешний вид на реальном Android-устройстве или эмуляторе с обычной и themed icon темами, потому что финальную форму маски выбирает лаунчер.
