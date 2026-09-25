# Code Review: Application Security

**Ready for Production**: No, pending infrastructure controls below
**Critical Issues**: 0
**Scope**: Next.js server boundary, proxy authentication, Supabase configuration, and HTTP health endpoint

## Priority 1 (Must Fix) ⛔

No critical vulnerabilities were found in the reviewed server code. There are no raw SQL queries, dynamic HTML sinks, shell execution, or server-side user-controlled redirects in the current codebase.

## Priority 2 (Should Fix)

- **Admin authorization configuration**: `proxy.ts` previously accepted `NEXT_PUBLIC_ADMIN_EMAILS` as a fallback. Public environment variables are delivered to browsers and must not be an authorization source. Authorization now uses only `ADMIN_EMAILS`.
- **Excessive requests**: `/api/health` had no request limit and allowed cacheable responses. It now applies a bounded per-client fixed-window counter and returns `429` with `Retry-After`.
- **Configuration failures**: Supabase server credentials were asserted with `!`, producing unclear runtime failures. The server boundary now validates presence and URL format before creating a client.

## Remaining Risks and Recommendations

- The current rate limiter is process-local. Configure a distributed limiter at the CDN/WAF or use Redis/Upstash before horizontal production scaling.
- Supabase Row Level Security must be enabled and tested for every future data table. The current UI stores business data in browser localStorage, so it is not a server-enforced data store.
- `NEXT_PUBLIC_ADMIN_EMAILS` may still be used by client UI hints, but it must never grant access. Keep the authoritative list only in `ADMIN_EMAILS`.
- Add integration tests for authentication, admin denial, rate-limit behavior, and RLS policies when server data endpoints are introduced.

## Validation Performed

- `npm run lint` completed successfully.
- `npm run build` completed successfully, including TypeScript validation and route generation.
- `npm run dev -- -p 3001` started successfully.
- The root page and `/api/health` returned `200`; the health response included `Cache-Control: no-store`.
- Repeated health requests returned `429` after the configured limit.