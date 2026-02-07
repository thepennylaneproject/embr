/**
 * MessageThread Component
 * Displays messages in a conversation with typing indicators and message input
 */

import React, { useState, useRef, useEffect } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import {
  ConversationPreview,
  MessageWithSender,
  TypingIndicator,
  MessageType,
} from '@shared/types/messaging.types';
import { MessageInput } from './MessageInput';

interface MessageThreadProps {
  conversation: ConversationPreview;
  messages: MessageWithSender[];
  typingUsers: TypingIndicator[];
  isConnected: boolean;
  onSendMessage: (content: string, file?: File) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  onBack?: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  conversation,
  messages,
  typingUsers,
  isConnected,
  onSendMessage,
  onTyping,
  onBack,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatMessageTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const renderMessage = (message: MessageWithSender, isOwnMessage: boolean) => {
    return (
      <div
        key={message.id}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
          {/* Avatar (only for other user's messages) */}
          {!isOwnMessage && (
            <div className="flex-shrink-0 mb-1">
              {conversation.otherUser.profile.avatarUrl ? (
                <img
                  src={conversation.otherUser.profile.avatarUrl}
                  alt={conversation.otherUser.profile.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#C9ADA7] flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {conversation.otherUser.profile.displayName[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Message bubble */}
          <div className={isOwnMessage ? 'mr-2' : 'ml-2'}>
            <div
              className={`rounded-2xl px-4 py-2 ${
                isOwnMessage
                  ? 'bg-[#E8998D] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}
            >
              {/* Media content */}
              {message.type === MessageType.IMAGE && message.mediaUrl && (
                <img
                  src={message.mediaUrl}
                  alt="Shared image"
                  className="rounded-lg max-w-full mb-2"
                  loading="lazy"
                />
              )}
              {message.type === MessageType.VIDEO && message.mediaUrl && (
                <video
                  src={message.mediaUrl}
                  controls
                  className="rounded-lg max-w-full mb-2"
                />
              )}
              {message.type === MessageType.FILE && message.mediaUrl && (
                <a
                  href={message.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm underline"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>{message.fileName || 'Download file'}</span>
                </a>
              )}

              {/* Text content */}
              {message.content && (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </div>

            {/* Timestamp and status */}
            <div
              className={`flex items-center space-x-1 mt-1 px-1 ${
                isOwnMessage ? 'justify-end' : 'justify-start'
              }`}
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatMessageTimestamp(message.createdAt)}
              </span>
              {isOwnMessage && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {message.status === 'READ' && '✓✓'}
                  {message.status === 'DELIVERED' && '✓'}
                  {message.status === 'SENT' && '○'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-end space-x-2">
          <div className="flex-shrink-0 mb-1">
            {conversation.otherUser.profile.avatarUrl ? (
              <img
                src={conversation.otherUser.profile.avatarUrl}
                alt={conversation.otherUser.profile.displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#C9ADA7] flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {conversation.otherUser.profile.displayName[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 ml-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Group messages by date
  const messagesByDate: Record<string, MessageWithSender[]> = {};
  messages.forEach((message) => {
    const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
    if (!messagesByDate[date]) {
      messagesByDate[date] = [];
    }
    messagesByDate[date].push(message);
  });

  const formatDateDivider = (dateString: string): string => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center space-x-3">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        
        {conversation.otherUser.profile.avatarUrl ? (
          <img
            src={conversation.otherUser.profile.avatarUrl}
            alt={conversation.otherUser.profile.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#C9ADA7] flex items-center justify-center">
            <span className="text-white text-lg font-semibold">
              {conversation.otherUser.profile.displayName[0].toUpperCase()}
            </span>
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center space-x-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {conversation.otherUser.profile.displayName}
            </h3>
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
          <p className="text-xs text-gray-500 dark:text-gray-400">
            @{conversation.otherUser.username}
          </p>
        </div>

        {/* Connection status */}
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}
          title={isConnected ? 'Connected' : 'Disconnected'}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg
              className="h-16 w-16 text-gray-400 mb-4"
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
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {Object.entries(messagesByDate).map(([dateString, dateMessages]) => (
              <div key={dateString}>
                {/* Date divider */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {formatDateDivider(dateString)}
                    </span>
                  </div>
                </div>

                {/* Messages for this date */}
                {dateMessages.map((message) =>
                  renderMessage(message, message.senderId === conversation.otherUser.id ? false : true),
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {renderTypingIndicator()}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        disabled={!isConnected}
      />
    </div>
  );
};
