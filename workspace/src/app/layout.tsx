import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "BL Audiovisual | Productora Audiovisual Premium",
  description:
    "Productora audiovisual premium especializada en videos, fotografía, contenido para marcas y eventos. Producción cinematográfica con identidad visual única.",
  keywords: ["productora audiovisual", "videos profesionales", "fotografía", "contenido para marcas", "producción cinematográfica", "videoclips", "eventos"],
  authors: [{ name: "BL Audiovisual" }],
  openGraph: {
    title: "BL Audiovisual | Productora Audiovisual Premium",
    description: "Historias que se ven, marcas que se sienten. Producción audiovisual y fotografía con pulso cinematográfico.",
    type: "website",
    locale: "es_AR",
    siteName: "BL Audiovisual",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "BL Audiovisual - Productora Audiovisual Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BL Audiovisual | Productora Audiovisual Premium",
    description: "Historias que se ven, marcas que se sienten. Producción audiovisual y fotografía con pulso cinematográfico.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  );
}
