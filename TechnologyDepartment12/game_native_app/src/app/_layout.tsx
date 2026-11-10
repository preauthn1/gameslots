import { usePathname } from "expo-router";
import {
  CardStyleInterpolators,
  Stack,
  type StackCardInterpolationProps,
} from "expo-router/js-stack";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Animated, Easing, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ToastHost } from "@/components/toast-host";
import { syncLocale } from "@/i18n";
import { setNavPath } from "@/services/nav-path";
import { initWebSocket } from "@/services/ws-client";
import {
  REGISTER_ADID_STORAGE_KEY,
  REGISTER_APP_TOKEN_STORAGE_KEY,
  REGISTER_CLICK_ID_STORAGE_KEY,
  REGISTER_ENV_STORAGE_KEY,
  REGISTER_INVITE_STORAGE_KEY,
  REGISTER_PIX_STORAGE_KEY,
  REGISTER_PLATFORM_STORAGE_KEY,
  REGISTER_TYPE_STORAGE_KEY,
  useSystemStore,
} from "@/stores/system-store";
import { useUserStore } from "@/stores/user-store";
import { colors } from "@/theme/colors";
import { hydrateMemoryStorage, memoryStorage } from "@/utils/memory-storage";
import tokenManager from "@/utils/token-manager";

const slideTiming = {
  animation: "timing" as const,
  config: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
};

function horizontalPair({
  current,
  next,
  inverted,
  layouts: { screen },
}: StackCardInterpolationProps) {
  const translateFocused = Animated.multiply(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [screen.width, 0],
      extrapolate: "clamp",
    }),
    inverted,
  );
  const translateUnfocused = next
    ? Animated.multiply(
        next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -screen.width],
          extrapolate: "clamp",
        }),
        inverted,
      )
    : 0;

  return {
    cardStyle: {
      transform: [
        { translateX: translateFocused },
        { translateX: translateUnfocused },
      ],
    },
  };
}

const authScreenOptions = {
  headerShown: false,
  gestureEnabled: false,
  presentation: "transparentModal" as const,
  animation: "none" as const,
  cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
  cardStyle: { backgroundColor: "transparent" },
  cardOverlayEnabled: false,
};

export default function RootLayout() {
  const pathname = usePathname();
  const openLoginOnHome = useUserStore((state) => state.openLoginOnHome);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setNavPath(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!openLoginOnHome || (pathname !== "/" && pathname !== "/index")) return;
    useUserStore.setState({ openLoginOnHome: false });
    useUserStore.getState().openLoginModal();
  }, [openLoginOnHome, pathname]);

  useEffect(() => {
    hydrateMemoryStorage()
      .then(() => {
        useSystemStore.setState({
          InviteCode: memoryStorage.getItem(REGISTER_INVITE_STORAGE_KEY) || "",
          adid: memoryStorage.getItem(REGISTER_ADID_STORAGE_KEY) || "",
          appToken: memoryStorage.getItem(REGISTER_APP_TOKEN_STORAGE_KEY) || "",
          env: memoryStorage.getItem(REGISTER_ENV_STORAGE_KEY) || "",
          registerType: memoryStorage.getItem(REGISTER_TYPE_STORAGE_KEY) || "",
          registerPix: memoryStorage.getItem(REGISTER_PIX_STORAGE_KEY) || "",
          registerPlatform:
            memoryStorage.getItem(REGISTER_PLATFORM_STORAGE_KEY) || "",
          registerClickId:
            memoryStorage.getItem(REGISTER_CLICK_ID_STORAGE_KEY) || "",
        });
        syncLocale();
        if (tokenManager.getToken()) {
          useUserStore.setState({ isLoggedIn: true });
          useUserStore
            .getState()
            .fetchUserInfo()
            .catch(() => useUserStore.getState().clearUserInfo());
          useUserStore
            .getState()
            .fetchWelfarePendingStatus()
            .catch(() => {});
        }
        useSystemStore
          .getState()
          .loadAppConfig()
          .catch(() => {});
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    initWebSocket().catch((error) => {
      console.warn("[ws] init failed:", error);
    });
  }, [ready]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          gestureResponseDistance: 32,
          animation: "slide_from_right",
          cardStyleInterpolator: horizontalPair,
          transitionSpec: { open: slideTiming, close: slideTiming },
          cardStyle: { backgroundColor: colors.bg },
          cardOverlayEnabled: false,
          cardShadowEnabled: false,
        }}
      >
        <Stack.Screen name="login" options={authScreenOptions} />
        <Stack.Screen name="register" options={authScreenOptions} />
      </Stack>
      <ToastHost />
    </GestureHandlerRootView>
  );
}
