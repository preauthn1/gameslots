import { create } from 'zustand';

import { getAppConfig } from '@/api/index';
import cachedRequest from '@/utils/storage';
import { memoryStorage } from '@/utils/memory-storage';

export const APP_CONFIG_STORAGE_KEY = 'app-config';
export const APP_CONFIG_MAX_AGE = 1000 * 60 * 60 * 24 * 7;
export const REGISTER_INVITE_STORAGE_KEY = 'register-invite-code';
export const REGISTER_ADID_STORAGE_KEY = 'register-adid';
export const REGISTER_APP_TOKEN_STORAGE_KEY = 'register-app-token';
export const REGISTER_ENV_STORAGE_KEY = 'register-env';
export const REGISTER_TYPE_STORAGE_KEY = 'register-type';
export const REGISTER_PIX_STORAGE_KEY = 'register-pix';
export const REGISTER_PLATFORM_STORAGE_KEY = 'register-platform';
export const REGISTER_CLICK_ID_STORAGE_KEY = 'register-click-id';

const readStorageValue = (key) => String(memoryStorage.getItem(key) || '').trim();
const writeStorageValue = (key, value) => {
  if (value) memoryStorage.setItem(key, value);
};

export const useSystemStore = create((set, get) => ({
  appConfig: null,
  InviteCode: readStorageValue(REGISTER_INVITE_STORAGE_KEY),
  adid: readStorageValue(REGISTER_ADID_STORAGE_KEY),
  appToken: readStorageValue(REGISTER_APP_TOKEN_STORAGE_KEY),
  env: readStorageValue(REGISTER_ENV_STORAGE_KEY),
  registerType: readStorageValue(REGISTER_TYPE_STORAGE_KEY),
  registerPix: readStorageValue(REGISTER_PIX_STORAGE_KEY),
  registerPlatform: readStorageValue(REGISTER_PLATFORM_STORAGE_KEY),
  registerClickId: readStorageValue(REGISTER_CLICK_ID_STORAGE_KEY),
  clearCachedViews() {},
  setInviteCode(inviteCode = '') {
    const code = String(inviteCode || '').trim();
    writeStorageValue(REGISTER_INVITE_STORAGE_KEY, code);
    set({ InviteCode: code });
  },
  setChannelParams({ adid, appToken, env, registerType } = {}) {
    const next = {};
    const normalizedAdid = String(adid || '').trim();
    const normalizedAppToken = String(appToken || '').trim();
    const normalizedEnv = String(env || '').trim();
    const normalizedRegisterType = String(registerType || '').trim().toLowerCase();
    if (normalizedAdid) {
      writeStorageValue(REGISTER_ADID_STORAGE_KEY, normalizedAdid);
      next.adid = normalizedAdid;
    }
    if (normalizedAppToken) {
      writeStorageValue(REGISTER_APP_TOKEN_STORAGE_KEY, normalizedAppToken);
      next.appToken = normalizedAppToken;
    }
    if (normalizedEnv) {
      writeStorageValue(REGISTER_ENV_STORAGE_KEY, normalizedEnv);
      next.env = normalizedEnv;
    }
    if (normalizedRegisterType === 'auto') {
      writeStorageValue(REGISTER_TYPE_STORAGE_KEY, 'auto');
      next.registerType = 'auto';
    }
    if (Object.keys(next).length) set(next);
  },
  setAttributionParams({ pix, platform, clickId } = {}) {
    const next = {};
    if (String(pix || '').trim()) {
      next.registerPix = String(pix).trim();
      writeStorageValue(REGISTER_PIX_STORAGE_KEY, next.registerPix);
    }
    if (String(platform || '').trim()) {
      next.registerPlatform = String(platform).trim();
      writeStorageValue(REGISTER_PLATFORM_STORAGE_KEY, next.registerPlatform);
    }
    if (String(clickId || '').trim()) {
      next.registerClickId = String(clickId).trim();
      writeStorageValue(REGISTER_CLICK_ID_STORAGE_KEY, next.registerClickId);
    }
    if (Object.keys(next).length) set(next);
  },
  async loadAppConfig() {
    await cachedRequest({
      apiFunc: getAppConfig,
      storageKey: APP_CONFIG_STORAGE_KEY,
      maxAge: APP_CONFIG_MAX_AGE,
      success: (config) => {
        config?.index_menu?.index_game_tab?.[0]?.list?.forEach((item) => {
          item.isShow = item?.game_list?.items?.length > 6;
        });
        set({ appConfig: config });
      },
    });
    return get().appConfig;
  },
  async refreshAppConfig() {
    const config = await getAppConfig(true);
    set({ appConfig: config });
    return config;
  },
}));
