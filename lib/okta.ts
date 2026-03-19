import { Client } from '@okta/okta-sdk-nodejs'

let _client: Client | null = null

export function getOkta(): Client {
  if (!_client) {
    _client = new Client({
      orgUrl: process.env.OKTA_ORG_URL!,
      token: process.env.OKTA_API_TOKEN!,
    })
  }
  return _client
}
