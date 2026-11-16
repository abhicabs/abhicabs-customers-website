import React from "react";

// Shared card: #EFEFEF border, 20px radius. `ac-card` (global.css) adds the
// hover lift, gold edge and soft glow site-wide — one change, every page.
export default function Card({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag className={`ac-card bg-white border border-[#EFEFEF] rounded-[20px] ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}
