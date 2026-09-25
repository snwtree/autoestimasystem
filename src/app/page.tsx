import { ShinyButton } from "@/components/ui/shiny-button";

export default function Home() {
  return (
    <main className="welcome-gradient relative min-h-screen overflow-hidden text-white">
      <div className="welcome-light welcome-light-blue" aria-hidden="true" />
      <div className="welcome-light welcome-light-magenta" aria-hidden="true" />
      <div className="welcome-light welcome-light-gold" aria-hidden="true" />
      <div className="relative z-10 mx-auto min-h-screen max-w-[1600px] px-5 py-6 sm:px-8 lg:px-10">
        <header className="welcome-text-shadow absolute inset-x-5 top-6 flex items-center justify-between text-[10px] uppercase tracking-[0.42em] text-white/60 sm:inset-x-8 lg:inset-x-10">
          <span>Studio Vilma Storck</span>
          <span className="sr-only">Tela de boas-vindas</span>
        </header>

        <div className="absolute inset-0 flex items-center justify-center px-4 pt-4">
          <div className="welcome-mockup absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="welcome-mockup-image h-[min(44vh,427px)] w-[min(54vw,673px)] bg-[url('/mockups.png')] bg-contain bg-center bg-no-repeat opacity-80" />
          </div>

          <div className="relative z-20 mx-auto w-full max-w-[calc(100vw-2rem)] text-center sm:max-w-[calc(100vw-4rem)]">
            <p className="welcome-text-shadow mb-5 text-[11px] uppercase tracking-[0.38em] text-white/65 sm:text-xs">
              @studio.vilmastorck no instagram
            </p>

            <h1 className="welcome-text-shadow hero-title font-script leading-[0.72] tracking-normal text-white">
              autoestima
            </h1>
            <div className="hero-divider mx-auto mt-5" aria-hidden="true" />
            <p className="welcome-text-shadow mx-auto mt-6 max-w-[760px] text-[0.85rem] text-white/75 sm:text-[0.956rem] md:text-[1.0625rem]">
              Sistema Studio Vilma Storck para gestão sofisticada de agenda, clientes,
              procedimentos e faturamento.
            </p>

            <div className="mt-8 flex justify-center">
              <ShinyButton href="/login" className="welcome-text-shadow liquid-glass px-9 py-3.5 text-sm uppercase tracking-[0.12em]">
                Explorar dashboard
              </ShinyButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
