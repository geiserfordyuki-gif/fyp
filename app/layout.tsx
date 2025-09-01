import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono as GeistMono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "../lib/auth-context";

const geistMono = GeistMono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EduPot Dashboard",
  description: "Honeypot For Education",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${geistMono.className} bg-black text-white antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}