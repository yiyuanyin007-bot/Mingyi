/**
 * SearchUtils — 搜索工具集
 * 职责：方名匹配、拼音首字母匹配、标签匹配、搜索历史管理
 * 纯函数，无状态依赖，无副作用
 */

/** 拼音首字母映射表（35核心方 + 常用方） */
const PINYIN_MAP = {
  'gui-zhi-tang': 'GZT', 'ma-huang-tang': 'MHT', 'ge-gen-tang': 'GGT',
  'xiao-chai-hu-tang': 'XCHT', 'da-cheng-qi-tang': 'DCQT', 'xiao-jian-zhong-tang': 'XJZT',
  'da-qing-long-tang': 'DQLT', 'xiao-qing-long-tang': 'XQLT', 'gui-zhi-jia-fu-zi-tang': 'GZJFT',
  'gui-zhi-tang-jia-ge-gen': 'GZTJG', 'ma-huang-tang-jia-zhu': 'MHTJZ', 'chai-hu-jia-long-gu-mu-li-tang': 'CHJLGMT',
  'wu-ling-san': 'WLS', 'ling-gui-zhu-gan-tang': 'LGZGT', 'si-ni-tang': 'SNT',
  'zhen-wu-tang': 'ZWT', 'bai-hu-tang': 'BHT', 'bai-hu-jia-ren-shen-tang': 'BHJRT',
  'tiao-wei-cheng-qi-tang': 'TWCQT', 'zhi-zi-chi-tang': 'ZZCT', 'zhi-zi-hou-po-tang': 'ZZHPT',
  'zhi-zi-gan-jiang-tang': 'ZZGJT', 'fu-ling-si-ni-tang': 'FSNT', 'tao-he-cheng-qi-tang': 'THCQT',
  'di-dang-tang': 'DDT', 'da-chai-hu-tang': 'DCHT', 'chai-hu-jia-mang-xiao-tang': 'CHJMXT',
  'ge-gen-jia-ban-xia-tang': 'GGJBXT', 'ge-gen-huang-qin-huang-lian-tang': 'GGHQHLT',
  'gui-zhi-ma-huang-ge-ban-tang': 'GZMHGBT', 'gui-zhi-er-yue-bi-yi-tang': 'GZEYBYT',
  'gan-jiang-fu-zi-tang': 'GJFWT', 'ma-huang-fu-zi-xi-xin-tang': 'MHFZXST',
  'huang-lian-e-jiao-tang': 'HLEJT', 'fu-zi-tang': 'FZT', 'si-ni-san': 'SNS',
  'zhu-ling-tang': 'ZLT', 'li-zhong-wan': 'LZW', 'wu-mei-wan': 'WMW',
  'dang-gui-si-ni-tang': 'DGSNT', 'bai-tou-weng-tang': 'BTWT', 'huang-qin-tang': 'HQT',
  'si-ni-jia-ren-shen-tang': 'SNJRT', 'huang-qin-jia-ban-xia-sheng-jiang-tang': 'HQJBXT',
  'zhi-gan-cao-tang': 'ZGST', 'xiao-cheng-qi-tang': 'XCQT', 'wu-zhu-yu-tang': 'WZYT',
  'ma-zi-ren-wan': 'MZRW', 'yin-chen-hao-tang': 'YCHT', 'shao-yao-gan-cao-tang': 'SYGCT',
  'gan-cao-gan-jiang-tang': 'GCGJT', 'gui-zhi-gan-cao-tang': 'GZGCT', 'fu-ling-gui-zhi-gan-cao-da-zao-tang': 'FLGZGCDZT',
  'fu-ling-gui-zhi-bai-zhu-gan-cao-tang': 'FLGZBZGCT', 'gui-zhi-ren-shen-tang': 'GZ RST',
  'gui-zhi-fu-zi-tang': 'GZFZT', 'gan-cao-fu-zi-tang': 'GCFZT', 'tong-mai-si-ni-tang': 'TM SNT',
  'tao-hua-tang': 'THT', 'bai-tong-tang': 'BTT', 'gui-zhi-jia-shao-yao-tang': 'GZJSYT',
  'gui-zhi-jia-da-huang-tang': 'GZJDHT', 'ma-huang-fu-zi-gan-cao-tang': 'MHFZGCT',
  'dang-gui-si-ni-jia-wu-zhu-yu-sheng-jiang-tang': 'DGSNJWZYSJT',
  'gan-jiang-huang-qin-huang-lian-ren-shen-tang': 'GJHQHLRST',
  'zhu-ye-shi-gao-tang': 'ZYSGT', 'gan-cao-tang': 'GCT', 'jie-geng-tang': 'JGT',
  'ban-xia-san-ji-tang': 'BXSJT', 'ku-jiu-tang': 'KJT', 'gui-zhi-jia-gui-tang': 'GZJGT',
  'shao-yao-gan-cao-fu-zi-tang': 'SYGCFZT', 'bai-tong-jia-zhu-dan-zhi-tang': 'BTJZDZT',
  'zhu-fu-tang': 'ZFT', 'ma-huang-sheng-ma-tang': 'MHSMT', 'wen-ge-san': 'WGS',
  'huang-lian-tang': 'HLT', 'gui-zhi-qu-shao-yao-jia-fu-zi-tang': 'GZQSYJFZT',
  'gui-zhi-er-ma-huang-yi-tang': 'GZEMY YT', 'gui-zhi-qu-gui-jia-fu-ling-bai-zhu-tang': 'GZQGJFLBZT',
  'qu-gui-jia-bai-zhu-tang': 'QGJBZT', 'gui-zhi-qu-shao-yao-jia-shu-qi-mu-li-long-gu-jiu-ni-tang': 'GZQSYJSQMLGJNT',
  'gui-zhi-jia-shao-yao-sheng-jiang-ge-yi-ren-shen-san-xin-jia-tang': 'GZJSYSJGY RSS XJT',
  'ma-huang-lian-qiao-chi-xiao-dou-tang': 'MHLQCXDT', 'zhi-shi-zhi-zi-chi-tang': 'ZSZ ZCT',
  'mu-li-ze-xie-san': 'MLZXS', 'zhu-dan-zhi-fang': 'ZDZF', 'mi-jian-dao-fang': 'MJDF',
  'tu-gua-gen-zhi-fang': 'TGGZF', 'shao-kun-san': 'SKS', 'tong-mai-si-ni-jia-zhu-dan-zhi-tang': 'TM SNTJZDZT'
};

