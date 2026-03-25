import re

with open('index.html', 'r') as f:
    content = f.read()

# We need to extract the part that's currently incorrectly wrapped in the 'featured' div
# and place it after the main-header div.

# The current <body> section starts at line 40:
# 40: <body>
# 41:
# 42: <div id="featured" ...>
# 43: <!-- HEADER -->
# 44: <div id="overlay"></div>
# 45: <div id="main-header">
# ... [nav items]
# 91: </div>
# 92: </div>
# 93:
# 94: <div id="ticker">
# ...
# 105: </div>
# 106:
# 107: <div id="news-ticker">
# ...
# 113: </div>
# 114:   <span ...>🔍 Browse Category:</span>
# ...
# 153:   </div>
# 154: </div>

# The <body> is opening a div "featured" at line 42 that seems to wrap almost everything down to line 154.
# This was probably an accidental insertion of the opening div at the wrong place.

# Let's search for the specific incorrect line and remove it, and also the closing tag at line 154.
lines = content.split('\n')
incorrect_opening = '<div id="featured" style="padding: 10px 24px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px;">'

new_lines = []
featured_div_removed = False
for i, line in enumerate(lines):
    if incorrect_opening in line and not featured_div_removed:
        featured_div_removed = True
        continue
    new_lines.append(line)

# Now we need to find where the Browse Category section starts and wrap it properly in the featured div.
content_fixed = '\n'.join(new_lines)

# Re-wrap the browse category section
browse_pattern = re.compile(r'(<span style="font-family: .Plus Jakarta Sans., sans-serif; font-size: 11px;.*?All Categories ▼</a>.*?</div>\s*</div>)', re.DOTALL)

def rewrap(match):
    inner = match.group(1)
    return '<div id=\"featured\">\n  ' + inner

content_final = browse_pattern.sub(rewrap, content_fixed)

with open('index.html', 'w') as f:
    f.write(content_final)
