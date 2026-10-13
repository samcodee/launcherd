import type { ComponentProps, ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SymbolView } from "expo-symbols";

import { Colors } from "@/constants/theme";

const colors = Colors.dark;

type SymbolName = ComponentProps<typeof SymbolView>["name"];

interface IconBadgeProps {
  name: SymbolName;
  size?: number;
  color?: string;
  backgroundColor?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function IconBadge({
  name,
  size = 48,
  color = colors.text,
  backgroundColor = colors.backgroundSelected,
  style,
}: IconBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
        style,
      ]}
    >
      <SymbolView name={name} size={Math.round(size * 0.45)} tintColor={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
});
