"""Writes a plate spec with compact arrays (one point list per line).  python3 tools/plates/_fmt.py <spec.json>"""
import json
import re
import sys


def dumps(o):
    s = json.dumps(o, indent=2, ensure_ascii=False)
    # collapse arrays of numbers / arrays of pairs onto one line
    s = re.sub(r'\[\s+((?:-?[\d.]+,?\s+)+)\]', lambda m: '[' + ', '.join(m.group(1).split()).replace(',,', ',') + ']', s)
    s = re.sub(r'\[\s+((?:\[[-\d., ]+\],?\s+)+)\]', lambda m: '[' + ' '.join(m.group(1).split()) + ']', s)
    return s.replace(', ]', ']') + '\n'


if __name__ == '__main__':
    for p in sys.argv[1:]:
        d = json.load(open(p))
        open(p, 'w').write(dumps(d))
        print('formatted', p)
