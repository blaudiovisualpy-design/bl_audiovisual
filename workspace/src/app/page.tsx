import { getPublicContent } from "@/lib/content";
import { PublicLanding } from "@/components/PublicLanding";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getPublicContent();
  const serializedData = JSON.parse(JSON.stringify(data));
  return <PublicLanding data={serializedData} />;
}
