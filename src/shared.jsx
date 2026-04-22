// Componentes UI base + infraestructura de tema/contexto/íconos + cliente Supabase + hooks de datos.
// Extraídos de App.jsx el 21-abr-2026 (segundo paso) y 22-abr-2026 (tuberías para módulos).
// REGLA: este archivo NO debe importar de App.jsx ni de modules/.
// Si necesita algo nuevo, se le pasa como prop.

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── CLIENTE SUPABASE ─────────────────────────────────────────────────────────
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const _supaBase = (SUPA_URL && SUPA_KEY && !SUPA_URL.includes('XXXXX'))
  ? createClient(SUPA_URL, SUPA_KEY)
  : null;

export const supa = _supaBase ? {
  auth: _supaBase.auth,
  async get(u,m){const { data: { session } } = await _supaBase.auth.getSession(); const token = session?.access_token || SUPA_KEY; const r=await fetch(SUPA_URL+'/rest/v1/user_data?user_id=eq.'+u+'&module=eq.'+m+'&select=data',{headers:{apikey:SUPA_KEY,Authorization:'Bearer '+token}});const d=await r.json();return d?.[0]?.data??null;},
  async set(u,m,d){const { data: { session } } = await _supaBase.auth.getSession(); const token = session?.access_token || SUPA_KEY; await fetch(SUPA_URL+'/rest/v1/user_data',{method:'POST',headers:{apikey:SUPA_KEY,Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates'},body:JSON.stringify({user_id:u,module:m,data:d,updated_at:new Date().toISOString()})})}
} : null;

// ─── CONTEXTO ─────────────────────────────────────────────────────────────────
export const Ctx = createContext(null);
export const useCtx = () => useContext(Ctx);

// ─── TEMA ─────────────────────────────────────────────────────────────────────
export const themeTokens = {
  dark:  { bg:"#0d1117", surface:"#161b27", surface2:"#1e2636", border:"rgba(255,255,255,.08)", text:"#f0f0f0", text2:"#aaa", muted:"#555", inputBg:"rgba(255,255,255,.05)", inputBorder:"rgba(255,255,255,.1)", sidebarBg:"#0d1117", headerBg:"rgba(13,17,23,.85)" },
  light: { bg:"#f0f2f5", surface:"#ffffff", surface2:"#f7f8fa", border:"rgba(0,0,0,.09)", text:"#1a1a2e", text2:"#444", muted:"#999", inputBg:"rgba(0,0,0,.04)", inputBorder:"rgba(0,0,0,.12)", sidebarBg:"#1a1f2e", headerBg:"rgba(240,242,245,.9)" },
};
export const useTheme = () => { const ctx = useCtx(); return themeTokens[ctx?.theme||"dark"]; };

// ─── ÍCONOS ───────────────────────────────────────────────────────────────────
export const ICONS = {
  dashboard:"M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  accounts:"M4 10h3v7H4zm6.5-6h3v13h-3zM17 7h3v10h-3z",
  transactions:"M7 2l-4 4 4 4V8h10V6H7V2zm10 20l4-4-4-4v2H7v2h10v4z",
  exchange:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93V18h-2v1.93C7.06 19.48 4.52 16.94 4.07 14H6v-2H4.07C4.52 9.06 7.06 6.52 10 6.07V8h2V6.07c2.94.45 5.48 2.99 5.93 5.93H16v2h1.93c-.45 2.94-2.99 5.48-5.93 5.93z",
  transfers:"M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z",
  loans:"M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
  investments:"M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z",
  goals:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z",
  target:"M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm0-12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z",
  documents:"M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  reports:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
  logout:"M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
  plus:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  edit:"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  trash:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  check:"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  close:"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  menu:"M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
  eye:"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  eyeOff:"M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z",
  warn:"M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  back:"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  search:"M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  settings:"M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
  download:"M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
  recurring:"M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z",
  presupuesto:"M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
  importar:"M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
  conciliacion:"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  health:"M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z",
  mortgage:"M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  minus:"M19 13H5v-2h14v2z",
  chevron:"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  chart:"M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z",
  calendar:"M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z",
  asistente:"M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z",
  assets:"M12 3L2 12h3v9h6v-6h2v6h6v-9h3L12 3zm0 12.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
  attach:"M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z",
};

export const Ic = ({ n, size = 20, color = "currentColor", style: s }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink:0, ...s }}>
    {ICONS[n] ? <path d={ICONS[n]} /> : <circle cx="12" cy="12" r="10" />}
  </svg>
);

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────

export const Modal = ({ title, onClose, children, width = 480, open = true }) => {
  if (!open) return null;
  const th = useTheme();
  return (
  <div style={{
    position:"fixed", inset:0, background:"rgba(0,0,0,.65)", zIndex:1000,
    display:"flex", alignItems:"center", justifyContent:"center", padding:16,
    backdropFilter:"blur(4px)",
  }} onClick={e => e.target===e.currentTarget && onClose()}>
    <div style={{
      background:th.surface, border:`1px solid ${th.border}`,
      borderRadius:16, width:"100%", maxWidth:width, maxHeight:"90vh",
      overflow:"auto", boxShadow:"0 24px 80px rgba(0,0,0,.6)",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"17px 22px", borderBottom:`1px solid ${th.border}` }}>
        <h3 style={{ fontSize:16, fontWeight:700, color:th.text }}>{title}</h3>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:th.muted, display:"flex", padding:4, borderRadius:6 }}>
          <Ic n="close" size={18} />
        </button>
      </div>
      <div style={{ padding:22 }}>{children}</div>
    </div>
  </div>
  );
};

