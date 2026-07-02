import re
from pathlib import Path

src = Path(r'C:\Users\Chen\Desktop\经方学习系统（旧版）\extracted\黄煌教授经方沙龙\cleaned\经方言论\黄煌经方言论整理版_十分实用.md')
dst = src.with_name('黄煌经方言论整理版_十分实用_v2.md')

text = src.read_text(encoding='utf-8')
parts = text.split('---', 2)
if len(parts) >= 3:
    fm = '---' + parts[1] + '---'
    body = parts[2]
else:
    fm = ''
    body = text

# update frontmatter JSON
fm_lines = fm.strip().splitlines()
new_fm_lines = []
inserted = False
for i, line in enumerate(fm_lines):
    if not inserted and line.strip() == '}':
        # ensure previous line ends with comma
        if new_fm_lines and not new_fm_lines[-1].rstrip().endswith(','):
            new_fm_lines[-1] = new_fm_lines[-1].rstrip() + ','
        new_fm_lines.append('  "cleaned_v2_path": "extracted\\黄煌教授经方沙龙\\cleaned\\经方言论\\黄煌经方言论整理版_十分实用_v2.md",')
        new_fm_lines.append('  "cleaned_v2_date": "2026-06-14",')
        inserted = True
    new_fm_lines.append(line)
new_fm = '\n'.join(new_fm_lines)

lines = body.splitlines()

# Units/digits/punctuation that indicate a dosage/quantity line, not a new statement
UNIT_START = set('克两钱分寸尺升合勺片粒枚剂日年月岁次例人位％%') | set('0123456789')

def looks_like_statement(num_str, rest):
    # rest is text after number and any optional punctuation/spaces
    if not rest:
        # e.g. "104、" alone -> new statement
        return True
    first = rest[0]
    if first in UNIT_START:
        return False
    return True

statements = []
current_num = None
current_lines = []

def flush():
    global current_num, current_lines
    if current_num is not None:
        statements.append((current_num, current_lines))
        current_num = None
        current_lines = []

# First content line may contain the title prefix + statement 1
first_idx = 0
while first_idx < len(lines) and not lines[first_idx].strip():
    first_idx += 1

if first_idx < len(lines):
    first_line = lines[first_idx]
    m_start = re.match(r'^(\d+)[、.\s]*', first_line)
    if not m_start:
        # find first digit that begins a statement (not followed by unit)
        for m in re.finditer(r'(?P<num>\d+)[、.\s]*', first_line):
            num = int(m.group('num'))
            rest = first_line[m.end():].strip()
            # Need to determine if this is statement 1; use heuristic and ensure it starts the actual content
            if looks_like_statement(m.group('num'), rest):
                prefix = first_line[:m.start()].strip()
                if prefix:
                    statements.append((0, [prefix]))
                current_num = num
                current_lines = [rest] if rest else []
                first_idx += 1
                break

for line in lines[first_idx:]:
    m = re.match(r'^(\d+)[、.\s]*', line)
    if m:
        num = int(m.group(1))
        rest = line[m.end():].strip()
        if looks_like_statement(m.group(1), rest):
            flush()
            current_num = num
            current_lines = [rest] if rest else []
            continue
    if current_num is not None:
        current_lines.append(line)

flush()

# Build output
out_lines = [new_fm, '']
out_lines.append('# 黄煌经方言论整理版（v2 重排版）')
out_lines.append('')
out_lines.append('> 来源：黄煌教授经方沙龙')
out_lines.append('> 整理日期：2011-11-15')
out_lines.append('> 重排日期：2026-06-14')
out_lines.append('')

for num, stmt_lines in statements:
    first = ''
    for l in stmt_lines:
        if l.strip():
            first = l.strip()
            break
    heading = first[:60] + ('……' if len(first) > 60 else '')
    out_lines.append(f'## {num}. {heading}')
    out_lines.append('')
    for l in stmt_lines:
        out_lines.append(l.rstrip())
    out_lines.append('')

dst.write_text('\n'.join(out_lines), encoding='utf-8')
print(f'Wrote {dst}')
print(f'Statements: {len(statements)}')
print(f'Numbers: {[n for n,_ in statements[:20]]} ... {[n for n,_ in statements[-10:]]}')
