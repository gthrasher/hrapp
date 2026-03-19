export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-24">

      {/* Hero */}
      <div className="flex flex-col items-center text-center max-w-lg gap-6">

        {/* Logo mark */}
        <div
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold tracking-tight shadow-lg"
        >
          HR
        </div>

        {/* App name + tagline */}
        <div className="space-y-3">
          <h1
            style={{ color: 'var(--text-primary)' }}
            className="text-4xl font-semibold tracking-tight"
          >
            PeopleOps
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-lg leading-relaxed">
            Simple, fast employee management for modern teams.
          </p>
        </div>

        {/* Sign-in CTA */}
        <a
          href="/auth/login"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm mt-2"
        >
          Sign in to continue
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 w-full max-w-2xl">
        {[
          { icon: '👥', title: 'Employee directory', desc: 'Search and filter your entire workforce in one place.' },
          { icon: '⚙️', title: 'Configurable fields', desc: 'Manage departments, cost centers, and divisions from Settings.' },
          { icon: '🔒', title: 'Secure access', desc: 'Auth0-powered login keeps your HR data protected.' },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            className="rounded-xl p-5 space-y-2"
          >
            <div className="text-2xl">{icon}</div>
            <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{title}</p>
            <p style={{ color: 'var(--text-secondary)' }} className="text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

    </div>
  )
}
