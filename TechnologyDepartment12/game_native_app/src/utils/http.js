import { messages } from '@/i18n/messages';
import { toast } from '@/services/toast-store';
import { getSafeErrorMessage, SILENT_NETWORK_ERROR_MESSAGE } from '@/utils/error-message';
import getCurrentLang from '@/utils/getCurrentLang';
import tokenManager from '@/utils/token-manager';

// const API_BASE_URL = 'https://a91.top';
const API_BASE_URL = 'https://green.sukim.top';
const API_VERSION = 'green';

const getTranslation = (key, fallback) => {
  try {
    const locale = getCurrentLang();
    const currentMessages = messages[locale] || messages.en;
    const value = key.split('.').reduce((current, part) => current?.[part], currentMessages);
    return value !== undefined ? value : fallback;
  } catch {
    return fallback;
  }
};

const getResponseMessage = (data, fallbackKey = 'errors.requestFailed', fallbackText = 'Request failed, please try again') =>
  getSafeErrorMessage(data?.message || data?.msg, getTranslation(fallbackKey, fallbackText));

const preserveLongIntegerIds = (text) =>
  text.replace(/("(?:\\.|[^"\\])*")|(-?\d{16,})(?=\s*[,}\]])/g, (match, quoted, number) => quoted || `"${number}"`);

const parseJsonSafely = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(preserveLongIntegerIds(text));
  } catch {
    return {
      code: response.status,
      message: `Invalid JSON response: ${response.status}`,
      rawText: text,
    };
  }
};

const buildStructuredError = (payload = {}, fallbackMessage, extra = {}) => {
  const { useFallbackMessage = false, ...errorExtra } = extra;
  const message = useFallbackMessage
    ? fallbackMessage
    : getSafeErrorMessage(payload?.message || payload?.msg, fallbackMessage);
  return {
    ...payload,
    ...errorExtra,
    msg: message,
    message,
    silent: Boolean(extra.silent ?? payload?.silent),
  };
};

const shouldHandleAuth = (code) => code === 401 || code === 402 || code === 4001;

const appendRequestParamsToUrl = (inputUrl, params) => {
  try {
    const isAbsolute = inputUrl.startsWith('http://') || inputUrl.startsWith('https://');
    const url = new URL(inputUrl, 'http://local.test');
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });
    return isAbsolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return inputUrl;
  }
};

class HttpRequest {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.timeout = 30000;
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
    return this;
  }

  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
    return this;
  }

  async runRequestInterceptors(options) {
    let next = { ...options };
    for (const interceptor of this.requestInterceptors) {
      next = await interceptor(next);
    }
    return next;
  }

  async runResponseInterceptors(response) {
    let next = { ...response };
    for (const interceptor of this.responseInterceptors) {
      next = await interceptor(next);
    }
    return next;
  }

  _showLoading() {
    toast.info(getTranslation('common.loading', 'Loading...'));
  }

  async request(options) {
    options.headers = options.headers || {};
    try {
      const customBaseUrl = options.headers?.baseUrl;
      const baseUrlToUse = customBaseUrl || this.baseUrl;
      delete options.headers?.baseUrl;

      const interceptedOptions = await this.runRequestInterceptors({
        ...options,
        url: options.url.startsWith('http') ? options.url : `${baseUrlToUse}${options.url}`,
      });

      if (interceptedOptions.showLoading === true) {
        this._showLoading();
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      const isFormData = typeof FormData !== 'undefined' && interceptedOptions.body instanceof FormData;
      const headers = { ...interceptedOptions.headers };
      if (isFormData) {
        delete headers['Content-Type'];
      } else if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(interceptedOptions.url, {
        method: interceptedOptions.method || 'GET',
        headers,
        body: interceptedOptions.body,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 402) {
          const { handleAuthExpiredState } = await import('@/services/auth-expiry');
          await handleAuthExpiredState();
          throw { code: 401, type: 'AUTH_ERROR', message: 'Unauthorized' };
        }
        const errorData = await parseJsonSafely(response);
        if (errorData && Object.keys(errorData).length > 0) {
          const message = getResponseMessage(errorData, 'errors.requestFailed', `HTTP ${response.status}`);
          throw buildStructuredError(errorData, message, { code: errorData.code ?? response.status });
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await parseJsonSafely(response);
      return await this.runResponseInterceptors({
        statusCode: response.status,
        data,
        config: interceptedOptions,
      });
    } catch (error) {
      const isInterceptorReject = error && (error.type === 'AUTH_ERROR' || (error.code && error.code !== -1));
      if (isInterceptorReject) throw error;
      console.error('Network request failed:', error);
      throw buildStructuredError(error, SILENT_NETWORK_ERROR_MESSAGE, {
        code: -1,
        data: null,
        type: 'NETWORK_ERROR',
        silent: true,
        useFallbackMessage: true,
      });
    }
  }

  get(url, params = {}, options = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
    ).toString();
    return this.request({
      url: query ? `${url}?${query}` : url,
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  }

  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: JSON.stringify(data),
      ...options,
    });
  }

  put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: JSON.stringify(data),
      ...options,
    });
  }

  delete(url, params = {}, options = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
    ).toString();
    return this.request({
      url: query ? `${url}?${query}` : url,
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  }

  upload(url, file, options = {}) {
    const formData = new FormData();
    formData.append(options.name || 'file', file);
    formData.append('lang', getCurrentLang());
    formData.append('version', API_VERSION);
    Object.entries(options.formData || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    return this.request({
      url,
      method: 'POST',
      body: formData,
      headers: { ...options.headers },
      ...options,
    });
  }
}

const http = new HttpRequest();

http.addRequestInterceptor((options) => {
  options.headers = { Accept: 'application/json', ...options.headers };
  const token = tokenManager.getToken();
  if (token && !options.headers.Authorization) {
    options.headers.Authorization = token;
  }
  const currentLang = getCurrentLang();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !options.headers['Content-Type']) {
    options.headers['Content-Type'] = 'application/json';
  }
  if (options.method === 'GET' || options.method === 'DELETE') {
    options.url = appendRequestParamsToUrl(options.url, { lang: currentLang, version: API_VERSION });
  } else if ((options.method === 'POST' || options.method === 'PUT') && options.body && !isFormData) {
    try {
      const data = JSON.parse(options.body);
      data.lang = currentLang;
      data.version = API_VERSION;
      options.body = JSON.stringify(data);
    } catch {
      // non-json body
    }
  }
  return options;
});

let isShowingAuthModal = false;

http.addResponseInterceptor(async (response) => {
  const { statusCode, data } = response;
  if (statusCode === 401 || statusCode === 402 || shouldHandleAuth(data?.code)) {
    if (!isShowingAuthModal) {
      isShowingAuthModal = true;
      const { handleAuthExpiredState } = await import('@/services/auth-expiry');
      await handleAuthExpiredState(getResponseMessage(data, 'errors.loginExpired', 'Login expired'));
      setTimeout(() => {
        isShowingAuthModal = false;
      }, 800);
    }
    return Promise.reject({ code: 401, type: 'AUTH_ERROR', message: 'Unauthorized' });
  }
  if (!data) {
    return Promise.reject(
      buildStructuredError({}, getTranslation('errors.emptyResponse', 'Empty response data'), { code: -1 }),
    );
  }
  if (response.config?.rawResponse) return data;
  if (data.code !== 200 && data.code !== -1) {
    return Promise.reject(buildStructuredError(data, getResponseMessage(data)));
  }
  return data;
});

export default http;
export const { get, post, put, delete: del, upload } = http;
export { API_BASE_URL, API_VERSION };
