// Módulo de Settings (Configuración: TC USD/MXN, fecha de inicio, categorías, backup, limpieza).
// Extraído de App.jsx el 14-may-2026 (undécimo módulo del refactor).
// Sub-componente top-level: CatInput (input aislado para evitar pérdida de foco al agregar categorías).
// Sub-componente closure interna: Section (no se exporta, vive dentro de Settings).
// REGLA: este módulo NO importa de App.jsx ni de otros módulos.
// Solo importa de react y ../shared.

import React, { useState } from "react";
import { useCtx, useData, useConfirm, Btn, Card, Ic, Inp } from "../shared";

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

export { Settings, CatInput };
