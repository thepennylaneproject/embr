/**
 * ConversationList Component
 * Displays list of conversations with search and unread indicators
 */

import React from 'react';
import { ConversationPreview, MessageType } from '@shared/types/messaging.types';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: ConversationPreview[];
  selectedConversationId?: string;
  unreadCount: number;
  searchQuery: string;
  loading: boolean;
  error: Error | null;
  isConnected: boolean;
  onConversationSelect: (conversation: ConversationPreview) => void;
  onSearchChange: (query: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  unreadCount,
  searchQuery,
  loading,
  error,
  isConnected,
  onConversationSelect,
  onSearchChange,
}) => {
  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.profile.displayName
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getMessagePreview = (conversation: ConversationPreview): string => {
    if (!conversation.lastMessage) return 'No messages yet';

    const { content, type } = conversation.lastMessage;

    switch (type) {
      case MessageType.IMAGE:
        return '📷 Photo';
      case MessageType.VIDEO:
        return '🎥 Video';
      case MessageType.FILE:
        return '📎 File';
      default:
        return content || '';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Messages
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[#E8998D] rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
          <div className="flex items-center space-x-2">
            {/* Connection status indicator */}
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-gray-400'
              }`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#E8998D] focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
        </div>
      )}

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8998D]"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <svg
              className="h-12 w-12 text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'No conversations found'
                : 'No messages yet. Start a conversation!'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const isSelected = conversation.id === selectedConversationId;
            const hasUnread = conversation.unreadCount > 0;

            return (
              <button
                key={conversation.id}
                onClick={() => onConversationSelect(conversation)}
                className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  isSelected
                    ? 'bg-[#E8998D]/10 dark:bg-[#E8998D]/20'
                    : hasUnread
                    ? 'bg-white dark:bg-gray-900'
                    : ''
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {conversation.otherUser.profile.avatarUrl ? (
                    <img
                      src={conversation.otherUser.profile.avatarUrl}
                      alt={conversation.otherUser.profile.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#C9ADA7] flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        {conversation.otherUser.profile.displayName[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Online status dot could go here */}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-sm font-semibold truncate ${
                          hasUnread
                            ? 'text-gray-900 dark:text-gray-100'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {conversation.otherUser.profile.displayName}
                      </span>
                      {conversation.otherUser.profile.isVerified && (
                        <svg
                          className="w-4 h-4 text-[#E8998D]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(conversation.lastMessageAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm truncate ${
                        hasUnread
                          ? 'text-gray-900 dark:text-gray-100 font-medium'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {getMessagePreview(conversation)}
                    </p>
                    {hasUnread && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#E8998D] rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
