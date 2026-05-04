import Svg, { G, Rect } from 'react-native-svg';

const VB = 200;

type YearScreenCalendarMarkProps = {
  /** Toolbar mark matches legacy `AppLogo` toolbar preset (~32). */
  size?: number;
  accessibilityLabel?: string;
  backgroundColor?: string;
};

/**
 * Decorative calendar-grid mark for the year home app bar (user-provided artwork).
 */
export function YearScreenCalendarMark({
  accessibilityLabel,
  backgroundColor = '#F5F7F6',
  size = 32,
}: YearScreenCalendarMarkProps) {
  return (
    <Svg
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      width={size}
      height={size}
      viewBox={`0 0 ${VB} ${VB}`}
    >
      <Rect x={5} y={5} width={190} height={190} rx={20} fill={backgroundColor} />
      <G fill="#8FAFC2">
        <Rect x={25} y={28} width={30} height={30} rx={6} />
        <Rect x={65} y={28} width={30} height={30} rx={6} />
        <Rect x={105} y={28} width={30} height={30} rx={6} />
        <Rect x={145} y={28} width={30} height={30} rx={6} />
        <Rect x={25} y={68} width={30} height={30} rx={6} />
        <Rect x={65} y={68} width={30} height={30} rx={6} />
        <Rect x={105} y={68} width={70} height={30} rx={8} fill="#E8897F" />
        <Rect x={25} y={108} width={30} height={30} rx={6} />
        <Rect x={65} y={108} width={30} height={30} rx={6} />
        <Rect x={105} y={108} width={30} height={30} rx={6} />
        <Rect x={145} y={108} width={30} height={30} rx={6} />
        <Rect x={25} y={148} width={30} height={30} rx={6} />
        <Rect x={65} y={148} width={30} height={30} rx={6} />
        <Rect x={105} y={148} width={30} height={30} rx={6} />
        <Rect x={145} y={148} width={30} height={30} rx={6} />
      </G>
    </Svg>
  );
}
