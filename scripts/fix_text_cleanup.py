import json
import os
import shutil

def main(ctx):
    os.chdir('C:/Users/Chen/Desktop/经方学习系统（旧版）')
    
    # 备份
    shutil.copy('data/formula_cards.json', 'data/archive/formula_cards-before-text-cleanup-20260618.json')
    print('[1/3] 备份完成')
    
    with open('data/formula_cards.json', 'r', encoding='utf-8') as f:
        cards = json.load(f)
    
    # 修复 P1：清理 text 中残留的注家内容
    # 策略：找到 text 中第一个注家名（刘渡舟/胡希恕/个人总结），截断该位置之后的内容
    fix_count = 0
    teacher_names = ['刘渡舟', '胡希恕', '个人总结', '方义']
    
    for card in cards:
        sa = card.get('source_annotations')
        if not sa or not sa.get('references'):
            continue
        
        for ref in sa['references']:
            text = ref.get('text', '')
            if not text or len(text) < 100:
                continue
            
            # 检查 text 中是否含有注家名
            first_teacher_pos = -1
            first_teacher = None
            for name in teacher_names:
                pos = text.find(name)
                if pos > 0 and (first_teacher_pos == -1 or pos < first_teacher_pos):
                    first_teacher_pos = pos
                    first_teacher = name
            
            if first_teacher_pos > 0:
                # 截断：保留注家名之前的内容
                original_len = len(text)
                cleaned_text = text[:first_teacher_pos].strip()
                
                # 确保 annotations 中有该注家内容（如果还没有的话）
                annotations = ref.get('annotations', {}) or {}
                if first_teacher not in annotations or not annotations[first_teacher]:
                    # 从截断的部分提取注家内容
                    teacher_content = text[first_teacher_pos:].strip()
                    # 去掉前缀
                    for prefix in [first_teacher, first_teacher + '：', first_teacher + ':', first_teacher + '老师', first_teacher + '老师：']:
                        if teacher_content.startswith(prefix):
                            teacher_content = teacher_content[len(prefix):].strip()
                            break
                    if teacher_content:
                        annotations[first_teacher] = teacher_content
                        ref['annotations'] = annotations
                
                ref['text'] = cleaned_text
                fix_count += 1
                print(f'  [FIX] {card["name"]} {ref.get("article_number", "")}: text 从 {original_len}字 -> {len(cleaned_text)}字 (截断"{first_teacher}")')
    
    # 保存
    with open('data/formula_cards.json', 'w', encoding='utf-8') as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)
    
    print(f'[3/3] 清理完成！共修复 {fix_count} 条，数据已保存')
    
    return {'fix_count': fix_count}
