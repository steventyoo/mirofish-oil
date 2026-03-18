// Vercel serverless function: fetch CENTCOM press releases
// Returns structured JSON of military activity in the Gulf region

function stripHtml(s) {
  return (s || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

function parseRss(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = stripHtml((block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
    const link = ((block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '').trim();
    const pubDate = ((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '').trim();
    const desc = stripHtml((block.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '').slice(0, 300);
    if (title) items.push({ title, link, pubDate, source: 'CENTCOM', desc });
  }
  return items;
}

const GULF_KEYWORDS = [
  'iran', 'hormuz', 'gulf', 'navy', 'maritime', 'strait', 'naval',
  'centcom', '5th fleet', 'bahrain', 'qatar', 'uae', 'oman',
  'houthi', 'red sea', 'aden', 'yemen', 'ship', 'vessel', 'tanker',
  'intercept', 'seize', 'patrol', 'escort', 'mine', 'drone', 'missile',
  'strike', 'attack', 'combat', 'operation', 'deploy', 'carrier',
];

function classifySeverity(item) {
  const text = (item.title + ' ' + item.desc).toLowerCase();
  if (/strike|attack|intercept|destroy|kill|combat|engage|shoot/.test(text)) return 'critical';
  if (/seize|mine|threat|escalat|tension|deploy|carrier|warning/.test(text)) return 'high';
  if (/patrol|exercise|escort|transit|operation|surveillance/.test(text)) return 'medium';
  return 'low';
}

function isGulfRelated(item) {
  const text = (item.title + ' ' + item.desc).toLowerCase();
  return GULF_KEYWORDS.some(k => text.includes(k));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');

  try {
    let items = [];

    // Try direct fetch first
    const urls = [
      'https://www.centcom.mil/rss/category/Press-Releases/feed/rss/',
      'https://www.centcom.mil/MEDIA/PRESS-RELEASES/Press-Release-View/rss/',
    ];

    for (const url of urls) {
      try {
        const r = await fetch(url, {
          headers: { 'User-Agent': 'BlackAlpha/1.0 (Oil Intelligence Platform)' },
          signal: AbortSignal.timeout(8000),
        });
        if (r.ok) {
          const xml = await r.text();
          if (xml.includes('<item>')) {
            items = parseRss(xml);
            break;
          }
        }
      } catch (e) { /* try next */ }
    }

    // Fallback: CORS proxy
    if (items.length === 0) {
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(urls[0])}`;
        const r = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
        if (r.ok) {
          const xml = await r.text();
          if (xml.includes('<item>')) items = parseRss(xml);
        }
      } catch (e) { /* silent */ }
    }

    // Classify and filter
    items.forEach(item => {
      item.severity = classifySeverity(item);
      item.gulfRelated = isGulfRelated(item);
    });

    // Gulf-related first, then others
    const gulf = items.filter(i => i.gulfRelated).slice(0, 15);
    const other = items.filter(i => !i.gulfRelated).slice(0, 5);
    const combined = [...gulf, ...other].slice(0, 20);

    res.status(200).json({
      items: combined,
      count: combined.length,
      gulfCount: gulf.length,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    res.status(200).json({ items: [], count: 0, error: e.message });
  }
}
