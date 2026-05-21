package com.prodyk.calendar

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * After reboot or timezone change, reschedule the midnight alarm and refresh the widget so
 * "today" matches the device calendar.
 */
class CalendarWidgetBootstrapReceiver : BroadcastReceiver() {

  override fun onReceive(context: Context, intent: Intent?) {
    when (intent?.action) {
      Intent.ACTION_BOOT_COMPLETED,
      Intent.ACTION_TIME_CHANGED,
      Intent.ACTION_TIMEZONE_CHANGED -> {
        val appContext = context.applicationContext
        CalendarWidgetAlarmScheduler.scheduleNextMidnight(appContext)
        CalendarWidgetAlarmScheduler.requestWidgetRefresh(appContext)
      }
    }
  }
}
