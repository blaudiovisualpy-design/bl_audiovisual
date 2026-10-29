import { PublicInnerPage } from "@/components/PublicInnerPage";
import { getPublicContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const data = await getPublicContent();
  return <PublicInnerPage data={JSON.parse(JSON.stringify(data))} page="clients" />;
}
