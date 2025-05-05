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
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {getUserInitial()}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">User {userId}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at || comment.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {canModify && !isEditing && (
          <div className="flex space-x-2">
            {user?.id === userId && (
              <button
                onClick={() => setIsEditing(true)}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <div className="mt-3">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            disabled={isSubmitting}
          />
          <div className="mt-2 flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleEdit}
              disabled={isSubmitting || !editedContent.trim() || editedContent.trim() === comment.content}
              className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-600">{comment.content}</p>
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