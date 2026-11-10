import { AppState } from 'react-native';

import { messages } from '@/i18n/messages';
import { getNavPath } from '@/services/nav-path';
import { toast } from '@/services/toast-store';
import { useSystemStore } from '@/stores/system-store';
import { useUserStore } from '@/stores/user-store';
import getCurrentLang from '@/utils/getCurrentLang';
import { memoryStorage } from '@/utils/memory-storage';
import tokenManager, { onTokenChange } from '@/utils/token-manager';

const UUID_KEY = 'ws_device_uuid';
const FIRST_PING_DELAY = 5000;
const HEARTBEAT_INTERVAL = 15000;
const HEARTBEAT_TIMEOUT = 10000;
const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT_INTERVAL = 30000;

const deviceUuid = () => {
  const existing = memoryStorage.getItem(UUID_KEY);
  if (existing) return existing;
  const next = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  memoryStorage.setItem(UUID_KEY, next);
  return next;
};

const buildSocketUrl = (url, token) => {
  const params = new URLSearchParams();
  if (token) params.set('token', token);
  const uuid = deviceUuid();
  if (uuid) params.set('uuid', uuid);
  const query = params.toString();
  if (!query) return url;
  return url + (url.includes('?') ? '&' : '?') + query;
};

const controlId = (message) => String(message?._requestId || message?.requestId || '');
const controlReason = (message) => String(message?.data?.reason || message?.reason || '');

let socket = null;
let socketUrl = '';
let boundToken = null;
let manualClose = false;
let reconnectTimer = null;
let reconnectAttempts = 0;
let heartbeatTimer = null;
let warmupTimer = null;
let probeTimer = null;
let lastActivity = 0;
let lastPingAt = 0;
let listenersReady = false;
let initPromise = null;
let replaced = false;

const clearHeartbeat = () => {
  clearTimeout(warmupTimer);
  clearInterval(heartbeatTimer);
  clearTimeout(probeTimer);
  warmupTimer = null;
  heartbeatTimer = null;
  probeTimer = null;
};

const markActivity = () => {
  lastActivity = Date.now();
  clearTimeout(probeTimer);
  probeTimer = null;
};

const send = (payload) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) return false;
  try {
    socket.send(JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('[ws] send failed:', error);
    return false;
  }
};

const sendPing = () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  const now = Date.now();
  if (lastPingAt && now - lastPingAt < HEARTBEAT_INTERVAL) return;
  const sent = send({ type: 'ping', page: getNavPath() });
  if (!sent) return;
  lastPingAt = now;
  clearTimeout(probeTimer);
  probeTimer = setTimeout(() => {
    probeTimer = null;
    if (manualClose) return;
    closeSocket();
    scheduleReconnect(0);
  }, HEARTBEAT_TIMEOUT);
};

const startHeartbeat = () => {
  clearHeartbeat();
  lastPingAt = 0;
  markActivity();
  warmupTimer = setTimeout(() => {
    warmupTimer = null;
    sendPing();
  }, FIRST_PING_DELAY);
  heartbeatTimer = setInterval(sendPing, HEARTBEAT_INTERVAL);
};

const closeSocket = () => {
  clearHeartbeat();
  const current = socket;
  socket = null;
  boundToken = null;
  if (!current) return;
  current.onopen = null;
  current.onmessage = null;
  current.onerror = null;
  current.onclose = null;
  if (current.readyState === WebSocket.OPEN || current.readyState === WebSocket.CONNECTING) {
    current.close();
  }
};

const scheduleReconnect = (delay) => {
  if (manualClose || reconnectTimer || !socketUrl) return;
  const wait = delay != null
    ? delay
    : reconnectAttempts === 0
      ? 300
      : Math.min(RECONNECT_INTERVAL * 2 ** (reconnectAttempts - 1), MAX_RECONNECT_INTERVAL);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    reconnectAttempts += 1;
    connect(socketUrl);
  }, wait);
};

const NOTIFICATION_TEMPLATE_KEYS = {
  'deposit successful': 'depositSuccessful',
  'recharge bonus credited': 'rechargeBonusCredited',
  'withdrawal successful': 'withdrawalSuccessful',
  'withdrawal failed': 'withdrawalFailed',
  'available to claim notification': 'availableToClaim',
  'issued notification': 'issuedNotification',
  'vip weekly reward notification': 'vipWeeklyGiftPack',
  'vip monthly reward notification': 'vipMonthlyReward',
  'gold coin rain notice': 'goldCoinRain',
};

const fillTemplate = (template, values = {}) =>
  String(template || '').replace(/\{([A-Za-z0-9_]+)\}/g, (placeholder, key) => {
    const value = values?.[key];
    return value === undefined || value === null ? placeholder : String(value);
  });

const notificationCopy = (notification) => {
  const backendContent = String(notification?.content || '');
  if (backendContent.trim()) {
    return { title: String(notification?.title || ''), line: backendContent };
  }
  const templates = messages[getCurrentLang()]?.noticeDetail?.messageTemplates || messages.en?.noticeDetail?.messageTemplates || {};
  const templateKey = NOTIFICATION_TEMPLATE_KEYS[String(notification?.title || '').trim().toLowerCase()];
  const template = templateKey ? templates[templateKey] : null;
  if (!template) {
    return {
      title: String(notification?.title || ''),
      line: fillTemplate(notification?.content_template, notification?.data),
    };
  }
  return {
    title: template.title || '',
    line: fillTemplate(template.content, notification?.data),
  };
};

