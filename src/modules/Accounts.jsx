// Módulo de Accounts (cuentas bancarias, efectivo, tarjetas).
// Extraído de App.jsx el 08-may-2026 (octavo módulo real del refactor).
// Componente único — sin dependencias ocultas.
// REGLA: este módulo NO importa de App.jsx ni de otros módulos.
// Solo importa de react, ../utils y ../shared.

import React, { useState } from "react";
import { fmt, fmtDate, today, genId } from "../utils";
import {
  useCtx, useData, useConfirm,
  Badge, Btn, Card, Ic, Inp, Modal, Sel,
} from "../shared";

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

export default Accounts;
