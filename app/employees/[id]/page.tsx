import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabase, getFieldOptions } from '@/lib/supabase'
import { EmployeeForm } from '../EmployeeForm'
import { updateEmployee, deleteEmployee, terminateEmployee, reactivateEmployee } from '../actions'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditEmployeePage({ params }: Props) {
  const { id } = await params

  const [{ data: employee, error }, fieldOptions] = await Promise.all([
    getSupabase().from('employees').select('*').eq('id', id).single(),
    getFieldOptions(),
  ])

  if (error || !employee) notFound()

  const updateWithId = updateEmployee.bind(null, id)

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
          {employee.first_name} {employee.last_name}
        </h1>
        {employee.job_title && (
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">
            {employee.job_title}{employee.department ? ` · ${employee.department}` : ''}
          </p>
        )}
      </div>

      <EmployeeForm action={updateWithId} employee={employee} fieldOptions={fieldOptions} />

      {/* Employment Status */}
      <div
        style={{ borderTop: '1px solid var(--border)' }}
        className="mt-10 pt-8 space-y-4"
      >
        <h2 style={{ color: 'var(--text-secondary)' }} className="text-xs font-semibold uppercase tracking-wider">
          Employment Status
        </h2>
        {employee.status === 'active' ? (
          <div
            style={{ backgroundColor: 'color-mix(in srgb, #f59e0b 10%, transparent)', border: '1px solid #f59e0b' }}
            className="rounded-xl p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">Terminate employment</p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-0.5">
                Sets this employee to Inactive.
              </p>
            </div>
            <form
              action={async () => {
                'use server'
                await terminateEmployee(id)
              }}
            >
              <button
                type="submit"
                style={{ backgroundColor: '#f59e0b', color: '#fff' }}
                className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Terminate
              </button>
            </form>
          </div>
        ) : (
          <div
            style={{ backgroundColor: 'color-mix(in srgb, #22c55e 10%, transparent)', border: '1px solid #22c55e' }}
            className="rounded-xl p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">Reactivate employee</p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-0.5">
                Sets this employee back to Active.
              </p>
            </div>
            <form
              action={async () => {
                'use server'
                await reactivateEmployee(id)
              }}
            >
              <button
                type="submit"
                style={{ backgroundColor: '#22c55e', color: '#fff' }}
                className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Reactivate
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div
        style={{ borderTop: '1px solid var(--border)' }}
        className="mt-8 pt-8"
      >
        <h2 style={{ color: 'var(--text-secondary)' }} className="text-xs font-semibold uppercase tracking-wider mb-4">
          Danger Zone
        </h2>
        <div
          style={{ backgroundColor: 'var(--danger-subtle)', border: '1px solid var(--danger)' }}
          className="rounded-xl p-4 flex items-center justify-between gap-4"
        >
          <div>
            <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">Delete this employee</p>
            <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-0.5">
              This action cannot be undone.
            </p>
          </div>
          <form
            action={async () => {
              'use server'
              await deleteEmployee(id)
            }}
          >
            <button
              type="submit"
              style={{ backgroundColor: 'var(--danger)', color: '#fff' }}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
