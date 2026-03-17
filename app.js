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

    // Fire hotspots layer
    const firesLayer = L.layerGroup();
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

  // ═══════ INIT ═══════
  function init() {
    // Render all data-driven sections
    renderRegimeBars();
    renderScenarios();
    renderAgents();
    renderNews();
    renderPrecedents();
    renderCatalysts();
    renderConsensus();
    renderSignal();
    renderTrade();
    renderBypass();

    // Init map
    initMap();

    // Animate bars after render
    setTimeout(animateBars, 600);

    // Start clock
    updateUTC();
    setInterval(updateUTC, 60000);

    // Start live prices
    loadLivePrices();
    setInterval(loadLivePrices, 60000);
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
