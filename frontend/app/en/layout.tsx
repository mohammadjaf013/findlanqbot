import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Finland Q - Your smart assistant for moving to Finland',
  description: 'Q is FinlandQ’s intelligent assistant to answer all questions about studying, working, and startup immigration to Finland. Start your journey with accurate and up-to-date information.',
  keywords: 'Finland, immigration, study, work, visa, startup',
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr">
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