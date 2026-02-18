import { apiClient } from './client';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface Email {
  _id: string;
  from: EmailRecipient;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  textBody: string;
  htmlBody?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
  }>;
  folder: string;
  isDraft: boolean;
  isRead: boolean;
  isStarred: boolean;
  labels: Array<{ _id: string; name: string; color: string }>;
  threadId?: string;
  inReplyTo?: string;
  messageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListEmailsParams {
  folder?: string;
  page?: number;
  limit?: number;
  labelId?: string;
  isRead?: boolean;
  isStarred?: boolean;
}

export interface SendEmailData {
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  textBody: string;
  htmlBody?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
  }>;
  inReplyTo?: string;
  threadId?: string;
}

export interface SearchEmailsData {
  query: string;
  folder?: string;
  from?: string;
  to?: string;
  hasAttachments?: boolean;
  isStarred?: boolean;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// List emails
export const listEmails = async (params: ListEmailsParams = {}) => {
  const response = await apiClient.get('/emails', { params });
  return response.data;
};

// Get email details
export const getEmail = async (id: string) => {
  const response = await apiClient.get(`/emails/${id}`);
  return response.data;
};

// Send email
export const sendEmail = async (data: SendEmailData) => {
  const response = await apiClient.post('/emails/send', data);
  return response.data;
};

// Save draft
export const saveDraft = async (data: Partial<SendEmailData> & { draftId?: string }) => {
  const response = await apiClient.post('/emails/draft', data);
  return response.data;
};

// Update email
export const updateEmail = async (
  id: string,
  data: {
    isRead?: boolean;
    isStarred?: boolean;
    folder?: string;
    labels?: string[];
  }
) => {
  const response = await apiClient.put(`/emails/${id}`, data);
  return response.data;
};

// Delete email
export const deleteEmail = async (id: string, permanent: boolean = false) => {
  const response = await apiClient.delete(`/emails/${id}`, {
    params: { permanent },
  });
  return response.data;
};

// Search emails
export const searchEmails = async (data: SearchEmailsData) => {
  const response = await apiClient.post('/emails/search', data);
  return response.data;
};
