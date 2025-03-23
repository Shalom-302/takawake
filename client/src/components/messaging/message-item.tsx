import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageType, Message, MessageStatusType } from '@/lib/types/messaging';
import Image from 'next/image';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  showSenderAvatar: boolean;
  showReceiverAvatar: boolean;
  senderInfo?: {
    profile_picture?: string;
    first_name?: string;
    last_name?: string;
  };
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

export default function MessageItem({
  message,
  isCurrentUser,
  showSenderAvatar,
  showReceiverAvatar,
  senderInfo,
  onEdit,
  onDelete
}: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  
  // Initialize edit content when starting to edit
  useEffect(() => {
    if (isEditing && message.content) {
      setEditContent(message.content);
    }
  }, [isEditing, message.content]);
  
  // Format the message timestamp
  const formattedTime = message.created_at ? format(new Date(message.created_at), 'HH:mm', { locale: fr }) : '';
  
  // Determine if the message can be edited (only text messages by current user that are not deleted)
  const canEdit = isCurrentUser && 
                 message.message_type === MessageType.TEXT && 
                 !message.is_deleted;
                 
  // Determine if the message can be deleted (only messages by current user)
  const canDelete = isCurrentUser && !message.is_deleted;
  
  // Handle saving edited message
  const handleSaveEdit = () => {
    if (onEdit && editContent.trim() !== '') {
      onEdit(message.id, editContent);
      setIsEditing(false);
    }
  };
  
  // Handle deleting message
  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
  };
  
  // Render message status icon
  const renderStatusIcon = () => {
    if (!isCurrentUser) return null;
    
    // Normalize status to handle both enum values and backend strings
    const normalizedStatus = typeof message.status === 'string' 
      ? message.status.toLowerCase() 
      : message.status;

    // Handle statuses that may come from the backend as strings "sent", "delivered", "read"
    switch (normalizedStatus) {
      case MessageStatusType.SENT:
      case "sent":
        return (
          <div className="flex items-center">
            <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[10px] ml-1 text-white/60">Sent</span>
          </div>
        );
      case MessageStatusType.DELIVERED:
      case "delivered":
        return (
          <div className="flex items-center">
            <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7M5 13l4 4L19 7" />
            </svg>
            <span className="text-[10px] ml-1 text-white/60">Delivered</span>
          </div>
        );
      case MessageStatusType.READ:
      case "read":
        return (
          <div className="flex items-center">
            <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7M5 13l4 4L19 7" />
            </svg>
            <span className="text-[10px] ml-1 text-white/60">Read</span>
          </div>
        );
      case MessageStatusType.FAILED:
      case "failed":
        return (
          <div className="flex items-center">
            <svg className="w-3 h-3 text-red-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-[10px] ml-1 text-red-500/60">Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] ml-1 text-white/60">Pending</span>
          </div>
        );
    }
  };
  
  // Render message content based on type
  const renderMessageContent = () => {
    if (message.is_deleted) {
      return (
        <div className="italic text-gray-400 text-sm">
          This message has been deleted
        </div>
      );
    }
    
    if (isEditing) {
      return (
        <div className="flex flex-col space-y-2 w-full">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="p-2 rounded border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-sm resize-none"
            rows={2}
            autoFocus
          />
          <div className="flex space-x-2 justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-2 py-1 text-xs rounded bg-gray-500 hover:bg-gray-600 text-white"
            >
              Save
            </button>
          </div>
        </div>
      );
    }
    
    switch (message.message_type) {
      case MessageType.TEXT:
        return (
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        );
      case MessageType.IMAGE:
        return message.attachments && message.attachments.length > 0 ? (
          <div className="relative rounded overflow-hidden max-w-xs">
            <Image 
              src={message.attachments[0].filePath} 
              alt="Image jointe"
              width={300}
              height={200}
              className="object-cover rounded" 
            />
            {message.content && (
              <div className="mt-1 text-sm">{message.content}</div>
            )}
          </div>
        ) : null;
      case MessageType.FILE:
        return message.attachments && message.attachments.length > 0 ? (
          <div className="flex items-center p-2 bg-gray-50 rounded">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <div className="font-medium text-sm">{message.attachments[0].fileName}</div>
              <div className="text-xs text-gray-500">
                {Math.round(message.attachments[0].fileSize / 1024)} KB
              </div>
            </div>
          </div>
        ) : null;
      case MessageType.SYSTEM:
        return (
          <div className="text-center text-xs italic text-gray-500">{message.content}</div>
        );
      default:
        return message.content ? (
          <div>{message.content}</div>
        ) : (
          <div className="italic text-gray-400">
            [Encrypted message]
          </div>
        );
    }
  };
  
  return (
    <div className={`flex mb-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar only for messages from other users and if showReceiverAvatar is true */}
      {!isCurrentUser && showReceiverAvatar && (
        <div className="flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {senderInfo?.profile_picture ? (
              <div className="relative w-full h-full">
                <Image 
                  src={senderInfo.profile_picture} 
                  alt="Avatar" 
                  fill
                  sizes="32px"
                  className="object-cover" 
                />
              </div>
            ) : (
              <div className="bg-gray-100 text-gray-500 w-full h-full flex items-center justify-center">
                {senderInfo?.first_name ? (
                  senderInfo.first_name.charAt(0).toUpperCase()
                ) : (
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Message content */}
      <div className={`max-w-[70%] ${isCurrentUser ? 'order-1' : 'order-2'} group`}>
        {/* Sender name if not current user and showReceiverAvatar is true */}
        {!isCurrentUser && showReceiverAvatar && senderInfo && (
          <div className="text-xs text-gray-500 ml-1 mb-1">
            {`${senderInfo.first_name || ''} ${senderInfo.last_name || ''}`}
          </div>
        )}
        
        {/* Message content */}
        <div 
          className={`px-3 py-1 rounded-lg ${
            isCurrentUser 
              ? 'bg-gray-500 text-white rounded-br-none' 
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          } ${message.message_type === MessageType.SYSTEM ? 'bg-transparent' : ''}`}
        >
          {renderMessageContent()}
          
          {/* Display time and status */}
          <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
            isCurrentUser ? 'text-white opacity-80' : 'text-gray-500'
          }`}>
            {formattedTime}
            {renderStatusIcon()}
            {message.is_edited && !message.is_deleted && (
              <span className="ml-1 italic">(edited)</span>
            )}
          </div>
        </div>
        
        {/* Options menu (edit/delete) for current user messages */}
        {(canEdit || canDelete) && !isEditing && (
          <div className="flex justify-end mt-1 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {canEdit && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button 
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 text-xs"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Avatar for the current user, displayed on the right */}
      {isCurrentUser && showSenderAvatar && (
        <div className="flex-shrink-0 ml-2 mr-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
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
              <div className="bg-gray-100 text-gray-500 w-full h-full flex items-center justify-center">
                {senderInfo?.firstName ? (
                  senderInfo.firstName.charAt(0).toUpperCase()
                ) : (
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
