import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Instrument_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: ["400"],
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const BASE_URL = "https://india2world.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "India2World — Export OS for Indian Businesses",
    template: "%s | India2World",
  },
  description:
    "The AI-powered export workspace for Indian businesses. Navigate IEC registration, government schemes, HS codes, FTA savings, compliance checklists, and market intelligence — all in one place.",
  keywords: [
    "India export",
    "IEC code",
    "RoDTEP",
    "EPCG",
    "export from India",
    "DGFT",
    "HS codes",
    "FTA savings",
    "export schemes India",
    "government export incentives",
    "export readiness",
    "Indian exporter",
  ],
  authors: [{ name: "India2World" }],
  creator: "India2World",
  publisher: "India2World",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "India2World",
    title: "India2World — Export OS for Indian Businesses",
    description:
      "AI-powered export workspace: IEC, schemes, HS codes, FTA savings, compliance — tailored to your product and market.",
    images: [],
  },
  twitter: {
    card: "summary_large_image",
    title: "India2World — Export OS for Indian Businesses",
    description:
      "AI-powered export workspace for Indian businesses. Navigate IEC, government schemes, FTA savings, and compliance.",
    images: [],
    creator: "@india2world",
  },
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        {/* Prevent flash of wrong theme on initial load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('india2world-theme');if(t){t=JSON.parse(t).state?.theme}var d=t==='dark'||(!t||t==='system')&&matchMedia('(prefers-color-scheme:dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="h-full flex flex-col">
        <ClerkProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
