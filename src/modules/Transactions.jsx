// Módulo de Transactions (lista, filtros, edición, export Excel).
// Extraído de App.jsx el 08-may-2026 (séptimo módulo real del refactor).
// Incluye 3 componentes:
//   - BarChart6M: barras de ingresos vs gastos últimos 6 meses
//   - DonaCategoria: dona de gastos por categoría del mes
//   - Transactions: vista principal (con applyDelta, openEdit, doExport, del inline)
// REGLA: este módulo NO importa de App.jsx ni de otros módulos.
// Solo importa de react, ../utils y ../shared.
// NOTA: XLSX se carga dinámicamente vía window.XLSX desde CDN — no requiere import.

import React, { useState, useEffect } from "react";
import { fmt, fmtDate, today, genId } from "../utils";
import {
  useCtx, useData, useConfirm,
  Actions, Alert, Badge, Btn, Card, Ic, Inp, Modal, Sel,
} from "../shared";

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

export default Transactions;
