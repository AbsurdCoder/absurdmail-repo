import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Email } from '@/models/Email';
import { requireAuth } from '@/lib/middleware/auth';
import { z } from 'zod';

/**
 * POST /api/emails/search
 * Search emails with full-text search and filters
 */

const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  folder: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  hasAttachments: z.boolean().optional(),
  isStarred: z.boolean().optional(),
  isRead: z.boolean().optional(),
  dateFrom: z.string().optional(), // ISO date string
  dateTo: z.string().optional(), // ISO date string
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return auth.response!;
    }

    const { userId } = auth.user;

    // Parse and validate request body
    const body = await request.json();
    const validation = searchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      query,
      folder,
      from,
      to,
      hasAttachments,
      isStarred,
      isRead,
      dateFrom,
      dateTo,
      page,
      limit,
    } = validation.data;

    const skip = (page - 1) * Math.min(limit, 100);

    // Connect to database
    await connectDB();

    // Build search query
    const searchQuery: any = {
      userId,
      $text: { $search: query }, // Full-text search
    };

    if (folder) {
      searchQuery.folder = folder;
    }

    if (from) {
      searchQuery['from.email'] = { $regex: from, $options: 'i' };
    }

    if (to) {
      searchQuery['to.email'] = { $regex: to, $options: 'i' };
    }

    if (hasAttachments !== undefined) {
      if (hasAttachments) {
        searchQuery.attachments = { $exists: true, $ne: [] };
      } else {
        searchQuery.$or = [
          { attachments: { $exists: false } },
          { attachments: { $size: 0 } },
        ];
      }
    }

    if (isStarred !== undefined) {
      searchQuery.isStarred = isStarred;
    }

    if (isRead !== undefined) {
      searchQuery.isRead = isRead;
    }

    if (dateFrom || dateTo) {
      searchQuery.createdAt = {};
      if (dateFrom) {
        searchQuery.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        searchQuery.createdAt.$lte = new Date(dateTo);
      }
    }

    // Execute search with text score
    const emails = await Email.find(searchQuery, {
      score: { $meta: 'textScore' },
    })
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .skip(skip)
      .limit(Math.min(limit, 100))
      .populate('labels', 'name color')
      .select('-htmlBody')
      .lean();

    // Get total count
    const total = await Email.countDocuments(searchQuery);

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
    console.error('Search emails error:', error);
    return NextResponse.json(
      { error: 'Failed to search emails' },
      { status: 500 }
    );
  }
}
