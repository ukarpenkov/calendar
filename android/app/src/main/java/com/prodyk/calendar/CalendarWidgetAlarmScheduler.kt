package com.prodyk.calendar

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import com.reactnativeandroidwidget.RNWidgetProvider
import java.util.Calendar

/**
 * Schedules a daily wake shortly after local midnight so the home-screen widget
 * reloads "today" without opening the app. Also exposes [requestWidgetRefresh] for
 * boot/timezone handling.
 */
object CalendarWidgetAlarmScheduler {

  private const val REQUEST_CODE_MIDNIGHT_REFRESH = 0x6361_6c65 // "cale"

  /** Not exported; only used from [PendingIntent] inside this package. */
  const val ACTION_WIDGET_MIDNIGHT_REFRESH: String =
    "com.prodyk.calendar.action.WIDGET_MIDNIGHT_REFRESH"

  fun scheduleNextMidnight(context: Context) {
    val appContext = context.applicationContext
    val alarmManager = appContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val pendingIntent = buildMidnightPendingIntent(appContext)

    alarmManager.cancel(pendingIntent)

    val triggerAtMillis = nextLocalMidnightAfterNowMillis()

    // Avoid SCHEDULE_EXACT_ALARM: small window after midnight is enough for the calendar day flip.
    alarmManager.setWindow(
      AlarmManager.RTC_WAKEUP,
      triggerAtMillis,
      60_000L,
      pendingIntent,
    )
  }

  fun requestWidgetRefresh(context: Context) {
    val appContext = context.applicationContext
    val appWidgetManager = AppWidgetManager.getInstance(appContext)
    val componentName = ComponentName(appContext, RNWidgetProvider::class.java)
    val ids = appWidgetManager.getAppWidgetIds(componentName)
    if (ids.isEmpty()) {
      return
    }
    val intent =
      Intent(appContext, RNWidgetProvider::class.java).apply {
        action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
      }
    appContext.sendBroadcast(intent)
  }

  private fun buildMidnightPendingIntent(context: Context): PendingIntent {
    val intent =
      Intent(context, CalendarWidgetAlarmReceiver::class.java).apply {
        action = ACTION_WIDGET_MIDNIGHT_REFRESH
      }
    val flags =
      PendingIntent.FLAG_UPDATE_CURRENT or
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
          PendingIntent.FLAG_IMMUTABLE
        } else {
          0
        }
    return PendingIntent.getBroadcast(context, REQUEST_CODE_MIDNIGHT_REFRESH, intent, flags)
  }

  private fun nextLocalMidnightAfterNowMillis(): Long {
    val cal =
      Calendar.getInstance().apply {
        set(Calendar.HOUR_OF_DAY, 0)
        set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 5)
        set(Calendar.MILLISECOND, 0)
      }
    if (cal.timeInMillis <= System.currentTimeMillis()) {
      cal.add(Calendar.DAY_OF_YEAR, 1)
    }
    return cal.timeInMillis
  }
}
