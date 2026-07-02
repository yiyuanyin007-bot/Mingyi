#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SP 病例批量生成器 v0.1

功能：根据输入的方剂 ID 列表，从 source_article_map.json 和 symptom_expression_index.json
      自动组装生成 SP 病例所需的全部素材（数据包），供 AI 快速生成完整的 SP JSON。

用法：
    python scripts/sp_generator.py --formula gui-zhi-tang,da-qing-long-tang
    python scripts/sp_generator.py --all  # 生成全部 35 方
    python scripts/sp_generator.py --chapter 太阳病篇  # 按篇章生成

输出：stdout 输出 JSON 数据包，或写入 data/sp_generation_packages.json
"""

import json
import sys
import os
import argparse
from typing import List, Dict, Any

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')


def load_json(filename: str) -> Any:
    """加载 JSON 文件。"""
    path = os.path.join(DATA_DIR, filename)
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def find_article_entries(formula_id: str, article_map: List[Dict]) -> List[Dict]:
    """从 source_article_map 中找到所有包含该方剂的条文。"""
    return [e for e in article_map if formula_id in e.get('formulas', [])]


def get_symptom_expressions(symptom_pool: List[str], expression_index: Dict) -> Dict[str, Any]:
    """从表达索引中获取 symptom_pool 中每个症状的口语表达。"""
    expressions = {}
    for symptom in symptom_pool:
        if symptom in expression_index.get('symptoms', {}):
            expressions[symptom] = expression_index['symptoms'][symptom]
        else:
            # 如果索引中没有，标记为缺失
            expressions[symptom] = {
                'category': '未知',
                'subcategory': '未知',
                'expressions': [],
                'missing': True
            }
    return expressions


def recommend_persona(chapter: str, difficulty: int) -> str:
    """根据篇章和难度推荐人格。"""
    persona_map = {
        '太阳病篇': {
            1: 'anxious-middle-aged-female',  # 表虚，焦虑
            2: 'talkative-elderly-female',
            3: 'skeptical-patient'
        },
        '阳明病篇': {
            1: 'skeptical-patient',  # 腑实，急躁
            2: 'intellectual-young-adult',
            3: 'skeptical-patient'
        },
        '少阳病篇': {
            1: 'talkative-elderly-female',  # 症状复杂，话多
            2: 'intellectual-young-adult',
            3: 'skeptical-patient'
        },
        '少阴病篇': {
            1: 'silent-elderly-male',  # 但欲寐，沉默
            2: 'silent-elderly-male',
            3: 'silent-elderly-male'
        },
        '太阴病篇': {
            1: 'anxious-middle-aged-female',
            2: 'talkative-elderly-female',
            3: 'silent-elderly-male'
        },
        '厥阴病篇': {
            1: 'skeptical-patient',
            2: 'intellectual-young-adult',
            3: 'skeptical-patient'
        }
    }
    return persona_map.get(chapter, {}).get(difficulty, 'anxious-middle-aged-female')


def select_distractors(
    formula_id: str,
    chapter: str,
    difficulty: int,
    article_map: List[Dict],
    formula_cards: List[Dict]
) -> List[Dict]:
    """
    选择干扰项候选。
    策略：
    - 同病不同方（同篇章不同方剂）
    - 同方不同条文（同一方剂的不同条文）
    - 相邻编号条文
    """
    distractors = []
    
    # 1. 同篇章不同方（同病不同方）
    same_chapter = [
        e for e in article_map
        if e['chapter'] == chapter
        and formula_id not in e.get('formulas', [])
    ]
    
    # 2. 同一方剂的其他条文（同方不同文）
    same_formula = [
        e for e in article_map
        if formula_id in e.get('formulas', [])
        and e['id'] != formula_id  # 避免自己
    ]
    
    # 3. 从 formula_cards 中找同篇章的其他方（确保存在卡片）
    card_ids = {c['id'] for c in formula_cards}
    same_chapter_formulas = set()
    for e in same_chapter:
        for fid in e.get('formulas', []):
            if fid in card_ids and fid != formula_id:
                same_chapter_formulas.add(fid)
    
    # 组装干扰项候选
    for e in same_chapter[:10]:
        for fid in e.get('formulas', []):
            if fid in card_ids and fid != formula_id:
                distractors.append({
                    'type': 'same_disease_different_formula',
                    'article_id': e['id'],
                    'formula_id': fid,
                    'text': e.get('text', ''),
                    'article_number': e.get('article_number', ''),
                    'difficulty': e.get('difficulty', 1)
                })
    
    for e in same_formula[:5]:
        distractors.append({
            'type': 'same_formula_simplified' if e.get('difficulty', 1) <= 1 else 'same_formula_variant',
            'article_id': e['id'],
            'formula_id': formula_id,
            'text': e.get('text', ''),
            'article_number': e.get('article_number', ''),
            'difficulty': e.get('difficulty', 1)
        })
    
    # 去重
    seen = set()
    unique = []
    for d in distractors:
        key = (d['article_id'], d['formula_id'])
        if key not in seen:
            seen.add(key)
            unique.append(d)
    
    return unique[:20]  # 最多返回 20 个候选


def generate_package(
    formula_id: str,
    article_map: List[Dict],
    expression_index: Dict,
    formula_cards: List[Dict]
) -> Dict[str, Any]:
    """
    为单个方剂生成 SP 病例数据包。
    """
    # 1. 找到对应的方剂卡片
    formula_card = None
    for c in formula_cards:
        if c['id'] == formula_id:
            formula_card = c
            break
    
    if not formula_card:
        return {'error': f'方剂 {formula_id} 在 formula_cards.json 中未找到'}
    
    # 2. 找到对应的条文
    entries = find_article_entries(formula_id, article_map)
    if not entries:
        return {'error': f'方剂 {formula_id} 在 source_article_map 中未找到对应条文'}
    
    # 选择主条目（难度最低或 article_number 最小的）
    primary = min(entries, key=lambda e: (e.get('difficulty', 3), e.get('article_number', 999)))
    
    # 3. 获取口语表达
    expressions = get_symptom_expressions(
        primary.get('symptom_pool', []),
        expression_index
    )
    
    # 4. 推荐人格
    persona = recommend_persona(
        primary.get('chapter', '太阳病篇'),
        primary.get('difficulty', 1)
    )
    
    # 5. 选择干扰项候选
    distractors = select_distractors(
        formula_id,
        primary.get('chapter', '太阳病篇'),
        primary.get('difficulty', 1),
        article_map,
        formula_cards
    )
    
    # 6. 组装数据包
    package = {
        'formula_id': formula_id,
        'formula_name': formula_card.get('formula_name', ''),
        'formula_herbs': [h['name'] for h in formula_card.get('data', {}).get('canonical', {}).get('herbs', [])],
        'chapter': primary.get('chapter', ''),
        'source_article': {
            'id': primary['id'],
            'article_number': primary.get('article_number', ''),
            'text': primary.get('text', ''),
            'difficulty': primary.get('difficulty', 1),
            'status': primary.get('status', 'pending')
        },
        'symptom_pool': primary.get('symptom_pool', []),
        'clue_map': primary.get('clue_map', {}),
        'symptom_expressions': expressions,
        'recommended_persona': persona,
        'distractor_candidates': distractors,
        'all_related_entries': [
            {'id': e['id'], 'article_number': e.get('article_number', ''), 'difficulty': e.get('difficulty', 1)}
            for e in entries
        ]
    }
    
    return package


def generate_all(
    formula_ids: List[str] = None,
    chapter: str = None
) -> List[Dict]:
    """批量生成数据包。"""
    article_map = load_json('source_article_map.json')
    expression_index = load_json('symptom_expression_index.json')
    formula_cards = load_json('formula_cards.json')
    
    if formula_ids is None:
        if chapter:
            # 按篇章过滤
            chapter_entries = [e for e in article_map if e.get('chapter') == chapter]
            formula_ids = list(set(
                fid for e in chapter_entries for fid in e.get('formulas', [])
            ))
        else:
            # 全部 35 方
            formula_ids = [c['id'] for c in formula_cards]
    
    packages = []
    errors = []
    
    for fid in formula_ids:
        pkg = generate_package(fid, article_map, expression_index, formula_cards)
        if 'error' in pkg:
            errors.append(pkg)
        else:
            packages.append(pkg)
    
    return {
        'packages': packages,
        'errors': errors,
        'total': len(packages),
        'error_count': len(errors)
    }


def main():
    parser = argparse.ArgumentParser(description='SP 病例批量生成器 v0.1')
    parser.add_argument('--formula', type=str, help='方剂 ID，逗号分隔')
    parser.add_argument('--all', action='store_true', help='生成全部 35 方')
    parser.add_argument('--chapter', type=str, help='按篇章生成（如：太阳病篇）')
    parser.add_argument('--output', type=str, default='data/sp_generation_packages.json',
                        help='输出文件路径')
    
    args = parser.parse_args()
    
    formula_ids = None
    if args.formula:
        formula_ids = [f.strip() for f in args.formula.split(',')]
    
    result = generate_all(formula_ids, args.chapter)
    
    # 输出
    output_path = os.path.join(PROJECT_ROOT, args.output)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"生成完成：{result['total']} 个数据包")
    if result['error_count'] > 0:
        print(f"错误：{result['error_count']} 个")
        for e in result['errors']:
            print(f"  - {e['error']}")
    print(f"输出文件：{output_path}")


if __name__ == '__main__':
    main()
