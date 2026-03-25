import re

with open('index.html', 'r') as f:
    content = f.read()

# Replace header-top with a new banner-first layout
banner_block = """
  <div id="banner-wrap">
    <img src="assets/logo.png" alt="GameDay Express" id="banner-img">
  </div>
  <div class="header-top">
    <div id="search-wrap">
      <input id="search" type="text" placeholder="Search links..." autocomplete="off">
      <button id="clear-btn">✕</button>
    </div>
  </div>
"""

# Find the header-top div and replace it
header_top_pattern = re.compile(r'<div class="header-top">.*?</div>\s*</div>', re.DOTALL)

def replace_header(match):
    return banner_block

new_content = header_top_pattern.sub(replace_header, content, count=1)

with open('index.html', 'w') as f:
    f.write(new_content)
