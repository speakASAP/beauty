import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

interface InstagramPost {
  id: string;
  media_type: string;
  media_url: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  thumbnail_url?: string;
}

/**
 * GET /api/instagram?username=yaraspace_hairspa&limit=4
 * Fetches Instagram posts for a given username
 * Note: This requires Instagram Basic Display API setup
 * For now, returns mock data structure that can be replaced with actual API calls
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username') || 'yaraspace_hairspa';
    const limit = parseInt(searchParams.get('limit') || '4', 10);

    // Check if Instagram API credentials are configured
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const userId = process.env.INSTAGRAM_USER_ID;

    if (!accessToken || !userId) {
      // Return empty array if credentials not configured
      // In production, you would set up Instagram Basic Display API
      console.warn('Instagram API credentials not configured. Returning empty array.');
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Instagram API not configured'
      });
    }

    // Fetch posts from Instagram Basic Display API
    try {
      const response = await fetch(
        `https://graph.instagram.com/${userId}/media?fields=id,media_type,media_url,permalink,caption,timestamp,thumbnail_url&access_token=${accessToken}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform Instagram API response to our format
      const posts: InstagramPost[] = (data.data || []).map((post: any) => ({
        id: post.id,
        media_type: post.media_type,
        media_url: post.media_url,
        permalink: post.permalink,
        caption: post.caption || '',
        timestamp: post.timestamp,
        thumbnail_url: post.thumbnail_url || post.media_url
      }));

      return NextResponse.json({
        success: true,
        data: posts
      });
    } catch (apiError: any) {
      console.error('Error fetching from Instagram API:', apiError);
      // Return empty array on API error
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Failed to fetch Instagram posts'
      });
    }
  } catch (error: any) {
    console.error('Error in Instagram API route:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}
