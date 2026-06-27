export const dynamic = 'force-dynamic'

export async function GET() {
  const domain = process.env.AUTH0_DOMAIN!
  const baseUrl = process.env.APP_BASE_URL!
  return Response.json({
    issuer: `https://${domain}/`,
    authorization_endpoint: `${baseUrl}/oauth/authorize`,
    token_endpoint: `${baseUrl}/oauth/token`,
    jwks_uri: `https://${domain}/.well-known/jwks.json`,
    registration_endpoint: `${baseUrl}/oauth/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'client_credentials'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none', 'client_secret_post'],
  })
}
