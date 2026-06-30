export const dynamic = 'force-dynamic'

async function probe(url: string, key: string) {
  try {
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    })
    const text = await res.text()
    return { status: res.status, preview: text.slice(0, 120) }
  } catch (e: any) {
    return { error: e?.message }
  }
}

export async function GET() {
  const key = process.env.IDDB_ANON_KEY!
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const candidates: [string, string, string][] = [
    ['tmm-tenant-direct-anon',  'https://tmm.platform.atko.ai/rest/v1/employees?select=id&limit=1', key],
    ['tmm-tenant-direct-svc',   'https://tmm.platform.atko.ai/rest/v1/employees?select=id&limit=1', svcKey],
    ['tmm-tenant-pg-anon',      'https://tmm.platform.atko.ai/pg/v1/employees?select=id&limit=1', key],
    ['tmm-tenant-pg-svc',       'https://tmm.platform.atko.ai/pg/v1/employees?select=id&limit=1', svcKey],
  ]

  const results: Record<string, any> = {}
  for (const [label, url, k] of candidates) {
    results[label] = await probe(url, k)
  }
  return Response.json(results)
}
