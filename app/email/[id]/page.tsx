'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import EmailLayout from '@/components/EmailLayout';
import { getEmail, updateEmail, deleteEmail, type Email } from '@/lib/api/emails';
import { formatDistanceToNow, format } from 'date-fns';

export default function EmailDetailPage() {
  const router = useRouter();
  const params = useParams();
  const emailId = params.id as string;

  const [email, setEmail] = useState<Email | null>(null);
  const [thread, setThread] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (emailId) {
      fetchEmail();
    }
  }, [emailId]);

  const fetchEmail = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getEmail(emailId);
      setEmail(response.data.email);
      setThread(response.data.thread || []);

      // Mark as read
      if (!response.data.email.isRead) {
        await updateEmail(emailId, { isRead: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load email');
    } finally {
      setLoading(false);
    }
  };

  const handleStarToggle = async () => {
    if (!email) return;
    try {
      await updateEmail(emailId, { isStarred: !email.isStarred });
      setEmail({ ...email, isStarred: !email.isStarred });
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Move this email to trash?')) {
      try {
        await deleteEmail(emailId);
        router.push('/inbox');
      } catch (error) {
        console.error('Failed to delete email:', error);
      }
    }
  };

  const handleReply = () => {
    // TODO: Implement reply functionality
    alert('Reply functionality coming soon!');
  };

  const handleForward = () => {
    // TODO: Implement forward functionality
    alert('Forward functionality coming soon!');
  };

  if (loading) {
    return (
      <EmailLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading email...</p>
          </div>
        </div>
      </EmailLayout>
    );
  }

  if (error || !email) {
    return (
      <EmailLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-900">Failed to load email</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
          <button
            onClick={() => router.push('/inbox')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Inbox
          </button>
        </div>
      </EmailLayout>
    );
  }

  return (
    <EmailLayout>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {/* Star */}
            <button
              onClick={handleStarToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title={email.isStarred ? 'Unstar' : 'Star'}
            >
              <svg
                className={`w-5 h-5 ${email.isStarred ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Delete"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Email */}
          <EmailMessage email={email} isMain={true} onReply={handleReply} onForward={handleForward} />

          {/* Thread */}
          {thread.length > 0 && (
            <div className="border-t-4 border-gray-200 mt-6">
              <div className="p-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">
                  {thread.length} {thread.length === 1 ? 'message' : 'messages'} in this conversation
                </h3>
              </div>
              {thread.map((threadEmail) => (
                <EmailMessage
                  key={threadEmail._id}
                  email={threadEmail}
                  isMain={false}
                  onReply={handleReply}
                  onForward={handleForward}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </EmailLayout>
  );
}

// Email Message Component
interface EmailMessageProps {
  email: Email;
  isMain: boolean;
  onReply: () => void;
  onForward: () => void;
}

function EmailMessage({ email, isMain, onReply, onForward }: EmailMessageProps) {
  const [expanded, setExpanded] = useState(isMain);

  return (
    <div className={`border-b border-gray-200 ${isMain ? 'bg-white' : 'bg-gray-50'}`}>
      {/* Email Header */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => !isMain && setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {(email.from.name || email.from.email).charAt(0).toUpperCase()}
            </div>

            {/* Sender Info */}
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <h3 className="font-semibold text-gray-900">
                  {email.from.name || email.from.email}
                </h3>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                to {email.to.map(r => r.email).join(', ')}
              </p>
              {!expanded && !isMain && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {email.textBody}
                </p>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {format(new Date(email.createdAt), 'MMM d, yyyy')}
            </p>
            <p className="text-xs text-gray-500">
              {format(new Date(email.createdAt), 'h:mm a')}
            </p>
          </div>
        </div>

        {/* Subject (only for main email) */}
        {isMain && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-900">{email.subject}</h2>
            {/* Labels */}
            {email.labels && email.labels.length > 0 && (
              <div className="flex gap-2 mt-3">
                {email.labels.map((label) => (
                  <span
                    key={label._id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${label.color}20`,
                      color: label.color,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Email Body */}
      {expanded && (
        <div className="px-6 pb-6">
          {/* HTML Body */}
          {email.htmlBody ? (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: email.htmlBody }}
            />
          ) : (
            <div className="whitespace-pre-wrap text-gray-700">{email.textBody}</div>
          )}

          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Attachments ({email.attachments.length})
              </h4>
              <div className="space-y-2">
                {email.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                      <p className="text-xs text-gray-500">
                        {(attachment.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onReply}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Reply
            </button>
            <button
              onClick={onForward}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Forward
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
