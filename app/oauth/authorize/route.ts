/**
 * Authorization endpoint proxy.
 *
 * The MCP SDK sends its dynamic-port callback URL here. We store that URL,
 * rewrite redirect_uri to our known proxy URL, then forward to Auth0.
 * This lets Auth0 redirect to a pre-registered URL instead of the SDK's
 * unpredictable ephemeral port.
 */

import { storePendingCallback } from '@/lib/oauth-relay'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const sdkRedirectUri = searchParams.get('redirect_uri')
  if (sdkRedirectUri) {
    storePendingCallback(sdkRedirectUri)
  }

  const proxyCallbackUrl = `${process.env.APP_BASE_URL}/oauth/callback`
  const auth0Url = new URL(`https://${process.env.AUTH0_DOMAIN}/authorize`)

  searchParams.forEach((value, key) => {
    auth0Url.searchParams.set(key, key === 'redirect_uri' ? proxyCallbackUrl : value)
  })

  return Response.redirect(auth0Url.toString(), 302)
}
