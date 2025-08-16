import type { Metadata } from 'next'
import './globals.css'
import Navigation from './components/Navigation'

export const metadata: Metadata = {
  title: 'فنلاند کیو - دستیار هوشمند مهاجرت به فنلاند',
  description: 'کیو، دستیار هوشمند فنلاندکیو برای پاسخ به تمام سوالات مربوط به مهاجرت تحصیلی، کاری و استارتاپی به فنلاند است. مسیر خود را با اطلاعات دقیق و به‌روز شروع کنید.',
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

             {/* Google tag (gtag.js) */}
             <script async src="https://www.googletagmanager.com/gtag/js?id=G-HN7FDVGL93"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-HN7FDVGL93');
            `,
          }}
        />
      </head>
      <body className="font-persian antialiased">
        {/* <Navigation /> */}
        {children}
      </body>
    </html>
  )
} 