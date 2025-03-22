import Image from 'next/image';
import { ConversationType, Conversation } from '@/lib/types/messaging';

interface Participant {
  user_id: string;
  profile_picture?: string | null;
  first_name?: string;
  username?: string;
}

interface ConversationAvatarProps {
  conversation: Conversation;
  currentUserId: string | undefined;
}

export const ConversationAvatar: React.FC<ConversationAvatarProps> = ({
  conversation,
  currentUserId
}) => {

  // No current user => return just an empty block
  if (!currentUserId) {
    return (
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 bg-gray-200">
        {/* nothing or optionally a question mark */}
        ?
      </div>
    );
  }

  // If an avatar is defined directly for the conversation
  if (conversation.avatar_url) {
    return (
      <Image
        src={conversation.avatar_url}
        alt="Conversation Avatar"
        fill
        className="w-12 h-12 rounded-full object-cover"
      />
    );
  }

  // If it's a DIRECT conversation, display the avatar or initial of the other participant
  if (conversation.conversation_type === ConversationType.DIRECT) {
    const otherParticipant = conversation.participants.find(
      (p) => p.user_id !== currentUserId
    );
    console.log("otherParticipant", otherParticipant.profile_picture);
    if (!otherParticipant) {
      // For safety, if not found, we display a fallback
      return (
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 bg-gray-200">
          ?
        </div>
      );
    }

    // If they have a profile picture
    if (otherParticipant.profile_picture) {
      return (
        <Image
          src={otherParticipant.profile_picture}
          alt="User Avatar"
          fill
          className="w-12 h-12 rounded-full object-cover"
        />
      );
    } else {
      // Otherwise, display the initial
      const initial =
        otherParticipant.first_name?.[0] ||
        otherParticipant.username?.[0] ||
        '';
      return (
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 bg-gray-200">
          {initial.toUpperCase()}
        </div>
      );
    }
  }

  // If it's a GROUP conversation, we can optionally display the initial of the group name
  if (conversation.conversation_type === ConversationType.GROUP) {
    const initial = conversation.name?.[0] || '';
    return (
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 bg-gray-200">
        {initial.toUpperCase()}
      </div>
    );
  }

  // Fallback if a new conversation type appears
  return (
    <div className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 bg-gray-200">
      ?
    </div>
  );
};
