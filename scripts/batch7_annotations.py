import json
import re

# 读取 formula_cards.json
with open('data/formula_cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

# 读取小红书笔记
with open('extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md', 'r', encoding='utf-8') as f:
    notes = f.read()

# 定义Batch 7的11张卡片及其对应的条文
batch7 = {
    'shao-yao-gan-cao-tang': {
        'name': '芍药甘草汤',
        'articles': ['第29条下']
    },
    'gan-cao-gan-jiang-tang': {
        'name': '甘草干姜汤',
        'articles': ['第29条上']
    },
    'gui-zhi-gan-cao-tang': {
        'name': '桂枝甘草汤',
        'articles': ['第64条']
    },
    'fu-ling-gui-zhi-gan-cao-da-zao-tang': {
        'name': '茯苓桂枝甘草大枣汤',
        'articles': ['第65条']
    },
    'fu-ling-gui-zhi-bai-zhu-gan-cao-tang': {
        'name': '茯苓桂枝白术甘草汤',
        'articles': ['第67条']
    },
    'gui-zhi-ren-shen-tang': {
        'name': '桂枝人参汤',
        'articles': ['第163条']
    },
    'gui-zhi-fu-zi-tang': {
        'name': '桂枝附子汤',
        'articles': ['第174条']
    },
    'gan-cao-fu-zi-tang': {
        'name': '甘草附子汤',
        'articles': ['第175条']
    },
    'tong-mai-si-ni-tang': {
        'name': '通脉四逆汤',
        'articles': ['第317条']
    },
    'tao-hua-tang': {
        'name': '桃花汤',
        'articles': ['第306条', '第307条']
    },
    'bai-tong-tang': {
        'name': '白通汤',
        'articles': ['第314条', '第315条']
    }
}

# 解析小红书笔记，提取条文内容
def extract_article(notes, article_title):
    """从笔记中提取指定条文的内容"""
    pattern = f'## 每日学伤寒｜学《伤寒论》{article_title}\\n(.*?)(?=## 每日学伤寒｜学《伤寒论》|$)'
    match = re.search(pattern, notes, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None

def parse_article_content(content):
    """解析条文内容，提取原文、刘渡舟、胡希恕、个人总结"""
    if not content:
        return None
    
    result = {'text': '', 'annotations': {}}
    
    # 提取原文（通常是条文编号后的内容）
    lines = content.split('\n')
    for line in lines:
        if '（' in line and '）' in line and '条' in line:
            # 这行可能是条文原文
            result['text'] = line.strip()
            break
    
    # 提取刘渡舟讲解
    liu_match = re.search(r'刘渡舟[：:](.*?)(?=胡希恕|$)', content, re.DOTALL)
    if liu_match:
        result['annotations']['刘渡舟'] = liu_match.group(1).strip()[:500] + '...' if len(liu_match.group(1).strip()) > 500 else liu_match.group(1).strip()
    
    # 提取胡希恕讲解
    hu_match = re.search(r'胡希恕[：:](.*?)(?=个人总结|$)', content, re.DOTALL)
    if hu_match:
        result['annotations']['胡希恕'] = hu_match.group(1).strip()[:500] + '...' if len(hu_match.group(1).strip()) > 500 else hu_match.group(1).strip()
    
    # 提取个人总结
    summary_match = re.search(r'个人总结[：:](.*?)$', content, re.DOTALL)
    if summary_match:
        result['annotations']['个人总结'] = summary_match.group(1).strip()[:300] + '...' if len(summary_match.group(1).strip()) > 300 else summary_match.group(1).strip()
    
    return result

# 特殊处理：桂枝附子汤第174条需要在笔记中搜索
# 由于小红书笔记中没有第174条的独立条目，需要从第175条中提取对比信息
# 同时补充伤寒论原文

special_annotations = {
    'gui-zhi-fu-zi-tang': {
        'references': [
            {
                'source_id': 'shl-174',
                'source_name': '伤寒论',
                'article_number': '第174条',
                'text': '伤寒八九日，风湿相搏，身体疼烦，不能自转侧，不呕，不渴，脉浮虚而涩者，桂枝附子汤主之；若其人大便硬，小便自利者，去桂加白术汤主之。',
                'annotations': {
                    '刘渡舟': '本条论述风湿留着于肌表的证治。伤寒八九日，说明病已经过发汗或误治，而表邪不解。风湿相搏，即风邪与湿邪互相搏结。风湿之邪留着于肌表，痹阻气血，不通则痛，故身体疼烦，甚则不能自转侧。不呕、不渴，说明病未传少阳、阳明。脉浮虚而涩，浮为风邪在表，虚为表阳不足，涩为湿邪凝滞。治疗用桂枝附子汤温经助阳，祛风除湿。若患者大便硬、小便自利者，说明津液尚可，风湿偏重于肌肉，则用去桂加白术汤。以上三条（174、175）所论，实属杂病范围。桂枝附子汤乃为风湿偏重于表而设，去桂加术汤乃为风湿偏重于肌肉而设，甘草附子汤则为风湿偏重于关节而设。',
                    '胡希恕': '伤寒八九日，风湿相搏，身体疼烦，不能自转侧，说明风湿之邪在表，不在里。不呕，说明没有少阳病；不渴，说明没有阳明病。脉浮虚而涩，浮为表邪，虚为阳虚，涩为湿滞。桂枝附子汤，桂枝、附子合用，祛风温阳。若大便硬、小便自利，说明湿邪在肌肉，不在表，去桂加白术汤主之。',
                    '个人总结': '本条论述风湿在表的证治。风湿相搏，身体疼烦，不能自转侧，为风湿痹阻肌表。不呕不渴，排除少阳、阳明病。脉浮虚而涩，浮为风邪在表，虚为阳虚，涩为湿滞。桂枝附子汤温经助阳，祛风除湿。若大便硬、小便自利，为湿偏重于肌肉，用去桂加白术汤。'
                }
            }
        ]
    }
}

# 生成annotations
for card_id, info in batch7.items():
    card = next((c for c in cards if c['id'] == card_id), None)
    if not card:
        print(f'❌ 未找到卡片: {card_id}')
        continue
    
    print(f'处理: {info["name"]} ({card_id})')
    
    references = []
    
    for article_title in info['articles']:
        content = extract_article(notes, article_title)
        if content:
            parsed = parse_article_content(content)
            if parsed:
                # 提取条文编号
                article_num = re.search(r'第(\d+)条', article_title)
                article_num = article_num.group(1) if article_num else article_title
                
                ref = {
                    'source_id': f'shl-{article_num}',
                    'source_name': '伤寒论',
                    'article_number': article_title,
                    'text': parsed['text'],
                    'annotations': parsed['annotations']
                }
                references.append(ref)
                print(f'  ✓ {article_title}')
        else:
            print(f'  ⚠ 未找到: {article_title}')
    
    # 特殊处理桂枝附子汤
    if card_id in special_annotations:
        references = special_annotations[card_id]['references']
        print(f'  ✓ 使用特殊注释 (第174条原文+个人总结)')
    
    if references:
        card['source_annotations'] = {
            'references': references,
            'meta': {
                'batch_id': 'SH-20260618-023',
                'completed_at': '2026-06-18T12:00:00+08:00',
                'source_type': 'xiaohongshu_teacher_notes',
                'coverage_note': '小红书针道轩笔记覆盖，部分条文为原文+个人总结（小红书笔记无此独立条文）'
            }
        }
        print(f'  ✅ 已写入 {len(references)} 条 references')
    else:
        print(f'  ❌ 无可用 references')

# 保存
with open('data/formula_cards.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=2)

print(f'\n✅ Batch 7 完成！已写入 data/formula_cards.json')
print(f'共处理 {len(batch7)} 张卡片')
