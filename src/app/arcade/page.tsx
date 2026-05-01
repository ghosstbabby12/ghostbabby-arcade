'use client'

import { useState } from 'react'
import PacmanGame from '@/components/PacmanGame'
import BooGame from '@/components/BooGame'
import Link from 'next/link'

export default function ArcadePage() {
  const [selectedGame, setSelectedGame] = useState<'menu' | 'pacman' | 'boo'>('menu')

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">

      {/* Back to Portfolio */}
      <a
        href="https://ghostbabby-portfolio.vercel.app/#projects"
        className="fixed top-4 left-4 z-50 px-6 py-3 font-bold rounded-lg border-2 shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ fontFamily: 'monospace', backgroundColor: '#7c3aed', color: '#ffffff', borderColor: '#a855f7' }}
      >
        ← PORTAFOLIO
      </a>

      <div className="relative w-full max-w-7xl">

        {/* Top Marquee */}
        <div
          className="relative mb-4 md:mb-6 rounded-t-3xl border-4 md:border-8 shadow-2xl overflow-hidden"
          style={{ background: 'linear-gradient(to right, #2563eb, #3b82f6, #2563eb)', borderColor: '#f97316' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="relative py-3 px-4 md:py-6 md:px-8 text-center">
            <p className="text-xs md:text-sm text-yellow-300 font-bold tracking-widest mb-1">CAMILA BASTIDAS —</p>
            <h1
              className="text-3xl md:text-6xl font-black text-yellow-300 tracking-tight"
              style={{ textShadow: '0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,215,0,0.5), 4px 4px 0px rgba(0,0,0,0.3)' }}
            >
              ARCADE
            </h1>
          </div>
        </div>

        {/* Main Screen */}
        <div
          className="relative rounded-xl border-4 md:border-8 shadow-2xl"
          style={{ minHeight: '500px', background: 'linear-gradient(to bottom, #1f2937, #000000, #1f2937)', borderColor: '#374151' }}
        >
          {/* CRT Effect */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-pulse" />
            <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, transparent 2px, transparent 4px)' }} />
          </div>

          {selectedGame === 'menu' && (
            <div
              className="relative flex flex-col p-2 md:p-4 min-h-[600px]"
              style={{ background: 'linear-gradient(to bottom, #581c87, #6b21a8, #7c3aed)' }}
            >
              {/* HUD */}
              <div className="flex justify-between items-start mb-3 md:mb-6 px-2 md:px-4">
                <div>
                  <p className="text-xs md:text-sm font-bold text-yellow-300 tracking-wider" style={{ fontFamily: 'monospace' }}>PUNTAJE</p>
                  <p className="text-xl md:text-3xl font-black text-yellow-300" style={{ fontFamily: 'monospace', textShadow: '0 0 10px rgba(255,215,0,0.8)' }}>000000</p>
                </div>
                <div className="text-center">
                  <p className="text-xs md:text-sm font-bold text-pink-300 tracking-wider" style={{ fontFamily: 'monospace' }}>NIVEL</p>
                  <p className="text-xl md:text-3xl font-black text-pink-300" style={{ fontFamily: 'monospace' }}>01</p>
                </div>
                <div className="text-right">
                  <p className="text-xs md:text-sm font-bold text-cyan-300 tracking-wider" style={{ fontFamily: 'monospace' }}>CRÉDITOS</p>
                  <p className="text-xl md:text-3xl font-black text-cyan-300" style={{ fontFamily: 'monospace' }}>02</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-3 md:mb-6">
                <h2
                  className="text-2xl md:text-5xl font-black text-yellow-300 tracking-wide"
                  style={{ fontFamily: 'monospace', textShadow: '0 0 20px rgba(255,215,0,0.8)', letterSpacing: '0.2em' }}
                >
                  SELECCIONA UN JUEGO
                </h2>
              </div>

              {/* Cards */}
              <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 px-2 md:px-8 py-3 md:py-6">

                {/* Boo Card */}
                <div
                  className="relative w-full max-w-sm md:max-w-md rounded-xl md:rounded-2xl overflow-hidden border-4 md:border-8 border-blue-500 shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  <div className="p-3 md:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <div className="flex justify-between items-center mb-2 md:mb-3">
                      <div className="flex gap-1 md:gap-2">
                        <span className="text-base md:text-xl">❤️</span>
                        <span className="text-base md:text-xl">❤️</span>
                        <span className="text-base md:text-xl">❤️</span>
                      </div>
                      <p className="font-mono text-[10px] md:text-xs text-gray-400">PRESS TO START</p>
                    </div>
                    <div
                      className="h-40 md:h-64 flex items-center justify-center bg-black rounded-lg mb-3 md:mb-4"
                      style={{ backgroundImage: 'url(/images/games/boo.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                    <h3 className="text-lg md:text-2xl font-black text-center mb-2 text-purple-300" style={{ fontFamily: 'monospace' }}>
                      BOO MARIO BROS
                    </h3>
                    <p className="text-[10px] md:text-xs text-center mb-3 md:mb-4 px-2 text-gray-400" style={{ fontFamily: 'monospace' }}>
                      Un spin-off retrofuturista inspirado en los enemigos de Mario, donde el jugador controla a Boo.
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedGame('boo')}
                        className="w-full py-2 md:py-3 bg-transparent border-2 border-pink-500 text-pink-400 font-black text-base md:text-lg rounded-lg hover:bg-pink-500 hover:text-white transition-all"
                        style={{ fontFamily: 'monospace' }}
                      >
                        START
                      </button>
                      <div className="flex gap-2">
                        <a
                          href="https://github.com/ghosstbabby12/ghostbabby-arcade/blob/main/src/components/BooGame.tsx"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 md:py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs md:text-sm rounded-lg transition-all text-center font-mono"
                        >
                          {'</>'} Código
                        </a>
                        <Link
                          href="/boo"
                          className="flex-1 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm rounded-lg transition-all text-center font-mono"
                        >
                          ↗ Demo
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pac-Man Card */}
                <div
                  className="relative w-full max-w-sm md:max-w-md rounded-xl md:rounded-2xl overflow-hidden border-4 md:border-8 border-pink-500 shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
                >
                  <div className="p-3 md:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <div className="flex justify-between items-center mb-2 md:mb-3">
                      <div className="flex gap-1 md:gap-2">
                        <span className="text-base md:text-xl">❤️</span>
                        <span className="text-base md:text-xl">❤️</span>
                        <span className="text-base md:text-xl">❤️</span>
                      </div>
                      <p className="font-mono text-[10px] md:text-xs text-gray-400">PRESS TO START</p>
                    </div>
                    <div
                      className="h-40 md:h-64 flex items-center justify-center bg-black rounded-lg mb-3 md:mb-4"
                      style={{ backgroundImage: 'url(/images/games/pacman.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                    <h3 className="text-lg md:text-2xl font-black text-center mb-2 text-yellow-400" style={{ fontFamily: 'monospace' }}>
                      PAC-MAN
                    </h3>
                    <p className="text-[10px] md:text-xs text-center mb-3 md:mb-4 px-2 text-gray-400" style={{ fontFamily: 'monospace' }}>
                      Una reinterpretación de la acción clásica arcade, donde cada pixel devorado cuenta.
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedGame('pacman')}
                        className="w-full py-2 md:py-3 bg-transparent border-2 border-pink-500 text-pink-400 font-black text-base md:text-lg rounded-lg hover:bg-pink-500 hover:text-white transition-all"
                        style={{ fontFamily: 'monospace' }}
                      >
                        START
                      </button>
                      <div className="flex gap-2">
                        <a
                          href="https://github.com/ghosstbabby12/ghostbabby-arcade/blob/main/src/components/PacmanGame.tsx"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 md:py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs md:text-sm rounded-lg transition-all text-center font-mono"
                        >
                          {'</>'} Código
                        </a>
                        <Link
                          href="/pacman"
                          className="flex-1 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm rounded-lg transition-all text-center font-mono"
                        >
                          ↗ Demo
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center pb-2 md:pb-4">
                <p className="text-yellow-300 text-sm md:text-lg animate-pulse" style={{ fontFamily: 'monospace' }}>
                  SELECCIONA UN JUEGO PARA COMENZAR
                </p>
              </div>
            </div>
          )}

          {selectedGame === 'pacman' && (
            <div className="w-full h-full relative min-h-[500px]">
              <button
                onClick={() => setSelectedGame('menu')}
                className="absolute top-2 left-2 md:top-4 md:left-4 z-50 px-3 py-1.5 md:px-4 md:py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm md:text-base rounded border-2 border-red-800 shadow-lg"
                style={{ fontFamily: 'monospace' }}
              >
                ◄ MENU
              </button>
              <PacmanGame />
            </div>
          )}

          {selectedGame === 'boo' && (
            <div className="w-full h-full relative min-h-[500px]">
              <button
                onClick={() => setSelectedGame('menu')}
                className="absolute top-2 left-2 md:top-4 md:left-4 z-50 px-3 py-1.5 md:px-4 md:py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm md:text-base rounded border-2 border-red-800 shadow-lg"
                style={{ fontFamily: 'monospace' }}
              >
                ◄ MENU
              </button>
              <BooGame />
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div
          className="mt-4 md:mt-6 rounded-b-3xl border-4 md:border-8 shadow-2xl p-3 md:p-6"
          style={{ background: 'linear-gradient(to bottom, #581c87, #4c1d95)', borderColor: '#6b21a8' }}
        >
          <div className="flex justify-center gap-4 md:gap-8">
            <div className="flex gap-2 md:gap-3">
              <div className="w-4 h-4 md:w-6 md:h-6 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
              <div className="w-4 h-4 md:w-6 md:h-6 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50" />
              <div className="w-4 h-4 md:w-6 md:h-6 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
