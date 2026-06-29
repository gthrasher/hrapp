'use server'

import { revalidatePath } from 'next/cache'
import { getSupabase } from '@/lib/db'

export async function addFieldOption(
  fieldName: string,
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const value = (formData.get('value') as string)?.trim()
  if (!value) return 'Value is required'

  const { data: existing } = await getSupabase()
    .from('field_options')
    .select('sort_order')
    .eq('field_name', fieldName)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 1

  const { error } = await getSupabase().from('field_options').insert({
    field_name: fieldName,
    value,
    sort_order: nextOrder,
  })

  if (error) return error.message

  revalidatePath('/settings')
  return null
}

export async function deleteFieldOption(id: string): Promise<void> {
  await getSupabase().from('field_options').delete().eq('id', id)
  revalidatePath('/settings')
}
