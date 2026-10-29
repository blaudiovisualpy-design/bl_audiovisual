import { redirect } from "next/navigation";
import { z } from "zod";
import { authenticateAdmin, getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

const formLoginSchema = z.object({
  email: z.string().trim().email().max(180).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(200),
});

async function login(formData: FormData) {
  "use server";

  const parsed = formLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/admin/login?error=1");
  }

  const user = await authenticateAdmin(parsed.data.email, parsed.data.password);
  if (!user) {
    await audit(null, "LOGIN_FAILED", "User", undefined, `email=${parsed.data.email};source=form`);
    redirect("/admin/login?error=1");
  }

  await audit(user.id, "LOGIN", "User", user.id);
  redirect("/admin");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const current = await getCurrentUser();
  if (current) redirect("/admin");
  const params = await searchParams;

  return (
    <main className="grid min-h-screen bg-[#080907] px-4 py-8 text-[#F7F1DE] md:grid-cols-[1fr_minmax(360px,480px)] md:px-8">
      <section className="flex min-h-[38vh] flex-col justify-end border-b border-white/10 pb-8 md:min-h-0 md:border-b-0 md:border-r md:pb-12 md:pr-10">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFE100]">Panel administrativo</p>
        <h1 className="display-title mt-4 max-w-3xl text-5xl leading-[0.9] md:text-7xl">BL Audiovisual</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
          Gestión de portfolio, servicios, contenido institucional, consultas y usuarios.
        </p>
      </section>
      <section className="grid place-items-center py-8 md:pl-10">
      <form action={login} className="w-full max-w-md rounded-md border border-white/10 bg-[#11130F] p-5 shadow-2xl md:p-6">
        <h2 className="text-xl font-black">Ingresar</h2>
        <p className="mt-2 text-sm text-white/55">Usa tus credenciales administrativas.</p>
        <label className="mt-7 block text-sm font-bold text-white/72">
          Email
          <input className="focus-ring mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3" name="email" required type="email" />
        </label>
        <label className="mt-4 block text-sm font-bold text-white/72">
          Contraseña
          <input className="focus-ring mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3" name="password" required type="password" />
        </label>
        {params.error && <p className="mt-4 rounded-md border border-red-300/30 bg-red-500/15 px-3 py-2 text-sm text-red-100">Credenciales inválidas o usuario inactivo.</p>}
        <button className="focus-ring mt-6 min-h-12 w-full rounded-md bg-[#FFE100] px-5 text-sm font-black uppercase text-black">
          Entrar
        </button>
      </form>
      </section>
    </main>
  );
}
