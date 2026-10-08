/**
 * @format
 */

import React, { useMemo, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CalendarDay, CalendarPalette } from '../../../entities/calendar';
import type { VacationPeriod } from '../../../features/vacation/model';
import { getVacationDaysInRange } from '../../../features/vacation/lib';
import type { AppLanguage } from '../../../shared/lib/i18n';
import { getTranslation } from '../../../shared/lib/i18n';
import { layout } from '../../../shared/lib/ui/layout';
import { IconCircleButton } from '../../../shared/ui/IconCircleButton';
import { ArrowBackIcon, CalendarIcon } from '../../../shared/ui/icons/NavigationIcons';
import { VacationDatePicker } from './VacationDatePicker';

export type VacationFormProps = {
  year: number;
  initialPeriod?: VacationPeriod;
  calendarDays: CalendarDay[];
  palette: CalendarPalette;
  language: AppLanguage;
  onSave: (startDate: string, endDate: string, color: string) => void;
  onDelete?: () => void;
  onCancel: () => void;
};

const COLOR_PRESETS = [
  { hex: '#2DD4BF', name: 'Teal' },
  { hex: '#3B82F6', name: 'Blue' },
  { hex: '#8B5CF6', name: 'Purple' },
  { hex: '#F97316', name: 'Orange' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#22C55E', name: 'Green' },
];

function daysBetweenDates(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

function addDaysToDate(startIso: string, days: number): string {
  const date = new Date(startIso);
  date.setUTCDate(date.getUTCDate() + days - 1);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMaxDaysFromStart(startIso: string, year: number): number {
  const endOfYear = `${year}-12-31`;
  return daysBetweenDates(startIso, endOfYear);
}

function isoToDisplayDate(iso: string): string {
  if (!iso) {
    return '';
  }
  const [_y, m, d] = iso.split('-');
  return `${d}.${m}`;
}

export function VacationForm({
  year,
  initialPeriod,
  calendarDays,
  palette,
  language,
  onSave,
  onDelete,
  onCancel,
}: VacationFormProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const isEditing = initialPeriod !== undefined;

  const t = (key: Parameters<typeof getTranslation>[1]) =>
    getTranslation(language, key);

  const [startIso, setStartIso] = useState<string | null>(initialPeriod?.startDate ?? null);
  const [endIso, setEndIso] = useState<string | null>(initialPeriod?.endDate ?? null);
  const [datePicker, setDatePicker] = useState<'start' | 'end' | null>(null);
  const [daysText, setDaysText] = useState(
    initialPeriod ? String(daysBetweenDates(initialPeriod.startDate, initialPeriod.endDate)) : '',
  );

  const openDatePicker = (field: 'start' | 'end') => {
    Keyboard.dismiss();
    setDatePicker(field);
  };

  const handleStartChange = (date: string) => {
    setStartIso(date);
    const parsedDays = parseInt(daysText, 10);
    if (!isNaN(parsedDays) && parsedDays > 0) {
      const clampedDays = Math.min(parsedDays, getMaxDaysFromStart(date, year));
      setEndIso(addDaysToDate(date, clampedDays));
      setDaysText(String(clampedDays));
    } else if (endIso && endIso >= date) {
      setDaysText(String(daysBetweenDates(date, endIso)));
    } else {
      setEndIso(null);
      setDaysText('');
    }
    setDatePicker(null);
  };

  const handleEndChange = (date: string) => {
    setEndIso(date);
    if (startIso) {
      setDaysText(String(daysBetweenDates(startIso, date)));
    }
    setDatePicker(null);
  };

  const handleDaysChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setDaysText(cleaned);
    const parsedDays = parseInt(cleaned, 10);
    if (!isNaN(parsedDays) && parsedDays > 0 && startIso) {
      const maxDays = getMaxDaysFromStart(startIso, year);
      const clampedDays = Math.min(parsedDays, maxDays);
      setEndIso(addDaysToDate(startIso, clampedDays));
      if (parsedDays > maxDays) {
        setDaysText(String(clampedDays));
      }
    }
  };

  const handleIncrementDay = () => {
    if (!startIso) return;
    const currentDays = parseInt(daysText, 10) || 0;
    const maxDays = getMaxDaysFromStart(startIso, year);
    if (currentDays < maxDays) {
      const newDays = currentDays + 1;
      setDaysText(String(newDays));
      setEndIso(addDaysToDate(startIso, newDays));
    }
  };
  const [selectedColor, setSelectedColor] = useState(
    initialPeriod?.color ?? '#2DD4BF',
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const rangeValid =
    startIso !== null &&
    endIso !== null &&
    endIso >= startIso &&
    startIso.startsWith(`${year}-`) &&
    endIso.startsWith(`${year}-`);

  const daysEnabled = startIso !== null;

  const bothFilled = startIso !== null && endIso !== null;
  const canSave = bothFilled && rangeValid;

  const preview = useMemo(() => {
    if (!bothFilled || !rangeValid) {
      return null;
    }
    return getVacationDaysInRange(startIso!, endIso!, calendarDays);
  }, [bothFilled, rangeValid, startIso, endIso, calendarDays]);

  const handleSave = () => {
    if (!canSave) {
      return;
    }
    onSave(startIso!, endIso!, selectedColor);
  };

  const handleConfirmDelete = () => {
    onDelete?.();
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: palette.background,
          paddingTop: safeAreaInsets.top + layout.safeAreaTopExtra,
        },
      ]}
    >
      <View style={[styles.appBar, { paddingHorizontal: layout.screenPaddingH }]}>
        <IconCircleButton
          onPress={onCancel}
          palette={palette}
          accessibilityLabel={t('common.navigateBack')}
          variant="back"
        >
          <ArrowBackIcon color={palette.icon} size={20} />
        </IconCircleButton>
        <Text style={[styles.appBarTitle, { color: palette.title }]}>
          {isEditing ? t('vacation.editTitle') : t('vacation.addTitle')}
        </Text>
        <View style={styles.appBarTrailing} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          {
            paddingHorizontal: layout.screenPaddingH,
            paddingBottom: safeAreaInsets.bottom + layout.settingsScrollBottom,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Date fields */}
        <View
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: palette.title }]}>
            {t('vacation.startDate')}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('vacation.startDate')}
            accessibilityValue={{ text: startIso ? isoToDisplayDate(startIso) : 'DD.MM' }}
            testID="vacation-start-date"
            onPress={() => openDatePicker('start')}
            style={({ pressed }) => [
              styles.input,
              {
                backgroundColor: palette.surfaceMuted,
                borderColor: palette.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.dateText, { color: startIso ? palette.title : palette.subtitle }]}>
              {startIso ? isoToDisplayDate(startIso) : 'DD.MM'}
            </Text>
            <CalendarIcon color={palette.icon} size={20} />
          </Pressable>
          <Text style={[styles.cardTitle, { color: palette.title }]}>
            {t('vacation.endDate')}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('vacation.endDate')}
            accessibilityValue={{ text: endIso ? isoToDisplayDate(endIso) : 'DD.MM' }}
            testID="vacation-end-date"
            onPress={() => openDatePicker('end')}
            style={({ pressed }) => [
              styles.input,
              {
                backgroundColor: palette.surfaceMuted,
                borderColor: palette.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.dateText, { color: endIso ? palette.title : palette.subtitle }]}>
              {endIso ? isoToDisplayDate(endIso) : 'DD.MM'}
            </Text>
            <CalendarIcon color={palette.icon} size={20} />
          </Pressable>
          <Text style={[styles.cardTitle, { color: palette.title }]}>
            Дней
          </Text>
          <View style={styles.daysRow}>
            <TextInput
              value={daysText}
              onChangeText={handleDaysChange}
              placeholder="0"
              placeholderTextColor={palette.subtitle}
              keyboardType="number-pad"
              maxLength={3}
              editable={daysEnabled}
              style={[
                styles.daysInput,
                daysEnabled ? null : styles.daysInputDisabled,
                {
                  backgroundColor: daysEnabled ? palette.surfaceMuted : palette.surface,
                  borderColor: palette.border,
                  color: daysEnabled ? palette.title : palette.subtitle,
                },
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add day"
              testID="increment-day-button"
              onPress={handleIncrementDay}
              disabled={!daysEnabled}
              style={({ pressed }) => [
                styles.addButton,
                {
                  backgroundColor: daysEnabled ? palette.selectedBorder : palette.border,
                  opacity: daysEnabled ? (pressed ? 0.8 : 1) : 0.5,
                },
              ]}
            >
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          </View>
          {bothFilled && !rangeValid ? (
            <Text style={[styles.errorText, { color: palette.holidayBorder }]}>
              End date must be after or equal to start date
            </Text>
          ) : null}
        </View>

        {/* Color picker */}
        <View
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: palette.title }]}>
            {t('vacation.color')}
          </Text>
          <View style={styles.colorRow}>
            {COLOR_PRESETS.map(preset => {
              const isSelected = selectedColor === preset.hex;
              return (
                <Pressable
                  key={preset.hex}
                  accessibilityRole="button"
                  accessibilityLabel={preset.name}
                  testID={`color-preset-${preset.hex}`}
                  onPress={() => setSelectedColor(preset.hex)}
                  style={[
                    styles.colorCircle,
                    isSelected ? styles.colorCircleSelected : styles.colorCircleIdle,
                    { backgroundColor: preset.hex },
                    isSelected ? { borderColor: palette.title } : null,
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Preview */}
        {preview ? (
          <View
            style={[
              styles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={styles.previewRow}>
              <View style={styles.previewItem}>
                <Text style={[styles.previewValue, { color: palette.title }]}>
                  {preview.workDays}
                </Text>
                <Text style={[styles.previewLabel, { color: palette.subtitle }]}>
                  {t('vacation.workDays')}
                </Text>
              </View>
              <View style={styles.previewItem}>
                <Text style={[styles.previewValue, { color: palette.title }]}>
                  {preview.totalDays}
                </Text>
                <Text style={[styles.previewLabel, { color: palette.subtitle }]}>
                  {t('vacation.totalDays')}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Save / Cancel buttons */}
        <ActionButton
          label={t('vacation.save')}
          onPress={handleSave}
          disabled={!canSave}
          palette={palette}
          variant="default"
        />

        {/* Delete (edit mode) */}
        {isEditing && onDelete ? (
          <>
            {showDeleteConfirm ? (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.holidayBorder,
                  },
                ]}
              >
                <Text style={[styles.cardTitle, { color: palette.title }]}>
                  {t('vacation.deleteConfirm')}
                </Text>
                <View style={styles.confirmRow}>
                  <ActionButton
                    label={t('common.yes')}
                    onPress={handleConfirmDelete}
                    disabled={false}
                    palette={palette}
                    variant="danger"
                  />
                  <GhostButton
                    label={t('common.no')}
                    onPress={() => setShowDeleteConfirm(false)}
                    palette={palette}
                  />
                </View>
              </View>
            ) : (
              <ActionButton
                label={t('vacation.delete')}
                onPress={() => setShowDeleteConfirm(true)}
                disabled={false}
                palette={palette}
                variant="danger"
              />
            )}
          </>
        ) : null}
      </ScrollView>
      {datePicker ? (
        <VacationDatePicker
          year={year}
          calendarDays={calendarDays}
          selectedDate={datePicker === 'start' ? startIso : endIso}
          initialDate={datePicker === 'start' ? endIso : startIso}
          minDate={datePicker === 'end' ? startIso ?? undefined : undefined}
          title={t(datePicker === 'start' ? 'vacation.startDate' : 'vacation.endDate')}
          palette={palette}
          language={language}
          onSelect={datePicker === 'start' ? handleStartChange : handleEndChange}
          onClose={() => setDatePicker(null)}
        />
      ) : null}
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled: boolean;
  palette: CalendarPalette;
  variant?: 'default' | 'danger';
};

function ActionButton({
  label,
  onPress,
  disabled,
  palette,
  variant = 'default',
}: ActionButtonProps) {
  const backgroundColor =
    variant === 'danger' ? palette.holidayBorder : palette.selectedBorder;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
      ]}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

type GhostButtonProps = {
  label: string;
  onPress: () => void;
  palette: CalendarPalette;
};

function GhostButton({ label, onPress, palette }: GhostButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
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
  scrollBody: {
    gap: layout.contentStackGap,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorCircleIdle: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderWidth: 3,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewItem: {
    alignItems: 'center',
    gap: 4,
  },
  previewValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '500',
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
  confirmRow: {
    gap: 12,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  daysInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  daysInputDisabled: {
    opacity: 0.5,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  preHolidayIcon: {
    fontSize: 20,
  },
  preHolidayText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
