
// import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Surbhi Gupta Astrology",
  description: "Terms and conditions for using Surabhi Astrology services.",
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[#FCF7EE] font-sans text-[#2A1400] pb-20">
      
      {/* Simple Elegant Header (Matches Checkout) */}
      <header className="bg-white border-b border-[#E8D8B8] py-5 px-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex-shrink-0 flex items-center">
            <img 
              src="/logo.svg" 
              alt="Celebrity Astrologer Surbhi Gupta" 
              className="h-14 sm:h-16 lg:h-16 w-auto object-cover"
              
            />
            <div className="hidden fraunces text-[1.15rem] sm:text-[1.35rem] font-bold">
              Celebrity Astrologer Surbhi <em style={{ fontStyle: "italic" }}>Gupta</em>
            </div>
          </a>
          <a href="/" className="flex items-center gap-2 text-[#4A2E10] font-bold text-xs uppercase tracking-widest hover:text-[#8B1E1E] transition-colors">
            &larr; Back to Home
          </a>
        </div>
      </header>

      {/* Document Content */}
      <main className="max-w-4xl mx-auto px-4 pt-10 lg:pt-16">
        <div className="bg-white rounded-3xl p-8 sm:p-10 lg:p-14 shadow-[0_15px_40px_rgba(61,22,0,0.06)] border border-[#E8D8B8]/50">
          
          {/* Header Section */}
          <div className="border-b border-[#E8D8B8] pb-8 mb-8 text-center sm:text-left">
            <h1 className="fraunces text-3xl sm:text-4xl lg:text-5xl font-bold text-[#8B1E1E] mb-4">
              Terms & Conditions
            </h1>
            <p className="text-sm font-bold text-[#C8A84B] uppercase tracking-widest">
              Last Updated: April 9, 2026
            </p>
          </div>

          <div className="prose prose-sm sm:prose-base max-w-none text-[#4A2E10] space-y-6">
            
            {/* Introduction */}
            <p className="leading-relaxed">
              This website, <a href="https://www.surabhiastrology.com/" className="text-[#8B1E1E] font-semibold hover:underline">https://www.surabhiastrology.com/</a> (“Website”), is owned and operated by Surbhi Gupta (hereinafter referred to as "Surabhiastrology," “we”, “us”, or “our”).
            </p>
            <p className="leading-relaxed">
              Please read these Terms and Conditions carefully before using this Website. By accessing, browsing, or using this Website and/or purchasing any services or products, you agree to be bound by these Terms and Conditions (“Terms of Service”, “Terms”). If you do not agree, please refrain from using the Website or any of our services.
            </p>

            {/* Sections */}
            <section className="mt-10">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">1</span>
                Nature of Services
              </h2>
              <p className="mb-2">Surabhi Astrology provides astrology-based services including but not limited to:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4 text-[#6B4423]">
                <li>Kundali (birth chart) analysis</li>
                <li>Astrology consultations</li>
                <li>Personalized reports</li>
                <li>Spiritual guidance and recommendations</li>
              </ul>
              <p>All services are interpretative and advisory in nature and should not be considered as professional, legal, medical, or financial advice.</p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">2</span>
                Eligibility
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423]">
                <li>You must be at least 18 years of age to use this Website or purchase services.</li>
                <li>By using this Website, you confirm that you are legally competent under the Indian Contract Act, 1872.</li>
                <li>If you are under 18, usage is permitted only under supervision of a parent/guardian.</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">3</span>
                User Agreement
              </h2>
              <p className="mb-2">By using this Website, you agree:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423] mb-4">
                <li>To provide accurate and complete information when purchasing services</li>
                <li>Not to misuse, copy, or exploit any content without permission</li>
                <li>Not to engage in fraudulent, abusive, or illegal activities</li>
              </ul>
              <p>We reserve the right to deny service to anyone at our discretion.</p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">4</span>
                Orders, Payments & Acceptance
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423] mb-4">
                <li>All services listed on the Website constitute an invitation to offer.</li>
                <li>Your purchase request constitutes an offer, which we may accept or reject.</li>
                <li>An order is considered accepted only when: Payment is successfully processed, and Confirmation is sent via email/WhatsApp.</li>
              </ul>
              <p className="mb-2">We reserve the right to:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423]">
                <li>Cancel or refuse any order</li>
                <li>Limit quantities or services</li>
                <li>Request additional verification before acceptance</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">5</span>
                Delivery of Services
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423] mb-4">
                <li>Reports and consultations are delivered digitally via email, WhatsApp, or scheduled sessions.</li>
                <li>Delivery timelines are indicative and may vary depending on workload or complexity.</li>
              </ul>
              <p className="mb-2">We are not liable for delays caused by:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423]">
                <li>Incorrect details provided by you</li>
                <li>Technical or third-party issues</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">6</span>
                No Guarantee of Results
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423]">
                <li>Astrology is a subjective and interpretative science.</li>
                <li>We do not guarantee specific outcomes.</li>
                <li>Results may vary based on individual belief, actions, and circumstances.</li>
                <li>Any remedies suggested are optional and based on traditional practices.</li>
                <li>You acknowledge that decisions made based on our services are your sole responsibility.</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">7</span>
                Refund & Cancellation Policy
              </h2>
              <p className="mb-2">Due to the personalized nature of services:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423]">
                <li>No refunds once the service/report has been initiated or delivered.</li>
                <li>Cancellations are only considered before work has started.</li>
                <li>In exceptional cases, refunds may be granted at our sole discretion.</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">8</span>
                Intellectual Property
              </h2>
              <p className="mb-2">All content on this Website, including text, reports, designs, and branding is the intellectual property of Surabhi Astrology.</p>
              <p className="mb-2">You may not:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423]">
                <li>Reproduce, resell, or distribute content</li>
                <li>Use reports for commercial purposes</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">9</span>
                Third-Party Tools & Hosting
              </h2>
              <p className="mb-2">This Website is hosted on Vercel, which provides infrastructure for delivering our services. We may also use third-party tools (payment gateways, communication tools, etc.).</p>
              <p className="mb-2">You agree that:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423]">
                <li>We are not liable for third-party service disruptions.</li>
                <li>You are subject to their respective terms as applicable.</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">10</span>
                Limitation of Liability
              </h2>
              <p className="mb-2">To the fullest extent permitted by law:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423]">
                <li>Surabhiastrology shall not be liable for any direct, indirect, incidental, or consequential damages.</li>
                <li>This includes decisions made based on consultations or reports.</li>
                <li>Use of our services is entirely at your own risk.</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">11</span>
                Privacy
              </h2>
              <p>
                Your use of this Website is also governed by our Privacy Policy. We respect your personal information and ensure it is handled securely.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">12</span>
                Modifications to Terms
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423]">
                <li>We reserve the right to update, modify, or replace any part of these Terms.</li>
                <li>Changes will be effective immediately upon posting.</li>
                <li>Continued use of the Website constitutes acceptance of those changes.</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">13</span>
                Governing Law
              </h2>
              <p>
                These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of courts in Jaipur.
              </p>
            </section>
