import React, { useRef, useState } from "react";
import { CheckCircle2, Send, Loader2, AlertCircle } from "lucide-react";
import Reveal from "../ui/Reveal";
import Section from "../ui/Section";
import SectionHead from "../ui/SectionHead";

import { isIndianMobile, cleanPhoneInput } from "../../lib/phone";
import { createSupportTicket } from "../../api/services/support";
import { SUBJECTS } from "../../data/businessInfo";
import { ROUTES } from "../../data/siteLinks";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MSG_MIN = 10, MSG_MAX = 1000;
const input = "w-full h-12 rounded-[10px] border px-3.5 text-base md:text-[14.5px] bg-white outline-none transition-colors focus:border-[#E6AC00] focus:ring-2 focus:ring-primary/40";

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!isIndianMobile(v.mobile)) e.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address.";
  if (!v.subject) e.subject = "Please choose a subject.";
  const len = v.message.trim().length;
  if (len < MSG_MIN) e.message = `Please write at least ${MSG_MIN} characters.`;
  else if (len > MSG_MAX) e.message = `Please keep your message under ${MSG_MAX} characters.`;
  return e;
}

function Field({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-bold">{label} <span className="text-error" aria-hidden>*</span><span className="sr-only">(required)</span></label>
      {children}
      {error && <p id={`${id}-err`} role="alert" className="text-[12.5px] text-error">{error}</p>}
    </div>
  );
}

/**
 * Subject is controlled by the page so Support / Business sections can
 * preselect it; every other field stays local, so nothing typed is lost.
 * Submits via the EXISTING createSupportTicket() -> POST /contact (Admin Support inbox).
 */
