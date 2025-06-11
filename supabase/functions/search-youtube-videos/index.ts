
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get('GROQ_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, level } = await req.json();

    console.log('Searching YouTube videos for:', { topic, level });

    if (!groqApiKey) {
      console.log('GROQ API key not found');
      throw new Error('GROQ API key not configured');
    }

    const prompt = `You are an educational content curator. Find 1 high-quality YouTube educational video about "${topic}" suitable for ${level} level learners.

Focus on these reputable educational channels:
- Khan Academy
- Math Antics  
- Numberock
- MashUp Math
- Professor Leonard
- 3Blue1Brown
- Crash Course
- TED-Ed
- Organic Chemistry Tutor
- Math & Learning Videos 4 Kids

For the topic "${topic}" at ${level} level, provide exactly 1 educational video recommendation in this JSON format:
{
  "video": {
    "title": "Clear, descriptive title about ${topic}",
    "videoId": "real-youtube-video-id",
    "description": "Why this video is perfect for ${level} learners studying ${topic}",
    "duration": "Approximate duration"
  }
}

IMPORTANT: Only return videos that are actually educational and related to "${topic}". Do not suggest music videos, entertainment content, or unrelated videos. Focus on actual educational content from the channels listed above.

Ensure the videoId is a real 11-character YouTube video ID from educational channels. The video should match the ${level} difficulty level and be directly related to ${topic}.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content curator specializing in finding high-quality YouTube educational videos. Always respond with valid JSON format containing real YouTube video IDs from educational channels only. Never suggest music videos or non-educational content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GROQ API error ${response.status}:`, errorText);
      throw new Error(`GROQ API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('GROQ response:', content);

    // Parse the JSON response
    let videoRecommendation;
    try {
      videoRecommendation = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse GROQ response:', parseError);
      console.log('Raw response:', content);
      throw new Error('Failed to parse video recommendation');
    }

    // Validate that we have a video in the response
    if (!videoRecommendation.video) {
      throw new Error('No video found in GROQ response');
    }

    return new Response(JSON.stringify({
      success: true,
      recommendation: videoRecommendation.video
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in search-youtube-videos function:', error);
    
    // Enhanced fallback with better educational content
    const { topic, level } = await req.json().catch(() => ({ topic: 'Mathematics', level: 'beginner' }));
    
    // Educational fallback video that is actually educational
    const fallbackVideo = {
      title: `${topic} - Khan Academy Tutorial`,
      videoId: 'u_nd9IVKoR4', // Khan Academy intro to algebra
      description: `A comprehensive introduction to ${topic} concepts for ${level} learners from Khan Academy`,
      duration: '10-15 minutes'
    };

    return new Response(JSON.stringify({
      success: true,
      recommendation: fallbackVideo,
      fallback: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
