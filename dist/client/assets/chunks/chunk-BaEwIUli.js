import{r as e}from"./chunk-XKyaHtl9.js";import{Zr as t,c as n,en as r,in as i,ni as a,nn as o,qt as s,ri as c,rn as l,wt as u}from"./chunk-8_D0pkDz.js";import{i as d,s as f,t as p}from"./chunk-DGc1fiC8.js";var m=[{code:`BLR`,city:`Bengaluru`,name:`Kempegowda International Airport (BLR)`,terminals:[`Terminal 1 (T1) — Domestic`,`Terminal 2 (T2) — International & Domestic`]},{code:`HYD`,city:`Hyderabad`,name:`Rajiv Gandhi International Airport (HYD)`,terminals:[`Terminal 1 (T1) — Domestic & International`]},{code:`MAA`,city:`Chennai`,name:`Chennai International Airport (MAA)`,terminals:[`Terminal 1 (T1) — Domestic`,`Terminal 4 (T4) — International`]},{code:`BOM`,city:`Mumbai`,name:`Chhatrapati Shivaji Maharaj International Airport (BOM)`,terminals:[`Terminal 1 (T1) — Domestic`,`Terminal 2 (T2) — International & Domestic`]},{code:`MYQ`,city:`Mysuru`,name:`Mysore Airport (MYQ)`,terminals:[`Terminal 1 — Domestic`]},{code:`HBX`,city:`Hubballi`,name:`Hubballi Airport (HBX)`,terminals:[`Terminal 1 — Domestic`]},{code:`VGA`,city:`Vijayawada`,name:`Vijayawada International Airport (VGA)`,terminals:[`Terminal 1 — Domestic & International`]},{code:`IXE`,city:`Mangaluru`,name:`Mangaluru International Airport (IXE)`,terminals:[`Terminal 1 — Domestic & International`]}],h=e(c(),1),g=a(),_=t(),v=[.22,1,.36,1],y={active:`linear-gradient(180deg, #FFD54A 0%, #FFD54F 55%, #F0A500 100%)`,activeShadow:`0 8px 18px -8px rgba(240,165,0,.75), inset 0 1px 0 rgba(255,255,255,.6), inset 0 -1px 0 rgba(0,0,0,.08)`,dark:{base:`linear-gradient(180deg, #1F1F1F 0%, #131313 100%)`,hover:`linear-gradient(180deg, #2E2B22 0%, #171612 100%)`,ring:`rgba(255,255,255,.06)`,ringHover:`rgba(255,213,79,.38)`,text:`rgba(255,255,255,.72)`},light:{base:`linear-gradient(180deg, #FFFDF5 0%, #FDEFC4 55%, #F8E09A 100%)`,hover:`linear-gradient(180deg, #FFF8DD 0%, #FBE39A 55%, #F5D06A 100%)`,ring:`rgba(224,154,0,.28)`,ringHover:`rgba(224,154,0,.55)`,text:`#6B4E00`}},b=`
.bw-root, .bw-portal {
  --bw-yellow: #FFD54F;
  --bw-ink: #141414;
  --bw-text: #2B2925;
  --bw-muted: #77736A;
  --bw-faint: #A8A49B;
  --bw-line: #E8E5DE;
  --bw-line-strong: #D3CFC5;
  --bw-surface: #F8F7F3;
  --bw-tint: #FFF8DF;
}
.bw-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600; letter-spacing: .01em;
  color: var(--bw-muted); padding-left: 2px;
}
.bw-field {
  position: relative; display: flex; align-items: center; gap: 10px;
  height: 52px; padding: 0 8px 0 8px; min-width: 0;
  border: 1px solid var(--bw-line); border-radius: 14px;
  background: var(--bw-surface);
  transition: border-color .2s, background-color .2s, box-shadow .2s;
}
.bw-field--plain { padding-left: 14px; }
.bw-field:hover { border-color: var(--bw-line-strong); background: #fff; }
.bw-field:focus-within, .bw-field.is-open {
  border-color: var(--bw-yellow); background: #fff;
  box-shadow: 0 0 0 4px rgba(255,213,79,.18);
}
.bw-field--button { cursor: pointer; user-select: none; }
.bw-field--button:focus-visible { outline: none; border-color: var(--bw-yellow); box-shadow: 0 0 0 4px rgba(255,213,79,.18); }
.bw-chip {
  flex: none; width: 34px; height: 34px; border-radius: 10px;
  display: grid; place-items: center;
  background: #fff; border: 1px solid var(--bw-line); color: var(--bw-ink);
  font-size: 12.5px; font-weight: 700;
  transition: background-color .2s, border-color .2s, color .2s;
}
.bw-chip--from { background: var(--bw-tint); border-color: #F6E3A1; color: #B07A00; }
.bw-field:focus-within .bw-chip, .bw-field.is-open .bw-chip {
  background: var(--bw-yellow); border-color: var(--bw-yellow); color: var(--bw-ink);
}
.bw-input {
  flex: 1; min-width: 0; border: 0; outline: 0; background: transparent;
  font-size: 15px; font-weight: 500; color: var(--bw-ink);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.bw-input::placeholder, .bw-input.is-placeholder { color: var(--bw-faint); font-weight: 400; }
@media (max-width: 767px) { .bw-input { font-size: 16px; } } /* stops iOS zoom-on-focus */

/* Google Places autocomplete dropdown — wider, readable */
.pac-container {
  min-width: 320px !important;
  max-width: 480px !important;
  border: 1px solid #E8E5DE !important;
  border-radius: 14px !important;
  box-shadow: 0 16px 40px -12px rgba(20,20,20,.22), 0 2px 6px rgba(20,20,20,.06) !important;
  padding: 6px 0 !important;
  font-family: inherit !important;
  margin-top: 6px !important;
  z-index: 99999 !important;
}
.pac-item {
  padding: 10px 14px !important;
  font-size: 14px !important;
  line-height: 1.4 !important;
  border-top: 1px solid #F2F0EB !important;
  cursor: pointer !important;
  white-space: normal !important;
  word-break: break-word !important;
}
.pac-item:first-child { border-top: none !important; }
.pac-item:hover { background: #FFF8DF !important; }
.pac-item-query {
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #141414 !important;
}
.pac-matched { font-weight: 700 !important; color: #B07A00 !important; }
.pac-icon { margin-top: 2px !important; }
@media (max-width: 480px) {
  .pac-container {
    min-width: calc(100vw - 32px) !important;
    max-width: calc(100vw - 16px) !important;
    left: 8px !important;
    right: 8px !important;
  }
}
.bw-icon-btn {
  flex: none; width: 32px; height: 32px; border-radius: 9px; border: 0;
  display: grid; place-items: center; background: transparent;
  color: var(--bw-muted); cursor: pointer;
  transition: background-color .2s, color .2s;
}
.bw-icon-btn:hover { background: rgba(255,213,79,.16); color: var(--bw-ink); }
.bw-icon-btn:focus-visible { outline: 2px solid var(--bw-yellow); outline-offset: 1px; }
.bw-icon-btn:disabled { opacity: .5; cursor: default; }
.bw-clear-btn {
  flex: none; width: 22px; height: 22px; border-radius: 9999px; border: 0; padding: 0;
  display: grid; place-items: center; background: #EDEDED; color: #555; cursor: pointer;
  margin-right: -4px; transition: background-color .2s, color .2s;
}
.bw-clear-btn:hover { background: var(--bw-ink); color: #fff; }
.bw-clear-btn:focus-visible { outline: 2px solid var(--bw-yellow); outline-offset: 1px; }

.bw-addstop {
  width: 100%; height: 52px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border: 1.5px dashed var(--bw-line-strong); border-radius: 14px; background: transparent;
  color: var(--bw-text); font-weight: 600; font-size: 14px; white-space: nowrap; cursor: pointer;
  transition: border-color .2s, background-color .2s, color .2s;
}
.bw-addstop:hover { border-color: var(--bw-yellow); background: #FFFBEA; color: var(--bw-ink); }
.bw-addstop:focus-visible { outline: none; border-color: var(--bw-yellow); box-shadow: 0 0 0 4px rgba(255,213,79,.18); }
.bw-addstop-plus {
  width: 22px; height: 22px; border-radius: 999px; display: grid; place-items: center;
  background: ${y.active}; color: var(--bw-ink);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.6);
}

.bw-cta {
  position: relative; overflow: hidden; isolation: isolate;
  /* 350px wide, centered; shrinks to fit on screens narrower than that */
  width: 100%; max-width: 350px; margin-inline: auto;
  height: 54px; border: 0; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15.5px; letter-spacing: .01em; color: var(--bw-ink);
  cursor: pointer; background: ${y.active};
  box-shadow: 0 14px 28px -14px rgba(240,165,0,.85), inset 0 1px 0 rgba(255,255,255,.55), inset 0 -2px 0 rgba(0,0,0,.08);
}
.bw-cta-shine {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.55) 50%, transparent 70%);
  transform: translateX(-120%);
  transition: transform .8s cubic-bezier(.22,1,.36,1);
}
.bw-cta:hover .bw-cta-shine { transform: translateX(120%); }
.bw-cta:focus-visible { outline: 2px solid var(--bw-ink); outline-offset: 3px; }

.bw-surge {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px;
  border-radius: 14px; border: 1px solid rgba(255,213,79,.45);
  background: linear-gradient(90deg, #FFF6D6 0%, #FFFCF2 100%);
}
.bw-surge-icon {
  flex: none; width: 32px; height: 32px; border-radius: 999px; display: grid; place-items: center;
  background: ${y.active}; color: var(--bw-ink);
}

.bw-segment { display: inline-flex; gap: 4px; padding: 4px; border-radius: 999px; background: #F1EFE9; }

.bw-pop {
  background: #fff; border: 1px solid var(--bw-line); border-radius: 18px;
  box-shadow: 0 24px 48px -16px rgba(20,20,20,.28), 0 2px 6px rgba(20,20,20,.06);
  padding: 14px;
}
.bw-pop-title { font-size: 11.5px; font-weight: 600; color: var(--bw-muted); margin: 0 0 6px 2px; }
.bw-tcell {
  padding: 8px 0; border-radius: 10px; border: 0; cursor: pointer;
  font-size: 14px; font-weight: 500; color: var(--bw-text); background: #F6F5F1;
  transition: background-color .15s, color .15s;
}
.bw-field.has-error, .bw-field.has-error:hover { border-color: #E0662A; background: #FFF8F4; }
.bw-field.has-error:focus-within, .bw-field.has-error.is-open { border-color: #E0662A; box-shadow: 0 0 0 4px rgba(224,102,42,.16); background: #fff; }
.bw-time-error { color: #C2410C; font-size: 12px; font-weight: 500; line-height: 1.3; }
.bw-tcell:hover:not(:disabled):not(.is-active) { background: #FFF1C2; }
.bw-tcell:disabled { color: #CBC7BE; cursor: not-allowed; background: #FAFAF8; }
.bw-tcell.is-active { background: ${y.active}; color: var(--bw-ink); font-weight: 700; box-shadow: ${y.activeShadow}; }

@media (prefers-reduced-motion: reduce) {
  .bw-cta-shine { transition: none; }
}
`,x={trigger:`group relative flex h-[52px] w-full min-w-0 items-center gap-2.5 rounded-[14px] border pl-2 pr-3 text-left outline-none transition-[border-color,background-color,box-shadow] duration-200`,triggerIdle:`border-[#E8E5DE] bg-[#F8F7F3] hover:border-[#D3CFC5] hover:bg-white focus-visible:border-[#FFD54F] focus-visible:bg-white focus-visible:shadow-[0_0_0_4px_rgba(255,213,79,0.18)]`,triggerOpen:`border-[#FFD54F] bg-white shadow-[0_0_0_4px_rgba(255,213,79,0.18)]`,chip:`grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] border transition-colors duration-200`,chipIdle:`border-[#E8E5DE] bg-white text-[#141414] group-focus-visible:border-[#FFD54F] group-focus-visible:bg-[#FFD54F]`,chipOpen:`border-[#FFD54F] bg-[#FFD54F] text-[#141414]`,value:`min-w-0 flex-1 truncate text-[15px] font-medium text-[#141414]`,placeholder:`font-normal text-[#A8A49B]`,pop:`rounded-[18px] border border-[#E8E5DE] bg-white shadow-[0_24px_48px_-16px_rgba(20,20,20,0.28),0_2px_6px_rgba(20,20,20,0.06)]`,gold:`bg-[linear-gradient(180deg,#FFD54A_0%,#FFD54F_55%,#F0A500_100%)] shadow-[0_8px_18px_-8px_rgba(240,165,0,0.75),inset_0_1px_0_rgba(255,255,255,0.6)]`,navBtn:`grid h-8 w-8 place-items-center rounded-[10px] text-[#2B2925] transition-colors hover:bg-[#F6F5F1] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD54F]`,dayBase:`relative grid h-9 place-items-center rounded-[10px] text-[13.5px] tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD54F] focus-visible:ring-offset-1`,daySelected:`font-bold text-[#141414] bg-[linear-gradient(180deg,#FFD54A_0%,#FFD54F_55%,#F0A500_100%)] shadow-[0_8px_18px_-8px_rgba(240,165,0,0.75),inset_0_1px_0_rgba(255,255,255,0.6)]`,dayDisabled:`cursor-not-allowed text-[#D3CFC5] line-through decoration-[#E3DFD6]`,dayOutside:`font-medium text-[#B9B5AC] hover:bg-[#F6F5F1]`,dayIdle:`font-medium text-[#2B2925] hover:bg-[#FFF1C2]`,quick:`rounded-full border border-[#E8E5DE] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6F4EE_100%)] px-3 py-1.5 text-[12.5px] font-semibold text-[#2B2925] transition-colors hover:border-[#F0C24A] hover:bg-[linear-gradient(180deg,#FFFDF5_0%,#FDEFC4_100%)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD54F]`,quickActive:`rounded-full border border-transparent px-3 py-1.5 text-[12.5px] font-bold text-[#141414] bg-[linear-gradient(180deg,#FFD54A_0%,#FFD54F_55%,#F0A500_100%)] shadow-[0_8px_18px_-8px_rgba(240,165,0,0.75),inset_0_1px_0_rgba(255,255,255,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141414]`,option:`flex cursor-pointer select-none items-center gap-3 rounded-[12px] px-2.5 py-2 transition-colors`,badge:`grid h-9 min-w-[48px] place-items-center rounded-[10px] bg-[linear-gradient(180deg,#2B2B2B_0%,#141414_100%)] px-2 text-[11.5px] font-bold tracking-[0.06em] text-[#FFD54F]`};function S({estimatedHeight:e=360,minWidth:t=280,onClose:n}={}){let r=(0,h.useRef)(null),i=(0,h.useRef)(null),a=(0,h.useRef)(n);a.current=n;let[o,s]=(0,h.useState)(!1),[c,l]=(0,h.useState)(null),[u,d]=(0,h.useState)(!1);(0,h.useEffect)(()=>d(!0),[]);let f=(0,h.useCallback)(()=>{let n=r.current;if(!n)return;let i=n.getBoundingClientRect(),a=window.innerWidth,o=window.innerHeight,s=Math.min(Math.max(i.width,t),a-16),c=Math.min(Math.max(8,i.left),a-s-8),u=o-i.bottom,d=u<e+16&&i.top>u;l({left:c,width:s,top:d?void 0:i.bottom+8,bottom:d?o-i.top+8:void 0,placeAbove:d})},[e,t]),p=(0,h.useCallback)(()=>{f(),s(!0)},[f]),m=(0,h.useCallback)((e=!1)=>{s(!1),a.current?.(),e&&r.current?.focus({preventScroll:!0})},[]);return(0,h.useEffect)(()=>{if(!o)return;let e=e=>{r.current?.contains(e.target)||i.current?.contains(e.target)||m(!1)},t=e=>{e.key===`Escape`&&(e.preventDefault(),m(!0))};return document.addEventListener(`pointerdown`,e),document.addEventListener(`keydown`,t),window.addEventListener(`resize`,f),window.addEventListener(`scroll`,f,!0),()=>{document.removeEventListener(`pointerdown`,e),document.removeEventListener(`keydown`,t),window.removeEventListener(`resize`,f),window.removeEventListener(`scroll`,f,!0)}},[o,m,f]),{triggerRef:r,popRef:i,open:o,pos:c,show:p,hide:m,mounted:u}}function C({pop:e,label:t,className:n=``,children:a}){return e.mounted?(0,g.createPortal)((0,_.jsx)(i,{children:e.open&&e.pos&&(0,_.jsx)(r.div,{ref:e.popRef,"aria-label":t,initial:{opacity:0,y:e.pos.placeAbove?6:-6,scale:.97},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,y:e.pos.placeAbove?4:-4,scale:.98},transition:{duration:.18,ease:v},style:{position:`fixed`,left:e.pos.left,width:e.pos.width,top:e.pos.top,bottom:e.pos.bottom,zIndex:99999,transformOrigin:e.pos.placeAbove?`bottom left`:`top left`},className:`${x.pop} ${n}`,children:a})}),document.body):null}var w=[`Su`,`Mo`,`Tu`,`We`,`Th`,`Fr`,`Sa`],T=new Intl.DateTimeFormat(`en-IN`,{month:`long`,year:`numeric`}),E=new Intl.DateTimeFormat(`en-IN`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`});function D(e){return new Date(e.getFullYear(),e.getMonth(),1)}function O(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}function k(e,t){let n=new Date(e.getFullYear(),e.getMonth()+t,1),r=new Date(n.getFullYear(),n.getMonth()+1,0).getDate();return new Date(n.getFullYear(),n.getMonth(),Math.min(e.getDate(),r))}function A(e,t){return!!e&&!!t&&e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function j(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()}function M(e){return p(e,{weekday:!0,year:`auto`})}function N({value:e,onChange:t,min:n,placeholder:i=`Select date`,ariaLabel:a=`Choose date`,showQuickPicks:o=!0}){let s=S({estimatedHeight:410,minWidth:312}),c=d(e),l=d(n),u=d(f(new Date)),p=c||l||u,[m,g]=(0,h.useState)(()=>D(p)),[y,b]=(0,h.useState)(p),[N,P]=(0,h.useState)(0),F=(0,h.useRef)(null),R=(0,h.useRef)(!1),z=e=>!!l&&e<l,B=!l||m>D(l);function V(){let e=c||l||u;g(D(e)),b(e),P(0),s.show()}function H(e){z(e)||(t({target:{value:f(e)}}),s.hide(!0))}function U(e){let t=k(y,e);P(e),g(D(t)),b(t)}function W(e){j(e,m)||(P(e>y?1:-1),g(D(e))),R.current=!0,b(e)}function G(e){let t={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7},n=null;if(t[e.key]!==void 0)n=O(y,t[e.key]);else if(e.key===`PageUp`)n=k(y,-1);else if(e.key===`PageDown`)n=k(y,1);else if(e.key===`Home`)n=O(y,-y.getDay());else if(e.key===`End`)n=O(y,6-y.getDay());else if(e.key===`Enter`||e.key===` `){e.preventDefault(),H(y);return}n&&(e.preventDefault(),W(n))}let K=()=>F.current?.querySelector(`[data-date="${f(y)}"]`)?.focus({preventScroll:!0});(0,h.useEffect)(()=>{if(!s.open)return;let e=requestAnimationFrame(K);return()=>cancelAnimationFrame(e)},[s.open]),(0,h.useEffect)(()=>{if(!s.open||!R.current)return;R.current=!1;let e=requestAnimationFrame(K);return()=>cancelAnimationFrame(e)},[y]);let q=O(m,-m.getDay()),J=Array.from({length:42},(e,t)=>O(q,t)),Y=O(u,1),X=O(u,(6-u.getDay()+7)%7||7),Z=[[`Today`,u],[`Tomorrow`,Y],[`Saturday`,X]].filter(([,e],t,n)=>n.findIndex(([,t])=>A(t,e))===t);return(0,_.jsxs)(_.Fragment,{children:[(0,_.jsxs)(`button`,{ref:s.triggerRef,type:`button`,"aria-haspopup":`dialog`,"aria-expanded":s.open,"aria-label":c?`${a}: ${E.format(c)}`:a,onClick:()=>s.open?s.hide():V(),onKeyDown:e=>{e.key===`ArrowDown`&&!s.open&&(e.preventDefault(),V())},className:`${x.trigger} ${s.open?x.triggerOpen:x.triggerIdle}`,children:[(0,_.jsx)(`span`,{className:`${x.chip} ${s.open?x.chipOpen:x.chipIdle}`,children:(0,_.jsx)(I,{})}),(0,_.jsx)(`span`,{className:`${x.value} ${c?``:x.placeholder}`,children:c?M(c):i}),(0,_.jsx)(r.span,{animate:{rotate:s.open?180:0},transition:{duration:.2},className:`inline-flex text-[#77736A]`,children:(0,_.jsx)(L,{})})]}),(0,_.jsx)(C,{pop:s,label:a,className:`p-3.5`,children:(0,_.jsxs)(`div`,{role:`dialog`,"aria-label":a,children:[(0,_.jsxs)(`div`,{className:`mb-3 flex items-center justify-between gap-2`,children:[(0,_.jsx)(`button`,{type:`button`,onClick:()=>U(-1),disabled:!B,"aria-label":`Previous month`,className:x.navBtn,children:(0,_.jsx)(L,{className:`rotate-90`})}),(0,_.jsx)(`div`,{className:`overflow-hidden`,children:(0,_.jsx)(r.p,{initial:N!==0&&{opacity:0,y:N>0?8:-8},animate:{opacity:1,y:0},transition:{duration:.22,ease:v},"aria-live":`polite`,className:`m-0 text-[15px] font-bold tracking-[-0.01em] text-[#141414]`,children:T.format(m)},f(m))}),(0,_.jsx)(`button`,{type:`button`,onClick:()=>U(1),"aria-label":`Next month`,className:x.navBtn,children:(0,_.jsx)(L,{className:`-rotate-90`})})]}),(0,_.jsx)(`div`,{className:`grid grid-cols-7 gap-1 pb-1.5`,children:w.map(e=>(0,_.jsx)(`span`,{className:`text-center text-[11.5px] font-semibold text-[#A8A49B]`,children:e},e))}),(0,_.jsx)(r.div,{ref:F,onKeyDown:G,initial:N!==0&&{opacity:0,x:N*16},animate:{opacity:1,x:0},transition:{duration:.24,ease:v},className:`grid grid-cols-7 gap-1`,children:J.map(e=>{let t=f(e),n=A(e,c),r=A(e,u),i=z(e),a=n?x.daySelected:i?x.dayDisabled:j(e,m)?x.dayIdle:x.dayOutside;return(0,_.jsxs)(`button`,{type:`button`,"data-date":t,tabIndex:A(e,y)?0:-1,"aria-disabled":i||void 0,"aria-pressed":n,"aria-current":r?`date`:void 0,"aria-label":E.format(e),onClick:()=>H(e),className:`${x.dayBase} ${a}`,children:[e.getDate(),r&&!n&&(0,_.jsx)(`span`,{"aria-hidden":!0,className:`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#F0A500]`})]},t)})},f(m)),o&&(0,_.jsx)(`div`,{className:`mt-3 flex flex-wrap gap-1.5 border-t border-[#EFECE6] pt-3`,children:Z.map(([e,t])=>(0,_.jsxs)(`button`,{type:`button`,disabled:z(t),onClick:()=>H(t),className:A(t,c)?x.quickActive:x.quick,children:[e,(0,_.jsx)(`span`,{className:`ml-1 font-medium opacity-60`,children:t.getDate()})]},e))})]})})]})}function P({value:e,onChange:t,error:a=``,placeholder:o=`Select time`,ariaLabel:s=`Choose pickup time`}){let[c,l]=(0,h.useState)(!1),[u,d]=(0,h.useState)(!1);(0,h.useEffect)(()=>d(!0),[]);let f=(0,h.useRef)(null),p=(0,h.useRef)(null),[m,y]=(0,h.useState)({top:0,left:0,width:0});function b(e){if(!e)return{h12:10,minute:0,ampm:`AM`};let[t,n]=e.split(`:`).map(Number);return{h12:t%12||12,minute:n,ampm:t<12?`AM`:`PM`}}let{h12:x,minute:S,ampm:C}=b(e);function w(){if(!f.current)return;let e=f.current.getBoundingClientRect(),t=window.innerWidth,n=Math.max(e.width,264),r=Math.min(Math.max(8,e.left),t-n-8)+window.scrollX;y({top:e.bottom+window.scrollY+8,left:r,width:n})}function T(){c?l(!1):(w(),l(!0))}(0,h.useEffect)(()=>{if(!c)return;function e(e){f.current&&!f.current.contains(e.target)&&p.current&&!p.current.contains(e.target)&&l(!1)}function t(e){e.key===`Escape`&&l(!1)}return document.addEventListener(`mousedown`,e),document.addEventListener(`keydown`,t),()=>{document.removeEventListener(`mousedown`,e),document.removeEventListener(`keydown`,t)}},[c]),(0,h.useEffect)(()=>{if(c)return window.addEventListener(`scroll`,w,!0),window.addEventListener(`resize`,w),()=>{window.removeEventListener(`scroll`,w,!0),window.removeEventListener(`resize`,w)}},[c]);let E=(()=>{if(!e)return null;let[t,n]=e.split(`:`).map(Number);return`${t%12||12}:${String(n).padStart(2,`0`)} ${t<12?`AM`:`PM`}`})(),D=[];for(let e=0;e<24;e++)for(let t=0;t<60;t+=15){let n=`${String(e).padStart(2,`0`)}:${String(t).padStart(2,`0`)}`,r=e%12||12,i=e<12?`AM`:`PM`,a=`${r}:${String(t).padStart(2,`0`)} ${i}`;D.push({value:n,label:a})}let O=(0,h.useRef)(null);(0,h.useEffect)(()=>{if(c&&O.current&&e){let t=D.findIndex(t=>t.value===e);if(t>-1){let e=O.current.children[t];e&&e.scrollIntoView({block:`center`,behavior:`instant`})}}},[c]);let k=u?(0,g.createPortal)((0,_.jsx)(i,{children:c&&(0,_.jsxs)(r.div,{ref:p,className:`bw-portal bw-pop`,role:`listbox`,"aria-label":s,initial:{opacity:0,y:-6,scale:.97},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,y:-4,scale:.98},transition:{duration:.18,ease:v},style:{position:`absolute`,top:m.top,left:m.left,width:m.width,zIndex:99999,transformOrigin:`top left`,padding:0,overflow:`hidden`},children:[a&&(0,_.jsx)(`p`,{role:`alert`,className:`bw-time-error`,style:{margin:`10px 14px 0`},children:a}),(0,_.jsx)(`div`,{ref:O,style:{maxHeight:260,overflowY:`auto`,padding:`6px 0`,scrollbarWidth:`thin`},children:D.map(n=>(0,_.jsx)(`button`,{type:`button`,role:`option`,"aria-selected":n.value===e,onClick:()=>{t({target:{value:n.value}}),l(!1)},style:{display:`block`,width:`100%`,padding:`11px 18px`,border:`none`,background:n.value===e?`#FFF8DF`:`transparent`,color:n.value===e?`#B07A00`:`#2B2925`,fontWeight:n.value===e?700:500,fontSize:15,textAlign:`left`,cursor:`pointer`,transition:`background .15s`,fontVariantNumeric:`tabular-nums`},onMouseEnter:t=>{n.value!==e&&(t.target.style.background=`#F8F7F3`)},onMouseLeave:t=>{n.value!==e&&(t.target.style.background=`transparent`)},children:n.label},n.value))})]},`tp-dropdown`)}),document.body):null;return(0,_.jsxs)(_.Fragment,{children:[(0,_.jsxs)(`div`,{ref:f,className:`relative w-full`,children:[(0,_.jsxs)(`div`,{role:`button`,tabIndex:0,"aria-haspopup":`dialog`,"aria-expanded":c,"aria-invalid":a?!0:void 0,onClick:T,onKeyDown:e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),T())},className:`bw-field bw-field--button ${c?`is-open`:``} ${a?`has-error`:``}`,children:[(0,_.jsx)(`span`,{className:`bw-chip`,children:(0,_.jsx)(n,{className:`w-4 h-4`})}),(0,_.jsx)(`span`,{className:`bw-input ${E?``:`is-placeholder`}`,children:E||o}),(0,_.jsx)(r.span,{animate:{rotate:c?180:0},transition:{duration:.2},className:`inline-flex`,style:{marginRight:6,color:`#77736A`},children:(0,_.jsx)(L,{})})]}),k]}),a&&!c&&(0,_.jsx)(`p`,{role:`alert`,className:`bw-time-error`,style:{marginTop:4,paddingLeft:2},children:a})]})}var F={width:16,height:16,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:1.7,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":!0};function I(){return(0,_.jsxs)(`svg`,{...F,children:[(0,_.jsx)(`rect`,{x:`3.5`,y:`5`,width:`17`,height:`15`,rx:`3`}),(0,_.jsx)(`path`,{d:`M3.5 10h17M8 3v4M16 3v4`})]})}function L({className:e=``}){return(0,_.jsx)(`svg`,{...F,width:14,height:14,strokeWidth:2,className:e,children:(0,_.jsx)(`path`,{d:`M6 9l6 6 6-6`})})}function R({children:e,compact:t=!1,className:n=``}){return(0,_.jsx)(l,{features:s,strict:!0,children:(0,_.jsxs)(o,{reducedMotion:`user`,children:[(0,_.jsx)(`style`,{children:b}),t&&(0,_.jsx)(`style`,{children:`.bw-compact .bw-field, .bw-compact button[aria-haspopup="dialog"] { height: 42px !important; }
.bw-compact .bw-chip { width: 30px; height: 30px; }`}),(0,_.jsx)(`div`,{className:`bw-root ${t?`bw-compact`:``} ${n}`.trim(),children:e})]})})}var z={4:`Half day`,8:`Full day`,12:`Extended day`},B=(e,t)=>{let n=`${e} hrs / ${t} km`;return{value:n,label:n,description:z[e]||`${e} hour package`,hours:e,km:t}},V=[B(4,40),B(8,80),B(12,120)],H=null;function U(e){let t=new Map;for(let n of e.values())for(let e of n.packages||[]){let n=Number(e.includedHours),r=Number(e.includedKm);if(!n||!r)continue;let i=`${n}/${r}`;t.has(i)||t.set(i,B(n,r))}return[...t.values()].sort((e,t)=>e.hours-t.hours||e.km-t.km)}function W(){let[e,t]=(0,h.useState)(H||V);return(0,h.useEffect)(()=>{if(H)return;let e=!0;return u().then(n=>{let r=n&&n.size?U(n):[];H=r.length?r:V,e&&t(H)}).catch(()=>{}),()=>{e=!1}},[]),e}function G(e,t){let n=t&&t.length?t:V,r=/full/i.test(e)?n[n.length-1]:/half/i.test(e)?n[Math.floor((n.length-1)/2)]:n[0];return{pkg:r.value,hours:r.hours}}function K(e,t){let n=t&&t.length?t:V;if(n.some(t=>t.value===e))return e;let r=parseInt(e,10)||8;return n.reduce((e,t)=>Math.abs(t.hours-r)<Math.abs(e.hours-r)?t:e).value}export{L as a,y as c,x as d,P as f,b as i,R as l,m,G as n,N as o,S as p,W as r,v as s,K as t,C as u};