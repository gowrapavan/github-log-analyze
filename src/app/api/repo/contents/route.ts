import { NextResponse } from 'next/server';
import { getRepoContents } from '../../../../lib/github'; // <-- Fixed path!

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const path = searchParams.get('path') || '';

    if (!owner || !repo) {
      return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
    }

    const contents = await getRepoContents(owner, repo, path);
    return NextResponse.json(contents);
  } catch (error) {
    console.error('API Error fetching contents:', error);
    return NextResponse.json({ error: 'Failed to fetch repository contents' }, { status: 500 });
  }
}