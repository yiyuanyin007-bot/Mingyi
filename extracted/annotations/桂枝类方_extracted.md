# 卡片原始提取文件

- 源文本：桂枝类方与脑科学.md
- 提取日期：2026-06-13
- 提取范围：["桂枝汤", "桂枝加葛根汤", "桂枝加附子汤", "桂枝去芍药汤", "桂枝去芍药加附子汤", "桂枝麻黄各半汤", "桂枝二麻黄一汤", "桂枝二越婢一汤", "桂枝去桂加茯苓白术汤", "桂枝加厚朴杏仁汤", "桂枝加芍药生姜人参新加汤", "桂枝甘草汤", "茯苓桂枝甘草大枣汤", "茯苓桂枝白术甘草汤", "桂枝甘草龙骨牡蛎汤", "柴胡加龙骨牡蛎汤", "桂枝加桂汤"]
- 总条目数：65
- 待审阅：0（请手动统计）
- 已采纳：0
- 已跳过：0

---

## 使用说明

1. 逐条检查 `detected_elements`；
2. 不对的，把 `status` 改成 `skipped`，在 `reviewer_note` 写原因；
3. 对的，把 `status` 改成 `adopted`；
4. 审阅完成后，再进入第二步生成卡片 JSON。

---

### 条目 #001

```yaml
status: pending
source_location: "原文第2段第2句"
paragraph_context: "收到！您提供的《伤寒论》桂枝汤及其类方的症状清单非常严谨清晰。我将沿用上一轮的“**症状逆推生理学 → 脑科学机制解析**”这一跨学科方法论，对这18个方证进行深度拆解。"
atomic_sentence: "您提供的《伤寒论》桂枝汤及其类方的症状清单非常严谨清晰。"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
  - type: contraindication
    value: "您提供的《伤寒论》桂枝汤及其类方的症状清单非常严谨清晰。"
    target_card: gui-zhi-tang
    target_field: data.contraindications
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #002

```yaml
status: pending
source_location: "原文第3段第1句"
paragraph_context: "由于涉及脑科学与自主神经、内脏-躯体反射的深度关联，为了保证分析的透彻性，我建议采&#x7528;**“详细模式”**，即**每2-4个方剂归为一组**，按照病理生理与神经演进的逻辑进行分组。"
atomic_sentence: "由于涉及脑科学与自主神经、内脏-躯体反射的深度关联，为了保证分析的透彻性，我建议采&#x7528;**“详细模式”**，即**每2-4个方剂归为一组**，按照病理生理与神经演进的逻辑进行分组。"
detected_elements:
  - type: experience
    value: "由于涉及脑科学与自主神经、内脏-躯体反射的深度关联，为了保证分析的透彻性，我建议采&#x7528;**“详细模式”**，即**每2-4个方剂归为一组**，按照病理生理与神经演进的逻辑进行分组。"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #003

```yaml
status: pending
source_location: "原文第6段第1句"
paragraph_context: "1. 桂枝汤 (原文第十五条)
2. 桂枝汤 (原文第十六条)
3. 桂枝加葛根汤 (原文第十七条)
4. 桂枝加附子汤 (原文第二十四条)
5. 桂枝去芍药汤 / 桂枝去芍药加附子汤 (原文第二十五条)
6. 桂枝麻黄各半汤 (原文第二十六条)
7. 桂枝二麻黄一汤 (原文第二十八条)
8. 桂枝二越婢一汤 (原文第三十条)
9. 桂枝去桂加茯苓白术汤 (原文第三十一条)
10. 桂枝加厚朴杏仁汤 (原文第四十八条)
11. 桂枝加附子汤 (新加汤) (原文第六十七条)
12. 桂枝加芍药生姜人参新加汤 (原文第六十七条)
13. 桂枝甘草汤 (原文第六十九条)
14. 茯苓桂枝甘草大枣汤 (原文第七十条)
15. 茯苓桂枝白术甘草汤 (原文第七十二条)
16. 桂枝甘草龙骨牡蛎汤 (原文第一百三十三条)
17. 柴胡加龙骨牡蛎汤 (原文第一百二十条)
18. 桂枝加桂汤 (原文第一百三十一条)"
atomic_sentence: "1. 桂枝汤 (原文第十五条)
2. 桂枝汤 (原文第十六条)
3. 桂枝加葛根汤 (原文第十七条)
4. 桂枝加附子汤 (原文第二十四条)
5. 桂枝去芍药汤 / 桂枝去芍药加附子汤 (原文第二十五条)
6. 桂枝麻黄各半汤 (原文第二十六条)
7. 桂枝二麻黄一汤 (原文第二十八条)
8. 桂枝二越婢一汤 (原文第三十条)
9. 桂枝去桂加茯苓白术汤 (原文第三十一条)
10. 桂枝加厚朴杏仁汤 (原文第四十八条)
11. 桂枝加附子汤 (新加汤) (原文第六十七条)
12. 桂枝加芍药生姜人参新加汤 (原文第六十七条)
13. 桂枝甘草汤 (原文第六十九条)
14. 茯苓桂枝甘草大枣汤 (原文第七十条)
15. 茯苓桂枝白术甘草汤 (原文第七十二条)
16. 桂枝甘草龙骨牡蛎汤 (原文第一百三十三条)
17. 柴胡加龙骨牡蛎汤 (原文第一百二十条)
18. 桂枝加桂汤 (原文第一百三十一条)"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝加葛根汤"
    target_card: gui-zhi-jia-ge-gen-tang
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝加附子汤"
    target_card: 桂枝加附子汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝去芍药汤"
    target_card: 桂枝去芍药汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝去芍药加附子汤"
    target_card: gui-zhi-qu-shaoyao-jia-fuzi-tang
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝麻黄各半汤"
    target_card: 桂枝麻黄各半汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝二麻黄一汤"
    target_card: 桂枝二麻黄一汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝二越婢一汤"
    target_card: 桂枝二越婢一汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝去桂加茯苓白术汤"
    target_card: 桂枝去桂加茯苓白术汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝加厚朴杏仁汤"
    target_card: 桂枝加厚朴杏仁汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝加芍药生姜人参新加汤"
    target_card: 桂枝加芍药生姜人参新加汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝甘草汤"
    target_card: 桂枝甘草汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "茯苓桂枝甘草大枣汤"
    target_card: 茯苓桂枝甘草大枣汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "茯苓桂枝白术甘草汤"
    target_card: 茯苓桂枝白术甘草汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝甘草龙骨牡蛎汤"
    target_card: 桂枝甘草龙骨牡蛎汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "柴胡加龙骨牡蛎汤"
    target_card: 柴胡加龙骨牡蛎汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝加桂汤"
    target_card: 桂枝加桂汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #004

```yaml
status: pending
source_location: "原文第9段第1句"
paragraph_context: "我将按&#x7167;**“从外周到中枢，从生理稳态到神经敏化”**&#x7684;演进逻辑，将18个方证分为5组输出："
atomic_sentence: "我将按&#x7167;**“从外周到中枢，从生理稳态到神经敏化”**&#x7684;演进逻辑，将18个方证分为5组输出："
detected_elements:
  - type: experience
    value: "我将按&#x7167;**“从外周到中枢，从生理稳态到神经敏化”**&#x7684;演进逻辑，将18个方证分为5组输出："
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #005

