import json, os, re

def main(ctx):
    base_dir = r'C:\Users\Chen\Desktop\经方学习系统（旧版）'
    json_path = os.path.join(base_dir, 'data', 'formula_cards.json')
    md_path = os.path.join(base_dir, 'extracted', 'xiaohongshu_teacher', '伤寒论条文_小红书针道轩.md')
    
    with open(json_path, 'r', encoding='utf-8') as f:
        cards = json.load(f)
    
    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # 构建小红书笔记索引
    article_index = {}
    pattern = r'## 每日学伤寒｜[学《]*《伤寒论》第([\d、，,\s]+)条\n'
    for match in re.finditer(pattern, md_content):
        article_nums = match.group(1)
        nums = re.findall(r'\d+', article_nums)
        start_pos = match.start()
        end_pos = len(md_content)
        next_match = re.search(r'## 每日学伤寒', md_content[start_pos + 1:])
        if next_match:
            end_pos = start_pos + 1 + next_match.start()
        snippet = md_content[start_pos:end_pos]
        for num in nums:
            article_index[num] = snippet
    
    pattern2 = r'## 每日学伤寒｜《伤寒论》第(\d+)条\n'
    for match in re.finditer(pattern2, md_content):
        num = match.group(1)
        start_pos = match.start()
        end_pos = len(md_content)
        next_match = re.search(r'## 每日学伤寒', md_content[start_pos + 1:])
        if next_match:
            end_pos = start_pos + 1 + next_match.start()
        snippet = md_content[start_pos:end_pos]
        article_index[num] = snippet
    
    def extract_article_from_note(snippet, article_num):
        """从笔记片段中提取指定条文的内容"""
        if not snippet:
            return None
        
        # 查找条文编号
        lines = snippet.split('\n')
        text_lines = []
        in_text = False
        
        for line in lines:
            if f'({article_num})' in line or f'（{article_num}）' in line:
                in_text = True
                text_lines.append(line)
            elif in_text:
                # 检查是否到了下一个条文或笔记结束
                if re.match(r'## ', line):
                    break
                if '刘渡舟' in line or '胡希恕' in line or '个人总结' in line:
                    text_lines.append(line)
                elif line.strip() and not line.startswith('-') and not line.startswith('笔记ID'):
                    text_lines.append(line)
        
        return '\n'.join(text_lines) if text_lines else snippet
    
    def parse_content(text):
        """解析内容，提取条文、刘渡舟、胡希恕、个人总结"""
        result = {'text': '', 'annotations': {'刘渡舟': '', '胡希恕': '', '个人总结': ''}}
        
        if not text:
            return result
        
        # 提取条文（在笔记ID后面的第一段，或包含 (XXX) 的行）
        text_lines = text.split('\n')
        article_lines = []
        liu_lines = []
        hu_lines = []
        ps_lines = []
        
        current_section = None
        for line in text_lines:
            if re.search(r'【?条文】?|刘渡舟', line):
                current_section = 'liu'
                if '【条文】' in line or '条文' in line:
                    current_section = 'text'
            elif '胡希恕' in line:
                current_section = 'hu'
            elif '个人总结' in line:
                current_section = 'ps'
            elif line.strip() == '':
                continue
            
            if current_section == 'text':
                article_lines.append(line)
            elif current_section == 'liu':
                liu_lines.append(line)
            elif current_section == 'hu':
                hu_lines.append(line)
            elif current_section == 'ps':
                ps_lines.append(line)
            else:
                # 默认放入条文
                article_lines.append(line)
        
        result['text'] = '\n'.join(article_lines).strip()
        result['annotations']['刘渡舟'] = '\n'.join(liu_lines).strip()
        result['annotations']['胡希恕'] = '\n'.join(hu_lines).strip()
        result['annotations']['个人总结'] = '\n'.join(ps_lines).strip()
        
        return result
    
    migrated = 0
    cleaned = 0
    skipped = 0
    
    for card in cards:
        refs = card.get('references', {})
        sa_list = refs.get('source_annotations', [])
        
        if not sa_list or not isinstance(sa_list, list) or len(sa_list) == 0:
            # 空列表的旧格式残留，直接删除键
            if 'source_annotations' in card.get('references', {}):
                del card['references']['source_annotations']
                cleaned += 1
            continue
        
        first = sa_list[0]
        if not isinstance(first, dict) or 'summary' not in first:
            # 旧格式不符合迁移条件，但仍有旧格式残留，直接删除
            del card['references']['source_annotations']
            cleaned += 1
            continue
        
        # 已经有新格式的：只删除旧格式，不重复迁移
        if 'source_annotations' in card and card['source_annotations']:
            del card['references']['source_annotations']
            cleaned += 1
            continue
        
        new_refs = []
        for sa in sa_list:
            title = sa.get('title', '')
            article_num = '0'
            match = re.search(r'第\s*(\d+)', title)
            if match:
                article_num = match.group(1)
            
            # 获取内容：优先用 full_text，其次用 summary
            content = sa.get('full_text', '') or sa.get('summary', '')
            
            # 如果 summary 被截断（有...），尝试从笔记提取
            if '...' in sa.get('summary', '') and article_num in article_index:
                note_content = extract_article_from_note(article_index[article_num], article_num)
                if note_content and len(note_content) > len(content):
                    content = note_content
            
            parsed = parse_content(content)
            
            # 如果解析结果为空，使用原始内容
            if not parsed['text']:
                parsed['text'] = sa.get('summary', '')[:200]
            
            # 确保 annotations 不为空
            for key in ['刘渡舟', '胡希恕', '个人总结']:
                if not parsed['annotations'][key]:
                    parsed['annotations'][key] = '资料暂缺，待补充。'
            
            new_refs.append({
                'text': parsed['text'],
                'annotations': parsed['annotations']
            })
        
        if new_refs:
            card['source_annotations'] = {
                'references': new_refs,
                'meta': {
                    'batch_id': 'SH-20260618-025',
                    'source_type': 'xiaohongshu_teacher'
                }
            }
            # 删除旧格式
            del card['references']['source_annotations']
            migrated += 1
    
    # 写回文件
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)
    
    print(f'=== 迁移完成 ===')
    print(f'  迁移卡片: {migrated} 张')
    print(f'  清理旧格式: {cleaned} 张')
    print(f'  跳过卡片: {skipped} 张')
    
    return {'migrated': migrated, 'skipped': skipped}

if __name__ == '__main__':
    main({})
