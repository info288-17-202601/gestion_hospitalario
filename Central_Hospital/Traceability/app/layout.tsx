import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SGHD - Sistema de Gestión Hospitalario Distribuido',
  description: 'Sistema de Gestión Hospitalario Distribuido - Proyecto Semestral',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var originalFetch = window.fetch;
                window.fetch = function(input, init) {
                  if (typeof input === 'string') {
                    if (window.location.hostname.endsWith('hospital.cl')) {
                      if (input.startsWith('http://localhost:7020/api/reports')) {
                        input = input.replace('http://localhost:7020/api/reports', 'http://api.hospital.cl/reporting');
                      } else if (input.startsWith('http://localhost:7030/api/v1/alert')) {
                        input = input.replace('http://localhost:7030/api/v1/alert', 'http://api.hospital.cl/alert');
                      } else if (input.startsWith('http://localhost:7050/api/v1/auth')) {
                        input = input.replace('http://localhost:7050/api/v1/auth', 'http://api.hospital.cl/auth');
                      }
                    }
                  }
                  return originalFetch(input, init);
                };

                var OriginalWebSocket = window.WebSocket;
                if (OriginalWebSocket) {
                  window.WebSocket = function(url, protocols) {
                    if (typeof url === 'string' && window.location.hostname.endsWith('hospital.cl')) {
                      if (url.startsWith('ws://localhost:7030/api/v1/alert')) {
                        url = url.replace('ws://localhost:7030/api/v1/alert', 'ws://api.hospital.cl/alert');
                      }
                    }
                    return new OriginalWebSocket(url, protocols);
                  };
                  window.WebSocket.prototype = OriginalWebSocket.prototype;
                }
              })();
            `
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
