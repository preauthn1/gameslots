import { router } from 'expo-router';

import { toast } from '@/services/toast-store';
import tokenManager from '@/utils/token-manager';
import { messages } from '@/i18n/messages';
import getCurrentLang from '@/utils/getCurrentLang';

let authExpiryPromise = null;
let lastHandledAt = 0;
const AUTH_EXPIRY_COOLDOWN = 1500;

export async function handleAuthExpiredState(message) {
  if (authExpiryPromise) return authExpiryPromise;
  if (Date.now() - lastHandledAt < AUTH_EXPIRY_COOLDOWN) return;

  authExpiryPromise = (async () => {
    tokenManager.clearToken();
    try {
      router.replace('/');
    } catch (error) {
      console.error('跳转首页失败:', error);
    }
    const { useUserStore } = await import('@/stores/user-store');
    useUserStore.getState().clearUserInfo();
    const locale = getCurrentLang();
    toast.error(message || messages[locale]?.errors?.loginExpired || messages.en?.errors?.loginExpired || 'Login expired');
    useUserStore.getState().openLoginModal();
  })();

  try {
    await authExpiryPromise;
  } finally {
    lastHandledAt = Date.now();
    authExpiryPromise = null;
  }
}
