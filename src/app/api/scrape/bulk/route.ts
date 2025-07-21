import { NextRequest, NextResponse } from 'next/server';
import { scrapeBulk } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();
    
    if (!urls) {
      return NextResponse.json(
        { error: 'URLs are required' },
        { status: 400 }
      );
    }

    const result = await scrapeBulk(urls);
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('Scrape bulk API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
