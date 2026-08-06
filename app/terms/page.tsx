import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms and conditions that govern your use of the Expaura restaurant experience platform.",
};

const PHONE_DISPLAY = "+250 792 548 195";
const PHONE_RAW = "+250792548195";
const EMAIL = "caleblevyb@gmail.com";

const SECTIONS = [
  {
    title: "1. Agreement",
    body: "By creating an account, subscribing to a plan, or using the Expaura platform, you agree to these Terms & Conditions. If you do not agree, please do not use the platform.",
  },
  {
    title: "2. Accounts & Eligibility",
    body: "You must be at least 18 years old and legally able to enter into a binding agreement to register a restaurant. You are responsible for keeping your account credentials confidential and for all activity that happens under your account.",
  },
  {
    title: "3. Services",
    body: "Expaura provides QR digital menus, customer feedback and review collection, complaint tracking, analytics, staff performance tools, public restaurant pages and directory listing, and related features. Features may change over time as the platform evolves.",
  },
  {
    title: "4. Subscription & Payment",
    body: "The Monthly plan costs RWF 20,000 per month and includes all platform features. A free one-month test plan (RWF 0) is available to try the platform. Payment is made by mobile money using the code *182*1*1*0792548195*<amount># and confirmed by sending the payment code to +250 792 548 195 on WhatsApp. Your subscription begins once payment is confirmed and continues on a monthly basis until cancelled.",
  },
  {
    title: "5. Free Trial",
    body: "The free one-month test plan lets you evaluate all features without payment. At the end of the trial, you may either subscribe to the Monthly plan or your account access will be limited until a plan is selected.",
  },
  {
    title: "6. Cancellation & Refunds",
    body: "You may cancel your subscription at any time by contacting us on WhatsApp or by email. Access continues until the end of the current billing period. Refunds are not provided for partial billing periods.",
  },
  {
    title: "7. User Responsibilities",
    body: "You agree to provide accurate restaurant information, keep your details up to date, and use the platform lawfully. You may not misuse the platform, attempt to disrupt its services, or use it to collect guest data in violation of privacy laws.",
  },
  {
    title: "8. Reviews & Content",
    body: "Restaurant reviews reflect the honest opinions of diners. You may not edit or delete customer reviews, though you may report reviews that violate our guidelines. You are responsible for the accuracy of menu and restaurant information you publish.",
  },
  {
    title: "9. Intellectual Property",
    body: "The Expaura platform, brand, design, and software are owned by Expaura. Your restaurant name, logo, and content remain your property, and you grant Expaura a limited license to display them as part of the service.",
  },
  {
    title: "10. Limitation of Liability",
    body: "The platform is provided 'as is'. To the maximum extent permitted by law, Expaura is not liable for indirect, incidental, or consequential damages, including loss of revenue, arising from your use of the platform or from downtime or service interruptions.",
  },
  {
    title: "11. Termination",
    body: "We may suspend or terminate accounts that violate these Terms or applicable law. You may stop using the platform at any time.",
  },
  {
    title: "12. Changes to These Terms",
    body: "We may update these Terms from time to time. Continued use of the platform after changes are posted constitutes acceptance of the revised Terms.",
  },
  {
    title: "13. Governing Law",
    body: "These Terms are governed by the laws of the Republic of Rwanda. Any disputes shall be subject to the jurisdiction of the courts of Rwanda.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <SiteHeader />
      <main className="pt-24 flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-4">
            Legal
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-text-primary leading-tight">
            Terms & Conditions
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
              Questions about these Terms? Reach us at{" "}
              <a href={`tel:${PHONE_RAW}`} className="text-emerald-400 hover:text-emerald-300">
                {PHONE_DISPLAY}
              </a>{" "}
              or{" "}
              <a href={`mailto:${EMAIL}`} className="text-emerald-400 hover:text-emerald-300">
                {EMAIL}
              </a>
              , or on{" "}
              <a
                href={`https://wa.me/${PHONE_RAW.replace(/\+/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300"
              >
                WhatsApp
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
