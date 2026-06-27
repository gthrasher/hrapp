/**
 * Fake dynamic client registration endpoint (RFC 7591).
 *
 * Auth0 doesn't support dynamic client registration, so this route accepts
 * the SDK's registration request, stores its actual callback URL, and returns
 * our proxy callback URL instead. This lets Auth0 redirect to a known URL
 * (localhost:3000/oauth/callback) which then forwards to the SDK's dynamic port.
 */

import { storePendingCallback } from '@/lib/oauth-relay'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))

  // Store the SDK's actual callback URL so our proxy can forward to it later
  const sdkCallbackUrl = body.redirect_uris?.[0]
  if (sdkCallbackUrl) {
    storePendingCallback(sdkCallbackUrl)
  }

  const proxyCallbackUrl = `${process.env.APP_BASE_URL}/oauth/callback`

  return Response.json(
    {
      client_id: process.env.AUTH0_MCP_CLIENT_ID!,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: [proxyCallbackUrl],
      grant_types: body.grant_types ?? ['authorization_code'],
      response_types: body.response_types ?? ['code'],
      token_endpoint_auth_method: 'none',
    },
    { status: 201 }
  )
}
