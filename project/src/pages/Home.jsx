import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../components/Post';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../lib/api';
import { Loader2, Users } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
  if (!user || !user.id) return;

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const userProfile = await apiService.getPrivateProfile(user.id);
      const followingIds = new Set(userProfile?.followingIds || []);

      const allPosts = await apiService.getPosts();
      const filteredPosts = allPosts.filter(post => {
        const postUserId = post.user_id || post.userId;
        return followingIds.has(postUserId) || postUserId === user.id;
      });

      const sortedPosts = filteredPosts.sort((a, b) => {
        const dateA = new Date(b.createdAt || b.created_at);
        const dateB = new Date(a.createdAt || a.created_at);
        return dateA - dateB;
      });

      const postsWithEngagement = await Promise.all(
        sortedPosts.map(async (post) => {
          try {
            const [comments, likes] = await Promise.all([
              apiService.getComments(post.id),
              apiService.getLikes(post.id)
            ]);

            return {
              post,
              comments: Array.isArray(comments) ? comments : [],
              likes: Array.isArray(likes) ? likes : [],
              userLike: Array.isArray(likes)
                ? likes.find(like => like.userId === user.id || like.user_id === user.id)
                : undefined
            };
          } catch (error) {
            console.error(`Error fetching engagement for post ${post.id}:`, error);
            return { post, comments: [], likes: [], userLike: undefined };
          }
        })
      );

      setPosts(postsWithEngagement);
    } catch (error) {
      setError(error.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  fetchPosts();
}, [user?.id]);



  const handleDeletePost = (postId) => {
    setPosts(posts.filter(p => p.post.id !== postId));
  };

  if (user && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading posts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {user ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Your Feed</h1>
              <button
                onClick={() => navigate('/users')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Users className="h-5 w-5 mr-2" />
                Find Users
              </button>
            </div>

            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((postData) => (
                  <Post
                    key={postData.post.id}
                    {...postData}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your feed is empty
                </h3>
                <p className="text-gray-600 mb-4">
                  Follow other users to see their posts here
                </p>
                <button
                  onClick={() => navigate('/users')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Find Users to Follow
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to SkillHive
            </h2>
            <p className="text-gray-600 mb-8">
              Sign in to see posts from people you follow and share your own learning journey.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}