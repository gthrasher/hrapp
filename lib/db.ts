import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.IDDB_URL!
    const key = process.env.IDDB_ANON_KEY!
    _client = createClient(url, key)
  }
  return _client
}

export type Employee = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  department: string | null
  job_title: string | null
  start_date: string | null
  status: 'active' | 'inactive'
  user_type: string | null
  cost_center: string | null
  division: string | null
  okta_id: string | null
  manager_id: string | null
  created_at: string
}

export type FieldOption = {
  id: string
  field_name: string
  value: string
  sort_order: number
  created_at: string
}

export async function getFieldOptions(): Promise<Record<string, string[]>> {
  const { data } = await getSupabase()
    .from('field_options')
    .select('field_name, value')
    .order('sort_order', { ascending: true })

  const result: Record<string, string[]> = {}
  for (const row of data ?? []) {
    if (!result[row.field_name]) result[row.field_name] = []
    result[row.field_name].push(row.value)
  }
  return result
}
