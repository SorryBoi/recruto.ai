import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Recruto.AI',
  description: 'Created for Job Prep',
  generator: 'preeth',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
