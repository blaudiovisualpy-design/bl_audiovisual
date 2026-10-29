"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicNav, VideoPreview, type PublicData } from "@/components/PublicLanding";

type PageKind = "about" | "services" | "process" | "clients" | "work";

const pageCopy = {
  about: {
    eyebrow: "Quiénes somos",
    title: "Una mirada audiovisual para marcas, artistas y eventos",
  },
  services: {
    eyebrow: "Servicios",
    title: "Producción visual con dirección, cámara y postproducción",
  },
  process: {
    eyebrow: "Proceso",
    title: "De la idea a la realidad",
  },
  clients: {
    eyebrow: "Clientes",
    title: "Historias, campañas y piezas con identidad propia",
  },
  work: {
    eyebrow: "Portafolios",
    title: "Nuestros trabajos",
  },
} satisfies Record<PageKind, { eyebrow: string; title: string }>;

const activePage = {
  about: "about",
  services: "services",
  process: "process",
  clients: "contact",
  work: "portfolio",
} as const;

function PageHeader({
  data,
  page,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
}: {
  data: PublicData;
  page: PageKind;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
}) {
  const settings = data.settings;
  const heroPoster = settings?.heroPosterUrl || "/assets/generated/bl-cinematic-hero.png";

  return (
    <header className="relative grid min-h-[430px] overflow-hidden bg-[#101207] px-4 py-8 md:px-8">
      <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-52" src={heroPoster} />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,#101207_0%,rgba(16,18,7,.78)_32%,rgba(16,18,7,.42)_100%)]" />
      <PublicNav
        active={activePage[page]}
        locale="es"
        menuOpen={menuOpen}
        onCloseMenu={onCloseMenu}
        onToggleMenu={onToggleMenu}
        siteName={settings?.siteName}
        variant="static"
      />
      <div className="relative z-10 mt-auto max-w-3xl pb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FFE100]">{pageCopy[page].eyebrow}</p>
        <h1 className="display-title mt-4 text-4xl leading-[.98] text-white md:text-6xl">{pageCopy[page].title}</h1>
      </div>
    </header>
  );
}

export function PublicInnerPage({ data, page }: { data: PublicData; page: PageKind }) {
  const settings = data.settings;
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const heroPoster = settings?.heroPosterUrl || "/assets/generated/bl-cinematic-hero.png";

  return (
    <main className="min-h-screen bg-[#101207] text-[#F7F5EE]">
      <PageHeader
        data={data}
        menuOpen={menuOpen}
        onCloseMenu={() => setMenuOpen(false)}
        onToggleMenu={() => setMenuOpen((value) => !value)}
        page={page}
      />

      {page === "about" && (
        <section className="grid gap-8 px-4 py-16 md:grid-cols-[.8fr_1.2fr] md:px-8 md:py-20">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-white/38">BL Audiovisual</p>
          <div>
            <p className="max-w-3xl text-2xl leading-tight text-white/82 md:text-4xl">{settings?.aboutEs}</p>
            <Link className="focus-ring mt-8 inline-flex rounded-full bg-[#FFE100] px-6 py-4 text-xs font-black uppercase text-black" href="/#contacto">
              Contanos tu proyecto
            </Link>
          </div>
        </section>
      )}

      {page === "services" && (
        <section className="grid gap-4 px-4 py-16 md:grid-cols-3 md:px-8 md:py-20">
          {data.services.map((service) => (
            <article className="rounded-md border border-white/10 bg-white/[0.04] p-6" key={service.id}>
              <span className="mb-10 grid h-11 w-11 place-items-center rounded-full bg-[#FFE100]/18 text-[#FFE100]">▶</span>
              <h2 className="display-title text-2xl leading-none">{service.titleEs}</h2>
              <p className="mt-4 text-sm leading-6 text-white/62">{service.descriptionEs}</p>
            </article>
          ))}
        </section>
      )}

      {page === "process" && (
        <section className="grid gap-4 px-4 py-16 md:px-8 md:py-20">
          {data.processSteps.map((step, index) => (
            <article className="grid gap-4 rounded-md border border-white/10 bg-white/[0.04] p-6 md:grid-cols-[80px_1fr]" key={step.id}>
              <strong className="display-title text-4xl leading-none text-[#FFE100]">0{index + 1}</strong>
              <div>
                <h2 className="display-title text-2xl leading-none">{step.titleEs}</h2>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62">{step.descriptionEs}</p>
              </div>
            </article>
          ))}
        </section>
      )}

      {page === "clients" && (
        <section className="px-4 py-16 md:px-8 md:py-20">
          <div className="grid gap-3 md:grid-cols-4">
            {data.clients.map((client) => (
              <div className="rounded-md border border-white/10 p-6 text-center text-sm font-bold uppercase text-white/68" key={client.id}>
                {client.name}
              </div>
            ))}
          </div>
          {data.testimonials.map((item) => (
            <blockquote className="mt-8 max-w-3xl text-2xl leading-tight text-white/78" key={item.id}>
              “{item.quoteEs}”
              <footer className="mt-4 text-sm uppercase text-[#FFE100]">{item.author} / {item.company}</footer>
            </blockquote>
          ))}
        </section>
      )}

      {page === "work" && (
        <section className="grid gap-4 px-4 py-16 md:grid-cols-3 md:px-8 md:py-20">
          {data.projects.map((project) => (
            <VideoPreview
              active={activePreviewId === project.id}
              key={project.id}
              locale="es"
              onActivate={() => setActivePreviewId(project.id)}
              onDeactivate={() => setActivePreviewId((current) => (current === project.id ? null : current))}
              poster={heroPoster}
              project={project}
            />
          ))}
        </section>
      )}
    </main>
  );
}