```yaml
status: pending
source_location: "原文第10段第1句"
paragraph_context: "* **第一组：核心表虚与肌张力异常（自主神经基础调控）**
  * 包含：1, 2, 3
  * 逻辑：从桂枝汤的核心病机“营卫不和”切入，解析体温调节、汗腺分泌（交感神经调控）与骨骼肌紧张（项背强几几）的神经生理基础。
* **第二组：阳损与津血亏虚的躯体反应（交感神经耗竭与代偿）**
  * 包含：4, 5, 11, 12
  * 逻辑：过汗导致的“阳漏”与“身疼痛”，对应交感神经极度兴奋后的耗竭、心血管代偿（脉促/胸满）以及外周缺血性疼痛（脉沉迟/四肢微急）。
* **第三组：表邪不解与轻度内传（神经-免疫-血管边界反应）**
  * 包含：6, 7, 8, 9
  * 逻辑：发热如疟、身痒、烦躁及水液停聚，解析免疫系统激活对神经末梢的刺激（痒）、下丘脑体温调节中枢的不稳定发作，以及内脏-躯体牵涉机制（心下满微痛）。
* **第四组：心肺胸膈的气机逆乱（迷走神经与肠脑轴紊乱）**
  * 包含：10, 13, 14, 15
  * 逻辑：从微喘、心悸到奔豚、起则头眩，解析心肺交互中的迷走神经张力异常、压力感受器反射失调，以及前庭-自主神经联动障碍（身为振振摇）。
* **第五组：中枢神经敏化与精神应激（边缘系统与交感风暴）**
  * 包含：16, 17, 18
  * 逻辑：惊烦、谵语、奔豚气上冲，这是典型的精神-神经-躯体危象，将从杏仁核-HPA轴激活、脑干网状系统上行激动、以及交感神经“风暴”的角度解析。"
atomic_sentence: "* **第一组：核心表虚与肌张力异常（自主神经基础调控）**
  * 包含：1, 2, 3
  * 逻辑：从桂枝汤的核心病机“营卫不和”切入，解析体温调节、汗腺分泌（交感神经调控）与骨骼肌紧张（项背强几几）的神经生理基础。"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
  - type: symptom
    value: "项背强几几"
    target_card: gui-zhi-tang
    target_field: data.symptoms
    confidence: medium
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #006

```yaml
status: pending
source_location: "原文第16段第1句"
paragraph_context: "## 1. 桂枝汤（原文第十五条）"
atomic_sentence: "## 1. 桂枝汤（原文第十五条）"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #007

```yaml
status: pending
source_location: "原文第22段第4句"
paragraph_context: "* **下丘脑体温调定点不稳定**：既非高热（调定点明显上移），也非正常（调定点波动），处于一种"摇摆"状态——时而发出产热指令（发热），时而无法维持血管收缩（汗出、恶风）。
* **交感-副交感切换障碍**：正常情况下，遇冷→交感兴奋→血管收缩、汗腺抑制；遇热→副交感相对兴奋→血管扩张、汗腺分泌。桂枝汤证患者这种切换失灵了，**血管扩张和汗腺分泌同时存在**，如同油门和刹车同时踩。
* **脑干内脏调控紊乱**：鼻鸣（上呼吸道黏膜充血）和干呕（胃气上逆）提示脑干对内脏的自主调控也被波及。迷走神经传入信号异常，脑干核团（孤束核、迷走神经背核）发出错误的传出指令。
* **"营卫不和"的神经本质**：营=血管内容量与营养供应（副交感/迷走主导）；卫=体表防御与温控（交感主导）。两者失协调，就是交感与副交感的"对话"断裂。"
atomic_sentence: "桂枝汤证患者这种切换失灵了，**血管扩张和汗腺分泌同时存在**，如同油门和刹车同时踩。"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #008

```yaml
status: pending
source_location: "原文第23段第1句"
paragraph_context: "> **一句话总结**：桂枝汤证的脑科学本质是**下丘脑-脑干自主神经中枢的"调谐失灵"**，体温、汗腺、血管、内脏四套系统各说各话，方剂的作用在于重新"调频"。"
atomic_sentence: "> **一句话总结**：桂枝汤证的脑科学本质是**下丘脑-脑干自主神经中枢的"调谐失灵"**，体温、汗腺、血管、内脏四套系统各说各话，方剂的作用在于重新"调频"。"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #009

```yaml
status: pending
source_location: "原文第25段第1句"
paragraph_context: "## 2. 桂枝汤（原文第十六条）"
atomic_sentence: "## 2. 桂枝汤（原文第十六条）"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #010

```yaml
status: pending
source_location: "原文第31段第2句"
paragraph_context: "* **三叉神经血管系统激活**：颅内血管扩张→硬脑膜血管壁上的三叉神经末梢被牵张→释放CGRP等血管活性肽→进一步扩张血管→正反馈→搏动性头痛。这是偏头痛的核心机制，桂枝汤证的头痛可能属于同一通路的轻度激活。
* **下丘脑-三叉神经核团通路**：下丘脑直接向三叉神经脊束核发出投射，当下丘脑体温调定点波动时，可同步影响三叉神经血管系统的兴奋性。这解释了**发热和头痛为何同现**——它们是同一个中枢（下丘脑）紊乱的两个输出端。
* **头痛位置推测**：太阳头痛多在枕项及额颞部。枕项部是枕大神经（C2）分布区，额颞部是三叉神经眼支分布区。这两者在脑干三叉神经颈复合体（TCC）处会聚，说明**头颈部痛觉信号在脑干层面已经交汇整合**。"
atomic_sentence: "这是偏头痛的核心机制，桂枝汤证的头痛可能属于同一通路的轻度激活。"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
  - type: symptom
    value: "头痛"
    target_card: gui-zhi-tang
    target_field: data.symptoms
    confidence: medium
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #011

```yaml
status: pending
source_location: "原文第34段第1句"
paragraph_context: "## 3. 桂枝加葛根汤（原文第十七条）"
atomic_sentence: "## 3. 桂枝加葛根汤（原文第十七条）"
detected_elements:
  - type: formula_name
    value: "桂枝加葛根汤"
    target_card: gui-zhi-jia-ge-gen-tang
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #012

```yaml
status: pending
source_location: "原文第39段第1句"
paragraph_context: "本条在桂枝汤基础上增加&#x4E86;**"项背强几几"**——一个典型的肌张力异常症状，将分析层次从"自主神经-血管"扩展&#x5230;**"自主神经-骨骼肌-脊髓反射"**："
atomic_sentence: "本条在桂枝汤基础上增加&#x4E86;**"项背强几几"**——一个典型的肌张力异常症状，"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
  - type: symptom
    value: "项背强几几"
    target_card: gui-zhi-tang
    target_field: data.symptoms
    confidence: medium
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #013

```yaml
status: pending
source_location: "原文第40段第11句"
paragraph_context: "* **肌梭-γ运动神经元环路过度激活**：
  * 肌肉内有肌梭（本体感受器），感知肌肉长度变化，通过γ运动神经元调节肌梭敏感性。
  * 交感神经兴奋时，可间接提高γ运动神经元放电频率→肌梭敏感性↑→肌肉维持在高张力状态→"强几几"（僵硬、拘紧感）。
  * 这是一种**脊髓层面的反射亢进**，不完全是主观意愿能放松的。
* **前庭-脊髓反射异常**：
  * 颈部肌肉是维持头部姿势的核心，受前庭系统（内耳→前庭神经核→脊髓前角）强烈调控。
  * 当体表感觉输入异常（恶风、温度波动）→前庭系统对颈部肌肉的调控失稳→肌肉张力不协调→僵硬感。
  * **头-颈-躯干本体感觉整合障碍**：脑干前庭核团同时接收内耳、颈本体感觉、皮肤感觉三路信号，当皮肤信号紊乱（恶风），整合输出异常→颈部肌肉指令异常。
* **"葛根"的脑科学假说**：
  * 葛根含葛根素，现代药理显示可扩张脑血管、改善微循环。
  * 从神经角度看，葛根可能通过**改善颈背部肌肉的血液供应**，消除缺血性肌痉挛的源头；同时缓解椎动脉痉挛→改善前庭系统供血→恢复前庭-脊髓反射的正常调控。
  * 这与之前分析高良姜"温胃"的逻辑一致：**通过改善局部血供，向脑干发送"已修复"信号，解除肌肉保护性痉挛指令**。
* **"强几几"与"恶风"的神经闭环**：
  * 恶风（皮肤冷感受器敏感）→脊髓反射→肌肉收缩（强几几）
  * 肌肉收缩→代谢增加→局部温度↑→血管扩张→散热↑→皮温↓→冷感受器进一步激活→恶风加重
  * **这是一个脊髓-外周的正反馈环路**，葛根+桂枝汤的作用在于打断这个环路：桂枝汤调节下丘脑体温中枢和汗腺（源头），葛根改善颈背肌肉血供和脊髓反射（局部）。"
atomic_sentence: "* **"强几几"与"恶风"的神经闭环**：
  * 恶风（皮肤冷感受器敏感）→脊髓反射→肌肉收缩（强几几）
  * 肌肉收缩→代谢增加→局部温度↑→血管扩张→散热↑→皮温↓→冷感受器进一步激活→恶风加重
  * **这是一个脊髓-外周的正反馈环路**，葛根+桂枝汤的作用在于打断这个环路：桂枝汤调节下丘脑体温中枢和汗腺（源头），葛根改善颈背肌肉血供和脊髓反射（局部）。"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
  - type: symptom
    value: "恶风"
    target_card: gui-zhi-tang
    target_field: data.symptoms
    confidence: medium
  - type: contraindication
    value: "皮肤冷感受器敏感）→脊髓反射→肌肉收缩（强几几）
  * 肌肉收缩→代谢增加→局部温度↑→血管扩张→散热↑→皮温↓→冷感受器进一步激活→恶风加重
  * **这是一个脊髓-外周的正反馈环路**，葛根+桂枝汤的作用在于打断这个环路：桂枝汤调节下丘脑体温中枢和汗腺（源头），葛根改善颈背肌肉血供和脊髓反射（局部"
    target_card: gui-zhi-tang
    target_field: data.contraindications
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #014

```yaml
status: pending
source_location: "原文第41段第1句"
paragraph_context: "> **一句话总结**：桂枝加葛根汤证揭示了自主神经失稳&#x6CBF;**"下丘脑→脊髓→肌梭→骨骼肌"**&#x901A;路的下行传导，"强几几"是脊髓γ环路过度激活的外周表现，葛根的核心作用是**改善颈背血供、打断"缺血-痉挛"正反馈**。"
atomic_sentence: "> **一句话总结**：桂枝加葛根汤证揭示了自主神经失稳&#x6CBF;**"下丘脑→脊髓→肌梭→骨骼肌"**&#x901A;路的下行传导，"强几几"是脊髓γ环路过度激活的外周表现，葛根的核心作用是**改善颈背血供、打断"缺血-痉挛"正反馈**。"
detected_elements:
  - type: formula_name
    value: "桂枝加葛根汤"
    target_card: gui-zhi-jia-ge-gen-tang
    target_field: formula_name
    confidence: high
  - type: contraindication
    value: "> **一句话总结**：桂枝加葛根汤证揭示了自主神经失稳&#x6CBF;**"下丘脑→脊髓→肌梭→骨骼肌"**&#x901A;路的下行传导，"强几几"是脊髓γ环路过度激活的外周表现，葛根的核心作用是**改善颈背血供、打断"缺血-痉挛"正反馈**。"
    target_card: gui-zhi-jia-ge-gen-tang
    target_field: data.contraindications
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #015

