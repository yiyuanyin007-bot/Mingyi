/**
 * DoseConverter — 剂量换算工具
 * 职责：将《伤寒论》古方剂量转换为现代四档标准
 * 标准：教材(1两=3g) / 轻量(1两=6g) / 经方(1两=9g) / 原方(1两=15g)
 */

/** 中文数字映射 */
const CN_NUM_MAP = {
  '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
  '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '百': 100, '千': 1000, '半': 0.5
};

/** 特殊单位映射（无数字前缀） */
const SPECIAL_UNIT_MAP = {
  '方寸匕': { min: 1, max: 2.74, note: '草木1g/金石2.74g' },
  '半方寸匕': { min: 0.5, max: 1.5, note: '一刀圭=1.5g' },
  '一钱匕': { min: 1.5, max: 1.8, note: '一钱匕' },
  '圭': { min: 0.5, max: 0.5, note: '1圭=0.5g' },
  '撮': { min: 2, max: 2, note: '1撮=2g' },
  '一撮': { min: 2, max: 2, note: '1撮=2g' },
  '把': { min: 10, max: 15, note: '竹叶一把≈12g' },
  '一握': { min: 10, max: 15, note: '一握≈12g' },
  '如鸡子大': { min: 50, max: 60, note: '鸡蛋大小，约50-60g' }
};

/** 容量-重量密度映射（g/L） */
const VOLUME_WEIGHT_MAP = {
  '半夏': { perLiter: 130, note: '柯雪帆实测：130g/L' },
  '粳米': { perLiter: 60, note: '仝小林实测：60g/L' },
  '麻仁': { perLiter: 50, note: '柯雪帆实测：50g/L' },
  '赤小豆': { perLiter: 150, note: '仝小林实测：150g/L' },
  '麦冬': { perLiter: 108, note: '仝小林实测：108g/L' }
};

/** 单枚重量映射（g/枚） */
const PIECE_WEIGHT_MAP = {
  '杏仁': { min: 0.3, max: 0.5, note: '0.3-0.5g/枚' },
  '桃仁': { min: 0.3, max: 0.5, note: '0.3-0.5g/枚' },
  '大枣': { min: 3, max: 6, note: '3-6g/枚' },
  '乌梅': { min: 3, max: 6, note: '3-6g/枚' },
  '枳实': { min: 1, max: 2, note: '1-2g/枚' }
};

/** 四档标准 */
const STANDARDS = {
  modern: { name: '教材', liang: 3 },
  light: { name: '轻量', liang: 6 },
  medium: { name: '经方', liang: 9 },
  full: { name: '原方', liang: 15 }
};

/**
 * 解析中文数字
 * @param {string} str
 * @returns {number|null}
 */
function parseChineseNum(str) {
  if (!str) return null;
  if (str === '半') return 0.5;
  let result = 0, current = 0;
  for (let i = 0; i < str.length; i++) {
    const v = CN_NUM_MAP[str[i]];
    if (v === undefined) continue;
    if (v < 10) { current = v; }
    else {
      if (current === 0) current = 1;
      current *= v;
      result += current;
      current = 0;
    }
  }
  result += current;
  return result;
}

/**
 * 解析剂量字符串
 * 支持：中文数字（三两）、阿拉伯数字（3两）、混合（3.5两）、以药名开头（芍药三两→提取三两）
 * @param {string} dosage
 * @returns {{num:number, unit:string, note:string}|null}
 */
