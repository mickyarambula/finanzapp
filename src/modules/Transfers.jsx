// Módulo de Transfers (transferencias entre cuentas + pagos de tarjeta).
// Extraído de App.jsx el 08-may-2026 (noveno módulo real del refactor).
// Componente único — sin dependencias ocultas.
// REGLA: este módulo NO importa de App.jsx ni de otros módulos.
// Solo importa de react, ../utils y ../shared.
// NOTA: usa fetch() runtime para tasa USD→MXN desde open.er-api.com — no requiere import.

import React, { useState } from "react";
import { fmt, fmtDate, today, genId } from "../utils";
import {
  useCtx, useData, useConfirm,
  Actions, Alert, Badge, Btn, Card, Ic, Inp, Modal, Sel,
} from "../shared";

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

export default Transfers;
