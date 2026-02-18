import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Email } from '@/models/Email';
import { requireAuth } from '@/lib/middleware/auth';
import { z } from 'zod';

/**
 * POST /api/emails/draft
 * Save email as draft
 */

const recipientSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

const draftEmailSchema = z.object({
  to: z.array(recipientSchema).optional().default([]),
  cc: z.array(recipientSchema).optional().default([]),
  bcc: z.array(recipientSchema).optional().default([]),
  subject: z.string().optional().default(''),
  textBody: z.string().optional().default(''),
  htmlBody: z.string().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    url: z.string(),
    size: z.number(),
  })).optional().default([]),
  draftId: z.string().optional(), // Existing draft ID to update
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return auth.response!;
    }

    const { userId, email: userEmail, name: userName } = auth.user;

    // Parse and validate request body
    const body = await request.json();
    const validation = draftEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { to, cc, bcc, subject, textBody, htmlBody, attachments, draftId } = validation.data;

    // Connect to database
    await connectDB();

    let email;

    if (draftId) {
      // Update existing draft
      email = await Email.findOneAndUpdate(
        { _id: draftId, userId, isDraft: true },
        {
          $set: {
            to,
            cc,
            bcc,
            subject,
            textBody,
            htmlBody: htmlBody || textBody,
            attachments,
            updatedAt: new Date(),
          },
        },
        { new: true }
      )
        .populate('labels', 'name color')
        .lean();

      if (!email) {
        return NextResponse.json(
          { error: 'Draft not found' },
          { status: 404 }
        );
      }
    } else {
      // Create new draft
      email = await Email.create({
        userId,
        from: { email: userEmail, name: userName },
        to,
        cc,
        bcc,
        subject,
        textBody,
        htmlBody: htmlBody || textBody,
        attachments,
        folder: 'drafts',
        isDraft: true,
        isRead: true,
        isStarred: false,
        labels: [],
      });

      email = await Email.findById(email._id)
        .populate('labels', 'name color')
        .lean();
    }

    return NextResponse.json({
      success: true,
      message: draftId ? 'Draft updated' : 'Draft saved',
      data: email,
    }, { status: draftId ? 200 : 201 });
  } catch (error) {
    console.error('Save draft error:', error);
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}
