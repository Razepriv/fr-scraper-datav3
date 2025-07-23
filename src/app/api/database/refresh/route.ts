import { NextRequest, NextResponse } from 'next/server';
import { refreshDatabase } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 API: Database refresh requested');
    
    const result = await refreshDatabase();
    
    if (result.success) {
      console.log(`✅ API: Database refresh successful - ${result.count} properties`);
      return NextResponse.json(result);
    } else {
      console.error('❌ API: Database refresh failed:', result.message);
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('❌ API: Database refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        count: 0
      },
      { status: 500 }
    );
  }
}
