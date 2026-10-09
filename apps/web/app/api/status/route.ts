export async function GET() {
  const endpoint = process.env.NATLAS_API_URL;
  if (!endpoint) return Response.json({ status: "unconfigured" });
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    return Response.json({ status: response.ok ? "connected" : "offline" });
  } catch {
    return Response.json({ status: "offline" });
  }
}
