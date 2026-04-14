import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function getAccessibleRepos() {
  try {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 12,
      direction: 'desc'
    });
    
    return data.map(repo => ({
      id: repo.id,
      name: repo.name,
      owner: repo.owner.login,
      full_name: repo.full_name,
      private: repo.private,
      language: repo.language,
      updated_at: repo.updated_at,
    }));
  } catch (error) {
    console.error("Failed to fetch repos:", error);
    return [];
  }
}

/**
 * ✅ PAGINATED WORKFLOW RUNS
 */
export async function getRepoWorkflowRuns(
  owner: string,
  repo: string,
  page: number = 1,
  per_page: number = 5
) {
  try {
    const { data } = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page,
      page,
    });

    return {
      runs: data.workflow_runs,
      total_count: data.total_count,
    };
  } catch (error) {
    console.error(`Failed to fetch runs for ${owner}/${repo}:`, error);
    return { runs: [], total_count: 0 };
  }
}


/**
 * FIX: Properly decode ArrayBuffer and handle Octokit response
 */
export async function fetchFailedLog(owner: string, repo: string, run_id: number): Promise<string> {
  try {
    const { data: jobsData } = await octokit.rest.actions.listJobsForWorkflowRun({
      owner, repo, run_id,
    });

    const failedJob = jobsData.jobs.find(job => job.conclusion === 'failure');
    if (!failedJob) throw new Error("No failed jobs found for this run.");

    const { data: logData } = await octokit.rest.actions.downloadJobLogsForWorkflowRun({
      owner, repo, job_id: failedJob.id,
    });

    // logData is returned as an ArrayBuffer in Node.js environment
    const logString = Buffer.from(logData as ArrayBuffer).toString('utf8');
    
    if (!logString || logString.trim() === "") {
        throw new Error("Log file is empty.");
    }

    const logLines = logString.split('\n');
    // Grabbing the last 1500 lines is usually enough and safer for token limits
    return logLines.slice(-1500).join('\n'); 
  } catch (error: any) {
    console.error("Log Fetch Error:", error.message);
    throw new Error(error.message || "Failed to fetch logs.");
  }
}

export async function getRepoContents(owner: string, repo: string, path: string = '') {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path, 
    });
    
    if (Array.isArray(data)) {
      return data.sort((a, b) => {
        if (a.type === 'dir' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'dir') return 1;
        return a.name.localeCompare(b.name);
      });
    }
    return data;
  } catch (error) {
    console.error(`Failed to fetch contents for ${owner}/${repo}/${path}:`, error);
    return null;
  }
}

/**
 * ✅ FETCH GLOBAL RAW EVENTS (Pushes, PRs, Comments, etc.)
 */
export async function getGlobalActivityLogs() {
  try {
    // 1. Get the authenticated username
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    // 2. Fetch the raw event stream for that user
    const { data: events } = await octokit.rest.activity.listEventsForAuthenticatedUser({
      username: user.login,
      per_page: 50,
    });

    return events;
  } catch (error) {
    console.error("Failed to fetch global logs:", error);
    return [];
  }
}