import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, TelemetryProvider } from "@/components/providers";
import { Topbar, Statusbar } from "@/components/layout";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apex Terminal",
  description: "Professional aerospace mission control interface",
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
          <TelemetryProvider>
            <div className="flex flex-col h-screen w-screen overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-hidden flex flex-col">
                {children}
              </main>
              <Statusbar />
            </div>
          </TelemetryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
