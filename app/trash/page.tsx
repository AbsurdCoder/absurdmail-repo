'use client';

import EmailLayout from '@/components/EmailLayout';
import EmailList from '@/components/EmailList';

export default function TrashPage() {
  return (
    <EmailLayout>
      <EmailList
        folder="trash"
        title="Trash"
        emptyMessage="Trash is empty"
      />
    </EmailLayout>
  );
}
