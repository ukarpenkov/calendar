# 📐 Material Design 3 Quick Reference
## Для Calendar 2026 App

---

## 🎨 Design Tokens

### Spacing (на основе 4dp grid)

```javascript
export const spacing = {
  none: 0,
  xxs: 2,   // Micro gaps (внутри очень плотных компонентов)
  xs: 4,    // Между очень близкими элементами
  sm: 8,    // Между связанными элементами
  md: 12,   // Стандартный gap в группе, padding карточек
  lg: 16,   // Screen padding, gap между группами
  xl: 20,   // Между секциями
  xxl: 24,  // Между крупными блоками
  xxxl: 32, // Максимальный для особых случаев
};
```

**Где использовать:**

| Назначение | Размер | Примеры |
|------------|--------|---------|
| Между ячейками calendar | `xs` (4dp) | Day cells gap |
| Внутри компонента | `sm` (8dp) | Header → content gap |
| Padding карточек | `md` (12dp) | Month card, stats card |
| Screen padding | `lg` (16dp) | All screens |
| Между секциями | `xl` (20dp) | Calendar → Statistics |
| Dialog padding | `xxl` (24dp) | Modal padding |

---

### Typography Scale

```javascript
export const typography = {
  // Display - крупные заголовки (не используем в этом app)
  displayLarge: { size: 57, weight: '400', lineHeight: 64 },
  displayMedium: { size: 45, weight: '400', lineHeight: 52 },
  displaySmall: { size: 36, weight: '400', lineHeight: 44 },
  
  // Headlines - заголовки секций
  headlineLarge: { size: 32, weight: '400', lineHeight: 40 },
  headlineMedium: { size: 28, weight: '400', lineHeight: 36 },
  headlineSmall: { size: 24, weight: '400', lineHeight: 32 }, // ← App bars
  
  // Titles - заголовки компонентов
  titleLarge: { size: 22, weight: '500', lineHeight: 28 },
  titleMedium: { size: 16, weight: '500', lineHeight: 24 },
  titleSmall: { size: 14, weight: '500', lineHeight: 20 },
  
  // Body - основной текст
  bodyLarge: { size: 16, weight: '400', lineHeight: 24 },   // ← Stats values
  bodyMedium: { size: 14, weight: '400', lineHeight: 20 },  // ← Primary text
  bodySmall: { size: 12, weight: '400', lineHeight: 16 },   // ← Month names
  
  // Labels - UI элементы
  labelLarge: { size: 14, weight: '500', lineHeight: 20 },
  labelMedium: { size: 12, weight: '500', lineHeight: 16 }, // ← Day numbers
  labelSmall: { size: 11, weight: '500', lineHeight: 16 },  // ← Week numbers
};
```

**Использование в приложении:**

| Элемент | Type Scale | Вес | Использование |
|---------|-----------|-----|---------------|
| **App Bar Title** | Headline Small (24sp) | 400-500 | "2026", "March 2026", "Settings" |
| **Month Name (Year view)** | Body Small (12sp) | 700 | "Jan", "Feb", "Mar" |
| **Month Name (Detail)** | Headline Small (24sp) | 500 | "March 2026" |
| **Day Number (large)** | Body Large (16sp) | 500 | Month detail cells |
| **Day Number (small)** | Label Medium (12sp) | 400 | Year view cells |
| **Week Days Header** | Label Small (11sp) | 500 | "M T W T F S S" |
| **Week Numbers** | Label Small (11sp) | 400 | "1", "2", "3" |
| **Stats Labels** | Body Medium (14sp) | 400 | "Total days", "Working days" |
| **Stats Values** | Body Large (16sp) | 600 | "31", "21", "10" |
| **Stats Hours** | Title Medium (16sp) | 700 | "168 h" (accent) |
| **Legend Text** | Label Medium (12sp) | 400 | "Workday", "Weekend" |
| **Button Text** | Label Large (14sp) | 500 | "Cancel", "Replace" |
| **Settings Item** | Body Large (16sp) | 400 | "Import year (JSON)" |
| **Settings Subtitle** | Label Medium (12sp) | 400 | Descriptions |

