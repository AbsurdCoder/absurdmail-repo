import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Label } from '@/models';
import { requireAuth } from '@/lib/middleware/auth';
import { z } from 'zod';

/**
 * GET /api/labels
 * List all user labels
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

    // Fetch labels
    const labels = await Label.find({ userId })
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: labels,
    });
  } catch (error) {
    console.error('List labels error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labels' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/labels
 * Create a new label
 */

const createLabelSchema = z.object({
  name: z.string().min(1, 'Label name is required').max(30),
  color: z.string().optional(),
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
    const validation = createLabelSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, color } = validation.data;

    // Connect to database
    await connectDB();

    // Check if label with same name exists
    const existingLabel = await Label.findOne({ userId, name });
    if (existingLabel) {
      return NextResponse.json(
        { error: 'Label with this name already exists' },
        { status: 409 }
      );
    }

    // Create label
    const label = await Label.create({
      userId,
      name,
      color: color || '#3B82F6',
    });

    return NextResponse.json({
      success: true,
      message: 'Label created successfully',
      data: label,
    }, { status: 201 });
  } catch (error) {
    console.error('Create label error:', error);
    return NextResponse.json(
      { error: 'Failed to create label' },
      { status: 500 }
    );
  }
}
