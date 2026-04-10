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

export function GlobeIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`} accessibilityElementsHidden>
      <Path
        d="M12 3.5c4.7 0 8.5 3.8 8.5 8.5s-3.8 8.5-8.5 8.5-8.5-3.8-8.5-8.5 3.8-8.5 8.5-8.5Z"
        stroke={color}
        strokeWidth={1.9}
        fill="none"
      />
      <Path
        d="M3.8 12h16.4M12 3.8c2 2.18 3.1 5.06 3.1 8.2 0 3.14-1.1 6.02-3.1 8.2M12 3.8c-2 2.18-3.1 5.06-3.1 8.2 0 3.14 1.1 6.02 3.1 8.2"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function CalendarIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`} accessibilityElementsHidden>
      <Path
        d="M7 4.75v2.5M17 4.75v2.5M5.75 8.5h12.5M7.75 19.25h8.5a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8.5a2 2 0 0 0-2 2v9.25a2 2 0 0 0 2 2Z"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M9.25 12.1h2.2M14.55 12.1h.2M9.25 15.35h.2M14.55 15.35h.2"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function TelegramIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`} accessibilityElementsHidden>
      <Path
        d="M21.2 4.35a1.53 1.53 0 0 0-1.62-.23L3.88 10.4a1.47 1.47 0 0 0 .12 2.77l3.74 1.26 1.45 4.73a1.47 1.47 0 0 0 2.63.42l2.1-2.86 3.94 2.91a1.53 1.53 0 0 0 2.43-.88L22 5.81a1.53 1.53 0 0 0-.8-1.46ZM9.64 14.1l7.68-6.48-5.96 7.67-.77 1.06-.95-3.1Zm7.94 3.26-4.17-3.08 5.79-7.46-1.62 10.54Z"
        fill={color}
      />
    </Svg>
  );
}
