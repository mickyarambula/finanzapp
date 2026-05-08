// Módulo de Inversiones (acciones, ETFs, criptos, otros).
// Extraído de App.jsx el 08-may-2026 (quinto módulo real del refactor).
// Incluye sub-componente PortafolioChart usado solo aquí.
// SeccionHeader, CardGrande y TablaCripto son inline dentro de Investments.
// REGLA: este módulo NO importa de App.jsx ni de otros módulos.
// Solo importa de react, ../utils y ../shared.

import React, { useState } from "react";
import { fmt, fmtDate, today, genId } from "../utils";
import {
  useCtx, useData, useConfirm, getTc,
  Card, Btn, Modal, Inp, Sel, Ic, Badge, Actions, HelpTip,
} from "../shared";

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

export default Investments;
