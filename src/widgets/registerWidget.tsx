import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { CalendarWidgetLayout } from './CalendarWidgetLayout';
import { fetchTodayWidgetData } from './widgetData';

export async function updateCalendarWidget(): Promise<void> {
  try {
    await requestWidgetUpdate({
      widgetName: 'CalendarAppWidgetProvider',
      renderWidget: async () => {
        const data = await fetchTodayWidgetData();
        return <CalendarWidgetLayout data={data} />;
      },
    });
  } catch {
    // Widget may not be added to home screen yet
  }
}
