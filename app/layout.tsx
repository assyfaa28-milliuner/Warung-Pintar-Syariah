import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Warpin - Warung Pintar Syariah',
  description: 'Aplikasi akuntansi syariah untuk warung kelontong Indonesia',
  icons: { icon: '🏪' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-gray-100">
        {/* Mobile-first wrapper */}
        <div className="flex items-center justify-center min-h-screen md:p-4">
          {/* Container dengan lebar max mobile (390px), di desktop ada shadow & rounded */}
          <div className="w-full max-w-sm md:rounded-3xl md:shadow-2xl md:overflow-hidden bg-white">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}