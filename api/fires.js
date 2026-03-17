// Vercel serverless function: fetch NASA FIRMS fire hotspot data
// Uses the open global CSV (no API key needed), filters to Middle East region

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');

  try {
    // Global 24h fire data — no API key required
    const url = 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_24h.csv';
    const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!r.ok) {
      res.status(200).json([]);
      return;
    }
    const csv = await r.text();
    if (!csv.includes('latitude')) {
      res.status(200).json([]);
      return;
    }

    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const latIdx = headers.indexOf('latitude');
    const lonIdx = headers.indexOf('longitude');
    const brightIdx = headers.indexOf('bright_ti4');
    const confIdx = headers.indexOf('confidence');
    const dtIdx = headers.indexOf('acq_date');
    const tmIdx = headers.indexOf('acq_time');

    // Filter to Middle East region: lat 15-40, lon 30-70
    const fires = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const lat = parseFloat(cols[latIdx]);
      const lon = parseFloat(cols[lonIdx]);
      if (isNaN(lat) || isNaN(lon)) continue;

      // Middle East bounding box
      if (lat < 15 || lat > 40 || lon < 30 || lon > 70) continue;

      fires.push({
        lat, lon,
        brightness: parseFloat(cols[brightIdx]) || 330,
        confidence: cols[confIdx] || 'nominal',
        datetime: `${cols[dtIdx] || ''} ${cols[tmIdx] || ''}`.trim(),
      });

      if (fires.length >= 800) break;
    }

    res.status(200).json(fires);
  } catch (e) {
    res.status(200).json([]);
  }
}
