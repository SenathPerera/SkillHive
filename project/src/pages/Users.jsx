import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserMinus, Loader2, Users as UsersIcon, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../lib/api';

export function Users() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followingMap, setFollowingMap] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentUserProfile = await apiService.getPrivateProfile(user.id);
        const following = new Set(currentUserProfile?.followingIds || []);
    
        // Get all users
        const allUsers = await apiService.getAllUsers();
        console.log('All users:', allUsers); // Log the response
    
        const otherUsers = allUsers.filter(u => u.id !== user.id);
        setUsers(otherUsers);
        setFollowingMap(
          otherUsers.reduce((acc, u) => ({
            ...acc,
            [u.id]: following.has(u.id)
          }), {})
        );
      } catch (error) {
        setError(error.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    

    if (user) {
      fetchUsers();
    }
  }, [user]);

  const handleFollow = async (userId) => {
    if (actionLoading[userId]) return;

    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const isFollowing = followingMap[userId];
      
      if (isFollowing) {
        await apiService.unfollowUser(userId);
      } else {
        await apiService.followUser(userId);
      }
      
      setFollowingMap(prev => ({
        ...prev,
        [userId]: !isFollowing
      }));
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const filteredUsers = users.filter(otherUser => {
    const searchLower = searchQuery.toLowerCase();
    const firstName = otherUser.firstName?.toLowerCase() || '';
    const lastName = otherUser.lastName?.toLowerCase() || '';
    return firstName.includes(searchLower) || lastName.includes(searchLower);
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">Please sign in to view users.</p>
          <button
            onClick={() => navigate('/auth')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community</h1>
            <p className="mt-2 text-gray-600">Connect with other learners</p>
          </div>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map((otherUser) => (
            <div
              key={otherUser.id}
              className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center hover:shadow-md transition-shadow"
            >
              <div className="relative">
                {otherUser.avatarUrl ? (
                  <img
                    src={`/api/media/${otherUser.avatarUrl}`}
                    alt={`${otherUser.firstName} ${otherUser.lastName}`}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-3xl font-semibold text-white">
                      {otherUser.firstName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {otherUser.firstName} {otherUser.lastName}
              </h3>

              {otherUser.bio && (
                <p className="mt-2 text-sm text-gray-600 text-center line-clamp-2">
                  {otherUser.bio}
                </p>
              )}

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => navigate(`/otherprofile/${otherUser.id}`)}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border rounded-md hover:bg-gray-50"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleFollow(otherUser.id)}
                  disabled={actionLoading[otherUser.id]}
                  className={`px-4 py-2 rounded-md text-sm flex items-center ${
                    followingMap[otherUser.id]
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {actionLoading[otherUser.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : followingMap[otherUser.id] ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No users found matching your search' : 'No users found'}
            </h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try a different search term' : 'Be the first to join the community!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}