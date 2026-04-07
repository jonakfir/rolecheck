import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { analyzeGenderCoding } from '@/lib/gender-decoder';
import { isAdmin } from '@/lib/admin';
import { createClient } from '@supabase/supabase-js';
import type { AnalysisResult, Flag, GenderCodingResult } from '@/lib/types';
import { PLANS } from '@/lib/stripe';

function getAnthropic() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  });
}

const DEMO_WORD_LIMIT = 300;

const SYSTEM_PROMPT = `You are an expert HR consultant and DEI specialist. Analyze job descriptions for bias, quality, and effectiveness. Return ONLY valid JSON.`;

function buildUserPrompt(jdText: string, roleType: string): string {
  return `Analyze the following job description for the role type "${roleType}". Identify issues with bias, clarity, inclusivity, and completeness.

Return ONLY a JSON object with this exact structure (no markdown, no code fences):
{
  "overall_score": <number 0-100, where 100 is a perfect JD>,
  "sub_scores": {
    "inclusivity": <number 0-100>,
    "clarity": <number 0-100>,
    "realistic_requirements": <number 0-100>,
    "completeness": <number 0-100>
  },
  "flags": [
    {
      "phrase": "<exact text from the JD>",
      "category": "<one of: Gendered Language | Vague Requirement | Unrealistic Experience | Missing Info | Exclusionary Qualifier | Buzzword | Negative Framing>",
      "explanation": "<why this is problematic>",
      "suggestion": "<specific fix or replacement>"
    }
  ],
  "rewritten_jd": "<full rewritten version of the JD with all issues fixed>",
  "summary": "<2-3 sentence summary of the analysis>"
}

Job Description:
${jdText}`;
}

function mergeGenderFlags(
  genderCoding: GenderCodingResult,
  existingFlags: Flag[]
): Flag[] {
  const genderFlags: Flag[] = genderCoding.masculineWords.map(({ word, count }) => ({
    phrase: word,
    category: 'Gendered Language' as const,
    explanation: `The word "${word}" is masculine-coded and appears ${count} time${count > 1 ? 's' : ''}. Research shows masculine-coded language can discourage women and non-binary individuals from applying.`,
    suggestion: `Consider replacing "${word}" with a more neutral alternative that conveys the same meaning without gendered connotations.`,
  }));

  // Deduplicate: skip gender decoder flags if the AI already flagged the same phrase
  const existingPhrases = new Set(
    existingFlags
      .filter((f) => f.category === 'Gendered Language')
      .map((f) => f.phrase.toLowerCase())
  );

  const uniqueGenderFlags = genderFlags.filter(
    (f) => !existingPhrases.has(f.phrase.toLowerCase())
  );

  return [...existingFlags, ...uniqueGenderFlags];
}

function truncateToWordLimit(text: string, limit: number): string {
  const words = text.split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(' ') + '...';
}

export async function POST(request: NextRequest) {
  try {
    const isDemo = request.nextUrl.searchParams.get('demo') === 'true';

    const body = await request.json();
    const { jd_text, role_type } = body;

    if (!jd_text || typeof jd_text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid jd_text field' },
        { status: 400 }
      );
    }

    if (!role_type || typeof role_type !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid role_type field' },
        { status: 400 }
      );
    }

    // --- Usage limit enforcement (skip for demo and admin) ---
    if (!isDemo) {
      const authHeader = request.headers.get('x-user-email');
      const userEmail = authHeader || null;

      // If we have Supabase creds, enforce limits for non-admins
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Try to get user from cookie-forwarded email or auth header
        if (userEmail && !isAdmin(userEmail)) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('plan, jds_used_this_month')
            .eq('email', userEmail)
            .single();

          if (profile) {
            const plan = profile.plan as keyof typeof PLANS;
            const limit = PLANS[plan]?.jds_per_month ?? 3;

            if (limit !== -1 && profile.jds_used_this_month >= limit) {
              return NextResponse.json(
                {
                  error: `You've used all ${limit} analyses for this month on the ${PLANS[plan]?.name || 'Free'} plan. Upgrade to Pro for unlimited analyses.`,
                  code: 'USAGE_LIMIT_REACHED',
                },
                { status: 429 }
              );
            }

            // Increment usage counter
            await supabaseAdmin
              .from('profiles')
              .update({ jds_used_this_month: profile.jds_used_this_month + 1 })
              .eq('email', userEmail);
          }
        }
        // Admin users: no limit check, no counter increment
      }
    }

    const textToAnalyze = isDemo
      ? truncateToWordLimit(jd_text, DEMO_WORD_LIMIT)
      : jd_text;

    // Run gender decoder analysis
    const genderCoding = analyzeGenderCoding(textToAnalyze);

    // Call Claude API for comprehensive analysis
    const message = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(textToAnalyze, role_type),
        },
      ],
      system: SYSTEM_PROMPT,
    });

    // Extract text content from the response
    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(
        { error: 'No text response received from AI' },
        { status: 500 }
      );
    }

    let aiResult: {
      overall_score: number;
      sub_scores: AnalysisResult['sub_scores'];
      flags: Flag[];
      rewritten_jd: string;
      summary: string;
    };

    try {
      // Strip markdown code fences if present
      let rawText = textBlock.text.trim();
      if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      }
      aiResult = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 500 }
      );
    }

    // Merge gender decoder flags with AI flags
    const mergedFlags = mergeGenderFlags(genderCoding, aiResult.flags);

    const result: AnalysisResult = {
      overall_score: aiResult.overall_score,
      sub_scores: aiResult.sub_scores,
      flags: mergedFlags,
      rewritten_jd: aiResult.rewritten_jd,
      summary: aiResult.summary,
      gender_coding: genderCoding,
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Analysis API error:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI service error: ${error.message}` },
        { status: error.status || 502 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
