import { getGlobalActivityLogs } from "../../lib/github";

export const dynamic = "force-dynamic";

// Helper to format timestamps
function timeAgo(dateString: string) {
  const seconds = Math.round((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export default async function LogsPage() {
  const events = await getGlobalActivityLogs();

  return (
    <div className="px-6 md:px-10 py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4 border-sky-100">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "#0c4a6e" }}>
            Global Activity Logs
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#7dd3fc" }}>
            Raw firehose of pushes, branches, and events across all connected repositories.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-sky-200 text-sky-600 shadow-sm">
          {events.length} Events Synced
        </div>
      </div>

      <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm">
        {events.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No recent activity found.
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event: any) => {
              let actionText = "Did something";
              let detailText = null;
              let iconColor = "#94a3b8"; // default gray
              let iconSvg = (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              );

              // Parse event types
              if (event.type === "PushEvent") {
                actionText = `Pushed ${event.payload.size} commit(s) to ${event.payload.ref.replace("refs/heads/", "")}`;
                iconColor = "#0ea5e9"; // Blue
                iconSvg = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />;
                if (event.payload.commits?.length > 0) {
                  detailText = event.payload.commits[0].message;
                }
              } else if (event.type === "CreateEvent") {
                actionText = `Created ${event.payload.ref_type} ${event.payload.ref || ""}`;
                iconColor = "#22c55e"; // Green
                iconSvg = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />;
              } else if (event.type === "PullRequestEvent") {
                actionText = `${event.payload.action === 'opened' ? 'Opened' : 'Updated'} pull request #${event.payload.number}`;
                iconColor = "#8b5cf6"; // Purple
                iconSvg = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />;
                detailText = event.payload.pull_request?.title;
              } else if (event.type === "IssuesEvent") {
                actionText = `${event.payload.action === 'opened' ? 'Opened' : 'Updated'} issue #${event.payload.issue.number}`;
                iconColor = "#f97316"; // Orange
                iconSvg = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
                detailText = event.payload.issue?.title;
              }

              return (
                <div key={event.id} className="flex gap-4">
                  {/* Timeline Line & Icon */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-white"
                      style={{ background: iconColor }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {iconSvg}
                      </svg>
                    </div>
                    {/* The vertical timeline line */}
                    <div className="absolute top-8 bottom-[-24px] w-0.5 bg-slate-100 z-0"></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-bold text-sm text-slate-800">
                        {event.actor.display_login}
                      </span>
                      <span className="text-sm text-slate-600">
                        {actionText}
                      </span>
                      <span className="text-sm font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                        {event.repo.name}
                      </span>
                    </div>
                    
                    {detailText && (
                      <div className="mt-1 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded border border-slate-100 italic truncate max-w-2xl">
                        "{detailText}"
                      </div>
                    )}
                    
                    <div className="text-xs text-slate-400 mt-1.5">
                      {timeAgo(event.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}