export const Inp = ({ label, type="text", value, onChange, placeholder, required, prefix, suffix, disabled }) => {
  const [show, setShow] = useState(false);
  const isPwd = type==="password";
  const th = useTheme();
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ display:"block", marginBottom:5, fontSize:12, fontWeight:600, color:th.muted, textTransform:"uppercase", letterSpacing:.4 }}>
        {label}{required && <span style={{ color:"#f39c12" }}> *</span>}
      </label>}
      <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
        {prefix && <span style={{ position:"absolute", left:11, color:th.muted, fontSize:13, pointerEvents:"none", zIndex:1 }}>{prefix}</span>}
        <input type={isPwd?(show?"text":"password"):type} value={value} onChange={onChange}
          placeholder={placeholder} disabled={disabled} style={{
            width:"100%", padding:`10px ${isPwd||suffix?"38px":"13px"} 10px ${prefix?"30px":"13px"}`,
            background:th.inputBg, border:`1px solid ${th.inputBorder}`,
            borderRadius:9, color:th.text, fontSize:14, outline:"none", transition:"border-color .15s",
            opacity:disabled?.5:1,
          }}
          onFocus={e => e.target.style.borderColor="#00d4aa"}
          onBlur={e => e.target.style.borderColor=th.inputBorder}
        />
        {isPwd && (
          <button type="button" onClick={() => setShow(s=>!s)} style={{ position:"absolute", right:10, background:"none", border:"none", cursor:"pointer", color:"#777", display:"flex" }}>
            <Ic n={show?"eyeOff":"eye"} size={17} />
          </button>
        )}
        {suffix && !isPwd && <span style={{ position:"absolute", right:11, color:"#777", fontSize:12 }}>{suffix}</span>}
      </div>
    </div>
  );
};

export const Sel = ({ label, value, onChange, options, required, disabled }) => {
  const th = useTheme();
  return (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ display:"block", marginBottom:5, fontSize:12, fontWeight:600, color:th.muted, textTransform:"uppercase", letterSpacing:.4 }}>
      {label}{required && <span style={{ color:"#f39c12" }}> *</span>}
    </label>}
    <select value={value} onChange={onChange} disabled={disabled} style={{
      width:"100%", padding:"10px 13px", background:th.inputBg,
      border:"1px solid rgba(255,255,255,.09)", borderRadius:9, color:"#f0f0f0",
      fontSize:14, outline:"none", cursor:disabled?"not-allowed":"pointer", opacity:disabled?.5:1,
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
  );
};

export const Btn = ({ children, onClick, variant="primary", size="md", disabled, full, style:sx }) => {
  const v = {
    primary:   { background:"linear-gradient(135deg,#00d4aa,#00a884)", color:"#fff", border:"none" },
    secondary: { background:"rgba(255,255,255,.07)", color:"#ccc", border:"1px solid rgba(255,255,255,.1)" },
    danger:    { background:"rgba(255,71,87,.12)", color:"#ff4757", border:"1px solid rgba(255,71,87,.3)" },
    ghost:     { background:"none", color:"#888", border:"none" },
  }[variant];
  const s = { sm:{padding:"6px 12px",fontSize:12}, md:{padding:"9px 18px",fontSize:13}, lg:{padding:"12px 24px",fontSize:15} }[size];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...v, ...s, borderRadius:9, cursor:disabled?"not-allowed":"pointer", fontWeight:600,
      display:"inline-flex", alignItems:"center", gap:7, justifyContent:"center",
      transition:"all .15s", width:full?"100%":"auto", opacity:disabled?.5:1, ...sx,
    }}>{children}</button>
  );
};

export const Card = ({ children, style:sx, onClick }) => {
  const th = useTheme();
  return <div onClick={onClick} style={{
    background:th.surface, border:`1px solid ${th.border}`,
    borderRadius:14, padding:18, transition:"all .15s", cursor:onClick?"pointer":"default", ...sx,
  }}
    onMouseEnter={onClick?e=>{e.currentTarget.style.background="rgba(255,255,255,.055)";e.currentTarget.style.borderColor="rgba(0,212,170,.25)";}:undefined}
    onMouseLeave={onClick?e=>{e.currentTarget.style.background="rgba(255,255,255,.03)";e.currentTarget.style.borderColor="rgba(255,255,255,.07)";}:undefined}
  >{children}</div>;
};

