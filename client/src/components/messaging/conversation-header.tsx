import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMessaging } from '@/lib/contexts/messaging-context';
import { ConversationType } from '@/lib/types/messaging';
import { ConversationAvatar } from './conversation-avatar';
import { deleteConversation } from '@/lib/api/messaging-service';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConversationHeaderProps {
  currentUserId: string;
}

export default function ConversationHeader({ currentUserId }: ConversationHeaderProps) {
  const router = useRouter();
  const { activeConversation, isConnected, refreshConversations } = useMessaging();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!activeConversation) {
    return (
      <div className="p-3 border-b flex items-center">
        <h2 className="text-xl font-semibold">Messages</h2>
      </div>
    );
  }

  // Get title for conversation (for direct chats, show the other participant's name)
  const getTitle = () => {
    if (activeConversation.title) return activeConversation.title;

    if (activeConversation.conversation_type === ConversationType.DIRECT) {
      const otherParticipant = activeConversation.participants.find(
        p => p.user_id !== currentUserId
      );

      if (otherParticipant) {
        return otherParticipant.first_name
          ? `${otherParticipant.first_name} ${otherParticipant.last_name || ''}`
          : otherParticipant.username || 'User';
      }
    }

    return 'Conversation';
  };

  // Get online status for direct chats
  const getOnlineStatus = () => {
    if (activeConversation.conversation_type !== ConversationType.DIRECT) {
      return null;
    }

    // This would typically come from a user presence system
    // For now, we just render a placeholder
    return true;
  };

  // Get participants count for group chats
  const getParticipantsInfo = () => {
    if (activeConversation.conversation_type === ConversationType.DIRECT) {
      return null;
    }

    const count = activeConversation.participants.length;
    return `${count} ${count === 1 ? 'member' : 'members'}`;
  };

  return (
    <div className="p-3 border-b flex items-center justify-between">
      <div className="flex items-center">
        <button
          className="md:hidden mr-2 text-gray-500"
          onClick={() => router.back()}
          aria-label="Back"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="relative w-12 h-12 flex-shrink-0">
          <ConversationAvatar
            conversation={activeConversation}
            currentUserId={currentUserId}
          />
          {getOnlineStatus() && (
            <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
          )}
        </div>

        <div className="ml-3">
          <h2 className="font-semibold">{getTitle()}</h2>
          <div className="text-xs text-gray-500 flex items-center">
            {isConnected ? (
              <>
                {getOnlineStatus() && <span>Online</span>}
                {getParticipantsInfo() && <span>{getParticipantsInfo()}</span>}
              </>
            ) : (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                Reconnecting...
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Conversation menu"
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={() => {
                  setShowMenu(false);
                  // Implementation for search in conversation
                }}
              >
                Search in conversation
              </button>

              {activeConversation.conversation_type === ConversationType.GROUP && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => {
                    setShowMenu(false);
                    // Implementation for group info
                  }}
                >
                  Group info
                </button>
              )}

              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={() => {
                  setShowMenu(false);
                  // Implementation for muting conversation
                }}
              >
                Mute notifications
              </button>

              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                role="menuitem"
                onClick={() => {
                  setShowMenu(false);
                  setIsDeleteDialogOpen(true);
                }}
              >
                Delete conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              {activeConversation?.conversation_type === ConversationType.DIRECT
                ? "This will remove the conversation from your list. The other person will still have access to the conversation."
                : isUserAdmin()
                ? "As an admin, deleting this group will permanently remove it for all participants. This action cannot be undone."
                : "This will remove you from the group. Other participants will still have access."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end mt-5">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConversation}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Helper function to check if current user is admin
  function isUserAdmin() {
    if (!activeConversation) return false;

    const currentUserSettings = activeConversation.participants.find(
      p => p.user_id === currentUserId
    );

    return currentUserSettings?.role === 'admin';
  }

  // Handler function for deleting conversation
  async function handleDeleteConversation() {
    if (!activeConversation) return;

    try {
      setIsDeleting(true);

      const result = await deleteConversation(activeConversation.id);

      // Notification de succès (nous n'utilisons pas toast car il n'est pas disponible)
      console.log("Success:", result.message);
      
      // Afficher un message temporaire (alternative à toast)
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
      notification.textContent = result.message;
      document.body.appendChild(notification);
      
      // Le faire disparaître après 3 secondes
      setTimeout(() => {
        notification.remove();
      }, 3000);

      // Close dialog and redirect to messages
      setIsDeleteDialogOpen(false);

      // Refresh conversation list
      if (refreshConversations) {
        refreshConversations();
      }

      // Redirect to messages page
      router.push('/messages');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      
      // Notification d'erreur (alternative à toast)
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
      notification.textContent = "Failed to delete conversation. Please try again.";
      document.body.appendChild(notification);
      
      // Le faire disparaître après 3 secondes
      setTimeout(() => {
        notification.remove();
      }, 3000);
    } finally {
      setIsDeleting(false);
    }
  }
}
