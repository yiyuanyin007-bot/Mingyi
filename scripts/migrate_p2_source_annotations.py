# -*- coding: utf-8 -*-
"""
经方学习系统 - 数据迁移脚本 (P2)
目标：将 references.source_annotations 旧格式迁移到 card.source_annotations 新格式
"""

import json
import re
import os
import shutil
from datetime import datetime

# ==================== 配置 ====================
ROOT_DIR = r'C:\Users\Chen\Desktop\经方学习系统（旧版）'
DATA_DIR = os.path.join(ROOT_DIR, 'data')
NOTES_PATH = os.path.join(ROOT_DIR, 'extracted', 'xiaohongshu_teacher', '伤寒论条文_小红书针道轩.md')
CARDS_PATH = os.path.join(DATA_DIR, 'formula_cards.json')
ARCHIVE_DIR = os.path.join(DATA_DIR, 'archive')

# 需要处理的16张卡片
TARGET_CARDS = {
    'gui-zhi-ma-huang-ge-ban-tang':  {'name': '桂枝麻黄各半汤', 'articles': [23, 27, 48, 247]},
    'da-chai-hu-tang':               {'name': '大柴胡汤',       'articles': [165]},
    'zhi-gan-cao-tang':              {'name': '炙甘草汤',       'articles': [177]},
    'si-ni-tang':                    {'name': '四逆汤',         'articles': [323, 324]},
    'bai-tou-weng-tang':             {'name': '白头翁汤',       'articles': [371, 373]},
    'si-ni-san':                     {'name': '四逆散',         'articles': [318]},
    'li-zhong-wan':                  {'name': '理中丸',         'articles': [386]},
    'wu-zhu-yu-tang':                {'name': '吴茱萸汤',       'articles': [243, 309]},
    'huang-lian-e-jiao-tang':        {'name': '黄连阿胶汤',     'articles': [303]},
    'tao-hua-tang':                  {'name': '桃花汤',         'articles': [306, 307]},
    'bai-tong-tang':                 {'name': '白通汤',         'articles': [314, 315]},
    'tong-mai-si-ni-tang':           {'name': '通脉四逆汤',     'articles': [317]},
    'zhen-wu-tang':                  {'name': '真武汤',         'articles': [316]},
    'ma-huang-fu-zi-xi-xin-tang':    {'name': '麻黄细辛附子汤', 'articles': [301]},
    'ma-huang-fu-zi-gan-cao-tang':   {'name': '麻黄附子甘草汤', 'articles': [302]},
    'dang-gui-si-ni-tang':           {'name': '当归四逆汤',     'articles': [351]},
}

BATCH_ID = 'SH-20260618-025'
SOURCE_TYPE = 'xiaohongshu_teacher'


