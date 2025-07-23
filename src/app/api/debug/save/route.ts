import { NextRequest, NextResponse } from 'next/server';
import { debugSaveProperty } from '@/lib/debug-save';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Debug save property endpoint called');
    const result = await debugSaveProperty();
    
    return NextResponse.json({
      success: true,
      debug: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
