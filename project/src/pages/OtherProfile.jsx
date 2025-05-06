import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Upload, Loader2, Edit2, Save, X, Trash2, UserPlus, UserMinus, BookOpen } from 'lucide-react';
import { apiService } from '../lib/api';
import { Post } from '../components/Post';

export function OtherProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [learningPlans, setLearningPlans] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile data
        const profileData = isOwnProfile 
          ? await apiService.getPrivateProfile(userId)
          : await apiService.getPublicProfile(userId);

        setProfile(profileData);

        // Check if following
        if (!isOwnProfile && user) {
          const currentUserProfile = await apiService.getPrivateProfile(user.id);
          setIsFollowing(currentUserProfile.followingIds.includes(userId));
        }

        // Fetch posts
        const allPosts = await apiService.getPosts();
        const userPosts = allPosts.filter(post => 
          (post.userId === userId || post.user_id === userId)
        );

        // Fetch engagement data for posts
        const postsWithEngagement = await Promise.all(
          userPosts.map(async (post) => {
            const [comments, likes] = await Promise.all([
              apiService.getComments(post.id),
              apiService.getLikes(post.id)
            ]);
            
            return {
              post,
              comments: Array.isArray(comments) ? comments : [],
              likes: Array.isArray(likes) ? likes : [],
              userLike: user && Array.isArray(likes) 
                ? likes.find(like => like.userId === user.id || like.user_id === user.id)
                : undefined
            };
          })
        );

        setPosts(postsWithEngagement);

        // Fetch learning plans
        const plans = await apiService.getLearningPlans({ userId });
        setLearningPlans(plans);

      } catch (error) {
        setError(error.message || 'Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId, user, isOwnProfile]);

  const handleFollow = async () => {
    if (followLoading) return;

    try {
      setFollowLoading(true);
      
      if (isFollowing) {
        await apiService.unfollowUser(userId);
      } else {
        await apiService.followUser(userId);
      }
      
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">Profile not found.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-500">
            <div className="absolute -bottom-16 left-8">
              <div className="relative w-32 h-32">
                {profile.avatarUrl ? (
                  <img
                    src={`/api/media/${profile.avatarUrl}`}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-32 h-32 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl text-gray-600">
                      {profile.firstName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!isOwnProfile && user && (
              <div className="absolute top-4 right-4">
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                    isFollowing
                      ? 'bg-white text-gray-700 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {followLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
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
            )}
          </div>
          
          <div className="pt-20 pb-8 px-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h1>
            {profile.bio && (
              <p className="mt-2 text-gray-600">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Learning Plans */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Plans</h2>
          {learningPlans.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {learningPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {plan.thumbnail ? (
                    <img
                      src={`/api/media/${plan.thumbnail}`}
                      alt={plan.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {plan.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {plan.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {plan.skill}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {plan.skillLevel}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/learning-plans/${plan.id}`)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No learning plans yet.</p>
            </div>
          )}
        </div>

        {/* Posts */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Posts</h2>
          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((postData) => (
                <Post
                  key={postData.post.id}
                  {...postData}
                  onDelete={isOwnProfile ? (postId) => setPosts(posts.filter(p => p.post.id !== postId)) : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-600">No posts yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}