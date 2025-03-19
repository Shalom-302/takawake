import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMessaging } from '@/lib/contexts/messaging-context';
import { useSearchChatUsers } from '@/lib/services/messaging-service';

// Interface locale pour représenter les utilisateurs
interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  profilePicture?: string;
}

export default function NewConversation() {
  const router = useRouter();
  const { createConversation } = useMessaging();
  const [searchQuery, setSearchQuery] = useState('');
  const { users, isLoading: loadingUsers, error: searchError, setQuery } = useSearchChatUsers();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ajouter un effet pour gérer les erreurs de recherche
    if (searchError) {
      console.error('Error in search users:', searchError);
      setError(`Erreur lors de la recherche d'utilisateurs: ${searchError.message || 'Erreur inconnue'}`);
    } else {
      setError(null);
    }
  }, [searchError]);

  useEffect(() => {
    // Ajouter un effet ici si nécessaire
  }, []); // Ajouter un tableau de dépendances vide pour éviter l'avertissement de lint

  // Mapper les utilisateurs de ChatUser à User
  const usersList: User[] = users.map(user => ({
    id: user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    username: user.username,
    profilePicture: user.profilePicture || ''
  }));
  
  // Mettre à jour la requête de recherche
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setQuery(query);
    console.log('Search query changed to:', query);
  };
  
  // Filtrer les utilisateurs si nécessaire
  const filteredUsers = usersList.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''} ${user.username || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });
  
  // Handle user selection
  const toggleUserSelection = (user: User) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };
  
  // Create a new conversation
  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }
    
    if (isCreatingGroup && !groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newConversation = await createConversation({
        participantIds: selectedUsers.map(user => user.id),
        title: isCreatingGroup ? groupName.trim() : undefined,
        isGroup: isCreatingGroup
      });
      
      // Navigate to the new conversation
      router.push(`/messages/${newConversation.id}`);
    } catch (err) {
      setError('Failed to create conversation. Please try again.');
      console.error('Error creating conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-3 border-b flex items-center">
        <button
          className="mr-2 text-gray-500"
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
        <h2 className="text-xl font-semibold">New Conversation</h2>
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-4">
          <button
            className={`px-4 py-2 rounded-l-lg ${
              !isCreatingGroup
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setIsCreatingGroup(false)}
          >
            Direct Message
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg ${
              isCreatingGroup
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setIsCreatingGroup(true)}
          >
            Group Chat
          </button>
        </div>
        
        {isCreatingGroup && (
          <div className="mb-4">
            <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              id="group-name"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        )}
        
        <div className="relative mb-4">
          <input
            type="text"
            className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <svg
            className="absolute left-2 top-3 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        {selectedUsers.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected {isCreatingGroup ? 'participants' : 'user'}:
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div 
                  key={user.id}
                  className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                >
                  <span>{user.firstName || user.username}</span>
                  <button
                    onClick={() => toggleUserSelection(user)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg border overflow-hidden">
          {loadingUsers ? (
            <div className="py-6 flex justify-center items-center">
              <svg
                className="animate-spin h-6 w-6 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : searchError ? (
            <div className="py-6 text-center text-red-500">
              {error}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              {searchQuery ? 'No users found. Try a different search.' : 'Type to search for users'}
            </div>
          ) : (
            <ul className="divide-y">
              {filteredUsers.map(user => (
                <li key={user.id}>
                  <button
                    className={`w-full p-3 flex items-center hover:bg-gray-50 ${
                      selectedUsers.some(u => u.id === user.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleUserSelection(user)}
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                      {user.profilePicture ? (
                        <Image
                          src={user.profilePicture}
                          alt={user.firstName || user.username || ''}
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500">
                          {(user.firstName?.[0] || user.username?.[0] || '').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 text-left">
                      <p className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      {user.username && (
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      )}
                    </div>
                    <div className="ml-auto">
                      <input
                        type="checkbox"
                        checked={selectedUsers.some(u => u.id === user.id)}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="mt-auto p-4 border-t">
          <button
            className={`w-full py-2 rounded-lg ${
              selectedUsers.length > 0 && (!isCreatingGroup || (isCreatingGroup && groupName.trim()))
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleCreateConversation}
            disabled={
              selectedUsers.length === 0 ||
              isLoading ||
              (isCreatingGroup && !groupName.trim())
            }
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </span>
            ) : (
              `Create ${isCreatingGroup ? 'Group' : 'Conversation'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
