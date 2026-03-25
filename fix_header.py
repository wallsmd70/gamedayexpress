import re

with open('index.html', 'r') as f:
    content = f.read()

# Pattern to find the misplaced featured block and the header
# It seems the <body> starts with the featured block, which should be after the header
pattern = re.compile(r'<body>\s*(<div id="featured".*?</div>)\s*<!-- HEADER -->\s*(<div id="overlay"></div>\s*<div id="main-header">.*?</div>)', re.DOTALL)

def fix(match):
    featured = match.group(1)
    header_block = match.group(2)
    return '<body>\n\n' + header_block + '\n\n' + featured

new_content = pattern.sub(fix, content)

if new_content != content:
    with open('index.html', 'w') as f:
        f.write(new_content)
    print("Fixed header structure")
else:
    print("Could not match pattern for structural fix")
