"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";

type Procedure = { id: string; name: string; price?: number };

export default function ProcedimentosPage() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Procedure | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("autoestima-procedures");
    const loadTimer = window.setTimeout(() => {
      if (stored) setProcedures(JSON.parse(stored) as Procedure[]);
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, []);

  function persist(next: Procedure[]) {
    setProcedures(next);
    if (loaded) window.localStorage.setItem("autoestima-procedures", JSON.stringify(next));
  }

  function saveProcedure(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing?.name.trim()) return;
    const exists = procedures.some((item) => item.id === editing.id);
    persist(exists ? procedures.map((item) => item.id === editing.id ? { ...editing, name: editing.name.trim() } : item) : [...procedures, { ...editing, id: crypto.randomUUID(), name: editing.name.trim() }]);
    setEditing(null);
  }

  const filtered = procedures.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  const money = (value?: number) => value ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "NÃ£o informado";

  return <AppShell><div className="space-y-6"><header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs uppercase tracking-[0.38em] text-muted">Procedimentos</p><h1 className="mt-2 font-serif text-4xl tracking-[-0.06em] text-white">ServiÃ§os do studio</h1><p className="mt-2 text-sm text-white/55">Cadastre os serviÃ§os e, se quiser, informe o preÃ§o.</p></div><button type="button" onClick={() => setEditing({ id: "new", name: "", price: undefined })} className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-300/15 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/25"><Plus size={16} /> Novo procedimento</button></header><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar procedimento..." className="glass-surface w-full rounded-2xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-amber-300/50" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((procedure) => <article key={procedure.id} className="glass-surface rounded-[28px] p-5 transition duration-500 hover:-translate-y-1"><p className="text-[10px] uppercase tracking-[0.28em] text-muted">ServiÃ§o</p><h2 className="mt-3 text-2xl font-medium text-white">{procedure.name}</h2><div className="mt-5 space-y-3 text-sm text-white/70"><div className="flex justify-between"><span>PreÃ§o</span><strong className="text-white">{money(procedure.price)}</strong></div></div><div className="mt-5 flex gap-2 border-t border-white/10 pt-4"><button type="button" onClick={() => setEditing(procedure)} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/10"><Pencil size={14} /> Editar</button><button type="button" onClick={() => persist(procedures.filter((item) => item.id !== procedure.id))} className="rounded-full border border-rose-300/20 p-2 text-rose-200/70 hover:bg-rose-300/10" aria-label={`Excluir ${procedure.name}`}><Trash2 size={14} /></button></div></article>)}</div></div>{editing ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"><form onSubmit={saveProcedure} className="w-full max-w-md rounded-[28px] border border-white/15 bg-[#17130d]/95 p-6 shadow-2xl"><div className="flex justify-between"><div><p className="text-xs uppercase tracking-[0.28em] text-amber-200/70">Cadastro</p><h2 className="mt-2 text-2xl text-white">{editing.id === "new" ? "Novo procedimento" : "Editar procedimento"}</h2></div><button type="button" onClick={() => setEditing(null)} aria-label="Fechar" className="p-2 text-white/50"><X size={18} /></button></div><div className="mt-6 space-y-4"><label className="block text-sm text-white/75">Nome<input required value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-white" /></label><div className="grid grid-cols-2 gap-3"><label className="block text-sm text-white/75">PreÃ§o<input required type="number" min="0.01" step="0.01" value={editing.price || ""} onChange={(event) => setEditing({ ...editing, price: event.target.value ? Number(event.target.value) : undefined })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-white" /></label></div></div><button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-300 px-4 py-3 font-semibold text-[#17130d]"><Check size={16} /> Salvar procedimento</button></form></div> : null}</AppShell>;
}




