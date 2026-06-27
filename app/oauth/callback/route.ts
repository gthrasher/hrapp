/**
 * OAuth callback proxy.
 *
 * Auth0 redirects here (a known, pre-registered URL) after the user authenticates.
 * This route forwards the code + state to the MCP SDK's actual local callback URL,
 * which runs on a dynamic port that Auth0 won't accept directly.
 */

import { consumePendingCallback } from '@/lib/oauth-relay'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const sdkCallbackUrl = consumePendingCallback()

  if (!sdkCallbackUrl) {
    return new Response('No pending OAuth callback — try connecting again.', { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const target = new URL(sdkCallbackUrl)
  searchParams.forEach((value, key) => target.searchParams.set(key, value))

  return Response.redirect(target.toString(), 302)
}
