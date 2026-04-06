import { NextRequest, NextResponse } from 'next/server';
import type { BenchmarkJob } from '@/lib/types';

interface MuseJob {
  name: string;
  company?: { name: string };
  refs?: { landing_page: string };
  contents?: string;
}

interface RemoteOKJob {
  position?: string;
  company?: string;
  url?: string;
  description?: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(text: string): number {
  const cleaned = stripHtml(text);
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

function countRequirements(text: string): number {
  const cleaned = stripHtml(text);
  let count = 0;

  // Count bullet points (lines starting with - or * or numbered lists)
  const bulletLines = cleaned.match(/(?:^|\n)\s*(?:[-*•]|\d+[.)]\s)/g);
  if (bulletLines) {
    count += bulletLines.length;
  }

  // Count sentences containing requirement keywords
  const requirementPattern =
    /\b(?:must|required|requirements?|shall|need to|expected to|should have|mandatory|essential)\b/gi;
  const matches = cleaned.match(requirementPattern);
  if (matches) {
    count += matches.length;
  }

  // Deduplicate rough estimate: if both bullet and keyword matched, take the higher
  return Math.max(count, 1);
}

function analyzeTone(text: string): string {
  const cleaned = stripHtml(text).toLowerCase();

  const formalIndicators = [
    'shall',
    'pursuant',
    'hereby',
    'aforementioned',
    'commence',
    'henceforth',
    'the ideal candidate',
    'the successful candidate',
    'qualifications include',
  ];
  const casualIndicators = [
    "you'll",
    "we're",
    "you're",
    'awesome',
    'cool',
    'fun',
    'stoked',
    'rockstar',
    'ninja',
    'guru',
    'crush it',
    'hit the ground running',
    'no brainer',
  ];
  const inclusiveIndicators = [
    'diverse',
    'inclusion',
    'inclusive',
    'belonging',
    'equitable',
    'accessibility',
    'accommodation',
    'equal opportunity',
    'regardless of',
    'we encourage',
    'all backgrounds',
  ];

  let formalScore = 0;
  let casualScore = 0;
  let inclusiveScore = 0;

  for (const word of formalIndicators) {
    if (cleaned.includes(word)) formalScore++;
  }
  for (const word of casualIndicators) {
    if (cleaned.includes(word)) casualScore++;
  }
  for (const word of inclusiveIndicators) {
    if (cleaned.includes(word)) inclusiveScore++;
  }

  const toneLabels: string[] = [];

  if (formalScore >= 2) {
    toneLabels.push('formal');
  } else if (casualScore >= 2) {
    toneLabels.push('casual');
  } else {
    toneLabels.push('neutral');
  }

  if (inclusiveScore >= 2) {
    toneLabels.push('inclusive');
  }

  return toneLabels.join(', ');
}

async function fetchMuseJobs(roleType: string): Promise<BenchmarkJob[]> {
  try {
    const url = `https://www.themuse.com/api/public/jobs?category=${encodeURIComponent(roleType)}&page=1`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`The Muse API returned status ${response.status}`);
      return [];
    }

    const data = await response.json();
    const jobs: MuseJob[] = data.results || [];

    return jobs.slice(0, 3).map((job) => {
      const content = job.contents || '';
      return {
        title: job.name || 'Untitled',
        company: job.company?.name || 'Unknown',
        source: 'The Muse',
        url: job.refs?.landing_page,
        word_count: countWords(content),
        requirement_count: countRequirements(content),
        tone: analyzeTone(content),
      };
    });
  } catch (error) {
    console.error('Failed to fetch from The Muse API:', error);
    return [];
  }
}

async function fetchRemoteOKJobs(roleType: string): Promise<BenchmarkJob[]> {
  try {
    const tag = roleType.toLowerCase().replace(/\s+/g, '-');
    const url = `https://remoteok.com/api?tag=${encodeURIComponent(tag)}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Rolecheck/1.0',
      },
    });

    if (!response.ok) {
      console.error(`RemoteOK API returned status ${response.status}`);
      return [];
    }

    const data = await response.json();

    // RemoteOK returns a legal notice as the first element
    const jobs: RemoteOKJob[] = Array.isArray(data)
      ? data.filter((item: RemoteOKJob) => item.position)
      : [];

    return jobs.slice(0, 2).map((job) => {
      const content = job.description || '';
      return {
        title: job.position || 'Untitled',
        company: job.company || 'Unknown',
        source: 'RemoteOK',
        url: job.url,
        word_count: countWords(content),
        requirement_count: countRequirements(content),
        tone: analyzeTone(content),
      };
    });
  } catch (error) {
    console.error('Failed to fetch from RemoteOK API:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role_type } = body;

    if (!role_type || typeof role_type !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid role_type field' },
        { status: 400 }
      );
    }

    // Fetch from both APIs in parallel
    const [museJobs, remoteOKJobs] = await Promise.all([
      fetchMuseJobs(role_type),
      fetchRemoteOKJobs(role_type),
    ]);

    // Combine results, limit to top 5
    const allJobs: BenchmarkJob[] = [...museJobs, ...remoteOKJobs].slice(0, 5);

    return NextResponse.json(allJobs);
  } catch (error: unknown) {
    console.error('Benchmark API error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json([], { status: 200 });
  }
}
