'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { logout } from '@/lib/api/auth';
import { listFolders, listLabels, type Folder, type Label } from '@/lib/api/folders-labels';

interface EmailLayoutProps {
  children: React.ReactNode;
}

export default function EmailLayout({ children }: EmailLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, clearUser, initializeAuth } = useAuthStore();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch folders and labels
    const fetchData = async () => {
      try {
        const [foldersData, labelsData] = await Promise.all([
          listFolders(),
          listLabels(),
        ]);
        setFolders(foldersData.data || []);
        setLabels(labelsData.data || []);
      } catch (error) {
        console.error('Failed to fetch folders/labels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, router, initializeAuth]);

  const handleLogout = () => {
    logout();
    clearUser();
    router.push('/login');
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">AbsurdLabs</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
        </div>

        {/* Compose Button */}
        <div className="p-4">
          <Link
            href="/compose"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Compose
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* Default Folders */}
          <div className="mb-6">
            <NavItem href="/inbox" icon="inbox" label="Inbox" />
            <NavItem href="/starred" icon="star" label="Starred" />
            <NavItem href="/sent" icon="send" label="Sent" />
            <NavItem href="/drafts" icon="file" label="Drafts" />
            <NavItem href="/trash" icon="trash" label="Trash" />
          </div>

          {/* Custom Folders */}
          {folders.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">Folders</h3>
              {folders.map((folder) => (
                <NavItem
                  key={folder._id}
                  href={`/folder/${folder._id}`}
                  icon="folder"
                  label={folder.name}
                  color={folder.color}
                />
              ))}
            </div>
          )}

          {/* Labels */}
          {labels.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">Labels</h3>
              {labels.map((label) => (
                <NavItem
                  key={label._id}
                  href={`/label/${label._id}`}
                  icon="tag"
                  label={label.name}
                  color={label.color}
                />
              ))}
            </div>
          )}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

// Navigation Item Component
interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  color?: string;
}

function NavItem({ href, icon, label, color }: NavItemProps) {
  const iconMap: Record<string, JSX.Element> = {
    inbox: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    ),
    star: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    ),
    send: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    ),
    file: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
    trash: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    ),
    folder: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    ),
    tag: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    ),
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition group"
    >
      <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {iconMap[icon] || iconMap.folder}
      </svg>
      <span className="text-sm font-medium">{label}</span>
      {color && (
        <span
          className="ml-auto w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
    </Link>
  );
}
