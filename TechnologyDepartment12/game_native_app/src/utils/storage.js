import getCurrentLang from '@/utils/getCurrentLang';
import { memoryStorage } from '@/utils/memory-storage';

const VERSION = 1;

const storageKeyFor = (storageKey) => `storage-cache-${getCurrentLang()}-${storageKey}`;

const readStorageCache = (key) => {
  try {
    const rawValue = memoryStorage.getItem(key);
    if (!rawValue) return null;
    const cachedValue = JSON.parse(rawValue);
    if (!cachedValue || typeof cachedValue !== 'object') {
      memoryStorage.removeItem(key);
      return null;
    }
    return cachedValue;
  } catch (error) {
    console.warn(`[storage] Failed to read cache "${key}":`, error);
    return null;
  }
};

const isCacheValid = (cachedValue, maxAge) =>
  cachedValue?.version === VERSION && (!maxAge || Date.now() - cachedValue.updateTime < maxAge);

const writeStorageCache = (key, data) => {
  memoryStorage.setItem(key, JSON.stringify({ version: VERSION, data, updateTime: Date.now() }));
};

export default async function cachedRequest({ apiFunc, storageKey, success, isUpdate = true, maxAge, isOpenStorage = true }) {
  if (!isOpenStorage) return apiFunc();
  const key = storageKeyFor(storageKey);
  const cachedValue = readStorageCache(key);
  const hasValidCache = isCacheValid(cachedValue, maxAge);

  if (hasValidCache) {
    success(cachedValue.data);
    void apiFunc()
      .then((apiResult) => {
        if (JSON.stringify(cachedValue.data) === JSON.stringify(apiResult)) return;
        writeStorageCache(key, apiResult);
        if (isUpdate) success(apiResult);
      })
      .catch((error) => {
        console.warn(`[storage] Failed to refresh cache "${key}":`, error);
      });
    return cachedValue.data;
  }

  const apiResult = await apiFunc();
  writeStorageCache(key, apiResult);
  success(apiResult);
  return apiResult;
}
