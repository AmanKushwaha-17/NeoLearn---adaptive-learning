
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { action, topic, mastery, question, answer, userId, topicId } = await req.json()
    console.log(`Processing ${action} request for topic: ${topic}`)

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured')
    }

    if (action === 'generate_question') {
      let level = "easy"
      if (mastery < 0.3) {
        level = "easy"
      } else if (mastery < 0.7) {
        level = "intermediate"
      } else {
        level = "hard"
      }

      const prompt = `Generate a completely new and unique ${level} difficulty multiple-choice question on the topic: ${topic}.
      Make sure the question is different from any previous ones and is randomly chosen from the entire scope of this topic.
      The question must have exactly 4 options, with one correct answer.
      Avoid using repetitive patterns or very similar wording from past questions.

        {
            "question": "<question text>",
            "options": ["option1", "option2", "option3", "option4"],
            "correct_answer": "<correct option>"
        }`

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 1,
          max_tokens: 500
        })
      })

      const groqData = await groqResponse.json()
      console.log('GROQ Response:', groqData)

      if (!groqData.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from GROQ API')
      }

      const questionData = JSON.parse(groqData.choices[0].message.content.trim())
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          question: questionData,
          level: level 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'evaluate_answer') {
      const prompt = `Question: ${question}
        Student Answer: ${answer}
        Topic: ${topic}

        Evaluate this answer and give:
        1. A score between 0 and 1
        2. Brief feedback
        3. Correction if needed

        Return only JSON like this: {"score": 0.8, "feedback": "Good job!", "correction": "None needed"}`

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 300
        })
      })

      const groqData = await groqResponse.json()
      const evaluation = JSON.parse(groqData.choices[0].message.content.trim())

      // Update mastery level
      const isCorrect = evaluation.score >= 0.7
      const { data: masteryData, error: masteryError } = await supabaseClient
        .rpc('update_mastery_level', {
          user_uuid: userId,
          topic_uuid: topicId,
          is_correct: isCorrect
        })

      if (masteryError) {
        console.error('Error updating mastery:', masteryError)
      }

      // Update streak
      if (isCorrect) {
        const { error: streakError } = await supabaseClient
          .rpc('update_user_streak', {
            user_uuid: userId
          })

        if (streakError) {
          console.error('Error updating streak:', streakError)
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          evaluation,
          newMastery: masteryData || mastery
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')

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
