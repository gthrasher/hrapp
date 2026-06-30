export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    IDDB_URL: process.env.IDDB_URL,
    has_SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    has_IDDB_ANON_KEY: !!process.env.IDDB_ANON_KEY,
  })
}
