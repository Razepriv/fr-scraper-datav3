import { NextRequest, NextResponse } from 'next/server';
import { deleteAllProperties } from '@/app/actions';

export async function DELETE(request: NextRequest) {
  try {
    const deletedCount = await deleteAllProperties();

    return NextResponse.json({ 
      success: true, 
      message: `Deleted all ${deletedCount} properties`,
      deletedCount
    });
  } catch (error) {
    console.error('Error deleting all properties:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete all properties' 
      },
      { status: 500 }
    );
  }
}
