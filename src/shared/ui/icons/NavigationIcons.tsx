import Svg, { Path } from 'react-native-svg';

type IconProps = {
  color: string;
  size?: number;
};

const VIEW = 24;

export function ArrowBackIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`} accessibilityElementsHidden>
      <Path
        d="M19 12H6M12 19l-7-7 7-7"
        stroke={color}
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function ChevronLeftIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`} accessibilityElementsHidden>
      <Path
        d="M15 18L9 12 15 6"
        stroke={color}
        strokeWidth={2.35}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function ChevronRightIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`} accessibilityElementsHidden>
      <Path
        d="M9 18L15 12 9 6"
        stroke={color}
        strokeWidth={2.35}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
