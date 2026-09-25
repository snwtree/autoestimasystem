"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShinyButton } from "@/components/ui/shiny-button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Informe o usuário e a senha para continuar.");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Email ou senha inválidos.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.15),transparent_32%),linear-gradient(135deg,#0a0a0a,#111111_56%,#171717)] px-4 py-10 text-foreground">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="mb-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.42em] text-white/50">Autoestima</p>
          <h1 className="mt-4 font-serif text-4xl tracking-[-0.06em] text-white">AUTOESTIMA</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-white/80">
              Usuário / Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-amber-400/60 focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-white/80">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-amber-400/60 focus:outline-none"
              placeholder="Sua senha"
            />
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <ShinyButton type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </ShinyButton>
        </form>

        <div className="mt-6 text-center text-xs uppercase tracking-[0.26em] text-white/40">
          <Link href="/" className="hover:text-white/70">Voltar</Link>
        </div>
      </div>
    </main>
  );
}
