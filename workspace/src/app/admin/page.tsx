import { redirect } from "next/navigation";
import { getAdminData } from "@/lib/content";
import { requireAdminUser } from "@/lib/auth";
import { logout } from "@/app/admin/actions";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

const roleLabels = {
  ADMIN: "Administrador",
  EDITOR: "Gestor",
} as const;

export default async function AdminPage() {
  const user = await requireAdminUser();
  if (!user) redirect("/admin/login");

  const data = await getAdminData(user.role);
  const serializedData = JSON.parse(JSON.stringify(data));

  return (
    <main className="min-h-screen bg-[#080907] text-[#F7F1DE]">
      <header className="sticky top-0 z-40 flex min-h-[4.5rem] items-center gap-4 border-b border-white/10 bg-[#080907]/95 px-4 backdrop-blur md:px-8">
        <div>
          <strong className="display-title block text-xl leading-none text-[#FFE100]">BL Audiovisual</strong>
          <span className="text-xs font-bold uppercase text-white/45">Panel administrativo</span>
        </div>
        <span className="ml-auto hidden text-sm text-white/58 sm:inline">{user.email}</span>
        <span className="rounded-md border border-white/10 px-3 py-1 text-xs font-black uppercase text-white">{roleLabels[user.role]}</span>
        <form action={logout}>
          <button className="focus-ring min-h-10 rounded-md bg-[#FFE100] px-3 text-sm font-black text-[#080907]">Salir</button>
        </form>
      </header>
      <AdminDashboard actor={{ id: user.id, role: user.role, email: user.email }} data={serializedData} />
    </main>
  );
}
