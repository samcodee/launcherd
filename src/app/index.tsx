import { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as IntentLauncher from "expo-intent-launcher";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Spacing } from "@/constants/theme";
import AppGrid from "@/components/home/AppGrid";
import CountdownCard from "@/components/home/CountdownCard";
import {
  TodoComposerBar,
  TodoComposerDialog,
  useTodoComposer,
} from "@/components/home/TodoComposer";
import TodoRow from "@/components/home/TodoRow";
import { getApplicationIcon } from "@/lib/appQuery";
import {
  DEFAULT_COUNTDOWN_LABEL,
  DEFAULT_HEADING,
  getCountdown,
  getCountdownLabel,
  getCountdownVisible,
  getHeading,
  getSelectedApps,
  getTodos,
  getTodosVisible,
  getWebApps,
  clearCountdown as persistClearCountdown,
  setCountdown as persistCountdown,
  setTodos,
  type SelectedApp,
  type Todo,
  type WebApp,
} from "@/lib/storage";

const colors = Colors.dark;

export default function HomeScreen() {
  const [apps, setApps] = useState<SelectedApp[]>([]);
  const [icons, setIcons] = useState<Record<string, string>>({});
  const [webApps, setWebAppsState] = useState<WebApp[]>([]);
  const [todos, setLocalTodos] = useState<Todo[]>([]);
  const [countdown, setCountdownState] = useState<number | null>(null);
  const [countdownLabel, setCountdownLabelState] = useState(
    DEFAULT_COUNTDOWN_LABEL,
  );
  const [countdownVisible, setCountdownVisibleState] = useState(true);
  const [todosVisible, setTodosVisibleState] = useState(true);
  const [heading, setHeadingState] = useState(DEFAULT_HEADING);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getSelectedApps().then((selected) => {
        if (!active) return;
        setApps(selected);
        selected.forEach((app) => {
          getApplicationIcon(app.packageName).then((icon) => {
            if (active && icon) {
              setIcons((prev) =>
                prev[app.packageName] ? prev : { ...prev, [app.packageName]: icon },
              );
            }
          });
        });
      });
      getTodos().then((saved) => {
        if (active) setLocalTodos(saved);
      });
      getCountdown().then((saved) => {
        if (active) setCountdownState(saved);
      });
      getCountdownLabel().then((saved) => {
        if (active) setCountdownLabelState(saved);
      });
      getCountdownVisible().then((saved) => {
        if (active) setCountdownVisibleState(saved);
      });
      getHeading().then((saved) => {
        if (active) setHeadingState(saved);
      });
      getTodosVisible().then((saved) => {
        if (active) setTodosVisibleState(saved);
      });
      getWebApps().then((saved) => {
        if (active) setWebAppsState(saved);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const openApp = useCallback((packageName: string) => {
    try {
      IntentLauncher.openApplication(packageName);
    } catch {
      // ignore
    }
  }, []);

  const openWebApp = useCallback((id: string) => {
    router.push(`/webapp/${id}`);
  }, []);

  const saveCountdown = useCallback((timestamp: number) => {
    setCountdownState(timestamp);
    persistCountdown(timestamp);
  }, []);

  const clearCountdown = useCallback(() => {
    setCountdownState(null);
    persistClearCountdown();
  }, []);

  const persistTodos = useCallback((next: Todo[]) => {
    setLocalTodos(next);
    setTodos(next);
  }, []);

  const addTodo = useCallback(
    (text: string) => {
      const todo: Todo = {
        id: Date.now().toString(),
        text,
        done: false,
        createdAt: Date.now(),
      };
      persistTodos([todo, ...todos]);
    },
    [todos, persistTodos],
  );

  const toggleTodo = useCallback(
    (id: string) => {
      persistTodos(
        todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      );
    },
    [todos, persistTodos],
  );

  const deleteTodo = useCallback(
    (id: string) => {
      persistTodos(todos.filter((t) => t.id !== id));
    },
    [todos, persistTodos],
  );

  const composer = useTodoComposer(addTodo);

  const header = (
    <View>
      <View style={styles.headerRow}>
        <Text
          style={[styles.headerTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {heading}
        </Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              {
                backgroundColor: pressed
                  ? colors.backgroundSelected
                  : colors.backgroundElement,
              },
            ]}
            onPress={() => router.push("/settings")}
          >
            <Text style={[styles.headerButtonText, { color: colors.text }]}>
              Settings
            </Text>
          </Pressable>
        </View>
      </View>

      <AppGrid
        apps={apps}
        webApps={webApps}
        icons={icons}
        onOpenApp={openApp}
        onOpenWebApp={openWebApp}
      />

      {countdownVisible ? (
        <CountdownCard
          countdown={countdown}
          label={countdownLabel}
          onSave={saveCountdown}
          onClear={clearCountdown}
        />
      ) : null}

      {todosVisible ? <TodoComposerBar controller={composer} /> : null}
    </View>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top", "bottom"]}
      >
        <FlatList
          data={todosVisible ? todos : []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TodoRow todo={item} onToggle={toggleTodo} onDelete={deleteTodo} />
          )}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            todosVisible ? (
              <Text style={[styles.empty, { color: colors.textSecondary }]}>
                No tasks yet.
              </Text>
            ) : null
          }
        />
      </SafeAreaView>
      {todosVisible ? <TodoComposerDialog controller={composer} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.three,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  headerButtons: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  headerButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    marginTop: Spacing.four,
    fontSize: 16,
  },
});
