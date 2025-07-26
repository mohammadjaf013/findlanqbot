import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'فنلاند کیو - دستیار هوشمند مهاجرت به فنلاند',
  description: 'سیستم چت هوشمند برای راهنمایی مهاجرت، تحصیل و کار در فنلاند',
  keywords: 'فنلاند، مهاجرت، تحصیل، کار، ویزا، استارتاپ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-persian antialiased">
        {children}
      </body>
    </html>
  )
} 