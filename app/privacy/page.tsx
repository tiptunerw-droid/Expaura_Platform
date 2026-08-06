import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Expaura collects, uses, and protects your personal and restaurant data.",
};

const PHONE_DISPLAY = "+250 792 548 195";
const PHONE_RAW = "+250792548195";
const EMAIL = "caleblevyb@gmail.com";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "We collect the information you provide when you register and use the platform: your name, email address, phone number, restaurant name, city, address, and optional contact details such as WhatsApp, website, and social media links. When guests submit reviews or complaints, we store their feedback along with optional table and receipt numbers. We may also collect anonymous usage data to understand how the platform is used.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use your information to operate and improve the platform, display your restaurant's public page and directory listing, process subscriptions and confirm payments, communicate with you about your account and our services, and respond to your requests.",
  },
  {
    title: "3. Public Information",
    body: "Restaurant name, address, city, contact details, menu, gallery, and ratings are published on your public restaurant page and in the public directory. Please review these fields carefully before publishing. Review and complaint feedback is only used within the platform.",
  },
  {
    title: "4. Data Sharing",
    body: "We do not sell your personal information. We only share data with third parties who help us run the service (such as hosting and payment-confirmation providers), when required by law, or with your consent.",
  },
  {
    title: "5. Payment Information",
    body: "Payments are made through mobile money using the USSD code *182*1*1*0792548195*<amount>#. We do not store your mobile money PIN or banking credentials. Payment confirmation is verified through the transaction code you send to us on WhatsApp.",
  },
  {
    title: "6. Data Retention",
    body: "We keep your account and restaurant data for as long as your account is active, and for a reasonable period afterwards as required for legal and administrative purposes. You can ask us to delete your data at any time.",
  },
  {
    title: "7. Your Rights",
    body: "You may request access to, correction of, or deletion of your personal information at any time by contacting us. You may also withdraw consent for optional data processing. We will respond to your request within a reasonable time.",
  },
  {
    title: "8. Security",
    body: "We use HTTPS encryption, secure authentication, role-based access control, and audit logging to protect your data. No method of transmission or storage is completely secure, but we work to protect your information to a high standard.",
  },
  {
    title: "9. Cookies",
    body: "We use essential cookies and local storage to keep you signed in and to remember your preferences, such as theme selection. We do not use cookies to build advertising profiles.",
  },
  {
    title: "10. Children",
    body: "The platform is intended for use by adults and businesses. We do not knowingly collect personal information from children under 18.",
  },
  {
    title: "11. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. The latest version will always be available on this page, and significant changes will be communicated through the platform.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <SiteHeader />
      <main className="pt-24 flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-4">
            Legal
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-text-primary leading-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: August 2026
          </p>

          <div className="mt-10 space-y-8">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-lg text-text-primary mb-2">{section.title}</h2>
                <p className="text-sm text-gray-400 leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-12 border-t border-border-subtle pt-8">
            <h2 className="font-display text-lg text-text-primary mb-2">Contact</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              For any privacy questions or requests, contact us at{" "}
              <a href={`tel:${PHONE_RAW}`} className="text-emerald-400 hover:text-emerald-300">
                {PHONE_DISPLAY}
              </a>{" "}
              or{" "}
              <a href={`mailto:${EMAIL}`} className="text-emerald-400 hover:text-emerald-300">
                {EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
