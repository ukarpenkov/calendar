/**
 * @format
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { VacationPeriod } from '../../../features/vacation/model';
import type { AppLanguage } from '../../../shared/lib/i18n';

export type VacationPeriodCardProps = {
  period: VacationPeriod;
  workDays: number;
  totalDays: number;
  onPress: (period: VacationPeriod) => void;
  language: AppLanguage;
};

function formatDate(date: string, language: AppLanguage): string {
  const [y, m, d] = date.split('-');
  if (language === 'ja') {
    return `${y}年${m}月${d}日`;
  }
  return `${d}.${m}.${y}`;
}

export function VacationPeriodCard({
  period,
  workDays,
  totalDays,
  onPress,
  language,
}: VacationPeriodCardProps) {
  const start = formatDate(period.startDate, language);
  const end = formatDate(period.endDate, language);

  return (
    <Pressable
      style={[
        styles.card,
        { borderLeftColor: period.color },
      ]}
      onPress={() => onPress(period)}
    >
      <Text style={styles.dates}>
        {start} — {end}
      </Text>
      <Text style={styles.summary}>
        {workDays} / {totalDays}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  dates: {
    fontSize: 15,
    fontWeight: '600',
  },
  summary: {
    fontSize: 13,
  },
});
