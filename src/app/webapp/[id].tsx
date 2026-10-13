import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import { WebView } from "react-native-webview";

import { Colors, Spacing } from "@/constants/theme";
import { getWebApps, type WebApp } from "@/lib/storage";
import { deriveDefaultPatterns, extractHostname, isUrlAllowed } from "@/lib/webApp";

const colors = Colors.dark;
const BLOCKED_BANNER_MS = 2500;

export default function WebAppScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [webApp, setWebApp] = useState<WebApp | null | undefined>(undefined);
  const missing = !id;
  const [canGoBack, setCanGoBack] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [pageLoading, setPageLoading] = useState(false);
  const [blockedHost, setBlockedHost] = useState<string | null>(null);
  const webviewRef = useRef<WebView>(null);
  const blockedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    getWebApps().then((apps) => {
      if (!active) return;
      setWebApp(apps.find((app) => app.id === id) ?? null);
    });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (blockedTimerRef.current) clearTimeout(blockedTimerRef.current);
    };
  }, []);

  const showBlocked = useCallback((url: string) => {
    setBlockedHost(extractHostname(url) ?? url);
    if (blockedTimerRef.current) clearTimeout(blockedTimerRef.current);
    blockedTimerRef.current = setTimeout(
      () => setBlockedHost(null),
      BLOCKED_BANNER_MS,
    );
  }, []);

  const handleShouldStartLoad = useCallback(
    (request: { url: string }) => {
      if (!webApp) return false;
      if (request.url === "about:blank") return true;
      if (!webApp.restrictDomain) return true;
      const activePatterns =
        webApp.patterns.length > 0
          ? webApp.patterns
          : deriveDefaultPatterns(webApp.url);
      if (isUrlAllowed(request.url, activePatterns)) return true;
      showBlocked(request.url);
      return false;
    },
    [webApp, showBlocked],
  );

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (canGoBack) {
          webviewRef.current?.goBack();
          return true;
        }
        return false;
      },
    );
    return () => subscription.remove();
  }, [canGoBack]);

  if (webApp === undefined) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (webApp === null || missing) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top", "bottom"]}
      >
        <View style={styles.missing}>
          <Text style={[styles.missingText, { color: colors.text }]}>
            Web app not found
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              {
                backgroundColor: pressed
                  ? colors.backgroundSelected
                  : colors.backgroundElement,
              },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.retryText, { color: colors.text }]}>
              Go back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const headerButtonStyle = ({ pressed }: { pressed: boolean }) => [
    styles.headerButton,
    {
      backgroundColor: pressed
        ? colors.backgroundSelected
        : colors.backgroundElement,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.header}>
        <Pressable
          style={headerButtonStyle}
          hitSlop={6}
          onPress={() => {
            if (canGoBack) {
              webviewRef.current?.goBack();
            } else {
              router.back();
            }
          }}
        >
          <SymbolView
            tintColor={colors.text}
            name={{ android: "arrow_back", ios: "chevron.left" }}
            size={16}
          />
        </Pressable>
        <Pressable
          style={headerButtonStyle}
          hitSlop={6}
          onPress={() => router.back()}
          accessibilityLabel="Close web app"
        >
          <SymbolView
            tintColor={colors.text}
            name={{ android: "close", ios: "xmark" }}
            size={16}
          />
        </Pressable>
        <Text
          style={[styles.headerTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {pageTitle || webApp.name}
        </Text>
        <Pressable
          style={headerButtonStyle}
          hitSlop={6}
          onPress={() => webviewRef.current?.reload()}
          accessibilityLabel="Reload page"
        >
          {pageLoading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <SymbolView
              tintColor={colors.text}
              name={{ android: "refresh", ios: "arrow.clockwise" }}
              size={16}
            />
          )}
        </Pressable>
      </View>

      <View style={styles.webContainer}>
        <WebView
          ref={webviewRef}
          source={{ uri: webApp.url }}
          style={[styles.webview, { backgroundColor: colors.background }]}
          javaScriptEnabled
          domStorageEnabled
          incognito={webApp.incognito}
          cacheEnabled={!webApp.incognito}
          setSupportMultipleWindows={false}
          allowsBackForwardNavigationGestures
          pullToRefreshEnabled
          startInLoadingState
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          onLoadProgress={({ nativeEvent }) => {
            setCanGoBack(nativeEvent.canGoBack);
            if (nativeEvent.title) setPageTitle(nativeEvent.title);
          }}
          onLoadStart={() => setPageLoading(true)}
          onLoadEnd={() => setPageLoading(false)}
          renderLoading={() => (
            <View style={styles.loadingOverlay} pointerEvents="none">
              <ActivityIndicator color={colors.text} />
            </View>
          )}
          renderError={() => (
            <View style={styles.errorView}>
              <Text style={[styles.missingText, { color: colors.text }]}>
                Couldn&apos;t load this page
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.retryButton,
                  {
                    backgroundColor: pressed
                      ? colors.backgroundSelected
                      : colors.backgroundElement,
                  },
                ]}
                onPress={() => webviewRef.current?.reload()}
              >
                <Text style={[styles.retryText, { color: colors.text }]}>
                  Try again
                </Text>
              </Pressable>
            </View>
          )}
        />
        {blockedHost ? (
          <View style={styles.blockedBanner} pointerEvents="none">
            <Text style={styles.blockedText} numberOfLines={1}>
              Blocked: {blockedHost}
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + Spacing.half,
  },
  headerButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  webContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  blockedBanner: {
    position: "absolute",
    alignSelf: "center",
    bottom: Spacing.four,
    backgroundColor: colors.backgroundElement,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    maxWidth: "90%",
  },
  blockedText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "500",
  },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    padding: Spacing.four,
  },
  missingText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  errorView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    padding: Spacing.four,
    backgroundColor: colors.background,
  },
  retryButton: {
    borderRadius: 10,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + Spacing.half,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
