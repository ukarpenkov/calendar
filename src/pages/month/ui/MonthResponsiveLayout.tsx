import { useState, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  LinearTransition,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';
import { layout } from '../../../shared/lib/ui/layout';
import { motion } from '../../../shared/lib/ui/motion';
import { HOLIDAY_BANNER_ASPECT_RATIO } from './HolidayBanner';
import type { MonthDetailLayoutMetrics } from './monthDetailLayout';

const reflow = LinearTransition.duration(motion.reflow.duration)
  .easing(motion.reflow.easing)
  .reduceMotion(ReduceMotion.System);

type Props = {
  month: number;
  metrics: MonthDetailLayoutMetrics;
  banner: ReactNode;
  calendar: ReactNode;
  summary: ReactNode;
};

/** Stable native ancestry keeps the decoded image alive across orientation changes. */
export function MonthResponsiveLayout({
  month,
  metrics,
  banner,
  calendar,
  summary,
}: Props) {
  const reducedMotion = useReducedMotion();
  const transition = reducedMotion ? undefined : reflow;
  const [summaryHeight, setSummaryHeight] = useState(0);
  const split = metrics.layout === 'split';
  const sideWidth = split
    ? metrics.sideColumnWidth
    : metrics.calendarColumnWidth;
  const bannerHeight = banner ? sideWidth / HOLIDAY_BANNER_ASPECT_RATIO : 0;
  const summaryTop = bannerHeight + (banner ? layout.contentStackGap : 0);
  const calendarTop = split ? 0 : summaryTop;

  return (
    <Animated.View
      testID={`month-content-${month}`}
      style={[
        styles.content,
        split
          ? { minHeight: summaryTop + summaryHeight }
          : { maxWidth: metrics.calendarColumnWidth },
      ]}
    >
      <Animated.View
        testID="month-banner-position"
        layout={transition}
        style={[styles.banner, { width: sideWidth, height: bannerHeight }]}
      >
        {banner}
      </Animated.View>
      <Animated.View
        testID="month-calendar-column"
        layout={transition}
        style={{
          width: metrics.calendarColumnWidth,
          marginTop: calendarTop,
        }}
      >
        {calendar}
      </Animated.View>
      <Animated.View
        testID="month-side-column"
        layout={transition}
        onLayout={event => setSummaryHeight(event.nativeEvent.layout.height)}
        style={[
          styles.summary,
          { width: sideWidth },
          split
            ? [styles.summarySplit, { top: summaryTop }]
            : { marginTop: layout.contentStackGap },
        ]}
      >
        {summary}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%' },
  banner: { position: 'absolute', top: 0, right: 0 },
  summary: { gap: layout.contentStackGap },
  summarySplit: { position: 'absolute', right: 0 },
});
