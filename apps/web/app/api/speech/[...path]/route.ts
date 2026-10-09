import type { NextRequest } from "next/server";
export const runtime = "nodejs";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, (await params).path);
}
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, (await params).path);
}
async function proxy(request: NextRequest, path: string[]) {
  const route = path.join("/");
  const allowed =
    request.method === "POST"
      ? route === "v1/transcriptions"
      : route === "v1/models" ||
        /^v1\/transcriptions\/[a-f0-9]{32}$/.test(route);
  if (!allowed)
    return Response.json(
      { detail: "Unknown speech endpoint." },
      { status: 404 },
    );
  const endpoint = process.env.NATLAS_API_URL;
  if (!endpoint)
    return Response.json(
      {
        detail: "No speech service configured. Follow the backend quickstart.",
      },
      { status: 503 },
    );
  try {
    const headers = new Headers();
    if (process.env.NATLAS_API_KEY)
      headers.set("Authorization", `Bearer ${process.env.NATLAS_API_KEY}`);
    let body: FormData | undefined;
    if (request.method === "POST") {
      body = await request.formData();
      const audio = body.get("audio");
      if (
        !(audio instanceof File) ||
        !audio.size ||
        audio.size > 10 * 1024 * 1024
      )
        return Response.json(
          { detail: "Choose a non-empty audio file smaller than 10 MB." },
          { status: 400 },
        );
    }
    const result = await fetch(`${endpoint.replace(/\/$/, "")}/${route}`, {
      method: request.method,
      body,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    return new Response(await result.text(), {
      status: result.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      {
        detail:
          "Could not reach the speech service. Check that your backend is running.",
      },
      { status: 503 },
    );
  }
}
