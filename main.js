(function() {
  const d = new Date();
  document.getElementById('ticker-date').textContent =
    'GameDay Express — ' + d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});

  const searchEl = document.getElementById('search');
  const clearBtn = document.getElementById('clear-btn');
  const overlay = document.getElementById('overlay');

  function runFilter(q) {
    const activeBtn = document.getElementById('active-category');
    if (activeBtn && q !== undefined) {
      const isSearch = document.activeElement === searchEl;
      if (!isSearch) {
        activeBtn.textContent = (q === '' ? 'All Categories' : q.charAt(0).toUpperCase() + q.slice(1)) + ' ▼';
      }
    }

    q = (q || '').toLowerCase().trim();
    let anyVisible = false;
    document.querySelectorAll('.card').forEach(card => {
      const tags  = (card.dataset.tags||'').toLowerCase();
      const title = card.querySelector('.card-title').textContent.toLowerCase();
      card.querySelectorAll('.link-item').forEach(item => {
        const a = item.querySelector('a');
        if (!a) return;
        const raw = a.textContent;
        if (!q) { a.innerHTML = raw; item.style.display = ''; }
        else if (raw.toLowerCase().includes(q)) {
          a.innerHTML = raw.replace(new RegExp(q,'gi'), m=>`<span class="highlight">${m}</span>`);
          item.style.display = '';
        } else { a.innerHTML = raw; item.style.display = 'none'; }
      });
      const anyLink = !q || Array.from(card.querySelectorAll('.link-item')).some(i=>i.style.display!=='none');
      const matchCard = !q || tags.includes(q) || title.includes(q);
      const show = anyLink || matchCard;
      card.style.display = show ? '' : 'none';
      if (show) anyVisible = true;
    });
    document.getElementById('no-results').style.display = anyVisible ? 'none' : 'block';
  }

  searchEl.addEventListener('input', ()=>runFilter(searchEl.value));
  clearBtn.addEventListener('click', ()=>{ searchEl.value=''; runFilter(''); });

  // Improved Dropdown Handling for Mobile
  function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-content').forEach(c => c.classList.remove('active'));
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.dropdown').forEach(dropdown => {
    dropdown.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        const content = dropdown.querySelector('.dropdown-content');
        const isActive = content.classList.contains('active');

        closeAllDropdowns();

        if (!isActive) {
          content.classList.add('active');
          if (overlay) overlay.style.display = 'block';
          document.body.style.overflow = 'hidden'; // Prevent background scroll
        }
        e.stopPropagation();
      }
    });
  });

  if (overlay) {
    overlay.addEventListener('click', closeAllDropdowns);
  }

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && !e.target.closest('.dropdown')) {
      closeAllDropdowns();
    }
  });

  window.addEventListener('scroll', () => {
    document.getElementById('scroll-top').style.display = window.scrollY > 400 ? 'block' : 'none';
  });

  const PINS_KEY = 'gde_pins_v1';
  function loadPins() {
    try { return JSON.parse(localStorage.getItem(PINS_KEY)) || []; }
    catch { return []; }
  }
  function savePins(pins) {
    try { localStorage.setItem(PINS_KEY, JSON.stringify(pins)); } catch {}
  }

  function renderPins() {
    const pins = loadPins();
    const container = document.getElementById('quick-hits-links');
    const empty = document.getElementById('qh-empty');
    if (container) {
      container.querySelectorAll('.pinned-chip').forEach(el => el.remove());
      if (pins.length === 0) {
        if (empty) empty.style.display = 'inline-block';
      } else {
        if (empty) empty.style.display = 'none';
        pins.forEach(pin => {
          const chip = document.createElement('span');
          chip.className = 'pinned-chip';
          chip.innerHTML = `<a href="${pin.url}" target="_blank">${pin.name}</a><button class="unpin-btn" title="Unpin" onclick="unpin('${pin.url}')">✕</button>`;
          container.appendChild(chip);
        });
      }
    }
    document.querySelectorAll('.pin-btn').forEach(btn => {
      const url = btn.dataset.url;
      const isPinned = pins.some(p => p.url === url);
      btn.textContent = '📌';
      btn.classList.toggle('pinned', isPinned);
      btn.title = isPinned ? 'Unpin' : 'Pin to Quick Hits';
    });
  }

  window.togglePin = function(url, name) {
    let pins = loadPins();
    const idx = pins.findIndex(p => p.url === url);
    if (idx > -1) { pins.splice(idx, 1); } else { pins.push({ url, name }); }
    savePins(pins);
    renderPins();
  };

  window.unpin = function(url) {
    let pins = loadPins().filter(p => p.url !== url);
    savePins(pins);
    renderPins();
  };

  document.querySelectorAll('.link-item').forEach(item => {
    const a = item.querySelector('a');
    if (!a) return;
    const btn = document.createElement('button');
    btn.className = 'pin-btn';
    btn.textContent = '📌';
    btn.title = 'Pin to Quick Hits';
    btn.dataset.url = a.href;
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.togglePin(a.href, a.textContent.trim());
    };
    item.appendChild(btn);
  });

  renderPins();

  const navHome = document.getElementById('nav-home');
  const navSearch = document.getElementById('nav-search');
  const navPinned = document.getElementById('nav-pinned');

  if (navHome) {
    navHome.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
  if (navSearch) {
    navSearch.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => { if (searchEl) searchEl.focus(); }, 300);
    });
  }
  if (navPinned) {
    navPinned.addEventListener('click', () => {
      const quickHits = document.getElementById('quick-hits');
      if (quickHits) { quickHits.scrollIntoView({ behavior: 'smooth' }); }
    });
  }
})();
