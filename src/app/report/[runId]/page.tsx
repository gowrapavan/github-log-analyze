'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReportLoader from '../../../components/ReportLoader';

// ── Types ──
interface AiMetadata {
  models: {
    inspector: string;
    explainer: string;
    generator: string;
    reviewer: string;
  };
  primary_model?: string;
}

interface Report {
  inspection?: { error_type?: string; root_cause?: string; failed_step?: string };
  explanation?: { detailed_explanation?: string; impact?: string };
  solution?: { primary_fix?: { description?: string; diff?: string; file_path?: string } };
  review?: { confidence_score?: number; risk_level?: string; reasoning?: string };
  logs?: string;
  ai_metadata?: AiMetadata;
}

export default function ReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const runId = params.runId as string;
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  const [loading, setLoading] = useState(true);
  const [agentStep, setAgentStep] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Animate agent steps while loading
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setAgentStep((s) => Math.min(s + 1, 3)), 1800);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => {
    if (!owner || !repo || !runId) {
      setErrorMsg('Missing repository details in URL.');
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const githubUrl = `https://github.com/${owner}/${repo}/actions/runs/${runId}`;
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ githubUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to analyze logs');
        setReport(data);
      } catch (error: any) {
        setErrorMsg(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [owner, repo, runId]);

  const handleCopy = () => {
    if (report?.solution?.primary_fix?.diff) {
      navigator.clipboard.writeText(report.solution.primary_fix.diff);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const score = report?.review?.confidence_score ?? 0;
  const risk = report?.review?.risk_level ?? 'low';
  const riskColor = risk === 'high' ? '#ef4444' : risk === 'medium' ? '#f97316' : '#22c55e';
  const riskBg = risk === 'high' ? '#fef2f2' : risk === 'medium' ? '#fff7ed' : '#f0fdf4';
  const riskBorder = risk === 'high' ? '#fecaca' : risk === 'medium' ? '#fed7aa' : '#bbf7d0';
  const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f97316' : '#ef4444';

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(160deg,#f0f9ff 0%,#e0f2fe 60%,#f0f9ff 100%)' }}
    >
      {/* ── STICKY HEADER ── */}
      <div
        className="sticky top-0 z-30 px-5 md:px-10 py-4 border-b"
        style={{
          background: 'rgba(240,249,255,0.9)',
          backdropFilter: 'blur(12px)',
          borderColor: '#bae6fd',
        }}
      >
        <Link
          href={`/repo/${owner}/${repo}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-3 transition-colors"
          style={{ color: '#0284c7' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {repo}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="px-2 py-0.5 rounded text-xs font-bold"
                style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
              >
                FAILURE
              </div>
              <h1 className="font-extrabold text-lg" style={{ color: '#0c4a6e' }}>
                Intelligence Report
              </h1>
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
              Run <span className="font-mono">#{runId}</span> · {owner}/{repo}
            </p>
          </div>

          {report && (
            <a
              href={`https://github.com/${owner}/${repo}/actions/runs/${runId}`}
              target="_blank"
              rel="noreferrer"
              className="self-start sm:self-auto px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View Raw on GitHub ↗
            </a>
          )}
        </div>
      </div>

      <div className="px-5 md:px-10 py-8 max-w-7xl mx-auto">

        {/* ── LOADING STATE ── */}
        {loading && (
          <ReportLoader agentStep={agentStep} aiMetadata={report?.ai_metadata} />
        )}

        {/* ── ERROR ── */}
        {errorMsg && (
          <div
            className="rounded-2xl p-6 border"
            style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#ef4444' }}
          >
            <div className="flex items-center gap-2 font-bold mb-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Analysis Failed
            </div>
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        {/* ── REPORT ── */}
        {report && (
          <div className="space-y-6">

            {/* Score strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Confidence gauge */}
              <div
                className="rounded-2xl p-5 border col-span-2 sm:col-span-1"
                style={{ background: '#fff', borderColor: '#e0f2fe', boxShadow: '0 2px 12px #0ea5e910' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>
                  Confidence
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tabular-nums" style={{ color: scoreColor }}>{score}</span>
                  <span className="text-lg font-bold" style={{ color: '#94a3b8' }}>/100</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: '#e0f2fe' }}>
                  <div className="h-1.5 rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: scoreColor }} />
                </div>
              </div>

              {/* Risk level */}
              <div
                className="rounded-2xl p-5 border"
                style={{ background: '#fff', borderColor: '#e0f2fe', boxShadow: '0 2px 12px #0ea5e910' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>
                  Risk Level
                </p>
                <span
                  className="inline-block text-sm font-extrabold capitalize px-3 py-1.5 rounded-lg border"
                  style={{ background: riskBg, borderColor: riskBorder, color: riskColor }}
                >
                  {risk} Risk
                </span>
              </div>

              {/* Error type */}
              <div
                className="rounded-2xl p-5 border sm:col-span-2"
                style={{ background: '#fff', borderColor: '#e0f2fe', boxShadow: '0 2px 12px #0ea5e910' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>
                  Error Classification
                </p>
                <p className="font-bold text-sm" style={{ color: '#ef4444' }}>
                  {report.inspection?.error_type ?? 'Unknown Error'}
                </p>
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                  Step: <span className="font-mono">{report.inspection?.failed_step ?? 'N/A'}</span>
                </p>
              </div>
            </div>

            {/* ── AI MODEL INFO ── */}
            <div
              className="rounded-2xl p-5 border"
              style={{ background: '#fff', borderColor: '#e0f2fe', boxShadow: '0 2px 12px #0ea5e910' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#e0f2fe' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#0ea5e9">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#0284c7' }}>
                    AI Model Info
                  </span>
                </div>
                {report.ai_metadata?.primary_model && (
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }}
                  >
                    Primary: {report.ai_metadata.primary_model}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AGENTS.map(({ label, color, key }) => {
                  const modelName = report.ai_metadata?.models?.[key as keyof AiMetadata['models']] ?? 'Unknown Model';
                  return (
                    <div
                      key={key}
                      className="rounded-xl p-3 border"
                      style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
                    >
                      <div
                        className="text-xs font-bold mb-1.5 flex items-center gap-1.5"
                        style={{ color }}
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: color, display: 'inline-block' }}
                        />
                        {label}
                      </div>
                      <div
                        className="font-mono text-xs px-2 py-1 rounded-md truncate"
                        style={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          color: modelName === 'Unknown Model' ? '#94a3b8' : '#0f172a',
                          fontStyle: modelName === 'Unknown Model' ? 'italic' : 'normal',
                        }}
                        title={modelName}
                      >
                        {modelName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── MAIN SPLIT PANEL ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* LEFT: Root cause + explanation */}
              <div className="space-y-4">
                {/* Root cause */}
                <div
                  className="rounded-2xl p-6 border relative overflow-hidden"
                  style={{
                    background: '#fff',
                    borderColor: '#fecaca',
                    boxShadow: '0 2px 16px #ef444412',
                    borderLeft: '3px solid #ef4444',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#fef2f2' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ef4444' }}>
                      Root Cause Identified
                    </span>
                  </div>
                  <p className="font-bold text-base leading-snug" style={{ color: '#0c4a6e' }}>
                    {report.inspection?.root_cause ?? 'Root cause analysis pending…'}
                  </p>
                </div>

                {/* Explanation */}
                <div
                  className="rounded-2xl p-6 border"
                  style={{ background: '#fff', borderColor: '#e0f2fe', boxShadow: '0 2px 12px #0ea5e910' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#e0f2fe' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#0ea5e9">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#0284c7' }}>
                      AI Explanation
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>
                    {report.explanation?.detailed_explanation ?? 'Generating explanation…'}
                  </p>
                  {report.explanation?.impact && (
                    <div
                      className="mt-4 p-3 rounded-xl border text-xs leading-relaxed"
                      style={{ background: '#fff7ed', borderColor: '#fed7aa', color: '#92400e' }}
                    >
                      <span className="font-bold">Impact: </span>
                      {report.explanation.impact}
                    </div>
                  )}
                </div>

                {/* Reviewer notes */}
                {report.review?.reasoning && (
                  <div
                    className="rounded-2xl p-5 border"
                    style={{ background: '#fafafa', borderColor: '#e0f2fe' }}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>
                      Reviewer Agent Notes
                    </p>
                    <p className="text-sm italic leading-relaxed" style={{ color: '#475569' }}>
                      "{report.review.reasoning}"
                    </p>
                  </div>
                )}
              </div>

              {/* RIGHT: Patch / diff */}
              <div className="space-y-4">
                <div
                  className="rounded-2xl border overflow-hidden"
                  style={{ background: '#fff', borderColor: '#bae6fd', boxShadow: '0 2px 20px #0ea5e915' }}
                >
                  {/* Patch header */}
                  <div
                    className="px-5 py-4 flex items-center justify-between border-b"
                    style={{
                      background: 'linear-gradient(90deg,#e0f2fe,#f0f9ff)',
                      borderColor: '#bae6fd',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: '#0ea5e9' }}
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#0284c7' }}>
                          Suggested Patch
                        </span>
                        {report.solution?.primary_fix?.file_path && (
                          <p className="text-xs font-mono" style={{ color: '#7dd3fc' }}>
                            {report.solution.primary_fix.file_path}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: copied ? '#dcfce7' : '#0ea5e9',
                        color: copied ? '#16a34a' : '#fff',
                        border: copied ? '1px solid #bbf7d0' : 'none',
                      }}
                    >
                      {copied ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Patch
                        </>
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  {report.solution?.primary_fix?.description && (
                    <div className="px-5 py-4 border-b" style={{ borderColor: '#e0f2fe' }}>
                      <p className="text-sm" style={{ color: '#334155' }}>
                        {report.solution.primary_fix.description}
                      </p>
                    </div>
                  )}

                  {/* Diff viewer */}
                  {report.solution?.primary_fix?.diff ? (
                    <div
                      className="overflow-x-auto"
                      style={{ background: '#0f172a', maxHeight: 420 }}
                    >
                      <div
                        className="flex items-center gap-2 px-4 py-2 border-b"
                        style={{ borderColor: '#1e293b' }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                        <div className="w-3 h-3 rounded-full" style={{ background: '#f97316' }} />
                        <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                        <span className="ml-2 text-xs font-mono" style={{ color: '#475569' }}>diff --git</span>
                      </div>
                      <pre className="p-5 text-xs font-mono overflow-x-auto" style={{ color: '#94a3b8', lineHeight: 1.7 }}>
                        <DiffViewer diff={report.solution.primary_fix.diff} />
                      </pre>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm" style={{ color: '#94a3b8' }}>
                      No diff available for this fix.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── LOGS PANEL ── */}
            {report.logs && (
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ background: '#0f172a', borderColor: '#1e293b' }}
              >
                <div
                  className="px-5 py-3 flex items-center gap-3 border-b"
                  style={{ borderColor: '#1e293b' }}
                >
                  <div className="flex items-center gap-1.5">
                    {['#ef4444', '#f97316', '#22c55e'].map((c) => (
                      <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  <span className="text-xs font-mono" style={{ color: '#475569' }}>raw build logs</span>
                </div>
                <pre
                  className="p-5 text-xs font-mono overflow-auto"
                  style={{ color: '#94a3b8', maxHeight: 320, lineHeight: 1.7 }}
                >
                  {report.logs}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Diff viewer with colored lines ──
function DiffViewer({ diff }: { diff: string }) {
  return (
    <>
      {diff.split('\n').map((line, i) => {
        const color = line.startsWith('+') ? '#86efac' : line.startsWith('-') ? '#fca5a5' : line.startsWith('@@') ? '#7dd3fc' : '#94a3b8';
        return (
          <span key={i} style={{ display: 'block', color }}>
            {line}
          </span>
        );
      })}
    </>
  );
}

// ── Agent steps config ──
const AGENTS = [
  { label: 'Inspector Agent', desc: 'Isolating root cause from build logs', color: '#0ea5e9', key: 'inspector' },
  { label: 'Explainer Agent', desc: 'Translating technical context into insights', color: '#8b5cf6', key: 'explainer' },
  { label: 'Generator Agent', desc: 'Drafting patch & code fix', color: '#f97316', key: 'generator' },
  { label: 'Reviewer Agent', desc: 'Scoring confidence & risk level', color: '#22c55e', key: 'reviewer' },
];