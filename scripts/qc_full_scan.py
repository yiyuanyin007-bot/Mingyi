import json
import os
import re

def main(ctx):
    os.chdir('C:/Users/Chen/Desktop/经方学习系统（旧版）')
    
    with open('data/formula_cards.json', 'r', encoding='utf-8') as f:
        cards = json.load(f)
    
    with open('extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md', 'r', encoding='utf-8') as f:
        notes = f.read()
    
    # 全量质控扫描
    results = []
    
    for card in cards:
        card_id = card['id']
        name = card.get('name', '') or card.get('formula_name', '')
        
        # 检查 source_annotations
        has_sa = 'source_annotations' in card
        has_old_refs = card.get('references', {}).get('source_annotations', None) is not None
        old_refs_count = len(card.get('references', {}).get('source_annotations', [])) if has_old_refs else 0
        
        if not has_sa and not has_old_refs:
            results.append({
                'id': card_id, 'name': name, 'level': 'P0',
                'issue': '完全无条文数据', 'needs_fix': True,
                'fix_strategy': '从伤寒论原文补充',
                'source': 'card.data.source_text'
            })
            continue
        
        # 检查新格式
        if has_sa:
            sa = card['source_annotations']
            refs = sa.get('references', [])
            
            for i, ref in enumerate(refs):
                text = ref.get('text', '')
                annotations = ref.get('annotations', {})
                article_num = ref.get('article_number', '')
                
                issues = []
                needs_fix = False
                fix_strategy = []
                
                # P0: text 为空
                if not text or not text.strip() or len(text) < 10:
                    issues.append('text为空或极短')
                    needs_fix = True
                    fix_strategy.append('从card.data.source_text补充原文')
                
                # P1: text 中混有注家
                if text and ('刘渡舟' in text or '胡希恕' in text or '个人总结' in text):
                    issues.append('text中混有注家讲解')
                    needs_fix = True
                    fix_strategy.append('从text分离注家到annotations')
                
                # P1: annotations 为空但 text 很长
                if len(text) > 200 and (not annotations or not any(annotations.values())):
                    issues.append('annotations为空但text超长')
                    needs_fix = True
                    fix_strategy.append('重新解析：从text或小红书笔记提取注家')
                
                # P2: 无注家标签
                has_teacher = any(k in ['刘渡舟', '胡希恕'] for k in (annotations or {}).keys())
                if not has_teacher and len(text) > 50 and not issues:
                    issues.append('无注家讲解')
                    # 不一定需要修复，只是信息不足
                
                if issues:
                    results.append({
                        'id': card_id, 'name': name, 'level': 'P0' if 'text为空' in str(issues) else 'P1',
                        'issue': '; '.join(issues), 'needs_fix': needs_fix,
                        'fix_strategy': '; '.join(fix_strategy) if fix_strategy else '无需修复',
                        'article': article_num, 'text_len': len(text),
                        'annotations_keys': list(annotations.keys()) if annotations else [],
                        'source': '新格式'
                    })
        
        # 检查旧格式
        if not has_sa and has_old_refs and old_refs_count > 0:
            for i, anno in enumerate(card['references']['source_annotations']):
                summary = anno.get('summary', '')
                has_tags = '【' in summary
                
                if not summary or len(summary) < 20:
                    results.append({
                        'id': card_id, 'name': name, 'level': 'P0',
                        'issue': '旧格式summary为空或极短', 'needs_fix': True,
                        'fix_strategy': '从card.data.source_text补充',
                        'source': '旧格式空'
                    })
                elif len(summary) < 100:
                    results.append({
                        'id': card_id, 'name': name, 'level': 'P2',
                        'issue': '旧格式summary截断', 'needs_fix': True,
                        'fix_strategy': '迁移到新格式，从小红书笔记重新提取',
                        'source': '旧格式截断'
                    })
                else:
                    # 旧格式正常，标记为兼容
                    pass
    
    # 统计
    needs_fix = [r for r in results if r.get('needs_fix')]
    p0 = [r for r in needs_fix if r['level'] == 'P0']
    p1 = [r for r in needs_fix if r['level'] == 'P1']
    p2 = [r for r in needs_fix if r['level'] == 'P2']
    
    return {
        'total_cards': len(cards),
        'total_issues': len(results),
        'needs_fix': len(needs_fix),
        'p0_count': len(p0),
        'p1_count': len(p1),
        'p2_count': len(p2),
        'p0_list': p0,
        'p1_list': p1,
        'p2_list': p2[:5]
    }
