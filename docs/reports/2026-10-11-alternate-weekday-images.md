# Alternate weekday illustrations

Generated with the built-in image_gen tool, using each original weekday illustration as its style reference. Final assets are WebP, 1915 × 821, encoded with cwebp quality 85 / method 6. Identical copies live in Android drawable resources with a `day_` prefix.

Calendar weeks start on Monday. The partial first row is week one. Rows 1, 3 and 5 use the original set; rows 2, 4 and 6 use `_2`. Rotation resets each month. App selection, image preloading and widget selection use the same helper. Other day types and vacation priority are preserved.

## default_work_mon_2.webp

- App: `assets/days_img/default_work_mon_2.webp`
- Widget: `android/app/src/main/res/drawable/day_default_work_mon_2.webp`
- Style reference: `assets/days_img/default_work_mon.webp`

Prompt:

Use case: illustration-story. Create ONE new standalone wide calendar header illustration for mon, a second-week alternative. Input image is STYLE REFERENCE ONLY, not an edit target. Match its flat editorial vector-like illustration, simple faceless human figures, clean geometric shapes, restrained layered tonal shading, no outlines, very subtle texture, no photorealism, no 3D. Scene: Monday morning commute in a modern tram with three or four adult commuters, one seated with a book and coffee, another with work bag; broad window reveals city, river bridge and low golden sun. Warm honey-yellow sunlight pools on teal seats and floor, amber reflections, a few soft lilac distant buildings. New composition and characters, same visual family as reference. Preserve the source series' professional calm teal, navy, mint and cream palette but increase warm yellow atmospheric lighting. Panoramic composition with exact target aspect ratio 1915:821 (about 2.33:1); full bleed, no borders or blank margins. Compose important subjects safely within central 85%. Interesting details remain simplified and legible at small widget size. No letters, numbers, logos, watermarks or typography. Generate at wide 1915:821 aspect ratio.

## default_work_tue_2.webp

- App: `assets/days_img/default_work_tue_2.webp`
- Widget: `android/app/src/main/res/drawable/day_default_work_tue_2.webp`
- Style reference: `assets/days_img/default_work_tue.webp`

Prompt:

Use case: illustration-story. Create ONE new standalone wide calendar header illustration for tue, a second-week alternative. Input image is STYLE REFERENCE ONLY, not an edit target. Match its flat editorial vector-like illustration, simple faceless human figures, clean geometric shapes, restrained layered tonal shading, no outlines, very subtle texture, no photorealism, no 3D. Scene: Tuesday in a welcoming coworking studio: three adult colleagues working quietly at pale wooden desks, one sharing a notebook with another, laptops, leafy plants, ceramic yellow mugs and a little bookshelf. Huge windows, abundant warm buttery yellow midday sunlight with graphic diagonal shadows; teal furnishings, warm cream walls. New composition, same visual family as reference. Preserve the source series' professional calm teal, navy, mint and cream palette but increase warm yellow atmospheric lighting. Panoramic composition with exact target aspect ratio 1915:821 (about 2.33:1); full bleed, no borders or blank margins. Compose important subjects safely within central 85%. Interesting details remain simplified and legible at small widget size. No letters, numbers, logos, watermarks or typography. Generate at wide 1915:821 aspect ratio.

## default_work_wed_2.webp

- App: `assets/days_img/default_work_wed_2.webp`
- Widget: `android/app/src/main/res/drawable/day_default_work_wed_2.webp`
- Style reference: `assets/days_img/default_work_wed.webp`

Prompt:

Use case: illustration-story. Create ONE new standalone wide calendar header illustration for wed, a second-week alternative. Input image is STYLE REFERENCE ONLY, not an edit target. Match its flat editorial vector-like illustration, simple faceless human figures, clean geometric shapes, restrained layered tonal shading, no outlines, very subtle texture, no photorealism, no 3D. Scene: Wednesday in a modern engineering workshop: two engineers in white safety helmets inspect a small mechanical prototype on a worktable, one other technician by a teal precision machine. Organized tools, rolled plans, yellow task lamps, large upper windows. Atmospheric late-afternoon golden yellow shafts of light and soft teal shadows. New scene and composition, same visual family as reference. Preserve the source series' professional calm teal, navy, mint and cream palette but increase warm yellow atmospheric lighting. Panoramic composition with exact target aspect ratio 1915:821 (about 2.33:1); full bleed, no borders or blank margins. Compose important subjects safely within central 85%. Interesting details remain simplified and legible at small widget size. No letters, numbers, logos, watermarks or typography. Generate at wide 1915:821 aspect ratio.

