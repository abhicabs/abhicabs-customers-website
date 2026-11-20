import { motion, useReducedMotion } from "framer-motion";

/**
 * Reveal — scroll-triggered entrance used across the whole site.
 * Content renders in the server HTML (SEO-safe); only opacity/transform/filter animate.
 *   variant: "up" (default) | "left" | "right" | "zoom" | "fade"
 *   <Reveal><h2>…</h2></Reveal>
 *   <Reveal as="section" delay={0.1} variant="left"> … </Reveal>
 */
const VARIANTS = {
  up: (y) => ({ opacity: 0, y }),
  left: () => ({ opacity: 0, x: -48 }),
  right: () => ({ opacity: 0, x: 48 }),
  zoom: () => ({ opacity: 0, scale: 0.92 }),
  fade: () => ({ opacity: 0 }),
};

export default function Reveal({ children, as = "div", y = 26, delay = 0, once = true, variant = "up", className, style, ...rest }) {
  // Always render the same motion element: returning a plain element for reduced motion made the
  // browser's first render differ from the server HTML (React hydration mismatch), which left the
  // server's inline opacity:0 in place — content (e.g. the booking widget) stayed invisible.
  // Reduced motion now just makes the entrance instant.
  const reduce = useReducedMotion();
  const M = motion[as] || motion.div;
  return (
    <M
      {...rest}
      className={className}
      style={style}
      initial={(VARIANTS[variant] || VARIANTS.up)(y)}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, margin: "0px 0px -80px 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  );
}
