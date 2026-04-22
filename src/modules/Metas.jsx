// Módulo de Metas de ahorro.
// Extraído de App.jsx el 22-abr-2026 (primer módulo real del refactor).
// REGLA: este módulo NO importa de App.jsx ni de otros módulos.
// Solo importa de react, ../utils y ../shared.

import React, { useState } from "react";
import { fmt, fmtDate, today, genId } from "../utils";
import {
  useCtx, useData, useConfirm, getTc,
  Card, Btn, Modal, Inp, Sel, Ic, Badge, Actions,
} from "../shared";

const Metas = () => {
  const { user, toast } = useCtx();
  const TC = getTc(user.id);
  const [goals, setGoals]         = useData(user.id, "goals");
  const [accounts]                = useData(user.id, "accounts");
  const [transactions]            = useData(user.id, "transactions");
  const [investments]             = useData(user.id, "investments");
  const [view, setView]           = useState("list"); // list | detail | form
  const [selected, setSelected]   = useState(null);
  const [askConfirm, confirmModal] = useConfirm();
  const [tab, setTab]             = useState("resumen");
  const [showAportModal, setShowAportModal] = useState(false);
  const [aportForm, setAportForm] = useState({ monto:"", fecha:today(), notas:"" });

  // ── liquidez total (cuentas que no son inversión ni crédito)
  const liquidezTotal = accounts
    .filter(a => !["investment"].includes(a.type))
    .reduce((s,a) => s + (parseFloat(a.balance)||0) * (a.currency==="USD" ? TC : 1), 0);

  // ── total comprometido en metas activas
  const totalComprometido = goals
    .filter(g => g.estado==="activa")
    .reduce((s,g) => s + parseFloat(g.meta), 0);

  const emptyForm = {
    nombre:"", tipo:"fijo", meta:"", moneda:"MXN", fechaLimite:"",
    aporteMensual:"", cuentaRef:"", invRef:"", mesesEmergencia:"3",
    descripcion:"", color:"#00d4aa", aportaciones:[], estado:"activa",
  };
  const [form, setForm] = useState(emptyForm);
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const COLORES = ["#00d4aa","#7c3aed","#f39c12","#3b82f6","#ef4444","#10b981","#f97316","#ec4899"];
  const TIPOS = [
    { value:"fijo",      label:"Monto fijo",         desc:"Juntar $X para fecha Y" },
    { value:"periodico", label:"Ahorro periódico",    desc:"Aportar $X cada mes" },
    { value:"inversion", label:"Vinculada a inversión", desc:"Meta ligada a una inversión" },
    { value:"emergencia",label:"Fondo de emergencia", desc:"X meses de gastos cubiertos" },
  ];

  // ── cálculo de gasto mensual promedio (últimos 3 meses)
  const gastoMensual = (() => {
    const hace3 = new Date(); hace3.setMonth(hace3.getMonth()-3);
    const gastos = transactions.filter(t=>t.type==="expense" && new Date(t.date)>=hace3);
    const total = gastos.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    return total/3;
  })();

  // ── calcular meta de emergencia automáticamente
  const metaEmergencia = (g) => gastoMensual * (parseFloat(g.mesesEmergencia)||3);

  // ── meta efectiva (para fondo emergencia, se calcula en base a gastos)
  const metaEfectiva = (g) => g.tipo==="emergencia" ? metaEmergencia(g) : parseFloat(g.meta)||0;

  // ── progreso de una meta
  const calcProgreso = (g) => {
    const aportado = (g.aportaciones||[]).reduce((s,a)=>s+parseFloat(a.monto||0),0);
    const meta = metaEfectiva(g);
    const pct = meta>0 ? Math.min(aportado/meta*100,100) : 0;
    const faltante = Math.max(meta-aportado,0);
    return { aportado, meta, pct, faltante };
  };

  // ── proyección: ¿llego a tiempo?
  const calcProyeccion = (g) => {
    const prog = calcProgreso(g);
    if (!g.fechaLimite && g.tipo!=="periodico") return null;
    const hoy = new Date();

    if (g.tipo==="periodico") {
      const aporteMes = parseFloat(g.aporteMensual)||0;
      if (!aporteMes) return null;
      const mesesParaMeta = prog.meta>0 ? Math.ceil(prog.faltante/aporteMes) : 0;
      const fechaEstimada = new Date(hoy);
      fechaEstimada.setMonth(fechaEstimada.getMonth()+mesesParaMeta);
      return { mesesParaMeta, fechaEstimada: fechaEstimada.toISOString().split("T")[0], aTiempo:true, aporteMensualNecesario:aporteMes };
    }

    const limite = new Date(g.fechaLimite+"T12:00:00");
    const mesesRestantes = Math.max(Math.round((limite-hoy)/2592000000),1);
    const aporteMensualNecesario = prog.faltante>0 ? prog.faltante/mesesRestantes : 0;
    const aporteMensualActual = (()=>{
      if ((g.aportaciones||[]).length<2) return parseFloat(g.aporteMensual)||0;
      const sorted = [...g.aportaciones].sort((a,b)=>new Date(a.fecha)-new Date(b.fecha));
      const mesesConAporte = new Set(sorted.map(a=>a.fecha.slice(0,7))).size;
      return prog.aportado/Math.max(mesesConAporte,1);
    })();
    const aTiempo = aporteMensualActual >= aporteMensualNecesario || prog.faltante<=0;
    const diasRestantes = Math.round((limite-hoy)/86400000);
    return { mesesRestantes, diasRestantes, aporteMensualNecesario, aporteMensualActual, aTiempo, limite:g.fechaLimite };
  };

  // ── inversión vinculada
  const invVinculada = (g) => investments.find(i=>i.id===g.invRef);

  const guardar = () => {
    if (!form.nombre) { toast("Ingresa un nombre para la meta","error"); return; }
    if (form.tipo!=="emergencia" && !form.meta) { toast("Ingresa el monto objetivo","error"); return; }
    if (form.id) {
      setGoals(p=>p.map(g=>g.id===form.id?{...form}:g));
      toast("Meta actualizada");
    } else {
      setGoals(p=>[...p,{...form,id:genId(),creadoEn:today()}]);
      toast("Meta creada ✓");
    }
    setView("list"); setForm(emptyForm);
  };

  const eliminar = async (id) => {
    const ok = await askConfirm("¿Eliminar esta meta? Se perderá el historial de aportaciones.");
    if (!ok) return;
    setGoals(p=>p.filter(g=>g.id!==id));
    if (selected?.id===id) { setSelected(null); setView("list"); }
    toast("Meta eliminada","error");
  };

  const registrarAporte = (g) => {
    if (!aportForm.monto) { toast("Ingresa el monto","error"); return; }
    const nuevo = { id:genId(), monto:parseFloat(aportForm.monto), fecha:aportForm.fecha, notas:aportForm.notas };
    const updated = {...g, aportaciones:[...(g.aportaciones||[]),nuevo]};
    setGoals(p=>p.map(x=>x.id===g.id?updated:x));
    setSelected(updated);
    setShowAportModal(false);
    setAportForm({monto:"",fecha:today(),notas:""});
    toast(`Aportación de ${fmt(nuevo.monto,g.moneda)} registrada ✓`);
  };

  const eliminarAporte = async (g, aid) => {
    const ok = await askConfirm("¿Eliminar esta aportación?");
    if (!ok) return;
    const updated = {...g, aportaciones:(g.aportaciones||[]).filter(a=>a.id!==aid)};
    setGoals(p=>p.map(x=>x.id===g.id?updated:x));
    setSelected(updated);
    toast("Aportación eliminada","error");
  };

  const marcarCompletada = async (g) => {
    const ok = await askConfirm(`¿Marcar "${g.nombre}" como completada?`);
    if (!ok) return;
    const updated = {...g, estado:"completada", fechaCompletada:today()};
    setGoals(p=>p.map(x=>x.id===g.id?updated:x));
    setSelected(updated);
    toast("¡Meta completada! 🎉");
  };

  // ────────────────────────── RENDER LIST ──────────────────────────
  if (view==="list") return (
    <div style={{animation:"fadeUp .25s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:"0 0 3px"}}>Metas de Ahorro</h2>
          <p style={{fontSize:13,color:"#555",margin:0}}>Define objetivos, registra avances y proyecta si llegarás a tiempo</p>
        </div>
        <Btn onClick={()=>{setForm(emptyForm);setView("form");}}><Ic n="plus" size={15}/>Nueva meta</Btn>
      </div>

      {/* banner viabilidad */}
      {goals.filter(g=>g.estado==="activa").length>0 && (()=>{
        const pct = liquidezTotal>0 ? (totalComprometido/liquidezTotal*100) : 0;
        const color = pct>100?"#ff4757":pct>75?"#f39c12":"#00d4aa";
        return (
          <Card style={{marginBottom:18,borderColor:`${color}33`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <div>
                <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 4px"}}>Viabilidad de metas</p>
                <p style={{fontSize:13,color:"#ccc",margin:0}}>
                  Comprometido: <strong style={{color}}>{fmt(totalComprometido,"MXN")}</strong> de <strong style={{color:"#ccc"}}>{fmt(liquidezTotal,"MXN")}</strong> disponible
                </p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Badge label={pct>100?"Sobrecomprometido":pct>75?"Ajustado":"Viable"} color={color}/>
                <span style={{fontSize:14,fontWeight:700,color}}>{pct.toFixed(0)}%</span>
              </div>
            </div>
            <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,.06)",overflow:"hidden",marginTop:10}}>
              <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:`linear-gradient(90deg,${color},${color}99)`,borderRadius:3,transition:"width .4s"}}/>
            </div>
            {pct>100 && <p style={{fontSize:11,color:"#ff4757",marginTop:6}}>⚠️ Tus metas superan tu liquidez disponible. Considera ajustar montos o plazos.</p>}
          </Card>
        );
      })()}

      {goals.length===0 ? (
        <div style={{textAlign:"center",padding:"60px 20px"}}>
          <Ic n="goals" size={48} color="#333"/>
          <div style={{fontSize:44,marginBottom:8}}>🎯</div>
          <p style={{fontSize:16,fontWeight:700,color:"#e0e0e0",margin:"0 0 8px"}}>Sin metas de ahorro</p>
          <p style={{fontSize:13,color:"#555",margin:"0 0 12px",lineHeight:1.5,maxWidth:340,marginLeft:"auto",marginRight:"auto"}}>
            Define un objetivo — vacaciones, auto, fondo de emergencia, enganche de casa — y Finanzapp te dice si vas en camino de lograrlo.
          </p>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:14}}>
            {["✈️ Viaje","🚗 Auto","🏠 Enganche","🛡️ Fondo emergencia","🎓 Educación"].map(t=>(
              <span key={t} style={{fontSize:11,padding:"4px 10px",borderRadius:20,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"#666"}}>{t}</span>
            ))}
          </div>
          <Btn onClick={()=>{setForm(emptyForm);setView("form");}}>Crear primera meta</Btn>
        </div>
      ) : (
        <div style={{display:"grid",gap:14}}>
          {/* activas primero, luego completadas */}
          {[...goals].sort((a,b)=>(a.estado==="completada"?1:-1)).map(g=>{
            const prog = calcProgreso(g);
            const proy = calcProyeccion(g);
            const inv  = invVinculada(g);
            const completada = g.estado==="completada";
            return (
              <Card key={g.id} onClick={()=>{setSelected(g);setView("detail");setTab("resumen");}} style={{opacity:completada?.7:1,borderColor:completada?"rgba(0,212,170,.15)":`${g.color||"#00d4aa"}22`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{width:36,height:36,borderRadius:9,background:`${g.color||"#00d4aa"}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Ic n="goals" size={19} color={g.color||"#00d4aa"}/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                          <p style={{fontSize:15,fontWeight:700,color:"#f0f0f0",margin:0}}>{g.nombre}</p>
                          <Badge label={completada?"Completada":TIPOS.find(t=>t.value===g.tipo)?.label||g.tipo} color={completada?"#00d4aa":g.color||"#00d4aa"}/>
                        </div>
                        {g.descripcion && <p style={{fontSize:12,color:"#555",margin:"2px 0 0"}}>{g.descripcion}</p>}
                      </div>
                    </div>
                    {/* barra */}
                    <div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:11,color:"#555"}}>{fmt(prog.aportado,g.moneda)} aportado</span>
                        <span style={{fontSize:11,color:"#555"}}>{prog.pct.toFixed(1)}% de {fmt(prog.meta,g.moneda)}</span>
                      </div>
                      <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${prog.pct}%`,background:`linear-gradient(90deg,${g.color||"#00d4aa"},${g.color||"#00d4aa"}99)`,borderRadius:3,transition:"width .4s"}}/>
                      </div>
                    </div>
                    {/* proyección */}
                    {proy && !completada && (
                      <div style={{marginTop:7,display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:proy.aTiempo?"#00d4aa":"#ff4757",flexShrink:0}}/>
                        <span style={{fontSize:11,color:proy.aTiempo?"#00d4aa":"#ff4757"}}>
                          {proy.aTiempo
                            ? g.tipo==="periodico"
                              ? `Llegas en ~${proy.mesesParaMeta} meses`
                              : `En camino — vence ${fmtDate(proy.limite)}`
                            : `Necesitas ${fmt(proy.aporteMensualNecesario,g.moneda)}/mes para llegar a tiempo`}
                        </span>
                      </div>
                    )}
                    {inv && <p style={{fontSize:11,color:"#7c3aed",marginTop:5}}>📊 Vinculada a: {inv.name}</p>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                    <p style={{fontSize:17,fontWeight:700,color:g.color||"#00d4aa",margin:0}}>{fmt(prog.faltante,g.moneda)}</p>
                    <p style={{fontSize:11,color:"#555",margin:0}}>faltante</p>
                    {g.fechaLimite && <p style={{fontSize:11,color:"#555",margin:"3px 0 0"}}>{fmtDate(g.fechaLimite)}</p>}
                    <Actions onEdit={e=>{e.stopPropagation();setForm({...g});setView("form");}} onDelete={e=>{e.stopPropagation();eliminar(g.id);}}/>
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

  // ────────────────────────── RENDER DETAIL ──────────────────────────
  if (view==="detail" && selected) {
    const g = goals.find(x=>x.id===selected.id)||selected;
    const prog = calcProgreso(g);
    const proy = calcProyeccion(g);
    const inv  = invVinculada(g);
    const completada = g.estado==="completada";
    const TABS = [{id:"resumen",label:"Resumen"},{id:"aportaciones",label:"Aportaciones"}];

    return (
      <div style={{animation:"fadeUp .25s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
          <Btn variant="ghost" onClick={()=>setView("list")}><Ic n="back" size={17}/>Volver</Btn>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <h2 style={{fontSize:20,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:0}}>{g.nombre}</h2>
              <Badge label={completada?"Completada":TIPOS.find(t=>t.value===g.tipo)?.label||g.tipo} color={completada?"#00d4aa":g.color||"#00d4aa"}/>
            </div>
            {g.descripcion && <p style={{fontSize:12,color:"#555",margin:"3px 0 0"}}>{g.descripcion}</p>}
          </div>
          {!completada && (
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Btn variant="secondary" onClick={()=>marcarCompletada(g)}><Ic n="check" size={15}/>Completada</Btn>
              <Btn onClick={()=>{setAportForm({monto:"",fecha:today(),notas:""});setShowAportModal(true);}}><Ic n="plus" size={15}/>Aportación</Btn>
            </div>
          )}
        </div>

        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10,marginBottom:14}}>
          {[
            ["Meta",fmt(prog.meta,g.moneda),g.color||"#00d4aa"],
            ["Aportado",fmt(prog.aportado,g.moneda),"#00d4aa"],
            ["Faltante",fmt(prog.faltante,g.moneda),"#f39c12"],
            ["Avance",`${prog.pct.toFixed(1)}%`,g.color||"#00d4aa"],
            ["Aportaciones",String((g.aportaciones||[]).length),"#ccc"],
            g.fechaLimite?["Vence",fmtDate(g.fechaLimite),"#ccc"]:["Tipo",TIPOS.find(t=>t.value===g.tipo)?.label,"#ccc"],
          ].map(([l,v,c])=>(
            <Card key={l}><p style={{fontSize:10,color:"#555",margin:"0 0 4px"}}>{l}</p><p style={{fontSize:14,fontWeight:700,color:c,margin:0}}>{v}</p></Card>
          ))}
        </div>

        {/* barra grande */}
        <Card style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:13,color:"#888"}}>Progreso total</span>
            <span style={{fontSize:13,fontWeight:700,color:g.color||"#00d4aa"}}>{prog.pct.toFixed(2)}%</span>
          </div>
          <div style={{height:12,borderRadius:6,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${prog.pct}%`,background:`linear-gradient(90deg,${g.color||"#00d4aa"},${g.color||"#00d4aa"}88)`,borderRadius:6,transition:"width .5s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
            <span style={{fontSize:11,color:"#444"}}>{fmt(prog.aportado,g.moneda)} aportado</span>
            <span style={{fontSize:11,color:"#444"}}>{fmt(prog.faltante,g.moneda)} faltante</span>
          </div>
        </Card>

        {/* tabs */}
        <div style={{display:"flex",gap:2,marginBottom:14,background:"rgba(255,255,255,.03)",borderRadius:10,padding:3,width:"fit-content"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .15s",background:tab===t.id?"linear-gradient(135deg,#00d4aa,#00a884)":"transparent",color:tab===t.id?"#fff":"#666"}}>{t.label}</button>
          ))}
        </div>

        {tab==="resumen" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14}}>
            <Card>
              <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Datos de la meta</p>
              {[
                ["Tipo",TIPOS.find(t=>t.value===g.tipo)?.label||g.tipo],
                ["Moneda",g.moneda],
                g.tipo==="emergencia"?["Meses de emergencia",g.mesesEmergencia||3]:null,
                g.tipo==="emergencia"?["Gasto mensual promedio",fmt(gastoMensual,"MXN")]:null,
                g.tipo==="emergencia"?["Meta calculada",fmt(metaEmergencia(g),"MXN")]:null,
                g.tipo==="inversion"&&inv?["Inversión vinculada",inv.name]:null,
                g.fechaLimite?["Fecha límite",fmtDate(g.fechaLimite)]:null,
                g.tipo==="periodico"?["Aporte mensual objetivo",fmt(parseFloat(g.aporteMensual)||0,g.moneda)]:null,
                completada?["Completada el",fmtDate(g.fechaCompletada)]:null,
              ].filter(Boolean).map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                  <span style={{fontSize:13,color:"#666"}}>{l}</span>
                  <span style={{fontSize:13,fontWeight:600,color:"#ccc"}}>{v}</span>
                </div>
              ))}
              {g.descripcion && <p style={{fontSize:12,color:"#555",marginTop:10,fontStyle:"italic"}}>{g.descripcion}</p>}
            </Card>

            <Card>
              <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Proyección</p>
              {!proy ? (
                <p style={{fontSize:13,color:"#555",fontStyle:"italic"}}>Define fecha límite o aporte mensual para ver proyección.</p>
              ) : (
                <>
                  <div style={{background:proy.aTiempo?"rgba(0,212,170,.07)":"rgba(255,71,87,.07)",border:`1px solid ${proy.aTiempo?"rgba(0,212,170,.2)":"rgba(255,71,87,.2)"}`,borderRadius:8,padding:"10px 14px",marginBottom:12}}>
                    <p style={{fontSize:13,fontWeight:700,color:proy.aTiempo?"#00d4aa":"#ff4757",margin:"0 0 4px"}}>
                      {proy.aTiempo?"✓ En camino":"✗ Necesitas acelerar"}
                    </p>
                    <p style={{fontSize:12,color:"#888",margin:0}}>
                      {g.tipo==="periodico"
                        ? `Con ${fmt(parseFloat(g.aporteMensual)||0,g.moneda)}/mes llegas en ~${proy.mesesParaMeta} meses`
                        : proy.aTiempo
                          ? `Tu ritmo actual es suficiente para llegar antes de ${fmtDate(proy.limite)}`
                          : `Necesitas ${fmt(proy.aporteMensualNecesario,g.moneda)}/mes para llegar a tiempo`}
                    </p>
                  </div>
                  {[
                    g.tipo!=="periodico"?["Meses restantes",proy.mesesRestantes]:null,
                    g.tipo!=="periodico"?["Días restantes",proy.diasRestantes]:null,
                    ["Aporte mensual necesario",fmt(proy.aporteMensualNecesario,g.moneda)],
                    g.tipo!=="periodico"?["Ritmo actual",fmt(proy.aporteMensualActual,g.moneda)]:null,
                    g.tipo==="periodico"?["Fecha estimada llegada",fmtDate(proy.fechaEstimada)]:null,
                  ].filter(Boolean).map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                      <span style={{fontSize:13,color:"#666"}}>{l}</span>
                      <span style={{fontSize:13,fontWeight:600,color:"#ccc"}}>{v}</span>
                    </div>
                  ))}
                </>
              )}
              {/* viabilidad vs liquidez */}
              <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.05)"}}>
                <p style={{fontSize:11,color:"#555",marginBottom:6}}>Liquidez disponible vs. esta meta</p>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                  <span style={{color:"#666"}}>Liquidez total</span>
                  <span style={{color:"#ccc",fontWeight:600}}>{fmt(liquidezTotal,"MXN")}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginTop:4}}>
                  <span style={{color:"#666"}}>Esta meta</span>
                  <span style={{color:g.color||"#00d4aa",fontWeight:600}}>{fmt(prog.meta,g.moneda)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginTop:4}}>
                  <span style={{color:"#666"}}>Cobertura</span>
                  <span style={{color:liquidezTotal>=prog.meta?"#00d4aa":"#ff4757",fontWeight:600}}>
                    {liquidezTotal>0?(prog.meta/liquidezTotal*100).toFixed(1):0}% de tu liquidez
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab==="aportaciones" && (
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
              {!completada && <Btn onClick={()=>{setAportForm({monto:"",fecha:today(),notas:""});setShowAportModal(true);}}><Ic n="plus" size={15}/>Nueva aportación</Btn>}
            </div>
            {(g.aportaciones||[]).length===0 ? (
              <Card><p style={{textAlign:"center",color:"#444",fontSize:13,padding:"20px 0"}}>Sin aportaciones registradas. Las aportaciones son solo seguimiento visual — no mueven dinero de tus cuentas.</p></Card>
            ) : (
              <Card>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                      {["Fecha","Monto","Acumulado","Notas",""].map(h=>(
                        <th key={h} style={{padding:"7px 10px",textAlign:"right",color:"#555",fontWeight:600}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {(()=>{
                        let acum=0;
                        return [...(g.aportaciones||[])].sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(a=>{
                          acum+=parseFloat(a.monto);
                          return (
                            <tr key={a.id} style={{borderBottom:"1px solid rgba(255,255,255,.03)",background:a.txId?"rgba(0,212,170,.02)":"transparent"}}>
                              <td style={{padding:"7px 10px",textAlign:"right"}}>
                                <span style={{fontSize:12,color:"#888",display:"block"}}>{fmtDate(a.fecha)}</span>
                                {a.txId&&<span style={{fontSize:9,color:"#00d4aa",fontWeight:700,background:"rgba(0,212,170,.1)",borderRadius:4,padding:"1px 5px"}}>📎 TX</span>}
                              </td>
                              <td style={{padding:"7px 10px",color:g.color||"#00d4aa",textAlign:"right",fontWeight:600}}>{fmt(parseFloat(a.monto),g.moneda)}</td>
                              <td style={{padding:"7px 10px",color:"#ccc",textAlign:"right"}}>{fmt(acum,g.moneda)}</td>
                              <td style={{padding:"7px 10px",color:"#555",textAlign:"right",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                {a.txId?<span style={{color:"#444",fontStyle:"italic"}}>Desde transacción</span>:(a.notas||"—")}
                              </td>
                              <td style={{padding:"7px 10px",textAlign:"right"}}>
                                {!completada && !a.txId && <button onClick={()=>eliminarAporte(g,a.id)} style={{background:"rgba(255,71,87,.08)",border:"none",cursor:"pointer",color:"#ff4757",padding:"4px 7px",borderRadius:6,display:"flex",alignItems:"center"}}><Ic n="trash" size={13}/></button>}
                                {!completada && a.txId && <span style={{fontSize:9,color:"#444"}}>Auto</span>}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* modal aportación */}
        {showAportModal && (
          <Modal title="Registrar aportación" onClose={()=>setShowAportModal(false)}>
            <div style={{background:"rgba(0,212,170,.06)",border:"1px solid rgba(0,212,170,.12)",borderRadius:8,padding:"9px 12px",marginBottom:14,fontSize:12,color:"#00d4aa"}}>
              Esta aportación es solo seguimiento — no descuenta saldo de ninguna cuenta.
            </div>
            <Inp label="Monto *" type="number" prefix="$" value={aportForm.monto} onChange={e=>setAportForm(p=>({...p,monto:e.target.value}))}/>
            <Inp label="Fecha" type="date" value={aportForm.fecha} onChange={e=>setAportForm(p=>({...p,fecha:e.target.value}))}/>
            <Inp label="Notas" value={aportForm.notas} onChange={e=>setAportForm(p=>({...p,notas:e.target.value}))} placeholder="De dónde salió, propósito..."/>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <Btn variant="secondary" onClick={()=>setShowAportModal(false)}>Cancelar</Btn>
              <Btn onClick={()=>registrarAporte(g)}><Ic n="check" size={15}/>Registrar</Btn>
            </div>
          </Modal>
        )}
        {confirmModal}
      </div>
    );
  }

  // ────────────────────────── RENDER FORM ──────────────────────────
  if (view==="form") return (
    <div style={{animation:"fadeUp .25s ease",maxWidth:600}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
        <Btn variant="ghost" onClick={()=>{setView("list");setForm(emptyForm);}}><Ic n="back" size={17}/>Cancelar</Btn>
        <h2 style={{fontSize:20,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:0}}>
          {form.id?"Editar meta":"Nueva meta de ahorro"}
        </h2>
      </div>
      <Card>
        <Inp label="Nombre de la meta *" value={form.nombre} onChange={f("nombre")} placeholder="Ej. Fondo vacaciones, Enganche casa..."/>
        <Inp label="Descripción (opcional)" value={form.descripcion} onChange={f("descripcion")} placeholder="Detalles adicionales..."/>

        {/* tipo */}
        <div style={{marginBottom:14}}>
          <label style={{display:"block",marginBottom:8,fontSize:12,fontWeight:600,color:"#999",textTransform:"uppercase",letterSpacing:.4}}>Tipo de meta *</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {TIPOS.map(t=>(
              <button key={t.value} onClick={()=>setForm(p=>({...p,tipo:t.value}))} style={{padding:"10px 12px",borderRadius:9,border:`1px solid ${form.tipo===t.value?form.color||"#00d4aa":"rgba(255,255,255,.08)"}`,background:form.tipo===t.value?`${form.color||"#00d4aa"}12`:"rgba(255,255,255,.03)",cursor:"pointer",textAlign:"left"}}>
                <p style={{fontSize:12,fontWeight:700,color:form.tipo===t.value?form.color||"#00d4aa":"#ccc",margin:"0 0 2px"}}>{t.label}</p>
                <p style={{fontSize:11,color:"#555",margin:0}}>{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <Sel label="Moneda" value={form.moneda} onChange={f("moneda")} options={[{value:"MXN",label:"MXN"},{value:"USD",label:"USD"}]}/>

        {/* campos según tipo */}
        {form.tipo==="fijo" && <>
          <Inp label="Monto objetivo *" type="number" prefix="$" value={form.meta} onChange={f("meta")} placeholder="¿Cuánto quieres juntar?"/>
          <Inp label="Fecha límite" type="date" value={form.fechaLimite} onChange={f("fechaLimite")}/>
        </>}

        {form.tipo==="periodico" && <>
          <Inp label="Monto objetivo *" type="number" prefix="$" value={form.meta} onChange={f("meta")} placeholder="Meta total a alcanzar"/>
          <Inp label="Aportación mensual objetivo" type="number" prefix="$" value={form.aporteMensual} onChange={f("aporteMensual")} placeholder="¿Cuánto apartarás por mes?"/>
        </>}

        {form.tipo==="inversion" && <>
          <Inp label="Monto objetivo *" type="number" prefix="$" value={form.meta} onChange={f("meta")}/>
          <Inp label="Fecha límite" type="date" value={form.fechaLimite} onChange={f("fechaLimite")}/>
          <Sel label="Inversión vinculada" value={form.invRef} onChange={f("invRef")} options={[{value:"",label:"— Seleccionar inversión —"},...investments.map(i=>({value:i.id,label:i.name}))]}/>
        </>}

        {form.tipo==="emergencia" && <>
          <Inp label="Meses de gastos a cubrir" type="number" value={form.mesesEmergencia} onChange={f("mesesEmergencia")} suffix="meses"/>
          {gastoMensual>0 && (
            <div style={{background:"rgba(0,212,170,.06)",border:"1px solid rgba(0,212,170,.12)",borderRadius:9,padding:"10px 14px",marginBottom:14}}>
              <p style={{fontSize:11,color:"#555",margin:"0 0 4px"}}>Basado en tu gasto mensual promedio</p>
              <p style={{fontSize:14,fontWeight:700,color:"#00d4aa",margin:0}}>{fmt(gastoMensual*(parseFloat(form.mesesEmergencia)||3),"MXN")}</p>
              <p style={{fontSize:11,color:"#555",margin:"3px 0 0"}}>{fmt(gastoMensual,"MXN")}/mes × {form.mesesEmergencia||3} meses</p>
            </div>
          )}
        </>}

        {/* color */}
        <div style={{marginBottom:16}}>
          <label style={{display:"block",marginBottom:8,fontSize:12,fontWeight:600,color:"#999",textTransform:"uppercase",letterSpacing:.4}}>Color</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {COLORES.map(c=>(
              <button key={c} onClick={()=>setForm(p=>({...p,color:c}))} style={{width:28,height:28,borderRadius:"50%",background:c,border:`2px solid ${form.color===c?"#fff":"transparent"}`,cursor:"pointer",transition:"border .15s"}}/>
            ))}
          </div>
        </div>

        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn variant="secondary" onClick={()=>{setView("list");setForm(emptyForm);}}>Cancelar</Btn>
          <Btn onClick={guardar}><Ic n="check" size={15}/>{form.id?"Actualizar":"Crear meta"}</Btn>
        </div>
      </Card>
    </div>
  );

  return null;
};

export default Metas;
