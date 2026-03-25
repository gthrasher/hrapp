'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Employee } from '@/lib/supabase'

type OrgNode = {
  employee: Employee
  children: OrgNode[]
}

export function OrgChart({ employees }: { employees: Employee[] }) {
  const [selected, setSelected] = useState<Employee | null>(null)

  const empMap = useMemo(
    () => new Map(employees.map(e => [e.id, e])),
    [employees]
  )

  const roots = useMemo(() => {
    const nodeMap = new Map<string, OrgNode>()
    for (const emp of employees) {
      nodeMap.set(emp.id, { employee: emp, children: [] })
    }

    const roots: OrgNode[] = []
    for (const emp of employees) {
      const node = nodeMap.get(emp.id)!
      if (emp.manager_id && nodeMap.has(emp.manager_id)) {
        nodeMap.get(emp.manager_id)!.children.push(node)
      } else {
        roots.push(node)
      }
    }

    function sort(nodes: OrgNode[]) {
      nodes.sort((a, b) =>
        (a.employee.last_name + a.employee.first_name).localeCompare(
          b.employee.last_name + b.employee.first_name
        )
      )
      for (const n of nodes) sort(n.children)
    }
    sort(roots)

    return roots
  }, [employees])

  if (roots.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <p style={{ color: 'var(--text-tertiary)' }} className="text-sm">
          No employees found.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="inline-flex gap-16 justify-center pt-2 pb-16 px-12">
          {roots.map(root => (
            <OrgTree key={root.employee.id} node={root} onSelect={setSelected} />
          ))}
        </div>
      </div>

      {selected && (
        <EmployeeModal
          employee={selected}
          manager={selected.manager_id ? (empMap.get(selected.manager_id) ?? null) : null}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}

function OrgTree({
  node,
  onSelect,
}: {
  node: OrgNode
  onSelect: (e: Employee) => void
}) {
  const { employee, children } = node

  return (
    <div className="flex flex-col items-center">
      <NodeCard employee={employee} onSelect={() => onSelect(employee)} />

      {children.length > 0 && (
        <>
          {/* Vertical stem from parent down to H-bar */}
          <div style={{ width: 1, height: 32, backgroundColor: 'var(--border)' }} />

          {/* Children row */}
          <div className="flex">
            {children.map((child, i) => {
              const isFirst = i === 0
              const isLast = i === children.length - 1
              const isOnly = children.length === 1
              return (
                <div
                  key={child.employee.id}
                  className="relative flex flex-col items-center"
                  style={{
                    paddingLeft: isOnly ? 0 : 20,
                    paddingRight: isOnly ? 0 : 20,
                  }}
                >
                  {/* Horizontal connector segment */}
                  {!isOnly && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: isFirst ? '50%' : 0,
                        right: isLast ? '50%' : 0,
                        height: 1,
                        backgroundColor: 'var(--border)',
                      }}
                    />
                  )}
                  {/* Vertical line down to child */}
                  <div style={{ width: 1, height: 32, backgroundColor: 'var(--border)' }} />
                  <OrgTree node={child} onSelect={onSelect} />
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function NodeCard({
  employee,
  onSelect,
}: {
  employee: Employee
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-opacity hover:opacity-75 active:opacity-60"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        width: 144,
      }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}
      >
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>

      {/* Name + title */}
      <div className="w-full">
        <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
          {employee.first_name} {employee.last_name}
        </p>
        {employee.job_title && (
          <p className="text-xs leading-tight mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
            {employee.job_title}
          </p>
        )}
      </div>

      {/* Status dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full ${employee.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`}
      />
    </button>
  )
}

function EmployeeModal({
  employee,
  manager,
  onClose,
}: {
  employee: Employee
  manager: Employee | null
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl relative"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--surface-raised)' }}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}
          >
            <svg
              width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {employee.first_name} {employee.last_name}
            </h2>
            {(employee.job_title || employee.department) && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {[employee.job_title, employee.department].filter(Boolean).join(' · ')}
              </p>
            )}
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mt-1.5"
              style={employee.status === 'active'
                ? { backgroundColor: 'var(--success-subtle)', color: 'var(--success-text)' }
                : { backgroundColor: 'var(--surface-raised)', color: 'var(--text-tertiary)' }
              }
            >
              <span className={`w-1.5 h-1.5 rounded-full ${employee.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`} />
              {employee.status}
            </span>
          </div>
        </div>

        {/* Details */}
        <dl className="space-y-3 mb-6">
          <DetailRow label="Email" value={employee.email} />
          {employee.phone && <DetailRow label="Phone" value={employee.phone} />}
          {manager && (
            <DetailRow label="Manager" value={`${manager.first_name} ${manager.last_name}`} />
          )}
          {employee.division && <DetailRow label="Division" value={employee.division} />}
          {employee.cost_center && <DetailRow label="Cost center" value={employee.cost_center} />}
          {employee.start_date && (
            <DetailRow
              label="Start date"
              value={new Date(employee.start_date + 'T00:00:00').toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            />
          )}
        </dl>

        {/* Edit button */}
        <Link
          href={`/employees/${employee.id}`}
          className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          Edit employee
        </Link>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <dt className="w-24 shrink-0 text-right" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </dt>
      <dd style={{ color: 'var(--text-primary)' }}>{value}</dd>
    </div>
  )
}