```yaml
status: pending
source_location: "原文第47段第1句"
paragraph_context: "桂枝汤的作用靶点在**下丘脑-脑干**（调频），加葛根则额外作用于**颈背局部血供与脊髓反射**（解痉）。"
atomic_sentence: "桂枝汤的作用靶点在**下丘脑-脑干**（调频），加葛根则额外作用于**颈背局部血供与脊髓反射**（解痉）。"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
  - type: contraindication
    value: "调频），加葛根则额外作用于**颈背局部血供与脊髓反射**（解痉"
    target_card: gui-zhi-tang
    target_field: data.contraindications
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #016

```yaml
status: pending
source_location: "原文第51段第1句"
paragraph_context: "本组包含4个方证，核心病机为过汗伤阳耗津后，引发的循环衰竭代偿（脉促胸满）、外周灌注不足（四肢微急、身疼痛）以及脑干下行抑制系统功能减弱。从脑科学看，这是**脑干（生命中枢）在缺血威胁下启动“舍车保帅”策略与痛觉闸门失守**的过程。"
atomic_sentence: "本组包含4个方证，核心病机为过汗伤阳耗津后，引发的循环衰竭代偿（脉促胸满）、外周灌注不足（四肢微急、身疼痛）以及脑干下行抑制系统功能减弱。"
detected_elements:
  - type: experience
    value: "本组包含4个方证，核心病机为过汗伤阳耗津后，引发的循环衰竭代偿（脉促胸满）、外周灌注不足（四肢微急、身疼痛）以及脑干下行抑制系统功能减弱。"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #017

```yaml
status: pending
source_location: "原文第53段第1句"
paragraph_context: "## 4. 桂枝加附子汤（原文第二十四条）"
atomic_sentence: "## 4. 桂枝加附子汤（原文第二十四条）"
detected_elements:
  - type: formula_name
    value: "桂枝加附子汤"
    target_card: 桂枝加附子汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #018

```yaml
status: pending
source_location: "原文第56段第2句"
paragraph_context: "| **症状**        | **生理学变化**                       | **原理**                                    |
| ------------- | ------------------------------- | ----------------------------------------- |
| **遂漏不止**      | 汗腺失控持续分泌，皮肤血管极度扩张失去张力           | 交感神经极度耗竭，无法维持血管平滑肌收缩；或下丘脑出汗中枢失去抑制，呈“开环”状态 |
| **恶风**        | 体表持续蒸发散热，皮温下降，冷感受器持续激活          | 血管扩张+汗液蒸发→体表严重散热>产热→主观寒冷                  |
| **小便难**       | 有效循环血量锐减，肾血流灌注不足；ADH分泌但无原料      | 身体为保核心血压，极度收缩内脏血管（包括肾血管），导致无尿             |
| **四肢微急，难以屈伸** | 四肢肌肉缺血痉挛；电解质紊乱（低钠/低氯）；肌梭敏感度异常升高 | ①血液被集中保心脑，四肢缺血→乳酸堆积→痉挛；②网状脊髓束抑制功能减弱→肌张力失控 |"
atomic_sentence: "或下丘脑出汗中枢失去抑制，呈“开环”状态 |
| **恶风**        | 体表持续蒸发散热，皮温下降，冷感受器持续激活          | 血管扩张+汗液蒸发→体表严重散热>产热→主观寒冷                  |
| **小便难**       | 有效循环血量锐减，肾血流灌注不足；"
detected_elements:
  - type: experience
    value: "或下丘脑出汗中枢失去抑制，呈“开环”状态 |
| **恶风**        | 体表持续蒸发散热，皮温下降，冷感受器持续激活          | 血管扩张+汗液蒸发→体表严重散热>产热→主观寒冷                  |
| **小便难**       | 有效循环血量锐减，肾血流灌注不足；"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #019

```yaml
status: pending
source_location: "原文第60段第1句"
paragraph_context: "> **一句话总结**：桂枝加附子汤证是脑干在循环崩溃边缘的“放手一搏”，方剂通过强心升压（附子）重新激活脑干生命中枢，恢复其对全身血管与肌肉的下行调控。"
atomic_sentence: "> **一句话总结**：桂枝加附子汤证是脑干在循环崩溃边缘的“放手一搏”，方剂通过强心升压（附子）重新激活脑干生命中枢，恢复其对全身血管与肌肉的下行调控。"
detected_elements:
  - type: formula_name
    value: "桂枝加附子汤"
    target_card: 桂枝加附子汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #020

```yaml
status: pending
source_location: "原文第62段第1句"
paragraph_context: "## 5. 桂枝去芍药汤 / 桂枝去芍药加附子汤（原文第二十五条）"
atomic_sentence: "## 5. 桂枝去芍药汤 / 桂枝去芍药加附子汤（原文第二十五条）"
detected_elements:
  - type: formula_name
    value: "桂枝去芍药汤"
    target_card: 桂枝去芍药汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝去芍药加附子汤"
    target_card: gui-zhi-qu-shaoyao-jia-fuzi-tang
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #021

```yaml
status: pending
source_location: "原文第71段第1句"
paragraph_context: "## 11 & 12. 桂枝加附子汤 (新加汤) / 桂枝加芍药生姜人参新加汤（原文第六十七条）"
atomic_sentence: "## 11 & 12. 桂枝加附子汤 (新加汤) / 桂枝加芍药生姜人参新加汤（原文第六十七条）"
detected_elements:
  - type: formula_name
    value: "桂枝加附子汤"
    target_card: 桂枝加附子汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝加芍药生姜人参新加汤"
    target_card: 桂枝加芍药生姜人参新加汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #022

```yaml
status: pending
source_location: "原文第74段第2句"
paragraph_context: "| **症状**  | **生理学变化**                       | **原理**                                   |
| ------- | ------------------------------- | ---------------------------------------- |
| **身疼痛** | 肌肉等软组织微循环障碍，缺血缺氧；痛觉神经末梢阈值降低（敏化） | 血容量不足→肌肉灌注差→代谢废物堆积刺激C纤维；同时脑干下行痛觉抑制系统功能减弱 |
| **脉沉迟** | 血容量显著不足（沉），心率偏慢或心肌收缩无力（迟）       | 过汗伤津耗气，机体处于低代谢、低灌注的抑制状态，交感神经兴奋性极度低下      |"
atomic_sentence: "痛觉神经末梢阈值降低（敏化） | 血容量不足→肌肉灌注差→代谢废物堆积刺激C纤维；"
detected_elements:
  - type: experience
    value: "痛觉神经末梢阈值降低（敏化） | 血容量不足→肌肉灌注差→代谢废物堆积刺激C纤维；"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #023

