import React, { useEffect, useState } from "react";
import { Phone, Mail, ArrowUpRight } from "lucide-react";
import Button from "../ui/Button";
import Breadcrumb from "../ui/Breadcrumb";
import useBusinessInfo from "../../hooks/useBusinessInfo";
import { SUPPORT_HOURS } from "../../data/businessInfo";
import { scrollToId, focusRing } from "./shared";

/** "Open now" from SUPPORT_HOURS in IST — decided after mount so server and first paint match. */
export function useSupportOpen() {
  const [open, setOpen] = useState(null);
  useEffect(() => {
    if (SUPPORT_HOURS.allDay) { setOpen(true); return; }
    try {
      const now = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date());
      const day = new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" }).format(new Date());
      const to24 = (t) => { const [hm, ap] = t.split(" "); let [h, m] = hm.split(":").map(Number); if (ap === "PM" && h < 12) h += 12; if (ap === "AM" && h === 12) h = 0; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; };
      setOpen(SUPPORT_HOURS.days.includes(day) && now >= to24(SUPPORT_HOURS.open) && now <= to24(SUPPORT_HOURS.close));
    } catch { setOpen(null); }
  }, []);
  return open;
}

/** Help-desk masthead: live status, big headline, three quick-connect tiles. Copy from content.hero (CMS-editable). */
export default function ContactHero({ content, onBook }) {
  const h = content.hero;
  const { primaryPhone, whatsappHref, email, emailHref } = useBusinessInfo();
  const open = useSupportOpen();
  const tiles = [
    primaryPhone && { href: primaryPhone.href, label: "Call us", value: primaryPhone.label, Icon: Phone },
    whatsappHref && { href: whatsappHref, label: "WhatsApp", value: "Chat now", Icon: WaIcon, ext: true },
    email && { href: emailHref, label: "Email", value: email, Icon: Mail },
  ].filter(Boolean);

  return (
    <section className="relative overflow-hidden bg-[#FAF7EE] border-b border-[#EFE8D4]">
      <div aria-hidden className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(rgba(17,17,17,.07) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      <div aria-hidden className="absolute -right-40 -top-40 w-[520px] h-[520px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,213,79,.45), transparent 65%)" }} />
      <div className="relative max-w-[1264px] mx-auto px-5 sm:px-6 pt-10 pb-14 md:pt-14 md:pb-20 grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-12 items-center">
        <div>
          <Breadcrumb items={[["Home", "/"], ["Contact", null]]} />
          <p className="mt-2 inline-flex items-center gap-2.5 rounded-full bg-white border border-[#EAE3CC] pl-2.5 pr-4 py-1.5 text-[13px] font-bold" aria-live="polite">
            <span className="relative flex w-2.5 h-2.5">
              {open && <span aria-hidden className="absolute inset-0 rounded-full bg-[#22C55E] animate-ping motion-reduce:animate-none" />}
              <span className={`relative w-2.5 h-2.5 rounded-full ${open === false ? "bg-[#9CA3AF]" : "bg-[#22C55E]"}`} />
            </span>
            {open === false ? "Support is closed right now" : SUPPORT_HOURS.allDay ? "Support is open now · 24×7" : "Support is open now"}
          </p>
          <h1 className="mt-5 text-[42px] sm:text-[56px] lg:text-[68px] font-black tracking-[-0.045em] leading-[.98]">
            {h.title} <span className="bg-[linear-gradient(transparent_60%,#FFD54F_60%,#FFD54F_90%,transparent_90%)] [box-decoration-break:clone] [-webkit-box-decoration-break:clone] px-1 -mx-1">{h.accent}</span>
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => scrollToId("contact-form")}>Contact Our Team</Button>
            <Button size="lg" variant="outline" onClick={onBook}>Book Your Ride</Button>
          </div>
        </div>

        {tiles.length > 0 && (
          <ul className="grid gap-3">
            {tiles.map(({ href, label, value, Icon, ext }, i) => (
              <li key={label}>
                <a href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`group relative flex items-center gap-4 rounded-[22px] bg-white border border-[#EAE3CC] p-4 sm:p-5 overflow-hidden isolate shadow-[0_18px_40px_-30px_rgba(0,0,0,.4)] ${focusRing}`}>
                  <span aria-hidden className="absolute inset-0 -z-10 bg-[#111] origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100 motion-reduce:transition-none" />
                  <span className={`grid place-items-center w-14 h-14 rounded-2xl shrink-0 transition-colors ${i === 1 ? "bg-[#25D366] text-white" : "bg-primary text-[#111]"}`}><Icon size={24} strokeWidth={2.2} aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-black uppercase tracking-[0.16em] text-text-secondary group-hover:text-primary transition-colors">{label}</span>
                    <span className="block mt-0.5 text-[19px] sm:text-[22px] font-extrabold tracking-[-0.02em] truncate group-hover:text-white transition-colors">{value}</span>
                  </span>
                  <ArrowUpRight size={22} aria-hidden className="shrink-0 transition-all duration-300 group-hover:text-primary group-hover:rotate-45" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function WaIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={props.size || 18} height={props.size || 18} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}
