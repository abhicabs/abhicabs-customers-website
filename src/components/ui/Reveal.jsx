import { motion, useReducedMotion } from "framer-motion";

/**
 * Reveal — scroll-triggered entrance used across the whole site.
 * Content renders in the server HTML (SEO-safe); only opacity/transform/filter animate.
 *   variant: "up" (default) | "left" | "right" | "zoom" | "fade"
 *   <Reveal><h2>…</h2></Reveal>
 *   <Reveal as="section" delay={0.1} variant="left"> … </Reveal>
 */
const VARIANTS = {
  up: (y) => ({ opacity: 0, y, filter: "blur(6px)" }),
  left: () => ({ opacity: 0, x: -48, filter: "blur(6px)" }),
  right: () => ({ opacity: 0, x: 48, filter: "blur(6px)" }),
  zoom: () => ({ opacity: 0, scale: 0.92, filter: "blur(6px)" }),
  fade: () => ({ opacity: 0 }),
};

export default function Reveal({ children, as = "div", y = 26, delay = 0, once = true, variant = "up", className, style, ...rest }) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Tag = as;
    return <Tag className={className} style={style} {...rest}>{children}</Tag>;
  }
  const M = motion[as] || motion.div;
  return (
    <M
      {...rest}
      className={className}
      style={style}
      initial={(VARIANTS[variant] || VARIANTS.up)(y)}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  );
}