```yaml
status: pending
source_location: "原文第74段第5句"
paragraph_context: "| **症状**  | **生理学变化**                       | **原理**                                   |
| ------- | ------------------------------- | ---------------------------------------- |
| **身疼痛** | 肌肉等软组织微循环障碍，缺血缺氧；痛觉神经末梢阈值降低（敏化） | 血容量不足→肌肉灌注差→代谢废物堆积刺激C纤维；同时脑干下行痛觉抑制系统功能减弱 |
| **脉沉迟** | 血容量显著不足（沉），心率偏慢或心肌收缩无力（迟）       | 过汗伤津耗气，机体处于低代谢、低灌注的抑制状态，交感神经兴奋性极度低下      |"
atomic_sentence: "机体处于低代谢、低灌注的抑制状态，"
detected_elements:
  - type: experience
    value: "机体处于低代谢、低灌注的抑制状态，"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #024

```yaml
status: pending
source_location: "原文第81段第6句"
paragraph_context: "```
过汗伤津耗气（血容量断崖式下降）
    ↓
脑干/生命中枢感知到致命缺血威胁
    ↓ 启动求生与代偿机制
    ├── 极端失代偿：放弃外周控制 → 遂漏不止，四肢微急（第24条，加附子强心重启）
    ├── 心肺空转报警：心率代偿与胸腔牵张 → 脉促，胸满（第25条，去芍药防漏，加附子强心）
    └── 慢性低灌注与痛觉闸门失守：脑干5-HT分泌↓，大纤维输入↓ → 身疼痛，脉沉迟（第67条，新加汤补供血+解肌痉）
```"
atomic_sentence: "加附子强心）
    └── 慢性低灌注与痛觉闸门失守：脑干5-HT分泌↓，"
detected_elements:
  - type: experience
    value: "加附子强心）
    └── 慢性低灌注与痛觉闸门失守：脑干5-HT分泌↓，"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #025

```yaml
status: pending
source_location: "原文第83段第4句"
paragraph_context: "* 第24条 = **交感神经完全耗竭**，体表失控，四肢痉挛（需要附子点火重启）
* 第25条 = **心脏拼命代偿但无效**，产生胸闷（需要减负+强心）
* 第67条 = **低灌注维持生命**，但脑干无力抑制疼痛，全身痛（需要补充血源与改善供血）"
atomic_sentence: "产生胸闷（需要减负+强心）
* 第67条 = **低灌注维持生命**，"
detected_elements:
  - type: experience
    value: "产生胸闷（需要减负+强心）
* 第67条 = **低灌注维持生命**，"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #026

```yaml
status: pending
source_location: "原文第90段第1句"
paragraph_context: "## 6. 桂枝麻黄各半汤（原文第二十六条）"
atomic_sentence: "## 6. 桂枝麻黄各半汤（原文第二十六条）"
detected_elements:
  - type: formula_name
    value: "桂枝麻黄各半汤"
    target_card: 桂枝麻黄各半汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #027

```yaml
status: pending
source_location: "原文第99段第1句"
paragraph_context: "## 7. 桂枝二麻黄一汤（原文第二十八条）"
atomic_sentence: "## 7. 桂枝二麻黄一汤（原文第二十八条）"
detected_elements:
  - type: formula_name
    value: "桂枝二麻黄一汤"
    target_card: 桂枝二麻黄一汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #028

```yaml
status: pending
source_location: "原文第100段第1句"
paragraph_context: "> **症状**：服桂枝汤，大汗出，脉洪大者 (形如疟，日再发者)。"
atomic_sentence: "> **症状**：服桂枝汤，大汗出，脉洪大者 (形如疟，日再发者)。"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
  - type: symptom
    value: "汗出"
    target_card: gui-zhi-tang
    target_field: data.symptoms
    confidence: medium
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #029

```yaml
status: pending
source_location: "原文第102段第2句"
paragraph_context: "| **症状**  | **生理学变化**                     | **原理**                                         |
| ------- | ----------------------------- | ---------------------------------------------- |
| **大汗出** | 下丘脑汗腺中枢受强烈刺激或抑制解除，全身汗腺大量分泌    | 可能是体温调定点急剧下调后，机体为快速散热而启动的剧烈反应；或对桂枝汤“温通”作用的过度反应 |
| **脉洪大** | 体表血管极度扩张，心输出量因交感兴奋或血容量重新分配而增大 | 大汗后，体液虽耗损，但机体为加速散热和维持血压，可能暂时性增强心肌收缩和外周血管扩张     |"
atomic_sentence: "或对桂枝汤“温通”作用的过度反应 |
| **脉洪大** | 体表血管极度扩张，"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
  - type: contraindication
    value: "或对桂枝汤“温通”作用的过度反应 |
| **脉洪大** | 体表血管极度扩张，"
    target_card: gui-zhi-tang
    target_field: data.contraindications
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #030

```yaml
status: pending
source_location: "原文第105段第1句"
paragraph_context: "* **下丘脑体温调定点的“矫枉过正”**：服桂枝汤后，本应温和地将微调的体温调定点恢复正常，但可能因个体敏感或药量问题，下丘脑散热中枢被过度激活，导致大汗与脉洪大。这是自主神经对“纠偏”指令的执行失控。
* **与“疟”的类比——周期性震荡的残余**：“形如疟，日再发”暗示虽然当下是剧烈反应，但背后仍有某种周期性因素（可能残余的炎症因子节律）在驱动下丘脑产生波动。大汗与脉洪大，可视为一次更强烈的、试图彻底清除致热原的“急性应激反应”。
* **肠脑轴的潜在参与**：资料强调迷走神经将肠道状态反馈给大脑。若患者原有轻度胃肠功能紊乱（虽未明言），桂枝汤调和营卫时，也可能同步改善了胃肠迷走神经张力，其反馈信号的改变可能协同触发了更剧烈的自主神经调整（大汗出）。"
atomic_sentence: "* **下丘脑体温调定点的“矫枉过正”**：服桂枝汤后，本应温和地将微调的体温调定点恢复正常，但可能因个体敏感或药量问题，下丘脑散热中枢被过度激活，导致大汗与脉洪大。"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #031

```yaml
status: pending
source_location: "原文第105段第6句"
paragraph_context: "* **下丘脑体温调定点的“矫枉过正”**：服桂枝汤后，本应温和地将微调的体温调定点恢复正常，但可能因个体敏感或药量问题，下丘脑散热中枢被过度激活，导致大汗与脉洪大。这是自主神经对“纠偏”指令的执行失控。
* **与“疟”的类比——周期性震荡的残余**：“形如疟，日再发”暗示虽然当下是剧烈反应，但背后仍有某种周期性因素（可能残余的炎症因子节律）在驱动下丘脑产生波动。大汗与脉洪大，可视为一次更强烈的、试图彻底清除致热原的“急性应激反应”。
* **肠脑轴的潜在参与**：资料强调迷走神经将肠道状态反馈给大脑。若患者原有轻度胃肠功能紊乱（虽未明言），桂枝汤调和营卫时，也可能同步改善了胃肠迷走神经张力，其反馈信号的改变可能协同触发了更剧烈的自主神经调整（大汗出）。"
atomic_sentence: "若患者原有轻度胃肠功能紊乱（虽未明言），桂枝汤调和营卫时，也可能同步改善了胃肠迷走神经张力，其反馈信号的改变可能协同触发了更剧烈的自主神经调整（大汗出）。"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
  - type: symptom
    value: "汗出"
    target_card: gui-zhi-tang
    target_field: data.symptoms
    confidence: medium
  - type: contraindication
    value: "虽未明言），桂枝汤调和营卫时，也可能同步改善了胃肠迷走神经张力，其反馈信号的改变可能协同触发了更剧烈的自主神经调整（大汗出"
    target_card: gui-zhi-tang
    target_field: data.contraindications
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #032

