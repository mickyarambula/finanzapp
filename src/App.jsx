import React, { useState, useEffect, useRef, useCallback } from "react";
import { fmt, fmtDate, today, genId } from "./utils";
import {
  Ctx, useCtx, themeTokens, useTheme, ICONS, Ic, Card, Btn, Modal, Inp, Sel,
  supa, store, uKey, getTc, Badge, Actions, ConfirmModal, useConfirm, useData,
  HelpTip, Alert,
} from "./shared";
import Metas from "./modules/Metas";
import Mortgage from "./modules/Mortgage";
import Recurring from "./modules/Recurring";
import Loans from "./modules/Loans";
import Investments from "./modules/Investments";
import Dashboard from "./modules/Dashboard";
import Transactions from "./modules/Transactions";
import Accounts from "./modules/Accounts";
import Transfers from "./modules/Transfers";
import Reports from "./modules/Reports";
import { Settings } from "./modules/Settings";

// supa, store, uKey, getTc, Badge, Actions, ConfirmModal, useConfirm, useData → movidos a ./shared.jsx

// ─── ESTILOS GLOBALES ─────────────────────────────────────────────────────────
const GlobalStyles = ({ dark=true }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --fp-bg:       ${dark?"#0d1117":"#f0f4f8"};
      --fp-surface:  ${dark?"#161b27":"#ffffff"};
      --fp-surface2: ${dark?"#1e2636":"#f1f5f9"};
      --fp-border:   ${dark?"rgba(255,255,255,.08)":"rgba(0,0,0,.10)"};
      --fp-text:     ${dark?"#f0f0f0":"#1e2433"};
      --fp-muted:    ${dark?"#555":"#6b7280"};
      --fp-subtle:   ${dark?"#333":"#9ca3af"};
    }
    body { background: var(--fp-bg); font-family: 'DM Sans', sans-serif; transition: background .3s; }
    input, select, button, textarea { font-family: 'DM Sans', sans-serif !important; }
    option { background: ${dark?"#1a1f2e":"#ffffff"}; color: ${dark?"#f0f0f0":"#1a1a2e"}; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.15)"}; border-radius: 3px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
    ${!dark ? `
      /* ── MODO CLARO: overrides masivos por CSS ── */
      [data-fp="main"] { background: #f0f4f8 !important; }
      /* Superficies oscuras → blancas */
      [data-fp="main"] [style*="background:#0d1117"],[data-fp="main"] [style*="background: #0d1117"],
      [data-fp="main"] [style*="background:#161b27"],[data-fp="main"] [style*="background: #161b27"],
      [data-fp="main"] [style*="background:#1e2636"],[data-fp="main"] [style*="background: #1e2636"],
      [data-fp="main"] [style*="background:#0f1520"],[data-fp="main"] [style*="background: #0f1520"],
      [data-fp="main"] [style*="background:#1a1f2e"],[data-fp="main"] [style*="background: #1a1f2e"],
      [data-fp="main"] [style*="background:#252e42"],[data-fp="main"] [style*="background: #252e42"]
        { background: #ffffff !important; }
      /* rgba blancas → equivalentes grises suaves */
      [data-fp="main"] [style*="rgba(255,255,255,.02)"] { background: rgba(0,0,0,.018) !important; }
      [data-fp="main"] [style*="rgba(255,255,255,.03)"] { background: rgba(0,0,0,.028) !important; }
      [data-fp="main"] [style*="rgba(255,255,255,.04)"] { background: rgba(0,0,0,.038) !important; }
      [data-fp="main"] [style*="rgba(255,255,255,.05)"] { background: rgba(0,0,0,.04) !important; }
      [data-fp="main"] [style*="rgba(255,255,255,.06)"] { background: rgba(0,0,0,.05) !important; }
      [data-fp="main"] [style*="rgba(255,255,255,.07)"] { background: rgba(0,0,0,.06) !important; }
      [data-fp="main"] [style*="rgba(255,255,255,.08)"] { background: rgba(0,0,0,.065) !important; }
      [data-fp="main"] [style*="rgba(255,255,255,.1)"]  { background: rgba(0,0,0,.07) !important; }
      [data-fp="main"] [style*="rgba(255,255,255,.12)"] { background: rgba(0,0,0,.075) !important; }
      [data-fp="main"] [style*="rgba(255,255,255,.15)"] { background: rgba(0,0,0,.085) !important; }
      /* Bordes blancos → grises */
      [data-fp="main"] [style*="border-color:rgba(255,255,255,.04)"],
      [data-fp="main"] [style*="1px solid rgba(255,255,255,.04)"] { border-color: rgba(0,0,0,.07) !important; }
      [data-fp="main"] [style*="1px solid rgba(255,255,255,.06)"] { border-color: rgba(0,0,0,.09) !important; }
      [data-fp="main"] [style*="1px solid rgba(255,255,255,.08)"] { border-color: rgba(0,0,0,.10) !important; }
      [data-fp="main"] [style*="1px solid rgba(255,255,255,.1)"]  { border-color: rgba(0,0,0,.12) !important; }
      [data-fp="main"] [style*="1px solid rgba(255,255,255,.12)"] { border-color: rgba(0,0,0,.13) !important; }
      /* Textos grises hardcoded → legibles en claro */
      [data-fp="main"] [style*="color:#f0f0f0"],[data-fp="main"] [style*="color: #f0f0f0"] { color:#1e2433 !important; }
      [data-fp="main"] [style*="color:#e0e0e0"],[data-fp="main"] [style*="color: #e0e0e0"] { color:#1e2433 !important; }
      [data-fp="main"] [style*="color:#ddd"],[data-fp="main"] [style*="color: #ddd"]       { color:#374151 !important; }
      [data-fp="main"] [style*="color:#ccc"],[data-fp="main"] [style*="color: #ccc"]       { color:#374151 !important; }
      [data-fp="main"] [style*="color:#bbb"],[data-fp="main"] [style*="color: #bbb"]       { color:#4a5568 !important; }
      [data-fp="main"] [style*="color:#aaa"],[data-fp="main"] [style*="color: #aaa"]       { color:#4a5568 !important; }
      [data-fp="main"] [style*="color:#888"],[data-fp="main"] [style*="color: #888"]       { color:#6b7280 !important; }
      [data-fp="main"] [style*="color:#777"],[data-fp="main"] [style*="color: #777"]       { color:#6b7280 !important; }
      [data-fp="main"] [style*="color:#666"],[data-fp="main"] [style*="color: #666"]       { color:#6b7280 !important; }
      [data-fp="main"] [style*="color:#555"],[data-fp="main"] [style*="color: #555"]       { color:#6b7280 !important; }
      [data-fp="main"] [style*="color:#444"],[data-fp="main"] [style*="color: #444"]       { color:#7c8694 !important; }
      [data-fp="main"] [style*="color:#333"],[data-fp="main"] [style*="color: #333"]       { color:#9ca3af !important; }
      /* Inputs */
      [data-fp="main"] input:not([type=checkbox]):not([type=radio]),
      [data-fp="main"] select, [data-fp="main"] textarea {
        background: rgba(0,0,0,.04) !important;
        border-color: rgba(0,0,0,.14) !important;
        color: #1e2433 !important;
      }
      /* Separadores */
      [data-fp="main"] [style*="borderBottom:1px solid rgba(255,255,255"],
      [data-fp="main"] [style*="borderBottom: 1px solid rgba(255,255,255"] { border-bottom-color: rgba(0,0,0,.08) !important; }
      [data-fp="main"] [style*="borderTop:1px solid rgba(255,255,255"],
      [data-fp="main"] [style*="borderTop: 1px solid rgba(255,255,255"]   { border-top-color: rgba(0,0,0,.08) !important; }
    ` : ""}
  `}</style>
);

// Ctx, useCtx, themeTokens, useTheme → movidos a ./shared.jsx


// store, uKey → movidos a ./shared.jsx

// ─── HASH ─────────────────────────────────────────────────────────────────────
const hashPwd = async (pwd) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pwd + "_fp2025"));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
};

// getTc → movido a ./shared.jsx

// ── Hook: actualiza TC desde API pública al iniciar sesión (máx 1 vez por hora)
const useTcAuto = (userId, setConfig) => {
  useEffect(() => {
    if (!userId) return;
    const KEY = `fp_tc_lastfetch_${userId}`;
    const last = parseInt(localStorage.getItem(KEY)||"0");
    const ahora = Date.now();
    if (ahora - last < 3600000) return; // ya se actualizó hace menos de 1 hora
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(r => r.json())
      .then(data => {
        const tc = data?.rates?.MXN;
        if (tc && tc > 10 && tc < 30) {
          setConfig(c => ({ ...c, tipoCambio: tc.toFixed(2), tcAuto: true, tcFecha: new Date().toISOString() }));
          localStorage.setItem(KEY, String(ahora));
        }
      })
      .catch(() => {}); // falla silenciosa — queda el valor manual
  }, [userId]);
};

// ICONS, Ic → movidos a ./shared.jsx

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────

const ToastContainer = ({ toasts, remove }) => (
  <div style={{ position:"fixed", top:16, right:16, zIndex:9999, display:"flex", flexDirection:"column", gap:8 }}>
    {toasts.map(t => (
      <div key={t.id} onClick={() => remove(t.id)} style={{
        background: t.type==="error"?"#ff4757":t.type==="warning"?"#f39c12":"#00d4aa",
        color:"#fff", padding:"11px 18px", borderRadius:10, cursor:"pointer",
        fontSize:13, fontWeight:500, boxShadow:"0 4px 20px rgba(0,0,0,.3)",
        maxWidth:320, animation:"slideIn .25s ease",
      }}>{t.message}</div>
    ))}
  </div>
);

// Modal, Inp, Sel, Btn, Card → movidos a ./shared.jsx

// HelpTip → movido a ./shared.jsx

// Badge, Actions → movidos a ./shared.jsx
// Alert → movido a ./shared.jsx


// ConfirmModal, useConfirm → movidos a ./shared.jsx

// ─── AUTH ──────────────────────────────────────────────────────────────────────
const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setErr("");
    if (!email || !pwd) { setErr("Completa todos los campos."); return; }
    setLoading(true);
    try {
      const hash = await hashPwd(pwd);
      if (mode === "login") {
        if (!supa) { setErr("Servicio no disponible."); setLoading(false); return; }
        const { data, error } = await supa.auth.signInWithPassword({ email: email.toLowerCase(), password: pwd });
        if (error) { setErr("Correo o contraseña incorrectos."); setLoading(false); return; }
        const u = { id: data.user.id, name: data.user.user_metadata?.name || email, email: data.user.email };
        onLogin(u);
      } else {
        if (!name.trim()) { setErr("Ingresa tu nombre."); setLoading(false); return; }
        if (pwd !== pwd2) { setErr("Las contraseñas no coinciden."); setLoading(false); return; }
        if (pwd.length < 6) { setErr("Mínimo 6 caracteres."); setLoading(false); return; }
        if (!supa) { setErr("Servicio no disponible."); setLoading(false); return; }
        const { data, error } = await supa.auth.signUp({ email: email.toLowerCase(), password: pwd, options: { data: { name: name.trim() } } });
        if (error) { setErr(error.message); setLoading(false); return; }
        const nu = { id: data.user.id, name: name.trim(), email: email.toLowerCase() };
        onLogin(nu);
      }
    } catch(e) { setErr(e?.message || "Error inesperado."); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0d1117", display:"flex", alignItems:"center", justifyContent:"center", padding:20,
      backgroundImage:"radial-gradient(ellipse at 20% 50%,rgba(0,212,170,.07) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(0,120,255,.05) 0%,transparent 50%)" }}>
      <GlobalStyles />
      <div style={{ width:"100%", maxWidth:400, animation:"fadeUp .4s ease" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#00d4aa,#00a884)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(0,212,170,.3)" }}>
              <Ic n="investments" size={24} color="#fff" />
            </div>
            <span style={{ fontSize:26, fontFamily:"'Syne',sans-serif", fontWeight:800, color:"#f0f0f0" }}>
              Finanz<span style={{ color:"#00d4aa" }}>app</span>
            </span>
          </div>
          <p style={{ color:"#555", fontSize:13, marginBottom:16 }}>Control financiero personal</p>
          <div style={{display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap"}}>
            {["💳 Cuentas y tarjetas","📈 Inversiones y metas","📊 Estados financieros"].map(f=>(
              <span key={f} style={{fontSize:11,color:"#444",display:"flex",alignItems:"center",gap:4}}>{f}</span>
            ))}
          </div>
        </div>
        <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:18, padding:28 }}>
          <div style={{ display:"flex", gap:3, marginBottom:24, background:"rgba(255,255,255,.04)", borderRadius:9, padding:3 }}>
            {[["login","Iniciar Sesión"],["register","Registrarse"]].map(([m,l]) => (
              <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{
                flex:1, padding:"8px 0", borderRadius:7, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, transition:"all .15s",
                background:mode===m?"linear-gradient(135deg,#00d4aa,#00a884)":"transparent", color:mode===m?"#fff":"#777",
              }}>{l}</button>
            ))}
          </div>
          {mode==="register" && <Inp label="Nombre" value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre" required />}
          <Inp label="Correo" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@ejemplo.com" required />
          <Inp label="Contraseña" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="••••••••" required />
          {mode==="register" && <Inp label="Confirmar contraseña" type="password" value={pwd2} onChange={e=>setPwd2(e.target.value)} placeholder="••••••••" required />}
          {err && <Alert color="#ff4757">{err}</Alert>}
          <Btn full onClick={submit} disabled={loading} size="lg" style={{ marginTop:4 }}>
            {loading?"Cargando...":mode==="login"?"Entrar":"Crear cuenta"}
          </Btn>
        </div>
        <p style={{ textAlign:"center", color:"#444", fontSize:11, marginTop:20 }}>Datos sincronizados entre todos tus dispositivos.</p>
      </div>
    </div>
  );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Día a día",
    items: [
      { id:"dashboard",    label:"Dashboard",      icon:"dashboard" },
      { id:"transactions", label:"Transacciones",  icon:"transactions" },
      { id:"recurring",    label:"Recurrentes",    icon:"recurring" },
      { id:"accounts",     label:"Cuentas",        icon:"accounts" },
      { id:"transfers",    label:"Transferencias", icon:"transfers" },
    ]
  },
  {
    label: "Patrimonio",
    items: [
      { id:"investments",  label:"Inversiones",    icon:"investments" },
      { id:"assets",       label:"Activos",        icon:"assets" },
      { id:"loans",        label:"Préstamos",      icon:"loans" },
      { id:"mortgage",     label:"Crédito Casa",   icon:"mortgage" },
      { id:"goals",        label:"Metas",          icon:"goals" },
    ]
  },
  {
    label: "Análisis",
    items: [
      { id:"reports",      label:"Est. Financieros", icon:"reports" },
      { id:"patrimonio",   label:"Patrimonio",     icon:"patrimonio" },
      { id:"presupuestos", label:"Presupuestos",   icon:"presupuesto" },
      { id:"calendar",     label:"Calendario",     icon:"calendar" },
      { id:"documents",    label:"Documentos",     icon:"documents" },
    ]
  },
  {
    label: "Herramientas",
    items: [
      { id:"asistente",    label:"Asistente IA",   icon:"asistente" },
      { id:"conciliacion", label:"Conciliación",   icon:"conciliacion" },
      { id:"importar",     label:"Importar CSV",   icon:"importar" },
      { id:"settings",     label:"Configuración",  icon:"settings" },
    ]
  },
];
// flat list para compatibilidad (badges, búsqueda, etc.)
const NAV = NAV_GROUPS.flatMap(g => g.items);


const Sidebar = ({ active, setActive, user, onLogout, mobile, open, onClose, notif, theme, onToggleTheme }) => {
  const inner = (
    <div style={{ width:232, height:"100%", background:"#0f1520", display:"flex", flexDirection:"column", borderRight:"1px solid rgba(255,255,255,.06)" }}>
      <div style={{ padding:"20px 16px 16px", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#00d4aa,#00a884)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Ic n="investments" size={19} color="#fff" />
          </div>
          <span style={{ fontSize:19, fontFamily:"'Syne',sans-serif", fontWeight:800, color:"#f0f0f0" }}>
            Finanz<span style={{ color:"#00d4aa" }}>app</span>
          </span>
        </div>
      </div>
      <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,.05)", display:"flex", alignItems:"center", gap:9 }}>
        <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#7c3aed,#9333ea)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <span style={{ color:"#fff", fontSize:14, fontWeight:700 }}>{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <div style={{ overflow:"hidden" }}>
          <p style={{ fontSize:13, fontWeight:600, color:"#e0e0e0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", margin:0 }}>{user.name}</p>
          <p style={{ fontSize:11, color:"#555", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", margin:0 }}>{user.email}</p>
        </div>
      </div>
      {/* búsqueda global */}
      <GlobalSearch onNavigate={(id)=>{ setActive(id); if(mobile) onClose(); }}/>
      {/* campana de notificaciones */}
      {notif&&(
        <div style={{position:"relative",padding:"0 8px 6px"}}>
          <button onClick={()=>notif.setOpen(o=>!o)} style={{
            width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 11px",
            borderRadius:9,border:notif.open?"1px solid rgba(243,156,18,.3)":"1px solid transparent",
            background:notif.open?"rgba(243,156,18,.08)":"rgba(255,255,255,.03)",
            cursor:"pointer",transition:"all .12s",
          }}
            onMouseEnter={e=>{if(!notif.open){e.currentTarget.style.background="rgba(255,255,255,.05)";}}}
            onMouseLeave={e=>{if(!notif.open){e.currentTarget.style.background="rgba(255,255,255,.03)";}}}
          >
            <div style={{position:"relative",flexShrink:0}}>
              <Ic n="warn" size={16} color={notif.errCount>0?"#ff4757":notif.warnCount>0?"#f39c12":"#555"}/>
              {notif.totalBadge>0&&(
                <span style={{position:"absolute",top:-5,right:-5,minWidth:14,height:14,borderRadius:7,background:notif.errCount>0?"#ff4757":"#f39c12",color:"#fff",fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px",lineHeight:1}}>
                  {notif.totalBadge>9?"9+":notif.totalBadge}
                </span>
              )}
            </div>
            <span style={{fontSize:12,fontWeight:600,color:notif.totalBadge>0?"#e0e0e0":"#555",flex:1}}>
              {notif.totalBadge>0?`${notif.totalBadge} alerta${notif.totalBadge>1?"s":""}`:notif.noLeidas>0?"Historial":"Sin alertas"}
            </span>
            {notif.noLeidas>0&&(
              <span style={{fontSize:9,fontWeight:700,color:"#00d4aa",background:"rgba(0,212,170,.12)",borderRadius:10,padding:"1px 6px"}}>{notif.noLeidas} nueva{notif.noLeidas>1?"s":""}</span>
            )}
          </button>
          {notif.open&&(
            <NotifPanel notif={notif} onNavigate={(id)=>{ setActive(id); notif.setOpen(false); if(mobile) onClose(); }}/>
          )}
        </div>
      )}
      <nav style={{ flex:1, padding:"8px 8px 10px", overflowY:"auto" }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} style={{ marginBottom: gi < NAV_GROUPS.length-1 ? 6 : 0 }}>
            {/* etiqueta de grupo */}
            <p style={{
              fontSize:9, fontWeight:700, color:"#3a4255", textTransform:"uppercase",
              letterSpacing:1.2, margin:"0 0 2px", padding:"4px 11px 2px",
            }}>{group.label}</p>
            {group.items.map(item => {
              const on = active===item.id || active.startsWith(item.id+":");
              const itemAlerts = notif?notif.alertas.filter(a=>a.modulo===item.id):[];
              const hasErr = itemAlerts.some(a=>a.nivel==="error");
              const hasWarn = itemAlerts.some(a=>a.nivel==="warning");
              const dotColor = hasErr?"#ff4757":hasWarn?"#f39c12":null;
              return (
                <button key={item.id} onClick={() => { setActive(item.id); if(mobile) onClose(); }} style={{
                  width:"100%", display:"flex", alignItems:"center", gap:10, padding:"7px 11px", marginBottom:1,
                  borderRadius:9, border:"none", cursor:"pointer", textAlign:"left",
                  background:on?"rgba(0,212,170,.1)":"transparent", color:on?"#00d4aa":"#666",
                  borderLeft:on?"3px solid #00d4aa":"3px solid transparent", transition:"all .12s",
                }}
                  onMouseEnter={e=>{ if(!on){e.currentTarget.style.background="rgba(255,255,255,.04)";e.currentTarget.style.color="#bbb";}}}
                  onMouseLeave={e=>{ if(!on){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#666";}}}
                >
                  <Ic n={item.icon} size={16} color="currentColor" />
                  <span style={{ fontSize:12, fontWeight:on?600:400, flex:1 }}>{item.label}</span>
                  {dotColor&&<span style={{width:6,height:6,borderRadius:"50%",background:dotColor,flexShrink:0}}/>}
                </button>
              );
            })}
            {gi < NAV_GROUPS.length-1 && (
              <div style={{height:1,background:"rgba(255,255,255,.04)",margin:"6px 4px 4px"}}/>
            )}
          </div>
        ))}
      </nav>
      <div style={{ padding:"10px 8px", borderTop:"1px solid rgba(255,255,255,.05)" }}>
        {/* theme toggle */}
        <button onClick={onToggleTheme} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, padding:"9px 11px", borderRadius:9, border:"none", cursor:"pointer", background:"transparent", color:"#666", transition:"all .12s", marginBottom:2 }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.04)";e.currentTarget.style.color="#aaa";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#666";}}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:15 }}>{theme==="dark"?"🌙":"☀️"}</span>
            <span style={{ fontSize:13 }}>{theme==="dark"?"Modo oscuro":"Modo claro"}</span>
          </div>
          {/* toggle pill */}
          <div style={{ width:34, height:18, borderRadius:9, background:theme==="dark"?"#333":"#00d4aa", position:"relative", transition:"background .2s", flexShrink:0 }}>
            <div style={{ position:"absolute", top:2, left:theme==="dark"?2:16, width:14, height:14, borderRadius:"50%", background:"#fff", transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.3)" }}/>
          </div>
        </button>
        <button onClick={onLogout} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 11px", borderRadius:9, border:"none", cursor:"pointer", background:"transparent", color:"#666", transition:"all .12s" }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,71,87,.07)";e.currentTarget.style.color="#ff4757";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#666";}}>
          <Ic n="logout" size={17} color="currentColor" />
          <span style={{ fontSize:13 }}>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
  if (mobile) {
    if (!open) return null;
    return (
      <div style={{ position:"fixed", inset:0, zIndex:200 }}>
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.6)" }} onClick={onClose} />
        <div style={{ position:"absolute", left:0, top:0, bottom:0 }}>{inner}</div>
      </div>
    );
  }
  return <div style={{ flexShrink:0 }}>{inner}</div>;
};

// ─── HOOK DATOS ───────────────────────────────────────────────────────────────
// useData → movido a ./shared.jsx


// ─── BÚSQUEDA GLOBAL ──────────────────────────────────────────────────────────



// ─── SISTEMA DE NOTIFICACIONES ────────────────────────────────────────────────

// Hook que calcula alertas y las persiste en historial
const useNotifications = (user, transactions, accounts, loans, presupuestos, goals, mortgages, transfers) => {
  const storKey = `fp_notif_hist_${user?.id}`;
  const lastKey = `fp_notif_last_${user?.id}`;
  const [hist, setHist] = React.useState(() => store.get(storKey, []));
  const [open, setOpen] = React.useState(false);

  // calcular alertas activas (misma lógica que Dashboard pero como función pura)
  const calcAlertas = React.useCallback(() => {
    if(!user) return [];
    const now = new Date();
    const mesKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const fmtN = v => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:0,maximumFractionDigits:0}).format(v);
    const gastoProm3M = (() => {
      let t=0; for(let i=1;i<=3;i++){const d=new Date(now);d.setMonth(d.getMonth()-i);const mk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;t+=transactions.filter(x=>x.date?.startsWith(mk)&&x.type==="expense").reduce((s,x)=>s+parseFloat(x.amount||0),0);}
      return t/3;
    })();
    const list = [];

    // vencidos
    loans.filter(l=>l.dueDate&&new Date(l.dueDate)<now).forEach(l=>
      list.push({id:`loan_${l.id}`,nivel:"error",msg:`Préstamo vencido: ${l.name}`,modulo:"loans"}));

    // saldo negativo
    accounts.filter(a=>a.type!=="credit"&&parseFloat(a.balance||0)<0).forEach(a=>
      list.push({id:`neg_${a.id}`,nivel:"error",msg:`Saldo negativo: ${a.name}`,modulo:"accounts"}));

    // tarjeta vencida/próxima — solo si hay saldo real que pagar
    accounts.filter(a=>a.type==="credit"&&a.fechaPago).forEach(a=>{
      const saldo=Math.abs(Math.min(parseFloat(a.balance||0),0));
      if(saldo<1) return; // sin deuda, no alertar
      const dias=Math.round((new Date(a.fechaPago+"T12:00:00")-now)/86400000);
      if(dias<0) list.push({id:`tj_venc_${a.id}`,nivel:"error",msg:`Pago vencido: ${a.name}`,modulo:"accounts"});
      else if(dias<=7) list.push({id:`tj_prox_${a.id}`,nivel:"warning",msg:`Pago en ${dias}d: ${a.name} — ${fmtN(saldo)}`,modulo:"accounts"});
    });

    // presupuestos
    presupuestos.filter(p=>p.activo).forEach(p=>{
      const g=transactions.filter(t=>t.date?.startsWith(mesKey)&&t.type==="expense"&&(p.tipo==="global"||t.category===p.categoria)).reduce((s,t)=>s+parseFloat(t.amount||0),0);
      const pct=g/(parseFloat(p.montoLimite)||1)*100;
      if(pct>=100) list.push({id:`pres_exc_${p.id}`,nivel:"error",msg:`Presupuesto excedido: ${p.nombre}`,modulo:"presupuestos"});
      else if(pct>=80) list.push({id:`pres_80_${p.id}`,nivel:"warning",msg:`Presupuesto al ${pct.toFixed(0)}%: ${p.nombre}`,modulo:"presupuestos"});
    });

    // tarjeta al 80%+ límite
    accounts.filter(a=>a.type==="credit"&&parseFloat(a.creditLimit||0)>0).forEach(a=>{
      const uso=Math.abs(parseFloat(a.balance||0))/parseFloat(a.creditLimit)*100;
      if(uso>=80) list.push({id:`tj_lim_${a.id}`,nivel:uso>=90?"error":"warning",msg:`${a.name} al ${uso.toFixed(0)}% del límite`,modulo:"accounts"});
    });

    // gasto alto vs promedio
    const gastMes=transactions.filter(t=>t.date?.startsWith(mesKey)&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const ingrMes=transactions.filter(t=>t.date?.startsWith(mesKey)&&t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    if(gastoProm3M>500&&gastMes>gastoProm3M*1.3) list.push({id:"gasto_alto",nivel:"warning",msg:`Gastos ${((gastMes/gastoProm3M-1)*100).toFixed(0)}% sobre tu promedio`,modulo:"transactions"});

    // déficit
    if(ingrMes>0&&gastMes>ingrMes) list.push({id:"deficit",nivel:"warning",msg:`Déficit este mes: ${fmtN(gastMes-ingrMes)}`,modulo:"transactions"});

    // sin ingresos
    if(ingrMes===0&&now.getDate()>7) list.push({id:"sin_ingr",nivel:"warning",msg:"Sin ingresos registrados este mes",modulo:"transactions"});

    // documentos vencidos/próximos a vencer
    const docsData = (typeof window!=="undefined") ? (() => { try { const k=`fp_data_${user?.id}_documents`; return JSON.parse(localStorage.getItem(k)||"[]"); } catch{return [];} })() : [];
    const todayStr = new Date().toISOString().split("T")[0];
    docsData.filter(d=>d.vencimiento&&d.vencimiento<todayStr).forEach(d=>
      list.push({id:`doc_venc_${d.id}`,nivel:"error",msg:`Documento vencido: ${d.nombre}`,modulo:"documents"}));
    docsData.filter(d=>d.vencimiento&&d.vencimiento>=todayStr).forEach(d=>{
      const dias=Math.round((new Date(d.vencimiento+"T12:00:00")-new Date())/86400000);
      if(dias<=30) list.push({id:`doc_prox_${d.id}`,nivel:"warning",msg:`Documento vence en ${dias}d: ${d.nombre}`,modulo:"documents"});
    });

    // días sin registrar movimientos
    const txsSorted=[...transactions].sort((a,b)=>new Date(b.date)-new Date(a.date));
    const lastTx = txsSorted[0];
    if(lastTx){
      const diasSin=Math.round((now-new Date(lastTx.date+"T12:00:00"))/86400000);
      if(diasSin>=5) list.push({id:"sin_tx",nivel:"warning",msg:`${diasSin} días sin registrar movimientos`,modulo:"transactions",esSinTx:true,diasSin});
    } else {
      list.push({id:"sin_tx_ever",nivel:"info",msg:"Aún no has registrado ningún movimiento",modulo:"transactions",esSinTx:true,diasSin:999});
    }

    return list;
  }, [user, transactions, accounts, loans, presupuestos, goals, mortgages, transfers]);

  const alertas = calcAlertas();
  const errCount = alertas.filter(a=>a.nivel==="error").length;
  const warnCount = alertas.filter(a=>a.nivel==="warning").length;
  const totalBadge = errCount + warnCount;

  // Guardar en historial cuando aparecen alertas nuevas
  React.useEffect(() => {
    if(!user||alertas.length===0) return;
    const now = new Date().toISOString();
    const existing = store.get(storKey, []);
    const existingIds = new Set(existing.map(h=>h.id));
    const nuevas = alertas.filter(a=>!existingIds.has(a.id)).map(a=>({...a, fecha:now, leida:false}));
    if(nuevas.length===0) return;
    const updated = [...nuevas, ...existing].slice(0,50); // max 50
    store.set(storKey, updated);
    setHist(updated);
  }, [alertas.map(a=>a.id).join(",")]);

  // Notificación del navegador al abrir (una vez por día)
  React.useEffect(() => {
    if(!user) return;
    const hoy = new Date().toISOString().split("T")[0];
    const last = store.get(lastKey, "");
    if(last===hoy) return; // ya se notificó hoy
    store.set(lastKey, hoy);

    const doNotif = () => {
      const ingrMes=transactions.filter(t=>t.date?.startsWith(`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`)&&t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
      const gastMes=transactions.filter(t=>t.date?.startsWith(`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`)&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
      const fmtN=v=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:0}).format(v);
      const errores=alertas.filter(a=>a.nivel==="error").length;
      let body = `Ingresos: ${fmtN(ingrMes)} · Gastos: ${fmtN(gastMes)}`;
      if(errores>0) body += `
