'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { getOkta } from '@/lib/okta'

// ─── helpers ──────────────────────────────────────────────────────────────────

function oktaProfile(fields: {
  first_name: string
  last_name: string
  email: string
  phone?: string | null
  department?: string | null
  job_title?: string | null
  manager_email?: string | null  // undefined = omit; null = clear; string = set
}) {
  return {
    firstName: fields.first_name,
    lastName: fields.last_name,
    email: fields.email,
    login: fields.email,
    ...(fields.phone      && { mobilePhone: fields.phone }),
    ...(fields.department && { department:  fields.department }),
    ...(fields.job_title  && { title:       fields.job_title }),
    ...(fields.manager_email !== undefined ? { manager: fields.manager_email } : {}),
  }
}

async function getOktaId(id: string): Promise<string | null> {
  const { data } = await getSupabase()
    .from('employees')
    .select('okta_id')
    .eq('id', id)
    .single()
  return data?.okta_id ?? null
}

async function getManagerEmail(manager_id: string | null): Promise<string | null> {
  if (!manager_id) return null
  const { data } = await getSupabase()
    .from('employees')
    .select('email')
    .eq('id', manager_id)
    .single()
  return data?.email ?? null
}

// ─── actions ──────────────────────────────────────────────────────────────────

export async function createEmployee(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const first_name  = formData.get('first_name')  as string
  const last_name   = formData.get('last_name')   as string
  const email       = formData.get('email')        as string
  const phone       = (formData.get('phone')       as string) || null
  const department  = (formData.get('department')  as string) || null
  const job_title   = (formData.get('job_title')   as string) || null
  const start_date  = (formData.get('start_date')  as string) || null
  const status      = (formData.get('status')      as string) || 'active'
  const user_type   = (formData.get('user_type')   as string) || null
  const cost_center = (formData.get('cost_center') as string) || null
  const division    = (formData.get('division')    as string) || null
  const manager_id  = (formData.get('manager_id')  as string) || null

  // 1. Resolve manager email for Okta sync
  const manager_email = await getManagerEmail(manager_id)

  // 2. Create Okta user so we can store the returned ID
  let okta_id: string | null = null
  try {
    const oktaUser = await getOkta().userApi.createUser({
      body: { profile: oktaProfile({ first_name, last_name, email, phone, department, job_title, manager_email }) },
      activate: true,   // sends welcome / activation email
    })
    okta_id = oktaUser.id ?? null
  } catch (err: any) {
    return `Okta error: ${err.message ?? String(err)}`
  }

  // 3. Insert into Supabase
  const { error } = await getSupabase().from('employees').insert({
    first_name, last_name, email, phone, department, job_title,
    start_date, status, user_type, cost_center, division, okta_id, manager_id,
  })

  if (error) {
    // Best-effort cleanup: deactivate the Okta user we just created
    if (okta_id) {
      try { await getOkta().userApi.deactivateUser({ userId: okta_id }) } catch {}
    }
    return error.message
  }

  revalidatePath('/employees')
  redirect('/employees')
}

export async function updateEmployee(
  id: string,
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const first_name  = formData.get('first_name')  as string
  const last_name   = formData.get('last_name')   as string
  const email       = formData.get('email')        as string
  const phone       = (formData.get('phone')       as string) || null
  const department  = (formData.get('department')  as string) || null
  const job_title   = (formData.get('job_title')   as string) || null
  const start_date  = (formData.get('start_date')  as string) || null
  const status      = formData.get('status')       as string
  const user_type   = (formData.get('user_type')   as string) || null
  const cost_center = (formData.get('cost_center') as string) || null
  const division    = (formData.get('division')    as string) || null
  const manager_id  = (formData.get('manager_id')  as string) || null

  // 1. Update Supabase
  const { error } = await getSupabase()
    .from('employees')
    .update({ first_name, last_name, email, phone, department, job_title,
              start_date, status, user_type, cost_center, division, manager_id })
    .eq('id', id)

  if (error) return error.message

  // 2. Mirror profile changes to Okta (skipped if employee has no okta_id)
  const [okta_id, manager_email] = await Promise.all([
    getOktaId(id),
    getManagerEmail(manager_id),
  ])
  if (okta_id) {
    try {
      await getOkta().userApi.updateUser({
        userId: okta_id,
        user: { profile: oktaProfile({ first_name, last_name, email, phone, department, job_title, manager_email }) },
      })
    } catch (err: any) {
      return `Saved locally but Okta sync failed: ${err.message ?? String(err)}`
    }
  }

  revalidatePath('/employees')
  redirect('/employees')
}

export async function deleteEmployee(id: string): Promise<void> {
  const okta_id = await getOktaId(id)

  await getSupabase().from('employees').delete().eq('id', id)

  if (okta_id) {
    try {
      // Okta requires deactivation before deletion
      await getOkta().userApi.deactivateUser({ userId: okta_id })
      await getOkta().userApi.deleteUser({ userId: okta_id })
    } catch {}
  }

  revalidatePath('/employees')
  redirect('/employees')
}

export async function terminateEmployee(id: string): Promise<void> {
  const okta_id = await getOktaId(id)

  await getSupabase().from('employees').update({ status: 'inactive' }).eq('id', id)

  if (okta_id) {
    try { await getOkta().userApi.deactivateUser({ userId: okta_id }) } catch {}
  }

  revalidatePath('/employees')
  revalidatePath(`/employees/${id}`)
  redirect('/employees')
}

export async function reactivateEmployee(id: string): Promise<void> {
  const okta_id = await getOktaId(id)

  await getSupabase().from('employees').update({ status: 'active' }).eq('id', id)

  if (okta_id) {
    try { await getOkta().userApi.reactivateUser({ userId: okta_id, sendEmail: true }) } catch {}
  }

  revalidatePath('/employees')
  revalidatePath(`/employees/${id}`)
  redirect('/employees')
}
