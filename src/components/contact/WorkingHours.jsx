import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { SUPPORT_HOURS as H } from "../../data/businessInfo";
import { useSupportOpen } from "./ContactHero";

/** Live clock (IST), open-now badge and the week strip. Time/day are set after mount so SSR and first paint match. */
export default function WorkingHours({ content }) {
  const c = content.hours;
  const open = useSupportOpen();
  const [now, setNow] = useState(null);
  useEffect(() => {
    const fmt = () => {
      try {
        const d = new Date();
        setNow({
          time: new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(d).toUpperCase(),
          day: new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" }).format(d),
        });
      } catch { /* ignore */ }
    };
    fmt(); const id = setInterval(fmt, 15000); return () => clearInterval(id);
  }, []);
  const hours = H.allDay ? "Open 24 hours" : `${H.open} – ${H.close}`;

  return (
    <section id="contact-hours" aria-labelledby="contact-hours-title" className="bg-primary py-16 md:py-20 scroll-mt-28 overflow-hidden">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6 grid lg:grid-cols-[minmax(0,1fr)_auto] gap-10 items-center">
        <div>
          <p className="flex items-center gap-2.5 text-[12px] font-black uppercase tracking-[0.2em]"><span aria-hidden className="h-[3px] w-8 bg-[#111] rounded-full" />{c.eyebrow}</p>
          <h2 id="contact-hours-title" className="mt-3 text-[30px] md:text-[44px] font-black tracking-[-0.035em] leading-[1.05]">{c.title}</h2>
          <p className="mt-3 text-[15.5px] text-[#111]/75 max-w-[520px]">{c.description}</p>
          <ul aria-label="Support days" className="mt-7 grid grid-cols-7 gap-1.5 max-w-[560px]">
            {H.days.map((d) => { const isToday = now?.day === d; return (
              <li key={d} aria-current={isToday ? "date" : undefined} title={`${d}: ${hours}`}
                className={`text-center rounded-xl py-3 text-[12.5px] font-black ${isToday ? "bg-[#111] text-primary" : "bg-[#111]/[.08]"}`}>
                {d.slice(0, 3)}{isToday && <span className="block text-[10px] font-bold text-white/70 mt-0.5">Today</span>}
              </li>); })}
          </ul>
          <p className="mt-4 text-[13.5px] font-semibold text-[#111]/70">{H.note} {c.bookingNote}</p>
        </div>

        <div className="relative justify-self-center lg:justify-self-end">
          <div className="w-[280px] sm:w-[320px] aspect-square rounded-full bg-[#111] text-white grid place-items-center text-center shadow-[0_40px_80px_-40px_rgba(0,0,0,.7)] ring-[10px] ring-[#111]/10">
            <div>
              <Clock size={22} aria-hidden className="mx-auto text-primary" />
              <p className="mt-3 text-[12px] font-black uppercase tracking-[0.18em] text-white/50">Time in India</p>
              <p className="mt-1 text-[44px] sm:text-[52px] font-black tracking-[-0.04em] tabular-nums leading-none" aria-live="off">{now?.time || "—"}</p>
              <p className={`mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-extrabold ${open === false ? "bg-white/15" : "bg-[#22C55E] text-[#06240f]"}`}>
                <span className="w-2 h-2 rounded-full bg-current" aria-hidden />{open === false ? "Closed now" : H.allDay ? "Open 24×7" : "Open now"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