---

### Colors

#### Палитра приложения

```javascript
export const colors = {
  light: {
    // Surfaces
    background: '#F5F7FA',
    surface: '#FFFFFF',
    surfaceVariant: '#E5E7EB',
    
    // Text
    onBackground: '#1A1D26',
    onSurface: '#1A1D26',
    onSurfaceVariant: '#5C667A',
    
    // Primary/Accent
    primary: '#2563EB',
    onPrimary: '#FFFFFF',
    primaryContainer: '#DBEAFE',
    onPrimaryContainer: '#1E3A8A',
    
    // Semantic colors
    error: '#EF4444',
    onError: '#FFFFFF',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#991B1B',
    
    success: '#10B981',
    successContainer: '#D1FAE5',
    
    warning: '#F59E0B',
    warningContainer: '#FEF3C7',
    
    // Calendar specific
    workday: '#FFFFFF',
    weekend: '#DBEAFE',
    holiday: '#FEE2E2',
    shortened: '#FEF3C7',
    
    // Borders
    outline: '#D1D5DB',
    outlineVariant: '#E5E7EB',
  },
  
  dark: {
    // Surfaces
    background: '#12141A',
    surface: '#1B1F27',
    surfaceVariant: '#2A2F3A',
    
    // Text
    onBackground: '#E8EAEF',
    onSurface: '#E8EAEF',
    onSurfaceVariant: '#9AA3B2',
    
    // Primary/Accent
    primary: '#3B82F6',
    onPrimary: '#1E3A8A',
    primaryContainer: '#1E40AF',
    onPrimaryContainer: '#DBEAFE',
    
    // Semantic colors
    error: '#F87171',
    onError: '#7F1D1D',
    errorContainer: '#991B1B',
    onErrorContainer: '#FEE2E2',
    
    success: '#34D399',
    successContainer: '#065F46',
    
    warning: '#FBBF24',
    warningContainer: '#78350F',
    
    // Calendar specific
    workday: '#2A2F3A',
    weekend: '#1E3A8A',
    holiday: '#7F1D1D',
    shortened: '#78350F',
    
    // Borders
    outline: '#4B5563',
    outlineVariant: '#374151',
  },
};
```

#### Контраст-проверка (WCAG)

| Уровень | Обычный текст | Большой текст | Примечание |
|---------|---------------|---------------|------------|
| **AA** | 4.5:1 | 3:1 | Минимум для production |
| **AAA** | 7:1 | 4.5:1 | Рекомендуется |

**Большой текст:** ≥ 18sp regular или ≥ 14sp bold

---

### Elevation & Shadows

```javascript
export const elevation = {
  level0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0, // Android
  },
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  level4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};
```

**Использование:**

| Компонент | Level | Примеры |
|-----------|-------|---------|
| Background | 0 | Screen background |
| Surface | 0-1 | Month cards, stats card |
| Modal | 3 | Dialogs, sheets |
| Snackbar | 3 | Success toast |
| FAB | 3 | Floating buttons (если будут) |

---

### Corner Radius (Shape)

```javascript
export const shape = {
  none: 0,
  extraSmall: 4,  // Chips, badges
  small: 8,       // Day cells, small buttons
  medium: 12,     // Cards, containers
  large: 16,      // Dialogs, large cards
  extraLarge: 28, // FAB, special elements
  full: 9999,     // Fully rounded (pills)
};
```

**Использование в Calendar App:**

| Элемент | Радиус | Размер |
|---------|--------|--------|
| Day Cell (Year view) | Small | 8dp |
| Day Cell (Month view) | Small | 8dp |
| Month Card | Medium | 12dp |
| Stats Card | Medium | 12dp |
| Dialog | Large | 16dp |
| Snackbar | Small | 8dp |
| Toggle Switch | Full | 9999dp |
| Buttons | Medium | 12dp |

---

## 📱 Component Specs

