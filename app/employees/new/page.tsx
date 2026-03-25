import Link from 'next/link'
import { getSupabase, getFieldOptions } from '@/lib/supabase'
import { EmployeeForm } from '../EmployeeForm'
import { createEmployee } from '../actions'

export const dynamic = 'force-dynamic'

export default async function NewEmployeePage() {
  const [fieldOptions, { data: employees }] = await Promise.all([
    getFieldOptions(),
    getSupabase()
      .from('employees')
      .select('id, first_name, last_name, email')
      .order('first_name')
      .order('last_name'),
  ])

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Link
          href="/employees"
          style={{ color: 'var(--text-tertiary)' }}
          className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity mb-3"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Employees
        </Link>
        <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-semibold tracking-tight">
          Add Employee
        </h1>
      </div>
      <EmployeeForm action={createEmployee} fieldOptions={fieldOptions} employees={employees ?? []} />
    </div>
  )
}
