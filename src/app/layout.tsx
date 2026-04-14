import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CI/CD Intelligence | Dashboard",
  description: "AI-Powered CI/CD Failure Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
        style={{
          background: "#f0f9ff",
          color: "#0f172a",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── TOP NAV (mobile) ── */}
        <header
          className="md:hidden flex flex-col gap-3 px-4 py-3 border-b sticky top-0 z-50"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            borderColor: "#e0f2fe",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "#0ea5e9" }}
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-base tracking-tight" style={{ color: "#0ea5e9" }}>
                CI/Intel
              </span>
            </div>
            
            {/* Portfolio Link (Mobile) */}
            <a
              href="https://gowrapavan.netlify.app"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
              style={{ background: "#f1f5f9", color: "#475569" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Portfolio
            </a>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto pb-1">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/logs", label: "Logs" },
              { href: "/settings", label: "Settings" },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                style={{ color: "#0369a1" }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>

        <div className="flex flex-1" style={{ minHeight: 0 }}>
          {/* ── SIDEBAR (desktop) ── */}
          <aside
            className="hidden md:flex flex-col w-60 flex-shrink-0 border-r sticky top-0 h-screen"
            style={{
              background: "rgba(255,255,255,0.95)",
              borderColor: "#bae6fd",
            }}
          >
            {/* Logo */}
            <div className="px-5 py-5 border-b" style={{ borderColor: "#e0f2fe" }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ background: "linear-gradient(135deg,#0ea5e9,#0284c7)" }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight" style={{ color: "#0c4a6e" }}>CI/Intel</p>
                  <p className="text-xs" style={{ color: "#7dd3fc" }}>Intelligence Platform</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 flex flex-col justify-between">
              <div className="space-y-1">
                {[
                  {
                    href: "/dashboard", label: "Dashboard",
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    ),
                  },
                  {
                    href: "/logs", label: "Global Logs",
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    ),
                  },
                  {
                    href: "/settings", label: "Settings",
                    icon: (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </>
                    ),
                  },
                ].map(({ href, label, icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-sky-100 hover:text-sky-700 text-slate-600"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {icon}
                    </svg>
                    {label}
                  </Link>
                ))}
              </div>

              {/* Portfolio Return Link (Desktop) */}
              <div className="pt-4 border-t border-sky-100">
                <a
                  href="https://gowrapavan.netlify.app"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Portfolio
                </a>
              </div>
            </nav>

            {/* Status footer */}
            <div className="px-4 py-4 border-t" style={{ borderColor: "#e0f2fe" }}>
              <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "#0369a1" }}>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: "#22c55e",
                    boxShadow: "0 0 6px rgba(34,197,94,0.7)",
                  }}
                />
                GitHub API Connected
              </div>
              <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                Last sync: just now
              </p>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main
            className="flex-1 overflow-y-auto"
            style={{ minHeight: 0, background: "#f0f9ff" }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}