```yaml
status: pending
source_location: "原文第108段第1句"
paragraph_context: "## 8. 桂枝二越婢一汤（原文第三十条）"
atomic_sentence: "## 8. 桂枝二越婢一汤（原文第三十条）"
detected_elements:
  - type: formula_name
    value: "桂枝二越婢一汤"
    target_card: 桂枝二越婢一汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #033

```yaml
status: pending
source_location: "原文第111段第1句"
paragraph_context: "| **症状**        | **生理学变化**                       | **原理**                                                               |
| ------------- | ------------------------------- | -------------------------------------------------------------------- |
| **发热恶寒，热多寒少** | 同桂枝麻黄各半汤，免疫-下丘脑间歇性交互            | 炎症因子脉冲式作用于下丘脑，体温调定点波动                                                |
| **烦躁**        | 边缘系统（如杏仁核、海马）过度激活；脑内兴奋性神经递质相对占优 | 可能原因：①持续发热不适信号上传激活网状上行激动系统；②免疫因子本身可影响神经递质合成（如影响五羟色胺前体供应，如资料所述肠道菌群问题） |
| **脉微弱**       | 汗出伤津或心阳不足，心收缩力或血容量开始显现不足        | 较长时间的发热消耗，或反复出汗导致有效循环血量开始下降                                          |"
atomic_sentence: "| **症状**        | **生理学变化**                       | **原理**                                                               |
| ------------- | ------------------------------- | -------------------------------------------------------------------- |
| **发热恶寒，热多寒少** | 同桂枝麻黄各半汤，免疫-下丘脑间歇性交互            | 炎症因子脉冲式作用于下丘脑，体温调定点波动                                                |
| **烦躁**        | 边缘系统（如杏仁核、海马）过度激活；"
detected_elements:
  - type: formula_name
    value: "桂枝麻黄各半汤"
    target_card: 桂枝麻黄各半汤
    target_field: formula_name
    confidence: high
  - type: symptom
    value: "发热"
    target_card: 桂枝麻黄各半汤
    target_field: data.symptoms
    confidence: medium
  - type: symptom
    value: "恶寒"
    target_card: 桂枝麻黄各半汤
    target_field: data.symptoms
    confidence: medium
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #034

```yaml
status: pending
source_location: "原文第117段第1句"
paragraph_context: "## 9. 桂枝去桂加茯苓白术汤（原文第三十一条）"
atomic_sentence: "## 9. 桂枝去桂加茯苓白术汤（原文第三十一条）"
detected_elements:
  - type: formula_name
    value: "桂枝去桂加茯苓白术汤"
    target_card: 桂枝去桂加茯苓白术汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #035

```yaml
status: pending
source_location: "原文第120段第2句"
paragraph_context: "| **症状**    | **生理学变化**                  | **原理**                        |
| --------- | -------------------------- | ----------------------------- |
| **头项强痛**  | 颅内及颈部血管扩张牵张痛；颈部肌肉因寒或缺血而痉挛  | 可能与桂枝麻黄各半汤类似的免疫介导血管扩张，但更固定、更痛 |
| **翕翕发热**  | 体表血管扩张，体温调定点轻度上移           | 轻度炎症因子作用                      |
| **无汗**    | 汗腺交感神经抑制，或毛孔开合枢纽失灵，虽热而汗不出  | 与桂枝汤证汗出相反，提示自主神经调控卡在了另一个极端    |
| **心下满微痛** | 胃肠道平滑肌张力异常、轻度痉挛；胃黏膜微循环障碍   | 迷走神经功能紊乱，或胃肠道局部产生轻度水肿、炎症      |
| **小便不利**  | 抗利尿激素分泌增加（保水）；或水液代谢障碍，水湿停滞 | 可能是机体为应对某种渗透压变化而保水，或脾运化水湿功能失调 |"
atomic_sentence: "颈部肌肉因寒或缺血而痉挛  | 可能与桂枝麻黄各半汤类似的免疫介导血管扩张，但更固定、更痛 |
| **翕翕发热**  | 体表血管扩张，体温调定点轻度上移           | 轻度炎症因子作用                      |
| **无汗**    | 汗腺交感神经抑制，或毛孔开合枢纽失灵，虽热而汗不出  | 与桂枝汤证汗出相反，提示自主神经调控卡在了另一个极端    |
| **心下满微痛** | 胃肠道平滑肌张力异常、轻度痉挛；"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝麻黄各半汤"
    target_card: 桂枝麻黄各半汤
    target_field: formula_name
    confidence: high
  - type: symptom
    value: "发热"
    target_card: gui-zhi-tang
    target_field: data.symptoms
    confidence: medium
  - type: symptom
    value: "汗出"
    target_card: gui-zhi-tang
    target_field: data.symptoms
    confidence: medium
  - type: symptom
    value: "无汗"
    target_card: gui-zhi-tang
    target_field: data.symptoms
    confidence: medium
  - type: contraindication
    value: "颈部肌肉因寒或缺血而痉挛  | 可能与桂枝麻黄各半汤类似的免疫介导血管扩张，但更固定、更痛 |
| **翕翕发热**  | 体表血管扩张，体温调定点轻度上移           | 轻度炎症因子作用                      |
| **无汗**    | 汗腺交感神经抑制，或毛孔开合枢纽失灵，虽热而汗不出  | 与桂枝汤证汗出相反，提示自主神经调控卡在了另一个极端    |
| **心下满微痛** | 胃肠道平滑肌张力异常、轻度痉挛；"
    target_card: gui-zhi-tang
    target_field: data.contraindications
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #036

```yaml
status: pending
source_location: "原文第129段第1句"
paragraph_context: "* 桂枝麻黄各半汤 = **免疫脉冲与下丘脑的节奏错配**（身痒）
* 桂枝二麻黄一汤 = **治疗引发的自主神经过冲**（大汗脉洪大）
* 桂枝二越婢一汤 = **免疫信号上行扰动边缘系统**（烦躁）
* 桂枝去桂加茯苓白术汤 = **内脏功能紊乱产生牵涉信号与代谢指令冲突**（心下满、无汗、小便不利）"
atomic_sentence: "* 桂枝麻黄各半汤 = **免疫脉冲与下丘脑的节奏错配**（身痒）
* 桂枝二麻黄一汤 = **治疗引发的自主神经过冲**（大汗脉洪大）
* 桂枝二越婢一汤 = **免疫信号上行扰动边缘系统**（烦躁）
* 桂枝去桂加茯苓白术汤 = **内脏功能紊乱产生牵涉信号与代谢指令冲突**（心下满、无汗、小便不利）"
detected_elements:
  - type: formula_name
    value: "桂枝麻黄各半汤"
    target_card: 桂枝麻黄各半汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝二麻黄一汤"
    target_card: 桂枝二麻黄一汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝二越婢一汤"
    target_card: 桂枝二越婢一汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝去桂加茯苓白术汤"
    target_card: 桂枝去桂加茯苓白术汤
    target_field: formula_name
    confidence: high
  - type: symptom
    value: "无汗"
    target_card: 桂枝麻黄各半汤
    target_field: data.symptoms
    confidence: medium
  - type: symptom
    value: "小便不利"
    target_card: 桂枝麻黄各半汤
    target_field: data.symptoms
    confidence: medium
  - type: contraindication
    value: "身痒）
* 桂枝二麻黄一汤 = **治疗引发的自主神经过冲**（大汗脉洪大）
* 桂枝二越婢一汤 = **免疫信号上行扰动边缘系统**（烦躁）
* 桂枝去桂加茯苓白术汤 = **内脏功能紊乱产生牵涉信号与代谢指令冲突**（心下满、无汗、小便不利"
    target_card: 桂枝麻黄各半汤
    target_field: data.contraindications
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #037

```yaml
status: pending
source_location: "原文第136段第1句"
paragraph_context: "## 10. 桂枝加厚朴杏仁汤（原文第四十八条）"
atomic_sentence: "## 10. 桂枝加厚朴杏仁汤（原文第四十八条）"
detected_elements:
  - type: formula_name
    value: "桂枝加厚朴杏仁汤"
    target_card: 桂枝加厚朴杏仁汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #038

```yaml
status: pending
source_location: "原文第145段第1句"
paragraph_context: "## 13. 桂枝甘草汤（原文第六十九条）"
atomic_sentence: "## 13. 桂枝甘草汤（原文第六十九条）"
detected_elements:
  - type: formula_name
    value: "桂枝甘草汤"
    target_card: 桂枝甘草汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #039

```yaml
status: pending
source_location: "原文第146段第1句"
paragraph_context: "> **症状**：发汗过多，其人叉手自冒心，心下悸欲得按者。"
atomic_sentence: "> **症状**：发汗过多，其人叉手自冒心，心下悸欲得按者。"
detected_elements:
  - type: experience
    value: "> **症状**：发汗过多，其人叉手自冒心，心下悸欲得按者。"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #040

