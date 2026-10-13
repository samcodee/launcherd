import { Image, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { Colors, Spacing } from "@/constants/theme";
import TappableCard from "@/components/ui/TappableCard";
import type { SelectedApp, WebApp } from "@/lib/storage";

const colors = Colors.dark;

interface AppGridProps {
  apps: SelectedApp[];
  webApps?: WebApp[];
  icons: Record<string, string>;
  onOpenApp: (packageName: string) => void;
  onOpenWebApp?: (id: string) => void;
}

export default function AppGrid({
  apps,
  webApps = [],
  icons,
  onOpenApp,
  onOpenWebApp,
}: AppGridProps) {
  if (apps.length === 0 && webApps.length === 0) {
    return (
      <Text style={[styles.emptyApps, { color: colors.textSecondary }]}>
        No apps enabled. Go to Settings to choose apps.
      </Text>
    );
  }

  return (
    <View style={styles.grid}>
      {apps.map((app) => (
        <TappableCard
          key={app.packageName}
          onPress={() => onOpenApp(app.packageName)}
          style={styles.card}
          accessibilityLabel={`Open ${app.appName}`}
        >
          {icons[app.packageName] ? (
            <Image
              source={{ uri: icons[app.packageName] }}
              style={styles.icon}
            />
          ) : (
            <View
              style={[styles.icon, { backgroundColor: colors.backgroundSelected }]}
            />
          )}
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {app.appName}
          </Text>
        </TappableCard>
      ))}
      {webApps.map((webApp) => (
        <TappableCard
          key={webApp.id}
          onPress={() => onOpenWebApp?.(webApp.id)}
          style={styles.card}
          accessibilityLabel={`Open ${webApp.name}`}
        >
          <View
            style={[
              styles.icon,
              styles.webIcon,
              { backgroundColor: colors.backgroundSelected },
            ]}
          >
            <SymbolView
              tintColor={colors.text}
              name={{ android: "link", ios: "link" }}
              size={24}
            />
          </View>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {webApp.name}
          </Text>
        </TappableCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  card: {
    width: 76,
    borderRadius: 16,
    alignItems: "center",
    padding: Spacing.two,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: Spacing.two,
  },
  webIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  emptyApps: {
    fontSize: 14,
    marginBottom: Spacing.three,
  },
});
