import { NextRequest, NextResponse } from 'next/server';
import { bulkDeleteProperties } from '@/app/actions';

export async function DELETE(request: NextRequest) {
  try {
    const { propertyIds }: { propertyIds: string[] } = await request.json();

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Property IDs array is required' },
        { status: 400 }
      );
    }

    const result = await bulkDeleteProperties(propertyIds);

    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} properties`,
      result
    });
  } catch (error) {
    console.error('Error bulk deleting properties:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete properties' 
      },
      { status: 500 }
    );
  }
}