function parseChineseDosage(dosage) {
  if (!dosage) return null;

  // 预处理：尝试提取末尾的剂量部分（匹配数字+单位模式）
  // 支持：中文数字（三两）、阿拉伯数字（3两）、混合（3.5两）
  const dosePattern = /(\d+\.?\d*|半|[一二三四五六七八九十百千]+)(两|钱|斤|分|升|合|合半|枚|个|铢|茎|尺|方寸匕|半方寸匕|钱匕|圭|撮|把|一握|如鸡子大)/;
  let cleaned = dosage;
  const m = cleaned.match(dosePattern);
  if (m) {
    cleaned = m[0];
  }

  // 特殊单位：直接匹配
  if (SPECIAL_UNIT_MAP[cleaned]) {
    return { num: 1, unit: cleaned, note: '' };
  }

  // "半"开头
  if (cleaned.startsWith('半')) {
    const rest = cleaned.slice(1);
    const unitM = rest.match(/^([^（(]*)/);
    return { num: 0.5, unit: unitM ? unitM[1] : rest, note: '' };
  }

  // 尝试阿拉伯数字前缀（如"3两"、"12枚"、"3.5g"）
  const arabicMatch = cleaned.match(/^(\d+\.?\d*)/);
  if (arabicMatch) {
    const num = parseFloat(arabicMatch[1]);
    const rest = cleaned.slice(arabicMatch[1].length);
    const unitM = rest.match(/^([^（(]*)([（(].*)?$/);
    const unit = unitM ? unitM[1] : rest;
    const note = unitM && unitM[2] ? unitM[2] : '';
    return { num, unit, note };
  }

  // 中文数字前缀（如"三两"、"十二枚"）
  let numStr = '';
  for (let c of cleaned) {
    if (CN_NUM_MAP[c] !== undefined) numStr += c;
    else break;
  }
  if (!numStr) return null;
  const num = parseChineseNum(numStr);
  const rest = cleaned.slice(numStr.length);
  const unitM = rest.match(/^([^（(]*)([（(].*)?$/);
  const unit = unitM ? unitM[1] : rest;
  const note = unitM && unitM[2] ? unitM[2] : '';
  return { num, unit, note };
}

/** 格式化输出 */
const fmt = (n) => n.toFixed(1).replace(/\.0$/, '') + 'g';
const fmtMl = (n) => n.toFixed(0) + 'ml';
const fmtRange = (a, b) => {
  const min = a.toFixed(1).replace(/\.0$/, '');
  const max = b.toFixed(1).replace(/\.0$/, '');
  return min === max ? min + 'g' : min + '~' + max + 'g';
};

/**
 * 转换剂量为四档标准
 * @param {string} herbName — 药名
 * @param {string} dosage — 剂量原文（如"三两"）
 * @returns {{original:string, modern:string, light:string, medium:string, full:string, unit:string, type:string, note:string}|null}
 */
export function convertDosage(herbName, dosage) {
  if (!dosage) return null;

  // 先检查特殊单位
  if (SPECIAL_UNIT_MAP[dosage]) {
    const s = SPECIAL_UNIT_MAP[dosage];
    return {
      original: dosage,
      modern: fmtRange(s.min, s.max),
      light: fmtRange(s.min, s.max),
      medium: fmtRange(s.min, s.max),
      full: fmtRange(s.min, s.max),
      unit: dosage, type: 'special', note: s.note
    };
  }

  const parsed = parseChineseDosage(dosage);
  if (!parsed) return null;
  const { num, unit, note: rawNote } = parsed;
  const baseNote = rawNote || '';

  // 重量单位
  if (unit === '两') {
    return { original: dosage, modern: fmt(num * 3), light: fmt(num * 6), medium: fmt(num * 9), full: fmt(num * 15), unit, type: 'weight', note: baseNote };
  }
  if (unit === '钱') {
    return { original: dosage, modern: fmt(num * 0.3), light: fmt(num * 0.6), medium: fmt(num * 0.9), full: fmt(num * 1.5), unit, type: 'weight', note: baseNote };
  }
  if (unit === '斤') {
    const liang = num * 16;
    return { original: dosage, modern: fmt(liang * 3), light: fmt(liang * 6), medium: fmt(liang * 9), full: fmt(liang * 15), unit, type: 'weight', note: baseNote + ' 1斤=16两' };
  }
  if (unit === '分') {
    const liang = num * 0.025;
    return { original: dosage, modern: fmt(liang * 3), light: fmt(liang * 6), medium: fmt(liang * 9), full: fmt(liang * 15), unit, type: 'weight', note: baseNote + ' 1两=40分' };
  }
  if (unit === '两半') {
    const liang = num + 0.5;
    return { original: dosage, modern: fmt(liang * 3), light: fmt(liang * 6), medium: fmt(liang * 9), full: fmt(liang * 15), unit, type: 'weight', note: baseNote + ' 一两半=1.5两' };
  }

  // 容量单位
  if (unit === '升') {
    const density = herbName && VOLUME_WEIGHT_MAP[herbName];
    if (density) {
      return { original: dosage, modern: fmt(num * density.perLiter), light: fmt(num * density.perLiter), medium: fmt(num * density.perLiter), full: fmt(num * density.perLiter), unit, type: 'special', note: baseNote + (density.note ? ' ' + density.note : '') };
    }
    return { original: dosage, modern: fmtMl(num * 200), light: fmtMl(num * 200), medium: fmtMl(num * 200), full: fmtMl(num * 200), unit, type: 'volume', note: baseNote };
  }
  if (unit === '合') {
    const density = herbName && VOLUME_WEIGHT_MAP[herbName];
    if (density) {
      return { original: dosage, modern: fmt(num * density.perLiter / 10), light: fmt(num * density.perLiter / 10), medium: fmt(num * density.perLiter / 10), full: fmt(num * density.perLiter / 10), unit, type: 'special', note: baseNote + (density.note ? ' ' + density.note : '') };
    }
    return { original: dosage, modern: fmtMl(num * 20), light: fmtMl(num * 20), medium: fmtMl(num * 20), full: fmtMl(num * 20), unit, type: 'volume', note: baseNote };
  }
  if (unit === '合半') {
    const total = num + 0.5;
    const density = herbName && VOLUME_WEIGHT_MAP[herbName];
    if (density) {
      return { original: dosage, modern: fmt(total * density.perLiter / 10), light: fmt(total * density.perLiter / 10), medium: fmt(total * density.perLiter / 10), full: fmt(total * density.perLiter / 10), unit: '合', type: 'special', note: baseNote + (density.note ? ' ' + density.note : '') };
    }
    return { original: dosage, modern: fmtMl(total * 20), light: fmtMl(total * 20), medium: fmtMl(total * 20), full: fmtMl(total * 20), unit: '合', type: 'volume', note: baseNote };
  }

  // 计数单位
  if (unit === '枚' || unit === '个') {
    const weight = herbName && PIECE_WEIGHT_MAP[herbName];
    if (weight) {
      return { original: dosage, modern: fmtRange(num * weight.min, num * weight.max), light: fmtRange(num * weight.min, num * weight.max), medium: fmtRange(num * weight.min, num * weight.max), full: fmtRange(num * weight.min, num * weight.max), unit, type: 'special', note: baseNote + (weight.note ? ' ' + weight.note : '') };
    }
    return { original: dosage, modern: null, light: null, medium: null, full: null, unit, type: 'count', note: baseNote };
  }

  // 铢单位
  if (unit === '铢') {
    return { original: dosage, modern: fmt(num * 0.125), light: fmt(num * 0.25), medium: fmt(num * 0.375), full: fmt(num * 0.625), unit, type: 'weight', note: baseNote + ' 1两=24铢' };
  }

  // 复合单位：两X铢
  const mCompound = unit.match(/^两(.+)铢$/);
  if (mCompound) {
    const zhu = parseChineseNum(mCompound[1]);
    if (zhu !== null) {
      const totalLiang = num + zhu / 24;
      return { original: dosage, modern: fmt(totalLiang * 3), light: fmt(totalLiang * 6), medium: fmt(totalLiang * 9), full: fmt(totalLiang * 15), unit, type: 'weight', note: baseNote + ' 1两=24铢' };
    }
  }

  // 茎单位
  if (unit === '茎') {
    return { original: dosage, modern: fmtRange(num * 10, num * 15), light: fmtRange(num * 10, num * 15), medium: fmtRange(num * 10, num * 15), full: fmtRange(num * 10, num * 15), unit, type: 'special', note: baseNote + ' 葱白一茎约10-15g' };
  }

  // 尺寸单位
  if (unit === '尺') {
    return { original: dosage, modern: fmtRange(num * 3, num * 6), light: fmtRange(num * 3, num * 6), medium: fmtRange(num * 3, num * 6), full: fmtRange(num * 3, num * 6), unit, type: 'special', note: baseNote + ' 1尺≈3-6g' };
  }

  // 无法识别
  return { original: dosage, modern: null, light: null, medium: null, full: null, unit, type: 'unknown', note: baseNote };
}

/**
 * 获取四档标准名称
 * @returns {Array<{key:string, name:string}>}
 */
export function getDoseStandards() {
  return Object.entries(STANDARDS).map(([key, s]) => ({ key, name: s.name }));
}

/**
 * 判断是否为可换算的剂量
 * @param {string} dosage
 * @returns {boolean}
 */
/**
 * 格式化剂量为紧凑显示文本
 * 四档相同时合并为一行，不同时按值分组
 * @param {Object} converted — convertDosage 返回值
 * @returns {{text:string, note:string}|null}
 */
export function formatDoseCompact(converted) {
  if (!converted) return null;
  if (converted.type === 'unknown') return { text: '暂无换算', note: converted.note || '' };

  const { modern, light, medium, full, note } = converted;

  const standards = [
    { name: '教材', val: modern },
    { name: '轻量', val: light },
    { name: '经方', val: medium },
    { name: '原方', val: full }
  ].filter(s => s.val);

  if (standards.length === 0) return { text: '暂无换算', note: '' };

  // 按值分组（Exp-24：合并相同档）
  const groups = [];
  standards.forEach(s => {
    const existing = groups.find(g => g.val === s.val);
    if (existing) {
      existing.names.push(s.name);
    } else {
      groups.push({ val: s.val, names: [s.name] });
    }
  });

  // 只有一组 = 四档一致（Exp-19）
  if (groups.length === 1) {
    return { text: `≈ ${groups[0].val}`, note: note || '四档一致' };
  }

  // 多组，生成简洁文本
  const parts = groups.map(g => `${g.names.join('/')}: ${g.val}`);
  return { text: parts.join('；'), note: note || '' };
}

/**
 * 判断是否为古方剂量（需要换算）
 * Exp-21：现代单位（g/mg/毫升/ml）返回 false
 * @param {string} dosage
 * @returns {boolean}
 */
export function isAncientDosage(dosage) {
  if (!dosage) return false;
  // 直接匹配特殊古方单位
  if (SPECIAL_UNIT_MAP[dosage]) return true;
  // 解析
  const parsed = parseChineseDosage(dosage);
  if (!parsed) return false;
  // 检查单位是否是古方单位
  const ancientUnits = ['两', '钱', '斤', '分', '升', '合', '枚', '个', '铢', '茎', '尺', '方寸匕', '半方寸匕', '钱匕', '圭', '撮', '把', '握', '如鸡子大', '合半', '两半'];
  return ancientUnits.some(u => parsed.unit === u || parsed.unit.startsWith(u));
}

/**
 * 判断是否为可换算的剂量
 * @param {string} dosage
 * @returns {boolean}
 */
export function isConvertibleDosage(dosage) {
  if (!dosage) return false;
  if (SPECIAL_UNIT_MAP[dosage]) return true;
  const parsed = parseChineseDosage(dosage);
  return parsed !== null;
}
