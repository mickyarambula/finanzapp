// Módulo de Transacciones Recurrentes.
// Extraído de App.jsx el 22-abr-2026 (tercer módulo real del refactor).
// REGLA: este módulo NO importa de App.jsx ni de otros módulos.
// Solo importa de react, ../utils y ../shared.

import React, { useState } from "react";
import { fmt, fmtDate, today, genId } from "../utils";
import {
  useCtx, useData, useConfirm,
  Card, Btn, Modal, Inp, Sel, Ic, Actions,
} from "../shared";

const Recurring = () => {
  const { user, toast } = useCtx();
  const [recurrents, setRecurrents] = useData(user.id, "recurrents");
  const [accounts, setAccounts]     = useData(user.id, "accounts");
  const [transactions, setTransactions] = useData(user.id, "transactions");
  const [config] = useData(user.id, "config", {});
  const [showForm, setShowForm]     = useState(false);
  const [askConfirm, confirmModal]  = useConfirm();

  const DEFAULT_CATS = {
    income:["Salario","Freelance","Negocio","Renta","Intereses","Dividendos","Otro"],
    expense:["Alimentación","Transporte","Salud","Educación","Entretenimiento","Ropa","Servicios","Hipoteca / Vivienda","Pago de deuda","Pérdida de inversión","Abono a capital","Otro"],
  };
  const CATS_GASTO   = [...new Set([...DEFAULT_CATS.expense, ...(config.categorias?.expense||[]), ...transactions.filter(t=>t.type==="expense"&&t.category).map(t=>t.category)])];
  const CATS_INGRESO = [...new Set([...DEFAULT_CATS.income,  ...(config.categorias?.income ||[]), ...transactions.filter(t=>t.type==="income" &&t.category).map(t=>t.category)])];
  const FRECS = [{value:"semanal",label:"Semanal"},{value:"quincenal",label:"Quincenal"},{value:"mensual",label:"Mensual"},{value:"anual",label:"Anual"}];

  const emptyForm = {
    nombre:"", tipo:"expense", monto:"", frecuencia:"mensual",
    fechaInicio:today(), cuentaId:"", categoria:"", notas:"", activo:true,
    esVariable:false,
  };
  const [montoVariableModal, setMontoVariableModal] = useState(null); // {recurrente, monto}
  const [form, setForm] = useState(emptyForm);
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  // ── próxima fecha de ejecución
  const calcNext = (r) => {
    const inicioStr = r.ultimoRegistro || (r.fechaInicio && r.fechaInicio.length>=8 ? r.fechaInicio : today());
    const last = new Date(inicioStr+"T12:00:00");
    const next = new Date(isNaN(last)?new Date():last);
    if (r.frecuencia==="mensual")    next.setMonth(next.getMonth()+1);
    else if (r.frecuencia==="quincenal") next.setDate(next.getDate()+15);
    else if (r.frecuencia==="semanal")   next.setDate(next.getDate()+7);
    else if (r.frecuencia==="anual")     next.setFullYear(next.getFullYear()+1);
    return next;
  };

  const diasParaNext = (r) => {
    const next = calcNext(r);
    const hoy = new Date(); hoy.setHours(12,0,0,0);
    return Math.round((next-hoy)/86400000);
  };

  const esPendiente = (r) => {
    if (r.activo===false) return false;
    const next = calcNext(r);
    const hoyFin = new Date(); hoyFin.setHours(23,59,59,999); // fin del día actual
    return next <= hoyFin;
  };

  // ── confirmar y registrar transacción
  const confirmarConMonto = (r, montoFinal) => {
    const monto = parseFloat(montoFinal)||0;
    const cta = accounts.find(a=>a.id===r.cuentaId);
    if (r.tipo==="expense" && cta && cta.type!=="credit" && parseFloat(cta.balance||0) < monto) {
      toast(`Saldo insuficiente en ${cta.name}`,"error"); return;
    }
    const newTx = {
      id:genId(), date:today(), amount:monto,
      type:r.tipo, description:r.nombre,
      category:r.categoria||"", accountId:r.cuentaId,
      currency:cta?.currency||"MXN",
      notes: r.esVariable ? `Recurrente variable confirmado (estimado: ${fmt(parseFloat(r.monto)||0)})` : "Recurrente confirmado",
    };
    setTransactions(p=>[newTx,...p]);
    if (r.cuentaId) {
      setAccounts(p=>p.map(a=>a.id===r.cuentaId
        ? {...a, balance:parseFloat(a.balance||0)+(r.tipo==="income"?monto:-monto)}
        : a));
    }
    setRecurrents(p=>p.map(x=>x.id===r.id?{...x,ultimoRegistro:today()}:x));
    toast(`"${r.nombre}" registrado ✓`);
    setMontoVariableModal(null);
  };

  const confirmar = (r) => {
    if (r.esVariable) {
      // Para variables: abrir modal para ingresar monto real
      setMontoVariableModal({ recurrente: r, monto: r.monto });
    } else {
      confirmarConMonto(r, r.monto);
    }
  };

  const guardar = () => {
    if (!form.nombre||!form.monto) { toast("Nombre y monto son obligatorios","error"); return; }
    if (!form.fechaInicio || form.fechaInicio.length < 8) { toast("La fecha de inicio es obligatoria","error"); return; }
    if (form.id) {
      setRecurrents(p=>p.map(r=>r.id===form.id?{...form}:r));
      toast("Recurrente actualizado");
    } else {
      setRecurrents(p=>[...p,{...form,id:genId(),creadoEn:today()}]);
      toast("Recurrente creado ✓");
    }
    setShowForm(false); setForm(emptyForm);
  };

  const eliminar = async (id) => {
    const ok = await askConfirm("¿Eliminar esta transacción recurrente?");
    if (!ok) return;
    setRecurrents(p=>p.filter(r=>r.id!==id));
    toast("Recurrente eliminado","error");
  };

  const toggleActivo = (r) => {
    setRecurrents(p=>p.map(x=>x.id===r.id?{...x,activo:!x.activo}:x));
    toast(r.activo?"Recurrente pausado":"Recurrente reactivado");
  };

  const pendientes = recurrents.filter(esPendiente);
  const activos    = recurrents.filter(r=>r.activo!==false&&!esPendiente(r));
  const pausados   = recurrents.filter(r=>r.activo===false);

  const acctOpts = [{value:"",label:"— Sin vincular —"},...accounts.map(a=>({value:a.id,label:`${a.name} (${fmt(a.balance||0,a.currency)})`}))];

  // KPIs de recurrentes
  const activosTotal = recurrents.filter(r=>r.activo!==false);
  const gastosMensuales = activosTotal.filter(r=>r.tipo==="expense").reduce((s,r)=>{
    const m=parseFloat(r.monto)||0;
    if(r.frecuencia==="mensual") return s+m;
    if(r.frecuencia==="quincenal") return s+m*2;
    if(r.frecuencia==="semanal") return s+m*4.33;
    if(r.frecuencia==="anual") return s+m/12;
    return s;
  },0);
  const ingresosMensuales = activosTotal.filter(r=>r.tipo==="income").reduce((s,r)=>{
    const m=parseFloat(r.monto)||0;
    if(r.frecuencia==="mensual") return s+m;
    if(r.frecuencia==="quincenal") return s+m*2;
    if(r.frecuencia==="semanal") return s+m*4.33;
    if(r.frecuencia==="anual") return s+m/12;
    return s;
  },0);

  return (
    <div style={{animation:"fadeUp .25s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:"0 0 3px"}}>Transacciones Recurrentes</h2>
          <p style={{fontSize:13,color:"#555",margin:0}}>Gastos e ingresos fijos — confirma con un clic cuando se generen</p>
        </div>
        <Btn onClick={()=>{setForm(emptyForm);setShowForm(true);}}><Ic n="plus" size={15}/>Nueva recurrente</Btn>
      </div>

      {/* KPIs resumen mensual */}
      {activosTotal.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:18}}>
          {gastosMensuales>0&&(
            <Card style={{padding:"11px 14px",borderColor:"rgba(255,71,87,.2)"}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 3px"}}>Gastos fijos / mes</p>
              <p style={{fontSize:18,fontWeight:800,color:"#ff4757",margin:0}}>-{fmt(gastosMensuales)}</p>
              <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>{activosTotal.filter(r=>r.tipo==="expense").length} recurrente{activosTotal.filter(r=>r.tipo==="expense").length!==1?"s":""}</p>
            </Card>
          )}
          {ingresosMensuales>0&&(
            <Card style={{padding:"11px 14px",borderColor:"rgba(0,212,170,.2)"}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 3px"}}>Ingresos fijos / mes</p>
              <p style={{fontSize:18,fontWeight:800,color:"#00d4aa",margin:0}}>+{fmt(ingresosMensuales)}</p>
              <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>{activosTotal.filter(r=>r.tipo==="income").length} recurrente{activosTotal.filter(r=>r.tipo==="income").length!==1?"s":""}</p>
            </Card>
          )}
          {(gastosMensuales>0||ingresosMensuales>0)&&(
            <Card style={{padding:"11px 14px",borderColor:(ingresosMensuales-gastosMensuales)>=0?"rgba(0,212,170,.15)":"rgba(255,71,87,.15)"}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 3px"}}>Flujo fijo neto</p>
              <p style={{fontSize:18,fontWeight:800,color:(ingresosMensuales-gastosMensuales)>=0?"#00d4aa":"#ff4757",margin:0}}>
                {(ingresosMensuales-gastosMensuales)>=0?"+":""}{fmt(ingresosMensuales-gastosMensuales)}
              </p>
              <p style={{fontSize:10,color:"#444",margin:"3px 0 0"}}>{pendientes.length>0?`${pendientes.length} pendiente${pendientes.length!==1?"s":""}`:activosTotal.length+" activo"+(activosTotal.length!==1?"s":"")}</p>
            </Card>
          )}
        </div>
      )}

      {/* PENDIENTES */}
      {pendientes.length>0 && (
        <div style={{marginBottom:22}}>
          <p style={{fontSize:12,fontWeight:700,color:"#a78bfa",textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>
            Pendientes de confirmar ({pendientes.length})
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {pendientes.map(r=>{
              const cta=accounts.find(a=>a.id===r.cuentaId);
              return (
                <Card key={r.id} style={{borderColor:"rgba(124,58,237,.25)",background:"rgba(124,58,237,.05)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:36,height:36,borderRadius:9,background:r.tipo==="income"?"rgba(0,212,170,.1)":"rgba(255,71,87,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Ic n="recurring" size={18} color={r.tipo==="income"?"#00d4aa":"#ff4757"}/>
                      </div>
                      <div>
                        <p style={{fontSize:14,fontWeight:700,color:"#f0f0f0",margin:"0 0 2px"}}>{r.nombre}</p>
                        <p style={{fontSize:12,color:"#555",margin:0}}>{r.categoria||"Sin categoría"} · {r.frecuencia} · {cta?.name||"Sin cuenta"}</p>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                      <div style={{textAlign:"right"}}>
                        <span style={{fontSize:16,fontWeight:700,color:r.tipo==="income"?"#00d4aa":"#ff4757"}}>
                          {r.tipo==="income"?"+":"-"}{fmt(parseFloat(r.monto||0),cta?.currency||"MXN")}
                        </span>
                        {r.esVariable&&<p style={{fontSize:10,color:"#f39c12",margin:"2px 0 0",fontWeight:600}}>⚡ Monto variable</p>}
                      </div>
                      <Btn onClick={()=>confirmar(r)}><Ic n="check" size={15}/>{r.esVariable?"Ingresar monto":"Confirmar"}</Btn>
                      <Actions onEdit={()=>{setForm({...r});setShowForm(true);}} onDelete={()=>eliminar(r.id)}/>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* PRÓXIMAS */}
      {activos.length>0 && (
        <div style={{marginBottom:22}}>
          <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>
            Próximas ({activos.length})
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[...activos].sort((a,b)=>diasParaNext(a)-diasParaNext(b)).map(r=>{
              const dias=diasParaNext(r);
              const cta=accounts.find(a=>a.id===r.cuentaId);
              const alertColor=dias<=3?"#f39c12":dias<=7?"#f39c12aa":"#555";
              return (
                <Card key={r.id}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:34,height:34,borderRadius:9,background:r.tipo==="income"?"rgba(0,212,170,.08)":"rgba(255,255,255,.04)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Ic n="recurring" size={17} color={r.tipo==="income"?"#00d4aa":"#888"}/>
                      </div>
                      <div>
                        <p style={{fontSize:13,fontWeight:600,color:"#e0e0e0",margin:"0 0 2px"}}>{r.nombre}</p>
                        <p style={{fontSize:11,color:"#555",margin:0}}>{r.categoria||"Sin categoría"} · {r.frecuencia} · {cta?.name||"Sin cuenta"}</p>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                      <div style={{textAlign:"right"}}>
                        <p style={{fontSize:14,fontWeight:700,color:r.tipo==="income"?"#00d4aa":"#ff4757",margin:"0 0 2px"}}>
                          {r.tipo==="income"?"+":"-"}{fmt(parseFloat(r.monto||0),cta?.currency||"MXN")}
                        </p>
                        <p style={{fontSize:11,color:alertColor,margin:0}}>
                          {dias===0?"Hoy":dias===1?"Mañana":`En ${dias} días`} — {fmtDate(calcNext(r).toISOString().split("T")[0])}
                        </p>
                      </div>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>toggleActivo(r)} title="Pausar" style={{background:"rgba(255,255,255,.05)",border:"none",cursor:"pointer",color:"#666",padding:"5px 8px",borderRadius:7,display:"flex",alignItems:"center"}}>
                          <Ic n="warn" size={14}/>
                        </button>
                        <Actions onEdit={()=>{setForm({...r});setShowForm(true);}} onDelete={()=>eliminar(r.id)}/>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* PAUSADOS */}
      {pausados.length>0 && (
        <div style={{marginBottom:22}}>
          <p style={{fontSize:12,fontWeight:700,color:"#444",textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>
            Pausados ({pausados.length})
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {pausados.map(r=>{
              const cta=accounts.find(a=>a.id===r.cuentaId);
              return (
                <Card key={r.id} style={{opacity:.5}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                    <div>
                      <p style={{fontSize:13,fontWeight:600,color:"#888",margin:"0 0 2px"}}>{r.nombre}</p>
                      <p style={{fontSize:11,color:"#444",margin:0}}>{r.frecuencia} · {cta?.name||"Sin cuenta"}</p>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:13,color:"#555"}}>{fmt(parseFloat(r.monto||0),cta?.currency||"MXN")}</span>
                      <Btn size="sm" variant="secondary" onClick={()=>toggleActivo(r)}>Reactivar</Btn>
                      <Actions onEdit={()=>{setForm({...r});setShowForm(true);}} onDelete={()=>eliminar(r.id)}/>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {recurrents.length===0 && (
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:44,marginBottom:8}}>🔄</div>
          <p style={{fontSize:16,fontWeight:700,color:"#e0e0e0",margin:"0 0 8px"}}>Sin recurrentes configurados</p>
          <p style={{fontSize:13,color:"#555",margin:"0 0 12px",lineHeight:1.5,maxWidth:360,marginLeft:"auto",marginRight:"auto"}}>
            Configura tus pagos fijos y fuentes de ingreso estables. Finanzapp te recordará cuándo confirmarlos y proyectará tu flujo mensual automáticamente.
          </p>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:14}}>
            {["💼 Salario","🏠 Renta","💡 Servicios","📱 Suscripciones","🚗 Crédito auto"].map(t=>(
              <span key={t} style={{fontSize:11,padding:"4px 10px",borderRadius:20,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"#666"}}>{t}</span>
            ))}
          </div>
          <Btn onClick={()=>{setForm(emptyForm);setShowForm(true);}}>Crear primera recurrente</Btn>
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <Modal title={form.id?"Editar recurrente":"Nueva transacción recurrente"} onClose={()=>{setShowForm(false);setForm(emptyForm);}} width={520}>
          <Inp label="Nombre *" value={form.nombre} onChange={f("nombre")} placeholder="Ej. Netflix, Renta, Nómina..."/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Sel label="Tipo" value={form.tipo} onChange={f("tipo")} options={[{value:"expense",label:"Gasto"},{value:"income",label:"Ingreso"}]}/>
            <Sel label="Frecuencia" value={form.frecuencia} onChange={f("frecuencia")} options={FRECS}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"flex-end"}}>
            <Inp label="Monto estimado *" type="number" prefix="$" value={form.monto} onChange={f("monto")}/>
            <label style={{display:"flex",alignItems:"center",gap:8,padding:"9px 13px",background:form.esVariable?"rgba(243,156,18,.08)":"rgba(255,255,255,.04)",border:`1px solid ${form.esVariable?"rgba(243,156,18,.3)":"rgba(255,255,255,.08)"}`,borderRadius:9,cursor:"pointer",whiteSpace:"nowrap",marginBottom:14}}>
              <input type="checkbox" checked={!!form.esVariable} onChange={e=>setForm(p=>({...p,esVariable:e.target.checked}))} style={{accentColor:"#f39c12",width:14,height:14}}/>
              <span style={{fontSize:12,color:form.esVariable?"#f39c12":"#666",fontWeight:600}}>Monto variable</span>
            </label>
          </div>
          {form.esVariable&&(
            <div style={{padding:"8px 12px",background:"rgba(243,156,18,.06)",border:"1px solid rgba(243,156,18,.2)",borderRadius:8,marginTop:-10,marginBottom:14,fontSize:11,color:"#f39c12"}}>
              💡 Al confirmar te pedirá el monto real de ese período. El monto estimado es para proyecciones.
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Sel label="Categoría" value={form.categoria} onChange={f("categoria")}
              options={[{value:"",label:"— Seleccionar —"},...(form.tipo==="income"?CATS_INGRESO:CATS_GASTO).map(c=>({value:c,label:c}))]}/>
            <Inp label="Fecha de inicio" type="date" value={form.fechaInicio} onChange={f("fechaInicio")}/>
          </div>
          <Sel label="Cuenta a afectar" value={form.cuentaId} onChange={f("cuentaId")} options={acctOpts}/>
          <Inp label="Notas" value={form.notas} onChange={f("notas")} placeholder="Referencia, número de contrato..."/>
          {/* vista previa anual */}
          {form.monto && (()=>{
            const m=parseFloat(form.monto)||0;
            const veces=form.frecuencia==="semanal"?52:form.frecuencia==="quincenal"?24:form.frecuencia==="mensual"?12:1;
            return (
              <div style={{background:"rgba(0,212,170,.06)",border:"1px solid rgba(0,212,170,.12)",borderRadius:9,padding:"10px 14px",marginBottom:14}}>
                <p style={{fontSize:11,color:"#555",margin:"0 0 6px"}}>Impacto anual estimado</p>
                <p style={{fontSize:14,fontWeight:700,color:form.tipo==="income"?"#00d4aa":"#ff4757",margin:0}}>
                  {form.tipo==="income"?"+":"-"}{fmt(m*veces,"MXN")} / año ({veces}× de {fmt(m,"MXN")})
                </p>
              </div>
            );
          })()}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn variant="secondary" onClick={()=>{setShowForm(false);setForm(emptyForm);}}>Cancelar</Btn>
            <Btn onClick={guardar}><Ic n="check" size={15}/>{form.id?"Actualizar":"Guardar"}</Btn>
          </div>
        </Modal>
      )}
      {/* Modal monto variable */}
      {montoVariableModal&&(
        <Modal title={`Confirmar: ${montoVariableModal.recurrente.nombre}`} onClose={()=>setMontoVariableModal(null)} width={420}>
          <p style={{fontSize:13,color:"#888",marginBottom:16}}>
            Este recurrente tiene monto variable. Ingresa el monto real de este período:
          </p>
          <div style={{background:"rgba(243,156,18,.06)",border:"1px solid rgba(243,156,18,.2)",borderRadius:9,padding:"10px 14px",marginBottom:14}}>
            <p style={{fontSize:11,color:"#777",margin:"0 0 2px"}}>Monto estimado (referencia)</p>
            <p style={{fontSize:16,fontWeight:700,color:"#f39c12",margin:0}}>{fmt(parseFloat(montoVariableModal.recurrente.monto)||0)}</p>
          </div>
          <Inp label="Monto real de este período *" type="number" prefix="$"
            value={montoVariableModal.monto}
            onChange={e=>setMontoVariableModal(p=>({...p,monto:e.target.value}))}
            placeholder={montoVariableModal.recurrente.monto}/>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
            <Btn variant="secondary" onClick={()=>setMontoVariableModal(null)}>Cancelar</Btn>
            <Btn onClick={()=>confirmarConMonto(montoVariableModal.recurrente, montoVariableModal.monto)}>
              <Ic n="check" size={15}/>Registrar
            </Btn>
          </div>
        </Modal>
      )}
      {confirmModal}
    </div>
  );
};

export default Recurring;
