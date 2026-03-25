import re

with open('index.html', 'r') as f:
    content = f.read()

# We need to replace the entire main-header block to be sure
# Find the main-header div and replace it
main_header_pattern = re.compile(r'<div id="main-header">.*?<div id="nav">', re.DOTALL)

new_header = """<div id="main-header">
  <div id="banner-wrap">
    <img src="assets/logo.png" alt="GameDay Express" id="banner-img">
  </div>
  <div class="header-top">
    <div id="search-wrap">
      <input id="search" type="text" placeholder="Search links..." autocomplete="off">
      <button id="clear-btn">✕</button>
    </div>
  </div>
  <div id="nav">"""

new_content = main_header_pattern.sub(new_header, content)

with open('index.html', 'w') as f:
    f.write(new_content)
