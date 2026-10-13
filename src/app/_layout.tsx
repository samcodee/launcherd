import { useCallback, useEffect, useState } from "react";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import {
  hasCompletedOnboarding,
  hasPin,
  setOnboardingComplete,
} from "@/lib/storage";
import { KeyboardProvider } from "react-native-keyboard-controller";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    Promise.all([hasCompletedOnboarding(), hasPin()]).then(
      ([completed, pinExists]) => {
        // Devices set up before onboarding existed already have a PIN, so
        // they skip straight to the app.
        setShowOnboarding(!completed && !pinExists);
        setReady(true);
      },
    );
  }, []);

  const completeOnboarding = useCallback(async () => {
    await setOnboardingComplete();
    setShowOnboarding(false);
  }, []);

  return (
    <ThemeProvider value={DarkTheme}>
      <KeyboardProvider>
        <AnimatedSplashOverlay />
        {!ready ? null : showOnboarding ? (
          <OnboardingFlow onComplete={completeOnboarding} />
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="settings" options={{ presentation: "modal" }} />
            <Stack.Screen
              name="webapp/[id]"
              options={{ animation: "slide_from_bottom" }}
            />
          </Stack>
        )}
      </KeyboardProvider>
    </ThemeProvider>
  );
}
