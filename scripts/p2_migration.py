import json, os, re, copy

def main(ctx):
    base_dir = r'C:\Users\Chen\Desktop\经方学习系统（旧版）'
    json_path = os.path.join(base_dir, 'data', 'formula_cards.json')
    md_path = os.path.join(base_dir, 'extracted', 'xiaohongshu_teacher', '伤寒论条文_小红书针道轩.md')
    
    with open(json_path, 'r', encoding='utf-8') as f:
        cards = json.load(f)
    
    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # 构建小红书笔记索引：找到所有条文编号对应的起始位置
    # 格式：## 每日学伤寒｜学《伤寒论》第XXX、YYY条
    # 或者：## 每日学伤寒｜《伤寒论》第XXX条
    article_index = {}
    
    # 匹配笔记标题
    pattern = r'## 每日学伤寒｜[学《]*《伤寒论》第([\d、，,\s]+)条\n'
    for match in re.finditer(pattern, md_content):
        article_nums = match.group(1)
        # 解析条文编号
        nums = re.findall(r'\d+', article_nums)
        start_pos = match.start()
        end_pos = len(md_content)
        
        # 找到下一个笔记标题的位置作为结束
        next_match = re.search(r'## 每日学伤寒', md_content[start_pos + 1:])
        if next_match:
            end_pos = start_pos + 1 + next_match.start()
        
        snippet = md_content[start_pos:end_pos]
        for num in nums:
            article_index[num] = {
                'start': start_pos,
                'end': end_pos,
                'snippet': snippet
            }
    
    # 也匹配单条条文格式
    pattern2 = r'## 每日学伤寒｜《伤寒论》第(\d+)条\n'
    for match in re.finditer(pattern2, md_content):
        num = match.group(1)
        start_pos = match.start()
        end_pos = len(md_content)
        next_match = re.search(r'## 每日学伤寒', md_content[start_pos + 1:])
        if next_match:
            end_pos = start_pos + 1 + next_match.start()
        snippet = md_content[start_pos:end_pos]
        article_index[num] = {
            'start': start_pos,
            'end': end_pos,
            'snippet': snippet
        }
    
    print(f'=== 构建索引完成，共 {len(article_index)} 条条文 ===')
    
    # 定义需要修复的卡片
    # 分为两类：
    # 1. summary被截断的（需要重新提取）
    # 2. source_annotations为空或缺失的（需要创建）
    
    # 首先找出所有有问题的卡片
    cards_to_fix = []
    for card in cards:
        card_id = card['id']
        card_name = card.get('name', '')
        
        # 检查 source_annotations
        has_top_sa = 'source_annotations' in card and card['source_annotations']
        refs = card.get('references', {})
        has_ref_sa = 'source_annotations' in refs and refs['source_annotations']
        
        needs_fix = False
        fix_reason = []
        sa_entries = []
        
        if has_top_sa:
            for sa in card['source_annotations']:
                if isinstance(sa, dict) and 'summary' in sa:
                    if '...' in sa['summary'] and ('【刘渡舟】' in sa['summary'] or '【胡希恕】' in sa['summary']):
                        needs_fix = True
                        fix_reason.append(f"top summary truncated: {sa.get('title', '')}")
                        sa_entries.append(('top', sa))
        
        if has_ref_sa:
            for sa in refs['source_annotations']:
                if isinstance(sa, dict) and 'summary' in sa:
                    if '...' in sa['summary'] and ('【刘渡舟】' in sa['summary'] or '【胡希恕】' in sa['summary']):
                        needs_fix = True
                        fix_reason.append(f"ref summary truncated: {sa.get('title', '')}")
                        sa_entries.append(('ref', sa))
                    elif 'id' not in sa:
                        # 旧格式无id
                        needs_fix = True
                        fix_reason.append(f"old format no id: {sa.get('title', '')}")
                        sa_entries.append(('ref', sa))
        
        if not has_top_sa and not has_ref_sa:
            needs_fix = True
            fix_reason.append("missing source_annotations")
        
        if needs_fix:
            cards_to_fix.append({
                'card_id': card_id,
                'card_name': card_name,
                'reason': fix_reason,
                'sa_entries': sa_entries,
                'source_text_ids': card.get('source_text_ids', [])
            })
    
    print(f'=== 需要修复的卡片: {len(cards_to_fix)} 张 ===')
    for c in cards_to_fix[:30]:
        print(f"  {c['card_id']} | {c['card_name']} | {c['reason']}")
    if len(cards_to_fix) > 30:
        print(f"  ... 还有 {len(cards_to_fix) - 30} 张")
    
    return {
        'article_index_size': len(article_index),
        'cards_to_fix_count': len(cards_to_fix),
        'cards_to_fix': cards_to_fix[:20]
    }
