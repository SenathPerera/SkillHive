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
    <section className="mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-start gap-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
              rows={3}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="Submit comment"
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
          <p className="text-gray-500 text-center py-6 text-sm">
            No comments yet.{' '}
            {user ? 'Be the first to comment!' : 'Sign in to add a comment!'}
          </p>
        )}
      </div>

      {!user && comments.length > 0 && (
        <p className="text-sm text-gray-500 text-center mt-6">
          Sign in to join the conversation.
        </p>
      )}
    </section>
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
