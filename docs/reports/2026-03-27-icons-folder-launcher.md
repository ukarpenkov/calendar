# Иконки: единый источник `icons/`

## Что изменено

- Каталог **`icons/`** задан как канонический источник: готовые **`mipmap-*/ic_launcher.png`** и **`ic_launcher_round.png`** копируются в `android/app/src/main/res/mipmap-*`.
- Растры **`drawable-*dpi/ic_launcher_full.png`** (splash, adaptive foreground, API 31+ splash) генерируются из **`icons/play_store_512.png`** с прежними размерами (108×108 dp и т.д.).
- Файл **`assets/launcher-icon-source.png`** синхронизируется с **`icons/play_store_512.png`** для `AppLogo` в React Native.
- Скрипт **`scripts/generate-launcher-pngs.ps1`** переписан: копирует mipmap из `icons/`, масштабирует Play-иконку в drawable и обновляет asset.
- Удалён **`drawable/ic_launcher_monochrome.xml`**; из **`mipmap-anydpi-v33/*.xml`** убран слой monochrome (старый вектор не соответствовал новому растру).
- В **`AppLogo.tsx`** обновлён комментарий к источнику изображения.

## Что проверено

- Запуск `scripts/generate-launcher-pngs.ps1` без ошибок.
- `npm test` — все 10 наборов тестов проходят.

## Дальнейшие шаги

- При смене иконки: обновить PNG в **`icons/`** (включая **`play_store_512.png`** и папки **`mipmap-*`**) и снова выполнить `generate-launcher-pngs.ps1`.
- При необходимости themed icon на API 33+: добавить новый **`monochrome`**-слой под актуальный силуэт.