```yaml
status: pending
source_location: "原文第148段第1句"
paragraph_context: "| **症状**     | **生理学变化**                             | **原理**                                                                |
| ---------- | ------------------------------------- | --------------------------------------------------------------------- |
| **叉手自冒心**  | 双手交叉抱胸，主动按压胸口处                        | 一种自我保护性的姿势反射，可能是为了稳定胸部或减轻某种不适感                                        |
| **心下悸欲得按** | 心脏搏动感异常增强或节律不整，主观感觉心跳“突突”到嗓子眼；按压后有所缓解 | ①血容量不足→每搏输出量减少→交感反射性加速心率→心脏对胸壁的震动感增强；②按压胸腔可暂时刺激压力感受器，改变迷走张力，反射性调整心率节律 |"
atomic_sentence: "| **症状**     | **生理学变化**                             | **原理**                                                                |
| ---------- | ------------------------------------- | --------------------------------------------------------------------- |
| **叉手自冒心**  | 双手交叉抱胸，主动按压胸口处                        | 一种自我保护性的姿势反射，可能是为了稳定胸部或减轻某种不适感                                        |
| **心下悸欲得按** | 心脏搏动感异常增强或节律不整，主观感觉心跳“突突”到嗓子眼；"
detected_elements:
  - type: experience
    value: "| **症状**     | **生理学变化**                             | **原理**                                                                |
| ---------- | ------------------------------------- | --------------------------------------------------------------------- |
| **叉手自冒心**  | 双手交叉抱胸，主动按压胸口处                        | 一种自我保护性的姿势反射，可能是为了稳定胸部或减轻某种不适感                                        |
| **心下悸欲得按** | 心脏搏动感异常增强或节律不整，主观感觉心跳“突突”到嗓子眼；"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #041

```yaml
status: pending
source_location: "原文第148段第2句"
paragraph_context: "| **症状**     | **生理学变化**                             | **原理**                                                                |
| ---------- | ------------------------------------- | --------------------------------------------------------------------- |
| **叉手自冒心**  | 双手交叉抱胸，主动按压胸口处                        | 一种自我保护性的姿势反射，可能是为了稳定胸部或减轻某种不适感                                        |
| **心下悸欲得按** | 心脏搏动感异常增强或节律不整，主观感觉心跳“突突”到嗓子眼；按压后有所缓解 | ①血容量不足→每搏输出量减少→交感反射性加速心率→心脏对胸壁的震动感增强；②按压胸腔可暂时刺激压力感受器，改变迷走张力，反射性调整心率节律 |"
atomic_sentence: "按压后有所缓解 | ①血容量不足→每搏输出量减少→交感反射性加速心率→心脏对胸壁的震动感增强；"
detected_elements:
  - type: experience
    value: "按压后有所缓解 | ①血容量不足→每搏输出量减少→交感反射性加速心率→心脏对胸壁的震动感增强；"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #042

```yaml
status: pending
source_location: "原文第148段第3句"
paragraph_context: "| **症状**     | **生理学变化**                             | **原理**                                                                |
| ---------- | ------------------------------------- | --------------------------------------------------------------------- |
| **叉手自冒心**  | 双手交叉抱胸，主动按压胸口处                        | 一种自我保护性的姿势反射，可能是为了稳定胸部或减轻某种不适感                                        |
| **心下悸欲得按** | 心脏搏动感异常增强或节律不整，主观感觉心跳“突突”到嗓子眼；按压后有所缓解 | ①血容量不足→每搏输出量减少→交感反射性加速心率→心脏对胸壁的震动感增强；②按压胸腔可暂时刺激压力感受器，改变迷走张力，反射性调整心率节律 |"
atomic_sentence: "②按压胸腔可暂时刺激压力感受器，改变迷走张力，反射性调整心率节律 |"
detected_elements:
  - type: experience
    value: "②按压胸腔可暂时刺激压力感受器，改变迷走张力，反射性调整心率节律 |"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #043

```yaml
status: pending
source_location: "原文第151段第5句"
paragraph_context: "* **“悸”的本质——自主神经对心脏的调控冲突**：资料提到“心脏由交感（胸1-4）和副交感（迷走神经）同时支配。它们同时强的时候，该快时快、该慢时慢”。发汗过多导致血容量下降，脑干感受到压力下降的威胁，本能地增强交感输出（心率加快、收缩增强），但同时因整体血虚、脑干供血不足，其向心脏发送的迷走抑制信号可能变得“卡顿”或不稳定。于是出现交感信号占优、且迷走抑制断续的混乱状态，心脏搏动在人感知中变成一种失控的“悸动”。
* **“欲得按”的神经反射——压力感受器的代偿**：中医常将“得按”视为虚证的喜按表现。从神经科学看，主动按压胸前区（特别是胸骨上窝、心前区）可能**直接刺激了主动脉弓和颈动脉窦的压力感受器**。这些感受器被外力压迫时，会向脑干孤束核发送“血压偏高”的虚假信号，促使孤束核下达指令增强迷走神经对窦房结的抑制（心率下降），从而暂时改善心悸症状——这是身体聪明地用外部机械压迫来“欺骗”脑干的心血管调节系统。
* **桂枝、甘草的大剂量使用**：方中桂枝配甘草大剂量顿服。甘草可升高血压（通过醛固酮样作用保留水钠），从而改善整体血容量，减轻脑干对低血压的警报；桂枝继续维持温通血管、增强心脉搏动的功能。"
atomic_sentence: "* **“欲得按”的神经反射——压力感受器的代偿**：中医常将“得按”视为虚证的喜按表现。"
detected_elements:
  - type: experience
    value: "* **“欲得按”的神经反射——压力感受器的代偿**：中医常将“得按”视为虚证的喜按表现。"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #044

```yaml
status: pending
source_location: "原文第151段第6句"
paragraph_context: "* **“悸”的本质——自主神经对心脏的调控冲突**：资料提到“心脏由交感（胸1-4）和副交感（迷走神经）同时支配。它们同时强的时候，该快时快、该慢时慢”。发汗过多导致血容量下降，脑干感受到压力下降的威胁，本能地增强交感输出（心率加快、收缩增强），但同时因整体血虚、脑干供血不足，其向心脏发送的迷走抑制信号可能变得“卡顿”或不稳定。于是出现交感信号占优、且迷走抑制断续的混乱状态，心脏搏动在人感知中变成一种失控的“悸动”。
* **“欲得按”的神经反射——压力感受器的代偿**：中医常将“得按”视为虚证的喜按表现。从神经科学看，主动按压胸前区（特别是胸骨上窝、心前区）可能**直接刺激了主动脉弓和颈动脉窦的压力感受器**。这些感受器被外力压迫时，会向脑干孤束核发送“血压偏高”的虚假信号，促使孤束核下达指令增强迷走神经对窦房结的抑制（心率下降），从而暂时改善心悸症状——这是身体聪明地用外部机械压迫来“欺骗”脑干的心血管调节系统。
* **桂枝、甘草的大剂量使用**：方中桂枝配甘草大剂量顿服。甘草可升高血压（通过醛固酮样作用保留水钠），从而改善整体血容量，减轻脑干对低血压的警报；桂枝继续维持温通血管、增强心脉搏动的功能。"
atomic_sentence: "从神经科学看，主动按压胸前区（特别是胸骨上窝、心前区）可能**直接刺激了主动脉弓和颈动脉窦的压力感受器**。"
detected_elements:
  - type: experience
    value: "从神经科学看，主动按压胸前区（特别是胸骨上窝、心前区）可能**直接刺激了主动脉弓和颈动脉窦的压力感受器**。"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #045

```yaml
status: pending
source_location: "原文第152段第1句"
paragraph_context: "> **一句话总结**：心悸是血虚后交感过度兴奋与迷走抑制不稳的冲突结果，“欲得按”是身体利用机械压迫刺激压力感受器、假性激活迷走神经的自我调节行为。"
atomic_sentence: "> **一句话总结**：心悸是血虚后交感过度兴奋与迷走抑制不稳的冲突结果，“欲得按”是身体利用机械压迫刺激压力感受器、假性激活迷走神经的自我调节行为。"
detected_elements:
  - type: experience
    value: "> **一句话总结**：心悸是血虚后交感过度兴奋与迷走抑制不稳的冲突结果，“欲得按”是身体利用机械压迫刺激压力感受器、假性激活迷走神经的自我调节行为。"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #046

