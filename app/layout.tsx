import type { Metadata, Viewport } from 'next'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'SmartPromts - AI Prompt Optimizer',
  description: 'Optimize your AI prompts for any model with advanced caching and dynamic balancing',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SmartPromts',
  },
}

export const viewport: Viewport = {
  themeColor: '#06b6d4',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
