# Обновление иллюстраций будних, выходных и сокращённых дней

Перерисованы 13 иллюстраций в атмосферном живописном стиле обновлённых мексиканских и российских праздников: тёплый свет, глубокие сине-зелёные тени, фактуры дерева и ткани, детальные растения и городские пейзажи.

Использован встроенный imagegen, по одному вызову на изображение. [Полные промпты, референсы, исходные PNG и итоговые пути](2026-10-11-everyday-image-prompts.json). Результаты преобразованы в WebP quality 85 без изменения композиции.

| Сцена | Изображение приложения | Android-ресурс |
| --- | --- | --- |
| Понедельник — дорога на работу | `assets/days_img/default_work_mon.webp` | `day_default_work_mon.webp` |
| Вторник — офис | `assets/days_img/default_work_tue.webp` | `day_default_work_tue.webp` |
| Среда — производство | `assets/days_img/default_work_wed.webp` | `day_default_work_wed.webp` |
| Четверг — вечерняя работа | `assets/days_img/default_work_thu.webp` | `day_default_work_thu.webp` |
| Пятница — итоги недели | `assets/days_img/default_work_fri.webp` | `day_default_work_fri.webp` |
| Понедельник — чтение в поезде | `assets/days_img/default_work_mon_2.webp` | `day_default_work_mon_2.webp` |
| Вторник — совместная работа | `assets/days_img/default_work_tue_2.webp` | `day_default_work_tue_2.webp` |
| Среда — мастерская | `assets/days_img/default_work_wed_2.webp` | `day_default_work_wed_2.webp` |
| Четверг — творческая студия | `assets/days_img/default_work_thu_2.webp` | `day_default_work_thu_2.webp` |
| Пятница — встреча в лаунже | `assets/days_img/default_work_fri_2.webp` | `day_default_work_fri_2.webp` |
| Рабочий день — разные профессии | `assets/days_img/work_default.webp` | `day_work_default.webp` |
| Выходной — уютный отдых | `assets/days_img/holday_default.webp` | `day_holday_default.webp` |
| Сокращённый предпраздничный день | `assets/days_img/default_short_day.webp` | `day_default_short_day.webp` |

Android-копии расположены в `android/app/src/main/res/drawable/`. Все существующие имена файлов сохранены. Архитектура, код выбора изображений и чередование по неделям не изменялись. Общие сцены обновлены для всех стран. Предпраздничные сокращённые дни используют одну существующую категорию `shortened`; рабочие субботы и воскресенья используют общую рабочую сцену.

## Проверки

- Все 13 результатов визуально просмотрены: сюжеты сохранены, композиции панорамные, стиль согласован с праздничной серией.
- Размеры 1915–1916 × 821, соответствуют существующей области изображения.
- Все 13 пар приложения и Android-виджета побайтово идентичны; один комплект занимает 4 355 878 байт.
- 33 существующих теста выбора изображений, чередования будних сцен и кэша календаря прошли (`workdayImageRotation`, `holidayImages`, `calendarYearViewCache`).
- Android `:app:assembleDebug` успешно собран. Все 13 обновлённых Android-ресурсов проверены внутри APK и совпадают с файлами проекта.
- `git diff --check` прошёл.
