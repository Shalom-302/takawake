import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMessaging } from '@/lib/contexts/messaging-context';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  profilePicture?: string;
}

// This would normally come from an API call to get all users
// For demo purposes, we're creating dummy users
const getDummyUsers = (): User[] => {
  return [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'janesmith',
      profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Johnson',
      username: 'mjohnson',
      profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    {
      id: '4',
      firstName: 'Emily',
      lastName: 'Williams',
      username: 'emilyw',
      profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg'
    },
    {
      id: '5',
      firstName: 'David',
      lastName: 'Brown',
      username: 'dbrown',
      profilePicture: 'https://randomuser.me/api/portraits/men/5.jpg'
    }
  ];
};

export default function NewConversation() {
  const router = useRouter();
  const { createConversation } = useMessaging();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load users (in a real app, this would be an API call)
  useEffect(() => {
    // Simulate API call
    setUsers(getDummyUsers());
  }, []);
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => {
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
        
        <div className="mb-4">
          <label htmlFor="user-search" className="block text-sm font-medium text-gray-700 mb-1">
            {isCreatingGroup ? 'Add Participants' : 'Select User'}
          </label>
          <div className="relative">
            <input
              type="text"
              id="user-search"
              className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        </div>
        
        {selectedUsers.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selected ({selectedUsers.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>
                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}
                  </span>
                  <button
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    onClick={() => toggleUserSelection(user)}
                    aria-label={`Remove ${user.firstName || user.username}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg border divide-y max-h-96 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No users found
            </div>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user.id}
                className={`p-3 flex items-center hover:bg-gray-50 cursor-pointer ${
                  selectedUsers.some(u => u.id === user.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => toggleUserSelection(user)}
              >
                <div className="relative">
                  <Image
                    src={user.profilePicture || '/images/default-avatar.png'}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 bg-green-500 w-2 h-2 rounded-full border-2 border-white"></div>
                </div>
                
                <div className="ml-3 flex-1">
                  <h3 className="font-medium">
                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}
                  </h3>
                  {user.username && (
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  {selectedUsers.some(u => u.id === user.id) ? (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
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
  );
}