/**
 * 获取卡片拼音首字母
 * @param {string} cardId - 卡片ID
 * @returns {string} 拼音首字母大写
 */
export function getPinyinInitials(cardId) {
  return PINYIN_MAP[cardId] || cardId.split('-').map(s => s[0].toUpperCase()).join('');
}

/**
 * 按方名模糊匹配
 * @param {Array} cards - 卡片数组
 * @param {string} query - 搜索关键词
 * @returns {Array} 匹配的卡片
 */
export function matchByName(cards, query) {
  return cards.filter(c =>
    c.name.includes(query) ||
    (c.formula_name && c.formula_name.includes(query))
  );
}

/**
 * 按拼音首字母匹配
 * @param {Array} cards - 卡片数组
 * @param {string} query - 搜索关键词（大写）
 * @returns {Array} 匹配的卡片
 */
export function matchByPinyin(cards, query) {
  const upper = query.toUpperCase();
  return cards.filter(c => {
    const initials = getPinyinInitials(c.id);
    return initials === upper || initials.includes(upper);
  });
}

/**
 * 按标签匹配
 * @param {Array} cards - 卡片数组
 * @param {string} query - 搜索关键词
 * @returns {Array} 匹配的卡片
 */
export function matchByTag(cards, query) {
  return cards.filter(c => c.tags && c.tags.some(t => t.includes(query)));
}

/**
 * 联合搜索（三种匹配方式去重合并）
 * @param {Array} cards - 卡片数组
 * @param {string} query - 搜索关键词
 * @returns {Array} 去重后的匹配卡片
 */
export function searchCards(cards, query) {
  if (!query || !query.trim()) return cards;
  
  const nameMatches = matchByName(cards, query);
  const pinyinMatches = matchByPinyin(cards, query);
  const tagMatches = matchByTag(cards, query);
  
  const matchedIds = new Set();
  const filtered = [];
  
  [nameMatches, pinyinMatches, tagMatches].forEach(list => {
    list.forEach(c => {
      if (!matchedIds.has(c.id)) {
        matchedIds.add(c.id);
        filtered.push(c);
      }
    });
  });
  
  return filtered;
}

/**
 * 保存搜索历史到 localStorage
 * @param {string} query - 搜索关键词
 */
export function saveSearchHistory(query) {
  try {
    let history = JSON.parse(localStorage.getItem('search_history_v9') || '[]');
    history = history.filter(q => q !== query);
    history.unshift(query);
    localStorage.setItem('search_history_v9', JSON.stringify(history.slice(0, 10)));
  } catch (e) {
    console.warn('[Search] 保存搜索历史失败:', e);
  }
}

/**
 * 读取搜索历史
 * @returns {Array} 搜索历史数组
 */
export function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem('search_history_v9') || '[]');
  } catch (e) {
    return [];
  }
}

/**
 * 清除搜索历史
 */
export function clearSearchHistory() {
  localStorage.removeItem('search_history_v9');
}
