"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { useTheme } from "next-themes";
import { Check, KeyRound, Moon, Pencil, Sun, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setName(data.user?.user_metadata?.display_name ?? ""));
  }, []);

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!name.trim()) return setError("Informe um nome válido.");
    setIsSaving(true);
    const { error: updateError } = await createClient().auth.updateUser({ data: { display_name: name.trim() } });
    setIsSaving(false);
    if (updateError) return setError("Não foi possível atualizar o nome.");
    setMessage("Nome atualizado com sucesso.");
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (password.length < 8) return setError("A nova senha precisa ter pelo menos 8 caracteres.");
    if (password !== confirmation) return setError("As senhas não coincidem.");
    setIsSaving(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    setIsSaving(false);
    if (updateError) return setError("Não foi possível atualizar a senha agora.");
    setPassword("");
    setConfirmation("");
    setMessage("Senha atualizada com sucesso.");
  }

  return <AppShell><div className="space-y-6"><header><p className="text-xs uppercase tracking-[0.38em] text-muted">Configurações</p><h1 className="mt-2 font-serif text-4xl tracking-[-0.06em] text-white">Preferências e segurança</h1></header><div className="grid gap-4 lg:grid-cols-2"><section className="glass-surface rounded-[28px] p-5"><div className="flex items-center gap-3"><UserRound size={19} className="text-amber-200" /><h2 className="text-lg text-white">Nome de exibição</h2></div><form onSubmit={updateProfile} className="mt-5 flex gap-3"><input required value={name} onChange={(event) => setName(event.target.value)} className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-amber-300/60" placeholder="Como deseja ser chamado" /><button disabled={isSaving} type="submit" aria-label="Salvar nome" className="rounded-2xl border border-amber-300/40 bg-amber-300/15 px-4 text-amber-100 transition hover:bg-amber-300/25"><Pencil size={17} /></button></form></section><section className="glass-surface rounded-[28px] p-5"><div className="flex items-center gap-3"><KeyRound size={19} className="text-amber-200" /><h2 className="text-lg text-white">Trocar senha</h2></div><form onSubmit={changePassword} className="mt-5 space-y-3"><input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-amber-300/60" placeholder="Nova senha · mínimo 8 caracteres" /><input required minLength={8} type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-amber-300/60" placeholder="Confirmar nova senha" /><button disabled={isSaving} type="submit" className="rounded-full border border-amber-300/40 bg-amber-300/15 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/25">Atualizar senha</button></form></section><section className="glass-surface rounded-[28px] p-5 lg:col-span-2"><h2 className="text-lg text-white">Aparência</h2><div className="mt-5 grid max-w-xl grid-cols-2 gap-3"><button type="button" onClick={() => setTheme("dark")} className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm transition ${theme === "dark" ? "border-amber-300/50 bg-amber-300/15 text-amber-100" : "border-white/10 bg-black/15 text-white/60 hover:bg-white/10"}`}><Moon size={17} /> Modo escuro</button><button type="button" onClick={() => setTheme("light")} className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm transition ${theme === "light" ? "border-amber-300/50 bg-amber-300/15 text-amber-100" : "border-white/10 bg-black/15 text-white/60 hover:bg-white/10"}`}><Sun size={17} /> Modo claro</button></div></section></div>{error ? <p className="text-sm text-rose-300">{error}</p> : null}{message ? <p className="flex items-center gap-2 text-sm text-emerald-300"><Check size={15} /> {message}</p> : null}</div></AppShell>;
}