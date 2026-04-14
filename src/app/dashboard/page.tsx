import Link from "next/link";
import { getAccessibleRepos, getRepoWorkflowRuns } from "../../lib/github";

export const dynamic = "force-dynamic";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f0db4f",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  Ruby: "#701516",
};

// ── Helper: Format dates for the activity feed
function timeAgo(dateString: string) {
  const seconds = Math.round((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export default async function DashboardPage() {
  // 1. Fetch repositories
  const repos = await getAccessibleRepos();

  // 2. Fetch recent workflow runs for ALL repos concurrently
  // We fetch up to 15 runs per repo to get a good sample for stats and the activity feed
  const reposWithRuns = await Promise.all(
    repos.map(async (repo: any) => {
      const { runs, total_count } = await getRepoWorkflowRuns(repo.owner, repo.name, 1, 15);
      return { ...repo, runs: runs || [], total_count };
    })
  );

  // 3. Aggregate real metrics
  const allRuns = reposWithRuns.flatMap((r) => r.runs).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  const validRuns = allRuns.filter((r) => r.conclusion === "success" || r.conclusion === "failure");
  
  const total = repos.length;
  const totalRuns = reposWithRuns.reduce((acc, r) => acc + r.total_count, 0);
  const globalSuccessCount = validRuns.filter((r) => r.conclusion === "success").length;
  
  // FIX: Default global success/failure rate to 0 if there are no valid runs across all repos
  const successRate = validRuns.length > 0 ? Math.round((globalSuccessCount / validRuns.length) * 100) : 0;
  const failureRate = validRuns.length > 0 ? 100 - successRate : 0;

  // An "Active Failure" is counted if a repository's MOST RECENT run is a failure
  const activeFailures = reposWithRuns.filter((r) => r.runs[0]?.conclusion === "failure").length;

  // 4. Generate actual Activity Feed from the latest global runs
  const activityFeed = allRuns.slice(0, 8).map((run) => {
    const isSuccess = run.conclusion === "success";
    const isFailure = run.conclusion === "failure";
    return {
      title: `${isFailure ? "Build failed" : isSuccess ? "Build passed" : "Build running"} · ${run.repository.name} · ${run.head_branch}`,
      time: timeAgo(run.updated_at || run.created_at),
      color: isFailure ? "#ef4444" : isSuccess ? "#22c55e" : "#0ea5e9",
    };
  });

  // 5. Generate actual 14-day Trend Chart Data
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split("T")[0];
  });
  
  const trendData = last14Days.map((dateStr) => {
    return allRuns.filter((r) => r.conclusion === "failure" && (r.updated_at || r.created_at).startsWith(dateStr)).length;
  });

  // Calculate if the trend is going up or down this week vs last week
  const lastWeekFailures = trendData.slice(0, 7).reduce((a, b) => a + b, 0);
  const thisWeekFailures = trendData.slice(7, 14).reduce((a, b) => a + b, 0);
  const trendDiff = lastWeekFailures > 0 ? Math.round(((thisWeekFailures - lastWeekFailures) / lastWeekFailures) * 100) : 0;
  const trendLabel = trendDiff <= 0 ? `↓ ${Math.abs(trendDiff)}% this week` : `↑ ${trendDiff}% this week`;
  const trendColor = trendDiff <= 0 ? "#22c55e" : "#ef4444"; // Green if failures drop, Red if they go up
  const trendBg = trendDiff <= 0 ? "#f0fdf4" : "#fef2f2";

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg,#f0f9ff 0%,#e0f2fe 60%,#f0f9ff 100%)" }}
    >
      {/* ── PAGE HEADER ── */}
      <div
        className="sticky top-0 z-30 px-6 md:px-10 py-4 flex items-center justify-between border-b"
        style={{
          background: "rgba(240,249,255,0.85)",
          backdropFilter: "blur(12px)",
          borderColor: "#bae6fd",
        }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "#0c4a6e" }}>
            Repository Intelligence
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#7dd3fc" }}>
            AI-powered CI/CD failure analysis across all repos
          </p>
        </div>
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border"
          style={{
            background: "#e0f2fe",
            borderColor: "#7dd3fc",
            color: "#0284c7",
          }}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          {repos.length} repos synced
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto space-y-10">
        {/* ── METRIC STRIP ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Repos", value: total, suffix: "", accent: "#0ea5e9", bg: "#e0f2fe" },
            { label: "Success Rate", value: successRate, suffix: "%", accent: "#22c55e", bg: "#dcfce7" },
            { label: "Failure Rate", value: failureRate, suffix: "%", accent: "#ef4444", bg: "#fee2e2" },
            { label: "Total Runs", value: totalRuns, suffix: "", accent: "#8b5cf6", bg: "#ede9fe" },
            { label: "Active Failures", value: activeFailures, suffix: "", accent: "#f97316", bg: "#ffedd5" },
          ].map(({ label, value, suffix, accent, bg }) => (
            <div
              key={label}
              className="rounded-2xl px-5 py-4 border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "#fff",
                borderColor: bg,
                boxShadow: `0 2px 16px 0 ${accent}18`,
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#94a3b8" }}>
                {label}
              </p>
              <p className="text-3xl font-extrabold tabular-nums" style={{ color: accent }}>
                {value}
                <span className="text-lg font-bold">{suffix}</span>
              </p>
            </div>
          ))}
        </div>

        {/* ── TREND BAR + ACTIVITY ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className="lg:col-span-2 rounded-2xl p-6 border"
            style={{ background: "#fff", borderColor: "#e0f2fe", boxShadow: "0 2px 20px #0ea5e910" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-sm" style={{ color: "#0c4a6e" }}>Failure Trend — Last 14 Days</h2>
                <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Failures detected per day across all pipelines</p>
              </div>
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ background: trendBg, color: trendColor }}
              >
                {trendLabel}
              </span>
            </div>
            <FailureTrendChart data={trendData} />
          </div>

          <div
            className="rounded-2xl p-5 border overflow-hidden"
            style={{ background: "#fff", borderColor: "#e0f2fe", boxShadow: "0 2px 20px #0ea5e910" }}
          >
            <h2 className="font-bold text-sm mb-4" style={{ color: "#0c4a6e" }}>Live Activity Feed</h2>
            <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 240 }}>
              {activityFeed.length === 0 ? (
                <p className="text-xs text-slate-400">No recent activity detected.</p>
              ) : (
                activityFeed.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: item.color }}
                    />
                    <div>
                      <p className="text-xs font-medium leading-snug" style={{ color: "#0f172a" }}>
                        {item.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{item.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── REPO GRID ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: "#0c4a6e" }}>
              Repositories
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                {repos.length}
              </span>
            </h2>
            <p className="text-xs" style={{ color: "#94a3b8" }}>Click any repo to open its control center</p>
          </div>

          {reposWithRuns.length === 0 ? (
            <div
              className="rounded-2xl p-16 text-center border-2 border-dashed"
              style={{ borderColor: "#bae6fd", color: "#7dd3fc" }}
            >
              <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="font-semibold text-sm">No repositories found</p>
              <p className="text-xs mt-1">Check your GitHub Personal Access Token in .env.local</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {reposWithRuns.map((repo: any) => {
                // Calculate TRUE success rate for this specific repo based on its runs
                const repoValidRuns = repo.runs.filter((r: any) => r.conclusion === "success" || r.conclusion === "failure");
                const repoSuccessCount = repoValidRuns.filter((r: any) => r.conclusion === "success").length;
                const hasValidRuns = repoValidRuns.length > 0;
                
                // FIX: Fallback to 0 if there are no valid runs to prevent showing 100% on empty repos
                const repoSuccessRate = hasValidRuns ? Math.round((repoSuccessCount / repoValidRuns.length) * 100) : 0;
                
                // FIX: Add 'inactive' state for repos with zero runs
                let status = "inactive";
                if (hasValidRuns) {
                  status = repoSuccessRate >= 85 ? "stable" : repoSuccessRate >= 65 ? "warning" : "failing";
                }

                const statusMeta: Record<string, { label: string; dot: string; border: string; bg: string }> = {
                  stable:  { label: "Stable",  dot: "#22c55e", border: "#bbf7d0", bg: "#f0fdf4" },
                  warning: { label: "Degraded", dot: "#f97316", border: "#fed7aa", bg: "#fff7ed" },
                  failing: { label: "Failing", dot: "#ef4444", border: "#fecaca", bg: "#fef2f2" },
                  inactive: { label: "No actions", dot: "#94a3b8", border: "#e2e8f0", bg: "#f8fafc" }, // Neutral state
                };
                const sm = statusMeta[status];
                const langColor = LANG_COLORS[repo.language] ?? "#94a3b8";

                return (
                  <Link href={`/repo/${repo.owner}/${repo.name}`} key={repo.id}>
                    <div
                      className="group rounded-2xl border p-5 flex flex-col gap-4 cursor-pointer transition-all duration-200 
                                 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_8px_30px_rgba(14,165,233,0.15)]"
                      style={{
                        background: "#fff",
                        borderColor: "#e0f2fe",
                        boxShadow: "0 1px 12px rgba(14,165,233,0.04)",
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
                          <span
                            className="font-bold text-sm truncate transition-colors group-hover:text-sky-600"
                            style={{ color: "#0c4a6e" }}
                          >
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
                          <span className="text-xs font-bold" style={{ color: hasValidRuns ? "#0284c7" : "#94a3b8" }}>
                            {hasValidRuns ? `${repoSuccessRate}%` : "N/A"}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: "#e0f2fe" }}>
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: hasValidRuns ? `${repoSuccessRate}%` : "0%",
                              background: !hasValidRuns ? "#cbd5e1" : repoSuccessRate >= 85 ? "#22c55e" : repoSuccessRate >= 65 ? "#f97316" : "#ef4444",
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
                        <div className="flex items-center gap-1.5">
                          <span
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all group-hover:bg-sky-500 group-hover:text-white"
                            style={{
                              background: "#e0f2fe",
                              color: "#0284c7",
                            }}
                          >
                            View →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Inline SVG sparkline chart component ──
function FailureTrendChart({ data }: { data: number[] }) {
  // Ensure max is at least 1 so we don't divide by 0 if there are NO failures across 14 days
  const max = Math.max(...data, 1);
  const W = 600, H = 120, pad = 10;
  const stepX = (W - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => [pad + i * stepX, H - pad - ((v / max) * (H - pad * 2))]);
  const polyline = points.map((p) => p.join(",")).join(" ");
  const area = `M${points[0][0]},${H - pad} ` + points.map((p) => `L${p[0]},${p[1]}`).join(" ") + ` L${points[points.length - 1][0]},${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaGrad)" />
      <polyline points={polyline} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#0ea5e9" stroke="#fff" strokeWidth="1.5" />
      ))}
    </svg>
  );
}