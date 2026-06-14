# Исправление ошибки FontSize: 0 crash

**Дата**: 2026-06-14  
**Статус**: Исправлено

## Описание ошибки

```
java.lang.IllegalArgumentException: FontSize should be a positive value. Current value: 0
at com.facebook.react.views.text.TextAttributeProps.getLetterSpacing(TextAttributeProps.kt:151)
at com.facebook.react.views.text.TextLayoutManager.buildSpannableFromFragments(TextLayoutManager.kt)
```

React Native (Android) выбрасывает исключение при попытке отрисовать текст с `fontSize: 0`.

## Причина

В файле `src/pages/vacation/ui/VacationYearCalendar.tsx` стиль `dayText` содержал `fontSize: 0`:

```tsx
dayText: {
  fontSize: 0,
},
```

Этот стиль применяется к компоненту `<Text>`, отображающему номер дня в ячейке календаря (10x10 пикселей).

## Исправление

Заменил `fontSize: 0` на `fontSize: 6` — достаточно маленький размер для ячейки 10x10, но валидный для Android.

## Файл

- `src/pages/vacation/ui/VacationYearCalendar.tsx:236`
