import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PADELELO',
  description: 'Tu ranking. Tu nivel. Encontrá partidas de pádel.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0f0f0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-brand-dark text-white`}>
        <main>{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
