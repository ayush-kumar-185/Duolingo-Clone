import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import React, { Suspense } from "react";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";

// Use Nunito as it resembles Duolingo's playful font
const font = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Duolingo Clone",
  description: "Learn Japanese the fun way",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className} text-white`}>
        <div className="min-h-screen flex">
          <React.Suspense fallback={<div className="w-64 border-r-2 border-gray-800 h-screen hidden lg:block bg-background"></div>}>
            <Sidebar />
          </React.Suspense>
          <div className="flex-1 lg:pl-64 flex flex-col">
            <TopBar />
            <main className="flex-1 max-w-5xl mx-auto w-full pt-6 px-4">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
