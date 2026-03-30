// Vercel serverless function: defense, energy, drone stock fundamentals
// Combines live prices (Yahoo v8 chart) with quarterly fundamentals (static, updated manually)
// Fundamentals only change quarterly — prices update live

// Static fundamentals from latest earnings reports (Q4 2025 / Q1 2026)
// Updated manually after each earnings season
const FUNDAMENTALS = {
  // ═══ DEFENSE CONTRACTORS ═══
  RTX:  { name: 'RTX Corporation', sector: 'defense', marketCap: 156e9, pe: 37.2, forwardPE: 22.1, ps: 2.2, evEbitda: 19.8, revenue: 71.3e9, ebitda: 10.2e9, profitMargin: 0.059, roe: 0.074, revenueGrowth: 0.078, dividendYield: 0.023, beta: 0.75, fiftyTwoWeekHigh: 213, fiftyTwoWeekLow: 101, note: 'Patriot missiles, Pratt engines' },
  LMT:  { name: 'Lockheed Martin', sector: 'defense', marketCap: 131e9, pe: 20.8, forwardPE: 18.5, ps: 1.85, evEbitda: 15.2, revenue: 71.0e9, ebitda: 10.8e9, profitMargin: 0.089, roe: 0.68, revenueGrowth: 0.055, dividendYield: 0.024, beta: 0.44, fiftyTwoWeekHigh: 618, fiftyTwoWeekLow: 410, note: 'F-35, THAAD, Javelin' },
  NOC:  { name: 'Northrop Grumman', sector: 'defense', marketCap: 74e9, pe: 18.5, forwardPE: 16.8, ps: 1.88, evEbitda: 14.1, revenue: 39.3e9, ebitda: 5.8e9, profitMargin: 0.103, roe: 0.28, revenueGrowth: 0.045, dividendYield: 0.016, beta: 0.48, fiftyTwoWeekHigh: 555, fiftyTwoWeekLow: 410, note: 'B-21 Raider, Global Hawk' },
  GD:   { name: 'General Dynamics', sector: 'defense', marketCap: 78e9, pe: 21.5, forwardPE: 18.2, ps: 1.72, evEbitda: 15.5, revenue: 45.6e9, ebitda: 6.2e9, profitMargin: 0.081, roe: 0.22, revenueGrowth: 0.073, dividendYield: 0.020, beta: 0.55, fiftyTwoWeekHigh: 315, fiftyTwoWeekLow: 250, note: 'Virginia-class subs, Abrams' },
  BA:   { name: 'Boeing', sector: 'defense', marketCap: 138e9, pe: null, forwardPE: 35.2, ps: 1.72, evEbitda: null, revenue: 77.8e9, ebitda: -0.5e9, profitMargin: -0.032, roe: null, revenueGrowth: 0.10, dividendYield: null, beta: 1.52, fiftyTwoWeekHigh: 196, fiftyTwoWeekLow: 128, note: 'F/A-18, P-8, KC-46, 737 MAX issues' },
  LHX:  { name: 'L3Harris Technologies', sector: 'defense', marketCap: 41e9, pe: 28.5, forwardPE: 16.8, ps: 2.02, evEbitda: 14.8, revenue: 21.1e9, ebitda: 3.8e9, profitMargin: 0.063, roe: 0.076, revenueGrowth: 0.098, dividendYield: 0.022, beta: 0.58, fiftyTwoWeekHigh: 260, fiftyTwoWeekLow: 195, note: 'Comms, EW, ISR systems' },
  HII:  { name: 'Huntington Ingalls', sector: 'defense', marketCap: 10e9, pe: 17.8, forwardPE: 14.5, ps: 0.85, evEbitda: 11.2, revenue: 11.5e9, ebitda: 1.1e9, profitMargin: 0.048, roe: 0.24, revenueGrowth: 0.063, dividendYield: 0.022, beta: 0.60, fiftyTwoWeekHigh: 305, fiftyTwoWeekLow: 195, note: 'Aircraft carriers, destroyers' },

  // ═══ DRONE & DRONE SENSOR STOCKS ═══
  AVAV: { name: 'AeroVironment', sector: 'drone', marketCap: 7.5e9, pe: 62.5, forwardPE: 42.0, ps: 9.5, evEbitda: 45.0, revenue: 0.75e9, ebitda: 0.12e9, profitMargin: 0.078, roe: 0.12, revenueGrowth: 0.25, dividendYield: null, beta: 0.85, fiftyTwoWeekHigh: 230, fiftyTwoWeekLow: 120, note: 'Switchblade, Puma — top US drone maker' },
  KTOS: { name: 'Kratos Defense', sector: 'drone', marketCap: 5.2e9, pe: 125, forwardPE: 55.0, ps: 4.8, evEbitda: 60.0, revenue: 1.1e9, ebitda: 0.08e9, profitMargin: 0.02, roe: 0.03, revenueGrowth: 0.15, dividendYield: null, beta: 1.15, fiftyTwoWeekHigh: 38, fiftyTwoWeekLow: 15, note: 'Valkyrie autonomous drone, target drones' },
  RKLB: { name: 'Rocket Lab USA', sector: 'drone', marketCap: 12e9, pe: null, forwardPE: null, ps: 25.0, evEbitda: null, revenue: 0.45e9, ebitda: -0.05e9, profitMargin: -0.12, roe: null, revenueGrowth: 0.55, dividendYield: null, beta: 1.85, fiftyTwoWeekHigh: 32, fiftyTwoWeekLow: 4, note: 'Satellite launch, space ISR' },
  IRDM: { name: 'Iridium Communications', sector: 'drone', marketCap: 4.0e9, pe: 15.5, forwardPE: 14.0, ps: 5.2, evEbitda: 8.5, revenue: 0.8e9, ebitda: 0.5e9, profitMargin: 0.30, roe: 0.18, revenueGrowth: 0.06, dividendYield: 0.015, beta: 0.52, fiftyTwoWeekHigh: 38, fiftyTwoWeekLow: 22, note: 'Satellite comms for drones/military' },
  FLIR: { name: 'Teledyne FLIR (TDY)', sector: 'drone', marketCap: 21e9, pe: 25.0, forwardPE: 22.0, ps: 3.5, evEbitda: 18.0, revenue: 5.7e9, ebitda: 1.3e9, profitMargin: 0.12, roe: 0.10, revenueGrowth: 0.04, dividendYield: 0.003, beta: 0.85, fiftyTwoWeekHigh: 490, fiftyTwoWeekLow: 370, note: 'FLIR sensors, marine instruments, Black Hornet' },
  PLTR: { name: 'Palantir Technologies', sector: 'drone', marketCap: 230e9, pe: 175, forwardPE: 120, ps: 35.0, evEbitda: 150, revenue: 2.9e9, ebitda: 0.55e9, profitMargin: 0.18, roe: 0.12, revenueGrowth: 0.27, dividendYield: null, beta: 2.10, fiftyTwoWeekHigh: 125, fiftyTwoWeekLow: 22, note: 'AI/ML for military targeting, ISR fusion' },
  AXON: { name: 'Axon Enterprise', sector: 'drone', marketCap: 55e9, pe: 110, forwardPE: 75, ps: 26.0, evEbitda: 85, revenue: 2.1e9, ebitda: 0.45e9, profitMargin: 0.15, roe: 0.15, revenueGrowth: 0.32, dividendYield: null, beta: 1.20, fiftyTwoWeekHigh: 700, fiftyTwoWeekLow: 250, note: 'Drone-as-first-responder, Dedrone C-UAS' },
  LDOS: { name: 'Leidos Holdings', sector: 'drone', marketCap: 20e9, pe: 20.0, forwardPE: 16.5, ps: 1.26, evEbitda: 12.5, revenue: 16.1e9, ebitda: 1.9e9, profitMargin: 0.07, roe: 0.30, revenueGrowth: 0.06, dividendYield: 0.011, beta: 0.72, fiftyTwoWeekHigh: 178, fiftyTwoWeekLow: 120, note: 'Drone C2 systems, DoD IT' },

  // ═══ PURE DRONE STOCKS ═══
  RCAT: { name: 'Red Cat Holdings', sector: 'puredrone', marketCap: 0.8e9, pe: null, forwardPE: null, ps: 80.0, evEbitda: null, revenue: 0.01e9, ebitda: -0.02e9, profitMargin: -2.5, roe: null, revenueGrowth: 1.5, dividendYield: null, beta: 2.8, fiftyTwoWeekHigh: 15, fiftyTwoWeekLow: 1.5, note: 'Teal 2 FPV drone, DoD small UAS' },
  ONDS: { name: 'Ondas Holdings', sector: 'puredrone', marketCap: 0.12e9, pe: null, forwardPE: null, ps: 15.0, evEbitda: null, revenue: 0.015e9, ebitda: -0.03e9, profitMargin: -3.0, roe: null, revenueGrowth: 0.8, dividendYield: null, beta: 2.5, fiftyTwoWeekHigh: 4.5, fiftyTwoWeekLow: 0.5, note: 'Airobotics autonomous drones, BVLOS' },
  DPRO: { name: 'Draganfly', sector: 'puredrone', marketCap: 0.04e9, pe: null, forwardPE: null, ps: 8.0, evEbitda: null, revenue: 0.005e9, ebitda: -0.01e9, profitMargin: -2.0, roe: null, revenueGrowth: 0.35, dividendYield: null, beta: 2.2, fiftyTwoWeekHigh: 3.5, fiftyTwoWeekLow: 0.3, note: 'Military/public safety drones, Canada' },

  // ═══ DRONE + SPACE / DEFENSE HYBRIDS ═══
  RDW:  { name: 'Redwire Corporation', sector: 'space', marketCap: 2.8e9, pe: null, forwardPE: null, ps: 8.5, evEbitda: null, revenue: 0.32e9, ebitda: -0.01e9, profitMargin: -0.03, roe: null, revenueGrowth: 0.45, dividendYield: null, beta: 2.0, fiftyTwoWeekHigh: 30, fiftyTwoWeekLow: 3, note: 'Space ISR, satellite sensors, in-orbit servicing' },

  // ═══ SENSOR / ISR / SYSTEM LAYER ═══
  ESLT: { name: 'Elbit Systems', sector: 'sensor', marketCap: 12e9, pe: 32.0, forwardPE: 25.0, ps: 1.85, evEbitda: 18.0, revenue: 6.5e9, ebitda: 0.75e9, profitMargin: 0.06, roe: 0.12, revenueGrowth: 0.12, dividendYield: 0.009, beta: 0.65, fiftyTwoWeekHigh: 310, fiftyTwoWeekLow: 185, note: 'Hermes drones, EW, battle mgmt — Israel' },

  // ═══ C-UAS / COUNTER-DRONE ═══
  AAON: { name: 'Anduril (Private)', sector: 'cuas', marketCap: 28e9, pe: null, forwardPE: null, ps: null, evEbitda: null, revenue: 0.8e9, ebitda: null, profitMargin: null, roe: null, revenueGrowth: 1.0, dividendYield: null, beta: null, fiftyTwoWeekHigh: null, fiftyTwoWeekLow: null, note: 'PRIVATE — Lattice AI, Altius drone, C-UAS' },

  // ═══ ADDITIONAL DEFENSE ═══
  BAH:  { name: 'Booz Allen Hamilton', sector: 'defense', marketCap: 10e9, pe: 13.4, forwardPE: 13.4, ps: 0.88, evEbitda: 10.2, revenue: 11.4e9, ebitda: 1.37e9, profitMargin: 0.065, roe: 0.751, revenueGrowth: 0.12, dividendYield: 0.021, beta: 0.35, fiftyTwoWeekHigh: 215, fiftyTwoWeekLow: 98, note: 'AI + Cyber + NatSec. P/E 45% below 10yr avg. Deepest value.' },
  HON:  { name: 'Honeywell', sector: 'defense', marketCap: 137e9, pe: 21.2, forwardPE: 21.2, ps: 3.66, evEbitda: 17.1, revenue: 37.4e9, ebitda: 10.4e9, profitMargin: 0.14, roe: 0.261, revenueGrowth: 0.03, dividendYield: 0.022, beta: 0.90, fiftyTwoWeekHigh: 240, fiftyTwoWeekLow: 165, note: 'Aero spinoff Form 10 filed. Pure-play comps 22-28x EV/EBITDA.' },

  // ═══ ENERGY SAFE BARRELS ═══
  EQNR: { name: 'Equinor', sector: 'energy', marketCap: 105e9, pe: 11.1, forwardPE: 11.1, ps: 0.79, evEbitda: 2.25, revenue: 105.8e9, ebitda: 37.3e9, profitMargin: 0.12, roe: 0.122, revenueGrowth: 0.08, dividendYield: 0.045, beta: -0.27, fiftyTwoWeekHigh: 38, fiftyTwoWeekLow: 20, note: 'Cheapest energy: 2.25x EV/EBITDA. Negative beta. Pure safe-haven.' },
  EGY:  { name: 'VAALCO Energy', sector: 'energy', marketCap: 0.6e9, pe: 5.5, forwardPE: 5.5, ps: 1.30, evEbitda: 2.55, revenue: 0.359e9, ebitda: 0.196e9, profitMargin: 0.22, roe: 0.077, revenueGrowth: 2.25, dividendYield: 0.067, beta: 0.93, fiftyTwoWeekHigh: 12, fiftyTwoWeekLow: 3.5, note: 'Africa upstream. 2.55x EV/EBITDA. 225% production growth. High risk/reward.' },

  // ═══ TANKERS / SHIPPING / FERTILIZER ═══
  FRO:  { name: 'Frontline', sector: 'shipping', marketCap: 6.9e9, pe: 6.8, forwardPE: 6.8, ps: 3.90, evEbitda: 15.5, revenue: 1.77e9, ebitda: 0.66e9, profitMargin: 0.14, roe: 0.093, revenueGrowth: 0.45, dividendYield: 0.081, beta: 0.05, fiftyTwoWeekHigh: 35, fiftyTwoWeekLow: 12, note: '41 VLCCs. Day rates >$200K. +136% YTD. Binary on Hormuz.' },
  FLNG: { name: 'FLEX LNG', sector: 'shipping', marketCap: 1.6e9, pe: 11.6, forwardPE: 11.6, ps: 4.60, evEbitda: 10.75, revenue: 0.348e9, ebitda: 0.242e9, profitMargin: 0.30, roe: 0.127, revenueGrowth: 0.12, dividendYield: 0.103, beta: 0.45, fiftyTwoWeekHigh: 32, fiftyTwoWeekLow: 18, note: '53-74yr contract backlog. 10.3% div yield. Most durable cash flow in shipping.' },
  CF:   { name: 'CF Industries', sector: 'shipping', marketCap: 18e9, pe: 11.4, forwardPE: 11.4, ps: 2.67, evEbitda: 5.38, revenue: 6.74e9, ebitda: 3.53e9, profitMargin: 0.28, roe: 0.22, revenueGrowth: 0.08, dividendYield: 0.016, beta: 0.69, fiftyTwoWeekHigh: 110, fiftyTwoWeekLow: 60, note: 'US fertilizer. 10.5% FCF yield. Gulf blockade = structural repricing. Best ROIC.' },

  // ═══ WATER SECURITY ═══
  XYL:  { name: 'Xylem', sector: 'water', marketCap: 29e9, pe: 23.3, forwardPE: 23.3, ps: 3.0, evEbitda: 16.8, revenue: 8.5e9, ebitda: 1.85e9, profitMargin: 0.10, roe: 0.08, revenueGrowth: 0.06, dividendYield: 0.012, beta: 1.05, fiftyTwoWeekHigh: 145, fiftyTwoWeekLow: 100, note: 'Water tech leader. Desalination + treatment infra.' },
  PNR:  { name: 'Pentair', sector: 'water', marketCap: 17e9, pe: 21.5, forwardPE: 21.5, ps: 4.0, evEbitda: 17.8, revenue: 3.8e9, ebitda: 1.07e9, profitMargin: 0.16, roe: 0.22, revenueGrowth: 0.04, dividendYield: 0.011, beta: 1.10, fiftyTwoWeekHigh: 110, fiftyTwoWeekLow: 65, note: 'Filtration + water treatment. Gulf desal exposure.' },
  ERII: { name: 'Energy Recovery', sector: 'water', marketCap: 0.8e9, pe: 20.8, forwardPE: 20.8, ps: 5.0, evEbitda: 28.5, revenue: 0.16e9, ebitda: 0.028e9, profitMargin: 0.12, roe: 0.06, revenueGrowth: 0.08, dividendYield: null, beta: 0.95, fiftyTwoWeekHigh: 25, fiftyTwoWeekLow: 12, note: 'Desal pressure exchangers. Pure-play water-energy nexus.' },
  VEOEY:{ name: 'Veolia', sector: 'water', marketCap: 22e9, pe: 14.5, forwardPE: 14.5, ps: 0.45, evEbitda: 8.2, revenue: 48e9, ebitda: 5.85e9, profitMargin: 0.04, roe: 0.08, revenueGrowth: 0.03, dividendYield: 0.035, beta: 0.70, fiftyTwoWeekHigh: 38, fiftyTwoWeekLow: 25, note: 'Global water + waste. Largest water utility worldwide.' },
  AWK:  { name: 'American Water Works', sector: 'water', marketCap: 28e9, pe: 26.0, forwardPE: 26.0, ps: 6.0, evEbitda: 21.0, revenue: 4.2e9, ebitda: 2.0e9, profitMargin: 0.24, roe: 0.10, revenueGrowth: 0.07, dividendYield: 0.022, beta: 0.55, fiftyTwoWeekHigh: 155, fiftyTwoWeekLow: 115, note: 'US regulated water utility. Defensive + inflation hedge.' },

  // ═══ FOOD SECURITY ═══
  NTR:  { name: 'Nutrien', sector: 'food', marketCap: 31e9, pe: 15.7, forwardPE: 15.7, ps: 1.0, evEbitda: 8.81, revenue: 25e9, ebitda: 4.8e9, profitMargin: 0.08, roe: 0.07, revenueGrowth: 0.02, dividendYield: 0.038, beta: 0.85, fiftyTwoWeekHigh: 65, fiftyTwoWeekLow: 40, note: 'Potash + nitrogen. Largest crop input company. War = fertilizer shortage.' },
  BG:   { name: 'Bunge Global', sector: 'food', marketCap: 14e9, pe: 12.0, forwardPE: 12.0, ps: 0.25, evEbitda: 9.5, revenue: 53e9, ebitda: 2.0e9, profitMargin: 0.03, roe: 0.12, revenueGrowth: -0.05, dividendYield: 0.025, beta: 0.50, fiftyTwoWeekHigh: 115, fiftyTwoWeekLow: 75, note: 'Grain merchant. Trade route disruption = margin expansion.' },
  CTVA: { name: 'Corteva', sector: 'food', marketCap: 47e9, pe: 20.5, forwardPE: 20.5, ps: 2.6, evEbitda: 13.0, revenue: 17e9, ebitda: 3.77e9, profitMargin: 0.12, roe: 0.10, revenueGrowth: 0.03, dividendYield: 0.011, beta: 0.75, fiftyTwoWeekHigh: 65, fiftyTwoWeekLow: 45, note: 'Seeds + crop protection. Pricing power in food crisis.' },
  ADM:  { name: 'Archer-Daniels-Midland', sector: 'food', marketCap: 19e9, pe: 11.5, forwardPE: 11.5, ps: 0.22, evEbitda: 7.8, revenue: 85e9, ebitda: 3.1e9, profitMargin: 0.02, roe: 0.08, revenueGrowth: -0.08, dividendYield: 0.035, beta: 0.65, fiftyTwoWeekHigh: 60, fiftyTwoWeekLow: 38, note: 'Grain processing + logistics. Trade disruption beneficiary.' },

  // ═══ ENERGY MAJORS ═══
  XOM:  { name: 'Exxon Mobil', sector: 'energy', marketCap: 465e9, pe: 14.2, forwardPE: 13.5, ps: 1.30, evEbitda: 6.5, revenue: 340e9, ebitda: 62e9, profitMargin: 0.098, roe: 0.18, revenueGrowth: -0.02, dividendYield: 0.034, beta: 0.80, fiftyTwoWeekHigh: 126, fiftyTwoWeekLow: 95, note: 'Largest US oil major' },
  CVX:  { name: 'Chevron', sector: 'energy', marketCap: 280e9, pe: 15.5, forwardPE: 13.8, ps: 1.38, evEbitda: 6.8, revenue: 196e9, ebitda: 45e9, profitMargin: 0.098, roe: 0.13, revenueGrowth: -0.04, dividendYield: 0.042, beta: 0.85, fiftyTwoWeekHigh: 167, fiftyTwoWeekLow: 135, note: 'Integrated major, Permian + Guyana' },
  COP:  { name: 'ConocoPhillips', sector: 'energy', marketCap: 135e9, pe: 12.8, forwardPE: 11.5, ps: 2.35, evEbitda: 5.5, revenue: 58e9, ebitda: 26e9, profitMargin: 0.18, roe: 0.22, revenueGrowth: 0.05, dividendYield: 0.032, beta: 0.95, fiftyTwoWeekHigh: 130, fiftyTwoWeekLow: 92, note: 'Pure-play E&P, low-cost Permian' },
  OXY:  { name: 'Occidental Petroleum', sector: 'energy', marketCap: 48e9, pe: 14.0, forwardPE: 12.5, ps: 1.80, evEbitda: 5.8, revenue: 27e9, ebitda: 10e9, profitMargin: 0.11, roe: 0.14, revenueGrowth: -0.03, dividendYield: 0.016, beta: 1.45, fiftyTwoWeekHigh: 71, fiftyTwoWeekLow: 44, note: 'Buffett-backed, Permian Basin' },
  SLB:  { name: 'Schlumberger', sector: 'energy', marketCap: 56e9, pe: 13.5, forwardPE: 12.0, ps: 1.55, evEbitda: 8.0, revenue: 36e9, ebitda: 8.5e9, profitMargin: 0.12, roe: 0.21, revenueGrowth: 0.03, dividendYield: 0.026, beta: 1.35, fiftyTwoWeekHigh: 55, fiftyTwoWeekLow: 37, note: 'Largest oilfield services' },
  HAL:  { name: 'Halliburton', sector: 'energy', marketCap: 24e9, pe: 10.5, forwardPE: 9.5, ps: 1.05, evEbitda: 6.5, revenue: 23e9, ebitda: 4.8e9, profitMargin: 0.10, roe: 0.28, revenueGrowth: -0.02, dividendYield: 0.024, beta: 1.50, fiftyTwoWeekHigh: 40, fiftyTwoWeekLow: 24, note: 'Oilfield services, fracking' },

  // ═══ OIL ETFs ═══
  USO:  { name: 'US Oil Fund', sector: 'etf', marketCap: 2.5e9, pe: null, forwardPE: null, ps: null, evEbitda: null, revenue: null, ebitda: null, profitMargin: null, roe: null, revenueGrowth: null, dividendYield: null, beta: 1.0, fiftyTwoWeekHigh: 85, fiftyTwoWeekLow: 62, note: '1x WTI crude futures' },
  SCO:  { name: 'ProShares UltraShort Oil', sector: 'etf', marketCap: 0.13e9, pe: null, forwardPE: null, ps: null, evEbitda: null, revenue: null, ebitda: null, profitMargin: null, roe: null, revenueGrowth: null, dividendYield: null, beta: -1.89, fiftyTwoWeekHigh: 24.5, fiftyTwoWeekLow: 7.9, note: '-2x WTI — INVERSE, YTD -57%' },
  UCO:  { name: 'ProShares Ultra Oil', sector: 'etf', marketCap: 0.8e9, pe: null, forwardPE: null, ps: null, evEbitda: null, revenue: null, ebitda: null, profitMargin: null, roe: null, revenueGrowth: null, dividendYield: null, beta: 2.0, fiftyTwoWeekHigh: 42, fiftyTwoWeekLow: 22, note: '2x WTI crude futures' },
};

