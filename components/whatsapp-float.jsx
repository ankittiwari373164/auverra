'use client'
import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '912249001897'
const WHATSAPP_MESSAGE = "Hi Auverra Watches! I'm interested in one of your timepieces and would like more details."
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export function WhatsAppFloat() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null

  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-5 bottom-24 lg:bottom-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.45)] hover:scale-110 transition-transform duration-300"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />
      <MessageCircle className="w-7 h-7 relative text-white" strokeWidth={2} />
    </a>
  )
}