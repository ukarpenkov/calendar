import { StyleSheet } from 'react-native';

import { layout } from '../../../shared/lib/ui/layout';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPaddingH,
    gap: layout.contentStackGap,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  /** Same width as trailing column so the year stays visually centered. */
  appBarLeading: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBarTrailing: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
  },
  legendCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  monthsGrid: {
    gap: 12,
  },
  monthRow: {
    flexDirection: 'row',
    gap: 12,
  },
  monthCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    gap: 8,
  },
  monthCardShell: {
    flex: 1,
    minWidth: 0,
  },
  monthCardSpacer: {
    flex: 1,
  },
  monthCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  vacationBadge: {
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2DD4BF',
  },
  vacationBadgeText: {
    color: '#FFFFFF',
  },
  monthTitle: {
    flex: 1,
    minWidth: 0,
  },
  monthMeta: {
    flexShrink: 1,
    minWidth: 0,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    width: '100%',
    minWidth: 0,
  },
  weekNumberColumn: {
    width: 22,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNumberLabel: {
    textAlign: 'center',
  },
  daysHeaderStrip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 0,
  },
  weekdayLabel: {
    textAlign: 'center',
  },
  weeksList: {
    gap: 4,
    width: '100%',
    minWidth: 0,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    width: '100%',
    minWidth: 0,
  },
  weekNumberValue: {
    textAlign: 'center',
  },
  daysStrip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 0,
  },
  dayColumnHeader: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  dayColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'stretch',
  },
  emptyDayCell: {
    minWidth: 0,
    alignSelf: 'stretch',
  },
  dayCell: {
    minWidth: 0,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dayCellToday: {
    borderWidth: 2,
  },
  dayCellText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  vacationBarSmall: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  summaryRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  summaryItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 2,
  },
  summaryLabel: {
    textAlign: 'center',
  },
  summaryValue: {
    textAlign: 'center',
  },
});
