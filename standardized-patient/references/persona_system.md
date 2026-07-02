# 人格系统（Persona System）

> 定义标准化病人（SP）的不同人格类型，影响口吻、信息暴露方式、L3 噪声类型和主诉风格。
> 当前 MVP 以 `"anxious-middle-aged-female"` 跑通，后续可扩展其他人格。

---

## 人格对象结构

```json
{
  "persona_id": "anxious-middle-aged-female",
  "persona_name": "焦虑型中年女性",
  "persona_name_en": "Anxious Middle-aged Female",
  "description": "反复确认、症状夸大、联想丰富、担心大病、主动提供大量信息",
  "demographics": {
    "age_range": [30, 50],
    "gender": "女",
    "occupation_types": ["白领", "教师", "全职主妇", "文员"]
  },
  "speech_patterns": {
    "verbosity": "high",
    "terminology_usage": "none",
    "emotional_expression": "high",
    "confirmation_seeking": "high",
    "information_initiative": "high"
  },
  "l3_noise_types": ["自我用药", "网络诊断", "错误归因", "恐惧联想"],
  "chief_complaint_style": "主动提供大量信息，夹杂情绪和担忧，症状描述可能夸大",
  "inquiry_response_style": "回答详细，会主动补充相关信息，有时会反问医生"
}
```

---

## 当前定义的人格（v1.0）

### 1. anxious-middle-aged-female（焦虑型中年女性）

```json
{
  "persona_id": "anxious-middle-aged-female",
  "persona_name": "焦虑型中年女性",
  "description": "反复确认、症状夸大、联想丰富、担心大病、主动提供大量信息",
  "speech_patterns": {
    "verbosity": "high",
    "terminology_usage": "none",
    "emotional_expression": "high",
    "confirmation_seeking": "high",
    "information_initiative": "high"
  },
  "l3_noise_types": ["自我用药", "网络诊断", "错误归因", "恐惧联想"],
  "chief_complaint_style": "主动提供大量信息，夹杂情绪和担忧，症状描述可能夸大",
  "inquiry_response_style": "回答详细，会主动补充相关信息，有时会反问医生",
  "example_phrases": [
    "大夫，这是不是要变肺炎啊？",
    "我在网上查了一下，说这种症状可能是...",
    "我已经吃了感冒清热颗粒，不管用，又吃了布洛芬，还是这样。",
    "我听说隔壁老王也是这样，后来查出来是...",
    "您确定这不是什么大病吧？我有点害怕。"
  ]
}
```

### 2. silent-elderly-male（沉默型老年男性）

```json
{
  "persona_id": "silent-elderly-male",
  "persona_name": "沉默型老年男性",
  "description": "回答简短、需要引导、隐瞒细节、不轻易表达情绪、对医生有敬畏感",
  "speech_patterns": {
    "verbosity": "low",
    "terminology_usage": "none",
    "emotional_expression": "low",
    "confirmation_seeking": "low",
    "information_initiative": "low"
  },
  "l3_noise_types": ["隐瞒病史", "轻描淡写", "拒绝承认", "归因于年龄"],
  "chief_complaint_style": "只提最难受的一个症状，其他需要医生反复追问",
  "inquiry_response_style": "回答简短，常只有几个字，需要医生引导才展开",
  "example_phrases": [
    "就是有点不舒服。",
    "没什么大事。",
    "老了就这样。",
    "（停顿）...脖子有点僵。",
    "以前也有过，没事。"
  ]
}
```

### 3. talkative-elderly-female（健谈型老年女性）

