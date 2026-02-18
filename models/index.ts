import mongoose, { Schema, Document, Model } from 'mongoose';

// Thread Model
export interface IThread extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  subject: string;
  participants: string[]; // email addresses
  lastEmailAt: Date;
  emailCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ThreadSchema = new Schema<IThread>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
    },
    participants: [String],
    lastEmailAt: {
      type: Date,
      required: true,
      index: true,
    },
    emailCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

ThreadSchema.index({ userId: 1, lastEmailAt: -1 });

export const Thread: Model<IThread> =
  mongoose.models.Thread || mongoose.model<IThread>('Thread', ThreadSchema);

// Folder Model
export interface IFolder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    color: String,
    icon: String,
  },
  { timestamps: true }
);

FolderSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Folder: Model<IFolder> =
  mongoose.models.Folder || mongoose.model<IFolder>('Folder', FolderSchema);

// Label Model
export interface ILabel extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabelSchema = new Schema<ILabel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
      default: '#3b82f6',
    },
  },
  { timestamps: true }
);

LabelSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Label: Model<ILabel> =
  mongoose.models.Label || mongoose.model<ILabel>('Label', LabelSchema);

// Contact Model
export interface IContact extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    name: String,
    phone: String,
    company: String,
    jobTitle: String,
    notes: String,
  },
  { timestamps: true }
);

ContactSchema.index({ userId: 1, email: 1 }, { unique: true });
ContactSchema.index({ userId: 1, name: 1 });

export const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);

// Calendar Event Model
export interface ICalendarEvent extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  color?: string;
  attendees: string[]; // email addresses
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    location: String,
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    attendees: [String],
  },
  { timestamps: true }
);

CalendarEventSchema.index({ userId: 1, startTime: 1 });
CalendarEventSchema.index({ userId: 1, endTime: 1 });

export const CalendarEvent: Model<ICalendarEvent> =
  mongoose.models.CalendarEvent ||
  mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);

// Export all models
export { User } from './User';
export { Email } from './Email';
