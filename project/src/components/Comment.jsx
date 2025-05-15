import React, { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';

export function Comment({ comment, postUserId, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const userId = comment.user_id || comment.userId;
  const canModify = user?.id === userId || user?.id === postUserId;

  const handleEdit = async () => {
    if (!editedContent.trim() || editedContent.trim() === comment.content || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onEdit(comment.id, editedContent.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?') || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onDelete(comment.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  const getUserInitial = () => {
    return userId ? userId.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
            {getUserInitial()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">User {userId}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at || comment.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        {canModify && !isEditing && (
          <div className="flex items-center space-x-2">
            {user?.id === userId && (
              <button
                onClick={() => setIsEditing(true)}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-40 transition"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-red-600 disabled:opacity-40 transition"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={3}
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none p-2 text-sm resize-none disabled:opacity-50"
          />
          <div className="mt-2 flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleEdit}
              disabled={
                isSubmitting || !editedContent.trim() || editedContent.trim() === comment.content
              }
              className="text-blue-600 hover:text-blue-800 transition disabled:opacity-50"
              title="Save"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {comment.content}
        </p>
      )}
    </div>
  );
}

Comment.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    user_id: PropTypes.string,
    userId: PropTypes.string,
    content: PropTypes.string.isRequired,
    created_at: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  postUserId: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};
