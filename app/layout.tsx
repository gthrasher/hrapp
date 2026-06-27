import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { Providers } from './providers'
import { Navbar } from './components/Navbar'
import { auth0 } from '@/lib/auth0'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['200', '400', '700'],
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
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar user={user} />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
