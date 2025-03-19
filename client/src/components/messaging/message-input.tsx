import { useState, useRef, useEffect } from 'react';
import { useMessaging } from '@/lib/contexts/messaging-context';

export default function MessageInput() {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { sendMessage, setTyping, isConnected } = useMessaging();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-resize the textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  // Handle typing indicator
  useEffect(() => {
    if (message && !isComposing) {
      setIsComposing(true);
      setTyping(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout for typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isComposing) {
        setIsComposing(false);
        setTyping(false);
      }
    }, 3000); // Stop typing indicator after 3 seconds of inactivity
    
    // Cleanup on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setTyping(false);
    };
  }, [message, isComposing, setTyping]);
  
  // Handle sending messages
  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) return;
    
    try {
      setIsSending(true);
      await sendMessage(trimmedMessage);
      setMessage('');
      setIsComposing(false);
      setTyping(false);
      
      // Focus the textarea after sending
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optionally show an error notification to the user
    } finally {
      setIsSending(false);
    }
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // TODO: Implement file upload
    console.log('File selected:', files[0]);
    
    // Reset the input
    e.target.value = '';
  };
  
  return (
    <div className="border-t p-3">
      {!isConnected && (
        <div className="bg-yellow-100 text-yellow-800 text-sm px-3 py-2 rounded-md mb-2">
          <span className="flex items-center">
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            Connection lost. Reconnecting...
          </span>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Attach file"
          disabled={isSending || !isConnected}
        >
          <label htmlFor="file-upload" className={`cursor-pointer ${(isSending || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isSending || !isConnected}
          />
        </button>
        
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            className={`w-full border rounded-lg pl-3 pr-10 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32 ${!isConnected ? 'bg-gray-100' : ''}`}
            placeholder={isConnected ? "Type a message..." : "Reconnecting..."}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isConnected || isSending}
          />
          
          <button
            className={`absolute right-2 bottom-2 text-gray-400 hover:text-gray-600 focus:outline-none ${(isSending || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              // Open emoji picker (placeholder)
              if (!isSending && isConnected) {
                alert('Emoji picker would open here');
              }
            }}
            type="button"
            aria-label="Insert emoji"
            disabled={isSending || !isConnected}
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        
        <button
          className={`p-2 rounded-full flex items-center justify-center ${
            message.trim() && isConnected && !isSending
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleSendMessage}
          disabled={!message.trim() || !isConnected || isSending}
          aria-label="Send message"
        >
          {isSending ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
