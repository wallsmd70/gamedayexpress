(function() {

  // ── CONFIG ──────────────────────────────────────────────────────────────
  const RSS2JSON = 'https://api.rss2json.com/v1/api.json?count=8&rss_url=';

  // Sport-labelled RSS feeds pulled in parallel
  const FEEDS = [
    { emoji: '⚾', label: 'MLB',    url: 'https://www.espn.com/espn/rss/mlb/news'          },
    { emoji: '🏈', label: 'NFL',    url: 'https://www.espn.com/espn/rss/nfl/news'          },
    { emoji: '🏀', label: 'NBA',    url: 'https://www.espn.com/espn/rss/nba/news'          },
    { emoji: '🏒', label: 'NHL',    url: 'https://www.espn.com/espn/rss/nhl/news'          },
    { emoji: '⛳', label: 'Golf',   url: 'https://www.espn.com/espn/rss/golf/news'         },
    { emoji: '⚽', label: 'Soccer', url: 'https://www.espn.com/espn/rss/soccer/news'       },
    { emoji: '🏎', label: 'F1',     url: 'https://www.espn.com/espn/rss/rpm/news'          },
    { emoji: '📰', label: 'Rumors', url: 'https://www.mlbtraderumors.com/feed'             },
  ];

  const FALLBACK = [
    { title: '⚾ MLB — Latest trade rumors & roster moves', link: 'https://www.mlbtraderumors.com' },
    { title: '🏀 NBA — Playoff race updates',              link: 'https://www.espn.com/nba/'      },
    { title: '🏒 NHL — Stretch run standings',             link: 'https://www.espn.com/nhl/'      },
    { title: '🏈 NFL — Draft news & free agency',         link: 'https://www.espn.com/nfl/'      },
    { title: '⛳ PGA Tour — Leaderboard updates',          link: 'https://www.espn.com/golf/'     },
    { title: '🏎 F1 — Race weekend news',                 link: 'https://www.espn.com/f1/'       },
    { title: '⚽ MLS — Match results & standings',         link: 'https://www.espn.com/soccer/'   },
    { title: '🎓 College sports — Recruiting & transfers', link: 'https://www.espn.com/college-sports/' },
  ];

  // ── HELPERS ─────────────────────────────────────────────────────────────
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildTrack(items) {
    const track = document.getElementById('ticker-track');
    if (!track || !items.length) return;

    // We need to double the items so it loops seamlessly
    const doubled = [...items, ...items];
    track.innerHTML = doubled.map(item =>
      `<span class="ticker-sep">◆</span><a href="${item.link}" target="_blank" rel="noopener">${item.title}</a>`
    ).join('');

    // Adjust speed based on content length — more items = slower speed (fixed duration per item)
    // Approximately 10s per 5 items is reasonable
    const speed = Math.max(30, Math.min(120, doubled.length * 3));
    track.style.animationDuration = speed + 's';
  }

  // ── FETCH SINGLE RSS FEED ────────────────────────────────────────────────
  function fetchFeed(feedCfg) {
    const apiUrl = RSS2JSON + encodeURIComponent(feedCfg.url);
    return fetch(apiUrl)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'ok' && data.items && data.items.length) {
          return data.items.slice(0, 3).map(item => ({
            title: `${feedCfg.emoji} ${feedCfg.label}: ${item.title.substring(0, 80)}${item.title.length > 80 ? '…' : ''}`,
            link: item.link
          }));
        }
        return [];
      })
      .catch(() => []);
  }

  // ── MAIN LOADER ──────────────────────────────────────────────────────────
  function loadTicker() {
    const feedPromises = FEEDS.map(f => fetchFeed(f));

    Promise.all(feedPromises)
      .then(results => {
        const stories = results.flat();

        if (stories.length >= 4) {
          buildTrack(shuffle(stories));
        } else {
          buildTrack(FALLBACK);
        }
      })
      .catch(() => buildTrack(FALLBACK));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTicker);
  } else {
    loadTicker();
  }
})();
