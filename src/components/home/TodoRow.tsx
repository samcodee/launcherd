import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { Colors, Spacing } from "@/constants/theme";
import type { Todo } from "@/lib/storage";

const colors = Colors.dark;

interface TodoRowProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoRow({ todo, onToggle, onDelete }: TodoRowProps) {
  return (
    <View style={[styles.row, { backgroundColor: colors.backgroundElement }]}>
      <Pressable style={styles.checkbox} onPress={() => onToggle(todo.id)}>
        <View
          style={[
            styles.checkboxInner,
            {
              backgroundColor: todo.done ? DONE_GREEN : "transparent",
              borderColor: todo.done ? DONE_GREEN : colors.textSecondary,
            },
          ]}
        >
          {todo.done ? (
            <SymbolView tintColor={"#FFF"} name={{ android: "check_small" }} />
          ) : null}
        </View>
      </Pressable>
      <Text
        style={[
          styles.text,
          {
            color: todo.done ? "#A0A0A0" : colors.text,
            textDecorationLine: todo.done ? "line-through" : "none",
          },
        ]}
      >
        {todo.text}
      </Text>
      <Pressable onPress={() => onDelete(todo.id)} hitSlop={8}>
        <SymbolView tintColor={"#9A9A9A"} name={{ android: "close" }} />
      </Pressable>
    </View>
  );
}

export const DONE_GREEN = "#34C759";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  checkbox: {
    padding: Spacing.half,
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    fontSize: 16,
  },
});
