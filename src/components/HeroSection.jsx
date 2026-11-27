import usePageContent from "../hooks/usePageContent";
import React, { useRef } from "react";
import { cldOptimize } from "../utils/cloudinaryUrl";
import {
  LazyMotion,
  domAnimation,
  m,
  MotionConfig,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import BookingWidget from "./BookingWidget";

/* ------------------------------------------------------------------ */
/* Motion tokens                                                       */
/* ------------------------------------------------------------------ */
const EASE_OUT = [0.22, 1, 0.36, 1];

const heroContent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

const headlineLine = {
  hidden: { y: "110%", opacity: 0 },
  show: { y: "0%", opacity: 1, transition: { duration: 0.9, ease: EASE_OUT } },
};

const featureItem = {
  hidden: { opacity: 0, y: 14, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

const featureGrid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const checkIcon = {
  hidden: { scale: 0, rotate: -45 },
  show: { scale: 1, rotate: 0, transition: { type: "spring", stiffness: 420, damping: 18 } },
};

/* Ken Burns CSS keyframes — injected once */
const KEN_BURNS_CSS = `
@keyframes kenBurns {
  0%   { transform: scale(1.0) translate(0%, 0%); }
  25%  { transform: scale(1.12) translate(-1.5%, -1%); }
  50%  { transform: scale(1.18) translate(0.5%, -2%); }
  75%  { transform: scale(1.10) translate(1%, -0.5%); }
  100% { transform: scale(1.0) translate(0%, 0%); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes pulseGlow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%      { opacity: 0.7; transform: scale(1.08); }
}
@keyframes floatBadge {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}
@media (prefers-reduced-motion: reduce) {
  .ken-burns-img { animation: none !important; }
  .hero-glow { animation: none !important; }
  .hero-badge { animation: none !important; }
}
`;

const HERO_TITLE = "Cab Booking Services –";
const HERO_ACCENT = "Local, Airport & Outstation Cabs";
const LEGACY_TITLE = "Your Journey,";
const LEGACY_ACCENT = "Our Priority.";

const DEFAULT_FEATURES = ["Verified Drivers", "Transparent Pricing", "Comfortable Vehicles", "24×7 Support"];

export default function HeroSection({ widgetKey, widgetProps, onModeChange }) {
  const cms = usePageContent("home");
  // H1 = title (white) + accent (gold). The previous default heading may still be stored in the CMS
  // from earlier saves; treat it as "not customized" so the current heading shows. Real CMS edits still win.
  let heroTitle = cms.get("hero", "title", HERO_TITLE);
  let heroAccent = cms.get("hero", "accent", HERO_ACCENT);
  if (String(heroTitle).trim() === LEGACY_TITLE && String(heroAccent).trim() === LEGACY_ACCENT) {
    heroTitle = HERO_TITLE;
    heroAccent = HERO_ACCENT;
  }
  const heroDesc = cms.get("hero", "description", "Reliable Cabs. Transparent Fares. Comfortable Travel. Book reliable cabs for airport transfers, local travel, one-way trip, round trip, group trip and outstation journeys.");
  const heroImage = cms.get("hero", "image", "");
  const FEATURES = cms.getItems("features", "items", DEFAULT_FEATURES.map(f => typeof f === "string" ? { title: f } : f)).map(f => typeof f === "string" ? f : f.title || f);

  const heroRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", prefersReducedMotion ? "0%" : "14%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.6]);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        {/* Inject Ken Burns + shimmer keyframes */}
        <style dangerouslySetInnerHTML={{ __html: KEN_BURNS_CSS }} />

        <section
          ref={heroRef}
          style={{ position: "relative", background: "#0a0a0a", overflow: "hidden" }}
        >
          {/* ── Ken Burns animated background ── */}
          <m.div
            style={{
              position: "absolute",
              top: "-18%",
              left: "-5%",
              right: "-5%",
              bottom: "-5%",
              y: bgY,
              willChange: "transform",
            }}
          >
            <img
              className="ken-burns-img"
              src={cldOptimize(heroImage || "/images/Herosection.jpg", { width: 1920 })}
              alt=""
              fetchPriority="high"
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                animation: "kenBurns 28s ease-in-out infinite",
              }}
            />
          </m.div>

          {/* ── Multi-layer gradient overlay for depth ── */}
          <m.div
            style={{
              position: "absolute",
              inset: 0,
              opacity: overlayOpacity,
              pointerEvents: "none",
            }}
          >
            {/* Main darkness overlay */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(8,8,8,0.88) 0%, rgba(8,8,8,0.5) 35%, rgba(8,8,8,0.42) 55%, rgba(8,8,8,0.7) 85%, rgba(8,8,8,0.92) 100%)",
            }} />
            {/* Vignette */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 70% 60% at 50% 40%, transparent 40%, rgba(0,0,0,0.5) 100%)",
            }} />
            {/* Warm gold ambient glow behind heading */}
            <div
              className="hero-glow"
              style={{
                position: "absolute",
                top: "18%",
                left: "50%",
                width: "min(600px, 80vw)",
                height: "min(350px, 40vw)",
                transform: "translateX(-50%)",
                background: "radial-gradient(ellipse, rgba(255,213,79,0.08) 0%, transparent 70%)",
                animation: "pulseGlow 6s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
          </m.div>

          {/* ── Content ── */}
          <div
            style={{
              position: "relative",
              maxWidth: 1280,
              margin: "0 auto",
              padding: "clamp(52px,7vw,80px) 22px clamp(44px,5.5vw,64px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <m.div
              variants={heroContent}
              initial="hidden"
              animate="show"
              style={{ maxWidth: 1200, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              {/* ── Headline ── */}
              <h1
                className="hero-h1"
                style={{
                  fontWeight: 800,
                  fontSize: "clamp(36px,5.8vw,68px)",
                  lineHeight: 1.05,
                  color: "#fff",
                  margin: 0,
                  letterSpacing: "-.03em",
                  overflow: "hidden",
                }}
              >
                <m.span variants={headlineLine} style={{ display: "inline" }}>
                  {heroTitle}
                </m.span>{" "}
                <m.span
                  variants={headlineLine}
                  className="hero-h1-accent"
                  style={{
                    display: "inline",
                    background: "linear-gradient(135deg, #FFD54F 0%, #FFB300 50%, #FFD54F 100%)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: "shimmer 4s linear infinite",
                  }}
                >
                  {heroAccent}
                </m.span>
              </h1>

              {/* ── Description — split into two lines for impact ── */}
              <m.p
                variants={fadeUp}
                style={{
                  fontSize: "clamp(15px,1.6vw,18px)",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: 400,
                  margin: "20px 0 0",
                  maxWidth: 680,
                  textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                }}
              >
                {heroDesc}
              </m.p>

              {/* ── Feature badges — glassmorphism pills ── */}
              <m.div
                variants={featureGrid}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "10px",
                  marginTop: 26,
                }}
              >
                {FEATURES.map((f, i) => (
                  <m.span
                    key={f}
                    variants={featureItem}
                    className="hero-badge"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 13.5,
                      padding: "8px 16px",
                      borderRadius: 100,
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      animation: `floatBadge ${3 + i * 0.4}s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  >
                    <m.svg variants={checkIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#FFD54F" />
                      <path
                        d="M8 12.5l2.5 2.5 5-5.5"
                        stroke="#111"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </m.svg>
                    {f}
                  </m.span>
                ))}
              </m.div>
            </m.div>

            {/* ── Booking widget ── */}
            <m.div
              id="booking"
              initial={{ opacity: 0, y: 50, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.8, ease: EASE_OUT }}
              style={{
                width: "100%",
                maxWidth: 1120,
                marginTop: "clamp(30px,4.5vw,48px)",
                background: "#fff",
                borderRadius: 22,
                boxShadow: "0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              <BookingWidget key={widgetKey} {...widgetProps} onModeChange={onModeChange} />
            </m.div>
          </div>
        </section>
      </MotionConfig>
    </LazyMotion>
  );
}