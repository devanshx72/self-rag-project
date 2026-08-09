import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "RAG — Interactive Agentic Self-RAG Platform",
  description:
    "An Agentic Self-RAG platform that visualizes every reasoning step of the retrieval pipeline in real time with LangGraph and React Flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.variable} font-manrope bg-slate-950 text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
