export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_URL: process.env.POSTGRES_URL,
    SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    IDDB_DB_URL: process.env.IDDB_DB_URL,
    IDDB_POSTGRES_URL: process.env.IDDB_POSTGRES_URL,
    IDDB_URL: process.env.IDDB_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
  })
}
