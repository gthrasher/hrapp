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

  const candidates = [
    'https://api.iddb.dev/tmm/rest/v1',
    'https://api.iddb.dev/tmm',
    'https://platform.atko.ai/tmm/rest/v1',
  ]

  const results: Record<string, any> = {}
  for (const base of candidates) {
    results[base] = await probe(`${base}/employees?select=id&limit=1`, key)
  }
  // also try service key on the most likely one
  results['api.iddb.dev/tmm/rest/v1 (svc)'] = await probe(
    'https://api.iddb.dev/tmm/rest/v1/employees?select=id&limit=1', svcKey
  )

  return Response.json(results)
}
