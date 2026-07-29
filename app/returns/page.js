'use client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const SECTIONS = [
  {
    h: 'No Refund Policy — Exchange Only',
    p: 'We follow a strict No Refund Policy. We provide exchange only, and only in specific cases. No refunds are provided under any circumstances.',
  },
  {
    h: 'Exchange Eligibility',
    p: 'Exchange requests must be raised within 48 hours of delivery, and only for products that are damaged, defective, or the wrong item delivered. The product must be unused, in original condition, and returned with all original packaging, tags, and accessories. Exchanges are not accepted for change of mind, personal preference, or minor box scratches that do not affect the product.',
  },
  {
    h: 'Mandatory Unboxing Video',
    p: 'A clear, 360-degree unboxing video from start to end — showing the sealed package, the entire unboxing process, and the issue, with no pauses, cuts, or edits — is compulsory while opening the package. No exchange will be approved without a proper unboxing video.\n\nरिटर्न और एक्सचेंज के लिए पार्सल को खोलते हुए का स्पष्ट वीडियो जरूरी है। बिना वीडियो हम सहायता नहीं कर पाएंगे।',
  },
  {
    h: 'Exchange Process',
    p: 'Contact us within 2 days of receiving the order. Once the returned product reaches our warehouse, it will undergo a quality inspection. Customers are responsible for return shipping costs, and the product must be returned in its original condition and packaging — no exceptions. After verification, the replacement product will be shipped, and you will be notified via WhatsApp once the exchange is approved.\n\nकृपया ऑर्डर प्राप्त होने के 2 दिनों के भीतर हमसे संपर्क करें।',
  },
  {
    h: 'Cash on Delivery (COD) & RTO Policy',
    p: 'A ₹150 COD charge applies to all COD orders and is non-refundable, even if the order is cancelled or refused. If an order is returned to origin (RTO) due to refusal, customer unavailability, incorrect address, or delivery failure, any amount paid for order confirmation is non-refundable, and the customer is responsible for both RTO and reshipping charges. No refund will be issued for RTO cases.',
  },
  {
    h: 'What We Accept — and What We Don\'t',
    p: 'We accept exchanges only when the product is damaged, defective, or the wrong item was delivered, or items are missing from the parcel. We do not accept returns or refunds based on personal dislikes or change of mind, color or minor design differences due to photography or screen display, or minor issues like loose threads, removable stains, or open stitching.\n\nहां, हम अपने पार्सल का रिटर्न लेते हैं, लेकिन केवल क्षतिग्रस्त, गलत या गुम हुई वस्तु के मामले में – न कि नापसंद के आधार पर।',
  },
  {
    h: 'Business Rules',
    p: 'We dispatch only after your final confirmation. Please get detailed product information via WhatsApp before placing your order — slight color variations due to photography or screen settings will not be considered valid reasons for exchange. If tracking is provided, please stay responsive and report non-receipt within 7 days. While delays may occur, all parcels are dispatched on time from our end.',
  },
  {
    h: 'Read Carefully Before Purchase',
    p: 'Please read and understand this policy thoroughly before placing your order. The issue must be reported within 24 hours of parcel delivery for it to be considered. Ignorance of this policy will not be considered a valid reason for exceptions.',
  },
]

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="container-lux max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Please Read Before Ordering</span>
            <h1 className="text-5xl md:text-6xl font-serif text-gradient-gold">Exchange &amp; Refund Policy</h1>
          </div>
          <div className="space-y-4">
            {SECTIONS.map((f, i) => (
              <div key={i} className="glass border border-gold/15 p-6 rounded-sm">
                <h3 className="font-serif text-lg text-gold mb-2">{f.h}</h3>
                <p className="text-sm text-platinum-light/65 leading-relaxed whitespace-pre-line">{f.p}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a href="https://wa.me/912249001897" target="_blank" rel="noopener noreferrer" className="btn-outline-gold inline-block">Questions? Message Us on WhatsApp</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}