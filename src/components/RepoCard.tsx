'use client';

import Link from "next/link";

interface RepoCardProps {
  repo: any;
  fakeSuccess: number;
  statusMeta: any;
  langColor: string;
}

export default function RepoCard({ repo, fakeSuccess, statusMeta, langColor }: RepoCardProps) {
  const sm = statusMeta;

  return (
    <Link href={`/repo/${repo.owner}/${repo.name}`}>
      <div
        className="group rounded-2xl border p-5 flex flex-col gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-1"
        style={{
          background: "#fff",
          borderColor: "#e0f2fe",
          boxShadow: "0 1px 12px #0ea5e90a",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 8px 30px #0ea5e920";
          e.currentTarget.style.borderColor = "#7dd3fc";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 12px #0ea5e90a";
          e.currentTarget.style.borderColor = "#e0f2fe";
        }}
      >
        {/* Row 1: name + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#0ea5e9,#0284c7)" }}
            >
              {repo.name[0].toUpperCase()}
            </div>
            <span className="font-bold text-sm truncate transition-colors" style={{ color: "#0c4a6e" }}>
              {repo.name}
            </span>
          </div>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 flex items-center gap-1"
            style={{ background: sm.bg, borderColor: sm.border, color: sm.dot }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: sm.dot, boxShadow: `0 0 4px ${sm.dot}99` }}
            />
            {sm.label}
          </span>
        </div>

        {/* Row 2: success bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "#64748b" }}>Pipeline health</span>
            <span className="text-xs font-bold" style={{ color: "#0284c7" }}>{fakeSuccess}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ background: "#e0f2fe" }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${fakeSuccess}%`,
                background: fakeSuccess >= 85 ? "#22c55e" : fakeSuccess >= 65 ? "#f97316" : "#ef4444",
              }}
            />
          </div>
        </div>

        {/* Row 3: meta + actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs" style={{ color: "#64748b" }}>
            {repo.language && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: langColor }} />
                {repo.language}
              </span>
            )}
            <span
              className="px-1.5 py-0.5 rounded text-xs font-medium"
              style={{
                background: repo.private ? "#f8fafc" : "#f0fdf4",
                color: repo.private ? "#64748b" : "#16a34a",
              }}
            >
              {repo.private ? "Private" : "Public"}
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all" style={{ background: "#e0f2fe", color: "#0284c7" }}>
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}