import React from "react";
import { LazyMotion, domAnimation, m, MotionConfig } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1];

const reveal = {
  hidden: { opacity: 0, y: 40, scale: 0.94, clipPath: "inset(8% 8% 8% 8% round 24px)" },
  show: { opacity: 1, y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0% round 24px)", transition: { duration: 1.1, ease: EASE_OUT } },
};

export default function WhyAbhiCabsSection({ imageSrc, imageAlt = "Why Abhi Cabs", id = "about" }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <section id={id} style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(46px,6vw,80px) 22px 0" }}>
          <m.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            style={{ borderRadius: 24, overflow: "hidden" }}
          >
            <img loading="lazy" decoding="async"
              src={imageSrc}
              alt={imageAlt}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </m.div>
        </section>
      </MotionConfig>
    </LazyMotion>
  );
}
