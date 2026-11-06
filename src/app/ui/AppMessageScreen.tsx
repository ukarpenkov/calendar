import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../../shared/lib/theme';

type AppMessageScreenProps = {
  title: string;
  subtitle: string;
  actionLabel: string;
  onPress: () => void;
  testID: string;
  variant: 'primary' | 'secondary';
};

/** Full-screen message used when startup or a month fails to open. */
export function AppMessageScreen({
  title,
  subtitle,
  actionLabel,
  onPress,
  testID,
  variant,
}: AppMessageScreenProps) {
  const { palette } = useAppTheme();
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        styles.centered,
        styles.screenPadding,
        {
          backgroundColor: palette.background,
          paddingTop: safeAreaInsets.top + 24,
          paddingBottom: safeAreaInsets.bottom + 56,
        },
      ]}
    >
      <View style={[styles.errorCard, { borderColor: palette.border }]}>
        <Text style={[styles.title, { color: palette.title }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: palette.subtitle }]}>
          {subtitle}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          testID={testID}
          onPress={onPress}
          style={({ pressed }) => [
            variant === 'primary'
              ? styles.errorPrimaryAction
              : styles.errorSecondaryAction,
            variant === 'primary'
              ? {
                  backgroundColor: palette.selectedBorder,
                  opacity: pressed ? 0.9 : 1,
                }
              : { opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Text
            style={
              variant === 'primary'
                ? styles.errorPrimaryActionText
                : [styles.errorAction, { color: palette.title }]
            }
          >
            {actionLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenPadding: {
    paddingHorizontal: 24,
  },
  errorCard: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  errorAction: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorPrimaryAction: {
    marginTop: 20,
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  errorPrimaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  errorSecondaryAction: {
    marginTop: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
});
