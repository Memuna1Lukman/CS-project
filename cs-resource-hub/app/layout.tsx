import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { MockSessionProvider } from "@/components/MockSessionProvider";
import { MockLibraryProvider } from "@/components/MockLibraryProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CS Resource Hub",
  description: "KNUST Computer Science Department resource library",
};

// Runs before hydration so the correct theme applies with no flash and no
// mismatch: stored choice wins, otherwise fall back to prefers-color-scheme.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <MockSessionProvider>
          <MockLibraryProvider>{children}</MockLibraryProvider>
        </MockSessionProvider>
      </body>
    </html>
  );
}
