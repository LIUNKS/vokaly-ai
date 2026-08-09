import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Playfair_Display,
  Fira_Code,
} from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontSerif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const fontMono = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "htt://localhost:3000"
  ),
  title: {
    default: "Vokaly Prep — Práctica de Entrevistas de Trabajo con IA en Vivo",
    template: "%s | Vokaly Prep",
  },
  description:
    "Practica y perfecciona tus entrevistas de trabajo técnicas en tiempo real con un entrevistador de Inteligencia Artificial en vivo. Recibe feedback inmediato y scorecards evaluados.",
  keywords: [
    "entrevistas de trabajo",
    "practica entrevistas con IA",
    "simulador de entrevista laboral",
    "Vokaly Prep",
    "mock interview AI",
    "scorecard entrevista",
    "entrevista técnica",
  ],
  authors: [{ name: "Vokaly Prep" }],
  creator: "Vokaly Prep",
  icons: {
    icon: [{ url: "/favicon.ico?v=2", sizes: "any" }],
    shortcut: "/favicon.ico?v=2",
    apple: "/favicon.ico?v=2",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "Vokaly Prep",
    title: "Vokaly Prep — Práctica de Entrevistas de Trabajo con IA en Vivo",
    description:
      "Entrena tus habilidades de entrevista laboral en tiempo real con un entrevistador IA en vivo y obtén un scorecard de desempeño detallado.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vokaly Prep — Práctica de Entrevistas de Trabajo con IA en Vivo",
    description:
      "Simula entrevistas técnicas y profesionales con voz en vivo evaluadas por IA.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
