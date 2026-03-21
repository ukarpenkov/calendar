import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppLocalization } from '../../../app/providers/localization';
import { useAppTheme } from '../../../app/providers/theme';

type ImportEntryScreenProps = {
  activeYear: number;
  onBack: () => void;
};

export function ImportEntryScreen({
  activeYear,
  onBack,
}: ImportEntryScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          paddingTop: safeAreaInsets.top + 12,
        },
      ]}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: safeAreaInsets.bottom + 32,
        },
      ]}
    >
      <View style={styles.appBar}>
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={[styles.backButton, { borderColor: palette.border }]}
        >
          <Text style={[styles.backButtonText, { color: palette.icon }]}>{'<'}</Text>
        </Pressable>
        <Text style={[styles.appBarTitle, { color: palette.title }]}>
          {t('importEntry.title')}
        </Text>
        <View style={styles.appBarSpacer} />
      </View>

      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <Text style={[styles.eyebrow, { color: palette.subtitle }]}>
          {t('importEntry.eyebrow')}
        </Text>
        <Text style={[styles.heroTitle, { color: palette.title }]}>
          {t('importEntry.heroTitle')}
        </Text>
        <Text style={[styles.heroSubtitle, { color: palette.subtitle }]}>
          {t('importEntry.heroSubtitle')}
        </Text>
      </View>

      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: palette.title }]}>
          {t('importEntry.currentYear.title')}
        </Text>
        <Text style={[styles.cardBody, { color: palette.subtitle }]}>
          {t('importEntry.currentYear.subtitle', { year: activeYear })}
        </Text>
        <Text style={[styles.yearBadge, { color: palette.title }]}>{activeYear}</Text>
      </View>

      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: palette.title }]}>
          {t('importEntry.flow.title')}
        </Text>
        <Text style={[styles.stepText, { color: palette.subtitle }]}>
          {t('importEntry.flow.step1')}
        </Text>
        <Text style={[styles.stepText, { color: palette.subtitle }]}>
          {t('importEntry.flow.step2')}
        </Text>
        <Text style={[styles.stepText, { color: palette.subtitle }]}>
          {t('importEntry.flow.step3')}
        </Text>
      </View>

      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: palette.title }]}>
          {t('importEntry.nextStep.title')}
        </Text>
        <Text style={[styles.cardBody, { color: palette.subtitle }]}>
          {t('importEntry.nextStep.subtitle')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  backButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  appBarSpacer: {
    width: 36,
    height: 36,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 24,
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
});
