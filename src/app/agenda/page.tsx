"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, Clock3, Plus, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { insertAppointment, listAppointments, removeAppointment, subscribeToAppointments, unsubscribeFromAppointments, updateAppointmentStatus } from "@/lib/supabase/appointments";
import { saveSale } from "@/lib/supabase/data";

type AppointmentStatus = "agendado" | "confirmado" | "em andamento" | "concluido";
type Appointment = { id: string; date: string; time: string; client: string; service: string; status: AppointmentStatus };

const today = new Date().toISOString().slice(0, 10);
const statusStyles: Record<AppointmentStatus, string> = {
  agendado: "border-white/10 bg-white/5 text-white/65",
  confirmado: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  "em andamento": "border-amber-400/30 bg-amber-400/10 text-amber-200",
  concluido: "border-sky-400/30 bg-sky-400/10 text-sky-200",
};

function readList<T>(key: string): T[] {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T[] : [];
  } catch {
    return [];
  }
}

export default function AgendaPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState(today);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleAppointment, setSaleAppointment] = useState<Appointment | null>(null);
  const [saleAmount, setSaleAmount] = useState("");
  const [formWarning, setFormWarning] = useState("");
  const [form, setForm] = useState({ time: "10:00", client: "", service: "", status: "agendado" as AppointmentStatus });
  const [appointmentsLoaded, setAppointmentsLoaded] = useState(false);
  const [clientNames, setClientNames] = useState<string[]>([]);
  const [procedureNames, setProcedureNames] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadAppointments = async () => {
      try {
        const remoteAppointments = await listAppointments();
        if (mounted) setAppointments(remoteAppointments);
      } catch {
        if (mounted) setAppointments(readList<Appointment>("autoestima-appointments"));
      }
      if (mounted) setAppointmentsLoaded(true);
    };
    const channel = subscribeToAppointments(() => { void loadAppointments(); });
    const timer = window.setTimeout(() => {
      void loadAppointments();
      setAppointmentsLoaded(true);
      setClientNames(readList<{ name: string }>("autoestima-clients").map((item) => item.name));
      setProcedureNames(readList<{ name: string }>("autoestima-procedures").map((item) => item.name));
    }, 0);
    return () => {
      mounted = false;
      window.clearTimeout(timer);
      void unsubscribeFromAppointments(channel);
    };
  }, []);

  useEffect(() => {
    if (appointmentsLoaded) window.localStorage.setItem("autoestima-appointments", JSON.stringify(appointments));
  }, [appointments, appointmentsLoaded]);

  const visibleAppointments = useMemo(() => appointments
    .filter((item) => view === "week" || item.date === selectedDate)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)), [appointments, selectedDate, view]);
  const normalizedClient = form.client.trim().toLowerCase();
  const normalizedProcedure = form.service.trim().toLowerCase();
  const clientExists = !normalizedClient || clientNames.some((name) => name.toLowerCase() === normalizedClient);
  const procedureExists = !normalizedProcedure || procedureNames.some((name) => name.toLowerCase() === normalizedProcedure);
  const clientSuggestions = clientNames.filter((name) => name.toLowerCase().includes(normalizedClient));
  const procedureSuggestions = procedureNames.filter((name) => name.toLowerCase().includes(normalizedProcedure));

  function openNewAppointment() {
    setForm({ time: "10:00", client: "", service: "", status: "agendado" });
    setFormWarning("");
    setIsModalOpen(true);
  }

  async function createAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.client.trim() || !form.service.trim()) return;
    if (!clientExists || !procedureExists) setFormWarning(`${!clientExists ? "Cliente não cadastrada" : "Cliente cadastrada"}${!clientExists && !procedureExists ? " e " : ""}${!procedureExists ? "procedimento não cadastrado" : ""}. O horário será salvo mesmo assim.`);
    try {
      await insertAppointment({ date: selectedDate, ...form, client: form.client.trim(), service: form.service.trim() });
    } catch {
      setFormWarning("Não foi possível salvar no banco compartilhado. Verifique o schema e as políticas do Supabase.");
      return;
    }
    setIsModalOpen(false);
  }

  async function cycleStatus(id: string) {
    const statuses: AppointmentStatus[] = ["agendado", "confirmado", "em andamento"];
    const appointment = appointments.find((item) => item.id === id);
    if (!appointment) return;
    try {
      await updateAppointmentStatus(id, statuses[(statuses.indexOf(appointment.status) + 1) % statuses.length]);
    } catch {
      setFormWarning("Não foi possível atualizar este atendimento no banco compartilhado.");
    }
  }

  async function finalizeAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(saleAmount.replace(",", "."));
    if (!saleAppointment || !Number.isFinite(amount) || amount <= 0) return;
    try {
      await saveSale({ appointment_id: saleAppointment.id, amount, client: saleAppointment.client, service: saleAppointment.service, date: saleAppointment.date });
    } catch {
      setFormWarning("Não foi possível registrar a venda no banco compartilhado.");
      return;
    }
    try {
      await removeAppointment(saleAppointment.id);
    } catch {
      setFormWarning("Não foi possível concluir o atendimento no banco compartilhado.");
      return;
    }
    setSaleAppointment(null);
    setSaleAmount("");
    router.push("/administracao");
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {formWarning ? <p role="status" className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">{formWarning}</p> : null}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs uppercase tracking-[0.38em] text-muted">Agenda</p><h1 className="mt-2 font-serif text-4xl tracking-[-0.06em]">Organize o seu dia</h1><p className="mt-2 text-sm text-white/55">{visibleAppointments.length} atendimento(s) na visualização atual</p></div><div className="flex flex-wrap gap-2"><div className="flex rounded-full border border-white/10 bg-black/15 p-1 text-sm"><button type="button" onClick={() => setView("day")} className={`rounded-full px-4 py-2 transition ${view === "day" ? "bg-white/10 text-white" : "text-white/55"}`}>Dia</button><button type="button" onClick={() => setView("week")} className={`rounded-full px-4 py-2 transition ${view === "week" ? "bg-white/10 text-white" : "text-white/55"}`}>Semana</button></div><button type="button" onClick={openNewAppointment} className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-300/15 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-300/25"><Plus size={16} /> Novo horário</button></div></header>
        <section className="grid gap-4 xl:grid-cols-[0.85fr_1.5fr]"><aside className="rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl"><div className="flex items-center justify-between"><h2 className="text-lg text-white">Data selecionada</h2><CalendarDays size={18} className="text-amber-200" /></div><input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-amber-300/60" /><div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4"><p className="text-xs uppercase tracking-[0.24em] text-amber-200/65">Resumo do dia</p><p className="mt-2 text-3xl font-semibold text-white">{appointments.filter((item) => item.date === selectedDate).length}</p><p className="text-sm text-white/60">atendimentos marcados</p></div></aside><div className="rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.24em] text-white/40">{view === "day" ? "Agenda do dia" : "Todos os horários"}</p><h2 className="mt-1 text-xl text-white">{selectedDate.split("-").reverse().join("/")}</h2></div><Clock3 size={20} className="text-white/45" /></div><div className="space-y-3">{visibleAppointments.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 px-5 py-12 text-center"><p className="text-white/75">Nenhum horário nesta data.</p><button type="button" onClick={openNewAppointment} className="mt-3 text-sm text-amber-200 underline-offset-4 hover:underline">Adicionar primeiro atendimento</button></div> : visibleAppointments.map((item) => <article key={item.id} className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/15 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><div className="min-w-16 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-amber-100">{item.time}</div><div><p className="text-lg text-white">{item.client}</p><p className="text-sm text-white/60">{item.service}{view === "week" ? ` · ${item.date.split("-").reverse().join("/")}` : ""}</p></div></div><div className="flex items-center gap-2"><button type="button" onClick={() => cycleStatus(item.id)} className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] transition ${statusStyles[item.status]}`}>{item.status}</button>{item.status !== "concluido" ? <button type="button" onClick={() => setSaleAppointment(item)} className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-200">Finalizar</button> : null}<button type="button" onClick={() => setAppointments((current) => current.filter((entry) => entry.id !== item.id))} aria-label={`Excluir atendimento de ${item.client}`} className="rounded-full p-2 text-white/35 hover:text-rose-200"><Trash2 size={15} /></button></div></article>)}</div></div></section>
      </div>

      {isModalOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="new-appointment-title"><form onSubmit={createAppointment} className="w-full max-w-md rounded-[28px] border border-white/15 bg-[#17130d]/95 p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-[0.28em] text-amber-200/60">Novo atendimento</p><h2 id="new-appointment-title" className="mt-2 text-2xl text-white">Adicionar à agenda</h2></div><button type="button" onClick={() => setIsModalOpen(false)} aria-label="Fechar formulário" className="rounded-full p-2 text-white/50 hover:text-white"><X size={18} /></button></div><div className="mt-6 space-y-4"><label className="block text-sm text-white/75">Cliente<input required list="client-suggestions" value={form.client} onChange={(event) => setForm({ ...form, client: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-white outline-none focus:border-amber-300/60" placeholder="Digite para buscar uma cliente" /><datalist id="client-suggestions">{clientSuggestions.map((name) => <option key={name} value={name} />)}</datalist></label><label className="block text-sm text-white/75">Procedimento<input required list="procedure-suggestions" value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-white outline-none focus:border-amber-300/60" placeholder="Digite para buscar um procedimento" /><datalist id="procedure-suggestions">{procedureSuggestions.map((name) => <option key={name} value={name} />)}</datalist></label><div className="grid grid-cols-2 gap-3"><label className="block text-sm text-white/75">Horário<input required type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-white outline-none focus:border-amber-300/60" /></label><label className="block text-sm text-white/75">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AppointmentStatus })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-white"><option value="agendado">Agendado</option><option value="confirmado">Confirmado</option><option value="em andamento">Em andamento</option></select></label></div></div><button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-300 px-4 py-3 text-sm font-semibold text-[#241b0b] hover:bg-amber-200"><Check size={16} /> Salvar horário</button></form></div> : null}
      {saleAppointment ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="sale-title"><form onSubmit={finalizeAppointment} className="w-full max-w-md rounded-[28px] border border-white/15 bg-[#17130d]/95 p-6 shadow-2xl"><div className="flex items-start justify-between gap-3"><h2 id="sale-title" className="text-2xl text-white">Finalizar atendimento</h2><button type="button" onClick={() => setSaleAppointment(null)} aria-label="Fechar venda" className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white"><X size={18} /></button></div><p className="mt-1 text-sm text-white/55">{saleAppointment.client} · {saleAppointment.service}</p><label className="mt-6 block text-sm text-white/75">Valor total<input required min="0.01" step="0.01" type="number" value={saleAmount} onChange={(event) => setSaleAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-white" /></label><button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-300 px-4 py-3 text-sm font-semibold text-[#10251d]"><Check size={16} /> Confirmar venda</button></form></div> : null}
    </AppShell>
  );
}


