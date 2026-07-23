'use client';

import { useState } from 'react';
import { FileText, HelpCircle, MessageSquare, Star } from 'lucide-react';
import LessonNotesTab from './LessonNotesTab';
import LessonQueriesTab from './LessonQueriesTab';
import LessonFeedbackTab from './LessonFeedbackTab';
import LessonReviewsTab from './LessonReviewsTab';

export default function LessonStickySidebar({ lessonId, courseId, videoCurrentTime, onSeekVideo }) {
  const [activeTab, setActiveTab] = useState('notes'); // notes | queries | feedback | reviews

  const tabs = [
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'queries', label: 'Queries', icon: HelpCircle },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  return (
    <aside className="sticky top-20 flex flex-col h-[calc(100vh-100px)] rounded-2xl bg-[#0D1021] border border-[#1A1F35] overflow-hidden shadow-2xl transition-all">
      {/* 4 Tabs Header Selector */}
      <div className="grid grid-cols-4 border-b border-[#1A1F35] bg-[#05070E] p-1 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-[11px] font-black transition cursor-pointer ${
                isActive
                  ? 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-slate-950' : 'text-orange-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Area */}
      <div className="flex-1 overflow-hidden bg-[#0D1021]">
        {activeTab === 'notes' && (
          <LessonNotesTab
            lessonId={lessonId}
            videoCurrentTime={videoCurrentTime}
            onSeekVideo={onSeekVideo}
          />
        )}
        {activeTab === 'queries' && (
          <LessonQueriesTab lessonId={lessonId} />
        )}
        {activeTab === 'feedback' && (
          <LessonFeedbackTab lessonId={lessonId} />
        )}
        {activeTab === 'reviews' && (
          <LessonReviewsTab courseId={courseId} />
        )}
      </div>
    </aside>
  );
}
