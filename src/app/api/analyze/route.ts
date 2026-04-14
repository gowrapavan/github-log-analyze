import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createMistral } from '@ai-sdk/mistral';
import { InspectorSchema, ExplainerSchema, GeneratorSchema, ReviewerSchema } from '../../../lib/schemas';
import { fetchFailedLog } from '../../../lib/github';

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
const mistral = createMistral({ apiKey: process.env.MISTRAL_API_KEY });
const openaiNative = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// VERIFIED APRIL 2026 MODELS
const MODEL_POOL = [
  { provider: 'google', name: 'gemini-3.1-flash-lite-preview' },
  { provider: 'groq', name: 'meta-llama/llama-4-scout-17b-16e-instruct' },
  { provider: 'mistral', name: 'mistral-small-latest' },
  { provider: 'openrouter', name: 'meta-llama/llama-3.1-70b-instruct' },
  { provider: 'openai', name: 'gpt-5.4-turbo' }
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function runResilientAgent(prompt: string, schema: any): Promise<{ result: any; modelUsed: string }> {
  const shuffled = [...MODEL_POOL].sort(() => Math.random() - 0.5);
  let lastError = null;

  for (const config of shuffled) {
    try {
      const providerInstances: any = { google, groq, mistral, openrouter, openai: openaiNative };
      const modelProvider = providerInstances[config.provider](config.name);

      const { object } = await generateObject({
        model: modelProvider,
        schema,
        prompt,
       // @ts-ignore: Bypassing strict type check for model provider limits
        maxTokens: 1500,   
   });
      return { result: object, modelUsed: config.name };
    } catch (err: any) {
      console.warn(`⚠️ ${config.provider} (${config.name}) failed: ${err.message}`);
      lastError = err;
      continue; 
    }
  }
  throw new Error(`Pipeline Failed: ${lastError?.message}`);
}

export async function POST(req: Request) {
  try {
    const { githubUrl, logText } = await req.json();
    let targetLogText = logText;

    if (githubUrl) {
      const urlParts = new URL(githubUrl).pathname.split('/');
      targetLogText = await fetchFailedLog(urlParts[1], urlParts[2], parseInt(urlParts[5], 10));
    }

    // Sequence agents with 1s gap to prevent rate-limiting "bursts"
    const { result: inspection, modelUsed: inspectorModel } = await runResilientAgent(`Analyze CI/CD log: ${targetLogText}`, InspectorSchema);
    await delay(1000);
    const { result: explanation, modelUsed: explainerModel } = await runResilientAgent(`Explain error: ${JSON.stringify(inspection)}`, ExplainerSchema);
    await delay(1000);
    const { result: solution, modelUsed: generatorModel } = await runResilientAgent(`Provide fix: ${JSON.stringify(inspection)}`, GeneratorSchema);
    await delay(1000);
    const { result: review, modelUsed: reviewerModel } = await runResilientAgent(`Review fix: ${JSON.stringify(solution)}`, ReviewerSchema);

    const ai_metadata = {
      models: {
        inspector: inspectorModel,
        explainer: explainerModel,
        generator: generatorModel,
        reviewer: reviewerModel,
      },
      primary_model: inspectorModel,
    };

    // Matches existing keys for Dashboard/Report pages
    return NextResponse.json({ inspection, explanation, solution, review, ai_metadata });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}