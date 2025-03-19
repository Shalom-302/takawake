import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MessageType, Message, MessageStatusType } from '@/lib/types/messaging';
import Image from 'next/image';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  senderInfo?: {
    profilePicture?: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function MessageItem({ 
  message, 
  isCurrentUser, 
  showAvatar = true,
  onEdit,
  onDelete,
  senderInfo
}: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content || '');
  const [showActions, setShowActions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Reset edited content when message changes
  useEffect(() => {
    setEditedContent(message.content || '');
  }, [message.content]);
  
  // Format the message timestamp
  const formattedTime = message.createdAt ? format(new Date(message.createdAt), 'HH:mm') : '';
  
  // Determine if the message can be edited (only text messages by current user that are not deleted)
  const canEdit = isCurrentUser && 
                 message.messageType === MessageType.TEXT && 
                 !message.isDeleted && 
                 !message.isForwarded;

  // Handle save edited message
  const handleSaveEdit = async () => {
    if (editedContent.trim() && onEdit) {
      try {
        setIsSaving(true);
        await onEdit(message.id, editedContent);
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to edit message:', error);
        // Optionally show error notification
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditedContent(message.content || '');
    setIsEditing(false);
  };
  
  // Handle delete message with confirmation
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      if (onDelete) {
        onDelete(message.id);
      }
    }
  };
  
  // Get delivery status icon
  const getStatusIcon = () => {
    if (!isCurrentUser) return null;
    
    // Message is pending (ID starting with 'temp-' or no createdAt date)
    if (message.id.startsWith('temp-') || !message.createdAt) {
      return (
        <svg className="w-4 h-4 text-gray-400 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    
    const latestStatus = message.receipts?.reduce((latest, receipt) => {
      // Find the most advanced status (READ > DELIVERED > SENT)
      if (!latest) return receipt.status;
      
      if (receipt.status === MessageStatusType.READ) return MessageStatusType.READ;
      if (receipt.status === MessageStatusType.DELIVERED && latest !== MessageStatusType.READ) {
        return MessageStatusType.DELIVERED;
      }
      
      return latest;
    }, undefined as MessageStatusType | undefined);
    
    switch (latestStatus) {
      case MessageStatusType.READ:
        return (
          <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12L8.5 16.5L20 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case MessageStatusType.DELIVERED:
        return (
          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12L8.5 16.5L20 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case MessageStatusType.SENT:
        return (
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case MessageStatusType.FAILED:
        return (
          <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 16V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default:
        // Default to "sent" status if no receipt is available
        return (
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12L8.5 16.5L20 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };
  
  // Render message content based on type and state
  const renderMessageContent = () => {
    if (message.isDeleted) {
      return (
        <div className="italic text-gray-500 text-sm">
          This message was deleted
        </div>
      );
    }
    
    if (isEditing) {
      return (
        <div className="w-full">
          <textarea
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button 
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded ${isSaving ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center`}
              onClick={handleSaveEdit}
              disabled={isSaving || !editedContent.trim()}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      );
    }
    
    switch (message.messageType) {
      case MessageType.TEXT:
        return <div className="whitespace-pre-wrap">{message.content}</div>;
        
      case MessageType.IMAGE:
        return (
          <div className="mt-1">
            {message.attachments?.[0]?.filePath && (
              <div
                className="relative max-w-full h-64 cursor-pointer"
                onClick={() => window.open(message.attachments?.[0]?.filePath)}
              >
                <Image 
                  src={message.attachments[0].filePath}
                  alt="Image attachment"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-contain rounded-lg"
                />
              </div>
            )}
          </div>
        );
        
      case MessageType.FILE:
        return (
          <div className="flex items-center p-2 bg-gray-100 rounded-lg mt-1">
            <svg className="w-8 h-8 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1 overflow-hidden">
              <a 
                href={message.attachments?.[0]?.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline truncate block"
              >
                {message.attachments?.[0]?.fileName || 'File'}
              </a>
              <span className="text-xs text-gray-500">
                {message.attachments?.[0]?.fileSize 
                  ? `${Math.round(message.attachments[0].fileSize / 1024)} KB`
                  : ''}
              </span>
            </div>
          </div>
        );
        
      case MessageType.SYSTEM:
        return (
          <div className="italic text-center text-gray-500 px-4">
            {message.content}
          </div>
        );
        
      default:
        return <div>{message.content}</div>;
    }
  };
  
  // For system messages, render a centered message
  if (message.messageType === MessageType.SYSTEM) {
    return (
      <div className="py-2 px-4 flex justify-center">
        {renderMessageContent()}
      </div>
    );
  }
  
  // Determine if this is a temporary (pending) message
  const isPending = message.id.startsWith('temp-') || !message.createdAt;
  
  return (
    <div 
      className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isCurrentUser && showAvatar && (
        <div className="flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            {senderInfo?.profilePicture ? (
              <div className="relative w-full h-full">
                <Image 
                  src={senderInfo.profilePicture} 
                  alt="Avatar" 
                  fill 
                  sizes="32px"
                  className="object-cover" 
                />
              </div>
            ) : (
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      )}
      
      <div className={`relative max-w-xs md:max-w-md lg:max-w-lg ${isCurrentUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`p-3 rounded-lg ${
            isCurrentUser 
              ? isPending ? 'bg-blue-400 text-white' : 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-800'
          } ${message.isEdited && !message.isDeleted ? 'pb-5' : ''} ${isPending ? 'opacity-80' : ''}`}
        >
          {renderMessageContent()}
          
          {message.isEdited && !message.isDeleted && (
            <div className="absolute bottom-1 right-3 text-xs opacity-70">
              edited
            </div>
          )}
        </div>
        
        <div className={`flex items-center mt-1 text-xs text-gray-500 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          {isPending && isCurrentUser && (
            <span className="mr-1 italic">sending...</span>
          )}
          <span>{formattedTime}</span>
          {getStatusIcon() && (
            <span className="ml-1">{getStatusIcon()}</span>
          )}
        </div>
        
        {canEdit && showActions && !isPending && (
          <div className={`absolute top-0 ${isCurrentUser ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} flex gap-1`}>
            {!isEditing && (
              <>
                <button 
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit message"
                >
                  <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                
                <button 
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={handleDelete}
                  aria-label="Delete message"
                >
                  <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      {isCurrentUser && showAvatar && (
        <div className="flex-shrink-0 ml-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            {senderInfo?.profilePicture ? (
              <div className="relative w-full h-full">
                <Image 
                  src={senderInfo.profilePicture} 
                  alt="Avatar" 
                  fill
                  sizes="32px"
                  className="object-cover" 
                />
              </div>
            ) : (
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
