"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";

type AdminData = {
  settings: Setting | null;
  categories: Category[];
  projects: Project[];
  services: Service[];
  processSteps: ProcessStep[];
  clients: Client[];
  testimonials: Testimonial[];
  inquiries: Inquiry[];
  users: User[];
  auditLogs: AuditLog[];
};

type Setting = {
  siteName: string;
  heroEyebrowEs: string;
  heroTitle: string;
  heroTextEs: string;
  aboutEs: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string | null;
  youtube: string | null;
  locationEs: string;
  logoUrl: string | null;
  heroPosterUrl: string | null;
};
type Category = { id: string; nameEs: string; sortOrder: number; status: PublishStatus; deletedAt?: string | Date | null };
type Project = {
  id: string;
  titleEs: string;
  descriptionEs: string;
  client: string;
  year: number;
  categoryId: string;
  videoUrl: string;
  posterUrl: string | null;
  featured: boolean;
  sortOrder: number;
  status: PublishStatus;
  deletedAt?: string | Date | null;
  category?: { nameEs: string };
};
type Service = {
  id: string;
  titleEs: string;
  descriptionEs: string;
  imageUrl: string | null;
  sortOrder: number;
  status: PublishStatus;
  deletedAt?: string | Date | null;
};
type ProcessStep = {
  id: string;
  titleEs: string;
  descriptionEs: string;
  sortOrder: number;
  status: PublishStatus;
  deletedAt?: string | Date | null;
};
type Client = { id: string; name: string };
type Testimonial = {
  id: string;
  author: string;
  role: string;
  company: string;
  quoteEs: string;
  photoUrl: string | null;
  sortOrder: number;
  status: PublishStatus;
  deletedAt?: string | Date | null;
};
type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string;
  message: string;
  status: InquiryStatus;
  createdAt?: string | Date;
};
type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string | Date | null;
  deletedAt?: string | Date | null;
};
type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  createdAt?: string | Date;
  user?: { email: string } | null;
};
type PublishStatus = "DRAFT" | "PUBLISHED" | "INACTIVE";
type InquiryStatus = "NEW" | "REVIEWING" | "CONTACTED" | "CLOSED";
type UserRole = "ADMIN" | "EDITOR";
type UserStatus = "ACTIVE" | "INACTIVE";
type Tab = "summary" | "projects" | "services" | "content" | "inquiries" | "users" | "settings";
type EditorState =
  | { resource: "project"; item?: Project }
  | { resource: "service"; item?: Service }
  | { resource: "category"; item?: Category }
  | { resource: "processStep"; item?: ProcessStep }
  | { resource: "testimonial"; item?: Testimonial }
  | { resource: "user"; item?: User }
  | null;

const tabs: Array<[Tab, string]> = [
  ["summary", "Resumen"],
  ["projects", "Proyectos"],
  ["services", "Servicios"],
  ["content", "Contenido"],
  ["inquiries", "Consultas"],
  ["users", "Usuarios"],
  ["settings", "Configuración"],
];

const statusLabels: Record<PublishStatus, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  INACTIVE: "Inactivo",
};

const inquiryLabels: Record<InquiryStatus, string> = {
  NEW: "Nueva",
  REVIEWING: "En revisión",
  CONTACTED: "Contactada",
  CLOSED: "Cerrada",
};

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  EDITOR: "Gestor",
};

const userStatusLabels: Record<UserStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

const actionLabels: Record<string, string> = {
  LOGIN: "Inicio de sesión",
  CREATE: "Registro creado",
  UPDATE: "Registro actualizado",
  READ: "Consulta realizada",
  SEED_FULL_CONTENT: "Carga inicial",
  SOFT_DELETE: "Registro inhabilitado",
  UPLOAD: "Carga de archivo",
};

const actionDescriptions: Record<string, string> = {
  LOGIN: "Acceso autorizado al panel administrativo.",
  CREATE: "Se creó un registro desde el panel.",
  UPDATE: "Se modificó información existente.",
  READ: "Se consultó información administrativa.",
  SEED_FULL_CONTENT: "Se cargaron datos base del proyecto.",
  SOFT_DELETE: "Se inhabilitó un registro sin borrarlo definitivamente.",
  UPLOAD: "Se subió un archivo desde el panel.",
};

