import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

const PIN_KEY = 'launcher_pin'
const SELECTED_APPS_KEY = 'launcher_selected_apps'
const TODOS_KEY = 'launcher_todos'
const COUNTDOWN_KEY = 'launcher_countdown'
const COUNTDOWN_LABEL_KEY = 'launcher_countdown_label'
const COUNTDOWN_VISIBLE_KEY = 'launcher_countdown_visible'
const TODOS_VISIBLE_KEY = 'launcher_todos_visible'
const HEADING_KEY = 'launcher_heading'
const ONBOARDED_KEY = 'launcher_onboarded'
const WEB_APPS_KEY = 'launcher_web_apps'

export const DEFAULT_COUNTDOWN_LABEL = 'Countdown'
export const DEFAULT_HEADING = 'S T U D Y'

export async function hasPin(): Promise<boolean> {
  const pin = await SecureStore.getItemAsync(PIN_KEY)
  return pin !== null
}

export async function setPin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(PIN_KEY, pin)
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_KEY)
  return stored === pin
}

export interface SelectedApp {
  packageName: string
  appName: string
}

export async function getSelectedApps(): Promise<SelectedApp[]> {
  const raw = await AsyncStorage.getItem(SELECTED_APPS_KEY)
  if (!raw) return []
  return JSON.parse(raw) as SelectedApp[]
}

export async function setSelectedApps(apps: SelectedApp[]): Promise<void> {
  await AsyncStorage.setItem(SELECTED_APPS_KEY, JSON.stringify(apps))
}

export interface WebApp {
  id: string
  name: string
  url: string
  incognito: boolean
  restrictDomain: boolean
  patterns: string[]
}

export async function getWebApps(): Promise<WebApp[]> {
  const raw = await AsyncStorage.getItem(WEB_APPS_KEY)
  if (!raw) return []
  return JSON.parse(raw) as WebApp[]
}

export async function setWebApps(webApps: WebApp[]): Promise<void> {
  await AsyncStorage.setItem(WEB_APPS_KEY, JSON.stringify(webApps))
}

export interface Todo {
  id: string
  text: string
  done: boolean
  createdAt: number
}

export async function getTodos(): Promise<Todo[]> {
  const raw = await AsyncStorage.getItem(TODOS_KEY)
  if (!raw) return []
  return JSON.parse(raw) as Todo[]
}

export async function setTodos(todos: Todo[]): Promise<void> {
  await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(todos))
}

export async function getTodosVisible(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(TODOS_VISIBLE_KEY)
  return raw === null ? true : raw === 'true'
}

export async function setTodosVisible(visible: boolean): Promise<void> {
  await AsyncStorage.setItem(TODOS_VISIBLE_KEY, String(visible))
}

export async function getCountdown(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(COUNTDOWN_KEY)
  if (!raw) return null
  const timestamp = Number(raw)
  return Number.isFinite(timestamp) ? timestamp : null
}

export async function setCountdown(timestamp: number): Promise<void> {
  await AsyncStorage.setItem(COUNTDOWN_KEY, String(timestamp))
}

export async function clearCountdown(): Promise<void> {
  await AsyncStorage.removeItem(COUNTDOWN_KEY)
}

export async function getCountdownLabel(): Promise<string> {
  const raw = await AsyncStorage.getItem(COUNTDOWN_LABEL_KEY)
  return raw && raw.trim() ? raw : DEFAULT_COUNTDOWN_LABEL
}

export async function setCountdownLabel(label: string): Promise<void> {
  const trimmed = label.trim()
  if (trimmed) {
    await AsyncStorage.setItem(COUNTDOWN_LABEL_KEY, trimmed)
  } else {
    await AsyncStorage.removeItem(COUNTDOWN_LABEL_KEY)
  }
}

export async function getCountdownVisible(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(COUNTDOWN_VISIBLE_KEY)
  return raw === null ? true : raw === 'true'
}

export async function setCountdownVisible(visible: boolean): Promise<void> {
  await AsyncStorage.setItem(COUNTDOWN_VISIBLE_KEY, String(visible))
}

export async function getHeading(): Promise<string> {
  const raw = await AsyncStorage.getItem(HEADING_KEY)
  return raw && raw.trim() ? raw : DEFAULT_HEADING
}

export async function setHeading(heading: string): Promise<void> {
  const trimmed = heading.trim()
  if (trimmed) {
    await AsyncStorage.setItem(HEADING_KEY, trimmed)
  } else {
    await AsyncStorage.removeItem(HEADING_KEY)
  }
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDED_KEY)) === 'true'
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDED_KEY, 'true')
}
