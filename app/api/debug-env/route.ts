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

  const appOrigin = 'https://hrapp.tmm.platform.atko.ai'
  const base = `${appOrigin}/tmm/rest/v1`

  const [withAnon, withSvc] = await Promise.all([
    probe(`${base}/employees?select=id&limit=1`, key),
    probe(`${base}/employees?select=id&limit=1`, svcKey),
  ])

  return Response.json({
    url_used: base,
    anon_key_prefix: key?.slice(0, 20),
    svc_key_prefix: svcKey?.slice(0, 20),
    anon_result: withAnon,
    svc_result: withSvc,
  })
}
