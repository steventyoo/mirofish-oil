// ═══════════════════════════════════════════════════════
// MiroFish Oil — data.js
// All mock data, constants, and configuration
// ═══════════════════════════════════════════════════════

// ── COMMODITIES (ticker tape) ──
const COMMODITIES = [
  { symbol: 'WTI CL1', price: 78.42, change: +1.87, pct: +2.44 },
  { symbol: 'BRENT CO1', price: 82.15, change: +1.63, pct: +2.02 },
  { symbol: 'TTF GAS', price: 34.80, change: -0.42, pct: -1.19 },
  { symbol: 'DXY', price: 104.32, change: -0.18, pct: -0.17 },
  { symbol: 'SPX', price: 5842.5, change: -28.3, pct: -0.48 },
  { symbol: 'VIX', price: 18.72, change: +1.45, pct: +8.39 },
  { symbol: 'US10Y', price: 4.38, change: +0.04, pct: +0.92 },
  { symbol: 'GOLD', price: 2985.4, change: +12.6, pct: +0.42 },
];

// ── WORLD STATE ──
const WORLD_STATE = {
  timestamp: new Date().toISOString(),
  front_month_price: 78.42,
  curve_state: 'backwardation',
  realized_vol_20d: 28.4,
  atr: 1.82,
  inventory_state: {
    crude_surprise: -2.8,
    crude_expected: -1.2,
    gasoline_surprise: 0.4,
    gasoline_expected: -0.3,
    distillate_surprise: -1.1,
    distillate_expected: -0.5,
    cushing_storage: 23.1,
  },
  positioning_state: {
    managed_money_percentile: 78,
    short_squeeze_risk: 0.32,
    crowding_score: 0.68,
    oi_change_1w: 12.4,
  },
  macro_state: {
    dxy: 104.32,
    dxy_trend: 'weakening',
    spx: 5842.5,
    spx_regime: 'risk_off',
    us10y: 4.38,
    yield_direction: 'higher',
    gold: 2985.4,
  },
  geopolitical_state: {
    hormuz_risk_score: 0.68,
    opec_tone: 'supportive',
    shipping_incidents_7d: 4,
    spr_release_probability: 0.25,
  },
  options_state: {
    iv_rank: 38,
    iv_vs_realized: -0.22,
  },
};

// ── REGIME CLASSIFICATION ──
const REGIME = {
  current: 'EVENT_RISK',
  confidence: 0.72,
  probabilities: [
    { label: 'Event Risk',   pct: 34, color: 'var(--accent)' },
    { label: 'HV Breakout',  pct: 22, color: 'var(--warn)' },
    { label: 'Bullish',      pct: 18, color: 'var(--green)' },
    { label: 'Rangebound',   pct: 12, color: 'var(--blue)' },
    { label: 'Bearish',      pct:  8, color: 'var(--teal)' },
    { label: 'Squeeze',      pct:  6, color: 'var(--purple)' },
  ],
};

