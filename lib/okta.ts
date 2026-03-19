import { Client } from '@okta/okta-sdk-nodejs'

let _client: Client | null = null

export function getOkta(): Client {
  if (!_client) {
    _client = new Client({
      orgUrl: process.env.OKTA_ORG_URL!,
      authorizationMode: 'PrivateKey',
      clientId: process.env.OKTA_CLIENT_ID!,
      scopes: ['okta.users.manage'],
      privateKey: process.env.OKTA_PRIVATE_KEY!,
    })
  }
  return _client
}
