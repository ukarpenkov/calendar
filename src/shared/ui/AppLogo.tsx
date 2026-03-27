import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type AppLogoProps = {
  isDarkMode: boolean;
  size?: 'large' | 'small';
  /** Rounded backdrop behind the mark; defaults to on for splash (`large`), off in compact headers (`small`). */
  withPlate?: boolean;
};

/** Design canvas for Pencil node kCRJe (Logo / Calendar + settings), px */
const CANVAS_W = 240;
const CANVAS_H = 260;

const SIZE_PRESETS = {
  large: { width: 100 },
  small: { width: 74 },
} as const;

/** Brand colors from pencil-new.pen (Android icon • Material You / brand light) */
const COLORS = {
  card: '#FFFFFF',
  monthBar: '#E4EDF2',
  cell: '#BCCAD6',
  accent: '#F4978E',
  gear: '#FFFFFF',
  plateLight: '#E4EDF2',
  plateDark: '#2C3834',
  plateBorderLight: 'rgba(42, 61, 53, 0.08)',
  plateBorderDark: 'rgba(255, 255, 255, 0.1)',
} as const;

/** Material-style settings (filled), viewBox 0 0 24 24 */
const GEAR_PATH =
  'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33c-.22-.08-.47 0-.59.22L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48l2.03 1.58C4.84 11.36 4.8 11.69 4.8 12s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61L19.14 12.94zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.98 3.6-3.6 3.6z';

export function AppLogo({
  isDarkMode,
  size = 'large',
  withPlate = size === 'large',
}: AppLogoProps) {
  const { width: outW } = SIZE_PRESETS[size];
  const s = outW / CANVAS_W;
  const outH = CANVAS_H * s;
  const cardShadowOpacity = isDarkMode ? 0.2 : 0.125;
  const platePad = 14 * s;
  const plateRadius = 32 * s;

  const card = {
    left: 4 * s,
    top: 44 * s,
    width: 232 * s,
    height: 212 * s,
    radius: 26 * s,
    pad: 14 * s,
    gapBelowBar: 7 * s,
  };

  const gear = {
    left: 156 * s,
    top: 6 * s,
    size: 80 * s,
  };

  const bar = { w: 198 * s, h: 20 * s, r: 10 * s };
  const rowGap = 6 * s;
  const r1 = { w: 54 * s, h: 30 * s, gap: 10 * s, r: 10 * s };
  const r2 = { h: 28 * s, gap: 5 * s, r: 9 * s, w: [26 * s, 62 * s, 26 * s, 26 * s, 26 * s] as const };
  const r34 = { cell: 28 * s, gap: 5 * s, r: 9 * s };

  const mark = (
    <View
      accessible={false}
      style={[styles.canvas, { width: outW, height: outH }]}
    >
      <View
        style={[
          styles.gearWrap,
          {
            left: gear.left,
            top: gear.top,
            width: gear.size,
            height: gear.size,
          },
        ]}
      >
        <Svg width={gear.size} height={gear.size} viewBox="0 0 24 24">
          <Path d={GEAR_PATH} fill={COLORS.gear} />
        </Svg>
      </View>

      <View
        style={[
          styles.card,
          {
            left: card.left,
            top: card.top,
            width: card.width,
            height: card.height,
            borderRadius: card.radius,
            padding: card.pad,
            gap: card.gapBelowBar,
            backgroundColor: COLORS.card,
            shadowOpacity: cardShadowOpacity,
          },
        ]}
      >
        <View
          style={[
            styles.monthBar,
            {
              width: bar.w,
              height: bar.h,
              borderRadius: bar.r,
              backgroundColor: COLORS.monthBar,
            },
          ]}
        />

        <View style={[styles.gridCol, { gap: rowGap }]}>
          <View style={[styles.row, { gap: r1.gap }]}>
            <View
              style={[
                styles.cell,
                {
                  width: r1.w,
                  height: r1.h,
                  borderRadius: r1.r,
                  backgroundColor: COLORS.cell,
                },
              ]}
            />
            <View
              style={[
                styles.cell,
                {
                  width: r1.w,
                  height: r1.h,
                  borderRadius: r1.r,
                  backgroundColor: COLORS.cell,
                },
              ]}
            />
            <View
              style={[
                styles.cell,
                {
                  width: r1.w,
                  height: r1.h,
                  borderRadius: r1.r,
                  backgroundColor: COLORS.cell,
                },
              ]}
            />
          </View>

          <View style={[styles.row, { gap: r2.gap }]}>
            {r2.w.map((w, i) => (
              <View
                key={`r2-${i}`}
                style={[
                  styles.cell,
                  {
                    width: w,
                    height: r2.h,
                    borderRadius: r2.r,
                    backgroundColor: i === 1 ? COLORS.accent : COLORS.cell,
                  },
                ]}
              />
            ))}
          </View>

          {[0, 1].map(row => (
            <View key={`r34-${row}`} style={[styles.row, { gap: r34.gap }]}>
              {Array.from({ length: 5 }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.cell,
                    {
                      width: r34.cell,
                      height: r34.cell,
                      borderRadius: r34.r,
                      backgroundColor: COLORS.cell,
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  if (!withPlate) {
    return mark;
  }

  return (
    <View
      accessible={false}
      style={[
        styles.plate,
        {
          padding: platePad,
          borderRadius: plateRadius,
          backgroundColor: isDarkMode ? COLORS.plateDark : COLORS.plateLight,
          borderColor: isDarkMode
            ? COLORS.plateBorderDark
            : COLORS.plateBorderLight,
        },
      ]}
    >
      {mark}
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    alignSelf: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  canvas: {
    position: 'relative',
  },
  gearWrap: {
    position: 'absolute',
    zIndex: 0,
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  card: {
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
    shadowColor: '#2A3D35',
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  monthBar: {},
  gridCol: {
    alignItems: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {},
});