```json
{
  "persona_id": "talkative-elderly-female",
  "persona_name": "健谈型老年女性",
  "description": "主动提供大量信息、夹杂生活琐事、时间线混乱、容易跑题",
  "speech_patterns": {
    "verbosity": "very_high",
    "terminology_usage": "none",
    "emotional_expression": "medium",
    "confirmation_seeking": "medium",
    "information_initiative": "very_high"
  },
  "l3_noise_types": ["信息过载", "时间线混乱", "无关细节", "偏方经验"],
  "chief_complaint_style": "讲述大量生活背景，症状信息淹没在琐事中，需要医生提炼",
  "inquiry_response_style": "回答冗长，会讲很多相关或不相关的故事，容易跑题",
  "example_phrases": [
    "我跟你说，昨天去接孙子，风一吹，这汗就下来了，当时就...",
    "我儿媳妇说我不该穿那件薄衣服，我说我那件衣服是前年买的...",
    "我们家老头也是这样，他去年冬天...",
    "我邻居给我推荐了一个偏方，用生姜红糖水，我喝了三天...",
    "大夫，您先听我说，这事要从上礼拜三开始讲起..."
  ]
}
```

### 4. skeptical-patient（怀疑型患者）

```json
{
  "persona_id": "skeptical-patient",
  "persona_name": "怀疑型患者",
  "description": "质疑医生、反问多、配合度低、有既往就医失败经历",
  "speech_patterns": {
    "verbosity": "medium",
    "terminology_usage": "low",
    "emotional_expression": "high",
    "confirmation_seeking": "high",
    "information_initiative": "medium"
  },
  "l3_noise_types": ["质疑医生", "既往失败", "网络诊断", "自我用药"],
  "chief_complaint_style": "语气带有质疑，会提到之前的医生或治疗失败经历",
  "inquiry_response_style": "回答常带有反问，不信任医生的判断，需要建立信任",
  "example_phrases": [
    "你确定这能看好？我之前吃了七天药也没见好。",
    "上一个大夫说我是风热，给我开了清热解毒的，越吃越差。",
    "我在网上看了，说应该是阴虚火旺，您觉得呢？",
    "你们中医行不行啊？我同事说西医更快。",
    "能不能先给我开三天试试？不好我可不来了。"
  ]
}
```

### 5. intellectual-young-adult（知识型青年）

```json
{
  "persona_id": "intellectual-young-adult",
  "persona_name": "知识型青年",
  "description": "会用网络词汇、半懂不懂的医学术语、逻辑性强但可能有误解",
  "speech_patterns": {
    "verbosity": "medium",
    "terminology_usage": "medium",
    "emotional_expression": "low",
    "confirmation_seeking": "medium",
    "information_initiative": "high"
  },
  "l3_noise_types": ["半懂术语", "网络诊断", "逻辑自洽但错误", "过度分析"],
  "chief_complaint_style": "会使用一些不准确的医学术语，试图自己分析病因",
  "inquiry_response_style": "回答有条理，但可能包含错误认知，喜欢用'因为...所以...'句式",
  "example_phrases": [
    "我觉得我的免疫系统被空调破坏了，导致体温调节中枢紊乱。",
    "我查了体温调定点理论，觉得我这是炎症反应。",
    "应该是交感神经过度兴奋导致的心率加快和出汗。",
    "我怀疑是病毒性感冒合并细菌感染，要不要做血常规？",
    "我听说桂枝汤是调和营卫的，但我这种情况算不算营卫不和？"
  ]
}
```

---

## 人格与症状、条文的适配关系

### 适配原则

1. **年龄与条文适配**：某些条文更适合特定年龄段的患者叙事
   - 太阳病、阳明病：适合成人（20-60岁）
   - 少阴病：适合老年或体弱者（50岁以上）
   - 妊娠相关（金匮）：仅适合女性育龄期

2. **性别与症状适配**：某些症状在特定性别中叙述更自然
   - 妇科相关（金匮妇人病）：仅限女性人格
   - "身重难以转侧"（柴胡加龙骨牡蛎汤）：男性体力劳动者更自然

3. **职业与生活场景**：
   - 体力劳动者：适合描述"身疼痛""四肢沉重"等体力相关症状
   - 白领/教师：适合描述"久坐""空调""熬夜"等现代生活场景
   - 全职主妇：适合描述"家务""带孩子""厨房"等家庭场景

