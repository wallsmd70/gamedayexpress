(function() {
  const d = new Date();
  const tickerDate = document.getElementById('ticker-date');
  if (tickerDate) {
    tickerDate.textContent = 'GameDay Express — ' + d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  }

  const searchEl = document.getElementById('search');
  const clearBtn = document.getElementById('clear-btn');
  const primaryGrid = document.getElementById('primary-grid');

  // ── ONBOARDING & PERSONALIZATION ────────────────────────
  const PREFS_KEY = 'gde_user_interests';
  const onboardingOverlay = document.getElementById('onboarding-overlay');
  
  window.savePersonalization = function() {
    const selected = [];
    document.querySelectorAll('.interest-btn.selected').forEach(btn => {
      selected.push(btn.dataset.interest);
    });
    localStorage.setItem(PREFS_KEY, JSON.stringify(selected));
    onboardingOverlay.classList.remove('visible');
    window.renderGrid(); // Re-render based on new preferences
  };

  window.applyInterests = function() {
    window.renderGrid();
  };

  window.openPersonalization = function() {
    const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || '[]');
    document.querySelectorAll('.interest-btn').forEach(btn => {
      btn.classList.toggle('selected', prefs.includes(btn.dataset.interest));
    });
    onboardingOverlay.classList.add('visible');
  };

  // ── CORE NAVIGATION ──────────────────────────────
  window.toggleView = function(category, element) {
    document.querySelectorAll('#nav a').forEach(a => a.classList.remove('active'));
    
    if (element) {
      const parentBtn = element.closest('.dropdown')?.querySelector('.dropbtn');
      if (parentBtn) parentBtn.classList.add('active');
      else element.classList.add('active');
    } else if (category === '') {
      const homeLink = document.querySelector('#nav a:first-child');
      if (homeLink) homeLink.classList.add('active');
    }

    window.runFilter(category);
    if (searchEl) searchEl.value = '';

    const newsTicker = document.getElementById('news-ticker');
    if (newsTicker) newsTicker.scrollIntoView({ behavior: 'smooth' });
  };

  window.runFilter = function(q) {
    const activeBtn = document.getElementById('active-category');
    const searchTerm = (q || '').toLowerCase().trim();

    if (activeBtn) {
      activeBtn.textContent = (searchTerm === '' ? 'All Categories' : searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)) + ' ▼';
    }

    // Since we now render dynamically, we can just re-render with a filter
    window.renderGrid(searchTerm);
  };

  // ── DYNAMIC GRID BUILDER ──────────────────────────
  window.renderGrid = function(filterQuery = '') {
    if (!primaryGrid) return;
    primaryGrid.innerHTML = ''; // Clear existing

    const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || '[]');
    const query = filterQuery.toLowerCase().trim();
    let currentZone = '';
    let anyVisible = false;

    // Filter categories first
    const visibleCategories = GDE_LINKS.filter(cat => {
      // 1. Onboarding Preference Check (only if no active search/category filter)
      if (!query && prefs.length > 0) {
        const isInterestMatch = prefs.some(p => cat.tags.includes(p));
        if (!isInterestMatch) return false;
      }

      // 2. Search/Category Filter Check
      if (!query) return true;
      
      const tagMatch = cat.tags.includes(query);
      const titleMatch = cat.category.toLowerCase().includes(query);
      const linkMatch = cat.links.some(l => l.name.toLowerCase().includes(query));
      
      return tagMatch || titleMatch || linkMatch;
    });

    visibleCategories.forEach(cat => {
      // Add Zone Divider if it changes
      if (cat.zone !== currentZone) {
        currentZone = cat.zone;
        const div = document.createElement('div');
        div.className = 'zone-divider';
        div.innerHTML = `<span class="zone-label">${currentZone}</span>`;
        primaryGrid.appendChild(div);
      }

      // Build Card
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.tags = cat.tags;
      
      let linksHtml = '';
      cat.links.forEach(l => {
        const isMatch = query && l.name.toLowerCase().includes(query);
        const displayName = isMatch 
          ? l.name.replace(new RegExp(query, 'gi'), m => `<span class="highlight">${m}</span>`)
          : l.name;

        if (query && !cat.tags.includes(query) && !cat.category.toLowerCase().includes(query) && !l.name.toLowerCase().includes(query)) {
            return; // Skip link if it doesn't match and category doesn't match
        }

        linksHtml += `
          <div class="link-item">
            <div class="link-dot"></div>
            <a href="${l.url}" target="_blank">${displayName}</a>
            ${l.top ? '<span class="link-tag tag-top">TOP</span>' : ''}
            ${l.tag ? `<span class="link-tag tag-bonus">${l.tag}</span>` : ''}
          </div>
          ${l.desc ? `<div class="link-item" style="padding-left:20px;font-size:11px;color:var(--text-dim)"><em>${l.desc}</em></div>` : ''}
        `;
      });

      card.innerHTML = `
        <div class="card-header">
          <div class="card-icon">${cat.icon}</div>
          <div class="card-title">${cat.category}</div>
        </div>
        <div class="card-links">${linksHtml}</div>
      `;
      primaryGrid.appendChild(card);
      anyVisible = true;
    });

    // Handle "No Results"
    const noResults = document.createElement('div');
    noResults.id = 'no-results';
    noResults.style.cssText = 'text-align:center;padding:40px;color:var(--text-dim);grid-column:1/-1;';
    noResults.textContent = 'No links matched your search. Try a different keyword.';
    noResults.style.display = anyVisible ? 'none' : 'block';
    primaryGrid.appendChild(noResults);

    // Re-attach Pin Buttons
    attachPinButtons();
  };

  function attachPinButtons() {
    document.querySelectorAll('.link-item').forEach(item => {
      const a = item.querySelector('a');
      if (!a || !a.href || a.href.startsWith('javascript')) return;
      
      const btn = document.createElement('button');
      btn.className = 'pin-btn';
      btn.textContent = '📌';
      btn.dataset.url = a.href;
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePin(a.href, a.textContent.trim());
      };
      item.appendChild(btn);
    });
    renderPins();
  }

  // Event Listeners
  if (searchEl) searchEl.addEventListener('input', () => window.runFilter(searchEl.value));
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchEl) searchEl.value = '';
      window.toggleView('', null);
    });
  }

  // Mobile Dropdown Handling
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    dropdown.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        const content = dropdown.querySelector('.dropdown-content');
        const isCurrentlyOpen = content.style.display === 'grid' || content.style.display === 'flex';
        document.querySelectorAll('.dropdown-content').forEach(c => { if (c !== content) c.style.display = ''; });
        if (!isCurrentlyOpen) content.style.display = (content.classList.contains('qh-grid') || content.classList.contains('browse-grid')) ? 'grid' : 'flex';
        else content.style.display = '';
        e.stopPropagation();
      }
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-content').forEach(c => c.style.display = '');
  });
