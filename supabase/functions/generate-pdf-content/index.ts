
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, contentLevel, preferences } = await req.json()
    console.log(`Generating PDF content for topic: ${topic}, level: ${contentLevel}`)

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured')
    }

    const prompt = `Generate comprehensive educational content for the topic: "${topic}"
    
    Content Level: ${contentLevel}
    User Preferences: ${preferences}
    
    Please create detailed, well-structured content that includes:
    - Clear explanations appropriate for ${contentLevel} level
    - Real-world examples and applications
    - Key concepts and definitions
    - Practice exercises or examples
    - Summary points
    
    Format the content with proper headings, subheadings, and bullet points.
    Make it comprehensive enough for a PDF document (minimum 1000 words).
    Tailor the complexity and examples to match the ${contentLevel} level and incorporate the user preferences: ${preferences}`

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    const groqData = await groqResponse.json()
    console.log('GROQ Response received')

    if (!groqData.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from GROQ API')
    }

    const generatedContent = groqData.choices[0].message.content
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        content: generatedContent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
