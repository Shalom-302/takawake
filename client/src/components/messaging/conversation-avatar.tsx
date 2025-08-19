import Image from "next/image";
import { Conversation, ConversationType, OtherParticipantInfo } from "@/lib/types/messaging";

interface Participant {
    user_id: string;
    profile_picture?: string | null;
    first_name?: string;
    username?: string;
}

interface ConversationAvatarProps {
    conversation: Conversation;
    currentUserId: string | undefined;
    size?: number;
}

export const ConversationAvatar: React.FC<ConversationAvatarProps> = ({
    conversation,
    currentUserId,
    size = 48,
}) => {
    const avatarStyle = {
        width: `${size}px`,
        height: `${size}px`,
    };

    // No current user => return just an empty block
    if (!currentUserId) {
        return (
            <div
                className="rounded-full flex items-center justify-center text-gray-500 bg-gray-200"
                style={avatarStyle}
            >
                {/* nothing or optionally a question mark */}?
            </div>
        );
    }

    // If an avatar is defined directly for the conversation
    if (conversation.avatar_url) {
        return (
            <Image
                src={conversation.avatar_url}
                alt="Conversation Avatar"
                width={size}
                height={size}
                className="rounded-full object-cover"
            />
        );
    }

    // If it's a DIRECT conversation, display the avatar or initial of the other participant
    if (conversation.conversation_type === ConversationType.DIRECT) {
        const otherParticipant = conversation.participants.find(p => p.user_id !== currentUserId);

        if (!otherParticipant) {
            // Pour les conversations directes, nous devrions toujours avoir au moins un autre participant
            // Si nous n'en trouvons pas, c'est probablement parce que l'autre utilisateur a supprimé
            // la conversation, mais nous avons gardé sa trace grâce au "soft delete"

            // Vérifier si nous avons des métadonnées sur l'autre utilisateur dans conversation_metadata
            const otherInfo = conversation.conversation_metadata?.otherParticipantInfo as
                | OtherParticipantInfo
                | undefined;

            if (otherInfo) {
                // Si nous avons une URL d'image enregistrée dans les métadonnées
                if (otherInfo.profile_picture) {
                    return (
                        <Image
                            src={otherInfo.profile_picture}
                            alt={otherInfo.name || "Former participant"}
                            width={size}
                            height={size}
                            className="rounded-full object-cover"
                        />
                    );
                }

                // Si nous avons au moins un nom dans les métadonnées
                if (otherInfo.name) {
                    return (
                        <div
                            className="rounded-full flex items-center justify-center text-white bg-primary"
                            style={avatarStyle}
                        >
                            {otherInfo.name.charAt(0).toUpperCase()}
                        </div>
                    );
                }
            }

            // Fallback si aucune métadonnée n'est disponible
            return (
                <div
                    className="rounded-full flex items-center justify-center text-gray-500 bg-gray-200"
                    style={avatarStyle}
                >
                    ?
                </div>
            );
        }

        // Seulement accéder à profile_picture si otherParticipant existe
        console.log("otherParticipant", otherParticipant.profile_picture);
        if (otherParticipant.profile_picture) {
            return (
                <Image
                    src={otherParticipant.profile_picture}
                    alt="User Avatar"
                    width={size}
                    height={size}
                    className="rounded-full object-cover"
                />
            );
        } else {
            // Otherwise, display the initial
            const initial =
                otherParticipant.first_name?.[0] || otherParticipant.username?.[0] || "";
            return (
                <div
                    className="rounded-full flex items-center justify-center text-gray-500 bg-gray-200"
                    style={avatarStyle}
                >
                    {initial.toUpperCase()}
                </div>
            );
        }
    }

    // If it's a GROUP conversation, we can optionally display the initial of the group name
    if (conversation.conversation_type === ConversationType.GROUP) {
        const initial = conversation.name?.[0] || "";
        return (
            <div
                className="rounded-full flex items-center justify-center text-gray-500 bg-gray-200"
                style={avatarStyle}
            >
                {initial.toUpperCase()}
            </div>
        );
    }

    // Fallback if a new conversation type appears
    return (
        <div
            className="rounded-full flex items-center justify-center text-gray-500 bg-gray-200"
            style={avatarStyle}
        >
            ?
        </div>
    );
};
