"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";
import { getSessionProfile } from "@/lib/auth/profile";

export default function DashboardPage() {
  const [name, setName] = useState("Usuário");
  const [greeting, setGreeting] = useState("Bom dia");
  const [dateLabel, setDateLabel] = useState("");
  const [sales, setSales] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState<Array<{ time: string; client: string; service: string; status: string }>>([]);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setName(getSessionProfile(data.user?.email, data.user?.user_metadata?.display_name).name));
    const update = () => {
      const now = new Date();
      setGreeting(now.getHours() < 12 ? "Bom dia" : now.getHours() < 18 ? "Boa tarde" : "Boa noite");
      setDateLabel(new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(now));
      try {
        const storedAppointments = JSON.parse(window.localStorage.getItem("autoestima-appointments") ?? "[]") as Array<{ date: string; time: string; client: string; service: string; status: string }>;
        setTodayAppointments(storedAppointments.filter((item) => item.date === now.toISOString().slice(0, 10)).sort((a, b) => a.time.localeCompare(b.time)));
      } catch {
        setTodayAppointments([]);
      }
    };
    update();
    const timer = window.setInterval(update, 60000);
    const salesTimer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem("autoestima-sales");
        setSales(stored ? (JSON.parse(stored) as Array<{ amount: number }>).reduce((total, sale) => total + sale.amount, 0) : 0);
      } catch {
        setSales(0);
      }
    }, 0);
    return () => { window.clearInterval(timer); window.clearTimeout(salesTimer); };
  }, []);

  const stats = [
    ["Agendamentos hoje", String(todayAppointments.length), ""],
    ["Atendimentos concluídos", String(todayAppointments.filter((item) => item.status === "concluído").length), ""],
    ["Faturamento hoje", sales ? `R$ ${sales.toFixed(2).replace(".", ",")}` : "R$ 0,00", ""],
    ["Próximo atendimento", todayAppointments[0]?.time ?? "--:--", todayAppointments[0]?.client ?? "Nenhum agendado"],
  ];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl space-y-7 sm:space-y-8">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0"><p className="text-xs uppercase tracking-[0.3em] text-muted sm:tracking-[0.38em]">{greeting}, {name}.</p><h1 className="mt-2 font-serif text-3xl tracking-[-0.04em] capitalize sm:text-4xl sm:tracking-[-0.06em]">{dateLabel || "Seu dia em foco"}</h1></div>
          <Link href="/agenda" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-5 py-3 text-sm text-amber-100 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-amber-300/20 md:w-auto">Ver agenda do dia <ArrowUpRight size={16} /></Link>
        </header>

        <section className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, value, change]) => <div key={label} className="glass-surface rounded-[26px] p-4 sm:p-5"><p className="text-[11px] uppercase tracking-[0.2em] text-muted sm:text-xs sm:tracking-[0.28em]">{label}</p><div className="mt-4 flex items-end justify-between gap-3"><span className="text-2xl font-semibold text-white sm:text-3xl">{value}</span><span className="text-xs text-emerald-300">{change}</span></div></div>)}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="glass-surface rounded-[30px] p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-medium text-white sm:text-xl">Agenda do dia</h2><CalendarDays size={18} className="shrink-0 text-amber-200" /></div><div className="space-y-3">{todayAppointments.length ? todayAppointments.map((item) => <div key={`${item.time}-${item.client}`} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/15 px-4 py-3 transition hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-xs uppercase tracking-[0.28em] text-muted">{item.time}</p><p className="mt-2 truncate text-base text-white sm:text-lg">{item.client}</p><p className="truncate text-sm text-white/65">{item.service}</p></div><span className="self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60 sm:self-auto">{item.status}</span></div>) : <div className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-muted">Nenhum atendimento agendado para hoje.</div>}</div></div>
          <div className="glass-surface rounded-[30px] p-4 sm:p-5"><h2 className="text-lg font-medium text-white sm:text-xl">Resumo</h2><div className="mt-5 space-y-4 text-sm"><div className="rounded-2xl border border-white/10 bg-black/15 p-4"><Sparkles size={18} className="text-amber-200" /><p className="mt-3 text-xs uppercase tracking-[0.24em] text-muted">Próximo procedimento</p><p className="mt-2 text-lg text-white">{todayAppointments[0]?.service ?? "Nenhum definido"}</p><p className="text-white/60">{todayAppointments[0] ? `${todayAppointments[0].client} · ${todayAppointments[0].time}` : "Cadastre um horário na agenda"}</p></div><div className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className="text-xs uppercase tracking-[0.24em] text-muted">Dados do período</p><p className="mt-2 text-lg text-white">{sales ? "Dados cadastrados" : "Nenhuma venda"}</p><p className="text-white/60">Sem métricas fictícias</p></div></div></div>
        </section>
      </div>
    </AppShell>
  );
}