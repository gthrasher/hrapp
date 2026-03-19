import { Client } from '@okta/okta-sdk-nodejs'
import { readFileSync } from 'fs'
import { join } from 'path'

function getPrivateKey(): Record<string, unknown> {
  // Production (Vercel): set OKTA_PRIVATE_KEY as a single-line JSON string.
  const envKey = process.env.OKTA_PRIVATE_KEY
  if (envKey) {
    try {
      return JSON.parse(envKey)
    } catch {
      // Fall through to file
    }
  }
  // Local dev: read from gitignored okta-private-key.json at project root.
  return JSON.parse(readFileSync(join(process.cwd(), 'okta-private-key.json'), 'utf-8'))
}

let _client: Client | null = null

export function getOkta(): Client {
  if (!_client) {
    _client = new Client({
      orgUrl: process.env.OKTA_ORG_URL!,
      authorizationMode: 'PrivateKey',
      clientId: process.env.OKTA_CLIENT_ID!,
      scopes: ['okta.users.manage'],
      privateKey: getPrivateKey(),
    })
  }
  return _client
}
