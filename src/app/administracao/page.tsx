"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, BarChart3, Download, RotateCcw, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { deleteSale, listSales, subscribeToTable, unsubscribeFromTable, type SaleRecord } from "@/lib/supabase/data";

type Sale = SaleRecord;
type ChartType = "bars" | "donut" | "list";

export default function AdministracaoPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [message, setMessage] = useState("");
  const [chartType, setChartType] = useState<ChartType>("bars");
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const remoteSales = await listSales();
        if (active) setSales(remoteSales);
      } catch {
        const stored = window.localStorage.getItem("autoestima-sales");
        if (active && stored) setSales(JSON.parse(stored) as Sale[]);
      }
    };
    const channel = subscribeToTable("sales", () => { void load(); });
    void load();
    return () => { active = false; void unsubscribeFromTable(channel); };
  }, []);
  const total = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const metrics = [["Faturamento total", money(total)], ["Atendimentos", String(sales.length)], ["Ticket médio", sales.length ? money(total / sales.length) : money(0)], ["Vendas finalizadas", String(sales.length)]];

  async function reverseSale(sale: Sale) {
    await deleteSale(sale.id);
    setSales((current) => current.filter((item) => item.id !== sale.id));
    setMessage(`Venda de ${sale.client} revertida.`);
  }

  function exportCsv() {
    const rows = [["Cliente", "Procedimento", "Data", "Valor"], ...sales.map((sale) => [sale.client, sale.service, sale.date, sale.amount.toFixed(2)])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    link.download = "relatorio-autoestima.csv";
    link.click();
  }

  return <AppShell><div className="space-y-6"><header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs uppercase tracking-[0.38em] text-muted">Administração</p><h1 className="mt-2 font-serif text-4xl tracking-[-0.06em] text-white">Relatórios e faturamento</h1><p className="mt-2 text-sm text-white/55">Acompanhe, exporte e reverta vendas finalizadas.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 hover:bg-white/10"><Download size={15} /> CSV</button><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-sm text-amber-100 hover:bg-amber-300/20">PDF / imprimir</button></div></header><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="glass-surface rounded-[28px] p-5 transition duration-500 hover:-translate-y-1"><p className="text-[10px] uppercase tracking-[0.28em] text-muted">{label}</p><p className="mt-4 text-3xl font-semibold text-white">{value}</p></div>)}</section><section className="glass-surface rounded-[28px] p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><BarChart3 className="text-amber-200" size={20} /><h2 className="text-lg text-white">Visualização do relatório</h2></div><select value={chartType} onChange={(event) => setChartType(event.target.value as ChartType)} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white"><option value="bars">Barras</option><option value="donut">Resumo circular</option><option value="list">Lista detalhada</option></select></div>{chartType === "bars" ? <div className="mt-6 flex h-48 items-end gap-3 border-b border-white/10 px-2">{(sales.length ? sales : [{ id: "empty", amount: 2450, client: "Hoje", service: "", date: "" }]).slice(-8).map((sale) => <div key={sale.id} className="group flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-xl bg-gradient-to-t from-amber-500/30 to-amber-200/80 transition-all duration-700 group-hover:from-amber-400/60" style={{ height: `${Math.max(12, Math.min(100, (sale.amount / Math.max(total || 2450, sale.amount)) * 100))}%` }} /><span className="max-w-full truncate text-[10px] text-white/45">{sale.client}</span></div>)}</div> : null}{chartType === "donut" ? <div className="mt-6 flex min-h-48 items-center justify-center"><div className="flex h-40 w-40 items-center justify-center rounded-full border-[22px] border-amber-300/70 border-r-emerald-300/50 border-b-sky-300/50"><div className="text-center"><p className="text-xs text-white/50">Total</p><p className="font-semibold text-white">{money(total)}</p></div></div></div> : null}{chartType === "list" ? <div className="mt-6 space-y-2">{sales.map((sale) => <div key={sale.id} className="flex justify-between border-b border-white/10 py-3 text-sm"><span className="text-white/70">{sale.client} · {sale.service}</span><strong className="text-emerald-200">{money(sale.amount)}</strong></div>)}</div> : null}</section><section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]"><div className="glass-surface rounded-[28px] p-5"><div className="flex items-center justify-between"><h2 className="text-lg text-white">Vendas recentes</h2><TrendingUp size={18} className="text-emerald-200" /></div><div className="mt-4 space-y-3">{sales.length ? sales.slice().reverse().map((sale) => <div key={`${sale.id}-${sale.date}`} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-white">{sale.client}</p><p className="text-sm text-white/55">{sale.service} · {sale.date.split("-").reverse().join("/")}</p></div><div className="flex items-center justify-between gap-4"><strong className="text-emerald-200">{money(sale.amount)}</strong><button type="button" onClick={() => reverseSale(sale)} className="inline-flex items-center gap-2 rounded-full border border-rose-300/25 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-300/10"><RotateCcw size={14} /> Reverter</button></div></div>) : <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/55">Nenhuma venda registrada.</div>}</div></div><div className="glass-surface rounded-[28px] p-5"><h2 className="text-lg text-white">Atalhos</h2><Link href="/agenda" className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 p-4 text-sm text-white/75 transition hover:bg-white/10">Abrir agenda <ArrowUpRight size={16} /></Link></div></section>{message ? <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">{message}</p> : null}</div></AppShell>;
}