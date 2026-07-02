const TAG_SYSTEM = {
  MERIDIAN: ['太阳病','阳明病','少阳病','少阴病','厥阴病','太阴病'],
  TYPE: ['解表剂','攻下剂','和解剂','温里剂','清热剂','补益剂','祛湿剂','理血剂','固涩剂','驱虫剂','祛痰剂','润下剂'],
  SYMPTOM: ['汗出','无汗','发热','恶寒','头痛','身痛','喘咳','呕吐','下利','便秘','烦躁','心悸','腹满痛','小便不利','口渴','项背强','厥逆','不眠','胸胁满','谵语','瘀血','水饮','黄疸','蛔虫','表郁'],
  PATHOLOGY_MAP: {
    '风邪袭表': ['表虚','表实'],
    '营卫不和': ['营卫不和'],
    '寒邪束表': ['表实'],
    '营卫闭塞': ['表实'],
    '阳明腑实': ['腑实','里热'],
    '少阳枢机不利': ['少阳枢机'],
    '正邪分争': ['少阳枢机'],
    '上热下寒': ['寒热错杂','上热下寒'],
    '寒热错杂': ['寒热错杂'],
    '阴阳两虚': ['阴阳两虚'],
    '阳虚为主': ['阳虚','阴阳两虚'],
    '心肾不交': ['心肾不交','阴虚'],
    '水饮内停': ['水饮内停'],
    '脾肾阳虚': ['阳虚','水饮内停'],
    '肾阴亏虚': ['阴虚'],
    '瘀热互结': ['瘀血内阻','里热']
  },
  HERB_PAIR_MAP: {
    '桂枝、芍药': '桂芍',
    '麻黄、桂枝': '麻桂',
    '柴胡、黄芩': '柴芩',
    '附子、干姜': '附姜',
    '茯苓、桂枝': '苓桂',
    '麻黄、杏仁': '麻杏',
    '石膏、知母': '石膏知母',
    '桃仁、大黄': '桃核',
    '当归、桂枝': '归桂',
    '芍药、甘草': '芍甘',
    '栀子、豆豉': '栀豉',
    '黄连、阿胶': '连胶',
    '乌梅、黄连': '乌头',
    '人参、干姜': '参姜',
    '茯苓、白术': '苓术',
    '附子、白术': '附术',
    '茵陈、栀子': '茵栀',
    '黄连、黄芩': '黄白',
    '猪苓、阿胶': '猪胶',
    '麻黄、附子': '麻附',
    '大黄、芒硝': '大黄硝',
    '水蛭、虻虫': '抵当'
  },
  SPECIAL: ['太少两感','表里双解','寒热错杂','上热下寒','阳郁厥逆','戴阳','脾约','蓄水','蓄血','水逆','蛔厥','阴盛格阳','亡阳虚脱','气阴两伤','心肾不交','血虚寒厥','风湿痹痛','阳虚外感','误下后','急救回阳']
};

/**
 * 分类提取卡片标签为三层结构
 * @param {Object} card - 卡片对象
 * @returns {Object} { layer1, layer2, layer3 }
 */
