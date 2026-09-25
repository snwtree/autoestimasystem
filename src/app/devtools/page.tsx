"use client";

import { useState } from "react";
import type React from "react";
import { Code2, Database, Download, RefreshCw, ShieldCheck, Trash2, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export default function DevToolsPage() {
  const [message, setMessage] = useState("");
  const [backupPeriod, setBackupPeriod] = useState("weekly");

  function clearAgenda() {
    window.localStorage.removeItem("autoestima-appointments");
    setMessage("Dados locais da agenda removidos. Recarregue a agenda para restaurar os dados iniciais.");
  }

  function exportAppBackup() {
    const backup = {
      exportedAt: new Date().toISOString(),
      period: backupPeriod,
      appointments: JSON.parse(window.localStorage.getItem("autoestima-appointments") ?? "[]"),
      sales: JSON.parse(window.localStorage.getItem("autoestima-sales") ?? "[]"),
      clients: JSON.parse(window.localStorage.getItem("autoestima-clients") ?? "[]"),
      procedures: JSON.parse(window.localStorage.getItem("autoestima-procedures") ?? "[]"),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `autoestima-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Backup local exportado. O arquivo foi salvo fora do Supabase e pode ser restaurado nesta tela.");
  }

  function restoreAppBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result)) as Record<string, unknown>;
        const collections = ["appointments", "sales", "clients", "procedures"];
        if (!collections.every((key) => Array.isArray(backup[key]))) throw new Error("Formato inválido");
        collections.forEach((key) => window.localStorage.setItem(`autoestima-${key}`, JSON.stringify(backup[key])));
        setMessage("Backup restaurado localmente. Recarregue as telas para visualizar os dados.");
      } catch {
        setMessage("Não foi possível restaurar o arquivo. Selecione um backup JSON válido do Autoestima.");
      }
    };
    reader.readAsText(file, "utf-8");
    event.target.value = "";
  }

  return <AppShell><div className="space-y-6"><header><p className="text-xs uppercase tracking-[0.38em] text-amber-200/70">Área restrita · cargo dev</p><h1 className="mt-2 font-serif text-4xl tracking-[-0.06em] text-white">DevTools</h1><p className="mt-2 text-sm text-white/55">Ferramentas de manutenção e diagnóstico do ambiente.</p></header><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><div className="glass-surface rounded-[28px] p-5"><Code2 className="text-amber-200" size={21} /><h2 className="mt-4 text-lg text-white">Modo desenvolvimento</h2><p className="mt-2 text-sm text-white/60">Ferramentas avançadas habilitadas apenas para a sessão admin.</p></div><div className="glass-surface rounded-[28px] p-5"><Database className="text-sky-200" size={21} /><h2 className="mt-4 text-lg text-white">Backup de dados</h2><p className="mt-2 text-sm text-white/60">Exporte os dados do aplicativo e defina a periodicidade desejada.</p><select value={backupPeriod} onChange={(event) => setBackupPeriod(event.target.value)} className="mt-4 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white"><option value="daily">Diário</option><option value="weekly">Semanal</option><option value="monthly">Mensal</option></select><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-sky-300/30 px-4 py-2 text-sm text-sky-100 transition hover:bg-sky-300/10"><Upload size={15} /> Restaurar backup<input type="file" accept="application/json" className="hidden" onChange={restoreAppBackup} /></label><button type="button" onClick={exportAppBackup} className="mt-3 inline-flex items-center gap-2 rounded-full border border-sky-300/30 px-4 py-2 text-sm text-sky-100 transition hover:bg-sky-300/10"><Download size={15} /> Exportar backup</button><button type="button" onClick={clearAgenda} className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 transition hover:border-rose-300/40 hover:text-rose-200"><Trash2 size={15} /> Limpar agenda local</button></div><div className="glass-surface rounded-[28px] p-5"><ShieldCheck className="text-emerald-200" size={21} /><h2 className="mt-4 text-lg text-white">Sessão verificada</h2><p className="mt-2 text-sm text-white/60">Acesso concedido pelo perfil admin autenticado no Supabase.</p><button type="button" onClick={() => window.location.reload()} className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 transition hover:border-amber-300/40 hover:text-amber-100"><RefreshCw size={15} /> Atualizar diagnóstico</button></div></section>{message ? <p className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-200">{message}</p> : null}</div></AppShell>;
}
