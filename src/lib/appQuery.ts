import { requireNativeModule } from 'expo'
import * as IntentLauncher from 'expo-intent-launcher'

interface AppInfo {
  packageName: string
  appName: string
}

interface AppQueryModuleType {
  getInstalledApps(): Promise<AppInfo[]>
}

const AppQueryModule = requireNativeModule<AppQueryModuleType>('AppQueryModule')

export async function getInstalledApps(): Promise<AppInfo[]> {
  return AppQueryModule.getInstalledApps()
}

export async function getApplicationIcon(
  packageName: string,
): Promise<string | undefined> {
  try {
    return await IntentLauncher.getApplicationIconAsync(packageName)
  } catch {
    return undefined
  }
}