### 人格选择优先级（v1.0）

```yaml
桂枝汤类（太阳中风）:
  优先人格: anxious-middle-aged-female
  理由: 太阳中风表虚，患者体质偏弱，容易焦虑
  备选: talkative-elderly-female

麻黄汤类（太阳伤寒）:
  优先人格: silent-elderly-male
  理由: 太阳伤寒体壮，男性更符合"无汗而喘"的体格感
  备选: skeptical-patient

大承气汤类（阳明腑实）:
  优先人格: skeptical-patient
  理由: 腑实患者可能急躁、腹痛难忍，对医生不耐烦
  备选: intellectual-young-adult

小柴胡汤类（少阳病）:
  优先人格: talkative-elderly-female
  理由: 往来寒热、胸胁苦满，症状复杂，适合信息丰富的人格
  备选: intellectual-young-adult

四逆汤类（少阴寒化）:
  优先人格: silent-elderly-male
  理由: 少阴病但欲寐，精神萎靡，沉默寡言最符合
  备选: anxious-middle-aged-female（虚寒导致的焦虑）

桃核承气汤/抵当汤（蓄血）:
  优先人格: anxious-middle-aged-female
  理由: 精神症状（如狂/发狂），情绪型人格更能体现
  备选: skeptical-patient
```

---

## 人格化叙事生成规则

### 规则 1：主诉长度与 verbosity 挂钩

| verbosity | 主诉字数范围 | 特征 |
|-----------|-----------|------|
| low | 50-80字 | 简洁，仅核心症状 |
| medium | 100-150字 | 适中，含少量背景 |
| high | 150-200字 | 详细，含情绪和生活 |
| very_high | 200-300字 | 冗长，含大量无关细节 |

### 规则 2：信息密度与 information_initiative 挂钩

| information_initiative | L0 症状数 | 特征 |
|------------------------|----------|------|
| low | 1-2 | 患者只提最难受的一个症状 |
| medium | 2-3 | 患者主动提2-3个核心症状 |
| high | 3-4 | 患者主动提多个症状，含次要症状 |
| very_high | 4-6 | 患者提大量症状，含无关信息 |

### 规则 3：L3 噪声与人格绑定

每种人格有固定的 L3 噪声池，生成时从池中随机选择：

```yaml
anxious-middle-aged-female:
  l3_pool: ["自我用药", "网络诊断", "错误归因", "恐惧联想"]
  
silent-elderly-male:
  l3_pool: ["隐瞒病史", "轻描淡写", "拒绝承认", "归因于年龄"]
  
talkative-elderly-female:
  l3_pool: ["信息过载", "时间线混乱", "无关细节", "偏方经验"]
  
skeptical-patient:
  l3_pool: ["质疑医生", "既往失败", "网络诊断", "自我用药"]
  
intellectual-young-adult:
  l3_pool: ["半懂术语", "网络诊断", "逻辑自洽但错误", "过度分析"]
```

---

## 方剂→人格自动映射表（v1.1）

> 覆盖全部 40 方（35 原始方 + 5 Batch 5 新增方）。
> 映射规则：篇章（六经）+ 难度（1/2/3）+ 症状特征（寒热/虚实/精神）。
> 标注 ✅ 表示已有 SP 病例。

### 映射规则总表

