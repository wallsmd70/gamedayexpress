(function() {
  const d = new Date();
  const tickerDate = document.getElementById('ticker-date');
  if (tickerDate) {
    tickerDate.textContent = 'GameDay Express — ' + d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  }

  const searchEl = document.getElementById('search');
  const clearBtn = document.getElementById('clear-btn');
  const overlay = document.getElementById('overlay');

  function runFilter(q) {
    const activeBtn = document.getElementById('active-category');
    if (activeBtn && q !== undefined) {
      const isSearch = document.activeElement === searchEl;
      if (!isSearch) {
        activeBtn.textContent = (q === '' ? 'ALL CATEGORIES' : q.toUpperCase()) + ' ▼';
      }
    }

    q = (q || '').toLowerCase().trim();
    let anyVisible = false;
    document.querySelectorAll('.grid > .card').forEach(card => {
      const tags  = (card.dataset.tags||'').toLowerCase();
      const title = card.querySelector('.card-title').textContent.toLowerCase();

      let cardHasMatch = false;
      const items = card.querySelectorAll('.link-item');
      const itemVisibilities = new Array(items.length).fill(false);

      items.forEach((item, idx) => {
        const a = item.querySelector('a');
        const em = item.querySelector('em');

        if (a) {
          const rawA = a.getAttribute('data-raw') || a.textContent;
          if (!a.getAttribute('data-raw')) a.setAttribute('data-raw', rawA);

          if (!q || rawA.toLowerCase().includes(q)) {
            itemVisibilities[idx] = true;
            cardHasMatch = true;
          }
        } else if (em) {
          const rawEm = em.getAttribute('data-raw') || em.textContent;
          if (!em.getAttribute('data-raw')) em.setAttribute('data-raw', rawEm);

          if (q && rawEm.toLowerCase().includes(q)) {
            itemVisibilities[idx] = true;
            cardHasMatch = true;
            if (idx > 0) itemVisibilities[idx-1] = true;
          }
        }
      });

      const matchCard = !q || tags.includes(q) || title.includes(q);

      items.forEach((item, idx) => {
        const show = matchCard || itemVisibilities[idx] || (idx < items.length - 1 && itemVisibilities[idx+1] && items[idx+1].querySelector('em'));
        item.style.display = show ? '' : 'none';

        const a = item.querySelector('a');
        const em = item.querySelector('em');

        if (a) {
          const rawA = a.getAttribute('data-raw') || a.textContent;
          if (q && show && rawA.toLowerCase().includes(q)) {
            a.innerHTML = rawA.replace(new RegExp(q.replace(/[-\/\\^+?.()|[\]{}]/g, '\\$&'),'gi'), m => `<span class="highlight">${m}</span>`);
          } else {
            a.innerHTML = rawA;
          }
        }
        if (em) {
          const rawEm = em.getAttribute('data-raw') || em.textContent;
          if (q && show && rawEm.toLowerCase().includes(q)) {
            em.innerHTML = rawEm.replace(new RegExp(q.replace(/[-\/\\^+?.()|[\]{}]/g, '\\$&'),'gi'), m => `<span class="highlight">${m}</span>`);
          } else {
            em.innerHTML = rawEm;
          }
        }
      });

      card.style.display = (cardHasMatch || matchCard) ? '' : 'none';
      if (cardHasMatch || matchCard) anyVisible = true;
    });

    document.querySelectorAll('.zone-divider').forEach(div => {
        let next = div.nextElementSibling;
        let hasVisibleCard = false;
        while (next && !next.classList.contains('zone-divider')) {
            if (next.classList.contains('card') && next.style.display !== 'none') {
                hasVisibleCard = true;
                break;
            }
            next = next.nextElementSibling;
        }
        div.style.display = hasVisibleCard ? '' : 'none';
    });

    const noResults = document.getElementById('no-results');
    if (noResults) noResults.style.display = anyVisible ? 'none' : 'block';
  }

  window.runFilter = runFilter;

  if (searchEl) searchEl.addEventListener('input', () => runFilter(searchEl.value));
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchEl.value = '';
      runFilter('');
    });
  }

  document.querySelectorAll('.dropdown').forEach(drop => {
    drop.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        const content = drop.querySelector('.dropdown-content');
        if (!content) return;
        const isVisible = content.style.display === 'block';

        document.querySelectorAll('.dropdown-content').forEach(c => {
            if (c !== content) c.style.display = 'none';
        });

        if (!isVisible) {
          content.style.display = 'block';
          if (overlay) overlay.style.display = 'block';
        } else {
          content.style.display = 'none';
          if (overlay) overlay.style.display = 'none';
        }
        e.stopPropagation();
      }
    });
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-content').forEach(c => c.style.display = 'none');
      overlay.style.display = 'none';
    });
  }

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      if (!e.target.closest('.dropdown')) {
          document.querySelectorAll('.dropdown-content').forEach(c => c.style.display = 'none');
          if (overlay) overlay.style.display = 'none';
      }
    }
  });

  const PINS_KEY = 'gde_pins_v3';
  function loadPins() {
    try { return JSON.parse(localStorage.getItem(PINS_KEY)) || []; }
    catch { return []; }
  }
  function savePins(pins) {
    try { localStorage.setItem(PINS_KEY, JSON.stringify(pins)); } catch {}
  }

  function renderPins() {
    const pins = loadPins();
    const container = document.getElementById('nav-pinned-links');
    if (container) {
      const viewPinned = container.querySelector('a[href="#quick-hits"]');
      container.innerHTML = '';
      if (viewPinned) container.appendChild(viewPinned);

      pins.forEach(pin => {
        const a = document.createElement('a');
        a.href = pin.url;
        a.target = "_blank";
        a.textContent = '📍 ' + pin.name;
        container.appendChild(a);
      });
    }
    document.querySelectorAll('.pin-btn').forEach(btn => {
      const url = btn.dataset.url;
      const isPinned = pins.some(p => p.url === url);
      btn.style.background = isPinned ? '#ff3b30' : '#fff';
      btn.style.color = isPinned ? '#fff' : '#000';
    });
  }

  window.togglePin = function(url, name) {
    let pins = loadPins();
    const idx = pins.findIndex(p => p.url === url);
    if (idx > -1) { pins.splice(idx, 1); } else { pins.push({ url, name }); }
    savePins(pins);
    renderPins();
  };

  document.querySelectorAll('.link-item').forEach(item => {
    const a = item.querySelector('a');
    if (!a) return;
    const btn = document.createElement('button');
    btn.className = 'pin-btn';
    btn.textContent = '📍';
    btn.dataset.url = a.href;
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.togglePin(a.href, (a.getAttribute('data-raw') || a.textContent).trim());
    };
    item.appendChild(btn);
  });

  renderPins();
})();
