import React, { useEffect, useId, useState } from "react";
import { Briefcase, CheckCircle2, Loader2 } from "lucide-react";
import { isIndianMobile, cleanPhoneInput } from "../lib/phone";
import { useToast } from "../hooks/useToast";
import { createSupportTicket } from "../api/services/support";

/**
 * Corporate enquiry form (Corporate Car Rental page).
 * Sends to the same public endpoint as the Contact form (POST /api/v1/contact),
 * with the topic "Corporate Enquiry", so submissions appear in Admin → Support.
 * The corporate-only fields are written into the message, one per line.
 */

const FIELD_BASE =
  "w-full h-12 rounded-[12px] border px-3.5 py-0 text-base md:text-[14.5px] font-medium text-[#141414] outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:font-normal placeholder:text-[#A8A49B]";
const FIELD_OK =
  "border-[#E8E5DE] bg-[#F8F7F3] hover:border-[#D3CFC5] hover:bg-white focus:border-[#FFD54F] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,213,79,0.18)]";
const FIELD_ERR =
  "border-[#E7A58A] bg-[#FFF7F3] focus:border-[#D9653B] focus:bg-white focus:shadow-[0_0_0_4px_rgba(217,101,59,0.15)]";

const EMPTY = { company: "", person: "", email: "", phone: "", city: "", requirement: "", passengers: "", date: "" };

const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

function Field({ label, required, error, wide, children }) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <label htmlFor={id} className="text-[13px] font-bold text-[#141414]">
        {label} {required && <span className="text-[#B23B00]">*</span>}
      </label>
      {children({
        id,
        className: `${FIELD_BASE} ${error ? FIELD_ERR : FIELD_OK}`,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? `${id}-err` : undefined,
      })}
      {error && <span id={`${id}-err`} className="text-[12.5px] text-[#B23B00]">{error}</span>}
    </div>
  );
}

/**
 * variant "card" (default): white card — used by the generic service template.
 * variant "hero": styled like the booking widget in the other service-page heroes
 * (dark strip with a yellow pill on top, white panel, 3-column field grid).
 */
