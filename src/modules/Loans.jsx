// Módulo de Préstamos (otorgados + recibidos).
// Extraído de App.jsx el 22-abr-2026 (cuarto módulo real del refactor).
// Incluye sub-componentes usados solo aquí: AmortizacionChart, CorteGlobalPanel,
// TramosPanel, CorteMensual. LoanCard se define inline dentro de Loans.
// REGLA: este módulo NO importa de App.jsx ni de otros módulos.
// Solo importa de react, ../utils y ../shared.

import React, { useState } from "react";
import { fmt, fmtDate, today, genId } from "../utils";
import {
  useCtx, useData, useConfirm,
  Card, Btn, Modal, Inp, Sel, Ic, Badge, Actions, HelpTip, Alert,
} from "../shared";

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

export default Loans;
