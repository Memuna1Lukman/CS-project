'use client';

import { useState } from 'react';
import SideBar from '@/components/SideBar';
import Header from '@/components/Header';
import Board from '@/components/Board';
import { INITIAL_RESOURCES } from '@/lib/mockData';

export default function Dashboard() {
  const [resources] = useState(INITIAL_RESOURCES);
  const [groupBy, setGroupBy] = useState<'type' | 'level' | 'status'>('type');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter resources based on search input
  const filteredResources = resources.filter(
    (res) =>
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <SideBar onOpenUpload={() => alert('Upload Modal triggered!')} />

      <main className="flex-1 p-6 overflow-x-auto">
        <Header
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <Board resources={filteredResources} groupBy={groupBy} />
      </main>
    </div>
  );
}