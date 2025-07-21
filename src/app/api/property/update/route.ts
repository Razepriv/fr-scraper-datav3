import { NextRequest, NextResponse } from 'next/server';
import { updateProperty } from '@/app/actions';
import { type Property } from '@/lib/types';

export async function PUT(request: NextRequest) {
  try {
    const property: Property = await request.json();

    if (!property.id) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    await updateProperty(property);

    return NextResponse.json({ 
      success: true, 
      message: 'Property updated successfully',
      property 
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update property' 
      },
      { status: 500 }
    );
  }
}
