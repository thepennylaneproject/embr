/**
 * FeedTabs Component
 * Tab navigation for different feed types
 */

'use client';

import React, { useState } from 'react';
import { Feed } from './Feed';
import { FeedType } from '@shared/types/content.types';
import { Flame, Users, TrendingUp } from 'lucide-react';

interface FeedTabsProps {
  defaultTab?: FeedType;
  className?: string;
}

interface Tab {
  id: FeedType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const tabs: Tab[] = [
  {
    id: FeedType.FOR_YOU,
    label: 'For You',
    icon: <Flame size={20} />,
    description: 'Personalized content based on your interests',
  },
  {
    id: FeedType.FOLLOWING,
    label: 'Following',
    icon: <Users size={20} />,
    description: 'Posts from creators you follow',
  },
  {
    id: FeedType.TRENDING,
    label: 'Trending',
    icon: <TrendingUp size={20} />,
    description: 'Popular content right now',
  },
];

export const FeedTabs: React.FC<FeedTabsProps> = ({
  defaultTab = FeedType.FOR_YOU,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<FeedType>(defaultTab);

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6">
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-[#E8998D] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={tab.description}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Feed Description */}
      <div className="mb-4 px-4 py-2 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          {tabs.find((t) => t.id === activeTab)?.description}
        </p>
      </div>

      {/* Feed Content */}
      <Feed
        key={activeTab} // Force remount when tab changes
        feedType={activeTab}
        limit={20}
      />
    </div>
  );
};

export default FeedTabs;