const actionToneClasses: Record<string, string> = {
  LOGIN: "border-sky-300/25 bg-sky-400/10 text-sky-100",
  CREATE: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  UPDATE: "border-[#FFE100]/30 bg-[#FFE100]/12 text-[#FFF5A3]",
  READ: "border-white/15 bg-white/8 text-white/78",
  SEED_FULL_CONTENT: "border-violet-300/25 bg-violet-400/10 text-violet-100",
  SOFT_DELETE: "border-red-300/25 bg-red-400/10 text-red-100",
  UPLOAD: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
};

const entityLabels: Record<string, string> = {
  project: "Proyecto",
  service: "Servicio",
  category: "Categoría",
  processStep: "Etapa del proceso",
  testimonial: "Testimonio",
  inquiry: "Consulta",
  user: "Usuario",
  settings: "Configuración",
  User: "Usuario",
  AdminContent: "Contenido administrativo",
  Workspace: "Workspace",
};

function field(form: HTMLFormElement, name: string) {
  return String(new FormData(form).get(name) || "").trim();
}

function checkbox(form: HTMLFormElement, name: string) {
  return new FormData(form).get(name) === "on";
}

function booleanField(form: HTMLFormElement, name: string) {
  const value = new FormData(form).get(name);
  return value === "on" || value === "true";
}

function formatDate(value?: string | Date | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Asuncion",
  }).format(new Date(value));
}

function auditActionLabel(action: string) {
  return actionLabels[action] || action.replaceAll("_", " ").toLowerCase();
}

function auditEntityLabel(entity: string) {
  return entityLabels[entity] || entity;
}

function auditResourceLabel(log: AuditLog) {
  if (log.details) return log.details;
  if (log.entityId) return `ID ${log.entityId}`;
  if (log.action === "LOGIN") return "Sesión administrativa";
  return "Sin identificador registrado";
}

