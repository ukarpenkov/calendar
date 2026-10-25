# Иллюстрации для описания

Пять файлов `feature-graphic.png` созданы встроенным ImageGen, затем экспортированы в RGB PNG 1024 × 500. CLI/API не использовались. Снимки интерфейса сняты отдельно из приложения в Android-эмуляторе.

Ниже — краткие промпты для повторения визуального направления; это не дословный журнал первоначальных запросов.

Общая основа:

> Use case: ads-marketing. Create a polished landscape feature illustration for a 2027 holiday and vacation calendar app. A tactile spiral-bound desk calendar is the main subject, surrounded by an inviting local scene. Warm natural light, refined paper textures, detailed but calm composition, approximately 2.048:1 aspect ratio. No app UI, no readable text, no logos, no ratings, no download claims, no watermark.

Дополнения для каждой страны:

- **Russia:** A cozy snowy Moscow winter at sunset, evergreen branches, subtle New Year ornaments, a warm drink, a desk calendar with a small architectural illustration and an unnumbered calendar grid. Cream, deep red and winter blue.
- **Turkey:** A bright spring view over the Bosphorus and Istanbul skyline, tulips, flowering branches and turquoise water. An illustrated paper calendar on a sunlit terrace. Soft coral and teal.
- **Indonesia:** A tropical island coast with lush greenery, turquoise bays, warm sunrise, frangipani and a woven mat. A clean paper calendar with a subtle unnumbered grid and colored holiday cells.
- **Japan:** Mount Fuji across a lake, cherry blossoms and drifting petals, an elegant pink paper calendar with an unnumbered grid, a travel hat and a quiet spring mood.
- **Mexico:** A warm colonial town with a church and distant mountains, bougainvillea, agave and golden evening light. A textured paper calendar with a restrained unnumbered grid, a woven hat and travel notebook.

Рамочные макеты воспроизводятся из снимков скриптом `make_phone_mockups.py`. Рамка, тень и боковые кнопки нарисованы программно; пропорции экрана сохранены, содержание интерфейса не перерисовывается.
