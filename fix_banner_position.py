import re

with open('index.html', 'r') as f:
    content = f.read()

# Extract banner-wrap
banner_match = re.search(r'(<div id="banner-wrap">.*?</div>)', content, re.DOTALL)
if banner_match:
    banner_div = banner_match.group(1)
    # Remove it from main-header
    content_no_banner = content.replace(banner_div, "")
    # Place it before main-header
    new_content = content_no_banner.replace('<div id="main-header">', banner_div + '\n<div id="main-header">')

    with open('index.html', 'w') as f:
        f.write(new_content)
    print("Moved banner outside sticky header")
else:
    print("Banner not found")
