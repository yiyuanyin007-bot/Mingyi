#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
条文笔记功能 · 交互 DEMO（终端静态展示版）
目的：演示「读原文 -> 记笔记」的核心交互设计流程。
运行：python "docs/笔记功能DEMO.py"
"""

import time
import textwrap


# ── 模拟数据 ────────────────────────────────────────────

SOURCES_DATA = [
    {
        "verse": "第12条",
        "chapter": "太阳病篇",
        "text": "太阳中风，阳浮而阴弱。阳浮者，热自发；阴弱者，汗自出。啬啬恶寒，淅淅恶风，翕翕发热，鼻鸣干呕者，桂枝汤主之。"
    },
    {
        "verse": "第13条",
        "chapter": "太阳病篇",
        "text": "太阳病，头痛发热，汗出恶风者，桂枝汤主之。"
    },
    {
        "verse": "第95条",
        "chapter": "太阳病篇",
        "text": "太阳病，发热汗出者，此为荣弱卫强，故使汗出，欲救邪风者，宜桂枝汤。"
    }
]

NOTES_EXAMPLE = {
    "ty-012": {
        "content": "\"阳浮而阴弱\"提示卫强营弱的关键病机。\n\"鼻鸣干呕\"是太阳中风区别于伤寒的特征点。\n注意与第13条的鉴别：12条更强调\"干呕\"。",
        "tags": ["病机", "鉴别"],
        "updated_at": "2026-07-14 20:15"
    }
}


# ── 显示工具 ────────────────────────────────────────────

def divider(char="-", width=60):
    return char * width

def step(title):
    print("\n" + "+" + "-" * 58 + "+")
    print("| " + title + " " * (57 - len(title)) + "|")
    print("+" + "-" * 58 + "+")
    print()

def wait(text):
    print(text)
    time.sleep(1.5)

def wrap(text, width=50):
    out = ""
    for p in text.split("\n"):
        out += textwrap.fill(p, width=width) + "\n"
    return out.rstrip("\n")


# ── 流程展示 ────────────────────────────────────────────

def scene_1_browse():
    """场景1：条文列表"""
    step("场景1 -- 条文浏览（学习页 -> 条文面板）")
    
    print("  你点击了桂枝汤的「条文原文」按钮，看到：")
    print()
    for i, src in enumerate(SOURCES_DATA):
        print("  [" + str(i+1) + "]  " + src["verse"] + "：" + src["text"][:40] + "...")
        print()
    
    # 带笔记的提示
    print("  「第12条」旁边有一个 [N] 标记，表示你之前记过笔记")
    print()
    wait("  >> 你选择 [1] 进入第12条...")


def scene_2_reading():
    """场景2：阅读条文 + 查看笔记"""
    src = SOURCES_DATA[0]
    note = NOTES_EXAMPLE["ty-012"]
    
    step("场景2 -- 阅读条文 + 查看笔记")
    
    print("  [" + src["verse"] + "]（" + src["chapter"] + "）")
    print("  " + divider("~"))
    print("  " + wrap(src["text"]))
    print("  " + divider("~"))
    print()
    print("  [N] 你的笔记（更新于 " + note["updated_at"] + "）：")
    print("  | " + wrap(note["content"]))
    print("  | 标签：" + "、".join(note["tags"]))
    print()
    print("  -- 操作 --")
    print("  [1] [N] 记笔记（已有笔记）")
    print("  [2] [V] 查看笔记全文")
    print("  [3] 返回列表")
    print()
    wait("  >> 你选择 [1] 修改笔记...")


def scene_3_editing():
    """场景3：记笔记"""
    src = SOURCES_DATA[0]
    
    step("场景3 -- 记笔记（编辑框展开在条文下方）")
    
    print("  [" + src["verse"] + "]（" + src["chapter"] + "）")
    print("  " + divider("~", 50))
    print("  " + wrap(src["text"], 45))
    print("  " + divider("~", 50))
    print()
    print("  +-- [记笔记] ------------------------------+")
    print("  |  空行 + 回车 = 保存并退出                 |")
    print("  +------------------------------------------+")
    print()
    print("  当前笔记：")
    print("    \"阳浮而阴弱\"提示卫强营弱的关键病机。")
    print("    \"鼻鸣干呕\"是太阳中风区别于伤寒的特征点。")
    print()
    print("  请输入（在下方输入新内容覆盖，空行保存）：")
    print()
    print("  > \"阳浮而阴弱\"提示卫强营弱的关键病机。")
    print("  > \"鼻鸣干呕\"是太阳中风区别于伤寒的特征点。")
    print("  > 另：与第95条对比，12条脉象更具体（阳浮阴弱）")
    print("  > （空行 -- 自动保存）")
    print()
    print("  [OK] 笔记已保存！")
    print()
    print("  >>> 这里的关键设计：")
    print("  >>> 1. 笔记框就在条文正文下方 -- 上下文不丢失")
    print("  >>> 2. 空行回车保存 -- 不需要找「保存」按钮")
    print("  >>> 3. 如果已有笔记，直接在原内容上修改")
    print()
    wait("  >> 保存后，你返回条文列表...")


def scene_4_list_after():
    """场景4：回到列表，看到笔记更新"""
    step("场景4 -- 条文列表（笔记已更新）")
    
    for i, src in enumerate(SOURCES_DATA):
        note_icon = "[N]" if i == 0 else "   "
        note_preview = ""
        if i == 0:
            note_preview = "  [笔记] \"阳浮而阴弱\"提示卫强营弱的关键病机..."
        print("  [" + str(i+1) + "] " + note_icon + " " + src["verse"] + "：" + src["text"][:40] + "...")
        if note_preview:
            print("      " + note_preview)
        print()
    
    print("  现在第12条旁边有笔记预览，一眼就知道自己写过什么")
    print()
    wait("  >> 你感觉不错，继续学习下一张方剂...")


def scene_5_summary():
    """场景5：总结"""
    step("总结 -- 修改了什么？")
    
    changes = [
        ("去掉冗余", "把 4 套笔记（卡片笔记/我的理解/记笔记按钮/错题本笔记）\n"
                     "合并为「条文笔记」一套，所有笔记都附着于条文。"),
        ("合并入口", "条文面板中「我的理解」标签页 + 「记笔记」按钮\n"
                     "合并为：每条条文正文下方的一个可展开/收起的笔记区。"),
        ("零摩擦保存", "输入内容后，空行+回车自动保存。\n"
                       "不需要显式的「保存」按钮（保留按钮作为确认感）。"),
        ("笔记预览", "条文列表中，有条文的条目显示笔记摘要。\n"
                    "学习时一眼看到自己写过什么。"),
        ("可选结构化", "支持标签（如：病机/鉴别/方证/疑问）\n"
                      "但不强制 -- 想用就用，不想用直接写文本。"),
    ]
    
    for title, desc in changes:
        print("  [" + title + "]")
        for line in desc.split("\n"):
            print("    " + line)
        print()
    
    print("  " + divider("~"))
    print()
    print("  核心原则：笔记是条文的延伸，不是独立的知识点。")
    print("  用户读原文 -> 产生理解 -> 原地记录 -> 下次复习时看到。")
    print()


def main():
    print()
    print("=" * 60)
    print("  条文笔记功能 -- 交互 DEMO（静态展示）")
    print("=" * 60)
    print()
    print("  「笔记是为下一次复习准备的对话」")
    print()
    wait("  >> 按 Enter 开始...（自动播放，每步间隔 1.5 秒）\n")
    
    scene_1_browse()
    scene_2_reading()
    scene_3_editing()
    scene_4_list_after()
    scene_5_summary()
    
    print("=" * 60)
    print("  DEMO 结束。")
    print("=" * 60)
    print()


if __name__ == "__main__":
    main()
