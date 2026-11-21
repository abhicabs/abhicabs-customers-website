import React, { useState } from "react";
import { Phone, Mail, MapPin, Copy, Check, ArrowUpRight } from "lucide-react";
import { focusRing } from "./shared";
import { SERVICE_AREA } from "../../data/businessInfo";

/** Copy button with a brief "Copied" confirmation (falls back silently where the clipboard is blocked). */
function CopyBtn({ text, label }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600); } catch { /* clipboard unavailable */ }
  };
  return (
    <button type="button" onClick={copy} aria-label={done ? `${label} copied` : `Copy ${label}`}
      className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-full border-2 text-[13px] font-bold transition-colors ${done ? "border-primary bg-primary text-[#111]" : "border-white/20 text-white hover:border-white/60"} ${focusRing}`}>
      {done ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}<span aria-live="polite">{done ? "Copied" : "Copy"}</span>
    </button>
  );
}

/** Speed dial: a dark directory — numbers in large type, each with Call + Copy; then email and area. */
export default function ContactInformation({ info, content }) {
  const c = content.info;
  const { phones, email, emailHref, address, directionsHref } = info;
  const row = "grid grid-cols-[44px_minmax(0,1fr)] md:grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-x-4 md:gap-x-6 gap-y-3 py-6 border-b border-white/12";
  const icon = "grid place-items-center w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-primary text-[#111]";
  return (
    <section id="contact-info" aria-labelledby="contact-info-title" className="bg-[#111] text-white py-16 md:py-24 scroll-mt-28">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="flex items-center gap-2.5 text-[12px] font-black uppercase tracking-[0.2em] text-primary"><span aria-hidden className="h-[3px] w-8 bg-primary rounded-full" />{c.eyebrow}</p>
            <h2 id="contact-info-title" className="mt-3 text-[30px] md:text-[44px] font-black tracking-[-0.035em] leading-[1.05]">{c.title}</h2>
          </div>
          <p className="max-w-[420px] text-[15.5px] text-white/60 leading-relaxed">{c.description}</p>
        </div>

        <ul className="mt-10 border-t border-white/15">
          {phones.map((p, i) => (
            <li key={p.href} className={row}>
              <span className={icon}><Phone size={22} aria-hidden /></span>
              <div className="min-w-0">
                <p className="text-[12px] font-black uppercase tracking-[0.16em] text-white/45">Phone support{phones.length > 1 ? ` · Line ${i + 1}` : ""}</p>
                <a href={p.href} className={`block mt-1 text-[26px] sm:text-[36px] md:text-[48px] font-black tracking-[-0.03em] leading-none tabular-nums hover:text-primary transition-colors rounded-sm ${focusRing}`}>{p.label}</a>
              </div>
              <div className="col-span-2 md:col-span-1 flex gap-2.5">
                <a href={p.href} className={`inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-primary text-[#111] text-[13.5px] font-bold hover:bg-white transition-colors ${focusRing}`}><Phone size={15} aria-hidden />Call</a>
                <CopyBtn text={p.label.replace(/\s+/g, "")} label="phone number" />
              </div>
            </li>
          ))}
          {email && (
            <li className={row}>
              <span className={icon}><Mail size={22} aria-hidden /></span>
              <div className="min-w-0">
                <p className="text-[12px] font-black uppercase tracking-[0.16em] text-white/45">Email support · we reply by email</p>
                <a href={emailHref} className={`block mt-1 text-[20px] sm:text-[28px] md:text-[34px] font-black tracking-[-0.025em] leading-tight break-all hover:text-primary transition-colors rounded-sm ${focusRing}`}>{email}</a>
              </div>
              <div className="col-span-2 md:col-span-1 flex gap-2.5">
                <a href={emailHref} className={`inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-primary text-[#111] text-[13.5px] font-bold hover:bg-white transition-colors ${focusRing}`}><Mail size={15} aria-hidden />Email</a>
                <CopyBtn text={email} label="email address" />
              </div>
            </li>
          )}
          <li className={row}>
            <span className={icon}><MapPin size={22} aria-hidden /></span>
            <div className="min-w-0">
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-white/45">{address ? "Office address" : "Where we operate"}</p>
              <p className="mt-1 text-[18px] sm:text-[24px] font-extrabold tracking-[-0.02em] leading-snug">{address || `Chauffeur-driven cabs across ${SERVICE_AREA}.`}</p>
              {!directionsHref && <p className="mt-1 text-[13.5px] text-white/55">Call or message us and we&rsquo;ll help with pickup details.</p>}
            </div>
            {directionsHref && (
              <div className="col-span-2 md:col-span-1">
                <a href={directionsHref} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 h-10 px-5 rounded-full border-2 border-white/20 text-[13.5px] font-bold hover:border-primary hover:text-primary transition-colors ${focusRing}`}>Get Directions <ArrowUpRight size={15} aria-hidden /></a>
              </div>
            )}
          </li>
        </ul>
      </div>
    </section>
  );
}
