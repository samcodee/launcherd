import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Spacing } from "@/constants/theme";
import PinPad from "@/components/PinPad";
import IconBadge from "@/components/ui/IconBadge";
import TappableCard from "@/components/ui/TappableCard";
import { setPin } from "@/lib/storage";

const colors = Colors.dark;

const APPS_ICON = {
  ios: "square.grid.2x2",
  android: "grid_view",
  web: "grid_view",
} as const;
const WEB_ICON = {
  ios: "link",
  android: "link",
  web: "link",
} as const;
const TOOLS_ICON = {
  ios: "square.and.pencil",
  android: "edit_note",
  web: "edit_note",
} as const;
const HOME_ICON = {
  ios: "house",
  android: "home",
  web: "home",
} as const;
const PIN_ICON = {
  ios: "key",
  android: "password",
  web: "password",
} as const;
const SKIP_ICON = {
  ios: "forward.end",
  android: "skip_next",
  web: "skip_next",
} as const;

interface OnboardingFlowProps {
  onComplete: () => void;
}

/**
 * Single-page first-launch walkthrough: explains what launcherd does, then
 * ends with the choice to protect Settings with a PIN or skip for now.
 */
export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [settingPin, setSettingPin] = useState(false);
  const [pendingPin, setPendingPin] = useState<string | null>(null);
  const [pinError, setPinError] = useState("");

  const handlePinSubmit = useCallback(
    async (pin: string) => {
      if (pendingPin === null) {
        setPendingPin(pin);
        setPinError("");
        return;
      }
      if (pendingPin === pin) {
        await setPin(pin);
        onComplete();
      } else {
        setPendingPin(null);
        setPinError("PINs do not match. Try again.");
      }
    },
    [pendingPin, onComplete],
  );

  const cancelPinSetup = useCallback(() => {
    setPendingPin(null);
    setPinError("");
    setSettingPin(false);
  }, []);

  if (settingPin) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top", "bottom"]}
      >
        <PinPad
          title={pendingPin === null ? "Create PIN" : "Confirm PIN"}
          subtitle={
            pendingPin === null
              ? "You'll need this PIN to open Settings"
              : "Re-enter your PIN"
          }
          onSubmit={handlePinSubmit}
          error={pinError}
        />
        <Pressable style={styles.pinBackButton} onPress={cancelPinSetup}>
          <Text style={[styles.pinBackText, { color: colors.textSecondary }]}>
            Back to options
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("@/assets/images/icon-onboarding.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={[styles.title, { color: colors.text }]}>
          Welcome to launcherd
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          launcherd turns your phone into a distraction-free space. Your home
          screen becomes a quiet surface with just the apps you choose, a todo
          list, and a countdown to what matters. No feeds, no recommendations,
          no rabbit holes.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          How it works
        </Text>
        <FeatureRow
          icon={<IconBadge name={APPS_ICON} />}
          title="Choose your apps"
          body="Pick which installed apps show up on the home screen. Everything else stays out of sight."
        />
        <FeatureRow
          icon={<IconBadge name={WEB_ICON} />}
          title="Add web apps"
          body="Turn any website into a home-screen tile. Restrict it to its own domain so only safe links open, with an optional incognito mode."
        />
        <FeatureRow
          icon={<IconBadge name={TOOLS_ICON} />}
          title="Set up your tools"
          body="Add todos, set a countdown, and rename the header, all from Settings."
        />
        <FeatureRow
          icon={<IconBadge name={HOME_ICON} />}
          title="Make it your home"
          body="In Settings, tap &quot;Set as default launcher&quot; so launcherd takes over the home screen."
        />
        <NoteBox>
          Keep your PIN safe. There is no reset: if it&apos;s forgotten, the
          only way back into Settings is reinstalling the app, which erases
          your todos and setup.
        </NoteBox>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Protect your setup
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          Choose how Settings should be guarded. You can change this later.
        </Text>
        <ChoiceCard
          onPress={() => setSettingPin(true)}
          icon={<IconBadge name={PIN_ICON} size={40} />}
          title="Set a PIN"
          badge="Recommended"
        >
          Create a 4-digit PIN. Settings stay changeable by you alone.
        </ChoiceCard>
        <ChoiceCard
          onPress={onComplete}
          icon={<IconBadge name={SKIP_ICON} size={40} />}
          title="Skip for now"
        >
          Settings stay open on this device. You can add a PIN anytime from
          Settings.
        </ChoiceCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.featureRow}>
      {icon}
      <View style={styles.featureText}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          {body}
        </Text>
      </View>
    </View>
  );
}

function ChoiceCard({
  onPress,
  icon,
  title,
  badge,
  children,
}: {
  onPress: () => void;
  icon: React.ReactNode;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <TappableCard onPress={onPress} style={styles.choiceCard}>
      <View style={styles.choiceHeader}>
        {icon}
        <View style={styles.choiceTitleRow}>
          <Text style={[styles.choiceTitle, { color: colors.text }]}>
            {title}
          </Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
        {children}
      </Text>
    </TappableCard>
  );
}

function NoteBox({ children }: { children: React.ReactNode }) {
  return (
    <View style={[styles.noteBox, { backgroundColor: colors.backgroundElement }]}>
      <Text style={[styles.noteText, { color: colors.textSecondary }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.three,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: Spacing.two,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
  },
  logo: {
    width: 96,
    height: 110,
    alignSelf: "center",
  },
  featureRow: {
    flexDirection: "row",
    gap: Spacing.three,
    alignItems: "flex-start",
    marginTop: Spacing.one,
  },
  featureText: {
    flex: 1,
    gap: Spacing.one,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  noteBox: {
    borderRadius: 12,
    padding: Spacing.three,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  choiceCard: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  choiceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  choiceTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  choiceTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: "#34C75933",
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  badgeText: {
    color: "#34C759",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  pinBackButton: {
    position: "absolute",
    bottom: Spacing.five,
    alignSelf: "center",
    padding: Spacing.three,
  },
  pinBackText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
