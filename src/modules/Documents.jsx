// Módulo de Documents (gestión documental: subida, preview, filtros, edición).
// Extraído de App.jsx el 14-may-2026 (duodécimo módulo del refactor).
// Sub-componente closure interno: PreviewModal (no se exporta, vive dentro de Documents).
// REGLA: este módulo NO importa de App.jsx ni de otros módulos.
// Solo importa de react, ../utils y ../shared.

import { useState, useRef } from "react";
import { fmtDate, genId } from "../utils";
import { useCtx, useData, Ic, Inp } from "../shared";

const Documents = () => {
  const { user, toast } = useCtx();
  const [docs, setDocs]   = useData(user.id, "documents", []);
  const [accounts]        = useData(user.id, "accounts");
  const [loans]           = useData(user.id, "loans");
  const [mortgages]       = useData(user.id, "mortgages");
  const [investments]     = useData(user.id, "investments");

  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterMod, setFilterMod] = useState("all");
  const [sortBy, setSortBy]       = useState("fecha_desc");
  const [open, setOpen]           = useState(false);
  const [preview, setPreview]     = useState(null); // doc en preview
  const [editing, setEditing]     = useState(null);
  const fileRef = useRef();

  const CATS = ["Contrato","Estado de cuenta","Factura","Recibo","Identificación","Póliza","Otro"];
  const MODS = [
    {id:"none",label:"Sin vínculo"},
    {id:"accounts",label:"Cuenta"},
    {id:"loans",label:"Préstamo"},
    {id:"mortgages",label:"Hipoteca"},
    {id:"investments",label:"Inversión"},
  ];

  // opciones de vinculación por módulo
  const modOptions = (modId) => {
    if(modId==="accounts")    return accounts.map(a=>({id:a.id,label:a.name}));
    if(modId==="loans")       return loans.map(l=>({id:l.id,label:l.name}));
    if(modId==="mortgages")   return mortgages.map(m=>({id:m.id,label:m.nombre||m.banco||"Hipoteca"}));
    if(modId==="investments") return investments.map(i=>({id:i.id,label:i.nombre||i.name}));
    return [];
  };

  const blank = { nombre:"", categoria:"Otro", descripcion:"", etiquetas:"", modulo:"none", moduloItemId:"", vencimiento:"", fileData:null, fileType:"", fileSize:0, fileName:"" };
  const [form, setForm] = useState(blank);
  const [uploading, setUploading] = useState(false);

  const fmtSize = (b) => b>1048576?`${(b/1048576).toFixed(1)} MB`:b>1024?`${(b/1024).toFixed(0)} KB`:`${b} B`;
  // fmtDate usa la global definida al inicio del archivo

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    if(file.size > 8*1024*1024) { toast("Archivo mayor a 8 MB. Intenta comprimir o dividir el documento.","error"); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(f=>({...f, fileData:ev.target.result, fileType:file.type, fileSize:file.size, fileName:file.name, nombre:f.nombre||file.name.replace(/\.[^.]+$/,"")}));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if(!form.nombre.trim()) { toast("Ingresa un nombre para el documento","error"); return; }
    if(!form.fileData && !editing) { toast("Selecciona un archivo","error"); return; }
    const now = new Date().toISOString();
    if(editing) {
      setDocs(docs.map(d=>d.id===editing.id ? {...d,...form, updatedAt:now, fileData:form.fileData||d.fileData, fileType:form.fileType||d.fileType, fileSize:form.fileSize||d.fileSize, fileName:form.fileName||d.fileName} : d));
      toast("Documento actualizado ✓","success");
    } else {
      const nd = {...form, id:genId(), creadoAt:now, updatedAt:now};
      setDocs([nd,...docs]);
      toast("Documento guardado ✓","success");
    }
    setForm(blank); setOpen(false); setEditing(null);
    if(fileRef.current) fileRef.current.value="";
  };

  const remove = (id) => { if(confirm("¿Eliminar este documento?")) { setDocs(docs.filter(d=>d.id!==id)); toast("Documento eliminado","success"); } };

  const download = (doc) => {
    const a = document.createElement("a");
    a.href = doc.fileData;
    a.download = doc.fileName || doc.nombre;
    a.click();
  };

  const openEdit = (doc) => {
    setEditing(doc);
    setForm({...doc, fileData:null, fileType:"", fileSize:0, fileName:""});
    setOpen(true);
  };

  const close = () => { setForm(blank); setOpen(false); setEditing(null); if(fileRef.current) fileRef.current.value=""; };

  // ── filtrado y orden
  const today = new Date().toISOString().split("T")[0];
  const docsFiltered = docs
    .filter(d=>{
      if(search && !d.nombre.toLowerCase().includes(search.toLowerCase()) && !(d.etiquetas||"").toLowerCase().includes(search.toLowerCase()) && !(d.descripcion||"").toLowerCase().includes(search.toLowerCase())) return false;
      if(filterCat!=="all" && d.categoria!==filterCat) return false;
      if(filterMod!=="all" && d.modulo!==filterMod) return false;
      return true;
    })
    .sort((a,b)=>{
      if(sortBy==="fecha_desc")  return new Date(b.creadoAt)-new Date(a.creadoAt);
      if(sortBy==="fecha_asc")   return new Date(a.creadoAt)-new Date(b.creadoAt);
      if(sortBy==="nombre_asc")  return a.nombre.localeCompare(b.nombre);
      if(sortBy==="venc_prox")   return (a.vencimiento||"9999")-(b.vencimiento||"9999");
      return 0;
    });

  // docs que vencen en ≤30 días
  const proxVencer = docs.filter(d=>d.vencimiento && d.vencimiento>=today && Math.round((new Date(d.vencimiento+"T12:00:00")-new Date())/86400000)<=30);
  const vencidos   = docs.filter(d=>d.vencimiento && d.vencimiento<today);

  // color e icono por tipo de archivo
  const fileIcon = (type) => {
    if(!type) return {icon:"documents",color:"#64748b"};
    if(type.includes("pdf")) return {icon:"documents",color:"#ef4444"};
    if(type.includes("image")) return {icon:"chart",color:"#8b5cf6"};
    if(type.includes("sheet")||type.includes("csv")||type.includes("excel")) return {icon:"transactions",color:"#00a884"};
    if(type.includes("word")||type.includes("document")) return {icon:"documents",color:"#3b82f6"};
    return {icon:"documents",color:"#64748b"};
  };

  const CAT_COLORS = {Contrato:"#3b82f6",Estado:"#00d4aa","Estado de cuenta":"#00d4aa",Factura:"#f59e0b",Recibo:"#00a884",Identificación:"#8b5cf6",Póliza:"#f39c12",Otro:"#64748b"};

  // ── Modal de vista previa
  const PreviewModal = ({ doc, onClose }) => {
    if(!doc) return null;
    const isImg  = doc.fileType?.includes("image");
    const isPdf  = doc.fileType?.includes("pdf");
    const diasVenc = doc.vencimiento ? Math.round((new Date(doc.vencimiento+"T12:00:00")-new Date())/86400000) : null;
    return (
      <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&onClose()}>
        <div style={{background:"#161b27",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,width:"100%",maxWidth:760,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Ic n={fileIcon(doc.fileType).icon} size={18} color={fileIcon(doc.fileType).color}/>
              <div>
                <p style={{margin:0,fontSize:14,fontWeight:700,color:"#f0f0f0"}}>{doc.nombre}</p>
                <p style={{margin:0,fontSize:11,color:"#555"}}>{doc.fileName} · {fmtSize(doc.fileSize||0)}</p>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>download(doc)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,border:"1px solid rgba(0,212,170,.3)",background:"rgba(0,212,170,.08)",color:"#00d4aa",cursor:"pointer",fontSize:12,fontWeight:700}}>
                <Ic n="download" size={13}/>Descargar
              </button>
              <button onClick={onClose} style={{padding:"6px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#888",cursor:"pointer",fontSize:12}}>✕</button>
            </div>
          </div>
          {/* info badges */}
          <div style={{display:"flex",gap:8,padding:"10px 18px",flexWrap:"wrap",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
            <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:`${CAT_COLORS[doc.categoria]||"#64748b"}20`,color:CAT_COLORS[doc.categoria]||"#64748b"}}>{doc.categoria}</span>
            {doc.etiquetas&&doc.etiquetas.split(",").map(t=>t.trim()).filter(Boolean).map((t,i)=>(
              <span key={i} style={{fontSize:10,padding:"3px 10px",borderRadius:20,background:"rgba(255,255,255,.06)",color:"#888"}}>#{t}</span>
            ))}
            {doc.vencimiento&&(
              <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:diasVenc!==null&&diasVenc<0?"rgba(255,71,87,.15)":diasVenc!==null&&diasVenc<=30?"rgba(243,156,18,.15)":"rgba(0,212,170,.1)",color:diasVenc!==null&&diasVenc<0?"#ff4757":diasVenc!==null&&diasVenc<=30?"#f39c12":"#00d4aa"}}>
                {diasVenc!==null&&diasVenc<0?`Vencido hace ${Math.abs(diasVenc)}d`:diasVenc!==null&&diasVenc===0?"Vence hoy":`Vence ${fmtDate(doc.vencimiento)}`}
              </span>
            )}
            {doc.descripcion&&<span style={{fontSize:11,color:"#666",fontStyle:"italic"}}>{doc.descripcion}</span>}
          </div>
          {/* contenido */}
          <div style={{flex:1,overflow:"auto",display:"flex",alignItems:"center",justifyContent:"center",padding:16,minHeight:200}}>
            {isImg && <img src={doc.fileData} alt={doc.nombre} style={{maxWidth:"100%",maxHeight:"60vh",borderRadius:8,objectFit:"contain"}}/>}
            {isPdf && <iframe src={doc.fileData} style={{width:"100%",height:"60vh",border:"none",borderRadius:8}} title={doc.nombre}/>}
            {!isImg&&!isPdf&&(
              <div style={{textAlign:"center",padding:40}}>
                <Ic n={fileIcon(doc.fileType).icon} size={48} color={fileIcon(doc.fileType).color}/>
                <p style={{color:"#888",marginTop:12,fontSize:13}}>Vista previa no disponible para este tipo de archivo.</p>
                <p style={{color:"#555",fontSize:11,marginBottom:16}}>{doc.fileType||"Tipo desconocido"}</p>
                <button onClick={()=>download(doc)} style={{padding:"9px 20px",borderRadius:9,border:"1px solid rgba(0,212,170,.3)",background:"rgba(0,212,170,.08)",color:"#00d4aa",cursor:"pointer",fontSize:13,fontWeight:700}}>
                  Descargar archivo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{animation:"fadeUp .25s ease"}}>
      {preview&&<PreviewModal doc={preview} onClose={()=>setPreview(null)}/>}

      {/* header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:"0 0 3px"}}>Documentos</h2>
          <p style={{fontSize:13,color:"#555",margin:0}}>{docs.length} archivo{docs.length!==1?"s":""} guardado{docs.length!==1?"s":""}</p>
        </div>
        <button onClick={()=>setOpen(true)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#00d4aa,#00a884)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,boxShadow:"0 4px 14px rgba(0,212,170,.3)"}}>
          <Ic n="plus" size={16} color="#fff"/>Subir documento
        </button>
      </div>

      {/* alertas de vencimiento mejoradas */}
      {(vencidos.length>0||proxVencer.length>0)&&(
        <div style={{marginBottom:16,display:"flex",flexDirection:"column",gap:8}}>
          {/* Vencidos */}
          {vencidos.length>0&&(
            <div style={{borderRadius:11,border:"1px solid rgba(255,71,87,.25)",background:"rgba(255,71,87,.06)",overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px 7px",borderBottom:"1px solid rgba(255,71,87,.15)"}}>
                <Ic n="warn" size={14} color="#ff4757"/>
                <span style={{fontSize:12,fontWeight:700,color:"#ff6b7a"}}>
                  {vencidos.length} documento{vencidos.length>1?"s":""} vencido{vencidos.length>1?"s":""}
                </span>
              </div>
              <div style={{padding:"6px 8px",display:"flex",flexWrap:"wrap",gap:6}}>
                {vencidos.map(d=>{
                  const dias = Math.abs(Math.round((new Date(d.vencimiento+"T12:00:00")-new Date())/86400000));
                  return (
                    <button key={d.id} onClick={()=>setPreview(d)}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:8,background:"rgba(255,71,87,.1)",border:"1px solid rgba(255,71,87,.2)",cursor:"pointer",color:"#ff6b7a",fontSize:11,fontWeight:600}}>
                      <span>{d.nombre}</span>
                      <span style={{fontSize:10,opacity:.7}}>hace {dias}d</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Próximos a vencer */}
          {proxVencer.length>0&&(
            <div style={{borderRadius:11,border:"1px solid rgba(243,156,18,.25)",background:"rgba(243,156,18,.06)",overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px 7px",borderBottom:"1px solid rgba(243,156,18,.15)"}}>
                <Ic n="warn" size={14} color="#f39c12"/>
                <span style={{fontSize:12,fontWeight:700,color:"#f5a623"}}>
                  {proxVencer.length} próximo{proxVencer.length>1?"s":""} a vencer
                </span>
              </div>
              <div style={{padding:"6px 8px",display:"flex",flexWrap:"wrap",gap:6}}>
                {proxVencer.sort((a,b)=>a.vencimiento>b.vencimiento?1:-1).map(d=>{
                  const dias = Math.round((new Date(d.vencimiento+"T12:00:00")-new Date())/86400000);
                  const urgente = dias<=7;
                  return (
                    <button key={d.id} onClick={()=>setPreview(d)}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:8,
                        background:urgente?"rgba(255,71,87,.1)":"rgba(243,156,18,.1)",
                        border:`1px solid ${urgente?"rgba(255,71,87,.2)":"rgba(243,156,18,.2)"}`,
                        cursor:"pointer",color:urgente?"#ff6b7a":"#f5a623",fontSize:11,fontWeight:600}}>
                      <span>{d.nombre}</span>
                      <span style={{fontSize:10,opacity:.7}}>{dias===0?"hoy":`${dias}d`}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* barra de búsqueda y filtros */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <Ic n="search" size={14} color="#555" style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre, etiqueta o descripción..."
            style={{width:"100%",padding:"8px 12px 8px 32px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,color:"#e0e0e0",fontSize:12,outline:"none"}}/>
        </div>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}
          style={{padding:"8px 12px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,color:"#aaa",fontSize:12,outline:"none",cursor:"pointer"}}>
          <option value="all">Todas las categorías</option>
          {CATS.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterMod} onChange={e=>setFilterMod(e.target.value)}
          style={{padding:"8px 12px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,color:"#aaa",fontSize:12,outline:"none",cursor:"pointer"}}>
          <option value="all">Todos los vínculos</option>
          {MODS.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          style={{padding:"8px 12px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,color:"#aaa",fontSize:12,outline:"none",cursor:"pointer"}}>
          <option value="fecha_desc">Más reciente</option>
          <option value="fecha_asc">Más antiguo</option>
          <option value="nombre_asc">Nombre A-Z</option>
          <option value="venc_prox">Próx. a vencer</option>
        </select>
      </div>

      {/* grid de documentos */}
      {docsFiltered.length===0
        ? (
          <div style={{textAlign:"center",padding:"60px 20px",background:"rgba(255,255,255,.02)",border:"1px dashed rgba(255,255,255,.08)",borderRadius:14}}>
            <Ic n="documents" size={40} color="#333"/>
            <p style={{color:"#555",marginTop:12,fontSize:14}}>{docs.length===0?"Aún no has subido ningún documento":"Sin resultados para esa búsqueda"}</p>
            {docs.length===0&&<button onClick={()=>setOpen(true)} style={{marginTop:12,padding:"8px 20px",borderRadius:9,border:"1px solid rgba(0,212,170,.3)",background:"rgba(0,212,170,.08)",color:"#00d4aa",cursor:"pointer",fontSize:12,fontWeight:700}}>Subir primer documento</button>}
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
            {docsFiltered.map(doc=>{
              const {icon,color} = fileIcon(doc.fileType);
              const diasVenc = doc.vencimiento ? Math.round((new Date(doc.vencimiento+"T12:00:00")-new Date())/86400000) : null;
              const vencAlerta = diasVenc!==null&&diasVenc<0?"error":diasVenc!==null&&diasVenc<=30?"warning":null;
              const vinculoLabel = doc.modulo&&doc.modulo!=="none" ? (() => { const opts=modOptions(doc.modulo); const it=opts.find(o=>o.id===doc.moduloItemId); return it?it.label:null; })() : null;
              return (
                <div key={doc.id} style={{background:"rgba(255,255,255,.03)",border:`1px solid ${vencAlerta==="error"?"rgba(255,71,87,.25)":vencAlerta==="warning"?"rgba(243,156,18,.2)":"rgba(255,255,255,.07)"}`,borderRadius:12,overflow:"hidden",transition:"all .15s",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.05)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"}>
                  {/* thumb */}
                  <div onClick={()=>setPreview(doc)} style={{height:110,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,.02)",position:"relative",overflow:"hidden"}}>
                    {doc.fileType?.includes("image")
                      ? <img src={doc.fileData} alt={doc.nombre} style={{width:"100%",height:"100%",objectFit:"cover",opacity:.85}}/>
                      : <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                          <Ic n={icon} size={32} color={color}/>
                          <span style={{fontSize:10,color:"#555",fontWeight:600}}>{doc.fileName?.split(".").pop()?.toUpperCase()||"FILE"}</span>
                        </div>
                    }
                    {vencAlerta&&(
                      <div style={{position:"absolute",top:8,right:8,width:8,height:8,borderRadius:"50%",background:vencAlerta==="error"?"#ff4757":"#f39c12"}}/>
                    )}
                  </div>
                  {/* info */}
                  <div style={{padding:"10px 12px"}}>
                    <p style={{margin:"0 0 3px",fontSize:13,fontWeight:700,color:"#e0e0e0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{doc.nombre}</p>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:6}}>
                      <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:`${CAT_COLORS[doc.categoria]||"#64748b"}20`,color:CAT_COLORS[doc.categoria]||"#64748b"}}>{doc.categoria}</span>
                      {vinculoLabel&&<span style={{fontSize:10,color:"#555",background:"rgba(255,255,255,.04)",padding:"2px 8px",borderRadius:20}}>⊙ {vinculoLabel}</span>}
                    </div>
                    {doc.etiquetas&&(
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                        {doc.etiquetas.split(",").map(t=>t.trim()).filter(Boolean).slice(0,3).map((t,i)=>(
                          <span key={i} style={{fontSize:9,color:"#555",background:"rgba(255,255,255,.04)",padding:"1px 6px",borderRadius:10}}>#{t}</span>
                        ))}
                      </div>
                    )}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:10,color:"#444"}}>{fmtSize(doc.fileSize||0)} · {fmtDate(doc.creadoAt?.split("T")[0])}</span>
                      {doc.vencimiento&&(
                        <span style={{fontSize:10,fontWeight:600,color:vencAlerta==="error"?"#ff4757":vencAlerta==="warning"?"#f39c12":"#555"}}>
                          {diasVenc<0?`Vencido`:`Vence en ${diasVenc}d`}
                        </span>
                      )}
                    </div>
                    {/* acciones */}
                    <div style={{display:"flex",gap:6,marginTop:8,paddingTop:8,borderTop:"1px solid rgba(255,255,255,.05)"}}>
                      <button onClick={()=>setPreview(doc)} style={{flex:1,padding:"5px 0",borderRadius:7,border:"1px solid rgba(255,255,255,.08)",background:"transparent",color:"#aaa",cursor:"pointer",fontSize:11,fontWeight:600}}>Ver</button>
                      <button onClick={()=>download(doc)} style={{flex:1,padding:"5px 0",borderRadius:7,border:"1px solid rgba(0,212,170,.2)",background:"rgba(0,212,170,.06)",color:"#00d4aa",cursor:"pointer",fontSize:11,fontWeight:600}}>Bajar</button>
                      <button onClick={()=>openEdit(doc)} style={{flex:1,padding:"5px 0",borderRadius:7,border:"1px solid rgba(255,255,255,.08)",background:"transparent",color:"#888",cursor:"pointer",fontSize:11}}>Editar</button>
                      <button onClick={()=>remove(doc.id)} style={{padding:"5px 8px",borderRadius:7,border:"1px solid rgba(255,71,87,.2)",background:"rgba(255,71,87,.06)",color:"#ff4757",cursor:"pointer",fontSize:11}}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {/* Modal subir / editar */}
      {open&&(
        <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&close()}>
          <div style={{background:"#161b27",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,width:"100%",maxWidth:500,padding:24,display:"flex",flexDirection:"column",gap:14,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#f0f0f0"}}>{editing?"Editar documento":"Subir documento"}</h3>
              <button onClick={close} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:18,lineHeight:1}}>✕</button>
            </div>

            {/* zona de carga */}
            <div onClick={()=>fileRef.current?.click()} style={{border:"2px dashed rgba(0,212,170,.25)",borderRadius:12,padding:"20px 16px",textAlign:"center",cursor:"pointer",background:"rgba(0,212,170,.03)",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,212,170,.5)";e.currentTarget.style.background="rgba(0,212,170,.06)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(0,212,170,.25)";e.currentTarget.style.background="rgba(0,212,170,.03)";}}>
              <input ref={fileRef} type="file" style={{display:"none"}} onChange={handleFile} accept="*/*"/>
              {uploading
                ? <p style={{color:"#00d4aa",fontSize:13}}>Cargando...</p>
                : form.fileData||editing
                  ? <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                      <Ic n={fileIcon(form.fileType||editing?.fileType).icon} size={20} color={fileIcon(form.fileType||editing?.fileType).color}/>
                      <span style={{fontSize:12,color:"#00d4aa",fontWeight:600}}>{form.fileName||editing?.fileName}</span>
                      {(form.fileSize||editing?.fileSize)>0&&<span style={{fontSize:11,color:"#555"}}>({fmtSize(form.fileSize||editing?.fileSize||0)})</span>}
                    </div>
                  : <>
                      <Ic n="documents" size={28} color="#333"/>
                      <p style={{color:"#555",fontSize:12,marginTop:8,marginBottom:2}}>Haz clic para seleccionar un archivo</p>
                      <p style={{color:"#444",fontSize:10}}>PDF, imágenes, Excel, Word · Máx. 8 MB</p>
                    </>
              }
            </div>

            <Inp label="Nombre del documento" value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} placeholder="Ej. Contrato de arrendamiento 2026" required/>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={{fontSize:11,color:"#888",fontWeight:600,display:"block",marginBottom:4}}>Categoría</label>
                <select value={form.categoria} onChange={e=>setForm(f=>({...f,categoria:e.target.value}))}
                  style={{width:"100%",padding:"9px 11px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:9,color:"#e0e0e0",fontSize:12,outline:"none"}}>
                  {CATS.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Inp label="Fecha de vencimiento" type="date" value={form.vencimiento} onChange={e=>setForm(f=>({...f,vencimiento:e.target.value}))}/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={{fontSize:11,color:"#888",fontWeight:600,display:"block",marginBottom:4}}>Vincular a módulo</label>
                <select value={form.modulo} onChange={e=>setForm(f=>({...f,modulo:e.target.value,moduloItemId:""}))}
                  style={{width:"100%",padding:"9px 11px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:9,color:"#e0e0e0",fontSize:12,outline:"none"}}>
                  {MODS.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              {form.modulo&&form.modulo!=="none"&&(
                <div>
                  <label style={{fontSize:11,color:"#888",fontWeight:600,display:"block",marginBottom:4}}>Elemento</label>
                  <select value={form.moduloItemId} onChange={e=>setForm(f=>({...f,moduloItemId:e.target.value}))}
                    style={{width:"100%",padding:"9px 11px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:9,color:"#e0e0e0",fontSize:12,outline:"none"}}>
                    <option value="">Seleccionar...</option>
                    {modOptions(form.modulo).map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </div>
              )}
            </div>

            <Inp label="Etiquetas (separadas por coma)" value={form.etiquetas} onChange={e=>setForm(f=>({...f,etiquetas:e.target.value}))} placeholder="banco, 2026, impuestos"/>
            <Inp label="Descripción (opcional)" value={form.descripcion} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))} placeholder="Notas adicionales..."/>

            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button onClick={close} style={{flex:1,padding:"10px 0",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#888",cursor:"pointer",fontSize:13,fontWeight:600}}>Cancelar</button>
              <button onClick={save} style={{flex:2,padding:"10px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#00d4aa,#00a884)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>
                {editing?"Guardar cambios":"Subir documento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { Documents };
