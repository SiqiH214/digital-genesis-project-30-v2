import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling Gemini API for photo analysis...');

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this person's photo and provide a detailed biometric and personality profile. 
                
IMPORTANT: First, check if there is a clear, visible human face in the image. If no face is detected or the face is not clearly visible, respond with:
{
  "faceDetected": false,
  "error": "No face detected"
}

If a face IS detected, return your analysis in the following JSON format:
{
  "faceDetected": true,
  "age": "estimated age or age range like 20-25, 25-30, etc.",
  "gender": "perceived gender presentation (Male, Female, Non-binary)",
  "ethnicity": "specific ethnicity like East Asian, South Asian, African, European, Middle Eastern, Hispanic/Latino, Mixed, etc. - be specific and accurate",
  "eyeColor": "specific eye color like Brown, Dark Brown, Hazel, Green, Blue, Gray, Amber, or combination",
  "hairColor": "specific hair color like Black, Dark Brown, Light Brown, Blonde, Red, Auburn, Gray, White, Dyed [color], or combination",
  "hairStyle": "brief description like Short, Medium, Long, Curly, Straight, Wavy, Buzz cut, etc.",
  "skinTone": "specific description like Fair, Light, Medium, Tan, Olive, Brown, Dark Brown, Deep",
  "facialHair": "None, Stubble, Beard, Mustache, Goatee, or description",
  "emotion": "primary emotional state detected",
  "occupation": "potential occupation based on appearance and context",
  "personality": "brief personality assessment based on visual cues",
  "confidence": "overall confidence level of the analysis (low/medium/high)"
}

Be professional, respectful, and base your analysis only on visible characteristics. For mixed or nuanced features, provide detailed descriptions. Avoid stereotyping.`
              },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Data
                }
              }
            ]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze photo', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Gemini API response received');

    // Extract the generated text from Gemini response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.error('Unexpected response format:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'Invalid response format from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to extract JSON from the response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = generatedText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       generatedText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        analysis = JSON.parse(jsonStr);
        
        // Check if face was detected
        if (analysis.faceDetected === false) {
          return new Response(
            JSON.stringify({ error: 'No face detected or face not clearly visible in the image' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Fallback: create a structured response from the text
        analysis = {
          age: "Analysis in progress",
          gender: "Detected",
          ethnicity: "Analyzing",
          eyeColor: "Analyzing",
          hairColor: "Analyzing",
          hairStyle: "Analyzing",
          skinTone: "Analyzing",
          facialHair: "None",
          emotion: "Neutral",
          occupation: "Professional",
          personality: generatedText.substring(0, 200),
          confidence: "medium"
        };
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      // Return the raw text in a structured format
      analysis = {
        age: "20-30",
        gender: "Not specified",
        ethnicity: "Not detected",
        eyeColor: "Not detected",
        hairColor: "Not detected",
        hairStyle: "Not detected",
        skinTone: "Not detected",
        facialHair: "None",
        emotion: "Neutral",
        occupation: "Professional",
        personality: generatedText.substring(0, 200),
        confidence: "medium"
      };
    }

    console.log('Analysis complete:', analysis);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-photo function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
