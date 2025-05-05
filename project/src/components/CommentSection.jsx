import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Comment } from './Comment';
import { useAuthStore } from '../store/authStore';
import PropTypes from 'prop-types';

export function CommentSection({
  postId,
  postUserId,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
}) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>
      
      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-grow">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              postUserId={postUserId}
              onDelete={onDeleteComment}
              onEdit={onEditComment}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            No comments yet. {user ? 'Be the first to comment!' : 'Sign in to add a comment!'}
          </p>
        )}
      </div>

      {!user && comments.length > 0 && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Sign in to join the conversation!
        </p>
      )}
    </div>
  );
}

CommentSection.propTypes = {
  postId: PropTypes.string.isRequired,
  postUserId: PropTypes.string.isRequired,
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      user_id: PropTypes.string,
      userId: PropTypes.string,
      content: PropTypes.string.isRequired,
      created_at: PropTypes.string,
      createdAt: PropTypes.string,
    })
  ).isRequired,
  onAddComment: PropTypes.func.isRequired,
  onEditComment: PropTypes.func.isRequired,
  onDeleteComment: PropTypes.func.isRequired,
};