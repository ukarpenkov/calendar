import { StyleSheet } from 'react-native';

import { layout } from '../../../shared/lib/ui/layout';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: layout.screenPaddingH,
    gap: layout.contentStackGap,
  },
  successScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: layout.screenPaddingH,
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  appBarTrailing: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: 12,
  },
  stepperSegment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepperNode: {
    alignItems: 'center',
    minWidth: 68,
    maxWidth: 92,
  },
  stepperCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCircleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepperLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepperConnector: {
    width: 72,
    height: 2,
    marginTop: 15,
    marginHorizontal: 8,
    borderRadius: 1,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  aiPromptCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  jsonTextArea: {
    height: 92,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  yearBadge: {
    fontSize: 28,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
  },
  panelHeadline: {
    fontSize: 22,
    fontWeight: '700',
  },
  panelSupporting: {
    fontSize: 15,
    lineHeight: 22,
  },
  confirmCompare: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  detailList: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  actionButton: {
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  ghostButton: {
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  ghostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorList: {
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
  },
  centeredWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingH,
    gap: 16,
  },
  centeredHeadline: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  centeredSupporting: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  successMark: {
    fontSize: 56,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorMark: {
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
  },
});
