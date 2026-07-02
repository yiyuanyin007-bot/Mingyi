/**
 * DataService — 数据加载与缓存
 * 职责：从服务器/本地加载卡片数据，提供缓存和失败回退
 */

/** 数据路径（Vite public 目录，以 / 开头表示绝对路径） */
const DATA_PATHS = {
  cards: '/data/formula_cards.json',
  experiences: '/data/experience_cards.json',
  sources: '/data/source_cards.json'
};

/** 内存缓存 */
const cache = new Map();

/**
 * 加载 JSON 数据
 * @param {string} key - 'cards' | 'experiences' | 'sources'
 * @param {boolean} useCache - 是否使用缓存（默认 true）
 * @returns {Promise<Array>} 数据数组
 */
export async function loadData(key, useCache = true) {
  if (useCache && cache.has(key)) {
    return cache.get(key);
  }

  const path = DATA_PATHS[key];
  if (!path) {
    throw new Error(`Unknown data key: ${key}`);
  }

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cache.set(key, data);
    return data;
  } catch (err) {
    console.warn(`[DataService] 加载 ${key} 失败:`, err);
    // 返回空数组作为安全回退，避免页面崩溃
    return [];
  }
}

/**
 * 预加载全部数据
 * @returns {Promise<{ cards, experiences, sources }>}
 */
export async function preloadAll() {
  const [cards, experiences, sources] = await Promise.all([
    loadData('cards'),
    loadData('experiences'),
    loadData('sources')
  ]);
  return { cards, experiences, sources };
}

/**
 * 清除缓存（用于数据刷新）
 */
export function clearCache() {
  cache.clear();
}

/**
 * 获取缓存中的数据（同步）
 * @param {string} key
 * @returns {Array|undefined}
 */
export function getCached(key) {
  return cache.get(key);
}
