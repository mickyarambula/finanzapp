// Módulo de Crédito Hipotecario.
// Extraído de App.jsx el 22-abr-2026 (segundo módulo real del refactor).
// Incluye SimuladorLiquidacion (sub-componente usado solo aquí).
// REGLA: este módulo NO importa de App.jsx ni de otros módulos.
// Solo importa de react, ../utils y ../shared.

import React, { useState } from "react";
import { fmt, fmtDate, today, genId } from "../utils";
import {
  useCtx, useData, useConfirm,
  Card, Btn, Modal, Inp, Sel, Ic, Badge, Actions, HelpTip,
} from "../shared";

const SimuladorLiquidacion = ({ m, prog, calcAmort, fmt, cur2 }) => {
  const [simAnios, setSimAnios] = useState("7");
  const [simAportacion, setSimAportacion] = useState("");
  const [simModo, setSimModo] = useState("anios");

  const saldoActual = prog.saldoActual;
  const tasaMensual = (parseFloat(m.tasaAnual)||0)/100/12;
  const seg = {seguroVida:m.seguroVida,seguroVidaTipo:m.seguroVidaTipo||"proporcional",seguroDanos:m.seguroDanos,adminCredito:m.adminCredito};
  const {cuota:cuotaBase} = calcAmort(m.monto,m.tasaAnual,m.plazoAnios,m.tipo,[],seg);
  const cuotaReal = m.cuotaReal ? parseFloat(m.cuotaReal) : cuotaBase;
  const mesesRestantes = prog.tabla.length - prog.totalPagos;

  const calcAportacionParaAnios = (anios) => {
    const mesesMeta = anios * 12;
    const r = tasaMensual;
    if (!r||!saldoActual||mesesMeta<=0) return 0;
    const cuotaNecesaria = saldoActual * (r*Math.pow(1+r,mesesMeta))/(Math.pow(1+r,mesesMeta)-1);
    return Math.max(0, cuotaNecesaria - cuotaBase);
  };

  const calcMesesConAportacion = (aportExtra) => {
    if (!tasaMensual||!saldoActual) return null;
    let saldo = saldoActual;
    for (let mes=1; mes<=600; mes++) {
      const interes = saldo * tasaMensual;
      const abonoCapital = cuotaBase - interes + (aportExtra||0);
      if (abonoCapital <= 0) return null;
      saldo = saldo - abonoCapital;
      if (saldo <= 0) return mes;
    }
    return null;
  };

  const calcProyAnual = (aportExtra) => {
    let saldo = saldoActual;
    const rows = [];
    let intAnio = 0;
    let anio = 1;
    for (let mes=1; mes<=600; mes++) {
      const interes = saldo * tasaMensual;
      const abonoCapital = cuotaBase - interes + (aportExtra||0);
      if (abonoCapital <= 0) break;
      saldo = Math.max(saldo - abonoCapital, 0);
      intAnio += interes;
      if (mes % 12 === 0 || saldo <= 0) {
        rows.push({ anio, saldoFin: saldo, interesesAnio: intAnio });
        intAnio = 0;
        anio++;
        if (saldo <= 0) break;
      }
    }
    return rows;
  };

  // Intereses restantes sin estrategia
  const {totalIntereses:intTotal} = calcAmort(m.monto,m.tasaAnual,m.plazoAnios,m.tipo,m.pagosCapital||[],seg);
  const intOriginalRestante = intTotal - prog.totalInteresesPagados;

  const aniosMeta = parseInt(simAnios)||7;
  const aportNecesaria = calcAportacionParaAnios(aniosMeta);
  const aportExtra = simModo==="anios" ? aportNecesaria : (parseFloat(simAportacion)||0);
  const mesesConAport = simModo==="anios" ? aniosMeta*12 : calcMesesConAportacion(aportExtra);
  const proyAnual = calcProyAnual(aportExtra);
  const intConAport = proyAnual.reduce((s,r)=>s+r.interesesAnio,0);
  const ahorro = intOriginalRestante - intConAport;
  const pagoTotalMensual = cuotaReal + aportExtra;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Selector modo */}
      <div style={{display:"flex",gap:3,background:"rgba(255,255,255,.04)",borderRadius:10,padding:3,width:"fit-content"}}>
        {[{id:"anios",label:"Quiero liquidar en X años"},{id:"monto",label:"Puedo aportar $X/mes"}].map(o=>(
          <button key={o.id} onClick={()=>setSimModo(o.id)}
            style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
              background:simModo===o.id?"linear-gradient(135deg,#7c3aed,#5b21b6)":"transparent",
              color:simModo===o.id?"#fff":"#666"}}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <Card style={{borderColor:"rgba(124,58,237,.2)",background:"rgba(124,58,237,.04)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,alignItems:"end"}}>
          {simModo==="anios" ? (
            <div>
              <label style={{fontSize:11,color:"#7c3aed",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:6}}>Liquidar en (años)</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[3,5,7,10,15].map(a=>(
                  <button key={a} onClick={()=>setSimAnios(String(a))}
                    style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${simAnios==String(a)?"rgba(124,58,237,.5)":"rgba(255,255,255,.08)"}`,
                      background:simAnios==String(a)?"rgba(124,58,237,.2)":"transparent",
                      color:simAnios==String(a)?"#a78bfa":"#666",cursor:"pointer",fontSize:13,fontWeight:600}}>
                    {a}a
                  </button>
                ))}
                <input type="number" value={simAnios} onChange={e=>setSimAnios(e.target.value)}
                  style={{width:70,padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#e0e0e0",fontSize:13,outline:"none"}}/>
              </div>
            </div>
          ) : (
            <div>
              <label style={{fontSize:11,color:"#7c3aed",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:6}}>Aportación extra mensual</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                {[5000,10000,15000,20000].map(a=>(
                  <button key={a} onClick={()=>setSimAportacion(String(a))}
                    style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${simAportacion==String(a)?"rgba(124,58,237,.5)":"rgba(255,255,255,.08)"}`,
                      background:simAportacion==String(a)?"rgba(124,58,237,.2)":"transparent",
                      color:simAportacion==String(a)?"#a78bfa":"#666",cursor:"pointer",fontSize:11,fontWeight:600}}>
                    {fmt(a)}
                  </button>
                ))}
                <input type="number" value={simAportacion} onChange={e=>setSimAportacion(e.target.value)} placeholder="Otro monto"
                  style={{width:130,padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#e0e0e0",fontSize:13,outline:"none"}}/>
              </div>
            </div>
          )}
          <div>
            <p style={{fontSize:11,color:"#555",margin:"0 0 4px"}}>Saldo actual a liquidar</p>
            <p style={{fontSize:22,fontWeight:800,color:"#f39c12",margin:0}}>{fmt(saldoActual,cur2)}</p>
            <p style={{fontSize:10,color:"#444",margin:"2px 0 0"}}>{mesesRestantes} meses restantes en plazo original</p>
          </div>
        </div>
      </Card>

      {/* KPIs resultado */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10}}>
        <Card style={{borderColor:"rgba(124,58,237,.3)",background:"rgba(124,58,237,.06)",textAlign:"center",padding:"16px"}}>
          <p style={{fontSize:10,color:"#a78bfa",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 6px"}}>
            {simModo==="anios"?"Aportación mensual necesaria":"Liquidarás en"}
          </p>
          {simModo==="anios" ? (
            <><p style={{fontSize:24,fontWeight:800,color:"#a78bfa",margin:"0 0 2px"}}>{fmt(aportNecesaria,cur2)}</p>
            <p style={{fontSize:11,color:"#666"}}>extra sobre tu cuota mensual</p></>
          ) : (
            <><p style={{fontSize:24,fontWeight:800,color:"#a78bfa",margin:"0 0 2px"}}>
              {mesesConAport ? `${(mesesConAport/12).toFixed(1)} años` : "—"}
            </p>
            <p style={{fontSize:11,color:"#666"}}>{mesesConAport?`${mesesConAport} meses`:"Ingresa un monto"}</p></>
          )}
        </Card>
        <Card style={{borderColor:"rgba(0,212,170,.25)",background:"rgba(0,212,170,.04)",textAlign:"center",padding:"16px"}}>
          <p style={{fontSize:10,color:"#00d4aa",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 6px"}}>Ahorro en intereses</p>
          <p style={{fontSize:24,fontWeight:800,color:"#00d4aa",margin:"0 0 2px"}}>{ahorro>0?fmt(ahorro,cur2):"—"}</p>
          <p style={{fontSize:11,color:"#666"}}>vs seguir el plazo original</p>
        </Card>
        <Card style={{textAlign:"center",padding:"16px"}}>
          <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 6px"}}>Pago mensual total</p>
          <p style={{fontSize:24,fontWeight:800,color:"#ccc",margin:"0 0 2px"}}>{fmt(pagoTotalMensual,cur2)}</p>
          <p style={{fontSize:11,color:"#666"}}>cuota + aportación extra</p>
        </Card>
        <Card style={{borderColor:"rgba(255,71,87,.2)",background:"rgba(255,71,87,.04)",textAlign:"center",padding:"16px"}}>
          <p style={{fontSize:10,color:"#ff6b7a",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 6px"}}>Intereses con estrategia</p>
          <p style={{fontSize:24,fontWeight:800,color:"#ff6b7a",margin:"0 0 2px"}}>{fmt(intConAport,cur2)}</p>
          <p style={{fontSize:11,color:"#666"}}>vs {fmt(intOriginalRestante,cur2)} sin estrategia</p>
        </Card>
      </div>

      {/* Tabla año a año */}
      {proyAnual.length>0&&(
        <Card>
          <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Proyección año a año</p>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                {["Año","Saldo final","Intereses del año","Aport. capital/año","Pago mensual"].map(h=>(
                  <th key={h} style={{padding:"8px 12px",textAlign:"right",color:"#555",fontWeight:600}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {proyAnual.map((r)=>(
                  <tr key={r.anio} style={{borderBottom:"1px solid rgba(255,255,255,.03)",background:r.saldoFin<=0?"rgba(0,212,170,.06)":"transparent"}}>
                    <td style={{padding:"8px 12px",color:"#888",textAlign:"right",fontWeight:600}}>Año {r.anio}</td>
                    <td style={{padding:"8px 12px",color:r.saldoFin<=0?"#00d4aa":"#ccc",textAlign:"right",fontWeight:r.saldoFin<=0?800:400}}>
                      {r.saldoFin<=0?"✓ Liquidado":fmt(r.saldoFin,cur2)}
                    </td>
                    <td style={{padding:"8px 12px",color:"#f39c12",textAlign:"right"}}>{fmt(r.interesesAnio,cur2)}</td>
                    <td style={{padding:"8px 12px",color:"#7c3aed",textAlign:"right"}}>{fmt(aportExtra*12,cur2)}</td>
                    <td style={{padding:"8px 12px",color:"#ccc",textAlign:"right"}}>{fmt(pagoTotalMensual,cur2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{marginTop:10,padding:"10px 12px",background:"rgba(255,255,255,.03)",borderRadius:9,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <span style={{fontSize:12,color:"#555"}}>Intereses totales: <strong style={{color:"#f39c12"}}>{fmt(intConAport,cur2)}</strong></span>
            {ahorro>0&&<span style={{fontSize:13,fontWeight:700,color:"#00d4aa"}}>💰 Ahorras {fmt(ahorro,cur2)} en intereses</span>}
          </div>
        </Card>
      )}
    </div>
  );
};

const Mortgage = () => {
  const { user, toast } = useCtx();
  const [mortgages, setMortgages] = useData(user.id, "mortgages");
  const [accounts, setAccounts] = useData(user.id, "accounts");
  const [transactions, setTransactions] = useData(user.id, "transactions");
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [askConfirm, confirmModal] = useConfirm();
  const [tab, setTab] = useState("resumen");

  // ── modales de pago
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showCapModal, setShowCapModal]   = useState(false);
  const [editPago, setEditPago]           = useState(null); // pago en edición
  const [pagoForm, setPagoForm]           = useState({});
  const [capForm,  setCapForm]            = useState({ monto:"", fecha:today(), cuentaId:"", notas:"" });

  // ── form crédito
  const emptyForm = {
    nombre:"", tipo:"fijo", moneda:"MXN", valorPropiedad:"", enganche:"",
    engancheCuentaId:"", cuentaId:"", monto:"", tasaAnual:"", plazoAnios:"",
    cuotaReal:"", // cuota real del banco (opcional)
    seguroVida:"", seguroVidaTipo:"proporcional", // "proporcional" (% del saldo) o "fijo" ($)
    seguroDanos:"", adminCredito:"", // seguros y cargos fijos mensuales
    diaCorte:1,   // día del mes para vencimiento
    fechaInicio:today(), banco:"", notas:"", pagosRealizados:[], pagosCapital:[],
  };
  const [form, setForm] = useState(emptyForm);
  const f = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}));

  // ── simulador
  const emptySim = { moneda:"MXN", valorPropiedad:"", enganche:"", tasaAnual:"", plazoAnios:"30", tipo:"fijo" };
  const [sim, setSim] = useState(emptySim);
  const sf = (k) => (e) => setSim(p=>({...p,[k]:e.target.value}));

  // ── cálculo de amortización (respeta pagos a capital anticipados)
  const calcAmort = (monto, tasaAnual, plazoAnios, tipo="fijo", pagosCapAnticipados=[], seguros={}) => {
    const P = parseFloat(monto) || 0;
    const n = (parseFloat(plazoAnios) || 0) * 12;
    const r = (parseFloat(tasaAnual) || 0) / 100 / 12;
    if (!P || !n || !r) return { cuota:0, tabla:[], totalPagar:0, totalIntereses:0 };
    const cuotaBase = tipo==="fijo"
      ? (P * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1)
      : P / n;
    // Seguro de vida: proporcional al saldo (Banorte: 0.441384% anual) o monto fijo
    const segVidaVal   = parseFloat(seguros.seguroVida)||0;
    const segVidaTipo  = seguros.seguroVidaTipo||"proporcional";
    // Si proporcional: la tasa se calibra para que con saldo inicial dé el monto capturado
    const tasaSegVida  = (segVidaTipo==="proporcional" && segVidaVal>0 && P>0)
      ? (segVidaVal * 12 / P)  // tasa anual implícita del seguro
      : 0;
    const segDanos = parseFloat(seguros.seguroDanos)||0;
    const admin    = parseFloat(seguros.adminCredito)||0;
    let saldo = P;
    const tabla = [];
    let totalPagar = 0;
    let totalCargosExtras = 0;
    for (let i=1; i<=n; i++) {
      const capExtra = (pagosCapAnticipados||[]).filter(p=>p.mes===i).reduce((s,p)=>s+parseFloat(p.monto),0);
      if (capExtra > 0) saldo = Math.max(saldo - capExtra, 0);
      if (saldo <= 0) break;
      const interes = saldo * r;
      const capital = tipo==="fijo" ? Math.min(cuotaBase - interes, saldo) : Math.min(P/n, saldo);
      const pagoCapInt = tipo==="fijo" ? cuotaBase : capital + interes;
      // Seguro de vida: proporcional al saldo actual de este mes
      const segVidaMes = segVidaTipo==="proporcional" ? saldo * tasaSegVida / 12 : segVidaVal;
      const cargosExtra = segVidaMes + segDanos + admin;
      const pagoTotal = pagoCapInt + cargosExtra;
      saldo = Math.max(saldo - capital, 0);
      totalPagar += pagoTotal;
      totalCargosExtras += cargosExtra;
      tabla.push({ mes:i, pago:pagoTotal, pagoCapInt, capital, interes,
        segVida:segVidaMes, segDanos, admin, cargosExtra, saldo });
      if (saldo <= 0.01) break;
    }
    return {
      cuota: tipo==="fijo"?cuotaBase:tabla[0]?.pagoCapInt||0,
      cuotaTotal:(tabla[0]?.pago||0),
      tabla, totalPagar,
      totalIntereses: totalPagar - P - totalCargosExtras
    };
  };

  // ── fecha de próximo vencimiento
  const proxVencimiento = (m) => {
    const pagados = (m.pagosRealizados||[]).length;
    const inicio = new Date(m.fechaInicio + "T12:00:00");
    const d = new Date(inicio);
    d.setMonth(d.getMonth() + pagados + 1);
    d.setDate(parseInt(m.diaCorte)||1);
    return d.toISOString().split("T")[0];
  };

  const diasParaVencer = (m) => {
    const venc = new Date(proxVencimiento(m) + "T12:00:00");
    const hoy  = new Date();
    hoy.setHours(12,0,0,0);
    return Math.round((venc - hoy) / 86400000);
  };

  // ── calcular avance considerando pagos a capital
  const calcProgreso = (m) => {
    const seg = {seguroVida:m.seguroVida,seguroVidaTipo:m.seguroVidaTipo||"proporcional",seguroDanos:m.seguroDanos,adminCredito:m.adminCredito};
    const { tabla } = calcAmort(m.monto, m.tasaAnual, m.plazoAnios, m.tipo, m.pagosCapital||[], seg);
    const pagados = (m.pagosRealizados||[]).length;
    const saldoActual = tabla[pagados]?.saldo ?? parseFloat(m.monto);
    const capitalAmortizado = parseFloat(m.monto) - saldoActual;
    const porcentaje = parseFloat(m.monto) > 0 ? (capitalAmortizado / parseFloat(m.monto)) * 100 : 0;
    const cuotaSig = tabla[pagados];
    const totalInteresesPagados = (m.pagosRealizados||[]).reduce((s,p)=>s+(p.interes||0),0);
    const totalCapitalExtra = (m.pagosCapital||[]).reduce((s,p)=>s+parseFloat(p.monto),0);
    return { saldoActual, capitalAmortizado, porcentaje, cuotaSig, totalInteresesPagados, totalPagos: pagados, tabla, totalCapitalExtra };
  };

  // ── guardar crédito (con descuento de enganche de cuenta)
  const guardar = () => {
    if (!form.nombre || !form.monto || !form.tasaAnual || !form.plazoAnios) {
      toast("Completa los campos obligatorios","error"); return;
    }
    const engancheNum = parseFloat(form.enganche)||0;
    if (!form.id && engancheNum > 0 && form.engancheCuentaId) {
      const cta = accounts.find(a=>a.id===form.engancheCuentaId);
      if (!cta) { toast("Cuenta de enganche no encontrada","error"); return; }
      if (parseFloat(cta.balance||0) < engancheNum) { toast(`Saldo insuficiente en ${cta.name}","error`); return; }
      setAccounts(p=>p.map(a=>a.id===form.engancheCuentaId
        ? {...a, balance: parseFloat(a.balance||0) - engancheNum }
        : a
      ));
    }
    if (form.id) {
      setMortgages(p=>p.map(m=>m.id===form.id?{...form}:m));
      toast("Crédito actualizado");
    } else {
      setMortgages(p=>[...p,{...form,id:genId(),creadoEn:today()}]);
      toast("Crédito registrado ✓");
    }
    setShowForm(false); setForm(emptyForm);
  };

  const eliminar = async (id) => {
    const ok = await askConfirm("¿Eliminar este crédito hipotecario? Esta acción no se puede deshacer.");
    if (!ok) return;

    const m = mortgages.find(x=>x.id===id);
    if (m) {
      // calcular total descontado de cada cuenta
      const movimientos = {}; // cuentaId → monto acumulado
      const add = (cuentaId, monto) => {
        if (!cuentaId || !monto) return;
        movimientos[cuentaId] = (movimientos[cuentaId]||0) + parseFloat(monto);
      };
      // enganche
      add(m.engancheCuentaId, m.enganche);
      // mensualidades
      (m.pagosRealizados||[]).forEach(p => add(p.cuentaId, p.pago));
      // pagos a capital
      (m.pagosCapital||[]).forEach(p => add(p.cuentaId, p.monto));

      const cuentasAfectadas = Object.keys(movimientos).filter(k=>k&&movimientos[k]>0);

      if (cuentasAfectadas.length > 0) {
        const resumen = cuentasAfectadas.map(cid => {
          const cta = accounts.find(a=>a.id===cid);
          return `• ${cta?.name||"Cuenta desconocida"}: +${fmt(movimientos[cid], cta?.currency||"MXN")}`;
        }).join("\n");

        const revertir = await askConfirm(
          `¿Deseas revertir los montos descontados a sus cuentas de origen?\n\n${resumen}\n\nElige SÍ si fue un error de captura. Elige NO si los pagos realmente ocurrieron.`
        );

        if (revertir) {
          setAccounts(p => p.map(a =>
            movimientos[a.id]
              ? {...a, balance: parseFloat(a.balance||0) + movimientos[a.id]}
              : a
          ));
          toast("Crédito eliminado y saldos revertidos");
        } else {
          toast("Crédito eliminado — saldos sin cambios","error");
        }
      } else {
        toast("Crédito eliminado","error");
      }
    }

    setMortgages(p=>p.filter(x=>x.id!==id));
    if (selected?.id===id) { setSelected(null); setView("list"); }
  };

  // ── abrir modal pago mensual (nuevo o edición)
  const abrirPagoModal = (m, pago=null) => {
    const prog = calcProgreso(m);
    const cuotaCalc = pago ? pago.pago : (m.cuotaReal ? parseFloat(m.cuotaReal) : prog.cuotaSig?.pago||0);
    const cuotaInteres = pago ? pago.interes : prog.cuotaSig?.interes||0;
    const cuotaCapital = pago ? pago.capital : prog.cuotaSig?.capital||0;
    setPagoForm({
      id: pago?.id||null,
      mes: pago?.mes||(prog.totalPagos+1),
      fecha: pago?.fecha||today(),
      pago: String(cuotaCalc.toFixed(2)),
      capital: String(cuotaCapital.toFixed(2)),
      interes: String(cuotaInteres.toFixed(2)),
      cuentaId: pago?.cuentaId||"",
      notas: pago?.notas||"",
      registrarComoTx: !pago, // activo por defecto en nuevo pago, no en edición
    });
    setEditPago(pago);
    setShowPagoModal(true);
  };

  const guardarPago = (m) => {
    if (!pagoForm.pago) { toast("Ingresa el monto del pago","error"); return; }
    const montoNum = parseFloat(pagoForm.pago)||0;
    // descontar de cuenta si se eligió
    if (pagoForm.cuentaId && !editPago) {
      const cta = accounts.find(a=>a.id===pagoForm.cuentaId);
      if (cta && parseFloat(cta.balance||0) < montoNum) { toast("Saldo insuficiente","error"); return; }
      if (cta) setAccounts(p=>p.map(a=>a.id===pagoForm.cuentaId ? {...a,balance:parseFloat(a.balance||0)-montoNum} : a));
    }
    const nuevoPago = {
      id: editPago?.id||genId(),
      mes: parseInt(pagoForm.mes),
      fecha: pagoForm.fecha,
      pago: montoNum,
      capital: parseFloat(pagoForm.capital)||0,
      interes: parseFloat(pagoForm.interes)||0,
      cuentaId: pagoForm.cuentaId,
      notas: pagoForm.notas,
    };
    let updated;
    if (editPago) {
      updated = {...m, pagosRealizados:(m.pagosRealizados||[]).map(p=>p.id===editPago.id?nuevoPago:p)};
    } else {
      updated = {...m, pagosRealizados:[...(m.pagosRealizados||[]),nuevoPago]};
    }
    setMortgages(p=>p.map(x=>x.id===m.id?updated:x));
    setSelected(updated);
    setShowPagoModal(false);
    // ── híbrido: crear transacción si el usuario lo eligió
    if (pagoForm.registrarComoTx && !editPago) {
      const newTx = {
        id:genId(), date:pagoForm.fecha, amount:montoNum,
        type:"expense",
        description:`Mensualidad hipoteca — ${m.nombre||m.banco||"Hipoteca"}`,
        category:"Hipoteca / Vivienda",
        accountId: pagoForm.cuentaId||"",
        currency:"MXN",
        origen:"hipoteca", origenId:m.id,
        notes: pagoForm.notas||"",
      };
      setTransactions(p=>[newTx,...p]);
    }
    toast(editPago?"Pago actualizado ✓":`Pago mes ${nuevoPago.mes} registrado ✓`);
  };

  const eliminarPago = async (m, pagoId) => {
    const ok = await askConfirm("¿Eliminar este pago del historial?");
    if (!ok) return;
    const updated = {...m, pagosRealizados:(m.pagosRealizados||[]).filter(p=>p.id!==pagoId)};
    setMortgages(p=>p.map(x=>x.id===m.id?updated:x));
    setSelected(updated);
    toast("Pago eliminado","error");
  };

  // ── pago a capital
  const guardarCapital = (m) => {
    if (!capForm.monto) { toast("Ingresa el monto","error"); return; }
    const montoNum = parseFloat(capForm.monto)||0;
    if (capForm.cuentaId) {
      const cta = accounts.find(a=>a.id===capForm.cuentaId);
      if (cta && parseFloat(cta.balance||0) < montoNum) { toast("Saldo insuficiente","error"); return; }
      if (cta) setAccounts(p=>p.map(a=>a.id===capForm.cuentaId ? {...a,balance:parseFloat(a.balance||0)-montoNum} : a));
    }
    const prog = calcProgreso(m);
    const nuevosCap = [...(m.pagosCapital||[]), {
      id:genId(), mes:prog.totalPagos+1,
      monto:montoNum, fecha:capForm.fecha,
      cuentaId:capForm.cuentaId, notas:capForm.notas,
    }];
    const updated = {...m, pagosCapital:nuevosCap};
    setMortgages(p=>p.map(x=>x.id===m.id?updated:x));
    setSelected(updated);
    setShowCapModal(false);
    setCapForm({monto:"",fecha:today(),cuentaId:"",notas:""});
    toast(`Pago a capital de ${fmt(montoNum,m.moneda)} registrado ✓`);
  };

  // ── helpers
  const acctOpts = [
    {value:"",label:"— Sin vincular a cuenta —"},
    ...accounts.map(a=>({value:a.id,label:`${a.name} (${fmt(a.balance||0,a.currency)})`})),
  ];

  // ── Simulador standalone
  const simResult = (() => {
    const monto = (parseFloat(sim.valorPropiedad)||0) - (parseFloat(sim.enganche)||0);
    if (!monto || !sim.tasaAnual || !sim.plazoAnios) return null;
    return calcAmort(monto, sim.tasaAnual, sim.plazoAnios, sim.tipo);
  })();

  const compScenarios = simResult ? [
    { label:"Plazo actual", plazo:parseFloat(sim.plazoAnios), tasa:parseFloat(sim.tasaAnual) },
    { label:"Plazo -5 años", plazo:Math.max(5,parseFloat(sim.plazoAnios)-5), tasa:parseFloat(sim.tasaAnual) },
    { label:"Tasa -1%", plazo:parseFloat(sim.plazoAnios), tasa:Math.max(0.5,parseFloat(sim.tasaAnual)-1) },
  ].map(s=>{
    const monto=(parseFloat(sim.valorPropiedad)||0)-(parseFloat(sim.enganche)||0);
    return {...s,...calcAmort(monto,s.tasa,s.plazo,sim.tipo)};
  }) : [];

  const cur = sim.moneda;

  // ── RENDER LIST
  if (view==="list" && !showForm) return (
    <div style={{animation:"fadeUp .25s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:"0 0 3px"}}>Crédito Hipotecario</h2>
          <p style={{fontSize:13,color:"#555",margin:0}}>Simula, compara y da seguimiento a tu crédito de casa</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn variant="secondary" onClick={()=>setView("sim")}><Ic n="reports" size={15}/>Simulador</Btn>
          <Btn onClick={()=>{setForm(emptyForm);setShowForm(true);}}><Ic n="plus" size={15}/>Nuevo crédito</Btn>
        </div>
      </div>

      {/* KPIs globales hipotecas */}
      {mortgages.length>0&&(()=>{
        const totalSaldo = mortgages.reduce((s,m)=>s+calcProgreso(m).saldoActual,0);
        const totalAmortizado = mortgages.reduce((s,m)=>s+(parseFloat(m.monto)||0)-calcProgreso(m).saldoActual,0);
        const totalIntPagados = mortgages.reduce((s,m)=>s+calcProgreso(m).totalInteresesPagados,0);
        const totalCuotaMes = mortgages.reduce((s,m)=>{
          const {cuota}=calcAmort(m.monto,m.tasaAnual,m.plazoAnios,m.tipo,m.pagosCapital||[]);
          return s+(m.cuotaReal?parseFloat(m.cuotaReal):cuota);
        },0);
        return (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:10,marginBottom:18}}>
            <Card style={{padding:"12px 14px",borderColor:"rgba(255,71,87,.2)"}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 3px"}}>Saldo total pendiente</p>
              <p style={{fontSize:18,fontWeight:800,color:"#ff6b7a",margin:0}}>{fmt(totalSaldo)}</p>
              <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>{mortgages.length} crédito{mortgages.length!==1?"s":""}</p>
            </Card>
            <Card style={{padding:"12px 14px",borderColor:"rgba(0,212,170,.2)"}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 3px"}}>Capital amortizado</p>
              <p style={{fontSize:18,fontWeight:800,color:"#00d4aa",margin:0}}>{fmt(totalAmortizado)}</p>
              <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>{mortgages.length>0?((totalAmortizado/(totalAmortizado+totalSaldo))*100).toFixed(1):0}% del total</p>
            </Card>
            <Card style={{padding:"12px 14px",borderColor:"rgba(243,156,18,.2)"}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 3px"}}>Intereses pagados</p>
              <p style={{fontSize:18,fontWeight:800,color:"#f39c12",margin:0}}>{fmt(totalIntPagados)}</p>
              <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>Acumulado total</p>
            </Card>
            <Card style={{padding:"12px 14px",borderColor:"rgba(59,130,246,.2)"}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 3px"}}>Cuota mensual total</p>
              <p style={{fontSize:18,fontWeight:800,color:"#3b82f6",margin:0}}>{fmt(totalCuotaMes)}</p>
              <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>Compromiso fijo / mes</p>
            </Card>
          </div>
        );
      })()}
      {mortgages.length===0 ? (
        <div style={{textAlign:"center",padding:"60px 20px"}}>
          <Ic n="mortgage" size={48} color="#333"/>
          <p style={{fontSize:15,color:"#666",margin:"14px 0 6px"}}>Sin créditos registrados</p>
          <p style={{fontSize:13,color:"#444",marginBottom:20}}>Agrega un crédito activo o usa el simulador para comparar opciones.</p>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <Btn onClick={()=>{setForm(emptyForm);setShowForm(true);}}>Registrar crédito</Btn>
            <Btn variant="secondary" onClick={()=>setView("sim")}>Usar simulador</Btn>
          </div>
        </div>
      ) : (
        <div style={{display:"grid",gap:14}}>
          {mortgages.map(m=>{
            const prog = calcProgreso(m);
            const {cuota} = calcAmort(m.monto,m.tasaAnual,m.plazoAnios,m.tipo,m.pagosCapital||[]);
            const dias = diasParaVencer(m);
            const alerta = dias<=0?"vencida":dias<=7?"urgente":dias<=15?"pronto":null;
            const alertaColor = dias<=0?"#ff4757":dias<=7?"#ff6b35":"#f39c12";
            return (
              <Card key={m.id} onClick={()=>{setSelected(m);setView("detail");setTab("resumen");}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{width:36,height:36,borderRadius:9,background:"rgba(0,212,170,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Ic n="mortgage" size={19} color="#00d4aa"/>
                      </div>
                      <div>
                        <p style={{fontSize:15,fontWeight:700,color:"#f0f0f0",margin:0}}>{m.nombre}</p>
                        <p style={{fontSize:12,color:"#555",margin:0}}>{m.banco||"Sin banco"} · {m.tipo==="fijo"?"Tasa fija":"Capital fijo"} · {m.plazoAnios} años · {m.moneda}</p>
                      </div>
                      {alerta && <Badge label={dias<=0?"¡Vencida!":dias<=7?`${dias}d`:alerta==="pronto"?`${dias}d`:"pronto"} color={alertaColor}/>}
                    </div>
                    {alerta && (
                      <div style={{background:`${alertaColor}11`,border:`1px solid ${alertaColor}33`,borderRadius:8,padding:"6px 10px",marginBottom:8,fontSize:12,color:alertaColor}}>
                        {dias<=0?"⚠️ Pago vencido":"⏰ Próximo pago:"} {fmtDate(proxVencimiento(m))}
                      </div>
                    )}
                    <div style={{marginTop:6}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:11,color:"#555"}}>Amortizado {prog.porcentaje.toFixed(1)}%</span>
                        <span style={{fontSize:11,color:"#555"}}>{prog.totalPagos} de {parseInt(m.plazoAnios)*12} pagos</span>
                      </div>
                      <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.min(prog.porcentaje,100)}%`,background:"linear-gradient(90deg,#00d4aa,#00a884)",borderRadius:3}}/>
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                    <p style={{fontSize:17,fontWeight:700,color:"#f0f0f0",margin:0}}>{fmt(prog.saldoActual,m.moneda)}</p>
                    <p style={{fontSize:11,color:"#555",margin:0}}>saldo pendiente</p>
                    <p style={{fontSize:13,color:"#00d4aa",fontWeight:600,margin:"3px 0 0"}}>{fmt(m.cuotaReal?parseFloat(m.cuotaReal):cuota,m.moneda)}/mes</p>
                    <Actions onEdit={e=>{e.stopPropagation();setForm({...m});setShowForm(true);}} onDelete={e=>{e.stopPropagation();eliminar(m.id);}}/>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {confirmModal}
    </div>
  );

  // ── SIMULADOR
  if (view==="sim") return (
    <div style={{animation:"fadeUp .25s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
        <Btn variant="ghost" onClick={()=>setView("list")}><Ic n="back" size={17}/>Volver</Btn>
        <div>
          <h2 style={{fontSize:20,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:0}}>Simulador Hipotecario</h2>
          <p style={{fontSize:12,color:"#555",margin:0}}>Compara opciones antes de comprometerte</p>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:20,marginBottom:24}}>
        <Card>
          <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,marginBottom:14}}>Parámetros</p>
          <Sel label="Moneda" value={sim.moneda} onChange={sf("moneda")} options={[{value:"MXN",label:"MXN"},{value:"USD",label:"USD"}]}/>
          <Sel label="Tipo de tasa" value={sim.tipo} onChange={sf("tipo")} options={[{value:"fijo",label:"Tasa fija (cuota constante)"},{value:"variable",label:"Capital fijo (cuota decrece)"}]}/>
          <Inp label="Valor de la propiedad" value={sim.valorPropiedad} onChange={sf("valorPropiedad")} type="number" prefix="$" suffix={cur}/>
          <Inp label="Enganche" value={sim.enganche} onChange={sf("enganche")} type="number" prefix="$" suffix={cur}/>
          <Inp label="Tasa anual %" value={sim.tasaAnual} onChange={sf("tasaAnual")} type="number" suffix="%"/>
          <Inp label="Plazo (años)" value={sim.plazoAnios} onChange={sf("plazoAnios")} type="number" suffix="años"/>
          {simResult && (
            <Btn full onClick={()=>{
              const monto=(parseFloat(sim.valorPropiedad)||0)-(parseFloat(sim.enganche)||0);
              setForm({...emptyForm,monto:String(monto),tasaAnual:sim.tasaAnual,plazoAnios:sim.plazoAnios,tipo:sim.tipo,moneda:sim.moneda,valorPropiedad:sim.valorPropiedad,enganche:sim.enganche,nombre:"Mi crédito hipotecario"});
              setShowForm(true);setView("list");
            }}>Registrar este crédito</Btn>
          )}
        </Card>
        {simResult && (
          <Card>
            <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,marginBottom:14}}>Resumen</p>
            {[
              ["Monto a financiar",fmt((parseFloat(sim.valorPropiedad)||0)-(parseFloat(sim.enganche)||0),cur)],
              ["Enganche",`${sim.valorPropiedad>0?((parseFloat(sim.enganche)||0)/parseFloat(sim.valorPropiedad)*100).toFixed(1):0}% del valor`],
              ["Cuota mensual",fmt(simResult.cuota,cur),"#00d4aa"],
              ["Total a pagar",fmt(simResult.totalPagar,cur)],
              ["Total intereses",fmt(simResult.totalIntereses,cur),"#f39c12"],
              ["Costo financiero",`${simResult.totalPagar>0?((simResult.totalIntereses/simResult.totalPagar)*100).toFixed(1):0}% del total`],
            ].map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{fontSize:13,color:"#666"}}>{l}</span>
                <span style={{fontSize:14,fontWeight:600,color:c||"#ccc"}}>{v}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
      {compScenarios.length>0 && (
        <div style={{marginBottom:24}}>
          <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Comparador de escenarios</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
            {compScenarios.map((s,i)=>(
              <Card key={i} style={{borderColor:i===0?"rgba(0,212,170,.2)":"rgba(255,255,255,.07)"}}>
                <p style={{fontSize:12,fontWeight:700,color:i===0?"#00d4aa":"#777",marginBottom:8}}>{s.label}</p>
                <p style={{fontSize:11,color:"#555",margin:"0 0 10px"}}>{s.tasa}% · {s.plazo} años</p>
                {[["Cuota/mes",fmt(s.cuota,cur)],["Total pagar",fmt(s.totalPagar,cur)],["Intereses",fmt(s.totalIntereses,cur)]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <span style={{fontSize:12,color:"#555"}}>{l}</span>
                    <span style={{fontSize:12,fontWeight:600,color:"#ccc"}}>{v}</span>
                  </div>
                ))}
              </Card>
            ))}
          </div>
        </div>
      )}
      {simResult && (
        <Card>
          <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,marginBottom:14}}>Tabla — primeros 24 meses</p>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                {["Mes","Pago","Capital","Interés","Saldo"].map(h=>(
                  <th key={h} style={{padding:"7px 10px",textAlign:"right",color:"#555",fontWeight:600}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{simResult.tabla.slice(0,24).map(r=>(
                <tr key={r.mes} style={{borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                  <td style={{padding:"7px 10px",color:"#666",textAlign:"right"}}>{r.mes}</td>
                  <td style={{padding:"7px 10px",color:"#ccc",textAlign:"right",fontWeight:500}}>{fmt(r.pago,cur)}</td>
                  <td style={{padding:"7px 10px",color:"#00d4aa",textAlign:"right"}}>{fmt(r.capital,cur)}</td>
                  <td style={{padding:"7px 10px",color:"#f39c12",textAlign:"right"}}>{fmt(r.interes,cur)}</td>
                  <td style={{padding:"7px 10px",color:"#888",textAlign:"right"}}>{fmt(r.saldo,cur)}</td>
                </tr>
              ))}</tbody>
            </table>
            {simResult.tabla.length>24 && <p style={{fontSize:11,color:"#444",textAlign:"center",marginTop:8}}>Mostrando 24 de {simResult.tabla.length} meses</p>}
          </div>
        </Card>
      )}
    </div>
  );

  // ── DETALLE
  if (view==="detail" && selected) {
    const m = mortgages.find(x=>x.id===selected.id) || selected;
    const prog = calcProgreso(m);
    const {tabla} = prog;
    const cur2 = m.moneda;
    const dias = diasParaVencer(m);
    const cuotaDisplay = m.cuotaReal ? parseFloat(m.cuotaReal) : prog.cuotaSig?.pago||0;
    const TABS = [{id:"resumen",label:"Resumen"},{id:"tabla",label:"Amortización"},{id:"pagos",label:"Mensualidades"},{id:"capital",label:"Pagos a capital"},{id:"simulador",label:"⚡ Liquidar anticipado"}];

    return (
      <div style={{animation:"fadeUp .25s ease"}}>
        {/* header */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
          <Btn variant="ghost" onClick={()=>setView("list")}><Ic n="back" size={17}/>Volver</Btn>
          <div style={{flex:1}}>
            <h2 style={{fontSize:20,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:0}}>{m.nombre}</h2>
            <p style={{fontSize:12,color:"#555",margin:0}}>{m.banco||"Sin banco"} · {m.tipo==="fijo"?"Tasa fija":"Capital fijo"} · {m.tasaAnual}% · {m.plazoAnios} años · {cur2}</p>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Btn variant="secondary" onClick={()=>{setCapForm({monto:"",fecha:today(),cuentaId:"",notas:""});setShowCapModal(true);}}><Ic n="plus" size={15}/>Pago a capital</Btn>
            <Btn onClick={()=>abrirPagoModal(m)}><Ic n="check" size={15}/>Registrar mensualidad</Btn>
          </div>
        </div>

        {/* alerta vencimiento mejorada con saldo */}
        {(()=>{
          const cuentaAsoc = accounts.find(a=>a.id===m.cuentaId);
          const cuotaTotal = parseFloat(m.cuotaReal)||0;
          const segurosTotal = (parseFloat(m.seguroVida)||0)+(parseFloat(m.seguroDanos)||0)+(parseFloat(m.adminCredito)||0);
          const cuotaMostrar = cuotaTotal > 0 ? cuotaTotal : (cuotaDisplay + segurosTotal);
          const saldoCuenta = cuentaAsoc ? parseFloat(cuentaAsoc.balance||0) : null;
          const fondosOk = saldoCuenta === null || saldoCuenta >= cuotaMostrar;
          const faltante = saldoCuenta !== null ? Math.max(0, cuotaMostrar - saldoCuenta) : 0;

          // Mostrar panel siempre (no solo cuando faltan 15 días)
          return (
            <div style={{marginBottom:16}}>
              {/* Panel próximo pago */}
              <div style={{
                background:dias<=0?"rgba(255,71,87,.08)":dias<=3?"rgba(255,71,87,.06)":dias<=7?"rgba(255,107,53,.06)":"rgba(0,212,170,.04)",
                border:`1px solid ${dias<=0?"rgba(255,71,87,.3)":dias<=3?"rgba(255,71,87,.2)":dias<=7?"rgba(255,107,53,.2)":"rgba(0,212,170,.15)"}`,
                borderRadius:12,padding:"12px 16px",display:"flex",flexWrap:"wrap",gap:14,alignItems:"center"
              }}>
                <div style={{flex:1,minWidth:200}}>
                  <p style={{fontSize:11,color:"#555",margin:"0 0 3px",textTransform:"uppercase",letterSpacing:.4}}>
                    {dias<=0?"Pago vencido":"Próximo pago"}
                  </p>
                  <p style={{fontSize:16,fontWeight:800,color:dias<=0?"#ff4757":dias<=3?"#ff4757":dias<=7?"#ff6b35":"#f0f0f0",margin:"0 0 2px"}}>
                    {fmtDate(proxVencimiento(m))}
                    <span style={{fontSize:12,fontWeight:400,color:dias<=0?"#ff4757":dias<=7?"#f39c12":"#555",marginLeft:8}}>
                      {dias<=0?`Venció hace ${Math.abs(dias)}d`:dias===0?"¡Hoy!":`en ${dias} día${dias!==1?"s":""}`}
                    </span>
                  </p>
                  <p style={{fontSize:13,fontWeight:700,color:"#00d4aa",margin:0}}>
                    {fmt(cuotaMostrar,cur2)} <span style={{fontSize:10,color:"#555",fontWeight:400}}>total a pagar</span>
                  </p>
                </div>
                {/* Estado de fondos */}
                {cuentaAsoc && (
                  <div style={{
                    padding:"10px 14px",borderRadius:10,minWidth:180,
                    background:fondosOk?"rgba(0,212,170,.08)":"rgba(255,71,87,.08)",
                    border:`1px solid ${fondosOk?"rgba(0,212,170,.2)":"rgba(255,71,87,.25)"}`
                  }}>
                    <p style={{fontSize:10,color:"#555",margin:"0 0 3px",textTransform:"uppercase",letterSpacing:.4}}>
                      {cuentaAsoc.name}
                    </p>
                    <p style={{fontSize:16,fontWeight:800,color:fondosOk?"#00d4aa":"#ff4757",margin:"0 0 2px"}}>
                      {fmt(saldoCuenta,cur2)}
                    </p>
                    <p style={{fontSize:11,color:fondosOk?"#00d4aa":"#ff6b7a",fontWeight:600,margin:0}}>
                      {fondosOk
                        ? `✓ Fondos suficientes (+${fmt(saldoCuenta-cuotaMostrar,cur2)})`
                        : `⚠️ Faltan ${fmt(faltante,cur2)} para el pago`}
                    </p>
                  </div>
                )}
                {!cuentaAsoc && (
                  <div style={{padding:"8px 12px",borderRadius:8,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)"}}>
                    <p style={{fontSize:11,color:"#444",margin:0}}>Vincula una cuenta para<br/>monitorear fondos automáticamente</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:16}}>
          {[
            ["Saldo pendiente",fmt(prog.saldoActual,cur2),"#f0f0f0"],
            ["Capital amortizado",fmt(prog.capitalAmortizado,cur2),"#00d4aa"],
            ["Intereses pagados",fmt(prog.totalInteresesPagados,cur2),"#f39c12"],
            ["Pagos a capital extra",fmt(prog.totalCapitalExtra,cur2),"#7c3aed"],
            ["Próxima cuota",fmt(cuotaDisplay,cur2),"#00d4aa"],
            [`${prog.totalPagos}/${parseInt(m.plazoAnios)*12} pagos`,`${prog.porcentaje.toFixed(1)}%`,"#ccc"],
          ].map(([l,v,c])=>(
            <Card key={l}>
              <p style={{fontSize:10,color:"#555",margin:"0 0 4px"}}>{l}</p>
              <p style={{fontSize:15,fontWeight:700,color:c,margin:0}}>{v}</p>
            </Card>
          ))}
        </div>

        {/* barra */}
        <Card style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:13,color:"#888"}}>Progreso del crédito</span>
            <span style={{fontSize:13,fontWeight:700,color:"#00d4aa"}}>{prog.porcentaje.toFixed(2)}%</span>
          </div>
          <div style={{height:10,borderRadius:5,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(prog.porcentaje,100)}%`,background:"linear-gradient(90deg,#00d4aa,#7c3aed)",borderRadius:5}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
            <span style={{fontSize:11,color:"#444"}}>{fmt(prog.capitalAmortizado,cur2)} pagado</span>
            <span style={{fontSize:11,color:"#444"}}>{fmt(prog.saldoActual,cur2)} restante</span>
          </div>
        </Card>

        {/* tabs */}
        <div style={{display:"flex",gap:2,marginBottom:14,background:"rgba(255,255,255,.03)",borderRadius:10,padding:3,width:"fit-content",flexWrap:"wrap"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .15s",background:tab===t.id?"linear-gradient(135deg,#00d4aa,#00a884)":"transparent",color:tab===t.id?"#fff":"#666"}}>{t.label}</button>
          ))}
        </div>

        {tab==="resumen" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14}}>
            <Card>
              <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Datos del crédito</p>
              {[
                ["Monto original",fmt(parseFloat(m.monto),cur2)],
                ["Valor propiedad",m.valorPropiedad?fmt(parseFloat(m.valorPropiedad),cur2):"—"],
                ["Enganche",m.enganche?fmt(parseFloat(m.enganche),cur2):"—"],
                ["Tasa anual",`${m.tasaAnual}%`],
                ["Cuota calculada",fmt(prog.cuotaSig?.pago||0,cur2)],
                m.cuotaReal?["Cuota real banco",fmt(parseFloat(m.cuotaReal),cur2),"#00d4aa"]:null,
                ["Día de corte",`día ${m.diaCorte||1} de cada mes`],
                ["Próximo vencimiento",fmtDate(proxVencimiento(m))],
                ["Banco/Institución",m.banco||"—"],
              ].filter(Boolean).map(([l,v,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                  <span style={{fontSize:13,color:"#666"}}>{l}</span>
                  <span style={{fontSize:13,fontWeight:600,color:c||"#ccc"}}>{v}</span>
                </div>
              ))}
              {m.notas && <p style={{fontSize:12,color:"#555",marginTop:10,fontStyle:"italic",lineHeight:1.5}}>{m.notas}</p>}
            </Card>
            <Card>
              <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Proyección total</p>
              {(()=>{
                const seg={seguroVida:m.seguroVida,seguroVidaTipo:m.seguroVidaTipo||"proporcional",seguroDanos:m.seguroDanos,adminCredito:m.adminCredito};
                const {totalPagar,totalIntereses,cuota,cuotaTotal}=calcAmort(m.monto,m.tasaAnual,m.plazoAnios,m.tipo,m.pagosCapital||[],seg);
                const pagadoTotal=(m.pagosRealizados||[]).reduce((s,p)=>s+p.pago,0)+(m.pagosCapital||[]).reduce((s,p)=>s+parseFloat(p.monto),0);
                return [
                  ["Cuota mensual",fmt(m.cuotaReal?parseFloat(m.cuotaReal):cuota,cur2),"#00d4aa"],
                  ["Total a pagar",fmt(totalPagar,cur2)],
                  ["Total intereses",fmt(totalIntereses,cur2),"#f39c12"],
                  ["Costo financiero",`${totalPagar>0?((totalIntereses/totalPagar)*100).toFixed(1):0}%`],
                  ["Ya pagado",fmt(pagadoTotal,cur2),"#00d4aa"],
                  ["Por pagar",fmt(Math.max(totalPagar-pagadoTotal,0),cur2)],
                  ["Meses restantes",`${tabla.length - prog.totalPagos}`],
                ].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <span style={{fontSize:13,color:"#666"}}>{l}</span>
                    <span style={{fontSize:13,fontWeight:600,color:c||"#ccc"}}>{v}</span>
                  </div>
                ));
              })()}
            </Card>
          </div>
        )}

        {tab==="tabla" && (
          <Card>
            <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Amortización completa — {tabla.length} meses</p>
            <div style={{overflowX:"auto",maxHeight:440,overflowY:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead style={{position:"sticky",top:0,background:"#161b27",zIndex:1}}>
                  <tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                    {(m.seguroVida||m.seguroDanos||m.adminCredito
                    ? ["Mes","Fecha","Saldo inicial","Capital","Interés","Seg. Vida","Seg. Daños","Admin","Pago total","Saldo final","Estado"]
                    : ["Mes","Capital","Interés","Pago","Saldo","Estado"]
                  ).map(h=>(
                    <th key={h} style={{padding:"8px 10px",textAlign:"right",color:"#555",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                  </tr>
                </thead>
                <tbody>
                  {tabla.map((r,i)=>{
                    const pagado=i<prog.totalPagos;
                    const esSiguiente=i===prog.totalPagos;
                    const saldoInicio = i===0 ? parseFloat(m.monto) : tabla[i-1].saldo;
                    const tieneFollowros = m.seguroVida||m.seguroDanos||m.adminCredito;
                    // calcular fecha estimada del pago
                    const fechaPago = (() => {
                      const d = new Date(m.fechaInicio+"T12:00:00");
                      d.setMonth(d.getMonth()+i+1);
                      d.setDate(parseInt(m.diaCorte)||1);
                      return d.toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"2-digit"});
                    })();
                    return (
                      <tr key={r.mes} style={{borderBottom:"1px solid rgba(255,255,255,.03)",opacity:pagado?.5:1,background:esSiguiente?"rgba(0,212,170,.06)":"transparent",fontWeight:esSiguiente?700:400}}>
                        <td style={{padding:"7px 10px",color:esSiguiente?"#00d4aa":"#666",textAlign:"right",fontWeight:600}}>{r.mes}</td>
                        {tieneFollowros ? (<>
                          <td style={{padding:"7px 10px",color:"#555",textAlign:"right",fontSize:11}}>{fechaPago}</td>
                          <td style={{padding:"7px 10px",color:"#888",textAlign:"right"}}>{fmt(saldoInicio,cur2)}</td>
                          <td style={{padding:"7px 10px",color:"#00d4aa",textAlign:"right",fontWeight:600}}>{fmt(r.capital,cur2)}</td>
                          <td style={{padding:"7px 10px",color:"#f39c12",textAlign:"right"}}>{fmt(r.interes,cur2)}</td>
                          <td style={{padding:"7px 10px",color:"#3b82f6",textAlign:"right"}}>{fmt(r.segVida||0,cur2)}</td>
                          <td style={{padding:"7px 10px",color:"#8b5cf6",textAlign:"right"}}>{fmt(r.segDanos||0,cur2)}</td>
                          <td style={{padding:"7px 10px",color:"#64748b",textAlign:"right"}}>{fmt(r.admin||0,cur2)}</td>
                          <td style={{padding:"7px 10px",color:"#fff",textAlign:"right",fontWeight:700}}>{fmt(r.pago,cur2)}</td>
                          <td style={{padding:"7px 10px",color:r.saldo<=0.01?"#00d4aa":"#888",textAlign:"right"}}>{fmt(r.saldo,cur2)}</td>
                        </>) : (<>
                          <td style={{padding:"7px 10px",color:"#00d4aa",textAlign:"right"}}>{fmt(r.capital,cur2)}</td>
                          <td style={{padding:"7px 10px",color:"#f39c12",textAlign:"right"}}>{fmt(r.interes,cur2)}</td>
                          <td style={{padding:"7px 10px",color:"#ccc",textAlign:"right",fontWeight:500}}>{fmt(r.pago,cur2)}</td>
                          <td style={{padding:"7px 10px",color:"#888",textAlign:"right"}}>{fmt(r.saldo,cur2)}</td>
                        </>)}
                        <td style={{padding:"7px 10px",textAlign:"right"}}>
                          <Badge label={pagado?"Pagado":esSiguiente?"Próximo":"Pendiente"} color={pagado?"#555":esSiguiente?"#00d4aa":"#333"}/>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab==="pagos" && (
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
              <Btn onClick={()=>abrirPagoModal(m)}><Ic n="plus" size={15}/>Registrar mensualidad</Btn>
            </div>
            {(m.pagosRealizados||[]).length===0 ? (() => {
              const acred = m.fechaAcreditacion ? new Date(m.fechaAcreditacion+"T12:00:00") : null;
              const proxPago = (() => {
                if (acred) {
                  const d = new Date(acred);
                  d.setMonth(d.getMonth()+2);
                  d.setDate(parseInt(m.diaCorte)||1);
                  return d;
                }
                return null;
              })();
              const diasAlPago = proxPago ? Math.round((proxPago-new Date())/86400000) : null;
              const diasAcum = proxPago && acred ? Math.max(0,Math.floor((proxPago-acred)/86400000)) : 0;
              const tasaDiaria = (parseFloat(m.tasaAnual)||0)/100/365;
              const interesAcum = parseFloat(m.monto||0)*tasaDiaria*diasAcum;
              const cuotaBase = parseFloat(m.cuotaReal)||0;
              const seguros = (parseFloat(m.seguroVida)||0)+(parseFloat(m.seguroDanos)||0)+(parseFloat(m.adminCredito)||0);
              const cuotaEst = cuotaBase + seguros + interesAcum;
              return (
                <Card style={{borderColor:"rgba(0,212,170,.2)",background:"rgba(0,212,170,.03)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                    <div style={{width:36,height:36,borderRadius:10,background:"rgba(0,212,170,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Ic n="mortgage" size={20} color="#00d4aa"/>
                    </div>
                    <div>
                      <p style={{fontSize:13,fontWeight:700,color:"#00d4aa",margin:0}}>Primer pago pendiente</p>
                      {proxPago&&<p style={{fontSize:11,color:"#555",margin:0}}>
                        {diasAlPago > 0 ? `En ${diasAlPago} días — ` : diasAlPago === 0 ? "Hoy — " : `Venció hace ${Math.abs(diasAlPago)}d — `}
                        {proxPago.toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}
                      </p>}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:12}}>
                    {[
                      {l:"Cuota mensual est.",v:fmt(cuotaBase+seguros,cur2),c:"#e0e0e0"},
                      {l:"Interés acumulado",v:fmt(interesAcum,cur2),c:"#f39c12",tip:`${diasAcum} días desde acreditación`},
                      {l:"Total primer recibo est.",v:fmt(cuotaEst,cur2),c:"#ff6b6b",big:true},
                    ].map(k=>(
                      <div key={k.l} style={{padding:"9px 12px",background:"rgba(255,255,255,.03)",borderRadius:9,border:"1px solid rgba(255,255,255,.06)"}}>
                        <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 3px"}}>{k.l}</p>
                        <p style={{fontSize:k.big?17:14,fontWeight:800,color:k.c,margin:0,fontVariantNumeric:"tabular-nums"}}>{k.v}</p>
                        {k.tip&&<p style={{fontSize:9,color:"#444",margin:"2px 0 0"}}>{k.tip}</p>}
                      </div>
                    ))}
                  </div>
                  <div style={{padding:"8px 12px",background:"rgba(243,156,18,.06)",border:"1px solid rgba(243,156,18,.15)",borderRadius:8,fontSize:11,color:"#f39c12",lineHeight:1.5}}>
                    ⚠️ El primer recibo incluye el interés acumulado desde la acreditación ({m.fechaAcreditacion ? fmtDate(m.fechaAcreditacion) : "fecha de inicio"}) hasta el día de pago — por eso es más alto que los siguientes.
                  </div>
                </Card>
              );
            })() : (
              <Card>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                      {["Mes","Fecha","Pago total","A capital","A interés","Cuenta",""].map(h=>(
                        <th key={h} style={{padding:"7px 10px",textAlign:"right",color:"#555",fontWeight:600}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {[...(m.pagosRealizados||[])].reverse().map(p=>{
                        const cta=accounts.find(a=>a.id===p.cuentaId);
                        return (
                          <tr key={p.id} style={{borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                            <td style={{padding:"7px 10px",color:"#666",textAlign:"right"}}>{p.mes}</td>
                            <td style={{padding:"7px 10px",color:"#888",textAlign:"right"}}>{fmtDate(p.fecha)}</td>
                            <td style={{padding:"7px 10px",color:"#ccc",textAlign:"right",fontWeight:500}}>{fmt(p.pago,cur2)}</td>
                            <td style={{padding:"7px 10px",color:"#00d4aa",textAlign:"right"}}>{fmt(p.capital,cur2)}</td>
                            <td style={{padding:"7px 10px",color:"#f39c12",textAlign:"right"}}>{fmt(p.interes,cur2)}</td>
                            <td style={{padding:"7px 10px",color:"#555",textAlign:"right",fontSize:11}}>{cta?.name||"—"}</td>
                            <td style={{padding:"7px 10px",textAlign:"right"}}>
                              <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
                                <button onClick={()=>abrirPagoModal(m,p)} style={{background:"rgba(255,255,255,.06)",border:"none",cursor:"pointer",color:"#888",padding:"4px 7px",borderRadius:6,display:"flex",alignItems:"center"}}><Ic n="edit" size={13}/></button>
                                <button onClick={()=>eliminarPago(m,p.id)} style={{background:"rgba(255,71,87,.08)",border:"none",cursor:"pointer",color:"#ff4757",padding:"4px 7px",borderRadius:6,display:"flex",alignItems:"center"}}><Ic n="trash" size={13}/></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {tab==="capital" && (
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
              <Btn onClick={()=>{setCapForm({monto:"",fecha:today(),cuentaId:"",notas:""});setShowCapModal(true);}}><Ic n="plus" size={15}/>Pago a capital</Btn>
            </div>
            {prog.totalCapitalExtra>0 && (
              <div style={{background:"rgba(124,58,237,.08)",border:"1px solid rgba(124,58,237,.2)",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13,color:"#a78bfa"}}>
                Total abonado a capital: <strong>{fmt(prog.totalCapitalExtra,cur2)}</strong> — ahorra {fmt(calcAmort(m.monto,m.tasaAnual,m.plazoAnios,m.tipo).totalIntereses - calcAmort(m.monto,m.tasaAnual,m.plazoAnios,m.tipo,m.pagosCapital||[]).totalIntereses,cur2)} en intereses.
              </div>
            )}
            {(m.pagosCapital||[]).length===0 ? (
              <Card><p style={{textAlign:"center",color:"#444",fontSize:13,padding:"20px 0"}}>Sin pagos a capital registrados. Los pagos a capital reducen el saldo y acortan el plazo.</p></Card>
            ) : (
              <Card>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                      {["Mes","Fecha","Monto","Cuenta","Notas"].map(h=>(
                        <th key={h} style={{padding:"7px 10px",textAlign:"right",color:"#555",fontWeight:600}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {[...(m.pagosCapital||[])].reverse().map(p=>{
                        const cta=accounts.find(a=>a.id===p.cuentaId);
                        return (
                          <tr key={p.id} style={{borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                            <td style={{padding:"7px 10px",color:"#666",textAlign:"right"}}>{p.mes}</td>
                            <td style={{padding:"7px 10px",color:"#888",textAlign:"right"}}>{fmtDate(p.fecha)}</td>
                            <td style={{padding:"7px 10px",color:"#7c3aed",textAlign:"right",fontWeight:600}}>{fmt(parseFloat(p.monto),cur2)}</td>
                            <td style={{padding:"7px 10px",color:"#555",textAlign:"right",fontSize:11}}>{cta?.name||"—"}</td>
                            <td style={{padding:"7px 10px",color:"#555",textAlign:"right",fontSize:11,maxWidth:150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.notas||"—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── TAB SIMULADOR DE LIQUIDACIÓN ANTICIPADA */}
        {tab==="simulador" && <SimuladorLiquidacion m={m} prog={prog} calcAmort={calcAmort} fmt={fmt} cur2={cur2}/>}

        {/* Modal mensualidad */}
        {showPagoModal && (
          <Modal title={editPago?"Editar mensualidad":"Registrar mensualidad"} onClose={()=>setShowPagoModal(false)}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Inp label="Mes #" type="number" value={pagoForm.mes} onChange={e=>setPagoForm(p=>({...p,mes:e.target.value}))}/>
              <Inp label="Fecha de pago" type="date" value={pagoForm.fecha} onChange={e=>setPagoForm(p=>({...p,fecha:e.target.value}))}/>
            </div>
            <Inp label="Monto total pagado *" type="number" prefix="$" value={pagoForm.pago} onChange={e=>setPagoForm(p=>({...p,pago:e.target.value}))}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Inp label="Del cual a capital" type="number" prefix="$" value={pagoForm.capital} onChange={e=>setPagoForm(p=>({...p,capital:e.target.value}))}/>
              <Inp label="Del cual a interés" type="number" prefix="$" value={pagoForm.interes} onChange={e=>setPagoForm(p=>({...p,interes:e.target.value}))}/>
            </div>
            <Sel label="Descontar de cuenta" value={pagoForm.cuentaId} onChange={e=>setPagoForm(p=>({...p,cuentaId:e.target.value}))} options={acctOpts} disabled={!!editPago}/>
            {editPago && <p style={{fontSize:11,color:"#555",marginTop:-10,marginBottom:8}}>El balance de cuenta no se ajusta al editar. Elimina y re-registra si necesitas corregir el saldo.</p>}
            <Inp label="Notas" value={pagoForm.notas||""} onChange={e=>setPagoForm(p=>({...p,notas:e.target.value}))} placeholder="Referencia de pago..."/>
            {!editPago && (
              <label style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:14,cursor:"pointer",background:"rgba(0,212,170,.05)",border:"1px solid rgba(0,212,170,.12)",borderRadius:9,padding:"10px 13px"}}>
                <input type="checkbox" checked={pagoForm.registrarComoTx||false} onChange={e=>setPagoForm(p=>({...p,registrarComoTx:e.target.checked}))} style={{marginTop:2,accentColor:"#00d4aa",width:15,height:15,flexShrink:0}}/>
                <div>
                  <p style={{fontSize:12,fontWeight:700,color:"#00d4aa",margin:"0 0 2px"}}>Registrar también en Transacciones</p>
                  <p style={{fontSize:11,color:"#555",margin:0}}>Genera un gasto en el período por esta mensualidad. Desactiva si ya lo registraste manualmente.</p>
                </div>
              </label>
            )}
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <Btn variant="secondary" onClick={()=>setShowPagoModal(false)}>Cancelar</Btn>
              <Btn onClick={()=>guardarPago(m)}><Ic n="check" size={15}/>{editPago?"Actualizar":"Guardar"}</Btn>
            </div>
          </Modal>
        )}

        {/* Modal pago a capital */}
        {showCapModal && (
          <Modal title="Pago a capital" onClose={()=>setShowCapModal(false)}>
            <div style={{background:"rgba(124,58,237,.07)",border:"1px solid rgba(124,58,237,.18)",borderRadius:8,padding:"9px 12px",marginBottom:14,fontSize:12,color:"#a78bfa"}}>
              Un pago a capital reduce directamente el saldo del crédito y puede acortar el plazo total.
            </div>
            <Inp label="Monto a capital *" type="number" prefix="$" value={capForm.monto} onChange={e=>setCapForm(p=>({...p,monto:e.target.value}))}/>
            <Inp label="Fecha" type="date" value={capForm.fecha} onChange={e=>setCapForm(p=>({...p,fecha:e.target.value}))}/>
            <Sel label="Descontar de cuenta" value={capForm.cuentaId} onChange={e=>setCapForm(p=>({...p,cuentaId:e.target.value}))} options={acctOpts}/>
            <Inp label="Notas" value={capForm.notas} onChange={e=>setCapForm(p=>({...p,notas:e.target.value}))} placeholder="Referencia, origen del dinero..."/>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <Btn variant="secondary" onClick={()=>setShowCapModal(false)}>Cancelar</Btn>
              <Btn onClick={()=>guardarCapital(m)}><Ic n="check" size={15}/>Registrar pago a capital</Btn>
            </div>
          </Modal>
        )}

        {confirmModal}
      </div>
    );
  }

  // ── FORM
  if (showForm) return (
    <div style={{animation:"fadeUp .25s ease",maxWidth:600}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
        <Btn variant="ghost" onClick={()=>{setShowForm(false);setForm(emptyForm);}}><Ic n="back" size={17}/>Cancelar</Btn>
        <h2 style={{fontSize:20,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:0}}>
          {form.id?"Editar crédito":"Registrar crédito"}
        </h2>
      </div>
      <Card>
        <Inp label="Nombre del crédito *" value={form.nombre} onChange={f("nombre")} placeholder="Ej. Casa Sinaloa, Crédito BBVA..."/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Sel label="Moneda" value={form.moneda} onChange={f("moneda")} options={[{value:"MXN",label:"MXN"},{value:"USD",label:"USD"}]}/>
          <Sel label="Tipo de tasa" value={form.tipo} onChange={f("tipo")} options={[{value:"fijo",label:"Tasa fija"},{value:"variable",label:"Capital fijo"}]}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Valor de la propiedad" value={form.valorPropiedad} onChange={f("valorPropiedad")} type="number" prefix="$"/>
          <Inp label="Enganche" value={form.enganche} onChange={f("enganche")} type="number" prefix="$"/>
        </div>
        {/* cuenta para enganche */}
        {!form.id && parseFloat(form.enganche)>0 && (
          <Sel label="Descontar enganche de cuenta" value={form.engancheCuentaId} onChange={f("engancheCuentaId")} options={acctOpts}/>
        )}
        <Inp label="Monto del crédito *" value={form.monto} onChange={f("monto")} type="number" prefix="$" placeholder="Valor prop. − enganche"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Tasa anual % *" value={form.tasaAnual} onChange={f("tasaAnual")} type="number" suffix="%"/>
          <Inp label="Plazo (años) *" value={form.plazoAnios} onChange={f("plazoAnios")} type="number" suffix="años"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Cuota real del banco (opcional)" value={form.cuotaReal} onChange={f("cuotaReal")} type="number" prefix="$" placeholder="Si difiere del cálculo"/>
          <Inp label="Día de corte/vencimiento" value={form.diaCorte} onChange={f("diaCorte")} type="number" placeholder="1–28"/>
        </div>
        {/* Seguros y cargos adicionales */}
        <div style={{background:"rgba(243,156,18,.06)",border:"1px solid rgba(243,156,18,.15)",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
          <p style={{fontSize:11,fontWeight:700,color:"#f39c12",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 10px"}}>
            Seguros y cargos fijos mensuales <span style={{fontSize:10,fontWeight:400,color:"#666"}}>(opcionales — para desglose exacto)</span>
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div>
              <Inp label="Seguro de vida (mes 1)" value={form.seguroVida} onChange={f("seguroVida")} type="number" prefix="$" placeholder="898.86"/>
              <div style={{display:"flex",gap:4,marginTop:-8,marginBottom:6}}>
                {[{v:"proporcional",l:"Proporcional al saldo"},{v:"fijo",l:"Monto fijo"}].map(o=>(
                  <button key={o.v} onClick={()=>setForm(p=>({...p,seguroVidaTipo:o.v}))}
                    style={{flex:1,padding:"4px 6px",borderRadius:6,border:`1px solid ${(form.seguroVidaTipo||"proporcional")===o.v?"rgba(243,156,18,.4)":"rgba(255,255,255,.08)"}`,
                      background:(form.seguroVidaTipo||"proporcional")===o.v?"rgba(243,156,18,.12)":"transparent",
                      color:(form.seguroVidaTipo||"proporcional")===o.v?"#f39c12":"#555",cursor:"pointer",fontSize:9,fontWeight:600}}>
                    {o.l}
                  </button>
                ))}
              </div>
              {(form.seguroVidaTipo||"proporcional")==="proporcional"&&form.seguroVida&&form.monto&&(
                <p style={{fontSize:10,color:"#f39c12",margin:"-4px 0 6px"}}>
                  Tasa: {((parseFloat(form.seguroVida)*12/parseFloat(form.monto))*100).toFixed(4)}% anual sobre saldo — baja cada mes
                </p>
              )}
            </div>
            <Inp label="Seg. daños y contenidos (fijo)" value={form.seguroDanos} onChange={f("seguroDanos")} type="number" prefix="$" placeholder="551.73"/>
            <Inp label="Admin. crédito (fijo)" value={form.adminCredito} onChange={f("adminCredito")} type="number" prefix="$" placeholder="299.00"/>
          </div>
          {(parseFloat(form.seguroVida)||parseFloat(form.seguroDanos)||parseFloat(form.adminCredito))>0&&(
            <div style={{background:"rgba(243,156,18,.06)",borderRadius:8,padding:"8px 12px",marginTop:4}}>
              <p style={{fontSize:11,color:"#f39c12",margin:"0 0 3px",fontWeight:600}}>
                Pago total mes 1: {fmt((parseFloat(form.seguroVida)||0)+(parseFloat(form.seguroDanos)||0)+(parseFloat(form.adminCredito)||0)+(form.monto&&form.tasaAnual&&form.plazoAnios?(parseFloat(form.monto)*(parseFloat(form.tasaAnual)/100/12)*Math.pow(1+parseFloat(form.tasaAnual)/100/12,parseFloat(form.plazoAnios)*12))/(Math.pow(1+parseFloat(form.tasaAnual)/100/12,parseFloat(form.plazoAnios)*12)-1):0),form.moneda||"MXN")}
              </p>
              <p style={{fontSize:10,color:"#666",margin:0}}>
                Seguro vida: proporcional (baja ~$1.17/mes) · Daños y Admin: fijos
              </p>
            </div>
          )}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Banco / Institución" value={form.banco} onChange={f("banco")} placeholder="BBVA, Banorte, Infonavit..."/>
          <Inp label="Fecha de inicio" type="date" value={form.fechaInicio} onChange={f("fechaInicio")}/>
        </div>
        <Sel label={<>Cuenta domiciliada (para alertas de saldo)<HelpTip text="La cuenta donde tienes el dinero para el pago. Finanzapp verificará que tenga fondos suficientes antes del vencimiento y te avisará si no los hay."/></>}
          value={form.cuentaId} onChange={f("cuentaId")}
          options={[{value:"",label:"— Sin vincular —"},...accounts.filter(a=>a.type!=="credit").map(a=>({value:a.id,label:`${a.name} — ${fmt(a.balance,a.currency)}`}))]}/>
        {/* vista previa */}
        {form.monto && form.tasaAnual && form.plazoAnios && (()=>{
          const {cuota,totalPagar,totalIntereses}=calcAmort(form.monto,form.tasaAnual,form.plazoAnios,form.tipo);
          const cuotaEfectiva=form.cuotaReal?parseFloat(form.cuotaReal):cuota;
          return (
            <div style={{background:"rgba(0,212,170,.06)",border:"1px solid rgba(0,212,170,.15)",borderRadius:10,padding:14,marginBottom:14}}>
              <p style={{fontSize:11,fontWeight:700,color:"#00d4aa",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 10px"}}>Vista previa</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[["Cuota/mes",fmt(cuotaEfectiva,form.moneda)],["Total pagar",fmt(totalPagar,form.moneda)],["Total intereses",fmt(totalIntereses,form.moneda)]].map(([l,v])=>(
                  <div key={l}><p style={{fontSize:10,color:"#555",margin:"0 0 2px"}}>{l}</p><p style={{fontSize:13,fontWeight:700,color:"#f0f0f0",margin:0}}>{v}</p></div>
                ))}
              </div>
              {form.cuotaReal && <p style={{fontSize:11,color:"#f39c12",marginTop:8}}>⚠️ Cuota real del banco ({fmt(parseFloat(form.cuotaReal),form.moneda)}) difiere del cálculo ({fmt(cuota,form.moneda)}). El seguimiento usará la cuota del banco.</p>}
            </div>
          );
        })()}
        <Inp label="Notas" value={form.notas} onChange={f("notas")} placeholder="Condiciones especiales, seguros, comisiones..."/>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
          <Btn variant="secondary" onClick={()=>{setShowForm(false);setForm(emptyForm);}}>Cancelar</Btn>
          <Btn onClick={guardar}><Ic n="check" size={15}/>{form.id?"Actualizar":"Guardar"}</Btn>
        </div>
      </Card>
    </div>
  );

  return null;
};

export default Mortgage;
