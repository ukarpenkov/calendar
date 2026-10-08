import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CalendarPalette } from '../../../entities/calendar';
import { getTranslation, type AppLanguage } from '../../../shared/lib/i18n';
import { CalendarIcon } from '../../../shared/ui/icons/NavigationIcons';

type VacationConflictNoticeProps = {
  palette: CalendarPalette;
  language: AppLanguage;
  onClose: () => void;
};

export function VacationConflictNotice({
  palette,
  language,
  onClose,
}: VacationConflictNoticeProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      transparent
      visible
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View
        style={[
          styles.overlay,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
            paddingLeft: insets.left + 24,
            paddingRight: insets.right + 24,
          },
        ]}
      >
        <Pressable
          accessible={false}
          onPress={onClose}
          style={styles.backdrop}
        />
        <View
          accessibilityViewIsModal
          testID="vacation-conflict-notice"
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <ScrollView bounces={false} contentContainerStyle={styles.content}>
            <View
              style={[styles.icon, { backgroundColor: palette.vacationFill }]}
            >
              <CalendarIcon size={28} color={palette.vacationBorder} />
            </View>
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: palette.title }]}
            >
              {getTranslation(language, 'vacation.conflictTitle')}
            </Text>
            <Text style={[styles.message, { color: palette.subtitle }]}>
              {getTranslation(language, 'vacation.conflictMessage')}
            </Text>
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            testID="vacation-conflict-dismiss"
            onPress={onClose}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: palette.selectedBorder,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={styles.buttonText}>
              {getTranslation(language, 'vacation.conflictDismiss')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 24,
  },
  content: { alignItems: 'center', gap: 14 },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '600', textAlign: 'center' },
  message: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
  button: {
    minHeight: 48,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