// ── SCENARIOS ──
const SCENARIOS = [
  {
    name: 'Hormuz Partial Disruption',
    probability: 0.18,
    price_low: 88, price_mid: 96, price_high: 108,
    vol_effect: 'strong_up', horizon: '2w',
    css: 'ps-high', color: 'var(--accent)',
    note: 'Vol: strong_up · Horizon: 2w · Front-end tightness',
  },
  {
    name: 'Hormuz Full Blockade',
    probability: 0.05,
    price_low: 105, price_mid: 125, price_high: 150,
    vol_effect: 'extreme', horizon: '1m',
    css: 'ps-ext', color: '#ff4444',
    note: 'Vol: extreme · Horizon: 1m · Demand destruction onset >$130',
  },
  {
    name: 'OPEC Supportive Cut',
    probability: 0.30,
    price_low: 80, price_mid: 85, price_high: 92,
    vol_effect: 'mild_up', horizon: '1m',
    css: 'ps-mid', color: 'var(--gold)',
    note: 'Vol: mild_up · Horizon: 1m · Compliance >90%',
  },
  {
    name: 'Status Quo / Rangebound',
    probability: 0.28,
    price_low: 72, price_mid: 78, price_high: 83,
    vol_effect: 'neutral', horizon: '2w',
    css: 'ps-base', color: 'var(--blue)',
    note: 'Vol: neutral · Horizon: 2w · No catalyst',
  },
  {
    name: 'Demand Shock / Risk-Off',
    probability: 0.12,
    price_low: 62, price_mid: 68, price_high: 74,
    vol_effect: 'up', horizon: '1m',
    css: 'ps-low', color: 'var(--teal)',
    note: 'Vol: up · Horizon: 1m · China PMI miss / recession fear',
  },
  {
    name: 'Rapid De-escalation',
    probability: 0.07,
    price_low: 70, price_mid: 74, price_high: 78,
    vol_effect: 'down', horizon: '1w',
    css: 'ps-base', color: 'var(--muted)',
    note: 'Vol: down · Horizon: 1w · Diplomatic resolution',
  },
];

// ── EXPECTED VALUE ENGINE ──
const EV_ENGINE = {
  fair_value: 84.92,
  market_price: 78.42,
  edge_pct: 8.29,
  asymmetry_ratio: 1.42,
};

// ── SIGNAL ──
const SIGNAL = {
  action: 'BUY CALLS',
  fair_value: 84.92,
  market_price: 78.42,
  edge_pct: 8.3,
  confidence: 68,
  horizon: '1 Week',
  vol_expansion_prob: 71,
  regime: 'event_risk',
  bullish_prob: 64,
  reasons: [
    'Market underpricing Hormuz scenario risk by ~$6.50',
    'IV rank 38th pctl — cheap relative to scenario uncertainty',
    'Swarm consensus bullish (64%) with moderate dispersion',
    'Physical oil tightness confirms supply-side thesis',
  ],
  trade: {
    type: 'OTM Call Option',
    ticker: 'CL',
    tenor: '30d',
    strike: '10-15 delta OTM',
    entry: 'On pullback or headline catalyst',
    stop: 'Premium loss cap 35%',
    take_profit: 'Scale at 1.5x / 2.5x premium',
    sizing: 'Risk 50bps NAV',
    playbook: 'Hormuz Tail Risk',
  },
};

// ── SWARM AGENTS ──
const AGENTS = [
  {
    name: 'OPEC Minister', role: 'Supply Policy',
    direction: 'bullish', confidence: 0.74, expr: 'long_futures',
    drivers: ['Production cuts holding firm', 'Saudi spare capacity limited', 'Compliance above 90%'],
  },
  {
    name: 'Macro Hedge Fund PM', role: 'Cross-Asset',
    direction: 'bullish', confidence: 0.68, expr: 'buy_calls',
    drivers: ['Market underpricing disruption risk', 'Short gamma in front-month options', 'Crowded short positioning'],
  },
  {
    name: 'Geopol Intel Analyst', role: 'Geopolitical Risk',
    direction: 'bullish', confidence: 0.81, expr: 'buy_calls',
    drivers: ['Hormuz shipping incidents rising', 'Military posturing escalating', 'Insurance premiums spiking'],
  },
  {
    name: 'CTA Trend Follower', role: 'Systematic',
    direction: 'neutral', confidence: 0.52, expr: 'no_trade',
    drivers: ['No clear trend breakout yet', 'Momentum signals mixed', 'Waiting for confirmation'],
  },
  {
    name: 'Oil Options Trader', role: 'Volatility',
    direction: 'bullish', confidence: 0.76, expr: 'buy_straddle',
    drivers: ['IV rank at 38th pctl — cheap', 'Scenario-implied vol >> market vol', 'Skew favoring calls'],
  },
  {
    name: 'Physical Oil Trader', role: 'Physical Flows',
    direction: 'bullish', confidence: 0.65, expr: 'long_futures',
    drivers: ['Physical premiums widening', 'Cushing draws accelerating', 'Export demand strong'],
  },
  {
    name: 'Chinese Demand Planner', role: 'Demand Side',
    direction: 'neutral', confidence: 0.55, expr: 'no_trade',
    drivers: ['Refinery margins compressing', 'Strategic reserves near capacity', 'PMI stabilizing not recovering'],
  },
  {
    name: 'Tanker Operator', role: 'Shipping / Logistics',
    direction: 'bullish', confidence: 0.79, expr: 'calendar_spread',
    drivers: ['Rerouting adding 12 days transit', 'War risk premiums doubling', 'Vessel bunching at chokepoints'],
  },
];