export default function ContactForm({ content, subject, onSubjectChange, message, onMessageChange }) {
  const [v, setV] = useState({ name: "", mobile: "", email: "" });
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ state: "idle" }); // idle | submitting | success | error
  const inFlight = useRef(false);

  const values = { ...v, subject, message };
  const errors = validate(values);
  const show = (k) => touched[k] && errors[k];
  const set = (k) => (e) => setV((p) => ({ ...p, [k]: k === "mobile" ? cleanPhoneInput(e.target.value) : e.target.value }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  async function submit(e) {
    e.preventDefault();
    if (inFlight.current) return; // block duplicate submissions
    const errs = validate(values);
    if (Object.keys(errs).length) {
      setTouched({ name: 1, mobile: 1, email: 1, subject: 1, message: 1 });
      setStatus({ state: "error", kind: "validation", text: "Please fix the highlighted fields and try again." });
      document.querySelector("#contact-form [aria-invalid='true']")?.focus();
      return;
    }
    inFlight.current = true;
    setStatus({ state: "submitting" });
    try {
      const result = await createSupportTicket({
        name: v.name.trim(), phone: v.mobile.trim(), email: v.email.trim(), topic: subject, message: message.trim(),
      });
      if (!result?.id) throw new Error("We couldn't confirm your message was received. Please try again or call us.");
      try { // same local ticket list the existing /support-tickets page reads
        const stored = JSON.parse(localStorage.getItem("abhicabs_tickets") || "[]");
        stored.unshift({ id: result.id, topic: subject, message: message.trim(), name: v.name.trim(), email: v.email.trim(), phone: v.mobile.trim(), status: "Open", submittedAt: result.createdAt || new Date().toISOString() });
        localStorage.setItem("abhicabs_tickets", JSON.stringify(stored.slice(0, 20)));
      } catch { /* storage unavailable — not critical */ }
      setStatus({ state: "success", id: result.id });
      setV({ name: "", mobile: "", email: "" }); onMessageChange(""); setTouched({});
    } catch (err) {
      const network = err?.code === "NETWORK_ERROR" || err?.status === 0;
      setStatus({
        state: "error", kind: network ? "network" : "server",
        text: network
          ? "We couldn't reach the server. Check your internet connection and try again."
          : (err?.message || "Something went wrong on our side. Please try again, or call us."),
      });
    } finally { inFlight.current = false; }
  }

  const submitting = status.state === "submitting";
  const done = 5 - Object.keys(errors).length; // fields currently valid
  const ai = (k, id) => ({ id, "aria-invalid": show(k) ? "true" : "false", "aria-describedby": show(k) ? `${id}-err` : undefined, required: true, className: `${input} ${show(k) ? "border-error" : "border-border"}` });

  return (
    <Section id="contact-form" tone="white" lazyPaint={false}>
      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] rounded-[26px] overflow-hidden border border-[#EFEFEF] shadow-[0_20px_60px_rgba(0,0,0,.08)]">
        {/* Assurance side */}
        <div className="relative bg-primary text-[#111] p-7 md:p-10 flex flex-col justify-between min-h-[320px] overflow-hidden">
          <Send aria-hidden strokeWidth={0.7} className="absolute -right-10 -bottom-10 w-64 h-64 text-[#111]/[.07] -rotate-12" />
          <div className="relative">
            <SectionHead id="contact-form" eyebrow={content.form.eyebrow} title={content.form.title} description={content.form.description} />
          </div>
          <ol className="relative mt-8 space-y-4 text-[14.5px] font-semibold">
            {content.form.assurances.map((t, i) => (
              <li key={t} className="flex gap-3 items-start"><span className="grid place-items-center w-7 h-7 shrink-0 rounded-full bg-[#111] text-primary text-[12.5px] font-black">{i + 1}</span><span className="pt-0.5">{t}</span></li>
            ))}
          </ol>
        </div>

        {/* Form side */}
        <Reveal className="bg-white p-6 md:p-10">
          {status.state === "success" ? (
            <div role="status" className="h-full flex flex-col items-center justify-center text-center py-10">
              <span className="w-16 h-16 rounded-full bg-success-tint flex items-center justify-center"><CheckCircle2 size={32} className="text-success" aria-hidden /></span>
              <h3 className="mt-5 text-[22px] font-extrabold">Message sent</h3>
              <p className="mt-2 text-[14.5px] text-text-secondary max-w-[360px]">Thanks — our team has received your enquiry and will reach out soon. You can follow its status under Support Tickets.</p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <a href={ROUTES.supportTickets} className="inline-flex items-center h-11 px-6 rounded-full border-2 border-[#111] text-[14px] font-bold hover:bg-primary hover:border-primary transition-colors">View Tickets</a>
                <button type="button" onClick={() => setStatus({ state: "idle" })} className="inline-flex items-center h-11 px-6 rounded-full bg-primary text-[#111] text-[14px] font-bold hover:bg-[#E6AC00] transition-colors">Send Another</button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate aria-busy={submitting}>
              <div className="mb-6">
                <div className="flex items-center justify-between text-[12.5px] font-bold">
                  <span className="text-text-secondary">{done === 5 ? "Ready to send" : "Your message"}</span>
                  <span className="tabular-nums">{done} of 5 complete</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#EFEDE6] overflow-hidden">
                  <div className={`h-full rounded-full transition-[width,background-color] duration-500 ease-out motion-reduce:transition-none ${done === 5 ? "bg-[#22C55E]" : "bg-primary"}`} style={{ width: `${(done / 5) * 100}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field id="cf-name" label="Full Name" error={show("name")}><input {...ai("name", "cf-name")} value={v.name} onChange={set("name")} onBlur={blur("name")} autoComplete="name" placeholder="Your name" /></Field>
                <Field id="cf-mobile" label="Mobile Number" error={show("mobile")}><input {...ai("mobile", "cf-mobile")} type="tel" inputMode="numeric" autoComplete="tel-national" value={v.mobile} onChange={set("mobile")} onBlur={blur("mobile")} placeholder="10-digit mobile" /></Field>
                <div className="sm:col-span-2"><Field id="cf-email" label="Email Address" error={show("email")}><input {...ai("email", "cf-email")} type="email" autoComplete="email" value={v.email} onChange={set("email")} onBlur={blur("email")} placeholder="you@example.com" /></Field></div>
                <div className="sm:col-span-2">
                  <p id="cf-subject-label" className="text-[13px] font-bold mb-2">Subject <span className="text-error" aria-hidden>*</span><span className="sr-only">(required)</span></p>
                  <div id="cf-subject" role="radiogroup" aria-labelledby="cf-subject-label" aria-invalid={show("subject") ? "true" : "false"} className="flex flex-wrap gap-2">
                    {SUBJECTS.map((s) => {
                      const on = subject === s;
                      return (
                        <button key={s} type="button" role="radio" aria-checked={on} tabIndex={on || (!subject && s === SUBJECTS[0]) ? 0 : -1}
                          onClick={() => { onSubjectChange(s); setTouched((t) => ({ ...t, subject: true })); }}
                          onKeyDown={(e) => {
                            const i = SUBJECTS.indexOf(s); const n = SUBJECTS.length;
                            const next = ["ArrowRight", "ArrowDown"].includes(e.key) ? (i + 1) % n : ["ArrowLeft", "ArrowUp"].includes(e.key) ? (i - 1 + n) % n : null;
                            if (next === null) return; e.preventDefault(); onSubjectChange(SUBJECTS[next]);
                            e.currentTarget.parentElement.children[next]?.focus();
                          }}
                          className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-full border-2 text-[13.5px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6AC00] ${on ? "bg-[#111] border-[#111] text-white" : "bg-white border-border hover:border-[#111]"}`}>
                          {on && <CheckCircle2 size={15} className="text-primary" aria-hidden />}{s}
                        </button>
                      );
                    })}
                  </div>
                  {show("subject") && <p id="cf-subject-err" role="alert" className="mt-1.5 text-[12.5px] text-error">{show("subject")}</p>}
                </div>
                <div className="sm:col-span-2"><Field id="cf-message" label="Message" error={show("message")}>
                  <textarea {...ai("message", "cf-message")} className={`${ai("message", "cf-message").className} h-auto min-h-[130px] py-3 resize-y`} maxLength={MSG_MAX + 200} value={message} onChange={(e) => onMessageChange(e.target.value)} onBlur={blur("message")} placeholder="How can we help? Include your Booking ID if you have one." />
                  <div className={`text-right text-[12px] ${message.length > MSG_MAX ? "text-error" : "text-text-secondary"}`}>{message.trim().length}/{MSG_MAX}</div>
                </Field></div>
              </div>

              <div aria-live="polite" className="mt-4 min-h-[0]">
                {status.state === "error" && !(status.kind === "validation" && done === 5) && (
                  <p role="alert" className="flex gap-2 items-start rounded-xl bg-error-tint text-[#991B1B] text-[13.5px] px-4 py-3"><AlertCircle size={17} className="shrink-0 mt-0.5" aria-hidden />{status.text}</p>
                )}
              </div>

              <button type="submit" disabled={submitting} className="mt-5 w-full h-14 rounded-full bg-primary text-[#111] font-bold text-[16px] inline-flex items-center justify-center gap-2 hover:bg-[#E6AC00] active:scale-[.98] transition disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6AC00]">
                {submitting ? <><Loader2 size={18} className="animate-spin motion-reduce:animate-none" aria-hidden /> Sending…</> : <><Send size={17} aria-hidden /> Send Message</>}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
