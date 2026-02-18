import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Email, Thread } from '@/models';
import { User } from '@/models/User';
import { requireAuth } from '@/lib/middleware/auth';
import { sendMockEmail } from '@/lib/utils/mockSmtp';
import { z } from 'zod';

/**
 * POST /api/emails/send
 * Send a new email
 */

const recipientSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

const sendEmailSchema = z.object({
  to: z.array(recipientSchema).min(1, 'At least one recipient required'),
  cc: z.array(recipientSchema).optional(),
  bcc: z.array(recipientSchema).optional(),
  subject: z.string().min(1, 'Subject is required'),
  textBody: z.string().min(1, 'Email body is required'),
  htmlBody: z.string().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    url: z.string(),
    size: z.number(),
  })).optional(),
  inReplyTo: z.string().optional(), // Email ID being replied to
  threadId: z.string().optional(), // Existing thread ID
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
    const validation = sendEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { to, cc, bcc, subject, textBody, htmlBody, attachments, inReplyTo, threadId } = validation.data;

    // Connect to database
    await connectDB();

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Send email via mock SMTP
    const sendResult = await sendMockEmail({
      from: { email: userEmail, name: userName },
      to,
      cc,
      bcc,
      subject,
      textBody,
      htmlBody,
      attachments,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Handle threading
    let emailThreadId = threadId;
    
    if (inReplyTo) {
      // Get the original email to find its thread
      const originalEmail = await Email.findById(inReplyTo);
      if (originalEmail && originalEmail.threadId) {
        emailThreadId = originalEmail.threadId.toString();
      }
    }

    // Create or update thread
    if (!emailThreadId) {
      // Create new thread
      const allParticipants = [
        { email: userEmail, name: userName },
        ...to,
        ...(cc || []),
      ];
      
      const uniqueParticipants = Array.from(
        new Map(allParticipants.map(p => [p.email, p])).values()
      );

      const thread = await Thread.create({
        userId,
        subject,
        participants: uniqueParticipants,
        emailCount: 1,
        lastActivityAt: new Date(),
      });

      emailThreadId = thread._id.toString();
    } else {
      // Update existing thread
      await Thread.findByIdAndUpdate(emailThreadId, {
        $inc: { emailCount: 1 },
        $set: { lastActivityAt: new Date() },
      });
    }

    // Save email to database
    const email = await Email.create({
      userId,
      from: { email: userEmail, name: userName },
      to,
      cc: cc || [],
      bcc: bcc || [],
      subject,
      textBody,
      htmlBody: htmlBody || textBody,
      attachments: attachments || [],
      folder: 'sent',
      threadId: emailThreadId,
      inReplyTo: inReplyTo || null,
      messageId: sendResult.messageId,
      isDraft: false,
      isRead: true, // Sent emails are marked as read
      isStarred: false,
      labels: [],
    });

    // Populate response
    const populatedEmail = await Email.findById(email._id)
      .populate('labels', 'name color')
      .populate('threadId')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: populatedEmail,
    }, { status: 201 });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