// ── SWARM CONSENSUS ──
const CONSENSUS = {
  bullish_prob: 64,
  bearish_prob: 14,
  neutral_prob: 22,
  vol_expansion_prob: 71,
  disruption_prob: 42,
  disagreement_score: 0.31,
  top_drivers: [
    'Hormuz disruption risk underpriced',
    'IV too cheap for scenario uncertainty',
    'Physical tightness signals',
  ],
  top_disagreement: [
    'Demand outlook divergence (China)',
    'Trend signal timing',
  ],
};

// ── NEWS FEED ──
const NEWS = [
  { src: 'Reuters',      cls: 's-reuters',    title: 'Iranian IRGC naval exercises expand near Strait of Hormuz',                  time: '12m ago',  severity: 'high' },
  { src: 'Bloomberg',    cls: 's-bloomberg',   title: 'Oil tanker insurance premiums surge to 18-month high',                        time: '28m ago',  severity: 'high' },
  { src: 'S&P Platts',   cls: 's-platts',     title: 'Cushing crude inventories draw 2.8M bbl vs 1.2M expected',                    time: '1h ago',   severity: 'medium' },
  { src: 'Al Jazeera',   cls: 's-aljazeera',  title: 'US 5th Fleet increases patrol frequency in Persian Gulf',                     time: '2h ago',   severity: 'high' },
  { src: 'EIA',          cls: 's-eia',         title: 'Weekly petroleum status report shows continued draws',                        time: '3h ago',   severity: 'medium' },
  { src: 'OPEC',         cls: 's-opec',        title: 'Saudi Arabia signals willingness to extend voluntary cuts',                   time: '5h ago',   severity: 'medium' },
  { src: 'FT',           cls: 's-ft',          title: 'China crude imports flat as refinery margins compress',                       time: '6h ago',   severity: 'low' },
  { src: "Lloyd's List",  cls: 's-lloyds',     title: 'Three tankers rerouted via Cape of Good Hope this week',                     time: '8h ago',   severity: 'medium' },
];

// ── HISTORICAL PRECEDENTS ──
const PRECEDENTS = [
  { year: '1973', event: 'Arab Oil Embargo',    impact: '+300%',       detail: '$3→$12/bbl · Reshaped global energy policy',               color: 'var(--accent)' },
  { year: '1990', event: 'Kuwait Invasion',      impact: '+130%',       detail: '$21→$46 · 4.3M b/d offline · SPR released',                color: 'var(--accent)' },
  { year: '2019', event: 'Abqaiq Attack',        impact: '+15%',        detail: '5.7M b/d offline · Largest single disruption',              color: 'var(--gold)' },
  { year: '2022', event: 'Russia-Ukraine',       impact: '+60%',        detail: 'Sanctions + supply fears · Brent >$120',                   color: 'var(--accent)' },
  { year: '2023', event: 'Houthi Red Sea',       impact: '+300% frt',   detail: 'Suez transits -50% · Cape reroute +10-14 days',            color: 'var(--teal)' },
];