async function fetchPrice(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const data = await r.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;
    const price = result.meta.regularMarketPrice;
    const prev = result.meta.chartPreviousClose;
    if (!price) return null;
    return {
      price: Math.round(price * 100) / 100,
      change: prev ? Math.round((price - prev) * 100) / 100 : 0,
      changePct: prev ? Math.round(((price - prev) / prev) * 10000) / 100 : 0,
    };
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  try {
    // Filter out private companies (no ticker to fetch)
    const allSymbols = Object.keys(FUNDAMENTALS).filter(s => s !== 'AAON');
    const results = { defense: [], drone: [], puredrone: [], space: [], sensor: [], cuas: [], shipping: [], water: [], food: [], energy: [], etfs: [] };

    // Fetch live prices in parallel
    const tickerMap = { FLIR: 'TDY' };
    const priceFetches = await Promise.allSettled(
      allSymbols.map(sym => fetchPrice(tickerMap[sym] || sym))
    );

    allSymbols.forEach((sym, i) => {
      const fund = FUNDAMENTALS[sym];
      const livePrice = priceFetches[i].status === 'fulfilled' ? priceFetches[i].value : null;

      const entry = {
        symbol: tickerMap[sym] || sym,
        ...fund,
        price: livePrice?.price || 0,
        change: livePrice?.change || 0,
        changePct: livePrice?.changePct || 0,
      };

      const sector = fund.sector;
      if (results[sector]) results[sector].push(entry);
      else if (sector === 'etf') results.etfs.push(entry);
      else results.defense.push(entry);
    });

    // Add private companies (no live price)
    if (FUNDAMENTALS.AAON) {
      results.cuas.push({ symbol: 'ANDURIL', ...FUNDAMENTALS.AAON, price: 0, change: 0, changePct: 0, isPrivate: true });
    }

    // Sort each group by market cap
    Object.keys(results).forEach(k => {
      results[k].sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    });

    res.status(200).json(results);
  } catch (e) {
    res.status(500).json({ error: e.message, defense: [], drone: [], energy: [], etfs: [] });
  }
}
