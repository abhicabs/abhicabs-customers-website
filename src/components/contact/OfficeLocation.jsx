import React from "react";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { focusRing } from "./shared";
import { SERVICE_AREA } from "../../data/businessInfo";

/** One full-width card: the map (or service-area photo) with the address card floating over it. */
export default function OfficeLocation({ info, content }) {
  const c = content.office;
  const { address, mapsEmbedSrc, directionsHref, primaryPhone, email, emailHref } = info;
  return (
    <section id="contact-office" aria-labelledby="contact-office-title" className="bg-white py-16 md:py-24 scroll-mt-28">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="flex items-center gap-2.5 text-[12px] font-black uppercase tracking-[0.2em] text-[#7A5D00]"><span aria-hidden className="h-[3px] w-8 bg-primary rounded-full" />{c.eyebrow}</p>
            <h2 id="contact-office-title" className="mt-3 text-[30px] md:text-[44px] font-black tracking-[-0.035em] leading-[1.05]">{c.title}</h2>
          </div>
          <p className="max-w-[420px] text-[15.5px] text-text-secondary leading-relaxed">{c.description}</p>
        </div>

        <div className="relative mt-10 rounded-[30px] overflow-hidden bg-[#111] min-h-[460px] md:min-h-[520px] flex items-end">
          {mapsEmbedSrc ? (
            <iframe title="Abhi Cabs office location on Google Maps" src={mapsEmbedSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="absolute inset-0 w-full h-full border-0" />
          ) : (
            <>
              <img src={c.fallbackImage} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-55" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/60" />
              <div className="hidden md:block absolute right-10 top-10 text-right text-white">
                <p className="text-primary text-[12px] font-black uppercase tracking-[0.2em]">We operate across</p>
                <p className="mt-2 text-[44px] lg:text-[56px] font-black tracking-[-0.04em] leading-none">{SERVICE_AREA}</p>
              </div>
            </>
          )}
          <div className="relative m-4 md:m-8 w-full md:w-[400px] rounded-[24px] bg-white p-6 md:p-7 shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)]">
            <div className="flex gap-3">
              <span className="grid place-items-center w-11 h-11 shrink-0 rounded-xl bg-primary"><MapPin size={20} aria-hidden /></span>
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.14em] text-text-secondary">{address ? "Address" : "Service area"}</p>
                <p className="mt-0.5 text-[16px] font-extrabold leading-snug">{address || SERVICE_AREA}</p>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-border space-y-3">
              {primaryPhone && <a href={primaryPhone.href} className={`flex gap-3 items-center text-[15px] font-semibold hover:text-[#B88A00] rounded-sm ${focusRing}`}><Phone size={17} className="text-[#B88A00]" aria-hidden />{primaryPhone.label}</a>}
              {email && <a href={emailHref} className={`flex gap-3 items-center text-[15px] font-semibold hover:text-[#B88A00] break-all rounded-sm ${focusRing}`}><Mail size={17} className="text-[#B88A00]" aria-hidden />{email}</a>}
            </div>
            {directionsHref ? (
              <a href={directionsHref} target="_blank" rel="noopener noreferrer" className={`mt-6 inline-flex items-center justify-center gap-2 w-full h-12 rounded-full bg-[#111] text-white font-bold text-[15px] hover:bg-black transition-colors ${focusRing}`}>Get Directions <ArrowUpRight size={16} aria-hidden /><span className="sr-only"> (opens Google Maps)</span></a>
            ) : (
              <p className="mt-5 text-[13.5px] text-text-secondary">Pickups and drops across both regions. Call or message us and we&rsquo;ll sort out the details.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
