import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Folder } from '@/models';
import { requireAuth } from '@/lib/middleware/auth';
import { z } from 'zod';

/**
 * GET /api/folders
 * List all user folders
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return auth.response!;
    }

    const { userId } = auth.user;

    // Connect to database
    await connectDB();

    // Fetch folders
    const folders = await Folder.find({ userId })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: folders,
    });
  } catch (error) {
    console.error('List folders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/folders
 * Create a new custom folder
 */

const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(50),
  color: z.string().optional(),
  icon: z.string().optional(),
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
    const validation = createFolderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, color, icon } = validation.data;

    // Connect to database
    await connectDB();

    // Check if folder with same name exists
    const existingFolder = await Folder.findOne({ userId, name });
    if (existingFolder) {
      return NextResponse.json(
        { error: 'Folder with this name already exists' },
        { status: 409 }
      );
    }

    // Create folder
    const folder = await Folder.create({
      userId,
      name,
      color: color || '#6B7280',
      icon: icon || 'folder',
    });

    return NextResponse.json({
      success: true,
      message: 'Folder created successfully',
      data: folder,
    }, { status: 201 });
  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}
