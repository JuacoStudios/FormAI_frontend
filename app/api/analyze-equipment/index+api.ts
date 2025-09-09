import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { config } from '../../config';
import { buildApiUrl } from '../../src/lib/url';

export async function POST(request: Request) {
  // CORS headers are handled by the backend (Render)
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json().catch(() => ({}));
    const { image } = body;

    if (!image) {
      return new Response(
        JSON.stringify({ 
          error: 'No image provided' 
        }), 
        { 
          status: 400,
          headers,
        }
      );
    }

    // Call OpenAI Vision API using centralized config
    const openaiResponse = await fetch(buildApiUrl(config.backend.apiBaseUrl, 'scan'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
           
                text: 'What gym equipment is shown in this image? Provide a brief, clear explanation of how to use it properly. Keep the response concise and focused on proper form and usage.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(errorData.error?.message || 'Failed to analyze image');
    }

    const data = await openaiResponse.json();
    const explanation = data.choices[0]?.message?.content;

    if (!explanation) {
      throw new Error('No explanation received from OpenAI');
    }

    return new Response(
      JSON.stringify({ explanation }),
      {
        status: 200,
        headers,
      }
    );

  } catch (error) {
    console.error('Error analyzing equipment:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze image',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers,
      }
    );
  }
}