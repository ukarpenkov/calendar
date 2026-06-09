import Svg, { Path } from 'react-native-svg';

type VacationIconProps = {
  color: string;
  size?: number;
};

/** Vacation (palm tree + sun + beach) icon, scaled from 512×512 source SVG. */
export function VacationIcon({ color, size = 20 }: VacationIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      accessibilityElementsHidden
    >
      {/* Trunk curve */}
      <Path
        d="M232 276C232 232.645 221.429 196.516 195 164"
        stroke={color}
        strokeWidth={50}
        strokeLinecap="round"
        fill="none"
      />
      {/* Sun circle */}
      <Path
        d="M385 139C409.853 139 430 118.853 430 94C430 69.1472 409.853 49 385 49C360.147 49 340 69.1472 340 94C340 118.853 360.147 139 385 139Z"
        fill="#F2FF00"
        stroke={color}
        strokeWidth={14}
      />
      {/* Beach / sand arc */}
      <Path
        d="M86 352.667C199 271.778 312 271.778 425 352.667V390H86V352.667Z"
        fill="#FFE500"
        stroke={color}
        strokeWidth={18}
        strokeLinejoin="round"
      />
      {/* Water waves */}
      <Path
        d="M86 361.833C97.3 348.722 108.6 348.722 119.9 361.833C131.2 374.944 142.5 374.944 153.8 361.833C165.1 348.722 176.4 348.722 187.7 361.833C199 374.944 210.3 374.944 221.6 361.833C232.9 348.722 244.2 348.722 255.5 361.833C266.8 374.944 278.1 374.944 289.4 361.833C300.7 348.722 312 348.722 323.3 361.833C334.6 374.944 345.9 374.944 357.2 361.833C368.5 348.722 379.8 348.722 391.1 361.833C402.4 374.944 413.7 374.944 425 361.833V470H86V361.833Z"
        fill="#18B8D0"
        stroke={color}
        strokeWidth={16}
        strokeLinejoin="round"
      />
      {/* Palm leaves */}
      <Path
        d="M184 152C133.13 71.2247 87.913 58.7977 54 96.0786Z"
        fill="#5AAA0A"
      />
      <Path
        d="M181.979 154C163.972 80.6667 187.981 41.5556 236 22Z"
        fill="#5AAA0A"
      />
      <Path
        d="M188 145C241.182 43.0641 290.273 43.0641 323 82.2702Z"
        fill="#5AAA0A"
      />
      <Path
        d="M175.897 152.241C104.223 144.316 77.2792 160.869 74.549 210.795Z"
        fill="#5AAA0A"
      />
      {/* Leaf vein strokes */}
      <Path
        d="M193 146C275.477 112.925 252.698 119.225 323 83"
        stroke={color}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M184 146C216.991 80.9 207.879 93.3 236 22"
        stroke={color}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M75 214C139.079 182.5 121.381 188.5 176 154"
        stroke={color}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M184 146C101.523 120.275 124.302 125.175 54 97"
        stroke={color}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Orange accent leaf */}
      <Path
        d="M202.698 152.114C198.343 146.758 190.47 145.946 185.114 150.302C179.758 154.657 178.946 162.53 183.302 167.886L193 160L202.698 152.114ZM232 278H244.5C244.5 230.012 232.693 189.001 202.698 152.114L193 160L183.302 167.886C209.021 199.515 219.5 234.633 219.5 278H232Z"
        fill="#FF9D00"
      />
    </Svg>
  );
}