### Touch Targets

```javascript
export const touchTargets = {
  minimum: 48,        // Material Design минимум
  comfortable: 56,    // Рекомендуется для list items
  compact: 40,        // Только для плотных layouts (не рекомендуется)
  
  // Для calendar app
  dayCellDetail: 48,  // Month detail view
  dayCellYear: 24,    // Year view (компромисс для компактности)
  iconButton: 48,
  listItem: 56,
};
```

**Правило:** Минимум 48×48 dp, для компактных view минимум 24×24 dp с увеличенной active area

---

### App Bar Heights

```javascript
export const appBarHeight = {
  default: 64,        // Standard top app bar
  medium: 112,        // Medium top app bar (с подзаголовком)
  large: 152,         // Large top app bar (scrolling)
  
  bottomNav: 80,      // Bottom navigation bar
};
```

---

### List Items

```javascript
export const listItem = {
  minHeight: 56,      // Одна строка текста
  twoLine: 72,        // Две строки
  threeLine: 88,      // Три строки
  
  iconSize: 24,       // Leading/trailing icon
  avatarSize: 40,     // Avatar (если используется)
  
  paddingHorizontal: 16,
  paddingVertical: 8,
  
  gapIconToText: 16,
  gapTextToAction: 16,
};
```

**Использование в Settings:**

```
┌────────────────────────────────────┐
│ [icon:24dp] Title          [action]│ ← 56-72dp height
│    (16dp)   Subtitle       (16dp)  │   16dp padding
└────────────────────────────────────┘
```

---

### Buttons

```javascript
export const button = {
  height: 48,         // Стандартная высота
  heightSmall: 40,    // Компактная (не рекомендуется)
  heightLarge: 56,    // Увеличенная
  
  paddingHorizontal: 24,  // Filled/Outlined
  paddingHorizontalText: 12, // Text button
  
  minWidth: 64,       // Минимальная ширина
  
  // Icon buttons
  iconButton: 48,     // Квадратный
  iconSize: 24,       // Размер иконки
};
```

**Типы кнопок для Calendar App:**

| Тип | Использование | Пример |
|-----|---------------|--------|
| **Filled** | Primary action | "Replace" в dialog |
| **Filled Tonal** | Important secondary | Destructive actions |
| **Outlined** | Secondary action | - |
| **Text** | Tertiary action | "Cancel" |
| **Icon** | Quick actions | Menu, back, settings |

---

### Cards

```javascript
export const card = {
  padding: 16,        // Standard
  paddingSmall: 12,   // Compact (calendar months)
  paddingLarge: 20,   // Spacious
  
  gap: 12,            // Между элементами внутри
  
  elevation: 1,       // Subtle shadow
  cornerRadius: 12,   // Medium shape
};
```

---

### Dialogs

```javascript
export const dialog = {
  minWidth: 280,
  maxWidth: 560,
  
  padding: 24,
  
  titleSize: 20,      // Title Large
  bodySize: 14,       // Body Medium
  
  gapTitleToContent: 16,
  gapContentToActions: 24,
  gapBetweenActions: 8,
  
  cornerRadius: 28,   // Extra Large для dialogs
};
```

---

## 🎯 Calendar-Specific Components

### Day Cell (Year View)

```javascript
export const dayCellYear = {
  size: 24,           // 24×24 dp (компромисс)
  fontSize: 11,       // Label Medium
  fontWeight: '400',
  
  cornerRadius: 4,    // Extra Small
  
  // States
  default: {
    background: colors.light.surface,
    border: colors.light.outline,
  },
  weekend: {
    background: colors.light.weekend,
    border: colors.light.primary,
  },
  holiday: {
    background: colors.light.holiday,
    border: colors.light.error,
  },
  shortened: {
    background: colors.light.shortened,
    border: colors.light.warning,
  },
  today: {
    borderWidth: 2,
    borderColor: colors.light.primary,
  },
};
```

### Day Cell (Month Detail)

