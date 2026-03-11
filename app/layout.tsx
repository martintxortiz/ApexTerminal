import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Topbar from "@/components/dash/topbar";
import Statusbar from "@/components/dash/statusbar";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apex",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jetBrainsMono.variable} ${jetBrainsMono.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col h-screen w-screen overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-auto flex flex-col">
              {children}
            </main>
            <Statusbar />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
