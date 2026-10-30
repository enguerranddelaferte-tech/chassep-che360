// Relais météo Chasse & Pêche 360° : prévisions MET Norway (CC BY 4.0), mises en cache.
// GET ?lat=..&lon=..           -> prévision complète, au format attendu par l'appli
// GET ?pts=lat,lon;lat,lon;... -> vent actuel sur une grille (couche « vent animé »)
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};
const UA = 'ChassePeche360/3.0 github.com/enguerranddelaferte-tech/chassep-che360';
const MET = 'https://api.met.no/weatherapi/locationforecast/2.0/complete';
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const mem = new Map<string, { exp: number; data: any }>();

const json = (d: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(d), { status, headers: { ...cors, 'content-type': 'application/json', ...extra } });

// Symboles MET Norway -> codes météo utilisés par l'appli (WMO)
function wmo(sym?: string): number {
  if (!sym) return 3;
  const s = sym.replace(/_(day|night|polartwilight)$/, '');
  if (s.includes('thunder')) return 95;
  const t: Record<string, number> = {
    clearsky: 0, fair: 1, partlycloudy: 2, cloudy: 3, fog: 45,
    lightrain: 61, rain: 63, heavyrain: 65,
    lightrainshowers: 80, rainshowers: 81, heavyrainshowers: 82,
    lightsleet: 61, sleet: 63, heavysleet: 65,
    lightsleetshowers: 80, sleetshowers: 81, heavysleetshowers: 82,
    lightsnow: 71, snow: 73, heavysnow: 75,
    lightsnowshowers: 71, snowshowers: 73, heavysnowshowers: 75,
  };
  return t[s] ?? 3;
}
const SEV = [0, 1, 2, 3, 45, 61, 80, 71, 63, 81, 73, 65, 82, 75, 95];
const sev = (c: number) => Math.max(0, SEV.indexOf(c));
const kmh = (ms?: number) => (typeof ms === 'number' ? Math.round(ms * 3.6) : null);
// Rafales : fournies par MET seulement en Scandinavie ; ailleurs, estimation prudente (facteur 1,5 sur le vent moyen)
const gust = (d: any) => (typeof d.wind_speed_of_gust === 'number' ? kmh(d.wind_speed_of_gust) : (typeof d.wind_speed === 'number' ? Math.round(d.wind_speed * 3.6 * 1.5) : null));
const r1 = (v?: number | null) => (typeof v === 'number' ? Math.round(v * 10) / 10 : null);