const applyUnread = (key, data) => {
  const store = useUserStore.getState();
  const count = typeof data === 'number' ? data : data?.[key] ?? data?.count ?? data?.unread_count;
  const current = key === 'notice_count' ? store.noticeUnreadCount : store.messageUnreadCount;
  if (count === undefined || Number(count) === Number(current)) {
    store.fetchUnreadCount();
    return;
  }
  store.setUnreadCount({ [key]: count });
};

const handleNotify = async (type, data) => {
  try {
    const store = useUserStore.getState();
    if (type === 3) {
      const balance = data?.balance ?? data?.user?.balance ?? data?.user_info?.balance;
      if (balance !== undefined) {
        store.updateBalance(balance);
        return;
      }
      if (store.isLoggedIn) await store.fetchUserInfo();
      return;
    }
    if (type === 4) applyUnread('message_count', data);
    if (type === 5) applyUnread('notice_count', data);
  } catch (error) {
    console.error('[ws] notify failed:', error);
  }
};

const handleSystemNotification = (message) => {
  const notification = message?.data;
  const isNotify = message?.code === 200 && (message?.type === 'notify_message' || message?.type === 'public_notify_message');
  const popup = isNotify && (Number(notification?.type) === 1 || Number(notification?.type) === 2);
  const hasContent = Boolean(String(notification?.content || '').trim() || String(notification?.content_template || '').trim());
  if (!popup || !notification?.title || !hasContent || Number(notification?.reminder_type) !== 2) return false;
  const copy = notificationCopy(notification);
  toast.info(copy.line ? `${copy.title}\n${copy.line}` : copy.title);
  useUserStore.getState().fetchUnreadCount();
  return true;
};

const handleFrame = (message) => {
  if (controlId(message) === 'connect') return;
  if (controlId(message) === 'ws_replaced' || controlReason(message) === 'ws_replaced') {
    replaced = true;
    return;
  }
  if (Number(message?.code) === 4001 && (controlReason(message) === 'session_replaced' || controlId(message) === 'kick')) {
    wsClient.handleTokenExpired(message?.msg || message?.data?.msg || message?.message);
    return;
  }
  if (message?.type === 'ping') {
    send({ type: 'pong' });
    markActivity();
    return;
  }
  if (message?.type === 'pong') {
    markActivity();
    return;
  }
  if (handleSystemNotification(message)) return;
  if (message?.type === 'notify_message' || message?.type === 'public_notify_message') {
    const payload = message.data;
    const type = Number(payload?.type);
    if (payload && type !== 1 && type !== 2) handleNotify(type, payload.data);
  }
};

const connect = (url, token = tokenManager.getToken() || null) => {
  if (!url) return;
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
  socketUrl = url;
  manualClose = false;
  const nextToken = token || null;
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) && boundToken === nextToken) {
    return;
  }
  closeSocket();
  boundToken = nextToken;
  let current;
  try {
    current = new WebSocket(buildSocketUrl(url, nextToken));
  } catch (error) {
    console.error('[ws] connection failed:', error);
    boundToken = null;
    scheduleReconnect();
    return;
  }
  socket = current;
  current.onopen = () => {
    if (socket !== current) return;
    reconnectAttempts = 0;
    replaced = false;
    startHeartbeat();
  };
  current.onmessage = (event) => {
    if (socket !== current) return;
    try {
      handleFrame(JSON.parse(event.data));
    } catch (error) {
      console.error('[ws] parse failed:', error);
    }
  };
  current.onerror = () => {
    if (socket !== current) return;
    console.error('[ws] connection error');
  };
  current.onclose = () => {
    if (socket !== current) return;
    socket = null;
    boundToken = null;
    clearHeartbeat();
    if (manualClose) return;
    const delay = replaced ? 400 : undefined;
    replaced = false;
    scheduleReconnect(delay);
  };
};

const ensureListeners = () => {
  if (listenersReady) return;
  listenersReady = true;
  onTokenChange((token) => {
    if (!socketUrl) return;
    connect(socketUrl, token || null);
  });
  AppState.addEventListener('change', (state) => {
    if (state !== 'active' || manualClose || !socketUrl) return;
    if (!socket || socket.readyState === WebSocket.CLOSED) connect(socketUrl);
  });
};

export async function initWebSocket() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    ensureListeners();
    let url = useSystemStore.getState().appConfig?.ws;
    if (!url) {
      await useSystemStore.getState().loadAppConfig().catch(() => {});
      url = useSystemStore.getState().appConfig?.ws;
    }
    if (!url) {
      initPromise = null;
      throw new Error('WebSocket address is missing');
    }
    connect(url);
    return wsClient;
  })();
  return initPromise;
}

export const wsClient = {
  logout() {
    manualClose = true;
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
    closeSocket();
  },
  reconnectAsGuest() {
    manualClose = false;
    if (socketUrl) connect(socketUrl, null);
  },
  async handleTokenExpired(message) {
    const { handleAuthExpiredState } = await import('@/services/auth-expiry');
    await handleAuthExpiredState(message);
  },
};
