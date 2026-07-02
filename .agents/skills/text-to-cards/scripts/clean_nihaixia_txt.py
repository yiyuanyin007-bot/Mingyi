#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
清洗 倪海厦-人纪-伤寒论.txt
- 文件实际是 gb2312 编码的 HTML
- 去除 HTML 标签
- 去除页眉页脚、广告、脚本
- 将人工换行（一页内换行）合并为自然段落
- 输出 UTF-8 纯文本
"""

import argparse
import re
from pathlib import Path


def strip_html(text: str) -> str:
    """简单去除 HTML 标签。"""
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)
    text = text.replace('&nbsp;', ' ')
    text = text.replace('&lt;', '<')
    text = text.replace('&gt;', '>')
    text = text.replace('&amp;', '&')
    return text


def clean_noise(text: str) -> str:
    """清洗页眉页脚、广告、噪声行。"""
    noise_patterns = [
        r'勤求古\s*，\s*博采方\s*倪注《伤寒论》',
        r'第\s*\d+\s*页',
        r'\d{4}-\d{2}-\d{2}定稿',
        r'\^其\}C',
        r'知犯何逆',
        r'SC治之',
        r'更多资料请关注QQ：\d+',
        r'请尊重版权，本资料仅供学习参考',
        r'全本免费阅读.*?e书联盟',
        r'http://www\.book118\.com.*',
        r'本站所有资源部分转载自互联网',
        r'请下载后24小时内删除',
        r'根据相关法律,本电子版,仅供网络测试,不收取任何费用,请您下载后 24 小时内删除,如\s*果您喜欢本书,请购买原版。任何人不得将本书用于商业行为,否则由此引发的任何直接或间\s*接的法律问题,我们不承担责任。',
        r'根据相关法律,本电子书仅供网络测试,不收取任何费用。请您下载后24小时内删除,\s*如果您喜欢本书,请购买原版。任何人不得将本书用于商业行为,否则由此直接或间接引发\s*的任何法律问题,我们不承担责任。',
        r'员\s+内容打钫人1校B\s+2校人员\s+2校B\s+手打人\s+手打\s+手\s+B1校\s+T',
        r'Elko.*完成.*英年.*肥',
        r'山西-一心.*完成.*英年.*肥',
        r'馨缘飘香.*完成.*英年.*肥',
        r'珠海拎壶葱.*完成.*英年.*肥',
        r'海总是那么蓝.*完成.*四\}.*完',
        r'欣p.*完成.*四\}.*完',
        r'环子.*完成.*穿越.*完成',
        r'天空之城.*完成.*四\}.*完成',
        r'淡定middl.*完成.*四\}.*完.*e',
        r'i漪.*完成.*年早.*完',
        r'\{色晴天.*完成.*四\}.*完成',
        r'清净子.*完成.*四\}.*完',
        r'大道甚夷.*完成.*四\}.*完',
        r'草根.*完成.*穿越.*完成',
        r'Apollo1.*完成.*穿越.*完成',
        r'Hebi.*完成.*四\}.*完成',
        r'Berry.*完成.*四\}.*完成',
        r'校正l起：Elko\s+统筹排版：四\}',
        r'^\s*早\s*$',
        r'^\s*肥\s*$',
        r'^\s*完\s*$',
        r'^\s*成\s*$',
        r'^\s*英\s*$',
        r'^\s*年\s*$',
    ]
    for pattern in noise_patterns:
        text = re.sub(pattern, '', text, flags=re.MULTILINE | re.DOTALL)
    return text


def join_broken_lines(text: str) -> str:
    """
    将一页内的人工换行合并。
    策略：把单行换行替换为空格，保留空行作为段落分隔。
    """
    # 先把 Windows 换行统一成 \n
    text = text.replace('\r\n', '\n')
    # 把连续空行合并成段落分隔标记
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    # 用占位符保护段落分隔
    text = text.replace('\n\n', '<<PARA>>')
    # 把剩余单行换行替换为空格（合并同一页内的断行）
    text = text.replace('\n', '')
    # 还原段落分隔
    text = text.replace('<<PARA>>', '\n\n')
    return text


def split_by_article_numbers(text: str) -> str:
    """
    按条文编号拆分段落。
    伤寒论条文格式：一二三四五六七八九十百千万 + ：或 :
    例如：二：、四一：、三七一：
    """
    # 凡是遇到「中文数字 + 全角冒号/半角冒号」的条文编号，前面加分段
    pattern = r'([一二三四五六七八九十百千万]{1,4}[：:])'
    text = re.sub(pattern, r'\n\n\1', text)
    return text


def final_clean(text: str) -> str:
    """最终清理。"""
    # 合并多余空格
    text = re.sub(r' +', ' ', text)
    # 合并多余空行
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    return text.strip()


def main():
    parser = argparse.ArgumentParser(description='清洗 倪海厦-人纪-伤寒论.txt')
    parser.add_argument('--input', required=True, help='输入文件路径')
    parser.add_argument('--output', required=True, help='输出文件路径')
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        raise FileNotFoundError(f'输入文件不存在: {args.input}')

    with open(input_path, 'r', encoding='gb2312', errors='ignore') as f:
        raw = f.read()

    text = strip_html(raw)
    text = clean_noise(text)
    text = join_broken_lines(text)
    text = split_by_article_numbers(text)
    text = final_clean(text)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(text)

    print(f'清洗完成。原始 {len(raw)} 字符，清洗后 {len(text)} 字符。')
    print(f'输出: {output_path}')


if __name__ == '__main__':
    main()
