import { AppShell } from "@/components/app-shell";

export default function ClienteDetalhePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <p className="text-xs uppercase tracking-[0.38em] text-muted">Cliente</p>
          <h1 className="mt-2 font-serif text-4xl tracking-[-0.06em] text-white">Detalhes do cliente</h1>
        </header>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
            <h2 className="text-lg text-white">Informações</h2>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div className="rounded-2xl border border-white/10 bg-black/15 p-3">Nenhum cliente selecionado.</div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
            <h2 className="text-lg text-white">Histórico</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 px-5 py-10 text-center text-sm text-white/60">Nenhum histórico cadastrado.</div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
