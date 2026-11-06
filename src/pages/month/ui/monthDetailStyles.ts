import { StyleSheet } from 'react-native';

import { layout } from '../../../shared/lib/ui/layout';

export const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  page: {
    flex: 1,
    overflow: 'hidden',
  },
  pageVertical: {
    flex: 1,
  },
  pageVerticalContent: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: layout.monthScrollPaddingTop,
    gap: layout.contentStackGap,
    alignItems: 'center',
  },
  pageVerticalContentSplit: {
    alignItems: 'stretch',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    gap: 12,
    paddingHorizontal: layout.screenPaddingH,
  },
  appBarSide: {
    minWidth: 80,
  },
  appBarSideStart: {
    alignItems: 'flex-start',
  },
  appBarTitleWrap: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  appBarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  appBarTitle: {
    fontSize: 24,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'center',
    width: '100%',
  },
  dayCellText: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedDayCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  selectedDayEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  selectedDayTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  selectedDayMeta: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedDayHoliday: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalsCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  totalsRow: {
    flexDirection: 'row',
    minHeight: 44,
    alignItems: 'center',
  },
  totalItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  totalLabel: {
    width: '100%',
    fontSize: 11.25,
    fontWeight: '600',
    textAlign: 'center',
  },
  totalValue: {
    width: '100%',
    textAlign: 'center',
  },
  holidayBanner: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
});
