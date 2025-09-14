import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  // Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // Parse request body
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

    // For now, return a mock response
    // In production, you would integrate with a real image analysis service
    return new Response(
      JSON.stringify({
        explanation: "This appears to be a standard weight bench with adjustable settings. It's suitable for various exercises including bench press, seated exercises, and incline/decline movements.",
      }),
      {
        status: 200,
        headers,
      }
    );

  } catch (error) {
    console.error('Error analyzing equipment:', error);
    
    // Always return JSON, even for errors
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