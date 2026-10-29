"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Locale = "es" | "en";
export type PublicData = {
  settings: {
    siteName: string;
    heroEyebrowEs: string;
    heroEyebrowEn: string;
    heroTitle: string;
    heroTextEs: string;
    heroTextEn: string;
    aboutEs: string;
    aboutEn: string;
    email: string;
    phone: string;
    whatsapp: string;
    instagram: string | null;
    youtube: string | null;
    locationEs: string;
    locationEn: string;
    heroPosterUrl: string | null;
  } | null;
  categories: Array<{ id: string; slug: string; nameEs: string; nameEn: string }>;
  projects: Array<{
    id: string;
    titleEs: string;
    titleEn: string;
    descriptionEs: string;
    descriptionEn: string;
    client: string;
    year: number;
    videoUrl: string;
    posterUrl: string | null;
    featured: boolean;
    category: { nameEs: string; nameEn: string; slug: string };
  }>;
  services: Array<{ id: string; titleEs: string; titleEn: string; descriptionEs: string; descriptionEn: string }>;
  processSteps: Array<{ id: string; titleEs: string; titleEn: string; descriptionEs: string; descriptionEn: string }>;
  clients: Array<{ id: string; name: string }>;
  testimonials: Array<{ id: string; author: string; role: string; company: string; quoteEs: string; quoteEn: string }>;
};

export const labels = {
  es: {
    nav: [
      ["Inicio", "/"],
      ["Portfolio", "/#portfolio"],
      ["Quiénes somos", "/quienes-somos"],
      ["Servicios", "/servicios"],
      ["Proceso", "/proceso"],
      ["Contacto", "/#contacto"],
    ],
    reel: "Ver reel completo",
    project: "Ver proyecto",
    work: "Nuestros trabajos",
    process: "De la idea a la realidad",
    contact: "Contanos tu proyecto",
    send: "Enviar consulta",
    success: "Consulta enviada. Te responderemos pronto.",
    error: "No se pudo enviar. Revisa los datos.",
    name: "Nombre",
    email: "Email",
    service: "Tipo de proyecto",
    message: "Mensaje",
    close: "Cerrar",
    prev: "Anterior",
    next: "Siguiente",
  },
  en: {
    nav: [
      ["Home", "/"],
      ["Portfolio", "/#portfolio"],
      ["About us", "/quienes-somos"],
      ["Services", "/servicios"],
      ["Process", "/proceso"],
      ["Contact", "/#contacto"],
    ],
    reel: "Watch full reel",
    project: "View project",
    work: "Selected work",
    process: "From idea to screen",
    contact: "Tell us about your project",
    send: "Send inquiry",
    success: "Inquiry sent. We will reply soon.",
    error: "Could not send. Check the fields.",
    name: "Name",
    email: "Email",
    service: "Project type",
    message: "Message",
    close: "Close",
    prev: "Previous",
    next: "Next",
  },
} satisfies Record<Locale, Record<string, string | string[][]>>;

function youtubeId(url: string) {
  return url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]+)/)?.[1] || null;
}

