import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Spacing } from "@/constants/theme";
import BrandedSwitch from "@/components/ui/BrandedSwitch";
import type { WebApp } from "@/lib/storage";
import {
  deriveDefaultPatterns,
  extractHostname,
  makeWebAppId,
  normalizeUrl,
  parsePatterns,
} from "@/lib/webApp";

const colors = Colors.dark;

interface WebAppEditorProps {
  visible: boolean;
  initial?: WebApp | null;
  onClose: () => void;
  onSave: (webApp: WebApp) => void;
}

export default function WebAppEditor({
  visible,
  initial,
  onClose,
  onSave,
}: WebAppEditorProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [incognito, setIncognito] = useState(initial?.incognito ?? false);
  const [restrictDomain, setRestrictDomain] = useState(
    initial?.restrictDomain ?? true,
  );
  const [patterns, setPatterns] = useState(
    initial ? initial.patterns.join(" ") : "",
  );
  const [patternsEdited, setPatternsEdited] = useState(Boolean(initial));
  const [error, setError] = useState("");

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (!patternsEdited) {
      const normalized = normalizeUrl(value);
      setPatterns(normalized ? deriveDefaultPatterns(normalized).join(" ") : "");
    }
  };

  const handleSave = () => {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError("Enter a valid website URL");
      return;
    }
    let savedPatterns: string[] = [];
    if (restrictDomain) {
      savedPatterns = parsePatterns(patterns);
      if (savedPatterns.length === 0) {
        savedPatterns = deriveDefaultPatterns(normalized);
      }
    }
    const host = extractHostname(normalized);
    onSave({
      id: initial?.id ?? makeWebAppId(),
      name: name.trim() || host?.replace(/^www\./, "") || "Web app",
      url: normalized,
      incognito,
      restrictDomain,
      patterns: savedPatterns,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top", "bottom"]}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {initial ? "Edit web app" : "Add web app"}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              {
                backgroundColor: pressed
                  ? colors.backgroundSelected
                  : colors.backgroundElement,
              },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: colors.text }]}>
              Cancel
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Name
          </Text>
          <TextInput
            style={[
              styles.textField,
              {
                color: colors.text,
                backgroundColor: colors.backgroundElement,
                borderColor: colors.backgroundSelected,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Enter the name of your app (optional)"
            placeholderTextColor={colors.textSecondary}
            maxLength={32}
            returnKeyType="done"
          />

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            URL
          </Text>
          <TextInput
            style={[
              styles.textField,
              {
                color: colors.text,
                backgroundColor: colors.backgroundElement,
                borderColor: colors.backgroundSelected,
              },
            ]}
            value={url}
            onChangeText={handleUrlChange}
            placeholder="https://google.com"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="done"
          />

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={[styles.toggleText, { color: colors.text }]}>
                Incognito
              </Text>
              <Text
                style={[styles.toggleHint, { color: colors.textSecondary }]}
              >
                History, cookies and site data aren&apos;t saved
              </Text>
            </View>
            <BrandedSwitch value={incognito} onValueChange={setIncognito} />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={[styles.toggleText, { color: colors.text }]}>
                Restrict to allowed domains
              </Text>
              <Text
                style={[styles.toggleHint, { color: colors.textSecondary }]}
              >
                Only links matching the patterns below can be opened
              </Text>
            </View>
            <BrandedSwitch
              value={restrictDomain}
              onValueChange={setRestrictDomain}
            />
          </View>

          {restrictDomain ? (
            <>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Allowed domains
              </Text>
              <TextInput
                style={[
                  styles.textField,
                  styles.patternsField,
                  {
                    color: colors.text,
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.backgroundSelected,
                  },
                ]}
                value={patterns}
                onChangeText={(value) => {
                  setPatterns(value);
                  setPatternsEdited(true);
                }}
                placeholder="Example: *google.com *wikipedia.com"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
              />
              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                Space or comma separated. *google.com allows google.com and
                its subdomains. Wrap a pattern in /slashes/ to use a regex.
              </Text>
            </>
          ) : null}

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: pressed
                  ? colors.backgroundSelected
                  : colors.backgroundElement,
              },
            ]}
            onPress={handleSave}
          >
            <Text style={[styles.saveText, { color: colors.text }]}>
              {initial ? "Save changes" : "Add web app"}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  cancelButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  form: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.two,
    marginTop: Spacing.three,
  },
  textField: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
  patternsField: {
    height: "auto",
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    textAlignVertical: "center",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.four,
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: Spacing.three,
  },
  toggleText: {
    fontSize: 15,
  },
  toggleHint: {
    fontSize: 12,
    marginTop: Spacing.half,
  },
  hint: {
    fontSize: 12,
    marginTop: Spacing.two,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
    fontWeight: "600",
    marginTop: Spacing.three,
  },
  saveButton: {
    borderRadius: 12,
    padding: Spacing.three,
    alignItems: "center",
    marginTop: Spacing.four,
  },
  saveText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
