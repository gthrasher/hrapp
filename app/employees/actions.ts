'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

export async function createEmployee(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const { error } = await getSupabase().from('employees').insert({
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    email: formData.get('email') as string,
    phone: (formData.get('phone') as string) || null,
    department: (formData.get('department') as string) || null,
    job_title: (formData.get('job_title') as string) || null,
    start_date: (formData.get('start_date') as string) || null,
    status: (formData.get('status') as string) || 'active',
    user_type: (formData.get('user_type') as string) || null,
    cost_center: (formData.get('cost_center') as string) || null,
    division: (formData.get('division') as string) || null,
  })

  if (error) return error.message

  revalidatePath('/employees')
  redirect('/employees')
}

export async function updateEmployee(
  id: string,
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const { error } = await getSupabase()
    .from('employees')
    .update({
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || null,
      department: (formData.get('department') as string) || null,
      job_title: (formData.get('job_title') as string) || null,
      start_date: (formData.get('start_date') as string) || null,
      status: formData.get('status') as string,
      user_type: (formData.get('user_type') as string) || null,
      cost_center: (formData.get('cost_center') as string) || null,
      division: (formData.get('division') as string) || null,
    })
    .eq('id', id)

  if (error) return error.message

  revalidatePath('/employees')
  redirect('/employees')
}

export async function deleteEmployee(id: string): Promise<void> {
  await getSupabase().from('employees').delete().eq('id', id)
  revalidatePath('/employees')
  redirect('/employees')
}

export async function terminateEmployee(id: string): Promise<void> {
  await getSupabase().from('employees').update({ status: 'inactive' }).eq('id', id)
  revalidatePath('/employees')
  revalidatePath(`/employees/${id}`)
  redirect('/employees')
}

export async function reactivateEmployee(id: string): Promise<void> {
  await getSupabase().from('employees').update({ status: 'active' }).eq('id', id)
  revalidatePath('/employees')
  revalidatePath(`/employees/${id}`)
  redirect('/employees')
}
