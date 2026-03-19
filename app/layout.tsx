import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Providers } from './providers'
import { Navbar } from './components/Navbar'
import { auth0 } from '@/lib/auth0'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PeopleOps',
  description: 'Employee management',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth0.getSession()
  const user = session?.user ?? null

  return (
    <html lang="en" className={geistSans.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar user={user} />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
