import { NextRequest, NextResponse } from 'next/server';
import { deleteFilteredProperties } from '@/app/actions';
import { type ExportFilter } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const filter: ExportFilter = await request.json();

    const result = await deleteFilteredProperties(filter);

    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} properties`,
      result
    });
  } catch (error) {
    console.error('Error deleting filtered properties:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete filtered properties' 
      },
      { status: 500 }
    );
  }
}
