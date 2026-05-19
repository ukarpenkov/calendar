package com.prodyk.calendar

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Fires once per scheduled window after local midnight: redraw widget and schedule the next day.
 */
class CalendarWidgetAlarmReceiver : BroadcastReceiver() {

  override fun onReceive(context: Context, intent: Intent?) {
    if (intent?.action != CalendarWidgetAlarmScheduler.ACTION_WIDGET_MIDNIGHT_REFRESH) {
      return
    }
    CalendarWidgetAlarmScheduler.requestWidgetRefresh(context.applicationContext)
    CalendarWidgetAlarmScheduler.scheduleNextMidnight(context.applicationContext)
  }
}
