'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { Employee } from '@/lib/supabase'

type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>

interface EmployeeFormProps {
  action: ActionFn
  employee?: Employee
  fieldOptions: Record<string, string[]>
}

const inputClass = 'w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2'

const inputStyle = {
  backgroundColor: 'var(--surface-raised)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
}

export function EmployeeForm({ action, employee, fieldOptions }: EmployeeFormProps) {
  const [error, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-6">
      {error && (
        <div
          style={{ backgroundColor: 'var(--danger-subtle)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
          className="rounded-lg px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      {/* Personal Info */}
      <section
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        className="rounded-xl p-5 space-y-4"
      >
        <h2 style={{ color: 'var(--text-secondary)' }} className="text-xs font-semibold uppercase tracking-wider">
          Personal Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name" required>
            <input
              id="first_name" name="first_name" type="text" required
              defaultValue={employee?.first_name}
              className={inputClass}
              style={inputStyle}
            />
          </Field>
          <Field label="Last name" required>
            <input
              id="last_name" name="last_name" type="text" required
              defaultValue={employee?.last_name}
              className={inputClass}
              style={inputStyle}
            />
          </Field>
        </div>
        <Field label="Email" required>
          <input
            id="email" name="email" type="email" required
            defaultValue={employee?.email}
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Phone">
          <input
            id="phone" name="phone" type="tel"
            defaultValue={employee?.phone ?? ''}
            className={inputClass}
            style={inputStyle}
          />
        </Field>
      </section>

      {/* Employment */}
      <section
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        className="rounded-xl p-5 space-y-4"
      >
        <h2 style={{ color: 'var(--text-secondary)' }} className="text-xs font-semibold uppercase tracking-wider">
          Employment
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Job title">
            <input
              id="job_title" name="job_title" type="text"
              defaultValue={employee?.job_title ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </Field>
          <Field label="Department">
            <select
              id="department" name="department"
              defaultValue={employee?.department ?? ''}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">—</option>
              {(fieldOptions.department ?? []).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="User type">
            <select
              id="user_type" name="user_type"
              defaultValue={employee?.user_type ?? ''}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">—</option>
              {(fieldOptions.user_type ?? []).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Start date">
            <input
              id="start_date" name="start_date" type="date"
              defaultValue={employee?.start_date ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Status">
            <select
              id="status" name="status"
              defaultValue={employee?.status ?? 'active'}
              className={inputClass}
              style={inputStyle}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Organization */}
      <section
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        className="rounded-xl p-5 space-y-4"
      >
        <h2 style={{ color: 'var(--text-secondary)' }} className="text-xs font-semibold uppercase tracking-wider">
          Organization
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Cost center">
            <select
              id="cost_center" name="cost_center"
              defaultValue={employee?.cost_center ?? ''}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">—</option>
              {(fieldOptions.cost_center ?? []).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Division">
            <select
              id="division" name="division"
              defaultValue={employee?.division ?? ''}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">—</option>
              {(fieldOptions.division ?? []).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          className="px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
        <Link
          href="/employees"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          className="px-5 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label style={{ color: 'var(--text-secondary)' }} className="block text-sm font-medium">
        {label}
        {required && <span style={{ color: 'var(--danger)' }} className="ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
