import Svg, { G, Path, Rect } from 'react-native-svg';

const VB = 200;

type YearScreenCalendarMarkProps = {
  /** Toolbar mark matches legacy `AppLogo` toolbar preset (~32). */
  size?: number;
  accessibilityLabel?: string;
};

/**
 * Decorative calendar-grid mark for the year home app bar and loading surfaces.
 */
export function YearScreenCalendarMark({
  accessibilityLabel,
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
      <G transform="translate(126 4) scale(2.08)">
        <Path
          fill="#EBEBEB"
          stroke="#D6D6D6"
          strokeWidth={0.2}
          strokeLinejoin="round"
          d="M19.14,12.94c0.04-0.31,0.06-0.63,0.06-0.94s-0.02-0.63-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.11-0.2-0.36-0.28-0.56-0.2l-2.39,0.96c-0.5-0.38-1.04-0.7-1.64-0.94L14.5,2.5c-0.03-0.22-0.22-0.38-0.44-0.38h-4.12c-0.22,0-0.41,0.16-0.44,0.38L9.22,5.37C8.62,5.61,8.08,5.93,7.58,6.31L5.19,5.35c-0.2-0.08-0.45,0-0.56,0.2L2.71,8.87c-0.11,0.2-0.06,0.47,0.12,0.61l2.03,1.58C4.82,11.37,4.8,11.69,4.8,12s0.02,0.63,0.06,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.11,0.2,0.36,0.28,0.56,0.2l2.39-0.96c0.5,0.38,1.04,0.7,1.64,0.94l0.28,2.87c0.03,0.22,0.22,0.38,0.44,0.38h4.12c0.22,0,0.41-0.16,0.44-0.38l0.28-2.87c0.6-0.24,1.14-0.56,1.64-0.94l2.39,0.96c0.2,0.08,0.45,0,0.56-0.2l1.92-3.32c0.11-0.2,0.06-0.47-0.12-0.61L19.14,12.94z M12,15.5c-1.93,0-3.5-1.57-3.5-3.5s1.57-3.5,3.5-3.5s3.5,1.57,3.5,3.5S13.93,15.5,12,15.5z"
        />
      </G>
    </Svg>
  );
}
