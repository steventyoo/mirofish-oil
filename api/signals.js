// Vercel serverless function: Signal history logger
// Uses Vercel KV if available, falls back to in-memory (resets on cold start)
// GET /api/signals — returns signal history
// POST /api/signals — logs a new signal

let memoryStore = [];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  // Try Vercel KV first
  let kv = null;
  try {
    const mod = await import('@vercel/kv');
    kv = mod.kv;
  } catch (e) { /* KV not available, use memory */ }

  if (req.method === 'POST') {
    try {
      const signal = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!signal || !signal.timestamp) {
        res.status(400).json({ error: 'Missing signal data' });
        return;
      }

      // Add resolution fields
      signal.resolved = false;
      signal.actual_price_1d = null;
      signal.actual_price_1w = null;
      signal.pnl_1d = null;
      signal.pnl_1w = null;
      signal.grade = null;

      if (kv) {
        // Store in Vercel KV
        const existing = await kv.get('signal_history') || [];
        existing.unshift(signal);
        // Keep last 200 signals
        if (existing.length > 200) existing.length = 200;
        await kv.set('signal_history', existing);
      } else {
        memoryStore.unshift(signal);
        if (memoryStore.length > 200) memoryStore.length = 200;
      }

      res.status(200).json({ ok: true, stored: kv ? 'kv' : 'memory' });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
    return;
  }

  // GET — return signal history
  try {
    let signals = [];
    if (kv) {
      signals = await kv.get('signal_history') || [];
    } else {
      signals = memoryStore;
    }

    // Try to resolve old signals by checking current prices
    if (signals.length > 0) {
      try {
        const priceRes = await fetch(`https://${process.env.VERCEL_URL || 'mirofish-oil.vercel.app'}/api/prices`);
        const prices = await priceRes.json();
        const currentWTI = prices['CL=F']?.price || 0;
        const currentBrent = prices['BZ=F']?.price || 0;

        const now = Date.now();
        let updated = false;

        signals.forEach(s => {
          if (s.resolved) return;
          const age = now - new Date(s.timestamp).getTime();
          const ageHours = age / (1000 * 60 * 60);
          const ageDays = ageHours / 24;

          // Resolve after 1 day
          if (ageDays >= 1 && !s.actual_price_1d && currentWTI > 0) {
            s.actual_price_1d = currentWTI;
            const entryPrice = s.wti_at_signal || 0;
            if (entryPrice > 0) {
              const move = ((currentWTI - entryPrice) / entryPrice) * 100;
              s.pnl_1d = Math.round(move * 100) / 100;
              // Grade: did direction match?
              if (s.direction === 'bullish' && move > 0) s.grade_1d = 'correct';
              else if (s.direction === 'bearish' && move < 0) s.grade_1d = 'correct';
              else if (Math.abs(move) < 0.5) s.grade_1d = 'flat';
              else s.grade_1d = 'wrong';
            }
            updated = true;
          }

          // Resolve after 7 days
          if (ageDays >= 7 && !s.actual_price_1w && currentWTI > 0) {
            s.actual_price_1w = currentWTI;
            const entryPrice = s.wti_at_signal || 0;
            if (entryPrice > 0) {
              const move = ((currentWTI - entryPrice) / entryPrice) * 100;
              s.pnl_1w = Math.round(move * 100) / 100;
              if (s.direction === 'bullish' && move > 0) s.grade_1w = 'correct';
              else if (s.direction === 'bearish' && move < 0) s.grade_1w = 'correct';
              else if (Math.abs(move) < 0.5) s.grade_1w = 'flat';
              else s.grade_1w = 'wrong';
              s.resolved = true;
            }
            updated = true;
          }
        });

        if (updated && kv) {
          await kv.set('signal_history', signals);
        }
      } catch (e) { /* price fetch failed, skip resolution */ }
    }

    // Compute aggregate stats
    const resolved1d = signals.filter(s => s.grade_1d);
    const resolved1w = signals.filter(s => s.grade_1w);

    const stats = {
      total_signals: signals.length,
      resolved_1d: resolved1d.length,
      resolved_1w: resolved1w.length,
      accuracy_1d: resolved1d.length > 0
        ? Math.round((resolved1d.filter(s => s.grade_1d === 'correct').length / resolved1d.length) * 100)
        : null,
      accuracy_1w: resolved1w.length > 0
        ? Math.round((resolved1w.filter(s => s.grade_1w === 'correct').length / resolved1w.length) * 100)
        : null,
      avg_pnl_1d: resolved1d.length > 0
        ? Math.round((resolved1d.reduce((s, r) => s + (r.pnl_1d || 0), 0) / resolved1d.length) * 100) / 100
        : null,
      avg_pnl_1w: resolved1w.length > 0
        ? Math.round((resolved1w.reduce((s, r) => s + (r.pnl_1w || 0), 0) / resolved1w.length) * 100) / 100
        : null,
      bullish_signals: signals.filter(s => s.direction === 'bullish').length,
      bearish_signals: signals.filter(s => s.direction === 'bearish').length,
      neutral_signals: signals.filter(s => s.direction === 'neutral').length,
    };

    res.status(200).json({ signals: signals.slice(0, 50), stats });
  } catch (e) {
    res.status(500).json({ error: e.message, signals: [], stats: {} });
  }
}