const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false });
const local = (iso: string) => {
  const p = Object.fromEntries(fmt.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour === '24' ? '00' : p.hour}:00`;
};

function feels(t: number, w: number | null, rh: number | null) {
  if (w != null && t <= 10 && w > 4.8) {
    const v = Math.pow(w, 0.16);
    return r1(13.12 + 0.6215 * t - 11.37 * v + 0.3965 * t * v);
  }
  if (rh != null && t >= 27) {
    return r1(t + 0.33 * (rh / 100) * 6.105 * Math.exp((17.27 * t) / (237.7 + t)) - 4);
  }
  return r1(t);
}

async function metFetch(lat: string, lon: string, lastMod?: string | null) {
  const h: Record<string, string> = { 'User-Agent': UA, 'Accept-Encoding': 'gzip' };
  if (lastMod) h['If-Modified-Since'] = lastMod;
  const r = await fetch(`${MET}?lat=${lat}&lon=${lon}`, { headers: h });
  return r;
}

// Prévision brute MET, avec cache mémoire + table weather_cache
async function getRaw(lat: string, lon: string) {
  const key = `${lat},${lon}`;
  const now = Date.now();
  const m = mem.get(key);
  if (m && m.exp > now) return m.data;
  const { data: row } = await admin.from('weather_cache').select('payload,expires_at,last_modified').eq('key', key).maybeSingle();
  if (row && new Date(row.expires_at).getTime() > now) {
    mem.set(key, { exp: new Date(row.expires_at).getTime(), data: row.payload });
    return row.payload;
  }
  const r = await metFetch(lat, lon, row?.last_modified);
  const expHdr = r.headers.get('expires');
  const exp = Math.max(now + 10 * 60e3, expHdr ? new Date(expHdr).getTime() : now + 30 * 60e3);
  if (r.status === 304 && row) {
    await admin.from('weather_cache').update({ expires_at: new Date(exp).toISOString(), updated_at: new Date().toISOString() }).eq('key', key);
    mem.set(key, { exp, data: row.payload });
    return row.payload;
  }
  if (!r.ok) {
    if (row) return row.payload; // donnée périmée plutôt que rien
    throw new Error('MET ' + r.status);
  }
  const data = await r.json();
  await admin.from('weather_cache').upsert({
    key, payload: data, expires_at: new Date(exp).toISOString(),
    last_modified: r.headers.get('last-modified'), updated_at: new Date().toISOString(),
  });
  mem.set(key, { exp, data });
  return data;
}

function shape(raw: any) {
  const ts: any[] = raw?.properties?.timeseries ?? [];
  if (!ts.length) throw new Error('prévision vide');
  const nowH = Date.now() - 60 * 60e3;
  let i0 = ts.findIndex((x) => new Date(x.time).getTime() >= nowH);
  if (i0 < 0) i0 = 0;
  const pick = (x: any) => {
    const d = x.data.instant.details;
    const n1 = x.data.next_1_hours;
    const n6 = x.data.next_6_hours;
    return {
      time: local(x.time),
      temp: r1(d.air_temperature),
      pressure: r1(d.air_pressure_at_sea_level),
      wind: kmh(d.wind_speed),
      windDir: typeof d.wind_from_direction === 'number' ? Math.round(d.wind_from_direction) : null,
      gusts: gust(d),
      humidity: typeof d.relative_humidity === 'number' ? Math.round(d.relative_humidity) : null,
      cloud: typeof d.cloud_area_fraction === 'number' ? Math.round(d.cloud_area_fraction) : null,
      rain: Math.round(n1?.details?.probability_of_precipitation ?? n6?.details?.probability_of_precipitation ?? 0),
      mm: r1(n1?.details?.precipitation_amount ?? null),
      code: wmo(n1?.summary?.symbol_code ?? n6?.summary?.symbol_code),
    };
  };
  const c = pick(ts[i0]);
  const hourly = ts.slice(i0).filter((x) => x.data.next_1_hours).slice(0, 24).map(pick)
    .map(({ humidity: _h, ...h }) => h);
  // tendance de pression : écart sur les 3, 6 et 24 prochaines heures (MET ne fournit pas l'historique)
  const pAt = (h: number) => {
    const t = new Date(ts[i0].time).getTime() + h * 3600e3;
    const x = ts.find((y) => new Date(y.time).getTime() >= t);
    return x?.data.instant.details.air_pressure_at_sea_level;
  };
  const trend = (h: number) => {
    const p = pAt(h);
    return typeof p === 'number' && typeof c.pressure === 'number' ? r1(p - c.pressure) : 0;
  };
  // journées locales
  const days = new Map<string, any>();
  for (let k = i0; k < ts.length; k++) {
    const x = ts[k];
    const day = local(x.time).slice(0, 10);
    const hour = +local(x.time).slice(11, 13);
    const d = x.data.instant.details;
    const n1 = x.data.next_1_hours;
    const n6 = x.data.next_6_hours;
    let g = days.get(day);
    if (!g) { g = { date: day, max: -99, min: 99, wind: 0, gusts: 0, rain: 0, code: 0, step: n1 ? 1 : 6 }; days.set(day, g); }
    const tmax = n6?.details?.air_temperature_max ?? d.air_temperature;
    const tmin = n6?.details?.air_temperature_min ?? d.air_temperature;
    g.max = Math.max(g.max, d.air_temperature, n1 ? d.air_temperature : tmax);
    g.min = Math.min(g.min, d.air_temperature, n1 ? d.air_temperature : tmin);
    g.wind = Math.max(g.wind, kmh(d.wind_speed) ?? 0);
    g.gusts = Math.max(g.gusts, gust(d) ?? 0);
    if (n1) g.rain += n1.details?.precipitation_amount ?? 0;
    else if (n6) g.rain += n6.details?.precipitation_amount ?? 0;
    const sym = n1?.summary?.symbol_code ?? n6?.summary?.symbol_code;
    if (hour >= 6 && hour <= 20 && sym) { const w = wmo(sym); if (sev(w) > sev(g.code)) g.code = w; }
  }
  const daily = [...days.values()].slice(0, 7).map((g) => ({
    date: g.date, code: g.code, max: Math.round(g.max), min: Math.round(g.min), wind: g.wind,
    gusts: g.gusts || null, rain: r1(g.rain), conf: null, maxLo: null, maxHi: null, rainLo: null, rainHi: null,
  }));
  const alt = raw?.geometry?.coordinates?.[2];
  return {
    source: 'met-norway', model: 'MET Norway', models: 1, gustsEstimated: typeof ts[i0].data.instant.details.wind_speed_of_gust !== 'number',
    elevation: typeof alt === 'number' ? Math.round(alt) : null,
    updated: raw?.properties?.meta?.updated_at ?? null,
    current: {
      temp: c.temp, feels: feels(c.temp ?? 0, c.wind, c.humidity), humidity: c.humidity, pressure: c.pressure,
      pressureTrend: trend(3), pressureTrend6: trend(6), pressureTrend24: trend(24),
      wind: c.wind, windDir: c.windDir, gusts: c.gusts, code: c.code, precipitation: c.mm ?? 0, cloud: c.cloud,
    },
    hourly, daily,
  };
}

const q4 = (v: string | null, dec: number) => {
  const n = Number(v);
  if (!isFinite(n)) return null;
  return n.toFixed(dec);
};

async function pool<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>) {
  const out: R[] = new Array(items.length);
  let k = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (k < items.length) { const i = k++; out[i] = await fn(items[i]); }
  }));
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  try {
    const u = new URL(req.url);
    const pts = u.searchParams.get('pts');
    if (pts) {
      const list = pts.split(';').slice(0, 48).map((p) => p.split(',')).map(([a, b]) => [q4(a, 1), q4(b, 1)])
        .filter(([a, b]) => a && b && Math.abs(+a!) <= 90 && Math.abs(+b!) <= 180) as [string, string][];
      const res = await pool(list, 4, async ([a, b]) => {
        try {
          const raw = await getRaw(a, b);
          const x = raw.properties.timeseries.find((y: any) => new Date(y.time).getTime() >= Date.now() - 3600e3) ?? raw.properties.timeseries[0];
          const d = x.data.instant.details;
          return { current: { time: local(x.time), wind_speed_10m: kmh(d.wind_speed), wind_direction_10m: d.wind_from_direction } };
        } catch { return { current: { time: null, wind_speed_10m: 0, wind_direction_10m: 0 } }; }
      });
      return json(res, 200, { 'cache-control': 'public, max-age=900' });
    }
    const lat = q4(u.searchParams.get('lat'), 2), lon = q4(u.searchParams.get('lon'), 2);
    if (!lat || !lon || Math.abs(+lat) > 90 || Math.abs(+lon) > 180) return json({ error: 'lat/lon requis' }, 400);
    const raw = await getRaw(lat, lon);
    return json({ ...shape(raw), attribution: 'Données MET Norway (CC BY 4.0)' }, 200, { 'cache-control': 'public, max-age=600' });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e).slice(0, 120) }, 502);
  }
});