| 篇章 | 难度 | 优先人格 | 备选人格 | 通用理由 |
|---|---|---|---|---|
| 太阳病篇 | 1 | anxious-middle-aged-female | talkative-elderly-female | 急性表证，起病急，患者焦虑或话多 |
| 太阳病篇 | 2 | talkative-elderly-female | anxious-middle-aged-female | 兼证复杂，症状多，适合信息丰富的人格 |
| 太阳病篇 | 3 | skeptical-patient | talkative-elderly-female | 误治/特殊证，患者经历多次治疗，怀疑态度 |
| 阳明病篇 | 1 | skeptical-patient | intellectual-young-adult | 里热/腑实，热势急，患者急躁、不耐烦 |
| 阳明病篇 | 2 | intellectual-young-adult | skeptical-patient | 热盛津伤，分析型人格更能描述细节 |
| 阳明病篇 | 3 | skeptical-patient | intellectual-young-adult | 重病/兼证，患者质疑医生能力 |
| 少阳病篇 | 1 | talkative-elderly-female | intellectual-young-adult | 往来寒热，症状多样，话多型人格最自然 |
| 少阳病篇 | 2 | intellectual-young-adult | talkative-elderly-female | 胸胁苦满，分析型人格能描述不适感 |
| 少阳病篇 | 3 | skeptical-patient | intellectual-young-adult | 兼阳明里实，怀疑+分析型 |
| 少阴病篇 | 1/2/3 | silent-elderly-male | anxious-middle-aged-female | 但欲寐、精神萎靡，沉默寡言最符合；虚寒导致的焦虑为备选 |
| 太阴病篇 | 1 | anxious-middle-aged-female | talkative-elderly-female | 脾胃虚寒，慢性起病，焦虑或话多 |
| 太阴病篇 | 2 | talkative-elderly-female | anxious-middle-aged-female | 病程长，症状杂，话多型更自然 |
| 太阴病篇 | 3 | silent-elderly-male | talkative-elderly-female | 虚寒重证，精神萎靡 |

---

### 太阳病篇 20 方

| 方剂 | formula_id | 难度 | 优先人格 | 备选人格 | 特殊理由 | 已有SP |
|---|---|---|---|---|---|---|
| 桂枝汤 | gui-zhi-tang | 1 | anxious-middle-aged-female | talkative-elderly-female | 表虚汗出，体质偏弱，焦虑 | ✅ |
| 麻黄汤 | ma-huang-tang | 1 | silent-elderly-male | skeptical-patient | 表实体壮，无汗而喘，男性体格感 | ✅ |
| 葛根汤 | ge-gen-tang | 1 | talkative-elderly-female | silent-elderly-male | 项背强几几，老年人颈椎病联想 | ✅ |
| 桂枝加葛根汤 | gui-zhi-jia-ge-gen-tang | 2 | talkative-elderly-female | anxious-middle-aged-female | 项背强+汗出，话多型描述颈部不适 | ✅ |
| 桂枝加厚朴杏子汤 | gui-zhi-jia-houpo-xingzi-tang | 2 | talkative-elderly-female | anxious-middle-aged-female | 微喘，表证+喘，症状复合 | — |
| 桂枝去芍药汤 | gui-zhi-qu-shaoyao-tang | 3 | skeptical-patient | anxious-middle-aged-female | 误下后胸阳受损，患者质疑之前治疗 | — |
| 桂枝加附子汤 | gui-zhi-jia-fu-zi-tang | 2 | silent-elderly-male | anxious-middle-aged-female | 阳虚漏汗，老年人阳气虚衰 | — |
| 麻黄杏仁甘草石膏汤 | ma-huang-xing-ren-gan-cao-shi-gao-tang | 2 | intellectual-young-adult | skeptical-patient | 发汗后化热，肺热咳喘，分析型 | ✅ |
| 大青龙汤 | da-qing-long-tang | 2 | skeptical-patient | intellectual-young-adult | 表寒里热，烦躁，患者急躁 | — |
| 小青龙汤 | xiao-qing-long-tang | 2 | talkative-elderly-female | skeptical-patient | 外寒内饮，痰多咳喘，话多型 | ✅ |
| 桂枝麻黄各半汤 | gui-zhi-ma-huang-ge-ban-tang | 2 | talkative-elderly-female | anxious-middle-aged-female | 如疟状，寒热往来，一日二三度发 | — |
| 桂枝二越婢一汤 | gui-zhi-er-yue-bi-yi-tang | 3 | skeptical-patient | talkative-elderly-female | 微邪郁热，不可大发汗，患者犹豫 | — |
| 葛根加半夏汤 | ge-gen-jia-ban-xia-tang | 2 | talkative-elderly-female | skeptical-patient | 合病，不下利但呕，症状复杂 | — |
| 葛根黄芩黄连汤 | ge-gen-huang-qin-huang-lian-tang | 2 | skeptical-patient | intellectual-young-adult | 协热下利，误下后，患者急躁 | — |
| 五苓散 | wu-ling-san | 2 | anxious-middle-aged-female | talkative-elderly-female | 蓄水，小便不利，消渴，焦虑 | — |
| 小建中汤 | xiao-jian-zhong-tang | 2 | anxious-middle-aged-female | talkative-elderly-female | 里虚心悸，腹中痛，面色萎黄，焦虑 | — |
| 桃核承气汤 | tao-he-cheng-qi-tang | 3 | anxious-middle-aged-female | skeptical-patient | 如狂/精神症状，情绪型人格 | — |
| 抵当汤 | di-dang-tang | 3 | anxious-middle-aged-female | skeptical-patient | 发狂/善忘，精神症状突出 | — |
| 干姜附子汤 | gan-jiang-fu-zi-tang | 3 | silent-elderly-male | anxious-middle-aged-female | 昼烦夜静，残阳欲脱，沉默寡言 | — |
| 炙甘草汤 | zhi-gan-cao-tang | 1 | anxious-middle-aged-female | talkative-elderly-female | 心悸脉结代，焦虑型最自然 | — |

