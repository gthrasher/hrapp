import { getSupabase } from '@/lib/db'
import type { FieldOption } from '@/lib/db'
import { FieldSection } from './FieldSection'

export const dynamic = 'force-dynamic'

const FIELDS: { fieldName: string; label: string }[] = [
  { fieldName: 'department', label: 'Department' },
  { fieldName: 'user_type', label: 'User Type' },
  { fieldName: 'cost_center', label: 'Cost Center' },
  { fieldName: 'division', label: 'Division' },
]

export default async function SettingsPage() {
  const { data } = await getSupabase()
    .from('field_options')
    .select('*')
    .order('sort_order', { ascending: true })

  const options: FieldOption[] = data ?? []

  const grouped: Record<string, FieldOption[]> = {}
  for (const opt of options) {
    if (!grouped[opt.field_name]) grouped[opt.field_name] = []
    grouped[opt.field_name].push(opt)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">
          Manage dropdown values used in employee forms.
        </p>
      </div>

      <div className="space-y-6">
        {FIELDS.map(({ fieldName, label }) => (
          <FieldSection
            key={fieldName}
            fieldName={fieldName}
            label={label}
            options={grouped[fieldName] ?? []}
          />
        ))}
      </div>
    </div>
  )
}
