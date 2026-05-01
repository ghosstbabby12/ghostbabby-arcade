'use client'

import PacmanGame from '@/components/PacmanGame'
import Link from 'next/link'

export default function PacmanPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <Link
        href="/arcade"
        className="fixed top-4 left-4 z-50 px-4 py-2 font-bold rounded-lg border-2 text-sm transition-all hover:scale-105"
        style={{ backgroundColor: '#7c3aed', color: '#fff', borderColor: '#a855f7', fontFamily: 'monospace' }}
      >
        ← MENÚ
      </Link>
      <PacmanGame />
    </div>
  )
}
