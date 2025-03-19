import React, { useRef, useEffect } from 'react';
import { useMessaging } from '@/lib/contexts/messaging-context';
import MessageItem from './message-item';
import { Message } from '@/lib/types/messaging';

interface MessageListProps {
  currentUserId: string;
}

export default function MessageList({ currentUserId }: MessageListProps) {
  const { 
    messages, 
    loadingMessages, 
    loadMoreMessages, 
    hasMoreMessages,
    updateMessage,
    deleteMessage,
    typingUsers,
    activeConversation
  } = useMessaging();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    // Only auto-scroll if the user was already at the bottom or if it's a new message
    if (messages.length > 0 && messages.length !== prevMessagesLengthRef.current) {
      // Check if it's a new message at the end (sent or received)
      const isNewMessage = messages.length > prevMessagesLengthRef.current;
      
      // Get scroll position
      const container = messageListRef.current;
      if (container) {
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        
        // Scroll to bottom if user was already there or if it's a new message
        if (isAtBottom || isNewMessage) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages]);
  
  // Handle load more messages when scrolling to top
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    
    // When user scrolls near the top, load more messages
    if (scrollTop < 50 && hasMoreMessages && !loadingMessages) {
      loadMoreMessages();
    }
  };
  
  // Handle editing a message
  const handleEditMessage = (messageId: string, content: string) => {
    updateMessage(messageId, content);
  };
  
  // Handle deleting a message
  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };
  
  // Get sender info from participant data
  const getSenderInfo = (senderId: string) => {
    if (!activeConversation) return undefined;
    
    const participant = activeConversation.participants.find(p => p.userId === senderId);
    if (!participant) return undefined;
    
    return {
      profilePicture: participant.profilePicture,
      firstName: participant.firstName,
      lastName: participant.lastName
    };
  };
  
  // Group messages by sender for avatar display
  const renderMessages = () => {
    if (!messages.length) return null;
    
    const result: React.ReactElement[] = [];
    let prevSenderId: string | null = null;
    
    messages.forEach((message: Message, index: number) => {
      const isCurrentUser = message.senderId === currentUserId;
      const showAvatar = message.senderId !== prevSenderId;
      const senderInfo = getSenderInfo(message.senderId);
      
      result.push(
        <MessageItem
          key={message.id}
          message={message}
          isCurrentUser={isCurrentUser}
          showAvatar={showAvatar}
          onEdit={handleEditMessage}
          onDelete={handleDeleteMessage}
          senderInfo={senderInfo}
        />
      );
      
      prevSenderId = message.senderId;
    });
    
    return result;
  };
  
  // Render typing indicators
  const renderTypingIndicators = () => {
    if (!typingUsers.length || !activeConversation) return null;
    
    // Get participant names
    const typingNames = typingUsers.map(userId => {
      const participant = activeConversation.participants.find(p => p.userId === userId);
      return participant?.firstName || participant?.username || 'Someone';
    });
    
    // Display appropriate message based on how many users are typing
    let typingText = '';
    if (typingNames.length === 1) {
      typingText = `${typingNames[0]} is typing...`;
    } else if (typingNames.length === 2) {
      typingText = `${typingNames[0]} and ${typingNames[1]} are typing...`;
    } else {
      typingText = 'Several people are typing...';
    }
    
    return (
      <div className="flex items-center text-gray-500 text-sm p-2 animate-pulse">
        <div className="flex space-x-1 mr-2">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span>{typingText}</span>
      </div>
    );
  };
  
  return (
    <div 
      className="flex-1 overflow-y-auto p-4" 
      ref={messageListRef}
      onScroll={handleScroll}
    >
      {loadingMessages && messages.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-full text-gray-500">
          <svg
            className="w-16 h-16 mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p>No messages yet</p>
          <p className="text-sm mt-2">Start the conversation by sending a message</p>
        </div>
      ) : (
        <>
          {hasMoreMessages && (
            <div className="text-center my-2">
              <button
                className="text-blue-500 text-sm hover:underline focus:outline-none"
                onClick={loadMoreMessages}
                disabled={loadingMessages}
              >
                {loadingMessages ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    Loading...
                  </span>
                ) : (
                  'Load older messages'
                )}
              </button>
            </div>
          )}
          
          <div className="space-y-1">
            {renderMessages()}
            {renderTypingIndicators()}
          </div>
          
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
