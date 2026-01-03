import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import ytdl from "ytdl-core";
import axios from "axios";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ANKI_SYSTEM_PROMPT = `You are a world-class Anki flashcard creator that helps students create flashcards that help them remember facts, concepts, and ideas from videos. You will be given a video or document or snippet.

1. Identify key high-level concepts and ideas presented, including relevant equations. If the video is math or physics-heavy, focus on concepts. If the video isn't heavy on concepts, focus on facts.
2. Then use your own knowledge of the concept, ideas, or facts to flesh out any additional details (eg, relevant facts, dates, and equations) to ensure the flashcards are self-contained.
3. Make question-answer cards based on the content.
4. Keep the questions and answers roughly in the same order as they appear in the content itself.
5. If a video is provided, include timestamps in the question field in [ ] brackets at the end of the questions to the segment of the video that's relevant.

Output Format:
- Do not have the first row being "Question" and "Answer".
- Each flashcard should be on a new line and use the pipe separator | to separate the question and answer.
- When writing math, wrap any math with the \\( ... \\) tags [eg, \\( a^2+b^2=c^2 \\) ] . By default this is inline math. For block math, use \\[ ... \\]. Decide when formatting each card.
- When writing chemistry equations, use the format \\( \\ce{C6H12O6 + 6O2 -> 6H2O + 6CO2} \\) where the \\ce is required for MathJax chemistry.`;

export async function POST(req: NextRequest) {
  const { type, value } = await req.json();

  let transcript = "";
  let prompt = "";

  if (type === "youtube") {
    console.log("Processing YouTube URL:", value);
    
    // Validate YouTube URL
    if (!ytdl.validateURL(value)) {
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
    console.log("Starting OpenAI completion...");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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