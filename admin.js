(function() {
  const root = document.getElementById('manager-root');
  let data = JSON.parse(JSON.stringify(window.GDE_LINKS || []));

  window.renderManager = function() {
    root.innerHTML = '';
    data.forEach((cat, catIdx) => {
      const catEl = document.createElement('div');
      catEl.className = 'category-manager';
      catEl.innerHTML = `
        <div class="category-header">
          <div style="display: flex; gap: 12px; align-items: flex-end;">
            <div class="input-group">
              <label>Zone</label>
              <input type="text" value="${cat.zone}" onchange="updateCat(${catIdx}, 'zone', this.value)" style="width: 120px;">
            </div>
            <div class="input-group">
              <label>Category Name</label>
              <input type="text" value="${cat.category}" onchange="updateCat(${catIdx}, 'category', this.value)" style="width: 180px;">
            </div>
            <div class="input-group">
              <label>Icon</label>
              <input type="text" value="${cat.icon}" onchange="updateCat(${catIdx}, 'icon', this.value)" style="width: 40px;">
            </div>
            <div class="input-group">
              <label>Tags</label>
              <input type="text" value="${cat.tags}" onchange="updateCat(${catIdx}, 'tags', this.value)" style="width: 250px;">
            </div>
          </div>
          <button class="btn btn-remove" onclick="removeCategory(${catIdx})">Remove Category</button>
        </div>
        <ul class="link-list" id="links-${catIdx}"></ul>
        <button class="btn btn-add" style="font-size: 11px; padding: 4px 10px;" onclick="addNewLink(${catIdx})">+ Add Link</button>
      `;
      root.appendChild(catEl);

      const linkList = document.getElementById(`links-${catIdx}`);
      cat.links.forEach((link, linkIdx) => {
        const linkEl = document.createElement('li');
        linkEl.className = 'link-item-row';
        linkEl.innerHTML = `
          <input type="text" value="${link.name}" placeholder="Name" onchange="updateLink(${catIdx}, ${linkIdx}, 'name', this.value)" style="width: 120px;">
          <input type="text" value="${link.url}" placeholder="URL" onchange="updateLink(${catIdx}, ${linkIdx}, 'url', this.value)" style="flex: 1;">
          <div style="display: flex; gap: 8px; align-items: center;">
             <label style="margin: 0; font-size: 10px;">TOP</label>
             <input type="checkbox" ${link.top ? 'checked' : ''} onchange="updateLink(${catIdx}, ${linkIdx}, 'top', this.checked)">
          </div>
          <button class="btn btn-remove" style="padding: 4px 8px; font-size: 11px;" onclick="removeLink(${catIdx}, ${linkIdx})">✕</button>
        `;
        linkList.appendChild(linkEl);
      });
    });
  };

  window.updateCat = (catIdx, field, val) => { data[catIdx][field] = val; };
  window.updateLink = (catIdx, linkIdx, field, val) => { data[catIdx].links[linkIdx][field] = val; };

  window.addNewCategory = () => {
    data.push({ zone: 'NEW ZONE', category: 'New Category', icon: '❓', tags: '', links: [] });
    renderManager();
  };
  window.removeCategory = (catIdx) => {
    if (confirm('Delete this entire category and all its links?')) {
      data.splice(catIdx, 1);
      renderManager();
    }
  };
  window.addNewLink = (catIdx) => {
    data[catIdx].links.push({ name: '', url: '', top: false });
    renderManager();
  };
  window.removeLink = (catIdx, linkIdx) => {
    data[catIdx].links.splice(linkIdx, 1);
    renderManager();
  };

  window.generateOutput = () => {
    const output = document.getElementById('code-output');
    const jsContent = `const GDE_LINKS = ${JSON.stringify(data, null, 2)};`;
    output.textContent = jsContent;
    output.style.display = 'block';
    output.scrollIntoView({ behavior: 'smooth' });
  };

  window.copyOutput = () => {
    const text = document.getElementById('code-output').textContent;
    if (!text) return alert('Generate code first!');
    navigator.clipboard.writeText(text).then(() => alert('Code copied to clipboard!'));
  };

  renderManager();
})();
