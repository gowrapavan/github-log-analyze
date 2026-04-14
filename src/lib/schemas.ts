import { z } from 'zod';

export const InspectorSchema = z.object({
  error_type: z.string().describe("e.g., 'SyntaxError', 'DependencyResolution', 'ConfigError'"),
  root_cause: z.string().describe("A concise 1-sentence statement of what broke"),
  failed_step: z.string().describe("The name of the GitHub Action step that failed"),
  file_path: z.string().nullable().describe("Path to the failing file"),
  line_number: z.number().nullable(),
  relevant_log_snippet: z.string().describe("The exact log lines containing the error"),
});

export const ExplainerSchema = z.object({
  summary: z.string().describe("A 1-2 sentence high-level summary"),
  detailed_explanation: z.string().describe("Deep-dive mechanics of the failure"),
  impact: z.string().describe("What this failure means for the system"),
});

export const GeneratorSchema = z.object({
  primary_fix: z.object({
    description: z.string(),
    diff: z.string().nullable().describe("The code diff to fix the issue"),
    file_path: z.string().describe("Target file for the fix"),
  }),
  // FIX: Explicitly required to satisfy strict JSON mode in 2026 models
  alternative_fixes: z.array(
    z.object({
      description: z.string(),
      diff: z.string().nullable(),
    })
  ),
});

export const ReviewerSchema = z.object({
  confidence_score: z.number().min(0).max(100),
  risk_level: z.enum(['low', 'medium', 'high']),
  reasoning: z.string().describe("Justification for the score"),
});