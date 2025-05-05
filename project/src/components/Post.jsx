import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { LikeButton } from './LikeButton';
import { CommentSection } from './CommentSection';
import { apiService } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Edit2, Trash2, Loader2, X, Check } from 'lucide-react';
import PropTypes from 'prop-types';

export function Post({ 
  post, 
  comments: initialComments = [], 
  likes = [], 
  userLike = null, 
  onDelete = null 
}) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState(initialComments);
  const [likesCount, setLikesCount] = useState(likes.length);
  const [isLiked, setIsLiked] = useState(Boolean(userLike));
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(null);

  const postUserId = post.user_id || post.userId;
  const canModify = user?.id === postUserId;

  const handleAddComment = async (content) => {
    try {
      const newComment = await apiService.createComment(post.id, { content });
      setComments([...comments, newComment]);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      await apiService.updateComment(post.id, commentId, { content: newContent });
      setComments(comments.map(comment =>
        comment.id === commentId
          ? { ...comment, content: newContent }
          : comment
      ));
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await apiService.deleteComment(post.id, commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleToggleLike = async () => {
    if (!user || isLikeLoading) return;

    try {
      setIsLikeLoading(true);
      if (isLiked) {
        await apiService.unlikePost(post.id);
        setLikesCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        await apiService.likePost(post.id);
        setLikesCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editedTitle.trim() || !editedContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const updatedPost = {
        ...post,
        title: editedTitle.trim(),
        content: editedContent.trim(),
      };

      await apiService.updatePost(post.id, updatedPost);
      post.title = editedTitle.trim();
      post.content = editedContent.trim();
      setIsEditing(false);
    } catch (error) {
      setError(error.message || 'Failed to update post');
      console.error('Error updating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await apiService.deletePost(post.id);
      if (onDelete) {
        onDelete(post.id);
      }
    } catch (error) {
      setError(error.message || 'Failed to delete post');
      console.error('Error deleting post:', error);
      setShowDeleteModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(post.title);
    setEditedContent(post.content);
    setIsEditing(false);
    setError(null);
  };

  const renderMedia = () => {
    if (!post.media || !Array.isArray(post.media) || post.media.length === 0) {
      return null;
    }

    return (
      <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-3">
        {post.media.map((item, index) => {
          if (!item) return null;

          const mediaUrl = `/api/media/${item.id}`;
          const mediaType = item.type || (item.contentType || '').split('/')[0];
          
          return (
            <div key={item.id || index} className="relative aspect-w-16 aspect-h-9">
              {mediaType === 'image' ? (
                <img
                  src={mediaUrl}
                  alt={item.description || `Media ${index + 1}`}
                  className="rounded-lg w-full h-full object-cover"
                  loading="lazy"
                />
              ) : mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  controls
                  className="rounded-lg w-full h-full object-cover"
                  preload="metadata"
                />
              ) : null}
              {item.description && (
                <p className="mt-2 text-sm text-gray-500">{item.description}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getUserInitial = () => {
    return postUserId ? postUserId.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg font-medium text-blue-600">
                {getUserInitial()}
              </span>
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-lg font-medium text-gray-900 w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              ) : (
                <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
              )}
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.created_at || post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <LikeButton
              postId={post.id}
              likes={likesCount}
              isLiked={isLiked}
              isLoading={isLikeLoading}
              onToggleLike={handleToggleLike}
            />
            
            {canModify && !isEditing && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Edit post"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Delete post"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full px-3 py-2 text-gray-600 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              disabled={isSubmitting}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={handleEdit}
                disabled={isSubmitting || !editedTitle.trim() || !editedContent.trim()}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 mb-4">{post.content}</p>
        )}

        {renderMedia()}

        <CommentSection
          postId={post.id}
          postUserId={postUserId}
          comments={comments}
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Post
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Post.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    user_id: PropTypes.string,
    userId: PropTypes.string,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    created_at: PropTypes.string,
    createdAt: PropTypes.string,
    media: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string,
      contentType: PropTypes.string,
      description: PropTypes.string,
    })),
  }).isRequired,
  comments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    user_id: PropTypes.string,
    userId: PropTypes.string,
    content: PropTypes.string.isRequired,
    created_at: PropTypes.string,
    createdAt: PropTypes.string,
  })),
  likes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    user_id: PropTypes.string,
    userId: PropTypes.string,
    created_at: PropTypes.string,
    createdAt: PropTypes.string,
  })),
  userLike: PropTypes.shape({
    id: PropTypes.string.isRequired,
    user_id: PropTypes.string,
    userId: PropTypes.string,
    created_at: PropTypes.string,
    createdAt: PropTypes.string,
  }),
  onDelete: PropTypes.func,
};