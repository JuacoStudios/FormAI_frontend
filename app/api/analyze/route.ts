import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let payload: any;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData
      const formData = await request.formData();
      const imageFile = formData.get('image') as File;
      
      if (!imageFile) {
        return NextResponse.json(
          { error: 'No image provided' },
          { status: 400 }
        );
      }
      
      // Convert File to base64
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      payload = { image: base64 };
      
    } else {
      // Handle JSON
      const body = await request.json();
      const { image } = body;
      
      if (!image) {
        return NextResponse.json(
          { error: 'No image provided' },
          { status: 400 }
        );
      }
      
      payload = { image };
    }

    // Get user session for identity
    const session = await getServerSession(authOptions);
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add user email if session exists
    if (session?.user?.email) {
      headers['x-user-email'] = session.user.email;
    }

    // Call backend API
    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Pass through specific error codes unchanged
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}