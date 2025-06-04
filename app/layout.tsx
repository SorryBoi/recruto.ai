import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import FirebaseInitializer from "@/components/FirebaseInitializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Recruto.ai - AI-Powered Interview Preparation",
  description: "Transform your interview skills with AI-powered coaching, personalized feedback, and expert guidance.",
  keywords: "interview preparation, job interview, career coaching, AI interview, mock interview",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#2563eb" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://recruto.ai" />
        <meta property="og:image" content="https://recruto.ai/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
      </head>
      <body className={inter.className}>
        <FirebaseInitializer />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
