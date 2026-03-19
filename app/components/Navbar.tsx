'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface NavbarUser {
  name?: string | null
  email?: string | null
  picture?: string | null
}

interface NavbarProps {
  user: NavbarUser | null
}

const navLinks = [
  { href: '/employees', label: 'Employees' },
  { href: '/settings', label: 'Settings' },
]

export function Navbar({ user }: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => setMounted(true), [])

  return (
    <header
      style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/employees"
            style={{ color: 'var(--text-primary)' }}
            className="flex items-center gap-2.5 font-semibold text-base tracking-tight hover:opacity-80 transition-opacity"
          >
            <span
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            >
              HR
            </span>
            PeopleOps
          </Link>

          {user && (
            <nav className="flex items-center gap-1">
              {navLinks.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      color: active ? 'var(--accent)' : 'var(--text-secondary)',
                      backgroundColor: active ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>
          )}
        </div>

        {/* Right: theme toggle + user */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            style={{
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
            aria-label="Toggle theme"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* User avatar / sign-in */}
          {user ? (
            <div className="flex items-center gap-2">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name ?? 'User'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div
                  style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                >
                  {(user.name ?? user.email ?? '?')[0].toUpperCase()}
                </div>
              )}
              <a
                href="/auth/logout"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Sign out
              </a>
            </div>
          ) : (
            <a
              href="/auth/login"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
              className="px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Sign in
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
