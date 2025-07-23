import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database-adapter';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Database count endpoint called');
    const database = getDatabase();
    const properties = await database.getAllProperties();
    
    // Get the most recent properties (last 10)
    const recent = properties
      .sort((a, b) => new Date(b.scraped_at || 0).getTime() - new Date(a.scraped_at || 0).getTime())
      .slice(0, 10)
      .map(p => ({
        id: p.id,
        title: p.title || p.original_title,
        scraped_at: p.scraped_at,
        url: p.original_url
      }));
    
    return NextResponse.json({
      success: true,
      total_properties: properties.length,
      recent_properties: recent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database count endpoint error:', error);
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