## default_work_thu_2.webp

- App: `assets/days_img/default_work_thu_2.webp`
- Widget: `android/app/src/main/res/drawable/day_default_work_thu_2.webp`
- Style reference: `assets/days_img/default_work_thu.webp`

Prompt:

Use case: illustration-story. Create ONE new standalone wide calendar header illustration for thu, a second-week alternative. Input image is STYLE REFERENCE ONLY, not an edit target. Match its flat editorial vector-like illustration, simple faceless human figures, clean geometric shapes, restrained layered tonal shading, no outlines, very subtle texture, no photorealism, no 3D. Scene: Thursday twilight in a cozy creative office: two adult colleagues at separate desks, one sketching beside a laptop, one reading notes; warm yellow desk lamps create large inviting pools of amber light. Huge windows show muted lilac-purple dusk skyline with peach horizon and a few glowing windows. Indoor leafy plants, small books, mug. Rich teal and navy furnishings. Same visual family as reference, lighter and warmer than reference. Preserve the source series' professional calm teal, navy, mint and cream palette but increase warm yellow atmospheric lighting. Panoramic composition with exact target aspect ratio 1915:821 (about 2.33:1); full bleed, no borders or blank margins. Compose important subjects safely within central 85%. Interesting details remain simplified and legible at small widget size. No letters, numbers, logos, watermarks or typography. Generate at wide 1915:821 aspect ratio.

## default_work_fri_2.webp

- App: `assets/days_img/default_work_fri_2.webp`
- Widget: `android/app/src/main/res/drawable/day_default_work_fri_2.webp`
- Style reference: `assets/days_img/default_work_fri.webp`

Prompt:

Use case: illustration-story. Create ONE new standalone wide calendar header illustration for fri, a second-week alternative. Input image is STYLE REFERENCE ONLY, not an edit target. Match its flat editorial vector-like illustration, simple faceless human figures, clean geometric shapes, restrained layered tonal shading, no outlines, very subtle texture, no photorealism, no 3D. Scene: Friday late afternoon team wrap-up in a comfortable office lounge: four adult colleagues around a round table with laptop and neatly arranged notebooks, relaxed discussion, one standing putting a folder on shelf. Golden sunset across cream walls, deep teal seating, mustard cushions, leafy plants, soft lavender city visible through window, warm glowing pendant lamps. Calm sense of completed work, no party. New composition, same visual family as reference. Preserve the source series' professional calm teal, navy, mint and cream palette but increase warm yellow atmospheric lighting. Panoramic composition with exact target aspect ratio 1915:821 (about 2.33:1); full bleed, no borders or blank margins. Compose important subjects safely within central 85%. Interesting details remain simplified and legible at small widget size. No letters, numbers, logos, watermarks or typography. Generate at wide 1915:821 aspect ratio.

## Validation

- 37 targeted tests passed (weekday rotation, holiday images, year image cache and widget vacation data). TypeScript and ESLint passed for the changed code.
- All five app/widget image pairs are byte-identical and included in the debug APK. File sizes: Monday 110118 B; Tuesday 125088 B; Wednesday 122876 B; Thursday 77848 B; Friday 102162 B.
- Android debug build and installation succeeded on Medium_Phone. The React Native CLI's final launch step could not locate the custom APK filename after Gradle installed it, so MainActivity was launched directly through adb.
- Visually verified October 7, 2027 uses the new Thursday image and October 14 uses the original, with matching image bounds.
- Added the home-screen widget and visually verified the new Thursday illustration with the emulator date temporarily set to October 7, 2027. Restored the current time and automatic time synchronization afterward.
- Left the emulator and development server running, with October 7, 2027 selected in the app for preview.