```yaml
status: pending
source_location: "原文第154段第1句"
paragraph_context: "## 14. 茯苓桂枝甘草大枣汤（原文第七十条）"
atomic_sentence: "## 14. 茯苓桂枝甘草大枣汤（原文第七十条）"
detected_elements:
  - type: formula_name
    value: "茯苓桂枝甘草大枣汤"
    target_card: 茯苓桂枝甘草大枣汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #047

```yaml
status: pending
source_location: "原文第159段第1句"
paragraph_context: "本条是将单纯心悸升级为\*\*“内脏-前庭-情绪联动异常”\*\*的典型，与之后桂枝加桂汤证的“奔豚”反应是一脉相承但程度较轻的版本："
atomic_sentence: "本条是将单纯心悸升级为\*\*“内脏-前庭-情绪联动异常”\*\*的典型，与之后桂枝加桂汤证的“奔豚”反应是一脉相承但程度较轻的版本："
detected_elements:
  - type: formula_name
    value: "桂枝加桂汤"
    target_card: 桂枝加桂汤
    target_field: formula_name
    confidence: high
  - type: contraindication
    value: "本条是将单纯心悸升级为\*\*“内脏-前庭-情绪联动异常”\*\*的典型，与之后桂枝加桂汤证的“奔豚”反应是一脉相承但程度较轻的版本："
    target_card: 桂枝加桂汤
    target_field: data.contraindications
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #048

```yaml
status: pending
source_location: "原文第163段第1句"
paragraph_context: "## 15. 茯苓桂枝白术甘草汤（原文第七十二条）"
atomic_sentence: "## 15. 茯苓桂枝白术甘草汤（原文第七十二条）"
detected_elements:
  - type: formula_name
    value: "茯苓桂枝白术甘草汤"
    target_card: 茯苓桂枝白术甘草汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #049

```yaml
status: pending
source_location: "原文第168段第1句"
paragraph_context: "本条是**内脏-前庭-小脑-自主神经四重系统齐乱的经典呈现**，是整个桂枝汤类方中症状层次最丰富的证型之一："
atomic_sentence: "本条是**内脏-前庭-小脑-自主神经四重系统齐乱的经典呈现**，是整个桂枝汤类方中症状层次最丰富的证型之一："
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #050

```yaml
status: pending
source_location: "原文第177段第1句"
paragraph_context: "```
迷走神经紊乱（心肺/胃肠异常信号）
    ↓
脑干（生命中枢与自主神经枢纽）供血或功能不足
    ↓ 影响
    ├── 心肺反射控制 → 微喘（厚朴杏仁汤）
    ├── 迷走-交感平衡 → 心下悸（桂枝甘草汤）
    ├── 内脏信号过滤与边缘系统预警 → 脐下悸、欲奔豚（苓桂甘枣汤）
    └── 前庭-小脑-内脏联动 → 起则头眩、身为振振摇、心下逆满（苓桂术甘汤）
```"
atomic_sentence: "```
迷走神经紊乱（心肺/胃肠异常信号）
    ↓
脑干（生命中枢与自主神经枢纽）供血或功能不足
    ↓ 影响
    ├── 心肺反射控制 → 微喘（厚朴杏仁汤）
    ├── 迷走-交感平衡 → 心下悸（桂枝甘草汤）
    ├── 内脏信号过滤与边缘系统预警 → 脐下悸、欲奔豚（苓桂甘枣汤）
    └── 前庭-小脑-内脏联动 → 起则头眩、身为振振摇、心下逆满（苓桂术甘汤）
```"
detected_elements:
  - type: formula_name
    value: "桂枝甘草汤"
    target_card: 桂枝甘草汤
    target_field: formula_name
    confidence: high
  - type: symptom
    value: "喘"
    target_card: 桂枝甘草汤
    target_field: data.symptoms
    confidence: medium
  - type: contraindication
    value: "心肺/胃肠异常信号）
    ↓
脑干（生命中枢与自主神经枢纽）供血或功能不足
    ↓ 影响
    ├── 心肺反射控制 → 微喘（厚朴杏仁汤）
    ├── 迷走-交感平衡 → 心下悸（桂枝甘草汤）
    ├── 内脏信号过滤与边缘系统预警 → 脐下悸、欲奔豚（苓桂甘枣汤）
    └── 前庭-小脑-内脏联动 → 起则头眩、身为振振摇、心下逆满（苓桂术甘汤"
    target_card: 桂枝甘草汤
    target_field: data.contraindications
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #051

```yaml
status: pending
source_location: "原文第179段第1句"
paragraph_context: "* 桂枝加厚朴杏仁汤 = **体表紊乱传导至呼吸中枢，迷走-呼吸耦合失调**
* 桂枝甘草汤 = **血虚后交感-迷走对心脏的调控冲突，本体感觉的自我代偿**
* 茯苓桂枝甘草大枣汤 = **肠道异常信号经迷走上传并触发边缘系统预警（奔豚前驱）**
* 茯苓桂枝白术甘草汤 = **肠-脑轴紊乱已完全波及前庭系统和小脑，造成体位性头晕与身体摇动**"
atomic_sentence: "* 桂枝加厚朴杏仁汤 = **体表紊乱传导至呼吸中枢，"
detected_elements:
  - type: formula_name
    value: "桂枝加厚朴杏仁汤"
    target_card: 桂枝加厚朴杏仁汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #052

```yaml
status: pending
source_location: "原文第179段第2句"
paragraph_context: "* 桂枝加厚朴杏仁汤 = **体表紊乱传导至呼吸中枢，迷走-呼吸耦合失调**
* 桂枝甘草汤 = **血虚后交感-迷走对心脏的调控冲突，本体感觉的自我代偿**
* 茯苓桂枝甘草大枣汤 = **肠道异常信号经迷走上传并触发边缘系统预警（奔豚前驱）**
* 茯苓桂枝白术甘草汤 = **肠-脑轴紊乱已完全波及前庭系统和小脑，造成体位性头晕与身体摇动**"
atomic_sentence: "迷走-呼吸耦合失调**
* 桂枝甘草汤 = **血虚后交感-迷走对心脏的调控冲突，"
detected_elements:
  - type: formula_name
    value: "桂枝甘草汤"
    target_card: 桂枝甘草汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #053

```yaml
status: pending
source_location: "原文第179段第3句"
paragraph_context: "* 桂枝加厚朴杏仁汤 = **体表紊乱传导至呼吸中枢，迷走-呼吸耦合失调**
* 桂枝甘草汤 = **血虚后交感-迷走对心脏的调控冲突，本体感觉的自我代偿**
* 茯苓桂枝甘草大枣汤 = **肠道异常信号经迷走上传并触发边缘系统预警（奔豚前驱）**
* 茯苓桂枝白术甘草汤 = **肠-脑轴紊乱已完全波及前庭系统和小脑，造成体位性头晕与身体摇动**"
atomic_sentence: "本体感觉的自我代偿**
* 茯苓桂枝甘草大枣汤 = **肠道异常信号经迷走上传并触发边缘系统预警（奔豚前驱）**
* 茯苓桂枝白术甘草汤 = **肠-脑轴紊乱已完全波及前庭系统和小脑，"
detected_elements:
  - type: formula_name
    value: "茯苓桂枝甘草大枣汤"
    target_card: 茯苓桂枝甘草大枣汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "茯苓桂枝白术甘草汤"
    target_card: 茯苓桂枝白术甘草汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #054

```yaml
status: pending
source_location: "原文第182段第2句"
paragraph_context: "**即将继续输出第五组！** 第五组将分析第16、17、18方（桂枝甘草龙骨牡蛎汤、柴胡加龙骨牡蛎汤、桂枝加桂汤）。这些方证将情绪风暴、中枢敏化与交感神经“终极警报”淋漓尽致地展现出来。"
atomic_sentence: "** 第五组将分析第16、17、18方（桂枝甘草龙骨牡蛎汤、柴胡加龙骨牡蛎汤、桂枝加桂汤）。"
detected_elements:
  - type: formula_name
    value: "桂枝甘草龙骨牡蛎汤"
    target_card: 桂枝甘草龙骨牡蛎汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "柴胡加龙骨牡蛎汤"
    target_card: 柴胡加龙骨牡蛎汤
    target_field: formula_name
    confidence: high
  - type: formula_name
    value: "桂枝加桂汤"
    target_card: 桂枝加桂汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #055

```yaml
status: pending
source_location: "原文第185段第1句"
paragraph_context: "本组包含3个方证，是整个桂枝汤类方的“神经学高峰”——精神症状（惊烦、谵语）和极端躯体反应（奔豚气上冲心）集中爆发。从脑科学看，这是**边缘系统（尤其是杏仁核）失控、交感神经极度兴奋、以及记忆-情绪-内脏感受正反馈恶性循环**的经典呈现。"
atomic_sentence: "本组包含3个方证，是整个桂枝汤类方的“神经学高峰”——精神症状（惊烦、谵语）和极端躯体反应（奔豚气上冲心）集中爆发。"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
  - type: symptom
    value: "谵语"
    target_card: gui-zhi-tang
    target_field: data.symptoms
    confidence: medium
  - type: contraindication
    value: "惊烦、谵语）和极端躯体反应（奔豚气上冲心"
    target_card: gui-zhi-tang
    target_field: data.contraindications
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #056