window.addEventListener('scroll', () => {
  const scrollBtn = document.getElementById('scroll-top');
  const stickyLogo = document.getElementById('sticky-logo');
  const searchWrap = document.getElementById('search-wrap');
  const bannerHeight = (document.querySelector('.banner-container')?.offsetHeight || 300) + (document.getElementById('main-header')?.offsetHeight || 0);

  if (scrollBtn) {
    scrollBtn.style.display = window.scrollY > 400 ? 'block' : 'none';
  }
  if (stickyLogo) {
    const isVisible = window.scrollY > bannerHeight;
    stickyLogo.classList.toggle('visible', isVisible);
    document.body.classList.toggle('sticky-active', isVisible);
    if (searchWrap) searchWrap.classList.toggle('sticky', isVisible);
  }

});

  // ── PINS / QUICK HITS ──────────────────────────────
  const PINS_KEY = 'gde_pins_v1';
  function loadPins() { try { return JSON.parse(localStorage.getItem(PINS_KEY)) || []; } catch { return []; } }
  function savePins(pins) { try { localStorage.setItem(PINS_KEY, JSON.stringify(pins)); } catch {} }

  window.unpin = function(url) {
    let pins = loadPins().filter(p => p.url !== url);
    savePins(pins);
    renderPins();
  };

  function renderPins() {
    const pins = loadPins();
    const container = document.getElementById('quick-hits-links');
    const emptyMsg = document.getElementById('qh-empty');
    if (!container) return;

    container.querySelectorAll('.pinned-chip').forEach(el => el.remove());
    if (pins.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'inline-block';
    } else {
      if (emptyMsg) emptyMsg.style.display = 'none';
      pins.forEach(pin => {
        const chip = document.createElement('span');
        chip.className = 'pinned-chip';
        chip.innerHTML = `<a href="${pin.url}" target="_blank">${pin.name}</a><button class="unpin-btn" title="Unpin" onclick="unpin('${pin.url}')">✕</button>`;
        container.appendChild(chip);
      });
    }
    
    document.querySelectorAll('.pin-btn').forEach(btn => {
      const isPinned = pins.some(p => p.url === btn.dataset.url);
      btn.classList.toggle('pinned', isPinned);
    });
  }

  function togglePin(url, name) {
    let pins = loadPins();
    const idx = pins.findIndex(p => p.url === url);
    if (idx > -1) pins.splice(idx, 1);
    else pins.push({ url, name });
    savePins(pins);
    renderPins();
  }

  // Initial Check & Render
  if (!localStorage.getItem(PREFS_KEY)) {
    // setTimeout(() => { if (onboardingOverlay) onboardingOverlay.classList.add('visible'); }, 1000);
    window.renderGrid();
  } else {
    window.renderGrid();
  }

  // Interest Button Toggle
  document.querySelectorAll('.interest-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.classList.toggle('selected'));
  });

})();
