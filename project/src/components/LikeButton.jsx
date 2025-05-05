import React from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import PropTypes from 'prop-types';

export function LikeButton({ postId, likes, isLiked, isLoading, onToggleLike }) {
  const { user } = useAuthStore();

  return (
    <button
      onClick={onToggleLike}
      disabled={!user || isLoading}
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors ${
        isLiked
          ? 'text-primary-600 hover:text-primary-700'
          : 'text-gray-600 hover:text-gray-700'
      } ${(!user || isLoading) && 'opacity-50 cursor-not-allowed'}`}
      title={!user ? 'Sign in to like posts' : undefined}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart
          className={`h-5 w-5 ${isLiked ? 'fill-current' : ''} transition-colors`}
        />
      )}
      <span className="text-sm font-medium">{likes}</span>
    </button>
  );
}

LikeButton.propTypes = {
  postId: PropTypes.string.isRequired,
  likes: PropTypes.number.isRequired,
  isLiked: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onToggleLike: PropTypes.func.isRequired,
};