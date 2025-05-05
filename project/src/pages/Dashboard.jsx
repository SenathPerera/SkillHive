import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Code, Bell, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Post } from '../components/Post';
import { apiService } from '../lib/api';
import PropTypes from 'prop-types';

export function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const postsData = await apiService.getPosts();
        
        if (!Array.isArray(postsData)) {
          throw new Error('Invalid response format from server');
        }

        // Filter posts for the current user and sort by creation date
        const userPosts = postsData
          .filter(post => post.userId === user.id || post.user_id === user.id)
          .sort((a, b) => {
            const dateA = new Date(b.createdAt || b.created_at);
            const dateB = new Date(a.createdAt || a.created_at);
            return dateA - dateB;
          });

        const postsWithEngagement = await Promise.all(
          userPosts.map(async (post) => {
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
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(p => p.post.id !== postId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName?.split(' ')[0]}! 👋
              </h1>
              <p className="mt-2 text-gray-600">
                Track your progress and share your learning journey with others.
              </p>
            </div>
            <button
              onClick={() => navigate('/create-post')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Post
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-3">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-blue-900">Posts</h3>
                  <p className="mt-1 text-2xl font-semibold text-blue-700">{posts.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-lg p-3">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-green-900">Total Likes</h3>
                  <p className="mt-1 text-2xl font-semibold text-green-700">
                    {posts.reduce((total, post) => total + post.likes.length, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-lg p-3">
                  <Code className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-purple-900">Comments</h3>
                  <p className="mt-1 text-2xl font-semibold text-purple-700">
                    {posts.reduce((total, post) => total + post.comments.length, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="bg-orange-100 rounded-lg p-3">
                  <Bell className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-orange-900">Notifications</h3>
                  <p className="mt-1 text-2xl font-semibold text-orange-700">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User's Posts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Your Posts</h2>
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
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-600">You haven't created any posts yet.</p>
              <button
                onClick={() => navigate('/create-post')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Create your first post
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Dashboard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    full_name: PropTypes.string.isRequired,
  }),
};