export default function CorporateEnquiryForm({ id = "corporate-enquiry", form = {}, variant = "card", title = "Corporate Enquiry Form" }) {
  const hero = variant === "hero";
  const toast = useToast();
  const requirements = form.requirements || [];
  const [v, setV] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key) => (e) => {
    const val = key === "phone" ? cleanPhoneInput(e.target.value) : e.target.value;
    setV((s) => ({ ...s, [key]: val }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!v.company.trim()) errs.company = "Please enter your company name";
    if (v.person.trim().length < 2) errs.person = "Please enter the contact person's name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) errs.email = "Please enter a valid email address";
    if (!isIndianMobile(v.phone)) errs.phone = "Enter a valid 10-digit mobile number";
    if (!v.city.trim()) errs.city = "Please enter the pickup city";
    if (!v.requirement) errs.requirement = "Please choose a requirement";
    if (v.passengers && !(Number(v.passengers) >= 1)) errs.passengers = "Enter a number of 1 or more";
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast("Please fix the highlighted fields", "error");
      return;
    }

    const message = [
      `Company Name: ${v.company.trim()}`,
      `Pickup City: ${v.city.trim()}`,
      `Transportation Requirement: ${v.requirement}`,
      `Number of Employees/Passengers: ${v.passengers || "Not specified"}`,
      `Required Date: ${v.date || "Not specified"}`,
    ].join("\n");

    setSubmitting(true);
    try {
      await createSupportTicket({
        name: v.person.trim(),
        phone: v.phone.trim(),
        email: v.email.trim(),
        topic: form.topic || "Corporate Enquiry",
        message,
      });
      toast("Enquiry sent — our corporate team will get back to you shortly.", "success");
      setV(EMPTY);
      setSent(true);
    } catch (err) {
      toast(err.message || "Couldn't send your enquiry — please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!sent) return undefined;
    const t = setTimeout(() => setSent(false), 8000);
    return () => clearTimeout(t);
  }, [sent]);

  const submitButton = (
    <button
      type="submit"
      disabled={submitting}
      className={`${hero ? "h-12" : "mt-6 py-3.5"} w-full inline-flex items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold text-[#141414] transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-px disabled:opacity-70 disabled:hover:translate-y-0`}
      style={{ background: "linear-gradient(180deg, #FFD54A 0%, #FFD54F 55%, #F0A500 100%)", boxShadow: "0 14px 28px -14px rgba(240,165,0,.8), inset 0 1px 0 rgba(255,255,255,.55)" }}
    >
      {submitting && <Loader2 size={18} className="animate-spin" aria-hidden />}
      {form.submitLabel || "Submit Enquiry"}
    </button>
  );

  return (
    <div
      id={id}
      className={hero
        ? "relative scroll-mt-28 overflow-hidden w-full max-w-[1120px] mx-auto text-left bg-white rounded-[22px] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,.28)]"
        : "relative scroll-mt-28 overflow-hidden rounded-[22px] border border-[#ECE9E2] bg-white p-6 sm:p-7 shadow-[0_24px_48px_-32px_rgba(20,20,20,0.18)]"}
    >
      {hero && (
        <div className="flex p-[6px] bg-[#0E0E0E]">
          <span className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14.5px] font-bold text-[#141414]"
            style={{ background: "linear-gradient(180deg, #FFD54A 0%, #FFD54F 55%, #F0A500 100%)" }}>
            <Briefcase size={16} aria-hidden /> {title}
          </span>
        </div>
      )}
      {!hero && form.heading && <h3 className="text-[18px] font-bold text-[#141414] mb-5">{form.heading}</h3>}
      <form onSubmit={submit} noValidate className={hero ? "p-5 sm:p-6" : undefined}>
        <div className={hero ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : "grid grid-cols-1 gap-4 sm:grid-cols-2"}>
          <Field label="Company Name" required error={errors.company}>
            {(p) => <input {...p} value={v.company} onChange={set("company")} autoComplete="organization" maxLength={120} />}
          </Field>
          <Field label="Contact Person" required error={errors.person}>
            {(p) => <input {...p} value={v.person} onChange={set("person")} autoComplete="name" maxLength={120} />}
          </Field>
          <Field label="Business Email" required error={errors.email}>
            {(p) => <input {...p} type="email" value={v.email} onChange={set("email")} autoComplete="email" maxLength={180} />}
          </Field>
          <Field label="Phone Number" required error={errors.phone}>
            {(p) => <input {...p} type="tel" inputMode="numeric" value={v.phone} onChange={set("phone")} autoComplete="tel-national" />}
          </Field>
          <Field label="Pickup City" required error={errors.city}>
            {(p) => <input {...p} value={v.city} onChange={set("city")} autoComplete="address-level2" maxLength={80} />}
          </Field>
          <Field label="Transportation Requirement" required error={errors.requirement}>
            {(p) => (
              <select {...p} value={v.requirement} onChange={set("requirement")}>
                <option value="" disabled>Select</option>
                {requirements.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            )}
          </Field>
          <Field label="Number of Employees/Passengers" error={errors.passengers}>
            {(p) => <input {...p} type="number" min={1} inputMode="numeric" value={v.passengers} onChange={set("passengers")} />}
          </Field>
          <Field label="Required Date" error={errors.date}>
            {(p) => <input {...p} type="date" min={todayISO()} value={v.date} onChange={set("date")} />}
          </Field>
          {hero && <div className="flex flex-col justify-end sm:col-span-2 lg:col-span-1">{submitButton}</div>}
        </div>
        {!hero && submitButton}
      </form>

      {sent && (
        <div role="status" className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 p-8 text-center backdrop-blur-sm">
          <CheckCircle2 size={44} className="text-[#16A34A]" aria-hidden />
          <p className="mt-3 text-[18px] font-bold text-[#141414]">Enquiry sent</p>
          <p className="mt-1.5 text-[14px] text-[#77736A] max-w-[300px]">Our corporate team will get back to you shortly.</p>
          <button type="button" onClick={() => setSent(false)} className="mt-5 text-[13.5px] font-bold text-[#B88A00] underline underline-offset-2">Send another enquiry</button>
        </div>
      )}
    </div>
  );
}
