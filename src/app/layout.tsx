'use client';
import { Geist, Azeret_Mono as Geist_Mono } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from '@/components/navbar'
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { networkConfig } from './config/networkConfig';

const queryClient = new QueryClient();
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
			<SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
				<WalletProvider>
          
          <Navbar />
          {children}
          <Toaster />
          </WalletProvider>
			</SuiClientProvider>
		</QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

