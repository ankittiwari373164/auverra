import './globals.css'
import { Providers } from './providers'
import { Playfair_Display, Inter } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata = {
  title: 'Auverra Watches — Timeless Craftsmanship, Uncompromising Luxury',
  description: 'Discover the finest Swiss-inspired luxury timepieces at Auverra. Handcrafted chronographs, tourbillons, and dress watches designed for those who appreciate exceptional artistry.',
  keywords: 'luxury watches, chronograph, tourbillon, swiss watches, dress watch, diver watch, Auverra',
  openGraph: {
    title: 'Auverra Watches — Timeless Craftsmanship',
    description: 'Handcrafted luxury timepieces for the discerning collector.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} dark`}>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="bg-obsidian text-platinum-light antialiased pb-16 lg:pb-0">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
