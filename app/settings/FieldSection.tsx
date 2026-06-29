'use client'

import { useActionState } from 'react'
import type { FieldOption } from '@/lib/db'
import { addFieldOption, deleteFieldOption } from './actions'

interface FieldSectionProps {
  fieldName: string
  label: string
  options: FieldOption[]
}

const inputClass = 'flex-1 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2'
const inputStyle = {
  backgroundColor: 'var(--surface-raised)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
}

export function FieldSection({ fieldName, label, options }: FieldSectionProps) {
  const addWithField = addFieldOption.bind(null, fieldName)
  const [error, formAction, pending] = useActionState(addWithField, null)

  return (
    <section
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      className="rounded-xl p-5 space-y-4"
    >
      <h2 style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">
        {label}
      </h2>

      {options.length === 0 ? (
        <p style={{ color: 'var(--text-tertiary)' }} className="text-sm">No values yet.</p>
      ) : (
        <div style={{ maxHeight: '11.25rem', overflowY: 'auto' }}>
          <ul className="space-y-1">
            {options.map(opt => (
              <li
                key={opt.id}
                className="flex items-center justify-between gap-3 py-1.5"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span style={{ color: 'var(--text-primary)' }} className="text-sm">{opt.value}</span>
                <form action={deleteFieldOption.bind(null, opt.id)}>
                  <button
                    type="submit"
                    style={{ color: 'var(--danger)' }}
                    className="text-xs px-2 py-0.5 rounded hover:opacity-70 transition-opacity"
                    aria-label={`Remove ${opt.value}`}
                  >
                    ×
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form action={formAction} className="flex gap-2 pt-1">
        <input
          name="value"
          type="text"
          placeholder="Add value…"
          className={inputClass}
          style={inputStyle}
          required
        />
        <button
          type="submit"
          disabled={pending}
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex-shrink-0"
        >
          {pending ? '…' : 'Add'}
        </button>
      </form>
      {error && (
        <p style={{ color: 'var(--danger)' }} className="text-xs">{error}</p>
      )}
    </section>
  )
}
