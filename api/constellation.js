import { getCachedConstellation } from "./_lib/constellation.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const force = req.query.refresh === "1"; // allow ?refresh=1 for manual bust
  try {
    const { source, data } = await getCachedConstellation(force);
    return res.status(200).json({ source, count: data.balloons.length, data });
  } catch (e) {
    console.error("[api/constellation] Error", e);
    return res.status(500).json({ error: "Failed to load constellation data" });
  }
}
