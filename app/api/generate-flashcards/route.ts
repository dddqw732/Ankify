import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import axios from "axios";

const ANKI_SYSTEM_PROMPT = `You are a world-class Anki flashcard creator. Your goal is to extract key facts and concepts and format them as flashcards.

STRICT OUTPUT RULES:
1. Format: Question | Answer
2. Exactly one flashcard per line.
3. Use the pipe symbol (|) as the ONLY separator.
4. NO numbering (e.g., skip "1. ", "Card 1:").
5. NO headers, NO "Question:" or "Answer:" labels.
6. NO bolding of the separator or keys.
7. Wrap math in \\( ... \\) for inline or \\[ ... \\] for block.
8. Wrap chemistry in \\( \\ce{...} \\).

Example Output:
What is the speed of light? | Approximately 299,792,458 meters per second.
What are the three laws of thermodynamics? | 1. Energy cannot be created or destroyed. 2. Entropy always increases. 3. Entropy approaches a constant at absolute zero.`;



import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const maxDuration = 60; // Allow 60 seconds for execution (Vercel Pro/Hobby limits apply)

export async function POST(req: NextRequest) {
  // 1. Authenticate User
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any })

  // Try cookie first, then Bearer token
  let user = null;
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    user = session.user;
  } else {
    // Check for Bearer token
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const { data: { user: tokenUser } } = await supabase.auth.getUser(token);
      user = tokenUser;
    }
  }

  // 2. Check Usage Limits (if user exists)
  if (user) {
    // Check subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan_name, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const isPro = subscription && (subscription.plan_name === 'Pro' || subscription.plan_name === 'Pro Plan');

    if (!isPro) {
      // Check usage count for Free tier
      const { data: usage } = await supabase
        .from('user_usage')
        .select('usage_count')
        .eq('user_id', user.id)
        .eq('feature_name', 'flashcard_generation')
        .single();

      const currentUsage = usage?.usage_count || 0;

      // Free limit: 3 generations
      if (currentUsage >= 3) {
        return NextResponse.json({
          error: "You have reached the free limit of 3 generations. Please upgrade to continue used Ankify."
        }, { status: 403 });
      }

      // Increment usage
      const newUsage = currentUsage + 1;
      const { error: usageError } = await supabase
        .from('user_usage')
        .upsert({
          user_id: user.id,
          feature_name: 'flashcard_generation',
          usage_count: newUsage,
          last_used_at: new Date().toISOString()
        }, { onConflict: 'user_id, feature_name' });

      if (usageError) {
        console.error('Error updating usage:', usageError);
      }
    }
  } else {
    // Enforce authentication for all requests to ensure usage tracking
    return NextResponse.json({
      error: "Please sign in to the extension to generate flashcards."
    }, { status: 401 });
  }

  const { type, value } = await req.json();

  let transcript = "";
  let prompt = "";

  if (type === "youtube") {
    console.log("Processing YouTube URL:", value);

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(value)) {
      return NextResponse.json({ error: "Invalid YouTube URL. Please provide a valid YouTube video link." }, { status: 400 });
    }


    try {
      const transcriptApiKey = process.env.TRANSCRIPT_API_KEY;
      if (!transcriptApiKey) {
        return NextResponse.json({ error: "TranscriptAPI key is not configured." }, { status: 500 });
      }

      console.log("Fetching transcript from TranscriptAPI...");

      // Call TranscriptAPI to get the transcript
      const transcriptResponse = await axios.get(
        `https://transcriptapi.com/api/v2/youtube/transcript`,
        {
          params: {
            video_url: value
          },
          headers: {
            'Authorization': `Bearer ${transcriptApiKey}`
          },
          timeout: 120000 // 2 minutes timeout
        }
      );

      console.log("TranscriptAPI response received");
      console.log("Response data:", JSON.stringify(transcriptResponse.data).substring(0, 200));

      // Extract transcript text from response
      // The API returns: { video_id, language, transcript: [{ text, start, duration }, ...] }
      if (transcriptResponse.data.transcript && Array.isArray(transcriptResponse.data.transcript)) {
        // Combine all transcript segments into a single text
        transcript = transcriptResponse.data.transcript
          .map((segment: any) => segment.text || '')
          .filter((text: string) => text.trim().length > 0)
          .join(' ');
      } else if (typeof transcriptResponse.data === 'string') {
        transcript = transcriptResponse.data;
      } else if (transcriptResponse.data.text) {
        transcript = transcriptResponse.data.text;
      } else if (Array.isArray(transcriptResponse.data) && transcriptResponse.data.length > 0) {
        // If it's an array of transcript segments, combine them
        transcript = transcriptResponse.data.map((segment: any) =>
          segment.text || segment.transcript || ''
        ).join(' ');
      } else {
        console.error("Unexpected API response format:", transcriptResponse.data);
        throw new Error("Unexpected transcript format from API");
      }

      if (!transcript || transcript.trim().length === 0) {
        throw new Error("No speech could be transcribed from this video. The video may be music-only or have very unclear audio.");
      }

      if (transcript.trim().length < 50) {
        console.log("Short transcript:", transcript);
        throw new Error("Very little speech detected. The video may be mostly music or have poor audio quality.");
      }

      console.log("Transcription completed, length:", transcript.length);
      prompt = `Create Anki flashcards from this YouTube video transcript:\n\n${transcript}\n\nYouTube URL: ${value}`;

    } catch (err: any) {
      console.error("YouTube processing error:", err);

      let errorMessage = "Failed to process YouTube video: ";
      if (err.response) {
        // API error response
        const status = err.response.status;
        const data = err.response.data;
        if (status === 401 || status === 403) {
          errorMessage += "Authentication failed. Please check your TranscriptAPI key.";
        } else if (status === 404) {
          errorMessage += "Video not found or transcript unavailable.";
        } else if (status === 429) {
          errorMessage += "Rate limit exceeded. Please try again later.";
        } else {
          errorMessage += data?.message || data?.error || `API error (${status})`;
        }
      } else if (err.message.includes("timeout")) {
        errorMessage += "Processing timed out. Please try again or use a shorter video.";
      } else if (err.message.includes("transcribed") || err.message.includes("speech")) {
        errorMessage += "No clear speech detected. Try a video with clear narration or dialogue.";
      } else {
        errorMessage += err.message || "Unknown error occurred.";
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } else {
    prompt = `Create Anki flashcards from this text content:\n\n${value}`;
  }

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API key is not configured." }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });
    console.log("Starting OpenAI completion...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ANKI_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });
    const aiResult = completion.choices[0]?.message?.content || "No response from AI.";
    console.log("OpenAI completion successful");
    return NextResponse.json({ result: aiResult });
  } catch (err: any) {
    console.error("OpenAI error:", err);
    return NextResponse.json({ error: err.message || "OpenAI API error" }, { status: 500 });
  }
} 