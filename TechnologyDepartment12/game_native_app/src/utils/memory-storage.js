import AsyncStorage from '@react-native-async-storage/async-storage';

const memory = new Map();

export const memoryStorage = {
  getItem(key) {
    return memory.has(key) ? memory.get(key) : null;
  },
  setItem(key, value) {
    const next = value == null ? '' : String(value);
    memory.set(key, next);
    AsyncStorage.setItem(key, next).catch((error) => {
      console.warn(`[storage] persist ${key} failed:`, error);
    });
  },
  removeItem(key) {
    memory.delete(key);
    AsyncStorage.removeItem(key).catch((error) => {
      console.warn(`[storage] remove ${key} failed:`, error);
    });
  },
  async clear() {
    memory.clear();
    await AsyncStorage.clear();
  },
};

export async function hydrateMemoryStorage() {
  const keys = await AsyncStorage.getAllKeys();
  if (!keys.length) {
    return;
  }
  const pairs = await AsyncStorage.multiGet(keys);
  pairs.forEach(([key, value]) => {
    if (value != null) {
      memory.set(key, value);
    }
  });
}
