"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { listAppointments } from "@/lib/supabase/appointments";
import { deleteClient, listClients, saveClient as saveRemoteClient, subscribeToTable, unsubscribeFromTable, type ClientRecord } from "@/lib/supabase/data";

type Client = ClientRecord;

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Array<{ client: string; date: string; time: string; service: string }>>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const remoteClients = await listClients();
        if (active) setClients(remoteClients);
      } catch {
        const stored = window.localStorage.getItem("autoestima-clients");
        if (active && stored) setClients(JSON.parse(stored) as Client[]);
      }
    };
    const channel = subscribeToTable("clients", () => { void load(); });
    void load();
    return () => { active = false; void unsubscribeFromTable(channel); };
  }, []);

  useEffect(() => {
    listAppointments().then(setAppointments).catch(() => {
      const stored = window.localStorage.getItem("autoestima-appointments");
      if (stored) setAppointments(JSON.parse(stored));
    });
  }, []);

  async function saveClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing?.name.trim() || !editing.phone.trim()) return;
    const saved = await saveRemoteClient({ name: editing.name.trim(), phone: editing.phone, email: editing.email }, editing.id === "new" ? undefined : editing.id);
    setClients((current) => editing.id === "new" ? [...current, saved] : current.map((item) => item.id === saved.id ? saved : item));
    setEditing(null);
  }

  async function removeClient(id: string) {
    await deleteClient(id);
    setClients((current) => current.filter((item) => item.id !== id));
  }

  const filtered = clients.filter((client) => `${client.name} ${client.email} ${client.phone}`.toLowerCase().includes(query.toLowerCase()));

  return <AppShell><div className="space-y-6"><header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs uppercase tracking-[0.38em] text-muted">Clientes</p><h1 className="mt-2 font-serif text-4xl tracking-[-0.06em] text-white">Relacionamento</h1><p className="mt-2 text-sm text-white/55">Mantenha os dados das clientes sempre acessÃ­veis.</p></div><button type="button" onClick={() => setEditing({ id: "new", name: "", phone: "", email: "" })} className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-300/15 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/25"><Plus size={16} /> Novo cliente</button></header><div className="glass-surface flex items-center gap-3 rounded-2xl px-4 py-3"><Search size={17} className="text-white/45" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar por nome, telefone ou email..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40" /></div><div className="grid gap-4">{filtered.map((client) => { const recent = appointments.filter((item) => item.client.toLowerCase() === client.name.toLowerCase()).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))[0]; return <article key={client.id} className="glass-surface rounded-[28px] p-5 transition duration-500 hover:-translate-y-1"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-medium text-white">{client.name}</h2><p className="mt-2 text-sm text-white/70">{client.phone}</p><p className="text-sm text-white/60">{client.email || "Sem email cadastrado"}</p></div><div className="rounded-2xl border border-white/10 bg-black/15 p-3 text-sm text-white/70"><p className="text-[10px] uppercase tracking-[0.24em] text-muted">Agendamento mais recente</p><p className="mt-2">{recent ? `${recent.date.split("-").reverse().join("/")} Â· ${recent.time}` : "Nenhum agendamento"}</p><p className="text-white/60">{recent?.service || "Cadastre pela agenda"}</p></div><div className="flex gap-2"><button type="button" onClick={() => setEditing(client)} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/10"><Pencil size={14} /> Editar</button><button type="button" onClick={() => void removeClient(client.id)} aria-label={`Excluir ${client.name}`} className="rounded-full border border-rose-300/20 p-2 text-rose-200/70 hover:bg-rose-300/10"><Trash2 size={14} /></button></div></div></article>; })}{filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-white/55">Nenhuma cliente encontrada.</div> : null}</div></div>{editing ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"><form onSubmit={saveClient} className="w-full max-w-md rounded-[28px] border border-white/15 bg-[#17130d]/95 p-6 shadow-2xl"><div className="flex justify-between"><div><p className="text-xs uppercase tracking-[0.28em] text-amber-200/70">Cadastro</p><h2 className="mt-2 text-2xl text-white">{editing.id === "new" ? "Nova cliente" : "Editar cliente"}</h2></div><button type="button" onClick={() => setEditing(null)} aria-label="Fechar" className="p-2 text-white/50"><X size={18} /></button></div><div className="mt-6 space-y-4"><label className="block text-sm text-white/75">Nome<input required value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-white" /></label><label className="block text-sm text-white/75">Telefone<input required value={editing.phone} onChange={(event) => setEditing({ ...editing, phone: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-white" /></label><label className="block text-sm text-white/75">Email<input type="email" value={editing.email} onChange={(event) => setEditing({ ...editing, email: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-white" /></label></div><button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-300 px-4 py-3 font-semibold text-[#17130d]"><Check size={16} /> Salvar cliente</button></form></div> : null}</AppShell>;
}
