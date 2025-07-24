import './globals.css'
import { Inter } from 'next/font/google'
import { WalletProvider } from '@/components/WalletProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Snake AI - Claim Interface',
  description: 'Claim your Snake AI tokens and participate in the Patron Framework',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
