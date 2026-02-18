'use client';

import EmailLayout from '@/components/EmailLayout';
import EmailList from '@/components/EmailList';

export default function DraftsPage() {
  return (
    <EmailLayout>
      <EmailList
        folder="drafts"
        title="Drafts"
        emptyMessage="No draft emails"
      />
    </EmailLayout>
  );
}
