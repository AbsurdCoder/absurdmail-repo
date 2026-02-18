'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { listEmails, updateEmail, deleteEmail, type Email, type ListEmailsParams } from '@/lib/api/emails';
import { formatDistanceToNow } from 'date-fns';

interface EmailListProps {
  folder?: string;
  labelId?: string;
  isStarred?: boolean;
  title: string;
  emptyMessage?: string;
}

export default function EmailList({ folder, labelId, isStarred, title, emptyMessage }: EmailListProps) {
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchEmails();
  }, [page, folder, labelId, isStarred]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const params: ListEmailsParams = { page, limit: 20 };
      if (folder) params.folder = folder;
      if (labelId) params.labelId = labelId;
      if (isStarred !== undefined) params.isStarred = isStarred;

      const response = await listEmails(params);
      setEmails(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = (emailId: string) => {
    router.push(`/email/${emailId}`);
  };

  const handleStarToggle = async (e: React.MouseEvent, emailId: string, starred: boolean) => {
    e.stopPropagation();
    try {
      await updateEmail(emailId, { isStarred: !starred });
      setEmails(emails.map(email => 
        email._id === emailId ? { ...email, isStarred: !starred } : email
      ));
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, emailId: string) => {
    e.stopPropagation();
    try {
      await deleteEmail(emailId);
      setEmails(emails.filter(email => email._id !== emailId));
    } catch (error) {
      console.error('Failed to delete email:', error);
    }
  };

  const toggleSelectEmail = (emailId: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(emailId)) {
      newSelected.delete(emailId);
    } else {
      newSelected.add(emailId);
    }
    setSelectedEmails(newSelected);
  };

  const selectAll = () => {
    if (selectedEmails.size === emails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(emails.map(e => e._id)));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={fetchEmails}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Refresh"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {selectedEmails.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 p-3 flex items-center gap-3">
          <span className="text-sm text-blue-900 font-medium">
            {selectedEmails.size} selected
          </span>
          <button
            onClick={() => setSelectedEmails(new Set())}
            className="text-sm text-blue-700 hover:text-blue-900"
          >
            Clear
          </button>
        </div>
      )}

      {/* Email List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading emails...</p>
            </div>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-lg font-medium">{emptyMessage || 'No emails found'}</p>
          </div>
        ) : (
          <div>
            {/* Select All */}
            <div className="border-b border-gray-200 p-3 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedEmails.size === emails.length}
                onChange={selectAll}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-600">Select all</span>
            </div>

            {/* Email Items */}
            {emails.map((email) => (
              <EmailItem
                key={email._id}
                email={email}
                selected={selectedEmails.has(email._id)}
                onSelect={() => toggleSelectEmail(email._id)}
                onClick={() => handleEmailClick(email._id)}
                onStar={(e) => handleStarToggle(e, email._id, email.isStarred)}
                onDelete={(e) => handleDelete(e, email._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border-t border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// Email Item Component
interface EmailItemProps {
  email: Email;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onStar: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

function EmailItem({ email, selected, onSelect, onClick, onStar, onDelete }: EmailItemProps) {
  return (
    <div
      className={`border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition ${
        !email.isRead ? 'bg-blue-50' : ''
      } ${selected ? 'bg-blue-100' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 w-4 h-4 text-blue-600 rounded"
        />

        {/* Star */}
        <button onClick={onStar} className="mt-1">
          <svg
            className={`w-5 h-5 ${email.isStarred ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        {/* Email Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!email.isRead ? 'font-semibold' : 'font-medium'} text-gray-900 truncate`}>
                {email.from.name || email.from.email}
              </p>
              <p className={`text-sm ${!email.isRead ? 'font-medium' : ''} text-gray-700 truncate mt-1`}>
                {email.subject}
              </p>
              <p className="text-sm text-gray-500 truncate mt-1">
                {email.textBody.substring(0, 100)}...
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })}
              </span>
              <button onClick={onDelete} className="p-1 hover:bg-gray-200 rounded" title="Delete">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Labels */}
          {email.labels && email.labels.length > 0 && (
            <div className="flex gap-2 mt-2">
              {email.labels.map((label) => (
                <span
                  key={label._id}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
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
      </div>
    </div>
  );
}
