import json
import os
import shutil

os.chdir('C:/Users/Chen/Desktop/经方学习系统（旧版）')

# 1. 备份
timestamp = '20260618-fix'
backup_path = f'data/archive/formula_cards-before-fix-{timestamp}.json'
shutil.copy('data/formula_cards.json', backup_path)
print(f'[1/4] 备份完成: {backup_path}')

# 2. 加载
with open('data/formula_cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

# 3. 修复 P0 问题（text 为空）
# 策略：从 card.data.source_text 或 canonical 提取原文
fix_count = 0
p0_ids = ['tong-mai-si-ni-tang', 'tao-hua-tang', 'bai-tong-tang']

for card in cards:
    if card['id'] not in p0_ids:
        continue
    
    sa = card.get('source_annotations')
    if not sa or not sa.get('references'):
        continue
    
    # 获取原文来源
    source_text = card.get('data', {}).get('source_text', '')
    canonical_text = card.get('data', {}).get('canonical', {}).get('source_text', '')
    fallback_text = source_text or canonical_text
    
    for ref in sa['references']:
        text = ref.get('text', '')
        if not text or not text.strip():
            # 需要修复
            if fallback_text and len(fallback_text) > 10:
                ref['text'] = fallback_text
                fix_count += 1
                print(f'  [FIX] {card["name"]} {ref.get("article_number", "")}: text 从空 -> 使用 card.data.source_text ({len(fallback_text)}字)')
            else:
                # 连 fallback 都没有，标记问题
                ref['text'] = '【条文原文待补充】'
                print(f'  [WARN] {card["name"]} {ref.get("article_number", "")}: 无可用原文，标记待补充')

# 4. 修复所有 Batch 7 卡片的 annotations 解析问题
# 重新检查：text 中是否混有注家内容（需要分离）
for card in cards:
    sa = card.get('source_annotations')
    if not sa or not sa.get('references'):
        continue
    
    for ref in sa['references']:
        text = ref.get('text', '')
        annotations = ref.get('annotations', {})
        
        # 情况：text 超长但 annotations 为空（说明注家内容混在 text 中）
        if len(text) > 300 and (not annotations or not any(annotations.values())):
            # 尝试从 text 中分离注家内容
            # 注家名列表（可扩展）
            teacher_names = ['刘渡舟', '胡希恕', '个人总结', '方义']
            found_teachers = []
            for name in teacher_names:
                if name in text:
                    found_teachers.append(name)
            
            if found_teachers:
                # 分离逻辑：以第一个注家名作为分隔点
                # 注家名之前的内容保留为 text，之后的内容归入 annotations
                first_teacher = found_teachers[0]
                idx = text.find(first_teacher)
                if idx > 0:
                    original_text = text[:idx].strip()
                    teacher_content = text[idx:].strip()
                    
                    # 更新 text
                    ref['text'] = original_text
                    
                    # 解析 annotations
                    new_annotations = {}
                    remaining = teacher_content
                    for name in found_teachers:
                        if name in remaining:
                            # 找到该注家的内容范围
                            start = remaining.find(name)
                            # 找下一个注家的位置
                            next_start = len(remaining)
                            for next_name in found_teachers:
                                if next_name != name and next_name in remaining:
                                    pos = remaining.find(next_name, start + len(name))
                                    if pos > 0 and pos < next_start:
                                        next_start = pos
                            
                            content = remaining[start:next_start].strip()
                            # 去掉注家名前缀
                            for prefix in [name, name + '：', name + ':', name + '老师', name + '老师：']:
                                if content.startswith(prefix):
                                    content = content[len(prefix):].strip()
                                    break
                            
                            if content:
                                new_annotations[name] = content
                    
                    ref['annotations'] = new_annotations
                    fix_count += 1
                    print(f'  [FIX] {card["name"]} {ref.get("article_number", "")}: 从 text 分离出 {list(new_annotations.keys())} ({len(original_text)}字 / {sum(len(v) for v in new_annotations.values())}字)')

# 5. 保存
with open('data/formula_cards.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=2)

print(f'[4/4] 修复完成！共修复 {fix_count} 处，数据已保存')
