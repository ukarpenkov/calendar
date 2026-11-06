import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { CalendarPalette } from '../../../entities/calendar';
import { styles } from './importEntryStyles';

type ImportStepperProps = {
  currentIndex: number;
  labels: [string, string, string];
  palette: CalendarPalette;
};

export function ImportStepper({ currentIndex, labels, palette }: ImportStepperProps) {
  return (
    <View style={styles.stepperRow}>
      {labels.map((label, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        const circleStyle = isComplete
          ? { backgroundColor: palette.selectedBorder, borderColor: palette.selectedBorder }
          : isCurrent
            ? { backgroundColor: palette.surface, borderColor: palette.selectedBorder }
            : { backgroundColor: palette.surfaceMuted, borderColor: palette.border };

        const textColor = isComplete || isCurrent ? palette.title : palette.subtitle;

        const digitTextStyle = [
          styles.stepperCircleText,
          { color: isComplete ? '#FFFFFF' : textColor },
        ];

        return (
          <View key={label} style={styles.stepperSegment}>
            <View style={styles.stepperNode}>
              <View style={[styles.stepperCircle, circleStyle]}>
                <Text style={digitTextStyle}>
                  {isComplete ? '✓' : index + 1}
                </Text>
              </View>
              <Text style={[styles.stepperLabel, { color: textColor }]} numberOfLines={2}>
                {label}
              </Text>
            </View>
            {index < labels.length - 1 ? (
              <View
                style={[
                  styles.stepperConnector,
                  {
                    backgroundColor:
                      index < currentIndex ? palette.selectedBorder : palette.border,
                  },
                ]}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

type CenteredStateProps = {
  palette: CalendarPalette;
  bottomInset: number;
  headline: string;
  supporting: string;
  showSpinner: boolean;
};

export function CenteredState({
  palette,
  bottomInset,
  headline,
  supporting,
  showSpinner,
}: CenteredStateProps) {
  return (
    <View style={[styles.centeredWrap, { paddingBottom: bottomInset }]}>
      {showSpinner ? (
        <ActivityIndicator size="large" color={palette.selectedBorder} />
      ) : null}
      <Text style={[styles.centeredHeadline, { color: palette.title }]}>{headline}</Text>
      <Text style={[styles.centeredSupporting, { color: palette.subtitle }]}>
        {supporting}
      </Text>
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled: boolean;
  isBusy?: boolean;
  palette: CalendarPalette;
  variant?: 'default' | 'danger';
};

export function ActionButton({
  label,
  onPress,
  disabled,
  isBusy = false,
  palette,
  variant = 'default',
}: ActionButtonProps) {
  const backgroundColor =
    variant === 'danger' ? palette.holidayBorder : palette.selectedBorder;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || isBusy}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor,
          opacity: disabled || isBusy ? 0.7 : pressed ? 0.9 : 1,
        },
      ]}
    >
      {isBusy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.actionButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}

type GhostButtonProps = {
  label: string;
  onPress: () => void;
  palette: CalendarPalette;
};

export function GhostButton({ label, onPress, palette }: GhostButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.ghostButton,
        {
          borderColor: palette.border,
          backgroundColor: palette.surface,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.ghostButtonText, { color: palette.title }]}>{label}</Text>
    </Pressable>
  );
}

export function InfoRow({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: CalendarPalette;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: palette.subtitle }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: palette.title }]}>{value}</Text>
    </View>
  );
}