```javascript
export const dayCellMonth = {
  size: 48,           // 48×48 dp (Material minimum)
  fontSize: 18,       // Body Large
  fontWeight: '500',
  
  cornerRadius: 8,    // Small
  
  // Те же states что Year
};
```

### Month Card (Year View)

```javascript
export const monthCard = {
  padding: 12,
  gap: 8,             // Между элементами
  
  cornerRadius: 12,   // Medium
  elevation: 0,       // Flat или 1 для subtle shadow
  
  // Title
  titleSize: 12,      // Body Small
  titleWeight: '700',
  
  // Week header
  weekHeaderSize: 10, // Label Small
  weekHeaderWeight: '500',
  
  // Week numbers
  weekNumberSize: 9,  // Label Small
  weekNumberWidth: 16,
};
```

### Statistics Card (Month Detail)

```javascript
export const statsCard = {
  padding: 16,
  gap: 12,            // Между строками
  
  cornerRadius: 12,
  elevation: 1,
  
  // Labels
  labelSize: 14,      // Body Medium
  labelWeight: '400',
  
  // Values
  valueSize: 18,      // Body Large
  valueWeight: '600',
  
  // Highlighted value (hours)
  highlightSize: 20,  // Title Medium
  highlightWeight: '700',
  highlightColor: 'primary',
  
  // Progress bars (optional)
  progressHeight: 8,
  progressRadius: 4,
};
```

### Legend

```javascript
export const legend = {
  layout: 'horizontal', // или 'vertical'
  gap: 16,              // Между items
  
  // Item
  itemGap: 8,           // Indicator → text
  
  // Indicator
  indicatorSize: 12,    // 12×12 dp
  indicatorRadius: 3,   // Слегка rounded
  indicatorBorder: 1.5, // Обводка
  
  // Text
  textSize: 12,         // Label Medium
  textWeight: '400',
};
```

---

## 🎬 Animations

### Duration (ms)

```javascript
export const duration = {
  shortest: 100,      // Tooltip appear
  short: 150,         // Ripple
  standard: 200,      // Most transitions
  emphasized: 300,    // Enter animations
  long: 400,          // Complex transitions
  extraLong: 500,     // Large movement
};
```

### Easing

```javascript
export const easing = {
  // Standard curves
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  
  // Enter (объект появляется)
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  
  // Exit (объект уходит)
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  
  // Emphasis (bouncy, используется редко)
  emphasized: 'cubic-bezier(0.2, 0.0, 0, 1)',
};
```

### Использование

| Анимация | Duration | Easing | Пример |
|----------|----------|--------|--------|
| **Ripple** | 150ms | Standard | Touch feedback |
| **Dialog enter** | 300ms | Decelerate | Modal появляется |
| **Dialog exit** | 200ms | Accelerate | Modal закрывается |
| **Screen transition** | 300ms | Standard | Navigation |
| **Snackbar** | 200ms | Standard | Toast появление/исчезновение |

---

## ♿ Accessibility

### Минимальные размеры

```javascript
export const a11y = {
  // Text
  minTextSize: 12,        // Absolute minimum
  recommendedTextSize: 14, // Recommended minimum
  
  // Touch targets
  minTouchTarget: 48,     // Material minimum
  compactTouchTarget: 40, // Only for dense UIs (avoid)
  
  // Contrast
  minContrastText: 4.5,        // WCAG AA
  minContrastLargeText: 3.0,   // WCAG AA (≥18sp regular)
  recommendedContrast: 7.0,    // WCAG AAA
  
  // Spacing
  minLineHeight: 1.2,     // Плотный текст
  recommendedLineHeight: 1.5, // Комфортный
};
```

### Semantic Labels (для Screen Readers)

```javascript
// Примеры для React Native
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Select January 2026"
  accessibilityRole="button"
  accessibilityHint="Opens detailed view of January"
>
  {/* Day cell content */}
</TouchableOpacity>
```

---

## 📏 Layout Grid

### Screen Margins

