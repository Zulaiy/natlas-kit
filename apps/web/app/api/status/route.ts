export async function GET() {
  const endpoint = process.env.NATLAS_API_URL;
  if (!endpoint) return Response.json({ status: "unconfigured" });
  try {
    const base = endpoint.replace(/\/$/, "");
    const signal = AbortSignal.timeout(4000);
    const response = await fetch(`${base}/health`, {
      cache: "no-store",
      signal,
    });
    const health = await response.json();
    if (!response.ok || health?.status !== "ok")
      return Response.json({ status: "offline" });
    const models = await fetch(`${base}/v1/models`, {
      headers: process.env.NATLAS_API_KEY
        ? { Authorization: `Bearer ${process.env.NATLAS_API_KEY}` }
        : {},
      cache: "no-store",
      signal,
    });
    if (models.status === 401 || models.status === 403)
      return Response.json({ status: "unauthorized" });
    if (!models.ok || !Array.isArray(await models.json()))
      return Response.json({ status: "offline" });
    return Response.json({
      status: "connected",
      loadedLanguage:
        typeof health.loaded_language === "string"
          ? health.loaded_language
          : null,
    });
  } catch {
    return Response.json({ status: "offline" });
  }
}
