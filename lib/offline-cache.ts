import { get, set } from 'idb-keyval';

// وظيفة لتخزين ملفات JSON فقط
export async function cacheJsonData(key: string, url: string) {
  try {
    const cachedData = await get(key);
    if (cachedData) {
      return cachedData;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch JSON from ${url}`);
    const data = await response.json();
    await set(key, data);
    return data;
  } catch (error) {
    console.error(`Error caching ${key}:`, error);
    return null;
  }
}