'use client';

import EmailLayout from '@/components/EmailLayout';
import EmailList from '@/components/EmailList';

export default function InboxPage() {
  return (
    <EmailLayout>
      <EmailList
        folder="inbox"
        title="Inbox"
        emptyMessage="Your inbox is empty"
      />
    </EmailLayout>
  );
}
