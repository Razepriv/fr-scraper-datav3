import { type Property } from '@/lib/types';

// Client-side functions that call API routes instead of server actions directly

export async function scrapeUrl(url: string): Promise<Property[] | null> {
  try {
    const response = await fetch('/api/scrape/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to scrape URL');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error scraping URL:', error);
    throw error;
  }
}

export async function scrapeHtml(html: string): Promise<Property[] | null> {
  try {
    const response = await fetch('/api/scrape/html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to scrape HTML');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error scraping HTML:', error);
    throw error;
  }
}

export async function scrapeBulk(urls: string): Promise<Property[] | null> {
  try {
    const response = await fetch('/api/scrape/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to scrape URLs');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error scraping bulk URLs:', error);
    throw error;
  }
}

export async function saveProperty(property: Property): Promise<{ success: boolean; message?: string }> {
  try {
    console.log('🚀 Client: Starting save property request');
    console.log('📄 Property data:', {
      id: property.id,
      title: property.original_title,
      url: property.original_url,
      hasDescription: !!property.description,
      hasImages: !!property.image_urls && property.image_urls.length > 0
    });

    const response = await fetch('/api/property/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(property),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      console.error('❌ Response not ok:', response.status, response.statusText);
      return {
        success: false,
        message: `Server error: ${response.status} ${response.statusText}`
      };
    }

    const result = await response.json();
    console.log('📋 Response data:', result);
    return result;
  } catch (error) {
    console.error('❌ Client error saving property:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function deleteProperty(propertyId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`/api/property/delete?id=${propertyId}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting property:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function updateProperty(property: Property): Promise<{ success: boolean; message?: string; property?: Property }> {
  try {
    const response = await fetch('/api/property/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(property),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating property:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function bulkDeleteProperties(propertyIds: string[]): Promise<{ success: boolean; message?: string; result?: any }> {
  try {
    const response = await fetch('/api/property/bulk-delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ propertyIds }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error bulk deleting properties:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function deleteAllProperties(): Promise<{ success: boolean; message?: string; deletedCount?: number }> {
  try {
    const response = await fetch('/api/property/delete-all', {
      method: 'DELETE',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting all properties:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function deleteFilteredProperties(filter: any): Promise<{ success: boolean; message?: string; result?: any }> {
  try {
    const response = await fetch('/api/property/delete-filtered', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filter),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting filtered properties:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