⚠️ ${errores} alerta${errores>1?"s":""} crítica${errores>1?"s":""}`;
      new Notification(`Buenos días, ${user.name.split(" ")[0]} 👋`, { body, icon:"/favicon.ico", tag:"finanzaspro-daily" });
    };

    if(!("Notification" in window)) return;
    if(Notification.permission==="granted") { doNotif(); }
    else if(Notification.permission!=="denied") {
      Notification.requestPermission().then(p=>{ if(p==="granted") doNotif(); });
    }
  }, [user?.id]);

  const marcarLeidas = () => {
    const updated = hist.map(h=>({...h,leida:true}));
    store.set(storKey, updated);
    setHist(updated);
  };

  const limpiarHist = () => { store.set(storKey,[]); setHist([]); };

  const noLeidas = hist.filter(h=>!h.leida).length;

  return { alertas, totalBadge, errCount, warnCount, hist, open, setOpen, marcarLeidas, limpiarHist, noLeidas };
};

// Panel de notificaciones (dropdown desde sidebar)
const NotifPanel = ({ notif, onNavigate }) => {
  const NIVEL_COLOR = {error:"#ff4757",warning:"#f39c12",info:"#3b82f6"};
  const NIVEL_ICON  = {error:"warn",warning:"warn",info:"check"};
  return (
    <div style={{position:"absolute",top:"100%",left:8,right:8,zIndex:500,background:"#161b27",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,boxShadow:"0 20px 60px rgba(0,0,0,.6)",overflow:"hidden",marginTop:4}}>
      {/* header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Ic n="warn" size={15} color="#f39c12"/>
          <span style={{fontSize:13,fontWeight:700,color:"#e0e0e0"}}>Notificaciones</span>
          {notif.noLeidas>0&&<span style={{fontSize:10,fontWeight:700,color:"#ff4757",background:"rgba(255,71,87,.15)",borderRadius:20,padding:"1px 7px"}}>{notif.noLeidas} nuevas</span>}
        </div>
        <div style={{display:"flex",gap:8}}>
          {notif.noLeidas>0&&<button onClick={notif.marcarLeidas} style={{fontSize:10,color:"#00d4aa",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Marcar leídas</button>}
          {notif.hist.length>0&&<button onClick={notif.limpiarHist} style={{fontSize:10,color:"#555",background:"none",border:"none",cursor:"pointer"}}>Limpiar</button>}
        </div>
      </div>
      {/* alertas activas */}
      {notif.alertas.length>0&&(
        <div style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
          <p style={{fontSize:10,fontWeight:700,color:"#444",textTransform:"uppercase",letterSpacing:.5,padding:"8px 16px 4px"}}>Activas ahora</p>
          {notif.alertas.slice(0,5).map((a,i)=>(
            <div key={i} onClick={()=>{onNavigate(a.modulo);notif.setOpen(false);}}
              style={{display:"flex",alignItems:"center",gap:10,padding:"9px 16px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,.03)"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{width:6,height:6,borderRadius:"50%",background:NIVEL_COLOR[a.nivel],flexShrink:0}}/>
              <span style={{fontSize:12,color:a.nivel==="error"?"#ff6b7a":a.nivel==="warning"?"#f5a623":"#aaa",flex:1}}>{a.msg}</span>
              <Ic n="chevron" size={11} color="#444"/>
            </div>
          ))}
          {notif.alertas.length>5&&<p style={{fontSize:10,color:"#555",textAlign:"center",padding:"6px 0"}}>+{notif.alertas.length-5} más en Dashboard</p>}
        </div>
      )}
      {/* historial */}
      <div style={{maxHeight:220,overflowY:"auto"}}>
        {notif.hist.length===0
          ? <p style={{fontSize:12,color:"#444",textAlign:"center",padding:"20px 0"}}>Sin historial de alertas</p>
          : (<>
              <p style={{fontSize:10,fontWeight:700,color:"#444",textTransform:"uppercase",letterSpacing:.5,padding:"8px 16px 4px"}}>Historial</p>
              {notif.hist.slice(0,15).map((h,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 16px",opacity:h.leida?.6:1,borderBottom:"1px solid rgba(255,255,255,.02)"}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:NIVEL_COLOR[h.nivel]||"#555",flexShrink:0,marginTop:5}}/>
                  <div style={{flex:1}}>
                    <p style={{fontSize:11,color:"#888",margin:"0 0 1px"}}>{h.msg}</p>
                    <p style={{fontSize:9,color:"#444",margin:0}}>{h.fecha?new Date(h.fecha).toLocaleDateString("es-MX",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):""}</p>
                  </div>
                  {!h.leida&&<div style={{width:5,height:5,borderRadius:"50%",background:"#00d4aa",flexShrink:0,marginTop:5}}/>}
                </div>
              ))}
            </>)
        }
      </div>
    </div>
  );
};



const GlobalSearch = ({ onNavigate }) => {
  const { user, navigate } = useCtx();
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const [transactions] = useData(user.id, "transactions");
  const [accounts]     = useData(user.id, "accounts");
  const [loans]        = useData(user.id, "loans");
  const [investments]  = useData(user.id, "investments");
  const [mortgages]    = useData(user.id, "mortgages");
  const [goals]        = useData(user.id, "goals");
  const [presupuestos] = useData(user.id, "presupuestos");

  // ── abrir con Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey||e.metaKey) && e.key==="k") { e.preventDefault(); setOpen(o=>!o); }
      if (e.key==="Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => { if (open) { setQuery(""); setTimeout(()=>inputRef.current?.focus(),60); } }, [open]);

  const q = query.toLowerCase().trim();

  const exportarTagExcel = (tagName, txs) => {
    if (!window.XLSX) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.onload = () => exportarTagExcel(tagName, txs);
      document.head.appendChild(script);
      return;
    }
    const XLSX = window.XLSX;
    const wb = XLSX.utils.book_new();
    const headers = ["Fecha","Descripción","Categoría","Tipo","Monto","Cuenta","Tags","Notas"];
    const rows = [...txs].sort((a,b)=>a.date>b.date?1:-1).map(t=>({
      Fecha: t.date,
      Descripción: t.description||"",
      Categoría: t.category||"",
      Tipo: t.type==="income"?"Ingreso":"Gasto",
      Monto: t.type==="income"?parseFloat(t.amount||0):-parseFloat(t.amount||0),
      Cuenta: accounts.find(a=>a.id===t.accountId)?.name||"",
      Tags: (t.tags||[]).join(", "),
      Notas: t.notes||"",
    }));
    const ws = XLSX.utils.json_to_sheet(rows, {header:headers});
    ws["!cols"] = [{wch:12},{wch:35},{wch:18},{wch:10},{wch:14},{wch:20},{wch:20},{wch:30}];
    const totalGastos = txs.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const totalIngresos = txs.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const ws2 = XLSX.utils.json_to_sheet([
      {Concepto:"Tag", Valor:`#${tagName}`},
      {Concepto:"Total transacciones", Valor:txs.length},
      {Concepto:"Total gastos", Valor:-totalGastos},
      {Concepto:"Total ingresos", Valor:totalIngresos},
      {Concepto:"Neto", Valor:totalIngresos-totalGastos},
      {Concepto:"Fecha primer registro", Valor:txs.map(t=>t.date).sort()[0]||""},
      {Concepto:"Fecha último registro", Valor:txs.map(t=>t.date).sort().slice(-1)[0]||""},
      {Concepto:"Generado", Valor:new Date().toLocaleDateString("es-MX")},
    ]);
    ws2["!cols"] = [{wch:25},{wch:20}];
    XLSX.utils.book_append_sheet(wb, ws, "Transacciones");
    XLSX.utils.book_append_sheet(wb, ws2, "Resumen");
    XLSX.writeFile(wb, `reporte_${tagName}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const exportarCatExcel = (catName, txs) => {
    if (!window.XLSX) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.onload = () => exportarCatExcel(catName, txs);
      document.head.appendChild(script);
      return;
    }
    const XLSX = window.XLSX;
    const wb = XLSX.utils.book_new();
    const headers = ["Fecha","Descripción","Categoría","Tipo","Monto","Cuenta","Tags","Notas"];
    const rows = [...txs].sort((a,b)=>a.date>b.date?1:-1).map(t=>({
      Fecha: t.date,
      Descripción: t.description||"",
      Categoría: t.category||"",
      Tipo: t.type==="income"?"Ingreso":"Gasto",
      Monto: t.type==="income"?parseFloat(t.amount||0):-parseFloat(t.amount||0),
      Cuenta: accounts.find(a=>a.id===t.accountId)?.name||"",
      Tags: (t.tags||[]).join(", "),
      Notas: t.notes||"",
    }));
    const ws = XLSX.utils.json_to_sheet(rows, {header:headers});
    ws["!cols"] = [{wch:12},{wch:35},{wch:18},{wch:10},{wch:14},{wch:20},{wch:20},{wch:30}];
    const totalGastos = txs.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const totalIngresos = txs.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const ws2 = XLSX.utils.json_to_sheet([
      {Concepto:"Categoría", Valor:catName},
      {Concepto:"Total transacciones", Valor:txs.length},
      {Concepto:"Total gastos", Valor:-totalGastos},
      {Concepto:"Total ingresos", Valor:totalIngresos},
      {Concepto:"Neto", Valor:totalIngresos-totalGastos},
      {Concepto:"Fecha primer registro", Valor:txs.map(t=>t.date).sort()[0]||""},
      {Concepto:"Fecha último registro", Valor:txs.map(t=>t.date).sort().slice(-1)[0]||""},
      {Concepto:"Generado", Valor:new Date().toLocaleDateString("es-MX")},
    ]);
    ws2["!cols"] = [{wch:25},{wch:20}];
    XLSX.utils.book_append_sheet(wb, ws, "Transacciones");
    XLSX.utils.book_append_sheet(wb, ws2, "Resumen");
    XLSX.writeFile(wb, `reporte_cat_${catName.replace(/\s+/g,"_")}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const results = q.length < 1 ? [] : (() => {
    const groups = [];

    // Transacciones (incluye búsqueda por tags con o sin #)
    const qTag = q.startsWith("#") ? q.slice(1) : q;
    const txs = transactions.filter(t =>
      t.description?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      String(t.amount).includes(q) ||
      (t.tags||[]).some(tag=>tag.toLowerCase().includes(qTag))
    ).slice(0,5);
    if (txs.length) groups.push({
      modulo:"transactions", label:"Transacciones", icon:"transactions", color:"#00d4aa",
      items: txs.map(t=>({
        id:t.id, titulo:t.description,
        subtitulo:`${t.type==="income"?"+ ":"- "}${fmt(t.amount)} · ${t.date} · ${t.category||"Sin categoría"}${(t.tags||[]).length>0?" · #"+(t.tags||[]).join(" #"):""}`,
        color: t.type==="income"?"#00d4aa":"#ff4757",
      }))
    });
    // Búsqueda por tag — grupo especial si query empieza con #
    if (q.startsWith("#") && qTag.length>0) {
      const txsByTag = transactions.filter(t=>(t.tags||[]).some(tag=>tag.toLowerCase().includes(qTag)));
      if (txsByTag.length>0) {
        const totalGastos = txsByTag.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
        const totalIngresos = txsByTag.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
        const neto = totalIngresos - totalGastos;
        groups.unshift({
          modulo:"transactions", label:`Etiqueta #${qTag}`, icon:"transactions", color:"#a78bfa",
          esTag:true, tagName:qTag, txsByTag, totalGastos, totalIngresos, neto,
          items:[{
            id:"tag_"+qTag,
            titulo:`${txsByTag.length} transacción${txsByTag.length!==1?"es":""} con #${qTag}`,
            subtitulo:`Gastos: ${fmt(totalGastos)} · Ingresos: ${fmt(totalIngresos)} · Neto: ${neto>=0?"+":""}${fmt(Math.abs(neto))}`,
            color:"#a78bfa",
          }]
        });
      }
    }
    // Búsqueda por categoría — panel especial (sin #)
    if (!q.startsWith("#") && q.length>=2) {
      const txsByCat = transactions.filter(t=>t.category?.toLowerCase().includes(q));
      if (txsByCat.length>0) {
        const totalGastosCat = txsByCat.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
        const totalIngresosCat = txsByCat.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
        const netoCat = totalIngresosCat - totalGastosCat;
        const catCounts = {};
        txsByCat.forEach(t=>{ if(t.category) catCounts[t.category]=(catCounts[t.category]||0)+1; });
        const catLabel = Object.entries(catCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || q;
        groups.unshift({
          modulo:"transactions", label:`Categoría: ${catLabel}`, icon:"transactions", color:"#3b82f6",
          esCat:true, catName:catLabel, txsByCat, totalGastosCat, totalIngresosCat, netoCat,
          items:[{
            id:"cat_"+q,
            titulo:`${txsByCat.length} transacción${txsByCat.length!==1?"es":""} en "${catLabel}"`,
            subtitulo:`Gastos: ${fmt(totalGastosCat)} · Ingresos: ${fmt(totalIngresosCat)} · Neto: ${netoCat>=0?"+":""}${fmt(Math.abs(netoCat))}`,
            color:"#3b82f6",
          }]
        });
      }
    }

    // Cuentas
    const accs = accounts.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.bank?.toLowerCase().includes(q)
    ).slice(0,4);
    if (accs.length) groups.push({
      modulo:"accounts", label:"Cuentas", icon:"accounts", color:"#3b82f6",
      items: accs.map(a=>({
        id:a.id, titulo:a.name,
        subtitulo:`${a.bank||a.type} · ${fmt(a.balance,a.currency)}`,
        color:"#3b82f6",
      }))
    });

    // Préstamos
    const ls = loans.filter(l =>
      l.name?.toLowerCase().includes(q) ||
      l.notes?.toLowerCase().includes(q)
    ).slice(0,4);
    if (ls.length) groups.push({
      modulo:"loans", label:"Préstamos", icon:"loans", color:"#f39c12",
      items: ls.map(l=>({
        id:l.id, titulo:l.name,
        subtitulo:`${l.type==="given"?"Otorgado":"Recibido"} · ${fmt(l.principal,l.currency)} · ${l.rate}% ${l.rateType==="annual"?"anual":"mensual"}`,
        color:"#f39c12",
      }))
    });

    // Inversiones
    const invs = investments.filter(i =>
      i.name?.toLowerCase().includes(q) ||
      i.type?.toLowerCase().includes(q) ||
      i.notes?.toLowerCase().includes(q)
    ).slice(0,4);
    if (invs.length) groups.push({
      modulo:"investments", label:"Inversiones", icon:"investments", color:"#7c3aed",
      items: invs.map(i=>({
        id:i.id, titulo:i.name,
        subtitulo:`${i.type||"Inversión"} · ${i.estado==="liquidada"?"Liquidada":"Activa"}`,
        color:"#7c3aed",
      }))
    });

    // Hipotecas
    const morts = mortgages.filter(m =>
      m.nombre?.toLowerCase().includes(q) ||
      m.banco?.toLowerCase().includes(q)
    ).slice(0,3);
    if (morts.length) groups.push({
      modulo:"mortgage", label:"Hipotecas", icon:"mortgage", color:"#ef4444",
      items: morts.map(m=>({
        id:m.id, titulo:m.nombre||m.banco||"Hipoteca",
        subtitulo:`${fmt(m.monto)} · ${m.plazoAnios} años`,
        color:"#ef4444",
      }))
    });

    // Metas
    const gs = goals.filter(g =>
      g.name?.toLowerCase().includes(q) ||
      g.notes?.toLowerCase().includes(q)
    ).slice(0,3);
    if (gs.length) groups.push({
      modulo:"goals", label:"Metas de Ahorro", icon:"goals", color:"#10b981",
      items: gs.map(g=>({
        id:g.id, titulo:g.name,
        subtitulo:`Meta: ${fmt(g.target)} · Ahorrado: ${fmt(g.saved||0)}`,
        color:"#10b981",
      }))
    });

    // Presupuestos
    const pres = presupuestos.filter(p =>
      p.nombre?.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q)
    ).slice(0,3);
    if (pres.length) groups.push({
      modulo:"presupuestos", label:"Presupuestos", icon:"presupuesto", color:"#f97316",
      items: pres.map(p=>({
        id:p.id, titulo:p.nombre,
        subtitulo:`Límite: ${fmt(p.montoLimite)} · ${p.tipo}`,
        color:"#f97316",
      }))
    });

    // Módulos (navegación directa)
    const navItems = NAV.filter(n =>
      n.label.toLowerCase().includes(q)
    ).slice(0,3);
    if (navItems.length) groups.push({
      modulo:null, label:"Módulos", icon:"dashboard", color:"#555",
      items: navItems.map(n=>({
        id:n.id, titulo:n.label,
        subtitulo:"Ir al módulo",
        color:"#00d4aa", nav:n.id,
      }))
    });

    return groups;
  })();

  const totalResultados = results.reduce((s,g)=>s+g.items.length,0);

  const handleSelect = (item, modulo) => {
    onNavigate(item.nav||modulo);
    setOpen(false);
  };

  if (!open) return (
    <button onClick={()=>setOpen(true)} style={{
      display:"flex", alignItems:"center", gap:8, width:"100%",
      padding:"8px 12px", margin:"8px 8px 0",
      background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)",
      borderRadius:9, cursor:"pointer", color:"#555", transition:"all .15s",
    }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,212,170,.25)";e.currentTarget.style.color="#888";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.07)";e.currentTarget.style.color="#555";}}
    >
      <Ic n="search" size={14} color="currentColor"/>
      <span style={{fontSize:12,flex:1,textAlign:"left"}}>Buscar...</span>
      <span style={{fontSize:10,background:"rgba(255,255,255,.06)",padding:"2px 5px",borderRadius:4,letterSpacing:.3}}>⌘K</span>
    </button>
  );

  return (
    <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"80px"}}>
      {/* overlay */}
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)"}} onClick={()=>setOpen(false)}/>
      {/* modal */}
      <div style={{position:"relative",width:"min(600px,94vw)",background:"#141b2d",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,.6)"}}>
        {/* input */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
          <Ic n="search" size={18} color="#555"/>
          <input
            ref={inputRef}
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder="Buscar transacciones, cuentas, #tags, préstamos, inversiones..."
            style={{flex:1,background:"none",border:"none",outline:"none",color:"#f0f0f0",fontSize:15}}
          />
          {query && (
            <button onClick={()=>setQuery("")} style={{background:"none",border:"none",cursor:"pointer",color:"#555",display:"flex"}}>
              <Ic n="close" size={15}/>
            </button>
          )}
          <kbd style={{fontSize:10,color:"#444",background:"rgba(255,255,255,.05)",padding:"3px 6px",borderRadius:5}}>ESC</kbd>
        </div>

        {/* resultados */}
        <div style={{maxHeight:"60vh",overflowY:"auto"}}>
          {q.length===0 && (
            <div style={{padding:"32px 16px",textAlign:"center"}}>
              <Ic n="search" size={32} color="#333"/>
              <p style={{fontSize:13,color:"#444",margin:"10px 0 4px"}}>Escribe para buscar en todos tus datos</p>
              <p style={{fontSize:11,color:"#333"}}>Transacciones · Cuentas · Préstamos · Inversiones · Metas · Presupuestos</p>
            </div>
          )}
          {q.length>0 && totalResultados===0 && (
            <div style={{padding:"32px 16px",textAlign:"center"}}>
              <p style={{fontSize:13,color:"#444",margin:0}}>Sin resultados para <strong style={{color:"#666"}}>"{query}"</strong></p>
            </div>
          )}
          {results.map(grupo=>(
            <div key={grupo.label}>
              <div style={{display:"flex",alignItems:"center",gap:7,padding:"10px 16px 6px",borderTop:"1px solid rgba(255,255,255,.04)"}}>
                <Ic n={grupo.icon} size={13} color={grupo.color}/>
                <span style={{fontSize:11,fontWeight:700,color:grupo.color,textTransform:"uppercase",letterSpacing:.4}}>{grupo.label}</span>
                <span style={{fontSize:10,color:"#333",marginLeft:"auto"}}>{grupo.items.length} resultado{grupo.items.length!==1?"s":""}</span>
                {grupo.esTag&&(
                  <button onClick={e=>{e.stopPropagation();exportarTagExcel(grupo.tagName,grupo.txsByTag);}}
                    style={{marginLeft:8,padding:"3px 10px",borderRadius:6,border:"1px solid rgba(0,212,170,.3)",
                      background:"rgba(0,212,170,.08)",color:"#00d4aa",cursor:"pointer",fontSize:10,fontWeight:700,
                      display:"flex",alignItems:"center",gap:4}}>
                    <Ic n="download" size={11} color="#00d4aa"/> Exportar Excel
                  </button>
                )}
                {grupo.esCat&&(
                  <button onClick={e=>{e.stopPropagation();exportarCatExcel(grupo.catName,grupo.txsByCat);}}
                    style={{marginLeft:8,padding:"3px 10px",borderRadius:6,border:"1px solid rgba(59,130,246,.3)",
                      background:"rgba(59,130,246,.08)",color:"#3b82f6",cursor:"pointer",fontSize:10,fontWeight:700,
                      display:"flex",alignItems:"center",gap:4}}>
                    <Ic n="download" size={11} color="#3b82f6"/> Exportar Excel
                  </button>
                )}
              </div>
              {grupo.esTag&&(
                <div style={{margin:"0 12px 8px",padding:"10px 12px",background:"rgba(167,139,250,.06)",border:"1px solid rgba(167,139,250,.15)",borderRadius:10}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                    <div style={{textAlign:"center"}}>
                      <p style={{fontSize:9,color:"#555",margin:"0 0 2px",textTransform:"uppercase"}}>Gastos</p>
                      <p style={{fontSize:14,fontWeight:700,color:"#ff4757",margin:0}}>{fmt(grupo.totalGastos)}</p>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <p style={{fontSize:9,color:"#555",margin:"0 0 2px",textTransform:"uppercase"}}>Ingresos</p>
                      <p style={{fontSize:14,fontWeight:700,color:"#00d4aa",margin:0}}>{fmt(grupo.totalIngresos)}</p>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <p style={{fontSize:9,color:"#555",margin:"0 0 2px",textTransform:"uppercase"}}>Neto</p>
                      <p style={{fontSize:14,fontWeight:700,color:grupo.neto>=0?"#00d4aa":"#ff4757",margin:0}}>
                        {grupo.neto>=0?"+":""}{fmt(Math.abs(grupo.neto))}
                      </p>
                    </div>
                  </div>
                  <div style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
                    {[...grupo.txsByTag].sort((a,b)=>b.date>a.date?1:-1).map(t=>(
                      <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                        padding:"5px 8px",borderRadius:6,background:"rgba(255,255,255,.03)"}}>
                        <div style={{minWidth:0,flex:1}}>
                          <p style={{fontSize:11,fontWeight:600,color:"#ccc",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {t.description||t.category||"Sin descripción"}
                          </p>
                          <p style={{fontSize:10,color:"#444",margin:0}}>{t.date} · {t.category}</p>
                        </div>
                        <span style={{fontSize:12,fontWeight:700,color:t.type==="income"?"#00d4aa":"#ff4757",flexShrink:0,marginLeft:8}}>
                          {t.type==="income"?"+":"-"}{fmt(parseFloat(t.amount||0))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {grupo.esCat&&(
                <div style={{margin:"0 12px 8px",padding:"10px 12px",background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.15)",borderRadius:10}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                    <div style={{textAlign:"center"}}>
                      <p style={{fontSize:9,color:"#555",margin:"0 0 2px",textTransform:"uppercase"}}>Gastos</p>
                      <p style={{fontSize:14,fontWeight:700,color:"#ff4757",margin:0}}>{fmt(grupo.totalGastosCat)}</p>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <p style={{fontSize:9,color:"#555",margin:"0 0 2px",textTransform:"uppercase"}}>Ingresos</p>
                      <p style={{fontSize:14,fontWeight:700,color:"#00d4aa",margin:0}}>{fmt(grupo.totalIngresosCat)}</p>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <p style={{fontSize:9,color:"#555",margin:"0 0 2px",textTransform:"uppercase"}}>Neto</p>
                      <p style={{fontSize:14,fontWeight:700,color:grupo.netoCat>=0?"#00d4aa":"#ff4757",margin:0}}>
                        {grupo.netoCat>=0?"+":""}{fmt(Math.abs(grupo.netoCat))}
                      </p>
                    </div>
                  </div>
                  <div style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
                    {[...grupo.txsByCat].sort((a,b)=>b.date>a.date?1:-1).map(t=>(
                      <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                        padding:"5px 8px",borderRadius:6,background:"rgba(255,255,255,.03)"}}>
                        <div style={{minWidth:0,flex:1}}>
                          <p style={{fontSize:11,fontWeight:600,color:"#ccc",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {t.description||t.category||"Sin descripción"}
                          </p>
                          <p style={{fontSize:10,color:"#444",margin:0}}>{t.date} · {(t.tags||[]).map(tag=>"#"+tag).join(" ")}</p>
                        </div>
                        <span style={{fontSize:12,fontWeight:700,color:t.type==="income"?"#00d4aa":"#ff4757",flexShrink:0,marginLeft:8}}>
                          {t.type==="income"?"+":"-"}{fmt(parseFloat(t.amount||0))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!grupo.esTag&&!grupo.esCat&&grupo.items.map(item=>(
                <button key={item.id} onClick={()=>handleSelect(item,grupo.modulo)}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"9px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left",transition:"background .1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <div style={{width:6,height:6,borderRadius:"50%",background:item.color,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:600,color:"#e0e0e0",margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.titulo}</p>
                    <p style={{fontSize:11,color:"#555",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.subtitulo}</p>
                  </div>
                  <Ic n="close" size={11} color="#333" style={{transform:"rotate(45deg)",flexShrink:0}}/>
                </button>
              ))}
            </div>
          ))}
          {totalResultados>0&&(
            <div style={{padding:"8px 16px",borderTop:"1px solid rgba(255,255,255,.04)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#333"}}>{totalResultados} resultado{totalResultados!==1?"s":""} · click para ir al módulo</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
// Proyección de flujo de caja — próximos 6 meses
const ProyeccionFlujo = ({ recurrents, loans, mortgages, transactions, accounts, TC }) => {
  const [detalleMes, setDetalleMes] = useState(null); // índice del mes con detalle abierto

  const hoy = new Date();

  // ── calcular cuántas veces cae un recurrente en un mes dado
  const ocurrenciasEnMes = (r, anio, mes) => {
    const inicio = new Date(r.fechaInicio+"T12:00:00");
    const primerDiaMes = new Date(anio, mes, 1);
    const ultimoDiaMes = new Date(anio, mes+1, 0);
    if (inicio > ultimoDiaMes) return 0;
    if (r.frecuencia === "mensual") return 1;
    if (r.frecuencia === "anual") {
      return inicio.getMonth()===mes ? 1 : 0;
    }
    if (r.frecuencia === "quincenal") {
      let count=0, d=new Date(inicio);
      while(d <= ultimoDiaMes) { if(d>=primerDiaMes) count++; d=new Date(d); d.setDate(d.getDate()+15); }
      return count;
    }
    if (r.frecuencia === "semanal") {
      let count=0, d=new Date(inicio);
      while(d <= ultimoDiaMes) { if(d>=primerDiaMes) count++; d=new Date(d); d.setDate(d.getDate()+7); }
      return count;
    }
    return 0;
  };

  // ── calcular saldo de un préstamo (simple)
  const calcLoanBal = loan => {
    const dr=(parseFloat(loan.rate)||0)/100/(loan.rateType==="annual"?365:30);
    let bal=parseFloat(loan.principal||0), last=new Date(loan.startDate+"T12:00:00");
    for(const p of [...(loan.payments||[])].sort((a,b)=>new Date(a.date)-new Date(b.date))){
      const days=Math.max(0,Math.floor((new Date(p.date+"T12:00:00")-last)/86400000));
      bal=Math.max(0, bal-(p.amount-Math.min(p.amount,bal*dr*days)));
      last=new Date(p.date+"T12:00:00");
    }
    return bal;
  };

  // ── construir 6 meses hacia el futuro
  const meses = Array.from({length:6}, (_,i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth()+i+1, 1);
    return { anio: d.getFullYear(), mes: d.getMonth(), label: d.toLocaleDateString("es-MX",{month:"short",year:"2-digit"}) };
  });

  const proyeccion = meses.map(({ anio, mes, label }) => {
    const items = [];

    // Recurrentes activos
    (recurrents||[]).filter(r=>r.activo!==false).forEach(r => {
      const veces = ocurrenciasEnMes(r, anio, mes);
      if (veces === 0) return;
      const monto = parseFloat(r.monto||0) * veces * (r.currency==="USD"?TC:1);
      items.push({ nombre: r.nombre, monto, tipo: r.tipo, origen: "recurrente" });
    });

    // Préstamos recibidos — interés mensual estimado
    (loans||[]).filter(l=>l.type==="received").forEach(l => {
      const bal = calcLoanBal(l);
      if (bal <= 0.01) return;
      const dr = (parseFloat(l.rate)||0)/100/(l.rateType==="annual"?12:1);
      const interesMes = bal * dr;
      if (interesMes > 0)
        items.push({ nombre: `Interés — ${l.name}`, monto: interesMes*(l.currency==="USD"?TC:1), tipo:"expense", origen:"prestamo" });
    });

    // Préstamos dados — interés mensual a cobrar
    (loans||[]).filter(l=>l.type==="given").forEach(l => {
      const bal = calcLoanBal(l);
      if (bal <= 0.01) return;
      const dr = (parseFloat(l.rate)||0)/100/(l.rateType==="annual"?12:1);
      const interesMes = bal * dr;
      if (interesMes > 0)
        items.push({ nombre: `Interés cobrar — ${l.name}`, monto: interesMes*(l.currency==="USD"?TC:1), tipo:"income", origen:"prestamo" });
    });

    // Hipotecas — cuota mensual
    (mortgages||[]).forEach(m => {
      const P=parseFloat(m.monto)||0, n=(parseFloat(m.plazoAnios)||0)*12, r=(parseFloat(m.tasaAnual)||0)/100/12;
      if(!P||!n) return;
      const cuota = r>0 ? (P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1) : P/n;
      const pagados=(m.pagosRealizados||[]).length;
      if(pagados < n)
        items.push({ nombre: `Hipoteca — ${m.banco||"Hipoteca"}`, monto: cuota*(m.moneda==="USD"?TC:1), tipo:"expense", origen:"hipoteca" });
    });

    const ingresos = items.filter(i=>i.tipo==="income").reduce((s,i)=>s+i.monto,0);
    const gastos   = items.filter(i=>i.tipo==="expense").reduce((s,i)=>s+i.monto,0);
    const flujo    = ingresos - gastos;

    return { label, anio, mes, items, ingresos, gastos, flujo };
  });

  const maxVal = Math.max(...proyeccion.flatMap(m=>[m.ingresos, m.gastos]), 1);
  const fmt2 = v => { const a=Math.abs(v); if(a>=1000000) return `${(v/1000000).toFixed(1)}M`; if(a>=1000) return `$${(v/1000).toFixed(0)}k`; return `$${v.toFixed(0)}`; };
  const fmtFull = v => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:0}).format(v);
  const H = 80;

  return (
    <Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <div>
          <p style={{fontSize:13,fontWeight:700,color:"#ccc",margin:"0 0 2px"}}>Proyección de Flujo — Próximos 6 meses</p>
          <p style={{fontSize:10,color:"#555",margin:0}}>Basado en recurrentes, préstamos e hipotecas activos</p>
        </div>
        <div style={{display:"flex",gap:14}}>
          <span style={{fontSize:11,color:"#555",display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#00d4aa",display:"inline-block"}}/>Ingresos</span>
          <span style={{fontSize:11,color:"#555",display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#ff4757",display:"inline-block"}}/>Gastos</span>
        </div>
      </div>

      {/* barras */}
      <div style={{display:"flex",gap:6,alignItems:"flex-end",height:H+40,justifyContent:"space-around"}}>
        {proyeccion.map((m,i) => {
          const hI = Math.max(Math.round((m.ingresos/maxVal)*H), m.ingresos>0?3:0);
          const hG = Math.max(Math.round((m.gastos/maxVal)*H),  m.gastos>0?3:0);
          const isPos = m.flujo >= 0;
          const abierto = detalleMes === i;
          return (
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"}}
              onClick={()=>setDetalleMes(abierto?null:i)}>
              {/* flujo neto */}
              <span style={{fontSize:9,fontWeight:700,color:isPos?"#00d4aa":"#ff4757"}}>
                {isPos?"+":""}{fmt2(m.flujo)}
              </span>
              {/* par de barras */}
              <div style={{display:"flex",gap:2,alignItems:"flex-end",height:H}}>
                <div style={{width:14,height:hI,background:"#00d4aa",borderRadius:"3px 3px 0 0",opacity:abierto?1:0.75,transition:"all .2s"}}/>
                <div style={{width:14,height:hG,background:"#ff4757",borderRadius:"3px 3px 0 0",opacity:abierto?1:0.75,transition:"all .2s"}}/>
              </div>
              {/* mes label */}
              <span style={{fontSize:9,color:abierto?"#e0e0e0":"#555",fontWeight:abierto?700:400,textTransform:"capitalize"}}>{m.label}</span>
            </div>
          );
        })}
      </div>

      {/* detalle del mes seleccionado */}
      {detalleMes !== null && (() => {
        const m = proyeccion[detalleMes];
        return (
          <div style={{marginTop:14,padding:"12px 14px",background:"rgba(255,255,255,.03)",borderRadius:10,border:"1px solid rgba(255,255,255,.07)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <p style={{fontSize:12,fontWeight:700,color:"#e0e0e0",margin:0,textTransform:"capitalize"}}>{m.label}</p>
              <div style={{display:"flex",gap:16}}>
                <span style={{fontSize:11,color:"#00d4aa"}}>+{fmtFull(m.ingresos)}</span>
                <span style={{fontSize:11,color:"#ff4757"}}>-{fmtFull(m.gastos)}</span>
                <span style={{fontSize:11,fontWeight:700,color:m.flujo>=0?"#00d4aa":"#ff4757"}}>
                  Neto: {fmtFull(m.flujo)}
                </span>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {m.items.length === 0
                ? <p style={{fontSize:11,color:"#444",margin:0}}>Sin movimientos programados</p>
                : m.items.map((item,j) => (
                  <div key={j} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:item.tipo==="income"?"#00d4aa":"#ff4757",flexShrink:0}}/>
                      <span style={{fontSize:11,color:"#aaa"}}>{item.nombre}</span>
                      <span style={{fontSize:9,color:"#444",background:"rgba(255,255,255,.04)",padding:"1px 5px",borderRadius:4}}>
                        {item.origen}
                      </span>
                    </div>
                    <span style={{fontSize:11,fontWeight:600,color:item.tipo==="income"?"#00d4aa":"#ff4757"}}>
                      {item.tipo==="income"?"+":"-"}{fmtFull(item.monto)}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        );
      })()}
    </Card>
  );
};

// Comparativo de gastos por categoría — este mes vs mes anterior
const ComparativoCategorias = ({ transactions, mesKey, mesAnteriorKey }) => {
  const [modo, setModo] = useState("variacion"); // "variacion" | "top"
  const [expandido, setExpandido] = useState(false);

  const txMes  = transactions.filter(t=>t.date?.startsWith(mesKey)&&t.type==="expense");
  const txMesA = transactions.filter(t=>t.date?.startsWith(mesAnteriorKey)&&t.type==="expense");

  // agrupar por categoría
  const porCat = (txs) => txs.reduce((acc,t)=>{
    const cat = t.category||"Sin categoría";
    acc[cat] = (acc[cat]||0) + parseFloat(t.amount||0);
    return acc;
  }, {});

  const catMes  = porCat(txMes);
  const catMesA = porCat(txMesA);

  // unión de todas las categorías
  const todasCats = [...new Set([...Object.keys(catMes), ...Object.keys(catMesA)])];

  const filas = todasCats.map(cat => {
    const actual   = catMes[cat]  || 0;
    const anterior = catMesA[cat] || 0;
    const delta    = actual - anterior;
    const deltaPct = anterior > 0 ? (delta/anterior*100) : (actual > 0 ? 100 : 0);
    return { cat, actual, anterior, delta, deltaPct };
  }).filter(f => f.actual > 0 || f.anterior > 0);

  // modo variación: ordenar por cambio absoluto
  const filasVariacion = [...filas]
    .filter(f=>f.anterior>0||f.actual>0)
    .sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta));

  // modo top: ordenar por gasto actual
  const filasTop = [...filas].sort((a,b)=>b.actual-a.actual);

  const filasVis = (modo==="variacion" ? filasVariacion : filasTop)
    .slice(0, expandido ? 999 : 5);

  const maxActual = Math.max(...filas.map(f=>Math.max(f.actual,f.anterior)),1);

  const fmtFull = v => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:0}).format(v);
  const now = new Date();
  const mesNombre  = new Date(mesKey+"-01").toLocaleDateString("es-MX",{month:"long"});
  const mesANombre = new Date(mesAnteriorKey+"-01").toLocaleDateString("es-MX",{month:"long"});

  if (filas.length === 0) return null;

  return (
    <Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div>
          <p style={{fontSize:13,fontWeight:700,color:"#ccc",margin:"0 0 2px"}}>Gastos por Categoría</p>
          <p style={{fontSize:10,color:"#555",margin:0,textTransform:"capitalize"}}>{mesANombre} vs {mesNombre}</p>
        </div>
        <div style={{display:"flex",gap:4}}>
          {[["variacion","Variación"],["top","Top gasto"]].map(([v,l])=>(
            <button key={v} onClick={()=>setModo(v)} style={{
              fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:6,border:"none",cursor:"pointer",
              background:modo===v?"#7c3aed":"rgba(255,255,255,.05)",
              color:modo===v?"#fff":"#555",transition:"all .2s",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* leyenda */}
      <div style={{display:"flex",gap:16,marginBottom:10}}>
        <span style={{fontSize:10,color:"#555",display:"flex",alignItems:"center",gap:4}}>
          <span style={{width:8,height:8,borderRadius:2,background:"rgba(255,255,255,.15)",display:"inline-block"}}/>
          <span style={{textTransform:"capitalize"}}>{mesANombre}</span>
        </span>
        <span style={{fontSize:10,color:"#555",display:"flex",alignItems:"center",gap:4}}>
          <span style={{width:8,height:8,borderRadius:2,background:"#7c3aed",display:"inline-block"}}/>
          <span style={{textTransform:"capitalize"}}>{mesNombre}</span>
        </span>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filasVis.map(({cat,actual,anterior,delta,deltaPct})=>{
          const barA = Math.round((anterior/maxActual)*100);
          const barB = Math.round((actual/maxActual)*100);
          const sube = delta > 0;
          const igual = Math.abs(deltaPct) < 2;
          const badgeColor = igual?"#555":sube?"#ff4757":"#00d4aa";
          const badgeBg = igual?"rgba(255,255,255,.05)":sube?"rgba(255,71,87,.1)":"rgba(0,212,170,.1)";
          return (
            <div key={cat}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{fontSize:11,color:"#ccc",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"50%"}}>{cat}</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:10,color:"#555"}}>{fmtFull(actual)}</span>
                  {anterior>0 && (
                    <span style={{fontSize:9,fontWeight:700,color:badgeColor,background:badgeBg,padding:"1px 6px",borderRadius:10}}>
                      {igual?"≈":sube?"▲":"▼"}{igual?"":`${Math.abs(deltaPct).toFixed(0)}%`}
                    </span>
                  )}
                  {anterior===0 && actual>0 && (
                    <span style={{fontSize:9,fontWeight:700,color:"#f39c12",background:"rgba(243,156,18,.1)",padding:"1px 6px",borderRadius:10}}>nuevo</span>
                  )}
                </div>
              </div>
              {/* barras superpuestas */}
              <div style={{position:"relative",height:6,borderRadius:3,background:"rgba(255,255,255,.04)"}}>
                {/* mes anterior */}
                <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${barA}%`,background:"rgba(255,255,255,.15)",borderRadius:3}}/>
                {/* mes actual */}
                <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${barB}%`,background:"#7c3aed",borderRadius:3,opacity:0.85}}/>
              </div>
              {anterior>0 && (
                <div style={{display:"flex",justifyContent:"flex-end",marginTop:2}}>
                  <span style={{fontSize:9,color:"#444"}}>
                    {igual?"Sin cambio":sube?`+${fmtFull(delta)} más que ${mesANombre}`:`${fmtFull(Math.abs(delta))} menos que ${mesANombre}`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filas.length > 5 && (
        <button onClick={()=>setExpandido(e=>!e)} style={{
          marginTop:12,width:"100%",padding:"6px 0",fontSize:11,color:"#555",
          background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",
          borderRadius:8,cursor:"pointer",
        }}>
          {expandido ? "Ver menos ▲" : `Ver ${filas.length-5} categorías más ▼`}
        </button>
      )}
    </Card>
  );
};

// Gráfica de línea — evolución del patrimonio neto en el tiempo

// Dashboard (con AlertasPanel + LineChartPatrimonio) → movido a ./modules/Dashboard.jsx

// Accounts → movido a ./modules/Accounts.jsx

// Transactions (con BarChart6M + DonaCategoria) → movido a ./modules/Transactions.jsx

// Transfers → movido a ./modules/Transfers.jsx


// Loans (con AmortizacionChart, CorteGlobalPanel, TramosPanel, CorteMensual) → movido a ./modules/Loans.jsx

// Investments (con PortafolioChart) → movido a ./modules/Investments.jsx

// Reports (con AnalisisTab) → ./modules/Reports.jsx

// Settings + CatInput → extraídos a src/modules/Settings.jsx

// SimuladorLiquidacion → movido a ./modules/Mortgage.jsx


// ─── ACTIVOS ──────────────────────────────────────────────────────────────────
const Assets = () => {
  const { user, toast } = useCtx();
  const [assets, setAssets] = useData(user.id, "assets", []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [askConfirm, confirmModal] = useConfirm();

  const TIPOS = [
    { value:"inmueble",   label:"🏠 Inmueble",         color:"#00d4aa" },
    { value:"vehiculo",   label:"🚗 Vehículo",          color:"#3b82f6" },
    { value:"negocio",    label:"🏢 Negocio/Empresa",   color:"#f39c12" },
    { value:"terreno",    label:"🌎 Terreno",            color:"#10b981" },
    { value:"maquinaria", label:"⚙️ Maquinaria/Equipo", color:"#8b5cf6" },
    { value:"otro",       label:"💎 Otro activo",        color:"#64748b" },
  ];

  const blank = {
    nombre:"", tipo:"inmueble", moneda:"MXN",
    valorCompra:"", valorActual:"", fechaCompra:"",
    descripcion:"", depreciacion:"0", // % anual de depreciación
  };
  const [form, setForm] = useState(blank);
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const save = () => {
    if (!form.nombre.trim()||!form.valorActual) { toast("Completa nombre y valor actual","error"); return; }
    if (editing) {
      setAssets(assets.map(a=>a.id===editing.id?{...a,...form,valorCompra:parseFloat(form.valorCompra)||0,valorActual:parseFloat(form.valorActual)||0,depreciacion:parseFloat(form.depreciacion)||0}:a));
      toast("Activo actualizado ✓","success");
    } else {
      setAssets([{id:genId(),...form,valorCompra:parseFloat(form.valorCompra)||0,valorActual:parseFloat(form.valorActual)||0,depreciacion:parseFloat(form.depreciacion)||0,creadoAt:new Date().toISOString()},...assets]);
      toast("Activo registrado ✓","success");
    }
    setOpen(false); setEditing(null); setForm(blank);
  };

  const del = async a => {
    const ok = await askConfirm(`¿Eliminar "${a.nombre}"?`);
    if (!ok) return;
    setAssets(assets.filter(x=>x.id!==a.id));
    toast("Activo eliminado","warning");
  };

  const openEdit = a => { setEditing(a); setForm({...a,valorCompra:String(a.valorCompra),valorActual:String(a.valorActual),depreciacion:String(a.depreciacion||0)}); setOpen(true); };

  // KPIs
  const totalActivos = assets.reduce((s,a)=>s+parseFloat(a.valorActual||0),0);
  const totalCompra  = assets.reduce((s,a)=>s+parseFloat(a.valorCompra||0),0);
  const plusvalia    = totalActivos - totalCompra;

  // Agrupar por tipo
  const porTipo = TIPOS.map(t=>({
    ...t,
    items: assets.filter(a=>a.tipo===t.value),
    total: assets.filter(a=>a.tipo===t.value).reduce((s,a)=>s+parseFloat(a.valorActual||0),0),
  })).filter(t=>t.items.length>0);

  return (
    <div style={{animation:"fadeUp .25s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:"0 0 3px"}}>Activos</h2>
          <p style={{fontSize:13,color:"#555",margin:0}}>Inmuebles, vehículos y otros bienes que forman tu patrimonio</p>
        </div>
        <Btn onClick={()=>{setEditing(null);setForm(blank);setOpen(true);}}><Ic n="plus" size={16}/>Nuevo activo</Btn>
      </div>

      {/* KPIs */}
      {assets.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:18}}>
          <Card style={{padding:"12px 14px",borderColor:"rgba(0,212,170,.2)"}}>
            <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 3px"}}>Valor total activos</p>
            <p style={{fontSize:18,fontWeight:800,color:"#00d4aa",margin:0}}>{fmt(totalActivos)}</p>
            <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>{assets.length} bien{assets.length!==1?"es":""} registrado{assets.length!==1?"s":""}</p>
          </Card>
          {totalCompra>0&&(
            <Card style={{padding:"12px 14px",borderColor:"rgba(59,130,246,.2)"}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 3px"}}>Costo de adquisición</p>
              <p style={{fontSize:18,fontWeight:800,color:"#3b82f6",margin:0}}>{fmt(totalCompra)}</p>
              <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>Precio de compra total</p>
            </Card>
          )}
          {totalCompra>0&&(
            <Card style={{padding:"12px 14px",borderColor:`rgba(${plusvalia>=0?"0,212,170":"255,71,87"},.2)`}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 3px"}}>Plusvalía / Depreciación</p>
              <p style={{fontSize:18,fontWeight:800,color:plusvalia>=0?"#00d4aa":"#ff4757",margin:0}}>{plusvalia>=0?"+":""}{fmt(plusvalia)}</p>
              <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>{plusvalia>=0?"Ganancia":"Pérdida"} vs costo</p>
            </Card>
          )}
        </div>
      )}

      {/* Lista por tipo */}
      {assets.length===0 ? (
        <div style={{textAlign:"center",padding:"50px 20px"}}>
          <div style={{fontSize:44,marginBottom:8}}>🏠</div>
          <p style={{fontSize:16,fontWeight:700,color:"#e0e0e0",margin:"0 0 8px"}}>Sin activos registrados</p>
          <p style={{fontSize:13,color:"#555",margin:"0 0 16px",lineHeight:1.5,maxWidth:380,marginLeft:"auto",marginRight:"auto"}}>
            Registra tus bienes para tener un patrimonio neto real y completo. Tu casa vale $3,243,000 — agrégala aquí para que el sistema la cuente como activo.
          </p>
          <Btn onClick={()=>{setEditing(null);setForm(blank);setOpen(true);}}><Ic n="plus" size={14}/>Registrar primer activo</Btn>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {porTipo.map(grupo=>(
            <div key={grupo.value}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:11,fontWeight:700,color:grupo.color,textTransform:"uppercase",letterSpacing:.5}}>{grupo.label}</span>
                <span style={{fontSize:11,color:"#555"}}>— {fmt(grupo.total)}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
                {grupo.items.map(a=>{
                  const ganancia = parseFloat(a.valorActual||0) - parseFloat(a.valorCompra||0);
                  const pct = parseFloat(a.valorCompra||0) > 0 ? (ganancia/parseFloat(a.valorCompra)*100) : null;
                  return (
                    <Card key={a.id} style={{borderColor:`${grupo.color}22`,cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=`${grupo.color}55`}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=`${grupo.color}22`}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:13,fontWeight:700,color:"#f0f0f0",margin:"0 0 3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.nombre}</p>
                          {a.fechaCompra&&<p style={{fontSize:10,color:"#555",margin:0}}>Adquirido: {fmtDate(a.fechaCompra)}</p>}
                        </div>
                        <Actions onEdit={()=>openEdit(a)} onDelete={()=>del(a)}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:parseFloat(a.valorCompra||0)>0?8:0}}>
                        <div>
                          <p style={{fontSize:10,color:"#555",margin:"0 0 1px"}}>Valor actual</p>
                          <p style={{fontSize:20,fontWeight:800,color:grupo.color,margin:0,lineHeight:1}}>{fmt(parseFloat(a.valorActual||0),a.moneda)}</p>
                        </div>
                        {pct!==null&&(
                          <div style={{textAlign:"right"}}>
                            <p style={{fontSize:10,color:"#555",margin:"0 0 1px"}}>vs compra</p>
                            <p style={{fontSize:13,fontWeight:700,color:ganancia>=0?"#00d4aa":"#ff4757",margin:0}}>{ganancia>=0?"+":""}{pct.toFixed(1)}%</p>
                          </div>
                        )}
                      </div>
                      {parseFloat(a.valorCompra||0)>0&&(
                        <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(Math.abs(ganancia)/parseFloat(a.valorCompra)*100+50,100)}%`,background:ganancia>=0?`linear-gradient(90deg,${grupo.color},${grupo.color}99)`:"linear-gradient(90deg,#ff4757,#ff475799)",borderRadius:2}}/>
                        </div>
                      )}
                      {a.descripcion&&<p style={{fontSize:11,color:"#444",margin:"8px 0 0",lineHeight:1.4}}>{a.descripcion}</p>}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open&&(
        <Modal title={editing?"Editar activo":"Registrar activo"} onClose={()=>{setOpen(false);setEditing(null);}} width={500}>
          <Inp label="Nombre del bien *" value={form.nombre} onChange={f("nombre")} placeholder="Ej. Casa Portal de Hierro, Tesla Model 3..."/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Sel label="Tipo" value={form.tipo} onChange={f("tipo")} options={TIPOS.map(t=>({value:t.value,label:t.label}))}/>
            <Sel label="Moneda" value={form.moneda} onChange={f("moneda")} options={[{value:"MXN",label:"MXN"},{value:"USD",label:"USD"}]}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Valor de compra" type="number" value={form.valorCompra} onChange={f("valorCompra")} prefix="$" placeholder="Precio pagado"/>
            <Inp label="Valor actual *" type="number" value={form.valorActual} onChange={f("valorActual")} prefix="$" placeholder="Valor hoy"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Fecha de adquisición" type="date" value={form.fechaCompra} onChange={f("fechaCompra")}/>
            <Inp label="Depreciación anual %" type="number" value={form.depreciacion} onChange={f("depreciacion")} suffix="%" placeholder="0 = sin depreciación"/>
          </div>
          <Inp label="Descripción / notas" value={form.descripcion} onChange={f("descripcion")} placeholder="Dirección, modelo, características..."/>
          {/* Preview valor y plusvalía */}
          {form.valorCompra&&form.valorActual&&(()=>{
            const comp=parseFloat(form.valorCompra)||0, act=parseFloat(form.valorActual)||0;
            const gan=act-comp, pct=comp>0?(gan/comp*100):0;
            return (
              <div style={{padding:"10px 14px",borderRadius:9,background:gan>=0?"rgba(0,212,170,.06)":"rgba(255,71,87,.06)",border:`1px solid ${gan>=0?"rgba(0,212,170,.2)":"rgba(255,71,87,.2)"}`,marginBottom:14}}>
                <span style={{fontSize:12,color:gan>=0?"#00d4aa":"#ff4757",fontWeight:700}}>
                  {gan>=0?"📈 Plusvalía":"📉 Depreciación"}: {gan>=0?"+":""}{fmt(gan)} ({pct>=0?"+":""}{pct.toFixed(1)}%)
                </span>
              </div>
            );
          })()}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn variant="secondary" onClick={()=>{setOpen(false);setEditing(null);}}>Cancelar</Btn>
            <Btn onClick={save}><Ic n="check" size={15}/>{editing?"Actualizar":"Registrar"}</Btn>
          </div>
        </Modal>
      )}
      {confirmModal}
    </div>
  );
};


// Mortgage → movido a ./modules/Mortgage.jsx

// Goals/Metas → movido a ./modules/Metas.jsx

// Recurring → movido a ./modules/Recurring.jsx


// ─── DOCUMENTOS ───────────────────────────────────────────────────────────────
const Documents = () => {
  const { user, toast } = useCtx();
  const [docs, setDocs]   = useData(user.id, "documents", []);
  const [accounts]        = useData(user.id, "accounts");
  const [loans]           = useData(user.id, "loans");
  const [mortgages]       = useData(user.id, "mortgages");
  const [investments]     = useData(user.id, "investments");

  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterMod, setFilterMod] = useState("all");
  const [sortBy, setSortBy]       = useState("fecha_desc");
  const [open, setOpen]           = useState(false);
  const [preview, setPreview]     = useState(null); // doc en preview
  const [editing, setEditing]     = useState(null);
  const fileRef = useRef();

  const CATS = ["Contrato","Estado de cuenta","Factura","Recibo","Identificación","Póliza","Otro"];
  const MODS = [
    {id:"none",label:"Sin vínculo"},
    {id:"accounts",label:"Cuenta"},
    {id:"loans",label:"Préstamo"},
    {id:"mortgages",label:"Hipoteca"},
    {id:"investments",label:"Inversión"},
  ];

  // opciones de vinculación por módulo
  const modOptions = (modId) => {
    if(modId==="accounts")    return accounts.map(a=>({id:a.id,label:a.name}));
    if(modId==="loans")       return loans.map(l=>({id:l.id,label:l.name}));
    if(modId==="mortgages")   return mortgages.map(m=>({id:m.id,label:m.nombre||m.banco||"Hipoteca"}));
    if(modId==="investments") return investments.map(i=>({id:i.id,label:i.nombre||i.name}));
    return [];
  };

  const blank = { nombre:"", categoria:"Otro", descripcion:"", etiquetas:"", modulo:"none", moduloItemId:"", vencimiento:"", fileData:null, fileType:"", fileSize:0, fileName:"" };
  const [form, setForm] = useState(blank);
  const [uploading, setUploading] = useState(false);

  const fmtSize = (b) => b>1048576?`${(b/1048576).toFixed(1)} MB`:b>1024?`${(b/1024).toFixed(0)} KB`:`${b} B`;
  // fmtDate usa la global definida al inicio del archivo

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    if(file.size > 8*1024*1024) { toast("Archivo mayor a 8 MB. Intenta comprimir o dividir el documento.","error"); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(f=>({...f, fileData:ev.target.result, fileType:file.type, fileSize:file.size, fileName:file.name, nombre:f.nombre||file.name.replace(/\.[^.]+$/,"")}));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if(!form.nombre.trim()) { toast("Ingresa un nombre para el documento","error"); return; }
    if(!form.fileData && !editing) { toast("Selecciona un archivo","error"); return; }
    const now = new Date().toISOString();
    if(editing) {
      setDocs(docs.map(d=>d.id===editing.id ? {...d,...form, updatedAt:now, fileData:form.fileData||d.fileData, fileType:form.fileType||d.fileType, fileSize:form.fileSize||d.fileSize, fileName:form.fileName||d.fileName} : d));
      toast("Documento actualizado ✓","success");
    } else {
      const nd = {...form, id:genId(), creadoAt:now, updatedAt:now};
      setDocs([nd,...docs]);
      toast("Documento guardado ✓","success");
    }
    setForm(blank); setOpen(false); setEditing(null);
    if(fileRef.current) fileRef.current.value="";
  };

  const remove = (id) => { if(confirm("¿Eliminar este documento?")) { setDocs(docs.filter(d=>d.id!==id)); toast("Documento eliminado","success"); } };

  const download = (doc) => {
    const a = document.createElement("a");
    a.href = doc.fileData;
    a.download = doc.fileName || doc.nombre;
    a.click();
  };

  const openEdit = (doc) => {
    setEditing(doc);
    setForm({...doc, fileData:null, fileType:"", fileSize:0, fileName:""});
    setOpen(true);
  };

  const close = () => { setForm(blank); setOpen(false); setEditing(null); if(fileRef.current) fileRef.current.value=""; };

  // ── filtrado y orden
  const today = new Date().toISOString().split("T")[0];
  const docsFiltered = docs
    .filter(d=>{
      if(search && !d.nombre.toLowerCase().includes(search.toLowerCase()) && !(d.etiquetas||"").toLowerCase().includes(search.toLowerCase()) && !(d.descripcion||"").toLowerCase().includes(search.toLowerCase())) return false;
      if(filterCat!=="all" && d.categoria!==filterCat) return false;
      if(filterMod!=="all" && d.modulo!==filterMod) return false;
      return true;
    })
    .sort((a,b)=>{
      if(sortBy==="fecha_desc")  return new Date(b.creadoAt)-new Date(a.creadoAt);
      if(sortBy==="fecha_asc")   return new Date(a.creadoAt)-new Date(b.creadoAt);
      if(sortBy==="nombre_asc")  return a.nombre.localeCompare(b.nombre);
      if(sortBy==="venc_prox")   return (a.vencimiento||"9999")-(b.vencimiento||"9999");
      return 0;
    });

  // docs que vencen en ≤30 días
  const proxVencer = docs.filter(d=>d.vencimiento && d.vencimiento>=today && Math.round((new Date(d.vencimiento+"T12:00:00")-new Date())/86400000)<=30);
  const vencidos   = docs.filter(d=>d.vencimiento && d.vencimiento<today);

  // color e icono por tipo de archivo
  const fileIcon = (type) => {
    if(!type) return {icon:"documents",color:"#64748b"};
    if(type.includes("pdf")) return {icon:"documents",color:"#ef4444"};
    if(type.includes("image")) return {icon:"chart",color:"#8b5cf6"};
    if(type.includes("sheet")||type.includes("csv")||type.includes("excel")) return {icon:"transactions",color:"#00a884"};
    if(type.includes("word")||type.includes("document")) return {icon:"documents",color:"#3b82f6"};
    return {icon:"documents",color:"#64748b"};
  };

  const CAT_COLORS = {Contrato:"#3b82f6",Estado:"#00d4aa","Estado de cuenta":"#00d4aa",Factura:"#f59e0b",Recibo:"#00a884",Identificación:"#8b5cf6",Póliza:"#f39c12",Otro:"#64748b"};

  // ── Modal de vista previa
  const PreviewModal = ({ doc, onClose }) => {
    if(!doc) return null;
    const isImg  = doc.fileType?.includes("image");
    const isPdf  = doc.fileType?.includes("pdf");
    const diasVenc = doc.vencimiento ? Math.round((new Date(doc.vencimiento+"T12:00:00")-new Date())/86400000) : null;
    return (
      <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&onClose()}>
        <div style={{background:"#161b27",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,width:"100%",maxWidth:760,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Ic n={fileIcon(doc.fileType).icon} size={18} color={fileIcon(doc.fileType).color}/>
              <div>
                <p style={{margin:0,fontSize:14,fontWeight:700,color:"#f0f0f0"}}>{doc.nombre}</p>
                <p style={{margin:0,fontSize:11,color:"#555"}}>{doc.fileName} · {fmtSize(doc.fileSize||0)}</p>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>download(doc)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,border:"1px solid rgba(0,212,170,.3)",background:"rgba(0,212,170,.08)",color:"#00d4aa",cursor:"pointer",fontSize:12,fontWeight:700}}>
                <Ic n="download" size={13}/>Descargar
              </button>
              <button onClick={onClose} style={{padding:"6px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#888",cursor:"pointer",fontSize:12}}>✕</button>
            </div>
          </div>
          {/* info badges */}
          <div style={{display:"flex",gap:8,padding:"10px 18px",flexWrap:"wrap",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
            <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:`${CAT_COLORS[doc.categoria]||"#64748b"}20`,color:CAT_COLORS[doc.categoria]||"#64748b"}}>{doc.categoria}</span>
            {doc.etiquetas&&doc.etiquetas.split(",").map(t=>t.trim()).filter(Boolean).map((t,i)=>(
              <span key={i} style={{fontSize:10,padding:"3px 10px",borderRadius:20,background:"rgba(255,255,255,.06)",color:"#888"}}>#{t}</span>
            ))}
            {doc.vencimiento&&(
              <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:diasVenc!==null&&diasVenc<0?"rgba(255,71,87,.15)":diasVenc!==null&&diasVenc<=30?"rgba(243,156,18,.15)":"rgba(0,212,170,.1)",color:diasVenc!==null&&diasVenc<0?"#ff4757":diasVenc!==null&&diasVenc<=30?"#f39c12":"#00d4aa"}}>
                {diasVenc!==null&&diasVenc<0?`Vencido hace ${Math.abs(diasVenc)}d`:diasVenc!==null&&diasVenc===0?"Vence hoy":`Vence ${fmtDate(doc.vencimiento)}`}
              </span>
            )}
            {doc.descripcion&&<span style={{fontSize:11,color:"#666",fontStyle:"italic"}}>{doc.descripcion}</span>}
          </div>
          {/* contenido */}
          <div style={{flex:1,overflow:"auto",display:"flex",alignItems:"center",justifyContent:"center",padding:16,minHeight:200}}>
            {isImg && <img src={doc.fileData} alt={doc.nombre} style={{maxWidth:"100%",maxHeight:"60vh",borderRadius:8,objectFit:"contain"}}/>}
            {isPdf && <iframe src={doc.fileData} style={{width:"100%",height:"60vh",border:"none",borderRadius:8}} title={doc.nombre}/>}
            {!isImg&&!isPdf&&(
              <div style={{textAlign:"center",padding:40}}>
                <Ic n={fileIcon(doc.fileType).icon} size={48} color={fileIcon(doc.fileType).color}/>
                <p style={{color:"#888",marginTop:12,fontSize:13}}>Vista previa no disponible para este tipo de archivo.</p>
                <p style={{color:"#555",fontSize:11,marginBottom:16}}>{doc.fileType||"Tipo desconocido"}</p>
                <button onClick={()=>download(doc)} style={{padding:"9px 20px",borderRadius:9,border:"1px solid rgba(0,212,170,.3)",background:"rgba(0,212,170,.08)",color:"#00d4aa",cursor:"pointer",fontSize:13,fontWeight:700}}>
                  Descargar archivo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{animation:"fadeUp .25s ease"}}>
      {preview&&<PreviewModal doc={preview} onClose={()=>setPreview(null)}/>}

      {/* header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:"0 0 3px"}}>Documentos</h2>
          <p style={{fontSize:13,color:"#555",margin:0}}>{docs.length} archivo{docs.length!==1?"s":""} guardado{docs.length!==1?"s":""}</p>
        </div>
        <button onClick={()=>setOpen(true)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#00d4aa,#00a884)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,boxShadow:"0 4px 14px rgba(0,212,170,.3)"}}>
          <Ic n="plus" size={16} color="#fff"/>Subir documento
        </button>
      </div>

      {/* alertas de vencimiento mejoradas */}
      {(vencidos.length>0||proxVencer.length>0)&&(
        <div style={{marginBottom:16,display:"flex",flexDirection:"column",gap:8}}>
          {/* Vencidos */}
          {vencidos.length>0&&(
            <div style={{borderRadius:11,border:"1px solid rgba(255,71,87,.25)",background:"rgba(255,71,87,.06)",overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px 7px",borderBottom:"1px solid rgba(255,71,87,.15)"}}>
                <Ic n="warn" size={14} color="#ff4757"/>
                <span style={{fontSize:12,fontWeight:700,color:"#ff6b7a"}}>
                  {vencidos.length} documento{vencidos.length>1?"s":""} vencido{vencidos.length>1?"s":""}
                </span>
              </div>
              <div style={{padding:"6px 8px",display:"flex",flexWrap:"wrap",gap:6}}>
                {vencidos.map(d=>{
                  const dias = Math.abs(Math.round((new Date(d.vencimiento+"T12:00:00")-new Date())/86400000));
                  return (
                    <button key={d.id} onClick={()=>setPreview(d)}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:8,background:"rgba(255,71,87,.1)",border:"1px solid rgba(255,71,87,.2)",cursor:"pointer",color:"#ff6b7a",fontSize:11,fontWeight:600}}>
                      <span>{d.nombre}</span>
                      <span style={{fontSize:10,opacity:.7}}>hace {dias}d</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Próximos a vencer */}
          {proxVencer.length>0&&(
            <div style={{borderRadius:11,border:"1px solid rgba(243,156,18,.25)",background:"rgba(243,156,18,.06)",overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px 7px",borderBottom:"1px solid rgba(243,156,18,.15)"}}>
                <Ic n="warn" size={14} color="#f39c12"/>
                <span style={{fontSize:12,fontWeight:700,color:"#f5a623"}}>
                  {proxVencer.length} próximo{proxVencer.length>1?"s":""} a vencer
                </span>
              </div>
              <div style={{padding:"6px 8px",display:"flex",flexWrap:"wrap",gap:6}}>
                {proxVencer.sort((a,b)=>a.vencimiento>b.vencimiento?1:-1).map(d=>{
                  const dias = Math.round((new Date(d.vencimiento+"T12:00:00")-new Date())/86400000);
                  const urgente = dias<=7;
                  return (
                    <button key={d.id} onClick={()=>setPreview(d)}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:8,
                        background:urgente?"rgba(255,71,87,.1)":"rgba(243,156,18,.1)",
                        border:`1px solid ${urgente?"rgba(255,71,87,.2)":"rgba(243,156,18,.2)"}`,
                        cursor:"pointer",color:urgente?"#ff6b7a":"#f5a623",fontSize:11,fontWeight:600}}>
                      <span>{d.nombre}</span>
                      <span style={{fontSize:10,opacity:.7}}>{dias===0?"hoy":`${dias}d`}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* barra de búsqueda y filtros */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <Ic n="search" size={14} color="#555" style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre, etiqueta o descripción..."
            style={{width:"100%",padding:"8px 12px 8px 32px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,color:"#e0e0e0",fontSize:12,outline:"none"}}/>
        </div>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}
          style={{padding:"8px 12px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,color:"#aaa",fontSize:12,outline:"none",cursor:"pointer"}}>
          <option value="all">Todas las categorías</option>
          {CATS.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterMod} onChange={e=>setFilterMod(e.target.value)}
          style={{padding:"8px 12px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,color:"#aaa",fontSize:12,outline:"none",cursor:"pointer"}}>
          <option value="all">Todos los vínculos</option>
          {MODS.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          style={{padding:"8px 12px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,color:"#aaa",fontSize:12,outline:"none",cursor:"pointer"}}>
          <option value="fecha_desc">Más reciente</option>
          <option value="fecha_asc">Más antiguo</option>
          <option value="nombre_asc">Nombre A-Z</option>
          <option value="venc_prox">Próx. a vencer</option>
        </select>
      </div>

      {/* grid de documentos */}
      {docsFiltered.length===0
        ? (
          <div style={{textAlign:"center",padding:"60px 20px",background:"rgba(255,255,255,.02)",border:"1px dashed rgba(255,255,255,.08)",borderRadius:14}}>
            <Ic n="documents" size={40} color="#333"/>
            <p style={{color:"#555",marginTop:12,fontSize:14}}>{docs.length===0?"Aún no has subido ningún documento":"Sin resultados para esa búsqueda"}</p>
            {docs.length===0&&<button onClick={()=>setOpen(true)} style={{marginTop:12,padding:"8px 20px",borderRadius:9,border:"1px solid rgba(0,212,170,.3)",background:"rgba(0,212,170,.08)",color:"#00d4aa",cursor:"pointer",fontSize:12,fontWeight:700}}>Subir primer documento</button>}
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
            {docsFiltered.map(doc=>{
              const {icon,color} = fileIcon(doc.fileType);
              const diasVenc = doc.vencimiento ? Math.round((new Date(doc.vencimiento+"T12:00:00")-new Date())/86400000) : null;
              const vencAlerta = diasVenc!==null&&diasVenc<0?"error":diasVenc!==null&&diasVenc<=30?"warning":null;
              const vinculoLabel = doc.modulo&&doc.modulo!=="none" ? (() => { const opts=modOptions(doc.modulo); const it=opts.find(o=>o.id===doc.moduloItemId); return it?it.label:null; })() : null;
              return (
                <div key={doc.id} style={{background:"rgba(255,255,255,.03)",border:`1px solid ${vencAlerta==="error"?"rgba(255,71,87,.25)":vencAlerta==="warning"?"rgba(243,156,18,.2)":"rgba(255,255,255,.07)"}`,borderRadius:12,overflow:"hidden",transition:"all .15s",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.05)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"}>
                  {/* thumb */}
                  <div onClick={()=>setPreview(doc)} style={{height:110,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,.02)",position:"relative",overflow:"hidden"}}>
                    {doc.fileType?.includes("image")
                      ? <img src={doc.fileData} alt={doc.nombre} style={{width:"100%",height:"100%",objectFit:"cover",opacity:.85}}/>
                      : <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                          <Ic n={icon} size={32} color={color}/>
                          <span style={{fontSize:10,color:"#555",fontWeight:600}}>{doc.fileName?.split(".").pop()?.toUpperCase()||"FILE"}</span>
                        </div>
                    }
                    {vencAlerta&&(
                      <div style={{position:"absolute",top:8,right:8,width:8,height:8,borderRadius:"50%",background:vencAlerta==="error"?"#ff4757":"#f39c12"}}/>
                    )}
                  </div>
                  {/* info */}
                  <div style={{padding:"10px 12px"}}>
                    <p style={{margin:"0 0 3px",fontSize:13,fontWeight:700,color:"#e0e0e0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{doc.nombre}</p>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:6}}>
                      <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:`${CAT_COLORS[doc.categoria]||"#64748b"}20`,color:CAT_COLORS[doc.categoria]||"#64748b"}}>{doc.categoria}</span>
                      {vinculoLabel&&<span style={{fontSize:10,color:"#555",background:"rgba(255,255,255,.04)",padding:"2px 8px",borderRadius:20}}>⊙ {vinculoLabel}</span>}
                    </div>
                    {doc.etiquetas&&(
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                        {doc.etiquetas.split(",").map(t=>t.trim()).filter(Boolean).slice(0,3).map((t,i)=>(
                          <span key={i} style={{fontSize:9,color:"#555",background:"rgba(255,255,255,.04)",padding:"1px 6px",borderRadius:10}}>#{t}</span>
                        ))}
                      </div>
                    )}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:10,color:"#444"}}>{fmtSize(doc.fileSize||0)} · {fmtDate(doc.creadoAt?.split("T")[0])}</span>
                      {doc.vencimiento&&(
                        <span style={{fontSize:10,fontWeight:600,color:vencAlerta==="error"?"#ff4757":vencAlerta==="warning"?"#f39c12":"#555"}}>
                          {diasVenc<0?`Vencido`:`Vence en ${diasVenc}d`}
                        </span>
                      )}
                    </div>
                    {/* acciones */}
                    <div style={{display:"flex",gap:6,marginTop:8,paddingTop:8,borderTop:"1px solid rgba(255,255,255,.05)"}}>
                      <button onClick={()=>setPreview(doc)} style={{flex:1,padding:"5px 0",borderRadius:7,border:"1px solid rgba(255,255,255,.08)",background:"transparent",color:"#aaa",cursor:"pointer",fontSize:11,fontWeight:600}}>Ver</button>
                      <button onClick={()=>download(doc)} style={{flex:1,padding:"5px 0",borderRadius:7,border:"1px solid rgba(0,212,170,.2)",background:"rgba(0,212,170,.06)",color:"#00d4aa",cursor:"pointer",fontSize:11,fontWeight:600}}>Bajar</button>
                      <button onClick={()=>openEdit(doc)} style={{flex:1,padding:"5px 0",borderRadius:7,border:"1px solid rgba(255,255,255,.08)",background:"transparent",color:"#888",cursor:"pointer",fontSize:11}}>Editar</button>
                      <button onClick={()=>remove(doc.id)} style={{padding:"5px 8px",borderRadius:7,border:"1px solid rgba(255,71,87,.2)",background:"rgba(255,71,87,.06)",color:"#ff4757",cursor:"pointer",fontSize:11}}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {/* Modal subir / editar */}
      {open&&(
        <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&close()}>
          <div style={{background:"#161b27",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,width:"100%",maxWidth:500,padding:24,display:"flex",flexDirection:"column",gap:14,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#f0f0f0"}}>{editing?"Editar documento":"Subir documento"}</h3>
              <button onClick={close} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:18,lineHeight:1}}>✕</button>
            </div>

            {/* zona de carga */}
            <div onClick={()=>fileRef.current?.click()} style={{border:"2px dashed rgba(0,212,170,.25)",borderRadius:12,padding:"20px 16px",textAlign:"center",cursor:"pointer",background:"rgba(0,212,170,.03)",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,212,170,.5)";e.currentTarget.style.background="rgba(0,212,170,.06)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(0,212,170,.25)";e.currentTarget.style.background="rgba(0,212,170,.03)";}}>
              <input ref={fileRef} type="file" style={{display:"none"}} onChange={handleFile} accept="*/*"/>
              {uploading
                ? <p style={{color:"#00d4aa",fontSize:13}}>Cargando...</p>
                : form.fileData||editing
                  ? <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                      <Ic n={fileIcon(form.fileType||editing?.fileType).icon} size={20} color={fileIcon(form.fileType||editing?.fileType).color}/>
                      <span style={{fontSize:12,color:"#00d4aa",fontWeight:600}}>{form.fileName||editing?.fileName}</span>
                      {(form.fileSize||editing?.fileSize)>0&&<span style={{fontSize:11,color:"#555"}}>({fmtSize(form.fileSize||editing?.fileSize||0)})</span>}
                    </div>
                  : <>
                      <Ic n="documents" size={28} color="#333"/>
                      <p style={{color:"#555",fontSize:12,marginTop:8,marginBottom:2}}>Haz clic para seleccionar un archivo</p>
                      <p style={{color:"#444",fontSize:10}}>PDF, imágenes, Excel, Word · Máx. 8 MB</p>
                    </>
              }
            </div>

            <Inp label="Nombre del documento" value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} placeholder="Ej. Contrato de arrendamiento 2026" required/>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={{fontSize:11,color:"#888",fontWeight:600,display:"block",marginBottom:4}}>Categoría</label>
                <select value={form.categoria} onChange={e=>setForm(f=>({...f,categoria:e.target.value}))}
                  style={{width:"100%",padding:"9px 11px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:9,color:"#e0e0e0",fontSize:12,outline:"none"}}>
                  {CATS.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Inp label="Fecha de vencimiento" type="date" value={form.vencimiento} onChange={e=>setForm(f=>({...f,vencimiento:e.target.value}))}/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={{fontSize:11,color:"#888",fontWeight:600,display:"block",marginBottom:4}}>Vincular a módulo</label>
                <select value={form.modulo} onChange={e=>setForm(f=>({...f,modulo:e.target.value,moduloItemId:""}))}
                  style={{width:"100%",padding:"9px 11px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:9,color:"#e0e0e0",fontSize:12,outline:"none"}}>
                  {MODS.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              {form.modulo&&form.modulo!=="none"&&(
                <div>
                  <label style={{fontSize:11,color:"#888",fontWeight:600,display:"block",marginBottom:4}}>Elemento</label>
                  <select value={form.moduloItemId} onChange={e=>setForm(f=>({...f,moduloItemId:e.target.value}))}
                    style={{width:"100%",padding:"9px 11px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:9,color:"#e0e0e0",fontSize:12,outline:"none"}}>
                    <option value="">Seleccionar...</option>
                    {modOptions(form.modulo).map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </div>
              )}
            </div>

            <Inp label="Etiquetas (separadas por coma)" value={form.etiquetas} onChange={e=>setForm(f=>({...f,etiquetas:e.target.value}))} placeholder="banco, 2026, impuestos"/>
            <Inp label="Descripción (opcional)" value={form.descripcion} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))} placeholder="Notas adicionales..."/>

            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button onClick={close} style={{flex:1,padding:"10px 0",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#888",cursor:"pointer",fontSize:13,fontWeight:600}}>Cancelar</button>
              <button onClick={save} style={{flex:2,padding:"10px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#00d4aa,#00a884)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>
                {editing?"Guardar cambios":"Subir documento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ─── CALENDARIO FINANCIERO ────────────────────────────────────────────────────
const CalendarioFinanciero = () => {
  const { user, navigate } = useCtx();
  const [transactions] = useData(user.id, "transactions");
  const [recurring]    = useData(user.id, "recurring");
  const [loans]        = useData(user.id, "loans");
  const [mortgages]    = useData(user.id, "mortgages");
  const [accounts]     = useData(user.id, "accounts");

  const now        = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [selDay, setSelDay] = useState(null); // "YYYY-MM-DD"
  const [view,  setView]  = useState("month"); // "month" | "week"

  const mesLabel = new Date(year, month, 1).toLocaleDateString("es-MX", { month:"long", year:"numeric" });
  const prevMonth = () => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); setSelDay(null); };
  const nextMonth = () => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); setSelDay(null); };
  const goToday   = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelDay(today()); };

  // ── construir índice de eventos por día ──────────────────────────────────────
  const mesStr = `${year}-${String(month+1).padStart(2,"0")}`;

  const eventosPorDia = React.useMemo(() => {
    const mapa = {};
    const add = (fecha, ev) => { if(!mapa[fecha]) mapa[fecha]=[];  mapa[fecha].push(ev); };

    // 1. Transacciones reales del mes
    transactions
      .filter(t => t.date?.startsWith(mesStr))
      .forEach(t => add(t.date, {
        tipo: t.type==="income" ? "ingreso" : "gasto",
        label: t.description || t.category || (t.type==="income"?"Ingreso":"Gasto"),
        monto: parseFloat(t.amount||0),
        color: t.type==="income" ? "#00d4aa" : "#ff4757",
        modulo: "transactions", id: t.id,
      }));

    // 2. Recurrentes (proyectados este mes)
    (recurring||[]).filter(r=>r.activo!==false).forEach(r => {
      const dia = parseInt(r.dia||r.day||1);
      if(dia<1||dia>31) return;
      const fecha = `${mesStr}-${String(dia).padStart(2,"0")}`;
      // Validar que el día exista en el mes
      const d = new Date(fecha+"T12:00:00");
      if(isNaN(d.getTime())||d.getMonth()!==month) return;
      add(fecha, {
        tipo: r.type==="income" ? "ingreso_rec" : "gasto_rec",
        label: r.name || r.descripcion || "Recurrente",
        monto: parseFloat(r.amount||r.monto||0),
        color: r.type==="income" ? "#10b981" : "#f39c12",
        proyectado: true,
        modulo: "recurring",
      });
    });

    // 3. Pagos de préstamos (fecha de vencimiento en este mes)
    loans.filter(l=>l.dueDate?.startsWith(mesStr)).forEach(l => {
      add(l.dueDate, {
        tipo: "vencimiento",
        label: `Vence: ${l.name}`,
        monto: 0,
        color: "#8b5cf6",
        modulo: "loans",
      });
    });

    // 4. Pago de tarjetas
    accounts.filter(a=>a.type==="credit"&&a.fechaPago?.startsWith(mesStr)).forEach(a => {
      add(a.fechaPago, {
        tipo: "pago_tarjeta",
        label: `Pago: ${a.name}`,
        monto: Math.abs(parseFloat(a.balance||0)),
        color: "#ec4899",
        modulo: "accounts",
      });
    });

    // 5. Pagos hipoteca (día de pago mensual)
    mortgages.forEach(m => {
      const dia = parseInt(m.diaPago||1);
      const fecha = `${mesStr}-${String(dia).padStart(2,"0")}`;
      const d = new Date(fecha+"T12:00:00");
      if(isNaN(d.getTime())||d.getMonth()!==month) return;
      add(fecha, {
        tipo: "hipoteca",
        label: `Hipoteca: ${m.nombre||m.banco||""}`,
        monto: 0,
        color: "#6366f1",
        modulo: "mortgage",
      });
    });

    return mapa;
  }, [mesStr, transactions, recurring, loans, accounts, mortgages]);

  // ── resumen del mes ──────────────────────────────────────────────────────────
  const txsMes     = transactions.filter(t=>t.date?.startsWith(mesStr));
  const ingrMes    = txsMes.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
  const gastMes    = txsMes.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
  const diasMayorGasto = Object.entries(eventosPorDia)
    .map(([f,evs])=>({ f, total:evs.filter(e=>e.tipo==="gasto").reduce((s,e)=>s+e.monto,0) }))
    .sort((a,b)=>b.total-a.total)[0];

  // ── construir grilla del mes ─────────────────────────────────────────────────
  const primerDia  = new Date(year, month, 1).getDay(); // 0=dom
  const diasEnMes  = new Date(year, month+1, 0).getDate();
  const inicioGrid = primerDia === 0 ? 6 : primerDia - 1; // lunes primero
  const celdas     = Array.from({ length: Math.ceil((inicioGrid+diasEnMes)/7)*7 }, (_,i) => {
    const d = i - inicioGrid + 1;
    if(d<1||d>diasEnMes) return null;
    const fecha = `${mesStr}-${String(d).padStart(2,"0")}`;
    return { d, fecha };
  });

  const todayStr = today();
  const DIAS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

  // ── detalle del día seleccionado ─────────────────────────────────────────────
  const evsDia = selDay ? (eventosPorDia[selDay]||[]) : [];
  const ingrDia  = evsDia.filter(e=>e.tipo==="ingreso").reduce((s,e)=>s+e.monto,0);
  const gastDia  = evsDia.filter(e=>e.tipo==="gasto").reduce((s,e)=>s+e.monto,0);

  return (
    <div style={{animation:"fadeUp .25s ease"}}>
      {/* ── header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:"0 0 3px"}}>Calendario Financiero</h2>
          <p style={{fontSize:13,color:"#555",margin:0}}>Gastos, ingresos y compromisos del mes en una vista</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <button onClick={goToday} style={{padding:"6px 14px",borderRadius:8,border:"1px solid rgba(0,212,170,.25)",background:"rgba(0,212,170,.07)",color:"#00d4aa",cursor:"pointer",fontSize:12,fontWeight:700}}>Hoy</button>
          <div style={{display:"flex",alignItems:"center",gap:2,background:"rgba(255,255,255,.04)",borderRadius:9,padding:2}}>
            <button onClick={prevMonth} style={{padding:"6px 11px",borderRadius:7,border:"none",background:"transparent",color:"#888",cursor:"pointer",fontSize:16,lineHeight:1}}>‹</button>
            <span style={{fontSize:13,fontWeight:700,color:"#e0e0e0",minWidth:140,textAlign:"center",textTransform:"capitalize"}}>{mesLabel}</span>
            <button onClick={nextMonth} style={{padding:"6px 11px",borderRadius:7,border:"none",background:"transparent",color:"#888",cursor:"pointer",fontSize:16,lineHeight:1}}>›</button>
          </div>
        </div>
      </div>

      {/* ── KPIs del mes */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16}}>
        {[
          ["Ingresos del mes", fmt(ingrMes,"MXN"), "#00d4aa"],
          ["Gastos del mes",   fmt(gastMes,"MXN"), "#ff4757"],
          ["Balance",          fmt(ingrMes-gastMes,"MXN"), ingrMes>=gastMes?"#00d4aa":"#ff4757"],
          ["Día mayor gasto",  diasMayorGasto ? fmtDate(diasMayorGasto.f) : "—", "#f39c12"],
        ].map(([l,v,c])=>(
          <Card key={l} style={{padding:"10px 14px"}}>
            <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 3px"}}>{l}</p>
            <p style={{fontSize:14,fontWeight:800,color:c,margin:0}}>{v}</p>
          </Card>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:selDay?"1fr 300px":"1fr",gap:14,alignItems:"start"}}>
        {/* ── grilla calendario */}
        <Card style={{padding:0,overflow:"hidden"}}>
          {/* cabecera días */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
            {DIAS.map(d=>(
              <div key={d} style={{padding:"10px 4px",textAlign:"center",fontSize:10,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.5}}>{d}</div>
            ))}
          </div>
          {/* semanas */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
            {celdas.map((celda,i)=>{
              if(!celda) return <div key={i} style={{minHeight:80,borderRight:"1px solid rgba(255,255,255,.03)",borderBottom:"1px solid rgba(255,255,255,.03)",background:"rgba(0,0,0,.2)"}}/>;
              const { d, fecha } = celda;
              const evs   = eventosPorDia[fecha] || [];
              const isHoy = fecha===todayStr;
              const isSel = fecha===selDay;
              const ingrD = evs.filter(e=>e.tipo==="ingreso").reduce((s,e)=>s+e.monto,0);
              const gastD = evs.filter(e=>e.tipo==="gasto").reduce((s,e)=>s+e.monto,0);
              const hasAlert = evs.some(e=>["vencimiento","pago_tarjeta","hipoteca"].includes(e.tipo));
              const isWeekend = (i%7)>=5;
              return (
                <div key={i} onClick={()=>setSelDay(isSel?null:fecha)}
                  style={{
                    minHeight:80, padding:"6px 6px 4px",
                    borderRight:"1px solid rgba(255,255,255,.03)",
                    borderBottom:"1px solid rgba(255,255,255,.03)",
                    background: isSel?"rgba(0,212,170,.08)": isHoy?"rgba(0,212,170,.04)": isWeekend?"rgba(255,255,255,.008)":"transparent",
                    cursor:"pointer", transition:"background .1s", position:"relative",
                    outline: isSel?"1px solid rgba(0,212,170,.3)": isHoy?"1px solid rgba(0,212,170,.15)":"none",
                  }}
                  onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background="rgba(255,255,255,.04)";}}
                  onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background=isHoy?"rgba(0,212,170,.04)":isWeekend?"rgba(255,255,255,.008)":"transparent";}}>

                  {/* número de día */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{
                      fontSize:12, fontWeight: isHoy?800:500,
                      color: isHoy?"#00d4aa": isWeekend?"#666":"#888",
                      width:22, height:22, borderRadius:"50%",
                      background: isHoy?"rgba(0,212,170,.15)":"transparent",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>{d}</span>
                    {hasAlert&&<span style={{width:6,height:6,borderRadius:"50%",background:"#f39c12",flexShrink:0}}/>}
                  </div>

                  {/* barra ingreso/gasto */}
                  {(ingrD>0||gastD>0)&&(
                    <div style={{marginBottom:3}}>
                      {ingrD>0&&<div style={{fontSize:9,color:"#00d4aa",fontWeight:700,lineHeight:1.4}}>+{ingrD>=1000?`$${(ingrD/1000).toFixed(1)}k`:fmt(ingrD,"MXN")}</div>}
                      {gastD>0&&<div style={{fontSize:9,color:"#ff4757",fontWeight:600,lineHeight:1.4}}>-{gastD>=1000?`$${(gastD/1000).toFixed(1)}k`:fmt(gastD,"MXN")}</div>}
                    </div>
                  )}

                  {/* dots de eventos (máx 4) */}
                  <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
                    {evs.slice(0,4).map((ev,ei)=>(
                      <span key={ei} style={{width:5,height:5,borderRadius:"50%",background:ev.color,opacity:ev.proyectado?.6:1,flexShrink:0}}/>
                    ))}
                    {evs.length>4&&<span style={{fontSize:8,color:"#555"}}>+{evs.length-4}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── panel detalle día */}
        {selDay&&(
          <div style={{display:"flex",flexDirection:"column",gap:10,position:"sticky",top:16}}>
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div>
                  <p style={{fontSize:13,fontWeight:800,color:"#f0f0f0",margin:"0 0 2px"}}>{fmtDate(selDay)}</p>
                  <p style={{fontSize:10,color:"#555",margin:0}}>
                    {new Date(selDay+"T12:00:00").toLocaleDateString("es-MX",{weekday:"long"})}
                  </p>
                </div>
                <button onClick={()=>setSelDay(null)} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:16}}>✕</button>
              </div>

              {/* resumen del día */}
              {(ingrDia>0||gastDia>0)&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  {ingrDia>0&&(
                    <div style={{background:"rgba(0,212,170,.07)",border:"1px solid rgba(0,212,170,.15)",borderRadius:8,padding:"8px 10px"}}>
                      <p style={{fontSize:9,color:"#555",margin:"0 0 2px",textTransform:"uppercase"}}>Ingresos</p>
                      <p style={{fontSize:14,fontWeight:800,color:"#00d4aa",margin:0}}>{fmt(ingrDia,"MXN")}</p>
                    </div>
                  )}
                  {gastDia>0&&(
                    <div style={{background:"rgba(255,71,87,.07)",border:"1px solid rgba(255,71,87,.15)",borderRadius:8,padding:"8px 10px"}}>
                      <p style={{fontSize:9,color:"#555",margin:"0 0 2px",textTransform:"uppercase"}}>Gastos</p>
                      <p style={{fontSize:14,fontWeight:800,color:"#ff4757",margin:0}}>{fmt(gastDia,"MXN")}</p>
                    </div>
                  )}
                </div>
              )}

              {/* lista de eventos */}
              {/* Botón nueva transacción con fecha precargada */}
              <button onClick={()=>navigate&&navigate("transactions:new:"+selDay)} style={{
                width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                padding:"8px",borderRadius:9,marginBottom:8,
                background:"rgba(0,212,170,.07)",border:"1px solid rgba(0,212,170,.2)",
                color:"#00d4aa",cursor:"pointer",fontSize:11,fontWeight:700,
              }}>
                + Nueva transacción el {selDay?new Date(selDay+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"short"}):""}
              </button>
              {evsDia.length===0
                ? <p style={{fontSize:12,color:"#444",textAlign:"center",padding:"16px 0"}}>Sin movimientos registrados</p>
                : <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {evsDia.map((ev,i)=>(
                      <div key={i} onClick={()=>navigate&&navigate(ev.modulo)}
                        style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"rgba(255,255,255,.03)",borderRadius:8,borderLeft:`3px solid ${ev.color}`,cursor:ev.modulo?"pointer":"default"}}
                        onMouseEnter={e=>{if(ev.modulo)e.currentTarget.style.background="rgba(255,255,255,.06)";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.03)";}}>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:12,fontWeight:600,color:"#e0e0e0",margin:"0 0 1px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ev.label}</p>
                          <p style={{fontSize:10,color:"#555",margin:0}}>
                            {ev.tipo==="ingreso"?"Ingreso real":ev.tipo==="gasto"?"Gasto real":ev.tipo==="ingreso_rec"?"Recurrente ↑":ev.tipo==="gasto_rec"?"Recurrente ↓":ev.tipo==="vencimiento"?"Vencimiento":ev.tipo==="pago_tarjeta"?"Pago tarjeta":"Hipoteca"}
                            {ev.proyectado&&" (proyectado)"}
                          </p>
                        </div>
                        {ev.monto>0&&<span style={{fontSize:12,fontWeight:700,color:ev.color,flexShrink:0}}>{fmt(ev.monto,"MXN")}</span>}
                      </div>
                    ))}
                  </div>
              }

              {/* botón agregar transacción */}
              <button onClick={()=>navigate&&navigate("transactions")} style={{width:"100%",marginTop:10,padding:"8px 0",borderRadius:9,border:"1px dashed rgba(0,212,170,.25)",background:"transparent",color:"#00d4aa",cursor:"pointer",fontSize:12,fontWeight:600}}>
                + Registrar movimiento
              </button>
            </Card>

            {/* leyenda */}
            <Card style={{padding:"12px 14px"}}>
              <p style={{fontSize:10,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Leyenda</p>
              {[
                ["#00d4aa","Ingreso real"],
                ["#ff4757","Gasto real"],
                ["#10b981","Ingreso recurrente"],
                ["#f39c12","Gasto recurrente"],
                ["#ec4899","Pago de tarjeta"],
                ["#8b5cf6","Vencimiento préstamo"],
                ["#6366f1","Pago hipoteca"],
              ].map(([c,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:c,flexShrink:0}}/>
                  <span style={{fontSize:11,color:"#666"}}>{l}</span>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PATRIMONIO HISTÓRICO + SCORE DE SALUD ───────────────────────────────────
const Patrimonio = () => {
  const { user, toast } = useCtx();
  const [snapshots, setSnapshots]   = useData(user.id, "patrimonio_snaps");
  const [accounts]                  = useData(user.id, "accounts");
  const [transactions]              = useData(user.id, "transactions");
  const [investments]               = useData(user.id, "investments");
  const [loans]                     = useData(user.id, "loans");
  const [mortgages]                 = useData(user.id, "mortgages");
  const [goals]                     = useData(user.id, "goals");
  const [assets]                    = useData(user.id, "assets", []);
  const [tab, setTab]               = useState("grafica");
  const [rango, setRango]           = useState("6m");
  const [hoverIdx, setHoverIdx]     = useState(null);

  // ── calcular estado actual del patrimonio
  const calcEstado = () => {
    const TC = getTc(user.id);
    const liquidezMXN = accounts.filter(a=>a.currency==="MXN"&&a.type!=="credit").reduce((s,a)=>s+parseFloat(a.balance||0),0);
    const liquidezUSD = accounts.filter(a=>a.currency==="USD").reduce((s,a)=>s+parseFloat(a.balance||0),0);
    const liquidezTotal = liquidezMXN + liquidezUSD*TC;

    const calcInvVal = inv => {
      const t=parseFloat(inv.titulos)||0, p=parseFloat(inv.precioActual)||0;
      const ap=(inv.aportaciones||[]).reduce((s,a)=>s+parseFloat(a.amount||0),0);
      const val = t>0&&p>0 ? t*p : parseFloat(inv.currentValue)||ap;
      return inv.currency==="USD" ? val*TC : val;
    };
    const inversionesMXN = investments.filter(i=>i.estado!=="liquidada").reduce((s,i)=>s+calcInvVal(i),0);

    const calcLoanBal = loan => {
      const dr=(parseFloat(loan.rate)||0)/100/(loan.rateType==="annual"?365:30);
      let bal=parseFloat(loan.principal||0);
      let last=new Date(loan.startDate+"T12:00:00");
      for (const p of [...(loan.payments||[])].sort((a,b)=>new Date(a.date)-new Date(b.date))) {
        const days=Math.max(0,Math.floor((new Date(p.date+"T12:00:00")-last)/86400000));
        bal=Math.max(0,bal-(p.amount-Math.min(p.amount,bal*dr*days)));
        last=new Date(p.date+"T12:00:00");
      }
      return bal;
    };
    const deudaPrestamos = loans.filter(l=>l.type==="received").reduce((s,l)=>s+calcLoanBal(l),0);
    const deudaHipoteca  = mortgages.reduce((s,m)=>{
      const P=parseFloat(m.monto)||0, n=(parseFloat(m.plazoAnios)||0)*12, r=(parseFloat(m.tasaAnual)||0)/100/12;
      if(!P||!n||!r) return s+P;
      const cuota=m.tipo==="fijo"?(P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1):P/n;
      let saldo=P;
      const pagados=(m.pagosRealizados||[]).length;
      for(let i=1;i<=pagados;i++){const int=saldo*r;saldo=Math.max(saldo-(m.tipo==="fijo"?cuota-int:P/n),0);}
      return s+saldo;
    },0);
    const deudaTotal = deudaPrestamos + deudaHipoteca;
    const cuentasCredito = accounts.filter(a=>a.type==="credit").reduce((s,a)=>s+Math.abs(Math.min(parseFloat(a.balance||0),0)),0);
    const deudaTotalConTarjetas = deudaTotal + cuentasCredito;

    const totalActivosFisicos = (assets||[]).reduce((s,a)=>{
      const val = parseFloat(a.valorActual||0);
      return s + (a.moneda==="USD" ? val*TC : val);
    },0);
    // Excluir inversiones liquidadas (su valor ya está en liquidez)
    const inversionesSinLiq = investments.filter(i=>i.estado!=="liquidada").reduce((s,i)=>s+calcInvVal(i),0);
    // Incluir préstamos por cobrar (lo que te deben)
    const calcLoanBalP = loan => {
      const dr=(parseFloat(loan.rate)||0)/100/(loan.rateType==="annual"?365:30);
      let bal=parseFloat(loan.principal||0); let last=new Date(loan.startDate+"T12:00:00");
      for (const p of [...(loan.payments||[])].sort((a,b)=>new Date(a.date)-new Date(b.date))) {
        const days=Math.max(0,Math.floor((new Date(p.date+"T12:00:00")-last)/86400000));
        bal=Math.max(0,bal-(p.amount-Math.min(p.amount,bal*dr*days))); last=new Date(p.date+"T12:00:00");
      }
      return bal;
    };
    const porCobrarP = loans.filter(l=>l.type==="given").reduce((s,l)=>s+calcLoanBalP(l),0);
    const patrimonioNeto = liquidezTotal + inversionesSinLiq + porCobrarP + totalActivosFisicos - deudaTotalConTarjetas;

    // ── flujo del mes
    const now = new Date();
    const mesActual = transactions.filter(t=>{
      const d=new Date(t.date+"T12:00:00");
      return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
    });
    const ingresosMes = mesActual.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const gastosMes   = mesActual.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);

    // ── gasto mensual promedio (últimos 3 meses)
    const hace3 = new Date(); hace3.setMonth(hace3.getMonth()-3);
    const gastosProm = transactions.filter(t=>t.type==="expense"&&new Date(t.date)>=hace3).reduce((s,t)=>s+parseFloat(t.amount||0),0)/3;

    return { liquidezTotal, liquidezMXN, liquidezUSD, inversionesMXN:inversionesSinLiq, totalActivosFisicos, porCobrar:porCobrarP, deudaTotal:deudaTotalConTarjetas, deudaPrestamos, deudaHipoteca, cuentasCredito, patrimonioNeto, ingresosMes, gastosMes, gastosProm };
  };

  const estado = calcEstado();

  // ── snapshot automático diario
  useEffect(() => {
    const hoy = today();
    const yaHayDeHoy = (snapshots||[]).some(s=>s.fecha===hoy);
    if (!yaHayDeHoy) {
      const snap = { id:genId(), fecha:hoy, manual:false, ...estado };
      setSnapshots(p=>[...(p||[]), snap]);
    }
  }, []); // eslint-disable-line

  const guardarManual = () => {
    const snap = { id:genId(), fecha:today(), manual:true, nota:"Snapshot manual", ...estado };
    setSnapshots(p=>[...(p||[]), snap]);
    toast("Snapshot guardado ✓");
  };

  // ── filtrar por rango
  const snapsOrdenados = [...(snapshots||[])].sort((a,b)=>new Date(a.fecha)-new Date(b.fecha));
  const filtrarRango = (snaps) => {
    const ahora = new Date();
    const corte = new Date();
    if (rango==="1m") corte.setMonth(corte.getMonth()-1);
    else if (rango==="3m") corte.setMonth(corte.getMonth()-3);
    else if (rango==="6m") corte.setMonth(corte.getMonth()-6);
    else if (rango==="1y") corte.setFullYear(corte.getFullYear()-1);
    else return snaps; // all
    return snaps.filter(s=>new Date(s.fecha)>=corte);
  };
  const snapsVis = filtrarRango(snapsOrdenados);

  // ── proyección 6 meses (regresión lineal simple)
  const calcProyeccion = () => {
    if (snapsVis.length < 2) return [];
    const n = snapsVis.length;
    const xs = snapsVis.map((_,i)=>i);
    const ys = snapsVis.map(s=>s.patrimonioNeto||0);
    const sumX=xs.reduce((a,b)=>a+b,0), sumY=ys.reduce((a,b)=>a+b,0);
    const sumXY=xs.reduce((s,x,i)=>s+x*ys[i],0), sumX2=xs.reduce((s,x)=>s+x*x,0);
    const m=(n*sumXY-sumX*sumY)/(n*sumX2-sumX*sumX||1);
    const b=( sumY-m*sumX)/n;
    const proyeccion = [];
    const ultimaFecha = new Date(snapsVis[snapsVis.length-1].fecha+"T12:00:00");
    for(let i=1;i<=6;i++){
      const f=new Date(ultimaFecha); f.setMonth(f.getMonth()+i);
      proyeccion.push({ fecha:f.toISOString().split("T")[0], patrimonioNeto:Math.round(m*(n+i-1)+b), proyectado:true });
    }
    return proyeccion;
  };
  const proyeccion = calcProyeccion();

  // ── mini gráfica SVG
  const MiniChart = ({ data, color="#00d4aa", height=120, showArea=true }) => {
    if (!data||data.length<2) return <p style={{color:"#444",fontSize:12,textAlign:"center",padding:"20px 0"}}>Sin suficientes datos aún. El histórico se construye automáticamente con el tiempo.</p>;
    const vals = data.map(d=>d.y);
    const minV=Math.min(...vals), maxV=Math.max(...vals);
    const range=maxV-minV||1;
    const W=600, H=height;
    const pts = data.map((d,i)=>({
      x: (i/(data.length-1))*W,
      y: H - ((d.y-minV)/range)*(H-20)-10,
    }));
    const pathD = pts.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const areaD = pathD + ` L${pts[pts.length-1].x},${H} L0,${H} Z`;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height}} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad_${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
          </linearGradient>
        </defs>
        {showArea && <path d={areaD} fill={`url(#grad_${color.replace("#","")})`}/>}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i)=>(
          <circle key={i} cx={p.x} cy={p.y} r={data.length<=20?3:0} fill={color}/>
        ))}
      </svg>
    );
  };

  // ── score de salud financiera (0–100)
  const calcScore = () => {
    const e = estado;
    const scores = [];
    const detalles = [];

    // 1. Razón deuda/patrimonio (ideal < 30%)
    const dp = e.patrimonioNeto>0 ? e.deudaTotal/e.patrimonioNeto*100 : 100;
    const s1 = dp<=0?100:dp<=30?90:dp<=50?70:dp<=75?45:dp<=100?20:0;
    scores.push(s1);
    detalles.push({ label:"Razón deuda/patrimonio", valor:`${dp.toFixed(1)}%`, score:s1,
      ideal:"< 30%", color:s1>=70?"#00d4aa":s1>=40?"#f39c12":"#ff4757",
      desc:s1>=70?"Excelente control de deuda":s1>=40?"Deuda manejable, reducir gradualmente":"Deuda elevada respecto al patrimonio" });

    // 2. Tasa de ahorro mensual (ideal > 20%)
    const ta = e.ingresosMes>0 ? ((e.ingresosMes-e.gastosMes)/e.ingresosMes)*100 : 0;
    const s2 = ta>=30?100:ta>=20?85:ta>=10?60:ta>=0?30:0;
    scores.push(s2);
    detalles.push({ label:"Tasa de ahorro mensual", valor:`${ta.toFixed(1)}%`, score:s2,
      ideal:"> 20%", color:s2>=70?"#00d4aa":s2>=40?"#f39c12":"#ff4757",
      desc:s2>=70?"Excelente tasa de ahorro":s2>=40?"Ahorro positivo, hay margen de mejora":"Revisar gastos para mejorar margen" });

    // 3. Cobertura de emergencia (ideal >= 6 meses)
    const ce = e.gastosProm>0 ? e.liquidezTotal/e.gastosProm : 0;
    const s3 = ce>=6?100:ce>=3?75:ce>=1?40:10;
    scores.push(s3);
    detalles.push({ label:"Cobertura de emergencia", valor:`${ce.toFixed(1)} meses`, score:s3,
      ideal:"≥ 6 meses", color:s3>=70?"#00d4aa":s3>=40?"#f39c12":"#ff4757",
      desc:s3>=70?"Fondo de emergencia sólido":s3>=40?"Cobertura parcial, seguir construyendo":"Fondo de emergencia insuficiente" });

    // 4. Diversificación de inversiones (ideal: inversiones > 20% del patrimonio)
    const divPct = e.patrimonioNeto>0 ? e.inversionesMXN/e.patrimonioNeto*100 : 0;
    const s4 = divPct>=30?100:divPct>=20?80:divPct>=10?55:divPct>0?30:10;
    const numInv = investments.filter(i=>i.estado!=="liquidada").length;
    scores.push(s4);
    detalles.push({ label:"Diversificación (inversiones)", valor:`${divPct.toFixed(1)}% en ${numInv} inv.`, score:s4,
      ideal:"> 20% patrimonio", color:s4>=70?"#00d4aa":s4>=40?"#f39c12":"#ff4757",
      desc:s4>=70?"Buena diversificación":s4>=40?"Inversiones presentes, ampliar posición":"Concentración alta en liquidez" });

    // 5. Flujo de caja libre (ideal > 0)
    const fcl = e.ingresosMes - e.gastosMes;
    const s5 = fcl>e.ingresosMes*0.3?100:fcl>e.ingresosMes*0.15?80:fcl>0?55:fcl===0?30:0;
    scores.push(s5);
    detalles.push({ label:"Flujo de caja libre", valor:fmt(fcl,"MXN"), score:s5,
      ideal:"> 0", color:s5>=70?"#00d4aa":s5>=40?"#f39c12":"#ff4757",
      desc:s5>=70?"Flujo positivo y saludable":s5>=40?"Flujo positivo, optimizable":"Gastos superan o igualan ingresos" });

    const total = Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
    const nivel = total>=80?"Excelente":total>=65?"Muy bueno":total>=50?"Bueno":total>=35?"Regular":"Necesita atención";
    const colorScore = total>=80?"#00d4aa":total>=65?"#10b981":total>=50?"#f39c12":total>=35?"#f97316":"#ff4757";
    return { total, nivel, colorScore, detalles };
  };
  const score = calcScore();

  // ── datos para gráficas
  const datosPatrimonio = snapsVis.map(s=>({x:s.fecha, y:s.patrimonioNeto||0, label:fmtDate(s.fecha)}));
  const datosLiquidez   = snapsVis.map(s=>({x:s.fecha, y:s.liquidezTotal||0}));
  const datosInv        = snapsVis.map(s=>({x:s.fecha, y:s.inversionesMXN||0}));
  const datosDeuda      = snapsVis.map(s=>({x:s.fecha, y:s.deudaTotal||0}));
  const datosConProyec  = [...datosPatrimonio, ...proyeccion.map(p=>({x:p.fecha,y:p.patrimonioNeto,proyectado:true}))];

  // comparativo mes a mes (últimos 6 meses)
  const comparativoMeses = (() => {
    const meses = [];
    for(let i=5;i>=0;i--){
      const d=new Date(); d.setMonth(d.getMonth()-i);
      const mk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const txs=transactions.filter(t=>t.date?.startsWith(mk));
      const ing=txs.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
      const gas=txs.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
      meses.push({ mk, label:d.toLocaleDateString("es-MX",{month:"short",year:"2-digit"}), ingresos:ing, gastos:gas, utilidad:ing-gas });
    }
    return meses;
  })();

  const BarChart = ({ data, keys, colors, height=120 }) => {
    const [hoverIdx, setHoverIdx] = React.useState(null);
    if(!data||data.length===0) return null;
    const maxVal = Math.max(...data.flatMap(d=>keys.map(k=>Math.abs(d[k]||0))),1);
    const W=600, H=height, barW=W/data.length*0.25;
    const LABELS = { ingresos:"Ingresos", gastos:"Gastos", utilidad:"Utilidad" };
    const fmtBar = v => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:0,maximumFractionDigits:0}).format(v||0);
    return (
      <div style={{position:"relative"}}>
        <svg viewBox={`0 0 ${W} ${H+24}`} style={{width:"100%",height:height+24}} preserveAspectRatio="none"
          onMouseLeave={()=>setHoverIdx(null)}>
          {data.map((d,i)=>{
            const x=(i/(data.length))*W+(W/data.length)*0.1;
            const slotW = W/data.length;
            return (
              <g key={i}>
                {keys.map((k,ki)=>{
                  const val=Math.abs(d[k]||0);
                  const bh=(val/maxVal)*(H-10);
                  const bx=x+ki*(barW+2);
                  return (
                    <rect key={k} x={bx} y={H-bh} width={barW} height={bh}
                      fill={d[k]<0&&k==="utilidad"?"#ff4757":colors[ki]}
                      rx={2} opacity={hoverIdx===i?1:0.75}
                      style={{transition:"opacity .15s"}}/>
                  );
                })}
                <rect x={i/data.length*W} y={0} width={slotW} height={H+10}
                  fill="transparent" style={{cursor:"crosshair"}}
                  onMouseEnter={()=>setHoverIdx(i)}/>
                <text x={x+(keys.length*(barW+2))/2} y={H+16} textAnchor="middle"
                  fill={hoverIdx===i?"#ccc":"#555"} fontSize={9}
                  style={{transition:"fill .15s"}}>{d.label}</text>
              </g>
            );
          })}
        </svg>
        {hoverIdx!==null && data[hoverIdx] && (()=>{
          const d = data[hoverIdx];
          const pct = hoverIdx/data.length;
          return (
            <div style={{
              position:"absolute", top:0,
              left:pct>0.6?"auto":`calc(${pct*100}% + 14px)`,
              right:pct>0.6?`calc(${(1-pct)*100}% + 14px)`:"auto",
              background:"rgba(18,22,36,.97)",
              border:"1px solid rgba(255,255,255,.12)",
              borderRadius:10, padding:"10px 13px",
              pointerEvents:"none", zIndex:10, minWidth:170,
              boxShadow:"0 8px 24px rgba(0,0,0,.5)"
            }}>
              <p style={{fontSize:11,fontWeight:700,color:"#ccc",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:.5}}>{d.label}</p>
              {keys.map((k,ki)=>{
                const val = d[k]||0;
                const col = val<0&&k==="utilidad"?"#ff4757":colors[ki];
                return (
                  <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,marginBottom:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <span style={{width:8,height:8,borderRadius:2,background:col,display:"inline-block",flexShrink:0}}/>
                      <span style={{fontSize:11,color:"#666"}}>{LABELS[k]||k}</span>
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:col}}>{fmtBar(Math.abs(val))}</span>
                  </div>
                );
              })}
              {d.ingresos>0&&(
                <div style={{marginTop:6,paddingTop:6,borderTop:"1px solid rgba(255,255,255,.06)",display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:10,color:"#555"}}>Margen</span>
                  <span style={{fontSize:11,fontWeight:700,color:(d.utilidad||0)>=0?"#00d4aa":"#ff4757"}}>
                    {d.ingresos>0?((d.utilidad||0)/d.ingresos*100).toFixed(1):0}%
                  </span>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  const TABS = [{id:"grafica",label:"Evolución"},{id:"desglose",label:"Desglose"},{id:"score",label:"Score de Salud"},{id:"comparativo",label:"Mes a mes"}];

  return (
    <div style={{animation:"fadeUp .25s ease"}}>
      {/* header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:"0 0 3px"}}>Patrimonio & Salud Financiera</h2>
          <p style={{fontSize:13,color:"#555",margin:0}}>Evolución histórica, proyección y diagnóstico de tu situación financiera</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          {[{v:"1m",l:"1M"},{v:"3m",l:"3M"},{v:"6m",l:"6M"},{v:"1y",l:"1A"},{v:"all",l:"Todo"}].map(r=>(
            <button key={r.v} onClick={()=>setRango(r.v)} style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${rango===r.v?"rgba(0,212,170,.4)":"rgba(255,255,255,.08)"}`,background:rango===r.v?"rgba(0,212,170,.12)":"transparent",color:rango===r.v?"#00d4aa":"#666",cursor:"pointer",fontSize:12,fontWeight:600}}>{r.l}</button>
          ))}
          <Btn variant="secondary" onClick={guardarManual}><Ic n="check" size={14}/>Snapshot manual</Btn>
        </div>
      </div>

      {/* KPIs actuales */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:18}}>
        {[
          ["Patrimonio neto",fmt(estado.patrimonioNeto,"MXN"),estado.patrimonioNeto>=0?"#00d4aa":"#ff4757"],
          ["Activos físicos",fmt(estado.totalActivosFisicos||0,"MXN"),"#00d4aa"],
          ["Liquidez total",fmt(estado.liquidezTotal,"MXN"),"#3b82f6"],
          ["Inversiones",fmt(estado.inversionesMXN,"MXN"),"#f39c12"],
          ["Deuda total",fmt(estado.deudaTotal,"MXN"),"#ff4757"],
          ["Flujo del mes",fmt(estado.ingresosMes-estado.gastosMes,"MXN"),estado.ingresosMes>=estado.gastosMes?"#00d4aa":"#ff4757"],
          ["Score salud",`${score.total}/100`,score.colorScore],
        ].map(([l,v,c])=>(
          <Card key={l}><p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 4px"}}>{l}</p><p style={{fontSize:15,fontWeight:700,color:c,margin:0}}>{v}</p></Card>
        ))}
      </div>

      {/* tabs */}
      <div style={{display:"flex",gap:2,marginBottom:16,background:"rgba(255,255,255,.03)",borderRadius:10,padding:3,width:"fit-content",flexWrap:"wrap"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .15s",background:tab===t.id?"linear-gradient(135deg,#00d4aa,#00a884)":"transparent",color:tab===t.id?"#fff":"#666"}}>{t.label}</button>
        ))}
      </div>

      {/* ── GRÁFICAS */}
      {tab==="grafica" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* ── GRÁFICA PRINCIPAL INTERACTIVA */}
          <Card>
            {(()=>{
              if(datosConProyec.length<2) return (
                <div style={{textAlign:"center",padding:"50px 20px"}}>
                  <Ic n="chart" size={40} color="#333"/>
                  <p style={{color:"#555",marginTop:12,fontSize:13}}>El histórico se construye automáticamente cada día que abres la app.</p>
                  <p style={{color:"#444",fontSize:11,marginTop:4}}>Vuelve mañana para ver tu primera evolución.</p>
                </div>
              );
              const reales = datosConProyec.filter(d=>!d.proyectado);
              const projs  = datosConProyec.filter(d=>d.proyectado);
              const todos  = [...reales,...projs];
              const vals   = todos.map(d=>d.y);
              const minV   = Math.min(...vals,0);
              const maxV   = Math.max(...vals,1);
              const range  = maxV-minV||1;
              const PAD = {t:20,r:16,b:48,l:72};
              const W=600, H=200;
              const cW=W-PAD.l-PAD.r, cH=H-PAD.t-PAD.b;
              const toX = (i,total) => PAD.l + (i/(total-1))*cW;
              const toY = (v) => PAD.t + cH - ((v-minV)/range)*cH;

              const ptR = reales.map((d,i)=>({x:toX(i,todos.length),   y:toY(d.y), d}));
              const ptP = projs.map((d,i)=> ({x:toX(reales.length-1+i,todos.length), y:toY(d.y), d}));
              const pathR = ptR.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
              const pathP = [ptR[ptR.length-1],...ptP].map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
              const areaR = pathR+` L${ptR[ptR.length-1].x},${toY(minV)} L${PAD.l},${toY(minV)} Z`;
              const y0    = toY(0);
              // eje Y: 5 líneas
              const yTicks = Array.from({length:5},(_,i)=>minV+(range/4)*i);
              // eje X: fechas representativas
              const xTicks = todos.filter((_,i)=>i===0||i===Math.floor(todos.length/2)||i===todos.length-1);

              const hoverPt = hoverIdx!=null ? (hoverIdx<ptR.length?ptR[hoverIdx]:{...ptP[hoverIdx-ptR.length],proj:true}) : null;
              const hoverD  = hoverIdx!=null ? todos[hoverIdx] : null;
              const cambio  = reales.length>1 ? reales[reales.length-1].y - reales[0].y : 0;
              const cambioPct = reales.length>1&&reales[0].y!==0 ? (cambio/Math.abs(reales[0].y))*100 : 0;

              return (
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:8}}>
                    <div>
                      <p style={{fontSize:14,fontWeight:800,color:"#f0f0f0",margin:"0 0 2px"}}>Patrimonio Neto — Evolución</p>
                      <p style={{fontSize:11,color:"#555",margin:0}}>{reales.length} puntos reales · proyección 6 meses (punteada)</p>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      {reales.length>1&&(
                        <div style={{textAlign:"right"}}>
                          <p style={{fontSize:10,color:"#555",margin:"0 0 1px"}}>Cambio en el período</p>
                          <p style={{fontSize:14,fontWeight:800,color:cambio>=0?"#00d4aa":"#ff4757",margin:0}}>
                            {cambio>=0?"+":""}{fmt(cambio,"MXN")} ({cambioPct>=0?"+":""}{cambioPct.toFixed(1)}%)
                          </p>
                        </div>
                      )}
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#555"}}><span style={{width:14,height:2,background:"#00d4aa",display:"inline-block",borderRadius:1}}/>Real</span>
                        <span style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#555"}}><span style={{width:14,height:2,background:"#00d4aa44",display:"inline-block",borderRadius:1,borderTop:"1px dashed #00d4aa"}}/>Proyección</span>
                      </div>
                    </div>
                  </div>
                  <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H,overflow:"visible"}}
                    onMouseLeave={()=>setHoverIdx(null)}>
                    <defs>
                      <linearGradient id="gPatNeto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.22"/>
                        <stop offset="100%" stopColor="#00d4aa" stopOpacity="0.01"/>
                      </linearGradient>
                      <linearGradient id="gPatNeg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff4757" stopOpacity="0.01"/>
                        <stop offset="100%" stopColor="#ff4757" stopOpacity="0.15"/>
                      </linearGradient>
                    </defs>

                    {/* grid horizontal */}
                    {yTicks.map((v,i)=>(
                      <g key={i}>
                        <line x1={PAD.l} x2={W-PAD.r} y1={toY(v)} y2={toY(v)} stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
                        <text x={PAD.l-6} y={toY(v)+4} textAnchor="end" fill="#444" fontSize="9">
                          {v>=1000000?`$${(v/1000000).toFixed(1)}M`:v>=1000?`$${(v/1000).toFixed(0)}k`:`$${v.toFixed(0)}`}
                        </text>
                      </g>
                    ))}

                    {/* línea de cero */}
                    {minV<0&&maxV>0&&(
                      <line x1={PAD.l} x2={W-PAD.r} y1={y0} y2={y0} stroke="rgba(255,255,255,.15)" strokeWidth="1" strokeDasharray="3,3"/>
                    )}

                    {/* área */}
                    <path d={areaR} fill="url(#gPatNeto)"/>
                    {minV<0&&<path d={`M${PAD.l},${y0} ${ptR.filter(p=>p.y>y0).map(p=>`L${p.x},${p.y}`).join(" ")} L${W-PAD.r},${y0} Z`} fill="url(#gPatNeg)" opacity="0.5"/>}

                    {/* línea real */}
                    <path d={pathR} fill="none" stroke="#00d4aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* línea proyección */}
                    {ptP.length>0&&<path d={pathP} fill="none" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6,4" opacity="0.5"/>}

                    {/* etiquetas eje X */}
                    {xTicks.map((d,i)=>{
                      const idx=todos.indexOf(d);
                      const x=toX(idx,todos.length);
                      return <text key={i} x={x} y={H-8} textAnchor="middle" fill="#444" fontSize="9">{fmtDate(d.x)}</text>;
                    })}

                    {/* puntos interactivos */}
                    {todos.map((_,i)=>{
                      const x=toX(i,todos.length);
                      const y=toY(todos[i].y);
                      return (
                        <rect key={i} x={x-8} y={PAD.t} width={16} height={cH} fill="transparent" style={{cursor:"crosshair"}}
                          onMouseEnter={()=>setHoverIdx(i)}/>
                      );
                    })}

                    {/* tooltip de hover */}
                    {hoverPt&&hoverD&&(()=>{
                      const x=hoverPt.x, y=hoverPt.y;
                      const tW=130,tH=52;
                      const tx=x+tW+8>W?x-tW-8:x+8;
                      const ty=Math.max(PAD.t, Math.min(y-tH/2, H-PAD.b-tH));
                      const isProj=hoverD.proyectado;
                      const col=isProj?"#00d4aa88":(hoverD.y>=0?"#00d4aa":"#ff4757");
                      return (
                        <g>
                          <line x1={x} x2={x} y1={PAD.t} y2={toY(minV)} stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
                          <circle cx={x} cy={y} r={5} fill={col} stroke="#161b27" strokeWidth={2}/>
                          <rect x={tx} y={ty} width={tW} height={tH} rx={6} fill="#1e2636" stroke="rgba(255,255,255,.12)" strokeWidth={1}/>
                          <text x={tx+8} y={ty+14} fill="#888" fontSize="9">{fmtDate(hoverD.x)}{isProj?" (proyectado)":""}</text>
                          <text x={tx+8} y={ty+30} fill={hoverD.y>=0?"#00d4aa":"#ff4757"} fontSize="12" fontWeight="700">
                            {hoverD.y>=1000000?`$${(hoverD.y/1000000).toFixed(2)}M`:hoverD.y>=1000?`$${(hoverD.y/1000).toFixed(1)}k`:`$${Math.round(hoverD.y)}`}
                          </text>
                          {hoverD.y<0&&<text x={tx+8} y={ty+44} fill="#ff475780" fontSize="9">Patrimonio negativo</text>}
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              );
            })()}
          </Card>

          {/* ── mini cards liquidez / inversiones / deuda */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
            {[
              {label:"Liquidez",data:datosLiquidez,color:"#3b82f6",icon:"accounts"},
              {label:"Inversiones",data:datosInv,color:"#f39c12",icon:"investments"},
              {label:"Deuda total",data:datosDeuda,color:"#ff4757",icon:"loans"},
            ].map(({label,data,color,icon})=>{
              if(!data||data.length<2) return (
                <Card key={label}>
                  <p style={{fontSize:12,fontWeight:700,color:"#777",marginBottom:8}}>{label}</p>
                  <p style={{fontSize:11,color:"#444"}}>Sin datos aún</p>
                </Card>
              );
              const vals=data.map(d=>d.y);
              const minV=Math.min(...vals),maxV=Math.max(...vals),range=maxV-minV||1;
              const W=300,H=60;
              const pts=data.map((d,i)=>({x:(i/(data.length-1))*W,y:H-((d.y-minV)/range)*(H-8)-4}));
              const pathD=pts.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
              const areaD=pathD+` L${pts[pts.length-1].x},${H} L0,${H} Z`;
              const diff=data[data.length-1].y-data[0].y;
              const diffPct=data[0].y!==0?(diff/Math.abs(data[0].y))*100:0;
              return (
                <Card key={label}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <Ic n={icon} size={14} color={color}/>
                      <p style={{fontSize:12,fontWeight:700,color:"#888",margin:0}}>{label}</p>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,color:diff>=0?color:"#ff4757"}}>
                      {diff>=0?"+":""}{diffPct.toFixed(1)}%
                    </span>
                  </div>
                  <p style={{fontSize:16,fontWeight:800,color,margin:"0 0 8px"}}>{fmt(data[data.length-1].y,"MXN")}</p>
                  <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`gMini${label}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
                        <stop offset="100%" stopColor={color} stopOpacity="0.01"/>
                      </linearGradient>
                    </defs>
                    <path d={areaD} fill={`url(#gMini${label})`}/>
                    <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r={3} fill={color}/>
                  </svg>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:9,color:"#444"}}>
                    <span>{fmtDate(data[0]?.x)}</span><span>{fmtDate(data[data.length-1]?.x)}</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* historial de snapshots */}
          {snapsOrdenados.length>0&&(
            <Card>
              <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Historial de snapshots ({snapsOrdenados.length})</p>
              <div style={{overflowX:"auto",maxHeight:280,overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead style={{position:"sticky",top:0,background:"#161b27"}}>
                    <tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                      {["Fecha","Patrimonio neto","Liquidez","Inversiones","Deuda","Tipo"].map(h=>(
                        <th key={h} style={{padding:"7px 10px",textAlign:"right",color:"#555",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...snapsOrdenados].reverse().slice(0,50).map(s=>(
                      <tr key={s.id} style={{borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                        <td style={{padding:"6px 10px",color:"#888",textAlign:"right"}}>{fmtDate(s.fecha)}</td>
                        <td style={{padding:"6px 10px",color:s.patrimonioNeto>=0?"#00d4aa":"#ff4757",textAlign:"right",fontWeight:600}}>{fmt(s.patrimonioNeto||0,"MXN")}</td>
                        <td style={{padding:"6px 10px",color:"#3b82f6",textAlign:"right"}}>{fmt(s.liquidezTotal||0,"MXN")}</td>
                        <td style={{padding:"6px 10px",color:"#f39c12",textAlign:"right"}}>{fmt(s.inversionesMXN||0,"MXN")}</td>
                        <td style={{padding:"6px 10px",color:"#ff4757",textAlign:"right"}}>{fmt(s.deudaTotal||0,"MXN")}</td>
                        <td style={{padding:"6px 10px",textAlign:"right"}}><Badge label={s.manual?"Manual":"Auto"} color={s.manual?"#7c3aed":"#555"}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── DESGLOSE */}
      {tab==="desglose" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* donut composición actual */}
          {(()=>{
            const e=estado;
            const total=e.liquidezTotal+e.inversionesMXN+e.deudaTotal;
            const segmentos=[
              {label:"Liquidez",valor:e.liquidezTotal,color:"#3b82f6"},
              {label:"Inversiones",valor:e.inversionesMXN,color:"#f39c12"},
              {label:"Deuda",valor:e.deudaTotal,color:"#ff4757"},
            ].filter(s=>s.valor>0);
            if(segmentos.length===0) return <Card><p style={{color:"#555",textAlign:"center",padding:20}}>Sin datos suficientes</p></Card>;
            // donut SVG
            const R=80,r=52,cx=110,cy=110,W=340,H=220;
            let acum=0;
            const slices=segmentos.map(s=>{
              const pct=s.valor/total;
              const a0=acum*2*Math.PI-Math.PI/2;
              const a1=(acum+pct)*2*Math.PI-Math.PI/2;
              acum+=pct;
              const x0=cx+R*Math.cos(a0),y0=cy+R*Math.sin(a0);
              const x1=cx+R*Math.cos(a1),y1=cy+R*Math.sin(a1);
              const ix0=cx+r*Math.cos(a0),iy0=cy+r*Math.sin(a0);
              const ix1=cx+r*Math.cos(a1),iy1=cy+r*Math.sin(a1);
              const large=pct>0.5?1:0;
              return {...s,pct,d:`M${x0.toFixed(1)},${y0.toFixed(1)} A${R},${R} 0 ${large},1 ${x1.toFixed(1)},${y1.toFixed(1)} L${ix1.toFixed(1)},${iy1.toFixed(1)} A${r},${r} 0 ${large},0 ${ix0.toFixed(1)},${iy0.toFixed(1)} Z`};
            });
            return (
              <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:20,alignItems:"center"}}>
                <svg viewBox={`0 0 ${W} ${H}`} style={{width:W/1.5,height:H/1.5,flexShrink:0}}>
                  {slices.map((s,i)=><path key={i} d={s.d} fill={s.color} opacity={0.9}/>)}
                  <text x={cx} y={cy-8} textAnchor="middle" fill="#f0f0f0" fontSize="13" fontWeight="800">
                    {e.patrimonioNeto>=1000000?`$${(e.patrimonioNeto/1000000).toFixed(1)}M`:e.patrimonioNeto>=1000?`$${(e.patrimonioNeto/1000).toFixed(0)}k`:fmt(e.patrimonioNeto,"MXN")}
                  </text>
                  <text x={cx} y={cy+8} textAnchor="middle" fill="#555" fontSize="9">Patrimonio neto</text>
                </svg>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {segmentos.map((s,i)=>(
                    <div key={i}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#ccc"}}>
                          <span style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                          {s.label}
                        </span>
                        <span style={{fontSize:12,fontWeight:700,color:s.color}}>{(s.valor/total*100).toFixed(1)}%</span>
                      </div>
                      <div style={{height:5,background:"rgba(255,255,255,.06)",borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${(s.valor/total*100).toFixed(1)}%`,background:s.color,borderRadius:3,transition:"width .5s ease"}}/>
                      </div>
                      <p style={{fontSize:11,color:"#555",margin:"2px 0 0",textAlign:"right"}}>{fmt(s.valor,"MXN")}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* stacked area: activos vs pasivos en el tiempo */}
          {snapsVis.length>=2&&(
            <Card>
              <p style={{fontSize:13,fontWeight:700,color:"#e0e0e0",marginBottom:4}}>Activos vs Pasivos en el tiempo</p>
              <p style={{fontSize:11,color:"#555",marginBottom:12}}>Área verde = activos (liquidez + inversiones) · Área roja = deuda total</p>
              {(()=>{
                const W=600,H=160,PAD={t:12,r:12,b:32,l:68};
                const cW=W-PAD.l-PAD.r,cH=H-PAD.t-PAD.b;
                const activos=snapsVis.map(s=>(s.liquidezTotal||0)+(s.inversionesMXN||0));
                const pasivos=snapsVis.map(s=>s.deudaTotal||0);
                const maxV=Math.max(...activos,...pasivos,1);
                const toX=i=>PAD.l+(i/(snapsVis.length-1))*cW;
                const toYA=v=>PAD.t+cH-(v/maxV)*cH;
                const toYP=v=>PAD.t+cH-(v/maxV)*cH;
                const pathA=snapsVis.map((_,i)=>`${i===0?"M":"L"}${toX(i).toFixed(1)},${toYA(activos[i]).toFixed(1)}`).join(" ");
                const pathP=snapsVis.map((_,i)=>`${i===0?"M":"L"}${toX(i).toFixed(1)},${toYP(pasivos[i]).toFixed(1)}`).join(" ");
                const areaA=pathA+` L${toX(snapsVis.length-1)},${PAD.t+cH} L${PAD.l},${PAD.t+cH} Z`;
                const areaP=pathP+` L${toX(snapsVis.length-1)},${PAD.t+cH} L${PAD.l},${PAD.t+cH} Z`;
                const yTicks=[0,maxV/2,maxV];
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gAct" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="#00d4aa" stopOpacity="0.03"/>
                      </linearGradient>
                      <linearGradient id="gPas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff4757" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#ff4757" stopOpacity="0.03"/>
                      </linearGradient>
                    </defs>
                    {yTicks.map((v,i)=>(
                      <g key={i}>
                        <line x1={PAD.l} x2={W-PAD.r} y1={toYA(v)} y2={toYA(v)} stroke="rgba(255,255,255,.04)" strokeWidth="1"/>
                        <text x={PAD.l-5} y={toYA(v)+4} textAnchor="end" fill="#444" fontSize="9">
                          {v>=1000000?`$${(v/1000000).toFixed(1)}M`:v>=1000?`$${(v/1000).toFixed(0)}k`:"$0"}
                        </text>
                      </g>
                    ))}
                    <path d={areaA} fill="url(#gAct)"/>
                    <path d={areaP} fill="url(#gPas)"/>
                    <path d={pathA} fill="none" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round"/>
                    <path d={pathP} fill="none" stroke="#ff4757" strokeWidth="2" strokeLinecap="round"/>
                    {[0,Math.floor(snapsVis.length/2),snapsVis.length-1].map(i=>(
                      <text key={i} x={toX(i)} y={H-6} textAnchor="middle" fill="#444" fontSize="9">{fmtDate(snapsVis[i]?.fecha)}</text>
                    ))}
                  </svg>
                );
              })()}
            </Card>
          )}
        </div>
      )}

      {/* ── SCORE DE SALUD */}
      {tab==="score" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* score principal */}
          <Card style={{borderColor:`${score.colorScore}33`,background:`linear-gradient(135deg,${score.colorScore}08 0%,transparent 60%)`}}>
            <div style={{display:"flex",alignItems:"center",gap:24,flexWrap:"wrap"}}>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{position:"relative",width:110,height:110,margin:"0 auto"}}>
                  <svg viewBox="0 0 120 120" style={{width:110,height:110,transform:"rotate(-90deg)"}}>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="10"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke={score.colorScore} strokeWidth="10"
                      strokeDasharray={`${score.total*3.14} 314`} strokeLinecap="round"/>
                  </svg>
                  <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                    <p style={{fontSize:26,fontWeight:800,color:score.colorScore,margin:0,lineHeight:1}}>{score.total}</p>
                    <p style={{fontSize:10,color:"#555",margin:0}}>/ 100</p>
                  </div>
                </div>
                <p style={{fontSize:14,fontWeight:700,color:score.colorScore,marginTop:8}}>{score.nivel}</p>
              </div>
              <div style={{flex:1}}>
                <p style={{fontSize:16,fontWeight:700,color:"#f0f0f0",margin:"0 0 8px"}}>Diagnóstico financiero</p>
                <p style={{fontSize:13,color:"#888",margin:"0 0 14px",lineHeight:1.5}}>
                  Tu score se calcula en base a 5 indicadores clave. Cada uno tiene un peso igual en el resultado final.
                </p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {score.detalles.map(d=>(
                    <div key={d.label} style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:d.color,flexShrink:0}}/>
                      <span style={{fontSize:12,color:"#666"}}>{d.label.split(" ")[0]}: <strong style={{color:d.color}}>{d.score}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* indicadores detallados */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
            {score.detalles.map(d=>(
              <Card key={d.label} style={{borderColor:`${d.color}22`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <p style={{fontSize:13,fontWeight:700,color:"#e0e0e0",margin:"0 0 2px"}}>{d.label}</p>
                    <p style={{fontSize:11,color:"#555",margin:0}}>Ideal: {d.ideal}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:15,fontWeight:700,color:d.color,margin:"0 0 2px"}}>{d.score}/100</p>
                    <p style={{fontSize:12,color:"#888",margin:0}}>{d.valor}</p>
                  </div>
                </div>
                {/* barra */}
                <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,.06)",overflow:"hidden",marginBottom:8}}>
                  <div style={{height:"100%",width:`${d.score}%`,background:d.color,borderRadius:3,transition:"width .5s"}}/>
                </div>
                <p style={{fontSize:11,color:"#666",margin:0,lineHeight:1.4}}>{d.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── COMPARATIVO MES A MES */}
      {tab==="comparativo" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* barras */}
          <Card>
            <p style={{fontSize:13,fontWeight:700,color:"#e0e0e0",margin:"0 0 4px"}}>Ingresos, Gastos y Utilidad — últimos 6 meses</p>
            <p style={{fontSize:11,color:"#555",margin:"0 0 14px"}}>
              <span style={{color:"#00d4aa"}}>■</span> Ingresos &nbsp;
              <span style={{color:"#ff4757"}}>■</span> Gastos &nbsp;
              <span style={{color:"#3b82f6"}}>■</span> Utilidad
            </p>
            <BarChart data={comparativoMeses} keys={["ingresos","gastos","utilidad"]} colors={["#00d4aa","#ff4757","#3b82f6"]} height={140}/>
          </Card>

          {/* tabla detallada */}
          <Card>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                  {["Mes","Ingresos","Gastos","Utilidad","Margen","vs mes ant."].map(h=>(
                    <th key={h} style={{padding:"8px 12px",textAlign:"right",color:"#555",fontWeight:600}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {comparativoMeses.map((m,i)=>{
                    const prev=comparativoMeses[i-1];
                    const delta=prev?m.utilidad-prev.utilidad:null;
                    const margen=m.ingresos>0?((m.utilidad/m.ingresos)*100):0;
                    return (
                      <tr key={m.mk} style={{borderBottom:"1px solid rgba(255,255,255,.03)",fontWeight:i===comparativoMeses.length-1?700:400}}>
                        <td style={{padding:"8px 12px",color:"#888",textAlign:"right",textTransform:"capitalize"}}>{m.label}</td>
                        <td style={{padding:"8px 12px",color:"#00d4aa",textAlign:"right"}}>{fmt(m.ingresos,"MXN")}</td>
                        <td style={{padding:"8px 12px",color:"#ff4757",textAlign:"right"}}>{fmt(m.gastos,"MXN")}</td>
                        <td style={{padding:"8px 12px",color:m.utilidad>=0?"#00d4aa":"#ff4757",textAlign:"right",fontWeight:600}}>{fmt(m.utilidad,"MXN")}</td>
                        <td style={{padding:"8px 12px",color:margen>=20?"#00d4aa":margen>=0?"#f39c12":"#ff4757",textAlign:"right"}}>{margen.toFixed(1)}%</td>
                        <td style={{padding:"8px 12px",textAlign:"right",color:delta===null?"#444":delta>=0?"#00d4aa":"#ff4757"}}>
                          {delta===null?"—":(delta>=0?"+":"")+fmt(delta,"MXN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* tendencia */}
          {comparativoMeses.filter(m=>m.ingresos>0).length>=2&&(()=>{
            const conData=comparativoMeses.filter(m=>m.ingresos>0);
            const tendIng=(conData[conData.length-1].ingresos-conData[0].ingresos)/conData[0].ingresos*100;
            const tendGas=(conData[conData.length-1].gastos-conData[0].gastos)/conData[0].gastos*100;
            return (
              <Card>
                <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Tendencia del período</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div style={{background:"rgba(0,212,170,.06)",border:"1px solid rgba(0,212,170,.12)",borderRadius:9,padding:"10px 14px"}}>
                    <p style={{fontSize:11,color:"#555",margin:"0 0 4px"}}>Tendencia ingresos</p>
                    <p style={{fontSize:16,fontWeight:700,color:tendIng>=0?"#00d4aa":"#ff4757",margin:0}}>{tendIng>=0?"+":""}{tendIng.toFixed(1)}%</p>
                  </div>
                  <div style={{background:"rgba(255,71,87,.06)",border:"1px solid rgba(255,71,87,.12)",borderRadius:9,padding:"10px 14px"}}>
                    <p style={{fontSize:11,color:"#555",margin:"0 0 4px"}}>Tendencia gastos</p>
                    <p style={{fontSize:16,fontWeight:700,color:tendGas<=0?"#00d4aa":"#ff4757",margin:0}}>{tendGas>=0?"+":""}{tendGas.toFixed(1)}%</p>
                  </div>
                </div>
              </Card>
            );
          })()}
        </div>
      )}
    </div>
  );
};

// ─── PRESUPUESTOS ─────────────────────────────────────────────────────────────
const Presupuestos = () => {
  const { user, toast } = useCtx();
  const [presupuestos, setPresupuestos] = useData(user.id, "presupuestos");
  const [transactions]                  = useData(user.id, "transactions");
  const [config, setConfig]             = useData(user.id, "config", {});
  const [showForm, setShowForm]         = useState(false);
  const [showCatMgr, setShowCatMgr]     = useState(false);
  const [askConfirm, confirmModal]      = useConfirm();
  const [tab, setTab]                   = useState("activos");
  const [newCat, setNewCat]             = useState({ tipo:"expense", nombre:"" });

  const DEFAULT_CATS = {
    income:["Salario","Freelance","Negocio","Renta","Intereses","Dividendos","Intereses cobrados","Retiro de inversión","Dividendos e intereses","Ganancia de inversión","Recuperación de capital","Otro"],
    expense:["Alimentación","Transporte","Salud","Educación","Entretenimiento","Ropa","Servicios","Hipoteca / Vivienda","Pago de deuda","Pérdida de inversión","Abono a capital","Otro"],
  };
  const cats = {
    income: [...new Set([...DEFAULT_CATS.income, ...(config.categorias?.income||[]), ...transactions.filter(t=>t.type==="income"&&t.category).map(t=>t.category)])],
    expense: [...new Set([...DEFAULT_CATS.expense, ...(config.categorias?.expense||[]), ...transactions.filter(t=>t.type==="expense"&&t.category).map(t=>t.category)])],
  };

  const emptyForm = {
    nombre:"", tipo:"categoria", categoria:"", montoLimite:"",
    color:"#00d4aa", acumulativo:true, activo:true, historial:[],
  };
  const [form, setForm] = useState(emptyForm);
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const TIPOS = [
    {value:"categoria", label:"Por categoría",   desc:"Controla gastos de una categoría"},
    {value:"proyecto",  label:"Por proyecto",     desc:"Etiqueta libre personalizada"},
    {value:"global",    label:"Global mensual",   desc:"Techo total de todos los gastos"},
  ];
  const COLORES = ["#00d4aa","#3b82f6","#f39c12","#ef4444","#7c3aed","#10b981","#f97316","#ec4899"];

  // ── mes actual
  const now    = new Date();
  const mesKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

  // ── calcular gastado en el mes actual para un presupuesto
  const calcGastado = (p) => {
    const txsMes = transactions.filter(t => {
      if (!t.date?.startsWith(mesKey)) return false;
      if (t.type!=="expense") return false;
      if (p.tipo==="global") return true;
      if (p.tipo==="categoria") return t.category===p.categoria;
      if (p.tipo==="proyecto") return (t.proyecto||t.category||t.description)===p.nombre;
      return false;
    });
    return txsMes.reduce((s,t)=>s+parseFloat(t.amount||0),0);
  };

  // ── límite efectivo (con acumulación de meses anteriores)
  const calcLimiteEfectivo = (p) => {
    const base = parseFloat(p.montoLimite)||0;
    if (!p.acumulativo || !p.historial?.length) return base;
    const totalAcum = (p.historial||[]).reduce((s,h)=>s+(h.sobrante||0),0);
    return base + totalAcum;
  };

  // ── proyección: ¿me paso este mes?
  const calcProyeccion = (gastado, limite) => {
    const diasMes    = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
    const diaActual  = now.getDate();
    const ritmoD     = gastado/diaActual;
    const proyFin    = ritmoD * diasMes;
    const diasRest   = diasMes - diaActual;
    const margenD    = (limite - gastado)/Math.max(diasRest,1);
    return { proyFin, diasRest, margenD, sePasa: proyFin > limite };
  };

  // ── historial de últimos 6 meses
  const calcHistorico = (p) => {
    const meses = [];
    for (let i=5;i>=0;i--) {
      const d  = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const mk = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const gastado = transactions.filter(t=>{
        if (!t.date?.startsWith(mk)||t.type!=="expense") return false;
        if (p.tipo==="global") return true;
        if (p.tipo==="categoria") return t.category===p.categoria;
        if (p.tipo==="proyecto") return (t.proyecto||t.category||t.description)===p.nombre;
        return false;
      }).reduce((s,t)=>s+parseFloat(t.amount||0),0);
      const lim = parseFloat(p.montoLimite)||0;
      meses.push({ mk, label:d.toLocaleDateString("es-MX",{month:"short",year:"2-digit"}), gastado, limite:lim, cumplido:gastado<=lim });
    }
    return meses;
  };

  const guardar = () => {
    if (!form.nombre && form.tipo!=="global") { toast("Ingresa un nombre","error"); return; }
    if (!form.montoLimite) { toast("Ingresa el monto límite","error"); return; }
    if (form.tipo==="categoria"&&!form.categoria) { toast("Selecciona una categoría","error"); return; }
    const datos = {
      ...form,
      nombre: form.tipo==="global"?"Presupuesto global mensual":form.nombre,
    };
    if (form.id) {
      setPresupuestos(p=>p.map(x=>x.id===form.id?datos:x));
      toast("Presupuesto actualizado");
    } else {
      setPresupuestos(p=>[...p,{...datos,id:genId(),creadoEn:today()}]);
      toast("Presupuesto creado ✓");
    }
    setShowForm(false); setForm(emptyForm);
  };

  const eliminar = async (id) => {
    const ok = await askConfirm("¿Eliminar este presupuesto?");
    if (!ok) return;
    setPresupuestos(p=>p.filter(x=>x.id!==id));
    toast("Presupuesto eliminado","error");
  };

  const agregarCategoria = (tipoParam) => {
    const tipo   = tipoParam || newCat.tipo;
    const nombre = newCat.nombre.trim();
    if (!nombre) { toast("Escribe el nombre de la categoría","error"); return; }
    const actual = config.categorias?.[tipo] || DEFAULT_CATS[tipo];
    if (actual.includes(nombre)) { toast("Ya existe esa categoría","error"); return; }
    setConfig(c=>({...c, categorias:{...c.categorias, [tipo]:[...(c.categorias?.[tipo]||DEFAULT_CATS[tipo]), nombre]}}));
    toast(`Categoría "${nombre}" agregada ✓`);
    setNewCat({tipo, nombre:""});
  };

  const eliminarCategoria = (tipo, cat) => {
    setConfig(c=>({...c, categorias:{...c.categorias, [tipo]:(c.categorias?.[tipo]||DEFAULT_CATS[tipo]).filter(x=>x!==cat)}}));
    toast("Categoría eliminada");
  };

  const activos  = presupuestos.filter(p=>p.activo!==false);
  const pausados = presupuestos.filter(p=>p.activo===false);

  // ── calcular presupuesto global dinámico
  const gastoGlobalMes = transactions.filter(t=>t.date?.startsWith(mesKey)&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
  const presGlobal     = activos.find(p=>p.tipo==="global");
  const limGlobal      = presGlobal ? calcLimiteEfectivo(presGlobal) : 0;
  const pctGlobal      = limGlobal>0 ? gastoGlobalMes/limGlobal*100 : 0;

  return (
    <div style={{animation:"fadeUp .25s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:"0 0 3px"}}>Presupuestos</h2>
          <p style={{fontSize:13,color:"#555",margin:0}}>Define límites de gasto, recibe alertas y acumula lo no gastado</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn variant="secondary" onClick={()=>setShowCatMgr(true)}><Ic n="settings" size={14}/>Categorías</Btn>
          <Btn onClick={()=>{setForm(emptyForm);setShowForm(true);}}><Ic n="plus" size={15}/>Nuevo presupuesto</Btn>
        </div>
      </div>

      {/* banner global */}
      {presGlobal && (
        <Card style={{marginBottom:16,borderColor:pctGlobal>100?"rgba(255,71,87,.3)":pctGlobal>80?"rgba(243,156,18,.3)":"rgba(0,212,170,.15)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:10}}>
            <div>
              <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 4px"}}>Presupuesto global del mes</p>
              <p style={{fontSize:13,color:"#ccc",margin:0}}>
                <strong style={{color:pctGlobal>100?"#ff4757":pctGlobal>80?"#f39c12":"#00d4aa"}}>{fmt(gastoGlobalMes,"MXN")}</strong>
                {" "}de{" "}<strong style={{color:"#ccc"}}>{fmt(limGlobal,"MXN")}</strong>
                {presGlobal.acumulativo && (calcLimiteEfectivo(presGlobal)-parseFloat(presGlobal.montoLimite))>0 &&
                  <span style={{fontSize:11,color:"#7c3aed",marginLeft:8}}>+{fmt(calcLimiteEfectivo(presGlobal)-parseFloat(presGlobal.montoLimite),"MXN")} acumulado</span>}
              </p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Badge label={pctGlobal>100?"Excedido":pctGlobal>80?"En alerta":"Dentro del límite"} color={pctGlobal>100?"#ff4757":pctGlobal>80?"#f39c12":"#00d4aa"}/>
              <button onClick={()=>{setForm({...presGlobal});setShowForm(true);}}
                style={{fontSize:11,fontWeight:600,color:"#888",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:7,padding:"4px 10px",cursor:"pointer"}}
                onMouseEnter={e=>{e.currentTarget.style.color="#00d4aa";e.currentTarget.style.borderColor="rgba(0,212,170,.3)";}}
                onMouseLeave={e=>{e.currentTarget.style.color="#888";e.currentTarget.style.borderColor="rgba(255,255,255,.08)";}}>
                ✏️ Editar límite
              </button>
              <button onClick={()=>eliminar(presGlobal.id)}
                style={{fontSize:11,color:"#ff4757",background:"rgba(255,71,87,.08)",border:"1px solid rgba(255,71,87,.15)",borderRadius:7,padding:"4px 8px",cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,71,87,.18)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,71,87,.08)"}>
                <Ic n="trash" size={13}/>
              </button>
            </div>
          </div>
          <div style={{height:8,borderRadius:4,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(pctGlobal,100)}%`,background:pctGlobal>100?"#ff4757":pctGlobal>80?"#f39c12":"#00d4aa",borderRadius:4,transition:"width .5s"}}/>
          </div>
        </Card>
      )}

      {/* tabs */}
      <div style={{display:"flex",gap:2,marginBottom:14,background:"rgba(255,255,255,.03)",borderRadius:10,padding:3,width:"fit-content"}}>
        {[{id:"activos",label:`Activos (${activos.length})`},{id:"pausados",label:`Pausados (${pausados.length})`}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .15s",background:tab===t.id?"linear-gradient(135deg,#00d4aa,#00a884)":"transparent",color:tab===t.id?"#fff":"#666"}}>{t.label}</button>
        ))}
      </div>

      {/* lista */}
      {(tab==="activos"?activos:pausados).length===0 ? (
        <div style={{textAlign:"center",padding:"50px 20px"}}>
          <Ic n="presupuesto" size={44} color="#333"/>
          <p style={{fontSize:14,color:"#555",margin:"14px 0 6px"}}>{tab==="activos"?"Sin presupuestos activos":"Sin presupuestos pausados"}</p>
          {tab==="activos"&&<Btn onClick={()=>{setForm(emptyForm);setShowForm(true);}}>Crear primer presupuesto</Btn>}
        </div>
      ) : (
        <div style={{display:"grid",gap:12}}>
          {(tab==="activos"?activos:pausados).filter(p=>p.tipo!=="global").map(p=>{
            const gastado   = calcGastado(p);
            const limite    = calcLimiteEfectivo(p);
            const pct       = limite>0 ? Math.min(gastado/limite*100,100) : 0;
            const pctReal   = limite>0 ? gastado/limite*100 : 0;
            const proy      = calcProyeccion(gastado,limite);
            const historico = calcHistorico(p);
            // Comparativo mes anterior
            const mesAnt = (() => {
              const d = new Date(now.getFullYear(), now.getMonth()-1, 1);
              const mk = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
              const txs = transactions.filter(t=>{
                if(!t.date?.startsWith(mk)||t.type!=="expense") return false;
                if(p.tipo==="global") return true;
                if(p.tipo==="categoria") return t.category===p.categoria;
                return false;
              });
              return txs.reduce((s,t)=>s+parseFloat(t.amount||0),0);
            })();
            const deltaVsAnt = mesAnt>0 ? ((gastado-mesAnt)/mesAnt*100) : null;
            const acum      = (calcLimiteEfectivo(p)-parseFloat(p.montoLimite));
            const barColor  = pctReal>100?"#ff4757":pctReal>80?"#f39c12":p.color||"#00d4aa";
            const alerta    = pctReal>100?"Excedido":pctReal>80?"En alerta":null;
            return (
              <Card key={p.id} style={{borderColor:alerta?`${barColor}33`:"rgba(255,255,255,.06)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:34,height:34,borderRadius:9,background:`${p.color||"#00d4aa"}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Ic n="presupuesto" size={17} color={p.color||"#00d4aa"}/>
                    </div>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <p style={{fontSize:14,fontWeight:700,color:"#f0f0f0",margin:0}}>{p.nombre}</p>
                        <Badge label={TIPOS.find(t=>t.value===p.tipo)?.label||p.tipo} color={p.color||"#00d4aa"}/>
                        {p.tipo==="categoria"&&<Badge label={p.categoria} color="#555"/>}
                        {alerta&&<Badge label={alerta} color={barColor}/>}
                      </div>
                      {p.acumulativo&&acum>0&&<p style={{fontSize:11,color:"#7c3aed",margin:"2px 0 0"}}>+{fmt(acum,"MXN")} acumulado de meses anteriores</p>}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                    <div style={{textAlign:"right"}}>
                      <p style={{fontSize:15,fontWeight:700,color:barColor,margin:"0 0 1px"}}>{fmt(gastado,"MXN")}</p>
                      <p style={{fontSize:11,color:"#555",margin:0}}>de {fmt(limite,"MXN")}</p>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <button onClick={()=>{setForm({...p});setShowForm(true);}}
                        style={{fontSize:10,fontWeight:600,color:"#888",background:"rgba(255,255,255,.05)",
                          border:"1px solid rgba(255,255,255,.08)",borderRadius:7,padding:"4px 9px",cursor:"pointer"}}
                        onMouseEnter={e=>{e.currentTarget.style.color="#00d4aa";e.currentTarget.style.borderColor="rgba(0,212,170,.3)";}}
                        onMouseLeave={e=>{e.currentTarget.style.color="#888";e.currentTarget.style.borderColor="rgba(255,255,255,.08)";}}>
                        ✏️ Editar
                      </button>
                      <button onClick={()=>eliminar(p.id)}
                        style={{fontSize:10,color:"#ff4757",background:"rgba(255,71,87,.08)",
                          border:"1px solid rgba(255,71,87,.15)",borderRadius:7,padding:"4px 8px",cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,71,87,.15)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(255,71,87,.08)"}>
                        <Ic n="trash" size={13}/>
                      </button>
                    </div>
                  </div>
                </div>
                {/* barra */}
                <div style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:11,color:"#555"}}>{pctReal.toFixed(1)}% consumido</span>
                    <span style={{fontSize:11,color:barColor,fontWeight:600}}>
                      {pctReal>100?`Excedido por ${fmt(gastado-limite,"MXN")}`:`${fmt(limite-gastado,"MXN")} disponible`}
                    </span>
                  </div>
                  <div style={{height:7,borderRadius:4,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${barColor},${barColor}99)`,borderRadius:4,transition:"width .5s"}}/>
                  </div>
                </div>
                {/* proyección */}
                <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:proy.sePasa?"#ff4757":"#00d4aa",flexShrink:0}}/>
                    <span style={{fontSize:11,color:proy.sePasa?"#ff4757":"#00d4aa"}}>
                      {proy.sePasa
                        ? `Proyectado: ${fmt(proy.proyFin,"MXN")} al fin de mes — te pasarás`
                        : `Proyectado: ${fmt(proy.proyFin,"MXN")} — dentro del límite`}
                    </span>
                  </div>
                  <span style={{fontSize:11,color:"#555"}}>{fmt(proy.margenD,"MXN")}/día disponible</span>
                </div>
                {/* Comparativo mes anterior */}
                {mesAnt>0&&(
                  <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8,padding:"5px 10px",borderRadius:8,background:"rgba(255,255,255,.03)"}}>
                    <span style={{fontSize:10,color:"#555"}}>Mes anterior: <strong style={{color:"#888"}}>{fmt(mesAnt,"MXN")}</strong></span>
                    {deltaVsAnt!==null&&(
                      <span style={{fontSize:10,fontWeight:700,color:deltaVsAnt>0?"#ff4757":"#00d4aa"}}>
                        {deltaVsAnt>0?"▲":"▼"} {Math.abs(deltaVsAnt).toFixed(1)}% {deltaVsAnt>0?"más":"menos"} que el mes pasado
                      </span>
                    )}
                  </div>
                )}
                {/* histórico mini */}
                <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.05)"}}>
                  <p style={{fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:.4,marginBottom:6}}>Cumplimiento últimos 6 meses</p>
                  <div style={{display:"flex",gap:4}}>
                    {historico.map((h,i)=>(
                      <div key={i} style={{flex:1,textAlign:"center"}}>
                        <div style={{height:28,borderRadius:4,background:h.gastado===0?"rgba(255,255,255,.04)":h.cumplido?"rgba(0,212,170,.2)":"rgba(255,71,87,.2)",display:"flex",alignItems:"flex-end",overflow:"hidden",marginBottom:3}}>
                          {h.gastado>0&&<div style={{width:"100%",height:`${Math.min(h.gastado/Math.max(h.limite,1)*100,100)}%`,background:h.cumplido?"#00d4aa":"#ff4757",borderRadius:4}}/>}
                        </div>
                        <span style={{fontSize:9,color:"#444"}}>{h.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <Modal title={form.id?"Editar presupuesto":"Nuevo presupuesto"} onClose={()=>{setShowForm(false);setForm(emptyForm);}} width={500}>
          {/* tipo */}
          <div style={{marginBottom:14}}>
            <label style={{display:"block",marginBottom:8,fontSize:12,fontWeight:600,color:"#999",textTransform:"uppercase",letterSpacing:.4}}>Tipo *</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {TIPOS.map(t=>(
                <button key={t.value} onClick={()=>setForm(p=>({...p,tipo:t.value}))} style={{padding:"9px 8px",borderRadius:9,border:`1px solid ${form.tipo===t.value?"rgba(0,212,170,.4)":"rgba(255,255,255,.08)"}`,background:form.tipo===t.value?"rgba(0,212,170,.10)":"rgba(255,255,255,.03)",cursor:"pointer",textAlign:"center"}}>
                  <p style={{fontSize:11,fontWeight:700,color:form.tipo===t.value?"#00d4aa":"#ccc",margin:"0 0 2px"}}>{t.label}</p>
                  <p style={{fontSize:10,color:"#555",margin:0,lineHeight:1.3}}>{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {form.tipo!=="global" && <Inp label="Nombre *" value={form.nombre} onChange={f("nombre")} placeholder={form.tipo==="proyecto"?"Ej. Viaje CDMX, Remodelación...":"Nombre descriptivo"}/>}
          {form.tipo==="categoria" && (
            <Sel label="Categoría de gasto *" value={form.categoria} onChange={f("categoria")}
              options={[{value:"",label:"— Seleccionar —"},...cats.expense.map(c=>({value:c,label:c}))]}/>
          )}
          <Inp label="Monto límite mensual *" type="number" prefix="$" value={form.montoLimite} onChange={f("montoLimite")}/>

          {/* acumulativo toggle */}
          <label style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:14,cursor:"pointer",background:"rgba(124,58,237,.05)",border:"1px solid rgba(124,58,237,.15)",borderRadius:9,padding:"10px 13px"}}>
            <input type="checkbox" checked={form.acumulativo||false} onChange={e=>setForm(p=>({...p,acumulativo:e.target.checked}))} style={{marginTop:2,accentColor:"#7c3aed",width:15,height:15,flexShrink:0}}/>
            <div>
              <p style={{fontSize:12,fontWeight:700,color:"#a78bfa",margin:"0 0 2px"}}>Presupuesto acumulativo</p>
              <p style={{fontSize:11,color:"#555",margin:0}}>Lo no gastado en un mes se suma al límite del siguiente. Si gastas menos, tienes más margen después.</p>
            </div>
          </label>

          {/* color */}
          <div style={{marginBottom:16}}>
            <label style={{display:"block",marginBottom:8,fontSize:12,fontWeight:600,color:"#999",textTransform:"uppercase",letterSpacing:.4}}>Color</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {COLORES.map(c=>(
                <button key={c} onClick={()=>setForm(p=>({...p,color:c}))} style={{width:26,height:26,borderRadius:"50%",background:c,border:`2px solid ${form.color===c?"#fff":"transparent"}`,cursor:"pointer"}}/>
              ))}
            </div>
          </div>

          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn variant="secondary" onClick={()=>{setShowForm(false);setForm(emptyForm);}}>Cancelar</Btn>
            <Btn onClick={guardar}><Ic n="check" size={15}/>{form.id?"Actualizar":"Crear"}</Btn>
          </div>
        </Modal>
      )}

      {/* Modal gestor de categorías */}
      {showCatMgr && (
        <Modal title="Gestionar categorías" onClose={()=>setShowCatMgr(false)} width={520}>
          <p style={{fontSize:12,color:"#555",marginBottom:16}}>Las categorías se usan en Transacciones, Presupuestos y Reportes. Los cambios se guardan automáticamente.</p>
          {["expense","income"].map(tipo=>(
            <div key={tipo} style={{marginBottom:24,paddingBottom:20,borderBottom:"1px solid rgba(255,255,255,.06)"}}>
              <p style={{fontSize:13,fontWeight:700,color:tipo==="income"?"#00d4aa":"#ff4757",marginBottom:12}}>
                {tipo==="income"?"💚 Categorías de Ingreso":"🔴 Categorías de Gasto"}
              </p>
              {/* chips existentes */}
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12,minHeight:32}}>
                {cats[tipo].map(cat=>(
                  <div key={cat} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:"4px 12px 4px 10px"}}>
                    <span style={{fontSize:12,color:"#ddd"}}>{cat}</span>
                    <button onClick={()=>eliminarCategoria(tipo,cat)} title="Eliminar"
                      style={{background:"rgba(255,71,87,.15)",border:"none",cursor:"pointer",color:"#ff4757",width:16,height:16,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0}}>
                      <Ic n="close" size={10}/>
                    </button>
                  </div>
                ))}
              </div>
              {/* input agregar */}
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input
                  value={newCat.tipo===tipo ? newCat.nombre : ""}
                  onChange={e=>setNewCat({tipo, nombre:e.target.value})}
                  onFocus={()=>setNewCat(p=>({...p,tipo}))}
                  onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); agregarCategoria(tipo); } }}
                  placeholder={`+ Nueva categoría de ${tipo==="income"?"ingreso":"gasto"}...`}
                  style={{
                    flex:1, padding:"9px 13px",
                    background:"rgba(255,255,255,.06)",
                    border:`1px solid ${newCat.tipo===tipo&&newCat.nombre?"rgba(0,212,170,.4)":"rgba(255,255,255,.1)"}`,
                    borderRadius:9, color:"#e0e0e0", fontSize:13, outline:"none",
                  }}
                />
                <button
                  onClick={()=>agregarCategoria(tipo)}
                  style={{
                    padding:"9px 16px", borderRadius:9, border:"none", cursor:"pointer",
                    background:"linear-gradient(135deg,#00d4aa,#00a884)",
                    color:"#fff", fontSize:12, fontWeight:700, whiteSpace:"nowrap",
                    display:"flex",alignItems:"center",gap:6,
                  }}>
                  <Ic n="plus" size={13}/>Agregar
                </button>
              </div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:4}}>
            <Btn onClick={()=>setShowCatMgr(false)}><Ic n="check" size={14}/>Listo</Btn>
          </div>
        </Modal>
      )}
      {confirmModal}
    </div>
  );
};


// ─── CONCILIACIÓN BANCARIA ────────────────────────────────────────────────────
const Conciliacion = () => {
  const { user, toast } = useCtx();
  const [accounts, setAccounts] = useData(user.id, "accounts");
  const [transactions, setTransactions] = useData(user.id, "transactions");
  const [transfers] = useData(user.id, "transfers");
  const [loans] = useData(user.id, "loans");
  const [askConfirm, confirmModal] = useConfirm();

  const [cuentaId, setCuentaId] = useState("");
  const [saldoReal, setSaldoReal] = useState("");
  const [conciliadas, setConciliadas] = useState({}); // txId → bool
  const [historial, setHistorial] = useState(
    () => JSON.parse(localStorage.getItem(`fp_conciliaciones_${user.id}`) || "[]")
  );

  const cuentasValidas = accounts.filter(a => a.type !== "credit");
  const cuenta = accounts.find(a => a.id === cuentaId) || null;
  const saldoApp = cuenta ? parseFloat(cuenta.balance || 0) : 0;
  const saldoRealNum = parseFloat(saldoReal) || 0;
  const diferencia = saldoRealNum - saldoApp;

  // Movimientos de la cuenta: txs + transferencias
  const txsCuenta = transactions
    .filter(t => t.accountId === cuentaId)
    .sort((a, b) => b.date > a.date ? 1 : -1);

  const transfersCuenta = (transfers || []).filter(t => t.fromId === cuentaId || t.toId === cuentaId)
    .map(t => {
      const esSalida = t.fromId === cuentaId;
      return {
        id: t.id,
        date: t.date,
        description: t.description || (esSalida ? `Transferencia → ${t.toName}` : `Transferencia ← ${t.fromName}`),
        delta: esSalida ? -parseFloat(t.amount || 0) : parseFloat(t.toAmount || t.amount || 0),
        tipo: "transfer",
      };
    });

  const todosMovimientos = [
    ...txsCuenta.map(t => ({
      id: t.id,
      date: t.date,
      description: t.description || t.category || "Sin descripción",
      delta: t.type === "income" ? parseFloat(t.amount || 0) : -parseFloat(t.amount || 0),
      category: t.category,
      tipo: "tx",
    })),
    ...transfersCuenta,
  ].sort((a, b) => b.date > a.date ? 1 : -1).slice(0, 60);

  // Saldo corriente hacia atrás desde saldo actual
  let runBal = saldoApp;
  const movConSaldo = todosMovimientos.map(m => {
    const bal = runBal;
    runBal -= m.delta;
    return { ...m, saldoTras: bal };
  });

  // Guardar conciliación
  const guardarConciliacion = async () => {
    if (!cuenta || !saldoReal) { toast("Selecciona cuenta e ingresa saldo real", "error"); return; }
    if (Math.abs(diferencia) < 0.01) {
      toast("¡Los saldos coinciden! No hay diferencia.", "success");
      return;
    }
    const ok = await askConfirm(
      `¿Registrar ajuste de ${diferencia > 0 ? "+" : ""}${fmt(diferencia)} en ${cuenta.name}?

Esto creará una transacción de ajuste y corregirá el saldo.`
    );
    if (!ok) return;

    // Crear transacción de ajuste
    const txAjuste = {
      id: genId(),
      date: today(),
      type: diferencia > 0 ? "income" : "expense",
      amount: Math.abs(diferencia),
      description: `Ajuste conciliación — ${cuenta.name}`,
      category: "Ajuste cuentas",
      accountId: cuentaId,
      currency: cuenta.currency || "MXN",
      notes: `Conciliación manual. Saldo app: ${fmt(saldoApp)} → Saldo banco: ${fmt(saldoRealNum)}`,
    };
    setTransactions(prev => [txAjuste, ...prev]);
    setAccounts(prev => prev.map(a =>
      a.id === cuentaId ? { ...a, balance: saldoRealNum } : a
    ));

    // Guardar en historial local
    const entrada = {
      id: genId(),
      fecha: today(),
      cuentaId,
      cuentaNombre: cuenta.name,
      saldoApp: saldoApp,
      saldoReal: saldoRealNum,
      diferencia,
      txAjusteId: txAjuste.id,
    };
    const nuevo = [entrada, ...historial].slice(0, 50);
    setHistorial(nuevo);
    localStorage.setItem(`fp_conciliaciones_${user.id}`, JSON.stringify(nuevo));
    setSaldoReal("");
    toast(`Ajuste de ${fmt(Math.abs(diferencia))} registrado en ${cuenta.name} ✓`, "success");
  };

  const eliminarHistorial = id => {
    const nuevo = historial.filter(h => h.id !== id);
    setHistorial(nuevo);
    localStorage.setItem(`fp_conciliaciones_${user.id}`, JSON.stringify(nuevo));
  };

  return (
    <div style={{ animation: "fadeUp .25s ease" }}>
      {confirmModal}
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f0f0f0", margin: "0 0 4px", fontFamily: "'Syne',sans-serif" }}>
          Conciliación Bancaria
        </h2>
        <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
          Compara el saldo de la app con tu estado de cuenta real y corrige diferencias
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Panel izquierdo: selección y comparación */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card style={{ padding: "16px" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0", margin: "0 0 14px" }}>
              1. Selecciona la cuenta a conciliar
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cuentasValidas.map(a => (
                <button key={a.id}
                  onClick={() => { setCuentaId(a.id); setSaldoReal(""); setConciliadas({}); }}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", borderRadius: 9, border: `1px solid ${cuentaId === a.id ? "rgba(0,212,170,.4)" : "rgba(255,255,255,.07)"}`,
                    background: cuentaId === a.id ? "rgba(0,212,170,.08)" : "rgba(255,255,255,.02)",
                    cursor: "pointer", transition: "all .15s",
                  }}>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#e0e0e0", margin: 0 }}>{a.name}</p>
                    <p style={{ fontSize: 10, color: "#555", margin: 0 }}>{a.bank || a.type} · {a.currency}</p>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#00d4aa", margin: 0 }}>
                    {fmt(a.balance, a.currency)}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {cuenta && (
            <Card style={{ padding: "16px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0", margin: "0 0 14px" }}>
                2. Ingresa el saldo real del banco
              </p>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: 14, fontWeight: 700 }}>$</span>
                <input
                  type="number"
                  value={saldoReal}
                  onChange={e => setSaldoReal(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: "100%", padding: "12px 12px 12px 28px",
                    background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 9, color: "#f0f0f0", fontSize: 18, fontWeight: 700,
                    outline: "none", boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderColor = "#00d4aa"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"}
                />
              </div>

              {/* Comparación */}
              {saldoReal !== "" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)" }}>
                      <p style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: .5, margin: "0 0 3px" }}>Saldo en app</p>
                      <p style={{ fontSize: 16, fontWeight: 800, color: "#888", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(saldoApp)}</p>
                    </div>
                    <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)" }}>
                      <p style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: .5, margin: "0 0 3px" }}>Saldo banco</p>
                      <p style={{ fontSize: 16, fontWeight: 800, color: "#f0f0f0", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(saldoRealNum)}</p>
                    </div>
                  </div>

                  {/* Diferencia */}
                  <div style={{
                    padding: "12px 14px", borderRadius: 10,
                    background: Math.abs(diferencia) < 0.01 ? "rgba(0,212,170,.08)" : diferencia > 0 ? "rgba(0,212,170,.06)" : "rgba(255,71,87,.06)",
                    border: `1px solid ${Math.abs(diferencia) < 0.01 ? "rgba(0,212,170,.3)" : diferencia > 0 ? "rgba(0,212,170,.2)" : "rgba(255,71,87,.2)"}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <p style={{ fontSize: 11, color: "#777", margin: "0 0 2px" }}>Diferencia</p>
                      <p style={{ fontSize: 10, color: "#555", margin: 0 }}>
                        {Math.abs(diferencia) < 0.01
                          ? "✓ Los saldos coinciden perfectamente"
                          : diferencia > 0
                            ? "El banco tiene más — falta registrar ingresos o sobran gastos"
                            : "La app tiene más — falta registrar gastos o sobran ingresos"}
                      </p>
                    </div>
                    <p style={{
                      fontSize: 20, fontWeight: 800, margin: 0, fontVariantNumeric: "tabular-nums",
                      color: Math.abs(diferencia) < 0.01 ? "#00d4aa" : diferencia > 0 ? "#00d4aa" : "#ff4757"
                    }}>
                      {diferencia > 0 ? "+" : ""}{fmt(diferencia)}
                    </p>
                  </div>

                  {Math.abs(diferencia) >= 0.01 && (
                    <button onClick={guardarConciliacion}
                      style={{
                        width: "100%", padding: "11px", borderRadius: 9, border: "none",
                        background: "linear-gradient(135deg,#00d4aa,#00a884)",
                        color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}>
                      <Ic n="conciliacion" size={16} color="#fff" />
                      Registrar ajuste y corregir saldo
                    </button>
                  )}
                  {Math.abs(diferencia) < 0.01 && (
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                      <span style={{ fontSize: 24 }}>✅</span>
                      <p style={{ fontSize: 13, color: "#00d4aa", fontWeight: 700, margin: "4px 0 0" }}>¡Cuenta conciliada!</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Panel derecho: movimientos de la cuenta */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cuenta ? (
            <Card style={{ padding: 0, overflow: "hidden", flex: 1 }}>
              <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0", margin: "0 0 2px" }}>
                  Estado de cuenta — {cuenta.name}
                </p>
                <p style={{ fontSize: 10, color: "#555", margin: 0 }}>
                  Últimos {movConSaldo.length} movimientos · Saldo actual en app: {fmt(saldoApp)}
                </p>
              </div>
              <div style={{ maxHeight: 520, overflowY: "auto" }}>
                {movConSaldo.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "#444", fontSize: 13 }}>
                    Sin movimientos registrados en esta cuenta
                  </div>
                ) : movConSaldo.map((m, i) => (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "9px 16px",
                    borderBottom: "1px solid rgba(255,255,255,.03)",
                    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.01)",
                  }}>
                    {/* Ícono tipo */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      background: m.tipo === "transfer" ? "rgba(59,130,246,.12)" : m.delta >= 0 ? "rgba(0,212,170,.1)" : "rgba(255,71,87,.1)",
                    }}>
                      <Ic n={m.tipo === "transfer" ? "transfers" : m.delta >= 0 ? "plus" : "minus"}
                        size={13} color={m.tipo === "transfer" ? "#3b82f6" : m.delta >= 0 ? "#00d4aa" : "#ff4757"} />
                    </div>
                    {/* Descripción */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#ddd", margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.description}
                      </p>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "#444" }}>{fmtDate(m.date)}</span>
                        {m.category && <Badge label={m.category} color={m.delta >= 0 ? "#00d4aa" : "#ff4757"} />}
                      </div>
                    </div>
                    {/* Monto + saldo tras */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: m.delta >= 0 ? "#00d4aa" : "#ff4757", margin: "0 0 1px", fontVariantNumeric: "tabular-nums" }}>
                        {m.delta >= 0 ? "+" : ""}{fmt(Math.abs(m.delta))}
                      </p>
                      <p style={{ fontSize: 10, color: "#444", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                        {fmt(m.saldoTras)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card style={{ padding: 40, textAlign: "center" }}>
              <p style={{ fontSize: 32, margin: "0 0 10px" }}>🏦</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#e0e0e0", margin: "0 0 6px" }}>Selecciona una cuenta</p>
              <p style={{ fontSize: 12, color: "#555", margin: 0, lineHeight: 1.6, maxWidth: 260, marginLeft: "auto", marginRight: "auto" }}>
                Elige una cuenta de la izquierda para ver su estado de cuenta e ingresar el saldo real del banco
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Historial de conciliaciones */}
      {historial.length > 0 && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0", margin: 0 }}>Historial de conciliaciones</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,.02)" }}>
                  {["Fecha", "Cuenta", "Saldo app", "Saldo banco", "Diferencia", ""].map(h => (
                    <th key={h} style={{ padding: "8px 16px", textAlign: h === "" ? "center" : "left", fontSize: 9, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: .4, borderBottom: "1px solid rgba(255,255,255,.05)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map((h, i) => (
                  <tr key={h.id} style={{ borderBottom: "1px solid rgba(255,255,255,.03)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.01)" }}>
                    <td style={{ padding: "8px 16px", color: "#888" }}>{fmtDate(h.fecha)}</td>
                    <td style={{ padding: "8px 16px", color: "#ccc", fontWeight: 600 }}>{h.cuentaNombre}</td>
                    <td style={{ padding: "8px 16px", color: "#888", fontVariantNumeric: "tabular-nums" }}>{fmt(h.saldoApp)}</td>
                    <td style={{ padding: "8px 16px", color: "#f0f0f0", fontVariantNumeric: "tabular-nums" }}>{fmt(h.saldoReal)}</td>
                    <td style={{ padding: "8px 16px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: Math.abs(h.diferencia) < 0.01 ? "#00d4aa" : h.diferencia > 0 ? "#00d4aa" : "#ff4757" }}>
                      {h.diferencia > 0 ? "+" : ""}{fmt(h.diferencia)}
                    </td>
                    <td style={{ padding: "8px 16px", textAlign: "center" }}>
                      <button onClick={() => eliminarHistorial(h.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#444", fontSize: 12, padding: "2px 6px", borderRadius: 4 }}
                        onMouseEnter={e => e.currentTarget.style.color = "#ff4757"}
                        onMouseLeave={e => e.currentTarget.style.color = "#444"}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─── IMPORTAR CSV ─────────────────────────────────────────────────────────────
const ImportarCSV = () => {
  const { user, toast } = useCtx();
  const [accounts]     = useData(user.id, "accounts");
  const [transactions, setTransactions] = useData(user.id, "transactions");
  const [step, setStep]         = useState("upload"); // upload | preview | done
  const [banco, setBanco]       = useState(null);
  const [rawRows, setRawRows]   = useState([]);
  const [preview, setPreview]   = useState([]);
  const [cuentaId, setCuentaId] = useState("");
  const [selected, setSelected] = useState({});
  const [iaLoading, setIaLoading] = useState(false);
  const [csvRawTexto, setCsvRawTexto] = useState("");
  const fileRef = useRef(null);
  const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY;

  // ══════════════════════════════════════════════════
  // PARSERS POR BANCO
  // Los formatos reales de cada banco mexicano
  // ══════════════════════════════════════════════════
  const BANCOS = {
    santander: {
      nombre:"Santander", color:"#e31837",
      detectar: (headers) => headers.some(h=>/santander|referencia\s*de\s*pago/i.test(h)),
      parsear: (rows, headers) => {
        // Santander: Fecha | Descripción | Referencia | Cargo | Abono | Saldo
        const hi = k => headers.findIndex(h=>new RegExp(k,"i").test(h));
        const iFecha  = hi("fecha");
        const iDesc   = hi("descripci|concepto|movimiento");
        const iCargo  = hi("cargo|retiro|débito");
        const iAbono  = hi("abono|depósito|crédito");
        return rows.map(r=>({
          fecha:   normalizarFecha(r[iFecha]||""),
          desc:    (r[iDesc]||"").trim(),
          cargo:   parseFloat((r[iCargo]||"0").replace(/[,$]/g,"")||0),
          abono:   parseFloat((r[iAbono]||"0").replace(/[,$]/g,"")||0),
        }));
      }
    },
    bbva: {
      nombre:"BBVA", color:"#004481",
      detectar: (headers) => headers.some(h=>/bbva|bancomer|opera/i.test(h)) ||
        (headers.some(h=>/fecha/i.test(h)) && headers.some(h=>/concepto/i.test(h)) && headers.some(h=>/cargo/i.test(h))),
      parsear: (rows, headers) => {
        // BBVA: Fecha Operación | Fecha Valor | Concepto | Movimiento | Importe | Divisa | Disponible
        const hi = k => headers.findIndex(h=>new RegExp(k,"i").test(h));
        const iFecha = hi("fecha.?oper|^fecha$");
        const iDesc  = hi("concepto|descripci");
        const iMov   = hi("movimiento|referencia");
        const iImp   = hi("importe|monto|cargo");
        const iAbono = hi("abono|crédito|depósito");
        return rows.map(r=>{
          const importe = parseFloat((r[iImp]||"0").replace(/[,$]/g,"")||0);
          const abono   = iAbono>=0 ? parseFloat((r[iAbono]||"0").replace(/[,$]/g,"")||0) : 0;
          return {
            fecha: normalizarFecha(r[iFecha]||""),
            desc:  ((r[iDesc]||"")+" "+(r[iMov]||"")).trim(),
            cargo: importe>0&&abono===0 ? importe : 0,
            abono: abono>0 ? abono : (importe<0?Math.abs(importe):0),
          };
        });
      }
    },
    banamex: {
      nombre:"Banamex / Citi", color:"#003087",
      detectar: (headers) => headers.some(h=>/banamex|citibank|folio/i.test(h)),
      parsear: (rows, headers) => {
        // Banamex: Fecha | Descripción | Folio | Cargo | Abono | Saldo
        const hi = k => headers.findIndex(h=>new RegExp(k,"i").test(h));
        const iFecha = hi("fecha");
        const iDesc  = hi("descripci|concepto");
        const iCargo = hi("cargo|débito");
        const iAbono = hi("abono|crédito");
        return rows.map(r=>({
          fecha: normalizarFecha(r[iFecha]||""),
          desc:  (r[iDesc]||"").trim(),
          cargo: parseFloat((r[iCargo]||"0").replace(/[,$]/g,"")||0),
          abono: parseFloat((r[iAbono]||"0").replace(/[,$]/g,"")||0),
        }));
      }
    },
    banorte: {
      nombre:"Banorte", color:"#e2001a",
      detectar: (headers) => headers.some(h=>/banorte|sucursal/i.test(h)),
      parsear: (rows, headers) => {
        // Banorte: Fecha | Descripción | Sucursal | Referencia | Retiro | Depósito | Saldo
        const hi = k => headers.findIndex(h=>new RegExp(k,"i").test(h));
        const iFecha = hi("fecha");
        const iDesc  = hi("descripci|concepto|movimiento");
        const iCargo = hi("retiro|cargo|débito");
        const iAbono = hi("depósito|abono|crédito");
        return rows.map(r=>({
          fecha: normalizarFecha(r[iFecha]||""),
          desc:  (r[iDesc]||"").trim(),
          cargo: parseFloat((r[iCargo]||"0").replace(/[,$]/g,"")||0),
          abono: parseFloat((r[iAbono]||"0").replace(/[,$]/g,"")||0),
        }));
      }
    },
    generico: {
      nombre:"Genérico / Otro", color:"#555",
      detectar: () => true, // fallback
      parsear: (rows, headers) => {
        // intenta detectar columnas por nombre común
        const hi = k => headers.findIndex(h=>new RegExp(k,"i").test(h));
        const iFecha = hi("fecha|date");
        const iDesc  = hi("descripci|concepto|detail|memo|movimiento");
        const iCargo = hi("cargo|retiro|débito|debit|salida");
        const iAbono = hi("abono|depósito|crédito|credit|entrada");
        const iMonto = hi("^monto$|^importe$|^amount$");
        return rows.map(r=>{
          let cargo=0, abono=0;
          if (iCargo>=0 || iAbono>=0) {
            cargo = parseFloat((r[iCargo]||"0").replace(/[,$]/g,"")||0);
            abono = parseFloat((r[iAbono]||"0").replace(/[,$]/g,"")||0);
          } else if (iMonto>=0) {
            const m = parseFloat((r[iMonto]||"0").replace(/[,$]/g,"")||0);
            if (m<0) cargo=Math.abs(m); else abono=m;
          }
          return {
            fecha: normalizarFecha(r[iFecha]||""),
            desc:  (r[iDesc]||r[1]||"").trim(),
            cargo, abono,
          };
        });
      }
    },
  };

  // ── normalizar fechas de múltiples formatos mexicanos
  const normalizarFecha = (raw) => {
    if (!raw) return today();
    const s = raw.trim().replace(/\//g,"-");
    // DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
      const [d,m,y] = s.split("-");
      return `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
    }
    // YYYY-MM-DD ya está bien
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // DD/MM/YY
    if (/^\d{2}-\d{2}-\d{2}$/.test(s)) {
      const [d,m,y] = s.split("-");
      return `20${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
    }
    // intento genérico
    try { return new Date(raw).toISOString().split("T")[0]; } catch { return today(); }
  };

  // ── parsear CSV texto → array de arrays
  const parsearCSVTexto = (texto) => {
    const lineas = texto.split(/\r?\n/).filter(l=>l.trim());
    const separador = lineas[0].includes(";") ? ";" : ",";
    return lineas.map(l => {
      const cols = [];
      let cur="", inQ=false;
      for (const c of l) {
        if (c==='"') { inQ=!inQ; }
        else if (c===separador&&!inQ) { cols.push(cur.trim()); cur=""; }
        else cur+=c;
      }
      cols.push(cur.trim());
      return cols;
    });
  };

  // ── detectar banco por headers
  const detectarBanco = (headers) => {
    const hNorm = headers.map(h=>(h||"").toLowerCase());
    for (const [key, b] of Object.entries(BANCOS)) {
      if (key==="generico") continue;
      if (b.detectar(hNorm)) return key;
    }
    return "generico";
  };

  // ── verificar duplicados
  const esDuplicado = (row) => transactions.some(t =>
    t.date===row.fecha &&
    Math.abs(parseFloat(t.amount||0) - (row.abono>0?row.abono:row.cargo)) < 0.01 &&
    t.description?.toLowerCase()===row.desc?.toLowerCase()
  );

  // ── manejar archivo subido
  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      toast("Solo se aceptan archivos .csv o .txt","error"); return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const texto = e.target.result;
        setCsvRawTexto(texto); // guardar para análisis IA si es necesario
        const allRows = parsearCSVTexto(texto);
        if (allRows.length < 2) { toast("El archivo parece estar vacío","error"); return; }

        // buscar fila de headers (ignora filas vacías o de metadatos al inicio)
        let headerIdx = 0;
        for (let i=0;i<Math.min(allRows.length,10);i++) {
          if (allRows[i].some(c=>/fecha|date|descripci|concepto|cargo|abono|importe/i.test(c))) {
            headerIdx = i; break;
          }
        }
        const headers = allRows[headerIdx].map(h=>(h||"").toLowerCase().trim());
        const dataRows = allRows.slice(headerIdx+1).filter(r=>r.some(c=>c.trim()));

        const bancoKey = detectarBanco(headers);
        setBanco(bancoKey);

        const parsed = BANCOS[bancoKey].parsear(dataRows, headers)
          .filter(r=>r.fecha && (r.cargo>0||r.abono>0));

        setRawRows(parsed);

        // construir preview
        const prev = parsed.map((r,i)=>({
          _id: genId(),
          _idx: i,
          _dup: esDuplicado(r),
          fecha:  r.fecha,
          desc:   r.desc||"Sin descripción",
          tipo:   r.abono>0?"income":"expense",
          monto:  r.abono>0?r.abono:r.cargo,
          categoria: "",
        }));

        setPreview(prev);
        // seleccionar todos los no duplicados por default
        const sel = {};
        prev.forEach(r=>{ if(!r._dup) sel[r._id]=true; });
        setSelected(sel);
        setStep("preview");
      } catch(err) {
        console.error(err);
        toast("Error al leer el archivo. Verifica el formato.","error");
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  // ── Analizar CSV desconocido con IA
  const analizarConIA = async () => {
    if (!ANTHROPIC_KEY) { toast("Falta VITE_ANTHROPIC_KEY","error"); return; }
    if (!csvRawTexto) { toast("No hay archivo cargado","error"); return; }
    setIaLoading(true);
    try {
      // Tomar solo las primeras 30 filas para no exceder tokens
      const lineas = csvRawTexto.split(/\r?\n/).filter(l=>l.trim()).slice(0,30).join("\n");
      const prompt = `Analiza este archivo CSV de un estado de cuenta bancario mexicano y extrae los movimientos financieros.
Responde SOLO con un JSON válido, sin texto adicional, sin backticks, con este formato exacto:
{
  "banco": "nombre del banco detectado o Desconocido",
  "movimientos": [
    {"fecha":"YYYY-MM-DD","descripcion":"texto","tipo":"income|expense","monto":0.00}
  ]
}
Reglas:
- tipo "income" = abono/depósito/crédito (dinero que entra)
- tipo "expense" = cargo/débito/retiro (dinero que sale)
- monto siempre positivo
- fecha en formato YYYY-MM-DD
- omite filas de saldo, totales o encabezados
CSV:
${lineas}`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4096,messages:[{role:"user",content:prompt}]})
      });
      const data = await res.json();
      const texto = data.content?.[0]?.text||"";
      // limpiar posibles backticks
      const limpio = texto.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(limpio);

      if (!parsed.movimientos?.length) { toast("La IA no detectó movimientos en este archivo","error"); setIaLoading(false); return; }

      // Si el CSV tiene más de 30 filas, procesar el resto también
      const todasLineas = csvRawTexto.split(/\r?\n/).filter(l=>l.trim());
      let todosMovimientos = [...parsed.movimientos];

      if (todasLineas.length > 31) {
        // procesar en bloques de 50 filas
        const headers = todasLineas[0];
        for (let i=30; i<todasLineas.length; i+=50) {
          const bloque = [headers,...todasLineas.slice(i,i+50)].join("\n");
          const res2 = await fetch("https://api.anthropic.com/v1/messages", {
            method:"POST",
            headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
            body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4096,messages:[{role:"user",content:`Extrae movimientos de este fragmento CSV. Responde SOLO JSON: {"movimientos":[{"fecha":"YYYY-MM-DD","descripcion":"texto","tipo":"income|expense","monto":0.00}]}
CSV:
${bloque}`}]})
          });
          const data2 = await res2.json();
          const t2 = (data2.content?.[0]?.text||"").replace(/```json|```/g,"").trim();
          try { const p2=JSON.parse(t2); todosMovimientos=[...todosMovimientos,...(p2.movimientos||[])]; } catch{}
        }
      }

      setBanco(parsed.banco||"ia");
      const prev = todosMovimientos
        .filter(m=>m.fecha&&m.monto>0)
        .map((m,i)=>({
          _id:genId(), _idx:i,
          _dup: transactions.some(t=>t.date===m.fecha&&Math.abs(parseFloat(t.amount||0)-m.monto)<0.01&&t.description?.toLowerCase()===m.descripcion?.toLowerCase()),
          fecha:m.fecha, desc:m.descripcion||"Sin descripción",
          tipo:m.tipo==="income"?"income":"expense",
          monto:parseFloat(m.monto||0), categoria:"",
        }));

      setPreview(prev);
      const sel={};
      prev.forEach(r=>{ if(!r._dup) sel[r._id]=true; });
      setSelected(sel);
      setStep("preview");
      toast(`IA detectó ${prev.length} movimientos de ${parsed.banco||"banco desconocido"} ✓`,"success");
    } catch(e) {
      console.error(e);
      toast("Error al analizar con IA. Verifica tu API key.","error");
    }
    setIaLoading(false);
  };

  const confirmarImportacion = () => {
    if (!cuentaId) { toast("Selecciona una cuenta destino","error"); return; }
    const toImport = preview.filter(r=>selected[r._id]);
    if (!toImport.length) { toast("No hay transacciones seleccionadas","error"); return; }

    const newTxs = toImport.map(r=>({
      id: genId(),
      date: r.fecha,
      type: r.tipo,
      description: r.desc,
      amount: r.monto,
      category: r.categoria||"",
      accountId: cuentaId,
      currency: "MXN",
      origen: "importacion",
      banco: banco,
      notes: "",
    }));

    setTransactions(p=>[...newTxs,...p]);
    toast(`${newTxs.length} transacciones importadas ✓`,"success");
    setStep("done");
  };

  const reiniciar = () => {
    setStep("upload"); setBanco(null); setRawRows([]); setPreview([]); setCuentaId(""); setSelected({});
  };

  const selAll   = () => { const s={}; preview.forEach(r=>{ if(!r._dup) s[r._id]=true; }); setSelected(s); };
  const deselAll = () => setSelected({});
  const toggleRow = id => setSelected(p=>({...p,[id]:!p[id]}));

  const selCount  = Object.values(selected).filter(Boolean).length;
  const dupCount  = preview.filter(r=>r._dup).length;
  const nuevoCount= preview.filter(r=>!r._dup).length;

  return (
    <div style={{animation:"fadeUp .25s ease"}}>
      <div style={{marginBottom:20}}>
        <h2 style={{fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:"0 0 3px"}}>Importar CSV</h2>
        <p style={{fontSize:13,color:"#555",margin:0}}>Importa movimientos bancarios desde archivos CSV · Santander · BBVA · Banamex · Banorte · <span style={{color:"#a78bfa"}}>cualquier banco con IA ✨</span></p>
      </div>

      {/* ── PASO 1: UPLOAD */}
      {step==="upload" && (
        <div style={{maxWidth:560}}>
          <Card>
            <p style={{fontSize:13,fontWeight:700,color:"#ccc",marginBottom:4}}>¿Cómo exportar tu CSV?</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
              {[
                {banco:"Santander",  color:"#e31837", instruccion:"Banca en línea → Consultas → Movimientos → Exportar → CSV"},
                {banco:"BBVA",       color:"#004481", instruccion:"Banca en línea → Cuentas → Movimientos → Descargar → Excel/CSV"},
                {banco:"Banamex",    color:"#003087", instruccion:"Citibanamex en línea → Mis cuentas → Consulta → Exportar CSV"},
                {banco:"Banorte",    color:"#e2001a", instruccion:"Banorte en línea → Cuentas → Movimientos → Descargar CSV"},
              ].map(b=>(
                <div key={b.banco} style={{padding:"10px 12px",background:"rgba(255,255,255,.03)",borderRadius:9,border:`1px solid ${b.color}22`}}>
                  <p style={{fontSize:12,fontWeight:700,color:b.color,margin:"0 0 4px"}}>{b.banco}</p>
                  <p style={{fontSize:10,color:"#555",margin:0,lineHeight:1.4}}>{b.instruccion}</p>
                </div>
              ))}
            </div>

            {/* drop zone */}
            <div
              onClick={()=>fileRef.current?.click()}
              onDragOver={e=>{ e.preventDefault(); e.currentTarget.style.borderColor="#00d4aa"; e.currentTarget.style.background="rgba(0,212,170,.05)"; }}
              onDragLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,.1)"; e.currentTarget.style.background="transparent"; }}
              onDrop={e=>{ e.preventDefault(); e.currentTarget.style.borderColor="rgba(255,255,255,.1)"; e.currentTarget.style.background="transparent"; handleFile(e.dataTransfer.files[0]); }}
              style={{border:"2px dashed rgba(255,255,255,.1)",borderRadius:12,padding:"36px 20px",textAlign:"center",cursor:"pointer",transition:"all .2s"}}>
              <Ic n="importar" size={36} color="#444"/>
              <p style={{fontSize:14,color:"#777",margin:"12px 0 4px",fontWeight:600}}>Arrastra tu archivo CSV aquí</p>
              <p style={{fontSize:12,color:"#444",margin:"0 0 12px"}}>o haz click para seleccionar</p>
              <span style={{fontSize:11,color:"#333",background:"rgba(255,255,255,.04)",padding:"3px 10px",borderRadius:5}}>Acepta .csv y .txt</span>
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={e=>handleFile(e.target.files[0])} style={{display:"none"}}/>
            </div>
            {/* Botón IA para banco no reconocido */}
            {csvRawTexto && banco==="generico" && (
              <div style={{marginTop:14,padding:"12px 14px",borderRadius:10,background:"rgba(124,58,237,.08)",border:"1px solid rgba(124,58,237,.25)"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:12,fontWeight:700,color:"#a78bfa",margin:"0 0 2px"}}>⚠️ Formato no reconocido automáticamente</p>
                    <p style={{fontSize:11,color:"#666",margin:0}}>Puedes usar IA para analizar cualquier formato de estado de cuenta</p>
                  </div>
                  <button onClick={analizarConIA} disabled={iaLoading}
                    style={{padding:"8px 16px",borderRadius:9,background:iaLoading?"rgba(124,58,237,.2)":"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",color:"#fff",fontSize:12,fontWeight:700,cursor:iaLoading?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    {iaLoading ? <><span style={{animation:"pulse 1s infinite"}}>⏳</span> Analizando...</> : <><Ic n="asistente" size={13} color="#fff"/>Analizar con IA</>}
                  </button>
                </div>
              </div>
            )}
            {/* Botón IA siempre disponible como alternativa */}
            {csvRawTexto && banco!=="generico" && (
              <div style={{marginTop:10,display:"flex",justifyContent:"flex-end"}}>
                <button onClick={analizarConIA} disabled={iaLoading}
                  style={{padding:"6px 12px",borderRadius:8,background:"transparent",border:"1px solid rgba(124,58,237,.3)",color:"#a78bfa",fontSize:11,cursor:iaLoading?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:5}}>
                  {iaLoading?"Analizando...":<><Ic n="asistente" size={12} color="#a78bfa"/>Re-analizar con IA</>}
                </button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── PASO 2: PREVIEW */}
      {step==="preview" && (
        <div>
          {/* info del archivo */}
          <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <Card style={{padding:"10px 16px",display:"inline-flex",alignItems:"center",gap:10,flexShrink:0}}>
              {banco==="ia" ? (
                <Ic n="asistente" size={14} color="#a78bfa"/>
              ) : (
                <div style={{width:8,height:8,borderRadius:"50%",background:BANCOS[banco||"generico"]?.color||"#555"}}/>
              )}
              <span style={{fontSize:13,fontWeight:700,color:banco==="ia"?"#a78bfa":"#ccc"}}>
                {banco==="ia" ? "Analizado con IA ✨" : (BANCOS[banco||"generico"]?.nombre||banco)}
              </span>
              <span style={{fontSize:11,color:"#555"}}>{preview.length} movimientos detectados</span>
            </Card>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <Badge label={`${nuevoCount} nuevos`} color="#00d4aa"/>
              {dupCount>0&&<Badge label={`${dupCount} posibles duplicados`} color="#f39c12"/>}
              <Badge label={`${selCount} seleccionados`} color="#3b82f6"/>
            </div>
          </div>

          {/* cuenta destino */}
          <Card style={{marginBottom:14}}>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"flex-end"}}>
              <div style={{flex:1,minWidth:200}}>
                <Sel label="Cuenta destino *" value={cuentaId} onChange={e=>setCuentaId(e.target.value)}
                  options={[{value:"",label:"— Selecciona una cuenta —"},...accounts.filter(a=>a.currency==="MXN").map(a=>({value:a.id,label:`${a.name} — ${fmt(a.balance)}`}))]}/>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:14}}>
                <Btn variant="secondary" onClick={selAll}>Seleccionar nuevos</Btn>
                <Btn variant="secondary" onClick={deselAll}>Deseleccionar todo</Btn>
              </div>
            </div>
          </Card>

          {/* tabla preview */}
          <Card style={{padding:0,overflow:"hidden"}}>
            <div style={{overflowX:"auto",maxHeight:"55vh",overflowY:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead style={{position:"sticky",top:0,background:"#141b2d",zIndex:2}}>
                  <tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                    <th style={{padding:"9px 12px",textAlign:"center",color:"#555",fontWeight:600,width:36}}>
                      <input type="checkbox"
                        checked={selCount===nuevoCount&&nuevoCount>0}
                        onChange={e=>e.target.checked?selAll():deselAll()}
                        style={{accentColor:"#00d4aa"}}/>
                    </th>
                    {["Fecha","Descripción","Tipo","Monto","Categoría","Estado"].map(h=>(
                      <th key={h} style={{padding:"9px 12px",textAlign:"left",color:"#555",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row)=>{
                    const isDup = row._dup;
                    const isSel = !!selected[row._id];
                    return (
                      <tr key={row._id} style={{
                        borderBottom:"1px solid rgba(255,255,255,.03)",
                        opacity: isDup&&!isSel ? .4 : 1,
                        background: isSel?"rgba(0,212,170,.04)":"transparent",
                      }}>
                        <td style={{padding:"7px 12px",textAlign:"center"}}>
                          <input type="checkbox" checked={isSel} onChange={()=>toggleRow(row._id)} style={{accentColor:"#00d4aa"}}/>
                        </td>
                        <td style={{padding:"7px 12px",color:"#888",whiteSpace:"nowrap"}}>{row.fecha}</td>
                        <td style={{padding:"7px 12px",color:"#ccc",maxWidth:260}}>
                          <p style={{margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.desc}</p>
                        </td>
                        <td style={{padding:"7px 12px"}}>
                          <Badge label={row.tipo==="income"?"Ingreso":"Gasto"} color={row.tipo==="income"?"#00d4aa":"#ff4757"}/>
                        </td>
                        <td style={{padding:"7px 12px",color:row.tipo==="income"?"#00d4aa":"#ff4757",fontWeight:600,whiteSpace:"nowrap"}}>
                          {row.tipo==="income"?"+":"-"}{fmt(row.monto)}
                        </td>
                        <td style={{padding:"7px 12px",minWidth:140}}>
                          <select value={row.categoria} onChange={e=>setPreview(p=>p.map(r=>r._id===row._id?{...r,categoria:e.target.value}:r))}
                            style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:6,color:"#ccc",fontSize:11,padding:"3px 6px",width:"100%",outline:"none"}}>
                            <option value="">Sin categoría</option>
                            {(cats[row.tipo]||[]).map(c=><option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                        <td style={{padding:"7px 12px",whiteSpace:"nowrap"}}>
                          {isDup
                            ? <Badge label="Posible duplicado" color="#f39c12"/>
                            : <Badge label="Nuevo" color="#00d4aa"/>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* botones */}
          <div style={{display:"flex",gap:10,marginTop:14,justifyContent:"space-between",flexWrap:"wrap"}}>
            <Btn variant="secondary" onClick={reiniciar}><Ic n="close" size={14}/>Cancelar</Btn>
            <Btn onClick={confirmarImportacion} disabled={!cuentaId||selCount===0}
              style={{background:"linear-gradient(135deg,#00d4aa,#00a884)"}}>
              <Ic n="check" size={15}/>Importar {selCount} transacciones
            </Btn>
          </div>
        </div>
      )}

      {/* ── PASO 3: DONE */}
      {step==="done" && (
        <div style={{maxWidth:480,margin:"0 auto",textAlign:"center",paddingTop:40}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(0,212,170,.12)",border:"2px solid #00d4aa",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
            <Ic n="check" size={36} color="#00d4aa"/>
          </div>
          <h3 style={{fontSize:20,fontWeight:800,color:"#f0f0f0",margin:"0 0 8px"}}>¡Importación completada!</h3>
          <p style={{fontSize:13,color:"#555",marginBottom:24}}>Las transacciones ya están disponibles en el módulo de Transacciones.</p>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <Btn variant="secondary" onClick={reiniciar}><Ic n="importar" size={14}/>Importar otro archivo</Btn>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ASISTENTE IA ─────────────────────────────────────────────────────────────
const Asistente = () => {
  const { user, toast } = useCtx();
  const t = useTheme();

  const [accounts]                    = useData(user.id, "accounts");
  const [transactions, setTransactions] = useData(user.id, "transactions");
  const [loans]                       = useData(user.id, "loans");
  const [investments]                 = useData(user.id, "investments");
  const [goals]                       = useData(user.id, "goals");
  const [mortgages]                   = useData(user.id, "mortgages");
  const [presupuestos]                = useData(user.id, "presupuestos");
  const [recurring]                   = useData(user.id, "recurring");
  const [config]                      = useData(user.id, "config", {});

  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [adjunto, setAdjunto]   = useState(null); // { name, type, base64, mediaType }
  const [pendingTx, setPendingTx] = useState(null); // transacción detectada pendiente de confirmar
  const bottomRef  = useRef(null);
  const fileRef    = useRef(null);
  const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  // ── Categorías disponibles
  const DEFAULT_CATS = {
    income:["Salario","Freelance","Negocio","Renta","Intereses","Dividendos","Otro"],
    expense:["Alimentación","Transporte","Salud","Educación","Entretenimiento","Ropa","Servicios","Hipoteca / Vivienda","Pago de deuda","Pérdida de inversión","Abono a capital","Otro"],
  };
  const cats = {
    income:[...new Set([...DEFAULT_CATS.income, ...(config.categorias?.income||[]), ...transactions.filter(t=>t.type==="income"&&t.category).map(t=>t.category)])],
    expense:[...new Set([...DEFAULT_CATS.expense, ...(config.categorias?.expense||[]), ...transactions.filter(t=>t.type==="expense"&&t.category).map(t=>t.category)])],
  };

  // ── Contexto financiero para el sistema prompt
  const buildContext = () => {
    const now    = new Date();
    const mesKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const TC     = getTc(user.id);
    const liquidez      = accounts.filter(a=>a.type!=="credit").reduce((s,a)=>s+(a.currency==="USD"?parseFloat(a.balance||0)*TC:parseFloat(a.balance||0)),0);
    const deudaTarjetas = accounts.filter(a=>a.type==="credit").reduce((s,a)=>s+Math.abs(Math.min(parseFloat(a.balance||0),0)),0);
    const invTotal      = investments.reduce((s,i)=>{ const ti=parseFloat(i.titulos)||0,p=parseFloat(i.precioActual)||0,ap=(i.aportaciones||[]).reduce((ss,a)=>ss+parseFloat(a.amount||0),0),val=ti>0&&p>0?ti*p:parseFloat(i.currentValue)||ap; return s+(i.currency==="USD"?val*TC:val); },0);
    const txMes   = transactions.filter(tx=>tx.date?.startsWith(mesKey));
    const ingrMes = txMes.filter(tx=>tx.type==="income").reduce((s,tx)=>s+parseFloat(tx.amount||0),0);
    const gastMes = txMes.filter(tx=>tx.type==="expense").reduce((s,tx)=>s+parseFloat(tx.amount||0),0);
    const hoyAsistente = today();
    // Calcular strings fuera del template literal para evitar errores de compilación
    const ctxCuentas = accounts.map(a=>`- [${a.id}] ${a.name} [${a.type}] ${a.currency}: ${fmt(parseFloat(a.balance||0),a.currency)}`).join("\n") || "Sin cuentas";
    const ctxCuentasIds = accounts.map(a=>`ID:${a.id} | ${a.name} | ${a.currency}`).join("\n") || "Sin cuentas";
    const ctxPrestamos = loans.map(l=>{
      const dr=(parseFloat(l.rate)||0)/100/(l.rateType==="annual"?365:30);
      let bal=parseFloat(l.principal||0), last=new Date(l.startDate+"T12:00:00");
      for(const p of [...(l.payments||[])].sort((a,b)=>new Date(a.date)-new Date(b.date))){
        const days=Math.max(0,Math.floor((new Date(p.date+"T12:00:00")-last)/86400000));
        bal=Math.max(0,bal-(p.amount-Math.min(p.amount,bal*dr*days))); last=new Date(p.date+"T12:00:00");
      }
      const dNow=Math.max(0,Math.floor((new Date()-last)/86400000));
      const intAcum=bal*dr*dNow;
      const intDiario=bal*dr;
      const tramos=(l.tramos||[]).map(t=>t.rate+"% desde "+t.desde).join(", ");
      return `- [${l.id}] ${l.name} [${l.type==="received"?"DEBO":"ME DEBEN"}]: capital ${fmt(bal,l.currency)} + interés acum hoy ${fmt(intAcum,l.currency)} (${fmt(intDiario,l.currency)}/día) @ ${l.rate}% ${l.rateType==="annual"?"anual":"mensual"}${tramos?" | tramos: "+tramos:""}`;
    }).join("\n") || "Sin préstamos";
    const ctxInversiones = investments.filter(i=>i.estado!=="liquidada").map(i=>{
      const ap=(i.aportaciones||[]).reduce((s,a)=>s+parseFloat(a.amount||0),0);
      const tasa=parseFloat(i.tasaAnual)||0;
      let val=parseFloat(i.currentValue)||0;
      if(!val&&tasa>0&&ap>0){const dias=Math.max(0,Math.floor((new Date()-new Date((i.startDate||hoyAsistente)+"T12:00:00"))/86400000));val=ap+(ap*tasa/100/365*dias);}
      else if(!val) val=ap;
      const valMXN=i.currency==="USD"?val*TC:val;
      return `- [${i.id}] ${i.name}: capital ${fmt(ap,i.currency)} → valor proyectado ${fmt(valMXN)} MXN${tasa?" @ "+tasa+"% anual":""}`;
    }).join("\n") || "Sin inversiones activas";
    const ctxHipotecas = (mortgages||[]).map(m=>{
      const P=parseFloat(m.monto)||0,n=(parseFloat(m.plazoAnios)||0)*12,r=(parseFloat(m.tasaAnual)||0)/100/12;
      const cuota=P&&n&&r?(m.tipo==="fijo"?(P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1):P/n):0;
      const pagados=(m.pagosRealizados||[]).length;
      const proxInfo=pagados===0&&m.fechaAcreditacion?"| Primer pago: día "+m.diaCorte+" del mes siguiente al de acreditación":"";
      return `- [${m.id}] ${m.nombre||m.banco}: $${P.toLocaleString()} @ ${m.tasaAnual}% anual, ${m.plazoAnios} años, cuota ~${fmt(cuota)}/mes, ${pagados} pagos ${proxInfo}`;
    }).join("\n") || "Sin hipoteca";
    const ctxMetas = goals.map(g=>`- ${g.name||g.nombre} | ${fmt(parseFloat(g.current||g.saved||0))} / ${fmt(parseFloat(g.target||0))}`).join("\n") || "Sin metas";
    const ctxPresupuestos = presupuestos.filter(p=>p.activo!==false).map(p=>`- ${p.nombre} | Límite: ${fmt(parseFloat(p.montoLimite||0))}`).join("\n") || "Sin presupuestos";

    return `Eres un experto en finanzas personales integrado en Finanzapp, la app de ${user.name}.
Tienes acceso en tiempo real a todos sus datos. Responde siempre en español, claro y directo.
FECHA DE HOY: ${hoyAsistente} — USA SIEMPRE ESTA FECHA para transacciones sin fecha explícita.

Cuando el usuario suba un documento (ticket, factura, estado de cuenta, comprobante):
1. Extrae TODOS los movimientos o el movimiento principal: fecha, monto, descripción, tipo (ingreso/gasto).
2. Sugiere la categoría más adecuada de esta lista — expense: ${cats.expense.join(", ")} | income: ${cats.income.join(", ")}
3. Sugiere la cuenta más adecuada de las disponibles.
4. Responde con un JSON al final de tu mensaje con este formato exacto (sin markdown, sin backticks):
TRANSACCIONES_JSON:[{"type":"expense|income","amount":0,"date":"${hoyAsistente}","category":"...","description":"...","account":"ID_CUENTA"}]
Si hay múltiples movimientos (como en un estado de cuenta), inclúyelos todos en el array.
Si no puedes determinar algún campo, usa null.

Cuentas disponibles:
${ctxCuentasIds}

=== RESUMEN FINANCIERO ===
Fecha: ${now.toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} | TC: ${TC}
Liquidez: ${fmt(liquidez)} | Inversiones: ${fmt(invTotal)} | Deuda tarjetas: ${fmt(deudaTarjetas)}
Patrimonio neto: ${fmt(liquidez+invTotal-deudaTarjetas)}
Flujo ${now.toLocaleDateString("es-MX",{month:"long"})}: Ingresos ${fmt(ingrMes)} | Gastos ${fmt(gastMes)}

CUENTAS:
${ctxCuentas}

PRÉSTAMOS (${loans.length}):
${ctxPrestamos}

INVERSIONES:
${ctxInversiones}

HIPOTECAS:
${ctxHipotecas}

METAS:
${ctxMetas}

PRESUPUESTOS ACTIVOS:
${ctxPresupuestos}`;
  };

  // ── Leer archivo como base64
  const readFile = (file) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => res(e.target.result.split(",")[1]);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg","image/png","image/webp","image/gif","application/pdf"];
    if (!allowed.includes(file.type)) { toast("Formato no soportado. Usa JPG, PNG o PDF","error"); return; }
    if (file.size > 20*1024*1024) { toast("El archivo es muy grande (máx 20MB)","error"); return; }
    const base64 = await readFile(file);
    setAdjunto({ name:file.name, type:file.type, base64, mediaType:file.type });
    e.target.value = "";
  };

  // ── Parsear JSON de transacciones de la respuesta
  const parseTxJson = (text) => {
    const match = text.match(/TRANSACCIONES_JSON:(\[[\s\S]*?\])/);
    if (!match) return null;
    try {
      const arr = JSON.parse(match[1]);
      return arr.filter(tx=>tx.amount&&tx.type);
    } catch { return null; }
  };

  // ── Confirmar y guardar transacciones
  const guardarTransacciones = (txs) => {
    const nuevas = txs.map(tx=>({
      ...tx,
      id: genId(),
      amount: Math.abs(parseFloat(tx.amount)||0),
      date: tx.date || today(),
      category: tx.category || "Otro",
      description: tx.description || "Sin descripción",
      account: tx.account || accounts[0]?.id || "",
      creadoEn: today(),
    }));
    setTransactions(p=>[...p,...nuevas]);
    toast(`${nuevas.length} transacción${nuevas.length!==1?"es":""} registrada${nuevas.length!==1?"s":""} ✓`);
    setPendingTx(null);
    setMessages(p=>[...p,{role:"assistant",content:`✅ Listo. Registré ${nuevas.length} transacción${nuevas.length!==1?"es":""} en tu historial.`}]);
  };

  // ── Enviar mensaje
  const send = async () => {
    const text = input.trim();
    if ((!text && !adjunto) || loading) return;
    if (!ANTHROPIC_KEY) {
      setMessages(p=>[...p,{role:"assistant",content:"⚠️ No se encontró VITE_ANTHROPIC_KEY. Agrégala en Vercel → Settings → Environment Variables y vuelve a desplegar."}]);
      return;
    }

    // Construir contenido del mensaje del usuario
    let userContent;
    let displayText = text || (adjunto ? `📎 ${adjunto.name}` : "");

    if (adjunto) {
      const contentParts = [];
      if (adjunto.type === "application/pdf") {
        contentParts.push({ type:"document", source:{ type:"base64", media_type:"application/pdf", data:adjunto.base64 } });
      } else {
        contentParts.push({ type:"image", source:{ type:"base64", media_type:adjunto.mediaType, data:adjunto.base64 } });
      }
      if (text) contentParts.push({ type:"text", text });
      else contentParts.push({ type:"text", text:"Analiza este documento y extrae los movimientos financieros. Sugiere dónde registrarlos." });
      userContent = contentParts;
    } else {
      userContent = text;
    }

    const userMsg  = { role:"user", content:userContent, display:displayText };
    const newMsgs  = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setAdjunto(null);
    setLoading(true);

    try {
      // Para la API solo mandamos el contenido real (no el campo display)
      const apiMessages = newMsgs.map(m=>({ role:m.role, content:m.content }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key":ANTHROPIC_KEY,
          "anthropic-version":"2023-06-01",
          "anthropic-dangerous-direct-browser-access":"true"
        },
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:2048, system:buildContext(), messages:apiMessages })
      });
      const data  = await res.json();
      const reply = data.content?.[0]?.text || "Sin respuesta.";

      // Detectar transacciones en la respuesta
      const txs = parseTxJson(reply);
      const replyLimpio = reply.replace(/TRANSACCIONES_JSON:\[[\s\S]*?\]/, "").trim();

      setMessages(p=>[...p,{ role:"assistant", content:replyLimpio }]);
      if (txs && txs.length > 0) setPendingTx(txs);

    } catch(e) {
      setMessages(p=>[...p,{ role:"assistant", content:"❌ Error al conectar con la API. Verifica tu key y conexión." }]);
    }
    setLoading(false);
  };

  const SUGERENCIAS = [
    "¿Cuánto llevo gastado este mes?",
    "¿Cómo está mi patrimonio neto?",
    "¿Cuándo termino de pagar mis préstamos?",
    "¿Voy bien con mis metas de ahorro?",
    "Dame un resumen de mi salud financiera",
    "¿Qué categoría me consume más?",
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)",maxWidth:800,margin:"0 auto",animation:"fadeUp .25s ease"}}>
      {/* Header */}
      <div style={{marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:38,height:38,borderRadius:12,background:"linear-gradient(135deg,#00d4aa,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Ic n="asistente" size={20} color="#fff"/>
        </div>
        <div>
          <h2 style={{fontSize:20,fontFamily:"'Syne',sans-serif",fontWeight:800,color:t.text,margin:0}}>Asistente Financiero</h2>
          <p style={{fontSize:12,color:t.text2,margin:0}}>Pregunta, o sube un ticket · factura · estado de cuenta · comprobante</p>
        </div>
      </div>

      {/* Chat */}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,paddingRight:4,marginBottom:12}}>

        {messages.length===0&&(
          <div>
            <div style={{textAlign:"center",padding:"28px 20px 20px"}}>
              <div style={{width:56,height:56,borderRadius:18,background:"linear-gradient(135deg,rgba(0,212,170,.15),rgba(59,130,246,.15))",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                <Ic n="asistente" size={28} color="#00d4aa"/>
              </div>
              <p style={{fontSize:15,fontWeight:700,color:t.text,margin:"0 0 4px"}}>Hola, {user.name.split(" ")[0]} 👋</p>
              <p style={{fontSize:13,color:t.text2,margin:0,lineHeight:1.5}}>
                Pregúntame sobre tus finanzas o sube un documento<br/>
                y lo analizo y registro automáticamente.
              </p>
            </div>
            {/* Formatos soportados */}
            <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {["🧾 Tickets","📄 Facturas CFDI","🏦 Estados de cuenta","📱 Comprobantes"].map(l=>(
                <span key={l} style={{fontSize:11,padding:"4px 10px",borderRadius:20,background:t.surface2,border:`1px solid ${t.border}`,color:t.text2}}>{l}</span>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {SUGERENCIAS.map((s,i)=>(
                <button key={i} onClick={()=>setInput(s)}
                  style={{textAlign:"left",padding:"10px 13px",borderRadius:10,border:`1px solid ${t.border}`,background:t.surface2,cursor:"pointer",fontSize:12,color:t.text2,lineHeight:1.4,transition:"all .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(0,212,170,.3)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:8,alignItems:"flex-start"}}>
            {m.role==="assistant"&&(
              <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#00d4aa,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                <Ic n="asistente" size={14} color="#fff"/>
              </div>
            )}
            <div style={{maxWidth:"78%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?"linear-gradient(135deg,#00d4aa,#00a884)":t.surface2,border:m.role==="user"?"none":`1px solid ${t.border}`,fontSize:13,color:m.role==="user"?"#fff":t.text,lineHeight:1.6,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
              {m.display || (typeof m.content==="string" ? m.content : m.content?.find?.(c=>c.type==="text")?.text || "")}
            </div>
          </div>
        ))}

        {/* Tarjeta de confirmación de transacciones */}
        {pendingTx && (
          <div style={{border:"1px solid rgba(0,212,170,.3)",borderRadius:12,padding:14,background:"rgba(0,212,170,.05)"}}>
            <p style={{fontSize:13,fontWeight:700,color:"#00d4aa",margin:"0 0 10px"}}>
              📋 {pendingTx.length} transacción{pendingTx.length!==1?"es":""} detectada{pendingTx.length!==1?"s":""}  — ¿las registro?
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
              {pendingTx.map((tx,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderRadius:8,background:t.surface2,flexWrap:"wrap",gap:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:tx.type==="income"?"#00d4aa":"#ff4757",flexShrink:0}}/>
                    <div>
                      <p style={{fontSize:12,fontWeight:600,color:t.text,margin:0}}>{tx.description||"Sin descripción"}</p>
                      <p style={{fontSize:11,color:t.text2,margin:0}}>{tx.category||"—"} · {tx.date||today()} · {accounts.find(a=>a.id===tx.account)?.name||"Sin cuenta"}</p>
                    </div>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,color:tx.type==="income"?"#00d4aa":"#ff4757",flexShrink:0}}>
                    {tx.type==="income"?"+":"-"}{fmt(Math.abs(parseFloat(tx.amount||0)))}
                  </span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={()=>guardarTransacciones(pendingTx)} style={{flex:1}}>
                <Ic n="check" size={14}/>Registrar todo
              </Btn>
              <Btn variant="secondary" onClick={()=>setPendingTx(null)} style={{flex:1}}>
                <Ic n="close" size={14}/>Cancelar
              </Btn>
            </div>
          </div>
        )}

        {loading&&(
          <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
            <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#00d4aa,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
              <Ic n="asistente" size={14} color="#fff"/>
            </div>
            <div style={{padding:"12px 16px",borderRadius:"14px 14px 14px 4px",background:t.surface2,border:`1px solid ${t.border}`,display:"flex",gap:5,alignItems:"center"}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#00d4aa",animation:`fadeUp .6s ease ${i*0.15}s infinite alternate`}}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Preview de adjunto */}
      {adjunto&&(
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:t.surface2,border:`1px solid rgba(0,212,170,.25)`,borderRadius:10,marginBottom:8}}>
          <Ic n="attach" size={16} color="#00d4aa"/>
          <span style={{flex:1,fontSize:12,color:t.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{adjunto.name}</span>
          <button onClick={()=>setAdjunto(null)} style={{background:"none",border:"none",cursor:"pointer",color:t.muted,display:"flex",padding:2}}>
            <Ic n="close" size={14}/>
          </button>
        </div>
      )}

      {/* Input */}
      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={handleFileChange}/>
      <div style={{display:"flex",gap:8,alignItems:"flex-end",background:t.surface,border:`1px solid ${adjunto?"rgba(0,212,170,.3)":t.border}`,borderRadius:14,padding:"10px 12px",transition:"border-color .2s"}}>
        <button onClick={()=>fileRef.current?.click()}
          title="Adjuntar imagen o PDF"
          style={{width:34,height:34,borderRadius:9,border:`1px solid ${t.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,212,170,.4)";e.currentTarget.style.background="rgba(0,212,170,.08)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.background="transparent";}}>
          <Ic n="attach" size={17} color="#666"/>
        </button>
        <textarea
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder={adjunto?"Añade un comentario o presiona Enter para analizar...":"Pregunta algo o adjunta un documento (📎)..."}
          rows={1}
          style={{flex:1,background:"transparent",border:"none",outline:"none",resize:"none",fontSize:13,color:t.text,lineHeight:1.5,maxHeight:120,overflowY:"auto",fontFamily:"'DM Sans',sans-serif"}}
        />
        <button onClick={send} disabled={(!input.trim()&&!adjunto)||loading}
          style={{width:36,height:36,borderRadius:10,border:"none",background:(input.trim()||adjunto)&&!loading?"linear-gradient(135deg,#00d4aa,#00a884)":"rgba(255,255,255,.06)",cursor:(input.trim()||adjunto)&&!loading?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
          <svg viewBox="0 0 24 24" width={17} height={17} fill={(input.trim()||adjunto)&&!loading?"#fff":"#444"}>
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
          </svg>
        </button>
      </div>
      {messages.length>0&&(
        <button onClick={()=>{setMessages([]);setPendingTx(null);}} style={{marginTop:8,background:"none",border:"none",cursor:"pointer",fontSize:11,color:t.muted,textAlign:"center"}}>
          Limpiar conversación
        </button>
      )}
    </div>
  );
};


// ─── ASISTENTE FLOTANTE ───────────────────────────────────────────────────────
const AsisteFlotante = () => {
  const { user, toast } = useCtx();
  const t = useTheme();
  const HIST_KEY = `fp_float_hist_${user?.id}`;
  const BIENVENIDA_KEY = `fp_float_bienvenida_${user?.id}`;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HIST_KEY)||"[]"); } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [adjunto, setAdjunto] = useState(null);
  const [pendingTx, setPendingTx] = useState(null);
  const [pendingConc, setPendingConc] = useState(null); // {accountId, fechaDesde, fechaHasta, transacciones, seleccionadas}
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY;

  const [accounts, setAccounts] = useData(user.id, "accounts");
  const [transactions, setTransactions] = useData(user.id, "transactions");
  const [recurrents, setRecurrents] = useData(user.id, "recurrents");
  const [loans] = useData(user.id, "loans");
  const [investments] = useData(user.id, "investments");
  const [goals] = useData(user.id, "goals");
  const [mortgages, setMortgages] = useData(user.id, "mortgages");
  const [transfers, setTransfers] = useData(user.id, "transfers");
  const [presupuestos] = useData(user.id, "presupuestos");
  const [config] = useData(user.id, "config", {});

  // Persistir historial en localStorage al cambiar mensajes
  useEffect(() => {
    try {
      // guardar solo los últimos 40 mensajes para no llenar storage
      const toSave = messages.map(m => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content : m.display || "",
        display: m.display,
      })).slice(-40);
      localStorage.setItem(HIST_KEY, JSON.stringify(toSave));
    } catch {}
  }, [messages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(()=>inputRef.current?.focus(), 150); }, [open]);

  // Mensaje de bienvenida inteligente — una vez al día al primer open
  useEffect(() => {
    if (!open || !ANTHROPIC_KEY) return;
    const hoy = new Date().toISOString().split("T")[0];
    const lastBienvenida = localStorage.getItem(BIENVENIDA_KEY)||"";
    if (lastBienvenida === hoy) return; // ya se mostró hoy
    if (messages.length > 0) return; // ya hay historial hoy
    localStorage.setItem(BIENVENIDA_KEY, hoy);

    // generar saludo con contexto financiero del día
    const generarBienvenida = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const mesKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
        const TC = getTc(user.id);
        const ingrMes = transactions.filter(t=>t.date?.startsWith(mesKey)&&t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
        const gastMes = transactions.filter(t=>t.date?.startsWith(mesKey)&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
        const flujo = ingrMes - gastMes;
        const diasMes = now.getDate();

        // próximo recurrente o pago de tarjeta
        const tarjetasConDeuda = accounts.filter(a=>a.type==="credit"&&Math.abs(Math.min(parseFloat(a.balance||0),0))>=1&&a.fechaPago);
        const proximoPago = tarjetasConDeuda.sort((a,b)=>new Date(a.fechaPago)-new Date(b.fechaPago))[0];
        const diasAlPago = proximoPago ? Math.round((new Date(proximoPago.fechaPago+"T12:00:00")-now)/86400000) : null;

        const prompt = `Eres el asistente financiero de ${user.name.split(" ")[0]}. 
Genera un saludo matutino muy breve y amigable (máx 3 líneas) con este resumen del día:
- Fecha: ${now.toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"})}
- Flujo del mes (día ${diasMes}): Ingresos ${fmt(ingrMes)} · Gastos ${fmt(gastMes)} · Neto ${flujo>=0?"+":""}${fmt(flujo)}
${proximoPago ? `- Próximo pago tarjeta: ${proximoPago.name} en ${diasAlPago} días (${fmt(Math.abs(Math.min(parseFloat(proximoPago.balance||0),0)))})` : "- Sin pagos urgentes de tarjeta"}
${goals.filter(g=>g.estado==="activa"||!g.estado).length>0 ? `- Metas activas: ${goals.filter(g=>g.estado==="activa"||!g.estado).length}` : ""}
Sé directo, positivo y usa 1 emoji relevante. No repitas los números exactos si no aportan, solo menciona lo más relevante.`;

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST",
          headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
          body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:prompt}]})
        });
        const data = await res.json();
        const saludo = data.content?.[0]?.text || `Hola ${user.name.split(" ")[0]} 👋 ¿En qué te ayudo hoy?`;
        setMessages([{role:"assistant",content:saludo}]);
      } catch {
        setMessages([{role:"assistant",content:`Hola ${user.name.split(" ")[0]} 👋 ¿En qué te ayudo hoy?`}]);
      }
      setLoading(false);
    };
    generarBienvenida();
  }, [open]);

  const DEFAULT_CATS = {
    income:["Salario","Freelance","Negocio","Renta","Intereses","Dividendos","Otro"],
    expense:["Alimentación","Transporte","Salud","Educación","Entretenimiento","Ropa","Servicios","Hipoteca / Vivienda","Pago de deuda","Otro"],
  };
  const cats = {
    income:[...new Set([...DEFAULT_CATS.income, ...(config.categorias?.income||[]), ...transactions.filter(t=>t.type==="income"&&t.category).map(t=>t.category)])],
    expense:[...new Set([...DEFAULT_CATS.expense, ...(config.categorias?.expense||[]), ...transactions.filter(t=>t.type==="expense"&&t.category).map(t=>t.category)])],
  };

  // ── Lógica de recurrentes pendientes
  const calcNextFlot = (r) => {
    const last = r.ultimoRegistro
      ? new Date(r.ultimoRegistro+"T12:00:00")
      : new Date((r.fechaInicio||today())+"T12:00:00");
    const next = new Date(last);
    if (r.frecuencia==="mensual")    next.setMonth(next.getMonth()+1);
    else if (r.frecuencia==="quincenal") next.setDate(next.getDate()+15);
    else if (r.frecuencia==="semanal")   next.setDate(next.getDate()+7);
    else if (r.frecuencia==="anual")     next.setFullYear(next.getFullYear()+1);
    return next;
  };
  const recPendientes = (recurrents||[]).filter(r=>r.activo!==false && calcNextFlot(r) <= new Date());

  const confirmarRecurrente = (r) => {
    const monto = parseFloat(r.monto)||0;
    const newTx = {
      id:genId(), date:today(), amount:monto,
      type:r.tipo, description:r.nombre,
      category:r.categoria||"", accountId:r.cuentaId,
      currency:accounts.find(a=>a.id===r.cuentaId)?.currency||"MXN",
      notes:"Recurrente confirmado",
    };
    setTransactions(p=>[newTx,...p]);
    if (r.cuentaId) {
      setAccounts(p=>p.map(a=>a.id===r.cuentaId
        ? {...a, balance:parseFloat(a.balance||0)+(r.tipo==="income"?monto:-monto)}
        : a));
    }
    setRecurrents(p=>p.map(x=>x.id===r.id?{...x,ultimoRegistro:today()}:x));
    toast(`"${r.nombre}" registrado ✓`);
  };

  const saltarRecurrente = (r) => {
    setRecurrents(p=>p.map(x=>x.id===r.id?{...x,ultimoRegistro:today()}:x));
    toast(`"${r.nombre}" pospuesto para el siguiente período`,"warning");
  };

  const buildContext = () => {
    const now = new Date();
    const mesKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const TC = getTc(user.id);
    const hoyStr = today();

    // Liquidez y patrimonio
    const liquidez = accounts.filter(a=>a.type!=="credit").reduce((s,a)=>s+(a.currency==="USD"?parseFloat(a.balance||0)*TC:parseFloat(a.balance||0)),0);
    const deudaTarjetas = accounts.filter(a=>a.type==="credit").reduce((s,a)=>s+Math.abs(Math.min(parseFloat(a.balance||0),0)),0);
    const invTotal = investments.filter(i=>i.estado!=="liquidada").reduce((s,i)=>{ const ti=parseFloat(i.titulos)||0,p=parseFloat(i.precioActual)||0,ap=(i.aportaciones||[]).reduce((ss,a)=>ss+parseFloat(a.amount||0),0),val=ti>0&&p>0?ti*p:parseFloat(i.currentValue)||ap; return s+(i.currency==="USD"?val*TC:val); },0);

    // Flujo del mes
    const txMes = transactions.filter(tx=>tx.date?.startsWith(mesKey));
    const ingrMes = txMes.filter(tx=>tx.type==="income").reduce((s,tx)=>s+parseFloat(tx.amount||0),0);
    const gastMes = txMes.filter(tx=>tx.type==="expense").reduce((s,tx)=>s+parseFloat(tx.amount||0),0);

    // Préstamos con saldo e interés acumulado
    const calcLoanState = (loan) => {
      const dr=(parseFloat(loan.rate)||0)/100/(loan.rateType==="annual"?365:loan.rateType==="monthly"?30:1);
      let bal=parseFloat(loan.principal||0), last=new Date(loan.startDate+"T12:00:00");
      for(const p of [...(loan.payments||[])].sort((a,b)=>new Date(a.date)-new Date(b.date))){
        const days=Math.max(0,Math.floor((new Date(p.date+"T12:00:00")-last)/86400000));
        bal=Math.max(0,bal-(p.amount-Math.min(p.amount,bal*dr*days))); last=new Date(p.date+"T12:00:00");
      }
      const daysSince=Math.max(0,Math.floor((new Date()-last)/86400000));
      const interest=bal*dr*daysSince;
      return {bal,interest,total:bal+interest};
    };
    const loansInfo = loans.map(l=>{
      const st=calcLoanState(l);
      return `${l.name} [${l.type==="received"?"DEBO":"ME DEBEN"}]: capital ${fmt(st.bal,l.currency)} + interés acum. ${fmt(st.interest,l.currency)} = total ${fmt(st.total,l.currency)} @ ${l.rate}% ${l.rateType==="annual"?"anual":"mensual"}`;
    });

    // Hipotecas con saldo
    const mortgagesInfo = (mortgages||[]).map(m=>{
      const P=parseFloat(m.monto)||0,n=(parseFloat(m.plazoAnios)||0)*12,r=(parseFloat(m.tasaAnual)||0)/100/12;
      if(!P||!n||!r) return `${m.nombre||"Hipoteca"}: ${fmt(P)}`;
      const cuota=m.tipo==="fijo"?(P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1):P/n;
      let saldo=P; const pagados=(m.pagosRealizados||[]).length;
      for(let i=0;i<pagados;i++){const int=saldo*r,cap=m.tipo==="fijo"?cuota-int:P/n;saldo=Math.max(saldo-cap,0);}
      return `${m.nombre||m.banco||"Hipoteca"}: saldo ${fmt(saldo,m.moneda)}, cuota ${fmt(cuota,m.moneda)}/mes`;
    });

    // Metas con progreso
    const metasInfo = goals.filter(g=>g.estado!=="completada").map(g=>{
      const aportado=(g.aportaciones||[]).reduce((s,a)=>s+parseFloat(a.monto||0),0);
      const meta=parseFloat(g.meta||g.target||0);
      const pct=meta>0?Math.min(aportado/meta*100,100):0;
      return `${g.nombre||g.name}: ${fmt(aportado)}/${fmt(meta)} (${pct.toFixed(1)}%)`;
    });

    // Presupuestos activos
    const presInfo = (presupuestos||[]).filter(p=>p.activo!==false&&p.tipo!=="global").slice(0,5).map(p=>{
      const gastado=transactions.filter(t=>t.date?.startsWith(mesKey)&&t.type==="expense"&&t.category===p.categoria).reduce((s,t)=>s+parseFloat(t.amount||0),0);
      const pct=(gastado/(parseFloat(p.montoLimite)||1)*100).toFixed(0);
      return `${p.nombre}: ${fmt(gastado)}/${fmt(parseFloat(p.montoLimite))} (${pct}%)`;
    });

    const patrimonioNeto = liquidez + invTotal - deudaTarjetas
      - loans.filter(l=>l.type==="received").reduce((s,l)=>s+calcLoanState(l).total,0)
      - (mortgages||[]).reduce((s,m)=>{
          const P=parseFloat(m.monto)||0,n=(parseFloat(m.plazoAnios)||0)*12,r=(parseFloat(m.tasaAnual)||0)/100/12;
          if(!P||!n||!r) return s+P;
          const cuota=m.tipo==="fijo"?(P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1):P/n;
          let saldo=P; const pagados=(m.pagosRealizados||[]).length;
          for(let i=0;i<pagados;i++){const int=saldo*r,cap=m.tipo==="fijo"?cuota-int:P/n;saldo=Math.max(saldo-cap,0);}
          return s+saldo;
        },0);

    const loansActivos = loans.filter(l=>!calcLoanState(l).total<=0);
    const ctxInvFlot = investments.filter(i=>i.estado!=="liquidada").map(i=>{
      const ap=(i.aportaciones||[]).reduce((s,a)=>s+parseFloat(a.amount||0),0);
      const tasa=parseFloat(i.tasaAnual)||0;
      let val=parseFloat(i.currentValue)||0;
      if(!val&&tasa>0&&ap>0){const dias=Math.max(0,Math.floor((new Date()-new Date((i.startDate||hoyStr)+"T12:00:00"))/86400000));val=ap+(ap*tasa/100/365*dias);}
      else if(!val) val=ap;
      const valMXN=i.currency==="USD"?val*TC:val;
      return "[" + i.id + "] " + i.name + ": capital " + fmt(ap,i.currency) + " → ~" + fmt(valMXN) + " MXN" + (tasa?" ("+tasa+"% anual)":"");
    }).join("\n") || "Ninguna";
    return `Eres el asistente financiero personal de ${user.name} en Finanzapp. Responde siempre en español, conciso y directo.
FECHA HOY: ${hoyStr}
Puedes registrar CUALQUIERA de estas operaciones usando el JSON correspondiente al FINAL de tu respuesta:

1. TRANSACCIÓN (gasto/ingreso):
TRANSACCIONES_JSON:[{"type":"expense|income","amount":0,"date":"${hoyStr}","category":"...","description":"...","account":"ID_CUENTA"}]

MODO CONCILIACIÓN — cuando el usuario suba un estado de cuenta bancario:
- Analiza el PDF e identifica el banco/cuenta. Usa EXACTAMENTE el ID de la cuenta correspondiente de la lista de cuentas de arriba.
- Extrae TODAS las transacciones: fecha exacta, descripción completa, monto (positivo=ingreso, negativo=gasto) y tipo.
- Los cargos/débitos son type:"expense" con amount negativo. Los abonos/créditos son type:"income" con amount positivo.
- Responde explicando qué encontraste y termina SIEMPRE con el JSON exactamente en este formato:
CONCILIACION_JSON:{"accountId":"ID_EXACTO_DE_LA_CUENTA","fechaDesde":"YYYY-MM-DD","fechaHasta":"YYYY-MM-DD","transacciones":[{"date":"YYYY-MM-DD","description":"descripcion completa","amount":0,"type":"expense"}]}
IMPORTANTE: El accountId debe ser el ID real de la cuenta (ej: mmjmdi50rw45ng7yqya para Santander Cheques). El usuario verá cada transacción y decidirá cuáles importar.

2. PAGO DE PRÉSTAMO (capital+interés o solo interés):
PAGO_PRESTAMO_JSON:{"loanId":"ID_PRESTAMO","amount":0,"date":"${hoyStr}","paymentType":"mixed|interest_only","account":"ID_CUENTA","notes":""}

3. APORTACIÓN A META:
APORTACION_META_JSON:{"goalId":"ID_META","monto":0,"fecha":"${hoyStr}","notas":""}

4. PAGO DE HIPOTECA:
PAGO_HIPOTECA_JSON:{"mortgageId":"ID_HIPOTECA","account":"ID_CUENTA","date":"${hoyStr}","notas":""}

5. TRANSFERENCIA ENTRE CUENTAS:
TRANSFERENCIA_JSON:{"fromId":"ID_CUENTA_ORIGEN","toId":"ID_CUENTA_DESTINO","amount":0,"date":"${hoyStr}","description":""}

6. APORTACIÓN A INVERSIÓN:
APORTACION_INVERSION_JSON:{"invId":"ID_INVERSION","amount":0,"date":"${hoyStr}","account":"ID_CUENTA","notes":""}

Cats expense: ${cats.expense.join(", ")} | income: ${cats.income.join(", ")}
Cuentas (usa el ID exacto): ${accounts.map(a=>`[${a.id}] ${a.name} ${a.currency} ${fmt(parseFloat(a.balance||0),a.currency)}`).join(" | ")||"Sin cuentas"}
Préstamos activos: ${loans.map(l=>`[${l.id}] ${l.name} (${l.type==="received"?"debo":"me deben"})`).join(" | ")||"Ninguno"}
Metas activas: ${goals.filter(g=>g.estado!=="completada").map(g=>`[${g.id}] ${g.nombre||g.name}`).join(" | ")||"Ninguna"}
Hipotecas: ${(mortgages||[]).map(m=>`[${m.id}] ${m.nombre||m.banco||"Hipoteca"}`).join(" | ")||"Ninguna"}
Inversiones activas: ${investments.filter(i=>i.estado!=="liquidada").map(i=>`[${i.id}] ${i.name}`).join(" | ")||"Ninguna"}

=== SITUACIÓN FINANCIERA ACTUAL ===
TC USD→MXN: ${TC}
Patrimonio neto: ${fmt(patrimonioNeto)}
Liquidez total: ${fmt(liquidez)} | Inversiones: ${fmt(invTotal)} | Deuda tarjetas: ${fmt(deudaTarjetas)}
Flujo ${now.toLocaleDateString("es-MX",{month:"long"})}: +${fmt(ingrMes)} ingresos / -${fmt(gastMes)} gastos = ${fmt(ingrMes-gastMes)} neto

PRÉSTAMOS (${loans.length}):
${loansInfo.length>0?loansInfo.join("\n"):"Ninguno"}

HIPOTECAS (${(mortgages||[]).length}):
${mortgagesInfo.length>0?mortgagesInfo.join("\n"):"Ninguna"}

INVERSIONES activas (${investments.filter(i=>i.estado!=="liquidada").length}):
${ctxInvFlot}

METAS (${goals.filter(g=>g.estado!=="completada").length}):
${metasInfo.length>0?metasInfo.join("\n"):"Ninguna"}

PRESUPUESTOS este mes:
${presInfo.length>0?presInfo.join("\n"):"Sin presupuestos"}`;
  };

  const readFile = (file) => new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result.split(",")[1]); r.onerror=rej; r.readAsDataURL(file); });

  const handleFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const allowed = ["image/jpeg","image/png","image/webp","image/gif","application/pdf"];
    if (!allowed.includes(file.type)) { toast("Formato no soportado","error"); return; }
    if (file.size > 20*1024*1024) { toast("Archivo muy grande (máx 20MB)","error"); return; }
    const base64 = await readFile(file);
    setAdjunto({ name:file.name, type:file.type, base64, mediaType:file.type });
    e.target.value = "";
  };

  // ── Parser multi-acción
  const parseConciliacion = (text) => {
    const m = text.match(/CONCILIACION_JSON:(\{[\s\S]*?\})(?:\n|$)/);
    if (!m) return null;
    try {
      const data = JSON.parse(m[1]);
      if (!data.transacciones?.length) return null;
      return data;
    } catch { return null; }
  };

  const parseAcciones = (text) => {
    const acciones = [];
    // 1. Transacciones
    const mTx = text.match(/TRANSACCIONES_JSON:(\[[\s\S]*?\])/);
    if (mTx) { try { const arr=JSON.parse(mTx[1]); if(arr.length) acciones.push({tipo:"transacciones",data:arr.filter(tx=>tx.amount&&tx.type)}); } catch{} }
    // 2. Pago préstamo
    const mPr = text.match(/PAGO_PRESTAMO_JSON:(\{[\s\S]*?\})/);
    if (mPr) { try { const obj=JSON.parse(mPr[1]); if(obj.loanId&&obj.amount) acciones.push({tipo:"pago_prestamo",data:obj}); } catch{} }
    // 3. Aportación meta
    const mMt = text.match(/APORTACION_META_JSON:(\{[\s\S]*?\})/);
    if (mMt) { try { const obj=JSON.parse(mMt[1]); if(obj.goalId&&obj.monto) acciones.push({tipo:"aportacion_meta",data:obj}); } catch{} }
    // 4. Pago hipoteca
    const mHip = text.match(/PAGO_HIPOTECA_JSON:(\{[\s\S]*?\})/);
    if (mHip) { try { const obj=JSON.parse(mHip[1]); if(obj.mortgageId) acciones.push({tipo:"pago_hipoteca",data:obj}); } catch{} }
    // 5. Transferencia
    const mTr = text.match(/TRANSFERENCIA_JSON:(\{[\s\S]*?\})/);
    if (mTr) { try { const obj=JSON.parse(mTr[1]); if(obj.fromId&&obj.toId&&obj.amount) acciones.push({tipo:"transferencia",data:obj}); } catch{} }
    // 6. Aportación inversión
    const mInv = text.match(/APORTACION_INVERSION_JSON:(\{[\s\S]*?\})/);
    if (mInv) { try { const obj=JSON.parse(mInv[1]); if(obj.invId&&obj.amount) acciones.push({tipo:"aportacion_inversion",data:obj}); } catch{} }
    return acciones.length>0 ? acciones : null;
  };

  const limpiarReply = (text) => text
    .replace(/TRANSACCIONES_JSON:\[[\s\S]*?\]/g,"")
    .replace(/PAGO_PRESTAMO_JSON:\{[\s\S]*?\}/g,"")
    .replace(/APORTACION_META_JSON:\{[\s\S]*?\}/g,"")
    .replace(/PAGO_HIPOTECA_JSON:\{[\s\S]*?\}/g,"")
    .replace(/TRANSFERENCIA_JSON:\{[\s\S]*?\}/g,"")
    .replace(/APORTACION_INVERSION_JSON:\{[\s\S]*?\}/g,"")
    .trim();

  // ── Calcular estado de préstamo (para saber interés acumulado)
  const calcLoanStateFlot = (loan) => {
    const dr=(parseFloat(loan.rate)||0)/100/(loan.rateType==="annual"?365:loan.rateType==="monthly"?30:1);
    let bal=parseFloat(loan.principal||0), last=new Date(loan.startDate+"T12:00:00"), totalPaid=0;
    for(const p of [...(loan.payments||[])].sort((a,b)=>new Date(a.date)-new Date(b.date))){
      const days=Math.max(0,Math.floor((new Date(p.date+"T12:00:00")-last)/86400000));
      const accrued=bal*dr*days;
      if(p.paymentType==="interest_only"){totalPaid+=p.amount;last=new Date(p.date+"T12:00:00");}
      else{const toInt=Math.min(p.amount,accrued);bal=Math.max(0,bal-(p.amount-toInt));totalPaid+=p.amount;last=new Date(p.date+"T12:00:00");}
    }
    const daysSince=Math.max(0,Math.floor((new Date()-last)/86400000));
    const interest=bal*dr*daysSince;
    return {bal,interest,total:bal+interest,totalPaid,dr,lastDate:last};
  };

  const ejecutarAcciones = (acciones) => {
    let mensajes = [];
    let newAccounts = [...accounts];
    let newTransactions = [...transactions];
    let newLoans = [...loans];
    let newGoals = [...goals];
    let newMortgages = [...(mortgages||[])];
    let newInvestments = [...investments];
    let newTransfers = [...(transfers||[])];

    for (const accion of acciones) {
      if (accion.tipo==="transacciones") {
        const nuevas = accion.data.map(tx=>({
          ...tx, id:genId(), amount:Math.abs(parseFloat(tx.amount)||0),
          date:tx.date||today(), category:tx.category||"Otro",
          description:tx.description||"Sin descripción",
          accountId:tx.account||accounts[0]?.id||"",
          createdAt:new Date().toISOString()
        }));
        newTransactions = [...nuevas,...newTransactions];
        // actualizar saldo de cuentas
        nuevas.forEach(tx=>{
          newAccounts = newAccounts.map(a=>a.id===tx.accountId?{...a,balance:parseFloat(a.balance||0)+(tx.type==="income"?tx.amount:-tx.amount)}:a);
        });
        mensajes.push(`✅ ${nuevas.length} transacción${nuevas.length!==1?"es":""} registrada${nuevas.length!==1?"s":""}`);
      }

      else if (accion.tipo==="pago_prestamo") {
        const {loanId,amount,date,paymentType,account:accId,notes} = accion.data;
        const loan = newLoans.find(l=>l.id===loanId);
        if (!loan) { mensajes.push("❌ No encontré ese préstamo"); continue; }
        const amt = Math.abs(parseFloat(amount)||0);
        const targetId = accId || loan.accountId;
        const st = calcLoanStateFlot(loan);
        // ajustar saldo de cuenta
        newAccounts = newAccounts.map(a=>a.id===targetId?{...a,balance:parseFloat(a.balance||0)+(loan.type==="given"?amt:-amt)}:a);
        // agregar pago al préstamo
        const toInt = paymentType==="interest_only" ? amt : Math.min(st.interest, amt);
        const toCap = paymentType==="interest_only" ? 0 : Math.max(0, amt-toInt);
        const newPmt = {id:genId(),date:date||today(),amount:amt,paymentType:paymentType||"mixed",targetAccountId:targetId,notes:notes||""};
        newLoans = newLoans.map(l=>l.id===loanId?{...l,payments:[...(l.payments||[]),newPmt]}:l);
        // registrar transacción
        const isIngreso = loan.type==="given";
        if (toInt>0) newTransactions = [{id:genId(),date:date||today(),amount:toInt,type:isIngreso?"income":"expense",description:isIngreso?`Intereses cobrados — ${loan.name}`:`Pago intereses — ${loan.name}`,category:isIngreso?"Intereses cobrados":"Pago de deuda",accountId:targetId,currency:loan.currency||"MXN",origen:"prestamo",origenId:loanId,notes:notes||""},...newTransactions];
        if (toCap>0) newTransactions = [{id:genId(),date:date||today(),amount:toCap,type:isIngreso?"income":"expense",description:isIngreso?`Recuperación capital — ${loan.name}`:`Abono capital — ${loan.name}`,category:isIngreso?"Recuperación de capital":"Abono a capital",accountId:targetId,currency:loan.currency||"MXN",origen:"prestamo",origenId:loanId,notes:notes||""},...newTransactions];
        mensajes.push(`✅ Pago de ${fmt(amt)} al préstamo "${loan.name}" registrado`);
      }

      else if (accion.tipo==="aportacion_meta") {
        const {goalId,monto,fecha,notas} = accion.data;
        const goal = newGoals.find(g=>g.id===goalId);
        if (!goal) { mensajes.push("❌ No encontré esa meta"); continue; }
        const m = Math.abs(parseFloat(monto)||0);
        newGoals = newGoals.map(g=>g.id===goalId?{...g,aportaciones:[...(g.aportaciones||[]),{id:genId(),monto:m,fecha:fecha||today(),notas:notas||"Desde asistente"}]}:g);
        mensajes.push(`✅ ${fmt(m)} aportados a la meta "${goal.nombre||goal.name}"`);
      }

      else if (accion.tipo==="pago_hipoteca") {
        const {mortgageId,account:accId,date,notas} = accion.data;
        const mort = newMortgages.find(m=>m.id===mortgageId);
        if (!mort) { mensajes.push("❌ No encontré esa hipoteca"); continue; }
        const prog = (() => {
          const P=parseFloat(mort.monto)||0,n=(parseFloat(mort.plazoAnios)||0)*12,r=(parseFloat(mort.tasaAnual)||0)/100/12;
          if(!P||!n||!r) return {cuota:0,saldo:P};
          const cuota=mort.tipo==="fijo"?(P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1):P/n;
          let saldo=P; const pagados=(mort.pagosRealizados||[]).length;
          for(let i=0;i<pagados;i++){const int=saldo*r,cap=mort.tipo==="fijo"?cuota-int:P/n;saldo=Math.max(saldo-cap,0);}
          return {cuota:mort.cuotaReal?parseFloat(mort.cuotaReal):cuota,saldo};
        })();
        const targetId = accId || (accounts[0]?.id||"");
        newAccounts = newAccounts.map(a=>a.id===targetId?{...a,balance:parseFloat(a.balance||0)-prog.cuota}:a);
        newMortgages = newMortgages.map(m=>m.id===mortgageId?{...m,pagosRealizados:[...(m.pagosRealizados||[]),{id:genId(),fecha:date||today(),monto:prog.cuota,interes:prog.saldo*((parseFloat(mort.tasaAnual)||0)/100/12),cuentaId:targetId,notas:notas||"Desde asistente"}]}:m);
        mensajes.push(`✅ Pago de hipoteca "${mort.nombre||mort.banco}" registrado: ${fmt(prog.cuota)}`);
      }

      else if (accion.tipo==="transferencia") {
        const {fromId,toId,amount,date,description} = accion.data;
        const fromAcc = newAccounts.find(a=>a.id===fromId);
        const toAcc = newAccounts.find(a=>a.id===toId);
        if (!fromAcc||!toAcc) { mensajes.push("❌ No encontré una de las cuentas"); continue; }
        const amt = Math.abs(parseFloat(amount)||0);
        newAccounts = newAccounts.map(a=>a.id===fromId?{...a,balance:parseFloat(a.balance||0)-amt}:a.id===toId?{...a,balance:parseFloat(a.balance||0)+amt}:a);
        newTransfers = [{id:genId(),fromId,toId,amount:amt,toAmount:amt,date:date||today(),description:description||"Transferencia",fromName:fromAcc.name,toName:toAcc.name,fromCurrency:fromAcc.currency,toCurrency:toAcc.currency,createdAt:new Date().toISOString()},...newTransfers];
        mensajes.push(`✅ Transferencia de ${fmt(amt)} de "${fromAcc.name}" a "${toAcc.name}"`);
      }

      else if (accion.tipo==="aportacion_inversion") {
        const {invId,amount,date,account:accId,notes} = accion.data;
        const inv = newInvestments.find(i=>i.id===invId);
        if (!inv) { mensajes.push("❌ No encontré esa inversión"); continue; }
        const amt = Math.abs(parseFloat(amount)||0);
        const targetId = accId;
        if (targetId) newAccounts = newAccounts.map(a=>a.id===targetId?{...a,balance:parseFloat(a.balance||0)-amt}:a);
        newInvestments = newInvestments.map(i=>i.id===invId?{...i,aportaciones:[...(i.aportaciones||[]),{id:genId(),amount:amt,date:date||today(),accountId:targetId,notes:notes||"Desde asistente"}]}:i);
        mensajes.push(`✅ ${fmt(amt)} aportados a "${inv.name}"`);
      }
    }

    // Aplicar todos los cambios de una vez
    setAccounts(newAccounts);
    setTransactions(newTransactions);
    setLoans(newLoans);
    setGoals(newGoals);
    setMortgages(newMortgages);
    setInvestments(newInvestments);
    setTransfers(newTransfers);
    setPendingTx(null);
    const resumen = mensajes.join("\n");
    setMessages(p=>[...p,{role:"assistant",content:resumen}]);
    toast("Operaciones registradas ✓");
  };

  // mantener compatibilidad con el flujo anterior
  const parseTxJson = (text) => {
    const match = text.match(/TRANSACCIONES_JSON:(\[[\s\S]*?\])/);
    if (!match) return null;
    try { const arr=JSON.parse(match[1]); return arr.filter(tx=>tx.amount&&tx.type); } catch { return null; }
  };
  const guardarTxs = (txs) => {
    ejecutarAcciones([{tipo:"transacciones",data:txs}]);
  };

  const send = async () => {
    const text = input.trim();
    if ((!text && !adjunto) || loading) return;
    if (!ANTHROPIC_KEY) { setMessages(p=>[...p,{role:"assistant",content:"⚠️ Falta VITE_ANTHROPIC_KEY en Vercel."}]); return; }

    let userContent;
    const displayText = text || (adjunto ? `📎 ${adjunto.name}` : "");
    if (adjunto) {
      const parts = [];
      if (adjunto.type==="application/pdf") parts.push({type:"document",source:{type:"base64",media_type:"application/pdf",data:adjunto.base64}});
      else parts.push({type:"image",source:{type:"base64",media_type:adjunto.mediaType,data:adjunto.base64}});
      parts.push({type:"text",text:text||"Analiza este documento y extrae los movimientos financieros."});
      userContent = parts;
    } else { userContent = text; }

    const userMsg = {role:"user",content:userContent,display:displayText};
    const newMsgs = [...messages,userMsg];
    setMessages(newMsgs); setInput(""); setAdjunto(null); setLoading(true);

    try {
      const apiMessages = newMsgs.map(m=>({role:m.role,content:m.content}));
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1024,system:buildContext(),messages:apiMessages})
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sin respuesta.";
      const acciones = parseAcciones(reply);
      const conc = parseConciliacion(reply);
      const replyLimpio = limpiarReply(reply);
      setMessages(p=>[...p,{role:"assistant",content:replyLimpio}]);
      if (conc) {
        // Modo conciliación: comparar con transacciones existentes
        const txsExist = transactions.filter(t=>t.date>=conc.fechaDesde&&t.date<=conc.fechaHasta&&t.accountId===conc.accountId);
        const enriquecidas = conc.transacciones.map(t=>{
          // Buscar coincidencia aproximada por fecha y monto
          const match = txsExist.find(ex=>ex.date===t.date&&Math.abs(parseFloat(ex.amount)-Math.abs(t.amount))<0.01);
          const matchAprox = !match && txsExist.find(ex=>Math.abs(new Date(ex.date)-new Date(t.date))/86400000<=2&&Math.abs(parseFloat(ex.amount)-Math.abs(t.amount))<0.01);
          return { ...t, yaExiste:!!match, coincidenciaAprox:matchAprox||null, seleccionada:!match };
        });
        setPendingConc({ ...conc, transacciones:enriquecidas });
      } else if (acciones) {
        setPendingTx(acciones);
      }
    } catch { setMessages(p=>[...p,{role:"assistant",content:"❌ Error al conectar con la API."}]); }
    setLoading(false);
  };

  const SUGERENCIAS_RAPIDAS = ["¿Cuánto gasté este mes?","¿Cómo está mi patrimonio?","Resumen financiero","¿Voy bien con mis metas?"];

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={()=>setOpen(o=>!o)}
        style={{
          position:"fixed", bottom:24, right:24, zIndex:1200,
          width:54, height:54, borderRadius:"50%",
          background:"linear-gradient(135deg,#00d4aa,#3b82f6)",
          border:"none", cursor:"pointer", boxShadow:"0 4px 24px rgba(0,212,170,.4)",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"transform .2s, box-shadow .2s",
        }}
        onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.08)"; e.currentTarget.style.boxShadow="0 6px 32px rgba(0,212,170,.55)"; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 4px 24px rgba(0,212,170,.4)"; }}
        title="Asistente financiero"
      >
        {open ? <Ic n="close" size={22} color="#fff"/> : <Ic n="asistente" size={22} color="#fff"/>}
        {/* badge de recurrentes pendientes */}
        {!open && recPendientes.length>0 && (
          <span style={{
            position:"absolute", top:-3, right:-3,
            minWidth:18, height:18, borderRadius:9,
            background:"#f39c12", color:"#fff",
            fontSize:9, fontWeight:800,
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:"0 4px", lineHeight:1,
            boxShadow:"0 2px 6px rgba(0,0,0,.4)",
          }}>
            {recPendientes.length}
          </span>
        )}
      </button>

      {/* Panel flotante */}
      {open && (
        <div style={{
          position:"fixed", bottom:88, right:24, zIndex:1199,
          width:360, height:520,
          background:"#161b27", border:"1px solid rgba(255,255,255,.1)",
          borderRadius:18, boxShadow:"0 16px 60px rgba(0,0,0,.6)",
          display:"flex", flexDirection:"column", overflow:"hidden",
          animation:"fadeUp .2s ease",
        }}>
          {/* Header */}
          <div style={{padding:"13px 16px", borderBottom:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", gap:10, flexShrink:0, background:"linear-gradient(135deg,rgba(0,212,170,.08),rgba(59,130,246,.05))"}}>
            <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#00d4aa,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Ic n="asistente" size={16} color="#fff"/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:13,fontWeight:700,color:"#f0f0f0",margin:0}}>Asistente Financiero</p>
              <p style={{fontSize:10,color:"#555",margin:0}}>Escribe un gasto o pregunta sobre tus finanzas</p>
            </div>
            {messages.length>0 && (
              <button onClick={()=>{setMessages([]);setPendingTx(null);try{localStorage.removeItem(HIST_KEY);localStorage.removeItem(BIENVENIDA_KEY);}catch{}}} title="Limpiar historial"
                style={{background:"none",border:"none",cursor:"pointer",color:"#444",fontSize:10,padding:4,borderRadius:6}}>
                ↺
              </button>
            )}
          </div>

          {/* Mensajes */}
          <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
            {messages.length===0 && !loading && (
              <div>
                {/* ── Recurrentes pendientes */}
                {recPendientes.length>0 && (
                  <div style={{marginBottom:12,borderRadius:11,border:"1px solid rgba(243,156,18,.25)",background:"rgba(243,156,18,.06)",overflow:"hidden"}}>
                    <div style={{padding:"9px 12px 6px",display:"flex",alignItems:"center",gap:7,borderBottom:"1px solid rgba(243,156,18,.15)"}}>
                      <Ic n="recurring" size={13} color="#f39c12"/>
                      <span style={{fontSize:11,fontWeight:700,color:"#f39c12"}}>
                        {recPendientes.length} recurrente{recPendientes.length>1?"s":""} pendiente{recPendientes.length>1?"s":""}
                      </span>
                    </div>
                    <div style={{maxHeight:200,overflowY:"auto"}}>
                      {recPendientes.map(r=>(
                        <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                          <div style={{flex:1,minWidth:0}}>
                            <p style={{fontSize:12,fontWeight:600,color:"#e0e0e0",margin:"0 0 1px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.nombre}</p>
                            <p style={{fontSize:10,color:"#555",margin:0}}>
                              {r.tipo==="income"?"+" : "-"}{fmt(parseFloat(r.monto||0))} · {r.frecuencia}
                            </p>
                          </div>
                          <div style={{display:"flex",gap:5,flexShrink:0}}>
                            <button onClick={()=>confirmarRecurrente(r)}
                              style={{padding:"4px 10px",borderRadius:7,background:"rgba(0,212,170,.15)",border:"1px solid rgba(0,212,170,.3)",color:"#00d4aa",fontSize:10,fontWeight:700,cursor:"pointer"}}>
                              ✓
                            </button>
                            <button onClick={()=>saltarRecurrente(r)}
                              style={{padding:"4px 8px",borderRadius:7,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"#555",fontSize:10,cursor:"pointer"}}>
                              →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{padding:"6px 12px"}}>
                      <p style={{fontSize:9,color:"#444",margin:0}}>✓ confirmar · → saltar al siguiente período</p>
                    </div>
                  </div>
                )}
                <p style={{fontSize:12,color:"#555",textAlign:"center",marginBottom:12}}>¿En qué más te ayudo?</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {SUGERENCIAS_RAPIDAS.map((s,i)=>(
                    <button key={i} onClick={()=>setInput(s)}
                      style={{textAlign:"left",padding:"8px 10px",borderRadius:9,border:"1px solid rgba(255,255,255,.07)",background:"rgba(255,255,255,.03)",cursor:"pointer",fontSize:11,color:"#777",lineHeight:1.4}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:6,alignItems:"flex-start"}}>
                {m.role==="assistant"&&(
                  <div style={{width:22,height:22,borderRadius:6,background:"linear-gradient(135deg,#00d4aa,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                    <Ic n="asistente" size={11} color="#fff"/>
                  </div>
                )}
                <div style={{maxWidth:"82%",padding:"8px 12px",borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",background:m.role==="user"?"linear-gradient(135deg,#00d4aa,#00a884)":"rgba(255,255,255,.06)",border:m.role==="user"?"none":"1px solid rgba(255,255,255,.07)",fontSize:12,color:m.role==="user"?"#fff":"#d0d0d0",lineHeight:1.6,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
                  {m.display||(typeof m.content==="string"?m.content:m.content?.find?.(c=>c.type==="text")?.text||"")}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <div style={{width:22,height:22,borderRadius:6,background:"linear-gradient(135deg,#00d4aa,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Ic n="asistente" size={11} color="#fff"/>
                </div>
                <div style={{padding:"8px 12px",borderRadius:"12px 12px 12px 3px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.07)",fontSize:12,color:"#555"}}>
                  <span style={{animation:"pulse 1s infinite"}}>•••</span>
                </div>
              </div>
            )}

            {/* Panel de Conciliación Bancaria */}
            {pendingConc && (() => {
              const cuenta = accounts.find(a=>a.id===pendingConc.accountId);
              const novedades = pendingConc.transacciones.filter(t=>t.seleccionada);
              const yaExisten = pendingConc.transacciones.filter(t=>t.yaExiste);
              const guardarConc = () => {
                const nuevas = novedades.map(t=>({
                  id:genId(), date:t.date,
                  type:t.type||( t.amount>0?"income":"expense"),
                  amount:Math.abs(t.amount),
                  description:t.description||"Sin descripción",
                  category:t.category||"Otro",
                  accountId:pendingConc.accountId,
                  currency:cuenta?.currency||"MXN",
                  notes:"Importado via conciliación",
                }));
                setTransactions(p=>[...nuevas,...p]);
                nuevas.forEach(tx=>{
                  if(tx.accountId) setAccounts(p=>p.map(a=>a.id===tx.accountId?{...a,balance:parseFloat(a.balance||0)+(tx.type==="income"?tx.amount:-tx.amount)}:a));
                });
                setMessages(p=>[...p,{role:"assistant",content:"✅ Conciliación completada. "+nuevas.length+" transacciones importadas. "+(yaExisten.length>0?yaExisten.length+" ya existían y se omitieron.":"")}]);
                setPendingConc(null);
              };
              return (
                <div style={{border:"1px solid rgba(59,130,246,.3)",borderRadius:10,padding:10,background:"rgba(59,130,246,.04)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <p style={{fontSize:11,fontWeight:700,color:"#3b82f6",margin:0}}>🏦 Conciliación — {cuenta?.name||"Cuenta"}</p>
                    <span style={{fontSize:10,color:"#555"}}>{pendingConc.fechaDesde} → {pendingConc.fechaHasta}</span>
                  </div>
                  <p style={{fontSize:10,color:"#555",margin:"0 0 8px"}}>
                    {pendingConc.transacciones.length} movimientos extraídos · {yaExisten.length} ya registrados · {pendingConc.transacciones.filter(t=>!t.yaExiste).length} nuevos
                  </p>
                  <div style={{maxHeight:220,overflowY:"auto",display:"flex",flexDirection:"column",gap:4,marginBottom:8}}>
                    {pendingConc.transacciones.map((t,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:7,
                        background:t.yaExiste?"rgba(255,255,255,.02)":t.seleccionada?"rgba(0,212,170,.05)":"rgba(255,255,255,.02)",
                        border:`1px solid ${t.yaExiste?"rgba(255,255,255,.04)":t.seleccionada?"rgba(0,212,170,.2)":"rgba(255,255,255,.06)"}`,
                        opacity:t.yaExiste?0.5:1
                      }}>
                        {!t.yaExiste&&(
                          <input type="checkbox" checked={t.seleccionada} onChange={e=>{
                            const updated=[...pendingConc.transacciones];
                            updated[i]={...updated[i],seleccionada:e.target.checked};
                            setPendingConc(p=>({...p,transacciones:updated}));
                          }} style={{accentColor:"#00d4aa",flexShrink:0}}/>
                        )}
                        {t.yaExiste&&<span style={{fontSize:10,flexShrink:0}}>✓</span>}
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:11,color:t.yaExiste?"#555":"#ccc",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</p>
                          <span style={{fontSize:10,color:"#444"}}>{t.date}{t.yaExiste?" · ya registrado":""}{t.coincidenciaAprox?" · similar encontrado":""}</span>
                        </div>
                        <span style={{fontSize:11,fontWeight:700,flexShrink:0,color:t.amount>0?"#00d4aa":"#ff4757"}}>
                          {t.amount>0?"+":""}{fmt(Math.abs(t.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={guardarConc} disabled={novedades.length===0}
                      style={{flex:1,padding:"6px 0",borderRadius:8,background:novedades.length>0?"#00d4aa":"#333",border:"none",color:"#fff",fontSize:11,fontWeight:700,cursor:novedades.length>0?"pointer":"default"}}>
                      ✓ Importar {novedades.length} nuevas
                    </button>
                    <button onClick={()=>setPendingConc(null)}
                      style={{flex:1,padding:"6px 0",borderRadius:8,background:"rgba(255,71,87,.15)",border:"1px solid rgba(255,71,87,.3)",color:"#ff4757",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                      ✕ Cancelar
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Confirmar transacciones */}
            {pendingTx && (
              <div style={{border:"1px solid rgba(0,212,170,.3)",borderRadius:10,padding:10,background:"rgba(0,212,170,.05)"}}>
                <p style={{fontSize:11,fontWeight:700,color:"#00d4aa",margin:"0 0 8px"}}>📋 {pendingTx.length} operación{pendingTx.length!==1?"es":""} detectada{pendingTx.length!==1?"s":""}</p>
                {pendingTx.map((accion,i)=>{
                  const iconos = {transacciones:"💳",pago_prestamo:"💰",aportacion_meta:"🎯",pago_hipoteca:"🏠",transferencia:"↔️",aportacion_inversion:"📈"};
                  const labels = {transacciones:"Transacción",pago_prestamo:"Pago préstamo",aportacion_meta:"Aportación meta",pago_hipoteca:"Pago hipoteca",transferencia:"Transferencia",aportacion_inversion:"Aportación inversión"};
                  const getResumen = (a) => {
                    if(a.tipo==="transacciones") return a.data.map(tx=>`${tx.type==="income"?"+":"-"}${fmt(parseFloat(tx.amount||0))} ${tx.description}`).join(", ");
                    if(a.tipo==="pago_prestamo") { const l=loans.find(x=>x.id===a.data.loanId); return `${fmt(parseFloat(a.data.amount||0))} → ${l?.name||"Préstamo"}`; }
                    if(a.tipo==="aportacion_meta") { const g=goals.find(x=>x.id===a.data.goalId); return `${fmt(parseFloat(a.data.monto||0))} → ${g?.nombre||g?.name||"Meta"}`; }
                    if(a.tipo==="pago_hipoteca") { const m=(mortgages||[]).find(x=>x.id===a.data.mortgageId); return `Mensualidad ${m?.nombre||m?.banco||"Hipoteca"}`; }
                    if(a.tipo==="transferencia") { const f=accounts.find(x=>x.id===a.data.fromId),t=accounts.find(x=>x.id===a.data.toId); return `${fmt(parseFloat(a.data.amount||0))} ${f?.name||"?"} → ${t?.name||"?"}`; }
                    if(a.tipo==="aportacion_inversion") { const inv=investments.find(x=>x.id===a.data.invId); return `${fmt(parseFloat(a.data.amount||0))} → ${inv?.name||"Inversión"}`; }
                    return "";
                  };
                  return (
                    <div key={i} style={{fontSize:11,color:"#aaa",marginBottom:5,display:"flex",gap:6,alignItems:"flex-start"}}>
                      <span>{iconos[accion.tipo]||"📌"}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <span style={{fontSize:10,color:"#555",display:"block"}}>{labels[accion.tipo]||accion.tipo}</span>
                        <span style={{color:"#ccc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>{getResumen(accion)}</span>
                      </div>
                    </div>
                  );
                })}
                <div style={{display:"flex",gap:6,marginTop:8}}>
                  <button onClick={()=>ejecutarAcciones(pendingTx)} style={{flex:1,padding:"6px 0",borderRadius:8,background:"#00d4aa",border:"none",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>✓ Confirmar todo</button>
                  <button onClick={()=>setPendingTx(null)} style={{flex:1,padding:"6px 0",borderRadius:8,background:"rgba(255,71,87,.15)",border:"1px solid rgba(255,71,87,.3)",color:"#ff4757",fontSize:11,fontWeight:600,cursor:"pointer"}}>✕ Cancelar</button>
                </div>
              </div>
            )}

            <div ref={bottomRef}/>
          </div>

          {/* Adjunto preview */}
          {adjunto && (
            <div style={{padding:"6px 14px",borderTop:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              <span style={{fontSize:11,color:"#00d4aa",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📎 {adjunto.name}</span>
              <button onClick={()=>setAdjunto(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#555",fontSize:14,lineHeight:1}}>×</button>
            </div>
          )}

          {/* Input */}
          <div style={{padding:"10px 12px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={handleFile}/>
            <button onClick={()=>fileRef.current?.click()} title="Adjuntar imagen o PDF"
              style={{background:"none",border:"1px solid rgba(255,255,255,.07)",borderRadius:8,cursor:"pointer",color:"#555",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Ic n="attach" size={15}/>
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
              placeholder="Gasté 350 en gasolina..."
              style={{flex:1,padding:"8px 10px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,color:"#e0e0e0",fontSize:12,outline:"none"}}
              onFocus={e=>e.target.style.borderColor="rgba(0,212,170,.4)"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.08)"}
            />
            <button onClick={send} disabled={loading||(!input.trim()&&!adjunto)}
              style={{width:32,height:32,borderRadius:9,background:loading||(!input.trim()&&!adjunto)?"rgba(255,255,255,.05)":"linear-gradient(135deg,#00d4aa,#00a884)",border:"none",cursor:loading||(!input.trim()&&!adjunto)?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .2s"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={loading||(!input.trim()&&!adjunto)?"#444":"#fff"}><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ─── APP SHELL ────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]   = useState(null);
  useEffect(()=>{
    if (!supa) return;
    supa.auth.getSession().then(({data})=>{
      if (data.session) {
        const u = data.session.user;
        setUser({ id: u.id, name: u.user_metadata?.name || u.email, email: u.email });
      }
    });
    const { data: listener } = supa.auth.onAuthStateChange((_event, session)=>{
      if (session) {
        const u = session.user;
        setUser({ id: u.id, name: u.user_metadata?.name || u.email, email: u.email });
      } else { setUser(null); }
    });
    return ()=> listener.subscription.unsubscribe();
  },[]);
  const [active, setActive] = useState("dashboard");
  const [navHistory, setNavHistory] = useState([]); // stack de historial
  const navigate = (dest) => {
    setNavHistory(h => [...h.slice(-19), active]); // guarda hasta 20 pasos
    setActive(dest);
  };
  const goBack = () => {
    setNavHistory(h => {
      const prev = h[h.length-1];
      if (!prev) return h;
      setActive(prev);
      return h.slice(0,-1);
    });
  };
  const [theme, setTheme]   = useState(()=>store.get("fp_theme","dark"));
  const toggleTheme = () => setTheme(t=>{ const n=t==="dark"?"light":"dark"; store.set("fp_theme",n); return n; });
  const isDark = theme==="dark";
  // datos para sistema de notificaciones
  const [ntxs]  = useData(user?.id||"__none__", "transactions");
  const [naccs] = useData(user?.id||"__none__", "accounts");
  const [nloans]= useData(user?.id||"__none__", "loans");
  const [npres] = useData(user?.id||"__none__", "presupuestos");
  const [ngoals]= useData(user?.id||"__none__", "goals");
  const [nmorts]= useData(user?.id||"__none__", "mortgages");
  const [ntrans]= useData(user?.id||"__none__", "transfers");
  const [, setConfigAuto] = useData(user?.id||"__none__", "config", {});
  const notif   = useNotifications(user, ntxs, naccs, nloans, npres, ngoals, nmorts, ntrans);
  // ── Tipo de cambio automático (1 vez por hora)
  useTcAuto(user?.id, setConfigAuto);
  const [toasts, setToasts] = useState([]);
  const [sideOpen, setSideOpen] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth<768);

  useEffect(()=>{ const h=()=>setMobile(window.innerWidth<768); window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h); },[]);


  const toast = useCallback((message,type="success")=>{
    const id=genId();
    setToasts(p=>[...p,{id,message,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4000);
  },[]);

  const logout = async ()=>{ if (supa) await supa.auth.signOut(); setUser(null); };

  if (!user) return <AuthScreen onLogin={setUser}/>;

  const renderModule = (id) => {
    switch(id) {
      case "dashboard":    return <Dashboard/>;
      case "accounts":     return <Accounts/>;
      case "transactions": return <Transactions/>;
      case "recurring":    return <Recurring/>;
      case "transfers":    return <Transfers/>;
      case "loans":        return <Loans/>;
      case "investments":  return <Investments/>;
      case "assets":       return <Assets/>;
      case "mortgage":     return <Mortgage/>;
      case "goals":        return <Metas/>;
      case "presupuestos": return <Presupuestos/>;
      case "conciliacion": return <Conciliacion/>;
      case "importar":     return <ImportarCSV/>;
      case "calendar":     return <CalendarioFinanciero/>;
      case "documents":    return <Documents/>;
      case "reports":      return <Reports/>;
      case "reports:resultados": return <Reports initialTab="resultados"/>;
      case "reports:balance":    return <Reports initialTab="balance"/>;
      case "reports:flujo":      return <Reports initialTab="flujo"/>;
      case "patrimonio":   return <Patrimonio/>;
      case "asistente":    return <Asistente/>;
      case "settings":     return <Settings/>;
      default:
        if(id?.startsWith("transactions:new:")) return <Transactions initialDate={id.split(":")[2]}/>;
        if(id==="transactions:new") return <Transactions initialAccount={sessionStorage.getItem("fp_new_tx_account")||""}/>;
        return <Dashboard/>;
    }
  };

  return (
    <Ctx.Provider value={{ user, toast, navigate, goBack, navHistory, theme, toggleTheme }}>
      <GlobalStyles dark={isDark}/>
      <ToastContainer toasts={toasts} remove={id=>setToasts(p=>p.filter(t=>t.id!==id))}/>
      <div style={{ display:"flex", height:"100vh", background:isDark?"#0d1117":"#f0f2f5", overflow:"hidden", transition:"background .3s" }}>
        <Sidebar active={active} setActive={(dest)=>{setNavHistory([]);setActive(dest);}} user={user} onLogout={logout} mobile={mobile} open={sideOpen} onClose={()=>setSideOpen(false)} notif={notif} theme={theme} onToggleTheme={toggleTheme}/>
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {mobile&&(
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderBottom:`1px solid ${isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.08)"}`, background:isDark?"#0f1520":"#1a1f2e", flexShrink:0 }}>
              <button onClick={()=>setSideOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", color:"#777", display:"flex" }}><Ic n="menu" size={22}/></button>
              <span style={{ fontSize:17, fontFamily:"'Syne',sans-serif", fontWeight:800, color:"#f0f0f0" }}>Finanz<span style={{ color:"#00d4aa" }}>app</span></span>
            </div>
          )}
          <div data-fp="main" style={{ flex:1, overflowY:"auto", padding:mobile?"18px 14px":"26px 30px", background: isDark?"#0d1117":"#f0f4f8", transition:"background .3s" }}>
            {/* ── Botón Atrás — aparece solo cuando hay historial */}
            {navHistory.length>0&&(
              <div style={{marginBottom:12,marginTop:-4}}>
                <button onClick={goBack} style={{
                  display:"inline-flex",alignItems:"center",gap:6,
                  padding:"5px 12px",borderRadius:9,
                  background:"rgba(255,255,255,.05)",
                  border:"1px solid rgba(255,255,255,.08)",
                  color:"#888",cursor:"pointer",fontSize:12,fontWeight:600,
                  transition:"all .15s"
                }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.09)";e.currentTarget.style.color="#ccc";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.05)";e.currentTarget.style.color="#888";}}>
                  ← Volver
                </button>
              </div>
            )}
            <div style={{ maxWidth:1200, animation:"fadeUp .25s ease" }} key={active}>
              {/* recordatorio días sin movimientos */}
              {(()=>{
                const sinTx = notif?.alertas.find(a=>a.esSinTx);
                if(!sinTx||sinTx.diasSin<5) return null;
                return (
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(243,156,18,.07)",border:"1px solid rgba(243,156,18,.2)",borderRadius:10,marginBottom:14,flexWrap:"wrap"}}>
                    <Ic n="warn" size={15} color="#f39c12"/>
                    <span style={{fontSize:12,color:"#f5a623",fontWeight:600,flex:1}}>
                      {sinTx.diasSin>=999?"Aún no has registrado ningún movimiento — ¡empieza hoy!":`Llevas ${sinTx.diasSin} días sin registrar movimientos`}
                    </span>
                    <button onClick={()=>setActive("transactions")} style={{fontSize:11,fontWeight:700,color:"#f39c12",background:"rgba(243,156,18,.15)",border:"1px solid rgba(243,156,18,.25)",borderRadius:7,padding:"4px 10px",cursor:"pointer"}}>
                      Registrar ahora
                    </button>
                  </div>
                );
              })()}
              {renderModule(active)}
            </div>
          </div>
        </div>
      </div>
      <AsisteFlotante/>
    </Ctx.Provider>
  );
}
/* Mon Mar  9 11:54:36 MST 2026 */
/* Mon Mar  9 11:55:07 MST 2026 */
// restore Fri Apr 10 20:26:01 MST 2026
