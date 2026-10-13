import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as IntentLauncher from "expo-intent-launcher";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";

import { Colors, Spacing } from "@/constants/theme";
import { getInstalledApps } from "@/lib/appQuery";
import {
  DEFAULT_HEADING,
  getCountdownLabel,
  getCountdownVisible,
  getHeading,
  getSelectedApps,
  getTodosVisible,
  getWebApps,
  hasPin,
  setCountdownLabel,
  setCountdownVisible,
  setHeading,
  setSelectedApps,
  setPin,
  setTodosVisible,
  setWebApps,
  verifyPin,
  type SelectedApp,
  type WebApp,
} from "@/lib/storage";
import PinPad from "@/components/PinPad";
import BrandedSwitch from "@/components/ui/BrandedSwitch";
import WebAppEditor from "@/components/settings/WebAppEditor";

const colors = Colors.dark;

interface AppInfo {
  packageName: string;
  appName: string;
}

function AppRow({
  app,
  isSelected,
  onToggle,
}: {
  app: AppInfo;
  isSelected: boolean;
  onToggle: (app: AppInfo) => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed
            ? colors.backgroundSelected
            : colors.backgroundElement,
        },
      ]}
      onPress={() => onToggle(app)}
    >
      <Text style={[styles.appName, { color: colors.text }]} numberOfLines={1}>
        {app.appName}
      </Text>
      <BrandedSwitch value={isSelected} onValueChange={() => onToggle(app)} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [pinRequired, setPinRequired] = useState<boolean | null>(null);
  const [verified, setVerified] = useState(false);
  const [pinError, setPinError] = useState("");

  const [allApps, setAllApps] = useState<AppInfo[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [showChangePin, setShowChangePin] = useState(false);
  const [changeStep, setChangeStep] = useState<"current" | "new" | "confirm">(
    "current",
  );
  const [pendingPin, setPendingPin] = useState<string | null>(null);
  const [changePinError, setChangePinError] = useState("");
  const [changePinMessage, setChangePinMessage] = useState("");

  const [countdownLabel, setCountdownLabelDraft] = useState("");
  const [countdownVisible, setCountdownVisibleState] = useState(true);
  const [todosVisible, setTodosVisibleState] = useState(true);
  const [heading, setHeadingDraft] = useState("");

  const [webApps, setWebAppsState] = useState<WebApp[]>([]);
  const [editingWebApp, setEditingWebApp] = useState<WebApp | null>(null);
  const [showWebAppEditor, setShowWebAppEditor] = useState(false);
  const [webAppEditorSession, setWebAppEditorSession] = useState(0);

  useEffect(() => {
    hasPin().then(setPinRequired);
  }, []);

  const unlocked = pinRequired === false || verified;

  useEffect(() => {
    if (!unlocked) return;
    let mounted = true;
    Promise.all([
      getInstalledApps(),
      getSelectedApps(),
      getCountdownLabel(),
      getCountdownVisible(),
      getHeading(),
      getTodosVisible(),
      getWebApps(),
    ]).then(
      (
        [
          apps,
          saved,
          label,
          visible,
          savedHeading,
          savedTodosVisible,
          savedWebApps,
        ],
      ) => {
        if (!mounted) return;
        setAllApps(apps);
        setSelected(new Set(saved.map((s) => s.packageName)));
        setCountdownLabelDraft(label);
        setCountdownVisibleState(visible);
        setHeadingDraft(savedHeading);
        setTodosVisibleState(savedTodosVisible);
        setWebAppsState(savedWebApps);
        setLoading(false);
      },
    );
    return () => {
      mounted = false;
    };
  }, [unlocked]);

  const handlePinSubmit = useCallback(async (pin: string) => {
    const ok = await verifyPin(pin);
    if (ok) {
      setVerified(true);
      setPinError("");
    } else {
      setPinError("Incorrect PIN");
    }
  }, []);

  const toggleApp = useCallback((app: AppInfo) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(app.packageName)) {
        next.delete(app.packageName);
      } else {
        next.add(app.packageName);
      }
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    const selectedApps: SelectedApp[] = allApps
      .filter((app) => selected.has(app.packageName))
      .map((app) => ({ packageName: app.packageName, appName: app.appName }));
    await setSelectedApps(selectedApps);
    router.back();
  }, [allApps, selected]);

  const openChangePin = useCallback(() => {
    setChangeStep("current");
    setPendingPin(null);
    setChangePinError("");
    setChangePinMessage("");
    setShowChangePin(true);
  }, []);

  const openSetPin = useCallback(() => {
    setChangeStep("new");
    setPendingPin(null);
    setChangePinError("");
    setChangePinMessage("");
    setShowChangePin(true);
  }, []);

  const handleChangePinSubmit = useCallback(
    async (pin: string) => {
      if (changeStep === "current") {
        if (await verifyPin(pin)) {
          setChangeStep("new");
          setChangePinError("");
        } else {
          setChangePinError("Incorrect PIN");
        }
        return;
      }

      if (changeStep === "new") {
        setPendingPin(pin);
        setChangeStep("confirm");
        setChangePinError("");
        return;
      }

      if (pendingPin === pin) {
        await setPin(pin);
        setShowChangePin(false);
        setPendingPin(null);
        setPinRequired(true);
        setChangePinMessage("PIN updated");
      } else {
        setPendingPin(null);
        setChangeStep("new");
        setChangePinError("PINs do not match. Try again.");
      }
    },
    [changeStep, pendingPin],
  );

  const handleCountdownLabelChange = useCallback((value: string) => {
    setCountdownLabelDraft(value);
    setCountdownLabel(value);
  }, []);

  const handleHeadingChange = useCallback((value: string) => {
    setHeadingDraft(value);
    setHeading(value);
  }, []);

  const handleTodosVisibleChange = useCallback((value: boolean) => {
    setTodosVisibleState(value);
    setTodosVisible(value);
  }, []);

  const handleCountdownVisibleChange = useCallback((value: boolean) => {
    setCountdownVisibleState(value);
    setCountdownVisible(value);
  }, []);

  const openWebAppEditor = useCallback((webApp: WebApp | null) => {
    setEditingWebApp(webApp);
    setWebAppEditorSession((session) => session + 1);
    setShowWebAppEditor(true);
  }, []);

  const handleWebAppSave = useCallback(
    (webApp: WebApp) => {
      const next = editingWebApp
        ? webApps.map((w) => (w.id === editingWebApp.id ? webApp : w))
        : [...webApps, webApp];
      setWebAppsState(next);
      setWebApps(next);
      setShowWebAppEditor(false);
    },
    [editingWebApp, webApps],
  );

  const handleWebAppDelete = useCallback(
    (webApp: WebApp) => {
      Alert.alert(
        "Delete web app",
        `Remove "${webApp.name}" from the home screen?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              const next = webApps.filter((w) => w.id !== webApp.id);
              setWebAppsState(next);
              setWebApps(next);
            },
          },
        ],
      );
    },
    [webApps],
  );

  if (pinRequired === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (pinRequired && !verified) {
    return (
      <PinPad
        title="Enter PIN"
        subtitle="Settings are PIN-protected"
        onSubmit={handlePinSubmit}
        error={pinError}
      />
    );
  }

  const changePinTitle =
    changeStep === "current"
      ? "Enter current PIN"
      : changeStep === "new"
        ? pinRequired
          ? "Create new PIN"
          : "Set a PIN"
        : "Confirm new PIN";
  const changePinSubtitle =
    changeStep === "current"
      ? "Verify your current PIN to change it"
      : changeStep === "new"
        ? "Set a 4-digit PIN to protect settings"
        : "Re-enter your new PIN";

  const header = (
    <>
      <View>
        <Pressable
          style={({ pressed }) => [
            styles.defaultLauncherButton,
            {
              backgroundColor: pressed
                ? colors.backgroundSelected
                : colors.backgroundElement,
            },
          ]}
          onPress={() => {
            IntentLauncher.startActivityAsync(
              IntentLauncher.ActivityAction.HOME_SETTINGS,
            ).catch(() => {});
          }}
        >
          <Text style={[styles.defaultLauncherText, { color: colors.text }]}>
            Set as default launcher
          </Text>
        </Pressable>

        {pinRequired ? (
          <Pressable
            style={({ pressed }) => [
              styles.defaultLauncherButton,
              {
                backgroundColor: pressed
                  ? colors.backgroundSelected
                  : colors.backgroundElement,
              },
            ]}
            onPress={openChangePin}
          >
            <Text style={[styles.defaultLauncherText, { color: colors.text }]}>
              Change PIN
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.defaultLauncherButton,
              {
                backgroundColor: pressed
                  ? colors.backgroundSelected
                  : colors.backgroundElement,
              },
            ]}
            onPress={openSetPin}
          >
            <Text style={[styles.defaultLauncherText, { color: colors.text }]}>
              Set PIN
            </Text>
          </Pressable>
        )}

        <View
          style={[
            styles.settingsCard,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Text style={[styles.settingsCardTitle, { color: colors.text }]}>
            Home screen
          </Text>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Header text
          </Text>
          <TextInput
            style={[
              styles.textField,
              {
                color: colors.text,
                backgroundColor: colors.background,
                borderColor: colors.backgroundSelected,
              },
            ]}
            value={heading}
            onChangeText={handleHeadingChange}
            placeholder={DEFAULT_HEADING}
            placeholderTextColor={colors.textSecondary}
            maxLength={24}
            returnKeyType="done"
          />

          <View style={styles.toggleRow}>
            <Text style={[styles.toggleText, { color: colors.text }]}>
              Show countdown
            </Text>
            <BrandedSwitch
              value={countdownVisible}
              onValueChange={handleCountdownVisibleChange}
            />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Countdown label
          </Text>
          <TextInput
            style={[
              styles.textField,
              {
                color: colors.text,
                backgroundColor: colors.background,
                borderColor: colors.backgroundSelected,
              },
            ]}
            value={countdownLabel}
            onChangeText={handleCountdownLabelChange}
            placeholder="Label (e.g. Exam countdown)"
            placeholderTextColor={colors.textSecondary}
            maxLength={32}
            returnKeyType="done"
          />

          <View style={[styles.toggleRow, styles.toggleRowLast]}>
            <Text style={[styles.toggleText, { color: colors.text }]}>
              Show todo list
            </Text>
            <BrandedSwitch
              value={todosVisible}
              onValueChange={handleTodosVisibleChange}
            />
          </View>
        </View>

        <View
          style={[
            styles.settingsCard,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Text style={[styles.settingsCardTitle, { color: colors.text }]}>
            Web apps
          </Text>
          {webApps.map((webApp) => (
            <View key={webApp.id} style={styles.webAppRow}>
              <Pressable
                style={styles.webAppRowMain}
                onPress={() => openWebAppEditor(webApp)}
              >
                <Text
                  style={[styles.webAppName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {webApp.name}
                </Text>
                <Text
                  style={[styles.webAppUrl, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {webApp.url}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleWebAppDelete(webApp)}
                hitSlop={8}
              >
                <SymbolView
                  tintColor={"#9A9A9A"}
                  name={{ android: "close", ios: "xmark" }}
                />
              </Pressable>
            </View>
          ))}
          {webApps.length === 0 ? (
            <Text
              style={[styles.webAppEmpty, { color: colors.textSecondary }]}
            >
              No web apps yet.
            </Text>
          ) : null}
          <Pressable
            style={({ pressed }) => [
              styles.addWebAppButton,
              {
                backgroundColor: pressed
                  ? colors.backgroundSelected
                  : colors.background,
              },
            ]}
            onPress={() => openWebAppEditor(null)}
          >
            <Text style={[styles.addWebAppText, { color: colors.text }]}>
              Add web app
            </Text>
          </Pressable>
        </View>

        {changePinMessage ? (
          <Text style={[styles.pinMessage, { color: "#34C759" }]}>
            {changePinMessage}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        Select Apps
      </Text>
    </>
  );
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Settings
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: pressed
                  ? colors.backgroundSelected
                  : colors.backgroundElement,
              },
            ]}
            onPress={save}
          >
            <Text style={[styles.saveText, { color: colors.text }]}>Save</Text>
          </Pressable>
        </View>
        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.text} />
        ) : (
          <FlatList
            data={allApps}
            keyExtractor={(item) => item.packageName}
            renderItem={({ item }) => (
              <AppRow
                app={item}
                isSelected={selected.has(item.packageName)}
                onToggle={toggleApp}
              />
            )}
            ListHeaderComponent={header}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}

        <WebAppEditor
          key={webAppEditorSession}
          visible={showWebAppEditor}
          initial={editingWebApp}
          onClose={() => setShowWebAppEditor(false)}
          onSave={handleWebAppSave}
        />

      <Modal
        visible={showChangePin}
        animationType="fade"
        onRequestClose={() => setShowChangePin(false)}
      >
        <PinPad
          title={changePinTitle}
          subtitle={changePinSubtitle}
          onSubmit={handleChangePinSubmit}
          error={changePinError}
        />
        <Pressable
          style={styles.cancelChangePin}
          onPress={() => setShowChangePin(false)}
        >
          <Text
            style={[
              styles.cancelChangePinText,
              { color: colors.textSecondary },
            ]}
          >
            Cancel
          </Text>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  saveButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loader: {
    marginTop: Spacing.six,
  },
  settings: {
    paddingHorizontal: Spacing.four,
  },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  defaultLauncherButton: {
    borderRadius: 12,
    padding: Spacing.three,
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  defaultLauncherText: {
    fontSize: 15,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  appName: {
    fontSize: 15,
    flex: 1,
    marginRight: Spacing.three,
  },
  pinMessage: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.three,
    textAlign: "center",
  },
  cancelChangePin: {
    position: "absolute",
    bottom: Spacing.six,
    alignSelf: "center",
    padding: Spacing.three,
  },
  cancelChangePinText: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingsCard: {
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  settingsCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.three,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.two,
  },
  textField: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: Spacing.three,
  },
  toggleRowLast: {
    marginBottom: 0,
  },
  toggleText: {
    fontSize: 15,
  },
  webAppRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  webAppRowMain: {
    flex: 1,
    marginRight: Spacing.three,
  },
  webAppName: {
    fontSize: 15,
    fontWeight: "500",
  },
  webAppUrl: {
    fontSize: 12,
    marginTop: 2,
  },
  webAppEmpty: {
    fontSize: 14,
    marginBottom: Spacing.three,
  },
  addWebAppButton: {
    borderRadius: 10,
    paddingVertical: Spacing.two + Spacing.half,
    alignItems: "center",
    marginTop: Spacing.one,
  },
  addWebAppText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
