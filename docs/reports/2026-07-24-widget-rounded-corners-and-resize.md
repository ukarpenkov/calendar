# Виджет: скругление углов, растягивание картинки и больший max resize

**Status:** staged (не закоммичено)  
**Date:** 2026-07-24  
**Branch:** `feat/new-animations`

## Summary

Доработка Android home-screen виджета: финальный bitmap клипится с radius 36dp (чтобы верхние углы не оставались квадратными), картинка снова на всю высоту контейнера, `maxResizeWidth` увеличен до 440dp. Плюс небольшой рефактор refresh scheduler и упрощение `updateCalendarWidget`.

## Проблема

1. **Верхние углы квадратные.** У ассета низ уже скруглён, а верх рисовался как прямоугольник. `radius` у `ImageWidget` / layout сам по себе не давал надёжный clip всего RemoteViews bitmap: на части устройств `DST_IN` без `saveLayer` игнорируется.
2. **Картинка не заполняла высоту.** После предыдущего фикса (`height: 'wrap_content'` + `flex-end`) изображение занимало только естественный 420×180 и не тянулось на весь виджет.
3. **Узкий потолок ресайза.** `maxResizeWidth="320dp"` ограничивал, насколько широко лаунчер мог растянуть виджет.

## Что изменено

### Native patch (`react-native-android-widget`)

В `RNWidget.drawViewToBitmap` после отрисовки view в bitmap применяется clip через `SRC_IN` + `drawRoundRect` с radius **36dp**. Так скругляется весь итоговый RemoteViews bitmap, а не только низ ассета.

### JS layout

- `WIDGET_CORNER_RADIUS`: `16` → `36` (согласовано с native clip).
- У placeholder и основного `ImageWidget`: `height: 'wrap_content'` → `'match_parent'`, чтобы картинка заполняла контейнер.

### Widget info XML

- `android:maxResizeWidth`: `320dp` → `440dp` (при тех же `minResize*` / `maxResizeHeight`).

### Alarm scheduler

- `requestWidgetRefresh` вынесен через private `refreshProvider(appContext, appWidgetManager, providerClass)` — refresh по классу провайдера, без хардкода только в теле метода (сейчас по-прежнему `CalendarAppWidgetProvider`).

### Register / update

- `fetchTodayWidgetData()` вызывается до `requestWidgetUpdate`; в `renderWidget` передаётся уже готовый `<CalendarWidgetLayout data={data} />` (без async внутри render callback).

### Прочее

- В `.gitignore` добавлен `docs/cheatcode.md` (локальный frontend cheatcode, не для репозитория).

## Files

- `patches/react-native-android-widget+0.20.3.patch`
- `src/widgets/CalendarWidgetLayout.tsx`
- `src/widgets/registerWidget.tsx`
- `android/app/src/main/res/xml/calendar_widget_info.xml`
- `android/app/src/main/java/com/prodyk/calendar/CalendarWidgetAlarmScheduler.kt`
- `.gitignore`

## Verification

- [ ] После `npx patch-package` / пересборки APK: верхние и нижние углы виджета одинаково скруглены (~36dp).
- [ ] Картинка заполняет высоту виджета (и с данными, и placeholder).
- [ ] На лаунчере виджет можно растянуть шире, чем раньше (до ~440dp по ширине).
- [ ] Обновление виджета (midnight / boot / timezone) по-прежнему приходит на `CalendarAppWidgetProvider`.

## Дальнейшие шаги

- Собрать debug APK и проверить на эмуляторе / устройстве скругление и resize.
- Закоммитить staged-набор, когда визуал подтверждён.