// ── UPCOMING CATALYSTS ──
const CATALYSTS = [
  { date: 'Mar 19 · 10:30 ET', event: 'EIA Weekly Petroleum Status Report',  color: 'var(--gold)' },
  { date: 'Mar 21 · CFTC',     event: 'Commitments of Traders (COT) release', color: 'var(--teal)' },
  { date: 'Apr 3 · Vienna',    event: 'OPEC+ JMMC Meeting — Quota review',   color: 'var(--accent)' },
  { date: 'Apr 10 · Washington',event: 'IEA Monthly Oil Market Report',       color: 'var(--blue)' },
];

// ── MAP DATA ──
const MAP_CONFIG = {
  center: [26.5, 54],
  zoom: 5,
};

const MAP_BASES = [
  { lat: 25.12, lon: 51.32, name: 'Al Udeid Air Base',       country: 'US',   flag: '\u{1F1FA}\u{1F1F8}', note: 'Largest US air base in ME. CENTCOM forward HQ.' },
  { lat: 24.25, lon: 54.55, name: 'Al Dhafra Air Base',      country: 'US/UAE',flag: '\u{1F1FA}\u{1F1F8}', note: 'F-22s, F-35s deployed. ~3,500 US personnel.' },
  { lat: 26.22, lon: 50.59, name: 'NSA Bahrain / 5th Fleet', country: 'US',   flag: '\u{1F1FA}\u{1F1F8}', note: '5th Fleet HQ. Controls Gulf naval ops.' },
  { lat: 29.35, lon: 47.68, name: 'Camp Arifjan',            country: 'US',   flag: '\u{1F1FA}\u{1F1F8}', note: 'US Army Central forward HQ. ~13,000 troops.' },
  { lat: 27.18, lon: 56.28, name: 'Bandar Abbas Naval',      country: 'Iran', flag: '\u{1F1EE}\u{1F1F7}', note: 'IRIN main HQ. Controls Hormuz approach.' },
  { lat: 28.95, lon: 50.82, name: 'Bushehr Naval',           country: 'Iran', flag: '\u{1F1EE}\u{1F1F7}', note: 'IRGC Navy. Fast attack boats.' },
  { lat: 25.65, lon: 57.77, name: 'Jask Naval',              country: 'Iran', flag: '\u{1F1EE}\u{1F1F7}', note: 'Gulf of Oman access. Submarine berths.' },
  { lat: 25.29, lon: 60.64, name: 'Chabahar Naval',          country: 'Iran', flag: '\u{1F1EE}\u{1F1F7}', note: 'Indian Ocean access. Outside Persian Gulf.' },
];

const MAP_NUKES = [
  { lat: 33.72, lon: 51.73, name: 'Natanz Enrichment',  note: 'Primary enrichment · 60% U-235' },
  { lat: 34.36, lon: 51.06, name: 'Fordow (Mountain)',   note: 'Hardened underground · 60% enrichment' },
  { lat: 32.65, lon: 51.66, name: 'Isfahan UCF',         note: 'Uranium conversion facility' },
  { lat: 28.83, lon: 50.89, name: 'Bushehr NPP',        note: '1 GW nuclear power reactor' },
];

const MAP_FIRES = [
  { lat: 26.8,  lon: 56.1, brightness: 420 },
  { lat: 27.0,  lon: 55.8, brightness: 380 },
  { lat: 26.4,  lon: 56.4, brightness: 400 },
  { lat: 27.3,  lon: 56.0, brightness: 340 },
  { lat: 26.6,  lon: 55.5, brightness: 360 },
  { lat: 27.1,  lon: 56.3, brightness: 390 },
];

const MAP_TANKER_ROUTES = {
  outbound: [
    [26.6,48.5],[26.8,50.5],[26.7,52.5],[26.7,55.5],[26.5,57.2],
    [25.3,58.5],[23,60],[20,63],[16,68],[13,72],[10,76],[7,82]
  ],
  inbound: [
    [26.3,48.5],[26.5,50.5],[26.4,52.5],[26.4,55],[26.2,57],
    [25,58],[22.5,60.5],[19.5,63.5]
  ],
};

