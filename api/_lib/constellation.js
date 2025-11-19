import axios from "axios";

const BASE_URL = "https://a.windbornesystems.com/treasure/";
const CACHE_KEY = "constellation_data_v1";
const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

const formatHour = (hour) => hour.toString().padStart(2, "0");

export async function fetchAndProcessData() {
  console.log("[constellation] Fetching fresh data (24 files)...");
  const fetchPromises = [];
  for (let i = 0; i < 24; i++) {
    const url = `${BASE_URL}${formatHour(i)}.json`;
    fetchPromises.push(
      axios
        .get(url, { timeout: 5000 })
        .then((r) => ({ hour: i, data: r.data, status: "success" }))
        .catch((err) => ({ hour: i, status: "error", message: err.code || "error" }))
    );
  }
  const results = await Promise.all(fetchPromises);
  results.sort((a, b) => a.hour - b.hour);

  const balloonData = [];
  const currentResult = results.find((r) => r.hour === 0 && r.status === "success");
  const historyResults = results.filter((r) => r.hour > 0 && r.status === "success");

  if (!currentResult || !currentResult.data || currentResult.data.length === 0) {
    console.warn("[constellation] No current data (00.json). Returning empty.");
    return { balloons: [] };
  }

  const numBalloons = currentResult.data.length;
  for (let i = 0; i < numBalloons; i++) {
    const balloon = { id: i, current: currentResult.data[i], history: [] };
    for (const hist of historyResults) {
      if (hist.data && hist.data[i]) {
        balloon.history.push(hist.data[i]);
      }
    }
    balloonData.push(balloon);
  }
  return { balloons: balloonData };
}

// --- Cache client selection: Generic Redis URL only ---
async function getCacheAdapter() {
  // Generic REDIS_URL (e.g., Redis Cloud/Marketplace)
  if (process.env.REDIS_URL) {
    // Reuse connection across invocations
    const globalKey = "__redis_io__";
    if (!globalThis[globalKey]) {
      const IORedis = (await import("ioredis")).default;
      globalThis[globalKey] = new IORedis(process.env.REDIS_URL, {
        lazyConnect: false,
        maxRetriesPerRequest: 2,
        enableAutoPipelining: true,
        tls: process.env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
      });
    }
    const redis = globalThis[globalKey];
    return {
      name: "redis",
      async get(key) {
        const raw = await redis.get(key);
        return raw ? JSON.parse(raw) : null;
      },
      async set(key, value, ttlSeconds) {
        return redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
      },
    };
  }

  // No cache configured
  return {
    name: "none",
    async get() { return null; },
    async set() { return; },
  };
}

export async function getCachedConstellation(force = false) {
  const cache = await getCacheAdapter();

  if (!force) {
    try {
      const cached = await cache.get(CACHE_KEY);
      if (cached) {
        return { source: `cache(${cache.name})`, data: cached };
      }
    } catch (e) {
      console.warn(`[constellation] cache get failed (${cache.name})`, e.message);
    }
  }

  const fresh = await fetchAndProcessData();
  try {
    await cache.set(CACHE_KEY, fresh, CACHE_TTL_SECONDS);
  } catch (e) {
    console.warn(`[constellation] cache set failed (${cache.name})`, e.message);
  }
  return { source: force ? `force_refresh(${cache.name})` : "live_fetch", data: fresh };
}

export async function refreshCache() {
  return getCachedConstellation(true);
}
