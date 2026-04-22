import React, { useState, useEffect, useRef, useCallback } from "react";
import { fmt, fmtDate, today, genId } from "./utils";
import {
  Ctx, useCtx, themeTokens, useTheme, ICONS, Ic, Card, Btn, Modal, Inp, Sel,
  supa, store, uKey, getTc, Badge, Actions, ConfirmModal, useConfirm, useData,
  HelpTip,
} from "./shared";
import Metas from "./modules/Metas";
import Mortgage from "./modules/Mortgage";
import Recurring from "./modules/Recurring";

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

const Alert = ({ children, color="#f39c12" }) => (
  <div style={{ background:`${color}11`, border:`1px solid ${color}33`, borderRadius:9, padding:"10px 14px", marginBottom:14, fontSize:13, color, display:"flex", gap:8, alignItems:"flex-start" }}>
    <Ic n="warn" size={15} color={color} /><span>{children}</span>
  </div>
);

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
// ─── CHART COMPONENTS ─────────────────────────────────────────────────────────

// Barras mensuales ingresos vs gastos
const BarChart6M = ({ transactions }) => {
  const now = new Date();
  const meses = Array.from({length:6},(_,i)=>{ const d=new Date(now); d.setMonth(d.getMonth()-5+i); return { mk:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`, label:d.toLocaleDateString("es-MX",{month:"short"}) }; });
  const data = meses.map(m=>({
    ...m,
    ingr: transactions.filter(t=>t.date?.startsWith(m.mk)&&t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0),
    gast: transactions.filter(t=>t.date?.startsWith(m.mk)&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0),
  }));
  const fmt = v => v>=1000?`$${(v/1000).toFixed(0)}k`:`$${v.toFixed(0)}`;
  const maxVal = Math.max(...data.flatMap(d=>[d.ingr,d.gast]),1);
  const H=90, W=520, BAR=28, GAP=4, GRP=W/6;
  const curMk = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  return (
    <div style={{background:"rgba(255,255,255,.02)",borderRadius:12,padding:"16px 18px",border:"1px solid rgba(255,255,255,.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <p style={{fontSize:13,fontWeight:700,color:"#e0e0e0",margin:0}}>Ingresos vs Gastos — 6 meses</p>
        <div style={{display:"flex",gap:14}}>
          <span style={{fontSize:11,color:"#555",display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#00d4aa",display:"inline-block"}}/>Ingresos</span>
          <span style={{fontSize:11,color:"#555",display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#ff4757",display:"inline-block"}}/>Gastos</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H+28}`} style={{width:"100%",overflow:"visible"}}>
        {data.map((d,i)=>{
          const x = i*GRP + (GRP-(BAR*2+GAP))/2;
          const hI = Math.max(Math.round((d.ingr/maxVal)*H),d.ingr>0?2:0);
          const hG = Math.max(Math.round((d.gast/maxVal)*H),d.gast>0?2:0);
          const isCur = d.mk===curMk;
          return (
            <g key={d.mk}>
              <rect x={x} y={H-hI} width={BAR} height={Math.max(hI,1)} rx={4} fill={isCur?"#00d4aa":"#00d4aa44"}/>
              <rect x={x+BAR+GAP} y={H-hG} width={BAR} height={Math.max(hG,1)} rx={4} fill={isCur?"#ff4757":"#ff475744"}/>
              {isCur&&hI>0&&<text x={x+BAR/2} y={H-hI-4} textAnchor="middle" fill="#00d4aa" fontSize="9">{fmt(d.ingr)}</text>}
              {isCur&&hG>0&&<text x={x+BAR+GAP+BAR/2} y={H-hG-4} textAnchor="middle" fill="#ff4757" fontSize="9">{fmt(d.gast)}</text>}
              <text x={x+BAR+GAP/2} y={H+16} textAnchor="middle" fill={isCur?"#aaa":"#444"} fontSize="10" fontWeight={isCur?"700":"400"}>{d.label}</text>
            </g>
          );
        })}
        <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
      </svg>
    </div>
  );
};

// Dona de gastos por categoría
const DonaCategoria = ({ transactions, mes }) => {
  const gastos = transactions.filter(t=>t.date?.startsWith(mes)&&t.type==="expense"&&parseFloat(t.amount||0)>0);
  const total  = gastos.reduce((s,t)=>s+parseFloat(t.amount||0),0);
  if(total===0) return null;
  const COLORS=["#00d4aa","#3b82f6","#f39c12","#a78bfa","#ff6b7a","#10b981","#f97316","#06b6d4","#ec4899","#84cc16"];
  const byCat = Object.entries(gastos.reduce((m,t)=>{ const c=t.category||"Otro"; m[c]=(m[c]||0)+parseFloat(t.amount||0); return m; },{}))
    .sort((a,b)=>b[1]-a[1]).slice(0,8);
  const fmt = v=>v>=1000?`$${(v/1000).toFixed(1)}k`:`$${v.toFixed(0)}`;
  // SVG donut
  const R=52,r=30,cx=65,cy=65;
  let angle=-Math.PI/2;
  const slices = byCat.map(([cat,val],i)=>{
    const pct=val/total; const a=pct*2*Math.PI;
    const x1=cx+R*Math.cos(angle),y1=cy+R*Math.sin(angle);
    const x2=cx+R*Math.cos(angle+a),y2=cy+R*Math.sin(angle+a);
    const xi1=cx+r*Math.cos(angle),yi1=cy+r*Math.sin(angle);
    const xi2=cx+r*Math.cos(angle+a),yi2=cy+r*Math.sin(angle+a);
    const large=a>Math.PI?1:0;
    const path=`M${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${r},${r} 0 ${large},0 ${xi1},${yi1} Z`;
    angle+=a;
    return {cat,val,pct,path,color:COLORS[i%COLORS.length]};
  });
  return (
    <div style={{background:"rgba(255,255,255,.02)",borderRadius:12,padding:"16px 18px",border:"1px solid rgba(255,255,255,.06)"}}>
      <p style={{fontSize:13,fontWeight:700,color:"#e0e0e0",margin:"0 0 14px"}}>Gastos por categoría — este mes</p>
      <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
        <svg viewBox="0 0 130 130" style={{width:130,height:130,flexShrink:0}}>
          {slices.map((s,i)=><path key={i} d={s.path} fill={s.color} opacity=".9"/>)}
          <text x={cx} y={cy-6} textAnchor="middle" fill="#888" fontSize="9">Total</text>
          <text x={cx} y={cy+8} textAnchor="middle" fill="#e0e0e0" fontSize="11" fontWeight="700">{fmt(total)}</text>
        </svg>
        <div style={{flex:1,minWidth:140,display:"flex",flexDirection:"column",gap:5}}>
          {slices.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0,display:"inline-block"}}/>
              <span style={{fontSize:11,color:"#aaa",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.cat}</span>
              <span style={{fontSize:11,fontWeight:700,color:"#e0e0e0",flexShrink:0}}>{(s.pct*100).toFixed(0)}%</span>
              <span style={{fontSize:10,color:"#555",flexShrink:0,minWidth:45,textAlign:"right"}}>{fmt(s.val)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Línea de saldo préstamo (amortización visual)
const AmortizacionChart = ({ loan, pagos }) => {
  if(!loan||!pagos||pagos.length<1) return null;
  const principal = parseFloat(loan.principal||0);
  if(principal<=0) return null;
  const pts = [{fecha:loan.startDate,saldo:principal},...pagos.map(p=>({fecha:p.date,saldo:Math.max(parseFloat(p.saldoRestante||0),0)}))];
  const W=480,H=80;
  const minS=0,maxS=principal;
  const toX=(i)=>(i/(pts.length-1||1))*W;
  const toY=(v)=>H-Math.round(((v-minS)/(maxS-minS||1))*H);
  const pathD=pts.map((p,i)=>`${i===0?"M":"L"}${toX(i)},${toY(p.saldo)}`).join(" ");
  const areaD=`${pathD} L${W},${H} L0,${H} Z`;
  const fmt=v=>v>=1000?`$${(v/1000).toFixed(1)}k`:`$${v.toFixed(0)}`;
  const ultimo=pts[pts.length-1];
  return (
    <div style={{background:"rgba(255,255,255,.02)",borderRadius:12,padding:"16px 18px",border:"1px solid rgba(255,255,255,.06)",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <p style={{fontSize:13,fontWeight:700,color:"#e0e0e0",margin:0}}>Progreso del préstamo</p>
        <span style={{fontSize:11,color:"#555"}}>{pagos.length} pago{pagos.length!==1?"s":""} registrados</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H+4}`} style={{width:"100%",overflow:"visible"}}>
        <defs>
          <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02"/>
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#loanGrad)"/>
        <path d={pathD} stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinejoin="round"/>
        {pts.length>1&&<circle cx={toX(pts.length-1)} cy={toY(ultimo.saldo)} r="4" fill="#3b82f6"/>}
        <text x={0} y={H+14} fill="#444" fontSize="9">{pts[0]?.fecha}</text>
        <text x={W} y={H+14} textAnchor="end" fill="#444" fontSize="9">{ultimo?.fecha}</text>
        <text x={0} y={10} fill="#555" fontSize="9">{fmt(maxS)}</text>
        <text x={0} y={H-2} fill="#555" fontSize="9">{fmt(0)}</text>
      </svg>
      <div style={{display:"flex",gap:16,marginTop:8,flexWrap:"wrap"}}>
        <div><p style={{fontSize:10,color:"#555",margin:"0 0 1px"}}>Capital inicial</p><p style={{fontSize:14,fontWeight:700,color:"#3b82f6",margin:0}}>{fmt(principal)}</p></div>
        <div><p style={{fontSize:10,color:"#555",margin:"0 0 1px"}}>Saldo restante</p><p style={{fontSize:14,fontWeight:700,color:"#f39c12",margin:0}}>{fmt(ultimo.saldo)}</p></div>
        <div><p style={{fontSize:10,color:"#555",margin:"0 0 1px"}}>Pagado</p><p style={{fontSize:14,fontWeight:700,color:"#00d4aa",margin:0}}>{fmt(principal-ultimo.saldo)}</p></div>
        <div><p style={{fontSize:10,color:"#555",margin:"0 0 1px"}}>Avance</p><p style={{fontSize:14,fontWeight:700,color:"#00d4aa",margin:0}}>{((principal-ultimo.saldo)/principal*100).toFixed(1)}%</p></div>
      </div>
    </div>
  );
};

// Dona portafolio inversiones
const PortafolioChart = ({ investments, tc=17.5 }) => {
  const [vista, setVista] = React.useState("tipo");
  const [hoverSlice, setHoverSlice] = React.useState(null);
  const activas = investments.filter(i=>i.status!=="closed"&&i.estado!=="liquidada");
  if(activas.length===0) return null;
  const TC = tc;
  const COLORS_TIPO = {"Criptomonedas":"#f39c12","Acciones / ETFs":"#3b82f6","Fondo de Inversión":"#00d4aa","Fondo Inmobiliario":"#a78bfa","Otro":"#666"};
  const COLORS_INV = ["#00d4aa","#3b82f6","#f39c12","#a78bfa","#ff6b7a","#10b981","#f97316","#06b6d4","#e11d48","#84cc16","#0ea5e9","#d946ef"];
  const fmtV = v => v>=1000000?`$${(v/1000000).toFixed(2)}M`:v>=1000?`$${(v/1000).toFixed(1)}k`:`$${v.toFixed(0)}`;
  const withVal = activas.map(inv=>{
    const aps=(inv.aportaciones||[]).reduce((s,a)=>s+parseFloat(a.amount||0)*(a.currency==="USD"?TC:1),0);
    const cobs=(inv.cobros||[]).filter(c=>["retiro_parcial","retiro_total"].includes(c.tipoCobro)).reduce((s,c)=>s+parseFloat(c.monto||0)*(c.currency==="USD"?TC:1),0);
    const t=parseFloat(inv.titulos)||0, p=parseFloat(inv.precioActual)||0;
    const valDirecto=t>0&&p>0?t*p*(inv.currency==="USD"?TC:1):parseFloat(inv.currentValue||0)*(inv.currency==="USD"?TC:1);
    const valor=valDirecto>0?valDirecto:Math.max(aps-cobs,0);
    const tipoRaw=inv.type||inv.tipo||"Otro";
    const tipo=tipoRaw.includes("Cripto")?"Criptomonedas":tipoRaw.includes("Accion")||tipoRaw.includes("ETF")?"Acciones / ETFs":tipoRaw.includes("Fondo Inm")||tipoRaw.includes("Inmobili")?"Fondo Inmobiliario":tipoRaw.includes("Fondo")||tipoRaw.includes("Inversion")||tipoRaw.includes("Inversión")?"Fondo de Inversión":"Otro";
    return {...inv,valor,tipo};
  }).filter(i=>i.valor>0);
  const total=withVal.reduce((s,i)=>s+i.valor,0);
  if(total===0) return null;
  const porTipo={};
  withVal.forEach(i=>{porTipo[i.tipo]=(porTipo[i.tipo]||0)+i.valor;});
  const tiposArr=Object.entries(porTipo).sort((a,b)=>b[1]-a[1]).map(([tipo,valor])=>({label:tipo,valor,pct:valor/total,color:COLORS_TIPO[tipo]||"#666",items:withVal.filter(i=>i.tipo===tipo).sort((a,b)=>b.valor-a.valor)}));
  const slices=(vista==="tipo"?tiposArr.map(t=>({label:t.label,valor:t.valor,pct:t.pct,color:t.color})):withVal.sort((a,b)=>b.valor-a.valor).map((inv,i)=>({label:inv.nombre||inv.instrumento||inv.ticker||"—",valor:inv.valor,pct:inv.valor/total,color:COLORS_INV[i%COLORS_INV.length]})));
  const R=70,r=42,cx=80,cy=80;
  let angle=-Math.PI/2;
  const paths=slices.map((s,i)=>{
    const a=s.pct*2*Math.PI;
    const x1=cx+R*Math.cos(angle),y1=cy+R*Math.sin(angle);
    const x2=cx+R*Math.cos(angle+a),y2=cy+R*Math.sin(angle+a);
    const xi1=cx+r*Math.cos(angle),yi1=cy+r*Math.sin(angle);
    const xi2=cx+r*Math.cos(angle+a),yi2=cy+r*Math.sin(angle+a);
    const large=a>Math.PI?1:0;
    const path=`M${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${xi2.toFixed(2)},${yi2.toFixed(2)} A${r},${r} 0 ${large},0 ${xi1.toFixed(2)},${yi1.toFixed(2)} Z`;
    angle+=a;
    return {...s,path,idx:i};
  });
  const hov=hoverSlice!=null?paths[hoverSlice]:null;
  return (
    <div style={{background:"rgba(255,255,255,.02)",borderRadius:14,padding:"18px 20px",border:"1px solid rgba(255,255,255,.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div>
          <p style={{fontSize:14,fontWeight:700,color:"#e0e0e0",margin:"0 0 2px"}}>Distribución del portafolio</p>
          <p style={{fontSize:11,color:"#555",margin:0}}>{activas.length} inversiones · {fmtV(total)} total</p>
        </div>
        <div style={{display:"flex",gap:2,background:"rgba(255,255,255,.04)",borderRadius:8,padding:3}}>
          {[["tipo","Por tipo"],["instrumento","Por activo"]].map(([v,l])=>(
            <button key={v} onClick={()=>setVista(v)} style={{padding:"5px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:vista===v?"rgba(0,212,170,.15)":"transparent",color:vista===v?"#00d4aa":"#555",transition:"all .15s"}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>
        <div style={{flexShrink:0}}>
          <svg viewBox="0 0 160 160" style={{width:160,height:160}} onMouseLeave={()=>setHoverSlice(null)}>
            {paths.map((s,i)=>(
              <path key={i} d={s.path} fill={s.color} opacity={hoverSlice===null||hoverSlice===i?1:.3} style={{cursor:"pointer",transition:"opacity .15s"}} onMouseEnter={()=>setHoverSlice(i)}/>
            ))}
            {hov?(
              <>
                <text x={cx} y={cy-10} textAnchor="middle" fill="#aaa" fontSize="7.5" style={{pointerEvents:"none"}}>{hov.label.length>16?hov.label.slice(0,14)+"…":hov.label}</text>
                <text x={cx} y={cy+4} textAnchor="middle" fill={hov.color} fontSize="11" fontWeight="700" style={{pointerEvents:"none"}}>{(hov.pct*100).toFixed(1)}%</text>
                <text x={cx} y={cy+17} textAnchor="middle" fill="#e0e0e0" fontSize="8.5" style={{pointerEvents:"none"}}>{fmtV(hov.valor)}</text>
              </>
            ):(
              <>
                <text x={cx} y={cy-4} textAnchor="middle" fill="#666" fontSize="8" style={{pointerEvents:"none"}}>Total</text>
                <text x={cx} y={cy+10} textAnchor="middle" fill="#e0e0e0" fontSize="11" fontWeight="700" style={{pointerEvents:"none"}}>{fmtV(total)}</text>
              </>
            )}
          </svg>
        </div>
        <div style={{flex:1,minWidth:200}}>
          {vista==="tipo"?(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {tiposArr.map((t,i)=>(
                <div key={t.label}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{width:10,height:10,borderRadius:3,background:t.color,flexShrink:0}}/>
                    <span style={{fontSize:12,fontWeight:700,color:"#e0e0e0",flex:1}}>{t.label}</span>
                    <span style={{fontSize:12,fontWeight:700,color:t.color}}>{(t.pct*100).toFixed(1)}%</span>
                    <span style={{fontSize:11,color:"#555",minWidth:52,textAlign:"right"}}>{fmtV(t.valor)}</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,.05)",marginBottom:4}}>
                    <div style={{height:"100%",borderRadius:2,background:t.color,width:`${t.pct*100}%`,transition:"width .5s"}}/>
                  </div>
                  <div style={{paddingLeft:18,display:"flex",flexDirection:"column",gap:2}}>
                    {t.items.map((inv,j)=>(
                      <div key={j} style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:10,color:"#555",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inv.nombre||inv.instrumento||inv.ticker||"—"}</span>
                        <span style={{fontSize:10,color:"#666"}}>{((inv.valor/total)*100).toFixed(1)}%</span>
                        <span style={{fontSize:10,color:"#444",minWidth:48,textAlign:"right"}}>{fmtV(inv.valor)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 12px"}}>
              {paths.map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 6px",borderRadius:7,background:hoverSlice===i?"rgba(255,255,255,.04)":"transparent",cursor:"default"}} onMouseEnter={()=>setHoverSlice(i)} onMouseLeave={()=>setHoverSlice(null)}>
                  <span style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:10,fontWeight:600,color:"#ccc",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.label}</p>
                    <div style={{display:"flex",gap:4,alignItems:"center",marginTop:1}}>
                      <div style={{flex:1,height:3,borderRadius:2,background:"rgba(255,255,255,.06)"}}>
                        <div style={{height:"100%",borderRadius:2,background:s.color,width:`${s.pct*100}%`}}/>
                      </div>
                      <span style={{fontSize:9,color:"#555"}}>{(s.pct*100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <span style={{fontSize:10,color:"#666",textAlign:"right"}}>{fmtV(s.valor)}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{marginTop:10,paddingTop:8,borderTop:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:"#444"}}>{activas.length} activo{activas.length!==1?"s":""}</span>
            <span style={{fontSize:13,fontWeight:800,color:"#00d4aa"}}>{fmtV(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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

// ─── ALERTAS PANEL ────────────────────────────────────────────────────────────
const AlertasPanel = ({ alertas, onNavigate }) => {
  const NIVEL_COLOR = {error:"#ff4757",warning:"#f39c12",info:"#3b82f6"};
  const NIVEL_BG    = {error:"rgba(255,71,87,.08)",warning:"rgba(243,156,18,.07)",info:"rgba(59,130,246,.07)"};

  const errores = alertas.filter(a=>a.nivel==="error");

  // Leídas persisten en localStorage — errores críticos NUNCA se ocultan
  const LEIDAS_KEY = "fp_alertas_leidas";
  const [leidas, setLeidas] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(LEIDAS_KEY)||"[]"); } catch { return []; }
  });
  const marcarLeida = (e, a) => {
    e.stopPropagation();
    const key = a.id||a.msg;
    const nuevas = [...leidas, key];
    localStorage.setItem(LEIDAS_KEY, JSON.stringify(nuevas));
    setLeidas(nuevas);
  };

  const visibles = alertas.filter(a => a.nivel==="error" || !leidas.includes(a.id||a.msg));
  const noLeidas = visibles.filter(a=>a.nivel!=="error");
  const [collapsed, setCollapsed] = React.useState(errores.length===0);

  if (visibles.length===0) return null;

  return (
    <div style={{borderRadius:12,border:`1px solid ${errores.length>0?"rgba(255,71,87,.2)":"rgba(255,255,255,.07)"}`,overflow:"hidden",background:errores.length>0?"rgba(255,71,87,.03)":"rgba(255,255,255,.02)"}}>
      <div onClick={()=>setCollapsed(c=>!c)}
        style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",
          borderBottom:collapsed?"none":"1px solid rgba(255,255,255,.05)"}}>
        <Ic n="warn" size={14} color={errores.length>0?"#ff4757":"#f39c12"}/>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          {errores.length>0&&<span style={{fontSize:12,fontWeight:700,color:"#ff4757"}}>{errores.length} crítica{errores.length>1?"s":""}</span>}
          {noLeidas.length>0&&<span style={{fontSize:12,fontWeight:700,color:"#f39c12"}}>{errores.length>0?"·":""} {noLeidas.length} aviso{noLeidas.length>1?"s":""}</span>}
          {collapsed&&errores.length>0&&<span style={{fontSize:11,color:"#666",marginLeft:4}}>{errores[0].msg}</span>}
        </div>
        <span style={{fontSize:10,color:"#444"}}>{collapsed?"▾":"▴"}</span>
      </div>
      {!collapsed&&(
        <div style={{display:"flex",flexDirection:"column",gap:1,padding:"6px 8px"}}>
          {visibles.map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 10px",
              background:NIVEL_BG[a.nivel],borderRadius:8,transition:"background .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=`${NIVEL_COLOR[a.nivel]}15`}
              onMouseLeave={e=>e.currentTarget.style.background=NIVEL_BG[a.nivel]}>
              <div style={{width:6,height:6,borderRadius:"50%",background:NIVEL_COLOR[a.nivel],flexShrink:0,marginTop:5}}/>
              <div style={{flex:1,minWidth:0,cursor:a.modulo?"pointer":"default"}}
                onClick={()=>a.modulo&&onNavigate&&onNavigate(a.modulo)}>
                <p style={{fontSize:12,fontWeight:700,color:NIVEL_COLOR[a.nivel],margin:"0 0 2px"}}>{a.msg}</p>
                {a.detalle&&<p style={{fontSize:11,color:"#555",margin:0}}>{a.detalle}</p>}
              </div>
              {a.nivel!=="error"&&(
                <button onClick={e=>marcarLeida(e,a)} title="Marcar como leída"
                  style={{fontSize:11,color:"#444",background:"none",border:"1px solid rgba(255,255,255,.08)",
                    borderRadius:6,padding:"2px 8px",cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}
                  onMouseEnter={e=>{e.currentTarget.style.color="#00d4aa";e.currentTarget.style.borderColor="rgba(0,212,170,.3)";}}
                  onMouseLeave={e=>{e.currentTarget.style.color="#444";e.currentTarget.style.borderColor="rgba(255,255,255,.08)";}}>
                  ✓ leído
                </button>
              )}
            </div>
          ))}
          {noLeidas.length>1&&(
            <button onClick={e=>{
              e.stopPropagation();
              const keys=noLeidas.map(a=>a.id||a.msg);
              const nuevas=[...leidas,...keys];
              localStorage.setItem(LEIDAS_KEY,JSON.stringify(nuevas));
              setLeidas(nuevas);
            }} style={{margin:"4px 2px 2px",padding:"6px 0",background:"rgba(255,255,255,.03)",
              border:"1px solid rgba(255,255,255,.07)",borderRadius:8,cursor:"pointer",
              fontSize:11,color:"#555",width:"100%"}}
              onMouseEnter={e=>e.currentTarget.style.color="#888"}
              onMouseLeave={e=>e.currentTarget.style.color="#555"}>
              ✓ Marcar todos los avisos como leídos
            </button>
          )}
        </div>
      )}
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
const LineChartPatrimonio = ({ snapshots, onVerTodo }) => {
  const [rango, setRango] = useState("6m");
  const [hover, setHover] = useState(null);

  const filtrar = (snaps) => {
    const corte = new Date();
    if (rango === "1m") corte.setMonth(corte.getMonth()-1);
    else if (rango === "3m") corte.setMonth(corte.getMonth()-3);
    else if (rango === "6m") corte.setMonth(corte.getMonth()-6);
    else if (rango === "1y") corte.setFullYear(corte.getFullYear()-1);
    else return snaps;
    return snaps.filter(s => new Date(s.fecha) >= corte);
  };

  const snapsOrd = [...(snapshots||[])].sort((a,b)=>new Date(a.fecha)-new Date(b.fecha));
  const vis = filtrar(snapsOrd);

  if (vis.length < 2) return (
    <Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <p style={{fontSize:13,fontWeight:700,color:"#ccc",margin:0}}>Evolución del Patrimonio</p>
        <span style={{fontSize:11,color:"#555"}}>Acumulando datos...</span>
      </div>
      <div style={{height:80,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <p style={{fontSize:12,color:"#444",textAlign:"center"}}>La gráfica aparecerá después de algunos días de uso 📈</p>
      </div>
    </Card>
  );

  const W = 520, H = 100, PAD = 10;
  const vals = vis.map(s => s.patrimonioNeto||0);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const rng  = maxV - minV || 1;
  const toX  = i => PAD + (i/(vis.length-1))*(W-PAD*2);
  const toY  = v => PAD + (1-(v-minV)/rng)*(H-PAD*2);
  const pts  = vis.map((s,i) => [toX(i), toY(s.patrimonioNeto||0)]);
  const path = pts.map((p,i) => (i===0?`M${p[0]},${p[1]}`:`L${p[0]},${p[1]}`)).join(" ");
  const area = `${path} L${pts[pts.length-1][0]},${H+10} L${pts[0][0]},${H+10} Z`;
  const primero = vals[0], ultimo = vals[vals.length-1];
  const delta   = ultimo - primero;
  const deltaPct= primero !== 0 ? (delta/Math.abs(primero)*100) : 0;
  const isPos   = delta >= 0;
  const color   = isPos ? "#00d4aa" : "#ff4757";
  const fmt2 = v => { const abs=Math.abs(v); if(abs>=1000000) return `${(v/1000000).toFixed(2)}M`; if(abs>=1000) return `${(v/1000).toFixed(0)}k`; return v.toFixed(0); };
  const fmtFull = v => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:0}).format(v);

  return (
    <Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <p style={{fontSize:13,fontWeight:700,color:"#ccc",margin:0}}>Evolución del Patrimonio</p>
          <span style={{fontSize:11,fontWeight:700,color,background:isPos?"rgba(0,212,170,.1)":"rgba(255,71,87,.1)",padding:"2px 8px",borderRadius:20}}>
            {isPos?"+":""}{deltaPct.toFixed(1)}% en el período
          </span>
        </div>
        <div style={{display:"flex",gap:4}}>
          {[["1m","1M"],["3m","3M"],["6m","6M"],["1y","1A"],["all","Todo"]].map(([v,l])=>(
            <button key={v} onClick={()=>setRango(v)} style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6,border:"none",cursor:"pointer",background:rango===v?color:"rgba(255,255,255,.05)",color:rango===v?"#000":"#555",transition:"all .2s"}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:9,color:"#333"}}>Mín: <strong style={{color:"#ff4757"}}>${fmt2(minV)}</strong></span>
        <span style={{fontSize:9,color:"#333"}}>Máx: <strong style={{color:"#00d4aa"}}>${fmt2(maxV)}</strong></span>
      </div>
      <div style={{position:"relative"}} onMouseLeave={()=>setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H+10}`} style={{width:"100%",overflow:"visible",display:"block"}}>
          <defs>
            <linearGradient id="patGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
              <stop offset="100%" stopColor={color} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={area} fill="url(#patGrad)"/>
          <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
          {hover!==null && pts[hover] && (
            <>
              <line x1={pts[hover][0]} y1={0} x2={pts[hover][0]} y2={H+10} stroke="rgba(255,255,255,.1)" strokeWidth="1" strokeDasharray="3,3"/>
              <circle cx={pts[hover][0]} cy={pts[hover][1]} r="4" fill={color} stroke="#1a1a2e" strokeWidth="2"/>
            </>
          )}
          {vis.map((_,i)=>(
            <rect key={i} x={pts[i][0]-12} y={0} width={24} height={H+10} fill="transparent" onMouseEnter={()=>setHover(i)} style={{cursor:"crosshair"}}/>
          ))}
        </svg>
        {hover!==null && vis[hover] && (()=>{
          const snap = vis[hover];
          const prev = hover>0 ? vis[hover-1] : null;
          const varVsPrev = prev ? (snap.patrimonioNeto||0)-(prev.patrimonioNeto||0) : null;
          const leftPct = pts[hover][0]/W*100;
          return (
            <div style={{
              position:"absolute",top:-4,
              left:leftPct>60?"auto":`calc(${leftPct}% + 10px)`,
              right:leftPct>60?`calc(${(1-pts[hover][0]/W)*100}% + 10px)`:"auto",
              background:"rgba(18,22,36,.97)",border:"1px solid rgba(255,255,255,.12)",
              borderRadius:10,padding:"10px 13px",pointerEvents:"none",zIndex:10,minWidth:185,
              boxShadow:"0 8px 24px rgba(0,0,0,.5)"
            }}>
              <p style={{fontSize:10,color:"#555",margin:"0 0 7px",fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>
                {new Date(snap.fecha+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}
              </p>
              <div style={{marginBottom:7,paddingBottom:7,borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                <p style={{fontSize:10,color:"#555",margin:"0 0 1px"}}>Patrimonio Neto</p>
                <p style={{fontSize:17,fontWeight:800,color,margin:0,lineHeight:1}}>{fmtFull(snap.patrimonioNeto||0)}</p>
                {varVsPrev!==null && (
                  <p style={{fontSize:10,color:varVsPrev>=0?"#00d4aa":"#ff4757",margin:"2px 0 0",fontWeight:600}}>
                    {varVsPrev>=0?"▲":"▼"} {fmtFull(Math.abs(varVsPrev))} vs anterior
                  </p>
                )}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {snap.liquidezTotal!==undefined && (
                  <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                    <span style={{fontSize:11,color:"#555"}}>💧 Liquidez</span>
                    <span style={{fontSize:11,color:"#3b82f6",fontWeight:600}}>{fmtFull(snap.liquidezTotal||0)}</span>
                  </div>
                )}
                {snap.inversionesMXN!==undefined && snap.inversionesMXN>0 && (
                  <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                    <span style={{fontSize:11,color:"#555"}}>📈 Inversiones</span>
                    <span style={{fontSize:11,color:"#f39c12",fontWeight:600}}>{fmtFull(snap.inversionesMXN||0)}</span>
                  </div>
                )}
                {snap.deudaTotal!==undefined && snap.deudaTotal>0 && (
                  <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                    <span style={{fontSize:11,color:"#555"}}>📉 Deuda</span>
                    <span style={{fontSize:11,color:"#ff4757",fontWeight:600}}>-{fmtFull(snap.deudaTotal||0)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
        <span style={{fontSize:9,color:"#333"}}>{vis[0]?.fecha}</span>
        <button onClick={onVerTodo} style={{fontSize:9,color:"#00d4aa",background:"none",border:"none",cursor:"pointer",padding:0}}>Ver detalle completo →</button>
        <span style={{fontSize:9,color:"#333"}}>{vis[vis.length-1]?.fecha}</span>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const { user, navigate } = useCtx();
  const [accounts, setAccounts] = useData(user.id, "accounts");
  const [transactions, setTransactions] = useData(user.id, "transactions");
  const [loans]        = useData(user.id, "loans");
  const [investments]  = useData(user.id, "investments");
  const [recurrents, setRecurrents] = useData(user.id, "recurrents");
  const [goals]        = useData(user.id, "goals");
  const [presupuestos] = useData(user.id, "presupuestos");
  const [mortgages]    = useData(user.id, "mortgages");
  const [assets]       = useData(user.id, "assets", []);
  const [snapshots]    = useData(user.id, "patrimonio_snaps");
  const now = new Date();
  const TC = getTc(user.id);

  // ── helpers
  const mesKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const mesAnteriorKey = (() => {
    const d = new Date(now.getFullYear(), now.getMonth()-1, 1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  })();

  const calcInvVal = inv => {
    const ap = (inv.aportaciones||[]).reduce((s,a)=>s+parseFloat(a.amount||0),0);
    const t=parseFloat(inv.titulos)||0, p=parseFloat(inv.precioActual)||0;
    const val = t>0&&p>0 ? t*p : parseFloat(inv.currentValue)||ap;
    return inv.currency==="USD" ? val*TC : val;
  };

  const calcLoanBalance = loan => {
    const dr=(parseFloat(loan.rate)||0)/100/(loan.rateType==="annual"?365:30);
    let bal=parseFloat(loan.principal||0), last=new Date(loan.startDate+"T12:00:00");
    for(const p of [...(loan.payments||[])].sort((a,b)=>new Date(a.date)-new Date(b.date))){
      const days=Math.max(0,Math.floor((new Date(p.date+"T12:00:00")-last)/86400000));
      bal=Math.max(0, bal-(p.amount - Math.min(p.amount, bal*dr*days)));
      last=new Date(p.date+"T12:00:00");
    }
    return bal;
  };

  const calcMortgageBalance = m => {
    const P=parseFloat(m.monto)||0,n=(parseFloat(m.plazoAnios)||0)*12,r=(parseFloat(m.tasaAnual)||0)/100/12;
    if(!P||!n||!r) return P;
    const c=m.tipo==="fijo"?(P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1):P/n;
    let s=P; const pg=(m.pagosRealizados||[]).length;
    for(let i=0;i<pg;i++){const int=s*r;s=Math.max(s-(m.tipo==="fijo"?c-int:P/n),0);}
    return s;
  };

  // ── totales patrimonio
  const liquidezTotal = accounts.filter(a=>a.type!=="credit")
    .reduce((s,a)=>s+(a.currency==="USD"?parseFloat(a.balance||0)*TC:parseFloat(a.balance||0)),0);
  // Inversiones: excluir liquidadas (su valor ya está en liquidez)
  const invTotal  = investments.filter(i=>i.estado!=="liquidada").reduce((s,i)=>s+calcInvVal(i),0);
  // Hipotecas: método tabla completa (igual que módulo Patrimonio)
  const calcHipBal = (m) => {
    const P=parseFloat(m.monto)||0, n=(parseFloat(m.plazoAnios)||0)*12, r=(parseFloat(m.tasaAnual)||0)/100/12;
    if(!P||!n||!r) return P;
    const cuota=m.tipo==="fijo"?(P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1):P/n;
    let saldo=P;
    for(let i=1;i<=(m.pagosRealizados||[]).length;i++){const int=saldo*r;saldo=Math.max(saldo-(m.tipo==="fijo"?cuota-int:P/n),0);}
    return saldo;
  };
  const deudaPrestamos = loans.filter(l=>l.type==="received").reduce((s,l)=>s+calcLoanBalance(l),0);
  const deudaHipotecas = (mortgages||[]).reduce((s,m)=>s+calcHipBal(m),0);
  const deudaTotal = deudaPrestamos + deudaHipotecas;
  const porCobrar = loans.filter(l=>l.type==="given").reduce((s,l)=>s+calcLoanBalance(l),0);
  // Activos físicos: convertir USD correctamente
  const totalActivos = (assets||[]).reduce((s,a)=>s+(parseFloat(a.valorActual||0)*(a.moneda==="USD"?TC:1)),0);
  const deudaTarjetas = accounts.filter(a=>a.type==="credit").reduce((s,a)=>s+Math.abs(Math.min(parseFloat(a.balance||0),0)),0);
  const patrimonioNeto = liquidezTotal + invTotal + porCobrar + totalActivos - deudaTotal - deudaTarjetas;

  // ── flujo mes actual y anterior
  const txMes  = transactions.filter(t=>t.date?.startsWith(mesKey));
  const txMesA = transactions.filter(t=>t.date?.startsWith(mesAnteriorKey));
  const ingrMes  = txMes.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
  const gastMes  = txMes.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
  const ingrMesA = txMesA.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
  const gastMesA = txMesA.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
  const flujoMes = ingrMes - gastMes;
  const margenMes = ingrMes>0?(flujoMes/ingrMes*100):0;

  // ── flujo acumulado del año en curso
  const flujoAcumuladoAnio = (() => {
    const anio = now.getFullYear();
    const txAnio = transactions.filter(t=>t.date?.startsWith(String(anio)));
    const ingrAnio = txAnio.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const gastAnio = txAnio.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    return { ingr:ingrAnio, gast:gastAnio, neto:ingrAnio-gastAnio };
  })();
  const mesesTranscurridos = now.getMonth()+1; // 1-12
  const deltaGastos = gastMesA>0 ? ((gastMes-gastMesA)/gastMesA*100) : 0;
  const deltaIngresos = ingrMesA>0 ? ((ingrMes-ingrMesA)/ingrMesA*100) : 0;

  // ── recurrentes pendientes del mes (proyección)
  const calcNextRec = (r) => {
    const inicioStr = r.ultimoRegistro || (r.fechaInicio && r.fechaInicio.length>=8 ? r.fechaInicio : today());
    const last = new Date(inicioStr+"T12:00:00");
    const next = new Date(isNaN(last)?new Date():last);
    if(r.frecuencia==="mensual") next.setMonth(next.getMonth()+1);
    else if(r.frecuencia==="quincenal") next.setDate(next.getDate()+15);
    else if(r.frecuencia==="semanal") next.setDate(next.getDate()+7);
    else if(r.frecuencia==="anual") next.setFullYear(next.getFullYear()+1);
    return next;
  };
  const recPendientesMes = (recurrents||[]).filter(r=>r.activo!==false&&calcNextRec(r)<=now);
  const ingrRecPend = recPendientesMes.filter(r=>r.tipo==="income").reduce((s,r)=>s+parseFloat(r.monto||0),0);
  const gastRecPend = recPendientesMes.filter(r=>r.tipo==="expense").reduce((s,r)=>s+parseFloat(r.monto||0),0);
  const flujoProy = (ingrMes+ingrRecPend) - (gastMes+gastRecPend);

  // ── gráfica 6 meses ingresos vs gastos
  const ultimos6Meses = (() => {
    const meses = [];
    for(let i=5;i>=0;i--){
      const d=new Date(now.getFullYear(),now.getMonth()-i,1);
      const mk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const ingr=transactions.filter(t=>t.date?.startsWith(mk)&&t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
      const gast=transactions.filter(t=>t.date?.startsWith(mk)&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
      meses.push({mk, label:d.toLocaleDateString("es-MX",{month:"short"}), ingr, gast, util:ingr-gast, esMesActual:i===0});
    }
    return meses;
  })();

  // ── score de salud simplificado (mismo cálculo que Patrimonio)
  const gastoProm3M = (() => {
    let total=0,meses=0;
    for(let i=1;i<=3;i++){
      const d=new Date(now.getFullYear(),now.getMonth()-i,1);
      const mk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const g=transactions.filter(t=>t.date?.startsWith(mk)&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
      if(g>0){total+=g;meses++;}
    }
    return meses>0?total/meses:0;
  })();
  const emergenciaMeses = gastoProm3M>0 ? liquidezTotal/gastoProm3M : 0;
  const tasaAhorro = ingrMes>0 ? (flujoMes/ingrMes*100) : 0;
  const razDeuda = patrimonioNeto>0 ? (deudaTotal/patrimonioNeto*100) : 0;
  const scoreHealth = Math.round((
    (razDeuda<=30?100:razDeuda<=50?75:razDeuda<=75?45:20) +
    (tasaAhorro>=20?100:tasaAhorro>=10?70:tasaAhorro>=0?40:0) +
    (emergenciaMeses>=6?100:emergenciaMeses>=3?70:emergenciaMeses>=1?35:10) +
    (invTotal/Math.max(patrimonioNeto,1)*100>=20?100:invTotal>0?60:10)
  ) / 4);
  const scoreColor = scoreHealth>=80?"#00d4aa":scoreHealth>=60?"#f39c12":"#ff4757";
  const scoreLabel = scoreHealth>=80?"Excelente":scoreHealth>=60?"Buena":scoreHealth>=40?"Regular":"Atención";

  // ── alertas inteligentes priorizadas
  const alertas = [];

  // ── NIVEL ERROR ────────────────────────────────────────────────────────────
  // 1. Préstamos vencidos
  const vencidos = loans.filter(l=>l.dueDate&&new Date(l.dueDate)<now&&calcLoanBalance(l)>0.01);
  if(vencidos.length) alertas.push({
    nivel:"error",icono:"warn",
    msg:`${vencidos.length} préstamo${vencidos.length>1?"s":""} vencido${vencidos.length>1?"s":""}`,
    detalle:`Revisa tus préstamos activos`,modulo:"loans"});

  // 2. Saldo negativo en cuenta normal
  accounts.filter(a=>a.type!=="credit"&&parseFloat(a.balance||0)<0).forEach(a=>
    alertas.push({nivel:"error",icono:"warn",
      msg:`Saldo negativo en ${a.name}`,
      detalle:`${fmt(parseFloat(a.balance||0))} — requiere atención inmediata`,modulo:"accounts"})
  );

  // 3. Pago de tarjeta vencido — solo si hay saldo real
  accounts.filter(a=>a.type==="credit"&&a.fechaPago).forEach(a=>{
    const saldo=Math.abs(Math.min(parseFloat(a.balance||0),0));
    if(saldo<1) return;
    const dias=Math.round((new Date(a.fechaPago+"T12:00:00")-now)/86400000);
    if(dias<0) alertas.push({nivel:"error",icono:"warn",
      msg:`Pago vencido: ${a.name}`,
      detalle:`Venció hace ${Math.abs(dias)} día${Math.abs(dias)!==1?"s":""} · Deuda: ${fmt(saldo)}`,modulo:"accounts"});
  });

  // 4. Presupuestos excedidos
  const presExcedidos = presupuestos.filter(p=>{
    if(!p.activo) return false;
    const gastado=transactions.filter(t=>t.date?.startsWith(mesKey)&&t.type==="expense"&&(p.tipo==="global"||t.category===p.categoria)).reduce((s,t)=>s+parseFloat(t.amount||0),0);
    return gastado>(parseFloat(p.montoLimite)||0);
  });
  presExcedidos.forEach(p=>{
    const gastado=transactions.filter(t=>t.date?.startsWith(mesKey)&&t.type==="expense"&&(p.tipo==="global"||t.category===p.categoria)).reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const exceso=gastado-(parseFloat(p.montoLimite)||0);
    alertas.push({nivel:"error",icono:"presupuesto",
      msg:`Presupuesto excedido: ${p.nombre}`,
      detalle:`Excediste ${fmt(exceso)} sobre el límite`,modulo:"presupuestos"});
  });

  // 5. Tarjeta al +90% del límite
  accounts.filter(a=>a.type==="credit"&&parseFloat(a.creditLimit||0)>0).forEach(a=>{
    const uso=Math.abs(parseFloat(a.balance||0))/parseFloat(a.creditLimit)*100;
    if(uso>=90) alertas.push({nivel:"error",icono:"accounts",
      msg:`${a.name} al ${uso.toFixed(0)}% del límite`,
      detalle:`Solo ${fmt(parseFloat(a.creditLimit)-Math.abs(parseFloat(a.balance||0)))} disponible`,modulo:"accounts"});
  });

  // ── NIVEL WARNING ──────────────────────────────────────────────────────────
  // 6. Pago de tarjeta próximo (≤7 días) — solo si hay saldo real
  accounts.filter(a=>a.type==="credit"&&a.fechaPago).forEach(a=>{
    const saldo=Math.abs(Math.min(parseFloat(a.balance||0),0));
    if(saldo<1) return;
    const dias=Math.round((new Date(a.fechaPago+"T12:00:00")-now)/86400000);
    if(dias>=0&&dias<=7) alertas.push({nivel:"warning",icono:"warn",
      msg:`Pago en ${dias===0?"hoy":dias+" día"+(dias!==1?"s":"")}${": "}${a.name}`,
      detalle:`Deuda actual: ${fmt(saldo)}`,modulo:"accounts"});
  });

  // 7. Presupuestos al 80–99%
  const presEn80=presupuestos.filter(p=>{
    if(!p.activo) return false;
    const gastado=transactions.filter(t=>t.date?.startsWith(mesKey)&&t.type==="expense"&&(p.tipo==="global"||t.category===p.categoria)).reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const pct=gastado/(parseFloat(p.montoLimite)||1)*100;
    return pct>=80&&pct<100;
  });
  presEn80.forEach(p=>{
    const gastado=transactions.filter(t=>t.date?.startsWith(mesKey)&&t.type==="expense"&&(p.tipo==="global"||t.category===p.categoria)).reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const pct=(gastado/(parseFloat(p.montoLimite)||1)*100).toFixed(0);
    const restante=(parseFloat(p.montoLimite)||0)-gastado;
    alertas.push({nivel:"warning",icono:"presupuesto",
      msg:`Presupuesto al ${pct}%: ${p.nombre}`,
      detalle:`Quedan ${fmt(restante)} disponibles este mes`,modulo:"presupuestos"});
  });

  // 8. Fondo de emergencia bajo
  if(emergenciaMeses<3&&gastoProm3M>0) alertas.push({nivel:"warning",icono:"warn",
    msg:`Fondo de emergencia bajo: ${emergenciaMeses.toFixed(1)} meses`,
    detalle:`Recomendado: 6 meses. Meta: ${fmt(gastoProm3M*6)}`,modulo:"accounts"});

  // 9. Tarjeta al 80–89% del límite
  accounts.filter(a=>a.type==="credit"&&parseFloat(a.creditLimit||0)>0).forEach(a=>{
    const uso=Math.abs(parseFloat(a.balance||0))/parseFloat(a.creditLimit)*100;
    if(uso>=80&&uso<90) alertas.push({nivel:"warning",icono:"accounts",
      msg:`${a.name} al ${uso.toFixed(0)}% del límite`,
      detalle:`${fmt(parseFloat(a.creditLimit)-Math.abs(parseFloat(a.balance||0)))} disponible`,modulo:"accounts"});
  });

  // 10. Gasto del mes inusualmente alto (>130% del promedio 3 meses)
  (() => {
    const meses3 = [-3,-2,-1].map(d=>{ const dt=new Date(now); dt.setMonth(dt.getMonth()+d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}`; });
    const promGastos3M = meses3.reduce((s,mk)=>s+transactions.filter(t=>t.date?.startsWith(mk)&&t.type==="expense").reduce((ss,t)=>ss+parseFloat(t.amount||0),0),0)/3;
    const gastosEsteMes = transactions.filter(t=>t.date?.startsWith(mesKey)&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    if(promGastos3M>500&&gastosEsteMes>promGastos3M*1.3) alertas.push({nivel:"warning",icono:"chart",
      msg:`Gastos este mes ${(gastosEsteMes/promGastos3M*100-100).toFixed(0)}% sobre tu promedio`,
      detalle:`Este mes: ${fmt(gastosEsteMes)} vs promedio: ${fmt(promGastos3M)}`,modulo:"transactions"});
  })();

  // 11. Metas en riesgo de no alcanzarse
  goals.filter(g=>!g.completada&&g.fechaObjetivo).forEach(g=>{
    const target=parseFloat(g.montoObjetivo||0);
    const saved=parseFloat(g.montoActual||0);
    const faltante=target-saved;
    if(faltante<=0) return;
    const mesesRestantes=Math.max(0,Math.round((new Date(g.fechaObjetivo)-now)/2592000000));
    if(mesesRestantes<=0) { alertas.push({nivel:"error",icono:"goals",msg:`Meta vencida: ${g.nombre}`,detalle:`No alcanzaste ${fmt(target)}`,modulo:"goals"}); return; }
    const necesarioMes=faltante/mesesRestantes;
    if(ingrMes>0&&necesarioMes>ingrMes*0.4) alertas.push({nivel:"warning",icono:"goals",
      msg:`Meta en riesgo: ${g.nombre}`,
      detalle:`Necesitas ahorrar ${fmt(necesarioMes)}/mes — ${(necesarioMes/ingrMes*100).toFixed(0)}% de tus ingresos`,modulo:"goals"});
  });

  // 12. Mes sin ingresos registrados
  if(ingrMes===0&&now.getDate()>7) alertas.push({nivel:"warning",icono:"chart",
    msg:"Sin ingresos registrados este mes",
    detalle:"¿Olvidaste registrar algún ingreso?",modulo:"transactions"});

  // 13. Hipoteca — alertas inteligentes con verificación de saldo
  mortgages.forEach(m=>{
    const pagados = (m.pagosRealizados||[]).length;
    // Si tiene fechaAcreditacion y 0 pagos → calcular primer pago real (día 3 del mes siguiente al siguiente)
    const esPrimerPago = pagados === 0;
    const proxPago = (() => {
      if (esPrimerPago && m.fechaAcreditacion) {
        // Primer pago: día diaCorte del mes siguiente al de acreditación + 1 mes
        const acred = new Date(m.fechaAcreditacion+"T12:00:00");
        const d = new Date(acred);
        d.setMonth(d.getMonth()+2); // mes siguiente al siguiente
        d.setDate(parseInt(m.diaCorte)||1);
        return d;
      }
      const inicio = new Date((m.fechaInicio||today())+"T12:00:00");
      const d = new Date(inicio);
      d.setMonth(d.getMonth()+pagados+1);
      d.setDate(parseInt(m.diaCorte)||1);
      return d;
    })();
    const diasAlPago = Math.round((proxPago-now)/86400000);
    // Interés acumulado desde acreditación hasta primer pago (solo aplica al primer pago)
    const interesAcumuladoPrimerPago = (() => {
      if (!esPrimerPago || !m.fechaAcreditacion) return 0;
      const acred = new Date(m.fechaAcreditacion+"T12:00:00");
      const diasAcum = Math.max(0, Math.floor((proxPago-acred)/86400000));
      const tasaDiaria = (parseFloat(m.tasaAnual)||0)/100/365;
      return parseFloat(m.monto||0) * tasaDiaria * diasAcum;
    })();

    // Cuota total (capital+interés+seguros)
    const cuotaBase = parseFloat(m.cuotaReal)||0;
    const segurosTotal = (parseFloat(m.seguroVida)||0)+(parseFloat(m.seguroDanos)||0)+(parseFloat(m.adminCredito)||0);
    const cuotaTotal = cuotaBase > 0 ? cuotaBase : (cuotaBase + segurosTotal);

    // Saldo de la cuenta asociada
    const cuentaAsoc = accounts.find(a=>a.id===m.cuentaId||a.id===m.engancheCuentaId);
    const saldoCuenta = cuentaAsoc ? parseFloat(cuentaAsoc.balance||0) : null;
    const fondosSuficientes = saldoCuenta === null || saldoCuenta >= cuotaTotal;

    const cuotaPrimerPago = esPrimerPago && interesAcumuladoPrimerPago > 0
      ? cuotaTotal + interesAcumuladoPrimerPago
      : cuotaTotal;
    const cuotaDisplay = cuotaPrimerPago;
    const notaPrimerPago = esPrimerPago && interesAcumuladoPrimerPago > 0
      ? ` · Incluye ~${fmt(interesAcumuladoPrimerPago)} interés acumulado desde acreditación`
      : "";

    if (diasAlPago < 0) {
      alertas.push({nivel:"error",icono:"mortgage",
        msg:`⚠️ Pago hipoteca vencido — ${m.nombre||"Hipoteca"}`,
        detalle:`Venció hace ${Math.abs(diasAlPago)} día${Math.abs(diasAlPago)!==1?"s":""}. Cuota: ${fmt(cuotaDisplay)}`,
        modulo:"mortgage"});
    } else if (diasAlPago <= 3) {
      alertas.push({nivel:"error",icono:"mortgage",
        msg:`🏠 ${esPrimerPago?"PRIMER":"Pago"} pago hipoteca en ${diasAlPago} día${diasAlPago!==1?"s":""}${!fondosSuficientes?" — ¡FONDOS INSUFICIENTES!":""}`,
        detalle:`${m.nombre||"Hipoteca"} · ~${fmt(cuotaDisplay)} el ${proxPago.toLocaleDateString("es-MX",{day:"numeric",month:"short"})}${notaPrimerPago}${saldoCuenta!==null?` · Saldo: ${fmt(saldoCuenta)}`:""}`,
        modulo:"mortgage"});
    } else if (diasAlPago <= 7) {
      alertas.push({nivel:!fondosSuficientes?"error":"warning",icono:"mortgage",
        msg:`🏠 ${esPrimerPago?"Primer":"Próximo"} pago hipoteca en ${diasAlPago} días${!fondosSuficientes?" — fondos insuficientes":""}`,
        detalle:`${m.nombre||"Hipoteca"} · ~${fmt(cuotaDisplay)} el ${proxPago.toLocaleDateString("es-MX",{day:"numeric",month:"short"})}${notaPrimerPago}`,
        modulo:"mortgage"});
    } else if (diasAlPago <= 30) {
      if (!fondosSuficientes) {
        alertas.push({nivel:"warning",icono:"mortgage",
          msg:`🏠 Fondos insuficientes para ${esPrimerPago?"primer pago":"hipoteca"} (en ${diasAlPago} días)`,
          detalle:`Necesitas ~${fmt(cuotaDisplay)} · tienes ${fmt(saldoCuenta)} · faltan ${fmt(cuotaDisplay-saldoCuenta)}${notaPrimerPago}`,
          modulo:"mortgage"});
      } else {
        alertas.push({nivel:esPrimerPago?"warning":"info",icono:"mortgage",
          msg:`🏠 ${esPrimerPago?"Primer pago hipoteca":"Próximo pago hipoteca"} — ${diasAlPago} días`,
          detalle:`${m.nombre||"Hipoteca"} · ~${fmt(cuotaDisplay)} el ${proxPago.toLocaleDateString("es-MX",{day:"numeric",month:"short"})}${notaPrimerPago}${cuentaAsoc?` · ${cuentaAsoc.name}: ${fmt(saldoCuenta)}`:""}`,
          modulo:"mortgage"});
      }
    }
  });

  // 14. Tasa de ahorro cayó a 0 o negativa vs mes anterior
  (() => {
    const mesAntKey=(()=>{ const d=new Date(now); d.setMonth(d.getMonth()-1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; })();
    const ingrAnt=transactions.filter(t=>t.date?.startsWith(mesAntKey)&&t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const gastAnt=transactions.filter(t=>t.date?.startsWith(mesAntKey)&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const ahorro=ingrMes-gastMes;
    const ahorroAnt=ingrAnt-gastAnt;
    if(ingrMes>0&&ahorro<0&&ahorroAnt>=0) alertas.push({nivel:"warning",icono:"chart",
      msg:"Déficit este mes — gastos superan ingresos",
      detalle:`${fmt(Math.abs(ahorro))} en números rojos vs ${fmt(ahorroAnt)} de superávit anterior`,modulo:"transactions"});
  })();

  // Ordenar: error primero, luego warning

  // ── CIERRE MES ANTERIOR ─────────────────────────────────────────────────
  const cierreMesAnt = (() => {
    const d = new Date(now.getFullYear(), now.getMonth()-1, 1);
    const mk = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = d.toLocaleDateString("es-MX",{month:"long",year:"numeric"});
    const txs = transactions.filter(t=>t.date?.startsWith(mk));
    if (txs.length === 0) return null;
    const ingr = txs.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const gast = txs.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const flujo = ingr - gast;
    const tasa = ingr>0 ? (flujo/ingr*100) : 0;
    // Top categorías de gasto
    const cats = {};
    txs.filter(t=>t.type==="expense").forEach(t=>{
      cats[t.category||"Sin categoría"] = (cats[t.category||"Sin categoría"]||0)+parseFloat(t.amount||0);
    });
    const topCats = Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,3);
    // Snapshot del fin de mes (último snap del mes anterior)
    const snapMesAnt = [...(snapshots||[])]
      .filter(s=>s.fecha?.startsWith(mk))
      .sort((a,b)=>b.fecha>a.fecha?1:-1)[0];
    return { mk, label, ingr, gast, flujo, tasa, topCats, snap:snapMesAnt, txCount:txs.length };
  })();

  // ── CARTERA DE PRÉSTAMOS HOY ──────────────────────────────────────────────
  const carteraHoy = (() => {
    const givenActive = loans.filter(l=>l.type==="given");
    if (givenActive.length === 0) return null;
    const calcIntAcum = loan => {
      const dr = (parseFloat(loan.rate)||0)/100/(loan.rateType==="annual"?365:30);
      let bal = parseFloat(loan.principal||0), last = new Date(loan.startDate+"T12:00:00");
      for (const p of [...(loan.payments||[])].sort((a,b)=>new Date(a.date)-new Date(b.date))) {
        const days = Math.max(0,Math.floor((new Date(p.date+"T12:00:00")-last)/86400000));
        const accrued = bal*dr*days;
        if (p.paymentType==="interest_only") { last=new Date(p.date+"T12:00:00"); }
        else { bal=Math.max(0,bal-(p.amount-Math.min(p.amount,accrued))); last=new Date(p.date+"T12:00:00"); }
      }
      const daysNow = Math.max(0,Math.floor((new Date()-last)/86400000));
      return { bal, intAcum: bal*dr*daysNow, intDiario: bal*dr };
    };
    const detalle = givenActive.map(l=>({ ...l, ...calcIntAcum(l) }));
    const totalCap = detalle.reduce((s,l)=>s+l.bal,0);
    const totalInt = detalle.reduce((s,l)=>s+l.intAcum,0);
    const intDiario = detalle.reduce((s,l)=>s+l.intDiario,0);
    return { detalle, totalCap, totalInt, intDiario };
  })();

  // ── INVERSIONES PRIVADAS HOY ──────────────────────────────────────────────
  const invPrivadas = (() => {
    const privs = investments.filter(i=>
      i.estado!=="liquidada" &&
      ["fund_real_estate","fund_general","other"].includes(i.type) &&
      parseFloat(i.tasaAnual)>0
    );
    if (privs.length===0) return null;
    return privs.map(inv=>{
      const ap = (inv.aportaciones||[]).reduce((s,a)=>s+parseFloat(a.amount||0),0);
      const start = new Date((inv.startDate||today())+"T12:00:00");
      const dias = Math.max(0,Math.floor((new Date()-start)/86400000));
      const tasa = parseFloat(inv.tasaAnual)||0;
      const rendAcum = ap*(tasa/100/365)*dias;
      const valorProy = ap+rendAcum;
      const rendDiario = ap*(tasa/100/365);
      const valorMXN = inv.currency==="USD" ? valorProy*TC : valorProy;
      return { ...inv, ap, dias, rendAcum, valorProy, rendDiario, valorMXN };
    });
  })();

  alertas.sort((a,b)=>a.nivel==="error"&&b.nivel!=="error"?-1:1);

  // ── recurrentes pendientes
  const calcNextDate = r => {
    const inicioStr = r.ultimoRegistro || (r.fechaInicio && r.fechaInicio.length>=8 ? r.fechaInicio : today());
    const last=new Date(inicioStr+"T12:00:00");
    const next=new Date(isNaN(last)?new Date():last);
    if(r.frecuencia==="mensual") next.setMonth(next.getMonth()+1);
    else if(r.frecuencia==="quincenal") next.setDate(next.getDate()+15);
    else if(r.frecuencia==="semanal") next.setDate(next.getDate()+7);
    else if(r.frecuencia==="anual") next.setFullYear(next.getFullYear()+1);
    return next;
  };
  const pendientes=(recurrents||[]).filter(r=>{
    if(r.activo===false) return false;
    const next=calcNextDate(r);
    const hoyFin=new Date(); hoyFin.setHours(23,59,59,999);
    return next<=hoyFin;
  });

  const confirmarRecurrente = r => {
    const monto=parseFloat(r.monto)||0;
    const newTx={id:genId(),date:today(),amount:monto,type:r.tipo,description:r.nombre,category:r.categoria||"",accountId:r.cuentaId,currency:accounts.find(a=>a.id===r.cuentaId)?.currency||"MXN",notes:"Recurrente automático"};
    setTransactions(p=>[newTx,...p]);
    if(r.cuentaId) setAccounts(p=>p.map(a=>a.id===r.cuentaId?{...a,balance:parseFloat(a.balance||0)+(r.tipo==="income"?monto:-monto)}:a));
    setRecurrents(p=>p.map(x=>x.id===r.id?{...x,ultimoRegistro:today()}:x));
    toast(`"${r.nombre}" registrado ✓`);
  };

  // ── metas con proyección
  const metasConRitmo = (goals||[]).map(g=>{
    const saved = parseFloat(g.saved||0);
    const target = parseFloat(g.target||0);
    const pct = target>0?Math.min(saved/target*100,100):0;
    const mesesRestantes = g.targetDate ? Math.max(0,Math.round((new Date(g.targetDate)-now)/2592000000)) : null;
    const faltan = target-saved;
    const porMesSugerido = mesesRestantes>0?faltan/mesesRestantes:null;
    const alcanzable = porMesSugerido!==null ? porMesSugerido<=ingrMes*0.3 : null;
    return {...g,saved,target,pct,mesesRestantes,porMesSugerido,alcanzable,faltan};
  }).filter(g=>g.pct<100).slice(0,3);

  // ── presupuestos top riesgo
  const presRiesgo = presupuestos.filter(p=>p.activo!==false&&p.tipo!=="global").map(p=>{
    const gastado=transactions.filter(t=>t.date?.startsWith(mesKey)&&t.type==="expense"&&t.category===p.categoria).reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const limite=parseFloat(p.montoLimite)||0;
    const pct=limite>0?gastado/limite*100:0;
    return {...p,gastado,limite,pct};
  }).sort((a,b)=>b.pct-a.pct).slice(0,4);

  // ── últimas transacciones
  const recent=[...transactions].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6);

  // ── mini bar chart SVG inline
  const BarChartMini = ({ data }) => {
    if(!data||data.every(d=>d.ingr===0&&d.gast===0)) return (
      <div style={{height:120,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <p style={{fontSize:12,color:"#444"}}>Sin datos suficientes aún</p>
      </div>
    );
    const maxVal = Math.max(...data.flatMap(d=>[d.ingr,d.gast]),1);
    const n = data.length;
    const W=520, H=100, BAR=18, GAP=4;
    // espacio por grupo centrado
    const GRP = W / n;
    const fmtV = v => v>=1000000?`$${(v/1000000).toFixed(1)}M`:v>=1000?`$${(v/1000).toFixed(0)}k`:`$${v.toFixed(0)}`;
    return (
      <svg viewBox={`0 0 ${W} ${H+28}`} style={{width:"100%",overflow:"visible"}} preserveAspectRatio="xMidYMid meet">
        {data.map((d,i)=>{
          const cx = i*GRP + GRP/2; // centro del grupo
          const x  = cx - BAR - GAP/2;
          const hI = Math.max(Math.round((d.ingr/maxVal)*H), d.ingr>0?2:0);
          const hG = Math.max(Math.round((d.gast/maxVal)*H), d.gast>0?2:0);
          return (
            <g key={d.mk}>
              {/* ingreso */}
              <rect x={x} y={H-hI} width={BAR} height={hI} rx={3}
                fill={d.esMesActual?"#00d4aa":"#00d4aa44"}/>
              {/* gasto */}
              <rect x={x+BAR+GAP} y={H-hG} width={BAR} height={hG} rx={3}
                fill={d.esMesActual?"#ff4757":"#ff475744"}/>
              {/* valor ingreso encima si es mes actual */}
              {d.esMesActual && d.ingr>0 && (
                <text x={x+BAR/2} y={H-hI-3} textAnchor="middle" fill="#00d4aa" fontSize="8" fontWeight="700">{fmtV(d.ingr)}</text>
              )}
              {/* valor gasto encima si es mes actual */}
              {d.esMesActual && d.gast>0 && (
                <text x={x+BAR+GAP+BAR/2} y={H-hG-3} textAnchor="middle" fill="#ff4757" fontSize="8" fontWeight="700">{fmtV(d.gast)}</text>
              )}
              {/* label mes — centrado bajo el par */}
              <text x={cx} y={H+16} textAnchor="middle"
                fill={d.esMesActual?"#ccc":"#555"}
                fontSize={d.esMesActual?"11":"10"}
                fontWeight={d.esMesActual?"700":"400"}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // ── saludo por hora
  const hora = now.getHours();
  const saludo = hora<12?"Buenos días":hora<18?"Buenas tardes":"Buenas noches";
  const nombre = user.name.split(" ")[0];

  const NIVEL_COLOR = {error:"#ff4757",warning:"#f39c12",info:"#3b82f6"};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* ── HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
        <div>
          <h2 style={{fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:"0 0 3px"}}>
            {saludo}, {nombre} 👋
          </h2>
          <p style={{fontSize:12,color:"#555",margin:0,textTransform:"capitalize"}}>
            {now.toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </p>
        </div>
        {alertas.filter(a=>a.nivel==="error").length>0 && (
          <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,71,87,.1)",border:"1px solid rgba(255,71,87,.25)",borderRadius:9,padding:"6px 12px"}}>
            <Ic n="warn" size={14} color="#ff4757"/>
            <span style={{fontSize:12,color:"#ff4757",fontWeight:700}}>{alertas.filter(a=>a.nivel==="error").length} alerta{alertas.filter(a=>a.nivel==="error").length>1?"s":""} crítica{alertas.filter(a=>a.nivel==="error").length>1?"s":""}</span>
          </div>
        )}
      </div>

      {/* ── BANNER BIENVENIDA — solo si no hay cuentas */}
      {accounts.length===0&&(
        <div style={{marginBottom:18,borderRadius:16,overflow:"hidden",background:"linear-gradient(135deg,rgba(0,212,170,.08) 0%,rgba(59,130,246,.06) 100%)",border:"1px solid rgba(0,212,170,.2)"}}>
          <div style={{padding:"20px 22px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#00d4aa,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:20}}>👋</span>
              </div>
              <div>
                <p style={{fontSize:17,fontWeight:800,color:"#f0f0f0",margin:0,fontFamily:"'Syne',sans-serif"}}>Bienvenido a Finanzapp</p>
                <p style={{fontSize:12,color:"#555",margin:0}}>Sigue estos 3 pasos para empezar</p>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
              {[
                {num:"1",titulo:"Agrega una cuenta",desc:"Cheques, ahorro, efectivo o tarjeta de crédito",modulo:"accounts",color:"#00d4aa",emoji:"🏦"},
                {num:"2",titulo:"Registra transacciones",desc:"Ingresos y gastos del día a día, o usa el asistente IA",modulo:"transactions",color:"#3b82f6",emoji:"💳"},
                {num:"3",titulo:"Explora tu Dashboard",desc:"Aquí verás tu situación financiera completa",modulo:null,color:"#a78bfa",emoji:"📊"},
              ].map(paso=>(
                <div key={paso.num} onClick={()=>paso.modulo&&navigate(paso.modulo)}
                  style={{display:"flex",gap:12,alignItems:"flex-start",padding:"11px 13px",borderRadius:11,background:"rgba(255,255,255,.03)",border:`1px solid rgba(255,255,255,.06)`,cursor:paso.modulo?"pointer":"default",transition:"all .15s"}}
                  onMouseEnter={e=>{if(paso.modulo){e.currentTarget.style.background="rgba(255,255,255,.06)";e.currentTarget.style.borderColor=`${paso.color}44`;}}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.03)";e.currentTarget.style.borderColor="rgba(255,255,255,.06)";}}>
                  <div style={{width:28,height:28,borderRadius:8,background:`${paso.color}20`,border:`1px solid ${paso.color}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14}}>
                    {paso.emoji}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                      <span style={{fontSize:10,fontWeight:800,color:paso.color,background:`${paso.color}18`,borderRadius:20,padding:"1px 7px"}}>{paso.num}</span>
                      <span style={{fontSize:12,fontWeight:700,color:"#e0e0e0"}}>{paso.titulo}</span>
                      {paso.modulo&&<span style={{fontSize:10,color:"#444",marginLeft:"auto"}}>→</span>}
                    </div>
                    <p style={{fontSize:11,color:"#555",margin:0,lineHeight:1.4}}>{paso.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p style={{fontSize:11,color:"#444",margin:"12px 0 0",textAlign:"center"}}>
              💡 También puedes hablarle al <strong style={{color:"#00d4aa"}}>Asistente IA</strong> (botón verde abajo a la derecha) para registrar gastos con lenguaje natural
            </p>
          </div>
        </div>
      )}

      {/* ── ALERTAS INTELIGENTES */}
      {alertas.length>0 && <AlertasPanel alertas={alertas} onNavigate={navigate}/>}

      {/* ── RECURRENTES PENDIENTES */}
      {pendientes.length>0 && (
        <Card style={{borderColor:"rgba(124,58,237,.3)",background:"rgba(124,58,237,.05)",padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <Ic n="recurring" size={15} color="#a78bfa"/>
            <p style={{fontSize:13,fontWeight:700,color:"#a78bfa",margin:0}}>{pendientes.length} pago{pendientes.length>1?"s":""} recurrente{pendientes.length>1?"s":""} pendiente{pendientes.length>1?"s":""}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {pendientes.map(r=>{
              const cta=accounts.find(a=>a.id===r.cuentaId);
              return (
                <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,.04)",borderRadius:8,padding:"8px 12px",flexWrap:"wrap",gap:6}}>
                  <div>
                    <p style={{fontSize:13,fontWeight:600,color:"#e0e0e0",margin:"0 0 1px"}}>{r.nombre}</p>
                    <p style={{fontSize:11,color:"#555",margin:0}}>{r.tipo==="income"?"Ingreso":"Gasto"} · {cta?.name||"—"}</p>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14,fontWeight:700,color:r.tipo==="income"?"#00d4aa":"#ff4757"}}>{r.tipo==="income"?"+":"-"}{fmt(parseFloat(r.monto||0))}</span>
                    <Btn onClick={()=>confirmarRecurrente(r)}><Ic n="check" size={13}/>Confirmar</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── CIERRE MES ANTERIOR */}
      {cierreMesAnt && now.getDate() <= 20 && (
        <Card style={{padding:0,overflow:"hidden",borderColor:"rgba(124,58,237,.2)",background:"rgba(124,58,237,.03)"}}>
          <div style={{padding:"11px 16px 9px",borderBottom:"1px solid rgba(124,58,237,.1)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>📅</span>
              <p style={{fontSize:13,fontWeight:800,color:"#a78bfa",margin:0,textTransform:"capitalize"}}>Cierre de {cierreMesAnt.label}</p>
            </div>
            <span style={{fontSize:11,color:"#555"}}>{cierreMesAnt.txCount} transacciones</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:0}}>
            {[
              {l:"Ingresos",v:fmt(cierreMesAnt.ingr),c:"#00d4aa"},
              {l:"Gastos",v:fmt(cierreMesAnt.gast),c:"#ff4757"},
              {l:"Flujo neto",v:(cierreMesAnt.flujo>=0?"+":"")+fmt(cierreMesAnt.flujo),c:cierreMesAnt.flujo>=0?"#00d4aa":"#ff4757"},
              {l:"Tasa de ahorro",v:cierreMesAnt.tasa.toFixed(1)+"%",c:cierreMesAnt.tasa>=20?"#00d4aa":cierreMesAnt.tasa>=10?"#f39c12":"#ff4757"},
            ].map(k=>(
              <div key={k.l} style={{padding:"10px 16px",borderRight:"1px solid rgba(255,255,255,.04)"}}>
                <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 3px"}}>{k.l}</p>
                <p style={{fontSize:15,fontWeight:800,color:k.c,margin:0,fontVariantNumeric:"tabular-nums"}}>{k.v}</p>
              </div>
            ))}
          </div>
          {cierreMesAnt.topCats.length>0&&(
            <div style={{padding:"8px 16px 10px",borderTop:"1px solid rgba(255,255,255,.04)",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:10,color:"#555"}}>Top gastos:</span>
              {cierreMesAnt.topCats.map(([cat,amt])=>(
                <span key={cat} style={{fontSize:10,background:"rgba(255,255,255,.05)",borderRadius:20,padding:"2px 9px",color:"#888"}}>
                  {cat} <strong style={{color:"#ff4757"}}>{fmt(amt)}</strong>
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── CARTERA DE PRÉSTAMOS + INVERSIONES PRIVADAS HOY */}
      {(carteraHoy || invPrivadas) && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>

          {/* Cartera de préstamos */}
          {carteraHoy && (
            <Card onClick={()=>navigate("loans")} style={{padding:0,overflow:"hidden",borderColor:"rgba(0,120,255,.2)",background:"rgba(0,120,255,.02)",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(0,120,255,.4)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(0,120,255,.2)"}>
              <div style={{padding:"11px 16px 9px",borderBottom:"1px solid rgba(0,120,255,.1)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:15}}>💸</span>
                  <p style={{fontSize:13,fontWeight:800,color:"#3b82f6",margin:0}}>Cartera de préstamos</p>
                </div>
                <span style={{fontSize:10,color:"#555"}}>{carteraHoy.detalle.length} préstamo{carteraHoy.detalle.length!==1?"s":""}</span>
              </div>
              <div style={{padding:"10px 16px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <div>
                    <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 2px"}}>Capital por cobrar</p>
                    <p style={{fontSize:16,fontWeight:800,color:"#3b82f6",margin:0,fontVariantNumeric:"tabular-nums"}}>{fmt(carteraHoy.totalCap)}</p>
                  </div>
                  <div>
                    <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 2px"}}>Interés acumulado hoy</p>
                    <p style={{fontSize:16,fontWeight:800,color:"#f39c12",margin:0,fontVariantNumeric:"tabular-nums"}}>+{fmt(carteraHoy.totalInt)}</p>
                  </div>
                </div>
                <div style={{padding:"6px 10px",background:"rgba(0,120,255,.06)",borderRadius:8,border:"1px solid rgba(0,120,255,.12)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#888"}}>Generando por día</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#00d4aa",fontVariantNumeric:"tabular-nums"}}>+{fmt(carteraHoy.intDiario)}/día</span>
                </div>
                <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
                  {carteraHoy.detalle.slice(0,3).map(l=>(
                    <div key={l.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11}}>
                      <span style={{color:"#666",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}>{l.name}</span>
                      <span style={{color:"#f39c12",fontWeight:600,fontVariantNumeric:"tabular-nums",flexShrink:0}}>+{fmt(l.intAcum)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Inversiones privadas */}
          {invPrivadas && (
            <Card onClick={()=>navigate("investments")} style={{padding:0,overflow:"hidden",borderColor:"rgba(168,85,247,.2)",background:"rgba(168,85,247,.02)",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(168,85,247,.4)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(168,85,247,.2)"}>
              <div style={{padding:"11px 16px 9px",borderBottom:"1px solid rgba(168,85,247,.1)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:15}}>🏗️</span>
                  <p style={{fontSize:13,fontWeight:800,color:"#a855f7",margin:0}}>Inversiones privadas</p>
                </div>
                <span style={{fontSize:10,color:"#555"}}>{invPrivadas.length} fondo{invPrivadas.length!==1?"s":""}</span>
              </div>
              <div style={{padding:"10px 16px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <div>
                    <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 2px"}}>Valor proyectado total</p>
                    <p style={{fontSize:16,fontWeight:800,color:"#a855f7",margin:0,fontVariantNumeric:"tabular-nums"}}>{fmt(invPrivadas.reduce((s,i)=>s+i.valorMXN,0))}</p>
                  </div>
                  <div>
                    <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 2px"}}>Rendimiento acumulado</p>
                    <p style={{fontSize:16,fontWeight:800,color:"#00d4aa",margin:0,fontVariantNumeric:"tabular-nums"}}>+{fmt(invPrivadas.reduce((s,i)=>s+(i.currency==="USD"?i.rendAcum*TC:i.rendAcum),0))}</p>
                  </div>
                </div>
                <div style={{padding:"6px 10px",background:"rgba(168,85,247,.06)",borderRadius:8,border:"1px solid rgba(168,85,247,.12)",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:11,color:"#888"}}>Generando por día est.</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#00d4aa",fontVariantNumeric:"tabular-nums"}}>+{fmt(invPrivadas.reduce((s,i)=>s+(i.currency==="USD"?i.rendDiario*TC:i.rendDiario),0))}/día</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {invPrivadas.map(i=>(
                    <div key={i.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11}}>
                      <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:140}}>
                        <span style={{color:"#666"}}>{i.name}</span>
                        <span style={{color:"#555",marginLeft:4}}>{i.tasaAnual}%</span>
                      </div>
                      <span style={{color:"#a855f7",fontWeight:600,fontVariantNumeric:"tabular-nums",flexShrink:0}}>{fmt(i.valorMXN)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── KPIs PRINCIPALES */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
        {/* Patrimonio Neto */}
        <Card onClick={()=>navigate("patrimonio")} style={{borderColor:"rgba(0,212,170,.2)",background:"linear-gradient(135deg,rgba(0,212,170,.06) 0%,transparent 70%)",cursor:"pointer",transition:"border-color .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(0,212,170,.5)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(0,212,170,.2)"}>
          <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 6px",fontWeight:700}}>Patrimonio Neto</p>
          <p style={{fontSize:22,fontWeight:800,color:"#00d4aa",margin:"0 0 6px"}}>{fmt(patrimonioNeto)}</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:10,color:"#555"}}>Liquidez: <strong style={{color:"#ccc"}}>{fmt(liquidezTotal)}</strong></span>
            <span style={{fontSize:10,color:"#555"}}>Inv: <strong style={{color:"#f39c12"}}>{fmt(invTotal)}</strong></span>
          </div>
        </Card>

        {/* Flujo del mes */}
        <Card onClick={()=>navigate("reports:resultados")} style={{borderColor:flujoMes>=0?"rgba(0,212,170,.2)":"rgba(255,71,87,.2)",cursor:"pointer",transition:"opacity .2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 6px",fontWeight:700}}>
            Flujo — {now.toLocaleDateString("es-MX",{month:"long"})}
          </p>
          <p style={{fontSize:22,fontWeight:800,color:flujoMes>=0?"#00d4aa":"#ff4757",margin:"0 0 4px"}}>
            {flujoMes>=0?"+":""}{fmt(flujoMes)}
          </p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:4}}>
            <span style={{fontSize:10,color:"#555"}}>↑ <strong style={{color:"#00d4aa"}}>{fmt(ingrMes)}</strong></span>
            <span style={{fontSize:10,color:"#555"}}>↓ <strong style={{color:"#ff4757"}}>{fmt(gastMes)}</strong></span>
            {deltaGastos!==0&&<span style={{fontSize:10,color:deltaGastos>0?"#ff4757":"#00d4aa"}}>{deltaGastos>0?"▲":"▼"}{Math.abs(deltaGastos).toFixed(0)}% vs mes ant.</span>}
          </div>
          {/* Acumulado del año */}
          <div style={{padding:"5px 8px",borderRadius:7,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:recPendientesMes.length>0?4:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,color:"#444"}}>Acumulado {now.getFullYear()} ({mesesTranscurridos}m)</span>
              <span style={{fontSize:11,fontWeight:700,color:flujoAcumuladoAnio.neto>=0?"#00d4aa":"#ff4757"}}>
                {flujoAcumuladoAnio.neto>=0?"+":""}{fmt(flujoAcumuladoAnio.neto)}
              </span>
            </div>
            <div style={{display:"flex",gap:8,marginTop:2}}>
              <span style={{fontSize:9,color:"#444"}}>↑ {fmt(flujoAcumuladoAnio.ingr)}</span>
              <span style={{fontSize:9,color:"#444"}}>↓ {fmt(flujoAcumuladoAnio.gast)}</span>
            </div>
          </div>
          {recPendientesMes.length>0&&(
            <div style={{padding:"4px 7px",borderRadius:6,background:"rgba(124,58,237,.1)",border:"1px solid rgba(124,58,237,.2)"}}>
              <span style={{fontSize:10,color:"#a78bfa",fontWeight:600}}>
                {recPendientesMes.length} recurrente{recPendientesMes.length>1?"s":""} pendiente{recPendientesMes.length>1?"s":""} · Proy: {flujoProy>=0?"+":""}{fmt(flujoProy)}
              </span>
            </div>
          )}
        </Card>

        {/* Score de salud */}
        <Card onClick={()=>navigate("patrimonio")} style={{cursor:"pointer",transition:"opacity .2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 6px",fontWeight:700}}>Salud Financiera</p>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{position:"relative",width:52,height:52,flexShrink:0}}>
              <svg viewBox="0 0 36 36" style={{width:52,height:52,transform:"rotate(-90deg)"}}>
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke={scoreColor} strokeWidth="3"
                  strokeDasharray={`${scoreHealth*0.942} 94.2`} strokeLinecap="round"/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:12,fontWeight:800,color:scoreColor}}>{scoreHealth}</span>
              </div>
            </div>
            <div>
              <p style={{fontSize:15,fontWeight:700,color:scoreColor,margin:"0 0 2px"}}>{scoreLabel}</p>
              <p style={{fontSize:10,color:"#555",margin:0}}>Fondo emergencia: {emergenciaMeses.toFixed(1)} meses</p>
              <p style={{fontSize:10,color:"#555",margin:"1px 0 0"}}>Tasa de ahorro: {tasaAhorro.toFixed(0)}%</p>
            </div>
          </div>
        </Card>

        {/* Liquidez inmediata */}
        <Card onClick={()=>navigate("reports:flujo")} style={{cursor:"pointer",transition:"opacity .2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 6px",fontWeight:700}}>Liquidez Disponible</p>
          <p style={{fontSize:22,fontWeight:800,color:"#3b82f6",margin:"0 0 6px"}}>{fmt(liquidezTotal)}</p>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            {accounts.filter(a=>a.type!=="credit").slice(0,3).map(a=>{
              const saldo=a.currency==="USD"?parseFloat(a.balance||0)*TC:parseFloat(a.balance||0);
              const pct=liquidezTotal>0?saldo/liquidezTotal*100:0;
              return (
                <div key={a.id}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:1}}>
                    <span style={{fontSize:10,color:"#666",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"60%"}}>{a.name}</span>
                    <span style={{fontSize:10,color:"#888"}}>{fmt(saldo)}</span>
                  </div>
                  <div style={{height:3,borderRadius:1.5,background:"rgba(255,255,255,.05)"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:"#3b82f6",borderRadius:1.5,opacity:.7}}/>
                  </div>
                </div>
              );
            })}
            {accounts.filter(a=>a.type!=="credit").length>3&&<span style={{fontSize:10,color:"#444"}}>+{accounts.filter(a=>a.type!=="credit").length-3} más</span>}
          </div>
        </Card>
        {/* Gauge Deuda / Patrimonio */}
        <Card onClick={()=>navigate("patrimonio")} style={{cursor:"pointer"}}>
          <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 8px",fontWeight:700}}>Deuda / Patrimonio</p>
          {(() => {
            const pct = patrimonioNeto>0 ? Math.min(deudaTotal/patrimonioNeto*100,100) : 0;
            const color = pct<=30?"#00d4aa":pct<=60?"#f39c12":"#ff4757";
            const label = pct<=30?"Saludable":pct<=60?"Moderado":"Alto";
            // arco SVG: radio=28, circunferencia media = PI*28 ≈ 87.96
            const C = Math.PI*28;
            const filled = (pct/100)*C;
            return (
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                {/* semicírculo */}
                <div style={{position:"relative",width:68,height:38,flexShrink:0}}>
                  <svg viewBox="0 0 68 38" style={{width:68,height:38,overflow:"visible"}}>
                    {/* fondo arco */}
                    <path d="M 6 34 A 28 28 0 0 1 62 34"
                      fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="7" strokeLinecap="round"/>
                    {/* arco relleno */}
                    <path d="M 6 34 A 28 28 0 0 1 62 34"
                      fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
                      strokeDasharray={`${filled} ${C}`}
                      style={{transition:"stroke-dasharray .6s ease, stroke .4s"}}/>
                    {/* aguja */}
                    {(() => {
                      const ang = Math.PI - (pct/100)*Math.PI; // de izq a der
                      const nx = 34 + 22*Math.cos(ang);
                      const ny = 34 - 22*Math.sin(ang);
                      return <line x1="34" y1="34" x2={nx.toFixed(1)} y2={ny.toFixed(1)}
                        stroke={color} strokeWidth="2" strokeLinecap="round"/>;
                    })()}
                    <circle cx="34" cy="34" r="3" fill={color}/>
                  </svg>
                </div>
                <div>
                  <p style={{fontSize:20,fontWeight:800,color,margin:"0 0 2px"}}>{pct.toFixed(0)}<span style={{fontSize:12,fontWeight:400}}>%</span></p>
                  <p style={{fontSize:11,fontWeight:700,color,margin:"0 0 3px"}}>{label}</p>
                  <p style={{fontSize:9,color:"#555",margin:0}}>Deuda {fmt(deudaTotal)}</p>
                </div>
              </div>
            );
          })()}
        </Card>
      </div>

      {/* ── GRÁFICA INGRESOS VS GASTOS */}
      <Card onClick={()=>navigate("reports:resultados")} style={{cursor:"pointer",transition:"opacity .2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=".9"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
          <p style={{fontSize:13,fontWeight:700,color:"#ccc",margin:0}}>Ingresos vs Gastos — Últimos 6 meses</p>
          <div style={{display:"flex",gap:12}}>
            <span style={{fontSize:11,color:"#555"}}>Mejor mes: <strong style={{color:"#00d4aa"}}>{(() => {const m=ultimos6Meses.reduce((b,d)=>d.util>b.util?d:b,ultimos6Meses[0]); return m?m.label:"—";})()}</strong></span>
            <span style={{fontSize:11,color:"#555"}}>Promedio gastos: <strong style={{color:"#ff4757"}}>{fmt(ultimos6Meses.reduce((s,m)=>s+m.gast,0)/6)}</strong></span>
          </div>
        </div>
        <BarChartMini data={ultimos6Meses}/>
        {/* utilidad por mes */}
        <div style={{display:"flex",gap:4,marginTop:6,justifyContent:"space-around"}}>
          {ultimos6Meses.map(m=>(
            <div key={m.mk} style={{textAlign:"center",flex:1}}>
              <span style={{fontSize:9,color:m.util>=0?"#00d4aa44":"#ff475744",fontWeight:700}}>
                {m.util>=0?"▲":"▼"}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <LineChartPatrimonio snapshots={snapshots} onVerTodo={()=>navigate("patrimonio")}/>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14}}>

        {/* ── METAS + PRESUPUESTOS COMPACTO */}
        {(metasConRitmo.length>0||presRiesgo.length>0) && (
          <Card onClick={()=>navigate(metasConRitmo.length>0?"goals":"presupuestos")} style={{cursor:"pointer",transition:"opacity .2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=".9"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            {/* Metas */}
            {metasConRitmo.length>0 && (
              <div style={{marginBottom:presRiesgo.length>0?14:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <p style={{fontSize:12,fontWeight:700,color:"#ccc",margin:0}}>Metas de ahorro</p>
                  <button onClick={e=>{e.stopPropagation();navigate("goals");}} style={{fontSize:10,color:"#00d4aa",background:"none",border:"none",cursor:"pointer",padding:0}}>Ver todas →</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {metasConRitmo.slice(0,3).map(g=>(
                    <div key={g.id}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:11,color:"#ccc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"65%"}}>{g.name||g.nombre}</span>
                        <span style={{fontSize:11,color:"#00d4aa",fontWeight:700}}>{g.pct.toFixed(0)}%</span>
                      </div>
                      <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,.05)",overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${g.pct}%`,background:"linear-gradient(90deg,#00d4aa,#00a884)",borderRadius:3}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Presupuestos */}
            {presRiesgo.length>0 && (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <p style={{fontSize:12,fontWeight:700,color:"#ccc",margin:0}}>Presupuestos</p>
                  <button onClick={e=>{e.stopPropagation();navigate("presupuestos");}} style={{fontSize:10,color:"#00d4aa",background:"none",border:"none",cursor:"pointer",padding:0}}>Ver todos →</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {presRiesgo.slice(0,3).map(p=>{
                    const color=p.pct>100?"#ff4757":p.pct>80?"#f39c12":p.color||"#00d4aa";
                    return (
                      <div key={p.id}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:11,color:"#ccc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"65%"}}>{p.nombre}</span>
                          <span style={{fontSize:11,color,fontWeight:700}}>{p.pct.toFixed(0)}%</span>
                        </div>
                        <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,.05)",overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(p.pct,100)}%`,background:color,borderRadius:3,transition:"width .4s"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ── ÚLTIMOS MOVIMIENTOS */}
        <Card onClick={()=>navigate("transactions")} style={{cursor:"pointer",transition:"opacity .2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=".9"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <p style={{fontSize:13,fontWeight:700,color:"#ccc",margin:0}}>Últimos movimientos</p>
            <button onClick={e=>{e.stopPropagation();navigate("transactions");}} style={{fontSize:10,color:"#00d4aa",background:"none",border:"none",cursor:"pointer",padding:0}}>Ver todos →</button>
          </div>
          {recent.length===0
            ? <p style={{fontSize:12,color:"#444",textAlign:"center",padding:"16px 0"}}>Sin transacciones registradas</p>
            : <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {recent.map((t,i)=>{
                  const cta=accounts.find(a=>a.id===t.accountId);
                  return (
                    <div key={t.id} onClick={()=>navigate("transactions")} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<recent.length-1?"1px solid rgba(255,255,255,.04)":"none",cursor:"pointer",borderRadius:6,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div style={{width:28,height:28,borderRadius:7,background:t.type==="income"?"rgba(0,212,170,.12)":"rgba(255,71,87,.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Ic n={t.type==="income"?"plus":"warn"} size={13} color={t.type==="income"?"#00d4aa":"#ff4757"}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:12,fontWeight:600,color:"#e0e0e0",margin:"0 0 1px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</p>
                        <p style={{fontSize:10,color:"#555",margin:0}}>{t.date} · {cta?.name||"—"}</p>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:t.type==="income"?"#00d4aa":"#ff4757",flexShrink:0}}>
                        {t.type==="income"?"+":"-"}{fmt(t.amount,t.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
          }
        </Card>
      </div>
    </div>
  );
};

// ─── CUENTAS ──────────────────────────────────────────────────────────────────
const Accounts = () => {
  const { user, toast, navigate } = useCtx();
  const [accounts, setAccounts] = useData(user.id, "accounts");
  const [transactions] = useData(user.id, "transactions");
  const [transfers, setTransfers] = useData(user.id, "transfers");
  const [open, setOpen]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [askConfirm, confirmModal] = useConfirm();
  const [detailAccount, setDetailAccount] = useState(null);
  const [mesFilter, setMesFilter]         = useState("all");

  const blank = { name:"", bank:"", type:"checking", currency:"MXN", balance:"", creditLimit:"", fechaPago:"", notes:"" };
  const [form, setForm] = useState(blank);
  // ── pago de tarjeta
  const [pagoOpen, setPagoOpen]     = useState(false);
  const [pagoCard, setPagoCard]     = useState(null);
  const blankPago = { fromId:"", monto:"", descripcion:"", date:today(), notas:"" };
  const [pagoForm, setPagoForm]     = useState(blankPago);
  const fp = k => e => setPagoForm(p=>({...p,[k]:e.target.value}));

  const abrirPago = (card) => {
    setPagoCard(card);
    setPagoForm({...blankPago, descripcion:`Pago ${card.name}`});
    setPagoOpen(true);
  };

  const guardarPago = () => {
    const monto = parseFloat(pagoForm.monto)||0;
    if (!pagoForm.fromId) { toast("Selecciona cuenta de origen","error"); return; }
    if (monto<=0)          { toast("Ingresa un monto válido","error"); return; }
    const origen = accounts.find(a=>a.id===pagoForm.fromId);
    if (!origen)           { toast("Cuenta no encontrada","error"); return; }
    if (parseFloat(origen.balance||0) < monto) { toast("Saldo insuficiente en la cuenta origen","error"); return; }

    // Movimiento contable correcto:
    // NO es un gasto nuevo — es transferencia interna de liquidez a reducción de deuda.
    // El gasto ya se registró cuando se usó la tarjeta.
    const saldoTarjeta = parseFloat(pagoCard.balance||0);
    const nuevoSaldoTarjeta = saldoTarjeta < 0
      ? Math.min(saldoTarjeta + monto, 0)
      : Math.max(saldoTarjeta - monto, 0);

    // Solo afectar saldos — sin crear transacción de gasto
    setAccounts(p=>p.map(a=>{
      if (a.id===pagoForm.fromId) return {...a, balance: parseFloat(a.balance||0)-monto};
      if (a.id===pagoCard.id)    return {...a, balance: nuevoSaldoTarjeta};
      return a;
    }));
    // Guardar en transfers para que aparezca en el historial de ambas cuentas
    setTransfers(prev=>[{
      id: genId(),
      fromId: pagoForm.fromId,
      toId: pagoCard.id,
      amount: monto,
      toAmount: monto,
      date: pagoForm.date||today(),
      description: pagoForm.descripcion||`Pago tarjeta: ${pagoCard.name}`,
      tipoPago: "pago_tarjeta",
      fromName: origen?.name||"",
      toName: pagoCard.name,
      fromCurrency: origen?.currency||"MXN",
      toCurrency: pagoCard.currency||"MXN",
      notas: pagoForm.notas||"",
      createdAt: new Date().toISOString(),
    }, ...(prev||[])]);
    toast(`Pago de ${fmt(monto)} a ${pagoCard.name} registrado ✓`,"success");
    setPagoOpen(false);
  };
  const ch = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const openNew  = () => { setForm(blank); setEditing(null); setOpen(true); };
  const openEdit = a  => { setForm({...a, balance:String(a.balance), creditLimit:String(a.creditLimit||"")}); setEditing(a); setOpen(true); };

  const save = () => {
    if (!form.name.trim()) { toast("El nombre es requerido","error"); return; }
    const bal = parseFloat(form.balance)||0;
    if (editing) {
      setAccounts(accounts.map(a=>a.id===editing.id?{...a,...form,balance:bal,creditLimit:parseFloat(form.creditLimit)||0}:a));
      toast("Cuenta actualizada ✓");
    } else {
      setAccounts([...accounts,{id:genId(),...form,balance:bal,creditLimit:parseFloat(form.creditLimit)||0}]);
      toast("Cuenta creada ✓");
    }
    setOpen(false);
  };

  const del = async a => {
    const ok = await askConfirm(`¿Eliminar la cuenta "${a.name}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    setAccounts(accounts.filter(x=>x.id!==a.id));
    toast("Cuenta eliminada","warning");
  };

  const totalMXN = accounts.filter(a=>a.currency==="MXN"&&a.type!=="credit").reduce((s,a)=>s+parseFloat(a.balance||0),0);
  const totalUSD = accounts.filter(a=>a.currency==="USD").reduce((s,a)=>s+parseFloat(a.balance||0),0);

  const TIPOS = { checking:"Cheques", savings:"Ahorro", credit:"Tarjeta crédito", cash:"Efectivo", investment:"Inversión" };
  const TIPO_COLOR = { checking:"#3b82f6", savings:"#00d4aa", credit:"#ff4757", cash:"#f39c12", investment:"#7c3aed" };

  return (
    <div style={{animation:"fadeUp .25s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:"0 0 3px"}}>Cuentas</h2>
          <p style={{fontSize:13,color:"#555",margin:0}}>Gestiona tus cuentas bancarias y tarjetas</p>
        </div>
        <Btn onClick={openNew}><Ic n="plus" size={15}/>Nueva cuenta</Btn>
      </div>

      {/* totales */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:18}}>
        {[
          {label:"Total MXN", valor:fmt(totalMXN,"MXN"), color:"#00d4aa"},
          ...(totalUSD>0?[{label:"Total USD", valor:fmt(totalUSD,"USD"), color:"#3b82f6"}]:[]),
          {label:"Cuentas", valor:accounts.length, color:"#777"},
        ].map(k=>(
          <Card key={k.label}><p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 4px"}}>{k.label}</p><p style={{fontSize:18,fontWeight:700,color:k.color,margin:0}}>{k.valor}</p></Card>
        ))}
      </div>

      {accounts.length===0 ? (
        <Card style={{textAlign:"center",padding:"40px 24px",borderColor:"rgba(0,212,170,.15)",background:"rgba(0,212,170,.03)"}}>
          <div style={{fontSize:40,marginBottom:8}}>🏦</div>
          <p style={{fontSize:16,fontWeight:700,color:"#e0e0e0",margin:"0 0 8px"}}>Agrega tu primera cuenta</p>
          <p style={{fontSize:13,color:"#555",margin:"0 0 16px",lineHeight:1.5,maxWidth:320,marginLeft:"auto",marginRight:"auto"}}>
            Registra tus cuentas bancarias, efectivo o tarjetas de crédito. Todos tus movimientos se vincularán a ellas.
          </p>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:16}}>
            {["🏛️ Cuenta cheques","💳 Tarjeta de crédito","💵 Efectivo","📱 Cuenta digital"].map(t=>(
              <span key={t} style={{fontSize:11,padding:"4px 10px",borderRadius:20,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",color:"#666"}}>{t}</span>
            ))}
          </div>
          <Btn onClick={openNew}><Ic n="plus" size={14}/>Agregar primera cuenta</Btn>
        </Card>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
          {accounts.map(a=>{
            const color = TIPO_COLOR[a.type]||"#777";
            const isNeg = parseFloat(a.balance||0)<0 && a.type!=="credit";
            const nowA = new Date();
            const mesKeyA = `${nowA.getFullYear()}-${String(nowA.getMonth()+1).padStart(2,"0")}`;
            const txsMes = transactions.filter(t=>t.accountId===a.id&&t.date?.startsWith(mesKeyA));
            const ingrMes = txsMes.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
            const gastMes = txsMes.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
            const spark = Array.from({length:6},(_,i)=>{
              const d=new Date(nowA.getFullYear(),nowA.getMonth()-5+i,1);
              const mk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
              const txs=transactions.filter(t=>t.accountId===a.id&&t.date?.startsWith(mk));
              return txs.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0)
                   - txs.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
            });
            const sparkMax = Math.max(...spark.map(Math.abs),1);
            return (
              <Card key={a.id} style={{borderColor:`${color}22`,padding:0,overflow:"hidden",cursor:"pointer",transition:"transform .15s,box-shadow .15s"}}
                onClick={()=>{setDetailAccount(a);setMesFilter("all");}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px ${color}22`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                <div style={{height:3,background:`linear-gradient(90deg,${color},${color}55)`}}/>
                <div style={{padding:"14px 16px"}}>
                  {/* Header */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{minWidth:0,flex:1}}>
                      <p style={{fontSize:14,fontWeight:700,color:"#e0e0e0",margin:"0 0 3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.name}</p>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        <Badge label={TIPOS[a.type]||a.type} color={color}/>
                        {a.bank&&<Badge label={a.bank} color="#444"/>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:3,flexShrink:0}}>
                      <button onClick={e=>{e.stopPropagation();openEdit(a);}} style={{background:"none",border:"none",cursor:"pointer",color:"#555",padding:4,borderRadius:6}} onMouseEnter={e=>e.currentTarget.style.color="#aaa"} onMouseLeave={e=>e.currentTarget.style.color="#555"}><Ic n="edit" size={14}/></button>
                      <button onClick={e=>{e.stopPropagation();del(a);}} style={{background:"none",border:"none",cursor:"pointer",color:"#555",padding:4,borderRadius:6}} onMouseEnter={e=>e.currentTarget.style.color="#ff4757"} onMouseLeave={e=>e.currentTarget.style.color="#555"}><Ic n="trash" size={14}/></button>
                    </div>
                  </div>
                  {/* Saldo */}
                  <p style={{fontSize:24,fontWeight:800,color:isNeg?"#ff4757":color,margin:"0 0 10px",lineHeight:1}}>{fmt(a.balance,a.currency)}</p>
                  {/* Tarjeta: barra límite + aviso pago */}
                  {a.type==="credit"&&parseFloat(a.creditLimit||0)>0&&(
                    <div style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:10,color:"#555"}}>Crédito disponible</span>
                        <span style={{fontSize:10,color:"#555"}}>{(Math.abs(parseFloat(a.balance||0))/parseFloat(a.creditLimit)*100).toFixed(0)}% usado</span>
                      </div>
                      <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,.06)"}}>
                        <div style={{height:"100%",borderRadius:2,background:color,width:`${Math.min(Math.abs(parseFloat(a.balance||0))/parseFloat(a.creditLimit)*100,100)}%`}}/>
                      </div>
                      {a.fechaPago&&(()=>{
                        const dias=Math.round((new Date(a.fechaPago+"T12:00:00")-nowA)/86400000);
                        const deuda=Math.abs(Math.min(parseFloat(a.balance||0),0));
                        return deuda>0?<p style={{fontSize:10,color:dias<0?"#ff4757":dias<=7?"#f39c12":"#555",margin:"4px 0 0",fontWeight:dias<=7?600:400}}>{dias<0?`⚠️ Pago vencido hace ${Math.abs(dias)}d`:dias===0?"⚠️ Paga hoy":`Pago: ${fmtDate(a.fechaPago)} (${dias}d)`}</p>:null;
                      })()}
                    </div>
                  )}
                  {/* Flujo del mes */}
                  {a.type!=="credit"&&(ingrMes>0||gastMes>0)&&(
                    <div style={{display:"flex",gap:6,marginBottom:10}}>
                      {ingrMes>0&&<div style={{flex:1,background:"rgba(0,212,170,.07)",border:"1px solid rgba(0,212,170,.15)",borderRadius:7,padding:"5px 8px"}}><p style={{fontSize:9,color:"#555",margin:"0 0 1px",textTransform:"uppercase"}}>Entró</p><p style={{fontSize:12,fontWeight:700,color:"#00d4aa",margin:0}}>+{fmt(ingrMes,a.currency)}</p></div>}
                      {gastMes>0&&<div style={{flex:1,background:"rgba(255,71,87,.07)",border:"1px solid rgba(255,71,87,.15)",borderRadius:7,padding:"5px 8px"}}><p style={{fontSize:9,color:"#555",margin:"0 0 1px",textTransform:"uppercase"}}>Salió</p><p style={{fontSize:12,fontWeight:700,color:"#ff4757",margin:0}}>-{fmt(gastMes,a.currency)}</p></div>}
                    </div>
                  )}
                  {/* Sparkline 6 meses */}
                  {spark.some(v=>v!==0)&&(
                    <div style={{display:"flex",alignItems:"flex-end",gap:2,height:18,marginBottom:8}}>
                      {spark.map((v,i)=><div key={i} style={{flex:1,height:`${Math.max(Math.abs(v)/sparkMax*100,4)}%`,borderRadius:2,background:v>=0?"rgba(0,212,170,.45)":"rgba(255,71,87,.45)"}}/>)}
                    </div>
                  )}
                  {/* Footer */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:10,color:"#444"}}>{a.currency} · {txsMes.length} mov. este mes</span>
                    {a.type==="credit"&&<button onClick={e=>{e.stopPropagation();abrirPago(a);}} style={{padding:"4px 10px",borderRadius:7,background:"rgba(255,71,87,.1)",border:"1px solid rgba(255,71,87,.2)",color:"#ff6b7a",fontSize:11,fontWeight:600,cursor:"pointer"}}>Pagar</button>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* modal nueva/editar cuenta */}
      <Modal open={open} onClose={()=>setOpen(false)} title={editing?"Editar cuenta":"Nueva cuenta"}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Inp label="Nombre *" value={form.name} onChange={ch("name")} placeholder="Ej. Santander Cheques"/>
          <Inp label="Banco" value={form.bank} onChange={ch("bank")} placeholder="Ej. Santander"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Sel label="Tipo" value={form.type} onChange={ch("type")} options={Object.entries(TIPOS).map(([v,l])=>({value:v,label:l}))}/>
            <Sel label="Moneda" value={form.currency} onChange={ch("currency")} options={[{value:"MXN",label:"MXN"},{value:"USD",label:"USD"}]}/>
          </div>
          <Inp label="Saldo actual" type="number" value={form.balance} onChange={ch("balance")} placeholder="0.00"/>
          {form.type==="credit"&&(
            <>
              <Inp label="Límite de crédito" type="number" value={form.creditLimit} onChange={ch("creditLimit")} placeholder="0.00"/>
              <Inp label="Fecha de pago" type="date" value={form.fechaPago} onChange={ch("fechaPago")}/>
            </>
          )}
          <Inp label="Notas" value={form.notes} onChange={ch("notes")} placeholder="Opcional"/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
            <Btn variant="secondary" onClick={()=>setOpen(false)}>Cancelar</Btn>
            <Btn onClick={save}><Ic n="check" size={14}/>{editing?"Actualizar":"Crear"}</Btn>
          </div>
        </div>
      </Modal>
      {confirmModal}

      {/* ── PANEL DETALLE DE CUENTA ── */}
      {detailAccount&&(()=>{
        const a = accounts.find(x=>x.id===detailAccount.id)||detailAccount;
        const color = TIPO_COLOR[a.type]||"#777";
        const cur = a.currency||"MXN";

        // ── Transacciones de esta cuenta
        const txsCuenta = transactions.filter(t=>t.accountId===a.id);

        // ── Transferencias que involucran esta cuenta (como salida o entrada)
        const trCuenta = (transfers||[]).filter(t=>t.fromId===a.id||t.toId===a.id);

        // ── Unificar en lista de movimientos normalizada
        const movimientos = [
          ...txsCuenta.map(t=>({
            _id: t.id,
            _tipo: "tx",
            _raw: t,
            date: t.date,
            description: t.description||"Sin descripción",
            delta: t.type==="income" ? parseFloat(t.amount||0) : -parseFloat(t.amount||0),
            badge: t.category||null,
            badgeColor: t.type==="income"?"#00d4aa":"#ff4757",
            icon: t.type==="income"?"plus":"minus",
            iconBg: t.type==="income"?"rgba(0,212,170,.1)":"rgba(255,71,87,.1)",
            iconColor: t.type==="income"?"#00d4aa":"#ff4757",
          })),
          ...trCuenta.map(t=>{
            const esSalida = t.fromId===a.id;
            const contraparteNombre = esSalida ? t.toName : t.fromName;
            const delta = esSalida ? -parseFloat(t.amount||0) : parseFloat(t.toAmount||t.amount||0);
            const esPagoTarjeta = t.tipoPago==="pago_tarjeta";
            return {
              _id: t.id,
              _tipo: "transfer",
              _raw: t,
              date: t.date,
              description: t.description || (esPagoTarjeta ? `Pago tarjeta: ${contraparteNombre}` : esSalida ? `Transferencia a ${contraparteNombre}` : `Transferencia de ${contraparteNombre}`),
              delta,
              badge: esSalida ? `→ ${contraparteNombre}` : `← ${contraparteNombre}`,
              badgeColor: "#3b82f6",
              icon: "transfers",
              iconBg: "rgba(59,130,246,.1)",
              iconColor: "#3b82f6",
              esPagoTarjeta,
            };
          }),
        ].sort((x,y)=> x.date!==y.date ? (x.date<y.date?1:-1) : new Date(y._raw.createdAt||0)-new Date(x._raw.createdAt||0));

        // ── Running balance: partimos del saldo actual y restamos hacia atrás
        const saldoActual = parseFloat(a.balance||0);
        let runBal = saldoActual;
        const movConSaldo = movimientos.map(m=>{
          const bal = runBal;
          runBal -= m.delta;
          return {...m, saldoTras: bal};
        });

        // ── Filtro por mes
        const mesesDisp = [...new Set(movimientos.map(m=>m.date?.slice(0,7)))].sort((a,b)=>b.localeCompare(a)).slice(0,6);
        const movFiltrados = mesFilter==="all" ? movConSaldo : movConSaldo.filter(m=>m.date?.startsWith(mesFilter));

        // ── KPIs del período
        const entradasPeriodo  = movFiltrados.filter(m=>m.delta>0).reduce((s,m)=>s+m.delta,0);
        const salidasPeriodo   = movFiltrados.filter(m=>m.delta<0).reduce((s,m)=>s+Math.abs(m.delta),0);
        const txCount = movFiltrados.filter(m=>m._tipo==="tx").length;
        const trCount = movFiltrados.filter(m=>m._tipo==="transfer").length;

        // ── Top categorías (solo transacciones gasto)
        const catMap={};
        movFiltrados.filter(m=>m._tipo==="tx"&&m.delta<0).forEach(m=>{ const c=m._raw.category||"Sin cat"; catMap[c]=(catMap[c]||0)+Math.abs(m.delta); });
        const topCats=Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,4);

        return (
          <>
            <div onClick={()=>setDetailAccount(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:1000,backdropFilter:"blur(2px)"}}/>
            <div style={{position:"fixed",top:0,right:0,width:"min(480px,100vw)",height:"100vh",background:"#161b27",borderLeft:"1px solid rgba(255,255,255,.08)",zIndex:1001,display:"flex",flexDirection:"column",animation:"slideIn .2s ease"}}>
              {/* ── HEADER */}
              <div style={{padding:"20px 20px 14px",borderBottom:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:42,height:42,borderRadius:12,background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Ic n="accounts" size={20} color={color}/>
                    </div>
                    <div>
                      <p style={{fontSize:17,fontWeight:800,color:"#f0f0f0",margin:0,fontFamily:"'Syne',sans-serif"}}>{a.name}</p>
                      <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap"}}>
                        <Badge label={TIPOS[a.type]||a.type} color={color}/>
                        <Badge label={cur} color="#555"/>
                        {a.bank&&<Badge label={a.bank} color="#444"/>}
                      </div>
                    </div>
                  </div>
                  <button onClick={()=>setDetailAccount(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#555",padding:4,borderRadius:6}} onMouseEnter={e=>e.currentTarget.style.color="#aaa"} onMouseLeave={e=>e.currentTarget.style.color="#555"}>
                    <Ic n="close" size={20}/>
                  </button>
                </div>
                {/* Saldo actual */}
                <p style={{fontSize:32,fontWeight:800,color:parseFloat(a.balance||0)<0&&a.type!=="credit"?"#ff4757":color,margin:"0 0 4px"}}>{fmt(a.balance,cur)}</p>
                {a.type==="credit"&&parseFloat(a.creditLimit||0)>0&&(
                  <div style={{marginBottom:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:11,color:"#555"}}>Usado: {fmt(Math.abs(parseFloat(a.balance||0)),cur)}</span>
                      <span style={{fontSize:11,color:"#00d4aa"}}>Disponible: {fmt(parseFloat(a.creditLimit||0)-Math.abs(parseFloat(a.balance||0)),cur)}</span>
                    </div>
                    <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,.06)"}}>
                      <div style={{height:"100%",borderRadius:3,background:color,width:`${Math.min(Math.abs(parseFloat(a.balance||0))/parseFloat(a.creditLimit)*100,100)}%`,transition:"width .5s"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                      <span style={{fontSize:10,color:"#444"}}>{(Math.abs(parseFloat(a.balance||0))/parseFloat(a.creditLimit)*100).toFixed(0)}% del límite ({fmt(a.creditLimit,cur)})</span>
                      {a.fechaPago&&<span style={{fontSize:10,color:"#f39c12"}}>Pago: {a.fechaPago}</span>}
                    </div>
                  </div>
                )}
                {/* KPIs período */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:8}}>
                  <div style={{background:"rgba(0,212,170,.06)",border:"1px solid rgba(0,212,170,.1)",borderRadius:8,padding:"7px 10px"}}>
                    <p style={{fontSize:9,color:"#555",margin:"0 0 2px",textTransform:"uppercase",letterSpacing:.4}}>Entradas</p>
                    <p style={{fontSize:13,fontWeight:700,color:"#00d4aa",margin:0}}>{fmt(entradasPeriodo,cur)}</p>
                  </div>
                  <div style={{background:"rgba(255,71,87,.06)",border:"1px solid rgba(255,71,87,.1)",borderRadius:8,padding:"7px 10px"}}>
                    <p style={{fontSize:9,color:"#555",margin:"0 0 2px",textTransform:"uppercase",letterSpacing:.4}}>Salidas</p>
                    <p style={{fontSize:13,fontWeight:700,color:"#ff4757",margin:0}}>{fmt(salidasPeriodo,cur)}</p>
                  </div>
                  <div style={{background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.1)",borderRadius:8,padding:"7px 10px"}}>
                    <p style={{fontSize:9,color:"#555",margin:"0 0 2px",textTransform:"uppercase",letterSpacing:.4}}>Movimientos</p>
                    <p style={{fontSize:13,fontWeight:700,color:"#3b82f6",margin:0}}>{txCount} tx · {trCount} tr</p>
                  </div>
                </div>
              </div>

              {/* ── FILTRO MES */}
              <div style={{padding:"10px 20px",borderBottom:"1px solid rgba(255,255,255,.05)",flexShrink:0}}>
                <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
                  <button onClick={()=>setMesFilter("all")} style={{padding:"4px 11px",borderRadius:7,border:`1px solid ${mesFilter==="all"?"rgba(0,212,170,.4)":"rgba(255,255,255,.08)"}`,background:mesFilter==="all"?"rgba(0,212,170,.1)":"transparent",color:mesFilter==="all"?"#00d4aa":"#555",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
                    Todos ({movimientos.length})
                  </button>
                  {mesesDisp.map(m=>(
                    <button key={m} onClick={()=>setMesFilter(m)} style={{padding:"4px 11px",borderRadius:7,border:`1px solid ${mesFilter===m?"rgba(0,212,170,.4)":"rgba(255,255,255,.08)"}`,background:mesFilter===m?"rgba(0,212,170,.1)":"transparent",color:mesFilter===m?"#00d4aa":"#555",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
                      {new Date(m+"-15").toLocaleDateString("es-MX",{month:"short",year:"2-digit"})} ({movimientos.filter(mv=>mv.date?.startsWith(m)).length})
                    </button>
                  ))}
                </div>
              </div>

              {/* ── TOP CATEGORÍAS */}
              {topCats.length>0&&(
                <div style={{padding:"10px 20px",borderBottom:"1px solid rgba(255,255,255,.05)",flexShrink:0}}>
                  <p style={{fontSize:9,color:"#444",textTransform:"uppercase",letterSpacing:.4,marginBottom:6}}>Top categorías de gasto</p>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {topCats.map(([cat,val])=>{
                      const pct=salidasPeriodo>0?val/salidasPeriodo*100:0;
                      return (
                        <div key={cat}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                            <span style={{fontSize:11,color:"#888"}}>{cat}</span>
                            <span style={{fontSize:11,color:"#ff4757",fontWeight:600}}>{fmt(val)}</span>
                          </div>
                          <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,.05)"}}>
                            <div style={{height:"100%",borderRadius:2,background:"#ff4757",width:`${pct}%`}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── LISTA DE MOVIMIENTOS */}
              <div style={{flex:1,overflowY:"auto",padding:"10px 20px"}}>
                <p style={{fontSize:9,color:"#444",textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>
                  Estado de cuenta · {movFiltrados.length} movimiento{movFiltrados.length!==1?"s":""}
                </p>
                {movFiltrados.length===0?(
                  <div style={{textAlign:"center",padding:"40px 0",color:"#444"}}>
                    <Ic n="transactions" size={32} color="#333"/>
                    <p style={{marginTop:8,fontSize:13}}>Sin movimientos en este período</p>
                  </div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:1}}>
                    {movFiltrados.map((mv,i)=>(
                      <div key={mv._id} style={{borderRadius:9,background:i%2===0?"rgba(255,255,255,.015)":"transparent",marginBottom:1,overflow:"hidden"}}>
                        <div style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px"}}>
                          {/* Ícono */}
                          <div style={{width:30,height:30,borderRadius:8,background:mv.iconBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <Ic n={mv.icon} size={14} color={mv.iconColor}/>
                          </div>
                          {/* Descripción */}
                          <div style={{flex:1,minWidth:0}}>
                            <p style={{fontSize:12,fontWeight:600,color:"#e0e0e0",margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{mv.description}</p>
                            <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                              <span style={{fontSize:10,color:"#444"}}>{fmtDate(mv.date)}</span>
                              {mv.badge&&<Badge label={mv.badge} color={mv.badgeColor}/>}
                            </div>
                          </div>
                          {/* Monto + saldo tras */}
                          <div style={{textAlign:"right",flexShrink:0}}>
                            <p style={{fontSize:13,fontWeight:700,color:mv.delta>=0?"#00d4aa":"#ff4757",margin:"0 0 1px"}}>
                              {mv.delta>=0?"+":""}{fmt(Math.abs(mv.delta),cur)}
                            </p>
                            <p style={{fontSize:10,color:"#444",margin:0,fontVariantNumeric:"tabular-nums"}}>
                              {fmt(mv.saldoTras,cur)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Saldo inicial estimado al final */}
                    <div style={{margin:"8px 0 0",padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,.03)",border:"1px dashed rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:10,color:"#444"}}>Saldo inicial estimado (antes de estos movimientos)</span>
                      <span style={{fontSize:12,fontWeight:700,color:"#666",fontVariantNumeric:"tabular-nums"}}>{fmt(movFiltrados.length>0?movFiltrados[movFiltrados.length-1].saldoTras-movFiltrados[movFiltrados.length-1].delta:saldoActual,cur)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── BOTONES */}
              <div style={{padding:"12px 20px",borderTop:"1px solid rgba(255,255,255,.06)",display:"flex",gap:8,flexShrink:0,flexWrap:"wrap"}}>
                <Btn onClick={()=>{setDetailAccount(null);openEdit(a);}} variant="secondary" style={{flex:1,justifyContent:"center",minWidth:100}}>
                  <Ic n="edit" size={14}/>Editar
                </Btn>
                <Btn onClick={()=>{
                  setDetailAccount(null);
                  sessionStorage.setItem("fp_new_tx_account", a.id);
                  navigate("transactions:new");
                }} style={{flex:1,justifyContent:"center",minWidth:100,background:"linear-gradient(135deg,rgba(0,212,170,.15),rgba(0,212,170,.08))",border:"1px solid rgba(0,212,170,.3)",color:"#00d4aa"}}>
                  <Ic n="plus" size={14}/>Nueva tx
                </Btn>
                <Btn onClick={()=>{setDetailAccount(null);navigate("transfers");}} style={{flex:1,justifyContent:"center",minWidth:100,background:"linear-gradient(135deg,rgba(59,130,246,.15),rgba(59,130,246,.08))",border:"1px solid rgba(59,130,246,.3)",color:"#3b82f6"}}>
                  <Ic n="transfers" size={14}/>Transferir
                </Btn>
                {a.type==="credit"&&(
                  <Btn onClick={()=>{setDetailAccount(null);abrirPago(a);}} style={{flex:1,justifyContent:"center",minWidth:100,background:"linear-gradient(135deg,rgba(255,71,87,.2),rgba(255,71,87,.1))",border:"1px solid rgba(255,71,87,.3)",color:"#ff6b7a"}}>
                    <Ic n="transfers" size={14}/>Pagar tarjeta
                  </Btn>
                )}
              </div>
            </div>
          </>
        );
      })()}

      {/* ── MODAL PAGO DE TARJETA */}
      <Modal open={pagoOpen} onClose={()=>setPagoOpen(false)} title={`Pagar tarjeta: ${pagoCard?.name||""}`} width={420}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {pagoCard&&(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"rgba(255,71,87,.07)",border:"1px solid rgba(255,71,87,.15)",borderRadius:10}}>
              <div>
                <p style={{fontSize:12,color:"#888",margin:"0 0 2px"}}>Saldo actual de la tarjeta</p>
                <p style={{fontSize:18,fontWeight:800,color:"#ff6b7a",margin:0}}>{fmt(Math.abs(parseFloat(pagoCard.balance||0)))}</p>
              </div>
              {parseFloat(pagoCard.creditLimit||0)>0&&(
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:11,color:"#555",margin:"0 0 2px"}}>Disponible tras pago</p>
                  <p style={{fontSize:13,fontWeight:700,color:"#00d4aa",margin:0}}>
                    {fmt(parseFloat(pagoCard.creditLimit||0) - Math.abs(parseFloat(pagoCard.balance||0)) + (parseFloat(pagoForm.monto)||0))}
                  </p>
                </div>
              )}
            </div>
          )}
          <Sel label="Pagar desde *" value={pagoForm.fromId} onChange={fp("fromId")}
            options={[{value:"",label:"— Selecciona cuenta origen —"},
              ...accounts.filter(a=>a.type!=="credit"&&a.id!==pagoCard?.id).map(a=>({
                value:a.id, label:`${a.name} — ${fmt(a.balance,a.currency)}`
              }))
            ]}/>
          <Inp label="Monto a pagar *" type="number" value={pagoForm.monto} onChange={fp("monto")} placeholder="0.00"/>
          {pagoForm.fromId&&pagoForm.monto&&(
            <div style={{padding:"8px 12px",background:"rgba(0,212,170,.06)",border:"1px solid rgba(0,212,170,.15)",borderRadius:8,fontSize:12}}>
              <span style={{color:"#555"}}>Saldo restante en cuenta: </span>
              <strong style={{color:(parseFloat(accounts.find(a=>a.id===pagoForm.fromId)?.balance||0)-(parseFloat(pagoForm.monto)||0))>=0?"#00d4aa":"#ff4757"}}>
                {fmt(parseFloat(accounts.find(a=>a.id===pagoForm.fromId)?.balance||0)-(parseFloat(pagoForm.monto)||0))}
              </strong>
            </div>
          )}
          <Inp label="Descripción" value={pagoForm.descripcion} onChange={fp("descripcion")} placeholder="Pago tarjeta..."/>
          <Inp label="Fecha" type="date" value={pagoForm.date} onChange={fp("date")}/>
          <Inp label="Notas" value={pagoForm.notas} onChange={fp("notas")} placeholder="Opcional"/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
            <Btn variant="secondary" onClick={()=>setPagoOpen(false)}>Cancelar</Btn>
            <Btn onClick={guardarPago} style={{background:"linear-gradient(135deg,#ff4757,#c0392b)"}}>
              <Ic n="check" size={14}/>Registrar pago
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── TRANSACCIONES ────────────────────────────────────────────────────────────
const Transactions = ({ initialDate=null, initialAccount="" }) => {
  const { user, toast } = useCtx();
  const [transactions, setTransactions] = useData(user.id, "transactions");
  const [accounts, setAccounts] = useData(user.id, "accounts");
  const [goals, setGoals] = useData(user.id, "goals");
  const [config] = useData(user.id, "config", {});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [askConfirm, confirmModal] = useConfirm();
  const [showCharts, setShowCharts] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const blank = { type:"income", accountId:"", amount:"", description:"", category:"", date:today(), currency:"MXN", notes:"", tags:[], metaId:"" };
  const [form, setForm] = useState(blank);
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));
  // Si se navega desde Calendario con fecha, abrir modal automáticamente
  React.useEffect(()=>{ if(initialDate){ setForm(p=>({...p,date:initialDate})); setOpen(true); } },[initialDate]);
  React.useEffect(()=>{
    if(initialAccount){
      setForm(p=>({...p,accountId:initialAccount}));
      setOpen(true);
      sessionStorage.removeItem("fp_new_tx_account");
    }
  },[initialAccount]);

  const DEFAULT_CATS = {
    income:["Salario","Freelance","Negocio","Renta","Intereses","Dividendos","Intereses cobrados","Retiro de inversión","Dividendos e intereses","Ganancia de inversión","Recuperación de capital","Otro"],
    expense:["Alimentación","Transporte","Salud","Educación","Entretenimiento","Ropa","Servicios","Hipoteca / Vivienda","Pago de deuda","Pérdida de inversión","Abono a capital","Otro"],
  };
  // Unión de DEFAULT + config guardado + categorías en uso real → nunca pierde ninguna
  const cats = {
    income: [...new Set([...DEFAULT_CATS.income, ...(config.categorias?.income||[]), ...transactions.filter(t=>t.type==="income"&&t.category).map(t=>t.category)])],
    expense: [...new Set([...DEFAULT_CATS.expense, ...(config.categorias?.expense||[]), ...transactions.filter(t=>t.type==="expense"&&t.category).map(t=>t.category)])],
  };

  const applyDelta = (accs, id, delta) => accs.map(a=>a.id===id?{...a,balance:parseFloat(a.balance||0)+delta}:a);

  const openNew = () => { setEditing(null); setForm({...blank,accountId:accounts[0]?.id||""}); setOpen(true); };
  const openEdit = tx => { setEditing(tx); setForm({type:tx.type,accountId:tx.accountId,amount:tx.amount.toString(),description:tx.description,category:tx.category||"",date:tx.date,currency:tx.currency,notes:tx.notes||"",tags:tx.tags||[],metaId:tx.metaId||""}); setOpen(true); };
  const close = () => { setOpen(false); setEditing(null); setTagInput(""); };

  const save = () => {
    if (!form.description.trim()||!form.amount||!form.accountId) { toast("Completa los campos requeridos.","error"); return; }
    const amount = parseFloat(form.amount);
    if (isNaN(amount)||amount<=0) { toast("Monto inválido.","error"); return; }
    const newDelta = form.type==="income"?Math.abs(amount):-Math.abs(amount);
    if (editing) {
      const oldDelta = editing.type==="income"?-editing.amount:editing.amount;
      let accs = applyDelta(accounts, editing.accountId, oldDelta);
      accs = applyDelta(accs, form.accountId, newDelta);
      setAccounts(accs);
      const txId = editing.id;
      setTransactions(transactions.map(t=>t.id===txId?{...t,...form,amount}:t));
      // actualizar aportación en meta si cambió
      if (form.metaId) {
        setGoals(prev=>prev.map(g=>{
          if (g.id!==form.metaId) return g;
          const aps = (g.aportaciones||[]).map(a=>a.txId===txId ? {...a,monto:amount,fecha:form.date} : a);
          // si no existía, agregar
          const existe = (g.aportaciones||[]).some(a=>a.txId===txId);
          return {...g, aportaciones: existe ? aps : [...(g.aportaciones||[]),{id:genId(),monto:amount,fecha:form.date,notas:form.description,txId}]};
        }));
      } else if (editing.metaId) {
        // si se quitó la meta, eliminar la aportación
        setGoals(prev=>prev.map(g=>g.id===editing.metaId ? {...g,aportaciones:(g.aportaciones||[]).filter(a=>a.txId!==txId)} : g));
      }
      toast("Transacción actualizada.","success");
    } else {
      const txId = genId();
      setAccounts(applyDelta(accounts, form.accountId, newDelta));
      setTransactions([{id:txId,...form,amount,createdAt:new Date().toISOString()},...transactions]);
      // agregar aportación a meta si se seleccionó
      if (form.metaId) {
        setGoals(prev=>prev.map(g=>g.id===form.metaId
          ? {...g, aportaciones:[...(g.aportaciones||[]),{id:genId(),monto:amount,fecha:form.date,notas:form.description,txId}]}
          : g
        ));
        const meta = goals.find(g=>g.id===form.metaId);
        if (meta) toast(`Transacción registrada y aportada a "${meta.nombre||meta.name}" ✓`,"success");
        else toast("Transacción registrada.","success");
      } else {
        toast("Transacción registrada.","success");
      }
    }
    close();
  };

  const del = async tx => {
    const ok = await askConfirm("¿Eliminar esta transacción? El saldo de la cuenta se revertirá.");
    if (!ok) return;
    setAccounts(applyDelta(accounts, tx.accountId, tx.type==="income"?-tx.amount:tx.amount));
    setTransactions(transactions.filter(t=>t.id!==tx.id));
    // remover aportación de meta si estaba vinculada
    if (tx.metaId) {
      setGoals(prev=>prev.map(g=>g.id===tx.metaId
        ? {...g, aportaciones:(g.aportaciones||[]).filter(a=>a.txId!==tx.id)}
        : g
      ));
    }
    toast("Transacción eliminada y saldo revertido.","warning");
  };

  const typeColor = {income:"#00d4aa",expense:"#ff4757"};
  const sorted = [...transactions]
    .filter(t => filter==="all" || t.type===filter)
    .filter(t => !search || t.description.toLowerCase().includes(search.toLowerCase()) || (t.category||"").toLowerCase().includes(search.toLowerCase()) || (t.tags||[]).some(tag=>("#"+tag).toLowerCase().includes(search.toLowerCase())||tag.toLowerCase().includes(search.replace(/^#/,"").toLowerCase())))
    .filter(t => !dateFrom || t.date >= dateFrom)
    .filter(t => !dateTo   || t.date <= dateTo)
    .sort((a,b)=>new Date(b.date)-new Date(a.date));

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontSize:21, fontWeight:700, color:"#f0f0f0", marginBottom:3 }}>Transacciones</h2>
          <p style={{ fontSize:13, color:"#555" }}>{sorted.length} de {transactions.length} movimiento{transactions.length!==1?"s":""}</p>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          <button onClick={()=>setShowCharts(c=>!c)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",background:showCharts?"rgba(59,130,246,.15)":"rgba(255,255,255,.04)",border:`1px solid ${showCharts?"rgba(59,130,246,.3)":"rgba(255,255,255,.08)"}`,borderRadius:9,cursor:"pointer",color:showCharts?"#3b82f6":"#666",fontSize:12,fontWeight:600}}>
            <Ic n="chart" size={13}/>Gráficas
          </button>
          <div style={{ display:"flex", gap:3, background:"rgba(255,255,255,.04)", borderRadius:9, padding:3 }}>
            {[["all","Todo"],["income","Ingresos"],["expense","Gastos"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)} style={{ padding:"6px 12px", borderRadius:7, border:"none", cursor:"pointer", fontSize:12, fontWeight:filter===v?700:400, background:filter===v?"rgba(0,212,170,.15)":"transparent", color:filter===v?"#00d4aa":"#777" }}>{l}</button>
            ))}
          </div>
          <Btn onClick={openNew}><Ic n="plus" size={16}/>Nueva</Btn>
        </div>
      </div>
      {showCharts&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12,marginBottom:16}}>
          <BarChart6M transactions={transactions}/>
          <DonaCategoria transactions={transactions} mes={`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`}/>
        </div>
      )}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ flex:2, minWidth:180, position:"relative" }}>
          <Ic n="search" size={14} color="#555" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por descripción o categoría..."
            style={{ width:"100%", padding:"8px 10px 8px 32px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:9, color:"#e0e0e0", fontSize:13, outline:"none", boxSizing:"border-box" }}
            onFocus={e=>e.target.style.borderColor="#00d4aa"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.08)"}/>
        </div>
        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} title="Desde"
          style={{ padding:"8px 10px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:9, color:dateFrom?"#e0e0e0":"#555", fontSize:13, outline:"none", cursor:"pointer" }}
          onFocus={e=>e.target.style.borderColor="#00d4aa"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.08)"}/>
        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} title="Hasta"
          style={{ padding:"8px 10px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:9, color:dateTo?"#e0e0e0":"#555", fontSize:13, outline:"none", cursor:"pointer" }}
          onFocus={e=>e.target.style.borderColor="#00d4aa"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.08)"}/>
        {(search||dateFrom||dateTo) && (
          <button onClick={()=>{setSearch("");setDateFrom("");setDateTo("");}}
            style={{ padding:"8px 12px", background:"rgba(255,71,87,.08)", border:"1px solid rgba(255,71,87,.2)", borderRadius:9, color:"#ff4757", fontSize:12, cursor:"pointer" }}>
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* ── Panel resumen de tag */}
      {search && search.replace(/^#/,"").length>0 && (()=>{
        const tagQ = search.replace(/^#/,"").toLowerCase();
        const isBuscandoTag = sorted.length>0 && sorted.some(t=>(t.tags||[]).some(tag=>tag.toLowerCase().includes(tagQ)));
        if (!isBuscandoTag) return null;
        const txsConTag = transactions.filter(t=>(t.tags||[]).some(tag=>tag.toLowerCase().includes(tagQ)));
        if (txsConTag.length===0) return null;
        const totalGastado = txsConTag.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
        const totalIngresado = txsConTag.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
        const neto = totalIngresado - totalGastado;
        // desglose por categoría
        const porCat = {};
        txsConTag.filter(t=>t.type==="expense").forEach(t=>{
          const cat = t.category||"Sin categoría";
          porCat[cat] = (porCat[cat]||0) + parseFloat(t.amount||0);
        });
        const topCats = Object.entries(porCat).sort((a,b)=>b[1]-a[1]).slice(0,4);
        // rango de fechas
        const fechas = txsConTag.map(t=>t.date).sort();
        return (
          <div style={{marginBottom:16,borderRadius:13,border:"1px solid rgba(167,139,250,.25)",background:"rgba(167,139,250,.06)",overflow:"hidden"}}>
            {/* Header */}
            <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(167,139,250,.15)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16,fontWeight:800,color:"#a78bfa",background:"rgba(167,139,250,.15)",borderRadius:20,padding:"3px 12px"}}>#{tagQ}</span>
                <span style={{fontSize:12,color:"#555"}}>{txsConTag.length} transacción{txsConTag.length!==1?"es":""}</span>
                <span style={{fontSize:11,color:"#444"}}>· {fechas[0]} → {fechas[fechas.length-1]}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,fontWeight:700,color:neto>=0?"#00d4aa":"#ff4757"}}>
                  Neto: {neto>=0?"+":""}{fmt(neto)}
                </span>
                <button onClick={()=>{
                  if (!window.XLSX) {
                    const s=document.createElement("script");
                    s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
                    s.onload=()=>document.getElementById("btn-export-tag-"+tagQ)?.click();
                    document.head.appendChild(s); return;
                  }
                  const XLSX=window.XLSX, wb=XLSX.utils.book_new();
                  const rows=[...txsConTag].sort((a,b)=>a.date>b.date?1:-1).map(t=>({
                    Fecha:t.date, Descripción:t.description||"", Categoría:t.category||"",
                    Tipo:t.type==="income"?"Ingreso":"Gasto",
                    Monto:t.type==="income"?parseFloat(t.amount||0):-parseFloat(t.amount||0),
                    Cuenta:accounts.find(a=>a.id===t.accountId)?.name||"",
                    Tags:(t.tags||[]).join(", "), Notas:t.notes||"",
                  }));
                  const ws=XLSX.utils.json_to_sheet(rows);
                  ws["!cols"]=[{wch:12},{wch:35},{wch:18},{wch:10},{wch:14},{wch:20},{wch:20},{wch:30}];
                  const ws2=XLSX.utils.json_to_sheet([
                    {Concepto:"Tag",Valor:`#${tagQ}`},
                    {Concepto:"Total transacciones",Valor:txsConTag.length},
                    {Concepto:"Total gastos",Valor:-totalGastado},
                    {Concepto:"Total ingresos",Valor:totalIngresado},
                    {Concepto:"Neto",Valor:neto},
                    {Concepto:"Período",Valor:`${fechas[0]} → ${fechas[fechas.length-1]}`},
                    {Concepto:"Generado",Valor:new Date().toLocaleDateString("es-MX")},
                  ]);
                  ws2["!cols"]=[{wch:25},{wch:20}];
                  XLSX.utils.book_append_sheet(wb,ws,"Transacciones");
                  XLSX.utils.book_append_sheet(wb,ws2,"Resumen");
                  XLSX.writeFile(wb,`reporte_${tagQ}_${new Date().toISOString().split("T")[0]}.xlsx`);
                }}
                  id={`btn-export-tag-${tagQ}`}
                  style={{padding:"4px 12px",borderRadius:7,border:"1px solid rgba(0,212,170,.3)",
                    background:"rgba(0,212,170,.08)",color:"#00d4aa",cursor:"pointer",
                    fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                  <Ic n="download" size={12} color="#00d4aa"/> Exportar Excel
                </button>
              </div>
            </div>
            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:0}}>
              {[
                {l:"Total gastado",v:fmt(totalGastado),c:"#ff4757",show:totalGastado>0},
                {l:"Total ingresado",v:fmt(totalIngresado),c:"#00d4aa",show:totalIngresado>0},
                {l:"Promedio por tx",v:fmt(txsConTag.length>0?txsConTag.reduce((s,t)=>s+parseFloat(t.amount||0),0)/txsConTag.length:0),c:"#a78bfa",show:true},
                {l:"Transacciones",v:txsConTag.length,c:"#3b82f6",show:true},
              ].filter(k=>k.show).map(k=>(
                <div key={k.l} style={{padding:"10px 16px",borderRight:"1px solid rgba(167,139,250,.1)"}}>
                  <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 3px"}}>{k.l}</p>
                  <p style={{fontSize:15,fontWeight:800,color:k.c,margin:0}}>{k.v}</p>
                </div>
              ))}
            </div>
            {/* Top categorías */}
            {topCats.length>0&&(
              <div style={{padding:"8px 16px 10px",borderTop:"1px solid rgba(167,139,250,.1)"}}>
                <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 8px"}}>Top categorías de gasto</p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {topCats.map(([cat,monto])=>(
                    <div key={cat} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,background:"rgba(255,71,87,.08)",border:"1px solid rgba(255,71,87,.15)"}}>
                      <span style={{fontSize:11,color:"#ff6b7a",fontWeight:600}}>{cat}</span>
                      <span style={{fontSize:11,color:"#666"}}>{fmt(monto)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
      {/* ── Panel resumen de categoría */}
      {search && !search.startsWith("#") && search.trim().length>=2 && (()=>{
        const catQ = search.trim().toLowerCase();
        const txsByCat = transactions.filter(t=>t.category?.toLowerCase().includes(catQ));
        if (txsByCat.length===0) return null;
        // buscar categoría más frecuente que coincide
        const catCounts = {};
        txsByCat.forEach(t=>{ if(t.category) catCounts[t.category]=(catCounts[t.category]||0)+1; });
        const catLabel = Object.entries(catCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || search;
        const totalGastado = txsByCat.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
        const totalIngresado = txsByCat.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
        const neto = totalIngresado - totalGastado;
        const fechas = txsByCat.map(t=>t.date).sort();
        // desglose por subcategoría/tag
        const porTag = {};
        txsByCat.filter(t=>t.type==="expense").forEach(t=>{
          (t.tags||[]).forEach(tag=>{ porTag[tag]=(porTag[tag]||0)+parseFloat(t.amount||0); });
        });
        const topTags = Object.entries(porTag).sort((a,b)=>b[1]-a[1]).slice(0,4);
        const exportarCatXlsx = () => {
          const doExport = () => {
            const XLSX=window.XLSX, wb=XLSX.utils.book_new();
            const rows=[...txsByCat].sort((a,b)=>a.date>b.date?1:-1).map(t=>({
              Fecha:t.date, Descripción:t.description||"", Categoría:t.category||"",
              Tipo:t.type==="income"?"Ingreso":"Gasto",
              Monto:t.type==="income"?parseFloat(t.amount||0):-parseFloat(t.amount||0),
              Cuenta:accounts.find(a=>a.id===t.accountId)?.name||"",
              Tags:(t.tags||[]).join(", "), Notas:t.notes||"",
            }));
            const ws=XLSX.utils.json_to_sheet(rows);
            ws["!cols"]=[{wch:12},{wch:35},{wch:18},{wch:10},{wch:14},{wch:20},{wch:20},{wch:30}];
            const ws2=XLSX.utils.json_to_sheet([
              {Concepto:"Categoría",Valor:catLabel},
              {Concepto:"Total transacciones",Valor:txsByCat.length},
              {Concepto:"Total gastos",Valor:-totalGastado},
              {Concepto:"Total ingresos",Valor:totalIngresado},
              {Concepto:"Neto",Valor:neto},
              {Concepto:"Período",Valor:`${fechas[0]} → ${fechas[fechas.length-1]}`},
              {Concepto:"Generado",Valor:new Date().toLocaleDateString("es-MX")},
            ]);
            ws2["!cols"]=[{wch:25},{wch:20}];
            XLSX.utils.book_append_sheet(wb,ws,"Transacciones");
            XLSX.utils.book_append_sheet(wb,ws2,"Resumen");
            XLSX.writeFile(wb,`reporte_cat_${catLabel.replace(/\s+/g,"_")}_${new Date().toISOString().split("T")[0]}.xlsx`);
          };
          if (!window.XLSX) {
            const s=document.createElement("script");
            s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
            s.onload=doExport; document.head.appendChild(s);
          } else { doExport(); }
        };
        return (
          <div style={{marginBottom:16,borderRadius:13,border:"1px solid rgba(59,130,246,.25)",background:"rgba(59,130,246,.06)",overflow:"hidden"}}>
            {/* Header */}
            <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(59,130,246,.15)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:15,fontWeight:800,color:"#3b82f6",background:"rgba(59,130,246,.15)",borderRadius:20,padding:"3px 12px"}}>{catLabel}</span>
                <span style={{fontSize:12,color:"#555"}}>{txsByCat.length} transacción{txsByCat.length!==1?"es":""}</span>
                <span style={{fontSize:11,color:"#444"}}>· {fechas[0]} → {fechas[fechas.length-1]}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,fontWeight:700,color:neto>=0?"#00d4aa":"#ff4757"}}>
                  Neto: {neto>=0?"+":""}{fmt(neto)}
                </span>
                <button onClick={exportarCatXlsx}
                  style={{padding:"4px 12px",borderRadius:7,border:"1px solid rgba(59,130,246,.3)",
                    background:"rgba(59,130,246,.08)",color:"#3b82f6",cursor:"pointer",
                    fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                  <Ic n="download" size={12} color="#3b82f6"/> Exportar Excel
                </button>
              </div>
            </div>
            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:0}}>
              {[
                {l:"Total gastado",v:fmt(totalGastado),c:"#ff4757",show:totalGastado>0},
                {l:"Total ingresado",v:fmt(totalIngresado),c:"#00d4aa",show:totalIngresado>0},
                {l:"Promedio por tx",v:fmt(txsByCat.length>0?txsByCat.reduce((s,t)=>s+parseFloat(t.amount||0),0)/txsByCat.length:0),c:"#3b82f6",show:true},
                {l:"Transacciones",v:txsByCat.length,c:"#a78bfa",show:true},
              ].filter(k=>k.show).map(k=>(
                <div key={k.l} style={{padding:"10px 16px",borderRight:"1px solid rgba(59,130,246,.1)"}}>
                  <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 3px"}}>{k.l}</p>
                  <p style={{fontSize:15,fontWeight:800,color:k.c,margin:0}}>{k.v}</p>
                </div>
              ))}
            </div>
            {/* Top tags */}
            {topTags.length>0&&(
              <div style={{padding:"8px 16px 10px",borderTop:"1px solid rgba(59,130,246,.1)"}}>
                <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 8px"}}>Top etiquetas en gastos</p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {topTags.map(([tag,monto])=>(
                    <div key={tag} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,background:"rgba(167,139,250,.08)",border:"1px solid rgba(167,139,250,.2)"}}>
                      <span style={{fontSize:11,color:"#a78bfa",fontWeight:600}}>#{tag}</span>
                      <span style={{fontSize:11,color:"#666"}}>{fmt(monto)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
      {sorted.length===0 ? (
        <div style={{ textAlign:"center", padding:"40px 20px" }}>
          <div style={{fontSize:44,marginBottom:8}}>💳</div>
          <p style={{fontSize:16,fontWeight:700,color:"#e0e0e0",margin:"0 0 8px"}}>Sin transacciones aún</p>
          <p style={{fontSize:13,color:"#555",margin:"0 0 16px",lineHeight:1.5,maxWidth:340,marginLeft:"auto",marginRight:"auto"}}>
            Registra tus ingresos y gastos aquí, o díselo al <strong style={{color:"#00d4aa"}}>Asistente IA</strong> con lenguaje natural: <em style={{color:"#666"}}>"gasté 200 en comida"</em>
          </p>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <Btn onClick={openNew}><Ic n="plus" size={14}/>Registrar manualmente</Btn>
          </div>
        </div>
      ) : (
        <Card style={{ padding:0, overflow:"hidden" }}>
          {sorted.map((tx,i)=>(
            <div key={tx.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderBottom:i<sorted.length-1?"1px solid rgba(255,255,255,.04)":"none" }}>
              <div style={{ width:34, height:34, borderRadius:9, background:`${typeColor[tx.type]}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Ic n={tx.type==="income"?"plus":"warn"} size={16} color={typeColor[tx.type]}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:600, color:"#e0e0e0", margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{tx.description}</p>
                <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, color:"#555" }}>{fmtDate(tx.date)}</span>
                  {tx.category&&<Badge label={tx.category} color={typeColor[tx.type]}/>}
                  {tx.origen&&<Badge label={tx.origen==="prestamo"?"Préstamo":tx.origen==="inversion"?"Inversión":"Hipoteca"} color="#7c3aed"/>}
                  {tx.metaId&&(()=>{
                    const g=goals.find(x=>x.id===tx.metaId);
                    return g?<span style={{fontSize:10,fontWeight:600,color:"#a78bfa",background:"rgba(124,58,237,.12)",borderRadius:20,padding:"1px 7px"}}>🎯 {g.nombre||g.name}</span>:null;
                  })()}
                  {(tx.tags||[]).map(tag=>(
                    <span key={tag} onClick={()=>setSearch("#"+tag)} style={{fontSize:10,fontWeight:600,color:"#a78bfa",background:"rgba(124,58,237,.12)",borderRadius:20,padding:"1px 7px",cursor:"pointer"}}>#{tag}</span>
                  ))}
                  <span style={{ fontSize:11, color:"#444" }}>{accounts.find(a=>a.id===tx.accountId)?.name||"—"}</span>
                </div>
              </div>
              <span style={{ fontSize:14, fontWeight:700, color:typeColor[tx.type], flexShrink:0 }}>
                {tx.type==="income"?"+":"-"}{fmt(tx.amount,tx.currency)}
              </span>
              <Actions onEdit={()=>openEdit(tx)} onDelete={()=>del(tx)}/>
            </div>
          ))}
        </Card>
      )}
      {open && (
        <Modal title={editing?"Editar Transacción":"Nueva Transacción"} onClose={close}>
          <Sel label="Tipo" value={form.type} onChange={f("type")} options={[{value:"income",label:"💚 Ingreso"},{value:"expense",label:"🔴 Gasto"}]}/>
          {accounts.length===0 ? <Alert>Crea una cuenta primero.</Alert>
            : <Sel label="Cuenta" value={form.accountId} onChange={f("accountId")} required options={accounts.map(a=>({value:a.id,label:`${a.name} — ${fmt(a.balance,a.currency)}`}))}/>
          }
          <Inp label="Descripción" value={form.description} onChange={f("description")} placeholder="Ej. Pago nómina" required/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Inp label="Monto" type="number" value={form.amount} onChange={f("amount")} placeholder="0.00" required/>
            <Sel label="Moneda" value={form.currency} onChange={f("currency")} options={[{value:"MXN",label:"MXN"},{value:"USD",label:"USD"}]}/>
          </div>
          <Sel label="Categoría" value={form.category} onChange={f("category")} options={[{value:"",label:"Sin categoría"},...(cats[form.type]||[]).map(c=>({value:c,label:c}))]}/>
          <Inp label="Fecha" type="date" value={form.date} onChange={f("date")}/>
          <Inp label="Notas (opcional)" value={form.notes} onChange={f("notes")} placeholder="Notas..."/>
          {/* ── META VINCULADA */}
          {goals.filter(g=>g.estado==="activa"||!g.estado).length>0 && (
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,color:"#777",fontWeight:600,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:6}}>
                Vincular a meta <span style={{color:"#555",textTransform:"none",fontWeight:400,fontSize:10}}>(opcional)</span>
              </label>
              <select value={form.metaId} onChange={e=>setForm(p=>({...p,metaId:e.target.value}))}
                style={{width:"100%",padding:"10px 13px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:9,color:form.metaId?"#e0e0e0":"#555",fontSize:13,outline:"none",cursor:"pointer"}}
                onFocus={e=>e.target.style.borderColor="#a78bfa"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.1)"}>
                <option value="">— Sin vincular —</option>
                {goals.filter(g=>g.estado==="activa"||!g.estado).map(g=>{
                  const aportado=(g.aportaciones||[]).reduce((s,a)=>s+parseFloat(a.monto||0),0);
                  const meta=parseFloat(g.meta||g.target||0);
                  const pct=meta>0?Math.min(aportado/meta*100,100):0;
                  return <option key={g.id} value={g.id}>{g.nombre||g.name} ({pct.toFixed(0)}%)</option>;
                })}
              </select>
              {form.metaId && (()=>{
                const g=goals.find(x=>x.id===form.metaId);
                if(!g) return null;
                const aportado=(g.aportaciones||[]).reduce((s,a)=>s+parseFloat(a.monto||0),0);
                const meta=parseFloat(g.meta||g.target||0);
                const pct=meta>0?Math.min(aportado/meta*100,100):0;
                return (
                  <div style={{marginTop:6,padding:"7px 10px",borderRadius:8,background:"rgba(124,58,237,.08)",border:"1px solid rgba(124,58,237,.2)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:11,color:"#a78bfa",fontWeight:600}}>{g.nombre||g.name}</span>
                      <span style={{fontSize:11,color:"#a78bfa"}}>{fmt(aportado)} / {fmt(meta)}</span>
                    </div>
                    <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,.06)"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:"#7c3aed",borderRadius:2}}/>
                    </div>
                    <p style={{fontSize:10,color:"#666",margin:"4px 0 0"}}>Esta transacción se sumará automáticamente como aportación</p>
                  </div>
                );
              })()}
            </div>
          )}
          {/* ── TAGS */}
          <div>
            <label style={{fontSize:11,color:"#777",fontWeight:600,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:6}}>Etiquetas</label>
            {/* chips de tags existentes */}
            {(form.tags||[]).length>0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                {(form.tags||[]).map(tag=>(
                  <span key={tag} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,color:"#a78bfa",background:"rgba(124,58,237,.15)",border:"1px solid rgba(124,58,237,.3)",borderRadius:20,padding:"2px 10px",cursor:"pointer"}}
                    onClick={()=>setForm(p=>({...p,tags:p.tags.filter(t=>t!==tag)}))}>
                    #{tag} <span style={{fontSize:12,opacity:.6}}>×</span>
                  </span>
                ))}
              </div>
            )}
            {/* input para nuevo tag */}
            <input
              value={tagInput}
              onChange={e=>setTagInput(e.target.value.replace(/[,#\s]/g,""))}
              onKeyDown={e=>{
                if((e.key==="Enter"||e.key===","||e.key===" ")&&tagInput.trim()){
                  e.preventDefault();
                  const tag=tagInput.trim().toLowerCase();
                  if(tag&&!(form.tags||[]).includes(tag)){
                    setForm(p=>({...p,tags:[...(p.tags||[]),tag]}));
                  }
                  setTagInput("");
                }
                if(e.key==="Backspace"&&!tagInput&&(form.tags||[]).length>0){
                  setForm(p=>({...p,tags:p.tags.slice(0,-1)}));
                }
              }}
              placeholder="Escribe un tag y presiona Enter (ej: hyrox, viaje, remodelacion)"
              style={{width:"100%",padding:"8px 10px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,color:"#e0e0e0",fontSize:12,outline:"none",boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor="#a78bfa"}
              onBlur={e=>{
                e.target.style.borderColor="rgba(255,255,255,.08)";
                if(tagInput.trim()){
                  const tag=tagInput.trim().toLowerCase();
                  if(tag&&!(form.tags||[]).includes(tag)) setForm(p=>({...p,tags:[...(p.tags||[]),tag]}));
                  setTagInput("");
                }
              }}
            />
            <p style={{fontSize:10,color:"#444",margin:"4px 0 0"}}>Presiona Enter, coma o espacio para agregar. Clic en el tag para eliminarlo.</p>
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:6, flexWrap:"wrap" }}>
            <Btn variant="secondary" onClick={close}>Cancelar</Btn>
            {!editing&&(
              <Btn variant="secondary" onClick={()=>{
                if (!form.description.trim()||!form.amount||!form.accountId) { toast("Completa los campos requeridos.","error"); return; }
                const amount=parseFloat(form.amount);
                if(isNaN(amount)||amount<=0){ toast("Monto inválido.","error"); return; }
                const newDelta=form.type==="income"?Math.abs(amount):-Math.abs(amount);
                const txId=genId();
                setAccounts(applyDelta(accounts,form.accountId,newDelta));
                setTransactions(p=>[{id:txId,...form,amount,createdAt:new Date().toISOString()},...p]);
                if(form.metaId){
                  setGoals(prev=>prev.map(g=>g.id===form.metaId?{...g,aportaciones:[...(g.aportaciones||[]),{id:genId(),monto:amount,fecha:form.date,notas:form.description,txId}]}:g));
                }
                toast("Registrado ✓ — agrega el siguiente","success");
                // mantener cuenta, fecha y tipo — limpiar monto, descripción, tags
                setForm(p=>({...blank, type:p.type, accountId:p.accountId, date:p.date, currency:p.currency}));
                setTagInput("");
              }} style={{background:"rgba(0,212,170,.07)",border:"1px solid rgba(0,212,170,.2)",color:"#00d4aa"}}>
                <Ic n="plus" size={14}/> Guardar y agregar otro
              </Btn>
            )}
            <Btn onClick={save} disabled={accounts.length===0}><Ic n="check" size={15}/>{editing?"Guardar":"Registrar"}</Btn>
          </div>
        </Modal>
      )}
      {confirmModal}
    </div>
  );
};

// ─── TRANSFERENCIAS ───────────────────────────────────────────────────────────
const Transfers = () => {
  const { user, toast } = useCtx();
  const [transfers, setTransfers] = useData(user.id, "transfers");
  const [accounts, setAccounts]   = useData(user.id, "accounts");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [askConfirm, confirmModal] = useConfirm();
  const [tipoPago, setTipoPago] = useState("transferencia"); // "transferencia" | "pago_tarjeta"
  const blank = { fromId:"", toId:"", amount:"", exchangeRate:"", description:"", date:today(), notes:"" };
  const [form, setForm] = useState(blank);
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const cuentasNormales = accounts.filter(a=>a.type!=="credit");
  const tarjetas        = accounts.filter(a=>a.type==="credit");
  const fromAcc = accounts.find(a=>a.id===form.fromId);
  const toAcc   = accounts.find(a=>a.id===form.toId);
  const cross   = fromAcc && toAcc && fromAcc.currency!==toAcc.currency;
  const amount  = parseFloat(form.amount)||0;
  const rate    = parseFloat(form.exchangeRate)||0;
  const toAmt   = !cross||!rate ? amount : fromAcc.currency==="MXN" ? amount/rate : amount*rate;
  const ratePreview = cross&&rate&&amount ? (fromAcc.currency==="MXN" ? `${fmt(amount,"MXN")} ÷ ${rate} = ${fmt(toAmt,"USD")}` : `${fmt(amount,"USD")} × ${rate} = ${fmt(toAmt,"MXN")}`) : null;

  const applyMove = (accs, fromId, toId, debit, credit) =>
    accs.map(a=>{ if(a.id===fromId) return{...a,balance:a.balance-debit}; if(a.id===toId) return{...a,balance:a.balance+credit}; return a; });

  const openNew  = (tipo="transferencia") => { setTipoPago(tipo); setEditing(null); setForm({...blank,fromId:cuentasNormales[0]?.id||"",toId:tipo==="pago_tarjeta"?(tarjetas[0]?.id||""):(accounts[1]?.id||"")}); setOpen(true); };
  const openEdit = tr => { setEditing(tr); setForm({fromId:tr.fromId,toId:tr.toId,amount:tr.amount.toString(),exchangeRate:tr.exchangeRate?.toString()||"",description:tr.description||"",date:tr.date,notes:tr.notes||""}); setOpen(true); };
  const close    = () => { setOpen(false); setEditing(null); };

  const fetchRate = async () => {
    setLoadingRate(true);
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/USD");
      const d = await r.json();
      if (d?.rates?.MXN) { setForm(p=>({...p,exchangeRate:d.rates.MXN.toFixed(4)})); toast(`1 USD = $${d.rates.MXN.toFixed(2)} MXN`,"success"); }
    } catch { toast("No se pudo obtener la tasa.","error"); }
    setLoadingRate(false);
  };

  const save = () => {
    if (!form.fromId||!form.toId) { toast("Selecciona ambas cuentas.","error"); return; }
    if (form.fromId===form.toId) { toast("Las cuentas deben ser diferentes.","error"); return; }
    if (!amount||amount<=0) { toast("Monto inválido.","error"); return; }
    if (cross&&!rate) { toast("Ingresa el tipo de cambio.","error"); return; }
    if (tipoPago!=="pago_tarjeta"&&fromAcc&&amount>fromAcc.balance+0.01) { toast("Saldo insuficiente.","error"); return; }
    if (editing) {
      let accs = applyMove(accounts, editing.fromId, editing.toId, -editing.amount, -editing.toAmount);
      accs = applyMove(accs, form.fromId, form.toId, amount, toAmt);
      setAccounts(accs);
      setTransfers(transfers.map(t=>t.id===editing.id?{...t,...form,amount,toAmount:toAmt,exchangeRate:cross?rate:null,fromCurrency:fromAcc.currency,toCurrency:toAcc.currency,fromName:fromAcc.name,toName:toAcc.name}:t));
      toast("Transferencia actualizada.","success");
    } else {
      if (tipoPago==="pago_tarjeta") {
        // Movimiento contable correcto: transferencia interna, NO gasto.
        // Baja liquidez en cuenta origen + baja deuda en tarjeta.
        // El gasto ya existía cuando se usó la tarjeta.
        const deudaActual = parseFloat(toAcc.balance||0);
        const nuevoSaldoTarjeta = deudaActual<0 ? Math.min(deudaActual+amount,0) : Math.max(deudaActual-amount,0);
        setAccounts(p=>p.map(a=>{
          if(a.id===form.fromId) return {...a,balance:parseFloat(a.balance||0)-amount};
          if(a.id===form.toId)   return {...a,balance:nuevoSaldoTarjeta};
          return a;
        }));
        setTransfers([{
          id:genId(),...form,amount,toAmount:amount,
          tipoPago:"pago_tarjeta",
          fromCurrency:fromAcc.currency,toCurrency:toAcc.currency,
          fromName:fromAcc.name,toName:toAcc.name,
          createdAt:new Date().toISOString(),
        },...transfers]);
        toast(`Pago de ${fmt(amount)} a ${toAcc.name} registrado ✓`,"success");
      } else {
        setAccounts(applyMove(accounts, form.fromId, form.toId, amount, toAmt));
        setTransfers([{id:genId(),...form,amount,toAmount:toAmt,exchangeRate:cross?rate:null,fromCurrency:fromAcc.currency,toCurrency:toAcc.currency,fromName:fromAcc.name,toName:toAcc.name,createdAt:new Date().toISOString()},...transfers]);
        toast("Transferencia realizada.","success");
      }
    }
    close();
  };

  const del = async tr => {
    const ok = await askConfirm("¿Eliminar esta transferencia? Los saldos de ambas cuentas se revertirán.");
    if (!ok) return;
    setAccounts(applyMove(accounts, tr.fromId, tr.toId, -tr.amount, -tr.toAmount));
    setTransfers(transfers.filter(t=>t.id!==tr.id));
    toast("Transferencia eliminada y saldos revertidos.","warning");
  };

  const sorted = [...transfers].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const now = new Date();
  const mesKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const txMes = transfers.filter(t=>t.date?.startsWith(mesKey));
  const totalMes = txMes.filter(t=>t.tipoPago!=="pago_tarjeta").reduce((s,t)=>s+parseFloat(t.amount||0),0);
  const pagosMes = txMes.filter(t=>t.tipoPago==="pago_tarjeta").reduce((s,t)=>s+parseFloat(t.amount||0),0);
  const divisaMes = txMes.filter(t=>t.fromCurrency!==t.toCurrency).length;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontSize:21, fontWeight:700, color:"#f0f0f0", marginBottom:3 }}>Transferencias</h2>
          <p style={{ fontSize:13, color:"#555" }}>{transfers.length} transferencia{transfers.length!==1?"s":""} · {txMes.length} este mes</p>
        </div>
        <Btn onClick={openNew} disabled={accounts.length<2}><Ic n="plus" size={16}/>Nueva</Btn>
      </div>
      {/* KPIs del mes */}
      {txMes.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:16}}>
          {[
            {label:"Transferido este mes", valor:fmt(totalMes), color:"#3b82f6"},
            ...(pagosMes>0?[{label:"Pagos de tarjeta", valor:fmt(pagosMes), color:"#ff6b7a"}]:[]),
            ...(divisaMes>0?[{label:"Cambios de divisa", valor:divisaMes, color:"#f39c12"}]:[]),
          ].map(k=>(
            <Card key={k.label} style={{padding:"11px 14px"}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 3px"}}>{k.label}</p>
              <p style={{fontSize:16,fontWeight:700,color:k.color,margin:0}}>{k.valor}</p>
            </Card>
          ))}
        </div>
      )}
      {accounts.length<2 && <Alert>Necesitas al menos 2 cuentas para hacer transferencias.</Alert>}
      {sorted.length===0 ? (
        <div style={{ textAlign:"center", padding:"50px 0", color:"#444" }}>
          <Ic n="transfers" size={44} color="#333"/>
          <p style={{ marginTop:10, fontSize:14 }}>Sin transferencias.</p>
        </div>
      ) : (
        <Card style={{ padding:0, overflow:"hidden" }}>
          {sorted.map((tr,i)=>{
            const isCross   = tr.fromCurrency!==tr.toCurrency;
            const isPagoTj  = tr.tipoPago==="pago_tarjeta";
            const iconBg    = isPagoTj?"rgba(255,71,87,.12)":isCross?"rgba(243,156,18,.12)":"rgba(0,120,255,.12)";
            const iconColor = isPagoTj?"#ff6b7a":isCross?"#f39c12":"#0078ff";
            return (
              <div key={tr.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderBottom:i<sorted.length-1?"1px solid rgba(255,255,255,.04)":"none" }}>
                <div style={{ width:34, height:34, borderRadius:9, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Ic n={isPagoTj?"accounts":isCross?"exchange":"transfers"} size={17} color={iconColor}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  {tr.description&&<p style={{ fontSize:13, fontWeight:600, color:"#e0e0e0", margin:"0 0 3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{tr.description}</p>}
                  {/* flecha origen → destino */}
                  <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",marginBottom:2}}>
                    <span style={{fontSize:12,fontWeight:600,color:"#ccc",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tr.fromName}</span>
                    <span style={{fontSize:13,color:iconColor,fontWeight:700}}>→</span>
                    <span style={{fontSize:12,fontWeight:600,color:"#ccc",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tr.toName}</span>
                  </div>
                  <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                    <span style={{ fontSize:10, color:"#444" }}>{fmtDate(tr.date)}</span>
                    {isPagoTj&&<Badge label="Pago tarjeta" color="#ff6b7a"/>}
                    {isCross&&!isPagoTj&&<Badge label="Cambio divisa" color="#f39c12"/>}
                    {isCross&&tr.exchangeRate&&<span style={{fontSize:10,color:"#555"}}>TC: ${parseFloat(tr.exchangeRate).toFixed(2)}</span>}
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:"#ff6b6b", margin:"0 0 1px" }}>-{fmt(tr.amount,tr.fromCurrency)}</p>
                  {isPagoTj
                    ? <p style={{ fontSize:11, color:"#00d4aa", margin:0 }}>Deuda reducida</p>
                    : <p style={{ fontSize:13, fontWeight:700, color:"#00d4aa", margin:0 }}>+{fmt(tr.toAmount,tr.toCurrency)}</p>}
                </div>
                <Actions onEdit={()=>openEdit(tr)} onDelete={()=>del(tr)}/>
              </div>
            );
          })}
        </Card>
      )}
      {/* botón pago rápido de tarjeta */}
      {tarjetas.length>0&&!open&&(
        <div style={{marginBottom:12,display:"flex",gap:8,flexWrap:"wrap"}}>
          {tarjetas.map(t=>(
            <button key={t.id} onClick={()=>openNew("pago_tarjeta")} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:"rgba(255,71,87,.08)",border:"1px solid rgba(255,71,87,.2)",borderRadius:8,cursor:"pointer",color:"#ff6b7a",fontSize:12,fontWeight:600}}>
              <Ic n="transfers" size={13}/>Pagar {t.name}
            </button>
          ))}
        </div>
      )}
      {open && (
        <Modal title={tipoPago==="pago_tarjeta"?"Pago de tarjeta de crédito":(editing?"Editar Transferencia":"Nueva Transferencia")} onClose={close} width={500}>
          {/* selector tipo */}
          {!editing&&(
            <div style={{display:"flex",gap:6,marginBottom:16,background:"rgba(255,255,255,.03)",borderRadius:9,padding:3}}>
              {[{id:"transferencia",label:"Transferencia entre cuentas"},{id:"pago_tarjeta",label:"Pago de tarjeta"}].map(t=>(
                <button key={t.id} onClick={()=>{ setTipoPago(t.id); setForm(p=>({...p,toId:t.id==="pago_tarjeta"?(tarjetas[0]?.id||""):p.toId,description:t.id==="pago_tarjeta"?"Pago tarjeta":""})); }}
                  style={{flex:1,padding:"7px 10px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                    background:tipoPago===t.id?(t.id==="pago_tarjeta"?"rgba(255,71,87,.15)":"rgba(0,212,170,.15)"):"transparent",
                    color:tipoPago===t.id?(t.id==="pago_tarjeta"?"#ff6b7a":"#00d4aa"):"#666"}}>
                  {t.label}
                </button>
              ))}
            </div>
          )}
          {tipoPago==="pago_tarjeta"&&toAcc&&(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"rgba(255,71,87,.07)",border:"1px solid rgba(255,71,87,.2)",borderRadius:10,marginBottom:12}}>
              <div>
                <p style={{fontSize:11,color:"#888",margin:"0 0 1px"}}>Deuda actual: <strong style={{color:"#ff6b7a"}}>{fmt(Math.abs(parseFloat(toAcc.balance||0)))}</strong></p>
                {parseFloat(toAcc.fechaPago||0)&&<p style={{fontSize:10,color:"#555",margin:0}}>Fecha pago: {toAcc.fechaPago}</p>}
              </div>
              {parseFloat(toAcc.creditLimit||0)>0&&(
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:10,color:"#555",margin:"0 0 2px"}}>Disponible tras pago</p>
                  <p style={{fontSize:13,fontWeight:700,color:"#00d4aa"}}>{fmt(parseFloat(toAcc.creditLimit||0)-Math.abs(parseFloat(toAcc.balance||0))+(parseFloat(form.amount)||0))}</p>
                </div>
              )}
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Sel label="Cuenta Origen" value={form.fromId} onChange={e=>setForm(p=>({...p,fromId:e.target.value,exchangeRate:""}))} required options={cuentasNormales.map(a=>({value:a.id,label:`${a.name} (${fmt(a.balance,a.currency)})`}))}/>
            {tipoPago==="pago_tarjeta"
              ? <Sel label="Tarjeta a pagar" value={form.toId} onChange={e=>setForm(p=>({...p,toId:e.target.value}))} required options={tarjetas.map(a=>({value:a.id,label:a.name}))}/>
              : <Sel label="Cuenta Destino" value={form.toId} onChange={e=>setForm(p=>({...p,toId:e.target.value,exchangeRate:""}))} required options={accounts.map(a=>({value:a.id,label:`${a.name} (${a.currency})`}))}/>
            }
          </div>
          {fromAcc&&toAcc&&(
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
              <div style={{ background:"rgba(255,107,107,.06)", border:"1px solid rgba(255,107,107,.15)", borderRadius:9, padding:"9px 13px" }}>
                <p style={{ fontSize:11, color:"#888", margin:"0 0 2px" }}>Saldo origen</p>
                <p style={{ fontSize:15, fontWeight:700, color:"#ff6b6b", margin:0 }}>{fmt(fromAcc.balance,fromAcc.currency)}</p>
              </div>
              <div style={{ background:"rgba(0,212,170,.06)", border:"1px solid rgba(0,212,170,.15)", borderRadius:9, padding:"9px 13px" }}>
                <p style={{ fontSize:11, color:"#888", margin:"0 0 2px" }}>Saldo destino</p>
                <p style={{ fontSize:15, fontWeight:700, color:"#00d4aa", margin:0 }}>{fmt(toAcc.balance,toAcc.currency)}</p>
              </div>
            </div>
          )}
          <Inp label="Monto" type="number" value={form.amount} onChange={f("amount")} placeholder="0.00" prefix={fromAcc?.currency==="USD"?"US$":"$"} required/>
          {cross&&(
            <>
              <Alert color="#f39c12">Cuentas de distinta moneda — se requiere tipo de cambio</Alert>
              <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
                <div style={{ flex:1 }}><Inp label="Tipo de cambio (1 USD = ? MXN)" type="number" value={form.exchangeRate} onChange={f("exchangeRate")} placeholder="Ej. 17.50" required/></div>
                <Btn variant="secondary" onClick={fetchRate} disabled={loadingRate} style={{ marginBottom:14, whiteSpace:"nowrap" }}>{loadingRate?"...":"📡 Tasa actual"}</Btn>
              </div>
              {ratePreview&&<div style={{ background:"rgba(0,212,170,.07)", border:"1px solid rgba(0,212,170,.15)", borderRadius:9, padding:"9px 13px", marginBottom:14, fontSize:13, color:"#00d4aa" }}>💱 {ratePreview}</div>}
            </>
          )}
          <Inp label="Descripción (opcional)" value={form.description} onChange={f("description")} placeholder="Ej. Compra dólares"/>
          <Inp label="Fecha" type="date" value={form.date} onChange={f("date")}/>
          <Inp label="Notas (opcional)" value={form.notes} onChange={f("notes")} placeholder="Notas..."/>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:6 }}>
            <Btn variant="secondary" onClick={close}>Cancelar</Btn>
            <Btn onClick={save}><Ic n="check" size={15}/>{editing?"Guardar":"Transferir"}</Btn>
          </div>
        </Modal>
      )}
      {confirmModal}
    </div>
  );
};

// ─── PRÉSTAMOS ────────────────────────────────────────────────────────────────
const Loans = () => {
  const { user, toast } = useCtx();
  const [loans, setLoans]       = useData(user.id, "loans");
  const [accounts, setAccounts] = useData(user.id, "accounts");
  const [transactions, setTransactions] = useData(user.id, "transactions");
  const [view, setView]     = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const selected = loans.find(l=>l.id===selectedId)||null;
  const [openLoan, setOpenLoan] = useState(false);
  const [openPay,  setOpenPay]  = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [askConfirm, confirmModal] = useConfirm();
  const blankLoan = { type:"given", name:"", accountId:"", principal:"", currency:"MXN", rateType:"annual", rate:"", startDate:today(), dueDate:"", notes:"", comisionApertura:"", comisionFega:"", otrosGastos:"" };
  const blankPay  = { amount:"", date:today(), paymentType:"interest_only", targetAccountId:"", notes:"", registrarComoTx:true };
  const [lf, setLF] = useState(blankLoan);
  const [pf, setPF] = useState(blankPay);
  const [fechaCorteGlobalInput, setFechaCorteGlobalInput] = useState(today());
  const lc = k => e => setLF(p=>({...p,[k]:e.target.value}));
  const pc = k => e => setPF(p=>({...p,[k]:e.target.value}));

  const dailyRate = (rate, type) => { const r=parseFloat(rate)||0; return type==="annual"?r/100/365:type==="monthly"?r/100/30:r/100; };

  // drAtDate: devuelve la tasa diaria vigente en una fecha dada, respetando tramos
  const drAtDate = (loan, date) => {
    const tramos = [...(loan.tramos||[])].sort((a,b)=>new Date(a.desde)-new Date(b.desde));
    // buscar el tramo vigente más reciente antes o en esa fecha
    let tramoVigente = null;
    for (const t of tramos) {
      if (new Date(t.desde) <= new Date(date)) tramoVigente = t;
    }
    if (tramoVigente) return dailyRate(tramoVigente.rate, tramoVigente.rateType||loan.rateType);
    return dailyRate(loan.rate, loan.rateType);
  };

  // calcInteresTramos: calcula interés entre dos fechas respetando cambios de tasa
  const calcInteresTramos = (loan, balance, fromDate, toDate) => {
    const tramos = [...(loan.tramos||[])].sort((a,b)=>new Date(a.desde)-new Date(b.desde));
    if (tramos.length===0) {
      const days = Math.max(0, Math.floor((toDate-fromDate)/86400000));
      return balance * dailyRate(loan.rate, loan.rateType) * days;
    }
    // Construir períodos con su tasa correspondiente
    let total = 0, cursor = new Date(fromDate);
    const hitos = [
      {fecha: new Date(loan.startDate+"T12:00:00"), rate: loan.rate, rateType: loan.rateType},
      ...tramos.map(t=>({fecha: new Date(t.desde+"T12:00:00"), rate: t.rate, rateType: t.rateType||loan.rateType}))
    ].sort((a,b)=>a.fecha-b.fecha);
    for (let i=0; i<hitos.length; i++) {
      const siguienteCambio = hitos[i+1]?.fecha || toDate;
      const finPeriodo = siguienteCambio < toDate ? siguienteCambio : toDate;
      if (cursor >= finPeriodo) continue;
      if (cursor < hitos[i].fecha) cursor = new Date(hitos[i].fecha);
      if (cursor >= finPeriodo) continue;
      const days = Math.max(0, Math.floor((finPeriodo - cursor)/86400000));
      total += balance * dailyRate(hitos[i].rate, hitos[i].rateType) * days;
      cursor = new Date(finPeriodo);
      if (cursor >= toDate) break;
    }
    return total;
  };

  const calcState = loan => {
    let balance = parseFloat(loan.principal), totalPaid=0;
    let lastDate = new Date(loan.startDate+"T12:00:00");
    for (const pmt of [...(loan.payments||[])].sort((a,b)=>new Date(a.date)-new Date(b.date))) {
      const accrued = calcInteresTramos(loan, balance, lastDate, new Date(pmt.date+"T12:00:00"));
      if (pmt.paymentType==="interest_only") { totalPaid+=pmt.amount; lastDate=new Date(pmt.date+"T12:00:00"); }
      else { const toInt=Math.min(pmt.amount,accrued); balance=Math.max(0,balance-(pmt.amount-toInt)); totalPaid+=pmt.amount; lastDate=new Date(pmt.date+"T12:00:00"); }
    }
    const pendingInterest = calcInteresTramos(loan, balance, lastDate, new Date());
    return { originalPrincipal:parseFloat(loan.principal), currentBalance:balance, pendingInterest, totalOwed:balance+pendingInterest, totalPaid, isPaid:balance<=0.01 };
  };

  const getBreakdown = loan => {
    const dr = dailyRate(loan.rate, loan.rateType);
    let balance=parseFloat(loan.principal), lastDate=new Date(loan.startDate+"T12:00:00");
    return [...(loan.payments||[])].sort((a,b)=>new Date(a.date)-new Date(b.date)).map((pmt,i)=>{
      const days=Math.max(0,Math.floor((new Date(pmt.date+"T12:00:00")-lastDate)/86400000));
      const accrued=balance*dr*days;
      if (pmt.paymentType==="interest_only") { lastDate=new Date(pmt.date+"T12:00:00"); return{...pmt,idx:i+1,days,accrued,toInterest:pmt.amount,toPrincipal:0,balanceAfter:balance,isInterestOnly:true}; }
      const toInt=Math.min(pmt.amount,accrued); const toCap=pmt.amount-toInt;
      balance=Math.max(0,balance-toCap); lastDate=new Date(pmt.date+"T12:00:00");
      return{...pmt,idx:i+1,days,accrued,toInterest:toInt,toPrincipal:toCap,balanceAfter:balance,isInterestOnly:false};
    });
  };

  const applyDelta = (accs,id,delta) => accs.map(a=>a.id===id?{...a,balance:parseFloat(a.balance||0)+delta}:a);

  const openNewLoan = () => { setEditing(null); setLF({...blankLoan,accountId:accounts[0]?.id||""}); setOpenLoan(true); };
  const openEditLoan = (loan,e) => { e?.stopPropagation(); setEditing(loan); setLF({type:loan.type,name:loan.name,accountId:loan.accountId,principal:loan.principal.toString(),currency:loan.currency,rateType:loan.rateType,rate:loan.rate,startDate:loan.startDate,dueDate:loan.dueDate||"",notes:loan.notes||""}); setOpenLoan(true); };
  const closeLoan = () => { setOpenLoan(false); setEditing(null); };

  const saveLoan = () => {
    if (!lf.name.trim()||!lf.principal||!lf.accountId) { toast("Completa los campos requeridos.","error"); return; }
    const principal=parseFloat(lf.principal);
    if (isNaN(principal)||principal<=0) { toast("Monto inválido.","error"); return; }
    const comAp   = parseFloat(lf.comisionApertura)||0;
    const comFega = parseFloat(lf.comisionFega)||0;
    const otrosG  = parseFloat(lf.otrosGastos)||0;
    const totalComisiones = (principal * comAp/100) + (principal * comFega/100) + otrosG;
    if (editing) {
      setLoans(loans.map(l=>l.id===editing.id?{...l,...lf,principal}:l));
      toast("Préstamo actualizado.","success");
    } else {
      const loanId = genId();
      // ── Ajustar saldo de la cuenta asociada
      setAccounts(prev=>prev.map(a=>{
        if(a.id!==lf.accountId) return a;
        const delta = lf.type==="given" ? -principal : principal; // prestamos = sale dinero; recibimos = entra dinero
        return {...a, balance: parseFloat(a.balance||0) + delta};
      }));
      // ── Registrar comisiones como gasto si las hay
      if (totalComisiones>0) {
        const comTxs = [];
        if (comAp>0) comTxs.push({id:genId(),date:lf.startDate||today(),type:"expense",amount:principal*comAp/100,description:`Comisión apertura — ${lf.name}`,category:"Pago de deuda",accountId:lf.accountId,currency:lf.currency,origen:"prestamo",origenId:loanId,notes:`${comAp}% apertura`});
        if (comFega>0) comTxs.push({id:genId(),date:lf.startDate||today(),type:"expense",amount:principal*comFega/100,description:`FEGA — ${lf.name}`,category:"Pago de deuda",accountId:lf.accountId,currency:lf.currency,origen:"prestamo",origenId:loanId,notes:`${comFega}% FEGA`});
        if (otrosG>0) comTxs.push({id:genId(),date:lf.startDate||today(),type:"expense",amount:otrosG,description:`Gastos adicionales — ${lf.name}`,category:"Pago de deuda",accountId:lf.accountId,currency:lf.currency,origen:"prestamo",origenId:loanId,notes:"Otros gastos"});
        setTransactions(prev=>[...comTxs,...prev]);
        // También descontar comisiones del saldo de la cuenta
        setAccounts(prev=>prev.map(a=>a.id===lf.accountId?{...a,balance:parseFloat(a.balance||0)-totalComisiones}:a));
        toast(`Préstamo registrado + ${fmt(totalComisiones)} en comisiones descontadas ✓`,"success");
      } else {
        toast(`Préstamo ${lf.type==="given"?"otorgado":"recibido"} registrado. Saldo de cuenta ajustado.`,"success");
      }
      setLoans([{id:loanId,...lf,principal,payments:[],createdAt:new Date().toISOString()},...loans]);
    }
    closeLoan();
  };

  const delLoan = async (loan,e) => {
    e?.stopPropagation();
    const ok = await askConfirm(`¿Eliminar el préstamo "${loan.name}"? Se revertirán todos los saldos afectados.`);
    if (!ok) return;
    const rev={};
    rev[loan.accountId]=(rev[loan.accountId]||0)+(loan.type==="given"?parseFloat(loan.principal):-parseFloat(loan.principal));
    for (const pmt of (loan.payments||[])) { const id=pmt.targetAccountId||loan.accountId; rev[id]=(rev[id]||0)+(loan.type==="given"?-pmt.amount:pmt.amount); }
    setAccounts(accounts.map(a=>rev[a.id]!==undefined?{...a,balance:a.balance+rev[a.id]}:a));
    setLoans(loans.filter(l=>l.id!==loan.id));
    if (selectedId===loan.id){ setSelectedId(null); setView("list"); }
    toast("Préstamo eliminado y saldos revertidos.","warning");
  };

  const openNewPay = () => { setPF({...blankPay,targetAccountId:selected?.accountId||accounts[0]?.id||""}); setOpenPay(true); };
  const closePay = () => setOpenPay(false);

  const savePay = () => {
    const amount=parseFloat(pf.amount);
    if (!amount||amount<=0) { toast("Monto inválido.","error"); return; }
    const st=calcState(selected);
    if (pf.paymentType==="interest_only"&&amount>st.pendingInterest*1.02+1) { toast(`No puede exceder el interés acumulado: ${fmt(st.pendingInterest,selected.currency)}`,"error"); return; }
    if (pf.paymentType!=="interest_only"&&amount>st.totalOwed+1) { toast(`No puede exceder lo adeudado: ${fmt(st.totalOwed,selected.currency)}`,"error"); return; }
    const targetId=pf.targetAccountId||selected.accountId;
    setAccounts(applyDelta(accounts, targetId, selected.type==="given"?amount:-amount));
    const pmtId = genId();
    const newPmt={id:pmtId,...pf,amount,targetAccountId:targetId};
    setLoans(loans.map(l=>l.id===selected.id?{...l,payments:[...(l.payments||[]),newPmt]}:l));
    // ── híbrido: crear transacción si el usuario lo eligió
    if (pf.registrarComoTx) {
      const isIngreso = selected.type==="given"; // préstamo dado → cobrar = ingreso
      const txs = [];
      if (pf.paymentType==="interest_only") {
        // Solo intereses → ingreso/gasto puro
        txs.push({
          id:genId(), date:pf.date, amount,
          type: isIngreso?"income":"expense",
          description: isIngreso?`Intereses cobrados — ${selected.name}`:`Pago intereses — ${selected.name}`,
          category: isIngreso?"Intereses cobrados":"Pago de deuda",
          accountId: targetId, currency: selected.currency||"MXN",
          origen:"prestamo", origenId:selected.id, pmtId, notes: pf.notes||"",
        });
      } else {
        // Capital + interés: separar ambas partes
        const interes = st.pendingInterest > 0 ? Math.min(st.pendingInterest, amount) : 0;
        const capital = Math.max(0, amount - interes);
        // Solo los intereses son ingreso/gasto real
        if (interes > 0) {
          txs.push({
            id:genId(), date:pf.date, amount:interes,
            type: isIngreso?"income":"expense",
            description: isIngreso?`Intereses cobrados — ${selected.name}`:`Pago intereses — ${selected.name}`,
            category: isIngreso?"Intereses cobrados":"Pago de deuda",
            accountId: targetId, currency: selected.currency||"MXN",
            origen:"prestamo", origenId:selected.id, pmtId, notes: pf.notes||"",
          });
        }
        // El capital es recuperación de activo (préstamo dado) o reducción de pasivo (préstamo recibido)
        if (capital > 0) {
          txs.push({
            id:genId(), date:pf.date, amount:capital,
            type: isIngreso?"income":"expense",
            description: isIngreso?`Recuperación de capital — ${selected.name}`:`Abono a capital — ${selected.name}`,
            category: isIngreso?"Recuperación de capital":"Abono a capital",
            accountId: targetId, currency: selected.currency||"MXN",
            origen:"prestamo", origenId:selected.id, pmtId, notes: pf.notes||"",
          });
        }
      }
      setTransactions(p=>[...txs,...p]);
    }
    toast(pf.paymentType==="interest_only"?"Pago de intereses registrado. Capital intacto.":"Pago registrado.","success");
    closePay();
  };

  const delPay = async pmtId => {
    const ok = await askConfirm("¿Eliminar este pago? El saldo de la cuenta y las transacciones vinculadas se revertirán.");
    if (!ok) return;
    const pmt=selected.payments.find(p=>p.id===pmtId);
    if (!pmt) return;
    const targetId=pmt.targetAccountId||selected.accountId;
    // Revertir saldo de cuenta
    setAccounts(applyDelta(accounts, targetId, selected.type==="given"?-pmt.amount:pmt.amount));
    // Eliminar el pago del préstamo
    setLoans(loans.map(l=>l.id===selected.id?{...l,payments:l.payments.filter(p=>p.id!==pmtId)}:l));
    // Eliminar transacciones vinculadas (por pmtId o por origenId+fecha+monto como fallback)
    setTransactions(prev=>prev.filter(t=>{
      if (t.pmtId && t.pmtId===pmtId) return false; // link directo
      // fallback para pagos viejos sin pmtId: misma fecha, mismo origenId, mismo monto aprox
      if (!t.pmtId && t.origenId===selected.id && t.date===pmt.date &&
          Math.abs(parseFloat(t.amount||0)-pmt.amount)<0.02) return false;
      return true;
    }));
    toast("Pago eliminado, saldo y transacciones revertidos.","warning");
  };

  if (view==="detail"&&selected) {
    const st=calcState(selected); const bd=getBreakdown(selected);
    const acc=accounts.find(a=>a.id===selected.accountId);
    const isGiven=selected.type==="given";
    const pct=Math.min(100,((parseFloat(selected.principal)-st.currentBalance)/parseFloat(selected.principal))*100);
    const st2=calcState(selected);

    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          <button onClick={()=>{setView("list");setSelectedId(null);}} style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:9, padding:"7px 13px", color:"#bbb", cursor:"pointer", fontSize:13 }}>
            <Ic n="back" size={16}/> Volver
          </button>
          <div style={{ flex:1 }}>
            <h2 style={{ fontSize:20, fontWeight:700, color:"#f0f0f0", margin:"0 0 4px" }}>{selected.name}</h2>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <Badge label={isGiven?"Prestado":"Recibido"} color={isGiven?"#0078ff":"#9b59b6"}/>
              <Badge label={selected.currency} color="#555"/>
              {st.isPaid&&<Badge label="✓ Liquidado" color="#00d4aa"/>}
            </div>
          </div>
          {!st.isPaid&&<Btn onClick={openNewPay}><Ic n="plus" size={15}/>Registrar Pago</Btn>}
          <Btn variant="secondary" onClick={e=>openEditLoan(selected,e)}><Ic n="edit" size={15}/>Editar</Btn>
          <Btn variant="danger" onClick={e=>delLoan(selected,e)}><Ic n="trash" size={15}/>Eliminar</Btn>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))", gap:10, marginBottom:16 }}>
          {[["Capital original",fmt(st.originalPrincipal,selected.currency),"#888"],["Saldo pendiente",fmt(st.currentBalance,selected.currency),st.isPaid?"#00d4aa":"#ff4757"],["Interés acumulado",fmt(st.pendingInterest,selected.currency),"#f39c12"],["Total adeudado",fmt(st.totalOwed,selected.currency),"#ff6b6b"],["Total pagado",fmt(st.totalPaid,selected.currency),"#00d4aa"]].map(([l,v,c])=>(
            <Card key={l} style={{ padding:14 }}>
              <p style={{ fontSize:11, color:"#666", textTransform:"uppercase", letterSpacing:.4, margin:"0 0 4px" }}>{l}</p>
              <p style={{ fontSize:16, fontWeight:700, color:c, margin:0 }}>{v}</p>
            </Card>
          ))}
        </div>

        <Card style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
            <span style={{ fontSize:12, color:"#777" }}>Progreso de pago</span>
            <span style={{ fontSize:12, fontWeight:700, color:"#00d4aa" }}>{pct.toFixed(1)}%</span>
          </div>
          <div style={{ height:7, background:"rgba(255,255,255,.05)", borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#00d4aa,#00a884)", borderRadius:4, transition:"width .4s" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:7, flexWrap:"wrap", gap:4 }}>
            <span style={{ fontSize:11, color:"#555" }}>Cuenta: {acc?.name||"—"}</span>
            <span style={{ fontSize:11, color:"#555" }}>{selected.rate}% {selected.rateType==="annual"?"anual":selected.rateType==="monthly"?"mensual":"diaria"} · {(dailyRate(selected.rate,selected.rateType)*100).toFixed(4)}% diario</span>
          </div>
          {selected.dueDate&&<p style={{ margin:"6px 0 0", fontSize:12, color:new Date(selected.dueDate)<new Date()?"#ff4757":"#666" }}>{new Date(selected.dueDate)<new Date()?"⚠️ Vencido:":"📅 Vence:"} {fmtDate(selected.dueDate)}</p>}
        </Card>

        {/* ── Costos iniciales y costo efectivo */}
        {(()=>{
          const txsComisiones = transactions.filter(t=>t.origenId===selected.id&&t.type==="expense"&&(t.description?.includes("Comisión")||t.description?.includes("FEGA")||t.description?.includes("Gastos adicionales")));
          const totalComisiones = txsComisiones.reduce((s,t)=>s+parseFloat(t.amount||0),0);
          if(txsComisiones.length===0) return null;
          // Costo efectivo anual: tasa nominal + impacto comisiones sobre plazo
          const principal = parseFloat(selected.principal)||0;
          const tasaNominalAnual = selected.rateType==="annual" ? parseFloat(selected.rate)||0
            : selected.rateType==="monthly" ? (parseFloat(selected.rate)||0)*12
            : (parseFloat(selected.rate)||0)*365;
          const diasVigencia = selected.dueDate
            ? Math.round((new Date(selected.dueDate)-new Date(selected.startDate))/86400000)
            : null;
          const tasaEfectiva = diasVigencia&&principal>0
            ? tasaNominalAnual + (totalComisiones/principal/diasVigencia*365*100)
            : null;
          return (
            <Card style={{marginBottom:16,borderColor:"rgba(243,156,18,.2)",background:"rgba(243,156,18,.02)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
                <p style={{fontSize:13,fontWeight:700,color:"#f39c12",margin:0}}>💰 Costos Iniciales del Crédito</p>
                {tasaEfectiva&&(
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:10,color:"#666"}}>Tasa nominal: <strong style={{color:"#ccc"}}>{tasaNominalAnual.toFixed(2)}%</strong></span>
                    <span style={{fontSize:11,fontWeight:700,color:"#ff6b7a",background:"rgba(255,71,87,.1)",border:"1px solid rgba(255,71,87,.2)",borderRadius:6,padding:"2px 8px"}}>
                      Costo efectivo: ~{tasaEfectiva.toFixed(2)}% anual
                    </span>
                  </div>
                )}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
                {txsComisiones.map(t=>(
                  <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:"rgba(255,255,255,.03)",borderRadius:8}}>
                    <div>
                      <p style={{fontSize:12,fontWeight:600,color:"#e0e0e0",margin:"0 0 1px"}}>{t.description}</p>
                      <p style={{fontSize:10,color:"#555",margin:0}}>{fmtDate(t.date)} · {t.notes||""}</p>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:"#ff6b7a",flexShrink:0}}>-{fmt(parseFloat(t.amount||0),selected.currency)}</span>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"rgba(243,156,18,.08)",borderRadius:8,borderTop:"1px solid rgba(243,156,18,.2)"}}>
                <span style={{fontSize:12,color:"#f39c12",fontWeight:700}}>Total costos iniciales</span>
                <span style={{fontSize:14,fontWeight:800,color:"#f39c12"}}>-{fmt(totalComisiones,selected.currency)}</span>
              </div>
              {tasaEfectiva&&(
                <p style={{fontSize:10,color:"#555",margin:"8px 0 0",lineHeight:1.5}}>
                  ⚠️ Las comisiones incrementan el costo real del crédito. Sobre un capital de {fmt(principal,selected.currency)} a {diasVigencia} días, el costo efectivo total es aproximadamente <strong style={{color:"#f39c12"}}>{tasaEfectiva.toFixed(2)}% anual</strong> vs la tasa nominal de {tasaNominalAnual.toFixed(2)}%.
                </p>
              )}
            </Card>
          );
        })()}

        <AmortizacionChart loan={selected} pagos={bd.map(p=>({date:p.date,saldoRestante:p.balanceAfter}))}/>

        {/* ── TRAMOS DE TASA */}
        <TramosPanel
          loan={selected}
          loans={loans}
          setLoans={setLoans}
          dailyRate={dailyRate}
          toast={toast}
        />

        {/* ── CORTE MENSUAL */}
        {selected.type==="given" && !st.isPaid && (
          <CorteMensual
            loan={selected}
            calcState={calcState}
            dailyRate={dailyRate}
            openNewPay={openNewPay}
            setPF={setPF}
            blankPay={blankPay}
            setOpenPay={setOpenPay}
            accounts={accounts}
          />
        )}

        {/* ── Desglose de lo pagado */}
        {bd.length>0&&(()=>{
          const totalInteresesPagados = bd.reduce((s,p)=>s+p.toInterest,0);
          const totalCapitalPagado = bd.reduce((s,p)=>s+p.toPrincipal,0);
          const totalPagosReal = bd.reduce((s,p)=>s+p.amount,0);
          return (
            <Card style={{marginBottom:14,padding:0,overflow:"hidden"}}>
              <div style={{padding:"10px 16px 8px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                <p style={{fontSize:12,fontWeight:700,color:"#e0e0e0",margin:0}}>Resumen de pagos realizados</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:0}}>
                {[
                  {l:"Total pagado",v:fmt(totalPagosReal,selected.currency),c:"#00d4aa"},
                  {l:"En intereses",v:fmt(totalInteresesPagados,selected.currency),c:"#f39c12"},
                  {l:"A capital",v:fmt(totalCapitalPagado,selected.currency),c:"#3b82f6"},
                  {l:"Pagos registrados",v:bd.length,c:"#888"},
                ].map(k=>(
                  <div key={k.l} style={{padding:"10px 16px",borderRight:"1px solid rgba(255,255,255,.04)"}}>
                    <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 3px"}}>{k.l}</p>
                    <p style={{fontSize:15,fontWeight:800,color:k.c,margin:0,fontVariantNumeric:"tabular-nums"}}>{k.v}</p>
                  </div>
                ))}
              </div>
              {totalInteresesPagados>0&&(
                <div style={{padding:"6px 16px 8px",borderTop:"1px solid rgba(255,255,255,.04)"}}>
                  <div style={{height:6,borderRadius:4,background:"rgba(255,255,255,.06)",overflow:"hidden",display:"flex"}}>
                    <div style={{height:"100%",background:"#f39c12",width:`${totalPagosReal>0?(totalInteresesPagados/totalPagosReal*100).toFixed(1):0}%`,transition:"width .4s"}}/>
                    <div style={{height:"100%",background:"#3b82f6",width:`${totalPagosReal>0?(totalCapitalPagado/totalPagosReal*100).toFixed(1):0}%`,transition:"width .4s"}}/>
                  </div>
                  <div style={{display:"flex",gap:14,marginTop:4}}>
                    <span style={{fontSize:9,color:"#f39c12",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:2,background:"#f39c12",display:"inline-block"}}/>{totalPagosReal>0?(totalInteresesPagados/totalPagosReal*100).toFixed(1):0}% intereses</span>
                    <span style={{fontSize:9,color:"#3b82f6",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:2,background:"#3b82f6",display:"inline-block"}}/>{totalPagosReal>0?(totalCapitalPagado/totalPagosReal*100).toFixed(1):0}% capital</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })()}
        <p style={{ fontSize:14, fontWeight:600, color:"#e0e0e0", marginBottom:10 }}>Historial de Pagos ({bd.length})</p>
        {bd.length===0 ? <Card><p style={{ textAlign:"center", color:"#444", fontSize:13, padding:"16px 0", margin:0 }}>Sin pagos.</p></Card> : (
          <div style={{ overflowX:"auto" }}>
            <Card style={{ padding:0, overflow:"hidden", minWidth:520 }}>
              <div style={{ display:"grid", gridTemplateColumns:"36px 88px 1fr 1fr 1fr 1fr 50px", gap:6, padding:"9px 14px", borderBottom:"1px solid rgba(255,255,255,.06)", background:"rgba(255,255,255,.02)" }}>
                {["#","Fecha","Pago","A interés","A capital","Saldo",""].map(h=><span key={h} style={{ fontSize:10, color:"#555", fontWeight:700, textTransform:"uppercase", letterSpacing:.4 }}>{h}</span>)}
              </div>
              {bd.map(p=>(
                <div key={p.id} style={{ display:"grid", gridTemplateColumns:"36px 88px 1fr 1fr 1fr 1fr 50px", gap:6, padding:"11px 14px", borderBottom:"1px solid rgba(255,255,255,.03)", alignItems:"center", background:p.isInterestOnly?"rgba(243,156,18,.03)":"transparent" }}>
                  <span style={{ fontSize:11, color:"#555", fontWeight:700 }}>#{p.idx}</span>
                  <div><span style={{ fontSize:12, color:"#bbb", display:"block" }}>{fmtDate(p.date)}</span>{p.isInterestOnly&&<span style={{ fontSize:9, color:"#f39c12", fontWeight:700 }}>SOLO INT.</span>}</div>
                  <span style={{ fontSize:12, fontWeight:700, color:"#00d4aa" }}>{fmt(p.amount,selected.currency)}</span>
                  <span style={{ fontSize:12, color:"#f39c12" }}>{fmt(p.toInterest,selected.currency)}</span>
                  <span style={{ fontSize:12, color:p.toPrincipal>0?"#0078ff":"#444" }}>{fmt(p.toPrincipal,selected.currency)}</span>
                  <span style={{ fontSize:12, color:p.balanceAfter<=0.01?"#00d4aa":"#e0e0e0" }}>{fmt(p.balanceAfter,selected.currency)}</span>
                  <Actions onDelete={()=>delPay(p.id)}/>
                </div>
              ))}
            </Card>
          </div>
        )}

        {openPay&&(
          <Modal title="Registrar Pago" onClose={closePay} width={460}>
            <div style={{ display:"flex", gap:3, marginBottom:16, background:"rgba(255,255,255,.04)", borderRadius:9, padding:3 }}>
              {[["interest_only","💰 Solo intereses","Capital intacto"],["mixed","⚖️ Interés + Capital","Abona al capital"]].map(([v,l,d])=>(
                <button key={v} onClick={()=>setPF(p=>({...p,paymentType:v}))} style={{ flex:1, padding:"9px 6px", borderRadius:7, border:"none", cursor:"pointer", background:pf.paymentType===v?"rgba(0,212,170,.15)":"transparent", borderBottom:pf.paymentType===v?"2px solid #00d4aa":"2px solid transparent", color:pf.paymentType===v?"#00d4aa":"#666", transition:"all .15s" }}>
                  <p style={{ margin:"0 0 1px", fontSize:12, fontWeight:700 }}>{l}</p>
                  <p style={{ margin:0, fontSize:10, opacity:.7 }}>{d}</p>
                </button>
              ))}
            </div>
            <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", borderRadius:9, padding:"11px 14px", marginBottom:14 }}>
              {pf.paymentType==="interest_only" ? (
                <><p style={{ fontSize:11, color:"#777", margin:"0 0 4px" }}>Interés acumulado hasta hoy</p><p style={{ fontSize:20, fontWeight:700, color:"#f39c12", margin:"0 0 3px" }}>{fmt(st2.pendingInterest,selected.currency)}</p><p style={{ fontSize:11, color:"#555", margin:0 }}>Capital intacto: {fmt(st2.currentBalance,selected.currency)}</p></>
              ) : (
                <><p style={{ fontSize:11, color:"#777", margin:"0 0 4px" }}>Total adeudado</p><p style={{ fontSize:20, fontWeight:700, color:"#ff6b6b", margin:"0 0 3px" }}>{fmt(st2.totalOwed,selected.currency)}</p><p style={{ fontSize:11, color:"#666", margin:0 }}>Capital: {fmt(st2.currentBalance,selected.currency)} · Interés: {fmt(st2.pendingInterest,selected.currency)}</p></>
              )}
            </div>
            <Inp label="Monto del pago" type="number" value={pf.amount} onChange={pc("amount")} placeholder="0.00" prefix={selected.currency==="USD"?"US$":"$"} required/>
            <Sel label="¿A qué cuenta entra?" value={pf.targetAccountId} onChange={pc("targetAccountId")} options={accounts.map(a=>({value:a.id,label:`${a.name} — ${fmt(a.balance,a.currency)}`}))}/>
            <Inp label="Fecha" type="date" value={pf.date} onChange={pc("date")}/>
            <Inp label="Notas (opcional)" value={pf.notes} onChange={pc("notes")} placeholder="Referencia..."/>
            {/* ── híbrido */}
            <label style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:14,cursor:"pointer",background:"rgba(0,212,170,.05)",border:"1px solid rgba(0,212,170,.12)",borderRadius:9,padding:"10px 13px"}}>
              <input type="checkbox" checked={pf.registrarComoTx} onChange={e=>setPF(p=>({...p,registrarComoTx:e.target.checked}))} style={{marginTop:2,accentColor:"#00d4aa",width:15,height:15,flexShrink:0}}/>
              <div>
                <p style={{fontSize:12,fontWeight:700,color:"#00d4aa",margin:"0 0 2px"}}>Registrar también en Transacciones</p>
                <p style={{fontSize:11,color:"#555",margin:0}}>
                  {selected.type==="given"
                    ? "Genera un ingreso en el período por el cobro recibido"
                    : "Genera un gasto en el período por el pago realizado"}
                  . Desactiva si ya lo registraste manualmente.
                </p>
              </div>
            </label>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:6 }}>
              <Btn variant="secondary" onClick={closePay}>Cancelar</Btn>
              <Btn onClick={savePay}><Ic n="check" size={15}/>Registrar Pago</Btn>
            </div>
          </Modal>
        )}
        {confirmModal}
      </div>
    );
  }

  const activeLoans = loans.filter(l=>!calcState(l).isPaid);
  const paidLoans   = loans.filter(l=> calcState(l).isPaid);

  const LoanCard = ({ loan }) => {
    const st=calcState(loan); const isGiven=loan.type==="given";
    const pct=Math.min(100,((parseFloat(loan.principal)-st.currentBalance)/parseFloat(loan.principal))*100);
    const diasVenc = loan.dueDate ? Math.round((new Date(loan.dueDate+"T12:00:00")-new Date())/86400000) : null;
    const vencido = diasVenc!==null && diasVenc<0;
    const urgente = diasVenc!==null && !vencido && diasVenc<=30;
    // Días desde último pago
    const ultPago = (loan.payments||[]).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
    const diasSinPago = ultPago
      ? Math.round((new Date()-new Date(ultPago.date+"T12:00:00"))/86400000)
      : Math.round((new Date()-new Date(loan.startDate+"T12:00:00"))/86400000);
    // Alerta interés alto: si supera 5% del capital
    const interesAlto = st.pendingInterest > parseFloat(loan.principal)*0.05;
    return (
      <Card onClick={()=>{setSelectedId(loan.id);setView("detail");}}
        style={{cursor:"pointer",transition:"border-color .15s",borderColor:vencido?"rgba(255,71,87,.3)":isGiven?"rgba(0,120,255,.15)":"rgba(155,89,182,.15)"}}
        onMouseEnter={e=>e.currentTarget.style.borderColor=isGiven?"rgba(0,120,255,.4)":"rgba(155,89,182,.4)"}
        onMouseLeave={e=>e.currentTarget.style.borderColor=vencido?"rgba(255,71,87,.3)":isGiven?"rgba(0,120,255,.15)":"rgba(155,89,182,.15)"}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
          <div style={{flex:1,minWidth:0}}>
            <p style={{ fontSize:13, fontWeight:700, color:"#f0f0f0", margin:"0 0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{loan.name}</p>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              <Badge label={isGiven?"💸 Prestado":"🤝 Recibido"} color={isGiven?"#0078ff":"#9b59b6"}/>
              <Badge label={loan.currency} color="#555"/>
              {loan.rate>0&&<Badge label={`${loan.rate}% ${loan.rateType==="annual"?"anual":"mensual"}`} color="#444"/>}
            </div>
          </div>
          <Actions onEdit={e=>openEditLoan(loan,e)} onDelete={e=>delLoan(loan,e)}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}>
          <div>
            <p style={{fontSize:10,color:"#555",margin:"0 0 1px"}}>Saldo pendiente</p>
            <p style={{ fontSize:19, fontWeight:800, color:st.isPaid?"#00d4aa":isGiven?"#0078ff":"#ff6b6b", margin:0,lineHeight:1 }}>
              {st.isPaid?"✓ Liquidado":fmt(st.currentBalance,loan.currency)}
            </p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:10,color:"#555",margin:"0 0 1px"}}>Capital original</p>
            <p style={{fontSize:12,color:"#666",margin:0}}>{fmt(parseFloat(loan.principal),loan.currency)}</p>
          </div>
        </div>
        {!st.isPaid&&(
          <div style={{marginBottom:8}}>
            <div style={{ height:5, background:"rgba(255,255,255,.05)", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${isGiven?"#0078ff":"#9b59b6"},${isGiven?"#3b82f6":"#a855f7"})`, borderRadius:3,transition:"width .4s" }}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
              <span style={{fontSize:9,color:"#444"}}>{pct.toFixed(1)}% pagado</span>
              <span style={{fontSize:9,color:"#444"}}>{fmt(st.currentBalance,loan.currency)} restante</span>
            </div>
          </div>
        )}
        {/* Interés acumulado */}
        {!st.isPaid && st.pendingInterest>0 && (
          <div style={{
            marginBottom:8,padding:"7px 10px",borderRadius:8,
            background:interesAlto?"rgba(255,71,87,.08)":"rgba(243,156,18,.07)",
            border:`1px solid ${interesAlto?"rgba(255,71,87,.2)":"rgba(243,156,18,.2)"}`
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,color:interesAlto?"#ff6b7a":"#f39c12",fontWeight:600}}>
                {interesAlto?"⚠️":"💰"} Interés acumulado{isGiven?" a cobrar":" a pagar"}
              </span>
              <span style={{fontSize:12,fontWeight:800,color:interesAlto?"#ff6b7a":"#f39c12"}}>
                {isGiven?"+":"-"}{fmt(st.pendingInterest,loan.currency)}
              </span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
              <span style={{fontSize:10,color:"#555"}}>{diasSinPago}d desde {ultPago?"último pago":"inicio"}</span>
              {interesAlto&&<span style={{fontSize:10,color:"#ff6b7a",fontWeight:600}}>Interés alto — considera cobrar/pagar</span>}
            </div>
          </div>
        )}
        {loan.dueDate&&(
          <div style={{padding:"5px 9px",borderRadius:7,
            background:vencido?"rgba(255,71,87,.1)":urgente?"rgba(243,156,18,.1)":"rgba(255,255,255,.03)",
            border:`1px solid ${vencido?"rgba(255,71,87,.2)":urgente?"rgba(243,156,18,.2)":"rgba(255,255,255,.06)"}`}}>
            <span style={{fontSize:10,color:vencido?"#ff4757":urgente?"#f39c12":"#555"}}>
              {vencido?`⚠️ Vencido hace ${Math.abs(diasVenc)}d`:diasVenc===0?"⚠️ Vence hoy":`📅 Vence ${fmtDate(loan.dueDate)} (${diasVenc}d)`}
            </span>
          </div>
        )}
        {isGiven&&st.totalPaid>0&&(
          <div style={{marginTop:6,padding:"5px 9px",borderRadius:7,background:"rgba(0,212,170,.05)",border:"1px solid rgba(0,212,170,.15)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,color:"#00d4aa",fontWeight:600}}>✅ Ya cobrado</span>
              <span style={{fontSize:12,fontWeight:800,color:"#00d4aa",fontVariantNumeric:"tabular-nums"}}>{fmt(st.totalPaid,loan.currency)}</span>
            </div>
            {(()=>{
              const bd=getBreakdown(loan);
              const int=bd.reduce((a,p)=>a+p.toInterest,0);
              const cap=bd.reduce((a,p)=>a+p.toPrincipal,0);
              return <span style={{fontSize:9,color:"#555"}}>{bd.length} pago{bd.length!==1?"s":""} · interés {fmt(int,loan.currency)} · capital {fmt(cap,loan.currency)}</span>;
            })()}
          </div>
        )}
      </Card>
    );
  };

  // KPIs de préstamos
  const totalPorCobrar      = activeLoans.filter(l=>l.type==="given").reduce((s,l)=>s+calcState(l).currentBalance,0);
  const totalPorPagar       = activeLoans.filter(l=>l.type==="received").reduce((s,l)=>s+calcState(l).totalOwed,0);
  const interesPorCobrar    = activeLoans.filter(l=>l.type==="given").reduce((s,l)=>s+calcState(l).pendingInterest,0);
  const interesPorPagar     = activeLoans.filter(l=>l.type==="received").reduce((s,l)=>s+calcState(l).pendingInterest,0);
  const interesEsteMes = activeLoans.filter(l=>l.type==="received").reduce((s,l)=>{
    const dr=(parseFloat(l.rate)||0)/100/(l.rateType==="annual"?365:30);
    return s + calcState(l).currentBalance * dr * 30;
  },0);

  const prestamosGivenActivos = activeLoans.filter(l=>l.type==="given");

  // ── Totales cobrados (todos los préstamos, activos y liquidados)
  const givenLoans = loans.filter(l=>l.type==="given");
  const totalCobradoIntereses = givenLoans.reduce((s,l)=>s+getBreakdown(l).reduce((a,p)=>a+p.toInterest,0),0);
  const totalCobradoCapital   = givenLoans.reduce((s,l)=>s+getBreakdown(l).reduce((a,p)=>a+p.toPrincipal,0),0);
  const totalCobrado          = totalCobradoIntereses + totalCobradoCapital;
  const desgloseCobrado = givenLoans.map(l=>{
    const bd=getBreakdown(l);
    return { loan:l, intereses:bd.reduce((a,p)=>a+p.toInterest,0), capital:bd.reduce((a,p)=>a+p.toPrincipal,0), pagos:bd.length };
  }).filter(d=>d.intereses+d.capital>0);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontSize:21, fontWeight:700, color:"#f0f0f0", marginBottom:3 }}>Préstamos</h2>
          <p style={{ fontSize:13, color:"#555" }}>{activeLoans.length} activo{activeLoans.length!==1?"s":""} · {paidLoans.length} liquidado{paidLoans.length!==1?"s":""}</p>
        </div>
        <Btn onClick={openNewLoan}><Ic n="plus" size={16}/>Nuevo Préstamo</Btn>
      </div>
      {/* KPIs resumen */}
      {activeLoans.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:18}}>
          {totalPorCobrar>0&&(
            <Card style={{padding:"12px 14px",borderColor:"rgba(0,120,255,.2)"}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 4px"}}>Por cobrar</p>
              <p style={{fontSize:18,fontWeight:800,color:"#0078ff",margin:0}}>{fmt(totalPorCobrar)}</p>
              <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>{activeLoans.filter(l=>l.type==="given").length} préstamo{activeLoans.filter(l=>l.type==="given").length!==1?"s":""} activo{activeLoans.filter(l=>l.type==="given").length!==1?"s":""}</p>
            </Card>
          )}
          {totalPorPagar>0&&(
            <Card style={{padding:"12px 14px",borderColor:"rgba(155,89,182,.2)"}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 4px"}}>Por pagar</p>
              <p style={{fontSize:18,fontWeight:800,color:"#9b59b6",margin:0}}>{fmt(totalPorPagar)}</p>
              <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>{activeLoans.filter(l=>l.type==="received").length} préstamo{activeLoans.filter(l=>l.type==="received").length!==1?"s":""} activo{activeLoans.filter(l=>l.type==="received").length!==1?"s":""}</p>
            </Card>
          )}
          {interesPorCobrar>0&&(
            <Card style={{padding:"12px 14px",borderColor:"rgba(0,120,255,.15)",background:"rgba(0,120,255,.03)"}}>
              <p style={{fontSize:10,color:"#0078ff",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 4px"}}>Interés acumulado a cobrar</p>
              <p style={{fontSize:18,fontWeight:800,color:"#0078ff",margin:0}}>+{fmt(interesPorCobrar)}</p>
              <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>A la fecha de hoy</p>
            </Card>
          )}
          {totalCobrado>0&&(
            <Card style={{padding:0,overflow:"hidden",borderColor:"rgba(0,212,170,.2)",background:"rgba(0,212,170,.03)",gridColumn:"1 / -1"}}>
              <div style={{padding:"11px 16px 9px",borderBottom:"1px solid rgba(0,212,170,.1)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <p style={{fontSize:13,fontWeight:800,color:"#00d4aa",margin:0}}>✅ Total cobrado (histórico)</p>
                <p style={{fontSize:11,color:"#555",margin:0}}>Suma de todos los pagos recibidos</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:0}}>
                {[
                  {l:"Total cobrado",v:fmt(totalCobrado),c:"#00d4aa",big:true},
                  {l:"En intereses",v:fmt(totalCobradoIntereses),c:"#f39c12"},
                  {l:"A capital",v:fmt(totalCobradoCapital),c:"#3b82f6"},
                  {l:"Préstamos con cobros",v:desgloseCobrado.length,c:"#888"},
                ].map(k=>(
                  <div key={k.l} style={{padding:"10px 16px",borderRight:"1px solid rgba(0,212,170,.07)"}}>
                    <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 3px"}}>{k.l}</p>
                    <p style={{fontSize:k.big?20:14,fontWeight:800,color:k.c,margin:0,fontVariantNumeric:"tabular-nums"}}>{k.v}</p>
                  </div>
                ))}
              </div>
              {desgloseCobrado.length>0&&(
                <div style={{borderTop:"1px solid rgba(0,212,170,.08)"}}>
                  {desgloseCobrado.map((d,i)=>(
                    <div key={d.loan.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                      padding:"7px 16px",borderBottom:i<desgloseCobrado.length-1?"1px solid rgba(255,255,255,.03)":"none",
                      background:i%2===0?"transparent":"rgba(255,255,255,.01)",cursor:"pointer"}}
                      onClick={()=>{setSelectedId(d.loan.id);setView("detail");}}>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:12,fontWeight:600,color:"#ccc",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.loan.name}</p>
                        <p style={{fontSize:10,color:"#555",margin:0}}>{d.pagos} pago{d.pagos!==1?"s":""} · interés {fmt(d.intereses)} · capital {fmt(d.capital)}</p>
                      </div>
                      <p style={{fontSize:13,fontWeight:800,color:"#00d4aa",margin:0,flexShrink:0,fontVariantNumeric:"tabular-nums"}}>
                        {fmt(d.intereses+d.capital)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
          {prestamosGivenActivos.length>0&&(
            <CorteGlobalPanel
              loans={prestamosGivenActivos}
              calcInteresTramos={calcInteresTramos}
              fechaCorteGlobalInput={fechaCorteGlobalInput}
              setFechaCorteGlobalInput={setFechaCorteGlobalInput}
              fmt={fmt}
            />
          )}
          {interesPorPagar>0&&(
            <Card style={{padding:"12px 14px",borderColor:"rgba(243,156,18,.2)",background:"rgba(243,156,18,.03)"}}>
              <p style={{fontSize:10,color:"#f39c12",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 4px"}}>Interés acumulado a pagar</p>
              <p style={{fontSize:18,fontWeight:800,color:"#f39c12",margin:0}}>-{fmt(interesPorPagar)}</p>
              <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>A la fecha de hoy</p>
            </Card>
          )}
          {interesEsteMes>0&&(
            <Card style={{padding:"12px 14px",borderColor:"rgba(243,156,18,.2)"}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 4px"}}>Interés est. próx. 30d</p>
              <p style={{fontSize:18,fontWeight:800,color:"#f39c12",margin:0}}>{fmt(interesEsteMes)}</p>
              <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>A pagar aprox.</p>
            </Card>
          )}
          {activeLoans.some(l=>l.dueDate&&new Date(l.dueDate)<new Date())&&(
            <Card style={{padding:"12px 14px",borderColor:"rgba(255,71,87,.25)",background:"rgba(255,71,87,.05)"}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 4px"}}>⚠️ Vencidos</p>
              <p style={{fontSize:18,fontWeight:800,color:"#ff4757",margin:0}}>
                {activeLoans.filter(l=>l.dueDate&&new Date(l.dueDate)<new Date()).length}
              </p>
              <p style={{fontSize:10,color:"#555",margin:"3px 0 0"}}>Requieren atención</p>
            </Card>
          )}
        </div>
      )}
      {loans.length===0 ? (
        <div style={{ textAlign:"center", padding:"40px 20px" }}>
          <div style={{fontSize:44,marginBottom:8}}>🤝</div>
          <p style={{fontSize:16,fontWeight:700,color:"#e0e0e0",margin:"0 0 8px"}}>Sin préstamos registrados</p>
          <p style={{fontSize:13,color:"#555",margin:"0 0 6px",lineHeight:1.5,maxWidth:340,marginLeft:"auto",marginRight:"auto"}}>
            Lleva el control de dinero que prestaste o que te prestaron. Finanzapp calcula el interés acumulado automáticamente día a día.
          </p>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",margin:"12px 0"}}>
            {["💸 Lo presté yo — registra qué te deben","🤝 Me lo prestaron — controla lo que debes"].map(t=>(
              <span key={t} style={{fontSize:11,padding:"5px 11px",borderRadius:20,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"#666"}}>{t}</span>
            ))}
          </div>
          <Btn onClick={openNewLoan}><Ic n="plus" size={14}/>Registrar primer préstamo</Btn>
        </div>
      ) : (
        <>
          {activeLoans.length>0&&<><p style={{ fontSize:11, color:"#666", textTransform:"uppercase", letterSpacing:.5, marginBottom:10, fontWeight:700 }}>Activos</p><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10, marginBottom:20 }}>{activeLoans.map(l=><LoanCard key={l.id} loan={l}/>)}</div></>}
          {paidLoans.length>0&&<><p style={{ fontSize:11, color:"#666", textTransform:"uppercase", letterSpacing:.5, marginBottom:10, fontWeight:700 }}>Liquidados</p><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10 }}>{paidLoans.map(l=><LoanCard key={l.id} loan={l}/>)}</div></>}
        </>
      )}
      {openLoan&&(
        <Modal title={editing?"Editar Préstamo":"Nuevo Préstamo"} onClose={closeLoan} width={520}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Sel label="Tipo" value={lf.type} onChange={lc("type")} options={[{value:"given",label:"💸 Lo presté yo"},{value:"received",label:"🤝 Me lo prestaron"}]}/>
            <Sel label="Moneda" value={lf.currency} onChange={lc("currency")} options={[{value:"MXN",label:"🇲🇽 MXN"},{value:"USD",label:"🇺🇸 USD"}]}/>
          </div>
          <Inp label={lf.type==="given"?"¿A quién le presté?":"¿Quién me prestó?"} value={lf.name} onChange={lc("name")} placeholder="Nombre" required/>
          {accounts.length>0 ? <Sel label={<>Cuenta asociada<HelpTip text="Cuenta donde entró (préstamo recibido) o salió (préstamo otorgado) el dinero. Se ajusta automáticamente el saldo al guardar."/></>} value={lf.accountId} onChange={lc("accountId")} required options={accounts.map(a=>({value:a.id,label:`${a.name} (${fmt(a.balance,a.currency)})`}))}/> : <Alert>Crea una cuenta primero.</Alert>}
          {editing&&<Alert color="#f39c12">Editar el capital no ajusta saldos. Solo corrige si fue error de captura.</Alert>}
          <Inp label="Capital" type="number" value={lf.principal} onChange={lc("principal")} placeholder="0.00" prefix={lf.currency==="USD"?"US$":"$"} required/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Sel label={<>Tipo de tasa<HelpTip text="Anual: ej. 13.5% (TIIE+spread). Mensual: ej. 3% para préstamos personales. Diaria: muy poco común."/></>} value={lf.rateType} onChange={lc("rateType")} options={[{value:"annual",label:"% Anual"},{value:"monthly",label:"% Mensual"},{value:"daily",label:"% Diaria"}]}/>
            <Inp label="Tasa" type="number" value={lf.rate} onChange={lc("rate")} placeholder="0.00" suffix="%"/>
          </div>
          {lf.rate&&<div style={{ background:"rgba(243,156,18,.08)", border:"1px solid rgba(243,156,18,.15)", borderRadius:9, padding:"8px 13px", marginBottom:14, fontSize:12, color:"#f39c12" }}>💡 {(dailyRate(lf.rate,lf.rateType)*100).toFixed(4)}% diario</div>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Inp label="Fecha inicio" type="date" value={lf.startDate} onChange={lc("startDate")}/>
            <Inp label="Vencimiento (opcional)" type="date" value={lf.dueDate} onChange={lc("dueDate")}/>
          </div>
          <Inp label="Notas (opcional)" value={lf.notes} onChange={lc("notes")} placeholder="Condiciones..."/>
          {/* Comisiones — solo para préstamos recibidos y solo al crear */}
          {!editing && lf.type==="received" && (
            <div style={{marginBottom:14,padding:"12px 14px",background:"rgba(243,156,18,.06)",border:"1px solid rgba(243,156,18,.2)",borderRadius:10}}>
              <p style={{fontSize:12,fontWeight:700,color:"#f39c12",margin:"0 0 10px"}}>💰 Comisiones y gastos iniciales <span style={{fontSize:10,fontWeight:400,color:"#666"}}>(opcionales)</span></p>
              <p style={{fontSize:11,color:"#666",margin:"0 0 10px",lineHeight:1.4}}>Se descontarán de la cuenta y se registrarán como gasto al guardar.</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <Inp label="Comisión apertura %" type="number" value={lf.comisionApertura} onChange={lc("comisionApertura")} placeholder="0.5" suffix="%"/>
                <Inp label="FEGA %" type="number" value={lf.comisionFega} onChange={lc("comisionFega")} placeholder="0.5" suffix="%"/>
                <Inp label="Otros gastos $" type="number" value={lf.otrosGastos} onChange={lc("otrosGastos")} placeholder="0.00"/>
              </div>
              {(parseFloat(lf.comisionApertura)||parseFloat(lf.comisionFega)||parseFloat(lf.otrosGastos))>0&&lf.principal&&(()=>{
                const p=parseFloat(lf.principal)||0;
                const total=(p*(parseFloat(lf.comisionApertura)||0)/100)+(p*(parseFloat(lf.comisionFega)||0)/100)+(parseFloat(lf.otrosGastos)||0);
                return total>0?<p style={{fontSize:12,color:"#f39c12",fontWeight:700,margin:"6px 0 0"}}>Total comisiones: {fmt(total,lf.currency)}</p>:null;
              })()}
            </div>
          )}
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:6 }}>
            <Btn variant="secondary" onClick={closeLoan}>Cancelar</Btn>
            <Btn onClick={saveLoan} disabled={accounts.length===0}><Ic n="check" size={15}/>{editing?"Guardar":"Registrar"}</Btn>
          </div>
        </Modal>
      )}
      {confirmModal}
    </div>
  );
};

// ─── INVERSIONES ──────────────────────────────────────────────────────────────
const Investments = () => {
  const { user, toast } = useCtx();
  const TC = getTc(user.id);
  const [investments, setInvestments] = useData(user.id, "investments");
  const [accounts, setAccounts]       = useData(user.id, "accounts");
  const [transactions, setTransactions] = useData(user.id, "transactions");
  const [view, setView]       = useState("list");
  const [selected, setSelected] = useState(null);
  const [openInv, setOpenInv] = useState(false);
  const [openLiq, setOpenLiq] = useState(false);
  const [openAport, setOpenAport] = useState(false);
  const [openCobro, setOpenCobro] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detTab, setDetTab] = useState("aportaciones");
  const [askConfirm, confirmModal] = useConfirm();

  const blankCobro = { tipoCobro:"retiro_parcial", monto:"", fecha:today(), cuentaDestinoId:"", titulosVendidos:"", precioVenta:"", retencionISR:"", notas:"", registrarComoTx:true };
  const [cobroForm, setCobroForm] = useState(blankCobro);
  const cc = k => e => setCobroForm(p=>({...p,[k]:e.target.value}));

  const typeOpts = [
    {value:"fund_real_estate", label:"🏢 Fondo Inmobiliario"},
    {value:"fund_general",     label:"📦 Fondo de Inversión"},
    {value:"stocks_etf",       label:"📈 Acciones / ETFs"},
    {value:"crypto",           label:"₿ Criptomonedas"},
    {value:"bonds",            label:"🏛️ CETES / Bonos"},
    {value:"other",            label:"🔹 Otro"},
  ];
  const typeColors = {fund_real_estate:"#f39c12",fund_general:"#0078ff",stocks_etf:"#00d4aa",crypto:"#f7931a",bonds:"#9b59b6",other:"#888"};
  const typeLabels = Object.fromEntries(typeOpts.map(o=>[o.value,o.label]));

  const blankInv = { name:"", type:"fund_general", ticker:"", platform:"", currency:"MXN", startDate:today(), endDate:"", accountId:"", capitalInicial:"", tasaAnual:"", titulos:"", precioCosto:"", precioActual:"", currentValue:"", tcCompra:"", tcActual:"", montoUSD:"", notes:"", coingeckoId:"", _cryptoMode:"tokens", _valUSD:"", _valMXN:"" };
  const blankAport = { amount:"", date:today(), titulos:"", accountId:"", notes:"" };
  const [invForm, setInvForm] = useState(blankInv);
  const [aportForm, setAportForm] = useState(blankAport);
  const ic = k => e => setInvForm(p=>({...p,[k]:e.target.value}));
  const ac = k => e => setAportForm(p=>({...p,[k]:e.target.value}));

  const applyDelta = (accs,id,delta) => accs.map(a=>a.id===id?{...a,balance:parseFloat(a.balance||0)+delta}:a);

  const calcInv = inv => {
    const aportaciones = (inv.aportaciones||[]);
    const totalInvertido = aportaciones.reduce((s,a)=>s+a.amount, 0);
    const titulos = parseFloat(inv.titulos)||0;
    const precioActual = parseFloat(inv.precioActual)||0;
    const precioCosto = parseFloat(inv.precioCosto)||0;
    const diasActiva = Math.max(0, Math.round((new Date()-new Date(inv.startDate))/86400000));
    const diasAlVenc = inv.endDate ? Math.round((new Date(inv.endDate)-new Date())/86400000) : null;
    const costoTitulos = titulos > 0 && precioCosto > 0 ? titulos * precioCosto : totalInvertido;
    const base = costoTitulos > 0 ? costoTitulos : totalInvertido;

    // ── Inversión liquidada: usar rendimiento realizado de los cobros
    if (inv.estado==="liquidada") {
      const totalCobrado = (inv.cobros||[]).reduce((s,c)=>s+(c.montoNeto||c.monto||0),0);
      const rendRealizado = (inv.cobros||[]).reduce((s,c)=>s+(c.rendRealizado||0),0);
      const rendPct = base > 0 ? (rendRealizado/base)*100 : 0;
      return { totalInvertido, valorActual:totalCobrado, rendimiento:rendRealizado, rendPct,
               diasActiva, diasAlVenc, titulos:0, precioActual:0, precioCosto, costoTitulos,
               liquidada:true, totalCobrado };
    }

    let valorActual;
    // modo "valor total" para crypto: usa currentValue directamente
    if (inv.type==="crypto" && inv._cryptoMode==="valor" && parseFloat(inv.currentValue)>0) {
      valorActual = parseFloat(inv.currentValue);
    } else if (titulos > 0 && precioActual > 0) {
      valorActual = titulos * precioActual;
    } else if (parseFloat(inv.currentValue)>0) {
      valorActual = parseFloat(inv.currentValue);
    } else if (parseFloat(inv.tasaAnual)>0 && (totalInvertido > 0 || costoTitulos > 0)) {
      // Sin precio de mercado pero con tasa anual → proyectar valor con rendimiento acumulado
      const baseVal = costoTitulos > 0 ? costoTitulos : totalInvertido;
      const tasaDiaria = parseFloat(inv.tasaAnual) / 100 / 365;
      valorActual = baseVal + (baseVal * tasaDiaria * diasActiva);
    } else {
      valorActual = totalInvertido;
    }
    const rendimiento = valorActual - base;
    const rendPct = base > 0 ? (rendimiento/base)*100 : 0;
    return { totalInvertido, valorActual, rendimiento, rendPct, diasActiva, diasAlVenc,
             titulos, precioActual, precioCosto, costoTitulos, liquidada:false };
  };

  const calcProyeccion = (inv, calcSt) => {
    const tasa = parseFloat(inv.tasaAnual)||0;
    if (!tasa) return null;
    const base = calcSt.costoTitulos > 0 ? calcSt.costoTitulos : calcSt.totalInvertido;
    if (!base) return null;
    const tasaDiaria = tasa / 100 / 365;
    const rendAnual = base * (tasa / 100);
    const rendMensual = base * (tasa / 100 / 12);
    const rendAcumulado = base * tasaDiaria * calcSt.diasActiva;
    const rendAlVenc = inv.endDate && calcSt.diasAlVenc !== null
      ? base * tasaDiaria * (calcSt.diasActiva + Math.max(0, calcSt.diasAlVenc))
      : null;
    const valorAlVenc = rendAlVenc !== null ? base + rendAlVenc : null;
    return { tasa, base, rendAnual, rendMensual, rendAcumulado, rendAlVenc, valorAlVenc };
  };

  const openNew = () => { setEditing(null); setInvForm({...blankInv, accountId:accounts[0]?.id||""}); setOpenInv(true); };
  const openEdit = (inv,e) => { e?.stopPropagation(); setEditing(inv); setInvForm({name:inv.name,type:inv.type,ticker:inv.ticker||"",platform:inv.platform||"",currency:inv.currency,startDate:inv.startDate,endDate:inv.endDate||"",accountId:inv.accountId||"",tasaAnual:inv.tasaAnual?.toString()||"",titulos:inv.titulos?.toString()||"",precioCosto:inv.precioCosto?.toString()||"",precioActual:inv.precioActual?.toString()||"",currentValue:inv.currentValue?.toString()||"",tcCompra:inv.tcCompra?.toString()||"",tcActual:inv.tcActual?.toString()||"",montoUSD:inv.montoUSD?.toString()||"",notes:inv.notes||"",coingeckoId:inv.coingeckoId||"",_cryptoMode:inv._cryptoMode||"tokens",_valUSD:inv._valUSD||"",_valMXN:inv._valMXN||""}); setOpenInv(true); };
  const closeInv = () => { setOpenInv(false); setEditing(null); };

  const saveInv = () => {
    if (!invForm.name.trim()) { toast("El nombre es requerido.","error"); return; }
    const extra = {
      ticker: invForm.ticker||"",
      coingeckoId: invForm.coingeckoId||"",
      _cryptoMode: invForm._cryptoMode||"tokens",
      _valUSD: invForm._valUSD||"",
      _valMXN: invForm._valMXN||"",
      tasaAnual: parseFloat(invForm.tasaAnual)||null,
      titulos: parseFloat(invForm.titulos)||null,
      precioCosto: parseFloat(invForm.precioCosto)||null,
      precioActual: parseFloat(invForm.precioActual)||null,
      currentValue: parseFloat(invForm.currentValue)||null,
      tcCompra: parseFloat(invForm.tcCompra)||null,
      tcActual: parseFloat(invForm.tcActual)||null,
      montoUSD: parseFloat(invForm.montoUSD)||null,
    };
    if (editing) {
      setInvestments(investments.map(i=>i.id===editing.id?{...i,...invForm,...extra}:i));
      if (selected?.id===editing.id) setSelected(p=>({...p,...invForm,...extra}));
      toast("Inversión actualizada.","success");
    } else {
      const titulos     = parseFloat(invForm.titulos)||0;
      const precioCosto = parseFloat(invForm.precioCosto)||0;
      const capitalCalculado = titulos > 0 && precioCosto > 0 ? titulos * precioCosto : 0;
      const capitalInicial = capitalCalculado > 0 ? capitalCalculado : (parseFloat(invForm.capitalInicial)||0);
      const aportaciones = capitalInicial > 0 ? [{
        id: genId(),
        amount: capitalInicial,
        date: invForm.startDate,
        titulos: titulos||null,
        accountId: invForm.accountId||"",
        notes: capitalCalculado > 0 ? `Capital inicial (${titulos} ${invForm.type==="crypto"?"tokens":"títulos"} × $${precioCosto})` : "Capital inicial",
      }] : [];
      if (capitalInicial > 0 && invForm.accountId) {
        const acc = accounts.find(a=>a.id===invForm.accountId);
        if (acc && capitalInicial > acc.balance + 0.01) { toast("Saldo insuficiente en la cuenta seleccionada.","error"); return; }
        setAccounts(applyDelta(accounts, invForm.accountId, -capitalInicial));
      }
      setInvestments([{id:genId(),...invForm,...extra,aportaciones,createdAt:new Date().toISOString()},...investments]);
      toast("Inversión registrada.","success");
    }
    closeInv();
  };

  const delInv = async (inv,e) => {
    e?.stopPropagation();
    const ok = await askConfirm(`¿Eliminar "${inv.name}"? Las aportaciones que salieron de cuentas se revertirán.`);
    if (!ok) return;
    let accs = accounts;
    for (const ap of (inv.aportaciones||[])) {
      if (ap.accountId) accs = applyDelta(accs, ap.accountId, ap.amount);
    }
    setAccounts(accs);
    setInvestments(investments.filter(i=>i.id!==inv.id));
    if (selected?.id===inv.id){setSelected(null);setView("list");}
    toast("Inversión eliminada.","warning");
  };

  const openNewAport = () => { setAportForm({...blankAport, accountId:selected?.accountId||accounts[0]?.id||""}); setOpenAport(true); };
  const closeAport = () => setOpenAport(false);

  const saveAport = () => {
    const amount = parseFloat(aportForm.amount);
    if (!amount||amount<=0) { toast("Monto inválido.","error"); return; }
    if (aportForm.accountId) {
      const acc = accounts.find(a=>a.id===aportForm.accountId);
      if (acc && amount > acc.balance+0.01) { toast("Saldo insuficiente en la cuenta seleccionada.","error"); return; }
      setAccounts(applyDelta(accounts, aportForm.accountId, -amount));
    }
    const newAport = {id:genId(),...aportForm,amount};
    const updated = {...selected, aportaciones:[...(selected.aportaciones||[]),newAport]};
    setInvestments(investments.map(i=>i.id===selected.id?updated:i));
    setSelected(updated);
    toast("Aportación registrada.","success");
    closeAport();
  };

  const delAport = async aportId => {
    const ok = await askConfirm("¿Eliminar esta aportación? Si salió de una cuenta, el saldo se revertirá.");
    if (!ok) return;
    const ap = selected.aportaciones.find(a=>a.id===aportId);
    if (ap.accountId) setAccounts(applyDelta(accounts, ap.accountId, ap.amount));
    const updated = {...selected, aportaciones:selected.aportaciones.filter(a=>a.id!==aportId)};
    setInvestments(investments.map(i=>i.id===selected.id?updated:i));
    setSelected(updated);
    toast("Aportación eliminada y saldo revertido.","warning");
  };

  const saveCobro = () => {
    if (!cobroForm.monto) { toast("Ingresa el monto recibido","error"); return; }
    const montoRecibido = parseFloat(cobroForm.monto)||0;
    const retencion     = parseFloat(cobroForm.retencionISR)||0;
    const montoNeto     = montoRecibido - retencion;
    const st            = calcInv(selected);
    const titulosVend   = parseFloat(cobroForm.titulosVendidos)||0;

    // 1. Abonar a cuenta destino
    if (cobroForm.cuentaDestinoId) {
      setAccounts(p=>p.map(a=>a.id===cobroForm.cuentaDestinoId
        ? {...a, balance:parseFloat(a.balance||0)+montoNeto}
        : a));
    }

    // calcular rendimiento realizado
    const base = st.costoTitulos>0 ? st.costoTitulos : st.totalInvertido;
    const rendRealizado = montoRecibido - base;

    const nuevoCobro = {
      id:genId(), tipo:cobroForm.tipoCobro, monto:montoRecibido,
      retencionISR:retencion, montoNeto, fecha:cobroForm.fecha,
      cuentaDestinoId:cobroForm.cuentaDestinoId,
      titulosVendidos:titulosVend||null,
      precioVenta:parseFloat(cobroForm.precioVenta)||null,
      rendRealizado, notas:cobroForm.notas,
    };

    let updated = {...selected, cobros:[...(selected.cobros||[]),nuevoCobro]};

    if (cobroForm.tipoCobro==="liquidacion_total") {
      // cerrar inversión
      updated = {...updated, estado:"liquidada", fechaLiquidacion:cobroForm.fecha,
        currentValue:0, titulos:0,
      };
      toast(`Inversión liquidada — ${fmt(montoNeto,selected.currency)} enviados a cuenta ✓`);
    } else if (cobroForm.tipoCobro==="retiro_parcial") {
      // reducir títulos si aplica
      if (titulosVend>0 && (selected.titulos||0)>0) {
        updated.titulos = Math.max(0,(parseFloat(selected.titulos)||0)-titulosVend);
        updated.currentValue = updated.titulos*(parseFloat(selected.precioActual)||0)||null;
      }
      toast(`Retiro de ${fmt(montoNeto,selected.currency)} registrado ✓`);
    } else if (cobroForm.tipoCobro==="reinversion") {
      // los rendimientos se quedan — solo registrar el cobro como referencia
      toast(`Reinversión de ${fmt(montoRecibido,selected.currency)} registrada ✓`);
    } else if (cobroForm.tipoCobro==="dividendo") {
      toast(`Dividendo/interés de ${fmt(montoNeto,selected.currency)} registrado ✓`);
    }

    setInvestments(p=>p.map(i=>i.id===selected.id?updated:i));
    setSelected(updated);
    // ── híbrido: crear transacción si el usuario lo eligió
    if (cobroForm.registrarComoTx && cobroForm.tipoCobro!=="reinversion") {
      const txsInv = [];
      if (cobroForm.tipoCobro==="dividendo") {
        // Dividendo/interés: ingreso puro, registrar el monto neto completo
        txsInv.push({
          id:genId(), date:cobroForm.fecha, amount:montoNeto,
          type:"income",
          description:`Dividendo/Interés — ${selected.name}`,
          category:"Dividendos e intereses",
          accountId: cobroForm.cuentaDestinoId||"",
          currency: selected.currency||"MXN",
          origen:"inversion", origenId:selected.id, notes: cobroForm.notas||"",
        });
      } else {
        // Retiro parcial o liquidación total: solo registrar ganancia o pérdida
        const base = st.costoTitulos>0 ? st.costoTitulos : st.totalInvertido;
        const gananciaNeta = montoNeto - base;
        if (Math.abs(gananciaNeta) >= 1) {
          // Hay diferencia significativa entre lo recibido y el capital invertido
          txsInv.push({
            id:genId(), date:cobroForm.fecha, amount:Math.abs(gananciaNeta),
            type: gananciaNeta >= 0 ? "income" : "expense",
            description: gananciaNeta >= 0
              ? `Ganancia realizada — ${selected.name}`
              : `Pérdida realizada — ${selected.name}`,
            category: gananciaNeta >= 0 ? "Ganancia de inversión" : "Pérdida de inversión",
            accountId: cobroForm.cuentaDestinoId||"",
            currency: selected.currency||"MXN",
            origen:"inversion", origenId:selected.id, notes: cobroForm.notas||"",
          });
        }
        // El capital recuperado NO se registra como ingreso (era tuyo desde el inicio)
      }
      setTransactions(p=>[...txsInv,...p]);
    }
    setOpenCobro(false);
    setCobroForm(blankCobro);
  };

  const delCobro = async (cobroId) => {
    const ok = await askConfirm("¿Eliminar este cobro? El saldo de la cuenta destino se revertirá.");
    if (!ok) return;
    const cobro = (selected.cobros||[]).find(c=>c.id===cobroId);
    if (cobro?.cuentaDestinoId && cobro.montoNeto) {
      setAccounts(p=>p.map(a=>a.id===cobro.cuentaDestinoId
        ? {...a, balance:parseFloat(a.balance||0)-cobro.montoNeto}
        : a));
    }
    const updated = {...selected, cobros:(selected.cobros||[]).filter(c=>c.id!==cobroId)};
    setInvestments(p=>p.map(i=>i.id===selected.id?updated:i));
    setSelected(updated);
    toast("Cobro eliminado y saldo revertido","error");
  };

  const updatePrecio = (inv, field, val) => {
    const updated = {...inv, [field]: parseFloat(val)||null};
    if (field==="precioActual" && (updated.titulos||0) > 0) {
      updated.currentValue = (updated.titulos||0) * (parseFloat(val)||0);
    }
    setInvestments(investments.map(i=>i.id===inv.id?updated:i));
    setSelected(updated);
  };

  if (view==="detail" && selected) {
    const st = calcInv(selected);
    const proy = calcProyeccion(selected, st);
    const color = typeColors[selected.type]||"#888";
    const aorts = [...(selected.aportaciones||[])].sort((a,b)=>new Date(b.date)-new Date(a.date));
    const rendColor = st.rendimiento >= 0 ? "#00d4aa" : "#ff4757";

    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          <button onClick={()=>{setView("list");setSelected(null);}} style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:9, padding:"7px 13px", color:"#bbb", cursor:"pointer", fontSize:13 }}>
            <Ic n="back" size={16}/> Volver
          </button>
          <div style={{ flex:1 }}>
            <h2 style={{ fontSize:20, fontWeight:700, color:"#f0f0f0", margin:"0 0 4px" }}>{selected.name}</h2>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <Badge label={typeLabels[selected.type]} color={color}/>
              {selected.platform && <Badge label={selected.platform} color="#555"/>}
              <Badge label={selected.currency} color="#444"/>
            </div>
          </div>
          <Btn onClick={openNewAport}><Ic n="plus" size={15}/>Aportación</Btn>
          <Btn variant="secondary" onClick={()=>{setCobroForm({...blankCobro});setOpenCobro(true);}} style={{background:"rgba(0,120,255,.12)",color:"#60a5fa",border:"1px solid rgba(0,120,255,.3)"}}><Ic n="download" size={15}/>Cobro / Retiro</Btn>
          <Btn variant="secondary" onClick={e=>openEdit(selected,e)}><Ic n="edit" size={15}/>Editar</Btn>
          <Btn variant="danger" onClick={e=>delInv(selected,e)}><Ic n="trash" size={15}/>Eliminar</Btn>
        </div>

        {(()=>{
          const isDivisa = selected.montoUSD && selected.tcCompra && selected.tcActual;
          const usd=parseFloat(selected.montoUSD||0), tcC=parseFloat(selected.tcCompra||0), tcA=parseFloat(selected.tcActual||0);
          const rendUSD = parseFloat(selected.tasaAnual)>0 ? usd*(parseFloat(selected.tasaAnual)/100/365)*st.diasActiva : 0;
          const totalUSDconRend = usd + rendUSD;
          const totalMXNconRend = totalUSDconRend * tcA;
          const costoMXN = usd * tcC;
          const gananciaTotal = totalMXNconRend - costoMXN;
          const pctCamb = tcC>0?((tcA-tcC)/tcC)*100:0;
          const kpis = isDivisa ? [
            {l:"Capital USD",        v:fmt(usd,"USD"),                                       c:"#888"},
            {l:"Valor total (MXN)",  v:fmt(totalMXNconRend,"MXN"),                          c:color},
            {l:"Ganancia total MXN", v:(gananciaTotal>=0?"+":"")+fmt(gananciaTotal,"MXN"),  c:gananciaTotal>=0?"#00d4aa":"#ff4757"},
            {l:"Var. tipo cambio",   v:(pctCamb>=0?"+":"")+pctCamb.toFixed(2)+"%",         c:pctCamb>=0?"#00d4aa":"#ff4757"},
            {l:"Días activa",        v:st.diasActiva+" días",                               c:"#777"},
          ] : [
            {l:"Capital invertido", v:fmt(st.totalInvertido,selected.currency), c:"#888"},
            {l:"Valor actual",      v:fmt(st.valorActual,selected.currency),    c:color},
            {l:"Rendimiento",       v:(st.rendimiento>=0?"+":"")+fmt(st.rendimiento,selected.currency), c:rendColor},
            {l:"Rendimiento %",     v:(st.rendPct>=0?"+":"")+st.rendPct.toFixed(2)+"%", c:rendColor},
            {l:"Días activa",       v:st.diasActiva+" días", c:"#777"},
          ];
          return (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10, marginBottom:16 }}>
              {kpis.map(k=>(
                <Card key={k.l} style={{ padding:14 }}>
                  <p style={{ fontSize:11, color:"#666", textTransform:"uppercase", letterSpacing:.4, margin:"0 0 4px" }}>{k.l}</p>
                  <p style={{ fontSize:16, fontWeight:700, color:k.c, margin:0 }}>{k.v}</p>
                </Card>
              ))}
            </div>
          );
        })()}

        {selected.montoUSD && selected.tcCompra && selected.tcActual && (()=>{
          const usd     = parseFloat(selected.montoUSD);
          const tcC     = parseFloat(selected.tcCompra);
          const tcA     = parseFloat(selected.tcActual);
          const costoMXN   = usd * tcC;
          const valorMXN   = usd * tcA;
          const gCambiaria = valorMXN - costoMXN;
          const pctCamb    = ((tcA - tcC) / tcC) * 100;
          const tasa       = parseFloat(selected.tasaAnual)||0;
          const rendUSD    = tasa > 0 ? usd * (tasa/100/365) * st.diasActiva : 0;
          const rendUSDenMXN = rendUSD * tcA;
          const gananciaTotal = gCambiaria + rendUSDenMXN;
          return (
            <Card style={{ marginBottom:16, borderColor:"rgba(0,120,255,.25)", background:"linear-gradient(135deg,rgba(0,120,255,.05) 0%,rgba(0,0,0,0) 60%)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#0078ff", margin:0 }}>💱 Análisis Cambiario</p>
                <div style={{ display:"flex", gap:6 }}>
                  <Badge label={`TC compra: $${tcC.toFixed(2)}`} color="#555"/>
                  <Badge label={`TC actual: $${tcA.toFixed(2)}`} color="#0078ff"/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:8, marginBottom:12 }}>
                {[
                  {l:"Capital USD",        v:fmt(usd,"USD"),                   c:"#888"},
                  {l:"Costo en MXN",       v:fmt(costoMXN,"MXN"),             c:"#888"},
                  {l:"Valor actual MXN",   v:fmt(valorMXN,"MXN"),             c:"#0078ff"},
                  {l:"Ganancia cambiaria", v:(gCambiaria>=0?"+":"")+fmt(gCambiaria,"MXN"), c:gCambiaria>=0?"#00d4aa":"#ff4757"},
                  {l:"Var. tipo cambio",   v:(pctCamb>=0?"+":"")+pctCamb.toFixed(2)+"%",  c:pctCamb>=0?"#00d4aa":"#ff4757"},
                  ...(rendUSD>0?[{l:"Rend. USD acumulado", v:"+"+fmt(rendUSD,"USD"), c:"#00d4aa"}]:[]),
                  ...(rendUSDenMXN>0?[{l:"Rend. USD en MXN",   v:"+"+fmt(rendUSDenMXN,"MXN"), c:"#00d4aa"}]:[]),
                ].map(k=>(
                  <div key={k.l} style={{ background:"rgba(255,255,255,.04)", borderRadius:9, padding:"9px 12px" }}>
                    <p style={{ fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:.3, margin:"0 0 3px" }}>{k.l}</p>
                    <p style={{ fontSize:14, fontWeight:700, color:k.c, margin:0 }}>{k.v}</p>
                  </div>
                ))}
              </div>
              <div style={{ background:gananciaTotal>=0?"rgba(0,212,170,.08)":"rgba(255,71,87,.08)", border:gananciaTotal>=0?"1px solid rgba(0,212,170,.2)":"1px solid rgba(255,71,87,.2)", borderRadius:9, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
                <div>
                  <p style={{ fontSize:11, color:"#666", margin:"0 0 2px", textTransform:"uppercase", letterSpacing:.4 }}>Ganancia total en MXN</p>
                  <p style={{ fontSize:11, color:"#555", margin:0 }}>Cambiaria{rendUSD>0?" + rendimiento en USD":""} · {st.diasActiva} días</p>
                </div>
                <p style={{ fontSize:22, fontWeight:800, color:gananciaTotal>=0?"#00d4aa":"#ff4757", margin:0 }}>
                  {gananciaTotal>=0?"+":""}{fmt(gananciaTotal,"MXN")}
                </p>
              </div>
              <div style={{ marginTop:12, display:"flex", gap:10, alignItems:"flex-end", flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:160 }}>
                  <p style={{ fontSize:11, color:"#555", margin:"0 0 4px" }}>Actualizar tipo de cambio actual</p>
                  <input type="number" step="0.01"
                    defaultValue={tcA}
                    onBlur={e=>{
                      const nuevoTC=parseFloat(e.target.value);
                      if (nuevoTC>0&&nuevoTC!==tcA) {
                        const updated={...selected,tcActual:nuevoTC};
                        setInvestments(investments.map(i=>i.id===selected.id?updated:i));
                        setSelected(updated);
                        toast("Tipo de cambio actualizado.","success");
                      }
                    }}
                    style={{ width:"100%", padding:"8px 10px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:9, color:"#e0e0e0", fontSize:13, outline:"none", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.borderColor="#0078ff"}/>
                </div>
                <p style={{ fontSize:11, color:"#444", margin:"0 0 10px", fontStyle:"italic" }}>Toca fuera del campo para guardar</p>
              </div>
            </Card>
          );
        })()}

        <Card style={{ marginBottom:16 }}>
          <p style={{ fontSize:13, fontWeight:600, color:"#e0e0e0", margin:"0 0 12px" }}>
            Estado de cuenta
            <span style={{ fontSize:11, color:"#555", fontWeight:400, marginLeft:8 }}>Actualiza los datos de tu app Actinver / Binance</span>
          </p>

          {st.titulos > 0 ? (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:8, marginBottom:12 }}>
                {[
                  {l:selected.type==="crypto"?"Tokens":"Títulos", v:selected.type==="crypto"?st.titulos.toLocaleString("es-MX",{maximumFractionDigits:8}):st.titulos.toLocaleString("es-MX"), c:"#888"},
                  {l:"Precio costo/título",v:st.precioCosto>0?fmt(st.precioCosto,selected.currency):"—", c:"#666"},
                  {l:"Precio actual/título",v:st.precioActual>0?fmt(st.precioActual,selected.currency):"—", c:color},
                  {l:"Valor a mercado",    v:fmt(st.valorActual,selected.currency),         c:rendColor},
                ].map(k=>(
                  <div key={k.l} style={{ background:"rgba(255,255,255,.03)", borderRadius:8, padding:"9px 12px" }}>
                    <p style={{ fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:.4, margin:"0 0 3px" }}>{k.l}</p>
                    <p style={{ fontSize:14, fontWeight:700, color:k.c, margin:0 }}>{k.v}</p>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:120 }}>
                  <p style={{ fontSize:11, color:"#666", margin:"0 0 4px" }}>Actualizar precio actual por título</p>
                  <div style={{ display:"flex", gap:6 }}>
                    <input type="number" defaultValue={st.precioActual||""} placeholder="0.000"
                      id="inp-precio-actual"
                      style={{ flex:1, padding:"8px 10px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, color:"#f0f0f0", fontSize:13, outline:"none" }}
                      onFocus={e=>{e.target.style.borderColor="#00d4aa";}}
                      onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,.1)";}}
                    />
                    <Btn size="sm" onClick={()=>{
                      const v = document.getElementById("inp-precio-actual").value;
                      if (v) updatePrecio(selected,"precioActual",v);
                      toast("Precio actualizado.","success");
                    }}><Ic n="check" size={13}/>OK</Btn>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
              <div>
                <p style={{ fontSize:22, fontWeight:700, color:rendColor, margin:"0 0 2px" }}>{fmt(st.valorActual,selected.currency)}</p>
                <p style={{ fontSize:11, color:"#555", margin:0 }}>Valor actual registrado</p>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <input type="number" defaultValue={st.valorActual||""} placeholder="0.00"
                  id="inp-valor-actual"
                  style={{ width:140, padding:"8px 10px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, color:"#f0f0f0", fontSize:13, outline:"none" }}
                  onFocus={e=>e.target.style.borderColor="#00d4aa"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.1)"}
                />
                <Btn size="sm" onClick={()=>{
                  const v = document.getElementById("inp-valor-actual").value;
                  if (v) updatePrecio(selected,"currentValue",v);
                  toast("Valor actualizado.","success");
                }}><Ic n="check" size={13}/>Guardar</Btn>
              </div>
            </div>
          )}

          <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,.06)", display:"flex", gap:16, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:"#555" }}>📅 Inicio: {fmtDate(selected.startDate)}</span>
            {selected.endDate && (
              <span style={{ fontSize:12, color: st.diasAlVenc!==null&&st.diasAlVenc<0?"#ff4757":st.diasAlVenc!==null&&st.diasAlVenc<30?"#f39c12":"#555" }}>
                {st.diasAlVenc<0 ? `⚠️ Venció hace ${Math.abs(st.diasAlVenc)} días` : st.diasAlVenc===0 ? "⚠️ Vence hoy" : `📆 Vence en ${st.diasAlVenc} días (${fmtDate(selected.endDate)})`}
              </span>
            )}
            {selected.ticker && <span style={{ fontSize:12, color:"#555" }}>🏷️ {selected.ticker}</span>}
            {selected.type==="crypto" && (
              <button onClick={async()=>{
                const cid = selected.coingeckoId||selected.ticker?.toLowerCase().trim();
                if(!cid){ alert("Esta inversión no tiene Ticker ni CoinGecko ID. Edítala para agregarlo."); return; }
                try{
                  const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(cid)}&vs_currencies=${selected.currency==="USD"?"usd":"mxn"}`);
                  const d = await r.json();
                  const precio = d[cid]?.[selected.currency==="USD"?"usd":"mxn"];
                  if(precio){
                    setInvestments(prev=>prev.map(i=>i.id===selected.id?{...i,precioActual:precio}:i));
                    setSelected(s=>({...s,precioActual:precio}));
                    toast(`Precio actualizado: ${selected.currency==="USD"?"US$":"$"}${precio.toLocaleString("es-MX")} ✓`,"success");
                  } else {
                    alert(`No encontré "${cid}" en CoinGecko. Edita la inversión y agrega el CoinGecko ID correcto.`);
                  }
                }catch(err){ alert("Error al consultar CoinGecko. Verifica tu conexión."); }
              }} style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", background:"rgba(247,147,26,.12)", border:"1px solid rgba(247,147,26,.3)", borderRadius:7, color:"#f7931a", cursor:"pointer", fontSize:11, fontWeight:700 }}>
                ⚡ Actualizar precio
              </button>
            )}
          </div>
          {selected.notes && <p style={{ margin:"8px 0 0", fontSize:12, color:"#555", fontStyle:"italic" }}>{selected.notes}</p>}
        </Card>

        {proy && (
          <Card style={{ marginBottom:16, borderColor:"rgba(243,156,18,.2)", background:"rgba(243,156,18,.02)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <p style={{ fontSize:13, fontWeight:700, color:"#f39c12", margin:0 }}>⚡ Proyección Estimada</p>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:"rgba(243,156,18,.15)",color:"#f39c12",fontWeight:700}}>NO AFECTA TOTALES REALES</span>
                </div>
                <p style={{ fontSize:11, color:"#555", margin:0 }}>Basada en {proy.tasa}% anual sobre {fmt(proy.base, selected.currency)} · Solo orientativo</p>
              </div>
              <Badge label={`${proy.tasa}% anual`} color="#f39c12"/>
            </div>
            {/* Comparativa real vs proyectado */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12,padding:"10px 12px",background:"rgba(0,0,0,.2)",borderRadius:9}}>
              <div>
                <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 3px"}}>Rendimiento real actual</p>
                <p style={{fontSize:15,fontWeight:800,color:st.rendimiento>=0?"#00d4aa":"#ff4757",margin:0}}>{st.rendimiento>=0?"+":""}{fmt(st.rendimiento,selected.currency)}</p>
                <p style={{fontSize:10,color:"#555",margin:"1px 0 0"}}>{st.rendPct>=0?"+":""}{st.rendPct.toFixed(2)}% acumulado</p>
              </div>
              <div>
                <p style={{fontSize:9,color:"#f39c12",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 3px"}}>Proyección año completo</p>
                <p style={{fontSize:15,fontWeight:800,color:"#f39c12",margin:0}}>+{fmt(proy.rendAnual,selected.currency)}</p>
                <p style={{fontSize:10,color:"#666",margin:"1px 0 0"}}>+{fmt(proy.rendMensual,selected.currency)}/mes estimado</p>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:8, marginBottom: proy.valorAlVenc ? 10 : 0 }}>
              {[
                {l:"Rend. mensual est.",  v:"+"+fmt(proy.rendMensual,  selected.currency)},
                {l:"Rend. anual est.",    v:"+"+fmt(proy.rendAnual,    selected.currency)},
                {l:"Acumulado a la fecha",v:"+"+fmt(proy.rendAcumulado,selected.currency)},
              ].map(k=>(
                <div key={k.l} style={{ background:"rgba(243,156,18,.07)", border:"1px solid rgba(243,156,18,.15)", borderRadius:9, padding:"9px 12px" }}>
                  <p style={{ fontSize:10, color:"#888", textTransform:"uppercase", letterSpacing:.4, margin:"0 0 3px" }}>{k.l}</p>
                  <p style={{ fontSize:15, fontWeight:700, color:"#f39c12", margin:0 }}>{k.v}</p>
                </div>
              ))}
            </div>
            {proy.valorAlVenc && (
              <div style={{ background:"rgba(243,156,18,.1)", border:"1px solid rgba(243,156,18,.25)", borderRadius:9, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
                <div>
                  <p style={{ fontSize:11, color:"#999", margin:"0 0 2px", textTransform:"uppercase", letterSpacing:.4 }}>Valor estimado al vencimiento</p>
                  <p style={{ fontSize:11, color:"#666", margin:0 }}>{fmtDate(selected.endDate)} · en {Math.max(0,st.diasAlVenc)} días</p>
                </div>
                <p style={{ fontSize:22, fontWeight:800, color:"#f39c12", margin:0 }}>{fmt(proy.valorAlVenc, selected.currency)}</p>
              </div>
            )}
            <p style={{ fontSize:10, color:"#444", margin:"10px 0 0", fontStyle:"italic" }}>⚠️ Estas cifras son estimadas. El rendimiento real puede variar.</p>
          </Card>
        )}

        {/* ── TABS aportaciones / cobros */}
        {(()=>{
          const cobros = [...(selected.cobros||[])].sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));
          const TIPOLABEL = {retiro_parcial:"Retiro parcial",liquidacion_total:"Liquidación total",reinversion:"Reinversión",dividendo:"Dividendo/Interés"};
          const TIPOCOLOR = {retiro_parcial:"#f39c12",liquidacion_total:"#ff4757",reinversion:"#7c3aed",dividendo:"#00d4aa"};
          return (
            <>
              <div style={{display:"flex",gap:2,marginBottom:12,background:"rgba(255,255,255,.03)",borderRadius:10,padding:3,width:"fit-content"}}>
                {[{id:"aportaciones",label:`Aportaciones (${aorts.length})`},{id:"cobros",label:`Cobros/Retiros (${cobros.length})`}].map(t=>(
                  <button key={t.id} onClick={()=>setDetTab(t.id)} style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .15s",background:detTab===t.id?"linear-gradient(135deg,#00d4aa,#00a884)":"transparent",color:detTab===t.id?"#fff":"#666"}}>{t.label}</button>
                ))}
              </div>

              {detTab==="aportaciones" && (
                aorts.length===0
                  ? <Card><p style={{textAlign:"center",color:"#444",fontSize:13,padding:"16px 0",margin:0}}>Sin aportaciones registradas.</p></Card>
                  : <Card style={{padding:0,overflow:"hidden"}}>
                      {aorts.map((ap,i)=>{
                        const acc=accounts.find(a=>a.id===ap.accountId);
                        return (
                          <div key={ap.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<aorts.length-1?"1px solid rgba(255,255,255,.04)":"none"}}>
                            <div style={{width:32,height:32,borderRadius:8,background:`${color}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              <Ic n="plus" size={15} color={color}/>
                            </div>
                            <div style={{flex:1}}>
                              <p style={{fontSize:13,fontWeight:600,color:"#e0e0e0",margin:"0 0 2px"}}>{ap.notes||"Aportación"}</p>
                              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                                <span style={{fontSize:11,color:"#555"}}>{fmtDate(ap.date)}</span>
                                {acc&&<span style={{fontSize:11,color:"#444"}}>desde {acc.name}</span>}
                              </div>
                            </div>
                            <span style={{fontSize:14,fontWeight:700,color}}>{fmt(ap.amount,selected.currency)}</span>
                            <Actions onDelete={()=>delAport(ap.id)}/>
                          </div>
                        );
                      })}
                    </Card>
              )}

              {detTab==="cobros" && (
                cobros.length===0
                  ? <Card><p style={{textAlign:"center",color:"#444",fontSize:13,padding:"16px 0",margin:0}}>Sin cobros registrados. Usa "Cobro / Retiro" para registrar pagos de fondos, dividendos o liquidaciones.</p></Card>
                  : <Card style={{padding:0,overflow:"hidden"}}>
                      {cobros.map((c,i)=>{
                        const ctaDest=accounts.find(a=>a.id===c.cuentaDestinoId);
                        const tc=TIPOCOLOR[c.tipo]||"#888";
                        return (
                          <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<cobros.length-1?"1px solid rgba(255,255,255,.04)":"none"}}>
                            <div style={{width:32,height:32,borderRadius:8,background:`${tc}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              <Ic n="download" size={15} color={tc}/>
                            </div>
                            <div style={{flex:1}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                                <p style={{fontSize:13,fontWeight:600,color:"#e0e0e0",margin:0}}>{TIPOLABEL[c.tipo]||c.tipo}</p>
                                <Badge label={TIPOLABEL[c.tipo]||c.tipo} color={tc}/>
                              </div>
                              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                                <span style={{fontSize:11,color:"#555"}}>{fmtDate(c.fecha)}</span>
                                {ctaDest&&<span style={{fontSize:11,color:"#444"}}>→ {ctaDest.name}</span>}
                                {c.retencionISR>0&&<span style={{fontSize:11,color:"#f39c12"}}>ISR: -{fmt(c.retencionISR,selected.currency)}</span>}
                                {c.notas&&<span style={{fontSize:11,color:"#444"}}>{c.notas}</span>}
                              </div>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <p style={{fontSize:14,fontWeight:700,color:tc,margin:"0 0 2px"}}>+{fmt(c.montoNeto,selected.currency)}</p>
                              {c.rendRealizado!==0&&<p style={{fontSize:11,color:c.rendRealizado>=0?"#00d4aa":"#ff4757",margin:0}}>Rend: {c.rendRealizado>=0?"+":""}{fmt(c.rendRealizado,selected.currency)}</p>}
                            </div>
                            <Actions onDelete={()=>delCobro(c.id)}/>
                          </div>
                        );
                      })}
                    </Card>
              )}
            </>
          );
        })()}

        {/* Modal Cobro/Retiro */}
        {openCobro && (()=>{
          const TIPOS_COBRO = [
            {value:"retiro_parcial",   label:"Retiro parcial",       desc:"Sacas una parte, la inversión sigue"},
            {value:"liquidacion_total",label:"Liquidación total",    desc:"Cierras toda la posición"},
            {value:"reinversion",      label:"Reinversión",          desc:"Rendimientos se quedan en la inversión"},
            {value:"dividendo",        label:"Dividendo / Interés",  desc:"Pago periódico de rendimientos"},
          ];
          const montoBruto  = parseFloat(cobroForm.monto)||0;
          const retencion   = parseFloat(cobroForm.retencionISR)||0;
          const montoNeto   = montoBruto - retencion;
          const tit         = parseFloat(cobroForm.titulosVendidos)||0;
          const pventa      = parseFloat(cobroForm.precioVenta)||0;
          const montoCalc   = tit>0&&pventa>0 ? tit*pventa : 0;
          return (
            <Modal title="Registrar cobro / retiro" onClose={()=>{setOpenCobro(false);setCobroForm(blankCobro);}} width={520}>
              {/* tipo */}
              <div style={{marginBottom:14}}>
                <label style={{display:"block",marginBottom:8,fontSize:12,fontWeight:600,color:"#999",textTransform:"uppercase",letterSpacing:.4}}>Tipo de cobro *</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {TIPOS_COBRO.map(t=>(
                    <button key={t.value} onClick={()=>setCobroForm(p=>({...p,tipoCobro:t.value}))} style={{padding:"9px 11px",borderRadius:9,border:`1px solid ${cobroForm.tipoCobro===t.value?"rgba(96,165,250,.5)":"rgba(255,255,255,.08)"}`,background:cobroForm.tipoCobro===t.value?"rgba(96,165,250,.12)":"rgba(255,255,255,.03)",cursor:"pointer",textAlign:"left"}}>
                      <p style={{fontSize:12,fontWeight:700,color:cobroForm.tipoCobro===t.value?"#60a5fa":"#ccc",margin:"0 0 2px"}}>{t.label}</p>
                      <p style={{fontSize:10,color:"#555",margin:0}}>{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* títulos vendidos si aplica */}
              {(selected.titulos||0)>0 && cobroForm.tipoCobro!=="dividendo" && cobroForm.tipoCobro!=="reinversion" && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <Inp label={selected?.type==="crypto"?"Tokens a vender":"Títulos vendidos"} type="number" step="any" value={cobroForm.titulosVendidos} onChange={cc("titulosVendidos")} placeholder={`Max ${selected?.titulos}`}/>
                  <Inp label="Precio de venta" type="number" prefix="$" value={cobroForm.precioVenta} onChange={cc("precioVenta")}/>
                </div>
              )}
              {montoCalc>0 && (
                <div style={{background:"rgba(0,212,170,.06)",border:"1px solid rgba(0,212,170,.12)",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#00d4aa"}}>
                  {tit.toLocaleString("es-MX")} títulos × {fmt(pventa,selected.currency)} = {fmt(montoCalc,selected.currency)}
                  <button onClick={()=>setCobroForm(p=>({...p,monto:String(montoCalc.toFixed(2))}))} style={{marginLeft:10,background:"rgba(0,212,170,.2)",border:"none",borderRadius:5,padding:"2px 8px",color:"#00d4aa",cursor:"pointer",fontSize:11}}>Usar este monto</button>
                </div>
              )}

              <Inp label="Monto bruto recibido *" type="number" prefix="$" value={cobroForm.monto} onChange={cc("monto")} placeholder="Antes de retenciones"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <Inp label="Retención ISR (opcional)" type="number" prefix="$" value={cobroForm.retencionISR} onChange={cc("retencionISR")} placeholder="0.00"/>
                <Inp label="Fecha" type="date" value={cobroForm.fecha} onChange={cc("fecha")}/>
              </div>

              {/* preview neto */}
              {montoBruto>0 && (
                <div style={{background:"rgba(96,165,250,.06)",border:"1px solid rgba(96,165,250,.15)",borderRadius:9,padding:"10px 14px",marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                    <span style={{color:"#666"}}>Monto bruto</span><span style={{color:"#ccc",fontWeight:600}}>{fmt(montoBruto,selected.currency)}</span>
                  </div>
                  {retencion>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                    <span style={{color:"#f39c12"}}>- Retención ISR</span><span style={{color:"#f39c12",fontWeight:600}}>-{fmt(retencion,selected.currency)}</span>
                  </div>}
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:6,marginTop:4}}>
                    <span style={{color:"#888",fontWeight:700}}>Neto a cuenta</span><span style={{color:"#60a5fa",fontWeight:700}}>{fmt(montoNeto,selected.currency)}</span>
                  </div>
                </div>
              )}

              <Sel label="Depositar en cuenta" value={cobroForm.cuentaDestinoId} onChange={cc("cuentaDestinoId")}
                options={[{value:"",label:"— Sin vincular a cuenta —"},...accounts.map(a=>({value:a.id,label:`${a.name} (${fmt(a.balance||0,a.currency)})`}))]}/>
              {cobroForm.tipoCobro==="reinversion" && <p style={{fontSize:11,color:"#7c3aed",marginTop:-8,marginBottom:10}}>En reinversión, los rendimientos se quedan en la inversión — no se transfieren a ninguna cuenta.</p>}
              <Inp label="Notas" value={cobroForm.notas} onChange={cc("notas")} placeholder="Referencia, número de operación..."/>
              {cobroForm.tipoCobro!=="reinversion" && (
                <label style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:14,cursor:"pointer",background:"rgba(0,212,170,.05)",border:"1px solid rgba(0,212,170,.12)",borderRadius:9,padding:"10px 13px"}}>
                  <input type="checkbox" checked={cobroForm.registrarComoTx} onChange={e=>setCobroForm(p=>({...p,registrarComoTx:e.target.checked}))} style={{marginTop:2,accentColor:"#00d4aa",width:15,height:15,flexShrink:0}}/>
                  <div>
                    <p style={{fontSize:12,fontWeight:700,color:"#00d4aa",margin:"0 0 2px"}}>Registrar también en Transacciones</p>
                    <p style={{fontSize:11,color:"#555",margin:0}}>Genera un ingreso en el período por este cobro. Desactiva si ya lo registraste manualmente.</p>
                  </div>
                </label>
              )}
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <Btn variant="secondary" onClick={()=>{setOpenCobro(false);setCobroForm(blankCobro);}}>Cancelar</Btn>
                <Btn onClick={saveCobro} style={{background:"linear-gradient(135deg,#3b82f6,#1d4ed8)"}}><Ic n="check" size={15}/>Registrar cobro</Btn>
              </div>
            </Modal>
          );
        })()}

        {openAport && (
          <Modal title="Nueva Aportación" onClose={closeAport} width={440}>
            <Inp label="Monto invertido" type="number" value={aportForm.amount} onChange={ac("amount")} placeholder="0.00" prefix={selected.currency==="USD"?"US$":"$"} required/>
            {st.titulos > 0 && (
              <Inp label={selected?.type==="crypto"?"Tokens adquiridos (opcional)":"Títulos adquiridos (opcional)"} type="number" step="any" value={aportForm.titulos} onChange={ac("titulos")} placeholder={selected?.type==="crypto"?"Ej. 0.00347182":"Ej. 10,000"}/>
            )}
            <Inp label="Fecha" type="date" value={aportForm.date} onChange={ac("date")}/>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", marginBottom:5, fontSize:12, fontWeight:600, color:"#999", textTransform:"uppercase", letterSpacing:.4 }}>
                ¿Sale de una cuenta?
              </label>
              <Sel label="" value={aportForm.accountId} onChange={ac("accountId")}
                options={[{value:"",label:"No — solo registro manual"},...accounts.map(a=>({value:a.id,label:`${a.name} — ${fmt(a.balance,a.currency)}`}))]}/>
            </div>
            <Inp label="Notas (opcional)" value={aportForm.notes} onChange={ac("notes")} placeholder="Ej. Reinversión de rendimientos"/>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:6 }}>
              <Btn variant="secondary" onClick={closeAport}>Cancelar</Btn>
              <Btn onClick={saveAport}><Ic n="check" size={15}/>Registrar</Btn>
            </div>
          </Modal>
        )}
        {confirmModal}
      </div>
    );
  }

  const totalMXN = investments.filter(i=>i.currency==="MXN").reduce((s,i)=>{ const {valorActual}=calcInv(i); return s+valorActual; },0);
  const totalUSD = investments.filter(i=>i.currency==="USD").reduce((s,i)=>{ const {valorActual}=calcInv(i); return s+valorActual; },0);

  return (
    <div>
      {investments.filter(i=>i.status!=="closed").length>1&&(
        <div style={{marginBottom:16}}>
          <PortafolioChart investments={investments} tc={getTc(user.id)}/>
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontSize:21, fontWeight:700, color:"#f0f0f0", marginBottom:3 }}>Inversiones</h2>
          <p style={{ fontSize:13, color:"#555" }}>{investments.length} inversión{investments.length!==1?"es":""}</p>
        </div>
        <Btn onClick={openNew}><Ic n="plus" size={16}/>Nueva Inversión</Btn>
      </div>

      {investments.length>0 && (()=>{
        const invActivas = investments.filter(i=>i.estado!=="liquidada");
        const totalAportado = invActivas.reduce((s,i)=>{
          const st=calcInv(i);
          const base=st.costoTitulos>0?st.costoTitulos:st.totalInvertido;
          return s+(i.currency==="USD"?base*TC:base);
        },0);
        const totalValor = invActivas.reduce((s,i)=>{
          const st=calcInv(i);
          return s+(i.currency==="USD"?st.valorActual*TC:st.valorActual);
        },0);
        const rendTotal = totalValor - totalAportado;
        const rendPctTotal = totalAportado>0?(rendTotal/totalAportado)*100:0;
        const rendColor = rendTotal>=0?"#00d4aa":"#ff4757";
        // Rendimiento proyectado anual — solo inversiones con tasaAnual
        const invConTasa = invActivas.filter(i=>parseFloat(i.tasaAnual)>0);
        const rendProyAnual = invConTasa.reduce((s,i)=>{
          const st=calcInv(i);
          const base = st.costoTitulos>0?st.costoTitulos:st.totalInvertido;
          const rend = base * (parseFloat(i.tasaAnual)/100);
          return s+(i.currency==="USD"?rend*TC:rend);
        },0);
        return (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10, marginBottom:18 }}>
            <Card style={{ borderColor:"rgba(0,212,170,.2)" }}>
              <p style={{ fontSize:11, color:"#666", textTransform:"uppercase", letterSpacing:.4, margin:"0 0 4px" }}>Portafolio total</p>
              <p style={{ fontSize:20, fontWeight:700, color:"#00d4aa", margin:0 }}>{fmt(totalMXN,"MXN")}</p>
              {totalUSD>0&&<p style={{fontSize:11,color:"#0078ff",margin:"2px 0 0"}}>+ {fmt(totalUSD,"USD")}</p>}
            </Card>
            <Card style={{ borderColor:"rgba(59,130,246,.2)" }}>
              <p style={{ fontSize:11, color:"#666", textTransform:"uppercase", letterSpacing:.4, margin:"0 0 4px" }}>Capital activo invertido</p>
              <p style={{ fontSize:20, fontWeight:700, color:"#3b82f6", margin:0 }}>{fmt(totalAportado,"MXN")}</p>
              {(()=>{
                const capHistorico = investments.reduce((s,i)=>{
                  const st=calcInv(i);
                  const base=st.costoTitulos>0?st.costoTitulos:st.totalInvertido;
                  return s+(i.currency==="USD"?base*TC:base);
                },0);
                const capLiquidadas = capHistorico - totalAportado;
                return capLiquidadas > 0 ? (
                  <p style={{fontSize:10,color:"#555",margin:"3px 0 0"}}>
                    + {fmt(capLiquidadas)} en liquidadas = <strong style={{color:"#888"}}>{fmt(capHistorico)} histórico</strong>
                  </p>
                ) : (
                  <p style={{fontSize:10,color:"#555",margin:"3px 0 0"}}>Solo inversiones activas</p>
                );
              })()}
            </Card>
            <Card style={{ borderColor:`${rendColor}33` }}>
              <p style={{ fontSize:11, color:"#666", textTransform:"uppercase", letterSpacing:.4, margin:"0 0 4px" }}>Rendimiento real neto</p>
              <p style={{ fontSize:20, fontWeight:700, color:rendColor, margin:0 }}>{rendTotal>=0?"+":""}{fmt(rendTotal,"MXN")}</p>
              <p style={{fontSize:11,color:rendColor,margin:"2px 0 0",fontWeight:600}}>{rendPctTotal>=0?"+":""}{rendPctTotal.toFixed(2)}%</p>
            </Card>
            {rendProyAnual>0&&(
              <Card style={{ borderColor:"rgba(243,156,18,.25)", background:"rgba(243,156,18,.03)" }}>
                <p style={{ fontSize:11, color:"#f39c12", textTransform:"uppercase", letterSpacing:.4, margin:"0 0 4px" }}>⚡ Rend. proyectado / año</p>
                <p style={{ fontSize:20, fontWeight:700, color:"#f39c12", margin:0 }}>+{fmt(rendProyAnual,"MXN")}</p>
                <p style={{fontSize:10,color:"#666",margin:"2px 0 0"}}>{invConTasa.length} inversión{invConTasa.length!==1?"es":""} con tasa · estimado</p>
              </Card>
            )}
            <Card>
              <p style={{ fontSize:11, color:"#666", textTransform:"uppercase", letterSpacing:.4, margin:"0 0 4px" }}>Activas</p>
              <p style={{ fontSize:20, fontWeight:700, color:"#ccc", margin:0 }}>{invActivas.length}</p>
              {investments.filter(i=>i.estado==="liquidada").length>0&&<p style={{fontSize:11,color:"#444",margin:"2px 0 0"}}>{investments.filter(i=>i.estado==="liquidada").length} liquidada{investments.filter(i=>i.estado==="liquidada").length!==1?"s":""}</p>}
            </Card>
          </div>
        );
      })()}

      {investments.length===0 ? (
        <div style={{ textAlign:"center", padding:"50px 0", color:"#444" }}>
          <Ic n="investments" size={44} color="#333"/>
          <div style={{fontSize:44,marginBottom:8}}>📈</div>
          <p style={{fontSize:16,fontWeight:700,color:"#e0e0e0",margin:"0 0 8px"}}>Sin inversiones registradas</p>
          <p style={{fontSize:13,color:"#555",margin:"0 0 12px",lineHeight:1.5,maxWidth:340,marginLeft:"auto",marginRight:"auto"}}>
            Registra tus fondos inmobiliarios, acciones, CETES, criptomonedas o cualquier otro instrumento. Verás el rendimiento real vs proyectado.
          </p>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:14}}>
            {["🏢 Fondos inmobiliarios","📊 Acciones/ETFs","🏛️ CETES/Bonos","₿ Crypto"].map(t=>(
              <span key={t} style={{fontSize:11,padding:"4px 10px",borderRadius:20,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"#666"}}>{t}</span>
            ))}
          </div>
          <Btn onClick={openNew} style={{ marginTop:0 }}><Ic n="plus" size={16}/>Registrar primera inversión</Btn>
        </div>
      ) : (() => {
        // ── Agrupar por tipo
        const fondos    = investments.filter(i=>["fund_real_estate","fund_general"].includes(i.type)&&i.estado!=="liquidada");
        const acciones  = investments.filter(i=>i.type==="stocks_etf"&&i.estado!=="liquidada");
        const cripto    = investments.filter(i=>i.type==="crypto"&&i.estado!=="liquidada");
        const otras     = investments.filter(i=>["bonds","other"].includes(i.type)&&i.estado!=="liquidada");
        const liquidadas= investments.filter(i=>i.estado==="liquidada");

        const SeccionHeader = ({emoji, titulo, total, moneda="MXN", open, onToggle, count, color="#00d4aa"}) => (
          <div onClick={onToggle} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,.03)",
            border:"1px solid rgba(255,255,255,.07)",cursor:"pointer",marginBottom:open?10:0,
            transition:"all .15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.05)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>{emoji}</span>
              <div>
                <p style={{fontSize:13,fontWeight:700,color:"#e0e0e0",margin:0}}>{titulo}</p>
                <p style={{fontSize:10,color:"#555",margin:0}}>{count} posición{count!==1?"es":""}</p>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <p style={{fontSize:15,fontWeight:800,color,margin:0,fontVariantNumeric:"tabular-nums"}}>{fmt(total,moneda)}</p>
              <span style={{fontSize:12,color:"#555",transform:open?"rotate(180deg)":"none",transition:"transform .2s"}}>▾</span>
            </div>
          </div>
        );

        // Card grande para fondos privados y acciones
        const CardGrande = ({inv}) => {
          const st=calcInv(inv);
          const color=typeColors[inv.type]||"#888";
          const rendColor=st.rendimiento>=0?"#00d4aa":"#ff4757";
          const base=st.costoTitulos>0?st.costoTitulos:st.totalInvertido;
          return (
            <Card onClick={()=>{setSelected(inv);setView("detail");setDetTab("aportaciones");}}
              style={{cursor:"pointer",borderColor:st.rendimiento>=0?"rgba(0,212,170,.15)":"rgba(255,71,87,.1)",
                transition:"border-color .15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=color}
              onMouseLeave={e=>e.currentTarget.style.borderColor=st.rendimiento>=0?"rgba(0,212,170,.15)":"rgba(255,71,87,.1)"}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                  <div style={{width:38,height:38,borderRadius:10,background:`${color}18`,border:`1px solid ${color}33`,
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Ic n="investments" size={18} color={color}/>
                  </div>
                  <div style={{minWidth:0}}>
                    <p style={{fontSize:14,fontWeight:700,color:"#f0f0f0",margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inv.name}</p>
                    <p style={{fontSize:11,color:"#555",margin:0}}>{inv.platform||""}{inv.tasaAnual?` · ${inv.tasaAnual}% anual`:""}</p>
                  </div>
                </div>
                <Actions onEdit={e=>openEdit(inv,e)} onDelete={e=>delInv(inv,e)}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div>
                  <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 2px"}}>Valor proyectado</p>
                  <p style={{fontSize:16,fontWeight:800,color,margin:0,fontVariantNumeric:"tabular-nums"}}>{fmt(st.valorActual,inv.currency)}</p>
                </div>
                <div>
                  <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 2px"}}>Capital invertido</p>
                  <p style={{fontSize:13,fontWeight:700,color:"#888",margin:0,fontVariantNumeric:"tabular-nums"}}>{fmt(base,inv.currency)}</p>
                </div>
                <div>
                  <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 2px"}}>Rendimiento</p>
                  <p style={{fontSize:13,fontWeight:700,color:rendColor,margin:0,fontVariantNumeric:"tabular-nums"}}>
                    {st.rendimiento>=0?"+":""}{fmt(st.rendimiento,inv.currency)}
                    <span style={{fontSize:10,marginLeft:4}}>({st.rendPct>=0?"+":""}{st.rendPct.toFixed(1)}%)</span>
                  </p>
                </div>
              </div>
              {inv.titulos>0&&inv.precioActual>0&&(
                <div style={{marginTop:10,padding:"6px 10px",background:"rgba(255,255,255,.03)",borderRadius:7,
                  display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#555"}}>{inv.titulos} títulos × {fmt(parseFloat(inv.precioActual),inv.currency)}</span>
                  <span style={{fontSize:10,color:"#444"}}>{st.diasActiva}d activa</span>
                </div>
              )}
            </Card>
          );
        };

        // Tabla compacta para cripto
        const TablaCripto = ({items}) => {
          // Separar por moneda y calcular totales correctos
          const totalMXN = items.filter(i=>i.currency==="MXN").reduce((s,i)=>s+calcInv(i).valorActual,0);
          const totalUSD = items.filter(i=>i.currency==="USD").reduce((s,i)=>s+calcInv(i).valorActual,0);
          const totalEnMXN = totalMXN + totalUSD*TC; // todo convertido a MXN
          const hayMixto = totalMXN > 0 && totalUSD > 0;
          return (
            <Card style={{padding:0,overflow:"hidden"}}>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                      {["Moneda","Plataforma","Tokens","Precio","Valor","P&L",""].map(h=>(
                        <th key={h} style={{padding:"8px 14px",textAlign:"right",fontSize:9,fontWeight:700,
                          color:"#555",textTransform:"uppercase",letterSpacing:.4}}
                          align={h===""||h==="Moneda"||h==="Plataforma"?"left":"right"}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((inv,i)=>{
                      const st=calcInv(inv);
                      const rendColor=st.rendimiento>=0?"#00d4aa":"#ff4757";
                      const esMXN = inv.currency==="MXN";
                      const precioPrefix = esMXN?"$":"$";
                      const precioSuffix = esMXN?" MXN":" USD";
                      return (
                        <tr key={inv.id} style={{borderBottom:"1px solid rgba(255,255,255,.03)",
                          background:i%2===0?"transparent":"rgba(255,255,255,.01)",cursor:"pointer"}}
                          onClick={()=>{setSelected(inv);setView("detail");setDetTab("aportaciones");}}>
                          <td style={{padding:"9px 14px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div style={{width:26,height:26,borderRadius:7,background:"rgba(247,147,26,.12)",
                                border:"1px solid rgba(247,147,26,.2)",display:"flex",alignItems:"center",
                                justifyContent:"center",fontSize:11,fontWeight:800,color:"#f7931a",flexShrink:0}}>
                                {inv.ticker?.slice(0,3)||"?"}
                              </div>
                              <div>
                                <p style={{fontSize:12,fontWeight:700,color:"#e0e0e0",margin:0}}>{inv.name}</p>
                                <div style={{display:"flex",alignItems:"center",gap:4}}>
                                  <p style={{fontSize:10,color:"#555",margin:0}}>{inv.ticker}</p>
                                  {/* Badge de moneda — importante para cripto en MXN */}
                                  <span style={{fontSize:8,fontWeight:700,color:esMXN?"#00d4aa":"#3b82f6",
                                    background:esMXN?"rgba(0,212,170,.1)":"rgba(59,130,246,.1)",
                                    borderRadius:4,padding:"1px 4px"}}>{inv.currency}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{padding:"9px 14px",color:"#666",fontSize:11}}>{inv.platform||"—"}</td>
                          <td style={{padding:"9px 14px",textAlign:"right",color:"#888",fontVariantNumeric:"tabular-nums",fontSize:11}}>
                            {parseFloat(inv.titulos||0).toLocaleString("en",{maximumFractionDigits:4})}
                          </td>
                          <td style={{padding:"9px 14px",textAlign:"right",color:"#888",fontVariantNumeric:"tabular-nums",fontSize:11}}>
                            {parseFloat(inv.precioActual||0).toLocaleString("en",{maximumFractionDigits:6})}
                            <span style={{fontSize:9,color:"#555",marginLeft:2}}>{inv.currency}</span>
                          </td>
                          <td style={{padding:"9px 14px",textAlign:"right",fontWeight:700,color:"#f7931a",fontVariantNumeric:"tabular-nums"}}>
                            {fmt(st.valorActual,inv.currency)}
                            {/* Si es MXN, mostrar equivalente en USD para comparar */}
                            {esMXN&&TC>0&&<span style={{display:"block",fontSize:9,color:"#555",fontWeight:400}}>≈ {fmt(st.valorActual/TC,"USD")}</span>}
                          </td>
                          <td style={{padding:"9px 14px",textAlign:"right",fontWeight:600,color:rendColor,fontVariantNumeric:"tabular-nums",fontSize:11}}>
                            {st.rendimiento>=0?"+":""}{fmt(st.rendimiento,inv.currency)}
                            <span style={{display:"block",fontSize:9,opacity:.7}}>{st.rendPct>=0?"+":""}{st.rendPct.toFixed(1)}%</span>
                          </td>
                          <td style={{padding:"9px 10px"}} onClick={e=>e.stopPropagation()}>
                            <Actions onEdit={e=>openEdit(inv,e)} onDelete={e=>delInv(inv,e)}/>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{borderTop:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.02)"}}>
                      <td colSpan={4} style={{padding:"8px 14px",fontSize:10,color:"#555",fontWeight:700}}>TOTAL CRIPTO</td>
                      <td style={{padding:"8px 14px",textAlign:"right",fontVariantNumeric:"tabular-nums"}}>
                        <p style={{fontSize:13,fontWeight:800,color:"#f7931a",margin:0}}>{fmt(totalEnMXN,"MXN")}</p>
                        {hayMixto&&(
                          <p style={{fontSize:9,color:"#555",margin:"2px 0 0"}}>
                            {fmt(totalMXN,"MXN")} + {fmt(totalUSD,"USD")} × TC
                          </p>
                        )}
                        {!hayMixto&&totalUSD>0&&<p style={{fontSize:9,color:"#555",margin:"2px 0 0"}}>{fmt(totalUSD,"USD")}</p>}
                      </td>
                      <td colSpan={2}/>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          );
        };

        return (
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {/* ── FONDOS PRIVADOS */}
            {fondos.length>0&&(
              <div>
                <SeccionHeader emoji="🏢" titulo="Fondos privados"
                  total={fondos.reduce((s,i)=>{const st=calcInv(i);return s+(i.currency==="USD"?st.valorActual*TC:st.valorActual);},0)}
                  color="#f39c12" open={true} onToggle={()=>{}} count={fondos.length}/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
                  {fondos.map(inv=><CardGrande key={inv.id} inv={inv}/>)}
                </div>
              </div>
            )}

            {/* ── ACCIONES */}
            {acciones.length>0&&(
              <div>
                <SeccionHeader emoji="📈" titulo="Acciones / ETFs"
                  total={acciones.reduce((s,i)=>{const st=calcInv(i);return s+(i.currency==="USD"?st.valorActual*TC:st.valorActual);},0)}
                  color="#00d4aa" open={true} onToggle={()=>{}} count={acciones.length}/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
                  {acciones.map(inv=><CardGrande key={inv.id} inv={inv}/>)}
                </div>
              </div>
            )}

            {/* ── CRIPTO — tabla compacta */}
            {cripto.length>0&&(
              <div>
                <SeccionHeader emoji="🪙" titulo="Criptomonedas"
                  total={cripto.reduce((s,i)=>{const st=calcInv(i);return s+(i.currency==="USD"?st.valorActual*TC:st.valorActual);},0)}
                  color="#f7931a" open={true} onToggle={()=>{}} count={cripto.length}/>
                <TablaCripto items={cripto}/>
              </div>
            )}

            {/* ── OTRAS */}
            {otras.length>0&&(
              <div>
                <SeccionHeader emoji="💼" titulo="Otros instrumentos"
                  total={otras.reduce((s,i)=>{const st=calcInv(i);return s+(i.currency==="USD"?st.valorActual*TC:st.valorActual);},0)}
                  color="#9b59b6" open={true} onToggle={()=>{}} count={otras.length}/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
                  {otras.map(inv=><CardGrande key={inv.id} inv={inv}/>)}
                </div>
              </div>
            )}

            {/* ── LIQUIDADAS — colapsadas */}
            {liquidadas.length>0&&(
              <div>
                  <SeccionHeader emoji="✅" titulo="Liquidadas"
                    total={liquidadas.reduce((s,i)=>{const st=calcInv(i);return s+(i.currency==="USD"?st.valorActual*TC:st.valorActual);},0)}
                    color="#64748b" open={openLiq} onToggle={()=>setOpenLiq(p=>!p)} count={liquidadas.length}/>
                  {openLiq&&(
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
                      {liquidadas.map(inv=>{
                        const st=calcInv(inv);
                        return (
                          <Card key={inv.id} onClick={()=>{setSelected(inv);setView("detail");setDetTab("aportaciones");}}
                            style={{cursor:"pointer",opacity:.7,borderColor:"rgba(100,116,139,.25)"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <div>
                                <p style={{fontSize:13,fontWeight:700,color:"#94a3b8",margin:"0 0 2px"}}>{inv.name}</p>
                                <p style={{fontSize:10,color:"#555",margin:0}}>{inv.platform||""} · LIQUIDADA</p>
                              </div>
                              <div style={{textAlign:"right"}}>
                                <p style={{fontSize:13,fontWeight:700,color:"#64748b",margin:0}}>{fmt(st.totalCobrado||0,inv.currency)}</p>
                                <p style={{fontSize:10,color:"#555",margin:0}}>cobrado total</p>
                              </div>
                            </div>
                            <div style={{marginTop:8}} onClick={e=>e.stopPropagation()}>
                              <Actions onEdit={e=>openEdit(inv,e)} onDelete={e=>delInv(inv,e)}/>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
              </div>
            )}
          </div>
        );
      })()}

      {openInv && (
        <Modal title={editing?"Editar Inversión":"Nueva Inversión"} onClose={closeInv} width={540}>
          <Inp label="Nombre" value={invForm.name} onChange={ic("name")} placeholder="Ej. ACTIGOB B / AMZN / FIBRA UNO" required/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Sel label="Tipo" value={invForm.type} onChange={ic("type")} options={typeOpts}/>
            <Sel label="Moneda" value={invForm.currency} onChange={ic("currency")} options={[{value:"MXN",label:"🇲🇽 MXN"},{value:"USD",label:"🇺🇸 USD"}]}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Inp label="Plataforma" value={invForm.platform} onChange={ic("platform")} placeholder="Actinver, Binance, GBM..."/>
            <Inp label="Ticker / Clave" value={invForm.ticker} onChange={ic("ticker")} placeholder="ACTIGOB B, AMZN, BTC..."/>
          </div>
          <Inp label={<>Tasa de rendimiento anual estimada (opcional)<HelpTip text="Si la inversión no tiene precio de mercado (fondos privados, bienes raíces, etc.), esta tasa se usa para calcular el VALOR ACTUAL PROYECTADO: capital + rendimiento acumulado desde la fecha de inicio. Para inversiones con precio de mercado, es solo referencia."/></>} type="number" value={invForm.tasaAnual} onChange={ic("tasaAnual")} placeholder="Ej. 10.5" suffix="% anual"/>
          {invForm.tasaAnual && !invForm.precioActual && !invForm.currentValue && (
            <div style={{padding:"8px 12px",background:"rgba(0,212,170,.06)",border:"1px solid rgba(0,212,170,.2)",borderRadius:8,marginTop:-10,marginBottom:14,fontSize:11,color:"#00d4aa"}}>
              ✓ Sin precio de mercado — el valor actual se calculará como capital + rendimiento acumulado al {(parseFloat(invForm.tasaAnual)||0).toFixed(2)}% anual
            </div>
          )}

          {!editing && (
            <div style={{ background:"rgba(0,212,170,.06)", border:"1px solid rgba(0,212,170,.15)", borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
              <p style={{ fontSize:12, color:"#00d4aa", margin:"0 0 8px", fontWeight:600 }}>💰 Capital inicial invertido</p>
              <Inp label="¿Cuánto invertiste?" type="number" value={invForm.capitalInicial} onChange={ic("capitalInicial")} placeholder="0.00" prefix={invForm.currency==="USD"?"US$":"$"}/>
              {accounts.length>0 && (
                <Sel label="¿Salió de una cuenta? (opcional)" value={invForm.accountId} onChange={ic("accountId")}
                  options={[{value:"",label:"No / ya estaba activa"},...accounts.map(a=>({value:a.id,label:`${a.name} — ${fmt(a.balance,a.currency)}`}))]}/>
              )}
            </div>
          )}

          {/* ── sección dinámica según tipo */}
          {invForm.type==="crypto" ? (
            <div style={{ background:"rgba(247,147,26,.06)", border:"1px solid rgba(247,147,26,.2)", borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
              <p style={{ fontSize:12, color:"#f7931a", margin:"0 0 10px", fontWeight:700, textTransform:"uppercase", letterSpacing:.4 }}>₿ Tokens / Criptomonedas</p>

              {/* toggle modo captura */}
              <div style={{ display:"flex", gap:4, marginBottom:12, background:"rgba(0,0,0,.2)", borderRadius:8, padding:3 }}>
                {[{v:"tokens",l:"Por tokens + precio"},{v:"valor",l:"Por valor total"}].map(opt=>(
                  <button key={opt.v} type="button" onClick={()=>setInvForm(p=>({...p,_cryptoMode:opt.v,titulos:opt.v==="valor"?"":p.titulos,precioCosto:opt.v==="valor"?"":p.precioCosto,precioActual:opt.v==="valor"?"":p.precioActual}))}
                    style={{ flex:1, padding:"6px 0", borderRadius:6, border:"none", cursor:"pointer", fontSize:11, fontWeight:700,
                      background:(invForm._cryptoMode||"tokens")===opt.v?"rgba(247,147,26,.25)":"transparent",
                      color:(invForm._cryptoMode||"tokens")===opt.v?"#f7931a":"#555" }}>
                    {opt.l}
                  </button>
                ))}
              </div>

              {(()=>{
                const TC_form = getTc(user.id);
                const tok  = parseFloat(invForm.titulos)||0;
                const valUSD = parseFloat(invForm._valUSD)||0;
                const valMXN = parseFloat(invForm._valMXN)||0;
                // helpers para recalcular cuando el usuario escribe
                // Guarda el string RAW para no destruir "1.0", "0.00", etc.
                // Solo parsea para los cálculos derivados
                const recalcFromUSD = (rawUSD, tokens) => {
                  const usd = parseFloat(rawUSD)||0;
                  const mxnCalc = usd>0 ? (usd * TC_form).toFixed(2) : "";
                  const precio  = tokens>0 && usd>0 ? (usd/tokens).toFixed(8) : "";
                  setInvForm(p=>({...p,
                    _valUSD: rawUSD,
                    _valMXN: mxnCalc,
                    currentValue: p.currency==="USD" ? rawUSD : mxnCalc,
                    precioActual: precio || p.precioActual,
                  }));
                };
                const recalcFromMXN = (rawMXN, tokens) => {
                  const mxn = parseFloat(rawMXN)||0;
                  const usdCalc = mxn>0 ? (mxn / TC_form).toFixed(2) : "";
                  const precio  = tokens>0 && mxn>0 ? (mxn/tokens).toFixed(8) : "";
                  setInvForm(p=>({...p,
                    _valMXN: rawMXN,
                    _valUSD: usdCalc,
                    currentValue: p.currency==="MXN" ? rawMXN : usdCalc,
                    precioActual: precio || p.precioActual,
                  }));
                };
                const recalcFromTokens = (rawTok) => {
                  const tokens = parseFloat(rawTok)||0;
                  if(valUSD>0) recalcFromUSD(invForm._valUSD, tokens);
                  else if(valMXN>0) recalcFromMXN(invForm._valMXN, tokens);
                  setInvForm(p=>({...p, titulos:rawTok}));
                };
                return (
                  <>
                    {/* fila 1: tokens */}
                    <Inp label="Cantidad de tokens" type="number" step="any" value={invForm.titulos}
                      onChange={e=>recalcFromTokens(e.target.value)}
                      placeholder="Ej. 234.614"/>

                    {/* fila 2: valor en USD + valor en MXN — siempre ambos */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:10 }}>
                      <div>
                        <Inp label="Valor total en USD (Binance)" type="number" step="any" value={invForm._valUSD||""}
                          onChange={e=>recalcFromUSD(e.target.value, tok)}
                          placeholder="Ej. 321"/>
                      </div>
                      <div>
                        <Inp label="Valor total en MXN (Bitso)" type="number" step="any" value={invForm._valMXN||""}
                          onChange={e=>recalcFromMXN(e.target.value, tok)}
                          placeholder="Ej. 5,635"/>
                      </div>
                    </div>
                    <p style={{ fontSize:9, color:"#666", margin:"4px 0 8px" }}>
                      Llena USD o MXN — el otro se convierte automático (TC: ${TC_form.toFixed(2)})
                    </p>

                    {/* precio por token — calculado automático */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:10, alignItems:"flex-end" }}>
                      <div>
                        <Inp label={`Precio actual / token (${invForm.currency}) — calculado automático`} type="number" step="any"
                          value={invForm.precioActual} onChange={ic("precioActual")} placeholder="Se calcula con tokens + valor"/>
                        {tok>0 && invForm.precioActual && (invForm._valUSD||invForm._valMXN) && (
                          <p style={{ fontSize:9, color:"#f7931a", margin:"3px 0 0" }}>
                            {tok.toLocaleString("es-MX",{maximumFractionDigits:8})} tok × {parseFloat(invForm.precioActual).toLocaleString("es-MX",{maximumFractionDigits:6})} {invForm.currency} = {invForm.currency==="USD"?"US$":"$"}{(tok*parseFloat(invForm.precioActual)).toLocaleString("es-MX",{maximumFractionDigits:2})} ✓
                          </p>
                        )}
                      </div>
                      <button type="button" onClick={async()=>{
                        const cid = invForm.coingeckoId||invForm.ticker?.toLowerCase().trim();
                        if(!cid){alert("Pon el Ticker o CoinGecko ID primero (ej. ripple, bitcoin, ethereum)");return;}
                        try{
                          const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(cid)}&vs_currencies=usd,mxn`);
                          const d = await r.json();
                          const pUSD = d[cid]?.usd;
                          const pMXN = d[cid]?.mxn;
                          if(pUSD && pMXN){
                            const tokens = parseFloat(invForm.titulos)||0;
                            setInvForm(p=>({...p,
                              precioActual: invForm.currency==="USD" ? pUSD.toString() : pMXN.toString(),
                              _valUSD: tokens>0 ? (tokens*pUSD).toFixed(2) : p._valUSD,
                              _valMXN: tokens>0 ? (tokens*pMXN).toFixed(2) : p._valMXN,
                              currentValue: tokens>0 ? (invForm.currency==="USD"?(tokens*pUSD):(tokens*pMXN)).toFixed(2) : p.currentValue,
                            }));
                          } else { alert(`No encontré "${cid}" en CoinGecko. Prueba: ripple, bitcoin, ethereum, solana…`); }
                        }catch(err){ alert("Error al consultar CoinGecko. Verifica tu conexión."); }
                      }} style={{ padding:"8px 12px", background:"rgba(247,147,26,.15)", border:"1px solid rgba(247,147,26,.35)", borderRadius:8, color:"#f7931a", cursor:"pointer", fontSize:12, fontWeight:700, whiteSpace:"nowrap", height:38 }}>
                        ⚡ Precio actual
                      </button>
                    </div>

                    {/* precio de compra */}
                    <div style={{ marginTop:10 }}>
                      <Inp label={`Precio compra / token (${invForm.currency}) — para calcular ganancia`} type="number" step="any" value={invForm.precioCosto} onChange={ic("precioCosto")} placeholder="Ej. 1.20"/>
                    </div>
                  </>
                );
              })()}

              <div style={{ marginTop:10 }}>
                <Inp label="CoinGecko ID (para botón de precio)" value={invForm.coingeckoId} onChange={ic("coingeckoId")} placeholder="bitcoin, ethereum, solana, binancecoin…"/>
                <p style={{ fontSize:10, color:"#555", margin:"4px 0 0" }}>Busca el ID exacto en coingecko.com si el ticker no funciona automáticamente.</p>
              </div>
            </div>
          ) : (
            <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
              <p style={{ fontSize:12, color:"#777", margin:"0 0 10px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }}>Títulos / Precio</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                <Inp label="Núm. títulos" type="number" value={invForm.titulos} onChange={ic("titulos")} placeholder="138,236"/>
                <Inp label="Costo / título" type="number" value={invForm.precioCosto} onChange={ic("precioCosto")} placeholder="6.830"/>
                <Inp label="Precio actual / título" type="number" value={invForm.precioActual} onChange={ic("precioActual")} placeholder="6.853"/>
              </div>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Inp label="Fecha de inicio" type="date" value={invForm.startDate} onChange={ic("startDate")}/>
            <Inp label="Vencimiento (opcional)" type="date" value={invForm.endDate} onChange={ic("endDate")}/>
          </div>
          <Inp label="Notas (opcional)" value={invForm.notes} onChange={ic("notes")} placeholder="Estrategia, condiciones..."/>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:6 }}>
            <Btn variant="secondary" onClick={closeInv}>Cancelar</Btn>
            <Btn onClick={saveInv}><Ic n="check" size={15}/>{editing?"Guardar":"Registrar"}</Btn>
          </div>
        </Modal>
      )}
      {confirmModal}
    </div>
  );
};

// ─── ESTADOS FINANCIEROS ──────────────────────────────────────────────────────
const Reports = ({ initialTab="balance" }) => {
  const { user, toast } = useCtx();
  const [transactions] = useData(user.id, "transactions");
  const [accounts]     = useData(user.id, "accounts");
  const [loans]        = useData(user.id, "loans");
  const [investments]  = useData(user.id, "investments");
  const [mortgages]    = useData(user.id, "mortgages");
  const [transfers]    = useData(user.id, "transfers");
  const [config]       = useData(user.id, "config", {});
  const [tab, setTab]  = useState(initialTab);
  const [periodo, setPeriodo] = useState("mes");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // ── rango de fechas según período seleccionado
  const getRango = () => {
    const hoy = new Date();
    if (periodo === "mes") {
      const d = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      return { desde: d.toISOString().split("T")[0], hasta: today() };
    }
    if (periodo === "trimestre") {
      const d = new Date(hoy); d.setMonth(d.getMonth() - 3);
      return { desde: d.toISOString().split("T")[0], hasta: today() };
    }
    if (periodo === "anio") {
      return { desde: `${hoy.getFullYear()}-01-01`, hasta: today() };
    }
    if (periodo === "personalizado") {
      return { desde: fechaDesde, hasta: fechaHasta };
    }
    return { desde: "", hasta: today() };
  };
  const rango = getRango();

  const txsRango = transactions.filter(t => {
    if (rango.desde && t.date < rango.desde) return false;
    if (rango.hasta && t.date > rango.hasta) return false;
    return true;
  });

  // ── helpers de cálculo
  const TC = getTc(user.id);

  const calcLoanBalance = (loan) => {
    const dr = (parseFloat(loan.rate)||0)/100/(loan.rateType==="annual"?365:30);
    let bal = parseFloat(loan.principal||0);
    let last = new Date(loan.startDate+"T12:00:00");
    for (const p of [...(loan.payments||[])].sort((a,b)=>new Date(a.date)-new Date(b.date))) {
      const days = Math.max(0, Math.floor((new Date(p.date+"T12:00:00")-last)/86400000));
      bal = Math.max(0, bal - (p.amount - Math.min(p.amount, bal*dr*days)));
      last = new Date(p.date+"T12:00:00");
    }
    return bal;
  };

  const calcInvValue = (inv) => {
    const t=parseFloat(inv.titulos)||0, p=parseFloat(inv.precioActual)||0;
    const ap=(inv.aportaciones||[]).reduce((s,a)=>s+parseFloat(a.amount||0),0);
    const val = t>0&&p>0 ? t*p : parseFloat(inv.currentValue)||ap;
    return inv.currency==="USD" ? val*TC : val;
  };

  const calcMortgageBalance = (m) => {
    const P=parseFloat(m.monto)||0, n=(parseFloat(m.plazoAnios)||0)*12;
    const r=(parseFloat(m.tasaAnual)||0)/100/12;
    if (!P||!n||!r) return P;
    const cuota = m.tipo==="fijo" ? (P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1) : P/n;
    let saldo = P;
    const pagados = (m.pagosRealizados||[]).length;
    for (let i=0;i<pagados;i++) {
      const int = saldo*r;
      const cap = m.tipo==="fijo" ? cuota-int : P/n;
      saldo = Math.max(saldo-cap, 0);
    }
    return saldo;
  };

  // ══════════════════════════════════════════════════
  // BALANCE GENERAL
  // ══════════════════════════════════════════════════
  const buildBalance = () => {
    // ACTIVOS
    const cuentasLiquidez = accounts.filter(a=>a.type!=="credit");
    const totalLiquidezMXN = cuentasLiquidez.filter(a=>a.currency==="MXN").reduce((s,a)=>s+parseFloat(a.balance||0),0);
    const totalLiquidezUSD = cuentasLiquidez.filter(a=>a.currency==="USD").reduce((s,a)=>s+parseFloat(a.balance||0),0);
    const totalLiquidez = totalLiquidezMXN + totalLiquidezUSD*TC;

    const invActivas = investments.filter(i=>i.estado!=="liquidada");
    const totalInversiones = invActivas.reduce((s,i)=>s+calcInvValue(i), 0);

    const prestamosXCobrar = loans.filter(l=>l.type==="given");
    const totalPXC = prestamosXCobrar.reduce((s,l)=>s+calcLoanBalance(l), 0);

    const totalActivos = totalLiquidez + totalInversiones + totalPXC;

    // PASIVOS
    const tarjetas = accounts.filter(a=>a.type==="credit");
    const totalTarjetas = tarjetas.reduce((s,a)=>s+Math.abs(Math.min(parseFloat(a.balance||0),0)),0);

    const prestamosXPagar = loans.filter(l=>l.type==="received");
    const totalPXP = prestamosXPagar.reduce((s,l)=>s+calcLoanBalance(l), 0);

    const totalHipotecas = mortgages.reduce((s,m)=>s+calcMortgageBalance(m), 0);

    const totalPasivos = totalTarjetas + totalPXP + totalHipotecas;
    const patrimonioNeto = totalActivos - totalPasivos;

    return {
      activos: {
        liquidez: { total: totalLiquidez, items: [
          ...cuentasLiquidez.filter(a=>a.currency==="MXN").map(a=>({ nombre:a.name, valor:parseFloat(a.balance||0), tipo:"Cuenta MXN" })),
          ...cuentasLiquidez.filter(a=>a.currency==="USD").map(a=>({ nombre:a.name, valor:parseFloat(a.balance||0)*TC, tipo:`Cuenta USD (×${TC})` })),
        ]},
        inversiones: { total: totalInversiones, items: invActivas.map(i=>({ nombre:i.name, valor:calcInvValue(i), tipo:i.type })) },
        cuentasCobrar: { total: totalPXC, items: prestamosXCobrar.map(l=>({ nombre:l.name, valor:calcLoanBalance(l), tipo:"Préstamo por cobrar" })) },
        total: totalActivos,
      },
      pasivos: {
        tarjetas: { total: totalTarjetas, items: tarjetas.map(a=>({ nombre:a.name, valor:Math.abs(Math.min(parseFloat(a.balance||0),0)), tipo:"Tarjeta de crédito" })) },
        prestamos: { total: totalPXP, items: prestamosXPagar.map(l=>({ nombre:l.name, valor:calcLoanBalance(l), tipo:"Préstamo por pagar" })) },
        hipotecas: { total: totalHipotecas, items: mortgages.map(m=>({ nombre:m.nombre||m.banco||"Hipoteca", valor:calcMortgageBalance(m), tipo:"Hipoteca" })) },
        total: totalPasivos,
      },
      patrimonioNeto,
    };
  };

  // ══════════════════════════════════════════════════
  // ESTADO DE RESULTADOS
  // ══════════════════════════════════════════════════
  const buildResultados = () => {
    const ingresos = txsRango.filter(t=>t.type==="income");
    const gastos   = txsRango.filter(t=>t.type==="expense");

    const totalIngresos = ingresos.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const totalGastos   = gastos.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const utilidad      = totalIngresos - totalGastos;
    const margen        = totalIngresos>0 ? (utilidad/totalIngresos)*100 : 0;

    // agrupar por categoría
    const catIngresos = {};
    ingresos.forEach(t=>{ const c=t.category||"Sin categoría"; catIngresos[c]=(catIngresos[c]||0)+parseFloat(t.amount||0); });
    const catGastos = {};
    gastos.forEach(t=>{ const c=t.category||"Sin categoría"; catGastos[c]=(catGastos[c]||0)+parseFloat(t.amount||0); });

    // separar ingresos por origen
    const ingresosOp  = ingresos.filter(t=>!t.origen||t.origen==="manual");
    const ingresosInv = ingresos.filter(t=>t.origen==="inversion");
    const ingresosPresta = ingresos.filter(t=>t.origen==="prestamo");
    const totalIngresosOp    = ingresosOp.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const totalIngresosInv   = ingresosInv.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const totalIngresosPresta= ingresosPresta.reduce((s,t)=>s+parseFloat(t.amount||0),0);

    const gastosOp   = gastos.filter(t=>!t.origen||t.origen==="manual");
    const gastosHip  = gastos.filter(t=>t.origen==="hipoteca");
    const gastosDeuda= gastos.filter(t=>t.origen==="prestamo");
    const totalGastosOp   = gastosOp.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const totalGastosHip  = gastosHip.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const totalGastosDeuda= gastosDeuda.reduce((s,t)=>s+parseFloat(t.amount||0),0);

    return { totalIngresos, totalGastos, utilidad, margen, catIngresos, catGastos,
      totalIngresosOp, totalIngresosInv, totalIngresosPresta,
      totalGastosOp, totalGastosHip, totalGastosDeuda };
  };

  // ══════════════════════════════════════════════════
  // FLUJO DE EFECTIVO
  // ══════════════════════════════════════════════════
  const buildFlujo = () => {
    // Actividades operativas: ingresos y gastos del período (excluye inversión y financiamiento)
    const ingrOp  = txsRango.filter(t=>t.type==="income"&&(!t.origen||t.origen==="manual")).reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const gastOp  = txsRango.filter(t=>t.type==="expense"&&(!t.origen||t.origen==="hipoteca"||t.origen==="manual"||t.origen==="prestamo")).reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const flujoOp = ingrOp - gastOp;

    // Actividades de inversión: aportaciones y cobros/retiros
    const aportaciones = investments.flatMap(i=>(i.aportaciones||[]).filter(a=> rango.desde?a.date>=rango.desde:true).filter(a=>rango.hasta?a.date<=rango.hasta:true));
    const cobros       = investments.flatMap(i=>(i.cobros||[]).filter(c=>rango.desde?c.fecha>=rango.desde:true).filter(c=>rango.hasta?c.fecha<=rango.hasta:true));
    const salidaInv    = aportaciones.reduce((s,a)=>s+parseFloat(a.amount||0),0);
    const entradaInv   = cobros.filter(c=>c.tipo!=="reinversion").reduce((s,c)=>s+parseFloat(c.montoNeto||0),0);
    const flujoInv     = entradaInv - salidaInv;

    // Actividades de financiamiento: préstamos recibidos/pagados, hipotecas
    const prestamosRecibidos = loans.filter(l=>l.type==="received" && l.startDate>=( rango.desde||"") && l.startDate<=(rango.hasta||"9999")).reduce((s,l)=>s+parseFloat(l.principal||0),0);
    const pagosPrestamos     = txsRango.filter(t=>t.origen==="prestamo"&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const pagosHipoteca      = txsRango.filter(t=>t.origen==="hipoteca").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    // Pagos de tarjeta: se toman de transfers con tipoPago=pago_tarjeta en el período
    // No afectan gastos — son reducción de pasivo financiado
    const pagosTarjeta = (transfers||[]).filter(t=>
      t.tipoPago==="pago_tarjeta"&&
      (rango.desde?t.date>=rango.desde:true)&&
      (rango.hasta?t.date<=rango.hasta:true)
    ).reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const flujoFin = prestamosRecibidos - pagosPrestamos - pagosHipoteca - pagosTarjeta;

    const flujoTotal = flujoOp + flujoInv + flujoFin;

    // ── Reconciliación: saldo inicial = saldo actual − flujo neto del período
    const saldoFinalEfectivo = accounts
      .filter(a=>a.type!=="credit")
      .reduce((s,a)=> s + (a.currency==="USD" ? parseFloat(a.balance||0)*TC : parseFloat(a.balance||0)), 0);
    const saldoInicialEfectivo = saldoFinalEfectivo - flujoTotal;

    return {
      operativas:     { entradas:ingrOp, salidas:gastOp, flujo:flujoOp,
        items:[
          {label:"Ingresos operativos",   valor:ingrOp,  tipo:"entrada"},
          {label:"Gastos operativos",      valor:-gastOp, tipo:"salida"},
        ]},
      inversion:      { entradas:entradaInv, salidas:salidaInv, flujo:flujoInv,
        items:[
          {label:"Cobros / retiros inversiones", valor:entradaInv,  tipo:"entrada"},
          {label:"Aportaciones a inversiones",   valor:-salidaInv,  tipo:"salida"},
        ]},
      financiamiento: { entradas:prestamosRecibidos, salidas:pagosPrestamos+pagosHipoteca+pagosTarjeta, flujo:flujoFin,
        items:[
          {label:"Préstamos recibidos",     valor:prestamosRecibidos,  tipo:"entrada"},
          {label:"Pagos de préstamos",      valor:-(pagosPrestamos),   tipo:"salida"},
          {label:"Pagos de hipoteca",       valor:-(pagosHipoteca),    tipo:"salida"},
          {label:"Pagos de tarjeta",        valor:-(pagosTarjeta),     tipo:"salida"},
        ]},
      flujoTotal, saldoInicialEfectivo, saldoFinalEfectivo,
    };
  };

  const balance    = buildBalance();
  const resultados = buildResultados();
  const flujo      = buildFlujo();

  // ── exportar Excel mejorado con SheetJS
  const exportarExcel = async () => {
    try {
      // Intentar cargar SheetJS — requiere conexión a internet
      let XLSX;
      try {
        XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs");
      } catch {
        // fallback: script tag
        await new Promise((res,rej)=>{
          if(window.XLSX){ res(); return; }
          const s=document.createElement("script");
          s.src="https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js";
          s.onload=res; s.onerror=rej;
          document.head.appendChild(s);
        });
        XLSX = window.XLSX;
      }
      const wb = XLSX.utils.book_new();

      // Hoja 1: Balance General
      const balData = [
        ["BALANCE GENERAL", "", ""],
        ["Fecha de corte:", today(), ""],
        ["", "", ""],
        ["ACTIVOS", "", ""],
        ["Liquidez", "", fmt(balance.activos.liquidez.total)],
        ...balance.activos.liquidez.items.map(i=>["  "+i.nombre, i.tipo, fmt(i.valor)]),
        ["Inversiones", "", fmt(balance.activos.inversiones.total)],
        ...balance.activos.inversiones.items.map(i=>["  "+i.nombre, i.tipo, fmt(i.valor)]),
        ["Cuentas por cobrar", "", fmt(balance.activos.cuentasCobrar.total)],
        ...balance.activos.cuentasCobrar.items.map(i=>["  "+i.nombre, i.tipo, fmt(i.valor)]),
        ["TOTAL ACTIVOS", "", fmt(balance.activos.total)],
        ["", "", ""],
        ["PASIVOS", "", ""],
        ["Tarjetas de crédito", "", fmt(balance.pasivos.tarjetas.total)],
        ...balance.pasivos.tarjetas.items.map(i=>["  "+i.nombre, i.tipo, fmt(i.valor)]),
        ["Préstamos por pagar", "", fmt(balance.pasivos.prestamos.total)],
        ...balance.pasivos.prestamos.items.map(i=>["  "+i.nombre, i.tipo, fmt(i.valor)]),
        ["Hipotecas", "", fmt(balance.pasivos.hipotecas.total)],
        ...balance.pasivos.hipotecas.items.map(i=>["  "+i.nombre, i.tipo, fmt(i.valor)]),
        ["TOTAL PASIVOS", "", fmt(balance.pasivos.total)],
        ["", "", ""],
        ["PATRIMONIO NETO", "", fmt(balance.patrimonioNeto)],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(balData);
      ws1["!cols"] = [{wch:35},{wch:25},{wch:20}];
      XLSX.utils.book_append_sheet(wb, ws1, "Balance General");

      // Hoja 2: Estado de Resultados
      const resData = [
        ["ESTADO DE RESULTADOS","",""],
        ["Período:", `${rango.desde||"Todo"} al ${rango.hasta||today()}`, ""],
        ["","",""],
        ["INGRESOS","",""],
        ["  Ingresos operativos","",fmt(resultados.totalIngresosOp)],
        ["  Ingresos por inversiones","",fmt(resultados.totalIngresosInv)],
        ["  Cobros de préstamos","",fmt(resultados.totalIngresosPresta)],
        ["TOTAL INGRESOS","",fmt(resultados.totalIngresos)],
        ["","",""],
        ["GASTOS","",""],
        ["  Gastos operativos","",fmt(resultados.totalGastosOp)],
        ["  Pagos de deuda","",fmt(resultados.totalGastosDeuda)],
        ["  Pagos hipoteca","",fmt(resultados.totalGastosHip)],
        ["TOTAL GASTOS","",fmt(resultados.totalGastos)],
        ["","",""],
        ["UTILIDAD NETA","",fmt(resultados.utilidad)],
        ["MARGEN","",resultados.margen.toFixed(1)+"%"],
        ["","",""],
        ["DETALLE POR CATEGORÍA - INGRESOS","",""],
        ...Object.entries(resultados.catIngresos).sort((a,b)=>b[1]-a[1]).map(([c,v])=>["  "+c,"",fmt(v)]),
        ["","",""],
        ["DETALLE POR CATEGORÍA - GASTOS","",""],
        ...Object.entries(resultados.catGastos).sort((a,b)=>b[1]-a[1]).map(([c,v])=>["  "+c,"",fmt(v)]),
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(resData);
      ws2["!cols"] = [{wch:35},{wch:25},{wch:20}];
      XLSX.utils.book_append_sheet(wb, ws2, "Estado de Resultados");

      // Hoja 3: Flujo de Efectivo
      const flujoData = [
        ["ESTADO DE FLUJO DE EFECTIVO","",""],
        ["Período:", `${rango.desde||"Todo"} al ${rango.hasta||today()}`, ""],
        ["","",""],
        ["ACTIVIDADES OPERATIVAS","",""],
        ...flujo.operativas.items.map(i=>["  "+i.label,"",fmt(Math.abs(i.valor))]),
        ["Flujo operativo neto","",fmt(flujo.operativas.flujo)],
        ["","",""],
        ["ACTIVIDADES DE INVERSIÓN","",""],
        ...flujo.inversion.items.map(i=>["  "+i.label,"",fmt(Math.abs(i.valor))]),
        ["Flujo de inversión neto","",fmt(flujo.inversion.flujo)],
        ["","",""],
        ["ACTIVIDADES DE FINANCIAMIENTO","",""],
        ...flujo.financiamiento.items.map(i=>["  "+i.label,"",fmt(Math.abs(i.valor))]),
        ["Flujo de financiamiento neto","",fmt(flujo.financiamiento.flujo)],
        ["","",""],
        ["FLUJO NETO TOTAL","",fmt(flujo.flujoTotal)],
        ["","",""],
        ["RECONCILIACIÓN DE EFECTIVO","",""],
        ["Saldo inicial de efectivo (estimado)","",fmt(flujo.saldoInicialEfectivo)],
        ["(+/−) Flujo neto del período","",fmt(flujo.flujoTotal)],
        ["= Saldo final de efectivo","",fmt(flujo.saldoFinalEfectivo)],
        ["","",""],
        ["DESGLOSE POR CUENTA","",""],
        ...accounts.filter(a=>a.type!=="credit").map(a=>{
          const saldo = a.currency==="USD" ? parseFloat(a.balance||0)*TC : parseFloat(a.balance||0);
          return ["  "+a.name+(a.currency==="USD"?` (USD ×${TC})`:""), "", fmt(saldo)];
        }),
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(flujoData);
      ws3["!cols"] = [{wch:35},{wch:25},{wch:20}];
      XLSX.utils.book_append_sheet(wb, ws3, "Flujo de Efectivo");

      // Hoja 4: Transacciones del período
      const txData = [
        ["Fecha","Tipo","Descripción","Categoría","Monto","Cuenta","Origen","Etiquetas"],
        ...txsRango.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(t=>[
          t.date, t.type==="income"?"Ingreso":"Gasto", t.description,
          t.category||"", parseFloat(t.amount||0),
          accounts.find(a=>a.id===t.accountId)?.name||"",
          t.origen||"Manual",
          (t.tags||[]).map(tag=>"#"+tag).join(", "),
        ]),
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(txData);
      ws4["!cols"] = [{wch:12},{wch:10},{wch:35},{wch:20},{wch:15},{wch:20},{wch:12}];
      XLSX.utils.book_append_sheet(wb, ws4, "Transacciones");

      // Hoja 5: Inversiones detalladas
      const invData = [
        ["PORTAFOLIO DE INVERSIONES","","","","",""],
        ["Fecha de corte:", today(),"","","",""],
        ["","","","","",""],
        ["Nombre","Tipo","Moneda","Aportado","Valor Actual","Estado"],
        ...investments.map(inv=>{
          const ap=(inv.aportaciones||[]).reduce((s,a)=>s+parseFloat(a.amount||0),0);
          const val=calcInvValue(inv);
          return [inv.nombre||inv.name||"", inv.tipo||inv.instrumento||"", inv.currency||"MXN",
            parseFloat(ap.toFixed(2)), parseFloat(val.toFixed(2)), inv.status==="closed"?"Cerrada":"Activa"];
        }),
        ["","","","","",""],
        ["TOTAL PORTAFOLIO","","",
          investments.reduce((s,i)=>{const ap=(i.aportaciones||[]).reduce((ss,a)=>ss+parseFloat(a.amount||0),0); return s+ap;},0).toFixed(2),
          investments.reduce((s,i)=>s+calcInvValue(i),0).toFixed(2),""],
      ];
      const ws5 = XLSX.utils.aoa_to_sheet(invData);
      ws5["!cols"] = [{wch:30},{wch:20},{wch:10},{wch:18},{wch:18},{wch:12}];
      XLSX.utils.book_append_sheet(wb, ws5, "Inversiones");

      // Hoja 6: Préstamos activos
      const loanData = [
        ["PRÉSTAMOS ACTIVOS","","","","",""],
        ["Fecha de corte:", today(),"","","",""],
        ["","","","","",""],
        ["Nombre","Tipo","Capital","Tasa","Saldo Restante","Vencimiento"],
        ...loans.map(l=>[
          l.name||"", l.type==="given"?"Por cobrar":"Por pagar",
          parseFloat(parseFloat(l.principal||0).toFixed(2)),
          `${l.rate||0}% ${l.rateType==="annual"?"anual":"mensual"}`,
          parseFloat(calcLoanBalance(l).toFixed(2)),
          l.dueDate||"Sin fecha",
        ]),
        ["","","","","",""],
        ["TOTAL POR COBRAR","","",
          "",loans.filter(l=>l.type==="given").reduce((s,l)=>s+calcLoanBalance(l),0).toFixed(2),""],
        ["TOTAL POR PAGAR","","",
          "",loans.filter(l=>l.type==="received").reduce((s,l)=>s+calcLoanBalance(l),0).toFixed(2),""],
      ];
      const ws6 = XLSX.utils.aoa_to_sheet(loanData);
      ws6["!cols"] = [{wch:28},{wch:14},{wch:16},{wch:18},{wch:18},{wch:14}];
      XLSX.utils.book_append_sheet(wb, ws6, "Prestamos");

      // Hoja 0 (RESUMEN EJECUTIVO) — al frente
      const scoreNum = (() => {
        const totalActivos = balance.activos.total;
        const totalPasivos = balance.pasivos.total;
        const deudaRatio = totalActivos>0 ? totalPasivos/totalActivos*100 : 0;
        const ingrMes = transactions.filter(t=>t.date?.startsWith(`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`)&&t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
        const gastMes = transactions.filter(t=>t.date?.startsWith(`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`)&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
        const ahorro = ingrMes>0?(ingrMes-gastMes)/ingrMes*100:0;
        return Math.round(((deudaRatio<=30?100:deudaRatio<=50?75:45)+(ahorro>=20?100:ahorro>=10?70:40))/2);
      })();
      const resEjec = [
        ["REPORTE EJECUTIVO DE FINANZAS PERSONALES","",""],
        [`Generado: ${new Date().toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}`, "", ""],
        [`Usuario: ${user.name}`, "", ""],
        ["","",""],
        ["── RESUMEN PATRIMONIAL ──","",""],
        ["Total Activos","",parseFloat(balance.activos.total.toFixed(2))],
        ["Total Pasivos","",parseFloat(balance.pasivos.total.toFixed(2))],
        ["Patrimonio Neto","",parseFloat(balance.patrimonioNeto.toFixed(2))],
        ["Score de Salud Financiera","",`${scoreNum}/100`],
        ["","",""],
        ["── LIQUIDEZ ──","",""],
        ["Efectivo y cuentas","",parseFloat(balance.activos.liquidez.total.toFixed(2))],
        ["Inversiones activas","",parseFloat(balance.activos.inversiones.total.toFixed(2))],
        ["","",""],
        ["── PERÍODO: "+`${rango.desde||"Todo"} al ${rango.hasta||today()}` +" ──","",""],
        ["Ingresos del período","",parseFloat(resultados.totalIngresos.toFixed(2))],
        ["Gastos del período","",parseFloat(resultados.totalGastos.toFixed(2))],
        ["Utilidad / Déficit","",parseFloat(resultados.utilidad.toFixed(2))],
        ["Margen de ahorro","",`${resultados.margen.toFixed(1)}%`],
        ["","",""],
        ["── DEUDAS VIGENTES ──","",""],
        ["Tarjetas de crédito","",parseFloat(balance.pasivos.tarjetas.total.toFixed(2))],
        ["Préstamos por pagar","",parseFloat(balance.pasivos.prestamos.total.toFixed(2))],
        ["Hipotecas","",parseFloat(balance.pasivos.hipotecas.total.toFixed(2))],
        ["","",""],
        ["── FLUJO DE EFECTIVO ──","",""],
        ["Flujo operativo","",parseFloat(flujo.operativas.flujo.toFixed(2))],
        ["Flujo de inversión","",parseFloat(flujo.inversion.flujo.toFixed(2))],
        ["Flujo de financiamiento","",parseFloat(flujo.financiamiento.flujo.toFixed(2))],
        ["Flujo neto total","",parseFloat(flujo.flujoTotal.toFixed(2))],
      ];
      const ws0 = XLSX.utils.aoa_to_sheet(resEjec);
      ws0["!cols"] = [{wch:38},{wch:5},{wch:22}];
      // Mover resumen al frente
      wb.SheetNames.unshift("Resumen Ejecutivo");
      wb.Sheets["Resumen Ejecutivo"] = ws0;

      XLSX.writeFile(wb, `Finanzapp_Reporte_${today()}.xlsx`);
      toast("Excel exportado correctamente ✓", "success");
    } catch(e) {
      console.error("Excel error:", e);
      toast(`Error al exportar: ${e?.message||"verifica tu conexión"}`, "error");
    }
  };

  // ── exportar PDF ejecutivo (print CSS)
  const exportarPDF = () => {
    const now2 = new Date();
    const ingrMes = transactions.filter(t=>t.date?.startsWith(`${now2.getFullYear()}-${String(now2.getMonth()+1).padStart(2,"0")}`)&&t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const gastMes = transactions.filter(t=>t.date?.startsWith(`${now2.getFullYear()}-${String(now2.getMonth()+1).padStart(2,"0")}`)&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const ahorro  = ingrMes - gastMes;
    const margenAhorro = ingrMes>0?(ahorro/ingrMes*100):0;
    const deudaRatio = balance.activos.total>0?balance.pasivos.total/balance.activos.total*100:0;
    const scoreNum = Math.round(
      ((deudaRatio<=30?100:deudaRatio<=50?75:deudaRatio<=75?45:20) +
       (margenAhorro>=20?100:margenAhorro>=10?70:margenAhorro>=0?40:0) +
       (resultados.margen>=10?100:resultados.margen>=0?60:20)) / 3
    );
    const scoreColor = scoreNum>=80?"#00d4aa":scoreNum>=60?"#f39c12":"#ff4757";
    const scoreLabel = scoreNum>=80?"Excelente":scoreNum>=60?"Buena":scoreNum>=40?"Regular":"Atención";

    // top 5 gastos por categoría
    const topCats = Object.entries(
      transactions.filter(t=>t.date?.startsWith(`${now2.getFullYear()}-${String(now2.getMonth()+1).padStart(2,"0")}`)&&t.type==="expense")
        .reduce((m,t)=>{ const c=t.category||"Otro"; m[c]=(m[c]||0)+parseFloat(t.amount||0); return m; },{})
    ).sort((a,b)=>b[1]-a[1]).slice(0,5);

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte Financiero — ${user.name}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #1a1a2e; font-size: 11px; line-height: 1.5; }
  .header { background: linear-gradient(135deg,#0f172a,#1e293b); color: #fff; padding: 20px 24px; border-radius: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
  .header h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .header h1 span { color: #00d4aa; }
  .header .meta { text-align: right; font-size: 10px; opacity: .7; line-height: 1.8; }
  .kpis { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 16px; }
  @media(max-width:600px){.kpis{grid-template-columns:repeat(2,1fr);}}
  .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; }
  .kpi .label { font-size: 9px; text-transform: uppercase; letter-spacing: .6px; color: #94a3b8; font-weight: 700; margin-bottom: 4px; }
  .kpi .value { font-size: 17px; font-weight: 800; color: #0f172a; }
  .kpi .value.pos { color: #00a884; }
  .kpi .value.neg { color: #ef4444; }
  .kpi .value.teal { color: #00d4aa; }
  .kpi .sub { font-size: 9px; color: #94a3b8; margin-top: 2px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
  .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
  .section h3 { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .6px; color: #475569; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
  .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
  .row:last-child { border-bottom: none; }
  .row .lbl { color: #64748b; }
  .row .val { font-weight: 700; color: #0f172a; }
  .row .val.pos { color: #00a884; }
  .row .val.neg { color: #ef4444; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 0 4px; border-top: 2px solid #cbd5e1; margin-top: 6px; }
  .total-row .lbl { font-weight: 800; color: #0f172a; font-size: 12px; }
  .total-row .val { font-weight: 800; font-size: 13px; color: #0f172a; }
  .health { display: flex; align-items: center; gap: 16px; padding: 10px 0; }
  .score-circle { width: 64px; height: 64px; border-radius: 50%; background: conic-gradient(${scoreColor} ${scoreNum*3.6}deg, #e2e8f0 0deg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .score-inner { width: 46px; height: 46px; border-radius: 50%; background: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .score-num { font-size: 14px; font-weight: 800; color: ${scoreColor}; line-height: 1; }
  .score-lbl { font-size: 8px; color: #94a3b8; font-weight: 600; }
  .bar-wrap { margin: 4px 0; }
  .bar-label { display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-bottom: 2px; }
  .bar-track { height: 7px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; }
  .footer { margin-top: 16px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: 700; }
  .patrimonio-box { background: linear-gradient(135deg,#0f172a,#1e3a5f); color: #fff; border-radius: 8px; padding: 14px 16px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
  .patrimonio-box .big { font-size: 26px; font-weight: 800; color: #00d4aa; }
  .patrimonio-box .small { font-size: 10px; opacity: .7; }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>Finanz<span>app</span></h1>
    <div style="font-size:12px;opacity:.8;margin-top:4px">Reporte Ejecutivo de Finanzas Personales</div>
  </div>
  <div class="meta">
    <div><strong>${user.name}</strong></div>
    <div>${now2.toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
    <div>Período: ${rango.desde||"Inicio"} al ${rango.hasta||new Date().toISOString().split("T")[0]}</div>
  </div>
</div>

<div class="patrimonio-box">
  <div>
    <div class="small">PATRIMONIO NETO</div>
    <div class="big">${fmt(balance.patrimonioNeto)}</div>
    <div class="small" style="margin-top:4px">Activos ${fmt(balance.activos.total)} — Pasivos ${fmt(balance.pasivos.total)}</div>
  </div>
  <div style="text-align:right">
    <div class="small">SCORE SALUD FINANCIERA</div>
    <div style="font-size:28px;font-weight:800;color:${scoreColor}">${scoreNum}</div>
    <div class="small" style="color:${scoreColor}">${scoreLabel}</div>
  </div>
</div>

<div class="kpis">
  <div class="kpi">
    <div class="label">Ingresos del mes</div>
    <div class="value pos">${fmt(ingrMes)}</div>
    <div class="sub">Período actual</div>
  </div>
  <div class="kpi">
    <div class="label">Gastos del mes</div>
    <div class="value neg">${fmt(gastMes)}</div>
    <div class="sub">Período actual</div>
  </div>
  <div class="kpi">
    <div class="label">Ahorro / Déficit</div>
    <div class="value ${ahorro>=0?"pos":"neg"}">${fmt(ahorro)}</div>
    <div class="sub">Margen ${margenAhorro.toFixed(1)}%</div>
  </div>
  <div class="kpi">
    <div class="label">Liquidez disponible</div>
    <div class="value teal">${fmt(balance.activos.liquidez.total)}</div>
    <div class="sub">${accounts.filter(a=>a.type!=="credit").length} cuenta(s)</div>
  </div>
</div>

<div class="grid2">
  <div class="section">
    <h3>Balance General</h3>
    <div class="row"><span class="lbl">Liquidez (cuentas)</span><span class="val">${fmt(balance.activos.liquidez.total)}</span></div>
    <div class="row"><span class="lbl">Inversiones</span><span class="val">${fmt(balance.activos.inversiones.total)}</span></div>
    <div class="row"><span class="lbl">Préstamos por cobrar</span><span class="val">${fmt(balance.activos.cuentasCobrar.total)}</span></div>
    <div class="total-row"><span class="lbl">Total Activos</span><span class="val">${fmt(balance.activos.total)}</span></div>
    <div style="margin-top:10px">
    <div class="row"><span class="lbl">Tarjetas de crédito</span><span class="val neg">${fmt(balance.pasivos.tarjetas.total)}</span></div>
    <div class="row"><span class="lbl">Préstamos por pagar</span><span class="val neg">${fmt(balance.pasivos.prestamos.total)}</span></div>
    <div class="row"><span class="lbl">Hipotecas</span><span class="val neg">${fmt(balance.pasivos.hipotecas.total)}</span></div>
    <div class="total-row"><span class="lbl">Total Pasivos</span><span class="val neg">${fmt(balance.pasivos.total)}</span></div>
    </div>
  </div>

  <div class="section">
    <h3>Estado de Resultados — Período</h3>
    <div class="row"><span class="lbl">Ingresos operativos</span><span class="val">${fmt(resultados.totalIngresosOp)}</span></div>
    <div class="row"><span class="lbl">Ingresos por inversiones</span><span class="val">${fmt(resultados.totalIngresosInv)}</span></div>
    <div class="total-row"><span class="lbl">Total Ingresos</span><span class="val pos">${fmt(resultados.totalIngresos)}</span></div>
    <div style="margin-top:10px">
    <div class="row"><span class="lbl">Gastos operativos</span><span class="val">${fmt(resultados.totalGastosOp)}</span></div>
    <div class="row"><span class="lbl">Pagos de deuda</span><span class="val">${fmt(resultados.totalGastosDeuda)}</span></div>
    <div class="row"><span class="lbl">Pagos hipoteca</span><span class="val">${fmt(resultados.totalGastosHip)}</span></div>
    <div class="total-row"><span class="lbl">Total Gastos</span><span class="val neg">${fmt(resultados.totalGastos)}</span></div>
    </div>
    <div style="margin-top:10px;padding:8px;background:${resultados.utilidad>=0?"#f0fdf4":"#fef2f2"};border-radius:6px;display:flex;justify-content:space-between">
      <span style="font-weight:800">${resultados.utilidad>=0?"Utilidad Neta":"Déficit Neto"}</span>
      <span style="font-weight:800;color:${resultados.utilidad>=0?"#00a884":"#ef4444"}">${fmt(resultados.utilidad)}</span>
    </div>
  </div>
</div>

<div class="grid2">
  <div class="section">
    <h3>Flujo de Efectivo</h3>
    <div class="row"><span class="lbl">Flujo operativo</span><span class="val ${flujo.operativas.flujo>=0?"pos":"neg"}">${fmt(flujo.operativas.flujo)}</span></div>
    <div class="row"><span class="lbl">Flujo de inversión</span><span class="val ${flujo.inversion.flujo>=0?"pos":"neg"}">${fmt(flujo.inversion.flujo)}</span></div>
    <div class="row"><span class="lbl">Flujo de financiamiento</span><span class="val ${flujo.financiamiento.flujo>=0?"pos":"neg"}">${fmt(flujo.financiamiento.flujo)}</span></div>
    <div class="total-row"><span class="lbl">Flujo Neto Total</span><span class="val ${flujo.flujoTotal>=0?"pos":"neg"}">${fmt(flujo.flujoTotal)}</span></div>
  </div>

  <div class="section">
    <h3>Top Gastos del Mes por Categoría</h3>
    ${topCats.length===0
      ? '<div style="color:#94a3b8;font-size:10px;padding:8px 0">Sin gastos registrados este mes</div>'
      : topCats.map(([cat,val])=>`
      <div class="bar-wrap">
        <div class="bar-label"><span>${cat}</span><span style="font-weight:700">${fmt(val)}</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.min(val/topCats[0][1]*100,100).toFixed(0)}%;background:#00d4aa"></div></div>
      </div>`).join("")
    }
  </div>
</div>

<div class="section" style="margin-bottom:14px">
  <h3>Salud Financiera</h3>
  <div class="health">
    <div class="score-circle">
      <div class="score-inner">
        <span class="score-num">${scoreNum}</span>
        <span class="score-lbl">/100</span>
      </div>
    </div>
    <div style="flex:1">
      <div style="font-size:14px;font-weight:800;color:${scoreColor};margin-bottom:6px">${scoreLabel}</div>
      <div class="bar-wrap">
        <div class="bar-label"><span>Ratio de deuda</span><span>${deudaRatio.toFixed(0)}% (meta: &lt;30%)</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.min(deudaRatio,100).toFixed(0)}%;background:${deudaRatio<=30?"#00d4aa":deudaRatio<=50?"#f39c12":"#ef4444"}"></div></div>
      </div>
      <div class="bar-wrap">
        <div class="bar-label"><span>Tasa de ahorro</span><span>${margenAhorro.toFixed(1)}% (meta: &gt;20%)</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.min(Math.max(margenAhorro,0),100).toFixed(0)}%;background:${margenAhorro>=20?"#00d4aa":margenAhorro>=10?"#f39c12":"#ef4444"}"></div></div>
      </div>
    </div>
  </div>
</div>

<div class="footer">
  Generado por Finanzapp · ${now2.toLocaleDateString("es-MX")} · Solo para uso personal
</div>

</body>
</html>`;

    const win = window.open("","_blank","width=900,height=700");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(()=>{ win.print(); }, 600);
  };

  // ── helpers UI
  const FilaBalance = ({ label, valor, nivel=0, negrita=false, color=null, separador=false }) => (
    <div style={{
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding: nivel===0 ? "9px 16px" : "6px 16px 6px "+(16+nivel*16)+"px",
      borderBottom: separador ? "1px solid rgba(255,255,255,.08)" : "1px solid rgba(255,255,255,.03)",
      background: nivel===0 ? "rgba(255,255,255,.03)" : "transparent",
    }}>
      <span style={{fontSize: nivel===0?13:12, fontWeight: negrita?700:400, color: nivel===0?"#ccc":"#777"}}>{label}</span>
      <span style={{fontSize: nivel===0?14:12, fontWeight: negrita||nivel===0?700:400, color: color||(nivel===0?"#f0f0f0":"#888"), fontVariantNumeric:"tabular-nums"}}>{fmt(valor)}</span>
    </div>
  );

  const TotalRow = ({ label, valor, color="#00d4aa" }) => (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",background:`${color}12`,borderTop:`2px solid ${color}33`}}>
      <span style={{fontSize:14,fontWeight:800,color:"#f0f0f0"}}>{label}</span>
      <span style={{fontSize:16,fontWeight:800,color,fontVariantNumeric:"tabular-nums"}}>{fmt(valor)}</span>
    </div>
  );

  const PERIODOS = [{v:"mes",l:"Este mes"},{v:"trimestre",l:"Trimestre"},{v:"anio",l:"Este año"},{v:"todo",l:"Todo"},{v:"personalizado",l:"Personalizado"}];
  const TABS = [{id:"balance",label:"Balance General"},{id:"resultados",label:"Estado de Resultados"},{id:"flujo",label:"Flujo de Efectivo"},{id:"analisis",label:"📊 Análisis"}];

  return (
    <div style={{animation:"fadeUp .25s ease"}}>
      {/* header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:"0 0 3px"}}>Estados Financieros</h2>
          <p style={{fontSize:13,color:"#555",margin:0}}>Balance General · Estado de Resultados · Flujo de Efectivo</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          {/* selector período */}
          <div style={{display:"flex",gap:2,background:"rgba(255,255,255,.03)",borderRadius:9,padding:3}}>
            {PERIODOS.map(p=>(
              <button key={p.v} onClick={()=>setPeriodo(p.v)} style={{padding:"5px 10px",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:periodo===p.v?"rgba(0,212,170,.15)":"transparent",color:periodo===p.v?"#00d4aa":"#666"}}>{p.l}</button>
            ))}
          </div>
          <button onClick={exportarPDF} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,border:"1px solid rgba(239,68,68,.2)",background:"rgba(239,68,68,.08)",color:"#f87171",cursor:"pointer",fontSize:12,fontWeight:700}}>
            <Ic n="documents" size={14}/>PDF
          </button>
          <button onClick={exportarExcel} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,border:"1px solid rgba(0,212,170,.2)",background:"rgba(0,212,170,.08)",color:"#00d4aa",cursor:"pointer",fontSize:12,fontWeight:700}}>
            <Ic n="download" size={14}/>Excel
          </button>
        </div>
      </div>

      {/* fechas personalizadas */}
      {periodo==="personalizado" && (
        <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
          <input type="date" value={fechaDesde} onChange={e=>setFechaDesde(e.target.value)} style={{padding:"7px 11px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,color:"#e0e0e0",fontSize:12,outline:"none"}}/>
          <span style={{color:"#555",fontSize:12}}>al</span>
          <input type="date" value={fechaHasta} onChange={e=>setFechaHasta(e.target.value)} style={{padding:"7px 11px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,color:"#e0e0e0",fontSize:12,outline:"none"}}/>
          <span style={{fontSize:11,color:"#555"}}>{txsRango.length} transacciones en este período</span>
        </div>
      )}

      {/* tabs */}
      <div style={{display:"flex",gap:2,marginBottom:16,background:"rgba(255,255,255,.03)",borderRadius:10,padding:3,width:"fit-content",flexWrap:"wrap"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .15s",background:tab===t.id?"linear-gradient(135deg,#00d4aa,#00a884)":"transparent",color:tab===t.id?"#fff":"#666"}}>{t.label}</button>
        ))}
      </div>

      {/* ══ BALANCE GENERAL */}
      {tab==="balance" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:14}}>
          {/* ACTIVOS */}
          <Card style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",background:"rgba(0,212,170,.06)"}}>
              <p style={{fontSize:13,fontWeight:800,color:"#00d4aa",margin:0,textTransform:"uppercase",letterSpacing:.5}}>Activos</p>
              <p style={{fontSize:20,fontWeight:800,color:"#00d4aa",margin:"4px 0 0"}}>{fmt(balance.activos.total)}</p>
            </div>
            <div style={{padding:"8px 0"}}>
              <div style={{padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Liquidez</div>
              {balance.activos.liquidez.items.map((i,idx)=><FilaBalance key={idx} label={i.nombre} valor={i.valor} nivel={1}/>)}
              <FilaBalance label="Subtotal Liquidez" valor={balance.activos.liquidez.total} nivel={0} negrita separador/>
              <div style={{padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Inversiones</div>
              {balance.activos.inversiones.items.length===0
                ? <div style={{padding:"6px 32px",fontSize:12,color:"#444"}}>Sin inversiones activas</div>
                : balance.activos.inversiones.items.map((i,idx)=><FilaBalance key={idx} label={i.nombre} valor={i.valor} nivel={1}/>)}
              <FilaBalance label="Subtotal Inversiones" valor={balance.activos.inversiones.total} nivel={0} negrita separador/>
              {balance.activos.cuentasCobrar.total>0 && <>
                <div style={{padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Cuentas por Cobrar</div>
                {balance.activos.cuentasCobrar.items.map((i,idx)=><FilaBalance key={idx} label={i.nombre} valor={i.valor} nivel={1}/>)}
                <FilaBalance label="Subtotal CxC" valor={balance.activos.cuentasCobrar.total} nivel={0} negrita separador/>
              </>}
            </div>
            <TotalRow label="TOTAL ACTIVOS" valor={balance.activos.total} color="#00d4aa"/>
          </Card>

          {/* PASIVOS + PATRIMONIO */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Card style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",background:"rgba(255,71,87,.06)"}}>
                <p style={{fontSize:13,fontWeight:800,color:"#ff4757",margin:0,textTransform:"uppercase",letterSpacing:.5}}>Pasivos</p>
                <p style={{fontSize:20,fontWeight:800,color:"#ff4757",margin:"4px 0 0"}}>{fmt(balance.pasivos.total)}</p>
              </div>
              <div style={{padding:"8px 0"}}>
                {balance.pasivos.tarjetas.total>0 && <>
                  <div style={{padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Tarjetas de Crédito</div>
                  {balance.pasivos.tarjetas.items.map((i,idx)=><FilaBalance key={idx} label={i.nombre} valor={i.valor} nivel={1}/>)}
                  <FilaBalance label="Subtotal Tarjetas" valor={balance.pasivos.tarjetas.total} nivel={0} negrita separador/>
                </>}
                {balance.pasivos.prestamos.total>0 && <>
                  <div style={{padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Préstamos por Pagar</div>
                  {balance.pasivos.prestamos.items.map((i,idx)=><FilaBalance key={idx} label={i.nombre} valor={i.valor} nivel={1}/>)}
                  <FilaBalance label="Subtotal Préstamos" valor={balance.pasivos.prestamos.total} nivel={0} negrita separador/>
                </>}
                {balance.pasivos.hipotecas.total>0 && <>
                  <div style={{padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Hipotecas</div>
                  {balance.pasivos.hipotecas.items.map((i,idx)=><FilaBalance key={idx} label={i.nombre} valor={i.valor} nivel={1}/>)}
                  <FilaBalance label="Subtotal Hipotecas" valor={balance.pasivos.hipotecas.total} nivel={0} negrita separador/>
                </>}
                {balance.pasivos.total===0 && <div style={{padding:"16px",fontSize:12,color:"#444",textAlign:"center"}}>Sin pasivos registrados</div>}
              </div>
              <TotalRow label="TOTAL PASIVOS" valor={balance.pasivos.total} color="#ff4757"/>
            </Card>

            <Card style={{padding:0,overflow:"hidden",borderColor:balance.patrimonioNeto>=0?"rgba(0,212,170,.2)":"rgba(255,71,87,.2)"}}>
              <div style={{padding:"16px",background:balance.patrimonioNeto>=0?"rgba(0,212,170,.08)":"rgba(255,71,87,.08)"}}>
                <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 6px"}}>Patrimonio Neto = Activos − Pasivos</p>
                <p style={{fontSize:28,fontWeight:800,color:balance.patrimonioNeto>=0?"#00d4aa":"#ff4757",margin:0}}>{fmt(balance.patrimonioNeto)}</p>
                <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,.06)",overflow:"hidden",marginTop:12}}>
                  <div style={{height:"100%",width:`${balance.activos.total>0?Math.min(balance.patrimonioNeto/balance.activos.total*100,100):0}%`,background:balance.patrimonioNeto>=0?"#00d4aa":"#ff4757",borderRadius:3}}/>
                </div>
                <p style={{fontSize:11,color:"#555",margin:"6px 0 0"}}>{balance.activos.total>0?(balance.patrimonioNeto/balance.activos.total*100).toFixed(1):0}% del total de activos</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ══ ESTADO DE RESULTADOS */}
      {tab==="resultados" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Sin datos en el período */}
          {txsRango.length===0 && (
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:"rgba(243,156,18,.07)",border:"1px solid rgba(243,156,18,.2)",borderRadius:12}}>
              <Ic n="warn" size={18} color="#f39c12"/>
              <div>
                <p style={{fontSize:13,fontWeight:600,color:"#f5a623",margin:"0 0 2px"}}>Sin transacciones en este período</p>
                <p style={{fontSize:11,color:"#666",margin:0}}>Cambia el período o registra movimientos para ver el Estado de Resultados</p>
              </div>
            </div>
          )}
          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
            {[
              ["Ingresos totales", fmt(resultados.totalIngresos), "#00d4aa"],
              ["Gastos totales",   fmt(resultados.totalGastos),   "#ff4757"],
              ["Utilidad neta",    fmt(resultados.utilidad),      resultados.utilidad>=0?"#00d4aa":"#ff4757"],
              ["Margen",           resultados.margen.toFixed(1)+"%", resultados.margen>=20?"#00d4aa":resultados.margen>=0?"#f39c12":"#ff4757"],
            ].map(([l,v,c])=>(
              <Card key={l}><p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 4px"}}>{l}</p><p style={{fontSize:16,fontWeight:700,color:c,margin:0}}>{v}</p></Card>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {/* Ingresos por origen */}
            <Card style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",background:"rgba(0,212,170,.06)"}}>
                <p style={{fontSize:12,fontWeight:800,color:"#00d4aa",margin:0,textTransform:"uppercase",letterSpacing:.4}}>Ingresos</p>
                <p style={{fontSize:18,fontWeight:800,color:"#00d4aa",margin:"3px 0 0"}}>{fmt(resultados.totalIngresos)}</p>
              </div>
              <div style={{padding:"8px 0"}}>
                {[
                  ["Operativos / Salario", resultados.totalIngresosOp],
                  ["Retiros / Dividendos", resultados.totalIngresosInv],
                  ["Cobros de préstamos",  resultados.totalIngresosPresta],
                ].map(([l,v])=>v>0&&<FilaBalance key={l} label={l} valor={v} nivel={1}/>)}
              </div>
              <div style={{borderTop:"1px solid rgba(255,255,255,.06)",padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Por categoría</div>
              {Object.entries(resultados.catIngresos).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([c,v])=>(
                <div key={c} style={{padding:"5px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontSize:11,color:"#777"}}>{c}</span>
                      <span style={{fontSize:11,color:"#00d4aa",fontWeight:600}}>{fmt(v)}</span>
                    </div>
                    <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,.05)"}}>
                      <div style={{height:"100%",width:`${resultados.totalIngresos>0?v/resultados.totalIngresos*100:0}%`,background:"#00d4aa",borderRadius:2}}/>
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Gastos por origen */}
            <Card style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",background:"rgba(255,71,87,.06)"}}>
                <p style={{fontSize:12,fontWeight:800,color:"#ff4757",margin:0,textTransform:"uppercase",letterSpacing:.4}}>Gastos</p>
                <p style={{fontSize:18,fontWeight:800,color:"#ff4757",margin:"3px 0 0"}}>{fmt(resultados.totalGastos)}</p>
              </div>
              <div style={{padding:"8px 0"}}>
                {[
                  ["Gastos operativos", resultados.totalGastosOp],
                  ["Pagos de deuda",    resultados.totalGastosDeuda],
                  ["Pagos de hipoteca", resultados.totalGastosHip],
                ].map(([l,v])=>v>0&&<FilaBalance key={l} label={l} valor={v} nivel={1}/>)}
              </div>
              <div style={{borderTop:"1px solid rgba(255,255,255,.06)",padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Por categoría</div>
              {Object.entries(resultados.catGastos).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([c,v])=>(
                <div key={c} style={{padding:"5px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontSize:11,color:"#777"}}>{c}</span>
                      <span style={{fontSize:11,color:"#ff4757",fontWeight:600}}>{fmt(v)}</span>
                    </div>
                    <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,.05)"}}>
                      <div style={{height:"100%",width:`${resultados.totalGastos>0?v/resultados.totalGastos*100:0}%`,background:"#ff4757",borderRadius:2}}/>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Resultado final */}
          <Card style={{borderColor:resultados.utilidad>=0?"rgba(0,212,170,.2)":"rgba(255,71,87,.2)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <div>
                <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 6px"}}>Resultado del período</p>
                <p style={{fontSize:26,fontWeight:800,color:resultados.utilidad>=0?"#00d4aa":"#ff4757",margin:0}}>
                  {resultados.utilidad>=0?"+":""}{fmt(resultados.utilidad)}
                </p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontSize:12,color:"#555",margin:"0 0 4px"}}>Margen neto</p>
                <p style={{fontSize:22,fontWeight:800,color:resultados.margen>=20?"#00d4aa":resultados.margen>=0?"#f39c12":"#ff4757",margin:0}}>{resultados.margen.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ══ FLUJO DE EFECTIVO */}
      {tab==="flujo" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* KPIs de flujo */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
            {[
              ["Flujo operativo",      flujo.operativas.flujo,     "#3b82f6"],
              ["Flujo de inversión",   flujo.inversion.flujo,      "#f39c12"],
              ["Flujo financiamiento", flujo.financiamiento.flujo, "#7c3aed"],
              ["Flujo neto total",     flujo.flujoTotal,           flujo.flujoTotal>=0?"#00d4aa":"#ff4757"],
            ].map(([l,v,c])=>(
              <Card key={l}><p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 4px"}}>{l}</p><p style={{fontSize:15,fontWeight:700,color:c,margin:0}}>{v>=0?"+":""}{fmt(v)}</p></Card>
            ))}
          </div>

          {/* Las 3 secciones */}
          {[
            { titulo:"Actividades Operativas",    data:flujo.operativas,     color:"#3b82f6", desc:"Ingresos y gastos del día a día" },
            { titulo:"Actividades de Inversión",  data:flujo.inversion,      color:"#f39c12", desc:"Aportaciones y retiros de inversiones" },
            { titulo:"Actividades de Financiamiento", data:flujo.financiamiento, color:"#7c3aed", desc:"Préstamos y pagos de deuda" },
          ].map(({titulo,data,color,desc})=>(
            <Card key={titulo} style={{padding:0,overflow:"hidden",borderColor:`${color}22`}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",background:`${color}08`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <p style={{fontSize:13,fontWeight:800,color,margin:0}}>{titulo}</p>
                    <p style={{fontSize:11,color:"#555",margin:"2px 0 0"}}>{desc}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:11,color:"#555",margin:"0 0 2px"}}>Flujo neto</p>
                    <p style={{fontSize:16,fontWeight:800,color:data.flujo>=0?"#00d4aa":"#ff4757",margin:0}}>{data.flujo>=0?"+":""}{fmt(data.flujo)}</p>
                  </div>
                </div>
              </div>
              <div>
                {data.items.filter(i=>Math.abs(i.valor)>0).map((item,idx)=>(
                  <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 16px",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:item.valor>=0?"#00d4aa":"#ff4757",flexShrink:0}}/>
                      <span style={{fontSize:12,color:"#888"}}>{item.label}</span>
                    </div>
                    <span style={{fontSize:13,fontWeight:600,color:item.valor>=0?"#00d4aa":"#ff4757"}}>{item.valor>=0?"+":""}{fmt(Math.abs(item.valor))}</span>
                  </div>
                ))}
                {data.items.filter(i=>Math.abs(i.valor)>0).length===0 && (
                  <div style={{padding:"16px",fontSize:12,color:"#444",textAlign:"center"}}>Sin movimientos en este período</div>
                )}
              </div>
            </Card>
          ))}

          {/* Resumen final */}
          <Card style={{borderColor:flujo.flujoTotal>=0?"rgba(0,212,170,.2)":"rgba(255,71,87,.2)"}}>
            <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 12px"}}>Variación neta de efectivo</p>
            {[
              ["Flujo operativo",           flujo.operativas.flujo,     "#3b82f6"],
              ["Flujo de inversión",        flujo.inversion.flujo,      "#f39c12"],
              ["Flujo de financiamiento",   flujo.financiamiento.flujo, "#7c3aed"],
            ].map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{fontSize:12,color:"#666"}}>{l}</span>
                <span style={{fontSize:12,fontWeight:600,color:v>=0?"#00d4aa":"#ff4757"}}>{v>=0?"+":""}{fmt(v)}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",marginTop:4}}>
              <span style={{fontSize:14,fontWeight:800,color:"#f0f0f0"}}>Flujo neto total</span>
              <span style={{fontSize:16,fontWeight:800,color:flujo.flujoTotal>=0?"#00d4aa":"#ff4757"}}>{flujo.flujoTotal>=0?"+":""}{fmt(flujo.flujoTotal)}</span>
            </div>
          </Card>

          {/* Reconciliación de efectivo */}
          <Card style={{borderColor:"rgba(59,130,246,.25)",background:"linear-gradient(135deg,rgba(59,130,246,.05) 0%,transparent 60%)"}}>
            <p style={{fontSize:12,fontWeight:700,color:"#3b82f6",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 14px"}}>
              Reconciliación de Efectivo <span style={{fontSize:10,color:"#444",fontWeight:400}}>(estimada)</span>
            </p>
            <p style={{fontSize:11,color:"#555",margin:"0 0 14px",lineHeight:1.5}}>
              Verifica que el saldo inicial + los movimientos del período = el efectivo que tienes hoy en cuentas.
            </p>
            {/* línea 1: saldo inicial */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 14px",background:"rgba(255,255,255,.03)",borderRadius:8,marginBottom:6}}>
              <div>
                <p style={{fontSize:13,color:"#888",margin:0}}>Saldo inicial de efectivo</p>
                <p style={{fontSize:10,color:"#444",margin:"2px 0 0"}}>Calculado como: saldo actual − flujo del período</p>
                <p style={{fontSize:11,color:"#555",margin:"2px 0 0"}}>Estimado: saldo actual menos movimientos del período</p>
              </div>
              <span style={{fontSize:15,fontWeight:700,color:"#ccc",fontVariantNumeric:"tabular-nums"}}>{fmt(flujo.saldoInicialEfectivo)}</span>
            </div>
            {/* línea 2: flujo neto */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 14px",background:"rgba(255,255,255,.03)",borderRadius:8,marginBottom:6}}>
              <div>
                <p style={{fontSize:13,color:"#888",margin:0}}>
                  {flujo.flujoTotal>=0?"(+) Flujo neto del período":"(−) Flujo neto del período"}
                </p>
                <p style={{fontSize:11,color:"#555",margin:"2px 0 0"}}>Suma de flujos operativo + inversión + financiamiento</p>
              </div>
              <span style={{fontSize:15,fontWeight:700,color:flujo.flujoTotal>=0?"#00d4aa":"#ff4757",fontVariantNumeric:"tabular-nums"}}>
                {flujo.flujoTotal>=0?"+":""}{fmt(flujo.flujoTotal)}
              </span>
            </div>
            {/* separador */}
            <div style={{borderTop:"2px solid rgba(59,130,246,.2)",margin:"8px 0"}}/>
            {/* línea 3: saldo final */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:"rgba(59,130,246,.08)",borderRadius:8,border:"1px solid rgba(59,130,246,.15)"}}>
              <div>
                <p style={{fontSize:14,fontWeight:800,color:"#f0f0f0",margin:0}}>Saldo final de efectivo</p>
                <p style={{fontSize:11,color:"#555",margin:"3px 0 0"}}>
                  Total en {accounts.filter(a=>a.type!=="credit").length} cuenta{accounts.filter(a=>a.type!=="credit").length!==1?"s":""} · excluye tarjetas de crédito
                </p>
              </div>
              <span style={{fontSize:20,fontWeight:800,color:"#3b82f6",fontVariantNumeric:"tabular-nums"}}>{fmt(flujo.saldoFinalEfectivo)}</span>
            </div>
            {/* detalle por cuenta */}
            <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.05)"}}>
              <p style={{fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>Desglose por cuenta</p>
              {accounts.filter(a=>a.type!=="credit").map(a=>{
                const saldo = a.currency==="USD" ? parseFloat(a.balance||0)*TC : parseFloat(a.balance||0);
                const pct   = flujo.saldoFinalEfectivo>0 ? saldo/flujo.saldoFinalEfectivo*100 : 0;
                return (
                  <div key={a.id} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12,color:"#777"}}>{a.name}{a.currency==="USD"&&<span style={{fontSize:10,color:"#555",marginLeft:5}}>USD</span>}</span>
                      <span style={{fontSize:12,fontWeight:600,color:"#3b82f6"}}>{fmt(saldo)}</span>
                    </div>
                    <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,.05)"}}>
                      <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:"#3b82f6",borderRadius:2,opacity:.7}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: ANÁLISIS — Categorías y Tags
      ══════════════════════════════════════════════════════════ */}
      {tab==="analisis" && (
        <AnalisisTab txsRango={txsRango} transactions={transactions} accounts={accounts} />
      )}
    </div>
  );
};


// ─── SUBCOMPONENTE: CORTE GLOBAL DE PRÉSTAMOS ────────────────────────────────
const CorteGlobalPanel = ({ loans, calcInteresTramos, fechaCorteGlobalInput, setFechaCorteGlobalInput, fmt }) => {
  const calcStateAtFecha = (loan, fechaStr) => {
    let balance = parseFloat(loan.principal);
    let lastDate = new Date(loan.startDate+"T12:00:00");
    const targetDate = new Date(fechaStr + "T23:59:59");
    const pagos = [...(loan.payments||[])]
      .filter(p => new Date(p.date+"T12:00:00") <= targetDate)
      .sort((a,b) => new Date(a.date) - new Date(b.date));
    for (const pmt of pagos) {
      const accrued = calcInteresTramos(loan, balance, lastDate, new Date(pmt.date+"T12:00:00"));
      if (pmt.paymentType === "interest_only") {
        lastDate = new Date(pmt.date+"T12:00:00");
      } else {
        const toInt = Math.min(pmt.amount, accrued);
        balance = Math.max(0, balance - (pmt.amount - toInt));
        lastDate = new Date(pmt.date+"T12:00:00");
      }
    }
    return {
      currentBalance: balance,
      pendingInterest: calcInteresTramos(loan, balance, lastDate, targetDate),
    };
  };

  const detalle = loans.map(l => ({ loan: l, st: calcStateAtFecha(l, fechaCorteGlobalInput) }));
  const totalInteres = detalle.reduce((s, d) => s + d.st.pendingInterest, 0);
  const totalCapital = detalle.reduce((s, d) => s + d.st.currentBalance, 0);
  const fmtFecha = (str) => new Date(str + "T12:00:00").toLocaleDateString("es-MX", {day:"2-digit", month:"long", year:"numeric"});

  return (
    <Card style={{padding:0,overflow:"hidden",borderColor:"rgba(59,130,246,.25)",background:"rgba(59,130,246,.04)",gridColumn:"1 / -1"}}>
      {/* Header con selector de fecha */}
      <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(59,130,246,.12)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:15}}>📅</span>
          <p style={{fontSize:13,fontWeight:800,color:"#93c5fd",margin:0}}>Intereses a cobrar al</p>
          <input
            type="date"
            value={fechaCorteGlobalInput}
            onChange={e => setFechaCorteGlobalInput(e.target.value)}
            style={{background:"rgba(59,130,246,.15)",border:"1px solid rgba(59,130,246,.3)",borderRadius:7,
              color:"#93c5fd",fontSize:12,padding:"4px 8px",outline:"none",cursor:"pointer",fontWeight:700}}
          />
        </div>
        <p style={{fontSize:11,color:"#555",margin:0}}>{fmtFecha(fechaCorteGlobalInput)}</p>
      </div>
      {/* KPI total */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
        <div style={{padding:"12px 16px",borderRight:"1px solid rgba(59,130,246,.08)"}}>
          <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 3px"}}>Total intereses a cobrar</p>
          <p style={{fontSize:22,fontWeight:800,color:"#3b82f6",margin:0,fontVariantNumeric:"tabular-nums"}}>+{fmt(totalInteres)}</p>
        </div>
        <div style={{padding:"12px 16px"}}>
          <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 3px"}}>Capital total prestado</p>
          <p style={{fontSize:22,fontWeight:800,color:"#888",margin:0,fontVariantNumeric:"tabular-nums"}}>{fmt(totalCapital)}</p>
        </div>
      </div>
      {/* Desglose por préstamo */}
      <div style={{borderTop:"1px solid rgba(59,130,246,.08)"}}>
        {detalle.map(({loan, st}, i) => (
          <div key={loan.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"8px 16px",borderBottom:i<detalle.length-1?"1px solid rgba(255,255,255,.03)":"none",
            background:i%2===0?"transparent":"rgba(255,255,255,.01)"}}>
            <div style={{minWidth:0,flex:1}}>
              <p style={{fontSize:12,fontWeight:600,color:"#ccc",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loan.name}</p>
              <p style={{fontSize:10,color:"#555",margin:0}}>Capital: {fmt(st.currentBalance)}</p>
            </div>
            <p style={{fontSize:14,fontWeight:800,color:"#3b82f6",margin:0,flexShrink:0,fontVariantNumeric:"tabular-nums"}}>
              +{fmt(st.pendingInterest)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ─── SUBCOMPONENTE: TRAMOS DE TASA EN PRÉSTAMO ───────────────────────────────
const TramosPanel = ({ loan, loans, setLoans, dailyRate, toast }) => {
  const [showTramoForm, setShowTramoForm] = useState(false);
  const [nuevoTramo, setNuevoTramo] = useState({desde:today(), rate:"", rateType:loan.rateType||"monthly"});

  const tramos = [...(loan.tramos||[])].sort((a,b)=>new Date(a.desde)-new Date(b.desde));
  const tramoActual = (() => {
    let t = {rate:loan.rate, rateType:loan.rateType, desde:loan.startDate};
    for (const tr of tramos) { if (new Date(tr.desde)<=new Date()) t=tr; }
    return t;
  })();

  const guardarTramo = () => {
    if (!nuevoTramo.rate||!nuevoTramo.desde) { toast("Completa fecha y tasa","error"); return; }
    const nuevosTramos = [...tramos, {id:genId(), desde:nuevoTramo.desde, rate:parseFloat(nuevoTramo.rate), rateType:nuevoTramo.rateType}]
      .sort((a,b)=>new Date(a.desde)-new Date(b.desde));
    setLoans(loans.map(l=>l.id===loan.id?{...l,tramos:nuevosTramos}:l));
    setShowTramoForm(false);
    setNuevoTramo({desde:today(), rate:"", rateType:loan.rateType||"monthly"});
    toast("Nuevo tramo de tasa guardado ✓","success");
  };

  const eliminarTramo = (id) => {
    setLoans(loans.map(l=>l.id===loan.id?{...l,tramos:(l.tramos||[]).filter(t=>t.id!==id)}:l));
    toast("Tramo eliminado","warning");
  };

  return (
    <Card style={{marginBottom:16,padding:0,overflow:"hidden",borderColor:"rgba(167,139,250,.2)",background:"rgba(167,139,250,.03)"}}>
      <div style={{padding:"11px 16px 9px",borderBottom:"1px solid rgba(167,139,250,.12)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14}}>📈</span>
          <p style={{fontSize:13,fontWeight:800,color:"#a78bfa",margin:0}}>Tasa vigente</p>
          <span style={{fontSize:13,fontWeight:800,color:"#f0f0f0",background:"rgba(167,139,250,.15)",borderRadius:8,padding:"2px 10px"}}>
            {tramoActual.rate}% {tramoActual.rateType==="annual"?"anual":tramoActual.rateType==="monthly"?"mensual":"diaria"}
            <span style={{fontSize:10,color:"#a78bfa",marginLeft:6}}>({(dailyRate(tramoActual.rate,tramoActual.rateType)*100).toFixed(5)}% diario)</span>
          <span style={{fontSize:9,color:"#555",marginLeft:8}}>· el día del cambio usa tasa anterior</span>
          </span>
        </div>
        <button onClick={()=>setShowTramoForm(s=>!s)}
          style={{padding:"5px 12px",borderRadius:7,border:"1px solid rgba(167,139,250,.3)",background:"rgba(167,139,250,.08)",color:"#a78bfa",cursor:"pointer",fontSize:11,fontWeight:700}}>
          {showTramoForm?"✕ Cancelar":"+ Cambiar tasa"}
        </button>
      </div>
      <div style={{padding:"8px 16px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:3}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 8px",borderRadius:7,background:"rgba(255,255,255,.03)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:10,color:"#555",width:70}}>{new Date(loan.startDate+"T12:00:00").toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"2-digit"})}</span>
              <span style={{fontSize:12,fontWeight:600,color:"#888"}}>Tasa inicial</span>
            </div>
            <span style={{fontSize:13,fontWeight:700,color:tramos.length===0?"#a78bfa":"#666"}}>
              {loan.rate}% {loan.rateType==="annual"?"anual":loan.rateType==="monthly"?"mensual":"diaria"}
            </span>
          </div>
          {tramos.map((t,i)=>(
            <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 8px",borderRadius:7,background:i===tramos.length-1?"rgba(167,139,250,.08)":"rgba(255,255,255,.02)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:10,color:"#555",width:70}}>{new Date(t.desde+"T12:00:00").toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"2-digit"})}</span>
                <span style={{fontSize:12,fontWeight:600,color:i===tramos.length-1?"#c4b5fd":"#777"}}>
                  {i===tramos.length-1?"✓ Vigente":"Histórico"}
                </span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13,fontWeight:700,color:i===tramos.length-1?"#a78bfa":"#666"}}>
                  {t.rate}% {t.rateType==="annual"?"anual":t.rateType==="monthly"?"mensual":"diaria"}
                </span>
                <button onClick={()=>eliminarTramo(t.id)}
                  style={{background:"none",border:"none",cursor:"pointer",color:"#444",fontSize:12,padding:"1px 5px"}}
                  onMouseEnter={e=>e.currentTarget.style.color="#ff4757"}
                  onMouseLeave={e=>e.currentTarget.style.color="#444"}>✕</button>
              </div>
            </div>
          ))}
        </div>
        {showTramoForm&&(
          <div style={{marginTop:10,padding:"12px",borderRadius:9,background:"rgba(167,139,250,.07)",border:"1px solid rgba(167,139,250,.2)"}}>
            <p style={{fontSize:11,color:"#a78bfa",fontWeight:700,margin:"0 0 10px"}}>Nueva tasa a partir de:</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
              <div>
                <p style={{fontSize:10,color:"#555",margin:"0 0 4px"}}>Desde</p>
                <input type="date" value={nuevoTramo.desde} onChange={e=>setNuevoTramo(p=>({...p,desde:e.target.value}))}
                  style={{width:"100%",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:7,color:"#e0e0e0",fontSize:12,padding:"6px 8px",outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <p style={{fontSize:10,color:"#555",margin:"0 0 4px"}}>Nueva tasa</p>
                <input type="number" placeholder="2.0" value={nuevoTramo.rate} onChange={e=>setNuevoTramo(p=>({...p,rate:e.target.value}))}
                  style={{width:"100%",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:7,color:"#e0e0e0",fontSize:12,padding:"6px 8px",outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <p style={{fontSize:10,color:"#555",margin:"0 0 4px"}}>Tipo</p>
                <select value={nuevoTramo.rateType} onChange={e=>setNuevoTramo(p=>({...p,rateType:e.target.value}))}
                  style={{width:"100%",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:7,color:"#e0e0e0",fontSize:12,padding:"6px 8px",outline:"none",boxSizing:"border-box"}}>
                  <option value="monthly">% Mensual</option>
                  <option value="annual">% Anual</option>
                  <option value="daily">% Diaria</option>
                </select>
              </div>
            </div>
            {nuevoTramo.rate&&(
              <p style={{fontSize:11,color:"#a78bfa",margin:"0 0 10px"}}>
                💡 {(dailyRate(nuevoTramo.rate,nuevoTramo.rateType)*100).toFixed(5)}% diario
                · Intereses hasta el {nuevoTramo.desde} con tasa anterior; a partir de ahí con {nuevoTramo.rate}%.
              </p>
            )}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowTramoForm(false)}
                style={{padding:"6px 14px",borderRadius:7,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#666",cursor:"pointer",fontSize:12}}>
                Cancelar
              </button>
              <button onClick={guardarTramo}
                style={{padding:"6px 14px",borderRadius:7,border:"none",background:"linear-gradient(135deg,#a78bfa,#7c3aed)",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>
                ✓ Guardar cambio de tasa
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ─── SUBCOMPONENTE: CORTE MENSUAL DE PRÉSTAMO ────────────────────────────────
const CorteMensual = ({ loan, calcState, dailyRate, openNewPay, setPF, blankPay, setOpenPay, accounts }) => {
  const hoy = new Date();
  // Default: día 5 del mes en curso (si ya pasó, del mes actual; si no ha llegado, del actual)
  const defaultCorte = (() => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), 5);
    return d.toISOString().split("T")[0];
  })();
  const [fechaCorte, setFechaCorte] = React.useState(defaultCorte);
  const [historial, setHistorial] = React.useState(
    () => JSON.parse(localStorage.getItem(`fp_cortes_${loan.id}`) || "[]")
  );

  // ── Calcular estado AL día de corte (no a hoy)
  const calcStateAtDate = (targetDateStr) => {
    const dr = dailyRate(loan.rate, loan.rateType);
    let balance = parseFloat(loan.principal);
    let totalPaid = 0;
    let lastDate = new Date(loan.startDate+"T12:00:00");
    const targetDate = new Date(targetDateStr + "T23:59:59");
    // Solo pagos anteriores o iguales a la fecha de corte
    const pagosAnteriores = [...(loan.payments||[])]
      .filter(p => new Date(p.date+"T12:00:00") <= targetDate)
      .sort((a,b) => new Date(a.date) - new Date(b.date));
    for (const pmt of pagosAnteriores) {
      const days = Math.max(0, Math.floor((new Date(pmt.date+"T12:00:00") - lastDate) / 86400000));
      const accrued = balance * dr * days;
      if (pmt.paymentType === "interest_only") {
        totalPaid += pmt.amount; lastDate = new Date(pmt.date+"T12:00:00");
      } else {
        const toInt = Math.min(pmt.amount, accrued);
        balance = Math.max(0, balance - (pmt.amount - toInt));
        totalPaid += pmt.amount; lastDate = new Date(pmt.date+"T12:00:00");
      }
    }
    const daysSince = Math.max(0, Math.round((targetDate - lastDate) / 86400000));
    const pendingInterest = balance * dr * daysSince;
    return { currentBalance: balance, pendingInterest, totalOwed: balance + pendingInterest, totalPaid, lastDate };
  };

  const stCorte = calcStateAtDate(fechaCorte);
  const stHoy = calcState(loan);
  const cur = loan.currency || "MXN";
  const fmt2 = (v) => new Intl.NumberFormat("es-MX", {style:"currency",currency:cur==="USD"?"USD":"MXN"}).format(v||0);
  const fmtD = (d) => new Date(d+"T12:00:00").toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"});

  // Días entre último pago y fecha de corte
  const diasPeriodo = Math.max(0, Math.round((new Date(fechaCorte+"T23:59:59") - stCorte.lastDate) / 86400000));
  const interesDelPeriodo = stCorte.currentBalance * dailyRate(loan.rate, loan.rateType) * diasPeriodo;

  // ── Guardar corte en historial local
  const guardarCorte = () => {
    const nuevoCorte = {
      id: Date.now().toString(),
      fecha: fechaCorte,
      saldoCapital: stCorte.currentBalance,
      interesAcumulado: stCorte.pendingInterest,
      totalACobrar: stCorte.totalOwed,
      diasPeriodo,
      creadoEn: new Date().toISOString(),
    };
    const nuevo = [nuevoCorte, ...historial].slice(0, 24); // max 24 cortes
    setHistorial(nuevo);
    localStorage.setItem(`fp_cortes_${loan.id}`, JSON.stringify(nuevo));
  };

  const eliminarCorte = (id) => {
    const nuevo = historial.filter(c => c.id !== id);
    setHistorial(nuevo);
    localStorage.setItem(`fp_cortes_${loan.id}`, JSON.stringify(nuevo));
  };

  // ── Pre-llenar modal de pago con datos del corte
  const registrarCobro = () => {
    setPF({
      ...blankPay,
      amount: stCorte.pendingInterest.toFixed(2),
      date: fechaCorte,
      paymentType: "interest_only",
      targetAccountId: accounts.find(a=>a.id===loan.accountId)?.id || accounts[0]?.id || "",
      notes: `Intereses corte ${fechaCorte}`,
    });
    setOpenPay(true);
  };

  return (
    <div style={{marginBottom:16}}>
      <div style={{borderRadius:13,border:"1px solid rgba(0,120,255,.2)",background:"rgba(0,120,255,.04)",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(0,120,255,.12)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>📅</span>
            <p style={{fontSize:13,fontWeight:800,color:"#3b82f6",margin:0}}>Corte mensual</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:11,color:"#555"}}>Fecha de corte:</span>
            <input type="date" value={fechaCorte} onChange={e=>setFechaCorte(e.target.value)}
              style={{background:"rgba(59,130,246,.1)",border:"1px solid rgba(59,130,246,.3)",borderRadius:7,color:"#93c5fd",fontSize:12,padding:"4px 8px",outline:"none",cursor:"pointer"}}/>
          </div>
        </div>

        {/* KPIs del corte */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:0}}>
          {[
            {l:"Saldo capital",v:fmt2(stCorte.currentBalance),c:"#e0e0e0"},
            {l:`Interés del período (${diasPeriodo}d)`,v:fmt2(stCorte.pendingInterest),c:"#f39c12"},
            {l:"Total a cobrar al corte",v:fmt2(stCorte.totalOwed),c:"#3b82f6",big:true},
          ].map(k=>(
            <div key={k.l} style={{padding:"12px 16px",borderRight:"1px solid rgba(59,130,246,.08)"}}>
              <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 3px",lineHeight:1.3}}>{k.l}</p>
              <p style={{fontSize:k.big?17:14,fontWeight:k.big?800:700,color:k.c,margin:0,fontVariantNumeric:"tabular-nums"}}>{k.v}</p>
            </div>
          ))}
        </div>

        {/* Desglose del período */}
        <div style={{padding:"10px 16px",borderTop:"1px solid rgba(59,130,246,.08)",background:"rgba(0,0,0,.1)"}}>
          <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 8px"}}>Desglose del período</p>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {[
              {l:"Último pago / inicio", v: fmtD(stCorte.lastDate.toISOString().split("T")[0]), c:"#666"},
              {l:"Fecha de corte",       v: fmtD(fechaCorte),                                    c:"#93c5fd"},
              {l:"Días del período",     v: `${diasPeriodo} días`,                                c:"#a78bfa"},
              {l:"Tasa diaria",          v: `${(dailyRate(loan.rate,loan.rateType)*100).toFixed(5)}%`, c:"#666"},
              {l:"Interés del período",  v: fmt2(interesDelPeriodo),                              c:"#f39c12"},
            ].map(row=>(
              <div key={row.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,color:"#555"}}>{row.l}</span>
                <span style={{fontSize:11,fontWeight:600,color:row.c,fontVariantNumeric:"tabular-nums"}}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Diferencia vs hoy */}
        {Math.abs(stCorte.pendingInterest - stHoy.pendingInterest) > 0.01 && (
          <div style={{padding:"8px 16px",borderTop:"1px solid rgba(59,130,246,.08)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:"#555"}}>Interés acumulado a hoy ({new Date().toLocaleDateString("es-MX",{day:"2-digit",month:"short"})})</span>
            <span style={{fontSize:12,fontWeight:700,color:"#f39c12",fontVariantNumeric:"tabular-nums"}}>{fmt2(stHoy.pendingInterest)}</span>
          </div>
        )}

        {/* Botones */}
        <div style={{padding:"10px 16px",borderTop:"1px solid rgba(59,130,246,.12)",display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={registrarCobro}
            style={{flex:1,minWidth:140,padding:"8px 14px",borderRadius:8,border:"none",cursor:"pointer",
              background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",color:"#fff",fontSize:12,fontWeight:700,
              display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
            ✓ Registrar cobro de este corte
          </button>
          <button onClick={guardarCorte}
            style={{padding:"8px 14px",borderRadius:8,border:"1px solid rgba(59,130,246,.3)",cursor:"pointer",
              background:"rgba(59,130,246,.08)",color:"#93c5fd",fontSize:12,fontWeight:600,
              display:"flex",alignItems:"center",gap:6}}>
            💾 Guardar corte
          </button>
        </div>
      </div>

      {/* Historial de cortes */}
      {historial.length > 0 && (
        <div style={{marginTop:10,borderRadius:10,border:"1px solid rgba(255,255,255,.06)",overflow:"hidden"}}>
          <div style={{padding:"8px 14px",borderBottom:"1px solid rgba(255,255,255,.05)",background:"rgba(255,255,255,.02)"}}>
            <p style={{fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:.5,margin:0}}>Historial de cortes guardados</p>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{background:"rgba(255,255,255,.02)"}}>
                  {["Fecha corte","Capital","Interés","Total a cobrar","Días",""].map(h=>(
                    <th key={h} style={{padding:"7px 12px",textAlign:h===""||h==="Fecha corte"?"left":"right",
                      fontSize:9,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4,
                      borderBottom:"1px solid rgba(255,255,255,.04)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map((c,i)=>(
                  <tr key={c.id} style={{background:i%2===0?"transparent":"rgba(255,255,255,.01)",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                    <td style={{padding:"7px 12px",color:"#93c5fd",fontWeight:600}}>{fmtD(c.fecha)}</td>
                    <td style={{padding:"7px 12px",textAlign:"right",color:"#888",fontVariantNumeric:"tabular-nums"}}>{fmt2(c.saldoCapital)}</td>
                    <td style={{padding:"7px 12px",textAlign:"right",color:"#f39c12",fontVariantNumeric:"tabular-nums"}}>{fmt2(c.interesAcumulado)}</td>
                    <td style={{padding:"7px 12px",textAlign:"right",fontWeight:700,color:"#3b82f6",fontVariantNumeric:"tabular-nums"}}>{fmt2(c.totalACobrar)}</td>
                    <td style={{padding:"7px 12px",textAlign:"right",color:"#555"}}>{c.diasPeriodo}d</td>
                    <td style={{padding:"7px 12px"}}>
                      <button onClick={()=>eliminarCorte(c.id)}
                        style={{background:"none",border:"none",cursor:"pointer",color:"#444",fontSize:11,padding:"2px 6px",borderRadius:4}}
                        onMouseEnter={e=>e.currentTarget.style.color="#ff4757"}
                        onMouseLeave={e=>e.currentTarget.style.color="#444"}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SUBCOMPONENTE: ANÁLISIS DE CATEGORÍAS Y TAGS ────────────────────────────
const AnalisisTab = ({ txsRango, transactions, accounts }) => {
  const [subTab, setSubTab] = useState("categorias");
  const [tagSel, setTagSel] = useState("");

  const gastos   = txsRango.filter(t=>t.type==="expense");
  const ingresos = txsRango.filter(t=>t.type==="income");
  const totalGastos   = gastos.reduce((s,t)=>s+parseFloat(t.amount||0),0);
  const totalIngresos = ingresos.reduce((s,t)=>s+parseFloat(t.amount||0),0);

  const hoy = new Date();
  const mesAnteriorStr = new Date(hoy.getFullYear(),hoy.getMonth()-1,1).toISOString().split("T")[0].slice(0,7);
  const gastosMesAnt = transactions.filter(t=>t.date.slice(0,7)===mesAnteriorStr&&t.type==="expense");

  // ── categorías
  const porCat={}, porCatIngreso={}, porCatAnt={};
  gastos.forEach(t=>{ const c=t.category||"Sin categoría"; porCat[c]=(porCat[c]||0)+parseFloat(t.amount||0); });
  ingresos.forEach(t=>{ const c=t.category||"Sin categoría"; porCatIngreso[c]=(porCatIngreso[c]||0)+parseFloat(t.amount||0); });
  gastosMesAnt.forEach(t=>{ const c=t.category||"Sin categoría"; porCatAnt[c]=(porCatAnt[c]||0)+parseFloat(t.amount||0); });
  const catGastosOrdenadas = Object.entries(porCat).sort((a,b)=>b[1]-a[1]);
  const catIngresosOrdenadas = Object.entries(porCatIngreso).sort((a,b)=>b[1]-a[1]);
  const maxCatGasto = catGastosOrdenadas[0]?.[1]||1;

  // ── tags
  const porTag={};
  txsRango.forEach(t=>{
    (t.tags||[]).forEach(tag=>{
      if(!porTag[tag]) porTag[tag]={gasto:0,ingreso:0,count:0};
      if(t.type==="expense") porTag[tag].gasto+=parseFloat(t.amount||0);
      else porTag[tag].ingreso+=parseFloat(t.amount||0);
      porTag[tag].count++;
    });
  });
  const tagsOrdenados = Object.entries(porTag)
    .map(([tag,d])=>({tag,gasto:d.gasto,ingreso:d.ingreso,neto:d.ingreso-d.gasto,count:d.count}))
    .sort((a,b)=>b.gasto-a.gasto);
  const maxTagGasto = tagsOrdenados[0]?.gasto||1;

  // ── evolución mensual tag
  const meses6 = Array.from({length:6},(_,i)=>{
    const d=new Date(hoy.getFullYear(),hoy.getMonth()-5+i,1);
    return {str:d.toISOString().split("T")[0].slice(0,7), label:d.toLocaleDateString("es-MX",{month:"short",year:"2-digit"})};
  });
  const evolucionTag = tagSel ? meses6.map(m=>{
    const txsM=transactions.filter(t=>t.date.slice(0,7)===m.str&&(t.tags||[]).includes(tagSel));
    return { label:m.label, gasto:txsM.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0), ingreso:txsM.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0) };
  }) : [];
  const maxEvo = evolucionTag.length ? Math.max(...evolucionTag.map(m=>Math.max(m.gasto,m.ingreso)),1) : 1;

  // ── exportar
  const exportarCatExcelReports = () => {
    const doExport = () => {
      const XLSX=window.XLSX, wb=XLSX.utils.book_new();
      const rowsG=catGastosOrdenadas.map(([cat,monto])=>({ Categoría:cat, Tipo:"Gasto", Monto:monto, "% del total":totalGastos>0?((monto/totalGastos)*100).toFixed(1)+"%":"", "Mes anterior":porCatAnt[cat]||0, "Δ vs mes ant":porCatAnt[cat]?(((monto-porCatAnt[cat])/porCatAnt[cat])*100).toFixed(1)+"%":"N/A" }));
      const rowsI=catIngresosOrdenadas.map(([cat,monto])=>({ Categoría:cat, Tipo:"Ingreso", Monto:monto, "% del total":totalIngresos>0?((monto/totalIngresos)*100).toFixed(1)+"%":"", "Mes anterior":"","Δ vs mes ant":"" }));
      const ws=XLSX.utils.json_to_sheet([...rowsG,...rowsI]);
      ws["!cols"]=[{wch:25},{wch:10},{wch:14},{wch:14},{wch:14},{wch:14}];
      XLSX.utils.book_append_sheet(wb,ws,"Categorías");
      XLSX.writeFile(wb,`analisis_categorias_${new Date().toISOString().split("T")[0]}.xlsx`);
    };
    if(!window.XLSX){const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";s.onload=doExport;document.head.appendChild(s);} else doExport();
  };
  const exportarTagsExcelReports = () => {
    const doExport = () => {
      const XLSX=window.XLSX, wb=XLSX.utils.book_new();
      const rows=tagsOrdenados.map(d=>({ Tag:"#"+d.tag, Gastos:d.gasto, Ingresos:d.ingreso, Neto:d.neto, Transacciones:d.count }));
      const ws=XLSX.utils.json_to_sheet(rows);
      ws["!cols"]=[{wch:20},{wch:14},{wch:14},{wch:14},{wch:14}];
      XLSX.utils.book_append_sheet(wb,ws,"Tags");
      XLSX.writeFile(wb,`analisis_tags_${new Date().toISOString().split("T")[0]}.xlsx`);
    };
    if(!window.XLSX){const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";s.onload=doExport;document.head.appendChild(s);} else doExport();
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* subtabs */}
      <div style={{display:"flex",gap:4,background:"rgba(255,255,255,.03)",borderRadius:10,padding:4,width:"fit-content"}}>
        {[["categorias","📂 Categorías"],["tags","🏷️ Tags"]].map(([id,label])=>(
          <button key={id} onClick={()=>setSubTab(id)}
            style={{padding:"7px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
              background:subTab===id?"rgba(0,212,170,.15)":"transparent",
              color:subTab===id?"#00d4aa":"#666",transition:"all .15s"}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── SUBTAB CATEGORÍAS ── */}
      {subTab==="categorias" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
            {[
              ["Categorías con gasto",catGastosOrdenadas.length,"#ff4757"],
              ["Mayor gasto",catGastosOrdenadas[0]?catGastosOrdenadas[0][0]:"—","#f39c12",true],
              ["Categorías con ingreso",catIngresosOrdenadas.length,"#00d4aa"],
              ["Mayor ingreso",catIngresosOrdenadas[0]?catIngresosOrdenadas[0][0]:"—","#00d4aa",true],
            ].map(([l,v,c,isText])=>(
              <Card key={l} style={{padding:"12px 14px"}}>
                <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 4px"}}>{l}</p>
                <p style={{fontSize:isText?13:18,fontWeight:800,color:c,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</p>
              </Card>
            ))}
          </div>
          <Card style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontSize:13,fontWeight:700,color:"#f0f0f0",margin:0}}>🔴 Gastos por categoría</p>
              <button onClick={exportarCatExcelReports}
                style={{padding:"4px 12px",borderRadius:7,border:"1px solid rgba(0,212,170,.25)",background:"rgba(0,212,170,.07)",color:"#00d4aa",cursor:"pointer",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                <Ic n="download" size={11} color="#00d4aa"/> Exportar Excel
              </button>
            </div>
            {catGastosOrdenadas.length===0
              ? <p style={{padding:20,textAlign:"center",color:"#444",fontSize:13}}>Sin gastos en este período</p>
              : catGastosOrdenadas.map(([cat,monto])=>{
                  const pct=totalGastos>0?(monto/totalGastos*100):0;
                  const ant=porCatAnt[cat]||0;
                  const delta=ant>0?((monto-ant)/ant*100):null;
                  return (
                    <div key={cat} style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:12,fontWeight:600,color:"#ddd"}}>{cat}</span>
                          {delta!==null&&(
                            <span style={{fontSize:10,fontWeight:700,color:delta>0?"#ff4757":"#00d4aa",background:delta>0?"rgba(255,71,87,.1)":"rgba(0,212,170,.1)",borderRadius:10,padding:"1px 7px"}}>
                              {delta>0?"↑":"↓"}{Math.abs(delta).toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          {ant>0&&<span style={{fontSize:10,color:"#444"}}>ant: {fmt(ant)}</span>}
                          <span style={{fontSize:13,fontWeight:700,color:"#ff6b7a"}}>{fmt(monto)}</span>
                          <span style={{fontSize:10,color:"#444",width:34,textAlign:"right"}}>{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div style={{height:5,borderRadius:4,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:4,width:`${(monto/maxCatGasto*100).toFixed(1)}%`,background:"linear-gradient(90deg,#ff4757,#ff6b7a)",transition:"width .4s ease"}}/>
                      </div>
                    </div>
                  );
                })
            }
          </Card>
          {catIngresosOrdenadas.length>0&&(
            <Card style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                <p style={{fontSize:13,fontWeight:700,color:"#f0f0f0",margin:0}}>💚 Ingresos por categoría</p>
              </div>
              {catIngresosOrdenadas.map(([cat,monto])=>{
                const maxI=catIngresosOrdenadas[0][1]||1;
                const pct=totalIngresos>0?(monto/totalIngresos*100):0;
                return (
                  <div key={cat} style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <span style={{fontSize:12,fontWeight:600,color:"#ddd"}}>{cat}</span>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:13,fontWeight:700,color:"#00d4aa"}}>{fmt(monto)}</span>
                        <span style={{fontSize:10,color:"#444",width:34,textAlign:"right"}}>{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div style={{height:5,borderRadius:4,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:4,width:`${(monto/maxI*100).toFixed(1)}%`,background:"linear-gradient(90deg,#00d4aa,#00a884)",transition:"width .4s ease"}}/>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      )}

      {/* ── SUBTAB TAGS ── */}
      {subTab==="tags" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {tagsOrdenados.length===0 ? (
            <Card style={{padding:32,textAlign:"center"}}>
              <p style={{fontSize:32,margin:"0 0 8px"}}>🏷️</p>
              <p style={{fontSize:14,fontWeight:700,color:"#e0e0e0",margin:"0 0 4px"}}>Sin tags en este período</p>
              <p style={{fontSize:12,color:"#555",margin:0}}>Agrega tags (#nombre) a tus transacciones para verlos aquí</p>
            </Card>
          ) : (
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
                {[
                  ["Tags activos",tagsOrdenados.length,"#a78bfa"],
                  ["Mayor gasto","#"+tagsOrdenados[0]?.tag,"#ff4757",true],
                  ["Total etiquetado",fmt(tagsOrdenados.reduce((s,d)=>s+d.gasto+d.ingreso,0)),"#3b82f6"],
                  ["Transacciones",tagsOrdenados.reduce((s,d)=>s+d.count,0),"#00d4aa"],
                ].map(([l,v,c,isSmall])=>(
                  <Card key={l} style={{padding:"12px 14px"}}>
                    <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 4px"}}>{l}</p>
                    <p style={{fontSize:isSmall?13:18,fontWeight:800,color:c,margin:0}}>{v}</p>
                  </Card>
                ))}
              </div>
              <Card style={{padding:0,overflow:"hidden"}}>
                <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <p style={{fontSize:13,fontWeight:700,color:"#f0f0f0",margin:0}}>Gasto por tag</p>
                  <button onClick={exportarTagsExcelReports}
                    style={{padding:"4px 12px",borderRadius:7,border:"1px solid rgba(167,139,250,.25)",background:"rgba(167,139,250,.07)",color:"#a78bfa",cursor:"pointer",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                    <Ic n="download" size={11} color="#a78bfa"/> Exportar Excel
                  </button>
                </div>
                {tagsOrdenados.slice(0,10).map(d=>{
                  const pct=d.gasto/maxTagGasto*100;
                  return (
                    <div key={d.tag} style={{padding:"9px 16px",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                        <span style={{fontSize:12,fontWeight:700,color:"#a78bfa"}}>#{d.tag}</span>
                        <div style={{display:"flex",gap:14,alignItems:"center"}}>
                          {d.ingreso>0&&<span style={{fontSize:11,color:"#00d4aa"}}>+{fmt(d.ingreso)}</span>}
                          {d.gasto>0&&<span style={{fontSize:12,fontWeight:700,color:"#ff6b7a"}}>{fmt(d.gasto)}</span>}
                          <span style={{fontSize:10,color:"#444"}}>{d.count} tx</span>
                        </div>
                      </div>
                      <div style={{height:5,borderRadius:4,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:4,width:`${pct.toFixed(1)}%`,background:"linear-gradient(90deg,#a78bfa,#7c3aed)",transition:"width .4s ease"}}/>
                      </div>
                    </div>
                  );
                })}
              </Card>
              <Card style={{padding:0,overflow:"hidden"}}>
                <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                  <p style={{fontSize:13,fontWeight:700,color:"#f0f0f0",margin:0}}>Tabla completa de tags</p>
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead>
                      <tr style={{background:"rgba(255,255,255,.03)"}}>
                        {["Tag","Gastos","Ingresos","Neto","Txs"].map(h=>(
                          <th key={h} style={{padding:"8px 16px",textAlign:h==="Tag"?"left":"right",fontSize:10,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4,borderBottom:"1px solid rgba(255,255,255,.05)"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tagsOrdenados.map((d,i)=>(
                        <tr key={d.tag} onClick={()=>setTagSel(d.tag===tagSel?"":d.tag)}
                          style={{cursor:"pointer",background:tagSel===d.tag?"rgba(167,139,250,.08)":i%2===0?"transparent":"rgba(255,255,255,.015)",transition:"background .1s"}}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(167,139,250,.06)"}
                          onMouseLeave={e=>e.currentTarget.style.background=tagSel===d.tag?"rgba(167,139,250,.08)":i%2===0?"transparent":"rgba(255,255,255,.015)"}>
                          <td style={{padding:"9px 16px",fontWeight:700,color:"#a78bfa"}}>#{d.tag}</td>
                          <td style={{padding:"9px 16px",textAlign:"right",color:"#ff6b7a"}}>{d.gasto>0?fmt(d.gasto):"—"}</td>
                          <td style={{padding:"9px 16px",textAlign:"right",color:"#00d4aa"}}>{d.ingreso>0?fmt(d.ingreso):"—"}</td>
                          <td style={{padding:"9px 16px",textAlign:"right",fontWeight:700,color:d.neto>=0?"#00d4aa":"#ff4757"}}>{d.neto>=0?"+":""}{fmt(d.neto)}</td>
                          <td style={{padding:"9px 16px",textAlign:"right",color:"#555"}}>{d.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {tagSel&&<p style={{fontSize:10,color:"#555",padding:"6px 16px",margin:0,borderTop:"1px solid rgba(255,255,255,.04)"}}>Click en otra fila para cambiar · click de nuevo para cerrar ↓</p>}
              </Card>
              {tagSel&&(
                <Card style={{padding:0,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <p style={{fontSize:13,fontWeight:700,color:"#a78bfa",margin:0}}>Evolución mensual · <span style={{fontWeight:800}}>#{tagSel}</span></p>
                    <button onClick={()=>setTagSel("")} style={{background:"none",border:"none",cursor:"pointer",color:"#555",fontSize:11}}>✕ cerrar</button>
                  </div>
                  <div style={{padding:"16px",display:"flex",gap:6,alignItems:"flex-end",height:130}}>
                    {evolucionTag.map((m,i)=>{
                      const hG=m.gasto>0?(m.gasto/maxEvo*90):0;
                      const hI=m.ingreso>0?(m.ingreso/maxEvo*90):0;
                      return (
                        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                          <div style={{display:"flex",gap:2,alignItems:"flex-end",height:100}}>
                            {m.gasto>0&&<div style={{width:10,height:`${hG}px`,background:"#ff4757",borderRadius:"3px 3px 0 0",transition:"height .4s"}} title={fmt(m.gasto)}/>}
                            {m.ingreso>0&&<div style={{width:10,height:`${hI}px`,background:"#00d4aa",borderRadius:"3px 3px 0 0",transition:"height .4s"}} title={fmt(m.ingreso)}/>}
                            {m.gasto===0&&m.ingreso===0&&<div style={{width:10,height:3,background:"rgba(255,255,255,.1)",borderRadius:3}}/>}
                          </div>
                          <span style={{fontSize:9,color:"#444"}}>{m.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{padding:"0 16px 12px",display:"flex",gap:14}}>
                    <span style={{fontSize:10,color:"#ff6b7a",display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#ff4757",display:"inline-block"}}/>Gasto</span>
                    <span style={{fontSize:10,color:"#00d4aa",display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#00d4aa",display:"inline-block"}}/>Ingreso</span>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── SUBCOMPONENTE: INPUT DE CATEGORÍA (aislado para evitar pérdida de foco) ──
const CatInput = ({ tipo, onAdd }) => {
  const [nombre, setNombre] = React.useState("");
  const inputRef = React.useRef(null);
  const handleAdd = () => {
    const val = nombre.trim();
    if (!val) return;
    onAdd(tipo, val, () => setNombre(""));
  };
  return (
    <div style={{display:"flex",gap:8}}>
      <input
        ref={inputRef}
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        onKeyDown={e => { if(e.key==="Enter"){ e.preventDefault(); handleAdd(); } }}
        placeholder={`Nueva categoría de ${tipo==="income"?"ingreso":"gasto"}...`}
        style={{flex:1,padding:"9px 13px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",borderRadius:9,color:"#e0e0e0",fontSize:13,outline:"none"}}
      />
      <button
        onClick={handleAdd}
        style={{padding:"9px 16px",borderRadius:9,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#00d4aa,#00a884)",color:"#fff",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}>
        <Ic n="plus" size={13}/>Agregar
      </button>
    </div>
  );
};

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const Settings = () => {
  const { user, toast } = useCtx();
  const [accounts,     setAccounts]     = useData(user.id, "accounts");
  const [transactions, setTransactions] = useData(user.id, "transactions");
  const [transfers,    setTransfers]    = useData(user.id, "transfers");
  const [loans,        setLoans]        = useData(user.id, "loans");
  const [investments,  setInvestments]  = useData(user.id, "investments");
  const [goals,        setGoals]        = useData(user.id, "goals");
  const [recurring,    setRecurring]    = useData(user.id, "recurring");
  const [mortgages,    setMortgages]    = useData(user.id, "mortgages");
  const [presupuestos, setPresupuestos] = useData(user.id, "presupuestos");
  const [documents,    setDocuments]    = useData(user.id, "documents");
  const [config,       setConfig]       = useData(user.id, "config", {});

  const [askConfirm, confirmModal] = useConfirm();
  const [confirmText, setConfirmText] = useState("");
  const [showTotalReset, setShowTotalReset] = useState(false);
  const [editFecha, setEditFecha] = useState(config.fechaInicio||"");

  const DEFAULT_CATS = {
    income:["Salario","Freelance","Negocio","Renta","Intereses","Dividendos","Intereses cobrados","Retiro de inversión","Dividendos e intereses","Ganancia de inversión","Recuperación de capital","Otro"],
    expense:["Alimentación","Transporte","Salud","Educación","Entretenimiento","Ropa","Servicios","Hipoteca / Vivienda","Pago de deuda","Pérdida de inversión","Abono a capital","Otro"],
  };
  // Unión de: DEFAULT + guardadas en config + en uso real en transacciones
  // Así nunca se pierde una categoría aunque config.categorias se haya reseteado
  const catsEnUso = {
    income:  [...new Set(transactions.filter(t=>t.type==="income"&&t.category).map(t=>t.category))],
    expense: [...new Set(transactions.filter(t=>t.type==="expense"&&t.category).map(t=>t.category))],
  };
  const cats = {
    income:  [...new Set([...DEFAULT_CATS.income,  ...(config.categorias?.income  ||[]), ...catsEnUso.income])],
    expense: [...new Set([...DEFAULT_CATS.expense, ...(config.categorias?.expense ||[]), ...catsEnUso.expense])],
  };
  const addCat = (tipo, nombre, onClear) => {
    if (!nombre) { toast("Escribe el nombre de la categoría","error"); return; }
    if (cats[tipo].includes(nombre)) { toast("Ya existe esa categoría","error"); return; }
    setConfig(c=>({...c, categorias:{...c.categorias, [tipo]:[...cats[tipo], nombre]}}));
    if (onClear) onClear();
    toast(`Categoría "${nombre}" guardada ✓`);
  };
  const delCat = (tipo, cat) => {
    // Solo elimina de config, no de transacciones existentes
    const sinEsta = cats[tipo].filter(x=>x!==cat&&!DEFAULT_CATS[tipo].includes(x));
    setConfig(c=>({...c, categorias:{...c.categorias, [tipo]:[...DEFAULT_CATS[tipo].filter(d=>cats[tipo].includes(d)&&d!==cat), ...sinEsta]}}));
    toast("Categoría eliminada");
  };

  const saveFecha = () => {
    setConfig({...config, fechaInicio: editFecha||null});
    toast("Fecha de inicio actualizada.","success");
  };

  const exportar = () => {
    const data = {
      version: "2.0",
      exportDate: new Date().toISOString(),
      user: { name: user.name, email: user.email },
      accounts, transactions, transfers, loans, investments,
      goals, recurring, mortgages, presupuestos, documents, config,
      patrimonio_snaps: JSON.parse(localStorage.getItem(`fp_data_${user.id}_patrimonio_snaps`)||"[]"),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `Finanzapp_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Backup exportado: ${transactions.length} tx · ${accounts.length} cuentas · ${investments.length} inversiones ✓`,"success");
  };

  const importarBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        // validate
        if (!data.exportDate) { toast("Archivo no válido — no parece un backup de Finanzapp","error"); return; }
        const ok = await askConfirm(
          `¿Restaurar backup del ${new Date(data.exportDate).toLocaleDateString("es-MX")}?\n\nEsto REEMPLAZARÁ todos tus datos actuales con los del backup.`
        );
        if (!ok) return;
        if (data.accounts)     setAccounts(data.accounts);
        if (data.transactions) setTransactions(data.transactions);
        if (data.transfers)    setTransfers(data.transfers);
        if (data.loans)        setLoans(data.loans);
        if (data.investments)  setInvestments(data.investments);
        if (data.goals)        setGoals(data.goals);
        if (data.recurring)    setRecurring(data.recurring);
        if (data.mortgages)    setMortgages(data.mortgages);
        if (data.presupuestos) setPresupuestos(data.presupuestos);
        if (data.documents)    setDocuments(data.documents);
        if (data.config)       setConfig(data.config);
        if (data.patrimonio_snaps) {
          try { localStorage.setItem(`fp_data_${user.id}_patrimonio_snaps`, JSON.stringify(data.patrimonio_snaps)); } catch{}
        }
        toast("✅ Backup restaurado correctamente","success");
      } catch(err) {
        toast("Error al leer el archivo — verifica que sea un backup válido","error");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset input
  };

  const resetModulo = async (nombre, setter) => {
    const ok = await askConfirm(`¿Borrar todos los datos de ${nombre}? Esta acción no puede deshacerse.`);
    if (!ok) return;
    setter([]);
    toast(`${nombre} limpiado.`, "warning");
  };

  const modulos = [
    { label:"Transacciones", setter:setTransactions, data:transactions,  warn:"Los saldos de tus cuentas NO se revertirán automáticamente." },
    { label:"Transferencias", setter:setTransfers,   data:transfers,     warn:null },
    { label:"Préstamos",      setter:setLoans,       data:loans,         warn:"Los saldos de cuentas afectados NO se revertirán." },
    { label:"Inversiones",    setter:setInvestments, data:investments,   warn:null },
    { label:"Cuentas",        setter:setAccounts,    data:accounts,      warn:"Borrar cuentas dejará otros registros sin cuenta asignada." },
  ];

  const resetTotal = () => {
    if (confirmText.trim().toUpperCase() !== "BORRAR TODO") {
      toast("Escribe exactamente: BORRAR TODO","error"); return;
    }
    setAccounts([]); setTransactions([]); setTransfers([]);
    setLoans([]); setInvestments([]); setConfig({});
    setConfirmText(""); setShowTotalReset(false);
    toast("Todos los datos han sido eliminados.","warning");
  };

  const Section = ({title, color="#00d4aa", children}) => (
    <div style={{marginBottom:24}}>
      <p style={{fontSize:11,color,textTransform:"uppercase",letterSpacing:.8,fontWeight:800,marginBottom:12}}>{title}</p>
      {children}
    </div>
  );

  return (
    <div>
      <h2 style={{fontSize:21,fontWeight:700,color:"#f0f0f0",marginBottom:3}}>Configuración</h2>
      <p style={{fontSize:13,color:"#555",marginBottom:24}}>Preferencias, respaldo y gestión de datos</p>

      <Section title="Preferencias Generales">
        <Card>
          <p style={{fontSize:13,color:"#ccc",marginBottom:6}}>Tipo de cambio USD → MXN</p>
          <p style={{fontSize:12,color:"#555",marginBottom:14,lineHeight:1.6}}>
            Se usa en toda la app para convertir cuentas, inversiones y reportes en dólares.
          </p>
          {/* badge auto */}
          {config.tcAuto && (
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,padding:"6px 12px",background:"rgba(0,212,170,.08)",border:"1px solid rgba(0,212,170,.2)",borderRadius:8}}>
              <span style={{fontSize:11,color:"#00d4aa",fontWeight:700}}>✓ Actualización automática activa</span>
              <span style={{fontSize:10,color:"#555"}}>
                Última actualización: {config.tcFecha ? new Date(config.tcFecha).toLocaleString("es-MX",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) : "—"}
              </span>
            </div>
          )}
          <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:160}}>
              <Inp label="1 USD = ? MXN (o déjalo automático)" type="number" value={config.tipoCambio||""} onChange={e=>setConfig(c=>({...c,tipoCambio:e.target.value,tcAuto:false}))} placeholder="Ej. 17.50"/>
            </div>
            <Btn onClick={()=>{
              fetch("https://open.er-api.com/v6/latest/USD")
                .then(r=>r.json())
                .then(data=>{
                  const tc=data?.rates?.MXN;
                  if(tc&&tc>10&&tc<30){
                    setConfig(c=>({...c,tipoCambio:tc.toFixed(2),tcAuto:true,tcFecha:new Date().toISOString()}));
                    toast(`TC actualizado: $${tc.toFixed(2)} MXN ✓`,"success");
                  }
                })
                .catch(()=>toast("No se pudo conectar a la API","error"));
            }} style={{marginBottom:14,background:"linear-gradient(135deg,#00d4aa,#00a884)"}}><Ic n="chart" size={15}/>Actualizar ahora</Btn>
          </div>
          <p style={{fontSize:11,color:"#444",margin:0}}>
            Valor actual: <strong style={{color:"#00d4aa"}}>${config.tipoCambio||"17.50"} MXN</strong> por USD
            {!config.tcAuto && <span style={{color:"#555"}}> · Manual</span>}
          </p>
        </Card>
      </Section>

      <Section title="Reportes — Fecha de Inicio">
        <Card>
          <p style={{fontSize:13,color:"#ccc",marginBottom:6}}>Fecha de inicio del período de análisis</p>
          <p style={{fontSize:12,color:"#555",marginBottom:14,lineHeight:1.6}}>
            Todo lo registrado antes de esta fecha se tratará como capital preexistente y no afectará el flujo de caja en Reportes.
          </p>
          <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:180}}>
              <Inp label="Fecha de inicio" type="date" value={editFecha} onChange={e=>setEditFecha(e.target.value)}/>
            </div>
            <Btn onClick={saveFecha} style={{marginBottom:14}}><Ic n="check" size={15}/>Guardar</Btn>
            {editFecha && <button onClick={()=>{setEditFecha("");setConfig({...config,fechaInicio:null});toast("Fecha de inicio eliminada.","warning");}}
              style={{background:"none",border:"none",color:"#555",fontSize:12,cursor:"pointer",marginBottom:14,textDecoration:"underline"}}>Quitar fecha</button>}
          </div>
          {config.fechaInicio && <p style={{fontSize:12,color:"#00d4aa",margin:0}}>✓ Activa: {new Date(config.fechaInicio+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}</p>}
        </Card>
      </Section>

      <Section title="Categorías">
        <Card>
          <p style={{fontSize:12,color:"#555",marginBottom:16,lineHeight:1.5}}>
            Personaliza las categorías de ingresos y gastos. Se usan en Transacciones, Recurrentes, Presupuestos y Reportes.
          </p>
          {["expense","income"].map(tipo=>(
            <div key={tipo} style={{marginBottom:22,paddingBottom:20,borderBottom:tipo==="expense"?"1px solid rgba(255,255,255,.05)":"none"}}>
              <p style={{fontSize:13,fontWeight:700,color:tipo==="income"?"#00d4aa":"#ff4757",marginBottom:10}}>
                {tipo==="income"?"💚 Ingresos":"🔴 Gastos"}
              </p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12,minHeight:28}}>
                {cats[tipo].map(cat=>(
                  <div key={cat} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:"4px 12px 4px 10px"}}>
                    <span style={{fontSize:12,color:"#ddd"}}>{cat}</span>
                    <button onClick={()=>delCat(tipo,cat)}
                      style={{background:"rgba(255,71,87,.15)",border:"none",cursor:"pointer",color:"#ff4757",width:16,height:16,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",padding:0,flexShrink:0}}>
                      <Ic n="close" size={10}/>
                    </button>
                  </div>
                ))}
              </div>
              <CatInput tipo={tipo} onAdd={addCat} />
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Respaldo de Datos">
        <Card>
          <p style={{fontSize:13,fontWeight:700,color:"#e0e0e0",marginBottom:4}}>Exportar backup completo</p>
          <p style={{fontSize:12,color:"#555",marginBottom:12,lineHeight:1.6}}>
            Descarga un archivo JSON con <strong style={{color:"#888"}}>todos tus módulos</strong>: cuentas, transacciones, préstamos, inversiones, metas, recurrentes, hipotecas, presupuestos y documentos.
          </p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:10}}>
            <Btn onClick={exportar}><Ic n="download" size={15}/>Exportar backup (.json)</Btn>
            <span style={{fontSize:11,color:"#444"}}>
              {accounts.length} cuentas · {transactions.length} tx · {loans.length} préstamos · {investments.length} inversiones · {goals.length} metas · {documents.length} docs
            </span>
          </div>
        </Card>
        <Card style={{marginTop:10,borderColor:"rgba(59,130,246,.2)"}}>
          <p style={{fontSize:13,fontWeight:700,color:"#e0e0e0",marginBottom:4}}>Restaurar desde backup</p>
          <p style={{fontSize:12,color:"#555",marginBottom:12,lineHeight:1.6}}>
            Carga un archivo de backup previo. <span style={{color:"#f39c12",fontWeight:600}}>⚠️ Reemplaza todos los datos actuales.</span> Se pedirá confirmación antes de proceder.
          </p>
          <label style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 16px",background:"rgba(59,130,246,.12)",border:"1px solid rgba(59,130,246,.3)",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:700,color:"#60a5fa"}}>
            <Ic n="back" size={15} color="#60a5fa"/>
            Restaurar backup (.json)
            <input type="file" accept=".json" onChange={importarBackup} style={{display:"none"}}/>
          </label>
        </Card>
      </Section>

      <Section title="Limpiar Módulo" color="#f39c12">
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {modulos.map(m=>(
            <Card key={m.label} style={{borderColor:"rgba(243,156,18,.12)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                <div>
                  <p style={{fontSize:13,fontWeight:600,color:"#e0e0e0",margin:"0 0 3px"}}>{m.label}</p>
                  <p style={{fontSize:11,color:"#555",margin:0}}>{m.data.length} registro{m.data.length!==1?"s":""}</p>
                  {m.warn && <p style={{fontSize:11,color:"#f39c12",margin:"4px 0 0"}}>⚠️ {m.warn}</p>}
                </div>
                <button
                  onClick={()=>resetModulo(m.label, m.setter)}
                  disabled={m.data.length===0}
                  style={{padding:"7px 14px",background:m.data.length===0?"transparent":"rgba(243,156,18,.08)",
                    border:m.data.length===0?"1px solid rgba(255,255,255,.06)":"1px solid rgba(243,156,18,.25)",
                    borderRadius:9,color:m.data.length===0?"#444":"#f39c12",fontSize:12,cursor:m.data.length===0?"not-allowed":"pointer",fontWeight:600,whiteSpace:"nowrap"}}>
                  Limpiar {m.label}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Zona de Peligro" color="#ff4757">
        <Card style={{borderColor:"rgba(255,71,87,.2)",background:"rgba(255,71,87,.03)"}}>
          <p style={{fontSize:13,fontWeight:600,color:"#ff4757",marginBottom:6}}>⚠️ Borrar todos los datos</p>
          <p style={{fontSize:12,color:"#888",marginBottom:14,lineHeight:1.6}}>
            Elimina permanentemente todos tus datos. <strong style={{color:"#ff4757"}}>Esta acción es irreversible.</strong>
          </p>
          {!showTotalReset ? (
            <button onClick={()=>setShowTotalReset(true)}
              style={{padding:"9px 18px",background:"rgba(255,71,87,.1)",border:"1px solid rgba(255,71,87,.3)",borderRadius:9,color:"#ff4757",fontSize:13,cursor:"pointer",fontWeight:600}}>
              Quiero borrar todo
            </button>
          ) : (
            <div>
              <p style={{fontSize:13,color:"#ccc",marginBottom:10}}>
                Escribe <strong style={{color:"#ff4757",letterSpacing:1}}>BORRAR TODO</strong> para confirmar:
              </p>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                <input value={confirmText} onChange={e=>setConfirmText(e.target.value)} placeholder="BORRAR TODO"
                  style={{flex:1,minWidth:160,padding:"9px 12px",background:"rgba(255,255,255,.05)",
                    border:`1px solid ${confirmText.trim().toUpperCase()==="BORRAR TODO"?"#ff4757":"rgba(255,255,255,.1)"}`,
                    borderRadius:9,color:"#e0e0e0",fontSize:13,outline:"none"}}/>
                <button onClick={resetTotal}
                  disabled={confirmText.trim().toUpperCase()!=="BORRAR TODO"}
                  style={{padding:"9px 18px",
                    background:confirmText.trim().toUpperCase()==="BORRAR TODO"?"#ff4757":"rgba(255,255,255,.04)",
                    border:"none",borderRadius:9,
                    color:confirmText.trim().toUpperCase()==="BORRAR TODO"?"#fff":"#555",
                    fontSize:13,cursor:confirmText.trim().toUpperCase()==="BORRAR TODO"?"pointer":"not-allowed",fontWeight:700}}>
                  Confirmar borrado
                </button>
                <button onClick={()=>{setShowTotalReset(false);setConfirmText("");}}
                  style={{background:"none",border:"none",color:"#555",fontSize:12,cursor:"pointer",textDecoration:"underline"}}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </Card>
      </Section>

      {confirmModal}
    </div>
  );
};

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
