import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Email } from '@/models/Email';
import { requireAuth } from '@/lib/middleware/auth';
import { z } from 'zod';

/**
 * GET /api/emails
 * List user's emails with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return auth.response!;
    }

    const { userId } = auth.user;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'inbox';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const labelId = searchParams.get('labelId');
    const isRead = searchParams.get('isRead');
    const isStarred = searchParams.get('isStarred');
    
    const skip = (page - 1) * limit;

    // Connect to database
    await connectDB();

    // Build query
    const query: any = {
      userId,
      folder,
    };

    if (labelId) {
      query.labels = labelId;
    }

    if (isRead !== null && isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    if (isStarred !== null && isStarred !== undefined) {
      query.isStarred = isStarred === 'true';
    }

    // Fetch emails with pagination
    const emails = await Email.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('labels', 'name color')
      .populate('threadId', 'subject participants emailCount')
      .select('-htmlBody') // Exclude HTML body for list view
      .lean();

    // Get total count
    const total = await Email.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: emails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('List emails error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}
