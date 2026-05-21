package com.prodyk.calendar

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.os.Build
import android.os.Bundle

/**
 * Invisible intermediary: Launcher static shortcut invokes this Activity, which opens the
 * system [AppWidgetManager.requestPinAppWidget] dialog for our home-screen widget (API 26+).
 */
class WidgetPinLauncherActivity : Activity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val mgr = AppWidgetManager.getInstance(this)
      val provider = ComponentName(this, CalendarAppWidgetProvider::class.java)
      if (mgr.isRequestPinAppWidgetSupported) {
        mgr.requestPinAppWidget(provider, null, null)
      }
    }
    finish()
  }
}
