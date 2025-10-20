import { initScheduler } from "@/lib/scheduler";
import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Paper Reading Club",
  description: "Bi-weekly paper reading club with ranked-choice voting",
};

// Initialize scheduler on app startup
if (process.env.NODE_ENV === "production") {
  initScheduler();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexMono.variable} font-mono antialiased`}
        style={
          {
            "--font-serif": '"New York", "Georgia", "Times New Roman", serif',
          } as React.CSSProperties
        }
      >
        <div vaul-drawer-wrapper="" className="bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
