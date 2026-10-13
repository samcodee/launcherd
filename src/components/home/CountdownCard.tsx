import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { Colors, Spacing } from "@/constants/theme";
import TappableCard from "@/components/ui/TappableCard";
import {
  MONTHS,
  countdownDate,
  countdownDaysLabel,
  draftFromTimestamp,
  draftFromToday,
  draftToTimestamp,
  shiftDraftDay,
  shiftDraftMonth,
  shiftDraftYear,
  type DateDraft,
} from "@/lib/countdown";

const colors = Colors.dark;

const CLEAR_RED = "#FF453A";

interface CountdownCardProps {
  countdown: number | null;
  label: string;
  onSave: (timestamp: number) => void;
  onClear: () => void;
}

export default function CountdownCard({
  countdown,
  label,
  onSave,
  onClear,
}: CountdownCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DateDraft>(() => draftFromToday());

  const startEditing = useCallback(() => {
    setDraft(countdown !== null ? draftFromTimestamp(countdown) : draftFromToday());
    setEditing(true);
  }, [countdown]);

  const save = useCallback(() => {
    onSave(draftToTimestamp(draft));
    setEditing(false);
  }, [draft, onSave]);

  const clear = useCallback(() => {
    onClear();
    setEditing(false);
  }, [onClear]);

  if (editing) {
    return (
      <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
        <Text style={[styles.label, { color: colors.text }]}>Countdown date</Text>
        <View style={styles.steppersRow}>
          <DateStepper
            label="Day"
            value={draft.day}
            onIncrement={() => setDraft((d) => shiftDraftDay(d, 1))}
            onDecrement={() => setDraft((d) => shiftDraftDay(d, -1))}
          />
          <DateStepper
            label="Month"
            value={MONTHS[draft.month]}
            onIncrement={() => setDraft((d) => shiftDraftMonth(d, 1))}
            onDecrement={() => setDraft((d) => shiftDraftMonth(d, -1))}
          />
          <DateStepper
            label="Year"
            value={draft.year}
            onIncrement={() => setDraft((d) => shiftDraftYear(d, 1))}
            onDecrement={() => setDraft((d) => shiftDraftYear(d, -1))}
          />
        </View>
        <View style={styles.editActions}>
          <TappableCard onPress={clear} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: CLEAR_RED }]}>Clear</Text>
          </TappableCard>
          <TappableCard onPress={() => setEditing(false)} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: colors.text }]}>Cancel</Text>
          </TappableCard>
          <TappableCard onPress={save} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: colors.text }]}>Save</Text>
          </TappableCard>
        </View>
      </View>
    );
  }

  return (
    <TappableCard onPress={startEditing} style={styles.card}>
      {countdown === null ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          Add a countdown date
        </Text>
      ) : (
        <>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {label}
          </Text>
          <Text style={[styles.days, { color: colors.text }]}>
            {countdownDaysLabel(countdown)}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {countdownDate(countdown)}
          </Text>
        </>
      )}
    </TappableCard>
  );
}

function DateStepper({
  label,
  value,
  onIncrement,
  onDecrement,
}: {
  label: string;
  value: number | string;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <TappableCard onPress={onIncrement} style={styles.stepperButton}>
        <SymbolView
          name={{
            ios: "chevron.up",
            android: "expand_less",
            web: "expand_less",
          }}
          size={18}
          tintColor={colors.text}
        />
      </TappableCard>
      <Text
        style={[styles.stepperValue, { color: colors.text }]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <TappableCard onPress={onDecrement} style={styles.stepperButton}>
        <SymbolView
          name={{
            ios: "chevron.down",
            android: "expand_more",
            web: "expand_more",
          }}
          size={18}
          tintColor={colors.text}
        />
      </TappableCard>
      <Text style={[styles.stepperLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: Spacing.one,
  },
  days: {
    fontSize: 28,
    fontWeight: "800",
  },
  date: {
    fontSize: 13,
    marginTop: Spacing.one,
  },
  empty: {
    fontSize: 15,
    fontWeight: "600",
  },
  steppersRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "center",
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  stepper: {
    flex: 1,
    alignItems: "center",
  },
  stepperButton: {
    width: "100%",
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: Spacing.one,
  },
  stepperLabel: {
    fontSize: 12,
    marginTop: Spacing.one,
  },
  editActions: {
    flexDirection: "row",
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  actionButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
