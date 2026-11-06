import { memo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { CalendarImageWarmup } from '../../entities/calendar/ui/CalendarImageWarmup';
import { ImportEntryScreen } from '../../pages/import-entry/ui/ImportEntryScreen';
import { getMonthDetailLayoutMetrics } from '../../pages/month/ui/monthDetailLayout';
import { MonthDetailScreen } from '../../pages/month/ui/MonthDetailScreen';
import { SettingsScreen } from '../../pages/settings/ui/SettingsScreen';
import { VacationForm, VacationScreen } from '../../pages/vacation/ui';
import { YearHomeScreen } from '../../pages/year/ui/YearHomeScreen';
import { ScreenLayer } from '../../shared/ui/ScreenLayer';
import { SettingsLayer } from '../../shared/ui/SettingsLayer';
import type { CalendarSession } from '../model/useCalendarSession';

const MemoizedYearHomeScreen = memo(YearHomeScreen);

type ReadySession = CalendarSession & {
  status: Extract<CalendarSession['status'], { kind: 'ready' }>;
};

/** Stacks year, month, settings, import, and vacation. The year stays mounted underneath. */
export function AppReadyLayers({ session }: { session: ReadySession }) {
  const { width, height } = useWindowDimensions();
  const {
    palette,
    language,
    status,
    calendarYearView,
    vacationPeriods,
    preparedMonth,
    monthOrigin,
    closingSettings,
    showVacationForm,
    editingPeriod,
    jsonImportSavedRevision,
    settingsReturnScreen,
    finishClosingSettings,
    goToMonth,
    closeMonth,
    openSettings,
    openVacation,
    prepareMonth,
    closeSettings,
    openImportEntry,
    closeImportEntry,
    selectUserJsonImportCalendar,
    completeImportEntry,
    onVacationAdd,
    onVacationEdit,
    onVacationSave,
    onVacationDelete,
    onVacationFormCancel,
  } = session;

  const screen = status.screen.name;
  const showingSettings = screen === 'settings' || screen === 'import-entry';
  const monthVisible = screen === 'month';
  const settingsMonth =
    showingSettings && settingsReturnScreen.current.name === 'month'
      ? settingsReturnScreen.current.month
      : null;
  const yearCovered = screen !== 'year';
  const monthLayoutMetrics = getMonthDetailLayoutMetrics(width, height);

  return (
    <View style={styles.layerStack}>
      {calendarYearView ? (
        <CalendarImageWarmup
          sources={calendarYearView.monthImageSources}
          width={
            monthLayoutMetrics.layout === 'split'
              ? monthLayoutMetrics.sideColumnWidth
              : monthLayoutMetrics.calendarColumnWidth
          }
          paused={screen !== 'year'}
        />
      ) : null}
      <View
        testID="year-layer"
        collapsable={false}
        style={styles.yearLayer}
        pointerEvents={yearCovered ? 'none' : 'auto'}
        accessibilityElementsHidden={yearCovered}
        importantForAccessibility={yearCovered ? 'no-hide-descendants' : 'auto'}
      >
        <MemoizedYearHomeScreen
          calendar={status.calendar}
          monthSummaries={calendarYearView?.monthSummaries ?? []}
          vacationPeriods={vacationPeriods}
          onPrepareMonth={prepareMonth}
          onOpenMonth={goToMonth}
          onOpenSettings={openSettings}
          onOpenVacation={openVacation}
        />
      </View>
      {preparedMonth !== null && calendarYearView ? (
        <MonthDetailScreen
          monthDetails={calendarYearView.monthDetails}
          month={
            status.screen.name === 'month'
              ? status.screen.month
              : settingsMonth ?? preparedMonth
          }
          visible={monthVisible || settingsMonth !== null}
          covered={settingsMonth !== null}
          onBack={closeMonth}
          onOpenSettings={openSettings}
          onMonthChange={goToMonth}
          originLayout={monthOrigin}
          vacationPeriods={vacationPeriods}
        />
      ) : null}
      {showingSettings ? (
        <SettingsLayer
          backgroundColor={palette.background}
          closing={closingSettings}
          covered={screen === 'import-entry'}
          onClosed={finishClosingSettings}
        >
          <SettingsScreen
            activeYear={status.calendar.year}
            activeCalendarSource={status.activeCalendarSource}
            jsonImportSavedRevision={jsonImportSavedRevision}
            onBack={closeSettings}
            onOpenImportEntry={openImportEntry}
            onSelectUserJsonImport={selectUserJsonImportCalendar}
          />
        </SettingsLayer>
      ) : null}
      {screen === 'import-entry' ? (
        <ScreenLayer key="import" backgroundColor={palette.background}>
          <ImportEntryScreen
            activeYear={status.calendar.year}
            onBack={closeImportEntry}
            onImportCompleted={completeImportEntry}
          />
        </ScreenLayer>
      ) : null}
      {screen === 'vacation' ? (
        <ScreenLayer
          key="vacation"
          backgroundColor={palette.background}
          covered={showVacationForm}
        >
          <VacationScreen
            year={status.calendar.year}
            calendarDays={status.calendar.days}
            vacationPeriods={vacationPeriods}
            palette={palette}
            language={language}
            onBack={closeMonth}
            onAdd={onVacationAdd}
            onEdit={onVacationEdit}
          />
        </ScreenLayer>
      ) : null}
      {screen === 'vacation' && showVacationForm ? (
        <ScreenLayer
          key="vacation-form"
          backgroundColor={palette.background}
          variant="form"
        >
          <VacationForm
            key={status.calendar.year}
            year={status.calendar.year}
            initialPeriod={editingPeriod ?? undefined}
            vacationPeriods={vacationPeriods}
            calendarDays={status.calendar.days}
            palette={palette}
            language={language}
            onSave={onVacationSave}
            onDelete={editingPeriod ? onVacationDelete : undefined}
            onCancel={onVacationFormCancel}
          />
        </ScreenLayer>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  layerStack: {
    flex: 1,
  },
  yearLayer: {
    flex: 1,
  },
});
