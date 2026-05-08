// Módulo de Dashboard (vista cruzada de toda la app).
// Extraído de App.jsx el 08-may-2026 (sexto módulo real del refactor).
// Incluye 3 componentes:
//   - AlertasPanel: panel desplegable de alertas con marcado de leídas
//   - LineChartPatrimonio: gráfica de patrimonio con selector de rango
//   - Dashboard: vista principal (incluye BarChartMini y todos los calc* inline)
// REGLA: este módulo NO importa de App.jsx ni de otros módulos.
// Solo importa de react, ../utils y ../shared.
// NOTA: ProyeccionFlujo y ComparativoCategorias quedaron en App.jsx por ser
// dead code (cero usos) — pendiente cleanup en commit separado.

import React, { useState } from "react";
import { fmt, today, genId } from "../utils";
import { useCtx, useData, getTc, Card, Btn, Ic } from "../shared";

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
      // Si día_inicio > día_corte, primer corte es 2 meses después (no 1) — ver Mortgage.jsx proxVencimiento.
      const inicio = new Date((m.fechaInicio||today())+"T12:00:00");
      const diaInicio = inicio.getDate();
      const diaCorte = parseInt(m.diaCorte)||1;
      const offsetPrimerCorte = diaInicio > diaCorte ? 2 : 1;
      const d = new Date(inicio);
      d.setMonth(d.getMonth() + offsetPrimerCorte + pagados);
      d.setDate(diaCorte);
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

export default Dashboard;
