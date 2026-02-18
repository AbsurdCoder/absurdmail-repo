'use client';

import EmailLayout from '@/components/EmailLayout';
import EmailList from '@/components/EmailList';

export default function StarredPage() {
  return (
    <EmailLayout>
      <EmailList
        isStarred={true}
        title="Starred"
        emptyMessage="No starred emails"
      />
    </EmailLayout>
  );
}