<section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">12</span>
                WhatsApp Communication & Consent
              </h2>
              <p className="mb-2">By providing your phone number, interacting with our WhatsApp bot, or purchasing a service, you explicitly consent to receive communications from Surbhi Gupta Astrology via WhatsApp.</p>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423]">
                <li><strong>Message Types:</strong> You may receive appointment confirmations, report deliveries, responses to your inquiries, and relevant service updates.</li>
                <li><strong>Opt-Out (Stop Messages):</strong> You can withdraw your consent and stop receiving messages at any time by replying with the word <strong>"STOP"</strong> or <strong>"UNSUBSCRIBE"</strong> in the WhatsApp chat.</li>
                <li><strong>No Spam:</strong> We strictly adhere to WhatsApp's anti-spam policies and will not send unsolicited promotional broadcasts without your explicit prior consent.</li>
                <li>Standard data rates may apply depending on your network provider.</li>
              </ul>
            </section>
            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">14</span>
                Contact Information
              </h2>
              <p className="mb-2">For any questions regarding these Terms, you may contact:</p>
              <div className="bg-[#FFFBF0] border border-[#C8A84B]/30 p-4 rounded-xl inline-block">
                <p className="font-bold text-[#8B1E1E] mb-1">Surabhi Astrology</p>
                <p><strong>Email:</strong> <a href="mailto:info@surabhiastrology.com" className="hover:underline">info@surabhiastrology.com</a></p>
                <p><strong>Phone/WhatsApp:</strong> <a href="https://wa.me/919251151330" className="hover:underline">+91 9251151330</a></p>
              </div>
            </section>

          </div>
          
          {/* Important Disclaimer Highlight Box */}
          <div className="mt-12 bg-gradient-to-br from-[#8B1E1E] to-[#5C1414] text-white p-6 sm:p-8 rounded-2xl shadow-[0_10px_20px_rgba(139,30,30,0.2)]">
            <h3 className="text-lg sm:text-xl font-bold font-serif mb-3 flex items-center gap-2 text-[#E2C06A]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Important Disclaimer
            </h3>
            <p className="text-white/90 leading-relaxed text-sm sm:text-base">
              Astrology services are provided for guidance and self-awareness purposes only. We do not promote superstition or guarantee outcomes. Users are encouraged to make decisions based on their own judgment.
            </p>
          </div>

        </div>
      </main>

    </div>
  );
}