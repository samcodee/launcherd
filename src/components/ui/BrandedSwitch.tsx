import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";

import { Colors } from "@/constants/theme";

const BRAND_ORANGE = "#e08b5d";

const TRACK_WIDTH = 51;
const TRACK_HEIGHT = 31;
const THUMB_SIZE = TRACK_HEIGHT - 4;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - 4;

const springConfig = { damping: 18, stiffness: 220, mass: 0.7 };

interface BrandedSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function BrandedSwitch({
  value,
  onValueChange,
}: BrandedSwitchProps) {
  const progress = useDerivedValue(() =>
    withSpring(value ? 1 : 0, springConfig),
  );

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [Colors.dark.backgroundSelected, BRAND_ORANGE],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(progress.value * THUMB_TRAVEL, springConfig) },
    ],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [Colors.dark.textSecondary, "#ffffff"],
    ),
  }));

  return (
    <Pressable
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: 2,
    justifyContent: "center",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
});
