import json, re, os

def main(ctx):
    base_dir = r'C:\Users\Chen\Desktop\经方学习系统（旧版）'
    
    # 完整的398条原文（从fetch结果获取）
    # 由于内容太长，我需要分批处理
    # 先读取现有的source_cards.json作为模板
    
    with open(os.path.join(base_dir, 'data', 'source_cards.json'), 'r', encoding='utf-8') as f:
        existing = json.load(f)
    
    print(f'现有source_cards.json: {len(existing)}条')
    
    # 从fetch结果中，我可以看到完整的398条原文
    # 我需要解析这些原文，提取每条的：编号、章节、原文、提到的方剂
    
    # 章节映射
    chapter_map = {
        (1, 178): '太阳病篇',
        (179, 262): '阳明病篇', 
        (263, 272): '少阳病篇',
        (273, 281): '太阴病篇',
        (282, 325): '少阴病篇',
        (326, 381): '厥阴病篇',
        (382, 391): '霍乱病篇',
        (392, 398): '阴阳易差后劳复病篇'
    }
    
    def get_chapter(article_num):
        for (start, end), chapter in chapter_map.items():
            if start <= article_num <= end:
                return chapter
        return '未知篇'
    
    # 方剂名称列表（用于提取mentioned_formulas）
    known_formulas = [
        '桂枝汤', '麻黄汤', '葛根汤', '大承气汤', '小柴胡汤',
        '桂枝加葛根汤', '桂枝加厚朴杏子汤', '桂枝去芍药汤',
        '麻黄杏仁甘草石膏汤', '小建中汤', '大青龙汤', '小青龙汤',
        '桂枝加附子汤', '桂枝麻黄各半汤', '桂枝二越婢一汤',
        '葛根加半夏汤', '葛根黄芩黄连汤', '五苓散', '真武汤',
        '四逆汤', '白虎汤', '白虎加人参汤', '调胃承气汤',
        '大柴胡汤', '柴胡加龙骨牡蛎汤', '栀子豉汤', '栀子厚朴汤',
        '栀子干姜汤', '干姜附子汤', '茯苓四逆汤', '桃核承气汤',
        '抵当汤', '抵当丸', '茵陈蒿汤', '麻子仁丸', '炙甘草汤',
        '吴茱萸汤', '黄连阿胶汤', '附子汤', '桃花汤', '白通汤',
        '通脉四逆汤', '四逆散', '猪苓汤', '理中丸', '乌梅丸',
        '当归四逆汤', '白头翁汤', '黄芩汤', '小承气汤',
        '柴胡加芒硝汤', '桂枝甘草汤', '茯苓桂枝甘草大枣汤',
        '茯苓桂枝白术甘草汤', '芍药甘草附子汤', '甘草干姜汤',
        '芍药甘草汤', '栀子甘草豉汤', '栀子生姜豉汤', '枳实栀子豉汤',
        '牡蛎泽泻散', '竹叶石膏汤', '烧裈散', '瓜蒂散', '文蛤散',
        '三物小陷胸汤', '白散', '禹余粮丸', '蜜煎导', '土瓜根',
        '大猪胆汁', '甘草汤', '桔梗汤', '苦酒汤', '半夏散及汤',
        '白通加猪胆汁汤', '通脉四逆加猪胆汤', '四逆加人参汤',
        '麻黄连轺赤小豆汤', '栀子檗皮汤', '桂枝附子汤',
        '去桂加白术汤', '甘草附子汤', '十枣汤', '大黄黄连泻心汤',
        '附子泻心汤', '生姜泻心汤', '甘草泻心汤', '赤石脂禹余粮汤',
        '旋覆代赭汤', '半夏泻心汤', '桂枝加芍药汤', '桂枝加大黄汤',
        '麻黄连翘赤小豆汤', '麻黄升麻汤', '干姜黄芩黄连人参汤',
        '当归四逆加吴茱萸生姜汤', '桂枝去芍药加蜀漆牡蛎龙骨救逆汤',
        '桂枝甘草龙骨牡蛎汤', '桂枝加桂汤', '柴胡桂枝汤',
        '柴胡桂枝干姜汤', '桂枝人参汤', '麻黄细辛附子汤',
        '麻黄附子甘草汤', '茯苓甘草汤'
    ]
    
    def extract_formulas(text):
        """从条文中提取提到的方剂"""
        formulas = []
        for formula in known_formulas:
            if formula in text:
                formulas.append(formula)
        return formulas
    
    def extract_symptoms(text):
        """从条文中提取症状关键词"""
        # 常见症状关键词
        symptom_keywords = [
            '发热', '恶寒', '汗出', '无汗', '头痛', '身疼', '腰痛', '骨节疼痛',
            '恶风', '喘', '咳', '渴', '烦', '呕', '利', '吐', '腹满', '腹痛',
            '心下', '胸胁', '脉浮', '脉沉', '脉紧', '脉缓', '脉细', '脉微',
            '手足', '四肢', '小便', '大便', '谵语', '潮热', '发黄', '厥',
            '自利', '咽痛', '背恶寒', '不得卧', '不欲食', '口苦', '咽干', '目眩'
        ]
        symptoms = []
        for keyword in symptom_keywords:
            if keyword in text and keyword not in symptoms:
                symptoms.append(keyword)
        return symptoms[:10]  # 最多10个
    
    print('准备解析398条原文...')
    print('章节划分：')
    for (start, end), chapter in chapter_map.items():
        print(f'  {chapter}: 第{start}条 - 第{end}条')
    
    print(f'\n已知方剂数量: {len(known_formulas)}')
    
    return {
        'existing': len(existing),
        'known_formulas': len(known_formulas),
        'chapters': len(chapter_map)
    }

if __name__ == '__main__':
    main({})
