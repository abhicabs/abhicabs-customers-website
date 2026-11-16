import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Car, MapPin } from "lucide-react";

/**
 * Dark "states we serve" band: copy on the left (passed in untouched as children),
 * a "live route hub" on the right — the four pickup states orbit a central dispatch
 * hub, with gold dots travelling along the spokes. Decorative only (aria-hidden).
 * Deliberately different from the Home page coverage map.
 */
const STATES = ["Karnataka", "Andhra Pradesh", "Maharashtra", "Telangana"];
const EASE = [0.22, 1, 0.36, 1];
const VIEW = { once: true, amount: 0.2 };
const R = 29;        // pickup ring radius (% of box)
const RD = 46;       // destination ring radius
const DESTS = 16;    // destination nodes around the outer ring
const PIN_ANGLES = [-45, 45, 135, 225];
const P = (r, deg) => { const a = (deg * Math.PI) / 180; return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]; };

/** routes fanning out from each pickup state to the destinations nearest it */
function routesFor(pinDeg) {
  return [-33.75, -11.25, 11.25, 33.75].map((off) => {
    const [x1, y1] = P(R, pinDeg), [x2, y2] = P(RD, pinDeg + off), [cx, cy] = P((R + RD) / 2 + 2, pinDeg + off * 0.35);
    return { d: `M${x1.toFixed(2)} ${y1.toFixed(2)} Q${cx.toFixed(2)} ${cy.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`, end: [x2, y2] };
  });
}

function RouteHub({ reduce }) {
  return (
    <div className="ac-hub relative aspect-square w-full" aria-hidden>
      {/* outer compass ring with ticks (counter-rotates slowly) */}
      <svg viewBox="0 0 100 100" className="ac-ring-rev absolute inset-0" style={{ width: "100%", height: "100%" }}>
        <circle cx="50" cy="50" r="49.5" fill="none" stroke="rgba(255,213,79,.14)" strokeWidth=".3" />
        {Array.from({ length: 72 }, (_, i) => {
          const long = i % 6 === 0; const [x1, y1] = P(long ? 47.6 : 48.6, i * 5); const [x2, y2] = P(49.5, i * 5);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={long ? "rgba(255,213,79,.4)" : "rgba(255,255,255,.1)"} strokeWidth={long ? ".45" : ".25"} />;
        })}
      </svg>

      {/* orbit layer: spokes, outward routes, destination nodes, pickup pins */}
      <div className="ac-orbit absolute inset-0">
        <svg viewBox="0 0 100 100" className="absolute inset-0" style={{ width: "100%", height: "100%" }}>
          <circle cx="50" cy="50" r={RD} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".3" strokeDasharray=".8 1.6" />
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,213,79,.3)" strokeWidth=".35" strokeDasharray="1 2" />

          {/* hub → pickup spokes */}
          {PIN_ANGLES.map((deg, i) => { const [x, y] = P(R, deg); return <line key={`s${i}`} x1="50" y1="50" x2={x} y2={y} stroke="rgba(255,213,79,.3)" strokeWidth=".4" strokeDasharray=".6 1.4" />; })}

          {/* pickup → destinations across India, with cars travelling outward */}
          {PIN_ANGLES.map((deg, i) => routesFor(deg).map((r, k) => (
            <g key={`r${i}-${k}`}>
              <path d={r.d} fill="none" stroke="rgba(255,213,79,.32)" strokeWidth=".35" strokeDasharray=".5 1.3" />
              {!reduce && (
                <circle r=".9" fill="#FFE27A">
                  <animateMotion dur={`${2.4 + ((i + k) % 4) * 0.45}s`} begin={`${(i * 4 + k) * 0.23}s`} repeatCount="indefinite" path={r.d} />
                </circle>
              )}
            </g>
          )))}

          {/* destination nodes (twinkle) */}
          {Array.from({ length: DESTS }, (_, i) => {
            const [x, y] = P(RD, -45 + 11.25 + i * 22.5);
            return (
              <g key={`d${i}`}>
                <circle cx={x} cy={y} r="2.2" fill="rgba(255,213,79,.12)" />
                <circle cx={x} cy={y} r="1" fill="#fff" opacity=".85">
                  {!reduce && <animate attributeName="opacity" values=".35;1;.35" dur="3s" begin={`${(i % 5) * 0.6}s`} repeatCount="indefinite" />}
                </circle>
              </g>
            );
          })}
        </svg>

        {/* pickup state pins */}
        {STATES.map((n, i) => {
          const [x, y] = P(R, PIN_ANGLES[i]);
          return (
            <div key={n} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
              <motion.div
                initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={VIEW}
                transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.5 + i * 0.15 }}
              >
                <div className="ac-orbit-counter ac-glass flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,.5)] !bg-[rgba(20,20,20,.75)]">
                  <span className="grid place-items-center w-6 h-6 rounded-full bg-[#FFD54F] text-[#111] shrink-0"><MapPin size={13} strokeWidth={2.5} /></span>
                  <span className="text-[12px] font-bold text-white leading-none">{n}</span>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* hub */}
      <motion.div
        initial={reduce ? false : { scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={VIEW}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <span className="ac-hub-pulse absolute inset-0 rounded-full" />
        <span className="ac-hub-pulse ac-hub-pulse-2 absolute inset-0 rounded-full" />
        <div className="relative grid place-items-center w-[clamp(64px,7vw,88px)] h-[clamp(64px,7vw,88px)] rounded-full bg-gradient-to-br from-[#FFE27A] via-[#FFD54F] to-[#E6AC00] text-[#111] shadow-[0_0_60px_rgba(255,213,79,.45),inset_0_2px_0_rgba(255,255,255,.5)]">
          <Car size={32} strokeWidth={2.2} />
        </div>
      </motion.div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[12.5px] font-semibold text-white/70" aria-hidden>
      <span className="inline-flex items-center gap-2"><span className="grid place-items-center w-5 h-5 rounded-full bg-[#FFD54F] text-[#111]"><MapPin size={11} strokeWidth={2.6} /></span>Pickup states</span>
      <span className="inline-flex items-center gap-2"><span className="relative w-5 h-5 grid place-items-center"><span className="absolute inset-0 rounded-full bg-[#FFD54F]/15" /><span className="w-2 h-2 rounded-full bg-white" /></span>Destinations across India</span>
    </div>
  );
}

export default function StatesCoverageBand({ children }) {
  const reduce = useReducedMotion();
  return (
    <section className="ac-cv relative overflow-hidden isolate py-16 md:py-24" style={{ background: "linear-gradient(135deg,#1C1C1C,#0a0a0a)" }}>
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[.07]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
      <div aria-hidden className="ac-hero-glow absolute -z-10 right-[10%] top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,213,79,.14), transparent 65%)" }} />
      <div aria-hidden className="absolute -z-10 -left-32 -bottom-32 w-[380px] h-[380px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,213,79,.1), transparent 65%)" }} />

      <div className="max-w-[1264px] mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -40, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={VIEW}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <motion.span
            aria-hidden
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={VIEW}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="block h-[3px] w-14 mb-5 rounded-full origin-left bg-gradient-to-r from-[#E6AC00] via-[#FFD54F] to-[#E6AC00]"
          />
          {children}
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={VIEW}
          transition={{ duration: 1, ease: EASE }}
          className="relative mx-auto w-full max-w-[440px] lg:max-w-[520px] px-10 sm:px-12"
        >
          <RouteHub reduce={reduce} />
          <Legend />
        </motion.div>
      </div>
    </section>
  );
}
