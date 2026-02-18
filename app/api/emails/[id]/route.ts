import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Email } from '@/models/Email';
import { Thread } from '@/models';
import { requireAuth } from '@/lib/middleware/auth';

/**
 * GET /api/emails/:id
 * Get email details with full thread
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return auth.response!;
    }

    const { userId } = auth.user;
    const emailId = params.id;

    // Connect to database
    await connectDB();

    // Fetch email
    const email = await Email.findOne({ _id: emailId, userId })
      .populate('labels', 'name color')
      .populate('threadId')
      .lean();

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    // Fetch thread emails if part of a thread
    let threadEmails = [];
    if (email.threadId) {
      threadEmails = await Email.find({
        threadId: email.threadId,
        userId,
      })
        .sort({ createdAt: 1 })
        .select('-htmlBody') // Exclude HTML for thread list
        .lean();
    }

    // Mark as read if not already
    if (!email.isRead) {
      await Email.updateOne(
        { _id: emailId },
        { $set: { isRead: true } }
      );
      email.isRead = true;
    }

    return NextResponse.json({
      success: true,
      data: {
        email,
        thread: threadEmails,
      },
    });
  } catch (error) {
    console.error('Get email error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/emails/:id
 * Update email properties (read, starred, folder, labels)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return auth.response!;
    }

    const { userId } = auth.user;
    const emailId = params.id;

    // Parse request body
    const body = await request.json();
    const { isRead, isStarred, folder, labels } = body;

    // Connect to database
    await connectDB();

    // Build update object
    const update: any = {};
    
    if (typeof isRead === 'boolean') {
      update.isRead = isRead;
    }
    
    if (typeof isStarred === 'boolean') {
      update.isStarred = isStarred;
    }
    
    if (folder) {
      update.folder = folder;
    }
    
    if (Array.isArray(labels)) {
      update.labels = labels;
    }

    // Update email
    const email = await Email.findOneAndUpdate(
      { _id: emailId, userId },
      { $set: update },
      { new: true }
    )
      .populate('labels', 'name color')
      .lean();

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: email,
    });
  } catch (error) {
    console.error('Update email error:', error);
    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/emails/:id
 * Delete email (move to trash or permanent delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return auth.response!;
    }

    const { userId } = auth.user;
    const emailId = params.id;

    // Check if permanent delete
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    // Connect to database
    await connectDB();

    // Fetch email
    const email = await Email.findOne({ _id: emailId, userId });

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    if (permanent || email.folder === 'trash') {
      // Permanent delete
      await Email.deleteOne({ _id: emailId });
      
      return NextResponse.json({
        success: true,
        message: 'Email permanently deleted',
      });
    } else {
      // Move to trash
      email.folder = 'trash';
      await email.save();
      
      return NextResponse.json({
        success: true,
        message: 'Email moved to trash',
        data: email,
      });
    }
  } catch (error) {
    console.error('Delete email error:', error);
    return NextResponse.json(
      { error: 'Failed to delete email' },
      { status: 500 }
    );
  }
}
