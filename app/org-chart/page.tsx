import { getSupabase } from '@/lib/supabase'
import { OrgChart } from './OrgChart'

export const dynamic = 'force-dynamic'

export default async function OrgChartPage() {
  const { data: employees, error } = await getSupabase()
    .from('employees')
    .select('*')
    .order('last_name')

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div
          style={{ backgroundColor: 'var(--danger-subtle)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
          className="rounded-xl px-4 py-3 text-sm"
        >
          Failed to load org chart: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="py-10">
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-semibold tracking-tight">
          Org Chart
        </h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">
          {employees?.length ?? 0} employees
        </p>
      </div>
      <OrgChart employees={employees ?? []} />
    </div>
  )
}
