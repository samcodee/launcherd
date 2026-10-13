import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Colors } from "@/constants/theme";

const colors = Colors.dark;

interface TappableCardProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  accessibilityLabel?: string;
}

export default function TappableCard({
  onPress,
  style,
  children,
  accessibilityLabel,
}: TappableCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed
            ? colors.backgroundSelected
            : colors.backgroundElement,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
  },
});
