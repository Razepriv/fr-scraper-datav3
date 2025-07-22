import { NextRequest, NextResponse } from 'next/server';
import { saveProperty } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const property = await request.json();
    
    if (!property) {
      console.log('API: Property data is missing');
      return NextResponse.json(
        { success: false, error: 'Property data is required' },
        { status: 400 }
      );
    }

    console.log(`API: Saving property: ${property.original_title}`);
    const result = await saveProperty(property);
    
    if (!result.success) {
      console.log(`API: Failed to save property: ${result.message}`);
    } else {
      console.log(`API: Successfully saved property`);
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API: Save property error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error saving property' 
      },
      { status: 500 }
    );
  }
}
