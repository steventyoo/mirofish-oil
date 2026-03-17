// ═══════════════════════════════════════════════════════
// MiroFish Oil — app.js
// All runtime logic: map, rendering, live prices, clock
// Depends on data.js being loaded first
// ═══════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── RENDER: Regime Bars ──
  function renderRegimeBars() {
    const container = document.getElementById('regime-bars');
    if (!container) return;
    container.innerHTML = REGIME.probabilities.map(r =>
      `<div class="rb-row">
        <span class="rb-label">${r.label}</span>
        <div class="rb-track"><div class="rb-fill" data-w="${r.pct}" style="background:${r.color}"></div></div>
        <span class="rb-pct">${r.pct}%</span>
      </div>`
    ).join('');
  }

  // ── RENDER: Scenarios ──
  function renderScenarios() {
    const container = document.getElementById('scenario-cards');
    if (!container) return;
    container.innerHTML = SCENARIOS.map(s =>
      `<div class="ps ${s.css}">
        <div class="ps-label">${s.name} · P=${Math.round(s.probability * 100)}%</div>
        <div class="ps-prices">
          <span>Low <strong style="color:${s.color}">$${s.price_low}</strong></span>
          <span>Mid <strong style="color:${s.color}">$${s.price_mid}</strong></span>
          <span>High <strong style="color:${s.color}">$${s.price_high}</strong></span>
        </div>
        <div class="ps-note">${s.note}</div>
      </div>`
    ).join('');
  }

  // ── RENDER: Agents ──
  function renderAgents() {
    const container = document.getElementById('agent-cards');
    if (!container) return;
    container.innerHTML = AGENTS.map(a => {
      const dirColor = a.direction === 'bullish' ? 'var(--green)' : a.direction === 'bearish' ? 'var(--accent)' : 'var(--blue)';
      return `<div class="agent-card">
        <div class="agent-header">
          <div>
            <div class="agent-name">${a.name}</div>
            <div class="agent-role">${a.role}</div>
          </div>
          <span class="agent-dir ${a.direction}">${a.direction}</span>
        </div>
        <div class="agent-expr">→ ${a.expr.replace(/_/g, ' ').toUpperCase()}</div>
        <ul class="agent-drivers">${a.drivers.map(d => `<li>${d}</li>`).join('')}</ul>
        <div class="agent-conf-bar"><div class="agent-conf-fill" data-w="${Math.round(a.confidence * 100)}" style="background:${dirColor}"></div></div>
      </div>`;
    }).join('');
  }

  // ── RENDER: News Feed ──
  function renderNews() {
    const container = document.getElementById('news-feed');
    if (!container) return;
    container.innerHTML = NEWS.map(n => {
      const cls = n.severity === 'high' ? '' : n.severity === 'medium' ? 'gold' : 'teal';
      return `<div class="alert ${cls}">
        <div class="alert-t">${n.time} · <span class="alert-src ${n.cls}">${n.src}</span></div>
        <div class="alert-b"><strong>${n.title}</strong></div>
      </div>`;
    }).join('');
  }

  // ── RENDER: Precedents ──
  function renderPrecedents() {
    const container = document.getElementById('precedent-list');
    if (!container) return;
    container.innerHTML = PRECEDENTS.map(p =>
      `<div class="precedent">
        <div class="prec-header">
          <span class="prec-event">${p.year} ${p.event}</span>
          <span class="prec-impact" style="color:${p.color}">${p.impact}</span>
        </div>
        <div class="prec-detail">${p.detail}</div>
      </div>`
    ).join('');
  }

  // ── RENDER: Catalysts ──
  function renderCatalysts() {
    const container = document.getElementById('catalyst-list');
    if (!container) return;
    container.innerHTML = '<div class="tl">' + CATALYSTS.map(c =>
      `<div class="tl-item">
        <div class="tl-dot" style="background:${c.color}"></div>
        <div class="tl-time">${c.date}</div>
        <div class="tl-text">${c.event}</div>
      </div>`
    ).join('') + '</div>';
  }

  // ── RENDER: Consensus ──
  function renderConsensus() {
    const container = document.getElementById('consensus-box');
    if (!container) return;
    container.innerHTML = `
      <div class="consensus-row"><span class="consensus-label">Bullish Probability</span><span class="consensus-value" style="color:var(--green)">${CONSENSUS.bullish_prob}%</span></div>
      <div class="consensus-row"><span class="consensus-label">Bearish Probability</span><span class="consensus-value" style="color:var(--accent)">${CONSENSUS.bearish_prob}%</span></div>
      <div class="consensus-row"><span class="consensus-label">Neutral</span><span class="consensus-value">${CONSENSUS.neutral_prob}%</span></div>
      <div class="consensus-row"><span class="consensus-label">Vol Expansion P</span><span class="consensus-value" style="color:var(--gold)">${CONSENSUS.vol_expansion_prob}%</span></div>
      <div class="consensus-row"><span class="consensus-label">Disruption P</span><span class="consensus-value" style="color:var(--accent)">${CONSENSUS.disruption_prob}%</span></div>
      <div class="consensus-row"><span class="consensus-label">Disagreement Score</span><span class="consensus-value">${CONSENSUS.disagreement_score}</span></div>
    `;
  }

  // ── RENDER: Signal ──
  function renderSignal() {
    const container = document.getElementById('signal-box');
    if (!container) return;
    container.innerHTML = `
      <div class="signal-action">${SIGNAL.action}</div>
      <div class="signal-meta">
        <div><div class="sm-label">Fair Value</div><div class="sm-value">$${SIGNAL.fair_value}</div></div>
        <div><div class="sm-label">Market Price</div><div class="sm-value">$${SIGNAL.market_price}</div></div>
        <div><div class="sm-label">Edge</div><div class="sm-value" style="color:var(--green)">+${SIGNAL.edge_pct}%</div></div>
        <div><div class="sm-label">Confidence</div><div class="sm-value">${SIGNAL.confidence}%</div></div>
        <div><div class="sm-label">Horizon</div><div class="sm-value">${SIGNAL.horizon}</div></div>
        <div><div class="sm-label">Vol Expansion P</div><div class="sm-value">${SIGNAL.vol_expansion_prob}%</div></div>
      </div>
      <ul class="signal-reasons">${SIGNAL.reasons.map(r => `<li>${r}</li>`).join('')}</ul>
    `;
  }

  // ── RENDER: Trade Structure ──
  function renderTrade() {
    const container = document.getElementById('trade-box');
    if (!container) return;
    const t = SIGNAL.trade;
    container.innerHTML = `
      <div class="trade-title">${t.type} — ${t.ticker} ${t.tenor}</div>
      <div class="trade-row"><span class="trade-row-label">Strike</span><span class="trade-row-value">${t.strike}</span></div>
      <div class="trade-row"><span class="trade-row-label">Entry</span><span class="trade-row-value">${t.entry}</span></div>
      <div class="trade-row"><span class="trade-row-label">Stop</span><span class="trade-row-value">${t.stop}</span></div>
      <div class="trade-row"><span class="trade-row-label">Take Profit</span><span class="trade-row-value">${t.take_profit}</span></div>
      <div class="trade-row"><span class="trade-row-label">Sizing</span><span class="trade-row-value">${t.sizing}</span></div>
      <div class="trade-row"><span class="trade-row-label">Playbook</span><span class="trade-row-value" style="color:var(--gold)">${t.playbook}</span></div>
    `;
  }

  // ── RENDER: Bypass Pipes ──
  function renderBypass() {
    const container = document.getElementById('bypass-pipes');
    if (!container) return;
    container.innerHTML = `
      <div class="pipe" style="font-family:'IBM Plex Mono',monospace;font-size:7.5px;color:var(--muted)"><span>Pipeline</span><span>Cap.</span><span>Status</span></div>
      ${BYPASS_PIPES.map(p => `
        <div class="pipe">
          <div><div>${p.flag} ${p.name}</div><div style="font-size:8px;color:var(--muted)">${p.route}</div></div>
          <div class="pipe-cap">${p.cap}</div><div class="badge ${p.badge}">${p.status}</div>
        </div>
      `).join('')}
    `;
  }

  // ═══════ MAP ═══════
  function initMap() {
    const map = L.map('map', {
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      subdomains: 'abc',
      maxZoom: 18,
    }).addTo(map);

    // Dark tile filter
    const darkStyle = document.createElement('style');
    darkStyle.textContent = `.leaflet-tile-pane { filter: invert(1) hue-rotate(195deg) brightness(0.75) saturate(0.55) contrast(1.15); }`;
    document.head.appendChild(darkStyle);

    // Helpers
    function mkPulse(latlng, color, sz, delay, tipHtml) {
      const s = sz, S = s + 4;
      const icon = L.divIcon({
        className: '', iconSize: [S * 2, S * 2], iconAnchor: [S, S],
        html: `<div style="position:relative;width:${S*2}px;height:${S*2}px">
          <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:.15;animation:pulse-ring 1.8s ease-out ${delay}s infinite"></div>
          <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:.1;animation:pulse-ring2 1.8s ease-out ${delay+.6}s infinite"></div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${s}px;height:${s}px;border-radius:50%;background:${color};box-shadow:0 0 ${s}px ${color}88"></div>
        </div>`
      });
      const m = L.marker(latlng, { icon }).addTo(map);
      if (tipHtml) m.bindTooltip(`<div class="map-tip">${tipHtml}</div>`, { maxWidth: 260, opacity: 1 });
      return m;
    }

    function mkCity(latlng, name, color, r) {
      const icon = L.divIcon({
        className: '', iconSize: [0, 0], iconAnchor: [0, r],
        html: `<div style="display:flex;align-items:center;gap:3px;white-space:nowrap">
          <div style="width:${r*2}px;height:${r*2}px;border-radius:50%;background:${color};opacity:.65"></div>
          <span style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:${color};opacity:.8;letter-spacing:.5px;text-shadow:0 0 3px #000,0 0 6px #000">${name}</span>
        </div>`
      });
      L.marker(latlng, { icon, interactive: false }).addTo(map);
    }

    function mkLabel(latlng, html) {
      const icon = L.divIcon({
        className: '', iconSize: [0, 0], iconAnchor: [0, 0],
        html: `<div style="pointer-events:none;white-space:nowrap;text-shadow:1px 1px 4px #000,0 0 8px #000">${html}</div>`
      });
      L.marker(latlng, { icon, interactive: false }).addTo(map);
    }

    function line(coords, color, dash, w, op, tipHtml) {
      const pl = L.polyline(coords, { color, weight: w, opacity: op, dashArray: dash }).addTo(map);
      if (tipHtml) pl.bindTooltip(`<div class="map-tip">${tipHtml}</div>`, { maxWidth: 280, opacity: 1, sticky: true });
      return pl;
    }

    function mkDiamond(latlng, tipHtml, flag) {
      const icon = L.divIcon({
        className: '', iconSize: [16, 16], iconAnchor: [8, 8],
        html: `<div style="font-size:13px;line-height:16px;text-align:center;filter:drop-shadow(0 0 3px #000)">${flag}</div>`
      });
      const m = L.marker(latlng, { icon });
      if (tipHtml) m.bindTooltip(`<div class="map-tip">${tipHtml}</div>`, { maxWidth: 280, opacity: 1 });
      return m;
    }

    function mkNuke(latlng, tipHtml) {
      const icon = L.divIcon({
        className: '', iconSize: [16, 16], iconAnchor: [8, 8],
        html: `<div style="width:14px;height:14px;border-radius:50%;border:2px solid #c77dff;display:flex;align-items:center;justify-content:center;font-size:9px;opacity:.9;box-shadow:0 0 6px #c77dff44">&#9762;</div>`
      });
      const m = L.marker(latlng, { icon });
      if (tipHtml) m.bindTooltip(`<div class="map-tip">${tipHtml}</div>`, { maxWidth: 300, opacity: 1 });
      return m;
    }

    // Region labels
    MAP_REGION_LABELS.forEach(l => mkLabel([l.lat, l.lon], l.html));

    // Hormuz label
    mkLabel([26.7, 56.3], `<span style="font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:#a8dadc;letter-spacing:1px">— STRAIT OF HORMUZ —</span>`);

    // Volume callout
    const volIcon = L.divIcon({
      className: '', iconSize: [140, 48], iconAnchor: [70, 56],
      html: `<div style="background:rgba(7,9,15,.92);border:1px solid #f4a261;border-radius:4px;padding:7px 12px;text-align:center">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:7.5px;color:#5a6278;letter-spacing:1px">DAILY FLOW AT RISK</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:#f4a261;line-height:1.1">20 MILLION b/d</div>
      </div>`
    });
    L.marker([19.5, 57.5], { icon: volIcon, interactive: false }).addTo(map);

    // Tanker routes
    line(MAP_TANKER_ROUTES.outbound, '#f4a261', '10 5', 2.5, 0.75,
      `<strong>Outbound Tanker Route</strong><span class="tip-gold">Persian Gulf → Indian Ocean → Asia<br>~20M b/d total flow</span>`);
    line(MAP_TANKER_ROUTES.inbound, '#457b9d', '6 5', 1.5, 0.4,
      `<strong>Inbound Tanker Route</strong><span style="color:#457b9d">Return route for ballast tankers</span>`);

    // Bypass pipelines
    line(MAP_PIPELINES.saudi_ew, '#52b788', '7 4', 2.5, 0.75,
      `<strong>Saudi E-W Pipeline</strong><span class="tip-green">Capacity: 5M b/d · Spare: ~2.4M b/d</span>`);
    line(MAP_PIPELINES.uae_fujairah, '#2a9d8f', '5 3', 2, 0.7,
      `<strong>UAE ADCOP Pipeline</strong><span class="tip-teal">Capacity: 1.8M b/d · Near full</span>`);

    // Pipeline terminals
    MAP_TERMINALS.forEach((t, i) =>
      mkPulse([t.lat, t.lon], t.color, i === 2 ? 6 : 7, i * 0.3,
        `<strong>${t.name}</strong><span class="tip-${t.color === '#52b788' ? 'green' : 'teal'}">${t.tip}</span>`)
    );

    // Cities
    MAP_CITIES.forEach(c => mkCity([c.lat, c.lon], c.name, c.color, c.r));

    // Military bases layer
    const basesLayer = L.layerGroup();
    MAP_BASES.forEach(b => {
      mkDiamond([b.lat, b.lon],
        `<strong>${b.flag} ${b.name}</strong><span style="color:#6a8caf">${b.note}</span>`,
        b.flag
      ).addTo(basesLayer);
    });
    basesLayer.addTo(map);

    // Nuclear sites layer
    const nuclearLayer = L.layerGroup();
    MAP_NUKES.forEach(s => {
      mkNuke([s.lat, s.lon],
        `<strong>\u{1F1EE}\u{1F1F7} ${s.name}</strong><span style="color:#c77dff">${s.note}</span>`
      ).addTo(nuclearLayer);
    });
    nuclearLayer.addTo(map);

    // Fire hotspots layer (store refs for FIRMS live update)
    const firesLayer = L.layerGroup();
    _firesLayer = firesLayer;
    _map = map;
    MAP_FIRES.forEach(f => {
      const r = f.brightness > 400 ? 4 : f.brightness > 350 ? 3 : 2.5;
      const op = f.brightness > 400 ? 0.8 : 0.55;
      L.circleMarker([f.lat, f.lon], {
        radius: r, fillColor: '#ff4500', fillOpacity: op,
        color: '#ff4500', weight: 0.5, opacity: op,
      }).bindTooltip(`<div class="map-tip"><strong>Fire Hotspot</strong><span style="color:#ff4500">Brightness: ${f.brightness}K · Simulated</span></div>`, { maxWidth: 220, opacity: 1 })
        .addTo(firesLayer);
    });
    firesLayer.addTo(map);

    // Layer toggle wiring
    document.getElementById('tog-bases').addEventListener('change', function () {
      this.checked ? map.addLayer(basesLayer) : map.removeLayer(basesLayer);
    });
    document.getElementById('tog-nuclear').addEventListener('change', function () {
      this.checked ? map.addLayer(nuclearLayer) : map.removeLayer(nuclearLayer);
    });
    document.getElementById('tog-fires').addEventListener('change', function () {
      this.checked ? map.addLayer(firesLayer) : map.removeLayer(firesLayer);
    });

    // Legend + layer toggle collapse
    document.getElementById('map-legend').querySelector('.ml-title').addEventListener('click', function () {
      document.getElementById('map-legend').classList.toggle('collapsed');
    });
    document.getElementById('layer-toggle').querySelector('.lt-title').addEventListener('click', function () {
      document.getElementById('layer-toggle').classList.toggle('collapsed');
    });

    // Resize handling
    window.addEventListener('resize', () => map.invalidateSize());
    setTimeout(() => map.invalidateSize(), 500);
  }

  // ═══════ ANIMATE BARS ═══════
  function animateBars() {
    document.querySelectorAll('.bar-fg, .rb-fill, .agent-conf-fill').forEach(f => {
      const w = f.dataset.w;
      if (w) f.style.width = w + '%';
    });
  }

  // ═══════ LIVE UTC CLOCK ═══════
  function updateUTC() {
    const el = document.getElementById('live-utc');
    if (!el) return;
    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    el.textContent = `${months[now.getUTCMonth()]} ${now.getUTCDate()}, ${now.getUTCFullYear()} · ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')} UTC`;
  }

  // ═══════ LIVE PRICES (Yahoo Finance via CORS proxy) ═══════
  function fetchTimeout(url, ms) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), ms);
    return fetch(url, { signal: c.signal }).finally(() => clearTimeout(t));
  }

  async function loadLivePrices() {
    for (const t of YF_TICKERS) {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(t.sym)}?interval=1d&range=2d`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const res = await fetchTimeout(proxyUrl, 7000);
        if (!res.ok) continue;
        const data = await res.json();
        const result = data?.chart?.result?.[0];
        if (!result) continue;
        const price = result.meta.regularMarketPrice;
        const prev = result.meta.chartPreviousClose;
        if (!price || !prev) continue;
        const change = price - prev;
        const pct = (change / prev) * 100;
        const sign = change >= 0 ? '+' : '';
        const arrow = change >= 0 ? '▲' : '▼';

        const priceEl = document.getElementById(t.elPrice);
        const changeEl = document.getElementById(t.elChange);
        if (priceEl) priceEl.textContent = '$' + price.toFixed(2);
        if (changeEl) {
          changeEl.textContent = `${arrow} ${sign}${change.toFixed(2)} (${sign}${pct.toFixed(2)}%)`;
          changeEl.className = 'lp-change ' + (change >= 0 ? 'up' : 'down');
        }
        const txt = `${t.name}: $${price.toFixed(2)} ${arrow} ${sign}${change.toFixed(2)} (${sign}${pct.toFixed(2)}%)`;
        t.tickerIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = txt;
        });
      } catch (e) { /* silent */ }
    }
    const ts = document.getElementById('lp-timestamp');
    if (ts) ts.textContent = 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  // ═══════ POLYMARKET: Real Prediction Market Data ═══════
  const POLYMARKET_SLUGS = [
    { slug: 'will-crude-oil-cl-hit-by-end-of-march', id: 'oil-march' },
    { slug: 'strait-of-hormuz-traffic-returns-to-normal-by-april-30', id: 'hormuz-normal' },
    { slug: 'us-escorts-commercial-ship-through-hormuz-by-march-31', id: 'hormuz-escort' },
    { slug: 'will-the-kharg-island-oil-terminal-be-hit-by-march-31', id: 'kharg-hit' },
    { slug: 'cl-hit-jun-2026', id: 'oil-june' },
  ];

  async function loadPolymarket() {
    const container = document.getElementById('polymarket-data');
    if (!container) return;
    let html = '';

    // Try serverless endpoint first, fall back to direct
    let data = null;
    try {
      const res = await fetchTimeout('/api/polymarket', 12000);
      if (res.ok) data = await res.json();
    } catch (e) { /* fall through */ }

    if (data) {
      // Oil price distribution from serverless batch response
      const oilEvent = data['will-crude-oil-cl-hit-by-end-of-march'] || data['cl-hit-jun-2026'];
      if (oilEvent) {
        const highs = (oilEvent.markets || [])
          .filter(m => m.question.includes('HIGH'))
          .map(m => {
            const match = m.question.match(/\$(\d+)/);
            const price = match ? parseInt(match[1]) : 0;
            const prob = JSON.parse(m.outcomePrices || '["0","0"]');
            return { price, prob: parseFloat(prob[0]), vol: parseFloat(m.volume || 0) };
          })
          .filter(m => m.price >= 95 && m.prob > 0 && m.prob < 1)
          .sort((a, b) => a.price - b.price);

        if (highs.length > 0) {
          html += '<div class="sec-label" style="margin-top:0">CL Price Targets<span class="src" style="margin-left:auto">LIVE</span></div>';
          highs.forEach(h => {
            const pct = Math.round(h.prob * 100);
            const barColor = pct > 50 ? 'var(--green)' : pct > 20 ? 'var(--gold)' : 'var(--accent)';
            html += `<div class="bar-row">
              <div class="bar-top"><span>CL hits $${h.price}</span><span class="bar-val">${pct}%</span></div>
              <div class="bar-bg"><div class="bar-fg" style="background:${barColor};width:${pct}%"></div></div>
            </div>`;
          });
        }
      }

      // Geopolitical contracts
      const geoSlugs = [
        { slug: 'strait-of-hormuz-traffic-returns-to-normal-by-april-30', label: 'Hormuz traffic normalizes by Apr 30' },
        { slug: 'us-escorts-commercial-ship-through-hormuz-by-march-31', label: 'US escorts ship through Hormuz' },
        { slug: 'will-the-kharg-island-oil-terminal-be-hit-by-march-31', label: 'Kharg Island terminal hit' },
        { slug: 'what-will-iran-strike-by-march-31', label: 'Iran strikes target by Mar 31' },
      ];

      let geoHtml = '';
      for (const gc of geoSlugs) {
        const ev = data[gc.slug];
        if (ev && ev.markets && ev.markets[0]) {
          const m = ev.markets[0];
          const prices = JSON.parse(m.outcomePrices || '["0","0"]');
          const yesProb = Math.round(parseFloat(prices[0]) * 100);
          const vol = Math.round(parseFloat(m.volume || 0));
          const volStr = vol > 1000000 ? '$' + (vol/1000000).toFixed(1) + 'M' : vol > 1000 ? '$' + (vol/1000).toFixed(0) + 'K' : '$' + vol;
          geoHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04)">'
            + '<span style="font-size:9px;color:var(--text);flex:1">' + gc.label + '</span>'
            + '<span style="font-family:IBM Plex Mono,monospace;font-size:11px;font-weight:600;color:' + (yesProb > 50 ? 'var(--green)' : 'var(--accent)') + ';min-width:35px;text-align:right">' + yesProb + '%</span>'
            + '<span style="font-family:IBM Plex Mono,monospace;font-size:7px;color:var(--muted);min-width:45px;text-align:right">' + volStr + '</span>'
            + '</div>';
        }
      }

      if (geoHtml) {
        html += '<div class="sec-label" style="margin-top:12px">Geopolitical Contracts<span class="src" style="margin-left:auto">LIVE</span></div>';
        html += geoHtml;
      }

      container.innerHTML = html || '<div class="note">No Polymarket data</div>';
      return;
    }

    // Fallback: try direct fetch (works from Vercel production, not localhost)
    try {
      const res = await fetchTimeout('https://gamma-api.polymarket.com/events?slug=will-crude-oil-cl-hit-by-end-of-march', 8000);
      const data = await res.json();
      if (data && data[0]) {
        const markets = data[0].markets || [];
        // Filter high-side targets, sort by price level
        const highs = markets
          .filter(m => m.question.includes('HIGH'))
          .map(m => {
            const match = m.question.match(/\$(\d+)/);
            const price = match ? parseInt(match[1]) : 0;
            const prob = JSON.parse(m.outcomePrices || '["0","0"]');
            return { price, prob: parseFloat(prob[0]), vol: parseFloat(m.volume || 0) };
          })
          .filter(m => m.price >= 95 && m.prob > 0 && m.prob < 1)
          .sort((a, b) => a.price - b.price);

        if (highs.length > 0) {
          html += `<div class="sec-label" style="margin-top:0">Polymarket — CL Price Targets (March)<span class="src" style="margin-left:auto">LIVE</span></div>`;
          highs.forEach(h => {
            const pct = Math.round(h.prob * 100);
            const barColor = pct > 50 ? 'var(--green)' : pct > 20 ? 'var(--gold)' : 'var(--accent)';
            html += `<div class="bar-row">
              <div class="bar-top"><span>CL hits $${h.price}</span><span class="bar-val">${pct}%</span></div>
              <div class="bar-bg"><div class="bar-fg" style="background:${barColor};width:${pct}%"></div></div>
            </div>`;
          });
        }
      }
    } catch (e) { /* silent */ }

    // Geopolitical contracts
    const geoContracts = [
      { slug: 'strait-of-hormuz-traffic-returns-to-normal-by-april-30', label: 'Hormuz traffic normalizes by Apr 30' },
      { slug: 'us-escorts-commercial-ship-through-hormuz-by-march-31', label: 'US escorts ship through Hormuz by Mar 31' },
      { slug: 'will-the-kharg-island-oil-terminal-be-hit-by-march-31', label: 'Kharg Island terminal hit by Mar 31' },
    ];

    let geoHtml = '';
    for (const gc of geoContracts) {
      try {
        const res = await fetchTimeout('https://gamma-api.polymarket.com/events?slug=' + gc.slug, 6000);
        const data = await res.json();
        if (data && data[0] && data[0].markets && data[0].markets[0]) {
          const m = data[0].markets[0];
          const prices = JSON.parse(m.outcomePrices || '["0","0"]');
          const yesProb = Math.round(parseFloat(prices[0]) * 100);
          const vol = Math.round(parseFloat(m.volume || 0));
          const volStr = vol > 1000000 ? '$' + (vol/1000000).toFixed(1) + 'M' : vol > 1000 ? '$' + (vol/1000).toFixed(0) + 'K' : '$' + vol;
          var probColor = yesProb > 50 ? 'var(--green)' : 'var(--accent)';
          geoHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04)">'
            + '<span style="font-size:9px;color:var(--text);flex:1">' + gc.label + '</span>'
            + '<span style="font-family:IBM Plex Mono,monospace;font-size:11px;font-weight:600;color:' + probColor + ';min-width:35px;text-align:right">' + yesProb + '%</span>'
            + '<span style="font-family:IBM Plex Mono,monospace;font-size:7px;color:var(--muted);min-width:45px;text-align:right">' + volStr + '</span>'
            + '</div>';
        }
      } catch (e) { /* silent */ }
    }

    if (geoHtml) {
      html += '<div class="sec-label" style="margin-top:12px">Polymarket \u2014 Geopolitical Contracts<span class="src" style="margin-left:auto">LIVE</span></div>';
      html += geoHtml;
    }

    if (html) {
      container.innerHTML = html;
    } else {
      container.innerHTML = '<div class="note">Polymarket data unavailable</div>';
    }
  }

  // ═══════ GOOGLE NEWS RSS (via CORS proxy) ═══════
  function stripHtml(s) {
    return (s || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const mins = Math.round((Date.now() - d) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  function getSourceClass(source) {
    const s = (source || '').toLowerCase();
    if (s.includes('bloomberg')) return 's-bloomberg';
    if (s.includes('jazeera')) return 's-aljazeera';
    if (s.includes('reuters')) return 's-reuters';
    if (s.includes('bbc')) return 's-reuters';
    if (s.includes('guardian')) return 's-ft';
    if (s.includes('platts') || s.includes('commodit')) return 's-platts';
    if (s.includes('times')) return 's-ft';
    return 's-eia';
  }

  async function loadLiveNews() {
    const container = document.getElementById('news-feed');
    if (!container) return;

    // Try serverless endpoint first
    try {
      const sres = await fetchTimeout('/api/rss', 10000);
      if (sres.ok) {
        const sdata = await sres.json();
        if (sdata.items && sdata.items.length > 0) {
          let html = '';
          sdata.items.forEach(item => {
            const ta = timeAgo(item.pubDate);
            const mins = Math.round((Date.now() - new Date(item.pubDate)) / 60000);
            const alertCls = mins < 60 ? '' : mins < 360 ? 'gold' : 'teal';
            const srcCls = getSourceClass(item.source);
            html += '<a href="' + (item.link || '#') + '" target="_blank" rel="noopener" style="text-decoration:none;display:block">'
              + '<div class="alert ' + alertCls + '">'
              + '<div class="alert-t">' + ta + (ta ? ' · ' : '') + '<span class="alert-src ' + srcCls + '">' + item.source + '</span></div>'
              + '<div class="alert-b"><strong>' + item.title + '</strong></div>'
              + '</div></a>';
          });
          if (html) container.innerHTML = html;
          return;
        }
      }
    } catch (e) { /* fall through to CORS proxy */ }

    // Fallback: direct CORS proxy
    try {
      const feedUrl = 'https://news.google.com/rss/search?q=oil+Hormuz+Iran+crude+OPEC+when:1d&hl=en-US&gl=US&ceid=US:en';
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
      const res = await fetchTimeout(proxyUrl, 8000);
      if (!res.ok) throw new Error('proxy failed');
      const xmlText = await res.text();
      if (!xmlText.includes('<')) throw new Error('not xml');

      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      const items = doc.querySelectorAll('item');
      if (!items.length) throw new Error('no items');

      let html = '';
      const seen = new Set();
      let count = 0;

      items.forEach(item => {
        if (count >= 12) return;
        const title = stripHtml(item.querySelector('title')?.textContent || '');
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const source = item.querySelector('source')?.textContent || 'News';
        const link = item.querySelector('link')?.textContent || '#';

        const key = title.slice(0, 40).toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);

        const ta = timeAgo(pubDate);
        const mins = Math.round((Date.now() - new Date(pubDate)) / 60000);
        const alertCls = mins < 60 ? '' : mins < 360 ? 'gold' : 'teal';
        const srcCls = getSourceClass(source);

        html += `<a href="${link}" target="_blank" rel="noopener" style="text-decoration:none;display:block">
          <div class="alert ${alertCls}">
            <div class="alert-t">${ta}${ta ? ' · ' : ''}<span class="alert-src ${srcCls}">${source}</span></div>
            <div class="alert-b"><strong>${title}</strong></div>
          </div>
        </a>`;
        count++;
      });

      if (html) container.innerHTML = html;
    } catch (e) {
      // Keep mock data as fallback — already rendered by renderNews()
    }
  }

  // ═══════ NASA FIRMS Fire Hotspots (real satellite data) ═══════
  let _firesLayer = null;
  let _map = null;

  async function loadFIRMSFires() {
    if (!_firesLayer || !_map) return;
    try {
      // Try serverless endpoint first
      const sres = await fetchTimeout('/api/fires', 12000);
      if (sres.ok) {
        const fires = await sres.json();
        if (fires && fires.length > 0) {
          _firesLayer.clearLayers();
          fires.forEach(f => {
            const r = f.brightness > 400 ? 4 : f.brightness > 350 ? 3 : 2;
            const op = f.confidence === 'high' ? 0.8 : f.confidence === 'nominal' ? 0.55 : 0.3;
            L.circleMarker([f.lat, f.lon], {
              radius: r, fillColor: '#ff4500', fillOpacity: op,
              color: '#ff4500', weight: 0.5, opacity: op,
            }).bindTooltip('<div class="map-tip"><strong>Fire Hotspot</strong><span style="color:#ff4500">Brightness: ' + f.brightness.toFixed(2) + ' K<br>Confidence: ' + f.confidence + '<br>' + f.datetime + ' UTC</span></div>', { maxWidth: 220, opacity: 1 })
              .addTo(_firesLayer);
          });
          return;
        }
      }
    } catch (e) { /* fall through */ }

    // Fallback: direct CORS proxy
    try {
      const url = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv/DEMO_KEY/VIIRS_SNPP_NRT/20,35,38,65/1';
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const res = await fetchTimeout(proxyUrl, 10000);
      if (!res.ok) return;
      const csv = await res.text();
      if (csv.includes('Invalid') || !csv.includes('latitude')) return;

      const lines = csv.trim().split('\n');
      const headers = lines[0].split(',');
      const latIdx = headers.indexOf('latitude');
      const lonIdx = headers.indexOf('longitude');
      const brightIdx = headers.indexOf('bright_ti4');
      const confIdx = headers.indexOf('confidence');
      const dtIdx = headers.indexOf('acq_date');
      const tmIdx = headers.indexOf('acq_time');

      _firesLayer.clearLayers();
      let count = 0;

      for (let i = 1; i < lines.length && count < 500; i++) {
        const cols = lines[i].split(',');
        const lat = parseFloat(cols[latIdx]);
        const lon = parseFloat(cols[lonIdx]);
        const brightness = parseFloat(cols[brightIdx]) || 330;
        const conf = cols[confIdx] || 'nominal';
        const dt = cols[dtIdx] || '';
        const tm = cols[tmIdx] || '';

        if (isNaN(lat) || isNaN(lon)) continue;

        const r = brightness > 400 ? 4 : brightness > 350 ? 3 : 2;
        const op = conf === 'high' ? 0.8 : conf === 'nominal' ? 0.55 : 0.3;

        L.circleMarker([lat, lon], {
          radius: r, fillColor: '#ff4500', fillOpacity: op,
          color: '#ff4500', weight: 0.5, opacity: op,
        }).bindTooltip(`<div class="map-tip"><strong>Fire Hotspot</strong><span style="color:#ff4500">Brightness: ${brightness.toFixed(2)} K<br>Confidence: ${conf}<br>${dt} ${tm} UTC</span></div>`, { maxWidth: 220, opacity: 1 })
          .addTo(_firesLayer);
        count++;
      }
    } catch (e) { /* keep simulated fires as fallback */ }
  }

  // ═══════ FUTURES TERM STRUCTURE ═══════
  async function loadFuturesCurve() {
    const container = document.getElementById('futures-curve');
    if (!container) return;

    try {
      const res = await fetchTimeout('/api/prices', 10000);
      if (!res.ok) throw new Error('api failed');
      const batch = await res.json();

      const wti = batch['CL=F'];
      const brent = batch['BZ=F'];
      if (!wti || !brent) throw new Error('no data');

      // Build a simple term structure display with available data
      const spread = brent.price - wti.price;
      const curveState = spread > 0 ? 'Brent Premium' : 'WTI Premium';

      var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">';
      html += '<div class="sc"><div class="v" style="font-size:20px;color:var(--gold)">$' + wti.price.toFixed(2) + '</div><div class="l">WTI Front Month</div></div>';
      html += '<div class="sc"><div class="v" style="font-size:20px;color:var(--accent)">$' + brent.price.toFixed(2) + '</div><div class="l">Brent Front Month</div></div>';
      html += '</div>';

      html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">';
      html += '<div class="sc"><div class="v" style="font-size:16px">$' + spread.toFixed(2) + '</div><div class="l">Brent-WTI Spread</div></div>';
      html += '<div class="sc"><div class="v" style="font-size:16px;color:var(--gold)">Backwardation</div><div class="l">Curve Shape</div></div>';
      html += '<div class="sc"><div class="v" style="font-size:16px;color:var(--accent)">' + curveState + '</div><div class="l">Spread State</div></div>';
      html += '</div>';

      // Add DXY, Gold, VIX from the batch
      const dxy = batch['DX-Y.NYB'];
      const gold = batch['GC=F'];
      const vix = batch['^VIX'];
      const spx = batch['^GSPC'];
      const tnx = batch['^TNX'];

      if (dxy || gold || vix) {
        html += '<div class="sec-label" style="margin-top:12px">Cross-Asset Monitor<span class="src" style="margin-left:auto">LIVE</span></div>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:6px">';
        if (dxy) html += '<div class="sc"><div class="v" style="font-size:16px">' + dxy.price.toFixed(2) + '</div><div class="l">DXY</div></div>';
        if (spx) html += '<div class="sc"><div class="v" style="font-size:16px">' + spx.price.toFixed(0) + '</div><div class="l">S&P 500</div></div>';
        if (vix) html += '<div class="sc"><div class="v" style="font-size:16px;color:' + (vix.price > 20 ? 'var(--accent)' : 'var(--green)') + '">' + vix.price.toFixed(2) + '</div><div class="l">VIX</div></div>';
        if (tnx) html += '<div class="sc"><div class="v" style="font-size:16px">' + tnx.price.toFixed(2) + '%</div><div class="l">US 10Y</div></div>';
        if (gold) html += '<div class="sc"><div class="v" style="font-size:16px;color:var(--gold)">$' + gold.price.toFixed(0) + '</div><div class="l">Gold</div></div>';
        html += '</div>';
      }

      container.innerHTML = html;
    } catch (e) {
      container.innerHTML = '<div class="note">Futures data loading on Vercel production...</div>';
    }
  }

  // ═══════ LIVE SCENARIO PRICING (based on live Brent price) ═══════
  function updateScenariosFromLivePrice(brentPrice) {
    if (!brentPrice || brentPrice <= 0) return;
    const b = brentPrice;
    const w = b - 4; // WTI spread

    const container = document.getElementById('scenario-cards');
    if (!container) return;

    // Recalculate scenarios from live price
    const liveScenarios = [
      { name: `Partial Disruption (1-2 weeks)`, css: 'ps-high', color: 'var(--accent)',
        low: Math.round(b * 1.25), mid: Math.round(b * 1.45), high: Math.round(b * 1.65),
        note: `+25-45% from $${b.toFixed(0)} · Harassment, not full blockade · Naval escorts, SPR release` },
      { name: `Full Blockade (1-3 months)`, css: 'ps-ext', color: '#ff4444',
        low: Math.round(b * 1.55), mid: Math.round(b * 2.0), high: Math.round(b * 2.5),
        note: `+55-100% from $${b.toFixed(0)} · Mining/interdiction · Kuwait 1990 analog · Demand destruction onset ~$130-150` },
      { name: `Extended Regional War (3+ months)`, css: 'ps-ext', color: '#ff4444',
        low: Math.round(b * 1.9), mid: Math.round(b * 2.7), high: Math.round(b * 3.0),
        note: `+90-170% from $${b.toFixed(0)} · Infrastructure destroyed · 1973 analog · Rationing / recession` },
    ];

    // Replace just the top 3 scenario cards (keep the static ones below)
    const existingCards = container.querySelectorAll('.ps');
    liveScenarios.forEach((s, i) => {
      if (existingCards[i]) {
        existingCards[i].className = `ps ${s.css}`;
        existingCards[i].innerHTML = `
          <div class="ps-label">${s.name}</div>
          <div class="ps-prices">
            <span>Brent <strong style="color:${s.color}">$${s.low}–${s.mid}</strong></span>
            <span>WTI <strong style="color:${s.color}">$${Math.round(s.low - 4)}–${Math.round(s.mid - 4)}</strong></span>
          </div>
          <div class="ps-note">${s.note}</div>
        `;
      }
    });
  }

  // ═══════ ENHANCED LIVE PRICES (update scenarios too) ═══════
  async function loadLivePricesEnhanced() {
    let brentPrice = null;

    // Try serverless batch endpoint first
    try {
      const batchRes = await fetchTimeout('/api/prices', 10000);
      if (batchRes.ok) {
        const batch = await batchRes.json();
        for (const t of YF_TICKERS) {
          const quote = batch[t.sym];
          if (!quote) continue;
          if (t.sym === 'BZ=F') brentPrice = quote.price;
          const sign = quote.change >= 0 ? '+' : '';
          const arrow = quote.change >= 0 ? '\u25B2' : '\u25BC';
          const priceEl = document.getElementById(t.elPrice);
          const changeEl = document.getElementById(t.elChange);
          if (priceEl) priceEl.textContent = '$' + quote.price.toFixed(2);
          if (changeEl) {
            changeEl.textContent = arrow + ' ' + sign + quote.change.toFixed(2) + ' (' + sign + quote.changePct.toFixed(2) + '%)';
            changeEl.className = 'lp-change ' + (quote.change >= 0 ? 'up' : 'down');
          }
          const txt = t.name + ': $' + quote.price.toFixed(2) + ' ' + arrow + ' ' + sign + quote.change.toFixed(2) + ' (' + sign + quote.changePct.toFixed(2) + '%)';
          t.tickerIds.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = txt; });
        }
        const ts = document.getElementById('lp-timestamp');
        if (ts) ts.textContent = 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (brentPrice) updateScenariosFromLivePrice(brentPrice);
        return;
      }
    } catch (e) { /* fall through to CORS proxy */ }

    // Fallback: CORS proxy per ticker
    for (const t of YF_TICKERS) {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(t.sym)}?interval=1d&range=2d`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const res = await fetchTimeout(proxyUrl, 7000);
        if (!res.ok) continue;
        const data = await res.json();
        const result = data?.chart?.result?.[0];
        if (!result) continue;
        const price = result.meta.regularMarketPrice;
        const prev = result.meta.chartPreviousClose;
        if (!price || !prev) continue;
        const change = price - prev;
        const pct = (change / prev) * 100;
        const sign = change >= 0 ? '+' : '';
        const arrow = change >= 0 ? '▲' : '▼';

        if (t.sym === 'BZ=F') brentPrice = price;

        const priceEl = document.getElementById(t.elPrice);
        const changeEl = document.getElementById(t.elChange);
        if (priceEl) priceEl.textContent = '$' + price.toFixed(2);
        if (changeEl) {
          changeEl.textContent = `${arrow} ${sign}${change.toFixed(2)} (${sign}${pct.toFixed(2)}%)`;
          changeEl.className = 'lp-change ' + (change >= 0 ? 'up' : 'down');
        }
        const txt = `${t.name}: $${price.toFixed(2)} ${arrow} ${sign}${change.toFixed(2)} (${sign}${pct.toFixed(2)}%)`;
        t.tickerIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = txt;
        });
      } catch (e) { /* silent */ }
    }
    const ts = document.getElementById('lp-timestamp');
    if (ts) ts.textContent = 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Update scenarios from live Brent price
    if (brentPrice) updateScenariosFromLivePrice(brentPrice);
  }

  // ═══════ INIT ═══════
  function init() {
    // Render all data-driven sections (mock data first, live overwrites)
    renderRegimeBars();
    renderScenarios();
    renderAgents();
    renderNews();      // mock fallback
    renderPrecedents();
    renderCatalysts();
    renderConsensus();
    renderSignal();
    renderTrade();
    renderBypass();

    // Init map (stores refs for FIRMS)
    initMap();

    // Animate bars after render
    setTimeout(animateBars, 600);

    // Start clock
    updateUTC();
    setInterval(updateUTC, 60000);

    // Live data: prices (also updates scenarios from live Brent)
    loadLivePricesEnhanced();
    setInterval(loadLivePricesEnhanced, 60000);

    // Live data: Google News RSS (overwrites mock news)
    setTimeout(loadLiveNews, 1000);
    setInterval(loadLiveNews, 3 * 60000);

    // Live data: Polymarket prediction markets
    setTimeout(loadPolymarket, 1500);
    setInterval(loadPolymarket, 5 * 60000);

    // Live data: Futures term structure + cross-asset
    setTimeout(loadFuturesCurve, 2000);
    setInterval(loadFuturesCurve, 60000);

    // Live data: NASA FIRMS fires (overwrites simulated)
    setTimeout(loadFIRMSFires, 2500);
    setInterval(loadFIRMSFires, 15 * 60000);
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
