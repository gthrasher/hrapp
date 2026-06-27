/**
 * MCP (Model Context Protocol) server for HRApp.
 * Implements the MCP Streamable HTTP transport (JSON-RPC 2.0).
 *
 * Endpoint: POST /mcp
 *
 * Authentication (two modes — either is accepted):
 *
 *  1. Auth0 session cookie  — any user logged in via the HRApp browser UI already
 *     has a valid session. Browser-based MCP clients inherit this automatically.
 *
 *  2. Auth0 Bearer token    — for programmatic MCP clients (Claude Desktop, etc.)
 *     obtain an access token from Auth0 and pass it as:
 *       Authorization: Bearer <access_token>
 *
 *     To get a token for a Machine-to-Machine (M2M) client:
 *       curl -X POST https://<AUTH0_DOMAIN>/oauth/token \
 *         -d '{"client_id":"<M2M_CLIENT_ID>","client_secret":"<M2M_CLIENT_SECRET>",
 *              "audience":"<AUTH0_AUDIENCE>","grant_type":"client_credentials"}'
 *
 *     For user access tokens (e.g. via the SPA / device flow):
 *       Set AUTH0_AUDIENCE to your API identifier in Auth0 Dashboard → APIs.
 *
 * Available tools:
 *   Employees:  list_employees, get_employee, create_employee, update_employee,
 *               delete_employee, terminate_employee, reactivate_employee
 *   Settings:   list_field_options, add_field_option, delete_field_option
 */

import { jwtVerify, createRemoteJWKSet } from 'jose'
import { auth0 } from '@/lib/auth0'
import { getSupabase } from '@/lib/supabase'
import { getOkta } from '@/lib/okta'

export const dynamic = 'force-dynamic'

// ─── Authentication ───────────────────────────────────────────────────────────

