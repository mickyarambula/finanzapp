// Módulo de Reports (Estados Financieros: Balance, Resultados, Flujo, Análisis).
// Extraído de App.jsx el 14-may-2026 (décimo módulo del refactor).
// Sub-componente local: AnalisisTab (solo se usa aquí).
// REGLA: este módulo NO importa de App.jsx ni de otros módulos.
// Solo importa de react, ../utils y ../shared.
// NOTA: usa XLSX cargado dinámicamente desde CDN (window.XLSX) — no requiere import.

import React, { useState } from "react";
import { fmt, today } from "../utils";
import { useCtx, useData, getTc, Card, Ic } from "../shared";

// ─── ESTADOS FINANCIEROS ──────────────────────────────────────────────────────
const Reports = ({ initialTab="balance" }) => {
  const { user, toast } = useCtx();
  const [transactions] = useData(user.id, "transactions");
  const [accounts]     = useData(user.id, "accounts");
  const [loans]        = useData(user.id, "loans");
  const [investments]  = useData(user.id, "investments");
  const [mortgages]    = useData(user.id, "mortgages");
  const [transfers]    = useData(user.id, "transfers");
  const [config]       = useData(user.id, "config", {});
  const [tab, setTab]  = useState(initialTab);
  const [periodo, setPeriodo] = useState("mes");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // ── rango de fechas según período seleccionado
  const getRango = () => {
    const hoy = new Date();
    if (periodo === "mes") {
      const d = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      return { desde: d.toISOString().split("T")[0], hasta: today() };
    }
    if (periodo === "trimestre") {
      const d = new Date(hoy); d.setMonth(d.getMonth() - 3);
      return { desde: d.toISOString().split("T")[0], hasta: today() };
    }
    if (periodo === "anio") {
      return { desde: `${hoy.getFullYear()}-01-01`, hasta: today() };
    }
    if (periodo === "personalizado") {
      return { desde: fechaDesde, hasta: fechaHasta };
    }
    return { desde: "", hasta: today() };
  };
  const rango = getRango();

  const txsRango = transactions.filter(t => {
    if (rango.desde && t.date < rango.desde) return false;
    if (rango.hasta && t.date > rango.hasta) return false;
    return true;
  });

  // ── helpers de cálculo
  const TC = getTc(user.id);

  const calcLoanBalance = (loan) => {
    const dr = (parseFloat(loan.rate)||0)/100/(loan.rateType==="annual"?365:30);
    let bal = parseFloat(loan.principal||0);
    let last = new Date(loan.startDate+"T12:00:00");
    for (const p of [...(loan.payments||[])].sort((a,b)=>new Date(a.date)-new Date(b.date))) {
      const days = Math.max(0, Math.floor((new Date(p.date+"T12:00:00")-last)/86400000));
      bal = Math.max(0, bal - (p.amount - Math.min(p.amount, bal*dr*days)));
      last = new Date(p.date+"T12:00:00");
    }
    return bal;
  };

  const calcInvValue = (inv) => {
    const t=parseFloat(inv.titulos)||0, p=parseFloat(inv.precioActual)||0;
    const ap=(inv.aportaciones||[]).reduce((s,a)=>s+parseFloat(a.amount||0),0);
    const val = t>0&&p>0 ? t*p : parseFloat(inv.currentValue)||ap;
    return inv.currency==="USD" ? val*TC : val;
  };

  const calcMortgageBalance = (m) => {
    const P=parseFloat(m.monto)||0, n=(parseFloat(m.plazoAnios)||0)*12;
    const r=(parseFloat(m.tasaAnual)||0)/100/12;
    if (!P||!n||!r) return P;
    const cuota = m.tipo==="fijo" ? (P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1) : P/n;
    let saldo = P;
    const pagados = (m.pagosRealizados||[]).length;
    for (let i=0;i<pagados;i++) {
      const int = saldo*r;
      const cap = m.tipo==="fijo" ? cuota-int : P/n;
      saldo = Math.max(saldo-cap, 0);
    }
    return saldo;
  };

  // ══════════════════════════════════════════════════
  // BALANCE GENERAL
  // ══════════════════════════════════════════════════
  const buildBalance = () => {
    // ACTIVOS
    const cuentasLiquidez = accounts.filter(a=>a.type!=="credit");
    const totalLiquidezMXN = cuentasLiquidez.filter(a=>a.currency==="MXN").reduce((s,a)=>s+parseFloat(a.balance||0),0);
    const totalLiquidezUSD = cuentasLiquidez.filter(a=>a.currency==="USD").reduce((s,a)=>s+parseFloat(a.balance||0),0);
    const totalLiquidez = totalLiquidezMXN + totalLiquidezUSD*TC;

    const invActivas = investments.filter(i=>i.estado!=="liquidada");
    const totalInversiones = invActivas.reduce((s,i)=>s+calcInvValue(i), 0);

    const prestamosXCobrar = loans.filter(l=>l.type==="given");
    const totalPXC = prestamosXCobrar.reduce((s,l)=>s+calcLoanBalance(l), 0);

    const totalActivos = totalLiquidez + totalInversiones + totalPXC;

    // PASIVOS
    const tarjetas = accounts.filter(a=>a.type==="credit");
    const totalTarjetas = tarjetas.reduce((s,a)=>s+Math.abs(Math.min(parseFloat(a.balance||0),0)),0);

    const prestamosXPagar = loans.filter(l=>l.type==="received");
    const totalPXP = prestamosXPagar.reduce((s,l)=>s+calcLoanBalance(l), 0);

    const totalHipotecas = mortgages.reduce((s,m)=>s+calcMortgageBalance(m), 0);

    const totalPasivos = totalTarjetas + totalPXP + totalHipotecas;
    const patrimonioNeto = totalActivos - totalPasivos;

    return {
      activos: {
        liquidez: { total: totalLiquidez, items: [
          ...cuentasLiquidez.filter(a=>a.currency==="MXN").map(a=>({ nombre:a.name, valor:parseFloat(a.balance||0), tipo:"Cuenta MXN" })),
          ...cuentasLiquidez.filter(a=>a.currency==="USD").map(a=>({ nombre:a.name, valor:parseFloat(a.balance||0)*TC, tipo:`Cuenta USD (×${TC})` })),
        ]},
        inversiones: { total: totalInversiones, items: invActivas.map(i=>({ nombre:i.name, valor:calcInvValue(i), tipo:i.type })) },
        cuentasCobrar: { total: totalPXC, items: prestamosXCobrar.map(l=>({ nombre:l.name, valor:calcLoanBalance(l), tipo:"Préstamo por cobrar" })) },
        total: totalActivos,
      },
      pasivos: {
        tarjetas: { total: totalTarjetas, items: tarjetas.map(a=>({ nombre:a.name, valor:Math.abs(Math.min(parseFloat(a.balance||0),0)), tipo:"Tarjeta de crédito" })) },
        prestamos: { total: totalPXP, items: prestamosXPagar.map(l=>({ nombre:l.name, valor:calcLoanBalance(l), tipo:"Préstamo por pagar" })) },
        hipotecas: { total: totalHipotecas, items: mortgages.map(m=>({ nombre:m.nombre||m.banco||"Hipoteca", valor:calcMortgageBalance(m), tipo:"Hipoteca" })) },
        total: totalPasivos,
      },
      patrimonioNeto,
    };
  };

  // ══════════════════════════════════════════════════
  // ESTADO DE RESULTADOS
  // ══════════════════════════════════════════════════
  const buildResultados = () => {
    const ingresos = txsRango.filter(t=>t.type==="income");
    const gastos   = txsRango.filter(t=>t.type==="expense");

    const totalIngresos = ingresos.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const totalGastos   = gastos.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const utilidad      = totalIngresos - totalGastos;
    const margen        = totalIngresos>0 ? (utilidad/totalIngresos)*100 : 0;

    // agrupar por categoría
    const catIngresos = {};
    ingresos.forEach(t=>{ const c=t.category||"Sin categoría"; catIngresos[c]=(catIngresos[c]||0)+parseFloat(t.amount||0); });
    const catGastos = {};
    gastos.forEach(t=>{ const c=t.category||"Sin categoría"; catGastos[c]=(catGastos[c]||0)+parseFloat(t.amount||0); });

    // separar ingresos por origen
    const ingresosOp  = ingresos.filter(t=>!t.origen||t.origen==="manual");
    const ingresosInv = ingresos.filter(t=>t.origen==="inversion");
    const ingresosPresta = ingresos.filter(t=>t.origen==="prestamo");
    const totalIngresosOp    = ingresosOp.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const totalIngresosInv   = ingresosInv.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const totalIngresosPresta= ingresosPresta.reduce((s,t)=>s+parseFloat(t.amount||0),0);

    const gastosOp   = gastos.filter(t=>!t.origen||t.origen==="manual");
    const gastosHip  = gastos.filter(t=>t.origen==="hipoteca");
    const gastosDeuda= gastos.filter(t=>t.origen==="prestamo");
    const totalGastosOp   = gastosOp.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const totalGastosHip  = gastosHip.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const totalGastosDeuda= gastosDeuda.reduce((s,t)=>s+parseFloat(t.amount||0),0);

    return { totalIngresos, totalGastos, utilidad, margen, catIngresos, catGastos,
      totalIngresosOp, totalIngresosInv, totalIngresosPresta,
      totalGastosOp, totalGastosHip, totalGastosDeuda };
  };

  // ══════════════════════════════════════════════════
  // FLUJO DE EFECTIVO
  // ══════════════════════════════════════════════════
  const buildFlujo = () => {
    // Actividades operativas: ingresos y gastos del período (excluye inversión y financiamiento)
    const ingrOp  = txsRango.filter(t=>t.type==="income"&&(!t.origen||t.origen==="manual")).reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const gastOp  = txsRango.filter(t=>t.type==="expense"&&(!t.origen||t.origen==="hipoteca"||t.origen==="manual"||t.origen==="prestamo")).reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const flujoOp = ingrOp - gastOp;

    // Actividades de inversión: aportaciones y cobros/retiros
    const aportaciones = investments.flatMap(i=>(i.aportaciones||[]).filter(a=> rango.desde?a.date>=rango.desde:true).filter(a=>rango.hasta?a.date<=rango.hasta:true));
    const cobros       = investments.flatMap(i=>(i.cobros||[]).filter(c=>rango.desde?c.fecha>=rango.desde:true).filter(c=>rango.hasta?c.fecha<=rango.hasta:true));
    const salidaInv    = aportaciones.reduce((s,a)=>s+parseFloat(a.amount||0),0);
    const entradaInv   = cobros.filter(c=>c.tipo!=="reinversion").reduce((s,c)=>s+parseFloat(c.montoNeto||0),0);
    const flujoInv     = entradaInv - salidaInv;

    // Actividades de financiamiento: préstamos recibidos/pagados, hipotecas
    const prestamosRecibidos = loans.filter(l=>l.type==="received" && l.startDate>=( rango.desde||"") && l.startDate<=(rango.hasta||"9999")).reduce((s,l)=>s+parseFloat(l.principal||0),0);
    const pagosPrestamos     = txsRango.filter(t=>t.origen==="prestamo"&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const pagosHipoteca      = txsRango.filter(t=>t.origen==="hipoteca").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    // Pagos de tarjeta: se toman de transfers con tipoPago=pago_tarjeta en el período
    // No afectan gastos — son reducción de pasivo financiado
    const pagosTarjeta = (transfers||[]).filter(t=>
      t.tipoPago==="pago_tarjeta"&&
      (rango.desde?t.date>=rango.desde:true)&&
      (rango.hasta?t.date<=rango.hasta:true)
    ).reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const flujoFin = prestamosRecibidos - pagosPrestamos - pagosHipoteca - pagosTarjeta;

    const flujoTotal = flujoOp + flujoInv + flujoFin;

    // ── Reconciliación: saldo inicial = saldo actual − flujo neto del período
    const saldoFinalEfectivo = accounts
      .filter(a=>a.type!=="credit")
      .reduce((s,a)=> s + (a.currency==="USD" ? parseFloat(a.balance||0)*TC : parseFloat(a.balance||0)), 0);
    const saldoInicialEfectivo = saldoFinalEfectivo - flujoTotal;

    return {
      operativas:     { entradas:ingrOp, salidas:gastOp, flujo:flujoOp,
        items:[
          {label:"Ingresos operativos",   valor:ingrOp,  tipo:"entrada"},
          {label:"Gastos operativos",      valor:-gastOp, tipo:"salida"},
        ]},
      inversion:      { entradas:entradaInv, salidas:salidaInv, flujo:flujoInv,
        items:[
          {label:"Cobros / retiros inversiones", valor:entradaInv,  tipo:"entrada"},
          {label:"Aportaciones a inversiones",   valor:-salidaInv,  tipo:"salida"},
        ]},
      financiamiento: { entradas:prestamosRecibidos, salidas:pagosPrestamos+pagosHipoteca+pagosTarjeta, flujo:flujoFin,
        items:[
          {label:"Préstamos recibidos",     valor:prestamosRecibidos,  tipo:"entrada"},
          {label:"Pagos de préstamos",      valor:-(pagosPrestamos),   tipo:"salida"},
          {label:"Pagos de hipoteca",       valor:-(pagosHipoteca),    tipo:"salida"},
          {label:"Pagos de tarjeta",        valor:-(pagosTarjeta),     tipo:"salida"},
        ]},
      flujoTotal, saldoInicialEfectivo, saldoFinalEfectivo,
    };
  };

  const balance    = buildBalance();
  const resultados = buildResultados();
  const flujo      = buildFlujo();

  // ── exportar Excel mejorado con SheetJS
  const exportarExcel = async () => {
    try {
      // Intentar cargar SheetJS — requiere conexión a internet
      let XLSX;
      try {
        XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs");
      } catch {
        // fallback: script tag
        await new Promise((res,rej)=>{
          if(window.XLSX){ res(); return; }
          const s=document.createElement("script");
          s.src="https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js";
          s.onload=res; s.onerror=rej;
          document.head.appendChild(s);
        });
        XLSX = window.XLSX;
      }
      const wb = XLSX.utils.book_new();

      // Hoja 1: Balance General
      const balData = [
        ["BALANCE GENERAL", "", ""],
        ["Fecha de corte:", today(), ""],
        ["", "", ""],
        ["ACTIVOS", "", ""],
        ["Liquidez", "", fmt(balance.activos.liquidez.total)],
        ...balance.activos.liquidez.items.map(i=>["  "+i.nombre, i.tipo, fmt(i.valor)]),
        ["Inversiones", "", fmt(balance.activos.inversiones.total)],
        ...balance.activos.inversiones.items.map(i=>["  "+i.nombre, i.tipo, fmt(i.valor)]),
        ["Cuentas por cobrar", "", fmt(balance.activos.cuentasCobrar.total)],
        ...balance.activos.cuentasCobrar.items.map(i=>["  "+i.nombre, i.tipo, fmt(i.valor)]),
        ["TOTAL ACTIVOS", "", fmt(balance.activos.total)],
        ["", "", ""],
        ["PASIVOS", "", ""],
        ["Tarjetas de crédito", "", fmt(balance.pasivos.tarjetas.total)],
        ...balance.pasivos.tarjetas.items.map(i=>["  "+i.nombre, i.tipo, fmt(i.valor)]),
        ["Préstamos por pagar", "", fmt(balance.pasivos.prestamos.total)],
        ...balance.pasivos.prestamos.items.map(i=>["  "+i.nombre, i.tipo, fmt(i.valor)]),
        ["Hipotecas", "", fmt(balance.pasivos.hipotecas.total)],
        ...balance.pasivos.hipotecas.items.map(i=>["  "+i.nombre, i.tipo, fmt(i.valor)]),
        ["TOTAL PASIVOS", "", fmt(balance.pasivos.total)],
        ["", "", ""],
        ["PATRIMONIO NETO", "", fmt(balance.patrimonioNeto)],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(balData);
      ws1["!cols"] = [{wch:35},{wch:25},{wch:20}];
      XLSX.utils.book_append_sheet(wb, ws1, "Balance General");

      // Hoja 2: Estado de Resultados
      const resData = [
        ["ESTADO DE RESULTADOS","",""],
        ["Período:", `${rango.desde||"Todo"} al ${rango.hasta||today()}`, ""],
        ["","",""],
        ["INGRESOS","",""],
        ["  Ingresos operativos","",fmt(resultados.totalIngresosOp)],
        ["  Ingresos por inversiones","",fmt(resultados.totalIngresosInv)],
        ["  Cobros de préstamos","",fmt(resultados.totalIngresosPresta)],
        ["TOTAL INGRESOS","",fmt(resultados.totalIngresos)],
        ["","",""],
        ["GASTOS","",""],
        ["  Gastos operativos","",fmt(resultados.totalGastosOp)],
        ["  Pagos de deuda","",fmt(resultados.totalGastosDeuda)],
        ["  Pagos hipoteca","",fmt(resultados.totalGastosHip)],
        ["TOTAL GASTOS","",fmt(resultados.totalGastos)],
        ["","",""],
        ["UTILIDAD NETA","",fmt(resultados.utilidad)],
        ["MARGEN","",resultados.margen.toFixed(1)+"%"],
        ["","",""],
        ["DETALLE POR CATEGORÍA - INGRESOS","",""],
        ...Object.entries(resultados.catIngresos).sort((a,b)=>b[1]-a[1]).map(([c,v])=>["  "+c,"",fmt(v)]),
        ["","",""],
        ["DETALLE POR CATEGORÍA - GASTOS","",""],
        ...Object.entries(resultados.catGastos).sort((a,b)=>b[1]-a[1]).map(([c,v])=>["  "+c,"",fmt(v)]),
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(resData);
      ws2["!cols"] = [{wch:35},{wch:25},{wch:20}];
      XLSX.utils.book_append_sheet(wb, ws2, "Estado de Resultados");

      // Hoja 3: Flujo de Efectivo
      const flujoData = [
        ["ESTADO DE FLUJO DE EFECTIVO","",""],
        ["Período:", `${rango.desde||"Todo"} al ${rango.hasta||today()}`, ""],
        ["","",""],
        ["ACTIVIDADES OPERATIVAS","",""],
        ...flujo.operativas.items.map(i=>["  "+i.label,"",fmt(Math.abs(i.valor))]),
        ["Flujo operativo neto","",fmt(flujo.operativas.flujo)],
        ["","",""],
        ["ACTIVIDADES DE INVERSIÓN","",""],
        ...flujo.inversion.items.map(i=>["  "+i.label,"",fmt(Math.abs(i.valor))]),
        ["Flujo de inversión neto","",fmt(flujo.inversion.flujo)],
        ["","",""],
        ["ACTIVIDADES DE FINANCIAMIENTO","",""],
        ...flujo.financiamiento.items.map(i=>["  "+i.label,"",fmt(Math.abs(i.valor))]),
        ["Flujo de financiamiento neto","",fmt(flujo.financiamiento.flujo)],
        ["","",""],
        ["FLUJO NETO TOTAL","",fmt(flujo.flujoTotal)],
        ["","",""],
        ["RECONCILIACIÓN DE EFECTIVO","",""],
        ["Saldo inicial de efectivo (estimado)","",fmt(flujo.saldoInicialEfectivo)],
        ["(+/−) Flujo neto del período","",fmt(flujo.flujoTotal)],
        ["= Saldo final de efectivo","",fmt(flujo.saldoFinalEfectivo)],
        ["","",""],
        ["DESGLOSE POR CUENTA","",""],
        ...accounts.filter(a=>a.type!=="credit").map(a=>{
          const saldo = a.currency==="USD" ? parseFloat(a.balance||0)*TC : parseFloat(a.balance||0);
          return ["  "+a.name+(a.currency==="USD"?` (USD ×${TC})`:""), "", fmt(saldo)];
        }),
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(flujoData);
      ws3["!cols"] = [{wch:35},{wch:25},{wch:20}];
      XLSX.utils.book_append_sheet(wb, ws3, "Flujo de Efectivo");

      // Hoja 4: Transacciones del período
      const txData = [
        ["Fecha","Tipo","Descripción","Categoría","Monto","Cuenta","Origen","Etiquetas"],
        ...txsRango.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(t=>[
          t.date, t.type==="income"?"Ingreso":"Gasto", t.description,
          t.category||"", parseFloat(t.amount||0),
          accounts.find(a=>a.id===t.accountId)?.name||"",
          t.origen||"Manual",
          (t.tags||[]).map(tag=>"#"+tag).join(", "),
        ]),
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(txData);
      ws4["!cols"] = [{wch:12},{wch:10},{wch:35},{wch:20},{wch:15},{wch:20},{wch:12}];
      XLSX.utils.book_append_sheet(wb, ws4, "Transacciones");

      // Hoja 5: Inversiones detalladas
      const invData = [
        ["PORTAFOLIO DE INVERSIONES","","","","",""],
        ["Fecha de corte:", today(),"","","",""],
        ["","","","","",""],
        ["Nombre","Tipo","Moneda","Aportado","Valor Actual","Estado"],
        ...investments.map(inv=>{
          const ap=(inv.aportaciones||[]).reduce((s,a)=>s+parseFloat(a.amount||0),0);
          const val=calcInvValue(inv);
          return [inv.nombre||inv.name||"", inv.tipo||inv.instrumento||"", inv.currency||"MXN",
            parseFloat(ap.toFixed(2)), parseFloat(val.toFixed(2)), inv.status==="closed"?"Cerrada":"Activa"];
        }),
        ["","","","","",""],
        ["TOTAL PORTAFOLIO","","",
          investments.reduce((s,i)=>{const ap=(i.aportaciones||[]).reduce((ss,a)=>ss+parseFloat(a.amount||0),0); return s+ap;},0).toFixed(2),
          investments.reduce((s,i)=>s+calcInvValue(i),0).toFixed(2),""],
      ];
      const ws5 = XLSX.utils.aoa_to_sheet(invData);
      ws5["!cols"] = [{wch:30},{wch:20},{wch:10},{wch:18},{wch:18},{wch:12}];
      XLSX.utils.book_append_sheet(wb, ws5, "Inversiones");

      // Hoja 6: Préstamos activos
      const loanData = [
        ["PRÉSTAMOS ACTIVOS","","","","",""],
        ["Fecha de corte:", today(),"","","",""],
        ["","","","","",""],
        ["Nombre","Tipo","Capital","Tasa","Saldo Restante","Vencimiento"],
        ...loans.map(l=>[
          l.name||"", l.type==="given"?"Por cobrar":"Por pagar",
          parseFloat(parseFloat(l.principal||0).toFixed(2)),
          `${l.rate||0}% ${l.rateType==="annual"?"anual":"mensual"}`,
          parseFloat(calcLoanBalance(l).toFixed(2)),
          l.dueDate||"Sin fecha",
        ]),
        ["","","","","",""],
        ["TOTAL POR COBRAR","","",
          "",loans.filter(l=>l.type==="given").reduce((s,l)=>s+calcLoanBalance(l),0).toFixed(2),""],
        ["TOTAL POR PAGAR","","",
          "",loans.filter(l=>l.type==="received").reduce((s,l)=>s+calcLoanBalance(l),0).toFixed(2),""],
      ];
      const ws6 = XLSX.utils.aoa_to_sheet(loanData);
      ws6["!cols"] = [{wch:28},{wch:14},{wch:16},{wch:18},{wch:18},{wch:14}];
      XLSX.utils.book_append_sheet(wb, ws6, "Prestamos");

      // Hoja 0 (RESUMEN EJECUTIVO) — al frente
      const scoreNum = (() => {
        const totalActivos = balance.activos.total;
        const totalPasivos = balance.pasivos.total;
        const deudaRatio = totalActivos>0 ? totalPasivos/totalActivos*100 : 0;
        const ingrMes = transactions.filter(t=>t.date?.startsWith(`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`)&&t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
        const gastMes = transactions.filter(t=>t.date?.startsWith(`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`)&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
        const ahorro = ingrMes>0?(ingrMes-gastMes)/ingrMes*100:0;
        return Math.round(((deudaRatio<=30?100:deudaRatio<=50?75:45)+(ahorro>=20?100:ahorro>=10?70:40))/2);
      })();
      const resEjec = [
        ["REPORTE EJECUTIVO DE FINANZAS PERSONALES","",""],
        [`Generado: ${new Date().toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}`, "", ""],
        [`Usuario: ${user.name}`, "", ""],
        ["","",""],
        ["── RESUMEN PATRIMONIAL ──","",""],
        ["Total Activos","",parseFloat(balance.activos.total.toFixed(2))],
        ["Total Pasivos","",parseFloat(balance.pasivos.total.toFixed(2))],
        ["Patrimonio Neto","",parseFloat(balance.patrimonioNeto.toFixed(2))],
        ["Score de Salud Financiera","",`${scoreNum}/100`],
        ["","",""],
        ["── LIQUIDEZ ──","",""],
        ["Efectivo y cuentas","",parseFloat(balance.activos.liquidez.total.toFixed(2))],
        ["Inversiones activas","",parseFloat(balance.activos.inversiones.total.toFixed(2))],
        ["","",""],
        ["── PERÍODO: "+`${rango.desde||"Todo"} al ${rango.hasta||today()}` +" ──","",""],
        ["Ingresos del período","",parseFloat(resultados.totalIngresos.toFixed(2))],
        ["Gastos del período","",parseFloat(resultados.totalGastos.toFixed(2))],
        ["Utilidad / Déficit","",parseFloat(resultados.utilidad.toFixed(2))],
        ["Margen de ahorro","",`${resultados.margen.toFixed(1)}%`],
        ["","",""],
        ["── DEUDAS VIGENTES ──","",""],
        ["Tarjetas de crédito","",parseFloat(balance.pasivos.tarjetas.total.toFixed(2))],
        ["Préstamos por pagar","",parseFloat(balance.pasivos.prestamos.total.toFixed(2))],
        ["Hipotecas","",parseFloat(balance.pasivos.hipotecas.total.toFixed(2))],
        ["","",""],
        ["── FLUJO DE EFECTIVO ──","",""],
        ["Flujo operativo","",parseFloat(flujo.operativas.flujo.toFixed(2))],
        ["Flujo de inversión","",parseFloat(flujo.inversion.flujo.toFixed(2))],
        ["Flujo de financiamiento","",parseFloat(flujo.financiamiento.flujo.toFixed(2))],
        ["Flujo neto total","",parseFloat(flujo.flujoTotal.toFixed(2))],
      ];
      const ws0 = XLSX.utils.aoa_to_sheet(resEjec);
      ws0["!cols"] = [{wch:38},{wch:5},{wch:22}];
      // Mover resumen al frente
      wb.SheetNames.unshift("Resumen Ejecutivo");
      wb.Sheets["Resumen Ejecutivo"] = ws0;

      XLSX.writeFile(wb, `Finanzapp_Reporte_${today()}.xlsx`);
      toast("Excel exportado correctamente ✓", "success");
    } catch(e) {
      console.error("Excel error:", e);
      toast(`Error al exportar: ${e?.message||"verifica tu conexión"}`, "error");
    }
  };

  // ── exportar PDF ejecutivo (print CSS)
  const exportarPDF = () => {
    const now2 = new Date();
    const ingrMes = transactions.filter(t=>t.date?.startsWith(`${now2.getFullYear()}-${String(now2.getMonth()+1).padStart(2,"0")}`)&&t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const gastMes = transactions.filter(t=>t.date?.startsWith(`${now2.getFullYear()}-${String(now2.getMonth()+1).padStart(2,"0")}`)&&t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const ahorro  = ingrMes - gastMes;
    const margenAhorro = ingrMes>0?(ahorro/ingrMes*100):0;
    const deudaRatio = balance.activos.total>0?balance.pasivos.total/balance.activos.total*100:0;
    const scoreNum = Math.round(
      ((deudaRatio<=30?100:deudaRatio<=50?75:deudaRatio<=75?45:20) +
       (margenAhorro>=20?100:margenAhorro>=10?70:margenAhorro>=0?40:0) +
       (resultados.margen>=10?100:resultados.margen>=0?60:20)) / 3
    );
    const scoreColor = scoreNum>=80?"#00d4aa":scoreNum>=60?"#f39c12":"#ff4757";
    const scoreLabel = scoreNum>=80?"Excelente":scoreNum>=60?"Buena":scoreNum>=40?"Regular":"Atención";

    // top 5 gastos por categoría
    const topCats = Object.entries(
      transactions.filter(t=>t.date?.startsWith(`${now2.getFullYear()}-${String(now2.getMonth()+1).padStart(2,"0")}`)&&t.type==="expense")
        .reduce((m,t)=>{ const c=t.category||"Otro"; m[c]=(m[c]||0)+parseFloat(t.amount||0); return m; },{})
    ).sort((a,b)=>b[1]-a[1]).slice(0,5);

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte Financiero — ${user.name}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #1a1a2e; font-size: 11px; line-height: 1.5; }
  .header { background: linear-gradient(135deg,#0f172a,#1e293b); color: #fff; padding: 20px 24px; border-radius: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
  .header h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .header h1 span { color: #00d4aa; }
  .header .meta { text-align: right; font-size: 10px; opacity: .7; line-height: 1.8; }
  .kpis { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 16px; }
  @media(max-width:600px){.kpis{grid-template-columns:repeat(2,1fr);}}
  .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; }
  .kpi .label { font-size: 9px; text-transform: uppercase; letter-spacing: .6px; color: #94a3b8; font-weight: 700; margin-bottom: 4px; }
  .kpi .value { font-size: 17px; font-weight: 800; color: #0f172a; }
  .kpi .value.pos { color: #00a884; }
  .kpi .value.neg { color: #ef4444; }
  .kpi .value.teal { color: #00d4aa; }
  .kpi .sub { font-size: 9px; color: #94a3b8; margin-top: 2px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
  .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
  .section h3 { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .6px; color: #475569; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
  .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
  .row:last-child { border-bottom: none; }
  .row .lbl { color: #64748b; }
  .row .val { font-weight: 700; color: #0f172a; }
  .row .val.pos { color: #00a884; }
  .row .val.neg { color: #ef4444; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 0 4px; border-top: 2px solid #cbd5e1; margin-top: 6px; }
  .total-row .lbl { font-weight: 800; color: #0f172a; font-size: 12px; }
  .total-row .val { font-weight: 800; font-size: 13px; color: #0f172a; }
  .health { display: flex; align-items: center; gap: 16px; padding: 10px 0; }
  .score-circle { width: 64px; height: 64px; border-radius: 50%; background: conic-gradient(${scoreColor} ${scoreNum*3.6}deg, #e2e8f0 0deg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .score-inner { width: 46px; height: 46px; border-radius: 50%; background: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .score-num { font-size: 14px; font-weight: 800; color: ${scoreColor}; line-height: 1; }
  .score-lbl { font-size: 8px; color: #94a3b8; font-weight: 600; }
  .bar-wrap { margin: 4px 0; }
  .bar-label { display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-bottom: 2px; }
  .bar-track { height: 7px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; }
  .footer { margin-top: 16px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: 700; }
  .patrimonio-box { background: linear-gradient(135deg,#0f172a,#1e3a5f); color: #fff; border-radius: 8px; padding: 14px 16px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
  .patrimonio-box .big { font-size: 26px; font-weight: 800; color: #00d4aa; }
  .patrimonio-box .small { font-size: 10px; opacity: .7; }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>Finanz<span>app</span></h1>
    <div style="font-size:12px;opacity:.8;margin-top:4px">Reporte Ejecutivo de Finanzas Personales</div>
  </div>
  <div class="meta">
    <div><strong>${user.name}</strong></div>
    <div>${now2.toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
    <div>Período: ${rango.desde||"Inicio"} al ${rango.hasta||new Date().toISOString().split("T")[0]}</div>
  </div>
</div>

<div class="patrimonio-box">
  <div>
    <div class="small">PATRIMONIO NETO</div>
    <div class="big">${fmt(balance.patrimonioNeto)}</div>
    <div class="small" style="margin-top:4px">Activos ${fmt(balance.activos.total)} — Pasivos ${fmt(balance.pasivos.total)}</div>
  </div>
  <div style="text-align:right">
    <div class="small">SCORE SALUD FINANCIERA</div>
    <div style="font-size:28px;font-weight:800;color:${scoreColor}">${scoreNum}</div>
    <div class="small" style="color:${scoreColor}">${scoreLabel}</div>
  </div>
</div>

<div class="kpis">
  <div class="kpi">
    <div class="label">Ingresos del mes</div>
    <div class="value pos">${fmt(ingrMes)}</div>
    <div class="sub">Período actual</div>
  </div>
  <div class="kpi">
    <div class="label">Gastos del mes</div>
    <div class="value neg">${fmt(gastMes)}</div>
    <div class="sub">Período actual</div>
  </div>
  <div class="kpi">
    <div class="label">Ahorro / Déficit</div>
    <div class="value ${ahorro>=0?"pos":"neg"}">${fmt(ahorro)}</div>
    <div class="sub">Margen ${margenAhorro.toFixed(1)}%</div>
  </div>
  <div class="kpi">
    <div class="label">Liquidez disponible</div>
    <div class="value teal">${fmt(balance.activos.liquidez.total)}</div>
    <div class="sub">${accounts.filter(a=>a.type!=="credit").length} cuenta(s)</div>
  </div>
</div>

<div class="grid2">
  <div class="section">
    <h3>Balance General</h3>
    <div class="row"><span class="lbl">Liquidez (cuentas)</span><span class="val">${fmt(balance.activos.liquidez.total)}</span></div>
    <div class="row"><span class="lbl">Inversiones</span><span class="val">${fmt(balance.activos.inversiones.total)}</span></div>
    <div class="row"><span class="lbl">Préstamos por cobrar</span><span class="val">${fmt(balance.activos.cuentasCobrar.total)}</span></div>
    <div class="total-row"><span class="lbl">Total Activos</span><span class="val">${fmt(balance.activos.total)}</span></div>
    <div style="margin-top:10px">
    <div class="row"><span class="lbl">Tarjetas de crédito</span><span class="val neg">${fmt(balance.pasivos.tarjetas.total)}</span></div>
    <div class="row"><span class="lbl">Préstamos por pagar</span><span class="val neg">${fmt(balance.pasivos.prestamos.total)}</span></div>
    <div class="row"><span class="lbl">Hipotecas</span><span class="val neg">${fmt(balance.pasivos.hipotecas.total)}</span></div>
    <div class="total-row"><span class="lbl">Total Pasivos</span><span class="val neg">${fmt(balance.pasivos.total)}</span></div>
    </div>
  </div>

  <div class="section">
    <h3>Estado de Resultados — Período</h3>
    <div class="row"><span class="lbl">Ingresos operativos</span><span class="val">${fmt(resultados.totalIngresosOp)}</span></div>
    <div class="row"><span class="lbl">Ingresos por inversiones</span><span class="val">${fmt(resultados.totalIngresosInv)}</span></div>
    <div class="total-row"><span class="lbl">Total Ingresos</span><span class="val pos">${fmt(resultados.totalIngresos)}</span></div>
    <div style="margin-top:10px">
    <div class="row"><span class="lbl">Gastos operativos</span><span class="val">${fmt(resultados.totalGastosOp)}</span></div>
    <div class="row"><span class="lbl">Pagos de deuda</span><span class="val">${fmt(resultados.totalGastosDeuda)}</span></div>
    <div class="row"><span class="lbl">Pagos hipoteca</span><span class="val">${fmt(resultados.totalGastosHip)}</span></div>
    <div class="total-row"><span class="lbl">Total Gastos</span><span class="val neg">${fmt(resultados.totalGastos)}</span></div>
    </div>
    <div style="margin-top:10px;padding:8px;background:${resultados.utilidad>=0?"#f0fdf4":"#fef2f2"};border-radius:6px;display:flex;justify-content:space-between">
      <span style="font-weight:800">${resultados.utilidad>=0?"Utilidad Neta":"Déficit Neto"}</span>
      <span style="font-weight:800;color:${resultados.utilidad>=0?"#00a884":"#ef4444"}">${fmt(resultados.utilidad)}</span>
    </div>
  </div>
</div>

<div class="grid2">
  <div class="section">
    <h3>Flujo de Efectivo</h3>
    <div class="row"><span class="lbl">Flujo operativo</span><span class="val ${flujo.operativas.flujo>=0?"pos":"neg"}">${fmt(flujo.operativas.flujo)}</span></div>
    <div class="row"><span class="lbl">Flujo de inversión</span><span class="val ${flujo.inversion.flujo>=0?"pos":"neg"}">${fmt(flujo.inversion.flujo)}</span></div>
    <div class="row"><span class="lbl">Flujo de financiamiento</span><span class="val ${flujo.financiamiento.flujo>=0?"pos":"neg"}">${fmt(flujo.financiamiento.flujo)}</span></div>
    <div class="total-row"><span class="lbl">Flujo Neto Total</span><span class="val ${flujo.flujoTotal>=0?"pos":"neg"}">${fmt(flujo.flujoTotal)}</span></div>
  </div>

  <div class="section">
    <h3>Top Gastos del Mes por Categoría</h3>
    ${topCats.length===0
      ? '<div style="color:#94a3b8;font-size:10px;padding:8px 0">Sin gastos registrados este mes</div>'
      : topCats.map(([cat,val])=>`
      <div class="bar-wrap">
        <div class="bar-label"><span>${cat}</span><span style="font-weight:700">${fmt(val)}</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.min(val/topCats[0][1]*100,100).toFixed(0)}%;background:#00d4aa"></div></div>
      </div>`).join("")
    }
  </div>
</div>

<div class="section" style="margin-bottom:14px">
  <h3>Salud Financiera</h3>
  <div class="health">
    <div class="score-circle">
      <div class="score-inner">
        <span class="score-num">${scoreNum}</span>
        <span class="score-lbl">/100</span>
      </div>
    </div>
    <div style="flex:1">
      <div style="font-size:14px;font-weight:800;color:${scoreColor};margin-bottom:6px">${scoreLabel}</div>
      <div class="bar-wrap">
        <div class="bar-label"><span>Ratio de deuda</span><span>${deudaRatio.toFixed(0)}% (meta: &lt;30%)</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.min(deudaRatio,100).toFixed(0)}%;background:${deudaRatio<=30?"#00d4aa":deudaRatio<=50?"#f39c12":"#ef4444"}"></div></div>
      </div>
      <div class="bar-wrap">
        <div class="bar-label"><span>Tasa de ahorro</span><span>${margenAhorro.toFixed(1)}% (meta: &gt;20%)</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.min(Math.max(margenAhorro,0),100).toFixed(0)}%;background:${margenAhorro>=20?"#00d4aa":margenAhorro>=10?"#f39c12":"#ef4444"}"></div></div>
      </div>
    </div>
  </div>
</div>

<div class="footer">
  Generado por Finanzapp · ${now2.toLocaleDateString("es-MX")} · Solo para uso personal
</div>

</body>
</html>`;

    const win = window.open("","_blank","width=900,height=700");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(()=>{ win.print(); }, 600);
  };

  // ── helpers UI
  const FilaBalance = ({ label, valor, nivel=0, negrita=false, color=null, separador=false }) => (
    <div style={{
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding: nivel===0 ? "9px 16px" : "6px 16px 6px "+(16+nivel*16)+"px",
      borderBottom: separador ? "1px solid rgba(255,255,255,.08)" : "1px solid rgba(255,255,255,.03)",
      background: nivel===0 ? "rgba(255,255,255,.03)" : "transparent",
    }}>
      <span style={{fontSize: nivel===0?13:12, fontWeight: negrita?700:400, color: nivel===0?"#ccc":"#777"}}>{label}</span>
      <span style={{fontSize: nivel===0?14:12, fontWeight: negrita||nivel===0?700:400, color: color||(nivel===0?"#f0f0f0":"#888"), fontVariantNumeric:"tabular-nums"}}>{fmt(valor)}</span>
    </div>
  );

  const TotalRow = ({ label, valor, color="#00d4aa" }) => (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",background:`${color}12`,borderTop:`2px solid ${color}33`}}>
      <span style={{fontSize:14,fontWeight:800,color:"#f0f0f0"}}>{label}</span>
      <span style={{fontSize:16,fontWeight:800,color,fontVariantNumeric:"tabular-nums"}}>{fmt(valor)}</span>
    </div>
  );

  const PERIODOS = [{v:"mes",l:"Este mes"},{v:"trimestre",l:"Trimestre"},{v:"anio",l:"Este año"},{v:"todo",l:"Todo"},{v:"personalizado",l:"Personalizado"}];
  const TABS = [{id:"balance",label:"Balance General"},{id:"resultados",label:"Estado de Resultados"},{id:"flujo",label:"Flujo de Efectivo"},{id:"analisis",label:"📊 Análisis"}];

  return (
    <div style={{animation:"fadeUp .25s ease"}}>
      {/* header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#f0f0f0",margin:"0 0 3px"}}>Estados Financieros</h2>
          <p style={{fontSize:13,color:"#555",margin:0}}>Balance General · Estado de Resultados · Flujo de Efectivo</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          {/* selector período */}
          <div style={{display:"flex",gap:2,background:"rgba(255,255,255,.03)",borderRadius:9,padding:3}}>
            {PERIODOS.map(p=>(
              <button key={p.v} onClick={()=>setPeriodo(p.v)} style={{padding:"5px 10px",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:periodo===p.v?"rgba(0,212,170,.15)":"transparent",color:periodo===p.v?"#00d4aa":"#666"}}>{p.l}</button>
            ))}
          </div>
          <button onClick={exportarPDF} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,border:"1px solid rgba(239,68,68,.2)",background:"rgba(239,68,68,.08)",color:"#f87171",cursor:"pointer",fontSize:12,fontWeight:700}}>
            <Ic n="documents" size={14}/>PDF
          </button>
          <button onClick={exportarExcel} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,border:"1px solid rgba(0,212,170,.2)",background:"rgba(0,212,170,.08)",color:"#00d4aa",cursor:"pointer",fontSize:12,fontWeight:700}}>
            <Ic n="download" size={14}/>Excel
          </button>
        </div>
      </div>

      {/* fechas personalizadas */}
      {periodo==="personalizado" && (
        <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
          <input type="date" value={fechaDesde} onChange={e=>setFechaDesde(e.target.value)} style={{padding:"7px 11px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,color:"#e0e0e0",fontSize:12,outline:"none"}}/>
          <span style={{color:"#555",fontSize:12}}>al</span>
          <input type="date" value={fechaHasta} onChange={e=>setFechaHasta(e.target.value)} style={{padding:"7px 11px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,color:"#e0e0e0",fontSize:12,outline:"none"}}/>
          <span style={{fontSize:11,color:"#555"}}>{txsRango.length} transacciones en este período</span>
        </div>
      )}

      {/* tabs */}
      <div style={{display:"flex",gap:2,marginBottom:16,background:"rgba(255,255,255,.03)",borderRadius:10,padding:3,width:"fit-content",flexWrap:"wrap"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .15s",background:tab===t.id?"linear-gradient(135deg,#00d4aa,#00a884)":"transparent",color:tab===t.id?"#fff":"#666"}}>{t.label}</button>
        ))}
      </div>

      {/* ══ BALANCE GENERAL */}
      {tab==="balance" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:14}}>
          {/* ACTIVOS */}
          <Card style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",background:"rgba(0,212,170,.06)"}}>
              <p style={{fontSize:13,fontWeight:800,color:"#00d4aa",margin:0,textTransform:"uppercase",letterSpacing:.5}}>Activos</p>
              <p style={{fontSize:20,fontWeight:800,color:"#00d4aa",margin:"4px 0 0"}}>{fmt(balance.activos.total)}</p>
            </div>
            <div style={{padding:"8px 0"}}>
              <div style={{padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Liquidez</div>
              {balance.activos.liquidez.items.map((i,idx)=><FilaBalance key={idx} label={i.nombre} valor={i.valor} nivel={1}/>)}
              <FilaBalance label="Subtotal Liquidez" valor={balance.activos.liquidez.total} nivel={0} negrita separador/>
              <div style={{padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Inversiones</div>
              {balance.activos.inversiones.items.length===0
                ? <div style={{padding:"6px 32px",fontSize:12,color:"#444"}}>Sin inversiones activas</div>
                : balance.activos.inversiones.items.map((i,idx)=><FilaBalance key={idx} label={i.nombre} valor={i.valor} nivel={1}/>)}
              <FilaBalance label="Subtotal Inversiones" valor={balance.activos.inversiones.total} nivel={0} negrita separador/>
              {balance.activos.cuentasCobrar.total>0 && <>
                <div style={{padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Cuentas por Cobrar</div>
                {balance.activos.cuentasCobrar.items.map((i,idx)=><FilaBalance key={idx} label={i.nombre} valor={i.valor} nivel={1}/>)}
                <FilaBalance label="Subtotal CxC" valor={balance.activos.cuentasCobrar.total} nivel={0} negrita separador/>
              </>}
            </div>
            <TotalRow label="TOTAL ACTIVOS" valor={balance.activos.total} color="#00d4aa"/>
          </Card>

          {/* PASIVOS + PATRIMONIO */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Card style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",background:"rgba(255,71,87,.06)"}}>
                <p style={{fontSize:13,fontWeight:800,color:"#ff4757",margin:0,textTransform:"uppercase",letterSpacing:.5}}>Pasivos</p>
                <p style={{fontSize:20,fontWeight:800,color:"#ff4757",margin:"4px 0 0"}}>{fmt(balance.pasivos.total)}</p>
              </div>
              <div style={{padding:"8px 0"}}>
                {balance.pasivos.tarjetas.total>0 && <>
                  <div style={{padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Tarjetas de Crédito</div>
                  {balance.pasivos.tarjetas.items.map((i,idx)=><FilaBalance key={idx} label={i.nombre} valor={i.valor} nivel={1}/>)}
                  <FilaBalance label="Subtotal Tarjetas" valor={balance.pasivos.tarjetas.total} nivel={0} negrita separador/>
                </>}
                {balance.pasivos.prestamos.total>0 && <>
                  <div style={{padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Préstamos por Pagar</div>
                  {balance.pasivos.prestamos.items.map((i,idx)=><FilaBalance key={idx} label={i.nombre} valor={i.valor} nivel={1}/>)}
                  <FilaBalance label="Subtotal Préstamos" valor={balance.pasivos.prestamos.total} nivel={0} negrita separador/>
                </>}
                {balance.pasivos.hipotecas.total>0 && <>
                  <div style={{padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Hipotecas</div>
                  {balance.pasivos.hipotecas.items.map((i,idx)=><FilaBalance key={idx} label={i.nombre} valor={i.valor} nivel={1}/>)}
                  <FilaBalance label="Subtotal Hipotecas" valor={balance.pasivos.hipotecas.total} nivel={0} negrita separador/>
                </>}
                {balance.pasivos.total===0 && <div style={{padding:"16px",fontSize:12,color:"#444",textAlign:"center"}}>Sin pasivos registrados</div>}
              </div>
              <TotalRow label="TOTAL PASIVOS" valor={balance.pasivos.total} color="#ff4757"/>
            </Card>

            <Card style={{padding:0,overflow:"hidden",borderColor:balance.patrimonioNeto>=0?"rgba(0,212,170,.2)":"rgba(255,71,87,.2)"}}>
              <div style={{padding:"16px",background:balance.patrimonioNeto>=0?"rgba(0,212,170,.08)":"rgba(255,71,87,.08)"}}>
                <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 6px"}}>Patrimonio Neto = Activos − Pasivos</p>
                <p style={{fontSize:28,fontWeight:800,color:balance.patrimonioNeto>=0?"#00d4aa":"#ff4757",margin:0}}>{fmt(balance.patrimonioNeto)}</p>
                <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,.06)",overflow:"hidden",marginTop:12}}>
                  <div style={{height:"100%",width:`${balance.activos.total>0?Math.min(balance.patrimonioNeto/balance.activos.total*100,100):0}%`,background:balance.patrimonioNeto>=0?"#00d4aa":"#ff4757",borderRadius:3}}/>
                </div>
                <p style={{fontSize:11,color:"#555",margin:"6px 0 0"}}>{balance.activos.total>0?(balance.patrimonioNeto/balance.activos.total*100).toFixed(1):0}% del total de activos</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ══ ESTADO DE RESULTADOS */}
      {tab==="resultados" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Sin datos en el período */}
          {txsRango.length===0 && (
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:"rgba(243,156,18,.07)",border:"1px solid rgba(243,156,18,.2)",borderRadius:12}}>
              <Ic n="warn" size={18} color="#f39c12"/>
              <div>
                <p style={{fontSize:13,fontWeight:600,color:"#f5a623",margin:"0 0 2px"}}>Sin transacciones en este período</p>
                <p style={{fontSize:11,color:"#666",margin:0}}>Cambia el período o registra movimientos para ver el Estado de Resultados</p>
              </div>
            </div>
          )}
          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
            {[
              ["Ingresos totales", fmt(resultados.totalIngresos), "#00d4aa"],
              ["Gastos totales",   fmt(resultados.totalGastos),   "#ff4757"],
              ["Utilidad neta",    fmt(resultados.utilidad),      resultados.utilidad>=0?"#00d4aa":"#ff4757"],
              ["Margen",           resultados.margen.toFixed(1)+"%", resultados.margen>=20?"#00d4aa":resultados.margen>=0?"#f39c12":"#ff4757"],
            ].map(([l,v,c])=>(
              <Card key={l}><p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 4px"}}>{l}</p><p style={{fontSize:16,fontWeight:700,color:c,margin:0}}>{v}</p></Card>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {/* Ingresos por origen */}
            <Card style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",background:"rgba(0,212,170,.06)"}}>
                <p style={{fontSize:12,fontWeight:800,color:"#00d4aa",margin:0,textTransform:"uppercase",letterSpacing:.4}}>Ingresos</p>
                <p style={{fontSize:18,fontWeight:800,color:"#00d4aa",margin:"3px 0 0"}}>{fmt(resultados.totalIngresos)}</p>
              </div>
              <div style={{padding:"8px 0"}}>
                {[
                  ["Operativos / Salario", resultados.totalIngresosOp],
                  ["Retiros / Dividendos", resultados.totalIngresosInv],
                  ["Cobros de préstamos",  resultados.totalIngresosPresta],
                ].map(([l,v])=>v>0&&<FilaBalance key={l} label={l} valor={v} nivel={1}/>)}
              </div>
              <div style={{borderTop:"1px solid rgba(255,255,255,.06)",padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Por categoría</div>
              {Object.entries(resultados.catIngresos).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([c,v])=>(
                <div key={c} style={{padding:"5px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontSize:11,color:"#777"}}>{c}</span>
                      <span style={{fontSize:11,color:"#00d4aa",fontWeight:600}}>{fmt(v)}</span>
                    </div>
                    <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,.05)"}}>
                      <div style={{height:"100%",width:`${resultados.totalIngresos>0?v/resultados.totalIngresos*100:0}%`,background:"#00d4aa",borderRadius:2}}/>
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Gastos por origen */}
            <Card style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",background:"rgba(255,71,87,.06)"}}>
                <p style={{fontSize:12,fontWeight:800,color:"#ff4757",margin:0,textTransform:"uppercase",letterSpacing:.4}}>Gastos</p>
                <p style={{fontSize:18,fontWeight:800,color:"#ff4757",margin:"3px 0 0"}}>{fmt(resultados.totalGastos)}</p>
              </div>
              <div style={{padding:"8px 0"}}>
                {[
                  ["Gastos operativos", resultados.totalGastosOp],
                  ["Pagos de deuda",    resultados.totalGastosDeuda],
                  ["Pagos de hipoteca", resultados.totalGastosHip],
                ].map(([l,v])=>v>0&&<FilaBalance key={l} label={l} valor={v} nivel={1}/>)}
              </div>
              <div style={{borderTop:"1px solid rgba(255,255,255,.06)",padding:"8px 16px 4px",fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4}}>Por categoría</div>
              {Object.entries(resultados.catGastos).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([c,v])=>(
                <div key={c} style={{padding:"5px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontSize:11,color:"#777"}}>{c}</span>
                      <span style={{fontSize:11,color:"#ff4757",fontWeight:600}}>{fmt(v)}</span>
                    </div>
                    <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,.05)"}}>
                      <div style={{height:"100%",width:`${resultados.totalGastos>0?v/resultados.totalGastos*100:0}%`,background:"#ff4757",borderRadius:2}}/>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Resultado final */}
          <Card style={{borderColor:resultados.utilidad>=0?"rgba(0,212,170,.2)":"rgba(255,71,87,.2)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <div>
                <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 6px"}}>Resultado del período</p>
                <p style={{fontSize:26,fontWeight:800,color:resultados.utilidad>=0?"#00d4aa":"#ff4757",margin:0}}>
                  {resultados.utilidad>=0?"+":""}{fmt(resultados.utilidad)}
                </p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontSize:12,color:"#555",margin:"0 0 4px"}}>Margen neto</p>
                <p style={{fontSize:22,fontWeight:800,color:resultados.margen>=20?"#00d4aa":resultados.margen>=0?"#f39c12":"#ff4757",margin:0}}>{resultados.margen.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ══ FLUJO DE EFECTIVO */}
      {tab==="flujo" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* KPIs de flujo */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
            {[
              ["Flujo operativo",      flujo.operativas.flujo,     "#3b82f6"],
              ["Flujo de inversión",   flujo.inversion.flujo,      "#f39c12"],
              ["Flujo financiamiento", flujo.financiamiento.flujo, "#7c3aed"],
              ["Flujo neto total",     flujo.flujoTotal,           flujo.flujoTotal>=0?"#00d4aa":"#ff4757"],
            ].map(([l,v,c])=>(
              <Card key={l}><p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.4,margin:"0 0 4px"}}>{l}</p><p style={{fontSize:15,fontWeight:700,color:c,margin:0}}>{v>=0?"+":""}{fmt(v)}</p></Card>
            ))}
          </div>

          {/* Las 3 secciones */}
          {[
            { titulo:"Actividades Operativas",    data:flujo.operativas,     color:"#3b82f6", desc:"Ingresos y gastos del día a día" },
            { titulo:"Actividades de Inversión",  data:flujo.inversion,      color:"#f39c12", desc:"Aportaciones y retiros de inversiones" },
            { titulo:"Actividades de Financiamiento", data:flujo.financiamiento, color:"#7c3aed", desc:"Préstamos y pagos de deuda" },
          ].map(({titulo,data,color,desc})=>(
            <Card key={titulo} style={{padding:0,overflow:"hidden",borderColor:`${color}22`}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",background:`${color}08`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <p style={{fontSize:13,fontWeight:800,color,margin:0}}>{titulo}</p>
                    <p style={{fontSize:11,color:"#555",margin:"2px 0 0"}}>{desc}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:11,color:"#555",margin:"0 0 2px"}}>Flujo neto</p>
                    <p style={{fontSize:16,fontWeight:800,color:data.flujo>=0?"#00d4aa":"#ff4757",margin:0}}>{data.flujo>=0?"+":""}{fmt(data.flujo)}</p>
                  </div>
                </div>
              </div>
              <div>
                {data.items.filter(i=>Math.abs(i.valor)>0).map((item,idx)=>(
                  <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 16px",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:item.valor>=0?"#00d4aa":"#ff4757",flexShrink:0}}/>
                      <span style={{fontSize:12,color:"#888"}}>{item.label}</span>
                    </div>
                    <span style={{fontSize:13,fontWeight:600,color:item.valor>=0?"#00d4aa":"#ff4757"}}>{item.valor>=0?"+":""}{fmt(Math.abs(item.valor))}</span>
                  </div>
                ))}
                {data.items.filter(i=>Math.abs(i.valor)>0).length===0 && (
                  <div style={{padding:"16px",fontSize:12,color:"#444",textAlign:"center"}}>Sin movimientos en este período</div>
                )}
              </div>
            </Card>
          ))}

          {/* Resumen final */}
          <Card style={{borderColor:flujo.flujoTotal>=0?"rgba(0,212,170,.2)":"rgba(255,71,87,.2)"}}>
            <p style={{fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 12px"}}>Variación neta de efectivo</p>
            {[
              ["Flujo operativo",           flujo.operativas.flujo,     "#3b82f6"],
              ["Flujo de inversión",        flujo.inversion.flujo,      "#f39c12"],
              ["Flujo de financiamiento",   flujo.financiamiento.flujo, "#7c3aed"],
            ].map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{fontSize:12,color:"#666"}}>{l}</span>
                <span style={{fontSize:12,fontWeight:600,color:v>=0?"#00d4aa":"#ff4757"}}>{v>=0?"+":""}{fmt(v)}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",marginTop:4}}>
              <span style={{fontSize:14,fontWeight:800,color:"#f0f0f0"}}>Flujo neto total</span>
              <span style={{fontSize:16,fontWeight:800,color:flujo.flujoTotal>=0?"#00d4aa":"#ff4757"}}>{flujo.flujoTotal>=0?"+":""}{fmt(flujo.flujoTotal)}</span>
            </div>
          </Card>

          {/* Reconciliación de efectivo */}
          <Card style={{borderColor:"rgba(59,130,246,.25)",background:"linear-gradient(135deg,rgba(59,130,246,.05) 0%,transparent 60%)"}}>
            <p style={{fontSize:12,fontWeight:700,color:"#3b82f6",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 14px"}}>
              Reconciliación de Efectivo <span style={{fontSize:10,color:"#444",fontWeight:400}}>(estimada)</span>
            </p>
            <p style={{fontSize:11,color:"#555",margin:"0 0 14px",lineHeight:1.5}}>
              Verifica que el saldo inicial + los movimientos del período = el efectivo que tienes hoy en cuentas.
            </p>
            {/* línea 1: saldo inicial */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 14px",background:"rgba(255,255,255,.03)",borderRadius:8,marginBottom:6}}>
              <div>
                <p style={{fontSize:13,color:"#888",margin:0}}>Saldo inicial de efectivo</p>
                <p style={{fontSize:10,color:"#444",margin:"2px 0 0"}}>Calculado como: saldo actual − flujo del período</p>
                <p style={{fontSize:11,color:"#555",margin:"2px 0 0"}}>Estimado: saldo actual menos movimientos del período</p>
              </div>
              <span style={{fontSize:15,fontWeight:700,color:"#ccc",fontVariantNumeric:"tabular-nums"}}>{fmt(flujo.saldoInicialEfectivo)}</span>
            </div>
            {/* línea 2: flujo neto */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 14px",background:"rgba(255,255,255,.03)",borderRadius:8,marginBottom:6}}>
              <div>
                <p style={{fontSize:13,color:"#888",margin:0}}>
                  {flujo.flujoTotal>=0?"(+) Flujo neto del período":"(−) Flujo neto del período"}
                </p>
                <p style={{fontSize:11,color:"#555",margin:"2px 0 0"}}>Suma de flujos operativo + inversión + financiamiento</p>
              </div>
              <span style={{fontSize:15,fontWeight:700,color:flujo.flujoTotal>=0?"#00d4aa":"#ff4757",fontVariantNumeric:"tabular-nums"}}>
                {flujo.flujoTotal>=0?"+":""}{fmt(flujo.flujoTotal)}
              </span>
            </div>
            {/* separador */}
            <div style={{borderTop:"2px solid rgba(59,130,246,.2)",margin:"8px 0"}}/>
            {/* línea 3: saldo final */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:"rgba(59,130,246,.08)",borderRadius:8,border:"1px solid rgba(59,130,246,.15)"}}>
              <div>
                <p style={{fontSize:14,fontWeight:800,color:"#f0f0f0",margin:0}}>Saldo final de efectivo</p>
                <p style={{fontSize:11,color:"#555",margin:"3px 0 0"}}>
                  Total en {accounts.filter(a=>a.type!=="credit").length} cuenta{accounts.filter(a=>a.type!=="credit").length!==1?"s":""} · excluye tarjetas de crédito
                </p>
              </div>
              <span style={{fontSize:20,fontWeight:800,color:"#3b82f6",fontVariantNumeric:"tabular-nums"}}>{fmt(flujo.saldoFinalEfectivo)}</span>
            </div>
            {/* detalle por cuenta */}
            <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.05)"}}>
              <p style={{fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>Desglose por cuenta</p>
              {accounts.filter(a=>a.type!=="credit").map(a=>{
                const saldo = a.currency==="USD" ? parseFloat(a.balance||0)*TC : parseFloat(a.balance||0);
                const pct   = flujo.saldoFinalEfectivo>0 ? saldo/flujo.saldoFinalEfectivo*100 : 0;
                return (
                  <div key={a.id} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12,color:"#777"}}>{a.name}{a.currency==="USD"&&<span style={{fontSize:10,color:"#555",marginLeft:5}}>USD</span>}</span>
                      <span style={{fontSize:12,fontWeight:600,color:"#3b82f6"}}>{fmt(saldo)}</span>
                    </div>
                    <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,.05)"}}>
                      <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:"#3b82f6",borderRadius:2,opacity:.7}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: ANÁLISIS — Categorías y Tags
      ══════════════════════════════════════════════════════════ */}
      {tab==="analisis" && (
        <AnalisisTab txsRango={txsRango} transactions={transactions} accounts={accounts} />
      )}
    </div>
  );
};



// ─── SUBCOMPONENTE: ANÁLISIS DE CATEGORÍAS Y TAGS ────────────────────────────
const AnalisisTab = ({ txsRango, transactions, accounts }) => {
  const [subTab, setSubTab] = useState("categorias");
  const [tagSel, setTagSel] = useState("");

  const gastos   = txsRango.filter(t=>t.type==="expense");
  const ingresos = txsRango.filter(t=>t.type==="income");
  const totalGastos   = gastos.reduce((s,t)=>s+parseFloat(t.amount||0),0);
  const totalIngresos = ingresos.reduce((s,t)=>s+parseFloat(t.amount||0),0);

  const hoy = new Date();
  const mesAnteriorStr = new Date(hoy.getFullYear(),hoy.getMonth()-1,1).toISOString().split("T")[0].slice(0,7);
  const gastosMesAnt = transactions.filter(t=>t.date.slice(0,7)===mesAnteriorStr&&t.type==="expense");

  // ── categorías
  const porCat={}, porCatIngreso={}, porCatAnt={};
  gastos.forEach(t=>{ const c=t.category||"Sin categoría"; porCat[c]=(porCat[c]||0)+parseFloat(t.amount||0); });
  ingresos.forEach(t=>{ const c=t.category||"Sin categoría"; porCatIngreso[c]=(porCatIngreso[c]||0)+parseFloat(t.amount||0); });
  gastosMesAnt.forEach(t=>{ const c=t.category||"Sin categoría"; porCatAnt[c]=(porCatAnt[c]||0)+parseFloat(t.amount||0); });
  const catGastosOrdenadas = Object.entries(porCat).sort((a,b)=>b[1]-a[1]);
  const catIngresosOrdenadas = Object.entries(porCatIngreso).sort((a,b)=>b[1]-a[1]);
  const maxCatGasto = catGastosOrdenadas[0]?.[1]||1;

  // ── tags
  const porTag={};
  txsRango.forEach(t=>{
    (t.tags||[]).forEach(tag=>{
      if(!porTag[tag]) porTag[tag]={gasto:0,ingreso:0,count:0};
      if(t.type==="expense") porTag[tag].gasto+=parseFloat(t.amount||0);
      else porTag[tag].ingreso+=parseFloat(t.amount||0);
      porTag[tag].count++;
    });
  });
  const tagsOrdenados = Object.entries(porTag)
    .map(([tag,d])=>({tag,gasto:d.gasto,ingreso:d.ingreso,neto:d.ingreso-d.gasto,count:d.count}))
    .sort((a,b)=>b.gasto-a.gasto);
  const maxTagGasto = tagsOrdenados[0]?.gasto||1;

  // ── evolución mensual tag
  const meses6 = Array.from({length:6},(_,i)=>{
    const d=new Date(hoy.getFullYear(),hoy.getMonth()-5+i,1);
    return {str:d.toISOString().split("T")[0].slice(0,7), label:d.toLocaleDateString("es-MX",{month:"short",year:"2-digit"})};
  });
  const evolucionTag = tagSel ? meses6.map(m=>{
    const txsM=transactions.filter(t=>t.date.slice(0,7)===m.str&&(t.tags||[]).includes(tagSel));
    return { label:m.label, gasto:txsM.filter(t=>t.type==="expense").reduce((s,t)=>s+parseFloat(t.amount||0),0), ingreso:txsM.filter(t=>t.type==="income").reduce((s,t)=>s+parseFloat(t.amount||0),0) };
  }) : [];
  const maxEvo = evolucionTag.length ? Math.max(...evolucionTag.map(m=>Math.max(m.gasto,m.ingreso)),1) : 1;

  // ── exportar
  const exportarCatExcelReports = () => {
    const doExport = () => {
      const XLSX=window.XLSX, wb=XLSX.utils.book_new();
      const rowsG=catGastosOrdenadas.map(([cat,monto])=>({ Categoría:cat, Tipo:"Gasto", Monto:monto, "% del total":totalGastos>0?((monto/totalGastos)*100).toFixed(1)+"%":"", "Mes anterior":porCatAnt[cat]||0, "Δ vs mes ant":porCatAnt[cat]?(((monto-porCatAnt[cat])/porCatAnt[cat])*100).toFixed(1)+"%":"N/A" }));
      const rowsI=catIngresosOrdenadas.map(([cat,monto])=>({ Categoría:cat, Tipo:"Ingreso", Monto:monto, "% del total":totalIngresos>0?((monto/totalIngresos)*100).toFixed(1)+"%":"", "Mes anterior":"","Δ vs mes ant":"" }));
      const ws=XLSX.utils.json_to_sheet([...rowsG,...rowsI]);
      ws["!cols"]=[{wch:25},{wch:10},{wch:14},{wch:14},{wch:14},{wch:14}];
      XLSX.utils.book_append_sheet(wb,ws,"Categorías");
      XLSX.writeFile(wb,`analisis_categorias_${new Date().toISOString().split("T")[0]}.xlsx`);
    };
    if(!window.XLSX){const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";s.onload=doExport;document.head.appendChild(s);} else doExport();
  };
  const exportarTagsExcelReports = () => {
    const doExport = () => {
      const XLSX=window.XLSX, wb=XLSX.utils.book_new();
      const rows=tagsOrdenados.map(d=>({ Tag:"#"+d.tag, Gastos:d.gasto, Ingresos:d.ingreso, Neto:d.neto, Transacciones:d.count }));
      const ws=XLSX.utils.json_to_sheet(rows);
      ws["!cols"]=[{wch:20},{wch:14},{wch:14},{wch:14},{wch:14}];
      XLSX.utils.book_append_sheet(wb,ws,"Tags");
      XLSX.writeFile(wb,`analisis_tags_${new Date().toISOString().split("T")[0]}.xlsx`);
    };
    if(!window.XLSX){const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";s.onload=doExport;document.head.appendChild(s);} else doExport();
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* subtabs */}
      <div style={{display:"flex",gap:4,background:"rgba(255,255,255,.03)",borderRadius:10,padding:4,width:"fit-content"}}>
        {[["categorias","📂 Categorías"],["tags","🏷️ Tags"]].map(([id,label])=>(
          <button key={id} onClick={()=>setSubTab(id)}
            style={{padding:"7px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
              background:subTab===id?"rgba(0,212,170,.15)":"transparent",
              color:subTab===id?"#00d4aa":"#666",transition:"all .15s"}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── SUBTAB CATEGORÍAS ── */}
      {subTab==="categorias" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
            {[
              ["Categorías con gasto",catGastosOrdenadas.length,"#ff4757"],
              ["Mayor gasto",catGastosOrdenadas[0]?catGastosOrdenadas[0][0]:"—","#f39c12",true],
              ["Categorías con ingreso",catIngresosOrdenadas.length,"#00d4aa"],
              ["Mayor ingreso",catIngresosOrdenadas[0]?catIngresosOrdenadas[0][0]:"—","#00d4aa",true],
            ].map(([l,v,c,isText])=>(
              <Card key={l} style={{padding:"12px 14px"}}>
                <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 4px"}}>{l}</p>
                <p style={{fontSize:isText?13:18,fontWeight:800,color:c,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</p>
              </Card>
            ))}
          </div>
          <Card style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontSize:13,fontWeight:700,color:"#f0f0f0",margin:0}}>🔴 Gastos por categoría</p>
              <button onClick={exportarCatExcelReports}
                style={{padding:"4px 12px",borderRadius:7,border:"1px solid rgba(0,212,170,.25)",background:"rgba(0,212,170,.07)",color:"#00d4aa",cursor:"pointer",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                <Ic n="download" size={11} color="#00d4aa"/> Exportar Excel
              </button>
            </div>
            {catGastosOrdenadas.length===0
              ? <p style={{padding:20,textAlign:"center",color:"#444",fontSize:13}}>Sin gastos en este período</p>
              : catGastosOrdenadas.map(([cat,monto])=>{
                  const pct=totalGastos>0?(monto/totalGastos*100):0;
                  const ant=porCatAnt[cat]||0;
                  const delta=ant>0?((monto-ant)/ant*100):null;
                  return (
                    <div key={cat} style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:12,fontWeight:600,color:"#ddd"}}>{cat}</span>
                          {delta!==null&&(
                            <span style={{fontSize:10,fontWeight:700,color:delta>0?"#ff4757":"#00d4aa",background:delta>0?"rgba(255,71,87,.1)":"rgba(0,212,170,.1)",borderRadius:10,padding:"1px 7px"}}>
                              {delta>0?"↑":"↓"}{Math.abs(delta).toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          {ant>0&&<span style={{fontSize:10,color:"#444"}}>ant: {fmt(ant)}</span>}
                          <span style={{fontSize:13,fontWeight:700,color:"#ff6b7a"}}>{fmt(monto)}</span>
                          <span style={{fontSize:10,color:"#444",width:34,textAlign:"right"}}>{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div style={{height:5,borderRadius:4,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:4,width:`${(monto/maxCatGasto*100).toFixed(1)}%`,background:"linear-gradient(90deg,#ff4757,#ff6b7a)",transition:"width .4s ease"}}/>
                      </div>
                    </div>
                  );
                })
            }
          </Card>
          {catIngresosOrdenadas.length>0&&(
            <Card style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                <p style={{fontSize:13,fontWeight:700,color:"#f0f0f0",margin:0}}>💚 Ingresos por categoría</p>
              </div>
              {catIngresosOrdenadas.map(([cat,monto])=>{
                const maxI=catIngresosOrdenadas[0][1]||1;
                const pct=totalIngresos>0?(monto/totalIngresos*100):0;
                return (
                  <div key={cat} style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <span style={{fontSize:12,fontWeight:600,color:"#ddd"}}>{cat}</span>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:13,fontWeight:700,color:"#00d4aa"}}>{fmt(monto)}</span>
                        <span style={{fontSize:10,color:"#444",width:34,textAlign:"right"}}>{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div style={{height:5,borderRadius:4,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:4,width:`${(monto/maxI*100).toFixed(1)}%`,background:"linear-gradient(90deg,#00d4aa,#00a884)",transition:"width .4s ease"}}/>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      )}

      {/* ── SUBTAB TAGS ── */}
      {subTab==="tags" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {tagsOrdenados.length===0 ? (
            <Card style={{padding:32,textAlign:"center"}}>
              <p style={{fontSize:32,margin:"0 0 8px"}}>🏷️</p>
              <p style={{fontSize:14,fontWeight:700,color:"#e0e0e0",margin:"0 0 4px"}}>Sin tags en este período</p>
              <p style={{fontSize:12,color:"#555",margin:0}}>Agrega tags (#nombre) a tus transacciones para verlos aquí</p>
            </Card>
          ) : (
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
                {[
                  ["Tags activos",tagsOrdenados.length,"#a78bfa"],
                  ["Mayor gasto","#"+tagsOrdenados[0]?.tag,"#ff4757",true],
                  ["Total etiquetado",fmt(tagsOrdenados.reduce((s,d)=>s+d.gasto+d.ingreso,0)),"#3b82f6"],
                  ["Transacciones",tagsOrdenados.reduce((s,d)=>s+d.count,0),"#00d4aa"],
                ].map(([l,v,c,isSmall])=>(
                  <Card key={l} style={{padding:"12px 14px"}}>
                    <p style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:.5,margin:"0 0 4px"}}>{l}</p>
                    <p style={{fontSize:isSmall?13:18,fontWeight:800,color:c,margin:0}}>{v}</p>
                  </Card>
                ))}
              </div>
              <Card style={{padding:0,overflow:"hidden"}}>
                <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <p style={{fontSize:13,fontWeight:700,color:"#f0f0f0",margin:0}}>Gasto por tag</p>
                  <button onClick={exportarTagsExcelReports}
                    style={{padding:"4px 12px",borderRadius:7,border:"1px solid rgba(167,139,250,.25)",background:"rgba(167,139,250,.07)",color:"#a78bfa",cursor:"pointer",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                    <Ic n="download" size={11} color="#a78bfa"/> Exportar Excel
                  </button>
                </div>
                {tagsOrdenados.slice(0,10).map(d=>{
                  const pct=d.gasto/maxTagGasto*100;
                  return (
                    <div key={d.tag} style={{padding:"9px 16px",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                        <span style={{fontSize:12,fontWeight:700,color:"#a78bfa"}}>#{d.tag}</span>
                        <div style={{display:"flex",gap:14,alignItems:"center"}}>
                          {d.ingreso>0&&<span style={{fontSize:11,color:"#00d4aa"}}>+{fmt(d.ingreso)}</span>}
                          {d.gasto>0&&<span style={{fontSize:12,fontWeight:700,color:"#ff6b7a"}}>{fmt(d.gasto)}</span>}
                          <span style={{fontSize:10,color:"#444"}}>{d.count} tx</span>
                        </div>
                      </div>
                      <div style={{height:5,borderRadius:4,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:4,width:`${pct.toFixed(1)}%`,background:"linear-gradient(90deg,#a78bfa,#7c3aed)",transition:"width .4s ease"}}/>
                      </div>
                    </div>
                  );
                })}
              </Card>
              <Card style={{padding:0,overflow:"hidden"}}>
                <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                  <p style={{fontSize:13,fontWeight:700,color:"#f0f0f0",margin:0}}>Tabla completa de tags</p>
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead>
                      <tr style={{background:"rgba(255,255,255,.03)"}}>
                        {["Tag","Gastos","Ingresos","Neto","Txs"].map(h=>(
                          <th key={h} style={{padding:"8px 16px",textAlign:h==="Tag"?"left":"right",fontSize:10,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.4,borderBottom:"1px solid rgba(255,255,255,.05)"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tagsOrdenados.map((d,i)=>(
                        <tr key={d.tag} onClick={()=>setTagSel(d.tag===tagSel?"":d.tag)}
                          style={{cursor:"pointer",background:tagSel===d.tag?"rgba(167,139,250,.08)":i%2===0?"transparent":"rgba(255,255,255,.015)",transition:"background .1s"}}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(167,139,250,.06)"}
                          onMouseLeave={e=>e.currentTarget.style.background=tagSel===d.tag?"rgba(167,139,250,.08)":i%2===0?"transparent":"rgba(255,255,255,.015)"}>
                          <td style={{padding:"9px 16px",fontWeight:700,color:"#a78bfa"}}>#{d.tag}</td>
                          <td style={{padding:"9px 16px",textAlign:"right",color:"#ff6b7a"}}>{d.gasto>0?fmt(d.gasto):"—"}</td>
                          <td style={{padding:"9px 16px",textAlign:"right",color:"#00d4aa"}}>{d.ingreso>0?fmt(d.ingreso):"—"}</td>
                          <td style={{padding:"9px 16px",textAlign:"right",fontWeight:700,color:d.neto>=0?"#00d4aa":"#ff4757"}}>{d.neto>=0?"+":""}{fmt(d.neto)}</td>
                          <td style={{padding:"9px 16px",textAlign:"right",color:"#555"}}>{d.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {tagSel&&<p style={{fontSize:10,color:"#555",padding:"6px 16px",margin:0,borderTop:"1px solid rgba(255,255,255,.04)"}}>Click en otra fila para cambiar · click de nuevo para cerrar ↓</p>}
              </Card>
              {tagSel&&(
                <Card style={{padding:0,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px 10px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <p style={{fontSize:13,fontWeight:700,color:"#a78bfa",margin:0}}>Evolución mensual · <span style={{fontWeight:800}}>#{tagSel}</span></p>
                    <button onClick={()=>setTagSel("")} style={{background:"none",border:"none",cursor:"pointer",color:"#555",fontSize:11}}>✕ cerrar</button>
                  </div>
                  <div style={{padding:"16px",display:"flex",gap:6,alignItems:"flex-end",height:130}}>
                    {evolucionTag.map((m,i)=>{
                      const hG=m.gasto>0?(m.gasto/maxEvo*90):0;
                      const hI=m.ingreso>0?(m.ingreso/maxEvo*90):0;
                      return (
                        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                          <div style={{display:"flex",gap:2,alignItems:"flex-end",height:100}}>
                            {m.gasto>0&&<div style={{width:10,height:`${hG}px`,background:"#ff4757",borderRadius:"3px 3px 0 0",transition:"height .4s"}} title={fmt(m.gasto)}/>}
                            {m.ingreso>0&&<div style={{width:10,height:`${hI}px`,background:"#00d4aa",borderRadius:"3px 3px 0 0",transition:"height .4s"}} title={fmt(m.ingreso)}/>}
                            {m.gasto===0&&m.ingreso===0&&<div style={{width:10,height:3,background:"rgba(255,255,255,.1)",borderRadius:3}}/>}
                          </div>
                          <span style={{fontSize:9,color:"#444"}}>{m.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{padding:"0 16px 12px",display:"flex",gap:14}}>
                    <span style={{fontSize:10,color:"#ff6b7a",display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#ff4757",display:"inline-block"}}/>Gasto</span>
                    <span style={{fontSize:10,color:"#00d4aa",display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#00d4aa",display:"inline-block"}}/>Ingreso</span>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};


export default Reports;
