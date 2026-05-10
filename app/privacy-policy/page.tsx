import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Surbhi Gupta Astrology",
  description: "Privacy policy and data handling practices for Surabhi Astrology.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FCF7EE] font-sans text-[#2A1400] pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-[#E8D8B8] py-5 px-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <img 
              src="/logo.svg" 
              alt="Celebrity Astrologer Surbhi Gupta" 
              className="h-14 sm:h-16 lg:h-16 w-auto object-cover"
            />
          </Link>
          <Link href="/" className="flex items-center gap-2 text-[#4A2E10] font-bold text-xs uppercase tracking-widest hover:text-[#8B1E1E] transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </header>

      {/* Document Content */}
      <main className="max-w-4xl mx-auto px-4 pt-10 lg:pt-16">
        <div className="bg-white rounded-3xl p-8 sm:p-10 lg:p-14 shadow-[0_15px_40px_rgba(61,22,0,0.06)] border border-[#E8D8B8]/50">
          
          {/* Header Section */}
          <div className="border-b border-[#E8D8B8] pb-8 mb-8 text-center sm:text-left">
            <h1 className="fraunces text-3xl sm:text-4xl lg:text-5xl font-bold text-[#8B1E1E] mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm font-bold text-[#C8A84B] uppercase tracking-widest">
              Last Updated: May 10, 2026
            </p>
          </div>

          <div className="prose prose-sm sm:prose-base max-w-none text-[#4A2E10] space-y-6">
            
            <p className="leading-relaxed">
              At Surabhi Astrology ("we," "us," or "our"), your privacy is our priority. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (<a href="https://www.surabhiastrology.com/" className="text-[#8B1E1E] font-semibold hover:underline">surabhiastrology.com</a>) and interact with our WhatsApp Business API services.
            </p>

            {/* Section 1 */}
            <section className="mt-10">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">1</span>
                Information We Collect
              </h2>
              <p className="mb-2">When you interact with our services, we may collect the following data:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423]">
                <li><strong>Personal Data:</strong> Name, date of birth, time of birth, and place of birth (required for generating accurate astrological charts).</li>
                <li><strong>Contact Data:</strong> Phone number (specifically your WhatsApp number) and email address.</li>
                <li><strong>Interaction Data:</strong> Chat history, messages sent to our WhatsApp bot, and service preferences to provide better consultations.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">2</span>
                WhatsApp API & Communications (Meta Compliance)
              </h2>
              <p className="mb-2">We utilize the official WhatsApp Business API to deliver reports, updates, and customer support. By messaging our WhatsApp number or opting in via our website, you acknowledge that:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423]">
                <li><strong>Opt-in:</strong> You consent to receive automated and manual messages from us regarding your astrology services.</li>
                <li><strong>Opt-out:</strong> You may revoke this consent at any time by replying <strong>"STOP"</strong>, <strong>"UNSUBSCRIBE"</strong>, or by blocking the business account on WhatsApp. We will immediately cease communications.</li>
                <li><strong>No Spam:</strong> We do not send unsolicited marketing blasts. Messages are strictly transactional or based on user-initiated inquiries.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">3</span>
                How We Use Your Data
              </h2>
              <p className="mb-2">Your data is strictly used for the fulfillment of services:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423]">
                <li>To generate personalized Kundli (birth charts) and astrological readings.</li>
                <li>To provide customer support and respond to your WhatsApp inquiries.</li>
                <li>To process transactions and send order confirmations.</li>
              </ul>
              <p className="font-semibold mt-4">We do not sell, rent, or trade your personal data or phone numbers to third-party data brokers or marketing agencies.</p>
            </section>

            {/* Section 4 */}
            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">4</span>
                Third-Party Data Processing
              </h2>
              <p className="mb-2">To operate our services, we share necessary data with secure, trusted third-party platforms:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#6B4423]">
                <li><strong>Meta Platforms, Inc. (WhatsApp):</strong> Messages sent and received are routed through Meta's secure API infrastructure. Meta's use of this data is governed by the WhatsApp Business Terms of Service.</li>
                <li><strong>Hosting & Database:</strong> Our application and chat logs are securely hosted on Vercel and MongoDB.</li>
              </ul>
            </section>

            {/* Section 5 - CRITICAL FOR META DEV PORTAL */}
            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">5</span>
                Data Deletion Instructions
              </h2>
              <p className="mb-2">You have the right to request the deletion of your personal data and chat history at any time. To do so:</p>
              <div className="bg-[#FFFBF0] border border-[#C8A84B]/30 p-4 rounded-xl text-[#6B4423]">
                <ol className="list-decimal pl-4 space-y-2">
                  <li>Send an email to <strong>pranoti.contact@gmail.com</strong> with the subject line "Data Deletion Request".</li>
                  <li>Include the WhatsApp phone number you used to interact with us.</li>
                  <li>We will permanently delete your records from our databases within 7 business days and confirm via email.</li>
                </ol>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1400] font-serif mb-4 flex items-center gap-3">
                <span className="bg-[#FCF7EE] text-[#8B1E1E] w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#E8D8B8]">6</span>
                Contact Us
              </h2>
              <p>If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact our Data Protection Officer:</p>
              <p className="mt-2">
                <strong>Email:</strong> pranoti.contact@gmail.com<br />
                <strong>WhatsApp:</strong> +91 9251151330
              </p>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}