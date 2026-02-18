import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailRecipient {
  email: string;
  name?: string;
  type: 'to' | 'cc' | 'bcc';
}

export interface IEmailAttachment {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export interface IEmail extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fromEmail: string;
  fromName?: string;
  recipients: IEmailRecipient[];
  subject: string;
  body: string;
  bodyHtml?: string;
  attachments: IEmailAttachment[];
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'custom';
  customFolderId?: mongoose.Types.ObjectId;
  labels: mongoose.Types.ObjectId[];
  threadId?: mongoose.Types.ObjectId;
  isRead: boolean;
  isStarred: boolean;
  isDraft: boolean;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailSchema = new Schema<IEmail>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fromEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    fromName: String,
    recipients: [
      {
        email: { type: String, required: true, lowercase: true },
        name: String,
        type: { type: String, enum: ['to', 'cc', 'bcc'], required: true },
      },
    ],
    subject: {
      type: String,
      required: true,
      index: 'text',
    },
    body: {
      type: String,
      required: true,
      index: 'text',
    },
    bodyHtml: String,
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileSize: { type: Number, required: true },
        mimeType: { type: String, required: true },
      },
    ],
    folder: {
      type: String,
      enum: ['inbox', 'sent', 'drafts', 'trash', 'custom'],
      default: 'inbox',
      index: true,
    },
    customFolderId: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
    },
    labels: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Label',
      },
    ],
    threadId: {
      type: Schema.Types.ObjectId,
      ref: 'Thread',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isStarred: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDraft: {
      type: Boolean,
      default: false,
      index: true,
    },
    sentAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
EmailSchema.index({ userId: 1, folder: 1, createdAt: -1 });
EmailSchema.index({ userId: 1, isStarred: 1 });
EmailSchema.index({ userId: 1, threadId: 1 });
EmailSchema.index({ userId: 1, labels: 1 });

// Text index for search
EmailSchema.index({ subject: 'text', body: 'text' });

export const Email: Model<IEmail> =
  mongoose.models.Email || mongoose.model<IEmail>('Email', EmailSchema);
