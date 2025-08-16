import type { Metadata } from 'next'

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
        
   
      </head>
      <body className="font-persian antialiased">
      
        {children}
      </body>
    </html>
  )
} 