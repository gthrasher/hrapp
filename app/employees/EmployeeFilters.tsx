'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'

interface EmployeeFiltersProps {
  departments: string[]
}

const inputClass = 'rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2'
const inputStyle = {
  backgroundColor: 'var(--surface-raised)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
}

export function EmployeeFilters({ departments }: EmployeeFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  const hasFilters = searchParams.has('q') || searchParams.has('status') || searchParams.has('department')

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <svg
          width="14" height="14"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ color: 'var(--text-tertiary)' }}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search name or email…"
          defaultValue={searchParams.get('q') ?? ''}
          onChange={e => update('q', e.target.value)}
          className={inputClass + ' w-full pl-9'}
          style={inputStyle}
        />
      </div>

      {/* Status filter */}
      <select
        defaultValue={searchParams.get('status') ?? ''}
        onChange={e => update('status', e.target.value)}
        className={inputClass}
        style={inputStyle}
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {/* Department filter */}
      {departments.length > 0 && (
        <select
          defaultValue={searchParams.get('department') ?? ''}
          onChange={e => update('department', e.target.value)}
          className={inputClass}
          style={inputStyle}
        >
          <option value="">All departments</option>
          {departments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => router.replace(pathname)}
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          className="px-3 py-2 rounded-lg text-sm hover:opacity-70 transition-opacity"
        >
          Clear
        </button>
      )}
    </div>
  )
}
