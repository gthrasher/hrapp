/**
 * Token endpoint proxy.
 *
 * The MCP SDK sends its original dynamic-port redirect_uri in the token exchange.
 * We rewrite it to our proxy URL to match what Auth0 saw in the /authorize request,
 * then forward the request to Auth0's real token endpoint.
 */

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const params = new URLSearchParams(body)

  // Rewrite redirect_uri to match what was used in /oauth/authorize
  params.set('redirect_uri', `${process.env.APP_BASE_URL}/oauth/callback`)

  const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const data = await response.json()
  return Response.json(data, { status: response.status })
}
