import Link from 'next/link'
import { Suspense } from 'react'
import { getSupabase, getFieldOptions, type Employee } from '@/lib/supabase'
import { EmployeeFilters } from './EmployeeFilters'

type EmployeeWithManager = Employee & {
  manager: { first_name: string; last_name: string } | null
}

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ q?: string; status?: string; department?: string }>
}

export default async function EmployeesPage({ searchParams }: Props) {
  const { q, status, department } = await searchParams

  const [{ data: employees, error }, fieldOptions] = await Promise.all([
    buildQuery(q, status, department),
    getFieldOptions(),
  ])

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div
          style={{ backgroundColor: 'var(--danger-subtle)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
          className="rounded-xl px-4 py-3 text-sm"
        >
          Failed to load employees: {error.message}
        </div>
      </div>
    )
  }

  const list = (employees ?? []) as EmployeeWithManager[]
  const active = list.filter(e => e.status === 'active').length
  const isFiltered = !!(q || status || department)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-semibold tracking-tight">
            Employees
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">
            {isFiltered
              ? `${list.length} result${list.length !== 1 ? 's' : ''}`
              : `${list.length} total · ${active} active`}
          </p>
        </div>
        <Link
          href="/employees/new"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Employee
        </Link>
      </div>

      {/* Filters */}
      <Suspense>
        <EmployeeFilters departments={fieldOptions.department ?? []} />
      </Suspense>

      {/* Table */}
      {list.length === 0 ? (
        <div
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          className="rounded-xl flex flex-col items-center justify-center py-24 gap-3"
        >
          <div style={{ color: 'var(--text-tertiary)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          {isFiltered ? (
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">No employees match your filters</p>
          ) : (
            <>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">No employees yet</p>
              <Link
                href="/employees/new"
                style={{ color: 'var(--accent-text)' }}
                className="text-sm hover:underline"
              >
                Add your first employee →
              </Link>
            </>
          )}
        </div>
      ) : (
        <div
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          className="rounded-xl overflow-hidden shadow-sm"
        >
          <table className="min-w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-raised)' }}>
                <th style={{ color: 'var(--text-tertiary)' }} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                <th style={{ color: 'var(--text-tertiary)' }} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th style={{ color: 'var(--text-tertiary)' }} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell">Department</th>
                <th style={{ color: 'var(--text-tertiary)' }} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell">Title</th>
                <th style={{ color: 'var(--text-tertiary)' }} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider hidden xl:table-cell">Manager</th>
                <th style={{ color: 'var(--text-tertiary)' }} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-5 py-3"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody>
              {list.map((emp, i) => (
                <tr
                  key={emp.id}
                  style={{
                    borderBottom: i < list.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                  className="transition-colors hover:bg-[var(--surface-raised)]"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      >
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <span style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">
                        {emp.first_name} {emp.last_name}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }} className="px-5 py-3.5 text-sm hidden sm:table-cell">{emp.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }} className="px-5 py-3.5 text-sm hidden md:table-cell">{emp.department || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                  <td style={{ color: 'var(--text-secondary)' }} className="px-5 py-3.5 text-sm hidden lg:table-cell">{emp.job_title || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                  <td style={{ color: 'var(--text-secondary)' }} className="px-5 py-3.5 text-sm hidden xl:table-cell">
                    {emp.manager
                      ? `${emp.manager.first_name} ${emp.manager.last_name}`
                      : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      style={emp.status === 'active'
                        ? { backgroundColor: 'var(--success-subtle)', color: 'var(--success-text)' }
                        : { backgroundColor: 'var(--surface-raised)', color: 'var(--text-tertiary)' }
                      }
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`} />
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/employees/${emp.id}`}
                      style={{ color: 'var(--accent-text)' }}
                      className="text-sm font-medium hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function buildQuery(q?: string, status?: string, department?: string) {
  let query = getSupabase()
    .from('employees')
    .select('*, manager:employees!manager_id(first_name, last_name)')
    .order('last_name', { ascending: true })

  if (q) {
    const like = `%${q}%`
    query = query.or(
      `first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like}`
    )
  }
  if (status) {
    query = query.eq('status', status)
  }
  if (department) {
    query = query.eq('department', department)
  }

  return query
}
