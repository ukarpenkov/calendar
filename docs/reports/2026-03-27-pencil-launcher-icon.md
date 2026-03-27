# Иконка лаунчера по макету Pencil (gprPl)

## Что изменено

- Источник: фрейм **`gprPl`** («palette: brand • dark») и компонент **`kCRJe`** (Logo / Calendar + settings) в `pencil-new.pen` (чтение через Pencil MCP `batch_get`).
- **`android/app/src/main/res/drawable/ic_launcher_foreground.xml`**: вектор пересобран по геометрии логотипа (карточка 184×156, rx 30; полоска месяца; сетка клавиш; акцент **#F4978E**; шестерня Material settings, **#FFFFFF**, позиция как в макете). Масштаб и сдвиг под адаптивную иконку 108×108: масштаб **0.303** от точки **(128, 119)**, затем перенос **(-74, -65)**.
- **`android/app/src/main/res/values/colors.xml`**: `ic_launcher_background` = **`#4A7D6E`** (фон плашки из gprPl).

## Что проверено

- Gradle `:app:mergeDebugResources` выполняется без ошибок (после правок).

## Дальнейшие шаги

- При необходимости подправить положение шестерни (группа `translate 148,10` + `scale 3.3333`) по скриншоту на устройстве.
- Тени из макета (blur на gear и card) в вектор лаунчера не переносились — только плоские заливки, как принято для adaptive icon.
