'use client';

import EmailLayout from '@/components/EmailLayout';
import EmailList from '@/components/EmailList';

export default function SentPage() {
  return (
    <EmailLayout>
      <EmailList
        folder="sent"
        title="Sent"
        emptyMessage="No sent emails"
      />
    </EmailLayout>
  );
}
