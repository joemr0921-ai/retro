import type { Metadata } from 'next'
import { Inter, Space_Grotesk, Space_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ReTro — Retirement Planning for Your Future',
    template: '%s | ReTro',
  },
  description:
    "Retirement planning feels retro. We're making it your future. Start building wealth in your 20s with ReTro's simple, modern retirement tools.",
  keywords: ['retirement planning', 'personal finance', 'young adults', '401k', 'investing'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'ReTro — Retirement Planning for Your Future',
    description: "Retirement planning feels retro. We're making it your future.",
    siteName: 'ReTro',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
      >
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
