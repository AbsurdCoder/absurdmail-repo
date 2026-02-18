'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import EmailLayout from '@/components/EmailLayout';
import { sendEmail, saveDraft } from '@/lib/api/emails';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function ComposePage() {
  const router = useRouter();
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState('');

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link'],
      ['clean'],
    ],
  };

  const parseEmails = (emailString: string) => {
    return emailString
      .split(',')
      .map(e => e.trim())
      .filter(e => e)
      .map(email => ({ email, name: email.split('@')[0] }));
  };

  const handleSend = async () => {
    setError('');

    if (!to.trim()) {
      setError('Please enter at least one recipient');
      return;
    }

    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    setSending(true);

    try {
      await sendEmail({
        to: parseEmails(to),
        cc: cc ? parseEmails(cc) : undefined,
        bcc: bcc ? parseEmails(bcc) : undefined,
        subject,
        textBody: body.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        htmlBody: body,
      });

      router.push('/inbox');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      await saveDraft({
        to: to ? parseEmails(to) : [],
        cc: cc ? parseEmails(cc) : undefined,
        bcc: bcc ? parseEmails(bcc) : undefined,
        subject,
        textBody: body.replace(/<[^>]*>/g, ''),
        htmlBody: body,
      });
      router.push('/drafts');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleDiscard = () => {
    if (confirm('Are you sure you want to discard this email?')) {
      router.push('/inbox');
    }
  };

  return (
    <EmailLayout>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">New Message</h2>
          <button
            onClick={handleDiscard}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Discard"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Compose Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* To Field */}
          <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
            <label className="text-sm font-medium text-gray-700 w-16">To:</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com, another@example.com"
              className="flex-1 text-sm outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCc(!showCc)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Cc
              </button>
              <button
                onClick={() => setShowBcc(!showBcc)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Bcc
              </button>
            </div>
          </div>

          {/* Cc Field */}
          {showCc && (
            <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
              <label className="text-sm font-medium text-gray-700 w-16">Cc:</label>
              <input
                type="text"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="cc@example.com"
                className="flex-1 text-sm outline-none"
              />
            </div>
          )}

          {/* Bcc Field */}
          {showBcc && (
            <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
              <label className="text-sm font-medium text-gray-700 w-16">Bcc:</label>
              <input
                type="text"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="bcc@example.com"
                className="flex-1 text-sm outline-none"
              />
            </div>
          )}

          {/* Subject Field */}
          <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
            <label className="text-sm font-medium text-gray-700 w-16">Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="flex-1 text-sm outline-none"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="min-h-[400px]">
            <ReactQuill
              theme="snow"
              value={body}
              onChange={setBody}
              modules={quillModules}
              placeholder="Write your message..."
              className="h-[350px]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={handleSend}
              disabled={sending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send
                </>
              )}
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={savingDraft}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              {savingDraft ? 'Saving...' : 'Save Draft'}
            </button>
          </div>

          <button
            onClick={handleDiscard}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            Discard
          </button>
        </div>
      </div>
    </EmailLayout>
  );
}
