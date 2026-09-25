"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, CalendarDays, CircleUserRound, Code2, LayoutGrid, LogOut, Menu, Scissors, Settings, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getSessionProfile, type SessionProfile } from "@/lib/auth/profile";

const baseNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: CircleUserRound },
  { href: "/procedimentos", label: "Procedimentos", icon: Scissors },
  { href: "/administracao", label: "Administração", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mountTimer = window.setTimeout(() => setMounted(true), 0);
    if (!window.localStorage.getItem("autoestima-clean-state-v1")) {
      ["autoestima-appointments", "autoestima-sales", "autoestima-clients", "autoestima-procedures"].forEach((key) => window.localStorage.removeItem(key));
      window.localStorage.setItem("autoestima-clean-state-v1", "true");
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setProfile(getSessionProfile(data.user?.email, data.user?.user_metadata?.display_name)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setProfile(getSessionProfile(session?.user.email, session?.user.user_metadata?.display_name)));
    return () => {
      window.clearTimeout(mountTimer);
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const updateClock = () => setCurrentTime(new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()));
    updateClock();
    const interval = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const activeProfile = profile ?? getSessionProfile(undefined);
  const navItems = activeProfile.role === "admin" ? [...baseNavItems, { href: "/devtools", label: "DevTools", icon: Code2 }] : baseNavItems;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  async function signOut() {
    await createClient().auth.signOut({ scope: "global" });
    router.replace("/login");
    router.refresh();
  }

  const navigation = navItems.map(({ href, label, icon: Icon }) => (
    <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition", isActive(href) ? "border-amber-300/40 bg-amber-300/10 text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]" : "border-transparent bg-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white")}>
      <Icon size={16} />
      <span>{label}</span>
    </Link>
  ));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1600px] gap-5 px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
        <aside className="glass-surface hidden w-72 shrink-0 rounded-[28px] p-5 lg:block">
          <div className="mb-8 flex items-center gap-3 px-2"><div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-300/10 text-amber-200"><Sparkles size={18} /></div><div><p className="text-[10px] uppercase tracking-[0.32em] text-white/45">Studio</p><h1 className="font-serif text-2xl tracking-[-0.06em] text-white">AUTOESTIMA</h1></div></div>
          <nav className="space-y-2">{navigation}</nav>
          <div className="mt-8 rounded-[24px] border border-white/10 bg-black/15 p-4"><p className="text-[10px] uppercase tracking-[0.26em] text-white/45">Sessão ativa</p><p className="mt-3 text-sm text-white/90">{mounted ? activeProfile.name : "Sessão"}</p><p className="mt-1 text-xs text-white/45">{mounted ? (activeProfile.role === "admin" ? "Developer" : "Proprietária") : "Verificando acesso"}</p><button type="button" onClick={signOut} className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/55 transition hover:text-amber-200"><LogOut size={13} /> Encerrar sessão</button></div>
        </aside>

        <div className="glass-surface flex-1 rounded-[28px]">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6"><div className="flex items-center gap-3"><button type="button" aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMobileMenuOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/15 text-white/70 transition hover:border-amber-300/40 hover:text-white lg:hidden">{mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}</button><div><p className="text-[10px] uppercase tracking-[0.32em] text-white/45">Autoestima</p><h2 className="text-lg font-medium text-white">Studio Vilma Storck</h2></div></div><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Agora</p><p className="font-mono text-sm text-amber-100">{mounted ? currentTime : "--:--:--"}</p></div><div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10 text-sm font-semibold text-amber-100">{mounted ? activeProfile.initials : "--"}</div><button type="button" onClick={signOut} aria-label="Encerrar sessão" className="hidden rounded-full border border-white/10 p-2 text-white/45 transition hover:border-rose-300/30 hover:text-rose-200 sm:block"><LogOut size={15} /></button></div></header>
          {mobileMenuOpen ? <nav id="mobile-navigation" className="border-b border-white/10 px-4 py-3 lg:hidden sm:px-6"><div className="grid gap-2 sm:grid-cols-2">{navigation}</div><button type="button" onClick={signOut} className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/55"><LogOut size={13} /> Encerrar sessão</button></nav> : null}
          <main className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-7 sm:py-8 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}