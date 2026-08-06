"use client";

import Link from "next/link";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { SocialIcon } from "react-social-icons";
import { cn } from "@/lib/utils";

const PHONE_DISPLAY = "+250 792 548 195";
const PHONE_RAW = "+250792548195";
const EMAIL = "caleblevyb@gmail.com";
const WHATSAPP_NUMBER = "250792548195";

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Directory", href: "/directory" },
  { label: "Register", href: "/register" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("dark-section border-t border-[#fafaf8]/10 py-10 sm:py-12", className)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          <div>
            <Link href="/" className="font-display text-xl text-[#fafaf8]">
              Expaura
            </Link>
            <p className="text-xs text-[#9e9e9e] mt-3 max-w-sm leading-relaxed">
              Connecting restaurants with their guests across Rwanda. Digital menus, honest
              feedback, and smarter hospitality.
            </p>
          </div>

          <nav className="flex flex-wrap md:flex-col gap-x-6 gap-y-3 md:gap-y-2 content-start">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-bold uppercase tracking-widest text-[#9e9e9e] hover:text-[#fafaf8] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <a
              href={`tel:${PHONE_RAW}`}
              className="inline-flex items-center gap-2 text-sm text-[#9e9e9e] hover:text-[#fafaf8] transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" /> {PHONE_DISPLAY}
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2 text-sm text-[#9e9e9e] hover:text-[#fafaf8] transition-colors break-all"
            >
              <Mail className="w-4 h-4 text-emerald-400" /> {EMAIL}
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#9e9e9e] hover:text-[#fafaf8] transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp us
            </a>
            <div className="flex items-center gap-2 mt-2">
              <SocialIcon
                url="https://instagram.com/expaura_rw"
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: 28, height: 28 }}
              />
              <SocialIcon
                url="https://twitter.com/expaura_rw"
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: 28, height: 28 }}
              />
              <SocialIcon
                url="https://linkedin.com/company/expaura"
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: 28, height: 28 }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#fafaf8]/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#9e9e9e]">
            © {new Date().getFullYear()} Expaura. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#9e9e9e]">
            <Link href="/terms" className="hover:text-[#fafaf8] transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#fafaf8] transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { SiteFooter };
