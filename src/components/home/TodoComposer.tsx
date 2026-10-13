import { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { SymbolView } from "expo-symbols";

import { Colors, Spacing } from "@/constants/theme";
import { DONE_GREEN } from "@/components/home/TodoRow";

const colors = Colors.dark;

const MORPH_DURATION = 180;
const BAR_HEIGHT = 48;
const MAX_DIALOG_WIDTH = 420;
// Lets the keyboard finish closing so the bar is back in its resting spot
// before the dialog morphs back into it. Skipped when no keyboard is showing.
const KEYBOARD_SETTLE_MS = 240;

interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TodoComposerController {
  open: boolean;
  frame: Frame | null;
  draft: string;
  setDraft: (text: string) => void;
  present: (frame: Frame) => void;
  closeComposer: (submit: boolean) => void;
  progress: SharedValue<number>;
}

/**
 * Tapping the bar morphs it into a centered dialog with a dimmed backdrop; the
 * input sits above the keyboard so it is never hidden. Confirming or
 * cancelling morphs the dialog back into the bar.
 */
export function useTodoComposer(
  onAdd: (text: string) => void,
): TodoComposerController {
  const [open, setOpen] = useState(false);
  const [frame, setFrame] = useState<Frame | null>(null);
  const [draft, setDraft] = useState("");
  const settlingRef = useRef(false);
  const progress = useSharedValue(0);

  const present = useCallback((nextFrame: Frame) => {
    // The bar is only tappable once the close sequence has finished, so a
    // fresh open always cancels any lingering settling state.
    settlingRef.current = false;
    setFrame(nextFrame);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    progress.value = withTiming(1, {
      duration: MORPH_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [open, progress]);

  const closeComposer = useCallback(
    (submit: boolean) => {
      if (!open || settlingRef.current) return;
      settlingRef.current = true;
      const text = draft.trim();
      setDraft("");
      if (submit && text) onAdd(text);
      Keyboard.dismiss();
      const settleMs = Keyboard.isVisible() ? KEYBOARD_SETTLE_MS : 0;
      setTimeout(() => {
        progress.value = withTiming(
          0,
          {
            duration: MORPH_DURATION,
            easing: Easing.in(Easing.cubic),
          },
          (finished) => {
            if (finished) runOnJS(setOpen)(false);
          },
        );
      }, settleMs);
    },
    [open, draft, onAdd, progress],
  );

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!open) return false;
        closeComposer(false);
        return true;
      },
    );
    return () => subscription.remove();
  }, [open, closeComposer]);

  return { open, frame, draft, setDraft, present, closeComposer, progress };
}

interface ComposerPartProps {
  controller: TodoComposerController;
}

export function TodoComposerBar({ controller }: ComposerPartProps) {
  const barRef = useRef<View>(null);

  const handlePress = useCallback(() => {
    barRef.current?.measureInWindow((x, y, width, height) => {
      controller.present({ x, y, width, height });
    });
  }, [controller]);

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Todos</Text>
      <Pressable
        ref={barRef}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.bar,
          {
            backgroundColor:
              pressed && !controller.open
                ? colors.backgroundSelected
                : colors.backgroundElement,
          },
          controller.open ? styles.barHidden : null,
        ]}
        accessibilityLabel="Add a task"
      >
        <Text
          style={[styles.barPlaceholder, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          Add a task...
        </Text>
        <SymbolView tintColor={"#9A9A9A"} name={{ android: "add" }} />
      </Pressable>
    </View>
  );
}

export function TodoComposerDialog({ controller }: ComposerPartProps) {
  const inputRef = useRef<TextInput>(null);
  const { open, frame } = controller;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [open]);

  const dialogWidth = Math.min(windowWidth - Spacing.four * 2, MAX_DIALOG_WIDTH);
  const dialogLeft = (windowWidth - dialogWidth) / 2;
  // Centered in the top half of the screen so the keyboard never covers it.
  const dialogTop = windowHeight * 0.25 - BAR_HEIGHT / 2;

  const cardStyle = useAnimatedStyle(() => {
    if (!frame) return {};
    return {
      left: interpolate(controller.progress.value, [0, 1], [frame.x, dialogLeft]),
      top: interpolate(controller.progress.value, [0, 1], [frame.y, dialogTop]),
      width: interpolate(
        controller.progress.value,
        [0, 1],
        [frame.width, dialogWidth],
      ),
      height: BAR_HEIGHT,
      borderRadius: interpolate(controller.progress.value, [0, 1], [12, 20]),
    };
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: controller.progress.value * 0.6,
  }));

  if (!open || !frame) return null;

  return (
    <Animated.View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => controller.closeComposer(false)}
          accessibilityLabel="Close"
        />
      </Animated.View>
      <Animated.View style={[styles.dialog, cardStyle]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          placeholder="Add a task..."
          placeholderTextColor={colors.textSecondary}
          value={controller.draft}
          onChangeText={controller.setDraft}
          onSubmitEditing={() => controller.closeComposer(true)}
          returnKeyType="done"
        />
        <Pressable
          onPress={() => controller.closeComposer(true)}
          hitSlop={8}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            padding: Spacing.two,
            marginRight: -Spacing.two,
          })}
          accessibilityLabel="Add task"
        >
          <SymbolView tintColor={DONE_GREEN} name={{ android: "check" }} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Spacing.three,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    height: BAR_HEIGHT,
    marginBottom: Spacing.three,
  },
  barHidden: {
    opacity: 0,
  },
  barPlaceholder: {
    flex: 1,
    fontSize: 16,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
  },
  dialog: {
    position: "absolute",
    left: 0,
    top: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    backgroundColor: colors.backgroundElement,
    elevation: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    paddingVertical: 0,
  },
});