```javascript
export const screenMargins = {
  phone: 16,          // Standard для телефонов
  tablet: 24,         // Для планшетов
  desktop: 40,        // Для десктопа/ChromeOS
};
```

### Breakpoints (для responsive)

```javascript
export const breakpoints = {
  compact: 0,         // < 600dp (phones)
  medium: 600,        // 600-840dp (tablets, foldables)
  expanded: 840,      // > 840dp (tablets landscape, ChromeOS)
};
```

### Grid

Material Design использует 4dp grid:
- Все размеры кратны 4
- Исключения: 1-3dp для микро-деталей (thin borders, dividers)

---

## 🎨 State Layers (для интерактивных элементов)

```javascript
export const stateLayer = {
  hover: 0.08,        // Desktop hover state
  focus: 0.12,        // Keyboard focus
  pressed: 0.12,      // Touch pressed
  dragged: 0.16,      // Drag & drop
  
  // Применение: поверх базового цвета
  // Example: rgba(primary, stateLayer.pressed)
};
```

---

## 📦 Quick Implementation Checklist

### Для каждого экрана:

- [ ] **Status Bar**
  - [ ] Использовать нативный Android status bar
  - [ ] Настроить `barStyle` (light/dark content)
  - [ ] `translucent={true}` для edge-to-edge

- [ ] **App Bar**
  - [ ] Высота 64dp
  - [ ] Title: Headline Small (24sp)
  - [ ] Icons: 24×24dp, touch target 48×48dp
  - [ ] Padding: 16dp horizontal

- [ ] **Typography**
  - [ ] Все шрифты из Material Type Scale
  - [ ] Минимум 11sp для мелкого текста
  - [ ] Рекомендуется >= 12sp

- [ ] **Touch Targets**
  - [ ] Минимум 48×48dp для всех кликабельных элементов
  - [ ] Допускается 24×24dp для очень плотных UI (year view)

- [ ] **Spacing**
  - [ ] Использовать 4dp grid
  - [ ] Screen padding: 16dp
  - [ ] Gap между группами: 12-16dp

- [ ] **Colors**
  - [ ] Проверить контраст (минимум 4.5:1)
  - [ ] Light и dark themes
  - [ ] Semantic colors (error, success, warning)

- [ ] **Shapes**
  - [ ] Corner radius из scale (4/8/12/16/28dp)
  - [ ] Consistent по всему app

- [ ] **Elevation**
  - [ ] Subtle shadows (level 1-2)
  - [ ] Dialogs: level 3

- [ ] **Animations**
  - [ ] Ripple effect на кликабельных элементах
  - [ ] Transitions: 200-300ms
  - [ ] Правильные easing curves

- [ ] **Accessibility**
  - [ ] TalkBack labels
  - [ ] Минимальные размеры соблюдены
  - [ ] Контраст проверен

---

## 🔗 Полезные ресурсы

1. **Material Design 3:**
   - https://m3.material.io/

2. **Material You Color Tool:**
   - https://material.io/resources/color/

3. **Type Scale Generator:**
   - https://material.io/design/typography/the-type-system.html

4. **Accessibility:**
   - https://www.w3.org/WAI/WCAG21/quickref/
   - https://webaim.org/resources/contrastchecker/

5. **React Native Material:**
   - https://callstack.github.io/react-native-paper/

6. **Android Design:**
   - https://developer.android.com/design

---

## 💾 Сохранить как Design System файл

Этот документ можно использовать как базу для создания:

1. **theme.ts** - цвета и токены
2. **typography.ts** - шрифты
3. **spacing.ts** - отступы
4. **components/*.ts** - стили компонентов

**Пример theme.ts:**

```typescript
export const theme = {
  colors: colors.light,
  dark: false,
  spacing,
  typography,
  shape,
  elevation,
  duration,
  easing,
};

export const darkTheme = {
  ...theme,
  colors: colors.dark,
  dark: true,
};
```

---

**Готово к использованию!** 🎨✨

Этот quick reference содержит все необходимые значения для реализации дизайна по Material Design 3 стандартам.
