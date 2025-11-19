import axios from "axios";
import { createClient } from "@vercel/kv";

// Environment variable names per Vercel KV convention
// KV_REST_API_URL, KV_REST_API_TOKEN
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

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

export async function getCachedConstellation(force = false) {
  if (!force) {
    try {
      const cached = await kv.get(CACHE_KEY);
      if (cached) {
        return { source: "cache", data: cached };
      }
    } catch (e) {
      console.warn("[constellation] KV get failed, falling back to fetch", e.message);
    }
  }
  const fresh = await fetchAndProcessData();
  try {
    await kv.set(CACHE_KEY, fresh, { ex: CACHE_TTL_SECONDS });
  } catch (e) {
    console.warn("[constellation] KV set failed", e.message);
  }
  return { source: force ? "force_refresh" : "live_fetch", data: fresh };
}

export async function refreshCache() {
  return getCachedConstellation(true);
}
