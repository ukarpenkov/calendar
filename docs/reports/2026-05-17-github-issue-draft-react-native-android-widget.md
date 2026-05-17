# GitHub issue draft (copy into sAleksovski/react-native-android-widget)

**Suggested title:** `ImageWidget: default scale type causes letterboxing on wide home-screen widgets`

---

## Body (paste below the line into a new issue)

---

### Problem

I’m using `ImageWidget` as a full-bleed background (`width` / `height`: `match_parent`) in an app widget. On some devices and launchers—especially when the widget is stretched horizontally (e.g. wide grid cells on MIUI / Xiaomi home screens)—the image does **not** fill the widget width. There are visible empty bands on the left and right; the wallpaper behind the widget shows through those areas.

### Cause (as I understand it)

In `ImageWidget.java`, the native `ImageView` never sets `setScaleType`, so Android uses the default **`ScaleType.FIT_CENTER`**. The bitmap is also produced at fixed dimensions via `createScaledBitmap` using `imageWidth` / `imageHeight` from props. When the **actual widget aspect ratio** differs from that of the scaled bitmap, `FIT_CENTER` fits the entire drawable inside the view uniformly, which produces **letterboxing** (horizontal or vertical) inside the `ImageView`.

So this isn’t necessarily a launcher bug—it’s consistent with `FIT_CENTER` behavior on a wide container.

### What worked locally

I set:

```java
view.setScaleType(ImageView.ScaleType.CENTER_CROP);
```

at the start of `applyProps()` in `ImageWidget`, so the image **covers** the view (cropping edges if needed), which matches the usual “background fills the widget” expectation.

### Suggestions for the library

1. **Option A:** Default `ImageWidget` to `CENTER_CROP` (or another “cover” behavior) when the intended use is background-style images.
2. **Option B (safer for everyone):** Expose a prop on the JS/TS side (e.g. `resizeMode` / `scaleType`) mapping to `ImageView.ScaleType`, and keep the current default for backward compatibility.

I’d be happy to open a PR if you prefer a specific API shape.

### Environment

- `react-native-android-widget`: **0.20.3**
- Android app widget, `ImageWidget` with `style`: `{ width: 'match_parent', height: 'match_parent' }`, `imageWidth` / `imageHeight` set to fixed design values (e.g. 500 / 300).

Thanks for maintaining the library.

---