---

### 阳明病篇 6 方

| 方剂 | formula_id | 难度 | 优先人格 | 备选人格 | 特殊理由 | 已有SP |
|---|---|---|---|---|---|---|
| 白虎汤 | bai-hu-tang | 1 | skeptical-patient | intellectual-young-adult | 大热大渴，热势急，患者急躁 | — |
| 白虎加人参汤 | bai-hu-jia-ren-shen-tang | 2 | intellectual-young-adult | skeptical-patient | 汗多伤津，大烦渴，分析型描述 | — |
| 调胃承气汤 | tiao-wei-cheng-qi-tang | 2 | intellectual-young-adult | skeptical-patient | 腑实轻证，蒸蒸发热，心烦 | — |
| 大承气汤 | da-cheng-qi-tang | 2 | skeptical-patient | intellectual-young-adult | 腹满硬痛，燥屎内结，患者腹痛难忍 | ✅ |
| 小承气汤 | xiao-cheng-qi-tang | 1 | skeptical-patient | intellectual-young-adult | 腹满便秘，轻证，患者不耐烦 | — |
| 麻子仁丸 | ma-zi-ren-wan | 1 | skeptical-patient | talkative-elderly-female | 脾约便秘，习惯性便秘，老年人 | — |
| 茵陈蒿汤 | yin-chen-hao-tang | 1 | skeptical-patient | talkative-elderly-female | 黄疸，身黄目黄，患者焦虑 | — |
| 吴茱萸汤 | wu-zhu-yu-tang | 1 | silent-elderly-male | anxious-middle-aged-female | 肝胃虚寒，食谷欲呕，老年人沉默 | — |

---

### 少阳病篇 4 方

| 方剂 | formula_id | 难度 | 优先人格 | 备选人格 | 特殊理由 | 已有SP |
|---|---|---|---|---|---|---|
| 小柴胡汤 | xiao-chai-hu-tang | 1 | talkative-elderly-female | intellectual-young-adult | 往来寒热，胸胁苦满，症状多 | ✅ |
| 大柴胡汤 | da-chai-hu-tang | 2 | skeptical-patient | intellectual-young-adult | 少阳兼阳明里实，呕不止心下急 | — |
| 柴胡加芒硝汤 | chai-hu-jia-mang-xiao-tang | 3 | skeptical-patient | intellectual-young-adult | 少阳兼阳明里实轻证，微下 | — |
| 柴胡加龙骨牡蛎汤 | chai-hu-jia-long-gu-mu-li-tang | 3 | anxious-middle-aged-female | skeptical-patient | 胸满烦惊，谵语，精神症状 | — |

