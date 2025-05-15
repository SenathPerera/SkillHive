import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Code, Bell, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';                      // ← use date-fns
import { useAuthStore } from '../store/authStore';
import { Post } from '../components/Post';
import { apiService } from '../lib/api';
import PropTypes from 'prop-types';

export function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [streak, setStreak] = useState(0);
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
          throw new Error('Invalid response format');
        }

        // filter & sort this user's posts newest first
        const userPosts = postsData
          .filter(p => p.userId === user.id || p.user_id === user.id)
          .sort((a, b) =>
            new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
          );

        // fetch engagement
        const wrapped = await Promise.all(
          userPosts.map(async post => {
            try {
              const [comments, likes] = await Promise.all([
                apiService.getComments(post.id),
                apiService.getLikes(post.id),
              ]);
              return {
                post,
                comments: Array.isArray(comments) ? comments : [],
                likes:    Array.isArray(likes)    ? likes    : [],
                userLike: Array.isArray(likes)
                  ? likes.find(l => l.userId === user.id || l.user_id === user.id)
                  : undefined,
              };
            } catch {
              return { post, comments: [], likes: [], userLike: undefined };
            }
          })
        );

        setPosts(wrapped);

        // build set of post-days
        const daySet = new Set(
          wrapped.map(({ post }) =>
            format(
              parseISO(post.createdAt || post.created_at),
              'yyyy-MM-dd'
            )
          )
        );

        // count backward streak
        let count = 0;
        let cursor = new Date();
        while (daySet.has(format(cursor, 'yyyy-MM-dd'))) {
          count++;
          cursor = subDays(cursor, 1);
        }
        setStreak(count);

      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleDeletePost = postId => {
    setPosts(prev => prev.filter(w => w.post.id !== postId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome + Create */}
        <div className="bg-white rounded-lg shadow p-8 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user.firstName.split(' ')[0]}! 👋
            </h1>
            <p className="mt-2 text-gray-600">
              Track your progress and share your learning journey.
            </p>
          </div>
          <button
            onClick={() => navigate('/create-post')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="mr-2" /> Create Post
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard icon={<BookOpen />}  label="Posts"         value={posts.length}                                color="blue"   />
          <StatCard icon={<Award />}     label="Total Likes"   value={posts.reduce((s, w) => s + w.likes.length, 0)} color="green"  />
          <StatCard icon={<Code />}      label="Comments"      value={posts.reduce((s, w) => s + w.comments.length, 0)} color="purple" />
          <StatCard icon={<Bell />}      label="Notifications" value={0}                                        color="orange" />
          <StatCard icon={<Award />}     label="Streak (days)" value={streak}                                    color="green"  />
        </div>

        {/* Posts */}
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(({ post, comments, likes, userLike }) => (
              <Post
                key={post.id}
                post={post}
                comments={comments}
                likes={likes}
                userLike={userLike}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">You haven't created any posts yet.</p>
            <button
              onClick={() => navigate('/create-post')}
              className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Create your first post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`bg-${color}-50 p-6 rounded-lg`}>
      <div className="flex items-center">
        <div className={`bg-${color}-100 p-3 rounded-lg`}>
          {React.cloneElement(icon, { className: `h-6 w-6 text-${color}-600` })}
        </div>
        <div className="ml-4">
          <h3 className={`text-sm font-medium text-${color}-900`}>{label}</h3>
          <p className={`mt-1 text-2xl font-semibold text-${color}-700`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  icon:  PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  color: PropTypes.oneOf(['blue','green','purple','orange']).isRequired
};

Dashboard.propTypes = {
  user: PropTypes.shape({
    id:        PropTypes.string.isRequired,
    email:     PropTypes.string.isRequired,
    full_name: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired
  }).isRequired
};
