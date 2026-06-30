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

  // Tenant UUID (from whoami)
  const tenantId = 'eb6cd233-1227-4d28-8647-5a7842699d65'
  const appOrigin = process.env.APP_BASE_URL ?? 'https://hrapp.tmm.platform.atko.ai'

  const candidates: [string, string][] = [
    [`https://api.iddb.dev/${tenantId}/rest/v1`, key],
    [`${appOrigin}/tmm/rest/v1`, key],
    [`${appOrigin}/tmm/rest/v1`, svcKey],
    [`https://api.iddb.dev/tmm/pg/v1`, key],
  ]

  const results: Record<string, any> = {}
  for (const [base, k] of candidates) {
    results[`${base} (${k === key ? 'anon' : 'svc'})`] =
      await probe(`${base}/employees?select=id&limit=1`, k)
  }

  return Response.json(results)
}
