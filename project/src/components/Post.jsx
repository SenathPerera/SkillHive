import React, { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { LikeButton } from './LikeButton';
import { CommentSection } from './CommentSection';
import { apiService } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Edit2, Trash2, Loader2, X, Check } from 'lucide-react';
import PropTypes from 'prop-types';

// A small set of stop-words to filter out common words
const STOP_WORDS = new Set([
  'the','and','for','that','with','have','this','from','your',
  'but','not','are','was','you','all','any','can','out','use',
  'our','get','has','will','just'
]);

// Compute the top N keywords from a block of text
function getTopKeywords(text, limit = 3) {
  const freq = {};
  text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')        // keep letters + spaces
    .split(/\s+/)
    .forEach(w => {
      if (w.length > 2 && !STOP_WORDS.has(w)) {
        freq[w] = (freq[w] || 0) + 1;
      }
    });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])     // by count desc
    .slice(0, limit)
    .map(([word]) => word);
}

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

  // ⭐ compute top 3 keywords once, whenever post.content changes
  const topKeywords = useMemo(
    () => getTopKeywords(post.content, 3),
    [post.content]
  );

  // --- COMMENT HANDLERS ---
  const handleAddComment = async content => {
    try {
      const newComment = await apiService.createComment(post.id, { content });
      setComments(prev => [...prev, newComment]);
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };
  const handleEditComment = async (commentId, newContent) => {
    try {
      await apiService.updateComment(post.id, commentId, { content: newContent });
      setComments(prev =>
        prev.map(c => c.id === commentId ? { ...c, content: newContent } : c)
      );
    } catch (err) {
      console.error('Failed to edit comment:', err);
    }
  };
  const handleDeleteComment = async commentId => {
    try {
      await apiService.deleteComment(post.id, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  // --- LIKE HANDLER ---
  const handleToggleLike = async () => {
    if (!user || isLikeLoading) return;
    try {
      setIsLikeLoading(true);
      if (isLiked) {
        await apiService.unlikePost(post.id);
        setLikesCount(l => l - 1);
      } else {
        await apiService.likePost(post.id);
        setLikesCount(l => l + 1);
      }
      setIsLiked(v => !v);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setIsLikeLoading(false);
    }
  };

  // --- EDIT HANDLER ---
  const handleEdit = async () => {
    if (!editedTitle.trim() || !editedContent.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      setError(null);
      const updated = {
        ...post,
        title: editedTitle.trim(),
        content: editedContent.trim()
      };
      await apiService.updatePost(post.id, updated);
      post.title = editedTitle.trim();
      post.content = editedContent.trim();
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update post');
      console.error('Error updating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancelEdit = () => {
    setEditedTitle(post.title);
    setEditedContent(post.content);
    setIsEditing(false);
    setError(null);
  };

  // --- DELETE HANDLER ---
  const handleDelete = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await apiService.deletePost(post.id);
      onDelete?.(post.id);
    } catch (err) {
      setError(err.message || 'Failed to delete post');
      console.error('Error deleting post:', err);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  // --- MEDIA RENDERING ---
  const renderMedia = () => {
    if (!Array.isArray(post.media) || post.media.length === 0) return null;
    return (
      <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-3">
        {post.media.map((item, idx) => {
          if (!item) return null;
          const url = `/api/media/${item.id}`;
          const type = item.type || (item.contentType||'').split('/')[0];
          return (
            <div key={item.id||idx} className="relative aspect-w-16 aspect-h-9">
              {type==='image' ? (
                <img src={url} alt={item.description} className="rounded-lg w-full h-full object-cover" loading="lazy"/>
              ) : type==='video' ? (
                <video src={url} controls className="rounded-lg w-full h-full object-cover" preload="metadata"/>
              ) : null}
              {item.description && <p className="mt-2 text-sm text-gray-500">{item.description}</p>}
            </div>
          );
        })}
      </div>
    );
  };

  const getUserInitial = () => (postUserId||'?').charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-6">
        {/* header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg font-medium text-blue-600">{getUserInitial()}</span>
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={e => setEditedTitle(e.target.value)}
                  className="text-lg font-medium text-gray-900 w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              ) : (
                <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
              )}
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.created_at||post.createdAt), { addSuffix: true })}
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
              <>
                <button onClick={()=>setIsEditing(true)} className="p-1 text-gray-400 hover:text-gray-600">
                  <Edit2 className="h-5 w-5"/>
                </button>
                <button onClick={()=>setShowDeleteModal(true)} className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-5 w-5"/>
                </button>
              </>
            )}
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedContent}
              onChange={e => setEditedContent(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              disabled={isSubmitting}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={handleCancelEdit} disabled={isSubmitting} className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">
                <X className="h-4 w-4"/>
              </button>
              <button onClick={handleEdit} disabled={isSubmitting||!editedTitle||!editedContent} className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">{post.content}</p>
            {/* ⭐ show top keywords */}
            {topKeywords.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {topKeywords.map(kw => (
                  <span key={kw} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </>
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

      {/* delete confirm */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Post</h3>
            <p className="text-gray-600 mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={()=>setShowDeleteModal(false)} disabled={isSubmitting} className="px-4 py-2 text-gray-700 hover:text-gray-900">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Trash2 className="h-4 w-4 mr-2"/>}
                Delete
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
      description: PropTypes.string
    }))
  }).isRequired,
  comments: PropTypes.array,
  likes: PropTypes.array,
  userLike: PropTypes.object,
  onDelete: PropTypes.func
};