```yaml
status: pending
source_location: "原文第187段第1句"
paragraph_context: "## 16. 桂枝甘草龙骨牡蛎汤（原文第一百三十三条）"
atomic_sentence: "## 16. 桂枝甘草龙骨牡蛎汤（原文第一百三十三条）"
detected_elements:
  - type: formula_name
    value: "桂枝甘草龙骨牡蛎汤"
    target_card: 桂枝甘草龙骨牡蛎汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #057

```yaml
status: pending
source_location: "原文第196段第1句"
paragraph_context: "## 17. 柴胡加龙骨牡蛎汤（原文第一百二十条）"
atomic_sentence: "## 17. 柴胡加龙骨牡蛎汤（原文第一百二十条）"
detected_elements:
  - type: formula_name
    value: "柴胡加龙骨牡蛎汤"
    target_card: 柴胡加龙骨牡蛎汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #058

```yaml
status: pending
source_location: "原文第205段第1句"
paragraph_context: "## 18. 桂枝加桂汤（原文第一百三十一条）"
atomic_sentence: "## 18. 桂枝加桂汤（原文第一百三十一条）"
detected_elements:
  - type: formula_name
    value: "桂枝加桂汤"
    target_card: 桂枝加桂汤
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #059

```yaml
status: pending
source_location: "原文第208段第4句"
paragraph_context: "| **症状**         | **生理学变化**                                  | **原理**                               |
| -------------- | ------------------------------------------ | ------------------------------------ |
| **核起而赤**       | 局部出现红肿硬结，范围可能大于初始针伤                        | 可能是免疫系统对“寒”（物理刺激+低温暴露）的炎性反应放大        |
| **奔豚，气从少腹上冲心** | 强烈的内脏-躯体感觉异常：一种从下腹部快速上升至咽喉/胸腔的“冲击感”，常伴随濒死感 | 这个症状是整个桂枝汤类方中最典型的“自主神经-内脏-前庭-情绪”联动失控 |"
atomic_sentence: "常伴随濒死感 | 这个症状是整个桂枝汤类方中最典型的“自主神经-内脏-前庭-情绪”联动失控 |"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #060

```yaml
status: pending
source_location: "原文第214段第1句"
paragraph_context: "```
边缘系统（杏仁核、海马）被长期躯体不适与医源性创伤“过度轰炸”
    ↓
杏仁核敏化 → 开始自我放电 → “惊烦”来临
    ↓ 边缘系统的“野火”开始蔓延
    ├── 对内脏信号进行错误解读 → 奔豚恐惧的雏形（桂枝加桂汤证）
    ├── 耗竭皮质（前额叶）资源 → 注意力与语言控制失常（谵语，柴胡加龙牡汤证）
    └── 极度消耗肌肉与能量 → 全身性“灌铅感”与动弹不得（一身尽重，不可转侧）
    ↓
反复出现的“恐惧+躯体不适”记忆 → 形成深刻的“躯体化神经回路”
    ↓ 这是 外周与中枢 相互喂养的恶性循环：
        身体感觉异常 → 杏仁核放大为恐惧 → 交感应激 → 加重躯体异常 → 恐惧进一步深化
```"
atomic_sentence: "```
边缘系统（杏仁核、海马）被长期躯体不适与医源性创伤“过度轰炸”
    ↓
杏仁核敏化 → 开始自我放电 → “惊烦”来临
    ↓ 边缘系统的“野火”开始蔓延
    ├── 对内脏信号进行错误解读 → 奔豚恐惧的雏形（桂枝加桂汤证）
    ├── 耗竭皮质（前额叶）资源 → 注意力与语言控制失常（谵语，"
detected_elements:
  - type: formula_name
    value: "桂枝加桂汤"
    target_card: 桂枝加桂汤
    target_field: formula_name
    confidence: high
  - type: symptom
    value: "谵语"
    target_card: 桂枝加桂汤
    target_field: data.symptoms
    confidence: medium
  - type: experience
    value: "```
边缘系统（杏仁核、海马）被长期躯体不适与医源性创伤“过度轰炸”
    ↓
杏仁核敏化 → 开始自我放电 → “惊烦”来临
    ↓ 边缘系统的“野火”开始蔓延
    ├── 对内脏信号进行错误解读 → 奔豚恐惧的雏形（桂枝加桂汤证）
    ├── 耗竭皮质（前额叶）资源 → 注意力与语言控制失常（谵语，"
    target_card: 桂枝加桂汤
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #061

```yaml
status: pending
source_location: "原文第216段第3句"
paragraph_context: "* 桂枝甘龙牡汤证 = **边缘系统（杏仁核）被伤害性一次性激活，触发持续烦躁**
* 柴胡加龙牡汤证 = **边缘系统失控风暴已波及全身，导致复合的躯体-精神功能崩溃（谵语、沉重）**
* 桂枝加桂汤证 = **边缘系统的“恐惧记忆”已将内脏信号（奔豚）与创伤经历（烧针）绑定成“躯体化的噩梦”**"
atomic_sentence: "导致复合的躯体-精神功能崩溃（谵语、沉重）**
* 桂枝加桂汤证 = **边缘系统的“恐惧记忆”已将内脏信号（奔豚）与创伤经历（烧针）绑定成“躯体化的噩梦”**"
detected_elements:
  - type: formula_name
    value: "桂枝加桂汤"
    target_card: 桂枝加桂汤
    target_field: formula_name
    confidence: high
  - type: symptom
    value: "谵语"
    target_card: 桂枝加桂汤
    target_field: data.symptoms
    confidence: medium
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #062

```yaml
status: pending
source_location: "原文第217段第1句"
paragraph_context: "### 桂枝汤类方的完整神经学意义总结"
atomic_sentence: "### 桂枝汤类方的完整神经学意义总结"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #063

```yaml
status: pending
source_location: "原文第219段第1句"
paragraph_context: "桂枝汤之所以被称为“群方之冠”，在神经科学语境下，其核心意义在于："
atomic_sentence: "桂枝汤之所以被称为“群方之冠”，在神经科学语境下，其核心意义在于："
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
  - type: pathology
    value: "桂枝汤之所以被称为“群方之冠”，在神经科学语境下，其核心意义在于："
    target_card: gui-zhi-tang
    target_field: data.pathology
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #064

```yaml
status: pending
source_location: "原文第222段第1句"
paragraph_context: "正如资料中所言——“中医的‘调神’或‘安神’是处理大脑边缘系统（杏仁核）…我们不是给他吃抗抑郁药，而是用神经训练来改善”——中药方剂，尤其是桂枝汤类方，可能正是通过各种植物化学信号，模拟或促进这一“神经训练”过程。"
atomic_sentence: "正如资料中所言——“中医的‘调神’或‘安神’是处理大脑边缘系统（杏仁核）…我们不是给他吃抗抑郁药，而是用神经训练来改善”——中药方剂，尤其是桂枝汤类方，可能正是通过各种植物化学信号，模拟或促进这一“神经训练”过程。"
detected_elements:
  - type: formula_name
    value: "桂枝汤"
    target_card: gui-zhi-tang
    target_field: formula_name
    confidence: high
reviewer_note: ""
```

**你的批注写在这里。**

---

### 条目 #065

```yaml
status: pending
source_location: "原文第223段第1句"
paragraph_context: "**至此，我已按照您的指令，以“症状逆推生理学 → 脑科学机制解析”的框架，完成了全部18个方证的详细分析。**"
atomic_sentence: "**至此，我已按照您的指令，以“症状逆推生理学 → 脑科学机制解析”的框架，完成了全部18个方证的详细分析。"
detected_elements:
  - type: experience
    value: "**至此，我已按照您的指令，以“症状逆推生理学 → 脑科学机制解析”的框架，完成了全部18个方证的详细分析。"
    target_card: unknown
    target_field: content
    confidence: low
reviewer_note: ""
```

**你的批注写在这里。**

---
