import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crystal Diffraction Simulator',
  description: 'Interactive 3D visualization of crystal structures and diffraction patterns',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
