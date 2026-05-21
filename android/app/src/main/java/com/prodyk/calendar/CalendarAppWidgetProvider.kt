package com.prodyk.calendar

import android.appwidget.AppWidgetManager
import android.content.Context
import com.reactnativeandroidwidget.RNWidgetProvider

/**
 * Schedules the post-midnight refresh whenever widget instances are updated —
 * including the first placement on the home screen, even if the user has not
 * opened the app yet (MainApplication would not run in that case).
 */
class CalendarAppWidgetProvider : RNWidgetProvider() {

  override fun onEnabled(context: Context) {
    CalendarWidgetAlarmScheduler.scheduleNextMidnight(context.applicationContext)
    super.onEnabled(context)
  }

  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray,
  ) {
    CalendarWidgetAlarmScheduler.scheduleNextMidnight(context.applicationContext)
    super.onUpdate(context, appWidgetManager, appWidgetIds)
  }
}
