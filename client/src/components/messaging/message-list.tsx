import React, { useRef, useEffect } from 'react';
import { useMessaging } from '@/lib/contexts/messaging-context';
import MessageItem from './message-item';
import { Message } from '@/lib/types/messaging';

// Définition d'une interface DateSeparator pour les séparateurs de date
interface DateSeparator {
  type: 'date';
  date: string;
}

interface MessageListProps {
  currentUserId: string;
}

export default function MessageList({ currentUserId }: MessageListProps) {
  const { 
    messages, 
    loadingMessages, 
    loadMoreMessages, 
    hasMoreMessages,
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
  
  // Get sender info from participant data
  const getSenderInfo = (senderId: string, message: Message) => {
    if (!activeConversation) return undefined;
    
    const participant = activeConversation.participants.find(p => p.user_id === senderId);
    if (!participant) return undefined;
    
    const date = new Date(message.created_at);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return {
      profile_picture: participant.profile_picture,
      first_name: participant.first_name,
      last_name: participant.last_name,
      message_time: time
    };
  };
  
  // Prepare messages for display
  const prepareMessagesForDisplay = (messages: Message[]) => {
    if (!messages || messages.length === 0) return [];
    
    const sorted = [...messages].sort((a, b) => {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    
    // Group messages by date
    const messagesByDate: Record<string, Message[]> = {};
    
    sorted.forEach(message => {
      const messageDate = new Date(message.created_at).toLocaleDateString();
      if (!messagesByDate[messageDate]) {
        messagesByDate[messageDate] = [];
      }
      messagesByDate[messageDate].push(message);
    });
    
    // Convert to flat array with date separators
    const result: (Message | DateSeparator)[] = [];
    Object.entries(messagesByDate).forEach(([date, messagesOnDate]) => {
      // Add date separator
      result.push({ type: 'date', date });
      
      // Add messages
      messagesOnDate.forEach(message => {
        result.push(message);
      });
    });
    
    return result;
  };
  
  // Check if a message is from the current user
  const isCurrentUserMessage = (message: Message) => {
    return message.sender_id === currentUserId;
  };
  
  // Render all items (messages and date separators)
  const renderItems = () => {
    const items = prepareMessagesForDisplay(messages);
    
    return items.map((item) => {
      if ('type' in item && item.type === 'date') {
        return (
          <div key={item.date} className="flex justify-center my-4">
            <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
              {item.date}
            </div>
          </div>
        );
      } else {
        const messageItem = item as Message;
        return (
          <MessageItem
            key={messageItem.id}
            message={messageItem}
            isCurrentUser={isCurrentUserMessage(messageItem)}
            showSenderAvatar={false}
            showReceiverAvatar={true}
            senderInfo={getSenderInfo(messageItem.sender_id, messageItem)}
          />
        );
      }
      
      return null;
    });
  };
  
  // Render typing indicators
  const renderTypingIndicators = () => {
    if (!typingUsers.length || !activeConversation) return null;
    // Get participant names
    const typingNames = typingUsers.map(userId => {
      const participant = activeConversation.participants.find(p => p.user_id === userId);
      return participant?.first_name || participant?.username || 'Someone';
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
  
  // The message list component
  return (
    <div className="flex flex-col h-full">
      {/* Loading and messages area */}
      <div 
        ref={messageListRef}
        className="flex-1 px-4 py-2"
        onScroll={handleScroll}
      >
        {/* Loading indicator for loading more messages */}
        {loadingMessages && hasMoreMessages && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Message state if no messages */}
        {!loadingMessages && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p>No messages in this conversation</p>
            <p className="text-sm">Start writing to send your first message</p>
          </div>
        )}
        
        {/* Message list in a div with flexbox reversed to have the most recent messages at the bottom */}
        <div className="flex flex-col">
          {renderItems()}
          {renderTypingIndicators()}
          <div ref={messagesEndRef} /> {/* Reference element for automatic scrolling */}
        </div>
      </div>
    </div>
  );
}