const MAP_PIPELINES = {
  saudi_ew: [[26.0,49.7],[25.2,47.8],[24.0,45.5],[23.2,42.8],[24.09,38.05]],
  uae_fujairah: [[24.35,54.4],[23.9,55.2],[23.2,56.0],[25.12,56.34]],
};

const MAP_TERMINALS = [
  { lat: 26.0, lon: 49.7,  color: '#52b788', name: 'Abqaiq Processing Hub',  tip: 'Start of E-W Pipeline · 7M b/d processing' },
  { lat: 24.09, lon: 38.05, color: '#52b788', name: 'Yanbu Terminal',          tip: 'E-W pipeline terminus · Red Sea export' },
  { lat: 25.12, lon: 56.34, color: '#2a9d8f', name: 'Fujairah Terminal',       tip: 'ADCOP terminus · Outside Hormuz' },
];

const MAP_CITIES = [
  { lat: 35.69, lon: 51.39, name: 'Tehran',      color: '#e63946', r: 6 },
  { lat: 24.69, lon: 46.72, name: 'Riyadh',      color: '#f4a261', r: 6 },
  { lat: 33.34, lon: 44.4,  name: 'Baghdad',     color: '#f4a261', r: 6 },
  { lat: 25.26, lon: 55.3,  name: 'Dubai',       color: '#2ec4b6', r: 5 },
  { lat: 24.45, lon: 54.38, name: 'Abu Dhabi',   color: '#2ec4b6', r: 5 },
  { lat: 25.29, lon: 51.53, name: 'Doha',        color: '#2ec4b6', r: 5 },
  { lat: 29.37, lon: 47.98, name: 'Kuwait City', color: '#f4a261', r: 5 },
  { lat: 26.22, lon: 50.59, name: 'Manama',      color: '#f4a261', r: 5 },
];

const MAP_REGION_LABELS = [
  { lat: 32, lon: 52,   html: `<span style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:rgba(230,57,70,.45);letter-spacing:2px">IRAN</span>` },
  { lat: 24, lon: 43.5, html: `<span style="font-family:'Bebas Neue',sans-serif;font-size:13px;color:rgba(255,255,255,.18);letter-spacing:1px">SAUDI ARABIA</span>` },
  { lat: 33, lon: 43,   html: `<span style="font-family:'Bebas Neue',sans-serif;font-size:12px;color:rgba(255,255,255,.18)">IRAQ</span>` },
  { lat: 23.5, lon: 57, html: `<span style="font-family:'Bebas Neue',sans-serif;font-size:11px;color:rgba(255,255,255,.15)">OMAN</span>` },
];

// ── YAHOO FINANCE TICKERS ──
const YF_TICKERS = [
  { sym: 'CL=F',  name: 'WTI',   elPrice: 'lp-wti-price',   elChange: 'lp-wti-change',   tickerIds: ['ticker-wti','ticker-wti2'] },
  { sym: 'BZ=F',  name: 'Brent', elPrice: 'lp-brent-price', elChange: 'lp-brent-change', tickerIds: ['ticker-brent','ticker-brent2'] },
];

// ── BYPASS INFRASTRUCTURE ──
const BYPASS_PIPES = [
  { flag: '🇸🇦', name: 'Saudi E-W Pipeline', route: 'Abqaiq → Yanbu (Red Sea)', cap: '5M b/d', status: 'Active', badge: 'b-on' },
  { flag: '🇦🇪', name: 'UAE Fujairah',       route: 'Habshan → Fujairah',        cap: '1.8M b/d', status: 'Limited', badge: 'b-lim' },
  { flag: '🇮🇷', name: 'Goreh-Jask',         route: 'Goreh → Jask',              cap: '300K b/d', status: 'Inactive', badge: 'b-off' },
];
