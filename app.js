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
        // Update World State bignum with live WTI price
        if (t.sym === 'CL=F') {
          var wsP = document.getElementById('world-state-price');
          if (wsP) wsP.innerHTML = '$' + price.toFixed(2) + ' <span class="u">WTI CL1</span>';
          var wsC = document.getElementById('world-state-curve');
          if (wsC) wsC.innerHTML = 'Curve: <strong style="color:var(--gold)">Backwardation</strong> · ' + arrow + ' ' + sign + change.toFixed(2) + ' (' + sign + pct.toFixed(2) + '%)';
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

      const dubai = batch['DUBAI'];

      var html = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">';
      html += '<div class="sc"><div class="v" style="font-size:20px;color:var(--gold)">$' + wti.price.toFixed(2) + '</div><div class="l">WTI Front Month</div></div>';
      html += '<div class="sc"><div class="v" style="font-size:20px;color:var(--accent)">$' + brent.price.toFixed(2) + '</div><div class="l">Brent Front Month</div></div>';
      if (dubai) {
        html += '<div class="sc" style="border:1px solid var(--accent)"><div class="v" style="font-size:20px;color:var(--accent)">$' + dubai.price.toFixed(2) + '</div><div class="l">Dubai Crude (est.) <span style="font-size:7px;color:var(--muted)">' + (dubai.brentDiff >= 0 ? 'Brent+$' + dubai.brentDiff.toFixed(1) : 'Brent$' + dubai.brentDiff.toFixed(1)) + '</span></div></div>';
      }
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

  // ═══════ LIVE SWARM (real Claude API calls) ═══════
  async function loadSwarm() {
    const agentContainer = document.getElementById('agent-cards');
    const consensusContainer = document.getElementById('consensus-box');
    const signalContainer = document.getElementById('signal-box');
    if (!agentContainer) return;

    try {
      const res = await fetchTimeout('/api/swarm', 30000);
      if (!res.ok) return;
      const data = await res.json();
      if (data.error || !data.agents || data.agents.length === 0) return;

      // Render live agent cards (overwrite mock data)
      agentContainer.innerHTML = data.agents.map(function(a) {
        var dirColor = a.direction === 'bullish' ? 'var(--green)' : a.direction === 'bearish' ? 'var(--accent)' : 'var(--blue)';
        var expr = (a.recommended_expression || 'no_trade').replace(/_/g, ' ').toUpperCase();
        var drivers = (a.top_drivers || []).map(function(d) { return '<li>' + d + '</li>'; }).join('');
        var conf = Math.round((a.confidence || 0) * 100);
        return '<div class="agent-card">'
          + '<div class="agent-header"><div>'
          + '<div class="agent-name">' + a.agent_name + '</div>'
          + '</div>'
          + '<span class="agent-dir ' + a.direction + '">' + a.direction + '</span></div>'
          + '<div class="agent-expr">\u2192 ' + expr + ' (' + conf + '% conf)</div>'
          + '<ul class="agent-drivers">' + drivers + '</ul>'
          + '<div class="agent-conf-bar"><div class="agent-conf-fill" style="background:' + dirColor + ';width:' + conf + '%"></div></div>'
          + '</div>';
      }).join('');

      // Update consensus
      if (data.consensus && consensusContainer) {
        var c = data.consensus;
        consensusContainer.innerHTML = ''
          + '<div class="consensus-row"><span class="consensus-label">Bullish Probability</span><span class="consensus-value" style="color:var(--green)">' + c.bullish_prob + '%</span></div>'
          + '<div class="consensus-row"><span class="consensus-label">Bearish Probability</span><span class="consensus-value" style="color:var(--accent)">' + c.bearish_prob + '%</span></div>'
          + '<div class="consensus-row"><span class="consensus-label">Neutral</span><span class="consensus-value">' + c.neutral_prob + '%</span></div>'
          + '<div class="consensus-row"><span class="consensus-label">Avg Confidence</span><span class="consensus-value">' + c.avg_confidence + '%</span></div>'
          + '<div class="consensus-row"><span class="consensus-label">Vol Expansion P</span><span class="consensus-value" style="color:var(--gold)">' + c.vol_expansion_prob + '%</span></div>'
          + '<div class="consensus-row"><span class="consensus-label">Disagreement</span><span class="consensus-value">' + c.disagreement_score + '</span></div>';

        // Update top drivers
        var driversEl = consensusContainer.parentElement;
        if (driversEl && c.top_drivers && c.top_drivers.length > 0) {
          var existingDriverNotes = driversEl.querySelectorAll('.note');
          // Clear old driver notes and replace
          var driverHtml = '<div class="note" style="margin-top:8px"><strong style="color:var(--white)">Top consensus drivers (LIVE):</strong></div>';
          c.top_drivers.slice(0, 4).forEach(function(d) {
            driverHtml += '<div class="note">\u25C6 ' + d + '</div>';
          });
          // Find the right spot after the consensus box
          var insertPoint = consensusContainer.nextSibling;
          while (insertPoint && insertPoint.className === 'note') {
            var next = insertPoint.nextSibling;
            insertPoint.remove();
            insertPoint = next;
          }
          consensusContainer.insertAdjacentHTML('afterend', driverHtml);
        }
      }

      // Update signal from consensus
      if (data.consensus && signalContainer) {
        var c = data.consensus;
        var action = c.top_expression ? c.top_expression.replace(/_/g, ' ').toUpperCase() : 'NO TRADE';
        var edgeColor = c.bullish_prob > 50 ? 'var(--green)' : 'var(--accent)';
        try { signalContainer.querySelector('.signal-action').textContent = action; } catch(e) {}
      }

      // Update ticker bar with live swarm data
      if (data.consensus) {
        var c = data.consensus;
        var action = c.top_expression ? c.top_expression.replace(/_/g, ' ').toUpperCase() : 'NO TRADE';
        var regimeTxt = 'REGIME: EVENT_RISK · Swarm ' + c.bullish_prob + '% bullish · Signal: ' + action;
        var signalTxt = 'SIGNAL: ' + action + ' · Avg Confidence ' + c.avg_confidence + '% · Disagreement ' + c.disagreement_score;
        var consTxt = 'SWARM: ' + c.bullish_prob + '% bull / ' + c.bearish_prob + '% bear / ' + c.neutral_prob + '% neutral · ' + (c.agent_count || 8) + ' agents';
        ['', '2'].forEach(function(suf) {
          var r = document.getElementById('ticker-regime' + suf); if (r) r.textContent = regimeTxt;
          var s = document.getElementById('ticker-signal' + suf); if (s) s.textContent = signalTxt;
          var cn = document.getElementById('ticker-consensus' + suf); if (cn) cn.textContent = consTxt;
        });
      }

      // Add a "LIVE SWARM" indicator
      var swarmLabel = document.querySelector('.sec-label');
      // Find the swarm agent views label specifically
      document.querySelectorAll('.sec-label').forEach(function(el) {
        if (el.textContent.includes('Swarm Agent')) {
          el.innerHTML = '<span style="display:flex;align-items:center;gap:6px;flex:1"><span class="lp-dot"></span> Swarm Agent Views</span><span class="src" style="margin-left:auto">LIVE · ' + data.agents.length + ' agents</span>';
        }
        if (el.textContent.includes('Swarm Consensus')) {
          el.innerHTML = '<span style="display:flex;align-items:center;gap:6px;flex:1"><span class="lp-dot"></span> Swarm Consensus</span><span class="src" style="margin-left:auto">LIVE</span>';
        }
      });

      // Backup signal to localStorage for track record
      // Only log once per day OR if direction/expression changes
      if (data.consensus && data.consensus.top_expression !== 'no_trade' && data.world_state) {
        try {
          var existing = JSON.parse(localStorage.getItem('mirofish_signals') || '[]');
          var newDir = data.consensus.bullish_prob > data.consensus.bearish_prob ? 'bullish' : data.consensus.bearish_prob > data.consensus.bullish_prob ? 'bearish' : 'neutral';
          var newExpr = data.consensus.top_expression;
          var today = new Date().toISOString().split('T')[0];
          var shouldLog = true;
          if (existing.length > 0) {
            var last = existing[0];
            var lastDate = (last.timestamp || '').split('T')[0];
            // Same day + same direction + same expression = skip
            if (lastDate === today && last.direction === newDir && last.expression === newExpr) {
              shouldLog = false;
            }
          }
          if (shouldLog) {
            existing.unshift({
              timestamp: data.timestamp || new Date().toISOString(),
              direction: newDir,
              expression: newExpr,
              bullish_prob: data.consensus.bullish_prob,
              bearish_prob: data.consensus.bearish_prob,
              avg_confidence: data.consensus.avg_confidence,
              disagreement: data.consensus.disagreement_score,
              agent_count: data.consensus.agent_count,
              top_drivers: data.consensus.top_drivers,
              wti_at_signal: data.world_state.prices && data.world_state.prices.wti ? data.world_state.prices.wti.price : 0,
              brent_at_signal: data.world_state.prices && data.world_state.prices.brent ? data.world_state.prices.brent.price : 0,
              vix_at_signal: data.world_state.macro ? data.world_state.macro.vix : 0,
            });
            if (existing.length > 200) existing.length = 200;
            localStorage.setItem('mirofish_signals', JSON.stringify(existing));
          }
        } catch(e2) {}
      }

    } catch (e) { /* keep mock data as fallback */ }
  }

  // ═══════ LIVE OPTIONS CHAIN ═══════
  async function loadOptions() {
    var container = document.getElementById('options-chain');
    if (!container) return;

    try {
      var res = await fetchTimeout('/api/options', 12000);
      if (!res.ok) throw new Error('api failed');
      var data = await res.json();
      if (data.error || !data.calls || data.calls.length === 0) throw new Error(data.error || 'no data');

      var html = '';
      var spot = data.spotPrice;

      // Summary stats
      if (data.summary) {
        var s = data.summary;
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(70px,1fr));gap:6px;margin-bottom:10px">';
        html += '<div class="sc"><div class="v" style="font-size:16px;color:var(--gold)">' + s.avgCallIV + '%</div><div class="l">Avg Call IV</div></div>';
        html += '<div class="sc"><div class="v" style="font-size:16px;color:var(--accent)">' + s.avgPutIV + '%</div><div class="l">Avg Put IV</div></div>';
        html += '<div class="sc"><div class="v" style="font-size:16px">' + s.putCallRatio + '</div><div class="l">P/C Ratio</div></div>';
        html += '<div class="sc"><div class="v" style="font-size:16px;color:' + (s.skew > 0 ? 'var(--accent)' : 'var(--green)') + '">' + s.skew + '%</div><div class="l">Skew</div></div>';
        html += '</div>';
      }

      // Expiration
      html += '<div class="note" style="margin-bottom:8px">Expiry: ' + data.expiration + ' · Spot: $' + spot.toFixed(2) + '</div>';

      // OTM Calls table (most relevant for the signal)
      var otmCalls = data.calls.filter(function(c) { return !c.inTheMoney && c.strike <= spot * 1.3; }).slice(0, 8);
      if (otmCalls.length > 0) {
        html += '<div class="sec-label" style="margin-top:4px">OTM Calls<span class="src" style="margin-left:auto">LIVE</span></div>';
        html += '<div style="font-family:IBM Plex Mono,monospace;font-size:9px;color:var(--muted);display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:2px;padding:2px 0;border-bottom:1px solid var(--border)">';
        html += '<span>Strike</span><span>Bid</span><span>Ask</span><span>Vol</span><span>IV</span></div>';
        otmCalls.forEach(function(c) {
          var ivColor = c.impliedVolatility > 0.5 ? 'var(--accent)' : c.impliedVolatility > 0.35 ? 'var(--gold)' : 'var(--green)';
          html += '<div style="font-family:IBM Plex Mono,monospace;font-size:10px;display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:2px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.03)">';
          html += '<span style="color:var(--white);font-weight:600">$' + c.strike.toFixed(0) + '</span>';
          html += '<span>$' + c.bid.toFixed(2) + '</span>';
          html += '<span>$' + c.ask.toFixed(2) + '</span>';
          html += '<span>' + c.volume + '</span>';
          html += '<span style="color:' + ivColor + '">' + (c.impliedVolatility * 100).toFixed(1) + '%</span>';
          html += '</div>';
        });
      }

      // OTM Puts (smaller)
      var otmPuts = data.puts.filter(function(p) { return !p.inTheMoney && p.strike >= spot * 0.8; }).slice(-6);
      if (otmPuts.length > 0) {
        html += '<div class="sec-label" style="margin-top:10px">OTM Puts</div>';
        html += '<div style="font-family:IBM Plex Mono,monospace;font-size:9px;color:var(--muted);display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:2px;padding:2px 0;border-bottom:1px solid var(--border)">';
        html += '<span>Strike</span><span>Bid</span><span>Ask</span><span>Vol</span><span>IV</span></div>';
        otmPuts.forEach(function(p) {
          html += '<div style="font-family:IBM Plex Mono,monospace;font-size:10px;display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:2px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.03)">';
          html += '<span style="color:var(--white);font-weight:600">$' + p.strike.toFixed(0) + '</span>';
          html += '<span>$' + p.bid.toFixed(2) + '</span>';
          html += '<span>$' + p.ask.toFixed(2) + '</span>';
          html += '<span>' + p.volume + '</span>';
          html += '<span style="color:var(--accent)">' + (p.impliedVolatility * 100).toFixed(1) + '%</span>';
          html += '</div>';
        });
      }

      container.innerHTML = html;
    } catch (e) {
      container.innerHTML = '<div class="note">Options data: ' + e.message + '</div>';
    }
  }

  // ═══════ EIA INVENTORY DATA (real weekly petroleum stats) ═══════
  async function loadEIA() {
    try {
      var res = await fetchTimeout('/api/eia', 12000);
      if (!res.ok) return;
      var data = await res.json();
      if (data.error) return;

      // Find the inventory section in left panel and update it
      var sections = document.querySelectorAll('.sec-label');
      sections.forEach(function(label) {
        if (label.textContent.includes('Inventory')) {
          var sec = label.parentElement;
          var html = '';

          // Crude
          var crude = data.crude_stocks;
          if (crude && crude.change) {
            var chg = crude.change.change;
            var chgStr = (chg > 0 ? '+' : '') + (chg / 1000).toFixed(1) + 'M bbl';
            var color = chg < 0 ? 'var(--green)' : 'var(--accent)';
            var pct = Math.min(Math.abs(chg) / 100, 100);
            html += '<div class="bar-row"><div class="bar-top"><span>Crude (' + (chg < 0 ? 'draw' : 'build') + ')</span><span class="bar-val">' + chgStr + '</span></div>';
            html += '<div class="bar-bg"><div class="bar-fg" style="background:' + color + ';width:' + pct + '%"></div></div></div>';
          }

          // Gasoline
          var gas = data.gasoline_stocks;
          if (gas && gas.change) {
            var chg = gas.change.change;
            var chgStr = (chg > 0 ? '+' : '') + (chg / 1000).toFixed(1) + 'M bbl';
            var color = chg < 0 ? 'var(--green)' : 'var(--accent)';
            var pct = Math.min(Math.abs(chg) / 100, 100);
            html += '<div class="bar-row"><div class="bar-top"><span>Gasoline (' + (chg < 0 ? 'draw' : 'build') + ')</span><span class="bar-val">' + chgStr + '</span></div>';
            html += '<div class="bar-bg"><div class="bar-fg" style="background:' + color + ';width:' + pct + '%"></div></div></div>';
          }

          // Distillate
          var dist = data.distillate_stocks;
          if (dist && dist.change) {
            var chg = dist.change.change;
            var chgStr = (chg > 0 ? '+' : '') + (chg / 1000).toFixed(1) + 'M bbl';
            var color = chg < 0 ? 'var(--green)' : 'var(--accent)';
            var pct = Math.min(Math.abs(chg) / 100, 100);
            html += '<div class="bar-row"><div class="bar-top"><span>Distillate (' + (chg < 0 ? 'draw' : 'build') + ')</span><span class="bar-val">' + chgStr + '</span></div>';
            html += '<div class="bar-bg"><div class="bar-fg" style="background:' + color + ';width:' + pct + '%"></div></div></div>';
          }

          // Cushing
          var cush = data.cushing_stocks;
          if (cush && cush.latest) {
            var cushVal = (cush.latest.value / 1000).toFixed(1);
            var cushChg = cush.change ? (cush.change.change / 1000).toFixed(1) : '?';
            html += '<div class="bar-row"><div class="bar-top"><span>Cushing Storage</span><span class="bar-val">' + cushVal + 'M bbl (' + (cushChg > 0 ? '+' : '') + cushChg + 'M)</span></div>';
            html += '<div class="bar-bg"><div class="bar-fg" style="background:var(--gold);width:' + Math.min(cush.latest.value / 1000, 100) + '%"></div></div></div>';
          }

          if (html) {
            // Update label to show LIVE
            label.innerHTML = '<span style="display:flex;align-items:center;gap:6px;flex:1"><span class="lp-dot"></span> Inventory — Latest EIA</span><span class="src" style="margin-left:auto">LIVE</span>';
            // Replace bar content (keep the label)
            var bars = sec.querySelectorAll('.bar-row');
            bars.forEach(function(b) { b.remove(); });
            label.insertAdjacentHTML('afterend', html);
          }

          // Also update the new eia-inventory container if it exists
          var eiaEl = document.getElementById('eia-inventory');
          if (eiaEl && html) eiaEl.innerHTML = html;
        }
      });
    } catch (e) { /* keep mock data */ }
  }

  // ═══════ CFTC POSITIONING DATA (real COT report) ═══════
  async function loadCFTC() {
    try {
      var res = await fetchTimeout('/api/cftc', 12000);
      if (!res.ok) return;
      var data = await res.json();
      if (data.error || !data.latest) return;

      var mm = data.latest.managed_money;
      var oi = data.latest.open_interest;

      var cftcHtml = '<div class="sg">'
        + '<div class="sc"><div class="v" style="color:var(--gold)">' + mm.percentile + 'th</div><div class="l">Net Length Pctl</div></div>'
        + '<div class="sc"><div class="v" style="color:var(--accent)">' + data.latest.short_squeeze_risk + '</div><div class="l">Squeeze Risk</div></div>'
        + '<div class="sc"><div class="v" style="color:var(--warn)">' + (mm.net / 1000).toFixed(0) + 'K</div><div class="l">MM Net Contracts</div></div>'
        + '<div class="sc"><div class="v" style="color:var(--teal)">' + (mm.net_change_1w > 0 ? '+' : '') + (mm.net_change_1w / 1000).toFixed(1) + 'K</div><div class="l">Net Change (1w)</div></div>'
        + '</div>';

      // Update the cftc-positioning container
      var cftcEl = document.getElementById('cftc-positioning');
      if (cftcEl) cftcEl.innerHTML = cftcHtml;

      // Also try the old selector approach for backward compat
      var sections = document.querySelectorAll('.sec-label');
      sections.forEach(function(label) {
        if (label.textContent.includes('Positioning') || label.textContent.includes('CFTC')) {
          var sec = label.parentElement;
          var grid = sec.querySelector('.sg');
          if (grid) {
            grid.innerHTML = cftcHtml.replace('<div class="sg">','').replace('</div>','');
          }
          label.innerHTML = '<span style="display:flex;align-items:center;gap:6px;flex:1"><span class="lp-dot"></span> CFTC Positioning</span><span class="src" style="margin-left:auto">LIVE · ' + data.latest.date + '</span>';
        }
      });
    } catch (e) { /* keep mock data */ }
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

  // ═══════ SPR DATA (Strategic Petroleum Reserve) ═══════
  async function loadSPR() {
    var container = document.getElementById('spr-data');
    if (!container) return;

    try {
      var res = await fetchTimeout('/api/eia', 12000);
      if (!res.ok) return;
      var data = await res.json();
      if (!data.spr || !data.spr.latest) {
        container.innerHTML = '<div class="note">SPR data unavailable</div>';
        return;
      }

      var spr = data.spr;
      var current = spr.latest.value / 1000; // convert to millions
      var peak = spr.peak ? spr.peak / 1000 : 727; // historical peak ~727M bbl
      var pctOfPeak = Math.round((current / peak) * 100);
      var chg = spr.change ? spr.change.change / 1000 : 0;
      var chgStr = (chg > 0 ? '+' : '') + chg.toFixed(1) + 'M bbl/wk';

      // Mini sparkline from history
      var hist = spr.history || [];
      var sparkHtml = '';
      if (hist.length > 4) {
        var vals = hist.slice(0, 26).map(function(h) { return h.value / 1000; }).reverse();
        var min = Math.min.apply(null, vals);
        var max = Math.max.apply(null, vals);
        var range = max - min || 1;
        var points = vals.map(function(v, i) {
          return (i * (260 / (vals.length - 1))) + ',' + (38 - ((v - min) / range) * 34);
        }).join(' ');
        sparkHtml = '<svg width="260" height="42" style="display:block;margin:6px 0">'
          + '<polyline points="' + points + '" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.8"/>'
          + '<text x="0" y="10" fill="var(--muted)" font-size="7" font-family="IBM Plex Mono,monospace">' + max.toFixed(0) + 'M</text>'
          + '<text x="0" y="40" fill="var(--muted)" font-size="7" font-family="IBM Plex Mono,monospace">' + min.toFixed(0) + 'M</text>'
          + '</svg>';
      }

      var fillColor = pctOfPeak < 50 ? 'var(--accent)' : pctOfPeak < 70 ? 'var(--gold)' : 'var(--green)';
      var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">'
        + '<div class="sc"><div class="v" style="font-size:20px;color:' + fillColor + '">' + current.toFixed(0) + 'M</div><div class="l">Current SPR (bbl)</div></div>'
        + '<div class="sc"><div class="v" style="font-size:20px;color:var(--muted)">' + pctOfPeak + '%</div><div class="l">% of Peak (' + peak.toFixed(0) + 'M)</div></div>'
        + '</div>';

      // Fill bar
      html += '<div class="bar-row"><div class="bar-top"><span>SPR Fill Level</span><span class="bar-val">' + chgStr + '</span></div>';
      html += '<div class="bar-bg"><div class="bar-fg" style="background:' + fillColor + ';width:' + pctOfPeak + '%"></div></div></div>';

      // Sparkline
      html += sparkHtml;

      // Warning callout if low
      if (pctOfPeak < 55) {
        html += '<div class="callout-box callout-red" style="margin-top:4px"><div style="font-size:9px;color:var(--text);line-height:1.4">'
          + '<strong style="color:var(--accent)">SPR at multi-decade low.</strong> Limited buffer for supply disruption. Gov\'t ability to release reserves is constrained.'
          + '</div></div>';
      }

      container.innerHTML = html;
      // Update section label
      var label = container.parentElement.querySelector('.sec-label');
      if (label) label.innerHTML = '<span style="display:flex;align-items:center;gap:6px;flex:1"><span class="lp-dot"></span> SPR — Strategic Petroleum Reserve</span><span class="src" style="margin-left:auto">LIVE · EIA</span>';
    } catch (e) {
      container.innerHTML = '<div class="note">SPR: ' + e.message + '</div>';
    }
  }

  // ═══════ CRACK SPREADS (Refinery Margins) ═══════
  async function loadCrackSpreads() {
    var container = document.getElementById('crack-spreads');
    if (!container) return;

    try {
      var res = await fetchTimeout('/api/prices', 10000);
      if (!res.ok) throw new Error('api failed');
      var batch = await res.json();

      var wti = batch['CL=F'];
      var rb = batch['RB=F'];   // RBOB Gasoline
      var ho = batch['HO=F'];   // Heating Oil (distillate proxy)

      if (!wti || !rb || !ho) throw new Error('missing data');

      // 3-2-1 crack spread: (2 * gasoline + 1 * heating oil) / 3 - crude
      // RB and HO are in $/gallon, need to convert to $/barrel (42 gal/bbl)
      var gasolinePerBbl = rb.price * 42;
      var heatingPerBbl = ho.price * 42;
      var crack321 = ((2 * gasolinePerBbl) + heatingPerBbl) / 3 - wti.price;

      // Simple gasoline crack
      var gasCrack = gasolinePerBbl - wti.price;

      // Distillate crack
      var distCrack = heatingPerBbl - wti.price;

      var crackColor = crack321 > 25 ? 'var(--green)' : crack321 > 15 ? 'var(--gold)' : 'var(--accent)';

      var html = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">';
      html += '<div class="sc"><div class="v" style="font-size:18px;color:' + crackColor + '">$' + crack321.toFixed(2) + '</div><div class="l">3-2-1 Crack</div></div>';
      html += '<div class="sc"><div class="v" style="font-size:18px;color:var(--green)">$' + gasCrack.toFixed(2) + '</div><div class="l">Gasoline Crack</div></div>';
      html += '<div class="sc"><div class="v" style="font-size:18px;color:var(--gold)">$' + distCrack.toFixed(2) + '</div><div class="l">Distillate Crack</div></div>';
      html += '</div>';

      // Raw product prices
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
      html += '<div class="sc"><div class="v" style="font-size:14px">$' + rb.price.toFixed(4) + '/gal</div><div class="l">RBOB Gasoline (RB=F)</div></div>';
      html += '<div class="sc"><div class="v" style="font-size:14px">$' + ho.price.toFixed(4) + '/gal</div><div class="l">Heating Oil (HO=F)</div></div>';
      html += '</div>';

      // Interpretation
      var interpretation = crack321 > 30
        ? 'Refinery margins extremely strong — demand for products robust, supports crude prices.'
        : crack321 > 20
        ? 'Healthy refinery margins — product demand solid, refiners incentivized to process crude.'
        : crack321 > 10
        ? 'Moderate margins — refinery economics neutral.'
        : 'Weak margins — demand soft, refiners may cut runs, bearish for crude demand.';

      html += '<div class="callout-box callout-' + (crack321 > 20 ? 'gold' : 'red') + '" style="margin-top:6px"><div style="font-size:9px;color:var(--text);line-height:1.4">'
        + '<strong style="color:' + crackColor + '">3-2-1 Crack: $' + crack321.toFixed(2) + '/bbl.</strong> ' + interpretation
        + '</div></div>';

      container.innerHTML = html;
      var label = container.parentElement.querySelector('.sec-label');
      if (label) label.innerHTML = '<span style="display:flex;align-items:center;gap:6px;flex:1"><span class="lp-dot"></span> Crack Spreads — Refinery Margins</span><span class="src" style="margin-left:auto">LIVE</span>';
    } catch (e) {
      container.innerHTML = '<div class="note">Crack spreads: ' + e.message + '</div>';
    }
  }

  // ═══════ IV SKEW CHART (from options data) ═══════
  async function loadIVSkew() {
    var container = document.getElementById('iv-skew-chart');
    if (!container) return;

    try {
      var res = await fetchTimeout('/api/options', 12000);
      if (!res.ok) throw new Error('api failed');
      var data = await res.json();
      if (!data.calls || data.calls.length === 0) throw new Error('no options data');

      var spot = data.spotPrice;

      // Get OTM puts and OTM calls with valid IV
      var puts = data.puts.filter(function(p) {
        return !p.inTheMoney && p.impliedVolatility > 0 && p.strike >= spot * 0.75;
      });
      var calls = data.calls.filter(function(c) {
        return !c.inTheMoney && c.impliedVolatility > 0 && c.strike <= spot * 1.35;
      });

      // Combine and sort by strike
      var allStrikes = [];
      puts.forEach(function(p) { allStrikes.push({ strike: p.strike, iv: p.impliedVolatility, type: 'put' }); });
      calls.forEach(function(c) { allStrikes.push({ strike: c.strike, iv: c.impliedVolatility, type: 'call' }); });
      allStrikes.sort(function(a, b) { return a.strike - b.strike; });

      if (allStrikes.length < 3) throw new Error('insufficient data');

      // Build SVG chart
      var width = 280;
      var height = 100;
      var padding = 25;
      var chartW = width - padding * 2;
      var chartH = height - 20;

      var minStrike = allStrikes[0].strike;
      var maxStrike = allStrikes[allStrikes.length - 1].strike;
      var strikeRange = maxStrike - minStrike || 1;
      var ivs = allStrikes.map(function(s) { return s.iv; });
      var minIV = Math.min.apply(null, ivs) * 0.9;
      var maxIV = Math.max.apply(null, ivs) * 1.1;
      var ivRange = maxIV - minIV || 0.01;

      var putPoints = [];
      var callPoints = [];
      allStrikes.forEach(function(s) {
        var x = padding + ((s.strike - minStrike) / strikeRange) * chartW;
        var y = 10 + chartH - ((s.iv - minIV) / ivRange) * chartH;
        if (s.type === 'put') putPoints.push(x + ',' + y);
        else callPoints.push(x + ',' + y);
      });

      // Spot line x position
      var spotX = padding + ((spot - minStrike) / strikeRange) * chartW;

      var svg = '<svg width="' + width + '" height="' + (height + 15) + '" style="display:block;margin:4px auto">';
      // Grid lines
      svg += '<line x1="' + padding + '" y1="10" x2="' + padding + '" y2="' + (10 + chartH) + '" stroke="var(--border)" stroke-width="0.5"/>';
      svg += '<line x1="' + padding + '" y1="' + (10 + chartH) + '" x2="' + (padding + chartW) + '" y2="' + (10 + chartH) + '" stroke="var(--border)" stroke-width="0.5"/>';
      // Spot marker
      svg += '<line x1="' + spotX + '" y1="5" x2="' + spotX + '" y2="' + (10 + chartH) + '" stroke="var(--gold)" stroke-width="1" stroke-dasharray="3,2" opacity="0.6"/>';
      svg += '<text x="' + spotX + '" y="' + (height + 10) + '" fill="var(--gold)" font-size="7" font-family="IBM Plex Mono,monospace" text-anchor="middle">$' + spot.toFixed(0) + ' SPOT</text>';
      // Put IV line
      if (putPoints.length > 1) svg += '<polyline points="' + putPoints.join(' ') + '" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.8"/>';
      // Call IV line
      if (callPoints.length > 1) svg += '<polyline points="' + callPoints.join(' ') + '" fill="none" stroke="var(--green)" stroke-width="1.5" opacity="0.8"/>';
      // Labels
      svg += '<text x="' + padding + '" y="8" fill="var(--muted)" font-size="7" font-family="IBM Plex Mono,monospace">' + (maxIV * 100).toFixed(0) + '%</text>';
      svg += '<text x="' + padding + '" y="' + (10 + chartH + 4) + '" fill="var(--muted)" font-size="7" font-family="IBM Plex Mono,monospace">' + (minIV * 100).toFixed(0) + '%</text>';
      // Legend
      svg += '<rect x="' + (width - 85) + '" y="2" width="8" height="3" fill="var(--accent)"/>';
      svg += '<text x="' + (width - 74) + '" y="6" fill="var(--accent)" font-size="7" font-family="IBM Plex Mono,monospace">Put IV</text>';
      svg += '<rect x="' + (width - 85) + '" y="11" width="8" height="3" fill="var(--green)"/>';
      svg += '<text x="' + (width - 74) + '" y="15" fill="var(--green)" font-size="7" font-family="IBM Plex Mono,monospace">Call IV</text>';
      svg += '</svg>';

      // Skew interpretation
      var avgPutIV = puts.length > 0 ? puts.reduce(function(s, p) { return s + p.impliedVolatility; }, 0) / puts.length : 0;
      var avgCallIV = calls.length > 0 ? calls.reduce(function(s, c) { return s + c.impliedVolatility; }, 0) / calls.length : 0;
      var skewPct = avgPutIV > 0 ? ((avgPutIV - avgCallIV) / avgPutIV * 100).toFixed(1) : '0';
      var skewDir = avgPutIV > avgCallIV ? 'Put skew (downside fear)' : 'Call skew (upside demand)';
      var skewColor = avgPutIV > avgCallIV ? 'var(--accent)' : 'var(--green)';

      var html = svg;
      html += '<div style="display:flex;justify-content:space-between;font-family:IBM Plex Mono,monospace;font-size:9px;color:var(--muted);margin-top:4px">';
      html += '<span>Avg Put IV: <strong style="color:var(--accent)">' + (avgPutIV * 100).toFixed(1) + '%</strong></span>';
      html += '<span>Avg Call IV: <strong style="color:var(--green)">' + (avgCallIV * 100).toFixed(1) + '%</strong></span>';
      html += '<span style="color:' + skewColor + '">' + skewDir + '</span>';
      html += '</div>';

      container.innerHTML = html;
      var label = container.parentElement.querySelector('.sec-label');
      if (label) label.innerHTML = '<span style="display:flex;align-items:center;gap:6px;flex:1"><span class="lp-dot"></span> IV Skew — Volatility by Strike</span><span class="src" style="margin-left:auto">LIVE</span>';
    } catch (e) {
      container.innerHTML = '<div class="note">IV Skew: ' + e.message + '</div>';
    }
  }

  // ═══════ HISTORICAL ANALOG OVERLAYS ═══════
  function renderHistoricalAnalogs() {
    var container = document.getElementById('historical-analogs');
    if (!container) return;

    // Historical price paths (normalized to 100 at t=0, showing % change over days)
    var analogs = [
      {
        name: '1990 Kuwait Invasion',
        color: 'var(--accent)',
        // Oil went from ~$21 to ~$46 in 2 months, then back to $20 in 6 months
        path: [0,5,12,22,35,48,62,75,88,95,105,110,108,100,92,80,65,50,35,20,10,5,0,-5],
        duration: '6 months',
        peak: '+130%',
        note: 'Sharp spike on invasion, rapid reversal after coalition formed'
      },
      {
        name: '2019 Abqaiq Attack',
        color: 'var(--gold)',
        // Oil spiked 15% overnight, gave back most in 2 weeks
        path: [0,2,15,14,12,10,8,6,4,3,2,1,0,-1,-2,-1,0,1,0,-1],
        duration: '3 weeks',
        peak: '+15%',
        note: 'Gap up, rapid mean reversion — quick Saudi repair'
      },
      {
        name: '2022 Russia-Ukraine',
        color: 'var(--teal)',
        // Gradual grind from $80 to $130 over 2 months, then slow decline
        path: [0,3,8,12,18,25,30,38,45,52,58,60,55,48,42,35,28,22,18,15,12,10,8,5],
        duration: '6 months',
        peak: '+60%',
        note: 'Grinding rally on sanctions + supply fears, then demand destruction'
      },
      {
        name: '2023 Houthi Red Sea',
        color: 'var(--purple)',
        // Oil was muted (+5%), but freight spiked +300%
        path: [0,1,3,5,4,3,5,6,5,4,3,5,4,3,2,1,0,-1,0,1],
        duration: '4 months',
        peak: '+5% oil / +300% freight',
        note: 'Oil muted (rerouting worked), freight exploded'
      }
    ];

    // Build SVG overlay chart
    var width = 280;
    var height = 110;
    var padding = 30;
    var chartW = width - padding - 10;
    var chartH = height - 25;

    var svg = '<svg width="' + width + '" height="' + height + '" style="display:block;margin:4px auto">';
    // Grid
    svg += '<line x1="' + padding + '" y1="5" x2="' + padding + '" y2="' + (5 + chartH) + '" stroke="var(--border)" stroke-width="0.5"/>';
    svg += '<line x1="' + padding + '" y1="' + (5 + chartH) + '" x2="' + (padding + chartW) + '" y2="' + (5 + chartH) + '" stroke="var(--border)" stroke-width="0.5"/>';
    // Zero line
    var zeroY = 5 + chartH * 0.5;
    svg += '<line x1="' + padding + '" y1="' + zeroY + '" x2="' + (padding + chartW) + '" y2="' + zeroY + '" stroke="var(--muted)" stroke-width="0.5" stroke-dasharray="3,3" opacity="0.3"/>';
    // Labels
    svg += '<text x="2" y="10" fill="var(--muted)" font-size="7" font-family="IBM Plex Mono,monospace">+110%</text>';
    svg += '<text x="2" y="' + (zeroY + 3) + '" fill="var(--muted)" font-size="7" font-family="IBM Plex Mono,monospace">0%</text>';
    svg += '<text x="' + padding + '" y="' + (height - 2) + '" fill="var(--muted)" font-size="7" font-family="IBM Plex Mono,monospace">Day 0</text>';
    svg += '<text x="' + (padding + chartW - 20) + '" y="' + (height - 2) + '" fill="var(--muted)" font-size="7" font-family="IBM Plex Mono,monospace">+6mo</text>';

    // Draw each analog
    analogs.forEach(function(a) {
      var maxVal = 110;
      var minVal = -10;
      var valRange = maxVal - minVal;
      var points = a.path.map(function(v, i) {
        var x = padding + (i / (a.path.length - 1)) * chartW;
        var y = 5 + chartH - ((v - minVal) / valRange) * chartH;
        return x + ',' + y;
      }).join(' ');
      svg += '<polyline points="' + points + '" fill="none" stroke="' + a.color + '" stroke-width="1.5" opacity="0.7"/>';
    });

    // "NOW" marker (day 0 area)
    svg += '<circle cx="' + padding + '" cy="' + zeroY + '" r="3" fill="var(--white)" stroke="var(--gold)" stroke-width="1"/>';
    svg += '<text x="' + (padding + 6) + '" y="' + (zeroY + 3) + '" fill="var(--gold)" font-size="7" font-family="IBM Plex Mono,monospace">NOW</text>';

    svg += '</svg>';

    // Legend
    var legend = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:4px">';
    analogs.forEach(function(a) {
      legend += '<div style="display:flex;align-items:center;gap:5px;font-family:IBM Plex Mono,monospace;font-size:8px">';
      legend += '<div style="width:12px;height:3px;background:' + a.color + ';border-radius:1px;flex-shrink:0"></div>';
      legend += '<span style="color:' + a.color + '">' + a.name + ' (' + a.peak + ')</span>';
      legend += '</div>';
    });
    legend += '</div>';

    // Key takeaway
    var takeaway = '<div class="callout-box callout-gold" style="margin-top:6px"><div style="font-size:9px;color:var(--text);line-height:1.4">'
      + '<strong style="color:var(--gold)">Pattern:</strong> Hormuz events most resemble 1990 (supply disruption) or 2022 (sanctions). '
      + 'Quick resolution → Abqaiq path (spike + revert). Extended conflict → Kuwait/Ukraine path (grind + overshoot).'
      + '</div></div>';

    container.innerHTML = svg + legend + takeaway;
  }

  // ═══════ WTI 12-MONTH PRICE HISTORY CHART ═══════
  async function loadPriceHistory() {
    const container = document.getElementById('price-history-chart');
    if (!container) return;

    try {
      const res = await fetchTimeout('/api/history', 12000);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (!data || !data.length) throw new Error('No data');

      // Chart dimensions
      const W = 600, H = 180;
      const pad = { top: 16, right: 12, bottom: 28, left: 42 };
      const cw = W - pad.left - pad.right;
      const ch = H - pad.top - pad.bottom;

      const closes = data.map(d => d.close);
      const minP = Math.floor(Math.min(...closes) / 2) * 2 - 2;
      const maxP = Math.ceil(Math.max(...closes) / 2) * 2 + 2;
      const priceRange = maxP - minP;

      // Scale functions
      const sx = i => pad.left + (i / (data.length - 1)) * cw;
      const sy = p => pad.top + ch - ((p - minP) / priceRange) * ch;

      // Build line path
      let linePath = '';
      let areaPath = `M${sx(0)},${sy(closes[0])}`;
      for (let i = 0; i < data.length; i++) {
        const cmd = i === 0 ? 'M' : 'L';
        linePath += `${cmd}${sx(i).toFixed(1)},${sy(closes[i]).toFixed(1)}`;
        areaPath += `${i === 0 ? '' : 'L'}${sx(i).toFixed(1)},${sy(closes[i]).toFixed(1)}`;
      }
      areaPath += `L${sx(data.length - 1).toFixed(1)},${(pad.top + ch).toFixed(1)}L${sx(0).toFixed(1)},${(pad.top + ch).toFixed(1)}Z`;

      // Y-axis grid lines + labels
      const yTicks = 5;
      let gridSvg = '';
      for (let i = 0; i <= yTicks; i++) {
        const price = minP + (priceRange * i / yTicks);
        const y = sy(price);
        gridSvg += `<line x1="${pad.left}" y1="${y.toFixed(1)}" x2="${W - pad.right}" y2="${y.toFixed(1)}" stroke="#1b2133" stroke-width="0.5"/>`;
        gridSvg += `<text x="${pad.left - 4}" y="${(y + 3).toFixed(1)}" text-anchor="end" fill="#5a6278" font-size="7" font-family="'IBM Plex Mono',monospace">$${Math.round(price)}</text>`;
      }

      // X-axis month labels
      let xLabels = '';
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      let lastMonth = -1;
      for (let i = 0; i < data.length; i++) {
        const d = new Date(data[i].date + 'T00:00:00');
        const m = d.getMonth();
        if (m !== lastMonth) {
          lastMonth = m;
          const label = months[m] + (m === 0 ? ' ' + d.getFullYear().toString().slice(2) : '');
          xLabels += `<text x="${sx(i).toFixed(1)}" y="${(H - 4).toFixed(1)}" text-anchor="middle" fill="#5a6278" font-size="7" font-family="'IBM Plex Mono',monospace">${label}</text>`;
        }
      }

      // Event annotations
      const events = [
        { date: '2025-04-01', label: 'OPEC+ cuts extended' },
        { date: '2025-06-15', label: 'Iran nuclear talks collapse' },
        { date: '2025-09-19', label: 'Abqaiq-style attack' },
        { date: '2025-10-01', label: 'China stimulus' },
        { date: '2025-12-15', label: 'Fed rate cut' },
        { date: '2026-01-15', label: 'Iran-US tensions escalate' },
        { date: '2026-02-20', label: 'Hormuz incidents begin' },
        { date: '2026-03-05', label: 'US strikes Iran' },
      ];

      let annotSvg = '';
      const dateIndex = {};
      data.forEach((d, i) => { dateIndex[d.date] = i; });

      events.forEach((evt, ei) => {
        const idx = dateIndex[evt.date];
        if (idx == null) {
          // Find closest date
          let closest = -1, minDiff = Infinity;
          const evtTime = new Date(evt.date + 'T00:00:00').getTime();
          data.forEach((d, i) => {
            const diff = Math.abs(new Date(d.date + 'T00:00:00').getTime() - evtTime);
            if (diff < minDiff) { minDiff = diff; closest = i; }
          });
          if (closest < 0) return;
          const x = sx(closest);
          const yTop = pad.top;
          const yBot = pad.top + ch;
          // Stagger label heights to avoid overlap
          const labelY = pad.top + 6 + (ei % 3) * 9;
          annotSvg += `<line x1="${x.toFixed(1)}" y1="${yTop}" x2="${x.toFixed(1)}" y2="${yBot}" stroke="#5a6278" stroke-width="0.5" stroke-dasharray="3,2" opacity="0.6"/>`;
          annotSvg += `<text x="${(x + 2).toFixed(1)}" y="${labelY.toFixed(1)}" fill="#e63946" font-size="6.5" font-family="'IBM Plex Mono',monospace" opacity="0.85">${evt.label}</text>`;
        } else {
          const x = sx(idx);
          const yTop = pad.top;
          const yBot = pad.top + ch;
          const labelY = pad.top + 6 + (ei % 3) * 9;
          annotSvg += `<line x1="${x.toFixed(1)}" y1="${yTop}" x2="${x.toFixed(1)}" y2="${yBot}" stroke="#5a6278" stroke-width="0.5" stroke-dasharray="3,2" opacity="0.6"/>`;
          annotSvg += `<text x="${(x + 2).toFixed(1)}" y="${labelY.toFixed(1)}" fill="#e63946" font-size="6.5" font-family="'IBM Plex Mono',monospace" opacity="0.85">${evt.label}</text>`;
        }
      });

      // Current price indicator
      const lastClose = closes[closes.length - 1];
      const lastX = sx(data.length - 1);
      const lastY = sy(lastClose);
      const priceDot = `<circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="3" fill="#f4a261" opacity="0.9"/>`;
      const priceLabel = `<text x="${(lastX - 4).toFixed(1)}" y="${(lastY - 6).toFixed(1)}" text-anchor="end" fill="#f4a261" font-size="8" font-weight="600" font-family="'IBM Plex Mono',monospace">$${lastClose.toFixed(2)}</text>`;

      // Hover tooltip overlay (invisible rects that show tooltip on hover)
      let hoverRects = '';
      const segW = cw / data.length;
      for (let i = 0; i < data.length; i++) {
        hoverRects += `<rect x="${(sx(i) - segW / 2).toFixed(1)}" y="${pad.top}" width="${segW.toFixed(1)}" height="${ch}" fill="transparent" data-idx="${i}" class="ph-hover"/>`;
      }

      const svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block;background:var(--panel);border-radius:4px;overflow:visible" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="phGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f4a261" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#f4a261" stop-opacity="0.02"/>
    </linearGradient>
  </defs>
  ${gridSvg}
  ${xLabels}
  <path d="${areaPath}" fill="url(#phGrad)"/>
  <path d="${linePath}" fill="none" stroke="#f4a261" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
  ${annotSvg}
  ${priceDot}
  ${priceLabel}
  ${hoverRects}
  <g id="ph-tooltip" style="display:none">
    <line id="ph-tt-line" y1="${pad.top}" y2="${pad.top + ch}" stroke="#eef0f7" stroke-width="0.5" opacity="0.4"/>
    <circle id="ph-tt-dot" r="2.5" fill="#f4a261"/>
    <rect id="ph-tt-bg" rx="2" ry="2" fill="#0d0f18" stroke="#1b2133" stroke-width="0.5"/>
    <text id="ph-tt-text" fill="#eef0f7" font-size="7" font-family="'IBM Plex Mono',monospace"/>
  </g>
</svg>`;

      // Stats row
      const first = closes[0], last = closes[closes.length - 1];
      const chg = last - first;
      const chgPct = ((chg / first) * 100).toFixed(1);
      const hi = Math.max(...closes).toFixed(2);
      const lo = Math.min(...closes).toFixed(2);
      const chgColor = chg >= 0 ? 'var(--green)' : 'var(--accent)';
      const arrow = chg >= 0 ? '▲' : '▼';

      const stats = `<div style="display:flex;gap:12px;margin-top:6px;font-family:'IBM Plex Mono',monospace;font-size:7.5px;color:var(--muted);flex-wrap:wrap">
  <span>12M Change: <strong style="color:${chgColor}">${arrow} ${chg >= 0 ? '+' : ''}${chg.toFixed(2)} (${chg >= 0 ? '+' : ''}${chgPct}%)</strong></span>
  <span>High: <strong style="color:var(--white)">$${hi}</strong></span>
  <span>Low: <strong style="color:var(--white)">$${lo}</strong></span>
  <span>Last: <strong style="color:var(--gold)">$${last.toFixed(2)}</strong></span>
</div>`;

      container.innerHTML = svg + stats;

      // Attach hover events
      const svgEl = container.querySelector('svg');
      const tooltip = svgEl.querySelector('#ph-tooltip');
      const ttLine = svgEl.querySelector('#ph-tt-line');
      const ttDot = svgEl.querySelector('#ph-tt-dot');
      const ttBg = svgEl.querySelector('#ph-tt-bg');
      const ttText = svgEl.querySelector('#ph-tt-text');

      container.querySelectorAll('.ph-hover').forEach(rect => {
        rect.addEventListener('mouseenter', function () {
          const i = +this.getAttribute('data-idx');
          const x = sx(i);
          const y = sy(closes[i]);
          const label = data[i].date + '  $' + closes[i].toFixed(2);
          tooltip.style.display = '';
          ttLine.setAttribute('x1', x.toFixed(1));
          ttLine.setAttribute('x2', x.toFixed(1));
          ttDot.setAttribute('cx', x.toFixed(1));
          ttDot.setAttribute('cy', y.toFixed(1));
          ttText.textContent = label;
          const tw = label.length * 4.2 + 8;
          const tx = Math.min(x - tw / 2, W - pad.right - tw);
          const txClamped = Math.max(pad.left, tx);
          ttBg.setAttribute('x', txClamped.toFixed(1));
          ttBg.setAttribute('y', (pad.top - 14).toFixed(1));
          ttBg.setAttribute('width', tw.toFixed(1));
          ttBg.setAttribute('height', '12');
          ttText.setAttribute('x', (txClamped + 4).toFixed(1));
          ttText.setAttribute('y', (pad.top - 5).toFixed(1));
        });
        rect.addEventListener('mouseleave', function () {
          tooltip.style.display = 'none';
        });
      });

    } catch (e) {
      container.innerHTML = '<div class="note" style="color:var(--accent)">Price history unavailable</div>';
    }
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

    // Live data: Options chain
    setTimeout(loadOptions, 2500);
    setInterval(loadOptions, 2 * 60000);

    // Live data: EIA inventories (weekly, refresh hourly)
    setTimeout(loadEIA, 3000);
    setInterval(loadEIA, 60 * 60000);

    // Live data: CFTC positioning (weekly, refresh hourly)
    setTimeout(loadCFTC, 3500);
    setInterval(loadCFTC, 60 * 60000);

    // Live data: Swarm (real Claude API calls — expensive, run every 30 min)
    setTimeout(loadSwarm, 3000);
    setInterval(loadSwarm, 30 * 60000);

    // Live data: NASA FIRMS fires (overwrites simulated)
    setTimeout(loadFIRMSFires, 3500);
    setInterval(loadFIRMSFires, 15 * 60000);

    // Live data: SPR levels
    setTimeout(loadSPR, 4000);
    setInterval(loadSPR, 60 * 60000);

    // Live data: Crack spreads
    setTimeout(loadCrackSpreads, 4500);
    setInterval(loadCrackSpreads, 60000);

    // IV Skew chart (derived from options)
    setTimeout(loadIVSkew, 5000);
    setInterval(loadIVSkew, 2 * 60000);

    // Live data: WTI 12-month price history
    setTimeout(loadPriceHistory, 5500);
    setInterval(loadPriceHistory, 60 * 60000);

    // Historical analogs (static, render once)
    renderHistoricalAnalogs();
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
