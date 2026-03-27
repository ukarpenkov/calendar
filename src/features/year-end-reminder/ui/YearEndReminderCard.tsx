import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CalendarPalette } from '../../../entities/calendar';
import { TelegramIcon } from '../../../shared/ui/icons/NavigationIcons';

type YearEndReminderCardProps = {
  palette: CalendarPalette;
  title: string;
  body: string;
  actionLabel: string;
  linkLabel: string;
  onPress: () => void;
};

export function YearEndReminderCard({
  palette,
  title,
  body,
  actionLabel,
  linkLabel,
  onPress,
}: YearEndReminderCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.selectedFill,
          borderColor: palette.selectedBorder,
        },
      ]}
    >
      <View style={styles.titleRow}>
        <TelegramIcon color={palette.selectedBorder} size={18} />
        <Text style={[styles.title, { color: palette.title }]}>{title}</Text>
      </View>
      <Text style={[styles.body, { color: palette.subtitle }]}>{body}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.actionButton,
          {
            backgroundColor: palette.selectedBorder,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <TelegramIcon color={palette.surface} size={16} />
        <Text style={[styles.actionLabel, { color: palette.surface }]}>
          {actionLabel}
        </Text>
      </Pressable>
      <Text style={[styles.linkLabel, { color: palette.selectedBorder }]}>
        {linkLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  linkLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