export function AdminDashboard({
  data,
  actor,
}: {
  data: AdminData;
  actor: { id: string; role: string; email: string };
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("summary");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<EditorState>(null);
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const processing = busy || isPending;
  const visibleTabs = actor.role === "ADMIN" ? tabs : tabs.filter(([id]) => id !== "users");

  const metrics = useMemo(
    () => {
      const visibleMetrics = [
      ["Proyectos", data.projects.filter((item) => !item.deletedAt).length],
      ["Servicios", data.services.filter((item) => !item.deletedAt).length],
      ["Consultas abiertas", data.inquiries.filter((item) => item.status !== "CLOSED").length],
      ];

      if (actor.role === "ADMIN") {
        visibleMetrics.push(["Usuarios activos", data.users.filter((item) => item.status === "ACTIVE").length]);
      }

      return visibleMetrics;
    },
    [actor.role, data],
  );

  async function request(method: "POST" | "PATCH", payload: unknown) {
    setBusy(true);
    setMessage("");
    setError("");
    const response = await fetch("/api/admin/content", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(json.error || "No se pudo guardar. Revisa los datos e intenta nuevamente.");
      return false;
    }
    setMessage("Guardado correctamente. Los datos se actualizaron.");
    setEditor(null);
    startTransition(() => router.refresh());
    return true;
  }

  function switchTab(next: Tab) {
    setTab(next);
    setDrawerOpen(false);
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#11130F] text-[#F7F1DE] md:grid md:grid-cols-[264px_1fr]">
      <aside className="hidden border-r border-white/10 bg-[#080907] md:block">
        <AdminNav items={visibleTabs} tab={tab} onChange={switchTab} />
      </aside>

      <div className="border-b border-white/10 bg-[#080907] px-4 py-3 md:hidden">
        <button
          aria-expanded={drawerOpen}
          className="focus-ring inline-flex min-h-11 items-center rounded-md border border-white/15 px-3 text-sm font-bold"
          onClick={() => setDrawerOpen((value) => !value)}
        >
          Menú
        </button>
        {drawerOpen && (
          <div className="mt-3 rounded-md border border-white/10 bg-[#11130F] p-2">
            <AdminNav items={visibleTabs} tab={tab} onChange={switchTab} compact />
          </div>
        )}
      </div>

      <section className="min-w-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-8 md:py-8">
          <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFE100]">BL Audiovisual</p>
              <h1 className="display-title mt-1 text-3xl leading-none md:text-4xl">{visibleTabs.find(([id]) => id === tab)?.[1]}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
              <Chip>{roleLabels[actor.role as UserRole] || actor.role}</Chip>
              <span>{actor.email}</span>
            </div>
          </div>

          {message && <Alert tone="success">{message}</Alert>}
          {error && <Alert tone="error">{error}</Alert>}
          {processing && <Alert tone="busy">Procesando traducción y guardado en servidor...</Alert>}

          {tab === "summary" && (
            <div className="grid gap-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map(([label, value]) => (
                  <Metric label={String(label)} value={Number(value)} key={label} />
                ))}
              </div>
              {actor.role === "ADMIN" && (
                <Section title="Últimos movimientos del panel" subtitle="Acciones administrativas recientes ordenadas de la más nueva a la más antigua.">
                  <AuditActivity logs={data.auditLogs} />
                </Section>
              )}
            </div>
          )}

          {tab === "projects" && (
            <Section
              title="Proyectos"
              subtitle="La versión en inglés se genera automáticamente al guardar."
              action={<ActionButton onClick={() => setEditor({ resource: "project" })}>Crear proyecto</ActionButton>}
            >
              <ResponsiveTable
                headers={["Proyecto", "Categoría", "Estado", "Destacado", "Acciones"]}
                rows={data.projects.map((project) => [
                  <MediaTitle key="title" title={project.titleEs} detail={`${project.client} · ${project.year}`} image={project.posterUrl} />,
                  project.category?.nameEs || "Sin categoría",
                  <StatusChip status={project.status} deleted={Boolean(project.deletedAt)} key="status" />,
                  project.featured ? "Sí" : "No",
                  <RowActions key="actions" onEdit={() => setEditor({ resource: "project", item: project })} onState={() => request("PATCH", { resource: "project", id: project.id, action: project.deletedAt ? "restore" : "soft-delete" })} deleted={Boolean(project.deletedAt)} />,
                ])}
              />
            </Section>
          )}

          {tab === "services" && (
            <Section
              title="Servicios"
              subtitle="Edita contenido en español; la traducción se resuelve en el servidor."
              action={<ActionButton onClick={() => setEditor({ resource: "service" })}>Crear servicio</ActionButton>}
            >
              <ResponsiveTable
                headers={["Servicio", "Estado", "Orden", "Acciones"]}
                rows={data.services.map((service) => [
                  <MediaTitle key="title" title={service.titleEs} detail={service.descriptionEs} image={service.imageUrl} />,
                  <StatusChip status={service.status} deleted={Boolean(service.deletedAt)} key="status" />,
                  service.sortOrder,
                  <RowActions key="actions" onEdit={() => setEditor({ resource: "service", item: service })} onState={() => request("PATCH", { resource: "service", id: service.id, action: service.deletedAt ? "restore" : "soft-delete" })} deleted={Boolean(service.deletedAt)} />,
                ])}
              />
            </Section>
          )}

          {tab === "content" && (
            <div className="grid gap-5">
              <ContentBlock title="Categorías" onCreate={() => setEditor({ resource: "category" })}>
                {data.categories.map((item) => (
                  <CompactRow key={item.id} title={item.nameEs} meta={`Orden ${item.sortOrder}`} status={item.status} deleted={Boolean(item.deletedAt)} onEdit={() => setEditor({ resource: "category", item })} onState={() => request("PATCH", { resource: "category", id: item.id, action: item.deletedAt ? "restore" : "soft-delete" })} />
                ))}
              </ContentBlock>
              <ContentBlock title="Etapas del proceso" onCreate={() => setEditor({ resource: "processStep" })}>
                {data.processSteps.map((item) => (
                  <CompactRow key={item.id} title={item.titleEs} meta={item.descriptionEs} status={item.status} deleted={Boolean(item.deletedAt)} onEdit={() => setEditor({ resource: "processStep", item })} onState={() => request("PATCH", { resource: "processStep", id: item.id, action: item.deletedAt ? "restore" : "soft-delete" })} />
                ))}
              </ContentBlock>
              <ContentBlock title="Testimonios" onCreate={() => setEditor({ resource: "testimonial" })}>
                {data.testimonials.map((item) => (
                  <CompactRow key={item.id} title={item.author} meta={`${item.company} · ${item.quoteEs}`} status={item.status} deleted={Boolean(item.deletedAt)} onEdit={() => setEditor({ resource: "testimonial", item })} onState={() => request("PATCH", { resource: "testimonial", id: item.id, action: item.deletedAt ? "restore" : "soft-delete" })} />
                ))}
              </ContentBlock>
            </div>
          )}

          {tab === "inquiries" && (
            <Section title="Consultas" subtitle="Seguimiento simple por estado.">
              <div className="grid gap-3">
                {data.inquiries.map((item) => (
                  <article className="rounded-md border border-white/10 bg-[#F7F1DE] p-4 text-[#11130F]" key={item.id}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <strong>{item.name}</strong>
                          <Chip light>{inquiryLabels[item.status]}</Chip>
                        </div>
                        <p className="mt-1 text-sm text-black/65">{item.email}{item.phone ? ` · ${item.phone}` : ""}{item.company ? ` · ${item.company}` : ""}</p>
                      </div>
                      <select className="focus-ring rounded-md border border-black/15 bg-white px-3 py-2 text-sm" value={item.status} onChange={(event) => request("PATCH", { resource: "inquiry", id: item.id, data: { status: event.target.value } })}>
                        {Object.entries(inquiryLabels).map(([value, label]) => (
                          <option value={value} key={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-3 max-w-4xl text-sm leading-6 text-black/72">{item.message}</p>
                    <p className="mt-3 text-xs font-bold uppercase text-black/45">{item.service} · {formatDate(item.createdAt)}</p>
                  </article>
                ))}
              </div>
            </Section>
          )}

          {tab === "users" && (
            <Section
              title="Usuarios"
              subtitle="Se conserva la regla del último administrador activo."
              action={actor.role === "ADMIN" ? <ActionButton onClick={() => setEditor({ resource: "user" })}>Crear usuario</ActionButton> : undefined}
            >
              <ResponsiveTable
                headers={["Usuario", "Rol", "Estado", "Último acceso", "Acciones"]}
                rows={data.users.map((user) => [
                  <div key="user"><strong>{user.name}</strong><p className="text-sm text-white/55">{user.email}</p></div>,
                  <Chip key="role">{roleLabels[user.role]}</Chip>,
                  <Chip key="status">{userStatusLabels[user.status]}</Chip>,
                  formatDate(user.lastLoginAt),
                  actor.role === "ADMIN" ? <ActionButton key="edit" variant="ghost" onClick={() => setEditor({ resource: "user", item: user })}>Editar</ActionButton> : "Solo lectura",
                ])}
              />
            </Section>
          )}

          {tab === "settings" && (
            <Section title="Configuración" subtitle="La versión en inglés se genera automáticamente al guardar.">
              <SettingsForm item={data.settings} disabled={processing} onSubmit={(event) => saveSettings(event, request)} />
            </Section>
          )}
        </div>
      </section>

      {editor && (
        <EditorModal editor={editor} categories={data.categories} disabled={processing} onClose={() => setEditor(null)} onSubmit={(event) => saveEditor(event, editor, request)} />
      )}
    </div>
  );
}

function AdminNav({
  items,
  tab,
  onChange,
  compact,
}: {
  items: Array<[Tab, string]>;
  tab: Tab;
  onChange: (tab: Tab) => void;
  compact?: boolean;
}) {
  return (
    <nav className={compact ? "grid gap-1" : "sticky top-[4.5rem] grid gap-1 p-4"}>
      <div className={compact ? "hidden" : "mb-4 border-b border-white/10 pb-4"}>
        <p className="display-title text-2xl">BL Admin</p>
        <p className="mt-1 text-xs uppercase text-white/45">Gestión editorial</p>
      </div>
      {items.map(([id, label]) => (
        <button
          className={`focus-ring min-h-11 rounded-md px-3 text-left text-sm font-bold ${tab === id ? "bg-[#FFE100] text-[#080907]" : "text-white/68 hover:bg-white/8 hover:text-white"}`}
          key={id}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

function EditorModal({ editor, categories, disabled, onClose, onSubmit }: { editor: EditorState; categories: Category[]; disabled: boolean; onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  if (!editor) return null;
  const title = editor.item ? "Editar" : "Crear";
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-3 md:place-items-center md:p-6">
      <form className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-md border border-white/10 bg-[#F7F1DE] p-4 text-[#11130F] shadow-2xl md:p-6" onSubmit={onSubmit}>
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-black/10 pb-4">
          <div>
            <p className="text-xs font-black uppercase text-black/45">{title}</p>
            <h2 className="display-title text-2xl">{entityLabels[editor.resource]}</h2>
            {editor.resource !== "user" && <p className="mt-1 text-sm text-black/58">La versión en inglés se genera automáticamente al guardar.</p>}
          </div>
          <button className="focus-ring rounded-md border border-black/15 px-3 py-2 text-sm font-bold" type="button" onClick={onClose}>Cerrar</button>
        </div>
        {editor.resource === "project" && <ProjectForm item={editor.item} categories={categories} />}
        {editor.resource === "service" && <ServiceForm item={editor.item} />}
        {editor.resource === "category" && <CategoryForm item={editor.item} />}
        {editor.resource === "processStep" && <ProcessStepForm item={editor.item} />}
        {editor.resource === "testimonial" && <TestimonialForm item={editor.item} />}
        {editor.resource === "user" && <UserForm item={editor.item} />}
        <div className="mt-5 flex justify-end gap-2 border-t border-black/10 pt-4">
          <button className="focus-ring rounded-md border border-black/15 px-4 py-3 text-sm font-bold" type="button" onClick={onClose}>Cancelar</button>
          <button className="focus-ring rounded-md bg-[#11130F] px-5 py-3 text-sm font-black text-white disabled:opacity-50" disabled={disabled}>
            {disabled ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function saveEditor(event: React.FormEvent<HTMLFormElement>, editor: NonNullable<EditorState>, request: (method: "POST" | "PATCH", payload: unknown) => Promise<boolean>) {
  event.preventDefault();
  const form = event.currentTarget;
  const common = {
    sortOrder: Number(field(form, "sortOrder")) || 0,
    status: field(form, "status") || "PUBLISHED",
  };
  const payloads = {
    project: {
      titleEs: field(form, "titleEs"),
      descriptionEs: field(form, "descriptionEs"),
      client: field(form, "client"),
      year: Number(field(form, "year")) || new Date().getFullYear(),
      categoryId: field(form, "categoryId"),
      videoUrl: field(form, "videoUrl"),
      posterUrl: field(form, "posterUrl") || undefined,
      removePoster: booleanField(form, "removePoster"),
      featured: checkbox(form, "featured"),
      ...common,
    },
    service: {
      titleEs: field(form, "titleEs"),
      descriptionEs: field(form, "descriptionEs"),
      imageUrl: field(form, "imageUrl") || undefined,
      removeImage: booleanField(form, "removeImage"),
      ...common,
    },
    category: {
      nameEs: field(form, "nameEs"),
      ...common,
    },
    processStep: {
      titleEs: field(form, "titleEs"),
      descriptionEs: field(form, "descriptionEs"),
      ...common,
    },
    testimonial: {
      author: field(form, "author"),
      role: field(form, "role"),
      company: field(form, "company"),
      quoteEs: field(form, "quoteEs"),
      photoUrl: field(form, "photoUrl") || undefined,
      removePhoto: booleanField(form, "removePhoto"),
      ...common,
    },
    user: {
      name: field(form, "name"),
      email: field(form, "email"),
      role: field(form, "role"),
      status: field(form, "userStatus"),
      password: field(form, "password") || undefined,
    },
  };
  return request(editor.item ? "PATCH" : "POST", { resource: editor.resource, id: editor.item?.id, data: payloads[editor.resource] });
}

function saveSettings(event: React.FormEvent<HTMLFormElement>, request: (method: "POST" | "PATCH", payload: unknown) => Promise<boolean>) {
  event.preventDefault();
  const form = event.currentTarget;
  return request("PATCH", {
    resource: "settings",
    data: {
      siteName: field(form, "siteName"),
      heroEyebrowEs: field(form, "heroEyebrowEs"),
      heroTitle: field(form, "heroTitle"),
      heroTextEs: field(form, "heroTextEs"),
      aboutEs: field(form, "aboutEs"),
      locationEs: field(form, "locationEs"),
      email: field(form, "email"),
      phone: field(form, "phone"),
      whatsapp: field(form, "whatsapp"),
      instagram: field(form, "instagram"),
      youtube: field(form, "youtube"),
      logoUrl: field(form, "logoUrl") || undefined,
      heroPosterUrl: field(form, "heroPosterUrl") || undefined,
      removeLogo: booleanField(form, "removeLogo"),
      removeHeroPoster: booleanField(form, "removeHeroPoster"),
    },
  });
}

function ProjectForm({ item, categories }: { item?: Project; categories: Category[] }) {
  return (
    <FormGrid>
      <Input required defaultValue={item?.titleEs} label="Título" name="titleEs" />
      <Input defaultValue={item?.client} label="Cliente" name="client" />
      <Textarea required defaultValue={item?.descriptionEs} label="Descripción" name="descriptionEs" />
      <Input defaultValue={item?.year} label="Año" name="year" type="number" />
      <Select defaultValue={item?.categoryId} label="Categoría" name="categoryId">
        {categories.map((category) => <option key={category.id} value={category.id}>{category.nameEs}</option>)}
      </Select>
      <Input defaultValue={item?.videoUrl} label="URL de video" name="videoUrl" />
      <AdminImageUpload defaultValue={item?.posterUrl} kind="projects" label="Miniatura del proyecto" name="posterUrl" removeName="removePoster" />
      <Input defaultValue={item?.sortOrder} label="Orden" name="sortOrder" type="number" />
      <StatusSelect defaultValue={item?.status} />
      <Checkbox defaultChecked={item?.featured} label="Destacado" name="featured" />
    </FormGrid>
  );
}

function ServiceForm({ item }: { item?: Service }) {
  return (
    <FormGrid>
      <Input required defaultValue={item?.titleEs} label="Título" name="titleEs" />
      <AdminImageUpload defaultValue={item?.imageUrl} kind="services" label="Imagen del servicio" name="imageUrl" removeName="removeImage" />
      <Textarea required defaultValue={item?.descriptionEs} label="Descripción" name="descriptionEs" />
      <Input defaultValue={item?.sortOrder} label="Orden" name="sortOrder" type="number" />
      <StatusSelect defaultValue={item?.status} />
    </FormGrid>
  );
}

function CategoryForm({ item }: { item?: Category }) {
  return (
    <FormGrid>
      <Input required defaultValue={item?.nameEs} label="Nombre" name="nameEs" />
      <Input defaultValue={item?.sortOrder} label="Orden" name="sortOrder" type="number" />
      <StatusSelect defaultValue={item?.status} />
    </FormGrid>
  );
}

function ProcessStepForm({ item }: { item?: ProcessStep }) {
  return (
    <FormGrid>
      <Input required defaultValue={item?.titleEs} label="Título" name="titleEs" />
      <Input defaultValue={item?.sortOrder} label="Orden" name="sortOrder" type="number" />
      <Textarea required defaultValue={item?.descriptionEs} label="Descripción" name="descriptionEs" />
      <StatusSelect defaultValue={item?.status} />
    </FormGrid>
  );
}

function TestimonialForm({ item }: { item?: Testimonial }) {
  return (
    <FormGrid>
      <Input required defaultValue={item?.author} label="Autor" name="author" />
      <Input required defaultValue={item?.role} label="Rol o cargo" name="role" />
      <Input required defaultValue={item?.company} label="Empresa" name="company" />
      <AdminImageUpload defaultValue={item?.photoUrl} kind="testimonials" label="Foto del testimonio" name="photoUrl" removeName="removePhoto" />
      <Textarea required defaultValue={item?.quoteEs} label="Testimonio" name="quoteEs" />
      <Input defaultValue={item?.sortOrder} label="Orden" name="sortOrder" type="number" />
      <StatusSelect defaultValue={item?.status} />
    </FormGrid>
  );
}

function UserForm({ item }: { item?: User }) {
  return (
    <FormGrid>
      <Input required defaultValue={item?.name} label="Nombre" name="name" />
      <Input required defaultValue={item?.email} label="Email" name="email" type="email" />
      <Select defaultValue={item?.role || "EDITOR"} label="Rol" name="role">
        <option value="EDITOR">Gestor</option>
        <option value="ADMIN">Administrador</option>
      </Select>
      <Select defaultValue={item?.status || "ACTIVE"} label="Estado" name="userStatus">
        <option value="ACTIVE">Activo</option>
        <option value="INACTIVE">Inactivo</option>
      </Select>
      <Input required={!item} label={item ? "Nueva contraseña opcional" : "Contraseña"} name="password" type="password" />
    </FormGrid>
  );
}

function SettingsForm({ item, disabled, onSubmit }: { item: Setting | null; disabled: boolean; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <SettingsGroup title="Identidad">
        <Input defaultValue={item?.siteName} label="Nombre del sitio" name="siteName" />
        <Input defaultValue={item?.heroTitle} label="Título principal" name="heroTitle" />
        <AdminImageUpload defaultValue={item?.logoUrl} kind="logos" label="Logo" name="logoUrl" removeName="removeLogo" />
      </SettingsGroup>
      <SettingsGroup title="Portada">
        <Input defaultValue={item?.heroEyebrowEs} label="Etiqueta superior" name="heroEyebrowEs" />
        <Textarea defaultValue={item?.heroTextEs} label="Texto principal" name="heroTextEs" />
        <AdminImageUpload defaultValue={item?.heroPosterUrl} kind="hero" label="Imagen de portada" name="heroPosterUrl" removeName="removeHeroPoster" />
      </SettingsGroup>
      <SettingsGroup title="Quiénes somos">
        <Textarea defaultValue={item?.aboutEs} label="Descripción institucional" name="aboutEs" />
      </SettingsGroup>
      <SettingsGroup title="Contacto">
        <Input defaultValue={item?.email} label="Email" name="email" type="email" />
        <Input defaultValue={item?.phone} label="Teléfono" name="phone" />
        <Input defaultValue={item?.whatsapp} label="WhatsApp" name="whatsapp" />
        <Input defaultValue={item?.locationEs} label="Ubicación" name="locationEs" />
      </SettingsGroup>
      <SettingsGroup title="Redes">
        <Input defaultValue={item?.instagram} label="Instagram" name="instagram" />
        <Input defaultValue={item?.youtube} label="YouTube" name="youtube" />
      </SettingsGroup>
      <SettingsGroup title="Multimedia">
        <p className="text-sm text-white/55">Los medios se conservan como URL según el soporte actual.</p>
      </SettingsGroup>
      <button className="focus-ring w-fit rounded-md bg-[#FFE100] px-5 py-3 text-sm font-black text-[#080907] disabled:opacity-50" disabled={disabled}>
        {disabled ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-4 rounded-md border border-white/10 bg-white/[0.04] p-4 md:grid-cols-2">
      <legend className="px-2 text-sm font-black uppercase text-[#FFE100]">{title}</legend>
      {children}
    </fieldset>
  );
}

function Input({ label, name, defaultValue, type = "text", required }: { label: string; name: string; defaultValue?: string | number | null; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      <span>{label}</span>
      <input className="focus-ring min-h-11 rounded-md border border-black/15 bg-white px-3 text-[#11130F] disabled:bg-black/5" defaultValue={defaultValue ?? ""} name={name} required={required} type={type} />
    </label>
  );
}

function Textarea({ label, name, defaultValue, required }: { label: string; name: string; defaultValue?: string | null; required?: boolean }) {
  return (
    <label className="grid gap-1 text-sm font-bold md:col-span-2">
      <span>{label}</span>
      <textarea className="focus-ring min-h-28 rounded-md border border-black/15 bg-white p-3 text-[#11130F]" defaultValue={defaultValue ?? ""} name={name} required={required} />
    </label>
  );
}

function Select({ label, name, defaultValue, children }: { label: string; name: string; defaultValue?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      <span>{label}</span>
      <select className="focus-ring min-h-11 rounded-md border border-black/15 bg-white px-3 text-[#11130F]" defaultValue={defaultValue} name={name}>
        {children}
      </select>
    </label>
  );
}

function StatusSelect({ defaultValue = "PUBLISHED" }: { defaultValue?: PublishStatus }) {
  return (
    <Select defaultValue={defaultValue} label="Estado" name="status">
      {Object.entries(statusLabels).map(([value, label]) => (
        <option value={value} key={value}>{label}</option>
      ))}
    </Select>
  );
}

function Checkbox({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-sm font-bold">
      <input className="focus-ring h-5 w-5 accent-[#11130F]" defaultChecked={defaultChecked} name={name} type="checkbox" />
      {label}
    </label>
  );
}

function Section({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-white/10 bg-[#080907] p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-black">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-white/55">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ContentBlock({ title, onCreate, children }: { title: string; onCreate: () => void; children: React.ReactNode }) {
  return (
    <Section title={title} subtitle="La versión en inglés se genera automáticamente al guardar." action={<ActionButton onClick={onCreate}>Crear</ActionButton>}>
      <div className="grid gap-2">{children}</div>
    </Section>
  );
}

function ResponsiveTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase text-white/45">
            {headers.map((header) => <th className="px-3 py-3" key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr className="border-b border-white/8 align-middle last:border-0" key={rowIndex}>
              {row.map((cell, cellIndex) => <td className="px-3 py-3" key={cellIndex}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-md border border-white/10 bg-[#080907] p-4">
      <strong className="display-title block text-4xl text-[#FFE100]">{value}</strong>
      <span className="text-sm text-white/58">{label}</span>
    </article>
  );
}

function AuditActivity({ logs }: { logs: AuditLog[] }) {
  if (!logs.length) {
    return (
      <div className="rounded-md border border-dashed border-white/15 bg-white/[0.03] px-4 py-8 text-center">
        <p className="font-black">No hay movimientos recientes para mostrar.</p>
        <p className="mt-1 text-sm text-white/55">Cuando un administrador acceda o modifique contenido, aparecerá en este resumen.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-y border-white/10 bg-white/[0.03] text-xs uppercase text-white/45">
              <th className="px-4 py-3">Acción realizada</th>
              <th className="px-4 py-3">Módulo</th>
              <th className="px-4 py-3">Registro afectado</th>
              <th className="px-4 py-3">Responsable</th>
              <th className="px-4 py-3">Fecha y hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr className="border-b border-white/8 align-top last:border-0" key={log.id}>
                <td className="px-4 py-4">
                  <AuditAction action={log.action} />
                  <p className="mt-2 max-w-[16rem] text-xs leading-5 text-white/50">{actionDescriptions[log.action] || "Movimiento registrado en auditoría."}</p>
                </td>
                <td className="px-4 py-4">
                  <Chip>{auditEntityLabel(log.entity)}</Chip>
                </td>
                <td className="max-w-[22rem] px-4 py-4 text-white/72">
                  <span className="line-clamp-2">{auditResourceLabel(log)}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="block font-bold">{log.user?.email || "Sistema"}</span>
                  <span className="text-xs text-white/45">{log.user ? "Usuario administrativo" : "Proceso automático"}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-white/72">{formatDate(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {logs.map((log) => (
          <article className="rounded-md border border-white/10 bg-white/[0.04] p-4" key={log.id}>
            <div className="flex flex-wrap items-center gap-2">
              <AuditAction action={log.action} />
              <Chip>{auditEntityLabel(log.entity)}</Chip>
            </div>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="text-xs font-black uppercase text-white/40">Registro afectado</dt>
                <dd className="mt-1 text-white/72">{auditResourceLabel(log)}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase text-white/40">Responsable</dt>
                <dd className="mt-1 text-white/72">{log.user?.email || "Sistema"}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase text-white/40">Fecha y hora</dt>
                <dd className="mt-1 text-white/72">{formatDate(log.createdAt)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}

function AuditAction({ action }: { action: string }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-md border px-2.5 py-1 text-xs font-black uppercase ${actionToneClasses[action] || "border-white/15 bg-white/8 text-white"}`}>
      {auditActionLabel(action)}
    </span>
  );
}

function MediaTitle({ title, detail, image }: { title: string; detail?: string; image?: string | null }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/8">
        {image && <img alt="" className="h-full w-full object-cover" src={image} />}
      </div>
      <div className="min-w-0">
        <strong className="block truncate">{title}</strong>
        {detail && <p className="line-clamp-2 text-sm text-white/55">{detail}</p>}
      </div>
    </div>
  );
}

function CompactRow({ title, meta, status, deleted, onEdit, onState }: { title: string; meta: string; status: PublishStatus; deleted: boolean; onEdit: () => void; onState: () => void }) {
  return (
    <article className="grid gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3 md:grid-cols-[1fr_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <strong>{title}</strong>
          <StatusChip status={status} deleted={deleted} />
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-white/55">{meta}</p>
      </div>
      <RowActions onEdit={onEdit} onState={onState} deleted={deleted} />
    </article>
  );
}

function RowActions({ onEdit, onState, deleted }: { onEdit: () => void; onState: () => void; deleted: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton variant="ghost" onClick={onEdit}>Editar</ActionButton>
      <ActionButton variant={deleted ? "primary" : "danger"} onClick={onState}>{deleted ? "Reactivar" : "Inhabilitar"}</ActionButton>
    </div>
  );
}

function ActionButton({ children, onClick, variant = "primary" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger" }) {
  const className =
    variant === "primary"
      ? "bg-[#FFE100] text-[#080907]"
      : variant === "danger"
        ? "border border-red-300/30 text-red-100 hover:bg-red-500/15"
        : "border border-white/15 text-white hover:bg-white/10";
  return (
    <button className={`focus-ring min-h-10 rounded-md px-3 text-sm font-black ${className}`} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function StatusChip({ status, deleted }: { status: PublishStatus; deleted?: boolean }) {
  return <Chip>{deleted ? "Inhabilitado" : statusLabels[status]}</Chip>;
}

function Chip({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-md px-2.5 py-1 text-xs font-black uppercase ${light ? "bg-black text-white" : "bg-white/10 text-white"}`}>
      {children}
    </span>
  );
}

function Alert({ children, tone }: { children: React.ReactNode; tone: "success" | "error" | "busy" }) {
  const className =
    tone === "error"
      ? "border-red-400/30 bg-red-500/15 text-red-100"
      : tone === "busy"
        ? "border-[#FFE100]/30 bg-[#FFE100]/15 text-[#FFF5A3]"
        : "border-emerald-400/30 bg-emerald-500/15 text-emerald-100";
  return <div className={`mb-4 rounded-md border px-4 py-3 text-sm font-bold ${className}`}>{children}</div>;
}
