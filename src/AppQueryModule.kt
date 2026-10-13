package com.samcodee.launcherd

import android.content.pm.PackageManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.records.Field

class AppInfoRecord : Record {
  @Field
  var packageName: String = ""

  @Field
  var appName: String = ""
}

class AppQueryModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AppQueryModule")

    AsyncFunction("getInstalledApps") {
      val context = appContext.reactContext ?: return@AsyncFunction emptyList<AppInfoRecord>()
      val pm = context.packageManager
      val selfPackage = context.packageName
      val packages = pm.getInstalledApplications(PackageManager.GET_META_DATA)

      packages
        .filter { appInfo ->
          appInfo.packageName != selfPackage &&
            pm.getLaunchIntentForPackage(appInfo.packageName) != null
        }
        .sortedBy { pm.getApplicationLabel(it).toString().lowercase() }
        .map { appInfo ->
          AppInfoRecord().apply {
            packageName = appInfo.packageName
            appName = pm.getApplicationLabel(appInfo).toString()
          }
        }
    }
  }
}