function classifyCardTags(card) {
  const tags = card.tags || [];
  const layer1 = { meridian: [], type: [] };
  const layer2 = { symptoms: [], pathologies: [], herbPairs: [], specials: [] };
  const layer3 = { dynamic: [] };

  // 第一层：从 tags 分类
  tags.forEach(t => {
    if (TAG_SYSTEM.MERIDIAN.includes(t)) layer1.meridian.push(t);
    else if (TAG_SYSTEM.TYPE.includes(t)) layer1.type.push(t);
    else if (TAG_SYSTEM.SPECIAL.includes(t)) layer2.specials.push(t);
  });

  // 第二层：症状从 canonical.symptom_profile 提取
  const profile = card.data?.canonical?.symptom_profile || {};
  const allSymptoms = [...(profile.necessary || []), ...(profile.common || [])];
  layer2.symptoms = allSymptoms.filter(s => TAG_SYSTEM.SYMPTOM.includes(s));
  // 未匹配的症状也保留（兜底）
  allSymptoms.forEach(s => {
    if (!layer2.symptoms.includes(s)) layer2.symptoms.push(s);
  });

  // 第二层：病机从 canonical.pathology 文字匹配
  const pathologyText = card.data?.canonical?.pathology || '';
  Object.entries(TAG_SYSTEM.PATHOLOGY_MAP).forEach(([key, vals]) => {
    if (pathologyText.includes(key)) {
      vals.forEach(v => { if (!layer2.pathologies.includes(v)) layer2.pathologies.push(v); });
    }
  });
  // 未匹配则保留原文（兜底）
  if (layer2.pathologies.length === 0 && pathologyText) {
    layer2.pathologies.push(pathologyText);
  }

  // 第二层：药对从 core_combinations 映射
  const coreCombo = card.data?.canonical?.core_combinations || '';
  const herbs = coreCombo.split(/[,，、]/).map(h => h.trim()).filter(Boolean);
  // 双药配对
  for (let i = 0; i < herbs.length; i++) {
    for (let j = i + 1; j < herbs.length; j++) {
      const pair = `${herbs[i]}、${herbs[j]}`;
      const reversePair = `${herbs[j]}、${herbs[i]}`;
      const mapped = TAG_SYSTEM.HERB_PAIR_MAP[pair] || TAG_SYSTEM.HERB_PAIR_MAP[reversePair];
      if (mapped && !layer2.herbPairs.includes(mapped)) layer2.herbPairs.push(mapped);
    }
  }
  // 兜底：如果core_combinations未匹配，直接保留原文
  if (layer2.herbPairs.length === 0 && coreCombo) {
    layer2.herbPairs.push(coreCombo);
  }

  // 第三层：从 mastery 向量计算
  const mastery = card.mastery || {};
  Object.entries(mastery).forEach(([vec, data]) => {
    if (data.streak_wrong >= 3) {
      layer3.dynamic.push({ type: 'weak', text: `薄弱：${vec}` });
    }
  });
  const allMastered = Object.keys(mastery).length > 0 && Object.values(mastery).every(d => (d.level || 0) >= 3);
  if (allMastered) {
    layer3.dynamic.push({ type: 'master', text: '已掌握' });
  }
  // 易混淆：从错题本（需要外部传入 wrongStats）
  // 这里先留空，由调用方补充

  return { layer1, layer2, layer3 };
}

/**
 * 渲染三层标签为 HTML
 * @param {Object} card - 卡片对象
 * @returns {String} HTML 字符串
 */
function renderTagSystem(card) {
  const { layer1, layer2, layer3 } = classifyCardTags(card);

  const meridianClassMap = {
    '太阳病': 'tag-taiyang',
    '阳明病': 'tag-yangming',
    '少阳病': 'tag-shaoyang',
    '少阴病': 'tag-shaoyin',
    '厥阴病': 'tag-jueyin',
    '太阴病': 'tag-taiyin'
  };

  let html = '<div class="learn-tags">\n';

  // 第一层：分类维度
  layer1.meridian.forEach(t => {
    const cls = meridianClassMap[t] || 'tag-taiyang';
    html += `  <span class="tag tag-meridian ${cls}" onclick="showTagCluster('${t}')">${t}</span>\n`;
  });
  layer1.type.forEach(t => {
    html += `  <span class="tag tag-type" onclick="showTagCluster('${t}')">${t}</span>\n`;
  });

  // 分隔（第二层开始）
  if ((layer1.meridian.length || layer1.type.length) && (layer2.symptoms.length || layer2.pathologies.length || layer2.herbPairs.length || layer2.specials.length)) {
    html += '  <span class="tag-divider"></span>\n';
  }

  // 第二层：核心症状
  layer2.symptoms.forEach(t => {
    html += `  <span class="tag tag-symptom" onclick="showTagCluster('${t}')">${t}</span>\n`;
  });

  // 第二层：核心病机
  layer2.pathologies.forEach(t => {
    html += `  <span class="tag tag-pathology" onclick="showTagCluster('${t}')">${t}</span>\n`;
  });

  // 第二层：核心药对
  layer2.herbPairs.forEach(t => {
    html += `  <span class="tag tag-herb" onclick="showTagCluster('${t}')">${t}</span>\n`;
  });

  // 第二层：特殊属性
  layer2.specials.forEach(t => {
    html += `  <span class="tag tag-special" onclick="showTagCluster('${t}')">${t}</span>\n`;
  });

  // 第三层：动态标签（只有异常才显示）
  if (layer3.dynamic.length > 0) {
    html += '  <span class="tag-spacer"></span>\n';
    layer3.dynamic.forEach(d => {
      const dotClass = d.type === 'weak' ? 'dot-red' : d.type === 'master' ? 'dot-green' : 'dot-orange';
      html += `  <span class="tag-dynamic ${d.type}"><span class="dot ${dotClass}"></span>${d.text}</span>\n`;
    });
  }

  html += '</div>';
  return html;
}

// 导出（如果模块化）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TAG_SYSTEM, classifyCardTags, renderTagSystem };
}
