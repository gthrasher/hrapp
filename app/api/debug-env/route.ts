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
  const base = process.env.IDDB_URL!
  const key = process.env.IDDB_ANON_KEY!
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const [anon, svc, noAuth] = await Promise.all([
    probe(`${base}/rest/v1/employees?select=id&limit=1`, key),
    probe(`${base}/rest/v1/employees?select=id&limit=1`, svcKey),
    probe(`${base}/rest/v1/employees?select=id&limit=1`, ''),
  ])

  return Response.json({ base, anon_result: anon, svc_result: svc, noauth_result: noAuth })
}
