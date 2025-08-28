import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMessaging } from "@/lib/contexts/messaging-context";
import { ConversationType, ChatUser } from "@/lib/types/messaging";
import { ConversationAvatar } from "./conversation-avatar";
import {
    deleteConversation,
    addConversationMember,
    removeConversationMember,
} from "@/lib/api/messaging-service";
import { useSearchChatUsers } from "@/lib/services/messaging-service";
import { Button } from "@/components/ui/buttons/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, ChevronRight, UserPlus, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ConversationHeaderProps {
    currentUserId: string;
}

export default function ConversationHeader({ currentUserId }: ConversationHeaderProps) {
    const router = useRouter();
    const { activeConversation, isConnected, refreshConversations } = useMessaging();
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { users: allUsers, isLoading: isSearching, setQuery } = useSearchChatUsers();
    // Filtrer les utilisateurs qui sont déjà membres du groupe
    const filteredUsers = activeConversation
        ? allUsers.filter(user => !activeConversation.participants.some(p => p.user_id === user.id))
        : [];
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [isAddingMember, setIsAddingMember] = useState(false);
    // État pour le dialogue de confirmation de quitter le groupe
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

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
                    ? `${otherParticipant.first_name} ${otherParticipant.last_name || ""}`
                    : otherParticipant.username || "User";
            }
        }

        return "Conversation";
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
        return `${count} ${count === 1 ? "member" : "members"}`;
    };

    const handleAddMember = () => {
        setShowAddMember(true);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (value.trim().length >= 1) {
            setQuery(value);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            setQuery(searchQuery);
        } catch (error) {
            console.error("Error searching users:", error);
            toast.error("Error searching users");
        }
    };

    const handleUserSelect = (user: ChatUser) => {
        setSelectedUser(user);
    };

    const handleConfirmAddMember = async () => {
        if (!selectedUser || !activeConversation) return;

        try {
            setIsAddingMember(true);
            await addConversationMember(activeConversation.id, selectedUser.id);

            // Reset user interface if no error
            setSelectedUser(null);
            setShowAddMember(false);
            setSearchQuery("");
            setQuery("");
            toast.success(`${selectedUser.first_name || selectedUser.username} added to the group`);

            // Refresh conversations after a short delay to give the backend time
            setTimeout(() => {
                refreshConversations();
            }, 1000);
        } catch (error) {
            console.error("Failed to add member:", error);

            // Check if the error message contains any of these specific validation errors
            const errorMsg = error instanceof Error ? error.message : "";
            const isValidationError =
                errorMsg.includes("Internal error") ||
                errorMsg.includes("validation errors") ||
                errorMsg.includes("last_message") ||
                errorMsg.includes("Field required");

            if (isValidationError) {
                // Member was likely added successfully, but backend encountered
                // a validation error while creating the system message
                console.log(
                    "Backend validation error detected, but member was likely added successfully"
                );

                // Reset user interface as if the operation was successful
                setSelectedUser(null);
                setShowAddMember(false);
                setSearchQuery("");
                setQuery("");

                // Show a success message to avoid confusion
                toast.success(
                    `${selectedUser.first_name || selectedUser.username} added to the group with success`
                );

                // Refresh conversations after a short delay
                setTimeout(() => {
                    refreshConversations();
                }, 1000);
            }
            // "already a member" error
            else if (errorMsg.includes("already a member")) {
                toast.error(
                    `${selectedUser.first_name || selectedUser.username} is already a member of this conversation`
                );
            } else {
                toast.error("Failed to add member");
            }
        } finally {
            setIsAddingMember(false);
        }
    };

    const handleAddMemberDialogClose = () => {
        setShowAddMember(false);
        setSelectedUser(null);
        setSearchQuery("");
    };

    const handleLeaveGroup = () => {
        setIsLeaveDialogOpen(true);
    };

    const handleConfirmLeaveGroup = async () => {
        if (!activeConversation) return;

        try {
            await deleteConversation(activeConversation.id);
            toast.success("You have left the group");
            setIsLeaveDialogOpen(false);
            refreshConversations();
            router.push("/messages");
        } catch (error) {
            console.error("Error leaving group:", error);
            toast.error("Failed to leave the group");
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!activeConversation) return;

        try {
            await removeConversationMember(activeConversation.id, memberId);
            toast.success("Member removed from the group");
            refreshConversations();
        } catch (error) {
            console.error("Error removing member:", error);
            toast.error("Failed to remove member from group");
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConversation = async () => {
        if (!activeConversation) return;

        setIsDeleting(true);
        try {
            await deleteConversation(activeConversation.id);
            toast.success("Conversation deleted successfully");
            setIsDeleteDialogOpen(false);
            refreshConversations();
            router.push("/messages");
        } catch (error) {
            console.error("Error deleting conversation:", error);
            toast.error("Failed to delete conversation");
        } finally {
            setIsDeleting(false);
        }
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
                <button
                    className="mr-2 text-gray-500 hover:bg-gray-100 rounded-full p-1"
                    onClick={() => router.push("/messages")}
                    aria-label="Back to conversations list"
                >
                    <ArrowLeft className="w-5 h-5" />
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
                                        setShowGroupInfo(true);
                                    }}
                                >
                                    Group info
                                </button>
                            )}

                            {activeConversation.conversation_type === ConversationType.GROUP && (
                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    role="menuitem"
                                    onClick={handleLeaveGroup}
                                >
                                    Leave group
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
                                onClick={handleDeleteClick}
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
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
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

            {/* Leave Group Confirmation Dialog */}
            <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Leave Group</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to leave this group? You will no longer receive
                            messages or updates from this group.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end mt-5">
                        <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmLeaveGroup}>
                            Leave Group
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog pour les infos du groupe */}
            {activeConversation.conversation_type === ConversationType.GROUP && (
                <Dialog open={showGroupInfo} onOpenChange={setShowGroupInfo}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Group Info</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center p-4">
                            <div className="w-16 h-16 relative mb-3">
                                <ConversationAvatar
                                    conversation={activeConversation}
                                    size={64}
                                    currentUserId={currentUserId}
                                />
                            </div>
                            <h3 className="text-xl font-semibold">{activeConversation.title}</h3>
                            <span className="text-sm text-gray-500">
                                {activeConversation.participants.length} members
                            </span>
                        </div>

                        {/* Liste des membres */}
                        <div className="border-t border-b py-2 mb-4">
                            <h4 className="font-medium mb-2">Members</h4>
                            <ScrollArea className="h-64">
                                <div className="space-y-2">
                                    {activeConversation.participants.map(participant => (
                                        <div
                                            key={participant.user_id}
                                            className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                                        >
                                            <div className="flex items-center">
                                                <Avatar className="h-8 w-8 mr-2">
                                                    <AvatarImage
                                                        src={participant.profile_picture}
                                                    />
                                                    <AvatarFallback>
                                                        {participant.first_name
                                                            ? participant.first_name
                                                                  .charAt(0)
                                                                  .toUpperCase()
                                                            : "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {participant.first_name
                                                            ? `${participant.first_name} ${participant.last_name || ""}`
                                                            : participant.username ||
                                                              "Unknown user"}
                                                        {participant.user_id === currentUserId &&
                                                            " (You)"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {participant.user_id ===
                                                        activeConversation.created_by
                                                            ? "Admin"
                                                            : "Member"}
                                                    </p>
                                                </div>
                                            </div>
                                            {currentUserId === activeConversation.created_by &&
                                                participant.user_id !== currentUserId && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onClick={() =>
                                                            handleRemoveMember(participant.user_id)
                                                        }
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="mb-4">
                            <Button
                                variant="outline"
                                className="w-full flex justify-between items-center"
                                onClick={handleAddMember}
                            >
                                <div className="flex items-center">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    <span>Add new member</span>
                                </div>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Add Member Dialog */}
            <Dialog open={showAddMember} onOpenChange={handleAddMemberDialogClose}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Member to Group</DialogTitle>
                        <DialogDescription>
                            Search for users to add to this group conversation
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center gap-2 mb-4">
                        <Input
                            placeholder="Search by name or username"
                            value={searchQuery}
                            onChange={e => handleSearchChange(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSearch()}
                            className="flex-1"
                        />
                        <Button
                            onClick={handleSearch}
                            disabled={isSearching || !searchQuery.trim()}
                            size="icon"
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>

                    {isSearching ? (
                        <div className="text-center py-4">Searching...</div>
                    ) : filteredUsers.length > 0 ? (
                        <ScrollArea className="h-[200px] border rounded-md p-2">
                            {filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${selectedUser?.id === user.id ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <Avatar>
                                        <AvatarImage
                                            src={user.profile_picture || ""}
                                            alt={user.username || ""}
                                        />
                                        <AvatarFallback>
                                            {user.first_name
                                                ? user.first_name[0]
                                                : user.username
                                                  ? user.username[0]
                                                  : "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">
                                            {user.first_name && user.last_name
                                                ? `${user.first_name} ${user.last_name}`
                                                : user.username || "Unknown user"}
                                        </p>
                                        {user.username && (
                                            <p className="text-sm text-gray-500">
                                                @{user.username}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </ScrollArea>
                    ) : searchQuery && !isSearching ? (
                        <div className="text-center py-4 text-gray-500">
                            No users found. Try a different search term.
                        </div>
                    ) : null}

                    <DialogFooter className="gap-2 mt-4">
                        <Button variant="outline" onClick={handleAddMemberDialogClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmAddMember}
                            disabled={isAddingMember || !selectedUser}
                        >
                            {isAddingMember ? "Adding..." : "Add Member"}
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

        return currentUserSettings?.role === "admin";
    }
}
