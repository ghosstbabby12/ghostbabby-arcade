import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ghostbabby Arcade',
  description: 'Mini juegos retro desarrollados con Canvas API y TypeScript — por Camila Bastidas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