---

### 少阴病篇 3 方

| 方剂 | formula_id | 难度 | 优先人格 | 备选人格 | 特殊理由 | 已有SP |
|---|---|---|---|---|---|---|
| 四逆汤 | si-ni-tang | 2 | silent-elderly-male | anxious-middle-aged-female | 脉微细，但欲寐，四肢厥逆，精神萎靡 | — |
| 真武汤 | zhen-wu-tang | 2 | silent-elderly-male | talkative-elderly-female | 阳虚水泛，四肢沉重，水肿 | — |
| 茯苓四逆汤 | fu-ling-si-ni-tang | 3 | silent-elderly-male | anxious-middle-aged-female | 汗下后阴阳两虚，烦躁，阳虚烦躁 | — |

---

### 太阴病篇 0 方（暂无）

> 当前 40 方中无太阴病篇方剂。预留映射规则：
> - 难度1：anxious-middle-aged-female（脾胃虚寒，慢性焦虑）
> - 难度2：talkative-elderly-female（病程长，症状杂）
> - 难度3：silent-elderly-male（虚寒重证，精神萎靡）

---

### 栀子豉汤类（太阳病篇热扰胸膈）

| 方剂 | formula_id | 难度 | 优先人格 | 备选人格 | 特殊理由 | 已有SP |
|---|---|---|---|---|---|---|
| 栀子豉汤 | zhi-zi-chi-tang | 2 | anxious-middle-aged-female | skeptical-patient | 虚烦不得眠，懊憹，胸中窒，焦虑 | — |
| 栀子甘草豉汤 | zhi-zi-gan-cao-chi-tang | 2 | talkative-elderly-female | anxious-middle-aged-female | 虚烦+少气，话多型描述气短 | — |
| 栀子生姜豉汤 | zhi-zi-sheng-jiang-chi-tang | 2 | talkative-elderly-female | anxious-middle-aged-female | 虚烦+呕，话多型描述恶心 | — |
| 栀子厚朴汤 | zhi-zi-hou-po-tang | 2 | skeptical-patient | anxious-middle-aged-female | 心烦腹满，卧起不安，烦躁 | — |
| 栀子干姜汤 | zhi-zi-gan-jiang-tang | 3 | silent-elderly-male | skeptical-patient | 上热下寒，微烦+便溏，虚寒型 | — |

---

### 使用说明

1. **生成 SP 时**：先查表找到 `formula_id` 对应的优先人格，读取 `persona_id` 的 JSON 定义。
2. **年龄范围**：根据 `difficulty` 和篇章自动推导（太阳/阳明成人 20-60，少阴老年 50+）。
3. **性别**：除非条文限定（如妇科/妊娠），否则默认不限。但 `silent-elderly-male` 默认男性，`anxious-middle-aged-female` 默认女性，可互换。
4. **已有 SP 的方剂**：再次生成时建议换**备选人格**，避免病例同质化。

---

## 扩展方法

新增人格时：

1. 按上述 JSON 结构定义新人格
2. 定义 `speech_patterns` 和 `l3_noise_types`
3. 提供 `example_phrases`（至少 5 句）
4. 在"人格与症状适配关系"中标注适用条文/方剂
5. 更新 `json_schema.md` 中 `persona_id` 的枚举值

---

## 版本记录

- 2026-06-17: v1.0 初始版，定义 5 种人格，MVP 使用 anxious-middle-aged-female
  - 2026-06-18: v1.1 补充 40 方完整人格映射表（35 原始方 + 5 Batch 5 新增方），按六经分类，含优先人格、备选人格、难度、已有SP标注