def parse_notes(filepath):
    """解析小红书笔记，构建条文索引 {article_number: note_block}"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 以 "## 每日学伤寒" 分割笔记块
    blocks = re.split(r'\n## ', content)
    index = {}

    for block in blocks:
        block = block.strip()
        if not block:
            continue
        # 提取条文编号
        m = re.search(r'- 条文编号：第\s*(\d+)\s*条', block)
        if m:
            article_num = int(m.group(1))
            # 如果已有此条文，合并（但通常每个编号只出现一次）
            index[article_num] = block
        else:
            # 尝试匹配 "第 X、Y、Z 条" 合并笔记
            m_multi = re.search(r'- 条文编号：第\s*([\d、,，]+)\s*条', block)
            if m_multi:
                nums_str = m_multi.group(1)
                nums = re.findall(r'\d+', nums_str)
                for n in nums:
                    index[int(n)] = block

    return index


def extract_from_note_block(block, article_num):
    """从笔记块中提取条文原文、刘渡舟、胡希恕、个人总结"""
    lines = block.split('\n')
    # 找到条文编号行后的正文开始
    start_idx = 0
    for i, line in enumerate(lines):
        if f'- 条文编号：第 {article_num} 条' in line or f'- 条文编号：第 {article_num}条' in line:
            start_idx = i + 1
            break
        if re.search(rf'- 条文编号：第\s*{article_num}\s*[,、]\d+\s*条', line):
            start_idx = i + 1
            break

    # 收集所有正文行（从 start_idx 开始）
    content_lines = []
    for i in range(start_idx, len(lines)):
        line = lines[i]
        if re.match(r'## 每日学伤寒', line):
            break
        content_lines.append(line)

    # 将所有内容合并为一个字符串，便于正则解析
    full_content = '\n'.join(content_lines).strip()

    # 定义标记模式（按优先级排序）
    # 模式：刘渡舟 / 胡希恕 / 个人总结
    markers = [
        (r'(?:\d*\s*)?刘渡舟老师[：:]?\s*', '刘渡舟'),
        (r'(?:\d*\s*)?【刘渡舟】\s*', '刘渡舟'),
        (r'(?:\d*\s*)?刘渡舟[：:]\s*', '刘渡舟'),
        (r'(?:\d*\s*)?胡希恕老师[：:]?\s*', '胡希恕'),
        (r'(?:\d*\s*)?【胡希恕】\s*', '胡希恕'),
        (r'(?:\d*\s*)?胡希恕[：:]\s*', '胡希恕'),
        (r'(?:\d*\s*)?个人总结[：:]?\s*', '个人总结'),
        (r'(?:\d*\s*)?【个人总结】\s*', '个人总结'),
    ]

    # 查找所有标记位置
    positions = []
    for pattern, name in markers:
        for m in re.finditer(pattern, full_content):
            positions.append((m.start(), m.end(), name))

    # 去重并排序（按位置）
    positions = sorted(set(positions), key=lambda x: x[0])

    # 提取各段
    text = ''
    liu_text = ''
    hu_text = ''
    summary_text = ''

    if positions:
        # 第一个标记之前的内容作为条文原文
        first_start = positions[0][0]
        text = full_content[:first_start].strip()

        # 提取各注家段落
        for i, (start, end, name) in enumerate(positions):
            if i + 1 < len(positions):
                segment = full_content[end:positions[i+1][0]].strip()
            else:
                segment = full_content[end:].strip()
            if name == '刘渡舟':
                liu_text = segment
            elif name == '胡希恕':
                hu_text = segment
            elif name == '个人总结':
                summary_text = segment
    else:
        # 没有标记，全部作为条文原文
        text = full_content

    return {
        'text': text,
        '刘渡舟': liu_text,
        '胡希恕': hu_text,
        '个人总结': summary_text,
    }


def extract_from_old_summary(summary_str, article_num):
    """从旧格式 summary 字符串中提取各字段"""
    result = {'text': '', '刘渡舟': '', '胡希恕': '', '个人总结': ''}
    if not summary_str:
        return result

    # 提取条文原文（在 【条文】和【刘渡舟】之间）
    m_text = re.search(r'【条文】\s*(.*?)\s*(?=【刘渡舟】|【胡希恕】|个人总结|资料暂缺|$)', summary_str, re.DOTALL)
    if m_text:
        result['text'] = m_text.group(1).strip()
    else:
        # 如果没有标签，取最前面的一段
        parts = summary_str.split('\n')
        if parts:
            result['text'] = parts[0].strip()

    # 提取刘渡舟
    m_liu = re.search(r'【刘渡舟】\s*(.*?)\s*(?=【胡希恕】|个人总结|资料暂缺|$)', summary_str, re.DOTALL)
    if m_liu:
        result['刘渡舟'] = m_liu.group(1).strip()

    # 提取胡希恕
    m_hu = re.search(r'【胡希恕】\s*(.*?)\s*(?=个人总结|资料暂缺|$)', summary_str, re.DOTALL)
    if m_hu:
        result['胡希恕'] = m_hu.group(1).strip()

    # 提取个人总结
    m_sum = re.search(r'个人总结[：:]\s*(.*)', summary_str, re.DOTALL)
    if m_sum:
        result['个人总结'] = m_sum.group(1).strip()

    return result


def extract_from_full_text(full_text, article_num):
    """从 full_text 中解析各字段"""
    result = {'text': '', '刘渡舟': '', '胡希恕': '', '个人总结': ''}
    if not full_text:
        return result

    # 条文原文：在 【条文】标签之后，到第一个注家标签之前
    m_text = re.search(r'【条文】\s*(.*?)\s*(?=【刘渡舟】|【胡希恕】|个人总结|资料暂缺|$)', full_text, re.DOTALL)
    if m_text:
        result['text'] = m_text.group(1).strip()

    # 刘渡舟
    m_liu = re.search(r'【刘渡舟】\s*(.*?)\s*(?=【胡希恕】|个人总结|资料暂缺|$)', full_text, re.DOTALL)
    if m_liu:
        result['刘渡舟'] = m_liu.group(1).strip()

    # 胡希恕
    m_hu = re.search(r'【胡希恕】\s*(.*?)\s*(?=个人总结|资料暂缺|$)', full_text, re.DOTALL)
    if m_hu:
        result['胡希恕'] = m_hu.group(1).strip()

    # 个人总结
    m_sum = re.search(r'个人总结\s*(.*)', full_text, re.DOTALL)
    if m_sum:
        result['个人总结'] = m_sum.group(1).strip()

    return result


def merge_annotations(note_data, old_data, full_data, has_note):
    """合并三种来源的数据，优先级：笔记 > full_text > old summary"""
    result = {}
    for key in ['text', '刘渡舟', '胡希恕', '个人总结']:
        val = ''
        if has_note and note_data.get(key):
            val = note_data[key]
        elif full_data.get(key):
            val = full_data[key]
        elif old_data.get(key):
            val = old_data[key]
        result[key] = val

    # 如果笔记存在但没有注家讲解，且 old_data / full_data 也没有，标记资料暂缺
    if has_note:
        for key in ['刘渡舟', '胡希恕', '个人总结']:
            if not result[key]:
                result[key] = '资料暂缺'

    return result


def build_new_source_annotations(references, notes_index, target_articles):
    """构建新的 source_annotations 格式"""
    old_annotations = references.get('source_annotations', [])
    new_refs = []

    for anno in old_annotations:
        # 尝试从 title 提取条文编号，如 "伤寒论第48条" 或 "伤寒论第243条（阳明）"
        title = anno.get('title', '')
        m = re.search(r'第(\d+)条', title)
        if not m:
            continue
        article_num = int(m.group(1))
        if article_num not in target_articles:
            continue

        # 获取现有数据
        summary = anno.get('summary', '')
        full_text = anno.get('full_text', '')

        # 解析来源
        old_data = extract_from_old_summary(summary, article_num)
        full_data = extract_from_full_text(full_text, article_num) if full_text else {}

        # 检查笔记中是否有此条文
        has_note = article_num in notes_index
        note_data = {}
        if has_note:
            note_data = extract_from_note_block(notes_index[article_num], article_num)

        merged = merge_annotations(note_data, old_data, full_data, has_note)

        # 构建新格式条目
        entry = {
            'text': merged['text'],
            'annotations': {
                '刘渡舟': merged['刘渡舟'] if merged['刘渡舟'] else '资料暂缺',
                '胡希恕': merged['胡希恕'] if merged['胡希恕'] else '资料暂缺',
                '个人总结': merged['个人总结'] if merged['个人总结'] else '资料暂缺',
            }
        }
        new_refs.append((article_num, entry))

    # 对于笔记中有但 old_annotations 中没有的条文，也补充进来
    existing_articles = {a for a, _ in new_refs}
    for article_num in target_articles:
        if article_num in existing_articles:
            continue
        if article_num in notes_index:
            note_data = extract_from_note_block(notes_index[article_num], article_num)
            entry = {
                'text': note_data['text'],
                'annotations': {
                    '刘渡舟': note_data['刘渡舟'] if note_data['刘渡舟'] else '资料暂缺',
                    '胡希恕': note_data['胡希恕'] if note_data['胡希恕'] else '资料暂缺',
                    '个人总结': note_data['个人总结'] if note_data['个人总结'] else '资料暂缺',
                }
            }
            new_refs.append((article_num, entry))
        else:
            # 笔记中没有，也没有 old_annotations，生成空占位
            entry = {
                'text': f'条文第{article_num}条（原文待补充）',
                'annotations': {
                    '刘渡舟': '资料暂缺',
                    '胡希恕': '资料暂缺',
                    '个人总结': '资料暂缺',
                }
            }
            new_refs.append((article_num, entry))

    # 按条文编号排序
    new_refs.sort(key=lambda x: x[0])
    return [entry for _, entry in new_refs]


def main():
    print(f'[{datetime.now().isoformat()}] 开始数据迁移...')

    # 1. 备份原文件
    backup_path = os.path.join(ARCHIVE_DIR, 'formula_cards_before_p2_migration.json')
    if not os.path.exists(backup_path):
        os.makedirs(ARCHIVE_DIR, exist_ok=True)
        shutil.copy(CARDS_PATH, backup_path)
        print(f'已备份原文件到: {backup_path}')
    else:
        print(f'备份已存在: {backup_path}')

    # 2. 读取笔记
    print(f'读取笔记: {NOTES_PATH}')
    notes_index = parse_notes(NOTES_PATH)
    print(f'笔记索引条目数: {len(notes_index)}')

    # 3. 读取卡片
    print(f'读取卡片: {CARDS_PATH}')
    with open(CARDS_PATH, 'r', encoding='utf-8') as f:
        cards = json.load(f)

    # 4. 处理每张目标卡片
    processed = 0
    logs = []

    for card in cards:
        card_id = card.get('id', '')
        if card_id not in TARGET_CARDS:
            continue

        info = TARGET_CARDS[card_id]
        card_name = info['name']
        target_articles = info['articles']

        references = card.get('references', {})
        old_annotations = references.get('source_annotations', [])

        # 构建新格式
        new_references = build_new_source_annotations(references, notes_index, target_articles)

        # 迁移：删除 references.source_annotations，在 card 根添加 source_annotations
        if 'source_annotations' in references:
            del references['source_annotations']

        card['source_annotations'] = {
            'references': new_references,
            'meta': {
                'batch_id': BATCH_ID,
                'source_type': SOURCE_TYPE
            }
        }

        # 更新 updated_at
        card['updated_at'] = datetime.now().isoformat()

        # 统计
        has_missing = any(
            v == '资料暂缺' for ref in new_references for v in ref['annotations'].values()
        )
        has_text = all(ref['text'] for ref in new_references)

        status = '成功'
        if not has_text:
            status = '缺失'
        elif has_missing:
            status = '暂缺'

        log = f'{card_name} ({card_id}) - {len(new_references)}条 - {status}'
        for ref in new_references:
            missing_keys = [k for k, v in ref['annotations'].items() if v == '资料暂缺']
            if missing_keys:
                log += f' | "{ref["text"][:20]}..." 缺: {", ".join(missing_keys)}'
        logs.append(log)
        processed += 1

    # 5. 保存新文件
    print(f'\n处理完成，共 {processed} 张卡片。')
    print('\n处理日志:')
    for log in logs:
        print('  ', log)

    with open(CARDS_PATH, 'w', encoding='utf-8') as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)
    print(f'\n已写入: {CARDS_PATH}')

    # 6. 验证 JSON
    with open(CARDS_PATH, 'r', encoding='utf-8') as f:
        verify = json.load(f)
    print(f'JSON 验证通过，共 {len(verify)} 张卡片。')

    # 7. 验证目标卡片格式
    errors = []
    for card in verify:
        if card.get('id') not in TARGET_CARDS:
            continue
        sa = card.get('source_annotations')
        if not sa:
            errors.append(f'{card["id"]}: 缺少 source_annotations')
            continue
        if 'references' not in sa or 'meta' not in sa:
            errors.append(f'{card["id"]}: source_annotations 结构不完整')
            continue
        for ref in sa['references']:
            if 'text' not in ref or 'annotations' not in ref:
                errors.append(f'{card["id"]}: reference 缺少 text 或 annotations')
                break
            for k in ['刘渡舟', '胡希恕', '个人总结']:
                if k not in ref['annotations']:
                    errors.append(f'{card["id"]}: annotations 缺少 {k}')
                    break
        # 验证旧字段已删除
        if 'source_annotations' in card.get('references', {}):
            errors.append(f'{card["id"]}: references 中仍残留 source_annotations')

    if errors:
        print('\n验证错误:')
        for e in errors:
            print('  ERROR:', e)
    else:
        print('Schema 验证全部通过。')

    print('\n迁移完成。')


if __name__ == '__main__':
    main()
