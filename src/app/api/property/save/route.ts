import { NextRequest, NextResponse } from 'next/server';
import { saveProperty } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const property = await request.json();
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property data is required' },
        { status: 400 }
      );
    }

    const result = await saveProperty(property);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Save property API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