// ─── TOOLTIP DE AYUDA ─────────────────────────────────────────────────────────
// NOTA: las 2 warnings "Duplicate key whiteSpace/transform" son preexistentes
// (doc. como deuda técnica en HANDOFF.md). Se mueven tal cual — fix aparte.
export const HelpTip = ({ text }) => {
  const [show, setShow] = React.useState(false);
  return (
    <span style={{position:"relative",display:"inline-flex",alignItems:"center",marginLeft:5,verticalAlign:"middle"}}>
      <span
        onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}
        style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:15,height:15,borderRadius:"50%",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",color:"#666",fontSize:9,fontWeight:700,cursor:"help",userSelect:"none",lineHeight:1}}>
        ?
      </span>
      {show&&(
        <span style={{position:"absolute",bottom:"calc(100% + 6px)",left:"50%",transform:"translateX(-50%)",
          background:"#1a2035",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,padding:"7px 10px",
          fontSize:11,color:"#ccc",lineHeight:1.45,whiteSpace:"nowrap",maxWidth:220,whiteSpace:"normal",
          zIndex:999,boxShadow:"0 6px 20px rgba(0,0,0,.5)",pointerEvents:"none",textAlign:"left",minWidth:160}}>
          {text}
          <span style={{position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%)",width:8,height:8,background:"#1a2035",border:"1px solid rgba(255,255,255,.12)",borderBottom:"none",borderRight:"none",transform:"translateX(-50%) rotate(45deg)"}}/>
        </span>
      )}
    </span>
  );
};

// ─── BADGES Y ACCIONES ────────────────────────────────────────────────────────

export const Badge = ({ label, color="#00d4aa" }) => (
  <span style={{ background:`${color}22`, color, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>{label}</span>
);

export const Actions = ({ onEdit, onDelete }) => (
  <div style={{ display:"flex", gap:4, flexShrink:0 }} onClick={e => e.stopPropagation()}>
    {onEdit && (
      <button onClick={onEdit} style={{ background:"rgba(255,255,255,.06)", border:"none", cursor:"pointer", color:"#888", padding:"5px 8px", borderRadius:7, display:"flex", alignItems:"center" }}
        onMouseEnter={e=>e.currentTarget.style.color="#00d4aa"} onMouseLeave={e=>e.currentTarget.style.color="#888"}>
        <Ic n="edit" size={14} />
      </button>
    )}
    <button onClick={onDelete} style={{ background:"rgba(255,71,87,.08)", border:"none", cursor:"pointer", color:"#ff4757", padding:"5px 8px", borderRadius:7, display:"flex", alignItems:"center" }}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,71,87,.2)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,71,87,.08)"}>
      <Ic n="trash" size={14} />
    </button>
  </div>
);

// ─── MODAL DE CONFIRMACIÓN ────────────────────────────────────────────────────

export const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(4px)" }}>
    <div style={{ background:"#161b27", border:"1px solid rgba(255,255,255,.1)", borderRadius:14, padding:24, maxWidth:380, width:"100%", boxShadow:"0 24px 80px rgba(0,0,0,.6)" }}>
      <div style={{ display:"flex", gap:12, marginBottom:20, alignItems:"flex-start" }}>
        <div style={{ width:36, height:36, borderRadius:9, background:"rgba(255,71,87,.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Ic n="warn" size={18} color="#ff4757"/>
        </div>
        <p style={{ fontSize:14, color:"#ccc", lineHeight:1.5, margin:0 }}>{message}</p>
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
        <Btn variant="secondary" onClick={onCancel}>Cancelar</Btn>
        <Btn variant="danger" onClick={onConfirm}><Ic n="trash" size={14}/>Eliminar</Btn>
      </div>
    </div>
  </div>
);

export const useConfirm = () => {
  const [state, setState] = useState(null);
  const askConfirm = (message) => new Promise(resolve => setState({ message, resolve }));
  const confirmModal = state ? (
    <ConfirmModal
      message={state.message}
      onConfirm={() => { state.resolve(true);  setState(null); }}
      onCancel={()  => { state.resolve(false); setState(null); }}
    />
  ) : null;
  return [askConfirm, confirmModal];
};

// ─── PERSISTENCIA Y DATOS ─────────────────────────────────────────────────────

export const store = {
  get: (k, fallback = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};

export const uKey = (uid, mod) => `fp_${uid}_${mod}`;

// Tipo de cambio USD→MXN configurable desde Settings.
export const getTc = (userId) => {
  try {
    const cfg = JSON.parse(localStorage.getItem(`fp_data_${userId}_config`) || "{}");
    return parseFloat(cfg.tipoCambio) || 17.5;
  } catch { return 17.5; }
};

// Hook central de datos: lee/escribe en Supabase con cache en localStorage.
export const useData = (userId, key, fallback = []) => {
  const [data, setData] = useState(() => store.get(uKey(userId, key), fallback));
  useEffect(() => {
    if (!supa || !userId) return;
    supa.get(userId, key).then(val => { if (val !== null) { store.set(uKey(userId, key), val); setData(val); } }).catch(()=>{});
  }, [userId, key]);
  const save = useCallback((val) => {
    setData(prev => {
      const next = typeof val==="function" ? val(prev) : val;
      store.set(uKey(userId, key), next);
      if (supa && userId) supa.set(userId, key, next).catch(()=>{});
      return next;
    });
  }, [userId, key]);
  return [data, save];
};
