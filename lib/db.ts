// Native-fetch PostgREST client.
// Intentionally avoids @supabase/supabase-js to prevent the
// iddb supabase-runtime-origin-patch from rewriting the URL.
import { cookies } from 'next/headers'

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

type PgResult<T> = { data: T | null; error: { message: string; code?: string } | null }

function pgBase() { return `${process.env.IDDB_URL}/rest/v1` }
async function pgHeaders(extra?: Record<string, string>) {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY!
  // Forward the user's iddb session cookie so the api-gateway accepts server-side requests
  let cookieHeader = ''
  try { cookieHeader = (await cookies()).toString() } catch {}
  return {
    apikey: k, Authorization: `Bearer ${k}`,
    'Content-Type': 'application/json', Prefer: 'return=representation',
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    ...extra,
  }
}

class Builder<T = any> {
  private _table: string
  private _method = 'GET'
  private _selectCols = '*'
  private _filters: [string, string][] = []
  private _orderCols: string[] = []
  private _limitVal?: number
  private _single = false
  private _body?: string
  private _returnData = false

  constructor(table: string) { this._table = table }

  order(col: string, opts?: { ascending?: boolean }) {
    this._orderCols.push(`${col}.${opts?.ascending === false ? 'desc' : 'asc'}`)
    return this
  }
  eq(col: string, val: string | number) { this._filters.push([col, `eq.${val}`]); return this }
  neq(col: string, val: string | number) { this._filters.push([col, `neq.${val}`]); return this }
  or(expr: string) { this._filters.push(['or', `(${expr})`]); return this }
  limit(n: number) { this._limitVal = n; return this }
  select(cols = '*') { this._selectCols = cols; this._returnData = true; return this }
  single() { this._single = true; this._returnData = true; return this }
  maybeSingle() { this._single = true; this._returnData = true; return this }
  insert(data: Record<string, unknown>) { this._method = 'POST'; this._body = JSON.stringify(data); return this }
  update(data: Record<string, unknown>) { this._method = 'PATCH'; this._body = JSON.stringify(data); return this }
  // .insert({}).select() or .insert({}).select().single() — return the inserted row(s)
  delete() { this._method = 'DELETE'; return this }

  private _url() {
    const p = new URLSearchParams()
    if (this._method === 'GET' || this._returnData) p.set('select', this._selectCols)
    if (this._orderCols.length) p.set('order', this._orderCols.join(','))
    if (this._limitVal) p.set('limit', String(this._limitVal))
    for (const [col, val] of this._filters) p.set(col, val)
    const qs = p.toString()
    return `${pgBase()}/${this._table}${qs ? '?' + qs : ''}`
  }

  then<R>(resolve: (r: PgResult<T>) => R, reject?: (e: unknown) => R): Promise<R> {
    return this._run().then(resolve, reject)
  }

  private async _run(): Promise<PgResult<T>> {
    const url = this._url()
    try {
      const extra: Record<string, string> = {}
      if (this._single) extra['Accept'] = 'application/vnd.pgrst.object+json'
      const res = await fetch(url, {
        method: this._method, headers: await pgHeaders(extra), body: this._body, cache: 'no-store',
      })
      if (res.status === 204 || res.status === 205) return { data: null, error: null }
      const text = await res.text()
      if (!res.ok) {
        const keyPrefix = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').slice(0, 20)
        console.error(`[db] ${this._method} ${url} → ${res.status} key=${keyPrefix} body=${text.slice(0, 200)}`)
        try { return { data: null, error: JSON.parse(text) } }
        catch { return { data: null, error: { message: text || res.statusText } } }
      }
      return { data: text ? JSON.parse(text) : null, error: null }
    } catch (e: any) {
      console.error(`[db] fetch error ${url}:`, e?.message)
      return { data: null, error: { message: e?.message ?? String(e) } }
    }
  }
}

export function getSupabase() {
  return { from: (table: string) => new Builder(table) }
}

export async function getFieldOptions(): Promise<Record<string, string[]>> {
  const { data } = await getSupabase()
    .from('field_options')
    .select('field_name, value')
    .order('sort_order', { ascending: true })

  const result: Record<string, string[]> = {}
  for (const row of (data as FieldOption[] | null) ?? []) {
    if (!result[row.field_name]) result[row.field_name] = []
    result[row.field_name].push(row.value)
  }
  return result
}