// Lazily initialised — createRemoteJWKSet caches fetched keys internally.
let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null
function getJwks() {
  if (!_jwks) {
    _jwks = createRemoteJWKSet(
      new URL(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`)
    )
  }
  return _jwks
}

/**
 * Returns true when the request carries valid Auth0 credentials:
 *   - A Bearer JWT (validated via Auth0 JWKS), or
 *   - A live Auth0 session cookie (from the browser UI login).
 */
async function isAuthenticated(request: Request): Promise<boolean> {
  // 1. Bearer token — for programmatic MCP clients
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      await jwtVerify(token, getJwks(), {
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        audience: process.env.AUTH0_AUDIENCE,
      })
      return true
    } catch {
      return false
    }
  }

  // 2. Session cookie — for browser-based clients / local dev
  try {
    const session = await auth0.getSession()
    return session !== null
  } catch {
    return false
  }
}

const UNAUTHORIZED = Response.json(
  { error: 'Unauthorized', hint: 'Provide a valid Auth0 Bearer token or log in via the browser first.' },
  { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="hrapp-mcp"' } }
)

// ─── MCP protocol constants ───────────────────────────────────────────────────

const PROTOCOL_VERSION = '2024-11-05'
const SERVER_INFO = { name: 'hrapp-mcp', version: '1.0.0' }

// ─── Tool definitions (JSON Schema) ──────────────────────────────────────────

const TOOLS = [
  {
    name: 'list_employees',
    description: 'List all employees. Optionally filter by status, department, or search term.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'inactive'],
          description: 'Filter by employment status',
        },
        department: {
          type: 'string',
          description: 'Filter by exact department name',
        },
        search: {
          type: 'string',
          description: 'Case-insensitive search across first name, last name, and email',
        },
      },
    },
  },
  {
    name: 'get_employee',
    description: 'Get a single employee record by their UUID.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Employee UUID' },
      },
    },
  },
  {
    name: 'create_employee',
    description:
      'Create a new employee. Provisions an Okta account and sends the activation email.',
    inputSchema: {
      type: 'object',
      required: ['first_name', 'last_name', 'email'],
      properties: {
        first_name:   { type: 'string' },
        last_name:    { type: 'string' },
        email:        { type: 'string', format: 'email' },
        phone:        { type: 'string' },
        department:   { type: 'string' },
        job_title:    { type: 'string' },
        start_date:   { type: 'string', format: 'date', description: 'YYYY-MM-DD' },
        status:       { type: 'string', enum: ['active', 'inactive'], default: 'active' },
        user_type:    { type: 'string' },
        cost_center:  { type: 'string' },
        division:     { type: 'string' },
        manager_id:   { type: 'string', description: 'UUID of the reporting manager' },
      },
    },
  },
  {
    name: 'update_employee',
    description:
      'Update one or more fields on an existing employee. Only provided fields are changed. Syncs identity fields to Okta.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id:           { type: 'string', description: 'Employee UUID' },
        first_name:   { type: 'string' },
        last_name:    { type: 'string' },
        email:        { type: 'string', format: 'email' },
        phone:        { type: 'string' },
        department:   { type: 'string' },
        job_title:    { type: 'string' },
        start_date:   { type: 'string', format: 'date' },
        status:       { type: 'string', enum: ['active', 'inactive'] },
        user_type:    { type: 'string' },
        cost_center:  { type: 'string' },
        division:     { type: 'string' },
        manager_id:   { type: 'string' },
      },
    },
  },
  {
    name: 'delete_employee',
    description:
      'Permanently delete an employee record and remove their Okta account.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Employee UUID' },
      },
    },
  },
  {
    name: 'terminate_employee',
    description:
      "Set an employee's status to inactive and deactivate their Okta account. Use this instead of delete for offboarding.",
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Employee UUID' },
      },
    },
  },
  {
    name: 'reactivate_employee',
    description:
      "Set a terminated employee's status back to active and reactivate their Okta account.",
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Employee UUID' },
      },
    },
  },
  {
    name: 'list_field_options',
    description:
      'List configurable dropdown values used in employee forms. Optionally filter by field name.',
    inputSchema: {
      type: 'object',
      properties: {
        field_name: {
          type: 'string',
          enum: ['department', 'user_type', 'cost_center', 'division'],
          description: 'Return options for this field only',
        },
      },
    },
  },
  {
    name: 'add_field_option',
    description: 'Add a new dropdown value to a settings field (e.g. a new department or cost center).',
    inputSchema: {
      type: 'object',
      required: ['field_name', 'value'],
      properties: {
        field_name: {
          type: 'string',
          enum: ['department', 'user_type', 'cost_center', 'division'],
        },
        value: { type: 'string', description: 'The new option value' },
      },
    },
  },
  {
    name: 'delete_field_option',
    description: 'Delete a dropdown option by its UUID.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'FieldOption UUID' },
      },
    },
  },
]

// ─── Okta helpers ─────────────────────────────────────────────────────────────

function buildOktaProfile(fields: {
  first_name: string
  last_name: string
  email: string
  phone?: string | null
  department?: string | null
  job_title?: string | null
  manager_email?: string | null
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

async function fetchOktaId(employeeId: string): Promise<string | null> {
  const { data } = await getSupabase()
    .from('employees')
    .select('okta_id')
    .eq('id', employeeId)
    .single()
  return data?.okta_id ?? null
}

async function fetchManagerEmail(managerId: string | null): Promise<string | null> {
  if (!managerId) return null
  const { data } = await getSupabase()
    .from('employees')
    .select('email')
    .eq('id', managerId)
    .single()
  return data?.email ?? null
}

// ─── Tool implementations ─────────────────────────────────────────────────────

async function toolListEmployees(args: Record<string, unknown>) {
  let query = getSupabase()
    .from('employees')
    .select('*')
    .order('last_name', { ascending: true })

  if (args.status)     query = query.eq('status', args.status as string)
  if (args.department) query = query.eq('department', args.department as string)
  if (args.search) {
    const s = (args.search as string).replace(/[%_]/g, '\\$&')
    query = query.or(
      `first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%`
    )
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

async function toolGetEmployee(args: Record<string, unknown>) {
  const { data, error } = await getSupabase()
    .from('employees')
    .select('*')
    .eq('id', args.id as string)
    .single()
  if (error) throw new Error(error.code === 'PGRST116' ? 'Employee not found' : error.message)
  return data
}

async function toolCreateEmployee(args: Record<string, unknown>) {
  const {
    first_name, last_name, email,
    phone       = null,
    department  = null,
    job_title   = null,
    start_date  = null,
    status      = 'active',
    user_type   = null,
    cost_center = null,
    division    = null,
    manager_id  = null,
  } = args as Record<string, unknown>

  const manager_email = await fetchManagerEmail(manager_id as string | null)

  let okta_id: string | null = null
  try {
    const oktaUser = await getOkta().userApi.createUser({
      body: {
        profile: buildOktaProfile({
          first_name: first_name as string,
          last_name:  last_name as string,
          email:      email as string,
          phone:      phone as string | null,
          department: department as string | null,
          job_title:  job_title as string | null,
          manager_email,
        }),
      },
      activate: true,
    })
    okta_id = oktaUser.id ?? null
  } catch (err) {
    throw new Error(`Okta error: ${err instanceof Error ? err.message : String(err)}`)
  }

  const { data, error } = await getSupabase()
    .from('employees')
    .insert({
      first_name, last_name, email, phone, department, job_title,
      start_date, status, user_type, cost_center, division, okta_id, manager_id,
    })
    .select()
    .single()

  if (error) {
    if (okta_id) {
      try { await getOkta().userApi.deactivateUser({ userId: okta_id }) } catch {}
    }
    throw new Error(error.message)
  }

  return data
}

async function toolUpdateEmployee(args: Record<string, unknown>) {
  const { id, ...rawUpdates } = args as Record<string, unknown>
  if (!id) throw new Error('id is required')

  // Strip keys that weren't explicitly provided (ignore undefined)
  const updates: Record<string, unknown> = Object.fromEntries(
    Object.entries(rawUpdates).filter(([, v]) => v !== undefined)
  )
  if (Object.keys(updates).length === 0) throw new Error('No fields provided to update')

  // Fetch current record so we can merge for Okta sync
  const { data: current, error: fetchErr } = await getSupabase()
    .from('employees')
    .select('*')
    .eq('id', id as string)
    .single()
  if (fetchErr) throw new Error('Employee not found')

  const { error } = await getSupabase()
    .from('employees')
    .update(updates)
    .eq('id', id as string)
  if (error) throw new Error(error.message)

  // Sync merged profile to Okta
  const merged = { ...current, ...updates }
  const manager_email = await fetchManagerEmail(merged.manager_id ?? null)

  if (current.okta_id) {
    try {
      await getOkta().userApi.updateUser({
        userId: current.okta_id,
        user: {
          profile: buildOktaProfile({
            first_name:    merged.first_name,
            last_name:     merged.last_name,
            email:         merged.email,
            phone:         merged.phone,
            department:    merged.department,
            job_title:     merged.job_title,
            manager_email,
          }),
        },
      })
    } catch (err) {
      // Return the updated record but flag the Okta warning
      return {
        ...merged,
        _warning: `Saved locally but Okta sync failed: ${err instanceof Error ? err.message : String(err)}`,
      }
    }
  }

  const { data: updated } = await getSupabase()
    .from('employees')
    .select('*')
    .eq('id', id as string)
    .single()
  return updated
}

async function toolDeleteEmployee(args: Record<string, unknown>) {
  const { id } = args as Record<string, unknown>
  const okta_id = await fetchOktaId(id as string)

  const { error } = await getSupabase().from('employees').delete().eq('id', id as string)
  if (error) throw new Error(error.message)

  if (okta_id) {
    try {
      await getOkta().userApi.deactivateUser({ userId: okta_id })
      await getOkta().userApi.deleteUser({ userId: okta_id })
    } catch {}
  }

  return { success: true, deleted_id: id }
}

async function toolTerminateEmployee(args: Record<string, unknown>) {
  const { id } = args as Record<string, unknown>
  const okta_id = await fetchOktaId(id as string)

  const { error } = await getSupabase()
    .from('employees')
    .update({ status: 'inactive' })
    .eq('id', id as string)
  if (error) throw new Error(error.message)

  if (okta_id) {
    try { await getOkta().userApi.deactivateUser({ userId: okta_id }) } catch {}
  }

  return { success: true, id, status: 'inactive' }
}

async function toolReactivateEmployee(args: Record<string, unknown>) {
  const { id } = args as Record<string, unknown>
  const okta_id = await fetchOktaId(id as string)

  const { error } = await getSupabase()
    .from('employees')
    .update({ status: 'active' })
    .eq('id', id as string)
  if (error) throw new Error(error.message)

  if (okta_id) {
    try { await getOkta().userApi.reactivateUser({ userId: okta_id, sendEmail: true }) } catch {}
  }

  return { success: true, id, status: 'active' }
}

async function toolListFieldOptions(args: Record<string, unknown>) {
  let query = getSupabase()
    .from('field_options')
    .select('*')
    .order('field_name', { ascending: true })
    .order('sort_order', { ascending: true })

  if (args.field_name) query = query.eq('field_name', args.field_name as string)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

async function toolAddFieldOption(args: Record<string, unknown>) {
  const { field_name, value } = args as Record<string, string>
  if (!value?.trim()) throw new Error('value is required')

  const { data: existing } = await getSupabase()
    .from('field_options')
    .select('sort_order')
    .eq('field_name', field_name)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 1

  const { data, error } = await getSupabase()
    .from('field_options')
    .insert({ field_name, value: value.trim(), sort_order: nextOrder })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

async function toolDeleteFieldOption(args: Record<string, unknown>) {
  const { id } = args as Record<string, unknown>
  const { error } = await getSupabase().from('field_options').delete().eq('id', id as string)
  if (error) throw new Error(error.message)
  return { success: true, deleted_id: id }
}

// ─── Tool dispatcher ──────────────────────────────────────────────────────────

async function callTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'list_employees':      return toolListEmployees(args)
    case 'get_employee':        return toolGetEmployee(args)
    case 'create_employee':     return toolCreateEmployee(args)
    case 'update_employee':     return toolUpdateEmployee(args)
    case 'delete_employee':     return toolDeleteEmployee(args)
    case 'terminate_employee':  return toolTerminateEmployee(args)
    case 'reactivate_employee': return toolReactivateEmployee(args)
    case 'list_field_options':  return toolListFieldOptions(args)
    case 'add_field_option':    return toolAddFieldOption(args)
    case 'delete_field_option': return toolDeleteFieldOption(args)
    default:
      throw Object.assign(new Error(`Unknown tool: ${name}`), { code: -32601 })
  }
}

// ─── JSON-RPC helpers ─────────────────────────────────────────────────────────

function ok(id: unknown, result: unknown) {
  return Response.json({ jsonrpc: '2.0', id, result })
}

function rpcError(id: unknown, code: number, message: string) {
  return Response.json({ jsonrpc: '2.0', id, error: { code, message } })
}

// ─── Route handlers ───────────────────────────────────────────────────────────

/** MCP discovery / health-check. */
export async function GET(request: Request) {
  if (!(await isAuthenticated(request))) return UNAUTHORIZED
  return Response.json({
    name: SERVER_INFO.name,
    version: SERVER_INFO.version,
    description: 'MCP server for HRApp — manage employees and settings',
    protocolVersion: PROTOCOL_VERSION,
    tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
  })
}

/** Main MCP JSON-RPC 2.0 handler. */
export async function POST(request: Request) {
  if (!(await isAuthenticated(request))) return UNAUTHORIZED

  let id: unknown = null

  try {
    const body = await request.json()
    id = body.id ?? null
    const { jsonrpc, method, params } = body

    if (jsonrpc !== '2.0') {
      return rpcError(id, -32600, "Invalid Request: 'jsonrpc' must be '2.0'")
    }

    // Notifications are one-way — acknowledge with 202, no body
    if (typeof method === 'string' && method.startsWith('notifications/')) {
      return new Response(null, { status: 202 })
    }

    switch (method) {
      case 'initialize':
        return ok(id, {
          protocolVersion: PROTOCOL_VERSION,
          serverInfo: SERVER_INFO,
          capabilities: { tools: {} },
        })

      case 'tools/list':
        return ok(id, { tools: TOOLS })

      case 'tools/call': {
        const toolName = params?.name as string | undefined
        const toolArgs = (params?.arguments ?? {}) as Record<string, unknown>

        if (!toolName) {
          return rpcError(id, -32602, "Invalid params: 'name' is required")
        }

        try {
          const result = await callTool(toolName, toolArgs)
          return ok(id, {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          })
        } catch (err) {
          return ok(id, {
            content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }],
            isError: true,
          })
        }
      }

      default:
        return rpcError(id, -32601, `Method not found: ${method}`)
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      return rpcError(null, -32700, 'Parse error')
    }
    return rpcError(id, -32603, `Internal error: ${err instanceof Error ? err.message : String(err)}`)
  }
}
