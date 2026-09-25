import { checkRateLimit, tooManyRequests } from "@/lib/security/rate-limit";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(request);

  if (!rateLimit.allowed) return tooManyRequests(rateLimit.retryAfter);

  return Response.json(
    { ok: true, app: "autoestima", timestamp: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
