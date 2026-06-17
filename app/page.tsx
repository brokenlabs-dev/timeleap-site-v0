import Link from 'next/link'
import { theme } from '@/theme/config'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Reporting Portal link — top left */}
      <div className="absolute top-6 left-6">
        <Link
          href="/portal/login"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
        >
          <span className="text-xs">🔒</span>
          Reporting Portal
        </Link>
      </div>

      {/* Hero */}
      <main className="flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo / hero image slot */}
        <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-2xl">
          <span className="text-6xl font-black text-white tracking-tight select-none">TL</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <h1 className="text-6xl font-black tracking-tight text-gray-900" style={{ letterSpacing: '-0.04em' }}>
            {theme.siteName.toUpperCase()}
          </h1>
          <p className="text-lg text-gray-500 font-medium">{theme.siteTagline}</p>
        </div>

        <p className="max-w-sm text-gray-400 text-sm leading-6">
          A public-facing transparency portal for the TimeLeap EU-funded project by Broken Egg Labs.
        </p>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-300">
        {theme.footerLine}
      </footer>
    </div>
  )
}
