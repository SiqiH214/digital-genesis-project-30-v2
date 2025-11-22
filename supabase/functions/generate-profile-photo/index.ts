import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      originalImageBase64, 
      name, 
      gender, 
      ethnicity,
      eyeColor,
      hairColor,
      hairStyle,
      skinTone: userSkinTone,
      facialHair,
      age,
      occupation,
      customPrompt
    } = await req.json();
    
    if (!originalImageBase64) {
      throw new Error('Original image is required');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    // Use custom prompt if provided, otherwise use default
    let prompt;
    if (customPrompt) {
      prompt = customPrompt;
    } else {
      // Determine styling based on attributes
      const hairstyle = `${hairColor || 'natural'} ${hairStyle || 'styled hair'}`;
      const expressionStyle = 'confident and magnetic';
      const skinTone = `${ethnicity} with ${userSkinTone || 'natural'} skin tone`;
      const outfitStyle = occupation || 'contemporary minimalist';
      const corePersona = `${age}-year-old ${gender} professional`;
      const energySignature = 'charismatic and refined';
      const facialFeatures = `${eyeColor || 'natural'} eyes${facialHair && facialHair !== 'None' ? `, ${facialHair}` : ''}`;

      // Build the detailed prompt
      prompt = `High-fashion cinematic editorial portrait transformation. Transform this person into a luxury influencer aesthetic while preserving their core identity and facial features exactly.

Person: ${name}, a ${gender} ${ethnicity}, age ${age}
Distinctive features: ${facialFeatures}
Hair: ${hairstyle}, styled with sculptural softness and natural motion
Expression: ${expressionStyle} — magnetic, introspective, quietly dominant
Skin tone: ${skinTone}, luminous with realistic matte finish and fine detail texture
Lighting: Professional 10,000K directional studio lighting with sculptural contrast and cinematic falloff, emphasizing facial architecture
Background: clean white or gradient luminous background for luxury editorial tone
Outfit: ${outfitStyle}, reinterpreted as high-fashion — minimal, architectural, elevated
Core persona: ${corePersona}
Energy signature: ${energySignature}

Overall mood: ultra-refined and artistic — the aura of a modern influencer photographed for a global brand campaign. The image radiates cultural awareness, quiet power, and elegance. 

CRITICAL: Preserve the person's exact facial features, bone structure, and identity from the original image. Only enhance the styling, lighting, and presentation quality.

Shot on 85mm f/1.4 lens, 8K resolution, luxury-grade diffusion and precision light control.`;
    }

    console.log('Generating profile photo with prompt:', prompt);

    // Extract base64 data from data URL if needed
    const base64Data = originalImageBase64.includes('base64,') 
      ? originalImageBase64.split('base64,')[1] 
      : originalImageBase64;

    // Call Gemini API using the simpler structure like the SDK
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { 
                inlineData: { 
                  mimeType: "image/jpeg", 
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
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');

    // Iterate through parts to find the image (like the SDK example)
    let editedImageUrl;
    const candidates = data.candidates || [];
    
    for (const candidate of candidates) {
      const parts = candidate?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/jpeg';
          editedImageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
      if (editedImageUrl) break;
    }

    if (!editedImageUrl) {
      // Log what we got instead
      const textParts = candidates.flatMap((c: any) => 
        (c?.content?.parts || []).filter((p: any) => p?.text).map((p: any) => p.text)
      );
      if (textParts.length > 0) {
        console.warn('Gemini returned text instead of image:', textParts.join(' '));
      }
      console.error('Full Gemini response:', JSON.stringify(data));
      throw new Error('Gemini API did not return an image. The model may not support image generation with the current configuration.');
    }

    console.log('Profile photo generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        editedImageUrl,
        message: 'Profile photo generated successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-profile-photo function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