function videoEmbedWithAudio(url: string, audioEnabled: boolean) {
  const id = youtubeId(url);
  if (!id) return url;
  const mute = audioEnabled ? "0" : "1";
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=${mute}&playsinline=1&controls=1&rel=0&modestbranding=1`;
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function socialLabel(kind: "instagram" | "youtube" | "whatsapp") {
  return kind === "instagram" ? "Instagram" : kind === "youtube" ? "YouTube" : "WhatsApp";
}

function SocialIcon({ kind }: { kind: "instagram" | "youtube" | "whatsapp" }) {
  if (kind === "youtube") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path d="M22 8.4a3 3 0 0 0-2.1-2.1C18 5.8 12 5.8 12 5.8s-6 0-7.9.5A3 3 0 0 0 2 8.4 31 31 0 0 0 1.5 12c0 1.2.1 2.4.5 3.6a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.4-1.2.5-2.4.5-3.6s-.1-2.4-.5-3.6Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="m10 9.4 5 2.6-5 2.6V9.4Z" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "whatsapp") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path d="M5.2 19.1 6 16.2a7.7 7.7 0 1 1 2.8 2.7l-3.6.2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M9.1 8.8c.2-.5.5-.5.8-.5h.6c.2 0 .4.1.5.4l.8 1.9c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.3 0 .6.5.8 1.2 1.5 2.1 2 .3.2.5.2.7-.1l.6-.8c.2-.2.4-.3.7-.2l1.8.8c.3.1.4.4.4.7 0 .7-.5 1.5-1.1 1.8-.7.3-2 .3-4.2-.9-2.5-1.4-4.1-3.7-4.3-5.4-.2-.7.2-1.2.7-1.5Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <rect height="16" rx="5" stroke="currentColor" strokeWidth="1.8" width="16" x="4" y="4" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.9" cy="7.2" fill="currentColor" r="1" />
    </svg>
  );
}

export function PublicNav({
  siteName,
  locale,
  active,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  variant = "overlay",
  actions,
}: {
  siteName?: string | null;
  locale: Locale;
  active?: "home" | "portfolio" | "about" | "services" | "process" | "contact";
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  variant?: "overlay" | "static";
  actions?: React.ReactNode;
}) {
  const t = labels[locale];
  const activeHrefBySection = {
    home: "/",
    portfolio: "/#portfolio",
    about: "/quienes-somos",
    services: "/servicios",
    process: "/proceso",
    contact: "/#contacto",
  } as const;
  const activeHref = active ? activeHrefBySection[active] : "";
  const shellClass =
    variant === "overlay"
      ? "absolute left-0 top-0 z-40 flex h-16 w-full items-center px-5 text-white md:h-20 md:px-8"
      : "relative z-10 flex h-16 w-full items-center text-white md:h-20";

  function itemClass(href: string) {
    const isActive = href === activeHref;
    return `focus-ring border-b border-transparent pb-1 hover:text-[#FFE100] ${isActive ? "border-[#FFE100] text-[#FFE100]" : ""}`;
  }

  function mobileItemClass(href: string) {
    const isActive = href === activeHref;
    return `focus-ring rounded-md px-3 py-3 text-sm font-black uppercase hover:bg-white/8 hover:text-[#FFE100] ${isActive ? "bg-[#FFE100]/12 text-[#FFE100]" : "text-white/78"}`;
  }

  return (
    <header className={shellClass}>
      <button
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        className="focus-ring grid h-11 w-11 place-items-center text-white/88 lg:hidden"
        onClick={onToggleMenu}
        type="button"
      >
        <span className="grid gap-1.5">
          <span className="block h-px w-7 bg-current" />
          <span className="block h-px w-7 bg-current" />
          <span className="block h-px w-7 bg-current" />
        </span>
      </button>
      <Link className="focus-ring display-title absolute left-1/2 -translate-x-1/2 text-base leading-none text-white/72 md:text-lg lg:static lg:left-auto lg:translate-x-0" href="/">
        {siteName || "BL Audiovisual"}
      </Link>
      <nav className="ml-auto hidden items-center gap-5 text-[11px] font-black uppercase tracking-[0.12em] text-white/68 lg:flex">
        {(t.nav as string[][]).map(([item, href]) => (
          <Link aria-current={href === activeHref ? "page" : undefined} className={itemClass(href)} href={href} key={item}>
            {item}
          </Link>
        ))}
      </nav>
      {actions && <div className="ml-auto flex items-center gap-1 lg:ml-5">{actions}</div>}
      {menuOpen && (
        <div className="absolute left-5 right-5 top-16 grid gap-1 rounded-md border border-white/12 bg-[#0B0C07]/96 p-3 shadow-2xl backdrop-blur lg:hidden">
          {(t.nav as string[][]).map(([item, href]) => (
            <Link aria-current={href === activeHref ? "page" : undefined} className={mobileItemClass(href)} href={href} key={item} onClick={onCloseMenu}>
              {item}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export function VideoPreview({
  project,
  poster,
  locale,
  active,
  onActivate,
  onDeactivate,
}: {
  project: PublicData["projects"][number];
  poster: string;
  locale: Locale;
  active: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const [hasStarted, setHasStarted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastPointerType = useRef<React.PointerEvent<HTMLElement>["pointerType"] | null>(null);
  const title = locale === "es" ? project.titleEs : project.titleEn;
  const category = locale === "es" ? project.category.nameEs : project.category.nameEn;
  const playable = Boolean(project.videoUrl);
  const directVideo = isDirectVideo(project.videoUrl);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active) {
      video.muted = !audioEnabled;
      video.play().catch(() => undefined);
      return;
    }

    video.pause();
  }, [active, audioEnabled]);

  function startPreview() {
    if (!playable) return;
    setHasStarted(true);
    onActivate();
  }

  function stopPreview() {
    if (!playable) return;
    onDeactivate();
  }

  function togglePreview() {
    if (!playable) return;
    if (active) {
      stopPreview();
      setAudioEnabled(false);
      return;
    }

    startPreview();
  }

  function handlePointerEnter(event: React.PointerEvent<HTMLElement>) {
    lastPointerType.current = event.pointerType;
    if (event.pointerType !== "mouse") return;
    startPreview();
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLElement>) {
    lastPointerType.current = event.pointerType;
    if (event.pointerType !== "mouse") return;
    stopPreview();
  }

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    lastPointerType.current = event.pointerType;
  }

  function handleClick() {
    if (lastPointerType.current === "mouse") return;
    togglePreview();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    togglePreview();
  }

  function handleBlur(event: React.FocusEvent<HTMLElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    stopPreview();
  }

  function toggleAudio(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!playable) return;
    if (!active) startPreview();
    setAudioEnabled((value) => !value);
  }

  function togglePreviewFromControl(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    togglePreview();
  }

  return (
    <article
      aria-label={title}
      aria-pressed={active}
      className="focus-ring group grid cursor-pointer overflow-hidden rounded-md border border-white/10 bg-[#090B08] text-left shadow-[0_24px_70px_rgba(0,0,0,.28)]"
      onBlur={handleBlur}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      role="button"
      tabIndex={0}
    >
      <span className="relative block aspect-[1.22/1] overflow-hidden bg-[#F3D9D4]">
        <img alt="" className={`h-full w-full object-cover transition duration-700 ${active && playable ? "opacity-0" : "opacity-100 group-hover:scale-[1.03]"}`} src={project.posterUrl || poster} />
        {hasStarted && playable && directVideo && (
          <video ref={videoRef} className={`absolute inset-0 h-full w-full object-cover transition duration-300 ${active ? "opacity-100" : "pointer-events-none opacity-0"}`} controls={active} loop muted={!audioEnabled} playsInline preload="metadata" src={project.videoUrl} />
        )}
        {active && playable && !directVideo && (
          <iframe
            allow="autoplay; encrypted-media; picture-in-picture"
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            src={videoEmbedWithAudio(project.videoUrl, audioEnabled)}
            title={title}
          />
        )}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <span className={`pointer-events-none absolute inset-0 grid place-items-center text-white transition group-hover:scale-105 ${active ? "opacity-0" : "opacity-100"}`}>
          <span className="grid h-14 w-14 place-items-center rounded-full border border-white/35 bg-black/35 backdrop-blur">
            <span className="ml-1 block h-0 w-0 border-y-[8px] border-l-[13px] border-y-transparent border-l-current" />
          </span>
        </span>
        {playable && (
          <span className="absolute bottom-3 right-3 z-10 flex gap-2">
            {active && (
              <button
                aria-label="Pausar previsualización"
                className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-black/50 text-sm font-black text-white backdrop-blur hover:border-[#FFE100] hover:text-[#FFE100]"
                onClick={togglePreviewFromControl}
                type="button"
              >
                ||
              </button>
            )}
            <button
              aria-label={audioEnabled ? "Desactivar audio" : "Activar audio"}
              className={`focus-ring grid h-10 w-10 place-items-center rounded-full border text-sm font-black backdrop-blur ${audioEnabled ? "border-[#FFE100] bg-[#FFE100] text-black" : "border-white/35 bg-black/50 text-white"}`}
              onClick={toggleAudio}
              type="button"
            >
              {audioEnabled ? "♪" : "×"}
            </button>
          </span>
        )}
      </span>
      <span className="grid min-h-[88px] content-end bg-[linear-gradient(0deg,rgba(11,12,8,1),rgba(11,12,8,.78))] px-5 py-4">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FFE100]">{category}</span>
        <span className="display-title mt-1 block text-xl leading-none text-white md:text-2xl">{title}</span>
        <span className="mt-1 text-xs uppercase text-white/58">{project.client} / {project.year}</span>
      </span>
    </article>
  );
}

export function PublicLanding({ data }: { data: PublicData }) {
  const [locale, setLocale] = useState<Locale>("es");
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [menuOpen, setMenuOpen] = useState(false);
  const t = labels[locale];
  const settings = data.settings;
  const heroPoster = settings?.heroPosterUrl || "/assets/generated/bl-cinematic-hero.png";
  const title = settings?.heroTitle || settings?.siteName || "BL Audiovisual";

  const stats = useMemo(
    () => [
      ["20+", locale === "es" ? "video clips musicales" : "music video clips"],
      ["10k+", locale === "es" ? "vistas totales" : "total views"],
      ["+10", locale === "es" ? "artistas con video" : "artists with video"],
      ["No1", locale === "es" ? "productora audiovisual" : "audiovisual studio"],
    ],
    [locale],
  );

  async function submitContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("loading");
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, locale }),
    });
    setFormState(response.ok ? "success" : "error");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#101207] text-[#F7F5EE]">
      <PublicNav
        active="home"
        actions={(
          <>
            <button className="focus-ring px-2 text-xs font-black text-white/70 hover:text-white" onClick={() => setLocale("es")} type="button">
              ES
            </button>
            <button className="focus-ring px-2 text-xs font-black text-white/70 hover:text-white" onClick={() => setLocale("en")} type="button">
              EN
            </button>
          </>
        )}
        locale={locale}
        menuOpen={menuOpen}
        onCloseMenu={() => setMenuOpen(false)}
        onToggleMenu={() => setMenuOpen((value) => !value)}
        siteName={settings?.siteName}
      />

      <section id="hero" className="grain relative grid min-h-[690px] place-items-center overflow-hidden px-4 pb-20 pt-24 text-center md:min-h-screen md:px-8">
        <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" src={heroPoster} />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#101207_0%,rgba(16,18,7,.78)_7%,rgba(16,18,7,.18)_45%,rgba(16,18,7,.58)_100%),linear-gradient(90deg,rgba(0,0,0,.28),rgba(0,0,0,.05),rgba(0,0,0,.28))]" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/35 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/78 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFE100]" />
            {locale === "es" ? settings?.heroEyebrowEs : settings?.heroEyebrowEn}
          </p>
          <h1 className="display-title mx-auto max-w-4xl text-[clamp(3rem,9vw,6.3rem)] leading-[.92] text-white">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/78 md:text-base">
            {locale === "es" ? settings?.heroTextEs : settings?.heroTextEn}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a className="focus-ring rounded-full bg-[#FFE100] px-7 py-4 text-xs font-black uppercase text-black" href="#portfolio">
              {t.reel as string}
            </a>
            <a className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-4 text-xs font-black uppercase text-white hover:border-[#FFE100]" href="#portfolio">
              <span className="grid h-5 w-5 place-items-center rounded-full border border-current text-[9px]">▶</span>
              {t.project as string}
            </a>
          </div>
        </div>
      </section>

      <section className="grid bg-[#171808] md:grid-cols-4">
        {stats.map(([value, label]) => (
          <div className="min-h-32 border-white/8 p-6 md:border-r md:p-8" key={value}>
            <strong className="display-title block text-2xl leading-none text-white md:text-3xl">{value}</strong>
            <span className="mt-2 block text-[10px] font-bold uppercase leading-4 tracking-[0.12em] text-white/50">{label}</span>
          </div>
        ))}
      </section>

      <section id="portfolio" className="bg-[#171808] px-4 py-16 md:px-8 md:py-20">
        <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FFE100]">Portafolios</p>
            <h2 className="display-title mt-2 text-3xl leading-none md:text-5xl">{t.work as string}</h2>
          </div>
          <Link className="focus-ring text-[10px] font-black uppercase tracking-[0.14em] text-white/68 hover:text-[#FFE100]" href="/trabajos">
            Todos los proyectos
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.projects.slice(0, 6).map((project) => (
            <VideoPreview
              active={activePreviewId === project.id}
              key={project.id}
              locale={locale}
              onActivate={() => setActivePreviewId(project.id)}
              onDeactivate={() => setActivePreviewId((current) => (current === project.id ? null : current))}
              poster={heroPoster}
              project={project}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-8 border-y border-white/8 bg-[#121308] px-4 py-16 md:grid-cols-[.82fr_1.18fr] md:px-8 md:py-20">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FFE100]">Nuestro proceso</p>
          <h2 className="display-title mt-2 max-w-sm text-3xl leading-[1.02] md:text-5xl">{t.process as string}</h2>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/58">
            {locale === "es"
              ? "Creamos piezas con una ruta clara: concepto, rodaje y postproducción con identidad visual propia."
              : "We create pieces through a clear route: concept, shooting and postproduction with a distinctive visual identity."}
          </p>
          <Link className="focus-ring mt-7 inline-flex border-b border-[#FFE100] pb-2 text-xs font-black uppercase tracking-[0.12em] text-white" href="/proceso">
            {locale === "es" ? "Más sobre nosotros" : "More about us"}
          </Link>
        </div>
        <div className="grid gap-4">
          {data.processSteps.slice(0, 3).map((step, index) => (
            <article className="grid gap-3 rounded-md border border-white/8 bg-white/[0.035] p-5 md:grid-cols-[54px_1fr] md:p-6" key={step.id}>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#FFE100]/18 text-sm font-black text-[#FFE100]">0{index + 1}</span>
              <span>
                <h3 className="display-title text-xl leading-none">{locale === "es" ? step.titleEs : step.titleEn}</h3>
                <p className="mt-3 text-sm leading-6 text-white/56">{locale === "es" ? step.descriptionEs : step.descriptionEn}</p>
              </span>
            </article>
          ))}
        </div>
      </section>

      <section id="contacto" className="grid gap-8 bg-[#101207] px-4 py-16 pb-32 md:grid-cols-[.9fr_1.1fr] md:px-8 md:py-20 md:pb-28">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FFE100]">Contacto</p>
          <h2 className="display-title mt-3 max-w-md text-3xl leading-none md:text-5xl">{t.contact as string}</h2>
          <p className="mt-6 text-sm leading-6 text-white/60">{settings?.email} / {settings?.phone}</p>
        </div>
        <form className="grid gap-3" onSubmit={submitContact}>
          <input className="focus-ring rounded-md border border-white/10 bg-white/5 p-4" name="name" placeholder={t.name as string} required />
          <input className="focus-ring rounded-md border border-white/10 bg-white/5 p-4" name="email" placeholder={t.email as string} required type="email" />
          <input className="focus-ring rounded-md border border-white/10 bg-white/5 p-4" name="service" placeholder={t.service as string} required />
          <textarea className="focus-ring min-h-36 rounded-md border border-white/10 bg-white/5 p-4" name="message" placeholder={t.message as string} required />
          <button className="focus-ring rounded-full bg-[#FFE100] px-6 py-4 text-sm font-black uppercase text-black disabled:opacity-60" disabled={formState === "loading"}>
            {formState === "loading" ? "..." : (t.send as string)}
          </button>
          {formState === "success" && <p className="text-sm text-[#FFE100]">{t.success as string}</p>}
          {formState === "error" && <p className="text-sm text-red-300">{t.error as string}</p>}
        </form>
      </section>

      <footer className="flex flex-col gap-5 border-t border-white/10 bg-[#0B0C07] px-4 py-8 pb-28 text-sm text-white/55 md:flex-row md:items-center md:px-8 md:pb-10 md:pr-28 lg:pr-32">
        <strong className="display-title text-lg text-white">{settings?.siteName || "BL Audiovisual"}</strong>
        <span className="md:ml-auto">{locale === "es" ? settings?.locationEs : settings?.locationEn}</span>
        <div className="flex items-center gap-4">
          {settings?.instagram && (
            <a aria-label={socialLabel("instagram")} className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-white/12 text-white hover:border-[#FFE100] hover:text-[#FFE100]" href={settings.instagram}>
              <SocialIcon kind="instagram" />
            </a>
          )}
          {settings?.youtube && (
            <a aria-label={socialLabel("youtube")} className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-white/12 text-white hover:border-[#FFE100] hover:text-[#FFE100]" href={settings.youtube}>
              <SocialIcon kind="youtube" />
            </a>
          )}
        </div>
      </footer>

      <a
        aria-label={socialLabel("whatsapp")}
        className="focus-ring fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-black shadow-2xl md:bottom-8 md:right-8"
        href={`https://wa.me/${(settings?.whatsapp || "").replace(/\D/g, "")}`}
      >
        <SocialIcon kind="whatsapp" />
      </a>

    </main>
  );
}
